import React, { useState } from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../../types/election';
import { resetVotingOnly } from '../../utils/storage';
import { VotersTab } from './VotersTab';
import { CandidatesTab } from './CandidatesTab';
import { SettingsTab } from './SettingsTab';
import { PublicQuickCountView } from '../public/PublicQuickCountView';
import { PrintBeritaAcaraModal } from './PrintBeritaAcaraModal';
import {
  BarChart3,
  Users,
  Vote,
  Settings,
  LogOut,
  FileText,
  School,
  ShieldCheck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  candidates: Candidate[];
  voters: Voter[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  onUpdateCandidates: (candidates: Candidate[]) => void;
  onUpdateVoters: (voters: Voter[]) => void;
  onUpdateSettings: (settings: ElectionSettings) => void;
  onResetData: () => void;
  onLogout: () => void;
  onOpenPublicView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  candidates,
  voters,
  voteRecords,
  settings,
  onUpdateCandidates,
  onUpdateVoters,
  onUpdateSettings,
  onResetData,
  onLogout,
  onOpenPublicView,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_count' | 'voters' | 'candidates' | 'settings'>('quick_count');
  const [isPrintBeritaAcaraOpen, setIsPrintBeritaAcaraOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PANEL ADMINISTRATOR OSIS
              </span>
              <span className="text-xs text-slate-400">Terautentikasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              {settings.electionTitle}
            </h1>
            <p className="text-xs text-slate-300">
              {settings.schoolName} • Periode {settings.periodYear}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPrintBeritaAcaraOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak Berita Acara Resmi</span>
          </button>

          <button
            onClick={onOpenPublicView}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Layar Proyektor</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('quick_count')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'quick_count'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Hasil & Quick Count Suara</span>
        </button>

        <button
          onClick={() => setActiveTab('voters')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'voters'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pemilih (DPT) & Upload</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {voters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'candidates'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Kandidat Paslon</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Database</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'quick_count' && (
          <PublicQuickCountView
            candidates={candidates}
            voters={voters}
            voteRecords={voteRecords}
            settings={{ ...settings, showLiveResultsToPublic: true }}
            onResetVotes={() => {
              resetVotingOnly();
              onResetData();
            }}
          />
        )}

        {activeTab === 'voters' && (
          <VotersTab
            voters={voters}
            settings={settings}
            onUpdateVoters={onUpdateVoters}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesTab
            candidates={candidates}
            onUpdateCandidates={onUpdateCandidates}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onResetData={onResetData}
          />
        )}
      </div>

      {/* Official Berita Acara Modal */}
      {isPrintBeritaAcaraOpen && (
        <PrintBeritaAcaraModal
          candidates={candidates}
          voters={voters}
          voteRecords={voteRecords}
          settings={settings}
          onClose={() => setIsPrintBeritaAcaraOpen(false)}
        />
      )}
    </div>
  );
};
