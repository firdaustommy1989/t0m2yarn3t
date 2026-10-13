import { Candidate, ElectionSettings, Voter, VoteRecord } from '../types/election';

export const DEFAULT_SETTINGS: ElectionSettings = {
  schoolName: 'SMA Negeri 1 Harapan Bangsa',
  schoolAddress: 'Jl. Pemuda Pendidikan No. 45, Jakarta',
  electionTitle: 'Pemilihan Ketua & Wakil Ketua OSIS',
  periodYear: '2026/2027',
  status: 'active',
  startDate: '2026-10-13 08:00',
  endDate: '2026-10-13 14:00',
  showLiveResultsToPublic: true,
  adminPasscode: 'admin123',
  principalName: 'Drs. H. Bambang Sudirman, M.Pd.',
  chiefCommitteeName: 'Ahmad Faiz Al-Ghifari (Ketua KPU OSIS)',
  advisorName: 'Dra. Siti Rahmah, M.Pd. (Pembina OSIS)',
};

export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    candidateNumber: 1,
    chairmanName: 'Rafi Raditya Pratama',
    chairmanClass: 'XI MIPA 1',
    viceChairmanName: 'Nadia Az-Zahra',
    viceChairmanClass: 'X-2',
    tagline: 'Sinergi, Kolaboratif, dan Berprestasi Tanpa Batas',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    vision: 'Mewujudkan OSIS SMA Negeri 1 yang aktif, inovatif, dan berintegritas tinggi sebagai wadah aspirasi siswa berprestasi.',
    missions: [
      'Menumbuhkan karakter kepemimpinan yang berakhlak mulia dan berwawasan kebangsaan.',
      'Mengoptimalkan digitalisasi aspirasi siswa melalui platform komunikasi terbuka.',
      'Mengembangkan potensi ekstrakurikuler di bidang akademik, seni, dan olahraga.',
      'Menjalin kolaborasi produktif dengan organisasi intra maupun antar sekolah.'
    ],
    workPrograms: [
      'Pekan Seni & Kreativitas Pelajar (Pensi Harapan)',
      'OSIS Aspirasi Corner & Forum Dialog Bulanan',
      'Festival E-Sports & Sains Pelajar Antar-Kelas',
      'Gerakan Lingkungan Hijau & Duta Adiwiyata Sekolah'
    ],
    accentColor: '#2563eb' // Blue
  },
  {
    id: 'c2',
    candidateNumber: 2,
    chairmanName: 'Fathan Arya Wardhana',
    chairmanClass: 'XI IPS 2',
    viceChairmanName: 'Kezia Putri Santoso',
    viceChairmanClass: 'X-5',
    tagline: 'Inspiratif, Tanggap, Berbudaya, dan Berdaya Saing Global',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    vision: 'Menjadikan OSIS sebagai pusat pengembangan karakter unggul, solidaritas kuat, dan pelopor modernisasi kegiatan kesiswaan.',
    missions: [
      'Meningkatkan rasa solidaritas, empati, dan kekeluargaan seluruh warga sekolah.',
      'Menyelenggarakan kegiatan kepemudaan yang relevan dengan era teknologi & AI.',
      'Mendorong literasi digital, wirausaha kreatif siswa, dan publikasi prestasi.',
      'Menciptakan iklim sekolah yang aman, inklusif, dan bebas bullying.'
    ],
    workPrograms: [
      'Bootcamp Kepemimpinan & AI Literasi Digital',
      'School Preneur Expo & Bazar Kreasi Siswa',
      'Gerakan Siswa Peduli Sesama (Harapan Bangsa Berbagi)',
      'Turnamen Olahraga OSIS Cup Tahunan'
    ],
    accentColor: '#16a34a' // Green
  },
  {
    id: 'c3',
    candidateNumber: 3,
    chairmanName: 'Zaskia Aurelia Ramadhani',
    chairmanClass: 'XI MIPA 3',
    viceChairmanName: 'Bima Satria Wicaksono',
    viceChairmanClass: 'X-1',
    tagline: 'Maju Bersama, Suarakan Perubahan, Raih Kemilau Prestasi',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    vision: 'Mewujudkan lingkungan sekolah yang dinamis, berkeadaban, serta melahirkan generasi yang kritis dan peduli sosial.',
    missions: [
      'Mengaktifkan kembali forum musyawarah perwakilan kelas secara berkala.',
      'Menggagas program mentoring belajar sebaya untuk peningkatan nilai akademik.',
      'Mendukung penuh kompetisi riset ilmiah remaja dan karya tulis inovatif.',
      'Memperluas jejaring koneksi beasiswa dan persiapan perguruan tinggi.'
    ],
    workPrograms: [
      'Festival Budaya Nusantara & Hari Bahasa',
      'Study Peer Mentoring (Tutor Sebaya Antar-Tingkat)',
      'Pameran Riset Inovasi & Majalah Dinding Digital',
      'Workshop Public Speaking & Debat Nasional'
    ],
    accentColor: '#ea580c' // Orange
  }
];

export const DEFAULT_VOTERS: Voter[] = [
  { id: 'v1', nisn: '20241001', name: 'Aditya Pratama Putra', gradeClass: 'X-1', token: 'TKN-101', hasVoted: false },
  { id: 'v2', nisn: '20241002', name: 'Annisa Larasati', gradeClass: 'X-1', token: 'TKN-102', hasVoted: false },
  { id: 'v3', nisn: '20241003', name: 'Bagus Wicaksono', gradeClass: 'X-2', token: 'TKN-103', hasVoted: false },
  { id: 'v4', nisn: '20241004', name: 'Cynthia Dewi Kusuma', gradeClass: 'X-2', token: 'TKN-104', hasVoted: false },
  { id: 'v5', nisn: '20241005', name: 'Dimas Anggara', gradeClass: 'X-3', token: 'TKN-105', hasVoted: false },
  { id: 'v6', nisn: '20241006', name: 'Elsa Maharani', gradeClass: 'X-3', token: 'TKN-106', hasVoted: false },
  { id: 'v7', nisn: '20241007', name: 'Farhan Maulana', gradeClass: 'XI MIPA 1', token: 'TKN-201', hasVoted: false },
  { id: 'v8', nisn: '20241008', name: 'Gita Permata Sari', gradeClass: 'XI MIPA 1', token: 'TKN-202', hasVoted: false },
  { id: 'v9', nisn: '20241009', name: 'Hafizh Nur Rohman', gradeClass: 'XI MIPA 2', token: 'TKN-203', hasVoted: false },
  { id: 'v10', nisn: '20241010', name: 'Indah Kusumaningrum', gradeClass: 'XI MIPA 2', token: 'TKN-204', hasVoted: false },
  { id: 'v11', nisn: '20241011', name: 'Jovan Nathaniel', gradeClass: 'XI IPS 1', token: 'TKN-205', hasVoted: false },
  { id: 'v12', nisn: '20241012', name: 'Kirana Salsabila', gradeClass: 'XI IPS 1', token: 'TKN-206', hasVoted: false },
  { id: 'v13', nisn: '20241013', name: 'Lucky Firmansyah', gradeClass: 'XI IPS 2', token: 'TKN-207', hasVoted: false },
  { id: 'v14', nisn: '20241014', name: 'Mutia Cahyani', gradeClass: 'XI IPS 2', token: 'TKN-208', hasVoted: false },
  { id: 'v15', nisn: '20241015', name: 'Naufal Ikhsan', gradeClass: 'XII MIPA 1', token: 'TKN-301', hasVoted: false },
  { id: 'v16', nisn: '20241016', name: 'Olivia Clarissa', gradeClass: 'XII MIPA 1', token: 'TKN-302', hasVoted: false },
  { id: 'v17', nisn: '20241017', name: 'Pandu Prasetyo', gradeClass: 'XII MIPA 2', token: 'TKN-303', hasVoted: false },
  { id: 'v18', nisn: '20241018', name: 'Qonita Rahadatul', gradeClass: 'XII MIPA 2', token: 'TKN-304', hasVoted: false },
  { id: 'v19', nisn: '20241019', name: 'Rizky Alamsyah', gradeClass: 'XII IPS 1', token: 'TKN-305', hasVoted: false },
  { id: 'v20', nisn: '20241020', name: 'Siti Sarah Aulia', gradeClass: 'XII IPS 1', token: 'TKN-306', hasVoted: false }
];

export const DEFAULT_VOTE_RECORDS: VoteRecord[] = [];

