import React, { useState } from 'react';
import { Moon, Clock, ArrowRight, Sliders, Activity, Target } from 'lucide-react';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import { DIFFICULTY_TIERS } from '../../data/nightShiftMedicalData';
import { DifficultySelector } from './DifficultySelector';
import { audio } from '../../utils/audio';
export const ShiftSetup: React.FC = () => {
  const { shift, reputation, selectDifficulty, startShift } = useNightShiftStore();
  const { level, xp } = useGamificationStore();
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const activeTierConfig =
    DIFFICULTY_TIERS.find((t) => t.tier === shift.selectedTier) || DIFFICULTY_TIERS[0];
  return (
    <div className="flex-1 flex flex-col justify-between p-4 space-y-4 overflow-y-auto select-none pb-20">
      {/* 1. Header Clinician Level vs ED Reputation Separation */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md border border-rose-400">
              R{level}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  Dr. Alex Chen
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase">
                  ON DUTY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">
                Player Level {level} • {xp} Total XP
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              ED Reputation
            </span>
            <span className="text-xs font-black text-white font-mono">
              Tier {reputation.tier} • {reputation.tierTitle}
            </span>
          </div>
        </div>

        {/* Reputation Progress Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>Department Standing XP</span>
            <span className="font-mono text-emerald-400">
              {reputation.reputationXP} / {reputation.maxReputationXP} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((reputation.reputationXP / reputation.maxReputationXP) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Main ED Shift Terminal Dossier (Exact User Prompt Specification) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-slate-900 text-white p-4 text-center border-b border-slate-800 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase mb-2">
            <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>NIGHT SHIFT PROTOCOL</span>
          </div>

          <h2 className="text-lg font-black tracking-wider uppercase text-white font-mono">
            RESUSQUEST ED
          </h2>
          <div className="text-xs font-mono text-rose-400 font-bold tracking-widest mt-0.5">
            SHIFT #{String(shift.shiftNumber).padStart(3, '0')}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono text-slate-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{shift.shiftHours}</span>
          </div>
        </div>

        {/* Shift Conditions Summary */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Patients In Roster
              </span>
              <span className="text-base font-black text-slate-900 font-mono">
                {activeTierConfig.patientCount} Cases
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                {activeTierConfig.simultaneousBeds} Simultaneous Beds
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Department Status
              </span>
              <span className="text-base font-black text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Stable
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                Green Bay Primed
              </span>
            </div>
          </div>

          {/* Difficulty Banner & Change Trigger */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500">
                  Current Difficulty
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                  Tier {activeTierConfig.tier}
                </span>
              </div>
              <h3 className="text-xs font-black text-slate-900">{activeTierConfig.title}</h3>
              <p className="text-[10px] text-slate-500">{activeTierConfig.subtitle}</p>
            </div>

            <button
              id="btn-open-difficulty-selector"
              onClick={() => {
                audio.playTelemetryClick();
                setShowDifficultyModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-600" />
              <span>Change</span>
            </button>
          </div>

          {/* Shift Objectives Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
              <Target className="w-3.5 h-3.5 text-rose-600" />
              <span>Shift Directives & Objectives</span>
            </div>

            <div className="space-y-1.5">
              {shift.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      {obj.title}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      {obj.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    +{obj.bonusXP} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactile Duolingo-style 3D Button: START SHIFT */}
        <div className="p-4 pt-2 bg-slate-50 border-t border-slate-200">
          <button
            id="btn-start-night-shift-cta"
            onClick={startShift}
            className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Activity className="w-5 h-5 text-rose-100 animate-pulse" />
            <span>START NIGHT SHIFT</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Difficulty Selector Modal Overlay */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <DifficultySelector
              currentTier={shift.selectedTier}
              unlockedTiers={reputation.unlockedTiers}
              onSelectTier={(tier) => {
                selectDifficulty(tier);
                setShowDifficultyModal(false);
              }}
              onClose={() => setShowDifficultyModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
