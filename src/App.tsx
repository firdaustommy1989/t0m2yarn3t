import React, { useState, useEffect } from 'react';
import { AppView, Candidate, ElectionSettings, Voter, VoteRecord } from './types/election';
import {
  getSettings,
  saveSettings,
  getCandidates,
  saveCandidates,
  getVoters,
  saveVoters,
  getVoteRecords,
  resetVotingOnly,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { VoterLogin } from './components/voter/VoterLogin';
import { VotingBooth } from './components/voter/VotingBooth';
import { PublicQuickCountView } from './components/public/PublicQuickCountView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { School, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('voter');
  const [settings, setSettings] = useState<ElectionSettings>(getSettings);
  const [candidates, setCandidates] = useState<Candidate[]>(getCandidates);
  const [voters, setVoters] = useState<Voter[]>(getVoters);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(getVoteRecords);

  // Student voting session state
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Sync / refresh helper
  const refreshAllState = () => {
    setSettings(getSettings());
    setCandidates(getCandidates());
    setVoters(getVoters());
    setVoteRecords(getVoteRecords());
  };

  const handleViewChange = (view: AppView) => {
    if (view === 'admin') {
      if (!isAdminLoggedIn) {
        setShowAdminLoginModal(true);
        return;
      }
    }
    setCurrentView(view);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLoginModal(false);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    if (currentView === 'admin') {
      setCurrentView('public_results');
    }
  };

  const handleUpdateCandidates = (newCandidates: Candidate[]) => {
    saveCandidates(newCandidates);
    setCandidates(newCandidates);
  };

  const handleUpdateVoters = (newVoters: Voter[]) => {
    saveVoters(newVoters);
    setVoters(newVoters);
  };

  const handleUpdateSettings = (newSettings: ElectionSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: BILIK SUARA (E-VOTING) */}
        {currentView === 'voter' && (
          <div className="animate-in fade-in duration-200">
            {!activeVoter ? (
              <VoterLogin
                voters={voters}
                settings={settings}
                onLoginSuccess={(voter) => setActiveVoter(voter)}
              />
            ) : (
              <VotingBooth
                voter={activeVoter}
                candidates={candidates}
                settings={settings}
                onExitSession={() => {
                  setActiveVoter(null);
                  refreshAllState();
                }}
                onVoteRecorded={() => {
                  refreshAllState();
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 2: HASIL & QUICK COUNT PUBLIK */}
        {currentView === 'public_results' && (
          <div className="animate-in fade-in duration-200">
            <PublicQuickCountView
              candidates={candidates}
              voters={voters}
              voteRecords={voteRecords}
              settings={settings}
              onRefresh={refreshAllState}
              onResetVotes={() => {
                resetVotingOnly();
                refreshAllState();
              }}
            />
          </div>
        )}

        {/* VIEW 3: PANEL ADMIN */}
        {currentView === 'admin' && isAdminLoggedIn && (
          <div className="animate-in fade-in duration-200">
            <AdminDashboard
              candidates={candidates}
              voters={voters}
              voteRecords={voteRecords}
              settings={settings}
              onUpdateCandidates={handleUpdateCandidates}
              onUpdateVoters={handleUpdateVoters}
              onUpdateSettings={handleUpdateSettings}
              onResetData={refreshAllState}
              onLogout={handleAdminLogout}
              onOpenPublicView={() => setCurrentView('public_results')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <School className="w-4 h-4 text-slate-400" />
            <span>
              Komisi Pemilihan Umum OSIS (KPU OSIS) • {settings.schoolName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Sistem E-Voting Demokrasi Sekolah Digital Luber & Jurdil</span>
          </div>
        </div>
      </footer>

      {/* Admin Passcode Modal Gatekeeper */}
      {showAdminLoginModal && (
        <AdminLogin
          correctPasscode={settings.adminPasscode}
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={() => setShowAdminLoginModal(false)}
        />
      )}
    </div>
  );
}
