import React from 'react';
import { Shield, Star, AlertTriangle, Check } from 'lucide-react';
import { DIFFICULTY_TIERS } from '../../data/nightShiftMedicalData';
import { audio } from '../../utils/audio';
interface DifficultySelectorProps {
  currentTier: number;
  unlockedTiers: number[];
  onSelectTier: (tier: number) => void;
  onClose?: () => void;
}
export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentTier,
  unlockedTiers,
  onSelectTier,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-4 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Select Night Shift Difficulty</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            You can de-escalate or escalate difficulty freely. Player level and reputation are never reset.
          </p>
        </div>
        {onClose && (
          <button
            onClick={() => {
              audio.playTelemetryClick();
              onClose();
            }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100 cursor-pointer"
          >
            Done
          </button>
        )}
      </div>

      {/* De-escalation Rule Banner */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-bold">Clinical De-escalation:</strong> Lower tiers provide a
          calmer clinical environment and scaled XP rewards (60% — 100%). Use this anytime to
          warm up, experiment, or rebuild confidence after tough shifts.
        </p>
      </div>

      {/* Difficulty Tiers Scrollable List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {DIFFICULTY_TIERS.map((tier) => {
          const isUnlocked = unlockedTiers.includes(tier.tier);
          const isSelected = currentTier === tier.tier;

          return (
            <div
              key={tier.tier}
              onClick={() => {
                if (isUnlocked) {
                  onSelectTier(tier.tier);
                } else {
                  audio.playWarningTone();
                }
              }}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-rose-50/80 border-rose-500 shadow-sm'
                  : isUnlocked
                  ? 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                  : 'bg-slate-100/40 border-slate-200/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Tier {tier.tier}
                    </span>
                    <h3 className="text-xs font-black text-slate-900">{tier.title}</h3>
                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-rose-600 uppercase">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight pt-1">
                    {tier.description}
                  </p>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-0.5 shrink-0 pl-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3 h-3 ${
                        idx < tier.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tier Specs Pill Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-600">
                <div className="flex items-center gap-3">
                  <span>Patients: {tier.patientCount}</span>
                  <span>•</span>
                  <span>Simultaneous Beds: {tier.simultaneousBeds}</span>
                  <span>•</span>
                  <span className="text-rose-600 font-mono">
                    XP Multiplier: {Math.round(tier.xpMultiplier * 100)}%
                  </span>
                </div>
                {!isUnlocked && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Locked (Rep {tier.requiredReputationLevel})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
