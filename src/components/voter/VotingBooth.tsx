import React, { useState } from 'react';
import { Candidate, Voter, ElectionSettings } from '../../types/election';
import { CandidateDetailModal } from './CandidateDetailModal';
import { VoteSuccessModal } from './VoteSuccessModal';
import { castVote } from '../../utils/storage';
import { Check, Eye, UserCheck, Shield, HelpCircle, ArrowLeft, Stamp } from 'lucide-react';

interface VotingBoothProps {
  voter: Voter;
  candidates: Candidate[];
  settings: ElectionSettings;
  onExitSession: () => void;
  onVoteRecorded: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({
  voter,
  candidates,
  settings,
  onExitSession,
  onVoteRecorded,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewingDetailCandidate, setViewingDetailCandidate] = useState<Candidate | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    receiptCode: string;
    votedAt: string;
    candidateNumber: number;
    candidateName: string;
  } | null>(null);

  const handleStartVote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsConfirming(true);
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);
    const result = castVote(voter.id, selectedCandidate.id);

    if (result.success && result.receiptCode && result.votedAt) {
      setSuccessData({
        receiptCode: result.receiptCode,
        votedAt: result.votedAt,
        candidateNumber: selectedCandidate.candidateNumber,
        candidateName: `${selectedCandidate.chairmanName} & ${selectedCandidate.viceChairmanName}`,
      });
      setIsConfirming(false);
      onVoteRecorded();
    } else {
      alert(result.message || 'Gagal mencatat suara. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Voter Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pemilih Terverifikasi
              </span>
              <span className="text-xs text-slate-400 font-mono">Token: {voter.token}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">{voter.name}</h2>
            <p className="text-xs text-slate-300">
              NISN: <span className="font-mono">{voter.nisn}</span> • Kelas:{' '}
              <span className="font-semibold">{voter.gradeClass}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pilihan Anda Bersifat Rahasia (Asas Luber Jurdil)</span>
          </div>

          <button
            onClick={onExitSession}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal & Keluar</span>
          </button>
        </div>
      </div>

      {/* Ballot Header Notice */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          SURAT SUARA ELEKTRONIK (E-BALLOT)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Silakan pelajari visi & misi masing-masing pasangan calon, kemudian tekan tombol{' '}
          <strong className="text-blue-700">"COBLOS PASLON"</strong> untuk menentukan pilihan terbaik Anda.
        </p>
      </div>

      {/* Candidates Ballot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {candidates
          .sort((a, b) => a.candidateNumber - b.candidateNumber)
          .map((cand) => (
            <div
              key={cand.id}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative group"
            >
              {/* Candidate Number Header */}
              <div
                className="p-3 text-white text-center font-black text-lg tracking-wider flex items-center justify-between px-6"
                style={{ backgroundColor: cand.accentColor || '#2563eb' }}
              >
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold">NOMOR URUT</span>
                <span className="text-2xl font-black">{String(cand.candidateNumber).padStart(2, '0')}</span>
              </div>

              {/* Candidate Photo */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={cand.photoUrl}
                  alt={`Paslon ${cand.candidateNumber}`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to high quality student avatar
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-semibold text-blue-200">Kandidat Ketua & Wakil</p>
                    <h3 className="text-lg font-extrabold leading-tight">
                      {cand.chairmanName} & {cand.viceChairmanName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      Ketua: {cand.chairmanClass}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      Wakil: {cand.viceChairmanClass}
                    </span>
                  </div>

                  <p className="text-xs text-blue-900 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 italic font-medium leading-relaxed">
                    "{cand.tagline}"
                  </p>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Visi Singkat:
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cand.vision}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={() => setViewingDetailCandidate(cand)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Lihat Visi, Misi & Proker Lengkap</span>
                  </button>

                  <button
                    onClick={() => handleStartVote(cand)}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    style={{
                      backgroundColor: cand.accentColor || '#2563eb',
                      boxShadow: `0 8px 20px -4px ${cand.accentColor || '#2563eb'}60`,
                    }}
                  >
                    <Stamp className="w-5 h-5" />
                    <span>COBLOS PASLON NO. {String(cand.candidateNumber).padStart(2, '0')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="text-center space-y-2">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                style={{ backgroundColor: selectedCandidate.accentColor }}
              >
                {String(selectedCandidate.candidateNumber).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-black text-slate-900">KONFIRMASI PILIHAN ANDA</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda mantap dan yakin untuk memberikan hak suara kepada pasangan calon ini?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Paslon Nomor:</span>
                <span className="font-bold text-slate-900">
                  {String(selectedCandidate.candidateNumber).padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ketua & Wakil:</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedCandidate.chairmanName} & {selectedCandidate.viceChairmanName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pemilih (Anda):</span>
                <span className="font-semibold text-slate-800">
                  {voter.name} ({voter.gradeClass})
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              ⚠️ <strong>Peringatan:</strong> Suara yang telah dicoblos tidak dapat diubah atau dibatalkan kembali sesuai ketentuan KPU OSIS.
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => setIsConfirming(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
              >
                Kembali / Cek Ulang
              </button>

              <button
                disabled={isSubmitting}
                onClick={handleConfirmVote}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Mencatat...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ya, Coblos Sekarang!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Full Vision/Mission Detail Modal */}
      {viewingDetailCandidate && (
        <CandidateDetailModal
          candidate={viewingDetailCandidate}
          onClose={() => setViewingDetailCandidate(null)}
          onSelectCandidate={(cand) => {
            setViewingDetailCandidate(null);
            handleStartVote(cand);
          }}
        />
      )}

      {/* Vote Success E-Receipt Modal */}
      {successData && (
        <VoteSuccessModal
          voter={voter}
          receiptCode={successData.receiptCode}
          votedAt={successData.votedAt}
          candidateNumber={successData.candidateNumber}
          candidateName={successData.candidateName}
          settings={settings}
          onFinishSession={onExitSession}
        />
      )}
    </div>
  );
};
