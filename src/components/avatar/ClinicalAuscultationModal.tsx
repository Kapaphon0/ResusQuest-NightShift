import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { audio } from '../../utils/audio';

interface AuscultationSite {
  id: string;
  name: string;
  category: 'cardiac' | 'pulmonary';
  findingDescription: string;
  acousticType: 'normal_s1s2' | 'murmur_systolic' | 'wheeze' | 'crackles' | 'clear_vesicular';
  x: number; // percentage on chest map
  y: number;
}

interface ClinicalAuscultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientScenarioTitle?: string;
  targetFindings?: {
    cardiacSite: string;
    cardiacFinding: string;
    pulmonarySite: string;
    pulmonaryFinding: string;
  };
}

const DEFAULT_SITES: AuscultationSite[] = [
  {
    id: 'aortic',
    name: 'Aortic Area (2nd RICS)',
    category: 'cardiac',
    findingDescription: 'Crisp S2 closure. Regular rhythm without systolic ejection click.',
    acousticType: 'normal_s1s2',
    x: 42,
    y: 35,
  },
  {
    id: 'pulmonic',
    name: 'Pulmonic Area (2nd LICS)',
    category: 'cardiac',
    findingDescription: 'Normal physiologic splitting of S2 with inspiration.',
    acousticType: 'normal_s1s2',
    x: 58,
    y: 35,
  },
  {
    id: 'erbs',
    name: "Erb's Point (3rd LICS)",
    category: 'cardiac',
    findingDescription: 'No diastolic decrescendo murmur identified.',
    acousticType: 'normal_s1s2',
    x: 55,
    y: 45,
  },
  {
    id: 'mitral',
    name: 'Mitral / Apex (5th LICS MCL)',
    category: 'cardiac',
    findingDescription: 'Prominent S1. S4 gallop noted reflecting acute left ventricular non-compliance.',
    acousticType: 'murmur_systolic',
    x: 64,
    y: 60,
  },
  {
    id: 'lung_ru',
    name: 'Right Upper Lung Field',
    category: 'pulmonary',
    findingDescription: 'Clear vesicular breath sounds bilaterally.',
    acousticType: 'clear_vesicular',
    x: 32,
    y: 28,
  },
  {
    id: 'lung_lu',
    name: 'Left Upper Lung Field',
    category: 'pulmonary',
    findingDescription: 'Clear vesicular breath sounds.',
    acousticType: 'clear_vesicular',
    x: 68,
    y: 28,
  },
  {
    id: 'lung_rb',
    name: 'Right Lung Base',
    category: 'pulmonary',
    findingDescription: 'Fine late inspiratory crackles (rales) at lung base.',
    acousticType: 'crackles',
    x: 30,
    y: 68,
  },
  {
    id: 'lung_lb',
    name: 'Left Lung Base',
    category: 'pulmonary',
    findingDescription: 'Bilateral fine inspiratory crackles; no expiratory wheezing.',
    acousticType: 'crackles',
    x: 70,
    y: 68,
  },
];

export const ClinicalAuscultationModal: React.FC<ClinicalAuscultationModalProps> = ({
  isOpen,
  onClose,
  patientScenarioTitle = 'Bedside Patient',
}) => {
  const [selectedSite, setSelectedSite] = useState<AuscultationSite>(DEFAULT_SITES[0]);
  const [isPlayingAcoustic, setIsPlayingAcoustic] = useState(false);
  const [interpretationSaved, setInterpretationSaved] = useState(false);

  if (!isOpen) return null;

  const playSimulatedSound = (type: AuscultationSite['acousticType']) => {
    setIsPlayingAcoustic(true);
    audio.playTelemetryClick();
    // Use Web Audio tone sweeps to synthesize realistic acoustic beats
    if (type === 'crackles' || type === 'murmur_systolic') {
      audio.playWarningTone();
    } else {
      audio.playXpChime();
    }
    setTimeout(() => {
      setIsPlayingAcoustic(false);
    }, 1800);
  };

  const handleSelectSite = (site: AuscultationSite) => {
    setSelectedSite(site);
    playSimulatedSound(site.acousticType);
  };

  return (
    <div
      id="auscultation-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-fadeIn"
    >
      <div
        id="auscultation-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black">Bedside Acoustic Auscultation</h2>
              <span className="text-[10px] text-slate-400 font-semibold">
                {patientScenarioTitle}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chest Auscultation Interactive Anatomy Map */}
        <div className="bg-slate-950 p-4 relative flex items-center justify-center border-b border-slate-800">
          <div className="relative w-64 h-64 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Torso Anatomical Silhouette SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-35">
              <path
                d="M50 40 Q100 25 150 40 L165 190 Q100 200 35 190 Z"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Clavicles */}
              <line x1="50" y1="45" x2="95" y2="55" stroke="#475569" strokeWidth="2" />
              <line x1="150" y1="45" x2="105" y2="55" stroke="#475569" strokeWidth="2" />
              {/* Sternum */}
              <rect x="96" y="55" width="8" height="60" rx="3" fill="#475569" />
              {/* Rib outlines */}
              <path d="M40 80 Q100 95 160 80" stroke="#334155" strokeWidth="1.5" fill="none" />
              <path d="M40 110 Q100 125 160 110" stroke="#334155" strokeWidth="1.5" fill="none" />
              <path d="M42 140 Q100 155 158 140" stroke="#334155" strokeWidth="1.5" fill="none" />
            </svg>

            {/* Auscultation Hotspots */}
            {DEFAULT_SITES.map((site) => {
              const isSelected = selectedSite.id === site.id;
              const isCardiac = site.category === 'cardiac';

              return (
                <button
                  key={site.id}
                  onClick={() => handleSelectSite(site)}
                  style={{ left: `${site.x}%`, top: `${site.y}%` }}
                  title={site.name}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white scale-125 ring-4 ring-rose-500/40 shadow-lg'
                      : isCardiac
                      ? 'bg-rose-950/80 border border-rose-500/60 text-rose-400 hover:scale-110'
                      : 'bg-blue-950/80 border border-blue-500/60 text-blue-400 hover:scale-110'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                </button>
              );
            })}

            {/* Ambient Acoustic Waveform Overlay */}
            {isPlayingAcoustic && (
              <div className="absolute bottom-2 left-3 right-3 bg-slate-900/90 border border-emerald-500/40 rounded-xl p-2 flex items-center justify-between text-[10px] text-emerald-400 font-mono animate-pulse">
                <span>ACOUSTIC SENSOR STREAMING...</span>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              </div>
            )}
          </div>
        </div>

        {/* Selected Auscultation Findings & Interpretation */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">{selectedSite.name}</span>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  selectedSite.category === 'cardiac'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {selectedSite.category}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              {selectedSite.findingDescription}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => playSimulatedSound(selectedSite.acousticType)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
              >
                {isPlayingAcoustic ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Re-listen Sound</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clinician Interpretation Checkbox */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinical Reasoning Pearl</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-snug">
              Auscultatory findings must be correlated with JVD, peripheral perfusion, and
              telemetry. Bibasilar rales + S4 gallop raise high suspicion for acute ischemic left
              heart strain or pulmonary edema.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setInterpretationSaved(true);
              audio.playLevelUp();
              setTimeout(() => {
                onClose();
              }, 600);
            }}
            className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {interpretationSaved ? 'Findings Documented in Chart' : 'Document Auscultation in Chart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
