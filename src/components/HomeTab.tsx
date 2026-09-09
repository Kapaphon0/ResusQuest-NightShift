import React from 'react';
import {
  Activity,
  Award,
  Zap,
  Flame,
  Clock,
  ArrowRight,
  Brain,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Siren,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { AppTab } from './BottomNav';

interface HomeTabProps {
  onNavigateTab: (tab: AppTab) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigateTab }) => {
  const { user, status, currentBedIndex, beds, startShift, ankiQueueIds, missedConcepts } =
    useShiftStore();

  const dueReviewCount = ankiQueueIds.length;
  const currentBed = beds[currentBedIndex];

  return (
    <div
      id="home-tab-container"
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-3.5">
        {/* Department Banner Header */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                County General • Level 1 Trauma
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Emergency Department
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-xl shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-xs font-black font-mono">{user.streakDays}d Streak</span>
          </div>
        </div>

        {/* Resident On-Call Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black text-white text-base shadow-sm border border-rose-400/40">
                AM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-100">{user.name || 'Dr. Alex Mercer'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/30">
                    PGY-{user.level}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {user.role || 'Emergency Medicine Resident'} • Shift Resident
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black font-mono text-emerald-400">
                {user.attendingRating}%
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                Attending Trust
              </div>
            </div>
          </div>

          {/* XP & Level Progress */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Total XP: {user.xp}
              </span>
              <span className="text-slate-400">
                Next Rank: {user.xp % 300} / 300 XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${((user.xp % 300) / 300) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Shift Action Hero Banner */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <Siren className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {status === 'in_progress'
                    ? `Bed ${currentBed?.id} Crashing (${currentBedIndex + 1}/4)`
                    : status === 'shift_completed'
                    ? 'Shift Evaluation Ready'
                    : 'Upcoming Resus Shift #108'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {status === 'in_progress'
                    ? 'Active telemetry monitoring in progress'
                    : status === 'shift_completed'
                    ? 'Review attending debrief & sign out'
                    : '4 Critical Bays: 2 Triage + 2 Fog-of-War'}
                </div>
              </div>
            </div>

            {status === 'in_progress' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold animate-pulse border border-rose-200">
                IN PROGRESS
              </span>
            )}
          </div>

          {/* Primary Action Button */}
          {status === 'in_progress' ? (
            <button
              id="btn-home-resume-shift"
              onClick={() => onNavigateTab('shift')}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 px-4 rounded-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs uppercase tracking-wider">
                RETURN TO RESUSCITATION BAY (BED {currentBed?.id})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : status === 'shift_completed' ? (
            <button
              id="btn-home-view-debrief"
              onClick={() => onNavigateTab('shift')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider">
                VIEW ATTENDING SHIFT DEBRIEF
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-home-clock-in"
              onClick={() => {
                onNavigateTab('shift');
                startShift();
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 px-4 rounded-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 cursor-pointer"
            >
              <Siren className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">
                CLOCK IN FOR NIGHT SHIFT (+100 XP)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Spaced Repetition Review Prompt if due */}
        {dueReviewCount > 0 && (
          <div
            id="card-due-review-alert"
            onClick={() => onNavigateTab('review')}
            className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-950">
                  {dueReviewCount} Clinical Traps in Anki Deck
                </div>
                <div className="text-[11px] text-amber-800">
                  Review spaced-repetition pearls to prevent resuscitation errors.
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
        )}

        {/* High-Yield Clinical Pearl of the Day */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Chief Attending Pearl
            </span>
            <span className="text-[9px] font-mono text-slate-400">BOARD ESSENTIAL</span>
          </div>
          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            <strong className="text-rose-700">Right Ventricular STEMI:</strong> Look for ST elevation in V4R. The right ventricle is strictly preload-dependent. Avoid nitrates, diuretics, and opioids which cause precipitously fatal hypotension; load isotonic crystalloids first.
          </p>
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('learn')}
              className="text-[10px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Resuscitation Protocol Atlas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Shift Bays Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>RESUSCITATION BAY ROSTER</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Continuous 12-hour shift
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {beds.map((bed, idx) => (
              <div
                key={bed.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] font-bold">
                    BED {bed.id}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      bed.completed
                        ? 'text-emerald-600'
                        : idx === currentBedIndex && status === 'in_progress'
                        ? 'text-rose-600 font-black animate-pulse'
                        : 'text-slate-400'
                    }`}
                  >
                    {bed.completed ? 'Cleared' : bed.type === 'swipe_triage' ? 'Triage Surge' : 'Fog of War'}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 truncate">
                  {bed.title}
                </div>
                <div className="text-[9px] text-slate-400">
                  {bed.type === 'swipe_triage' ? '4 Telemetry Flashcases' : 'AP Workup & Resus'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
