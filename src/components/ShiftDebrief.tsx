import React from 'react';
import {
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { ShiftMissedConcept, ShiftPerk } from '../types';

export interface ShiftDebriefProps {
  attendingApproval?: number;
  shiftScore?: number;
  totalAPSaved?: number;
  decisionTimes?: number[];
  missedConcepts?: ShiftMissedConcept[];
  activePerks?: ShiftPerk[];
  shiftNumber?: number;
  onAddToAnki?: (conceptId: string) => void;
  onClockInNextShift?: () => void;
  onReturnToMap?: () => void;
}

export const ShiftDebrief: React.FC<ShiftDebriefProps> = ({
  attendingApproval,
  shiftScore: propScore,
  totalAPSaved: propAPSaved,
  decisionTimes: propTimes,
  missedConcepts: propMissed,
  activePerks: propPerks,
  shiftNumber,
  onAddToAnki,
  onClockInNextShift,
  onReturnToMap,
}) => {
  const {
    user,
    shiftScore: storeScore,
    missedConcepts: storeMissed,
    decisionTimes: storeTimes,
    totalAPSaved: storeAPSaved,
    ankiQueueIds,
    addToAnkiQueue,
    clockInNextShift,
  } = useShiftStore();

  const effectiveTimes = propTimes || storeTimes;
  const averageDecisionTime =
    effectiveTimes.length > 0
      ? (effectiveTimes.reduce((a, b) => a + b, 0) / effectiveTimes.length).toFixed(1)
      : '1.8';

  const rating = attendingApproval !== undefined ? attendingApproval : user.attendingRating;
  const ratingGrade =
    rating >= 95
      ? 'Honors — Ready for Solo Attending'
      : rating >= 85
      ? 'Commendable — Solid Clinical Instincts'
      : rating >= 70
      ? 'Satisfactory — Mind Preload & Pitfalls'
      : 'Remediation Review Indicated';

  const missed = propMissed || storeMissed;
  const score = propScore !== undefined ? propScore : storeScore;
  const apSaved = propAPSaved !== undefined ? propAPSaved : storeAPSaved;

  return (
    <div
      id="shift-debrief-container"
      className="flex-1 flex flex-col justify-between p-5 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-4">
        {/* Debrief Header */}
        <div className="text-center pt-2 pb-1">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2 shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Night Shift Debriefing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift Log #{shiftNumber !== undefined ? shiftNumber : ((user.shiftsCompleted || 0) + 1)} • Attending Evaluation
          </p>
        </div>

        {/* Attending Grade Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Attending Evaluation
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {ratingGrade}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {rating}%
              </div>
              <div className="text-[10px] text-slate-400">Final Rating</div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold uppercase">
                <Zap className="w-3 h-3" /> XP Earned
              </div>
              <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                +{score}
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
              <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-bold uppercase">
                <Clock className="w-3 h-3" /> Avg Velocity
              </div>
              <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                {averageDecisionTime}s
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold uppercase">
                <ShieldCheck className="w-3 h-3" /> AP Saved
              </div>
              <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                {apSaved}
              </div>
            </div>
          </div>
        </div>

        {/* Missed Concepts / Anki Spaced-Repetition Queue */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-tight">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Shift Clinical Traps ({missed.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Spaced Repetition Integration
            </span>
          </div>

          {missed.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Zero Diagnostic Pitfalls!</div>
                <div className="text-emerald-700 text-[11px]">
                  Flawless triage and preload-dependent resuscitation across all 4 beds.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {missed.map((item: ShiftMissedConcept) => {
                const isInAnki = ankiQueueIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    id={`missed-concept-${item.id}`}
                    className="p-3.5 rounded-xl border border-rose-200 bg-white shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        {item.category} • {item.bedTitle}
                      </span>
                      <button
                        id={`btn-anki-${item.id}`}
                        onClick={() => (onAddToAnki ? onAddToAnki(item.id) : addToAnkiQueue(item.id))}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          isInAnki
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isInAnki ? (
                          <>
                            <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                            <span>Queued to Anki</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3 text-slate-500" />
                            <span>Add to Anki Deck</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed font-medium">
                      {item.promptOrScenario}
                    </div>

                    <div className="text-[11px] p-2 rounded-lg bg-rose-50/70 border border-rose-100 text-rose-950 space-y-1">
                      <div>
                        <span className="font-bold text-rose-700">Pitfall Chosen:</span>{' '}
                        {item.trapChosen}
                      </div>
                      <div>
                        <span className="font-bold text-rose-700">Why It Fails:</span>{' '}
                        {item.clinicalReason}
                      </div>
                    </div>

                    <div className="text-[11px] p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                      <span className="font-bold text-emerald-700">Correct Protocol:</span>{' '}
                      {item.correctAction}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clock In for Next Shift Button & Return to Map */}
      <div className="pt-3 pb-2 space-y-2">
        <button
          id="btn-clock-in-next-shift"
          onClick={onClockInNextShift || clockInNextShift}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-emerald-400" />
          <span>SIGN OUT & CLOCK IN NEXT SHIFT (+100 XP)</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {onReturnToMap && (
          <button
            id="btn-debrief-return-map"
            onClick={onReturnToMap}
            className="w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            ← Return to Shift Map
          </button>
        )}
      </div>
    </div>
  );
};
