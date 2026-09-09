import React from 'react';
import { Zap, ChevronRight, Info } from 'lucide-react';
import { LevelDetails } from '../../utils/levelProgression';
import { GAME_RANK_DISCLAIMER } from '../../types/gamification';

interface LevelProgressBarProps {
  details: LevelDetails;
  compact?: boolean;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  details,
  compact = false,
}) => {
  return (
    <div
      id="gamification-level-progress"
      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-mono font-black text-amber-600 text-xs shadow-xs">
            L{details.level}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{details.title}</span>
              <span className="text-[10px] font-mono font-normal text-slate-400">
                (Game Rank)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Level {details.level} ➔ Level {details.level + 1}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-mono text-xs font-black text-amber-600">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{details.totalXp} XP</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {details.xpRequiredForLevel - details.xpIntoLevel} XP to Level {details.level + 1}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1">
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            id="bar-level-progress"
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(4, details.progressPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold px-0.5">
          <span>{details.xpIntoLevel} XP</span>
          <span className="text-slate-600">{details.progressPercent}% to next rank</span>
          <span>{details.xpRequiredForLevel} XP</span>
        </div>
      </div>

      {!compact && (
        <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{GAME_RANK_DISCLAIMER}</span>
        </div>
      )}
    </div>
  );
};
