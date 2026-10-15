import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, School, CheckCircle2, Clock, Users, Award, AlertCircle, CloudCheck } from 'lucide-react';
import { ElectionSettings, Candidate, Voter } from '../../types/election';
import { SCHOOL_LOGO, SCHOOL_LOGO_SVG } from '../../utils/schoolAssets';
import { loginAdminWithGoogle } from '../../services/electionDb';

interface AdminPortalPageProps {
  settings: ElectionSettings;
  candidates: Candidate[];
  voters: Voter[];
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  settings,
  candidates,
  voters,
  onLoginSuccess,
  onBackToHome,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (passcode.trim() === settings.adminPasscode.trim()) {
      onLoginSuccess();
    } else {
      setError(true);
      setErrorMessage('Kata sandi salah. Pastikan Anda memasukkan sandi administrator dengan benar.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError(false);
    try {
      await loginAdminWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setError(true);
      setErrorMessage(err?.message || 'Gagal login dengan akun Google. Silakan gunakan PIN administrator.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={SCHOOL_LOGO}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = SCHOOL_LOGO_SVG;
                }}
                alt="Logo SMAN 2 Samarinda"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base block">
                PORTAL ADMINISTRATOR KPU OSIS
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {settings.schoolName}
              </span>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Siswa</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Login Card */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"></div>

            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 shadow-lg flex items-center justify-center">
                <img
                  src={SCHOOL_LOGO}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = SCHOOL_LOGO_SVG;
                  }}
                  alt="Logo SMAN 2 Samarinda"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  AUTENTIKASI PANITIA
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Masukkan kata sandi master untuk mengakses kontrol pemungutan suara, DPT, dan perolehan suara.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage || 'Kata sandi salah. Pastikan Anda memasukkan sandi administrator dengan benar.'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Kata Sandi / PIN Administrator
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError(false);
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passcode.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk ke Panel Kendali</span>
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Atau</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login dengan Akun Google Panitia</span>
            </button>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Area Terbatas: Khusus Komisi Pemilihan Umum OSIS & Pembina Kesiswaan {settings.schoolName}.
              </p>
            </div>
          </div>

          {/* Quick Election Overview Card */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-400" />
              <span>Ringkasan Status Pemilihan</span>
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Status</span>
                <span className={`text-xs font-bold mt-0.5 inline-block ${
                  settings.status === 'active' ? 'text-emerald-400' : settings.status === 'closed' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {settings.status === 'active' ? 'Voting Aktif' : settings.status === 'closed' ? 'Ditutup' : 'Persiapan'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total DPT</span>
                <span className="text-xs font-bold text-white mt-0.5 inline-block">
                  {voters.length} Siswa
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kandidat</span>
                <span className="text-xs font-bold text-white mt-0.5 inline-block">
                  {candidates.length} Paslon
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} KPU OSIS {settings.schoolName} • Sistem E-Voting Terenkripsi</p>
      </footer>
    </div>
  );
};
