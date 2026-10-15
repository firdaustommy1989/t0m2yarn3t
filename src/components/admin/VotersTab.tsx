import React, { useState, useRef } from 'react';
import { Voter, ElectionSettings } from '../../types/election';
import { parseVotersCSV, generateCSVTemplate, downloadCSV, exportVotersToCSV, ParseCSVResult } from '../../utils/csvHelper';
import { generateToken, saveVoters } from '../../utils/storage';
import { PrintVoterTokensModal } from './PrintVoterTokensModal';
import {
  Upload,
  UserPlus,
  Download,
  Printer,
  Search,
  Filter,
  Trash2,
  Edit2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  CheckSquare,
  X,
  FileText,
  Vote,
  BarChart3
} from 'lucide-react';

interface VotersTabProps {
  voters: Voter[];
  settings: ElectionSettings;
  onUpdateVoters: (newVoters: Voter[]) => void;
  onOpenVoterView?: () => void;
  onOpenPublicView?: () => void;
}

export const VotersTab: React.FC<VotersTabProps> = ({
  voters,
  settings,
  onUpdateVoters,
  onOpenVoterView,
  onOpenPublicView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'voted' | 'not_voted'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<'selected' | 'filtered' | 'all'>('selected');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintTokensOpen, setIsPrintTokensOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);

  // CSV Upload state
  const [csvRawText, setCsvRawText] = useState('');
  const [parseResult, setParseResult] = useState<ParseCSVResult | null>(null);
  const [replaceExistingOnUpload, setReplaceExistingOnUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Add Form State
  const [manualForm, setManualForm] = useState({
    nisn: '',
    name: '',
    gradeClass: '',
    token: '',
  });

  const classes = Array.from(new Set(voters.map((v) => v.gradeClass))).sort();

  // Filtered voters
  const filteredVoters = voters.filter((voter) => {
    const matchSearch =
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.nisn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'voted'
        ? voter.hasVoted
        : !voter.hasVoted;
    const matchGrade = gradeFilter === 'all' || voter.gradeClass === gradeFilter;

    return matchSearch && matchStatus && matchGrade;
  });

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const notVotedCount = totalVoters - votedCount;

  // Copy token to clipboard
  const handleCopyToken = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Bulk selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedVoterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredVoters.map((v) => v.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedVoterIds.has(id));
    setSelectedVoterIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedVoterIds(new Set());
  };

  const handleOpenBulkDelete = (target: 'selected' | 'filtered' | 'all') => {
    setBulkDeleteTarget(target);
    setIsBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    let idsToDelete = new Set<string>();
    if (bulkDeleteTarget === 'selected') {
      idsToDelete = new Set(selectedVoterIds);
    } else if (bulkDeleteTarget === 'filtered') {
      idsToDelete = new Set(filteredVoters.map((v) => v.id));
    } else if (bulkDeleteTarget === 'all') {
      idsToDelete = new Set(voters.map((v) => v.id));
    }

    const updated = voters.filter((v) => !idsToDelete.has(v.id));
    onUpdateVoters(updated);
    setSelectedVoterIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  // CSV File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      const res = parseVotersCSV(content, voters);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleParseTextPaste = () => {
    if (!csvRawText.trim()) return;
    const res = parseVotersCSV(csvRawText, voters);
    setParseResult(res);
  };

  const handleCommitUpload = () => {
    if (!parseResult || parseResult.voters.length === 0) return;
    if (replaceExistingOnUpload) {
      onUpdateVoters(parseResult.voters);
    } else {
      const existingNisns = new Set(voters.map((v) => v.nisn.toLowerCase()));
      const newOnly = parseResult.voters.filter((v) => !existingNisns.has(v.nisn.toLowerCase()));
      onUpdateVoters([...voters, ...newOnly]);
    }
    setIsUploadModalOpen(false);
    setCsvRawText('');
    setParseResult(null);
    setReplaceExistingOnUpload(false);
  };

  // Add Manual Voter
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.nisn.trim() || !manualForm.name.trim()) return;

    const newVoter: Voter = {
      id: `voter_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nisn: manualForm.nisn.trim(),
      name: manualForm.name.trim(),
      gradeClass: manualForm.gradeClass.trim() || 'Umum',
      token: manualForm.token.trim() || generateToken(),
      hasVoted: false,
    };

    onUpdateVoters([...voters, newVoter]);
    setManualForm({ nisn: '', name: '', gradeClass: '', token: '' });
    setIsAddModalOpen(false);
  };

  // Edit Voter
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;

    const updated = voters.map((v) => (v.id === editingVoter.id ? editingVoter : v));
    onUpdateVoters(updated);
    setEditingVoter(null);
  };

  // Delete Voter
  const handleDeleteVoter = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pemilih ini dari DPT?')) {
      const updated = voters.filter((v) => v.id !== id);
      onUpdateVoters(updated);
    }
  };

  // Reset Single Voter Status
  const handleResetVoterStatus = (id: string) => {
    if (confirm('Reset status pemilih ini menjadi BELUM MEMILIH? Token akan tetap dapat digunakan kembali.')) {
      const updated = voters.map((v) =>
        v.id === id
          ? { ...v, hasVoted: false, votedAt: undefined, receiptCode: undefined }
          : v
      );
      onUpdateVoters(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Stat Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Statistics Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            Total DPT: <strong className="text-slate-900">{totalVoters}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
            Sudah Memilih: <strong>{votedCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 shadow-2xs">
            Belum Memilih: <strong>{notVotedCount}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Bulk Delete Button when items are selected */}
          {selectedVoterIds.size > 0 && (
            <button
              onClick={() => handleOpenBulkDelete('selected')}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Terpilih ({selectedVoterIds.size})</span>
            </button>
          )}

          <button
            onClick={() => handleOpenBulkDelete('all')}
            className="px-3 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Hapus massal atau kosongkan DPT"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Massal / Kosongkan</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Data (CSV / Excel)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Tambah Manual</span>
          </button>

          <button
            onClick={() => setIsPrintTokensOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Cetak Kartu Token</span>
          </button>

          <button
            onClick={() => downloadCSV(`DPT_OSIS_${settings.schoolName.replace(/\s+/g, '_')}.csv`, exportVotersToCSV(voters))}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV DPT"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Notification Bar */}
      {selectedVoterIds.size > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{selectedVoterIds.size} siswa pemilih dipilih</span>
            <span className="text-slate-500 font-normal">
              (dari total {filteredVoters.length} pemilih yang ditampilkan)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 font-semibold transition-colors cursor-pointer"
            >
              {filteredVoters.length > 0 && filteredVoters.every((v) => selectedVoterIds.has(v.id))
                ? 'Batal Pilih Semua yang Tampil'
                : `Pilih Semua (${filteredVoters.length})`}
            </button>

            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Batalkan Pilihan
            </button>

            <button
              type="button"
              onClick={() => handleOpenBulkDelete('selected')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Massal ({selectedVoterIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama pemilih atau NIS/NISN..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="not_voted">Belum Memilih</option>
            <option value="voted">Sudah Memilih</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredVoters.length > 0 && filteredVoters.every((v) => selectedVoterIds.has(v.id))}
                    onChange={handleSelectAllFiltered}
                    title="Pilih semua pemilih yang tampil"
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">NISN / NIS</th>
                <th className="p-3.5">Nama Pemilih</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Token Akses</th>
                <th className="p-3.5">Status Hak Suara</th>
                <th className="p-3.5">Waktu Pencoblosan</th>
                <th className="p-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoters.map((voter, index) => {
                const isSelected = selectedVoterIds.has(voter.id);
                return (
                  <tr
                    key={voter.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(voter.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="p-3 font-mono font-semibold text-slate-800">{voter.nisn}</td>
                    <td className="p-3 font-bold text-slate-900">{voter.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {voter.gradeClass}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        <span>{voter.token}</span>
                        <button
                          onClick={() => handleCopyToken(voter.id, voter.token)}
                          className="text-slate-400 hover:text-blue-700"
                          title="Salin Token"
                        >
                          {copiedTokenId === voter.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      {voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sudah Memilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          Belum Memilih
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {voter.votedAt ? (
                        <div>
                          <div>{voter.votedAt}</div>
                          <span className="text-[10px] text-blue-600">{voter.receiptCode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingVoter(voter)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Edit Pemilih"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {voter.hasVoted && (
                          <button
                            onClick={() => handleResetVoterStatus(voter.id)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                            title="Reset Hak Suara"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteVoter(voter.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Pemilih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                    Tidak ada data pemilih yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD DATA CSV / EXCEL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Upload Data Pemilih (DPT)</h3>
                  <p className="text-xs text-slate-500">Impor daftar siswa secara massal menggunakan file CSV atau tempel tabel</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setParseResult(null);
                  setCsvRawText('');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="text-blue-900 font-medium">
                  Unduh template format file CSV contoh (NISN, Nama, Kelas, Token Opsional)
                </span>
              </div>
              <button
                type="button"
                onClick={() => downloadCSV('Template_DPT_Pemilih.csv', generateCSVTemplate())}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template</span>
              </button>
            </div>

            {/* Input options */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  1. Pilih File CSV / TXT
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="text-center text-xs text-slate-400 font-bold uppercase">— ATAU TEMPELKAN TEKS / TABEL EXCEL DI SINI —</div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  2. Salin-Tempel (Paste) Baris Data Siswa
                </label>
                <textarea
                  rows={4}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`20241021,Ahmad Fadhil,X-1\n20241022,Bella Citra,XI MIPA 2\n20241023,Calvin Pratama,XII IPS 1`}
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleParseTextPaste}
                  className="mt-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Periksa & Uji Format Teks
                </button>
              </div>
            </div>

            {/* Parse Result Summary */}
            {parseResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Hasil Pemindaian:</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="font-semibold text-emerald-700">
                    ✓ {parseResult.addedCount} Siswa siap ditambahkan
                  </span>
                  {parseResult.duplicateCount > 0 && (
                    <span className="font-semibold text-amber-700">
                      ⚠ {parseResult.duplicateCount} NISN duplikat diabaikan
                    </span>
                  )}
                  {parseResult.errors.length > 0 && (
                    <span className="font-semibold text-rose-700">
                      ✕ {parseResult.errors.length} Baris gagal
                    </span>
                  )}
                </div>

                {parseResult.voters.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {parseResult.voters.slice(0, 5).map((v, i) => (
                      <div key={i} className="text-slate-600 font-mono text-[11px] bg-white p-1 rounded border border-slate-200">
                        {v.nisn} - {v.name} ({v.gradeClass}) → Token: {v.token}
                      </div>
                    ))}
                    {parseResult.voters.length > 5 && (
                      <p className="text-[11px] text-slate-500 italic">
                        ...dan {parseResult.voters.length - 5} pemilih lainnya.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Import Option & Bulk Delete in Upload Modal */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={replaceExistingOnUpload}
                  onChange={(e) => setReplaceExistingOnUpload(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Hapus & Gantikan seluruh DPT lama dengan data baru yang di-upload</span>
              </label>
              <p className="text-[11px] text-slate-500">
                {replaceExistingOnUpload
                  ? 'Perhatian: Seluruh data pemilih lama akan dihapus dan diganti dengan data file yang diupload.'
                  : `Data baru akan digabungkan dengan ${voters.length} pemilih yang sudah ada (NISN duplikat diabaikan).`}
              </p>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              <div>
                {voters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Apakah Anda yakin ingin MENGHAPUS MASSAL SELURUH ${voters.length} pemilih DPT yang ada sekarang? Tindakan ini tidak dapat dibatalkan.`
                        )
                      ) {
                        onUpdateVoters([]);
                        setSelectedVoterIds(new Set());
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Massal DPT ({voters.length} Siswa)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setParseResult(null);
                    setReplaceExistingOnUpload(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!parseResult || parseResult.voters.length === 0}
                  onClick={handleCommitUpload}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  {replaceExistingOnUpload ? 'Ganti & Simpan' : 'Simpan ke DPT'} ({parseResult?.voters.length || 0} Siswa)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MANUAL VOTER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Tambah Pemilih Manual</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">NIS / NISN</label>
                <input
                  type="text"
                  required
                  value={manualForm.nisn}
                  onChange={(e) => setManualForm({ ...manualForm, nisn: e.target.value })}
                  placeholder="Contoh: 20241099"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="Contoh: Muhammad Ilham"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kelas / Tingkat</label>
                <input
                  type="text"
                  required
                  value={manualForm.gradeClass}
                  onChange={(e) => setManualForm({ ...manualForm, gradeClass: e.target.value })}
                  placeholder="Contoh: XI MIPA 3"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Token Akses (Kosongkan untuk acak otomatis)
                </label>
                <input
                  type="text"
                  value={manualForm.token}
                  onChange={(e) => setManualForm({ ...manualForm, token: e.target.value.toUpperCase() })}
                  placeholder="Contoh: TKN-999"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Pemilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VOTER MODAL */}
      {editingVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Edit Data Pemilih</h3>
              <button onClick={() => setEditingVoter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">NIS / NISN</label>
                <input
                  type="text"
                  required
                  value={editingVoter.nisn}
                  onChange={(e) => setEditingVoter({ ...editingVoter, nisn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Siswa</label>
                <input
                  type="text"
                  required
                  value={editingVoter.name}
                  onChange={(e) => setEditingVoter({ ...editingVoter, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                <input
                  type="text"
                  required
                  value={editingVoter.gradeClass}
                  onChange={(e) => setEditingVoter({ ...editingVoter, gradeClass: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Token Akses</label>
                <input
                  type="text"
                  required
                  value={editingVoter.token}
                  onChange={(e) => setEditingVoter({ ...editingVoter, token: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVoter(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Konfirmasi Hapus Massal DPT</h3>
                  <p className="text-xs text-slate-500">Pilih cakupan pemilih yang ingin dihapus</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Options Radio Cards */}
            <div className="space-y-2.5 text-xs">
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  bulkDeleteTarget === 'selected'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bulk_delete_target"
                  checked={bulkDeleteTarget === 'selected'}
                  onChange={() => setBulkDeleteTarget('selected')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Hapus Pemilih yang Dicentang ({selectedVoterIds.size} Siswa)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Hanya menghapus siswa yang telah Anda centang pada tabel DPT.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  bulkDeleteTarget === 'filtered'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bulk_delete_target"
                  checked={bulkDeleteTarget === 'filtered'}
                  onChange={() => setBulkDeleteTarget('filtered')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Hapus Hasil Filter Saat Ini ({filteredVoters.length} Siswa)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Menghapus seluruh siswa yang cocok dengan kata kunci pencarian atau filter kelas/status saat ini.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  bulkDeleteTarget === 'all'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bulk_delete_target"
                  checked={bulkDeleteTarget === 'all'}
                  onChange={() => setBulkDeleteTarget('all')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Kosongkan Seluruh DPT ({totalVoters} Siswa)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Menghapus seluruh daftar pemilih tetap di sekolah. Gunakan opsi ini jika ingin mengunggah ulang data baru dari nol.
                  </span>
                </div>
              </label>
            </div>

            {/* Warning Message */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Perhatian:</strong> Tindakan ini akan menghapus data pemilih dan token akses terkait secara permanen. Siswa yang dihapus tidak akan dapat masuk ke bilik suara.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batalkan
              </button>

              <button
                type="button"
                disabled={
                  (bulkDeleteTarget === 'selected' && selectedVoterIds.size === 0) ||
                  (bulkDeleteTarget === 'filtered' && filteredVoters.length === 0) ||
                  (bulkDeleteTarget === 'all' && totalVoters === 0)
                }
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {bulkDeleteTarget === 'selected'
                    ? `Hapus ${selectedVoterIds.size} Siswa`
                    : bulkDeleteTarget === 'filtered'
                    ? `Hapus ${filteredVoters.length} Siswa`
                    : `Kosongkan Seluruh DPT (${totalVoters})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VOTER TOKEN SLIPS */}
      {isPrintTokensOpen && (
        <PrintVoterTokensModal
          voters={voters}
          settings={settings}
          onClose={() => setIsPrintTokensOpen(false)}
        />
      )}
    </div>
  );
};
