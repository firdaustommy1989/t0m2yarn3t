import React from 'react';
import { Candidate } from '../../types/election';
import { X, Award, CheckCircle, Sparkles, User, Users } from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onSelectCandidate?: (candidate: Candidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onSelectCandidate,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center font-bold text-white shadow-inner">
              <span className="text-xs uppercase tracking-wider text-slate-300">Nomor</span>
              <span className="text-2xl font-black">{String(candidate.candidateNumber).padStart(2, '0')}</span>
            </div>

            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-1">
                Pasangan Calon Ketua & Wakil OSIS
              </span>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                {candidate.chairmanName} & {candidate.viceChairmanName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelas: {candidate.chairmanClass} & {candidate.viceChairmanClass}
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Tagline */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">Slogan / Tagline</h4>
              <p className="text-sm font-semibold text-blue-950 italic mt-0.5">"{candidate.tagline}"</p>
            </div>
          </div>

          {/* Visi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-base">Visi</h4>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
              {candidate.vision}
            </p>
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-base">Misi</h4>
            </div>
            <ul className="space-y-2">
              {candidate.missions.map((mission, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{mission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Program Kerja Unggulan */}
          {candidate.workPrograms && candidate.workPrograms.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-base">Program Kerja Unggulan</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {candidate.workPrograms.map((prog, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs font-medium text-amber-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{prog}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
          {onSelectCandidate && (
            <button
              onClick={() => {
                onSelectCandidate(candidate);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <span>Pilih Paslon {String(candidate.candidateNumber).padStart(2, '0')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
