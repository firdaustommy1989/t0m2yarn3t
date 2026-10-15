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

/**
 * Initialize Firestore data if this is a fresh database instance.
 * Ensures all connected devices immediately share the official default data.
 */
export async function initializeFirestoreIfNeeded(): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      // Seed default settings
      await setDoc(settingsRef, DEFAULT_SETTINGS);
    }

    const candidatesRef = collection(db, 'candidates');
    const candidatesSnap = await getDocs(candidatesRef);
    if (candidatesSnap.empty) {
      const batch = writeBatch(db);
      DEFAULT_CANDIDATES.forEach((candidate) => {
        batch.set(doc(db, 'candidates', candidate.id), candidate);
      });
      await batch.commit();
    }

    const votersRef = collection(db, 'voters');
    const votersSnap = await getDocs(votersRef);
    if (votersSnap.empty) {
      // Seed initial voters in batches
      const batch = writeBatch(db);
      DEFAULT_VOTERS.forEach((voter) => {
        batch.set(doc(db, 'voters', voter.id), voter);
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

  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ElectionSettings;
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
}

/**
 * Real-time subscription to Candidate list.
 * Automatically notifies callback when candidates are modified on another device.
 */
export function subscribeCandidates(
  callback: (candidates: Candidate[]) => void
): Unsubscribe {
  const candidatesRef = collection(db, 'candidates');

  return onSnapshot(
    candidatesRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Candidate[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Candidate);
        });
        list.sort((a, b) => a.candidateNumber - b.candidateNumber);
        saveLocalCandidates(list);
        callback(list);
      } else {
        const fallback = getLocalCandidates();
        callback(fallback);
      }
    },
    (error) => {
      console.warn('Candidates subscription fallback to local cache:', error.message);
      callback(getLocalCandidates());
    }
  );
}

/**
 * Real-time subscription to Voters (DPT).
 * Updates automatically when voters are uploaded, edited, or marked hasVoted.
 */
export function subscribeVoters(
  callback: (voters: Voter[]) => void
): Unsubscribe {
  const votersRef = collection(db, 'voters');

  return onSnapshot(
    votersRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Voter[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Voter);
        });
        // Sort by gradeClass then name
        list.sort((a, b) => {
          const classComp = a.gradeClass.localeCompare(b.gradeClass);
          if (classComp !== 0) return classComp;
          return a.name.localeCompare(b.name);
        });
        saveLocalVoters(list);
        callback(list);
      } else {
        const fallback = getLocalVoters();
        callback(fallback);
      }
    },
    (error) => {
      console.warn('Voters subscription fallback to local cache:', error.message);
      callback(getLocalVoters());
    }
  );
}

/**
 * Real-time subscription to Ballots / Vote Records.
 * Updates Quick Count live across all connected devices within milliseconds.
 */
export function subscribeVoteRecords(
  callback: (records: VoteRecord[]) => void
): Unsubscribe {
  const votesRef = collection(db, 'votes');

  return onSnapshot(
    votesRef,
    (snapshot) => {
      const list: VoteRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as VoteRecord);
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
}

/**
 * Save settings to both Cloud Firestore and local storage.
 */
export async function saveSettingsSync(settings: ElectionSettings): Promise<void> {
  saveLocalSettings(settings);
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `settings/${SETTINGS_DOC_ID}`);
  }
}

/**
 * Save candidates to both Cloud Firestore and local storage.
 */
export async function saveCandidatesSync(candidates: Candidate[]): Promise<void> {
  saveLocalCandidates(candidates);
  try {
    // Read existing candidate doc IDs to clean up removed candidates
    const snapshot = await getDocs(collection(db, 'candidates'));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));
    const newIds = new Set(candidates.map((c) => c.id));

    const batch = writeBatch(db);

    // Set new/updated candidates
    candidates.forEach((candidate) => {
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
    handleFirestoreError(error, OperationType.WRITE, 'candidates');
  }
}

/**
 * Save voters (DPT) to both Cloud Firestore and local storage.
 * Handles Firestore batch limit of 500 operations per batch.
 */
export async function saveVotersSync(voters: Voter[]): Promise<void> {
  saveLocalVoters(voters);
  try {
    const snapshot = await getDocs(collection(db, 'voters'));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));
    const newIds = new Set(voters.map((v) => v.id));

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
    for (let i = 0; i < voters.length; i += 400) {
      const batch = writeBatch(db);
      voters.slice(i, i + 400).forEach((voter) => {
        batch.set(doc(db, 'voters', voter.id), voter);
      });
      await batch.commit();
    }
  } catch (error) {
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

    const updatedVoter: Voter = {
      ...voterData,
      hasVoted: true,
      votedAt,
      receiptCode,
    };

    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: VoteRecord = {
      id: voteId,
      candidateId,
      timestamp: votedAt,
      voterGradeClass: voterData.gradeClass,
      receiptCode,
    };

    const batch = writeBatch(db);
    batch.update(voterRef, {
      hasVoted: true,
      votedAt,
      receiptCode,
    });
    batch.set(doc(db, 'votes', voteId), newRecord);
    await batch.commit();

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat secara sah di server pemilihan!',
      receiptCode,
      votedAt,
    };
  } catch (error) {
    console.error('Error casting vote to cloud:', error);
    // Fallback to local castVote if cloud is temporarily unreachable
    const { castVote } = await import('../utils/storage');
    return castVote(voterId, candidateId);
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
