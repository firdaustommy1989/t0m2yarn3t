export interface Candidate {
  id: string;
  candidateNumber: number;
  chairmanName: string;
  chairmanClass: string;
  viceChairmanName: string;
  viceChairmanClass: string;
  tagline: string;
  photoUrl: string;
  vision: string;
  missions: string[];
  workPrograms: string[];
  accentColor: string; // e.g. '#2563eb', '#16a34a', '#ea580c'
}

export interface Voter {
  id: string;
  nisn: string;
  name: string;
  gradeClass: string;
  token: string;
  hasVoted: boolean;
  votedAt?: string;
  receiptCode?: string;
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  timestamp: string;
  voterGradeClass: string;
  receiptCode: string;
}

export interface ElectionSettings {
  schoolName: string;
  schoolAddress: string;
  electionTitle: string;
  periodYear: string;
  status: 'draft' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  showLiveResultsToPublic: boolean;
  adminPasscode: string;
  principalName: string;
  chiefCommitteeName: string;
  advisorName: string;
}

export type AppView = 'voter' | 'public_results' | 'admin';
