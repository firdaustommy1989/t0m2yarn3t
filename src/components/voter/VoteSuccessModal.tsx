import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, School, QrCode } from 'lucide-react';
import { Voter, ElectionSettings } from '../../types/election';

interface VoteSuccessModalProps {
  voter: Voter;
  receiptCode: string;
  votedAt: string;
  candidateNumber: number;
  candidateName: string;
  settings: ElectionSettings;
  onFinishSession: () => void;
}

export const VoteSuccessModal: React.FC<VoteSuccessModalProps> = ({
  voter,
  receiptCode,
  votedAt,
  candidateNumber,
  candidateName,
  settings,
  onFinishSession,
}) => {
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinishSession]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Success Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 text-center relative">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs border border-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">HAK SUARA BERHASIL DICATAT!</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Terima kasih telah berpartisipasi dalam pesta demokrasi sekolah.
          </p>
        </div>

        {/* E-Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute right-[-10px] bottom-[-10px] text-slate-100 opacity-60 pointer-events-none select-none font-black text-6xl rotate-[-15deg]">
              SAH
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/src/assets/images/sman2_samarinda_logo_1791881987088.jpg"
                  alt="Logo SMAN 2 Samarinda"
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span className="text-xs font-bold text-slate-800">{settings.schoolName}</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                STATUS: SAH & RESMI
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Nama Pemilih:</span>
                <span className="font-bold text-slate-900">{voter.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">NISN / Kelas:</span>
                <span className="font-semibold text-slate-800">{voter.nisn} ({voter.gradeClass})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Waktu Coblos:</span>
                <span className="font-mono text-slate-700">{votedAt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Kode Bukti Verifikasi:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {receiptCode}
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-slate-500">Pilihan:</span>
                <span className="font-bold text-emerald-700">Paslon No. {candidateNumber} ({candidateName})</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Asas Luber & Jurdil Dijamin Sistem</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">1 SISWA = 1 SUARA</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Bilik suara akan dialihkan ke pemilih berikutnya dalam <strong className="text-emerald-700 font-bold">{countdown} detik</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bukti (Struk)</span>
          </button>

          <button
            onClick={onFinishSession}
            className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Selesai & Sesi Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
