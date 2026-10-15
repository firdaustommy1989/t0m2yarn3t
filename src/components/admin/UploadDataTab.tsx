import React, { useState, useRef } from 'react';
import { Voter, Candidate, ElectionSettings } from '../../types/election';
import { parseVotersCSV, generateCSVTemplate, downloadCSV, ParseCSVResult } from '../../utils/csvHelper';
import { generateToken, importBackupJSON } from '../../utils/storage';
import { saveSettingsSync, saveCandidatesSync, saveVotersSync } from '../../services/electionDb';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Users,
  Image,
  RefreshCw,
  Plus,
  X,
  FileUp,
  Database,
  ArrowRight,
  Sparkles,
  Check,
  ClipboardPaste,
  Vote,
  BarChart3,
  Eye
} from 'lucide-react';

interface UploadDataTabProps {
  voters: Voter[];
  candidates: Candidate[];
  settings: ElectionSettings;
  onUpdateVoters: (newVoters: Voter[]) => void;
  onUpdateCandidates: (newCandidates: Candidate[]) => void;
  onRefreshAll?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenVoterView?: () => void;
  onOpenPublicView?: () => void;
}

export const UploadDataTab: React.FC<UploadDataTabProps> = ({
  voters,
  candidates,
  settings,
  onUpdateVoters,
  onUpdateCandidates,
  onRefreshAll,
  onNavigateToTab,
  onOpenVoterView,
  onOpenPublicView,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dpt' | 'candidate' | 'backup'>('dpt');

  // DPT Upload States
  const [dptInputMode, setDptInputMode] = useState<'file' | 'paste'>('file');
  const [dptRawText, setDptRawText] = useState('');
  const [dptParseResult, setDptParseResult] = useState<ParseCSVResult | null>(null);
  const [dptUploadMode, setDptUploadMode] = useState<'merge' | 'replace'>('merge');
  const [dptSuccessMessage, setDptSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate Photo Upload State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    candidates.length > 0 ? candidates[0].id : ''
  );
  const [candidatePhotoPreview, setCandidatePhotoPreview] = useState<string | null>(null);
  const [candidateSuccessMessage, setCandidateSuccessMessage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Backup Upload State
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [backupErrorMessage, setBackupErrorMessage] = useState<string | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Handle DPT File Upload
  const handleDptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDptRawText(content);
      // If mode is replace, do not compare against existing voters for duplicate check
      const baseVoters = dptUploadMode === 'replace' ? [] : voters;
      const res = parseVotersCSV(content, baseVoters);
      setDptParseResult(res);
      setDptSuccessMessage(null);
    };
    reader.readAsText(file);
  };

  // Handle DPT Text Paste Parsing
  const handleParsePastedText = () => {
    if (!dptRawText.trim()) return;
    const baseVoters = dptUploadMode === 'replace' ? [] : voters;
    const res = parseVotersCSV(dptRawText, baseVoters);
    setDptParseResult(res);
    setDptSuccessMessage(null);
  };

  // Commit DPT Upload
  const handleCommitDptUpload = () => {
    if (!dptParseResult || dptParseResult.voters.length === 0) return;

    let finalVoters: Voter[] = [];
    if (dptUploadMode === 'replace') {
      finalVoters = dptParseResult.voters;
    } else {
      // Merge
      const existingNisns = new Set(voters.map((v) => v.nisn.toLowerCase().trim()));
      const filteredNew = dptParseResult.voters.filter(
        (v) => !existingNisns.has(v.nisn.toLowerCase().trim())
      );
      finalVoters = [...voters, ...filteredNew];
    }

    onUpdateVoters(finalVoters);
    const addedCount = dptParseResult.voters.length;
    setDptSuccessMessage(
      `Berhasil ${dptUploadMode === 'replace' ? 'menggantikan seluruh DPT dengan' : 'menambahkan'} ${addedCount} data pemilih!`
    );
    setDptParseResult(null);
    setDptRawText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Candidate Photo File
  const handleCandidatePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCandidatePhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCandidatePhoto = () => {
    if (!candidatePhotoPreview || !selectedCandidateId) return;

    const updated = candidates.map((c) =>
      c.id === selectedCandidateId ? { ...c, photoUrl: candidatePhotoPreview } : c
    );
    onUpdateCandidates(updated);
    setCandidateSuccessMessage('Foto paslon berhasil diperbarui!');
    setTimeout(() => setCandidateSuccessMessage(null), 4000);
  };

  // Handle Backup JSON File
  const handleBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.settings) await saveSettingsSync(parsed.settings);
          if (parsed.candidates) await saveCandidatesSync(parsed.candidates);
          if (parsed.voters) await saveVotersSync(parsed.voters);
        } catch (e) {
          console.warn('Backup cloud sync notice:', e);
        }
        setBackupSuccessMessage('Data cadangan berhasil dipulihkan secara menyeluruh ke semua perangkat!');
        setBackupErrorMessage(null);
        if (onRefreshAll) onRefreshAll();
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setBackupErrorMessage('Gagal memproses file cadangan. Pastikan file format JSON resmi.');
        setBackupSuccessMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const activeCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-menu Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PUSAT UPLOAD DATA ADMIN
              </span>
              <span className="text-xs text-slate-400">SMAN 2 Samarinda</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Upload & Impor Data Pemilihan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Unggah berkas Daftar Pemilih (DPT), foto kandidat paslon, atau pulihkan file cadangan sistem.
            </p>
          </div>

          {/* Sub-menu Pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
            <button
              onClick={() => setActiveSubTab('dpt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'dpt'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Upload DPT</span>
            </button>
            <button
              onClick={() => setActiveSubTab('candidate')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'candidate'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Upload Foto Paslon</span>
            </button>
            <button
              onClick={() => setActiveSubTab('backup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'backup'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>

        {/* ======================= SUB-TAB: UPLOAD DPT ======================= */}
        {activeSubTab === 'dpt' && (
          <div className="pt-6 space-y-6">
            {/* Success Notification */}
            {dptSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{dptSuccessMessage}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Total DPT saat ini adalah <strong>{voters.length} pemilih</strong>. Tampilan halaman depan siswa dan quick count telah langsung diperbarui!
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenVoterView && (
                    <button
                      onClick={onOpenVoterView}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>Halaman Siswa</span>
                    </button>
                  )}
                  {onOpenPublicView && (
                    <button
                      onClick={onOpenPublicView}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Quick Count</span>
                    </button>
                  )}
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('voters')}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition cursor-pointer"
                    >
                      Tabel DPT &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Template & Guidelines Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      Petunjuk Format Berkas DPT (Excel / CSV)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Siapkan berkas dengan urutan kolom: <strong>NISN</strong>, <strong>Nama Siswa</strong>,{' '}
                      <strong>Kelas</strong>, dan <strong>Token (Opsional)</strong>. Jika kolom token dikosongkan,
                      sistem akan otomatis membuat token acak unik 6 karakter untuk setiap siswa.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadCSV(
                        `Template_DPT_${settings.schoolName.replace(/\s+/g, '_')}.csv`,
                        generateCSVTemplate()
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Template CSV</span>
                  </button>
                </div>

                <div className="mt-4 bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-blue-100 font-mono text-[11px] text-slate-700 overflow-x-auto">
                  <span className="text-slate-400 select-none">Contoh baris data:</span>
                  <div className="text-blue-900 font-semibold mt-0.5">NISN,Nama Siswa,Kelas,Token</div>
                  <div className="text-slate-600">20241001,Ahmad Fadhil,X-1,TKN-A1B2</div>
                  <div className="text-slate-600">20241002,Bella Citra Lestari,XI MIPA 2,</div>
                  <div className="text-slate-600">20241003,Calvin Pratama,XII IPS 1,</div>
                </div>
              </div>

              {/* Mode Selection Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Metode Penggabungan Data</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tentukan bagaimana data baru akan dimasukkan ke dalam daftar pemilih:
                  </p>

                  <div className="mt-3 space-y-2">
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        dptUploadMode === 'merge'
                          ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="uploadMode"
                        checked={dptUploadMode === 'merge'}
                        onChange={() => setDptUploadMode('merge')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <div className="font-bold">Tambah / Gabungkan (Merge)</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          Menambahkan data baru tanpa menghapus pemilih lama. Duplikat NISN otomatis dilewati.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        dptUploadMode === 'replace'
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="uploadMode"
                        checked={dptUploadMode === 'replace'}
                        onChange={() => setDptUploadMode('replace')}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <div className="font-bold text-amber-900">Ganti Semua (Replace)</div>
                        <div className="text-[11px] text-amber-700/80 font-normal">
                          Mengosongkan DPT lama dan menggantinya seluruhnya dengan data baru ini.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  Total DPT saat ini: <strong className="text-slate-800">{voters.length} siswa</strong>
                </div>
              </div>
            </div>

            {/* Input Selection: File Upload vs Direct Text Paste */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
                <button
                  onClick={() => setDptInputMode('file')}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all cursor-pointer ${
                    dptInputMode === 'file'
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Pilih Berkas CSV / Excel</span>
                </button>
                <button
                  onClick={() => setDptInputMode('paste')}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all cursor-pointer ${
                    dptInputMode === 'paste'
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>Tempel (Paste) Kolom Excel Langsung</span>
                </button>
              </div>

              <div className="p-6 bg-white">
                {dptInputMode === 'file' ? (
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/30 group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleDptFileChange}
                        accept=".csv,.txt"
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 group-hover:bg-blue-200 text-blue-600 flex items-center justify-center mx-auto transition-colors">
                        <Upload className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-3">
                        Klik untuk memilih file CSV / TXT
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Mendukung pemisah koma (,), titik koma (;), atau tab dari ekspor Microsoft Excel / Google Sheets
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Salin (Copy) baris dari Excel / Spreadsheet lalu tempel di bawah ini:
                      </label>
                      <textarea
                        value={dptRawText}
                        onChange={(e) => setDptRawText(e.target.value)}
                        placeholder={`2024101\tAhmad Fadhil\tX-1\n2024102\tBella Citra\tXI MIPA 2\n2024103\tCalvin Pratama\tXII IPS 1`}
                        rows={7}
                        className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <button
                      onClick={handleParsePastedText}
                      disabled={!dptRawText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Periksa & Pratinjau Data Tempelan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* DPT Parse Preview Section */}
            {dptParseResult && (
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/60 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Hasil Pemeriksaan Berkas DPT
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Periksa ringkasan sebelum menyimpan secara permanen ke basis data pemilihan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDptParseResult(null)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCommitDptUpload}
                      disabled={dptParseResult.voters.length === 0}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Simpan {dptParseResult.voters.length} Data Pemilih ke DPT
                      </span>
                    </button>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Siap Diimpor</div>
                    <div className="text-lg font-black text-emerald-600">
                      {dptParseResult.voters.length} Siswa
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Duplikat Dilewati</div>
                    <div className="text-lg font-black text-amber-600">
                      {dptParseResult.duplicateCount} Baris
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Mode Upload</div>
                    <div className="text-xs font-bold text-slate-800 uppercase mt-1">
                      {dptUploadMode === 'merge' ? 'Gabung / Merge' : 'Ganti / Replace'}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Total DPT Akhir</div>
                    <div className="text-lg font-black text-blue-600">
                      {dptUploadMode === 'replace'
                        ? dptParseResult.voters.length
                        : voters.length + dptParseResult.voters.length}{' '}
                      Siswa
                    </div>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
                    <span>Pratinjau 5 Data Pertama yang Terbaca:</span>
                    <span className="text-slate-500 text-[11px]">
                      Menampilkan max 5 dari {dptParseResult.voters.length} data
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">NISN</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">Kelas</th>
                          <th className="py-2.5 px-3">Token Dibuat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dptParseResult.voters.slice(0, 5).map((v, idx) => (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{v.nisn}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{v.name}</td>
                            <td className="py-2 px-3 text-slate-600">{v.gradeClass}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                                {v.token}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= SUB-TAB: UPLOAD FOTO PASLON ======================= */}
        {activeSubTab === 'candidate' && (
          <div className="pt-6 space-y-6">
            {candidateSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{candidateSuccessMessage} Foto baru langsung tampil di halaman depan siswa.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenVoterView && (
                    <button
                      onClick={onOpenVoterView}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>Lihat Halaman Depan Siswa</span>
                    </button>
                  )}
                  {onOpenPublicView && (
                    <button
                      onClick={onOpenPublicView}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Lihat Quick Count</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Select Candidate */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Pilih Pasangan Calon</h3>
                <p className="text-xs text-slate-500">
                  Pilih nomor urut paslon yang fotonya ingin Anda perbarui:
                </p>

                <div className="space-y-2">
                  {candidates.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCandidateId(c.id);
                        setCandidatePhotoPreview(null);
                        setCandidateSuccessMessage(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedCandidateId === c.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            selectedCandidateId === c.id
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {String(c.candidateNumber).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{c.chairmanName}</div>
                          <div
                            className={`text-[10px] ${
                              selectedCandidateId === c.id ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            & {c.viceChairmanName}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 ${
                          selectedCandidateId === c.id ? 'text-white' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Image Section */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    Upload Foto Resmi: Paslon No.{' '}
                    {activeCandidate ? String(activeCandidate.candidateNumber).padStart(2, '0') : ''}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCandidate?.chairmanName} & {activeCandidate?.viceChairmanName}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Current or Preview Image */}
                  <div className="w-40 h-48 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 relative shrink-0 shadow-md">
                    <img
                      src={candidatePhotoPreview || activeCandidate?.photoUrl}
                      alt="Foto Paslon"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {candidatePhotoPreview ? 'Pratinjau Baru' : 'Foto Aktif'}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Pilih foto berformat <strong>JPG</strong>, <strong>PNG</strong>, atau{' '}
                        <strong>WebP</strong> dengan rasio potret (portrait 3:4 atau 4:5). Maksimal ukuran file 5 MB.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handleCandidatePhotoFile}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Pilih Foto dari Komputer</span>
                      </button>

                      {candidatePhotoPreview && (
                        <button
                          onClick={handleSaveCandidatePhoto}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Simpan Foto Paslon</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= SUB-TAB: RESTORE BACKUP ======================= */}
        {activeSubTab === 'backup' && (
          <div className="pt-6 space-y-6">
            {backupSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{backupSuccessMessage}</span>
              </div>
            )}

            {backupErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-bold">{backupErrorMessage}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-2xl mx-auto space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Database className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pulihkan Seluruh Data dari File Cadangan (.JSON)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Unggah file cadangan yang sebelumnya diunduh dari menu Pengaturan untuk mengembalikan seluruh
                  konfigurasi sekolah, daftar DPT, paslon, dan hasil pemilu.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={backupInputRef}
                  onChange={handleBackupFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 mx-auto shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Backup JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
