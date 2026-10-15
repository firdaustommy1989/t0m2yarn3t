import React, { useState } from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../../types/election';
import { resetVotingOnly } from '../../utils/storage';
import { VotersTab } from './VotersTab';
import { CandidatesTab } from './CandidatesTab';
import { SettingsTab } from './SettingsTab';
import { UploadDataTab } from './UploadDataTab';
import { EditDataTab } from './EditDataTab';
import { DeleteDataTab } from './DeleteDataTab';
import { PublicQuickCountView } from '../public/PublicQuickCountView';
import { PrintBeritaAcaraModal } from './PrintBeritaAcaraModal';
import { SCHOOL_LOGO, SCHOOL_LOGO_SVG } from '../../utils/schoolAssets';
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
  ExternalLink,
  Upload,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight
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
  onOpenVoterView?: () => void;
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
  onOpenVoterView,
}) => {
  const [activeTab, setActiveTab] = useState<
    'quick_count' | 'upload_data' | 'edit_data' | 'delete_data' | 'voters' | 'candidates' | 'settings'
  >('quick_count');
  const [isPrintBeritaAcaraOpen, setIsPrintBeritaAcaraOpen] = useState(false);
  const [recentChangeNotice, setRecentChangeNotice] = useState<{
    title: string;
    message: string;
    type: 'candidate' | 'voter' | 'settings' | 'reset';
  } | null>(null);

  const handleUpdateCandidatesWrapped = (newCandidates: Candidate[]) => {
    onUpdateCandidates(newCandidates);
    setRecentChangeNotice({
      title: 'Perubahan Paslon Tersimpan!',
      message: 'Foto, data nama, visi misi, atau nomor urut paslon telah langsung berubah di Halaman Depan Siswa dan Quick Count.',
      type: 'candidate',
    });
  };

  const handleUpdateVotersWrapped = (newVoters: Voter[]) => {
    onUpdateVoters(newVoters);
    setRecentChangeNotice({
      title: 'Perubahan Data Pemilih (DPT) Tersimpan!',
      message: 'Data pemilih dan status partisipasi telah langsung terupdate di seluruh sistem.',
      type: 'voter',
    });
  };

  const handleUpdateSettingsWrapped = (newSettings: ElectionSettings) => {
    onUpdateSettings(newSettings);
    setRecentChangeNotice({
      title: 'Pengaturan Pemilihan Tersimpan!',
      message: 'Judul sekolah, periode, dan konfigurasi pemilihan telah langsung berubah di halaman depan siswa.',
      type: 'settings',
    });
  };

  const handleResetDataWrapped = () => {
    onResetData();
    setRecentChangeNotice({
      title: 'Kotak Suara Berhasil Direset!',
      message: 'Perolehan suara di Halaman Depan Siswa dan Quick Count telah kembali ke 0 secara real-time.',
      type: 'reset',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
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
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PANEL ADMINISTRATOR OSIS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud Terhubung
              </span>
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

          {onOpenVoterView && (
            <button
              onClick={onOpenVoterView}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lihat Halaman Bilik Suara Siswa"
            >
              <Vote className="w-4 h-4" />
              <span className="hidden sm:inline">Halaman Depan Siswa</span>
            </button>
          )}

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

      {/* Quick Action Navigation Cards: Upload, Edit, Hapus Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setActiveTab('upload_data')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeTab === 'upload_data'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'upload_data'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
              }`}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <span>Menu Upload Data</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    activeTab === 'upload_data'
                      ? 'bg-white/25 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Excel/CSV
                </span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  activeTab === 'upload_data' ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                Upload DPT, Foto Paslon, Backup
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg ${
              activeTab === 'upload_data'
                ? 'bg-white text-blue-700'
                : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
            }`}
          >
            Buka &rarr;
          </span>
        </button>

        <button
          onClick={() => setActiveTab('edit_data')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeTab === 'edit_data'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'edit_data'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
              }`}
            >
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <span>Menu Edit Data</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    activeTab === 'edit_data'
                      ? 'bg-white/25 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Ubah
                </span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  activeTab === 'edit_data' ? 'text-amber-100' : 'text-slate-500'
                }`}
              >
                Edit Pemilih, Paslon, Info Pemilu
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg ${
              activeTab === 'edit_data'
                ? 'bg-white text-amber-700'
                : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700'
            }`}
          >
            Buka &rarr;
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delete_data')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeTab === 'delete_data'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
              : 'bg-white hover:bg-rose-50/50 border-slate-200 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'delete_data'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <span>Menu Hapus Data</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    activeTab === 'delete_data'
                      ? 'bg-white/25 text-white'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Bersihkan
                </span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  activeTab === 'delete_data' ? 'text-rose-100' : 'text-slate-500'
                }`}
              >
                Hapus DPT, Reset Suara, Hapus Paslon
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg ${
              activeTab === 'delete_data'
                ? 'bg-white text-rose-700'
                : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-700'
            }`}
          >
            Buka &rarr;
          </span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('quick_count')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'quick_count'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Hasil & Quick Count</span>
        </button>

        <button
          onClick={() => setActiveTab('upload_data')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'upload_data'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Data</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
            Impor
          </span>
        </button>

        <button
          onClick={() => setActiveTab('edit_data')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'edit_data'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Data</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
            Ubah
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delete_data')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'delete_data'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span>Hapus Data</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
            Reset
          </span>
        </button>

        <button
          onClick={() => setActiveTab('voters')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'voters'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tabel DPT & Kartu</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {voters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
          className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
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
            onRefresh={onResetData}
          />
        )}

        {activeTab === 'upload_data' && (
          <UploadDataTab
            voters={voters}
            candidates={candidates}
            settings={settings}
            onUpdateVoters={handleUpdateVotersWrapped}
            onUpdateCandidates={handleUpdateCandidatesWrapped}
            onRefreshAll={handleResetDataWrapped}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenVoterView={onOpenVoterView}
            onOpenPublicView={onOpenPublicView}
          />
        )}

        {activeTab === 'edit_data' && (
          <EditDataTab
            voters={voters}
            candidates={candidates}
            settings={settings}
            onUpdateVoters={handleUpdateVotersWrapped}
            onUpdateCandidates={handleUpdateCandidatesWrapped}
            onUpdateSettings={handleUpdateSettingsWrapped}
            onOpenVoterView={onOpenVoterView}
            onOpenPublicView={onOpenPublicView}
          />
        )}

        {activeTab === 'delete_data' && (
          <DeleteDataTab
            voters={voters}
            candidates={candidates}
            voteRecords={voteRecords}
            settings={settings}
            onUpdateVoters={handleUpdateVotersWrapped}
            onUpdateCandidates={handleUpdateCandidatesWrapped}
            onResetData={handleResetDataWrapped}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenVoterView={onOpenVoterView}
            onOpenPublicView={onOpenPublicView}
          />
        )}

        {activeTab === 'voters' && (
          <VotersTab
            voters={voters}
            settings={settings}
            onUpdateVoters={handleUpdateVotersWrapped}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesTab
            candidates={candidates}
            onUpdateCandidates={handleUpdateCandidatesWrapped}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettingsWrapped}
            onResetData={handleResetDataWrapped}
          />
        )}
      </div>

      {/* Real-time Change Floating Action Toast */}
      {recentChangeNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl border border-blue-500/40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-400 tracking-wide uppercase flex items-center gap-1.5">
                  <span>{recentChangeNotice.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {recentChangeNotice.message}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  {onOpenVoterView && (
                    <button
                      onClick={onOpenVoterView}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>Lihat Halaman Depan Siswa</span>
                    </button>
                  )}
                  {onOpenPublicView && (
                    <button
                      onClick={onOpenPublicView}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Lihat Quick Count</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setRecentChangeNotice(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
