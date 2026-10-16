import React, { useState, useMemo } from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../../types/election';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Trophy,
  School,
  Printer,
  TrendingUp,
  Layers,
  RefreshCw,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SCHOOL_BACKGROUND } from '../../utils/schoolAssets';
import { useToast } from '../common/Toast';

interface PublicQuickCountViewProps {
  candidates: Candidate[];
  voters: Voter[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  onRefresh?: () => void;
}

// Helper to reliably extract educational level (Kelas X, Kelas XI, Kelas XII)
export function categorizeGradeLevel(rawClass: string): string {
  const clean = (rawClass || '').trim();
  const upper = clean.toUpperCase();

  // 1. Check XII first before XI (because 'XII'.startsWith('XI') is true in JS!)
  if (
    /^(KELAS\s*)?XII(\b|[-_\s.]|[0-9]|$)/i.test(clean) ||
    /^(KELAS\s*)?12(\b|[-_\s.]|[A-Z]|$)/i.test(clean) ||
    upper.startsWith('XII')
  ) {
    return 'Kelas XII';
  }

  // 2. Check XI next (ensuring not XII)
  if (
    /^(KELAS\s*)?XI(\b|[-_\s.]|[0-9]|$)/i.test(clean) ||
    /^(KELAS\s*)?11(\b|[-_\s.]|[A-Z]|$)/i.test(clean) ||
    (upper.startsWith('XI') && !upper.startsWith('XII'))
  ) {
    return 'Kelas XI';
  }

  // 3. Check X next (ensuring not XI or XII)
  if (
    /^(KELAS\s*)?X(\b|[-_\s.]|[0-9]|$)/i.test(clean) ||
    /^(KELAS\s*)?10(\b|[-_\s.]|[A-Z]|$)/i.test(clean) ||
    (upper.startsWith('X') && !upper.startsWith('XI') && !upper.startsWith('XII'))
  ) {
    return 'Kelas X';
  }

  if (/^(GURU|TENDIK|STAFF|STAF|PEGAWAI|KARYAWAN)/i.test(clean)) {
    return 'Guru & Tendik';
  }

  return clean ? `Kelas ${clean.split(' ')[0]}` : 'Lainnya';
}

const GRADE_ORDER_WEIGHT: Record<string, number> = {
  'Kelas X': 1,
  'Kelas XI': 2,
  'Kelas XII': 3,
  'Guru & Tendik': 4,
};

export const PublicQuickCountView: React.FC<PublicQuickCountViewProps> = ({
  candidates,
  voters,
  voteRecords,
  settings,
  onRefresh,
}) => {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<'level' | 'rombel'>('level');
  const [rombelFilterLevel, setRombelFilterLevel] = useState<string>('all');

  const handleRefreshClick = () => {
    if (onRefresh) onRefresh();
    toast.success('Data Quick Count Diperbarui', 'Data perolehan suara & partisipasi telah diperbarui.');
  };

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

  // 1. Grade Level breakdown (Jenjang: Kelas X, Kelas XI, Kelas XII)
  const gradeLevelDistribution = useMemo(() => {
    const dist: Record<string, { total: number; voted: number }> = {};

    voters.forEach((v) => {
      const level = categorizeGradeLevel(v.gradeClass);
      if (!dist[level]) {
        dist[level] = { total: 0, voted: 0 };
      }
      dist[level].total++;
      if (v.hasVoted) {
        dist[level].voted++;
      }
    });

    // Ensure standard high school levels appear in consistent order
    const standardLevels = ['Kelas X', 'Kelas XI', 'Kelas XII'];
    standardLevels.forEach((lvl) => {
      if (!dist[lvl]) {
        // If no voters in that level yet, show zero
        dist[lvl] = { total: 0, voted: 0 };
      }
    });

    // Sort entries according to grade hierarchy
    return Object.entries(dist).sort(([a], [b]) => {
      const weightA = GRADE_ORDER_WEIGHT[a] ?? 50;
      const weightB = GRADE_ORDER_WEIGHT[b] ?? 50;
      if (weightA !== weightB) return weightA - weightB;
      return a.localeCompare(b);
    });
  }, [voters]);

  // 2. Individual Class Rombel breakdown (e.g. X-1, XI MIPA 1, XII IPS 1)
  const classRombelDistribution = useMemo(() => {
    const dist: Record<string, { total: number; voted: number; level: string }> = {};

    voters.forEach((v) => {
      const className = v.gradeClass || 'Umum';
      const level = categorizeGradeLevel(className);
      if (!dist[className]) {
        dist[className] = { total: 0, voted: 0, level };
      }
      dist[className].total++;
      if (v.hasVoted) {
        dist[className].voted++;
      }
    });

    return Object.entries(dist).sort(([a], [b]) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [voters]);

  const filteredRombel = useMemo(() => {
    if (rombelFilterLevel === 'all') return classRombelDistribution;
    return classRombelDistribution.filter(([, data]) => data.level === rombelFilterLevel);
  }, [classRombelDistribution, rombelFilterLevel]);

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
    <div className="relative min-h-[calc(100vh-120px)]">
      {/* Background Samar-samar Gedung SMAN 2 Samarinda */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden select-none"
        aria-hidden="true"
      >
        <img
          src={SCHOOL_BACKGROUND}
          alt="Latar Belakang Gedung SMAN 2 Samarinda"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-15 filter blur-[0.4px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-100/50 to-slate-100/85"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Top Header & Ticker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
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
            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Perbarui Data"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Perbarui Data</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Cetak Laman Quick Count"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Hasil</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total DPT</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalVoters}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Pemilih Terdaftar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suara Masuk</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{votedCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">{participationRate}% dari DPT</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum Memilih</p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Siswa Menunggu</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
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

        {/* Grade Participation & Demographics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participation by Level / Rombel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs lg:col-span-2 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Tingkat Partisipasi Per Angkatan / Tingkat Kelas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi kehadiran pemilih berdasarkan jenjang Kelas X, XI, dan XII
                </p>
              </div>

              {/* View Switcher: Per Jenjang vs Per Rombel */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('level')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'level'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Jenjang Angkatan (X, XI, XII)
                </button>
                <button
                  onClick={() => setViewMode('rombel')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'rombel'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Detail Rombel / Kelas
                </button>
              </div>
            </div>

            {/* TAB 1: Jenjang Angkatan (Kelas X, Kelas XI, Kelas XII) */}
            {viewMode === 'level' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {gradeLevelDistribution.map(([gradeName, data]) => {
                    const rate = data.total > 0 ? ((data.voted / data.total) * 100).toFixed(1) : '0';
                    const numericRate = Number(rate);

                    // Color theme per grade level
                    const colorScheme =
                      gradeName === 'Kelas X'
                        ? { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800', angkatan: 'Tingkat 10' }
                        : gradeName === 'Kelas XI'
                        ? { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800', angkatan: 'Tingkat 11' }
                        : gradeName === 'Kelas XII'
                        ? { bg: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-700', bar: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-800', angkatan: 'Tingkat 12' }
                        : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', bar: 'bg-slate-600', badge: 'bg-slate-100 text-slate-800', angkatan: 'Khusus' };

                    return (
                      <div
                        key={gradeName}
                        className={`p-4 rounded-2xl border ${colorScheme.border} ${colorScheme.bg} flex flex-col justify-between transition-all hover:shadow-xs`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-slate-900 text-base flex items-center gap-1.5">
                              <GraduationCap className={`w-4 h-4 ${colorScheme.text}`} />
                              {gradeName}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${colorScheme.badge}`}>
                              {colorScheme.angkatan}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mt-3 mb-1">
                            <div className="text-2xl font-black text-slate-900">
                              {rate}%
                            </div>
                            <div className="text-xs font-semibold text-slate-600">
                              <span className="font-bold text-slate-900">{data.voted}</span> / {data.total} siswa
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5 my-2">
                            <div
                              className={`${colorScheme.bar} h-full rounded-full transition-all duration-700`}
                              style={{ width: `${Math.max(numericRate, data.total > 0 ? 3 : 0)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
                          <span>Sisa: {data.total - data.voted} siswa</span>
                          <span>{data.total > 0 && numericRate >= 75 ? 'Target Tercapai ✓' : 'Dalam Proses'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Seluruh data siswa dari <strong>Kelas X, Kelas XI, dan Kelas XII</strong> terakomodasi dalam penghitungan DPT.</span>
                  </div>
                  <span className="font-bold text-slate-800 hidden sm:inline">SMAN 2 Samarinda</span>
                </div>
              </div>
            )}

            {/* TAB 2: Detail Per Rombongan Belajar / Kelas */}
            {viewMode === 'rombel' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Filter Tingkat:
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {['all', 'Kelas X', 'Kelas XI', 'Kelas XII'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRombelFilterLevel(lvl)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          rombelFilterLevel === lvl
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {lvl === 'all' ? 'Semua Kelas' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredRombel.map(([className, data]) => {
                    const rate = data.total > 0 ? ((data.voted / data.total) * 100).toFixed(1) : '0';
                    const numericRate = Number(rate);

                    return (
                      <div
                        key={className}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">{className}</span>
                          <span className="font-semibold text-slate-600">
                            {data.voted}/{data.total} ({rate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${numericRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Audit & Legal Guarantee Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 mb-3">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Integritas Pemilihan</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Sistem E-Voting ini menerapkan prinsip <em>one-student-one-vote</em> dengan enkripsi token akses unik dan hash verifikasi digital untuk menjamin tidak adanya suara ganda.
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
    </div>
  );
};
