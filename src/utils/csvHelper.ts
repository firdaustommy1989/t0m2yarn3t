import { Voter } from '../types/election';
import { generateToken } from './storage';

export interface ParseCSVResult {
  voters: Voter[];
  addedCount: number;
  duplicateCount: number;
  errors: string[];
}

export function parseVotersCSV(csvContent: string, existingVoters: Voter[]): ParseCSVResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { voters: [], addedCount: 0, duplicateCount: 0, errors: ['File kosong atau format tidak terbaca.'] };
  }

  const existingNisnMap = new Set(existingVoters.map((v) => v.nisn.toLowerCase().trim()));
  const newVoters: Voter[] = [];
  const errors: string[] = [];
  let duplicateCount = 0;

  // Check if first line is header
  let startIndex = 0;
  const firstLineLower = lines[0].toLowerCase();
  if (
    firstLineLower.includes('nis') ||
    firstLineLower.includes('nama') ||
    firstLineLower.includes('kelas') ||
    firstLineLower.includes('student')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma, semicolon, or tab
    let cols: string[] = [];
    if (line.includes('\t')) {
      cols = line.split('\t');
    } else if (line.includes(';')) {
      cols = line.split(';');
    } else {
      cols = line.split(',');
    }

    cols = cols.map((c) => c.replace(/^["']|["']$/g, '').trim());

    if (cols.length < 2) {
      errors.push(`Baris ${i + 1}: Format tidak lengkap (minimal harus ada NIS/NISN dan Nama).`);
      continue;
    }

    const nisn = cols[0];
    const name = cols[1];
    const gradeClass = cols[2] || 'Umum';
    const customToken = cols[3] || '';

    if (!nisn || !name) {
      errors.push(`Baris ${i + 1}: NISN atau Nama tidak boleh kosong.`);
      continue;
    }

    if (existingNisnMap.has(nisn.toLowerCase()) || newVoters.some((v) => v.nisn.toLowerCase() === nisn.toLowerCase())) {
      duplicateCount++;
      continue;
    }

    const token = customToken.trim() !== '' ? customToken.trim() : generateToken();
    newVoters.push({
      id: `voter_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`,
      nisn,
      name,
      gradeClass,
      token,
      hasVoted: false,
    });
  }

  return {
    voters: newVoters,
    addedCount: newVoters.length,
    duplicateCount,
    errors,
  };
}

export function generateCSVTemplate(): string {
  const header = 'NISN,Nama Siswa,Kelas,Token (Opsional)';
  const sample1 = '20241021,Ahmad Fadhil,X-1,TKN-401';
  const sample2 = '20241022,Bella Citra Lestari,XI MIPA 2,';
  const sample3 = '20241023,Calvin Pratama,XII IPS 1,';
  return [header, sample1, sample2, sample3].join('\n');
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportVotersToCSV(voters: Voter[]): string {
  const header = 'NISN,Nama Siswa,Kelas,Token Akses,Status Memilih,Waktu Memilih,Kode Bukti Suara';
  const rows = voters.map((v) => {
    return [
      `"${v.nisn}"`,
      `"${v.name}"`,
      `"${v.gradeClass}"`,
      `"${v.token}"`,
      `"${v.hasVoted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'}"`,
      `"${v.votedAt || '-'}"`,
      `"${v.receiptCode || '-'}"`,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}
