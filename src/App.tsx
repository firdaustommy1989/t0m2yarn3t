import React, { useState, useEffect } from 'react';
import { AppView, Candidate, ElectionSettings, Voter, VoteRecord } from './types/election';
import {
  getSettings,
  getCandidates,
  getVoters,
  getVoteRecords,
} from './utils/storage';
import {
  initializeFirestoreIfNeeded,
  subscribeSettings,
  subscribeCandidates,
  subscribeVoters,
  subscribeVoteRecords,
  saveSettingsSync,
  saveCandidatesSync,
  saveVotersSync,
  resetVotingOnlySync,
} from './services/electionDb';
import { Navbar } from './components/Navbar';
import { VoterLogin } from './components/voter/VoterLogin';
import { VotingBooth } from './components/voter/VotingBooth';
import { PublicQuickCountView } from './components/public/PublicQuickCountView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPortalPage } from './components/admin/AdminPortalPage';
import { School, Lock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('admin')) {
      return 'admin';
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.hash.toLowerCase().includes('hasil') ||
        window.location.hash.toLowerCase().includes('quick'))
    ) {
      return 'public_results';
    }
    return 'voter';
  });

  const [settings, setSettings] = useState<ElectionSettings>(getSettings);
  const [candidates, setCandidates] = useState<Candidate[]>(getCandidates);
  const [voters, setVoters] = useState<Voter[]>(getVoters);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(getVoteRecords);

  // Student voting session state
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Real-time synchronization across all devices via Cloud Firestore
  useEffect(() => {
    // 1. Initial check & seed if brand new database
    initializeFirestoreIfNeeded();

    // 2. Real-time subscriptions across all connected devices
    const unsubSettings = subscribeSettings((newSettings) => {
      setSettings(newSettings);
    });

    const unsubCandidates = subscribeCandidates((newCandidates) => {
      setCandidates(newCandidates);
    });

    const unsubVoters = subscribeVoters((newVoters) => {
      setVoters(newVoters);
      // Keep activeVoter session synced if its state changes (e.g. voted on another tab)
      setActiveVoter((curr) => {
        if (!curr) return null;
        const fresh = newVoters.find((v) => v.id === curr.id);
        return fresh || curr;
      });
    });

    const unsubVotes = subscribeVoteRecords((newVotes) => {
      setVoteRecords(newVotes);
    });

    const handleStorageEvent = () => {
      refreshAllState();
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      unsubSettings();
      unsubCandidates();
      unsubVoters();
      unsubVotes();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Sync / refresh helper
  const refreshAllState = () => {
    setSettings(getSettings());
    setCandidates(getCandidates());
    setVoters(getVoters());
    setVoteRecords(getVoteRecords());
  };

  // URL Hash router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setCurrentView('admin');
      } else if (hash.includes('hasil') || hash.includes('quick')) {
        setCurrentView('public_results');
      } else if (hash === '' || hash === '#' || hash === '#/' || hash.includes('vote')) {
        setCurrentView('voter');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut listener (Ctrl+Shift+A or Alt+A to access admin page)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault();
        navigateToView('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToView = (view: AppView) => {
    if (view === 'admin') {
      window.location.hash = '/admin';
    } else if (view === 'public_results') {
      window.location.hash = '/hasil';
    } else {
      window.location.hash = '/';
    }
    setCurrentView(view);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    navigateToView('voter');
  };

  const handleUpdateCandidates = async (newCandidates: Candidate[]) => {
    setCandidates(newCandidates);
    try {
      await saveCandidatesSync(newCandidates);
    } catch (err) {
      console.warn('Sync candidates warning:', err);
    }
  };

  const handleUpdateVoters = async (newVoters: Voter[]) => {
    setVoters(newVoters);
    try {
      await saveVotersSync(newVoters);
    } catch (err) {
      console.warn('Sync voters warning:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: ElectionSettings) => {
    setSettings(newSettings);
    try {
      await saveSettingsSync(newSettings);
    } catch (err) {
      console.warn('Sync settings warning:', err);
    }
  };

  const handleResetData = async () => {
    try {
      await resetVotingOnlySync();
    } catch (err) {
      console.warn('Reset voting warning:', err);
    }
    refreshAllState();
  };

  // If in admin view, render dedicated admin experience
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminPortalPage
          settings={settings}
          candidates={candidates}
          voters={voters}
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToHome={() => navigateToView('voter')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <main className="flex-1 pb-16">
          <div className="animate-in fade-in duration-200">
            <AdminDashboard
              candidates={candidates}
              voters={voters}
              voteRecords={voteRecords}
              settings={settings}
              onUpdateCandidates={handleUpdateCandidates}
              onUpdateVoters={handleUpdateVoters}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              onLogout={handleAdminLogout}
              onOpenPublicView={() => navigateToView('public_results')}
              onOpenVoterView={() => navigateToView('voter')}
            />
          </div>
        </main>
      </div>
    );
  }

  // Front-page views (voter & public_results)
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Front Page Top Navbar (with real-time cloud multi-device sync indicator) */}
      <Navbar
        currentView={currentView}
        onViewChange={navigateToView}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: BILIK SUARA (E-VOTING SISWA) */}
        {currentView === 'voter' && (
          <div className="animate-in fade-in duration-200">
            {!activeVoter ? (
              <VoterLogin
                voters={voters}
                settings={settings}
                candidates={candidates}
                voteRecords={voteRecords}
                onOpenQuickCount={() => navigateToView('public_results')}
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
            />
          </div>
        )}
      </main>

      {/* Front Page Footer with Discreet Panitia Portal Link */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <School className="w-4 h-4 text-slate-400" />
            <span>
              Komisi Pemilihan Umum OSIS (KPU OSIS) • {settings.schoolName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Sistem E-Voting Demokrasi Sekolah Digital • Sinkronisasi Multi-Perangkat</span>
            <span className="text-slate-300">•</span>
            {/* Discreet Admin Portal access for panitia */}
            <button
              onClick={() => navigateToView('admin')}
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
              title="Akses Khusus Panitia KPU OSIS (Tekan Alt+A atau kunjungi #/admin)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Panitia</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
