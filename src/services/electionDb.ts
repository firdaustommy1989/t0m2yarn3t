import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { Candidate, ElectionSettings, Voter, VoteRecord } from '../types/election';
import {
  DEFAULT_CANDIDATES,
  DEFAULT_SETTINGS,
  DEFAULT_VOTERS,
  DEFAULT_VOTE_RECORDS,
} from '../data/defaultData';
import {
  getSettings as getLocalSettings,
  saveSettings as saveLocalSettings,
  getCandidates as getLocalCandidates,
  saveCandidates as saveLocalCandidates,
  getVoters as getLocalVoters,
  saveVoters as saveLocalVoters,
  getVoteRecords as getLocalVoteRecords,
  saveVoteRecords as saveLocalVoteRecords,
  generateReceiptCode,
  CastVoteResult,
} from '../utils/storage';

const SETTINGS_DOC_ID = 'main';

// BroadcastChannel for instant zero-latency multi-tab updates on the same device
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('evoting_cross_device_sync');
  }
} catch {
  // BroadcastChannel unavailable
}

function broadcastLocalChange(type: 'settings' | 'candidates' | 'voters' | 'votes') {
  try {
    broadcastChannel?.postMessage({ type, timestamp: Date.now() });
  } catch {}
}

/**
 * Sanitizers to guarantee no 'undefined' fields ever cause Firestore WriteBatch to reject operations
 */
export function sanitizeSettings(settings: ElectionSettings): ElectionSettings {
  return {
    schoolName: settings.schoolName || DEFAULT_SETTINGS.schoolName,
    schoolAddress: settings.schoolAddress || DEFAULT_SETTINGS.schoolAddress,
    electionTitle: settings.electionTitle || DEFAULT_SETTINGS.electionTitle,
    periodYear: settings.periodYear || DEFAULT_SETTINGS.periodYear,
    status: settings.status || 'active',
    startDate: settings.startDate || DEFAULT_SETTINGS.startDate,
    endDate: settings.endDate || DEFAULT_SETTINGS.endDate,
    showLiveResultsToPublic: Boolean(settings.showLiveResultsToPublic),
    adminPasscode: settings.adminPasscode || 'admin123',
    principalName: settings.principalName || DEFAULT_SETTINGS.principalName,
    chiefCommitteeName: settings.chiefCommitteeName || DEFAULT_SETTINGS.chiefCommitteeName,
    advisorName: settings.advisorName || DEFAULT_SETTINGS.advisorName,
  };
}

export function sanitizeCandidate(candidate: Candidate): Candidate {
  return {
    id: candidate.id,
    candidateNumber: Number(candidate.candidateNumber) || 1,
    chairmanName: candidate.chairmanName || '',
    chairmanClass: candidate.chairmanClass || '',
    viceChairmanName: candidate.viceChairmanName || '',
    viceChairmanClass: candidate.viceChairmanClass || '',
    tagline: candidate.tagline || '',
    photoUrl: candidate.photoUrl || '',
    vision: candidate.vision || '',
    missions: Array.isArray(candidate.missions) ? candidate.missions.filter(Boolean) : [],
    workPrograms: Array.isArray(candidate.workPrograms) ? candidate.workPrograms.filter(Boolean) : [],
    accentColor: candidate.accentColor || '#2563eb',
  };
}

export function sanitizeVoter(voter: Voter): Voter {
  return {
    id: voter.id,
    nisn: voter.nisn || '',
    name: voter.name || '',
    gradeClass: voter.gradeClass || 'Umum',
    token: voter.token || '',
    hasVoted: Boolean(voter.hasVoted),
    votedAt: voter.votedAt || '',
    receiptCode: voter.receiptCode || '',
  };
}

export function sanitizeVoteRecord(record: VoteRecord): VoteRecord {
  return {
    id: record.id,
    candidateId: record.candidateId,
    timestamp: record.timestamp,
    voterGradeClass: record.voterGradeClass || 'Umum',
    receiptCode: record.receiptCode || '',
  };
}

/**
 * Initialize Firestore data if this is a fresh database instance.
 * Ensures all connected devices immediately share the official default data.
 */
export async function initializeFirestoreIfNeeded(): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      const currentSettings = getLocalSettings();
      await setDoc(settingsRef, sanitizeSettings(currentSettings || DEFAULT_SETTINGS));
    }

    const candidatesRef = collection(db, 'candidates');
    const candidatesSnap = await getDocs(candidatesRef);
    if (candidatesSnap.empty) {
      const currentCandidates = getLocalCandidates();
      const listToSeed = currentCandidates.length > 0 ? currentCandidates : DEFAULT_CANDIDATES;
      const batch = writeBatch(db);
      listToSeed.forEach((candidate) => {
        batch.set(doc(db, 'candidates', candidate.id), sanitizeCandidate(candidate));
      });
      await batch.commit();
    }

    const votersRef = collection(db, 'voters');
    const votersSnap = await getDocs(votersRef);
    if (votersSnap.empty) {
      const currentVoters = getLocalVoters();
      const listToSeed = currentVoters.length > 0 ? currentVoters : DEFAULT_VOTERS;
      const batch = writeBatch(db);
      listToSeed.forEach((voter) => {
        batch.set(doc(db, 'voters', voter.id), sanitizeVoter(voter));
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial Firestore seeding check completed with notice:', err);
  }
}

/**
 * Real-time subscription to Election Settings.
 * Automatically notifies callback when another device updates settings.
 */
export function subscribeSettings(
  callback: (settings: ElectionSettings) => void
): Unsubscribe {
  const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

  const unsubFirestore = onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = sanitizeSettings(snapshot.data() as ElectionSettings);
        saveLocalSettings(data);
        callback(data);
      } else {
        const fallback = getLocalSettings();
        callback(fallback);
      }
    },
    (error) => {
      console.warn('Settings subscription fallback to local cache:', error.message);
      callback(getLocalSettings());
    }
  );

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'settings') {
      callback(getLocalSettings());
    }
  };
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    unsubFirestore();
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Real-time subscription to Candidate list.
 * Automatically notifies callback when candidates are modified on another device.
 */
export function subscribeCandidates(
  callback: (candidates: Candidate[]) => void
): Unsubscribe {
  const candidatesRef = collection(db, 'candidates');

  const unsubFirestore = onSnapshot(
    candidatesRef,
    (snapshot) => {
      const list: Candidate[] = [];
      snapshot.forEach((docSnap) => {
        list.push(sanitizeCandidate(docSnap.data() as Candidate));
      });
      list.sort((a, b) => a.candidateNumber - b.candidateNumber);

      if (list.length > 0) {
        saveLocalCandidates(list);
        callback(list);
      } else if (snapshot.metadata.fromCache && getLocalCandidates().length > 0) {
        callback(getLocalCandidates());
      } else {
        saveLocalCandidates([]);
        callback([]);
      }
    },
    (error) => {
      console.warn('Candidates subscription fallback to local cache:', error.message);
      callback(getLocalCandidates());
    }
  );

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'candidates') {
      callback(getLocalCandidates());
    }
  };
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    unsubFirestore();
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Real-time subscription to Voters (DPT).
 * Updates automatically when voters are uploaded, edited, or marked hasVoted.
 */
export function subscribeVoters(
  callback: (voters: Voter[]) => void
): Unsubscribe {
  const votersRef = collection(db, 'voters');

  const unsubFirestore = onSnapshot(
    votersRef,
    (snapshot) => {
      const list: Voter[] = [];
      snapshot.forEach((docSnap) => {
        list.push(sanitizeVoter(docSnap.data() as Voter));
      });
      list.sort((a, b) => {
        const classComp = a.gradeClass.localeCompare(b.gradeClass);
        if (classComp !== 0) return classComp;
        return a.name.localeCompare(b.name);
      });

      if (list.length > 0) {
        saveLocalVoters(list);
        callback(list);
      } else if (snapshot.metadata.fromCache && getLocalVoters().length > 0) {
        callback(getLocalVoters());
      } else {
        saveLocalVoters([]);
        callback([]);
      }
    },
    (error) => {
      console.warn('Voters subscription fallback to local cache:', error.message);
      callback(getLocalVoters());
    }
  );

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'voters') {
      callback(getLocalVoters());
    }
  };
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    unsubFirestore();
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Real-time subscription to Ballots / Vote Records.
 * Updates Quick Count live across all connected devices within milliseconds.
 */
export function subscribeVoteRecords(
  callback: (records: VoteRecord[]) => void
): Unsubscribe {
  const votesRef = collection(db, 'votes');

  const unsubFirestore = onSnapshot(
    votesRef,
    (snapshot) => {
      const list: VoteRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(sanitizeVoteRecord(docSnap.data() as VoteRecord));
      });
      // Sort newest first
      list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      saveLocalVoteRecords(list);
      callback(list);
    },
    (error) => {
      console.warn('VoteRecords subscription fallback to local cache:', error.message);
      callback(getLocalVoteRecords());
    }
  );

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'votes') {
      callback(getLocalVoteRecords());
    }
  };
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    unsubFirestore();
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Save settings to both Cloud Firestore and local storage.
 * Propagates instantly to all other browsers and devices.
 */
export async function saveSettingsSync(settings: ElectionSettings): Promise<void> {
  const clean = sanitizeSettings(settings);
  saveLocalSettings(clean);
  broadcastLocalChange('settings');
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, clean);
  } catch (error) {
    console.error('Error saving settings to cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, `settings/${SETTINGS_DOC_ID}`);
  }
}

/**
 * Save candidates to both Cloud Firestore and local storage.
 * Propagates instantly to all other browsers and devices.
 */
export async function saveCandidatesSync(candidates: Candidate[]): Promise<void> {
  const cleanCandidates = candidates.map(sanitizeCandidate);
  saveLocalCandidates(cleanCandidates);
  broadcastLocalChange('candidates');
  try {
    // Read existing candidate doc IDs to clean up removed candidates
    const snapshot = await getDocs(collection(db, 'candidates'));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));
    const newIds = new Set(cleanCandidates.map((c) => c.id));

    const batch = writeBatch(db);

    // Set new/updated candidates
    cleanCandidates.forEach((candidate) => {
      batch.set(doc(db, 'candidates', candidate.id), candidate);
    });

    // Delete removed candidates
    existingIds.forEach((oldId) => {
      if (!newIds.has(oldId)) {
        batch.delete(doc(db, 'candidates', oldId));
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error saving candidates to cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, 'candidates');
  }
}

/**
 * Save voters (DPT) to both Cloud Firestore and local storage.
 * Handles Firestore batch limit of 500 operations per batch.
 */
export async function saveVotersSync(voters: Voter[]): Promise<void> {
  const cleanVoters = voters.map(sanitizeVoter);
  saveLocalVoters(cleanVoters);
  broadcastLocalChange('voters');
  try {
    const snapshot = await getDocs(collection(db, 'voters'));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));
    const newIds = new Set(cleanVoters.map((v) => v.id));

    // Delete removed voters in batches of 400
    const toDelete = Array.from(existingIds).filter((id) => !newIds.has(id));
    for (let i = 0; i < toDelete.length; i += 400) {
      const batch = writeBatch(db);
      toDelete.slice(i, i + 400).forEach((id) => {
        batch.delete(doc(db, 'voters', id));
      });
      await batch.commit();
    }

    // Set/Update all voters in batches of 400
    for (let i = 0; i < cleanVoters.length; i += 400) {
      const batch = writeBatch(db);
      cleanVoters.slice(i, i + 400).forEach((voter) => {
        batch.set(doc(db, 'voters', voter.id), voter);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error saving voters to cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, 'voters');
  }
}

/**
 * Cast vote with real-time multi-device cloud synchronization.
 * Updates voter document and inserts vote record atomically.
 */
export async function castVoteSync(
  voterId: string,
  candidateId: string
): Promise<CastVoteResult> {
  try {
    const voterRef = doc(db, 'voters', voterId);
    const voterSnap = await getDoc(voterRef);

    if (!voterSnap.exists()) {
      return { success: false, message: 'Data pemilih tidak ditemukan dalam DPT Cloud.' };
    }

    const voterData = voterSnap.data() as Voter;
    if (voterData.hasVoted) {
      return {
        success: false,
        message: `Hak suara untuk ${voterData.name} sudah digunakan pada ${voterData.votedAt || 'sebelumnya'}.`,
      };
    }

    const receiptCode = generateReceiptCode();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const votedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: VoteRecord = {
      id: voteId,
      candidateId,
      timestamp: votedAt,
      voterGradeClass: voterData.gradeClass || 'Umum',
      receiptCode,
    };

    const batch = writeBatch(db);
    batch.update(voterRef, {
      hasVoted: true,
      votedAt,
      receiptCode,
    });
    batch.set(doc(db, 'votes', voteId), sanitizeVoteRecord(newRecord));
    await batch.commit();

    broadcastLocalChange('votes');
    broadcastLocalChange('voters');

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat secara sah di server pemilihan!',
      receiptCode,
      votedAt,
    };
  } catch (error) {
    console.error('Error casting vote to cloud:', error);
    const { castVote } = await import('../utils/storage');
    const res = castVote(voterId, candidateId);
    broadcastLocalChange('votes');
    broadcastLocalChange('voters');
    return res;
  }
}

/**
 * Reset only voting records & voter status across all devices.
 */
export async function resetVotingOnlySync(): Promise<void> {
  try {
    // Delete all votes
    const votesSnap = await getDocs(collection(db, 'votes'));
    const voteDocs = votesSnap.docs;
    for (let i = 0; i < voteDocs.length; i += 400) {
      const batch = writeBatch(db);
      voteDocs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Reset voters hasVoted status
    const votersSnap = await getDocs(collection(db, 'voters'));
    const voterDocs = votersSnap.docs;
    for (let i = 0; i < voterDocs.length; i += 400) {
      const batch = writeBatch(db);
      voterDocs.slice(i, i + 400).forEach((d) => {
        batch.update(d.ref, {
          hasVoted: false,
          votedAt: '',
          receiptCode: '',
        });
      });
      await batch.commit();
    }

    // Local reset
    const { resetVotingOnly } = await import('../utils/storage');
    resetVotingOnly();
    broadcastLocalChange('votes');
    broadcastLocalChange('voters');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'votes');
  }
}

/**
 * Reset all data to default across all devices.
 */
export async function resetAllToDefaultSync(): Promise<void> {
  await saveSettingsSync(DEFAULT_SETTINGS);
  await saveCandidatesSync(DEFAULT_CANDIDATES);
  await saveVotersSync(DEFAULT_VOTERS);
  await resetVotingOnlySync();
}

/**
 * Google Sign-In for Admin authentication.
 */
export async function loginAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out admin session.
 */
export async function logoutAdminSession(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to auth state changes.
 */
export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
