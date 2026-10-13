import React from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../../types/election';
import { Printer, X, Award, School } from 'lucide-react';

interface PrintBeritaAcaraModalProps {
  candidates: Candidate[];
  voters: Voter[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  onClose: () => void;
}

export const PrintBeritaAcaraModal: React.FC<PrintBeritaAcaraModalProps> = ({
  candidates,
  voters,
  voteRecords,
  settings,
  onClose,
}) => {
  const totalDpt = voters.length;
  const totalSah = voteRecords.length;
  const tidakHadir = totalDpt - totalSah;
  const persentaseSah = totalDpt > 0 ? ((totalSah / totalDpt) * 100).toFixed(1) : '0';

  const candidateStats = candidates.map((c) => {
    const votes = voteRecords.filter((vr) => vr.candidateId === c.id).length;
    const pct = totalSah > 0 ? ((votes / totalSah) * 100).toFixed(1) : '0';
    return { ...c, votes, pct };
  });

  const sortedCandidates = [...candidateStats].sort((a, b) => b.votes - a.votes);
  const terpilih = sortedCandidates.length > 0 && sortedCandidates[0].votes > 0 ? sortedCandidates[0] : null;

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('id-ID', options);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Toolbar Header (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm sm:text-base">Pratinjau Dokumen Resmi Berita Acara</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 text-slate-900 font-serif leading-relaxed bg-white print:p-0 print:m-0">
          {/* Letterhead (KOP SURAT) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-center gap-4 text-center">
            <img
              src="/src/assets/images/sman2_samarinda_logo_1791881987088.jpg"
              alt="Logo SMAN 2 Samarinda"
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-widest uppercase text-slate-700">
                KOMISI PEMILIHAN UMUM SISWA (KPU OSIS)
              </h4>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-950 mt-0.5">
                {settings.schoolName}
              </h2>
              <p className="text-xs font-sans text-slate-600 mt-0.5">{settings.schoolAddress}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
              BERITA ACARA REKAPITULASI HASIL PENGHITUNGAN SUARA
            </h3>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Nomor: {String(today.getFullYear())}/BA-KPU-OSIS/X/{String(today.getDate()).padStart(2, '0')}
            </p>
          </div>

          {/* Statement */}
          <p className="text-xs sm:text-sm text-justify mb-4 font-sans">
            Pada hari ini, <strong>{formattedDate}</strong>, bertempat di {settings.schoolName}, telah diselenggarakan
            Rapat Pleno Terbuka Penghitungan Suara dalam rangka <strong>{settings.electionTitle}</strong> Periode Masa Bakti{' '}
            <strong>{settings.periodYear}</strong> secara transparan, akuntabel, dan sah.
          </p>

          {/* Summary Table 1 */}
          <div className="mb-6 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-800">
              I. DATA PEMILIH DAN PENGGUNA HAK PILIH
            </h4>
            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-medium text-slate-600 w-3/4">1. Jumlah Pemilih Terdaftar (DPT)</td>
                  <td className="p-2.5 font-bold text-right">{totalDpt} orang</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-600">2. Jumlah Suara Masuk & Sah</td>
                  <td className="p-2.5 font-bold text-right text-emerald-700">{totalSah} suara ({persentaseSah}%)</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-medium text-slate-600">3. Jumlah Tidak Menggunakan Hak Pilih</td>
                  <td className="p-2.5 font-bold text-right text-slate-500">{tidakHadir} orang</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Table 2 */}
          <div className="mb-6 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-800">
              II. RINCIAN PEROLEHAN SUARA PASANGAN CALON
            </h4>
            <table className="w-full text-xs border border-slate-300 text-center">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-16">No. Urut</th>
                  <th className="p-2 border-r border-slate-300 text-left">Nama Pasangan Calon Ketua & Wakil</th>
                  <th className="p-2 border-r border-slate-300 w-28">Suara Sah</th>
                  <th className="p-2 border-r border-slate-300 w-24">Persentase</th>
                  <th className="p-2 w-32">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {sortedCandidates.map((c, idx) => (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-300 font-bold">
                      {String(c.candidateNumber).padStart(2, '0')}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-left">
                      <div className="font-bold">{c.chairmanName} & {c.viceChairmanName}</div>
                      <div className="text-[11px] text-slate-500">Kelas: {c.chairmanClass} / {c.viceChairmanClass}</div>
                    </td>
                    <td className="p-2.5 border-r border-slate-300 font-bold">{c.votes} suara</td>
                    <td className="p-2.5 border-r border-slate-300 font-bold">{c.pct}%</td>
                    <td className="p-2.5">
                      {idx === 0 && c.votes > 0 ? (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          SUARA TERBANYAK
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decision */}
          {terpilih && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-8 font-sans text-xs">
              <span className="font-bold text-slate-900 block mb-1">III. PENETAPAN PASANGAN CALON TERPILIH:</span>
              Berdasarkan hasil perolehan suara terbanyak, KPU OSIS menetapkan Pasangan Calon Nomor Urut{' '}
              <strong>{String(terpilih.candidateNumber).padStart(2, '0')} ({terpilih.chairmanName} & {terpilih.viceChairmanName})</strong> sebagai{' '}
              <strong>Ketua dan Wakil Ketua OSIS Terpilih {settings.schoolName} Masa Bakti {settings.periodYear}</strong>.
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 font-sans text-xs grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-slate-600 mb-16">Ketua KPU OSIS,</p>
              <p className="font-bold underline">{settings.chiefCommitteeName}</p>
              <p className="text-[10px] text-slate-500">NIS/Panitia Penyelenggara</p>
            </div>
            <div>
              <p className="text-slate-600 mb-16">Pembina OSIS,</p>
              <p className="font-bold underline">{settings.advisorName}</p>
              <p className="text-[10px] text-slate-500">NIP. 19780512 200312 2 001</p>
            </div>
            <div>
              <p className="text-slate-600 mb-16">Mengetahui,<br />Kepala Sekolah</p>
              <p className="font-bold underline">{settings.principalName}</p>
              <p className="text-[10px] text-slate-500">NIP. 19680315 199403 1 004</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
