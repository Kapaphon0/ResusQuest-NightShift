import React from 'react';
import { Activity, CheckCircle2, Info } from 'lucide-react';
interface ECGLeadViewerProps {
  onInterpreted: (correct: boolean) => void;
  interpreted: boolean;
}
export const ECGLeadViewer: React.FC<ECGLeadViewerProps> = ({
  onInterpreted,
  interpreted,
}) => {
  const [selectedTerritory, setSelectedTerritory] = React.useState<string | null>(
    interpreted ? 'anteroseptal' : null
  );
  const [selectedVessel, setSelectedVessel] = React.useState<string | null>(
    interpreted ? 'lad' : null
  );
  const [submitted, setSubmitted] = React.useState<boolean>(interpreted);
  const handleSubmit = () => {
    const isCorrect = selectedTerritory === 'anteroseptal' && selectedVessel === 'lad';
    setSubmitted(true);
    onInterpreted(isCorrect);
  };
  return (
    <div
      id="ecg-diagnostic-viewer"
      className="bg-slate-950 text-white rounded-2xl border-2 border-rose-500/50 p-4 space-y-4 shadow-xl select-none"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-tight text-white uppercase">
              12-Lead Diagnostic ECG Strip
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              25 mm/s • 10 mm/mV • HR: 104 bpm (Sinus Tachycardia)
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
          STAT REPORT
        </span>
      </div>

      {/* Simulated 12-Lead Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {/* V1 Lead Card */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-rose-500/40 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="font-bold text-rose-400">LEAD V1</span>
            <span className="text-rose-300 font-bold">+2.0 mm ST-Elev</span>
          </div>
          <div className="h-10 flex items-center justify-center my-1">
            <svg viewBox="0 0 100 40" className="w-full h-8 stroke-rose-400 fill-none stroke-[2]">
              <path d="M 0,20 L 25,20 L 28,14 L 32,32 L 36,6 L 42,28 L 46,14 L 60,12 L 75,18 L 100,20" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Septal</span>
        </div>

        {/* V2 Lead Card */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-rose-500/70 relative overflow-hidden ring-1 ring-rose-500/30">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="font-bold text-rose-400">LEAD V2</span>
            <span className="text-rose-300 font-bold">+3.0 mm ST-Elev</span>
          </div>
          <div className="h-10 flex items-center justify-center my-1">
            <svg viewBox="0 0 100 40" className="w-full h-8 stroke-rose-400 fill-none stroke-[2.2]">
              <path d="M 0,20 L 20,20 L 24,12 L 28,34 L 33,4 L 40,30 L 46,12 L 62,8 L 78,16 L 100,20" />
            </svg>
          </div>
          <span className="text-[9px] text-rose-400 font-bold block text-center">Hyperacute T Wave</span>
        </div>

        {/* V3 Lead Card */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-rose-500/70 relative overflow-hidden ring-1 ring-rose-500/30">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="font-bold text-rose-400">LEAD V3</span>
            <span className="text-rose-300 font-bold">+2.8 mm ST-Elev</span>
          </div>
          <div className="h-10 flex items-center justify-center my-1">
            <svg viewBox="0 0 100 40" className="w-full h-8 stroke-rose-400 fill-none stroke-[2.2]">
              <path d="M 0,20 L 20,20 L 24,14 L 28,33 L 33,5 L 40,30 L 46,13 L 64,9 L 80,17 L 100,20" />
            </svg>
          </div>
          <span className="text-[9px] text-rose-400 font-bold block text-center">Anterior Elevation</span>
        </div>

        {/* V4 Lead Card */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-rose-500/40 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="font-bold text-rose-400">LEAD V4</span>
            <span className="text-rose-300 font-bold">+2.2 mm ST-Elev</span>
          </div>
          <div className="h-10 flex items-center justify-center my-1">
            <svg viewBox="0 0 100 40" className="w-full h-8 stroke-rose-400 fill-none stroke-[2]">
              <path d="M 0,20 L 25,20 L 28,14 L 33,32 L 37,8 L 43,28 L 48,15 L 65,11 L 80,18 L 100,20" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Anteroseptal</span>
        </div>

        {/* Lead II (Reciprocal) */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-blue-400 font-bold">LEAD II</span>
            <span className="text-blue-300 text-[9px]">-1.5 mm ST-Dep</span>
          </div>
          <div className="h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 30" className="w-full h-6 stroke-blue-400 fill-none stroke-[1.8]">
              <path d="M 0,15 L 30,15 L 35,8 L 40,24 L 45,15 L 50,22 L 65,22 L 80,17 L 100,15" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Reciprocal Depression</span>
        </div>

        {/* Lead III (Reciprocal) */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-blue-400 font-bold">LEAD III</span>
            <span className="text-blue-300 text-[9px]">-2.0 mm ST-Dep</span>
          </div>
          <div className="h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 30" className="w-full h-6 stroke-blue-400 fill-none stroke-[1.8]">
              <path d="M 0,15 L 30,15 L 35,9 L 40,24 L 45,15 L 50,24 L 65,24 L 80,18 L 100,15" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Inferior Reciprocal</span>
        </div>

        {/* Lead aVF (Reciprocal) */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-blue-400 font-bold">LEAD aVF</span>
            <span className="text-blue-300 text-[9px]">-1.5 mm ST-Dep</span>
          </div>
          <div className="h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 30" className="w-full h-6 stroke-blue-400 fill-none stroke-[1.8]">
              <path d="M 0,15 L 30,15 L 35,8 L 40,23 L 45,15 L 50,22 L 65,22 L 80,17 L 100,15" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Inferior Reciprocal</span>
        </div>

        {/* Lead aVR */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold">LEAD aVR</span>
            <span className="text-slate-500 text-[9px]">Isoelectric</span>
          </div>
          <div className="h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 30" className="w-full h-6 stroke-slate-500 fill-none stroke-[1.5]">
              <path d="M 0,15 L 30,15 L 35,18 L 40,4 L 45,15 L 60,15 L 100,15" />
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Cavity Lead</span>
        </div>
      </div>

      {/* Interactive ECG Diagnostic Interpretation Form */}
      {!submitted ? (
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Info className="w-4 h-4" />
            <span>CLINICAL INTERPRETATION REQUIRED:</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              1. What anatomical territory shows primary ischemic injury?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'anteroseptal', label: 'Anteroseptal (V1–V4)' },
                { id: 'inferior', label: 'Inferior (II, III, aVF)' },
                { id: 'lateral', label: 'High Lateral (I, aVL)' },
                { id: 'diffuse_pericarditis', label: 'Diffuse Pericardial' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  id={`btn-ecg-territory-${opt.id}`}
                  onClick={() => setSelectedTerritory(opt.id)}
                  className={`p-2 rounded-lg text-left text-xs font-bold border transition-all cursor-pointer ${
                    selectedTerritory === opt.id
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              2. What is the anticipated culprit coronary artery?
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'lad', label: 'LAD (Left Anterior Descending)' },
                { id: 'rca', label: 'RCA (Right Coronary Artery)' },
                { id: 'lcx', label: 'LCx (Left Circumflex)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  id={`btn-ecg-vessel-${opt.id}`}
                  onClick={() => setSelectedVessel(opt.id)}
                  className={`p-2 rounded-lg text-left text-xs font-bold border transition-all cursor-pointer ${
                    selectedVessel === opt.id
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-confirm-ecg-interpretation"
            disabled={!selectedTerritory || !selectedVessel}
            onClick={handleSubmit}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
          >
            CONFIRM ECG INTERPRETATION
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-black text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>INTERPRETATION CONFIRMED: ANTEROSEPTAL STEMI (LAD OCCLUSION)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Marked 2.5 mm ST-segment elevation in precordial leads V1–V4 with reciprocal inferior ST depression in II, III, and aVF confirms acute transmural ischemia in the distribution of the proximal-to-mid Left Anterior Descending (LAD) artery.
          </p>
        </div>
      )}
    </div>
  );
};
