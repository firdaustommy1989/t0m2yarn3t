import React, { useState } from 'react';
import { Voter, Candidate, ElectionSettings } from '../../types/election';
import { generateToken } from '../../utils/storage';
import {
  Edit2,
  Users,
  Vote,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  X,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  School,
  Calendar,
  Lock
} from 'lucide-react';

interface EditDataTabProps {
  voters: Voter[];
  candidates: Candidate[];
  settings: ElectionSettings;
  onUpdateVoters: (newVoters: Voter[]) => void;
  onUpdateCandidates: (newCandidates: Candidate[]) => void;
  onUpdateSettings: (newSettings: ElectionSettings) => void;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
];

export const EditDataTab: React.FC<EditDataTabProps> = ({
  voters,
  candidates,
  settings,
  onUpdateVoters,
  onUpdateCandidates,
  onUpdateSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'voters' | 'candidates' | 'settings'>('voters');

  // Voter editing state
  const [voterSearch, setVoterSearch] = useState('');
  const [voterClassFilter, setVoterClassFilter] = useState('all');
  const [voterStatusFilter, setVoterStatusFilter] = useState<'all' | 'voted' | 'not_voted'>('all');
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [voterSuccessMsg, setVoterSuccessMsg] = useState<string | null>(null);

  // Candidate editing state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    candidates.length > 0 ? candidates[0].id : ''
  );
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(() => {
    return candidates.length > 0 ? { ...candidates[0] } : null;
  });
  const [candidateSuccessMsg, setCandidateSuccessMsg] = useState<string | null>(null);

  // Settings editing state
  const [formSettings, setFormSettings] = useState<ElectionSettings>({ ...settings });
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // Filtered Voters
  const uniqueClasses = Array.from(new Set(voters.map((v) => v.gradeClass))).sort();

  const filteredVoters = voters.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.nisn.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.gradeClass.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.token.toLowerCase().includes(voterSearch.toLowerCase());

    const matchesClass = voterClassFilter === 'all' || v.gradeClass === voterClassFilter;

    const matchesStatus =
      voterStatusFilter === 'all'
        ? true
        : voterStatusFilter === 'voted'
        ? v.hasVoted
        : !v.hasVoted;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Handle Save Voter Edit
  const handleSaveVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;

    const updated = voters.map((v) => (v.id === editingVoter.id ? editingVoter : v));
    onUpdateVoters(updated);
    setVoterSuccessMsg(`Data pemilih "${editingVoter.name}" berhasil diperbarui!`);
    setEditingVoter(null);
    setTimeout(() => setVoterSuccessMsg(null), 3500);
  };

  // Handle Save Candidate Edit
  const handleSelectCandidateToEdit = (c: Candidate) => {
    setSelectedCandidateId(c.id);
    setEditingCandidate({ ...c });
    setCandidateSuccessMsg(null);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    const updated = candidates.map((c) =>
      c.id === editingCandidate.id ? editingCandidate : c
    );
    onUpdateCandidates(updated);
    setCandidateSuccessMsg(
      `Data Paslon No. ${editingCandidate.candidateNumber} (${editingCandidate.chairmanName}) berhasil disimpan!`
    );
    setTimeout(() => setCandidateSuccessMsg(null), 3500);
  };

  // Missions & Work Programs Helpers
  const handleAddMission = () => {
    if (!editingCandidate) return;
    setEditingCandidate({
      ...editingCandidate,
      missions: [...editingCandidate.missions, ''],
    });
  };

  const handleUpdateMission = (index: number, val: string) => {
    if (!editingCandidate) return;
    const copy = [...editingCandidate.missions];
    copy[index] = val;
    setEditingCandidate({ ...editingCandidate, missions: copy });
  };

  const handleRemoveMission = (index: number) => {
    if (!editingCandidate) return;
    const copy = editingCandidate.missions.filter((_, i) => i !== index);
    setEditingCandidate({ ...editingCandidate, missions: copy });
  };

  const handleAddProgram = () => {
    if (!editingCandidate) return;
    setEditingCandidate({
      ...editingCandidate,
      workPrograms: [...editingCandidate.workPrograms, ''],
    });
  };

  const handleUpdateProgram = (index: number, val: string) => {
    if (!editingCandidate) return;
    const copy = [...editingCandidate.workPrograms];
    copy[index] = val;
    setEditingCandidate({ ...editingCandidate, workPrograms: copy });
  };

  const handleRemoveProgram = (index: number) => {
    if (!editingCandidate) return;
    const copy = editingCandidate.workPrograms.filter((_, i) => i !== index);
    setEditingCandidate({ ...editingCandidate, workPrograms: copy });
  };

  // Handle Save Settings Edit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSettingsSuccessMsg('Pengaturan dan informasi pemilihan berhasil disimpan!');
    setTimeout(() => setSettingsSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-menu Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                PUSAT EDIT DATA ADMIN
              </span>
              <span className="text-xs text-slate-400">SMAN 2 Samarinda</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Edit & Perbarui Data Pemilihan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilih kategori data yang ingin diedit: data pemilih (DPT), profil paslon kandidat, atau info jadwal pemilihan.
            </p>
          </div>

          {/* Sub-menu Pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
            <button
              onClick={() => setActiveSubTab('voters')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'voters'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Edit Pemilih ({voters.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('candidates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'candidates'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Vote className="w-4 h-4" />
              <span>Edit Paslon ({candidates.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Edit Info & Jadwal</span>
            </button>
          </div>
        </div>

        {/* ======================= SUB-TAB: EDIT PEMILIH (DPT) ======================= */}
        {activeSubTab === 'voters' && (
          <div className="pt-6 space-y-5">
            {voterSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{voterSuccessMsg}</span>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama Siswa, NISN, Kelas, atau Token..."
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={voterClassFilter}
                  onChange={(e) => setVoterClassFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="all">Semua Kelas ({uniqueClasses.length})</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>

                <select
                  value={voterStatusFilter}
                  onChange={(e) => setVoterStatusFilter(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="not_voted">Belum Memilih</option>
                  <option value="voted">Sudah Memilih</option>
                </select>
              </div>
            </div>

            {/* Voters List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Daftar Pemilih ({filteredVoters.length} ditemukan)</span>
                <span className="text-slate-400 font-normal">Klik tombol "Edit" di baris siswa untuk mengubah data</span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/70 text-slate-600 font-semibold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Token Akses</th>
                      <th className="py-2.5 px-3">Status Hak Suara</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVoters.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Tidak ada data pemilih yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredVoters.slice(0, 100).map((voter, index) => (
                        <tr key={voter.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{voter.nisn}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{voter.name}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">{voter.gradeClass}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200">
                              {voter.token}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {voter.hasVoted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Sudah Memilih
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                                <Clock className="w-3 h-3" /> Belum Memilih
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setEditingVoter({ ...voter })}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer border border-blue-200/60"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredVoters.length > 100 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
                  Menampilkan 100 dari {filteredVoters.length} pemilih. Gunakan pencarian untuk menemukan siswa spesifik.
                </div>
              )}
            </div>

            {/* Modal Edit Voter */}
            {editingVoter && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Edit2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Edit Data Pemilih (DPT)</h3>
                        <p className="text-xs text-slate-400">ID: {editingVoter.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingVoter(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveVoter} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap Siswa:
                      </label>
                      <input
                        type="text"
                        required
                        value={editingVoter.name}
                        onChange={(e) =>
                          setEditingVoter({ ...editingVoter, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor NISN:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingVoter.nisn}
                          onChange={(e) =>
                            setEditingVoter({ ...editingVoter, nisn: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kelas / Tingkatan:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingVoter.gradeClass}
                          onChange={(e) =>
                            setEditingVoter({ ...editingVoter, gradeClass: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Token Akses Bilik Suara:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingVoter.token}
                          onChange={(e) =>
                            setEditingVoter({ ...editingVoter, token: e.target.value.toUpperCase() })
                          }
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider focus:outline-hidden focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingVoter({ ...editingVoter, token: generateToken() })
                          }
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Acak Baru</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Status Hak Suara:
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="voterStatus"
                            checked={!editingVoter.hasVoted}
                            onChange={() =>
                              setEditingVoter({
                                ...editingVoter,
                                hasVoted: false,
                                votedAt: undefined,
                                receiptCode: undefined,
                              })
                            }
                            className="text-blue-600"
                          />
                          <span>Belum Memilih</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="voterStatus"
                            checked={editingVoter.hasVoted}
                            onChange={() =>
                              setEditingVoter({
                                ...editingVoter,
                                hasVoted: true,
                                votedAt: editingVoter.votedAt || new Date().toISOString(),
                              })
                            }
                            className="text-blue-600"
                          />
                          <span>Sudah Memilih</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingVoter(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= SUB-TAB: EDIT KANDIDAT PASLON ======================= */}
        {activeSubTab === 'candidates' && (
          <div className="pt-6 space-y-6">
            {candidateSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{candidateSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Select Candidate to Edit */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Pilih Paslon untuk Diedit</h3>
                <div className="space-y-2.5">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCandidateToEdit(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        selectedCandidateId === c.id
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-12 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100"
                        style={{ borderTop: `4px solid ${c.accentColor}` }}
                      >
                        <img src={c.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: c.accentColor }}
                          >
                            NO. {String(c.candidateNumber).padStart(2, '0')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                          {c.chairmanName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">& {c.viceChairmanName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Form */}
              {editingCandidate && (
                <div className="lg:col-span-2 bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      Formulir Edit Paslon No. {editingCandidate.candidateNumber}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Tema:{' '}
                      <span
                        className="inline-block w-3 h-3 rounded-full align-middle ml-1"
                        style={{ backgroundColor: editingCandidate.accentColor }}
                      ></span>
                    </span>
                  </div>

                  <form onSubmit={handleSaveCandidate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor Urut:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          required
                          value={editingCandidate.candidateNumber}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              candidateNumber: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Warna Aksen Paslon:
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setEditingCandidate({ ...editingCandidate, accentColor: color })
                              }
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                editingCandidate.accentColor === color
                                  ? 'scale-115 border-slate-900 shadow-xs'
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chairman Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Calon Ketua:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCandidate.chairmanName}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              chairmanName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kelas Calon Ketua:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCandidate.chairmanClass}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              chairmanClass: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* Vice Chairman Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Calon Wakil:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCandidate.viceChairmanName}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              viceChairmanName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kelas Calon Wakil:
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCandidate.viceChairmanClass}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              viceChairmanClass: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Slogan / Tagline Paslon:
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCandidate.tagline}
                        onChange={(e) =>
                          setEditingCandidate({
                            ...editingCandidate,
                            tagline: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    {/* Vision */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Visi Paslon:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={editingCandidate.vision}
                        onChange={(e) =>
                          setEditingCandidate({
                            ...editingCandidate,
                            vision: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    {/* Missions */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Poin Misi:</label>
                        <button
                          type="button"
                          onClick={handleAddMission}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Misi
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editingCandidate.missions.map((m, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={m}
                              onChange={(e) => handleUpdateMission(idx, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              placeholder={`Misi ${idx + 1}`}
                            />
                            {editingCandidate.missions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMission(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work Programs */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Program Kerja Unggulan:
                        </label>
                        <button
                          type="button"
                          onClick={handleAddProgram}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Proker
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editingCandidate.workPrograms.map((prog, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={prog}
                              onChange={(e) => handleUpdateProgram(idx, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              placeholder={`Program ${idx + 1}`}
                            />
                            {editingCandidate.workPrograms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProgram(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Paslon</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= SUB-TAB: EDIT INFO & JADWAL ======================= */}
        {activeSubTab === 'settings' && (
          <div className="pt-6 space-y-6">
            {settingsSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{settingsSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-3xl">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600" />
                  Identitas Sekolah & Pemilihan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Sekolah:
                    </label>
                    <input
                      type="text"
                      required
                      value={formSettings.schoolName}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, schoolName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Pemilihan:
                    </label>
                    <input
                      type="text"
                      required
                      value={formSettings.electionTitle}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, electionTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Periode Tahun:
                    </label>
                    <input
                      type="text"
                      required
                      value={formSettings.periodYear}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, periodYear: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Sekolah:
                    </label>
                    <input
                      type="text"
                      value={formSettings.schoolAddress}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, schoolAddress: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Jadwal Waktu Pemungutan Suara
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Waktu Mulai:
                    </label>
                    <input
                      type="text"
                      value={formSettings.startDate}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, startDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      placeholder="08:00 WITA"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Waktu Selesai:
                    </label>
                    <input
                      type="text"
                      value={formSettings.endDate}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, endDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      placeholder="14:00 WITA"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Kata Sandi Administrator (Passcode Admin)
                </h3>

                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passcode Akses Panel Admin:
                  </label>
                  <input
                    type="text"
                    required
                    value={formSettings.adminPasscode}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, adminPasscode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan passcode ini saat masuk ke halaman portal admin OSIS.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Pengaturan</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
