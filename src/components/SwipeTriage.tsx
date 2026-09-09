import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Zap,
  Flame,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { swipeTriageCards } from '../data/shiftContent';
import { audio } from '../utils/audio';

const TOTAL_TIME_SECONDS = 30;

export interface SwipeTriageProps {
  bedNumber?: number;
  onTriageAction?: (cardId: string, action: 'CRASH' | 'STABLE', timeTakenSeconds: number) => boolean | void;
  attendingApproval?: number;
  onCompleteSession?: () => void;
}

export const SwipeTriage: React.FC<SwipeTriageProps> = ({
  bedNumber,
  onTriageAction,
  attendingApproval,
  onCompleteSession,
}) => {
  const { currentBedIndex, submitSwipeTriage, advanceBed, beds } = useShiftStore();
  const { awardQuestionXP } = useGamificationStore();

  // Cards for this bed: Bed 1 gets cards 0..3, Bed 3 gets cards 4..7
  const isBed1 = currentBedIndex === 0;
  const deck = isBed1 ? swipeTriageCards.slice(0, 4) : swipeTriageCards.slice(4, 8);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [triageHistory, setTriageHistory] = useState<
    Array<{ id: string; action: 'CRASH' | 'STABLE'; isCorrect: boolean; takeaway: string }>
  >([]);

  // Card gesture state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCard = deck[currentIndex];

  // Play heartbeat when new card appears
  useEffect(() => {
    if (currentCard && !isTimeUp) {
      cardStartTimeRef.current = Date.now();
      audio.playHeartbeat(
        currentCard.telemetry.hr,
        currentCard.correctAction === 'CRASH'
      );
    }
  }, [currentIndex, currentCard, isTimeUp]);

  // 30-Second Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTimeUp(true);
          audio.playAlarm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTriageAction = useCallback(
    (action: 'CRASH' | 'STABLE') => {
      if (!currentCard || isTimeUp) return;

      const elapsed = Math.max(1, Math.round((Date.now() - cardStartTimeRef.current) / 1000));
      const actionResult = onTriageAction
        ? onTriageAction(currentCard.id, action, elapsed)
        : submitSwipeTriage(currentCard.id, action, elapsed);
      const isCorrect = typeof actionResult === 'boolean' ? actionResult : (currentCard.correctAction === action);

      // Track in centralized gamification engine: +10 XP for correct decision (awarded once per card)
      awardQuestionXP(currentCard.id, isCorrect, false, 'Ambulance Triage');

      if (isCorrect) {
        audio.playSuccess();
        setStreak((prev) => {
          const next = prev + 1;
          if (next > maxStreak) setMaxStreak(next);
          return next;
        });
        setCorrectCount((c) => c + 1);
      } else {
        audio.playAlarm();
        setStreak(0);
      }

      setTriageHistory((prev) => [
        ...prev,
        {
          id: currentCard.id,
          action,
          isCorrect,
          takeaway: currentCard.takeaway,
        },
      ]);

      // Move to next card or complete
      if (currentIndex + 1 < deck.length) {
        setSwipeDirection(action === 'CRASH' ? 'right' : 'left');
        setTimeout(() => {
          setSwipeDirection(null);
          setDragOffset({ x: 0, y: 0 });
          setCurrentIndex((idx) => idx + 1);
        }, 180);
      } else {
        setSwipeDirection(action === 'CRASH' ? 'right' : 'left');
        setTimeout(() => {
          setIsTimeUp(true);
        }, 220);
      }
    },
    [currentCard, isTimeUp, submitSwipeTriage, currentIndex, deck.length, maxStreak]
  );

  // Keyboard controls: 'A' or ArrowLeft for STABLE, 'D' or ArrowRight for CRASH
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTimeUp || !currentCard) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        handleTriageAction('STABLE');
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        handleTriageAction('CRASH');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriageAction, isTimeUp, currentCard]);

  // Pointer / Touch Gestures for Smooth Drag Physics
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTimeUp || !currentCard) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 95;
    if (dragOffset.x > threshold) {
      handleTriageAction('CRASH');
    } else if (dragOffset.x < -threshold) {
      handleTriageAction('STABLE');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Drag visual calculations
  const rotation = dragOffset.x * 0.08;
  const crashOpacity = Math.min(1, Math.max(0, dragOffset.x / 80));
  const stableOpacity = Math.min(1, Math.max(0, -dragOffset.x / 80));

  // Transform style
  let transform = `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.3}px, 0) rotate(${rotation}deg)`;
  if (swipeDirection === 'right') {
    transform = 'translate3d(400px, 20px, 0) rotate(25deg)';
  } else if (swipeDirection === 'left') {
    transform = 'translate3d(-400px, 20px, 0) rotate(-25deg)';
  }

  // Summary / Time-up state
  if (isTimeUp || !currentCard) {
    const totalAnswered = triageHistory.length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    return (
      <div
        id="triage-round-complete"
        className="flex-1 flex flex-col justify-between p-5 overflow-y-auto space-y-4 pb-20 select-none"
      >
        <div className="space-y-4">
          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 text-white shadow-md mb-2">
              <Zap className="w-7 h-7 text-amber-400 fill-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Triage Surge Cleared
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bed {beds[currentBedIndex]?.id}: 30-Second Rapid Telemetry Evaluation
            </p>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {accuracy}%
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  {correctCount}/{totalAnswered} Correct
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Peak Streak</div>
                <div className="text-base font-bold font-mono text-amber-600 mt-0.5 flex items-center justify-center gap-0.5">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {maxStreak}x
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Combo Flow</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Remaining</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {timeLeft}s
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Time Bank</div>
              </div>
            </div>

            {/* Quick Pearls from this rapid session */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Session Clinical Pearls:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {triageHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs border ${
                      item.isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>
                        Patient {idx + 1}: {item.isCorrect ? 'Correct Decision' : 'Diagnostic Error'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug">
                      {item.takeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tactile 3D Advance Button */}
        <div className="pt-3 pb-2">
          <button
            id="btn-triage-conclude"
            onClick={onCompleteSession || advanceBed}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer"
          >
            <span>CONCLUDE TRIAGE & ADVANCE SHIFT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isCriticalRhythm =
    currentCard.telemetry.hr === 0 ||
    currentCard.telemetry.hr > 180 ||
    currentCard.telemetry.bp === '0/0';

  return (
    <div
      id="swipe-triage-arena"
      className="flex-1 flex flex-col justify-between p-4 pb-16 select-none overflow-hidden"
    >
      {/* 30-Second Countdown & Telemetry Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
              BED {beds[currentBedIndex]?.id}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Streak Badge */}
          {streak > 1 ? (
            <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide animate-bounce shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>{streak}X STREAK</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-400 font-medium">
              Case {currentIndex + 1} of {deck.length}
            </div>
          )}
        </div>

        {/* Timer Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft <= 7 ? 'bg-rose-500 animate-pulse' : 'bg-rose-600'
            }`}
            style={{ width: `${(timeLeft / TOTAL_TIME_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipeable Triage Card Stack */}
      <div className="relative flex-1 flex items-center justify-center my-3 min-h-[360px]">
        {/* Underneath Card Ghost */}
        {currentIndex + 1 < deck.length && (
          <div className="absolute inset-x-2 top-4 bottom-0 bg-white/70 border border-slate-300 rounded-2xl -z-10 scale-95 opacity-60 shadow-xs" />
        )}

        {/* Active Draggable Card */}
        <div
          id={`triage-card-${currentCard.id}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform,
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            touchAction: 'none',
          }}
          className="w-full bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing relative"
        >
          {/* Visual Triage Direction Overlays */}
          <div
            style={{ opacity: crashOpacity }}
            className="pointer-events-none absolute inset-0 bg-rose-600/15 border-4 border-rose-500 rounded-2xl z-20 flex items-center justify-end p-6 transition-opacity"
          >
            <div className="bg-rose-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl rotate-12 shadow-lg border-2 border-white uppercase tracking-wider">
              CRASH / STAT
            </div>
          </div>

          <div
            style={{ opacity: stableOpacity }}
            className="pointer-events-none absolute inset-0 bg-emerald-600/15 border-4 border-emerald-500 rounded-2xl z-20 flex items-center justify-start p-6 transition-opacity"
          >
            <div className="bg-emerald-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl -rotate-12 shadow-lg border-2 border-white uppercase tracking-wider">
              STABLE / MEDS
            </div>
          </div>

          {/* Simulated Medical Telemetry Header */}
          <div className="bg-slate-950 p-3 text-white border-b border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 text-[10px]">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCriticalRhythm ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                Telemetry Strip • {currentCard.category}
              </span>
              <span className="font-mono text-slate-400 text-[9px]">MONITOR CH-1</span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 text-center font-mono">
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <div className="flex items-center justify-center gap-0.5 text-[8px] text-emerald-400 uppercase">
                  <Heart className="w-2 h-2" /> HR
                </div>
                <div className="text-xs font-bold text-emerald-300">
                  {currentCard.telemetry.hr > 0 ? currentCard.telemetry.hr : '0'}
                </div>
              </div>

              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <div className="text-[8px] text-amber-400 uppercase">BP</div>
                <div className="text-[11px] font-bold text-amber-300 truncate">
                  {currentCard.telemetry.bp}
                </div>
              </div>

              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <div className="flex items-center justify-center gap-0.5 text-[8px] text-cyan-400 uppercase">
                  <Wind className="w-2 h-2" /> RR
                </div>
                <div className="text-xs font-bold text-cyan-300">
                  {currentCard.telemetry.rr}
                </div>
              </div>

              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <div className="flex items-center justify-center gap-0.5 text-[8px] text-blue-400 uppercase">
                  <Activity className="w-2 h-2" /> SpO2
                </div>
                <div className="text-xs font-bold text-blue-300">
                  {currentCard.telemetry.spo2}
                </div>
              </div>
            </div>

            {currentCard.telemetry.rhythm && (
              <div className="mt-1.5 text-[9px] text-slate-300 font-mono flex items-center justify-between bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                <span className="text-slate-500">RHYTHM:</span>
                <span className="text-rose-400 font-bold truncate">
                  {currentCard.telemetry.rhythm}
                </span>
              </div>
            )}
          </div>

          {/* Clinical Presentation Body */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
                {currentCard.category} Pathway
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Swipe or Keyboard (A / D)
              </span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed min-h-[72px]">
              {currentCard.prompt}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>← Swipe Left for Stable</span>
              <span>Swipe Right for Crash →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile 3D Action Controls */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          {/* STABLE Button (Left / A) */}
          <button
            id="btn-triage-stable"
            onClick={() => handleTriageAction('STABLE')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-3 rounded-2xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-100" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">
                [A] STABLE / MEDS
              </div>
              <div className="text-[9px] text-emerald-100 font-normal">
                Standard Protocol
              </div>
            </div>
          </button>

          {/* CRASH Button (Right / D) */}
          <button
            id="btn-triage-crash"
            onClick={() => handleTriageAction('CRASH')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 px-3 rounded-2xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
          >
            <AlertTriangle className="w-5 h-5 text-rose-100" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">
                [D] CRASH / RESUS
              </div>
              <div className="text-[9px] text-rose-100 font-normal">
                Emergent Shock / Defib
              </div>
            </div>
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-400 font-medium">
          Keyboard: Press <kbd className="px-1 py-0.5 bg-slate-200 rounded font-mono text-slate-700">A</kbd> for Stable, <kbd className="px-1 py-0.5 bg-slate-200 rounded font-mono text-slate-700">D</kbd> for Crash.
        </div>
      </div>
    </div>
  );
};
