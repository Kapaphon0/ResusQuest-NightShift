import React from 'react';
import { X, BookOpen, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { MedicalGlossaryEntry } from '../../data/medicalGlossary';
import { audio } from '../../utils/audio';

interface MedicalGlossaryModalProps {
  entry: MedicalGlossaryEntry | null;
  onClose: () => void;
}

export const MedicalGlossaryModal: React.FC<MedicalGlossaryModalProps> = ({
  entry,
  onClose,
}) => {
  if (!entry) return null;

  const handleClose = () => {
    audio.playTelemetryClick();
    onClose();
  };

  const getCategoryBadge = (category: MedicalGlossaryEntry['category']) => {
    switch (category) {
      case 'cardiology':
        return { label: 'Cardiology', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'resuscitation':
        return { label: 'ACLS Resus', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'pharmacology':
        return { label: 'Pharmacology', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'trauma':
        return { label: 'Trauma & ATLS', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'diagnostics':
        return { label: 'Diagnostics', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'airway':
        return { label: 'Airway / Pulm', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      default:
        return { label: 'Clinical', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const badge = getCategoryBadge(entry.category);

  return (
    <div
      id="medical-glossary-modal-backdrop"
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        id="medical-glossary-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 text-slate-100 animate-in slide-in-from-bottom duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Touch-To-Explain Clinical Directive
              </span>
            </div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{entry.term}</span>
            </h3>
          </div>

          <button
            id="btn-close-glossary-modal"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700 active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plain-English Definition */}
        <div className="space-y-1.5 bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>In Plain English</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {entry.plainDefinition}
          </p>
        </div>

        {/* Why it Matters Clinical Caveat */}
        <div className="space-y-1.5 bg-rose-950/30 rounded-2xl p-3.5 border border-rose-900/50">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Why It Matters & Clinical Trap</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
            {entry.whyItMatters}
          </p>
        </div>

        {/* Tactile Dismiss Button */}
        <button
          id="btn-dismiss-glossary-modal"
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950 text-white font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Understood • Return to Case</span>
        </button>
      </div>
    </div>
  );
};
