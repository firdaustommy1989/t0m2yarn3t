import React, { useState } from 'react';
import { Voter, ElectionSettings } from '../../types/election';
import { Vote, KeyRound, UserCheck, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface VoterLoginProps {
  voters: Voter[];
  settings: ElectionSettings;
  onLoginSuccess: (voter: Voter) => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({ voters, settings, onLoginSuccess }) => {
  const [nisn, setNisn] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (settings.status === 'closed') {
      setErrorMessage('Pemilihan telah ditutup oleh panitia KPU OSIS. Terima kasih atas partisipasi Anda.');
      return;
    }

    if (settings.status === 'draft') {
      setErrorMessage('Pemilihan masih dalam masa persiapan (Draft). Voting belum resmi dibuka.');
      return;
    }

    const cleanNisn = nisn.trim().toLowerCase();
    const cleanToken = token.trim().toLowerCase();

    if (!cleanNisn || !cleanToken) {
      setErrorMessage('Silakan lengkapi NIS/NISN dan Token Akses Anda.');
      return;
    }

    const matchedVoter = voters.find(
      (v) => v.nisn.toLowerCase() === cleanNisn
    );

    if (!matchedVoter) {
      setErrorMessage('NIS/NISN tidak terdaftar dalam Daftar Pemilih Tetap (DPT). Silakan hubungi Panitia OSIS.');
      return;
    }

    if (matchedVoter.token.toLowerCase() !== cleanToken) {
      setErrorMessage('Token Akses tidak sesuai dengan NIS/NISN ini. Periksa kembali slip kartu pemilih Anda.');
      return;
    }

    if (matchedVoter.hasVoted) {
      setErrorMessage(
        `Hak suara untuk ${matchedVoter.name} (${matchedVoter.nisn}) telah digunakan pada ${matchedVoter.votedAt || 'sebelumnya'} dengan No. Verifikasi: ${matchedVoter.receiptCode || '-'}. Setiap siswa hanya memiliki 1 hak suara.`
      );
      return;
    }

    onLoginSuccess(matchedVoter);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1 mb-3 shadow-lg flex items-center justify-center">
            <img
              src="/src/assets/images/sman2_samarinda_logo_1791881987088.jpg"
              alt="Logo SMAN 2 Samarinda"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">MASUK BILIK SUARA</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {settings.schoolName} — E-Voting OSIS
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
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
                  placeholder="Contoh: 20241004"
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
                *Token rahasia tertera pada slip kartu pemilih yang dibagikan oleh panitia.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Vote className="w-5 h-5" />
              <span>Buka Surat Suara Digital</span>
            </button>
          </form>

          {/* Security pledge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Kerahasiaan pilihan dijamin penuh secara sistem</span>
          </div>
        </div>
      </div>
    </div>
  );
};
