import React from 'react';
import { Trophy, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { LevelUpEvent, GAME_RANK_DISCLAIMER } from '../../types/gamification';
import { getCumulativeXpForLevel } from '../../utils/levelProgression';

interface LevelUpModalProps {
  event: LevelUpEvent | null;
  onDismiss: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ event, onDismiss }) => {
  if (!event) return null;

  const nextLevelRequirement = getCumulativeXpForLevel(event.newLevel + 1);

  return (
    <div
      id="modal-levelup-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        id="card-levelup-celebration"
        className="w-full max-w-sm bg-slate-900 text-white rounded-3xl border-2 border-amber-400/80 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Celebratory Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 stroke-[2.2] animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full border-2 border-slate-900 shadow">
            +{event.newLevel - event.previousLevel} LVL
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-amber-400 font-mono text-xs font-black tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RANK ELEVATION</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            LEVEL {event.newLevel} UNLOCKED
          </h2>
          <div className="mt-2 inline-block px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-black text-sm uppercase tracking-wider">
            {event.newTitle}
          </div>
        </div>

        {/* Level Transition Pill */}
        <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-between text-xs font-bold">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-mono">PREVIOUS</span>
            <span className="text-slate-300">Level {event.previousLevel}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 block font-mono">NEW RANK</span>
            <span className="text-white font-black">Level {event.newLevel}</span>
          </div>
        </div>

        {/* Game Rank Disclaimer */}
        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-snug">
            {GAME_RANK_DISCLAIMER}
          </p>
        </div>

        {/* Duolingo-style 3D Action Button */}
        <button
          id="btn-confirm-levelup"
          onClick={onDismiss}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 px-6 rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <span>CONTINUE CLINICAL DRILL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
