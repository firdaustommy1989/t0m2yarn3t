import React, { useState } from 'react';
import { Voter, Candidate, ElectionSettings, VoteRecord } from '../../types/election';
import { resetVotingOnly, resetAllToDefault } from '../../utils/storage';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  Users,
  Vote,
  ShieldAlert,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

interface DeleteDataTabProps {
  voters: Voter[];
  candidates: Candidate[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  onUpdateVoters: (newVoters: Voter[]) => void;
  onUpdateCandidates: (newCandidates: Candidate[]) => void;
  onResetData: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DeleteDataTab: React.FC<DeleteDataTabProps> = ({
  voters,
  candidates,
  voteRecords,
  settings,
  onUpdateVoters,
  onUpdateCandidates,
  onResetData,
  onNavigateToTab,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Class delete state
  const [selectedClassToDelete, setSelectedClassToDelete] = useState<string>('');

  // Bulk select delete state
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(new Set());
  const [filterClassForSelect, setFilterClassForSelect] = useState<string>('all');

  // Modal confirm states
  const [confirmModalType, setConfirmModalType] = useState<
    'class' | 'not_voted' | 'selected' | 'clear_all_voters' | 'reset_votes' | 'candidate' | 'factory_reset' | null
  >(null);
  const [confirmInputText, setConfirmInputText] = useState('');
  const [targetCandidateIdToDelete, setTargetCandidateIdToDelete] = useState<string | null>(null);

  const uniqueClasses = Array.from(new Set(voters.map((v) => v.gradeClass))).sort();

  const votersInSelectedClass = selectedClassToDelete
    ? voters.filter((v) => v.gradeClass === selectedClassToDelete)
    : [];

  const notVotedCount = voters.filter((v) => !v.hasVoted).length;
  const votedCount = voters.filter((v) => v.hasVoted).length;

  const handleToggleSelectVoter = (id: string) => {
    setSelectedVoterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const votersForSelectView = voters.filter(
    (v) => filterClassForSelect === 'all' || v.gradeClass === filterClassForSelect
  );

  const handleSelectAllInView = () => {
    const ids = votersForSelectView.map((v) => v.id);
    const isAllSelected = ids.length > 0 && ids.every((id) => selectedVoterIds.has(id));
    if (isAllSelected) {
      setSelectedVoterIds(new Set());
    } else {
      setSelectedVoterIds(new Set(ids));
    }
  };

  // Execution: Delete class
  const executeDeleteClass = () => {
    if (!selectedClassToDelete) return;
    const updated = voters.filter((v) => v.gradeClass !== selectedClassToDelete);
    onUpdateVoters(updated);
    setSuccessMessage(`Berhasil menghapus seluruh siswa dari kelas "${selectedClassToDelete}".`);
    setSelectedClassToDelete('');
    setConfirmModalType(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Delete not voted
  const executeDeleteNotVoted = () => {
    const updated = voters.filter((v) => v.hasVoted);
    onUpdateVoters(updated);
    setSuccessMessage(`Berhasil menghapus ${notVotedCount} pemilih yang belum menggunakan hak suara.`);
    setConfirmModalType(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Delete selected
  const executeDeleteSelected = () => {
    const count = selectedVoterIds.size;
    const updated = voters.filter((v) => !selectedVoterIds.has(v.id));
    onUpdateVoters(updated);
    setSelectedVoterIds(new Set());
    setSuccessMessage(`Berhasil menghapus ${count} pemilih yang dipilih.`);
    setConfirmModalType(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Clear all voters
  const executeClearAllVoters = () => {
    onUpdateVoters([]);
    setSuccessMessage('Seluruh data DPT (Daftar Pemilih) telah dikosongkan.');
    setConfirmModalType(null);
    setConfirmInputText('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Reset voting records
  const executeResetVotes = () => {
    resetVotingOnly();
    onResetData();
    setSuccessMessage('Seluruh suara masuk telah dihapus dan kotak suara kembali 0. Data nama DPT tetap aman!');
    setConfirmModalType(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Delete Candidate
  const executeDeleteCandidate = () => {
    if (!targetCandidateIdToDelete) return;
    const cand = candidates.find((c) => c.id === targetCandidateIdToDelete);
    const updated = candidates.filter((c) => c.id !== targetCandidateIdToDelete);
    onUpdateCandidates(updated);
    setSuccessMessage(`Paslon "${cand?.chairmanName}" berhasil dihapus.`);
    setTargetCandidateIdToDelete(null);
    setConfirmModalType(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Execution: Factory reset
  const executeFactoryReset = () => {
    resetAllToDefault();
    onResetData();
    setSuccessMessage('Sistem telah dikembalikan ke setelan pabrik default.');
    setConfirmModalType(null);
    setConfirmInputText('');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                PUSAT HAPUS & PEMBERSIHAN DATA
              </span>
              <span className="text-xs text-slate-400">Panel Keamanan Admin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Hapus & Bersihkan Data Pemilihan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola penghapusan data secara spesifik, hapus pemilih per kelas, kosongkan suara masuk, atau bersihkan basis data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
              Total DPT: <strong>{voters.length}</strong>
            </span>
            <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-semibold">
              Suara Masuk: <strong>{voteRecords.length}</strong>
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* Grid of Deletion Options */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ===================== KARTU 1: RESET SUARA MASUK (QUICK COUNT) ===================== */}
          <div className="rounded-3xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Direkomendasikan Pasca Simulasi
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hapus / Reset Suara Masuk (Quick Count)
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Menghapus semua surat suara yang telah masuk (kembali ke <strong>0 suara</strong>), dan mengubah
                  status semua pemilih menjadi <strong>Belum Memilih</strong>.
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>Suara tersimpan saat ini:</span>
                  <strong className="text-blue-900">{voteRecords.length} suara</strong>
                </div>
                <div className="flex justify-between">
                  <span>Pemilih berstatus 'Sudah Memilih':</span>
                  <strong className="text-blue-900">{votedCount} siswa</strong>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  ✓ Daftar nama siswa di DPT tetap aman dan TIDAK terhapus.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-blue-100">
              <button
                onClick={() => setConfirmModalType('reset_votes')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset & Kosongkan Kotak Suara</span>
              </button>
            </div>
          </div>

          {/* ===================== KARTU 2: HAPUS PEMILIH PER KELAS ===================== */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hapus Pemilih Berdasarkan Kelas
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Menghapus seluruh siswa dari satu rombongan belajar / kelas tertentu (contoh: menghapus kelas XII yang telah lulus).
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Pilih Kelas:</label>
                <select
                  value={selectedClassToDelete}
                  onChange={(e) => setSelectedClassToDelete(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="">-- Pilih Kelas yang Ingin Dihapus --</option>
                  {uniqueClasses.map((cls) => {
                    const count = voters.filter((v) => v.gradeClass === cls).length;
                    return (
                      <option key={cls} value={cls}>
                        {cls} ({count} siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedClassToDelete && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                  Terpilih <strong>{votersInSelectedClass.length} siswa</strong> di kelas "{selectedClassToDelete}".
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                disabled={!selectedClassToDelete || votersInSelectedClass.length === 0}
                onClick={() => setConfirmModalType('class')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Siswa di Kelas Ini ({votersInSelectedClass.length})</span>
              </button>
            </div>
          </div>

          {/* ===================== KARTU 3: HAPUS PEMILIH BELUM MEMILIH ===================== */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hapus Pemilih Belum Hadir / Belum Memilih
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Menghapus siswa yang belum mencoblos hingga pemilihan berakhir untuk memutakhirkan persentase partisipasi final.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>Jumlah siswa belum memilih:</span>
                  <strong className="text-rose-700">{notVotedCount} siswa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah siswa sudah memilih:</span>
                  <strong className="text-emerald-700">{votedCount} siswa (Aman)</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                disabled={notVotedCount === 0}
                onClick={() => setConfirmModalType('not_voted')}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Pemilih Belum Memilih ({notVotedCount})</span>
              </button>
            </div>
          </div>

          {/* ===================== KARTU 4: KOSONGKAN SELURUH DPT ===================== */}
          <div className="rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-slate-50 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Tindakan Permanen
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Kosongkan Seluruh Data DPT
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Menghapus <strong>100% data pemilih</strong> dari tabel DPT. Gunakan ini sebelum Anda mengunggah berkas DPT baru tahun ajaran baru.
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-rose-100 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Total pemilih yang akan dihapus:</span>
                  <strong className="text-rose-700 font-bold">{voters.length} siswa</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-rose-100">
              <button
                disabled={voters.length === 0}
                onClick={() => {
                  setConfirmInputText('');
                  setConfirmModalType('clear_all_voters');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Seluruh DPT ({voters.length} Pemilih)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 2: HAPUS KANDIDAT PASLON ===================== */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Vote className="w-4 h-4 text-slate-600" />
            Hapus Pasangan Calon (Kandidat)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih pasangan calon yang ingin dihapus jika paslon mengundurkan diri atau dibatalkan:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: cand.accentColor }}
                  >
                    {String(cand.candidateNumber).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {cand.chairmanName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      & {cand.viceChairmanName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetCandidateIdToDelete(cand.id);
                    setConfirmModalType('candidate');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200/60"
                  title="Hapus kandidat ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== SECTION 3: FACTORY RESET ===================== */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RESET TOTAL
                </span>
                <span className="text-xs text-slate-400">Kembali ke Pengaturan Default</span>
              </div>
              <h4 className="text-sm font-bold mt-1">Kembalikan Sistem ke Setelan Pabrik</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Mengembalikan DPT contoh, 3 paslon default SMAN 2 Samarinda, dan mengosongkan suara.
              </p>
            </div>

            <button
              onClick={() => {
                setConfirmInputText('');
                setConfirmModalType('factory_reset');
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition cursor-pointer shadow-sm"
            >
              Reset ke Setelan Pabrik
            </button>
          </div>
        </div>
      </div>

      {/* ======================= MODAL KONFIRMASI KEAMANAN ======================= */}
      {confirmModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Penghapusan</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            {/* Context message */}
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {confirmModalType === 'class' && (
                <p>
                  Apakah Anda yakin ingin menghapus semua siswa di kelas{' '}
                  <strong className="text-slate-900">"{selectedClassToDelete}"</strong> (sejumlah{' '}
                  <strong>{votersInSelectedClass.length} siswa</strong>)?
                </p>
              )}
              {confirmModalType === 'not_voted' && (
                <p>
                  Apakah Anda yakin ingin menghapus{' '}
                  <strong className="text-slate-900">{notVotedCount} siswa</strong> yang belum menggunakan hak
                  suara?
                </p>
              )}
              {confirmModalType === 'reset_votes' && (
                <p>
                  Apakah Anda yakin ingin mengosongkan kotak suara? Seluruh{' '}
                  <strong className="text-slate-900">{voteRecords.length} suara masuk</strong> akan dihapus dan
                  perhitungan quick count kembali ke 0.
                </p>
              )}
              {confirmModalType === 'candidate' && (
                <p>
                  Apakah Anda yakin ingin menghapus pasangan calon ini dari surat suara?
                </p>
              )}
              {confirmModalType === 'clear_all_voters' && (
                <div className="space-y-2">
                  <p className="text-rose-700 font-bold">
                    PERINGATAN: Seluruh {voters.length} data pemilih DPT akan dihapus total!
                  </p>
                  <p>
                    Ketik teks <strong>HAPUS DPT</strong> di bawah ini untuk konfirmasi:
                  </p>
                  <input
                    type="text"
                    value={confirmInputText}
                    onChange={(e) => setConfirmInputText(e.target.value)}
                    placeholder="Ketik HAPUS DPT"
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>
              )}
              {confirmModalType === 'factory_reset' && (
                <div className="space-y-2">
                  <p className="text-rose-700 font-bold">
                    PERINGATAN: Seluruh sistem akan di-reset ke setelan awal default!
                  </p>
                  <p>
                    Ketik teks <strong>RESET TOTAL</strong> di bawah ini untuk konfirmasi:
                  </p>
                  <input
                    type="text"
                    value={confirmInputText}
                    onChange={(e) => setConfirmInputText(e.target.value)}
                    placeholder="Ketik RESET TOTAL"
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmModalType(null);
                  setConfirmInputText('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  (confirmModalType === 'clear_all_voters' && confirmInputText !== 'HAPUS DPT') ||
                  (confirmModalType === 'factory_reset' && confirmInputText !== 'RESET TOTAL')
                }
                onClick={() => {
                  if (confirmModalType === 'class') executeDeleteClass();
                  else if (confirmModalType === 'not_voted') executeDeleteNotVoted();
                  else if (confirmModalType === 'reset_votes') executeResetVotes();
                  else if (confirmModalType === 'candidate') executeDeleteCandidate();
                  else if (confirmModalType === 'clear_all_voters') executeClearAllVoters();
                  else if (confirmModalType === 'factory_reset') executeFactoryReset();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
