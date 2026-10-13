import React, { useState } from 'react';
import { ElectionSettings } from '../../types/election';
import { exportBackupJSON, importBackupJSON, resetVotingOnly, resetAllToDefault } from '../../utils/storage';
import { Settings, Shield, School, Save, Database, Download, Upload, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsTabProps {
  settings: ElectionSettings;
  onUpdateSettings: (settings: ElectionSettings) => void;
  onResetData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<ElectionSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jsonImportText, setJsonImportText] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Evoting_OSIS_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importBackupJSON(content);
      if (ok) {
        alert('Data backup berhasil dipulihkan!');
        onResetData();
      } else {
        alert('File backup JSON tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetVotesOnly = () => {
    if (confirm('PERINGATAN: Semua suara masuk akan DIHAPUS, dan status semua pemilih akan di-reset menjadi BELUM MEMILIH. Data DPT dan Kandidat tetap aman. Lanjutkan?')) {
      resetVotingOnly();
      onResetData();
      alert('Seluruh perolehan suara berhasil di-reset!');
    }
  };

  const handleResetEverythingDefault = () => {
    if (confirm('PERINGATAN: Seluruh database (kandidat, DPT, suara, pengaturan) akan dikembalikan ke data simulasi bawaan awal. Lanjutkan?')) {
      resetAllToDefault();
      onResetData();
      alert('Database telah dikembalikan ke data awal simulasi!');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan pemilihan berhasil disimpan dan diterapkan!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Identitas Sekolah & Pemilihan</h3>
            <p className="text-xs text-slate-500">Informasi resmi yang akan tercetak pada kop surat dan kartu suara</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Sekolah</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Alamat Sekolah</label>
            <input
              type="text"
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Judul Pemilihan</label>
            <input
              type="text"
              required
              value={formData.electionTitle}
              onChange={(e) => setFormData({ ...formData, electionTitle: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Periode Masa Bakti</label>
            <input
              type="text"
              required
              value={formData.periodYear}
              onChange={(e) => setFormData({ ...formData, periodYear: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Pembina OSIS</label>
            <input
              type="text"
              value={formData.advisorName}
              onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Ketua KPU OSIS (Panitia)</label>
            <input
              type="text"
              value={formData.chiefCommitteeName}
              onChange={(e) => setFormData({ ...formData, chiefCommitteeName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Status Voting & Visibility */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Status & Kontrol Pemungutan Suara</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'draft', label: 'Persiapan (Draft)', desc: 'Bilik suara belum dibuka' },
              { id: 'active', label: 'Voting Aktif (Buka)', desc: 'Siswa dapat mencoblos' },
              { id: 'closed', label: 'Voting Ditutup', desc: 'Pencoblosan telah berakhir' },
            ].map((st) => (
              <label
                key={st.id}
                className={`p-3.5 rounded-2xl border-2 flex flex-col cursor-pointer transition-all ${
                  formData.status === st.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="election_status"
                    checked={formData.status === st.id}
                    onChange={() => setFormData({ ...formData, status: st.id as any })}
                    className="text-blue-600"
                  />
                  <span className="font-bold text-xs">{st.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 pl-5">{st.desc}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="showLive"
              checked={formData.showLiveResultsToPublic}
              onChange={(e) => setFormData({ ...formData, showLiveResultsToPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="showLive" className="text-xs text-slate-700 cursor-pointer">
              <strong>Tampilkan Quick Count Terbuka:</strong> Izinkan siswa & publik melihat perolehan suara live di tab Quick Count. Jika tidak dicentang, hasil akan dirahasiakan hingga sidang pleno.
            </label>
          </div>
        </div>

        {/* Security / Passcode */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Keamanan Administrator</span>
          </h4>

          <div className="max-w-xs text-xs">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Kata Sandi / PIN Masuk Admin
            </label>
            <input
              type="text"
              required
              value={formData.adminPasscode}
              onChange={(e) => setFormData({ ...formData, adminPasscode: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Gunakan kata sandi yang mudah diingat panitia.</p>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Backup & Database Maintenance */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Cadangkan & Pemeliharaan Database</h3>
            <p className="text-xs text-slate-500">Ekspor berkas cadangan JSON atau lakukan reset jika diperlukan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Ekspor Cadangan (Backup JSON)</span>
            </h4>
            <p className="text-xs text-slate-600">
              Unduh seluruh database (Kandidat, DPT, dan Hasil Pemilihan) menjadi satu berkas JSON aman untuk disimpan di arsip sekolah.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs"
            >
              Unduh Berkas Backup .JSON
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Pulihkan Data (Restore JSON)</span>
            </h4>
            <p className="text-xs text-slate-600">
              Impor berkas JSON cadangan yang telah diekspor sebelumnya untuk memulihkan seluruh kondisi sistem.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Zona Pengaturan Khusus (Reset)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleResetVotesOnly}
              className="px-4 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              Kosongkan Suara Masuk Saja (DPT Tetap)
            </button>

            <button
              type="button"
              onClick={handleResetEverythingDefault}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Kembalikan Seluruh Database ke Data Demo Awal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
