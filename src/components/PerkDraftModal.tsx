import React from 'react';
import {
  ShieldAlert,
  Scan,
  Zap,
  Eye,
  Flame,
  Pill,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { shiftPerks } from '../data/shiftContent';
import { ShiftPerk } from '../types';

export interface PerkDraftModalProps {
  onSelectPerk?: (perk: ShiftPerk) => void;
  onClose?: () => void;
}

export const PerkDraftModal: React.FC<PerkDraftModalProps> = ({
  onSelectPerk,
  onClose,
}) => {
  const { isDraftingPerk, activePerks, draftPerk, closePerkDraft, currentBedIndex } = useShiftStore();

  if (!isDraftingPerk) return null;

  // Filter out perks already equipped
  const availablePerks = shiftPerks.filter(
    (perk) => !activePerks.some((ap) => ap.id === perk.id)
  );

  const getPerkIcon = (iconName: string) => {
    const iconProps = { className: 'w-5 h-5 text-amber-500 shrink-0' };
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert {...iconProps} />;
      case 'Scan':
        return <Scan {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'Eye':
        return <Eye {...iconProps} />;
      case 'Flame':
        return <Flame {...iconProps} />;
      case 'Pill':
        return <Pill {...iconProps} />;
      default:
        return <Zap {...iconProps} />;
    }
  };

  const handleSelect = (perk: ShiftPerk) => {
    if (onSelectPerk) {
      onSelectPerk(perk);
    } else {
      draftPerk(perk);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closePerkDraft();
    }
  };

  return (
    <div
      id="perk-draft-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="perk-draft-card"
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
      >
        <button
          id="btn-close-perk-modal"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1 pr-6">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Tactical ED Requisition
            </h2>
            <p className="text-xs text-slate-500">
              Shift Transfer Requisition for Bed {currentBedIndex + 1}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 my-3 leading-relaxed">
          Select one shift advantage to equip into your resuscitation toolkit before
          entering the next clinical zone:
        </p>

        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 py-1">
          {availablePerks.slice(0, 3).map((perk) => (
            <button
              key={perk.id}
              id={`draft-perk-${perk.id}`}
              onClick={() => handleSelect(perk)}
              className="w-full text-left p-3 rounded-xl border-2 border-slate-200 hover:border-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3 group active:scale-[0.98] border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-0.5"
            >
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs group-hover:border-slate-300">
                {getPerkIcon(perk.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {perk.name}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {perk.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Perks: {activePerks.length}</span>
          <span className="font-medium text-slate-500">Duolingo-style instant equip</span>
        </div>
      </div>
    </div>
  );
};
