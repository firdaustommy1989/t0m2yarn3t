import { Candidate, ElectionSettings, Voter, VoteRecord } from '../types/election';
import { DEFAULT_CANDIDATES, DEFAULT_SETTINGS, DEFAULT_VOTERS, DEFAULT_VOTE_RECORDS } from '../data/defaultData';

const SETTINGS_KEY = 'evoting_osis_settings_v1';
const CANDIDATES_KEY = 'evoting_osis_candidates_v1';
const VOTERS_KEY = 'evoting_osis_voters_v1';
const VOTES_KEY = 'evoting_osis_votes_v1';
const VOTES_CLEARED_FLAG = 'evoting_osis_votes_cleared_zero_v1';

// Automatically ensure existing stored mock votes are emptied
if (typeof window !== 'undefined' && !localStorage.getItem(VOTES_CLEARED_FLAG)) {
  localStorage.setItem(VOTES_KEY, JSON.stringify([]));
  try {
    const rawVoters = localStorage.getItem(VOTERS_KEY);
    if (rawVoters) {
      const parsed: Voter[] = JSON.parse(rawVoters);
      const cleaned = parsed.map((v) => ({
        ...v,
        hasVoted: false,
        votedAt: undefined,
        receiptCode: undefined,
      }));
      localStorage.setItem(VOTERS_KEY, JSON.stringify(cleaned));
    }
  } catch {}
  localStorage.setItem(VOTES_CLEARED_FLAG, 'true');
}

export function getSettings(): ElectionSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (parsed.schoolName === 'SMA Negeri 1 Harapan Bangsa') {
      parsed.schoolName = DEFAULT_SETTINGS.schoolName;
      parsed.schoolAddress = DEFAULT_SETTINGS.schoolAddress;
      saveSettings(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ElectionSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY);
    if (!raw) {
      saveCandidates(DEFAULT_CANDIDATES);
      return DEFAULT_CANDIDATES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CANDIDATES;
  }
}

export function saveCandidates(candidates: Candidate[]): void {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
}

export function getVoters(): Voter[] {
  try {
    const raw = localStorage.getItem(VOTERS_KEY);
    if (!raw) {
      saveVoters(DEFAULT_VOTERS);
      return DEFAULT_VOTERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VOTERS;
  }
}

export function saveVoters(voters: Voter[]): void {
  localStorage.setItem(VOTERS_KEY, JSON.stringify(voters));
}

export function getVoteRecords(): VoteRecord[] {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) {
      saveVoteRecords(DEFAULT_VOTE_RECORDS);
      return DEFAULT_VOTE_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VOTE_RECORDS;
  }
}

export function saveVoteRecords(records: VoteRecord[]): void {
  localStorage.setItem(VOTES_KEY, JSON.stringify(records));
}

export function generateToken(prefix = 'TKN'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export function generateReceiptCode(): string {
  const chars = '0123456789ABCDEF';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SAH-${code}`;
}

export interface CastVoteResult {
  success: boolean;
  message: string;
  receiptCode?: string;
  votedAt?: string;
}

export function castVote(voterId: string, candidateId: string): CastVoteResult {
  const voters = getVoters();
  const voterIndex = voters.findIndex((v) => v.id === voterId);

  if (voterIndex === -1) {
    return { success: false, message: 'Data pemilih tidak ditemukan dalam DPT.' };
  }

  const voter = voters[voterIndex];
  if (voter.hasVoted) {
    return {
      success: false,
      message: `Pemilih ini sudah menggunakan hak suara pada ${voter.votedAt || 'sebelumnya'}.`,
    };
  }

  const receiptCode = generateReceiptCode();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const votedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // Update voter status
  voters[voterIndex] = {
    ...voter,
    hasVoted: true,
    votedAt,
    receiptCode,
  };
  saveVoters(voters);

  // Record vote anonymously (preserving gradeClass for class breakdown)
  const votes = getVoteRecords();
  const newRecord: VoteRecord = {
    id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    candidateId,
    timestamp: votedAt,
    voterGradeClass: voter.gradeClass,
    receiptCode,
  };
  votes.push(newRecord);
  saveVoteRecords(votes);

  return {
    success: true,
    message: 'Suara Anda berhasil dicatat secara sah!',
    receiptCode,
    votedAt,
  };
}

export function resetAllToDefault(): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(DEFAULT_CANDIDATES));
  localStorage.setItem(VOTERS_KEY, JSON.stringify(DEFAULT_VOTERS));
  localStorage.setItem(VOTES_KEY, JSON.stringify(DEFAULT_VOTE_RECORDS));
}

export function resetVotingOnly(): void {
  const voters = getVoters().map((v) => ({
    ...v,
    hasVoted: false,
    votedAt: undefined,
    receiptCode: undefined,
  }));
  saveVoters(voters);
  saveVoteRecords([]);
}

export function exportBackupJSON(): string {
  const data = {
    settings: getSettings(),
    candidates: getCandidates(),
    voters: getVoters(),
    voteRecords: getVoteRecords(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings && data.candidates && data.voters && data.voteRecords) {
      saveSettings(data.settings);
      saveCandidates(data.candidates);
      saveVoters(data.voters);
      saveVoteRecords(data.voteRecords);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
