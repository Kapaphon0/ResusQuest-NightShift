import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { XPGainEvent } from '../../types/gamification';

interface XPGainToastProps {
  events: XPGainEvent[];
  onDismiss: (id: string) => void;
}

export const XPGainToast: React.FC<XPGainToastProps> = ({ events, onDismiss }) => {
  if (events.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4 select-none"
    >
      {events.map((event) => (
        <div
          key={event.id}
          id={`toast-xp-${event.id}`}
          onClick={() => onDismiss(event.id)}
          className={`pointer-events-auto cursor-pointer flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-xl border-2 transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
            event.isBonus
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-300 shadow-amber-500/25'
              : 'bg-slate-900 text-white border-amber-400/80 shadow-slate-950/40'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
              event.isBonus ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-400'
            }`}
          >
            {event.isBonus ? (
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            ) : (
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black tracking-tight text-amber-300">
                +{event.amount} XP
              </span>
              {event.isBonus && (
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-white/25 rounded-md text-white tracking-wider">
                  BONUS
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-200 leading-tight">
              {event.reason}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
