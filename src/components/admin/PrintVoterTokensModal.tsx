import React, { useState } from 'react';
import { Voter, ElectionSettings } from '../../types/election';
import { Printer, X, Filter, School, KeyRound } from 'lucide-react';

interface PrintVoterTokensModalProps {
  voters: Voter[];
  settings: ElectionSettings;
  onClose: () => void;
}

export const PrintVoterTokensModal: React.FC<PrintVoterTokensModalProps> = ({
  voters,
  settings,
  onClose,
}) => {
  const [filterClass, setFilterClass] = useState<string>('all');

  const classes = Array.from(new Set(voters.map((v) => v.gradeClass))).sort();

  const filteredVoters = voters.filter((v) => {
    if (filterClass === 'all') return true;
    return v.gradeClass === filterClass;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Controls Toolbar (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <School className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Cetak Kartu Slip Akses & Token Pemilih</h3>
              <p className="text-xs text-slate-400">Siap dicetak dan dipotong untuk dibagikan ke siswa</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
              >
                <option value="all">Semua Kelas ({voters.length})</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c} ({voters.filter((v) => v.gradeClass === c).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu ({filteredVoters.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Cards Grid */}
        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[80vh] print:bg-white print:p-0 print:max-h-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3">
            {filteredVoters.map((voter) => (
              <div
                key={voter.id}
                className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 print:border-slate-400 flex flex-col justify-between shadow-xs print:shadow-none break-inside-avoid"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 block uppercase">
                        KARTU SUARA & TOKEN PEMILIH
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                        {settings.schoolName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {settings.periodYear}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Nama Siswa:</span>
                      <strong className="text-slate-900 text-sm block truncate">{voter.name}</strong>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 block">NISN:</span>
                        <span className="font-mono font-semibold text-slate-800">{voter.nisn}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Kelas:</span>
                        <span className="font-semibold text-slate-800">{voter.gradeClass}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold text-center">
                    TOKEN RAHASIA COBLOS:
                  </span>
                  <div className="my-1.5 p-2 bg-blue-50 border-2 border-blue-400/80 rounded-lg text-center font-mono font-black text-base text-blue-800 tracking-wider">
                    {voter.token}
                  </div>
                  <p className="text-[9px] text-slate-400 text-center leading-tight">
                    *Jangan berikan token ini ke orang lain. 1 Token berlaku untuk 1 kali pencoblosan.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
