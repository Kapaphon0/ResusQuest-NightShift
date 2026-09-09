import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  BookmarkCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { audio } from '../utils/audio';

interface AnkiCardData {
  id: string;
  category: string;
  prompt: string;
  pitfall: string;
  correctProtocol: string;
  pearl: string;
}

const DEFAULT_CORE_CARDS: AnkiCardData[] = [
  {
    id: 'core-anki-1',
    category: 'CARDIAC',
    prompt: '58M presenting with acute inferior STEMI (ST-elevation in II, III, aVF) and BP 84/50. The nurse has sublingual nitroglycerin ready.',
    pitfall: 'Administering nitroglycerin will precipitously collapse venous return and cardiac output because the right ventricle is strictly preload-dependent.',
    correctProtocol: 'Order V4R to confirm RV infarction. Withhold all venodilators (nitrates/morphine). Infuse rapid 1L IV crystalloid boluses and prepare for emergent PCI.',
    pearl: 'In inferior STEMI with clear lung fields and hypotension, think RV infarction until proven otherwise. Fluid resuscitation is life-saving.',
  },
  {
    id: 'core-anki-2',
    category: 'TRAUMA',
    prompt: '24M stabbed in left 4th ICS, tracheal deviation to right, absent left breath sounds, BP 70/40. Junior resident requests stat portable CXR.',
    pitfall: 'Waiting for radiographic confirmation causes cardiac arrest from obstructed venous return.',
    correctProtocol: 'Immediate bedside finger thoracostomy or needle decompression in the 4th/5th ICS anterior axillary line, followed by tube thoracostomy.',
    pearl: 'Tension pneumothorax is purely a clinical diagnosis. Never order imaging on a crashing patient with asymmetric breath sounds and tracheal deviation.',
  },
  {
    id: 'core-anki-3',
    category: 'TOX',
    prompt: '22F ingested unknown antidepressant 2 hours ago. Telemetry shows wide complex tachycardia (QRS 148 ms) and terminal R wave in aVR.',
    pitfall: 'Administering procainamide, flecainide, or physostigmine can induce refractory asystole.',
    correctProtocol: 'Push 1-2 mEq/kg Sodium Bicarbonate IV push immediately to overcome fast sodium channel blockade and alkalinize the serum to pH 7.50-7.55.',
    pearl: 'QRS > 100 ms predicts seizures; QRS > 160 ms predicts ventricular dysrhythmias in TCA poisoning.',
  },
  {
    id: 'core-anki-4',
    category: 'CARDIAC',
    prompt: '68M with end-stage renal disease missing hemodialysis for 5 days. Monitor shows wide sinusoidal rhythm (sine wave) at 44 bpm.',
    pitfall: 'Administering insulin/dextrose or kayexalate first without membrane stabilization.',
    correctProtocol: 'Immediate IV Calcium Gluconate 3g (or Calcium Chloride 1g via central/good IV) over 2 minutes to antagonize cardiac membrane toxicity.',
    pearl: 'IV Calcium protects the myocardium within 1-3 minutes but does NOT lower serum potassium. Follow immediately with insulin/D50W and emergent dialysis.',
  },
];

export const ReviewTab: React.FC = () => {
  const { ankiQueueIds, missedConcepts, removeFromAnkiQueue, user } = useShiftStore();

  // Combine missed concepts from shift + core default cards
  const shiftCards: AnkiCardData[] = missedConcepts.map((m) => ({
    id: m.id,
    category: m.category,
    prompt: m.promptOrScenario,
    pitfall: m.clinicalReason,
    correctProtocol: m.correctAction,
    pearl: `Clinical Trap: Avoid ${m.trapChosen}. Recognize high-yield patterns early.`,
  }));

  // Match all cards
  const allAvailableCards = [...shiftCards, ...DEFAULT_CORE_CARDS];
  const activeDeck =
    ankiQueueIds.length > 0
      ? allAvailableCards.filter((c) => ankiQueueIds.includes(c.id))
      : DEFAULT_CORE_CARDS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = activeDeck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    audio.playHeartbeat(75, false);
  };

  const handleSpacedRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (rating === 'again') {
      audio.playAlarm();
    } else {
      audio.playSuccess();
    }

    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);

    if (currentIndex + 1 < activeDeck.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
      audio.playDebriefChime();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setIsComplete(false);
  };

  return (
    <div
      id="review-tab-container"
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <Brain className="w-3.5 h-3.5 text-rose-600" />
              <span>Spaced Repetition Deck</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Anki Clinical Flashcards
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {activeDeck.length} Cards Active
            </span>
          </div>
        </div>

        {/* Completion Screen */}
        {isComplete ? (
          <div
            id="review-complete-card"
            className="p-6 bg-white border-2 border-emerald-300 rounded-2xl shadow-sm text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">
                Anki Deck Review Complete!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You reviewed {reviewedCount} high-yield clinical traps. Recall intervals updated.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-around font-mono text-xs">
              <div>
                <div className="text-[9px] text-amber-400 uppercase font-bold">XP Earned</div>
                <div className="text-base font-bold">+{reviewedCount * 15} XP</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <div className="text-[9px] text-emerald-400 uppercase font-bold">Mastery</div>
                <div className="text-base font-bold">100% Cleared</div>
              </div>
            </div>

            <button
              id="btn-restart-anki-review"
              onClick={handleRestart}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PRACTICE DECK AGAIN</span>
            </button>
          </div>
        ) : (
          /* Active Card Area */
          <div className="space-y-3">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>CARD {currentIndex + 1} OF {activeDeck.length}</span>
              <span className="text-rose-600 font-bold uppercase tracking-wider">
                {currentCard?.category} PATHWAY
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeDeck.length) * 100}%` }}
              />
            </div>

            {/* Flashcard Container */}
            <div
              id={`anki-card-viewport-${currentCard?.id}`}
              onClick={handleFlip}
              className="min-h-[300px] bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-all relative overflow-hidden"
            >
              {/* Card Watermark */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1 font-bold">
                  <Brain className="w-3 h-3 text-rose-500" />
                  {isFlipped ? 'REVEALED PROTOCOL & PEARL' : 'CLINICAL PRESENTATION & TRAP'}
                </span>
                <span className="underline text-slate-500">
                  {isFlipped ? 'Tap to flip to question' : 'Tap anywhere to reveal'}
                </span>
              </div>

              {/* Card Body */}
              {!isFlipped ? (
                <div className="py-4 space-y-3">
                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                    Scenario / Immediate Risk:
                  </div>
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">
                    {currentCard?.prompt}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 italic">
                    What is the catastrophic pitfall to avoid, and what is the definitive first-line resuscitation protocol?
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-2.5 animate-in fade-in duration-200">
                  {/* Pitfall Box */}
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs">
                    <span className="font-bold text-rose-700 uppercase text-[9px] block mb-0.5">
                      Lethal Pitfall:
                    </span>
                    <p className="text-[11px] leading-snug">{currentCard?.pitfall}</p>
                  </div>

                  {/* Correct Protocol Box */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                    <span className="font-bold text-emerald-700 uppercase text-[9px] block mb-0.5">
                      Evidence-Based Protocol:
                    </span>
                    <p className="text-[11px] leading-snug">{currentCard?.correctProtocol}</p>
                  </div>

                  {/* High Yield Board Pearl */}
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs">
                    <span className="font-bold text-amber-400 uppercase text-[9px] block mb-0.5">
                      Chief Attending Pearl:
                    </span>
                    <p className="text-[11px] text-slate-200 leading-snug">{currentCard?.pearl}</p>
                  </div>
                </div>
              )}

              {/* Card Footer Hint */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Space-Repetition Recall</span>
                <span>{isFlipped ? 'Rate difficulty below' : 'Tap to Flip'}</span>
              </div>
            </div>

            {/* Bottom Controls */}
            {!isFlipped ? (
              <button
                id="btn-flip-anki-card"
                onClick={handleFlip}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>TAP TO FLIP & REVEAL PROTOCOL</span>
              </button>
            ) : (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
                  Select Recall Rating:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    id="btn-rating-again"
                    onClick={() => handleSpacedRating('again')}
                    className="p-2 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 font-bold text-center active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <div className="text-[11px] font-black">AGAIN</div>
                    <div className="text-[9px] text-rose-500">&lt; 1 min</div>
                  </button>

                  <button
                    id="btn-rating-hard"
                    onClick={() => handleSpacedRating('hard')}
                    className="p-2 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-700 font-bold text-center active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <div className="text-[11px] font-black">HARD</div>
                    <div className="text-[9px] text-amber-600">12 hours</div>
                  </button>

                  <button
                    id="btn-rating-good"
                    onClick={() => handleSpacedRating('good')}
                    className="p-2 rounded-xl bg-blue-50 border-2 border-blue-300 text-blue-700 font-bold text-center active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <div className="text-[11px] font-black">GOOD</div>
                    <div className="text-[9px] text-blue-600">1 day</div>
                  </button>

                  <button
                    id="btn-rating-easy"
                    onClick={() => handleSpacedRating('easy')}
                    className="p-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-bold text-center active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <div className="text-[11px] font-black">EASY</div>
                    <div className="text-[9px] text-emerald-600">3 days</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
