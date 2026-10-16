import React from 'react';
import { Vote, BarChart3, ShieldCheck, School, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AppView, ElectionSettings } from '../types/election';
import { SCHOOL_LOGO, SCHOOL_LOGO_SVG } from '../utils/schoolAssets';

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  settings: ElectionSettings;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  settings,
  isAdminLoggedIn,
  onAdminLogout,
}) => {
  const getStatusBadge = () => {
    switch (settings.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Voting Aktif
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pemilihan Ditutup
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Masa Persiapan
          </span>
        );
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & School Logo */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 hover:scale-105 transition-transform drop-shadow-xs bg-white rounded-xl p-1 border border-slate-100 shadow-xs">
              <img
                src={SCHOOL_LOGO}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = SCHOOL_LOGO_SVG;
                }}
                alt="Logo SMAN 2 Samarinda"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-xl tracking-tight">
                  E-VOTING OSIS
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  {settings.periodYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[160px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
                {settings.schoolName}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
              title="Perubahan data dari admin dan hasil suara tersinkronisasi otomatis antar semua perangkat dan browser secara real-time"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Live Cloud Sync</span>
              <span className="sm:hidden">Live</span>
            </span>

            <div className="hidden lg:block">{getStatusBadge()}</div>

            {/* Mode Switcher Nav */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 text-xs sm:text-sm">
              <button
                onClick={() => onViewChange('voter')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  currentView === 'voter'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span className="hidden xs:inline">Bilik Suara</span>
                <span className="xs:hidden">Bilik</span>
              </button>

              <button
                onClick={() => onViewChange('public_results')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  currentView === 'public_results'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden xs:inline">Quick Count</span>
                <span className="xs:hidden">Hasil</span>
              </button>
            </div>

            {isAdminLoggedIn && (
              <button
                onClick={() => onViewChange('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Kembali ke Panel Administrator"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
