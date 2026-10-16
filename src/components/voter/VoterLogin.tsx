import React, { useState } from 'react';
import { Voter, ElectionSettings, Candidate, VoteRecord } from '../../types/election';
import {
  Vote,
  KeyRound,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Shield,
  Sparkles,
  Award,
  Users,
  BarChart3,
  ChevronRight,
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SCHOOL_LOGO, SCHOOL_LOGO_SVG, DEFAULT_CANDIDATE_PHOTOS } from '../../utils/schoolAssets';
import { CandidateDetailModal } from './CandidateDetailModal';
import { useToast } from '../common/Toast';

interface VoterLoginProps {
  voters: Voter[];
  settings: ElectionSettings;
  candidates: Candidate[];
  voteRecords: VoteRecord[];
  onLoginSuccess: (voter: Voter) => void;
  onOpenQuickCount?: () => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  voters,
  settings,
  candidates,
  voteRecords,
  onLoginSuccess,
  onOpenQuickCount,
}) => {
  const toast = useToast();
  const [nisn, setNisn] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const participationRate = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (settings.status === 'closed') {
      const msg = 'Pemilihan telah ditutup oleh panitia KPU OSIS. Terima kasih atas partisipasi Anda.';
      setErrorMessage(msg);
      toast.warning('Pemilihan Ditutup', msg);
      return;
    }

    if (settings.status === 'draft') {
      const msg = 'Pemilihan masih dalam masa persiapan (Draft). Voting belum resmi dibuka.';
      setErrorMessage(msg);
      toast.info('Masa Persiapan', msg);
      return;
    }

    const cleanNisn = nisn.trim().toLowerCase();
    const cleanToken = token.trim().toLowerCase();

    if (!cleanNisn || !cleanToken) {
      const msg = 'Silakan lengkapi NIS/NISN dan Token Akses Anda.';
      setErrorMessage(msg);
      toast.error('Data Belum Lengkap', msg);
      return;
    }

    const matchedVoter = voters.find(
      (v) => v.nisn.toLowerCase() === cleanNisn
    );

    if (!matchedVoter) {
      const msg = 'NIS/NISN tidak terdaftar dalam DPT. Silakan hubungi Panitia KPU OSIS.';
      setErrorMessage(msg);
      toast.error('NISN Tidak Terdaftar', msg);
      return;
    }

    if (matchedVoter.token.toLowerCase() !== cleanToken) {
      const msg = 'Token Akses tidak sesuai dengan NIS/NISN ini. Periksa kembali slip kartu Anda.';
      setErrorMessage(msg);
      toast.error('Token Akses Salah', msg);
      return;
    }

    if (matchedVoter.hasVoted) {
      const msg = `Hak suara untuk ${matchedVoter.name} (${matchedVoter.nisn}) sudah digunakan pada ${matchedVoter.votedAt || 'sebelumnya'}.`;
      setErrorMessage(msg);
      toast.warning('Sudah Memilih', msg);
      return;
    }

    toast.success('Autentikasi Berhasil', `Selamat datang di Bilik Suara, ${matchedVoter.name}!`);
    onLoginSuccess(matchedVoter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-lg flex items-center justify-center shrink-0">
              <img
                src={SCHOOL_LOGO}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = SCHOOL_LOGO_SVG;
                }}
                alt={settings.schoolName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5 text-xs text-blue-200">
                <span className="font-bold uppercase tracking-wider text-blue-200">
                  Pemilihan Ketua & Wakil Ketua OSIS
                </span>
                <span aria-hidden="true" className="text-blue-400">·</span>
                <span className="font-medium text-blue-100">Periode {settings.periodYear}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                {settings.electionTitle}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {settings.schoolName} — Gunakan hak suara Anda secara Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil.
              </p>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 sm:p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-2">
              <div className="text-xs text-blue-200 font-medium">Partisipasi</div>
              <div className="text-lg sm:text-2xl font-black text-emerald-400">{participationRate}%</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center px-2">
              <div className="text-xs text-blue-200 font-medium">Suara Masuk</div>
              <div className="text-lg sm:text-2xl font-black text-white">{votedCount} / {totalVoters}</div>
            </div>
            {onOpenQuickCount && (
              <button
                onClick={onOpenQuickCount}
                className="ml-2 px-3.5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Count</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Bilik Suara Login on Left, Candidate Showcase on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Student Login Card (Bilik Suara) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">MASUK BILIK SUARA</h2>
                  <p className="text-[11px] text-blue-100">Autentikasi Pemilih Digital</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Aktif
              </span>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-semibold">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Induk Siswa (NIS / NISN)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Masukkan NISN Anda..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 font-medium text-sm transition-all"
                      autoFocus
                    />
                    <UserCheck className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Token Rahasia Pemilih
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      placeholder="Contoh: TKN-104"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 font-mono font-bold tracking-wider text-sm transition-all"
                    />
                    <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    *Token rahasia tertera pada kartu pemilih dari Panitia KPU OSIS.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <Vote className="w-5 h-5" />
                  <span>Buka Surat Suara Digital</span>
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pilihan dijamin rahasia & dihitung secara real-time</span>
              </div>
            </div>
          </div>

          {/* Voting Guide Mini Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Tata Cara Pencoblosan
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Masukkan NISN & Token unik pada formulir di atas.</li>
              <li>Pilih pasangan calon pilihan Anda pada bilik suara digital.</li>
              <li>Konfirmasi surat suara Anda dan simpan kode tanda terima.</li>
            </ol>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Showcase (Daftar Pasangan Calon) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  PROFIL KANDIDAT RESMI
                </span>
                <span className="text-xs text-slate-500">{candidates.length} Pasangan Calon</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                Daftar Pasangan Calon Ketua & Wakil OSIS
              </h2>
            </div>

            {onOpenQuickCount && (
              <button
                onClick={onOpenQuickCount}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Quick Count</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">Belum Ada Data Pasangan Calon</p>
              <p className="text-xs text-slate-400 mt-1">
                Data pasangan calon dapat diunggah atau diatur melalui Panel Administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidates.map((cand, index) => {
                const fallbackPhoto =
                  cand.photoUrl ||
                  DEFAULT_CANDIDATE_PHOTOS[index % DEFAULT_CANDIDATE_PHOTOS.length] ||
                  '';

                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo & Number Badge */}
                      <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={cand.photoUrl || fallbackPhoto}
                          alt={`${cand.chairmanName} & ${cand.viceChairmanName}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              DEFAULT_CANDIDATE_PHOTOS[index % DEFAULT_CANDIDATE_PHOTOS.length];
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20"></div>

                        {/* Candidate Number Pill */}
                        <div
                          className="absolute top-3 left-3 px-3 py-1 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center gap-1.5"
                          style={{ backgroundColor: cand.accentColor || '#2563eb' }}
                        >
                          <span className="text-[10px] opacity-80 uppercase tracking-wider">NO.</span>
                          <span>{String(cand.candidateNumber).padStart(2, '0')}</span>
                        </div>

                        {/* Name on photo */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-black text-sm sm:text-base leading-snug drop-shadow-sm">
                            {cand.chairmanName} & {cand.viceChairmanName}
                          </h3>
                          <p className="text-[11px] text-slate-200 font-medium drop-shadow-sm">
                            Kelas {cand.chairmanClass} & {cand.viceChairmanClass}
                          </p>
                        </div>
                      </div>

                      {/* Tagline & Vision */}
                      <div className="p-4 space-y-3">
                        {cand.tagline && (
                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 font-semibold italic flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">"{cand.tagline}"</span>
                          </div>
                        )}

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Visi Utama:
                          </span>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {cand.vision || 'Mewujudkan OSIS yang berintegritas dan aspiratif.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => setSelectedCandidateForModal(cand)}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span>Lihat Profil & Visi Misi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Quick Count Teaser Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Transparansi Hasil Pemilihan</h4>
                <p className="text-xs text-slate-300">
                  Pantau perolehan suara sah dan persentase partisipasi per kelas secara langsung.
                </p>
              </div>
            </div>

            {onOpenQuickCount && (
              <button
                onClick={onOpenQuickCount}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <span>Buka Layar Quick Count</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal for full Visi, Misi & Work Programs */}
      {selectedCandidateForModal && (
        <CandidateDetailModal
          candidate={selectedCandidateForModal}
          onClose={() => setSelectedCandidateForModal(null)}
        />
      )}
    </div>
  );
};
