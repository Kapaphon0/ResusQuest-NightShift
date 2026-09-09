import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  Scan,
  Zap,
  Eye,
  Flame,
  Pill,
  Sparkles,
  Check,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { audio } from '../utils/audio';

export const TopHUD: React.FC = () => {
  const {
    user,
    beds,
    currentBedIndex,
    shiftScore,
    activePerks,
  } = useShiftStore();

  const [isMuted, setIsMuted] = useState(audio.isMuted);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const getPerkIcon = (iconName: string) => {
    const iconProps = { className: 'w-3.5 h-3.5' };
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

  // Color code attending rating
  const rating = user.attendingRating;
  const ratingColor =
    rating >= 90
      ? 'text-emerald-400'
      : rating >= 75
      ? 'text-amber-400'
      : 'text-rose-400';

  const progressBg =
    rating >= 90
      ? 'bg-emerald-500'
      : rating >= 75
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <header
      id="top-hud-container"
      className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-md select-none shrink-0"
    >
      {/* Top Bar: Attending Approval & Mute */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1 font-medium tracking-wide">
            <span className="text-slate-400 uppercase text-[10px] font-bold">
              Attending Approval
            </span>
            <span className={`font-mono font-bold text-xs ${ratingColor}`}>
              {rating}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${progressBg}`}
              style={{ width: `${Math.max(0, Math.min(100, rating))}%` }}
            />
          </div>
        </div>

        {/* XP counter & Mute */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-semibold text-slate-100">
              +{shiftScore} <span className="text-[10px] text-slate-400">XP</span>
            </span>
          </div>

          <button
            id="btn-toggle-sound"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute telemetry sound' : 'Mute telemetry sound'}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Bed Progress Stepper: 4 Bed Pills */}
      <div className="flex items-center justify-between gap-1.5 py-1">
        {beds.map((bed, index) => {
          const isCompleted = bed.completed;
          const isCurrent = index === currentBedIndex && !isCompleted;
          const isUpcoming = index > currentBedIndex;

          return (
            <div
              key={bed.id}
              id={`bed-stepper-pill-${bed.id}`}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[11px] font-semibold tracking-tight transition-all ${
                isCompleted
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-rose-950/80 border border-rose-500 text-rose-100 ring-1 ring-rose-500/50 shadow-sm'
                  : 'bg-slate-800/60 border border-slate-700/40 text-slate-500'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCurrent ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
                  }`}
                />
              )}
              <span className="truncate">Bed {bed.id}</span>
            </div>
          );
        })}
      </div>

      {/* Active Perks Tray (if any equipped) */}
      {activePerks.length > 0 && (
        <div
          id="active-perks-tray"
          className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
            Perks:
          </span>
          <div className="flex items-center gap-1.5">
            {activePerks.map((perk) => (
              <div
                key={perk.id}
                title={`${perk.name}: ${perk.description}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-medium shrink-0"
              >
                <span className="text-amber-400">{getPerkIcon(perk.icon)}</span>
                <span className="truncate max-w-[90px]">{perk.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
