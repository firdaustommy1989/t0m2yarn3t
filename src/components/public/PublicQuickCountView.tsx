import React, { useState } from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../../types/election';
import { BarChart3, Users, CheckCircle2, Clock, Trophy, School, Printer, TrendingUp, Layers, RefreshCw, RotateCcw } from 'lucide-react';

interface PublicQuickCountViewProps {
  candidates: Candidate[];
  voters: Voter[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  onRefresh?: () => void;
  onResetVotes?: () => void;
}

export const PublicQuickCountView: React.FC<PublicQuickCountViewProps> = ({
  candidates,
  voters,
  voteRecords,
  settings,
  onRefresh,
  onResetVotes,
}) => {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const pendingCount = totalVoters - votedCount;
  const participationRate = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : '0';

  // Calculate vote count per candidate
  const candidateStats = candidates.map((cand) => {
    const candidateVotes = voteRecords.filter((v) => v.candidateId === cand.id);
    const count = candidateVotes.length;
    const percentageOfCast = votedCount > 0 ? ((count / votedCount) * 100).toFixed(1) : '0';
    const percentageOfTotalDpt = totalVoters > 0 ? ((count / totalVoters) * 100).toFixed(1) : '0';

    return {
      candidate: cand,
      count,
      percentageOfCast: Number(percentageOfCast),
      percentageOfTotalDpt: Number(percentageOfTotalDpt),
    };
  });

  // Sort descending by vote count to find leader
  const sortedStats = [...candidateStats].sort((a, b) => b.count - a.count);
  const leadingCandidate = sortedStats.length > 0 && sortedStats[0].count > 0 ? sortedStats[0] : null;

  // Grade/Level breakdown (Extract class grades like X, XI, XII)
  const gradeDistribution: Record<string, { total: number; voted: number }> = {};
  voters.forEach((v) => {
    let group = 'Lainnya';
    if (v.gradeClass.startsWith('X-') || v.gradeClass.startsWith('X ')) group = 'Kelas X';
    else if (v.gradeClass.startsWith('XI')) group = 'Kelas XI';
    else if (v.gradeClass.startsWith('XII')) group = 'Kelas XII';
    else group = v.gradeClass.split(' ')[0] || 'Umum';

    if (!gradeDistribution[group]) {
      gradeDistribution[group] = { total: 0, voted: 0 };
    }
    gradeDistribution[group].total++;
    if (v.hasVoted) {
      gradeDistribution[group].voted++;
    }
  });

  if (!settings.showLiveResultsToPublic) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">QUICK COUNT SEDANG DITUTUP</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Panitia KPU OSIS {settings.schoolName} memutuskan untuk merahasiakan perolehan suara sementara hingga batas akhir waktu pemungutan suara selesai.
          </p>
          <div className="inline-block p-3 rounded-xl bg-slate-50 text-xs font-semibold text-slate-500 border border-slate-200">
            Hasil resmi akan diumumkan secara serentak pada penutupan sidang pleno.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header & Ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Live Quick Count Real-time
            </span>
            <span className="text-xs text-slate-500">• Periode {settings.periodYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            PENGHITUNGAN SUARA & REKAPITULASI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {settings.electionTitle} — {settings.schoolName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onResetVotes && (
            <button
              onClick={() => {
                if (
                  confirm(
                    'KONFIRMASI: Apakah Anda yakin ingin mengosongkan seluruh perolehan suara sah ke 0? Seluruh status siswa akan kembali menjadi BELUM MEMILIH.'
                  )
                ) {
                  onResetVotes();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Kosongkan seluruh suara sah diperoleh"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Suara Sah (0)</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Perbarui</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total DPT</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalVoters}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Hak Suara Terdaftar</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suara Masuk</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">{votedCount}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">{participationRate}% Partisipasi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum Memilih</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">{pendingCount}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Siswa Masih Antre</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partisipasi</p>
            <h3 className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">{participationRate}%</h3>
            <p className="text-[11px] text-slate-400 font-medium">Target Minimal: 75%</p>
          </div>
        </div>
      </div>

      {/* Main Candidates Vote Count Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Perolehan Suara Pasangan Calon</span>
          </h2>
          <span className="text-xs text-slate-500">
            Total {votedCount} suara sah terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidateStats.map(({ candidate, count, percentageOfCast, percentageOfTotalDpt }) => {
            const isLeading = leadingCandidate && leadingCandidate.candidate.id === candidate.id;

            return (
              <div
                key={candidate.id}
                className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm relative overflow-hidden flex flex-col justify-between ${
                  isLeading
                    ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Badge */}
                {isLeading && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase px-4 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Unggul Sementara</span>
                  </div>
                )}

                <div>
                  {/* Paslon Header & Photo */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shrink-0 shadow-md"
                      style={{ backgroundColor: candidate.accentColor || '#2563eb' }}
                    >
                      <span className="text-[10px] tracking-wider uppercase opacity-80">NO.</span>
                      <span className="text-xl leading-none">
                        {String(candidate.candidateNumber).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {candidate.chairmanName}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">& {candidate.viceChairmanName}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {candidate.chairmanClass} & {candidate.viceChairmanClass}
                      </span>
                    </div>
                  </div>

                  {/* Vote Count & Percent */}
                  <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {percentageOfCast}%
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="text-sm font-black text-blue-700">{count}</span>
                      <span>Suara Sah Diperoleh</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.max(percentageOfCast, 2)}%`,
                          backgroundColor: candidate.accentColor || '#2563eb',
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>0%</span>
                      <span>{percentageOfTotalDpt}% dari seluruh DPT</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Slogan */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs italic text-slate-500 font-medium line-clamp-1">
                    "{candidate.tagline}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Participation & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation by Level */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Tingkat Partisipasi Per Angkatan / Tingkat Kelas</span>
            </h3>
            <span className="text-xs text-slate-500">Berdasarkan data DPT</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(gradeDistribution).map(([gradeName, data]) => {
              const rate = data.total > 0 ? ((data.voted / data.total) * 100).toFixed(1) : '0';
              return (
                <div key={gradeName} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 text-sm">{gradeName}</span>
                    <span className="font-semibold text-slate-600">
                      {data.voted} dari {data.total} siswa ({rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit & Legal Guarantee Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 mb-3">
              <School className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Integritas Pemilihan</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Sistem E-Voting ini menerapkan prinsip one-student-one-vote dengan enkripsi token akses unik dan hash verifikasi digital untuk menjamin tidak adanya suara ganda.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Ketua Panitia:</span>
              <span className="font-semibold text-white truncate max-w-[150px]">{settings.chiefCommitteeName}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Pembina OSIS:</span>
              <span className="font-semibold text-white truncate max-w-[150px]">{settings.advisorName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
