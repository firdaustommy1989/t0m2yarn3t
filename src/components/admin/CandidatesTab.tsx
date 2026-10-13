import React, { useState } from 'react';
import { Candidate } from '../../types/election';
import { Plus, Edit2, Trash2, Image, Sparkles, Award, CheckCircle, Users, X, Upload } from 'lucide-react';

interface CandidatesTabProps {
  candidates: Candidate[];
  onUpdateCandidates: (candidates: Candidate[]) => void;
}

const PRESET_PHOTOS = [
  { label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siswa 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siswa 4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siswa 5', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siswa 6', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80' },
];

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
];

export const CandidatesTab: React.FC<CandidatesTabProps> = ({
  candidates,
  onUpdateCandidates,
}) => {
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formCandidate, setFormCandidate] = useState<Partial<Candidate>>({
    candidateNumber: (candidates.length > 0 ? Math.max(...candidates.map((c) => c.candidateNumber)) : 0) + 1,
    chairmanName: '',
    chairmanClass: '',
    viceChairmanName: '',
    viceChairmanClass: '',
    tagline: '',
    photoUrl: PRESET_PHOTOS[0].url,
    vision: '',
    missions: [''],
    workPrograms: [''],
    accentColor: PRESET_COLORS[0],
  });

  const handleOpenAdd = () => {
    const nextNumber = (candidates.length > 0 ? Math.max(...candidates.map((c) => c.candidateNumber)) : 0) + 1;
    setFormCandidate({
      candidateNumber: nextNumber,
      chairmanName: '',
      chairmanClass: '',
      viceChairmanName: '',
      viceChairmanClass: '',
      tagline: '',
      photoUrl: PRESET_PHOTOS[(nextNumber - 1) % PRESET_PHOTOS.length].url,
      vision: '',
      missions: ['Mewujudkan karakter kepemimpinan siswa yang berakhlak mulia.'],
      workPrograms: ['Pekan Seni & Kreativitas Pelajar'],
      accentColor: PRESET_COLORS[(nextNumber - 1) % PRESET_COLORS.length],
    });
    setIsAddingNew(true);
    setEditingCandidate(null);
  };

  const handleOpenEdit = (c: Candidate) => {
    setFormCandidate({ ...c });
    setEditingCandidate(c);
    setIsAddingNew(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormCandidate((prev) => ({
        ...prev,
        photoUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Missions dynamic handler
  const handleAddMission = () => {
    setFormCandidate((prev) => ({
      ...prev,
      missions: [...(prev.missions || []), ''],
    }));
  };

  const handleUpdateMission = (index: number, val: string) => {
    setFormCandidate((prev) => {
      const copy = [...(prev.missions || [])];
      copy[index] = val;
      return { ...prev, missions: copy };
    });
  };

  const handleRemoveMission = (index: number) => {
    setFormCandidate((prev) => ({
      ...prev,
      missions: (prev.missions || []).filter((_, i) => i !== index),
    }));
  };

  // Programs dynamic handler
  const handleAddProgram = () => {
    setFormCandidate((prev) => ({
      ...prev,
      workPrograms: [...(prev.workPrograms || []), ''],
    }));
  };

  const handleUpdateProgram = (index: number, val: string) => {
    setFormCandidate((prev) => {
      const copy = [...(prev.workPrograms || [])];
      copy[index] = val;
      return { ...prev, workPrograms: copy };
    });
  };

  const handleRemoveProgram = (index: number) => {
    setFormCandidate((prev) => ({
      ...prev,
      workPrograms: (prev.workPrograms || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCandidate.chairmanName || !formCandidate.viceChairmanName) {
      alert('Nama Calon Ketua dan Calon Wakil Ketua wajib diisi.');
      return;
    }

    const cleanMissions = (formCandidate.missions || []).filter((m) => m.trim().length > 0);
    const cleanPrograms = (formCandidate.workPrograms || []).filter((p) => p.trim().length > 0);

    if (editingCandidate) {
      const updated = candidates.map((c) =>
        c.id === editingCandidate.id
          ? ({
              ...c,
              ...formCandidate,
              missions: cleanMissions.length > 0 ? cleanMissions : ['Menjunjung tinggi aspirasi siswa.'],
              workPrograms: cleanPrograms,
            } as Candidate)
          : c
      );
      onUpdateCandidates(updated);
    } else {
      const newCand: Candidate = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        candidateNumber: Number(formCandidate.candidateNumber) || candidates.length + 1,
        chairmanName: formCandidate.chairmanName || '',
        chairmanClass: formCandidate.chairmanClass || 'XI',
        viceChairmanName: formCandidate.viceChairmanName || '',
        viceChairmanClass: formCandidate.viceChairmanClass || 'X',
        tagline: formCandidate.tagline || 'Maju Bersama OSIS',
        photoUrl: formCandidate.photoUrl || PRESET_PHOTOS[0].url,
        vision: formCandidate.vision || 'Mewujudkan OSIS yang berintegritas.',
        missions: cleanMissions.length > 0 ? cleanMissions : ['Mendukung potensi siswa sekolah.'],
        workPrograms: cleanPrograms,
        accentColor: formCandidate.accentColor || PRESET_COLORS[0],
      };
      onUpdateCandidates([...candidates, newCand]);
    }

    setIsAddingNew(false);
    setEditingCandidate(null);
  };

  const handleDeleteCandidate = (id: string) => {
    if (confirm('Yakin ingin menghapus pasangan calon ini dari daftar kandidat?')) {
      onUpdateCandidates(candidates.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Pasangan Calon (Paslon)</h2>
          <p className="text-xs text-slate-500">
            Kelola profil, visi, misi, program kerja, dan nomor urut kandidat OSIS.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pasangan Calon Baru</span>
        </button>
      </div>

      {/* Candidates List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates
          .sort((a, b) => a.candidateNumber - b.candidateNumber)
          .map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header & Number */}
                <div
                  className="p-3 text-white flex items-center justify-between px-5 font-bold"
                  style={{ backgroundColor: candidate.accentColor }}
                >
                  <span className="text-xs tracking-wider uppercase">PASLON NO. URUT</span>
                  <span className="text-xl font-black">{String(candidate.candidateNumber).padStart(2, '0')}</span>
                </div>

                {/* Photo Preview */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.chairmanName}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-extrabold text-base leading-tight">
                        {candidate.chairmanName} & {candidate.viceChairmanName}
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        {candidate.chairmanClass} & {candidate.viceChairmanClass}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info preview */}
                <div className="p-4 space-y-3 text-xs">
                  <p className="p-2.5 rounded-xl bg-blue-50/70 text-blue-900 border border-blue-100 font-medium italic">
                    "{candidate.tagline}"
                  </p>

                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-0.5">
                      Visi:
                    </span>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{candidate.vision}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Misi ({candidate.missions.length} Poin):
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      {candidate.missions.slice(0, 2).map((m, i) => (
                        <li key={i} className="line-clamp-1">{m}</li>
                      ))}
                      {candidate.missions.length > 2 && (
                        <li className="text-slate-400">+{candidate.missions.length - 2} misi lainnya</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(candidate)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCandidate(candidate.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddingNew || editingCandidate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-6 p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCandidate ? 'Edit Data Pasangan Calon' : 'Tambah Pasangan Calon Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingCandidate(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Row 1: Number & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nomor Urut</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formCandidate.candidateNumber || 1}
                    onChange={(e) => setFormCandidate({ ...formCandidate, candidateNumber: parseInt(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Warna Tema / Aksen</label>
                  <div className="flex items-center gap-2 pt-1">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setFormCandidate({ ...formCandidate, accentColor: col })}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          formCandidate.accentColor === col ? 'ring-3 ring-offset-2 ring-slate-800 scale-110' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Chairman */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nama Calon Ketua OSIS</label>
                  <input
                    type="text"
                    required
                    value={formCandidate.chairmanName || ''}
                    onChange={(e) => setFormCandidate({ ...formCandidate, chairmanName: e.target.value })}
                    placeholder="Contoh: Rafi Raditya Pratama"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas Ketua</label>
                  <input
                    type="text"
                    required
                    value={formCandidate.chairmanClass || ''}
                    onChange={(e) => setFormCandidate({ ...formCandidate, chairmanClass: e.target.value })}
                    placeholder="Contoh: XI MIPA 1"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Row 3: Vice Chairman */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nama Calon Wakil Ketua</label>
                  <input
                    type="text"
                    required
                    value={formCandidate.viceChairmanName || ''}
                    onChange={(e) => setFormCandidate({ ...formCandidate, viceChairmanName: e.target.value })}
                    placeholder="Contoh: Nadia Az-Zahra"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas Wakil</label>
                  <input
                    type="text"
                    required
                    value={formCandidate.viceChairmanClass || ''}
                    onChange={(e) => setFormCandidate({ ...formCandidate, viceChairmanClass: e.target.value })}
                    placeholder="Contoh: X-2"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Slogan */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={formCandidate.tagline || ''}
                  onChange={(e) => setFormCandidate({ ...formCandidate, tagline: e.target.value })}
                  placeholder="Contoh: Sinergi, Kolaboratif, Berprestasi Tanpa Batas"
                  className="w-full p-2.5 rounded-xl border border-slate-300 italic"
                />
              </div>

              {/* Photo Options */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Foto Pasangan Calon</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="text-slate-400">atau pilih avatar preset:</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {PRESET_PHOTOS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormCandidate({ ...formCandidate, photoUrl: preset.url })}
                        className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 ${
                          formCandidate.photoUrl === preset.url ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vision */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Visi Pasangan Calon</label>
                <textarea
                  rows={2}
                  required
                  value={formCandidate.vision || ''}
                  onChange={(e) => setFormCandidate({ ...formCandidate, vision: e.target.value })}
                  placeholder="Tuliskan visi utama kandidat..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Missions Dynamic */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase">Misi (Butir-butir Misi)</label>
                  <button
                    type="button"
                    onClick={handleAddMission}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(formCandidate.missions || []).map((mission, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-slate-400">{idx + 1}.</span>
                      <input
                        type="text"
                        value={mission}
                        onChange={(e) => handleUpdateMission(idx, e.target.value)}
                        placeholder={`Misi ${idx + 1}...`}
                        className="flex-1 p-2 rounded-xl border border-slate-300"
                      />
                      {(formCandidate.missions || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMission(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Programs Dynamic */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase">Program Kerja Unggulan</label>
                  <button
                    type="button"
                    onClick={handleAddProgram}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Proker</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(formCandidate.workPrograms || []).map((prog, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-slate-400">•</span>
                      <input
                        type="text"
                        value={prog}
                        onChange={(e) => handleUpdateProgram(idx, e.target.value)}
                        placeholder={`Nama program kerja unggulan ${idx + 1}...`}
                        className="flex-1 p-2 rounded-xl border border-slate-300"
                      />
                      {(formCandidate.workPrograms || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProgram(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Kandidat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
