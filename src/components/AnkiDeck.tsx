import React, { useState } from 'react';
import { RotateCw, CheckCircle2, AlertTriangle, Sparkles, Brain } from 'lucide-react';
import { audio } from '../utils/audio';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  pearl: string;
  intervalDays: number;
}

const SEED_CARDS: Flashcard[] = [
  {
    id: 'c1',
    front: 'Why are nitrates contraindicated in acute inferior myocardial infarction with RV involvement?',
    back: 'The ischemic right ventricle is strictly preload-dependent. Nitrates cause abrupt venodilation, dropping venous return and triggering profound cardiogenic shock.',
    pearl: 'Triad: Hypotension + Elevated JVP + Clear Lung Fields. Treat with IV volume loading.',
    intervalDays: 1,
  },
  {
    id: 'c2',
    front: 'What is the first-line vasopressor in septic shock, and what is the target MAP?',
    back: 'Norepinephrine (Levophed). Target Mean Arterial Pressure (MAP) ≥ 65 mmHg.',
    pearl: 'Initiate early if fluid resuscitation (30 mL/kg) fails to restore MAP.',
    intervalDays: 1,
  },
  {
    id: 'c3',
    front: 'What is the definitive immediate intervention for unstable polymorphic ventricular tachycardia?',
    back: 'Immediate unsynchronized high-energy defibrillation (200J biphasic).',
    pearl: 'Synchronization is impossible because irregular waveforms prevent R-wave gating.',
    intervalDays: 2,
  },
];

export const AnkiDeck: React.FC<{ onCardReviewed: () => void; initialCards?: Flashcard[] }> = ({
  onCardReviewed,
  initialCards,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards || SEED_CARDS);
  const [flipped, setFlipped] = useState<boolean>(false);
  const currentCard = cards[0];

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (rating === 'again') audio.playAlarm();
    else audio.playSuccess();

    setFlipped(false);
    setCards((prev) => prev.slice(1));
    onCardReviewed();
  };

  const handleRestart = () => {
    setCards(initialCards || SEED_CARDS);
    setFlipped(false);
    audio.playDebriefChime();
  };

  if (!currentCard) {
    return (
      <div
        id="anki-queue-cleared"
        className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn select-none"
      >
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Anki Queue Cleared!
          </h3>
          <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
            All spaced repetition intervals are preserved. Missed concepts from future Night Shifts will automatically appear here.
          </p>
        </div>
        <button
          id="btn-restart-anki-deck"
          onClick={handleRestart}
          className="mt-2 py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <RotateCw className="w-4 h-4" />
          <span>Practice Deck Again</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="anki-deck-container"
      className="flex-1 p-4 pb-20 flex flex-col justify-between space-y-4 animate-fadeIn select-none"
    >
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-700">
          <Brain className="w-4 h-4 text-rose-600" />
          <span>ANKI RETENTION QUEUE</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          {cards.length} Remaining
        </span>
      </div>

      {/* Flip Card */}
      <div
        id={`anki-flip-card-${currentCard.id}`}
        onClick={() => setFlipped(!flipped)}
        className="w-full min-h-[300px] bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all select-none relative"
      >
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
          <span>{flipped ? 'CLINICAL RATIONALE' : 'ACTIVE RECALL QUERY'}</span>
          <span className="text-rose-600">TAP TO FLIP</span>
        </div>

        <div className="my-auto py-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {flipped ? currentCard.back : currentCard.front}
          </h3>

          {flipped && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-snug">
              <strong>High-Yield Pearl: </strong>
              {currentCard.pearl}
            </div>
          )}
        </div>

        <div className="text-center text-[11px] font-semibold text-slate-400">
          Interval: {currentCard.intervalDays} Day(s)
        </div>
      </div>

      {/* SM-2 Rating Buttons */}
      {flipped ? (
        <div className="grid grid-cols-4 gap-2 animate-slideUp">
          <button
            id="btn-anki-rating-again"
            onClick={() => handleRating('again')}
            className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Again (1d)
          </button>
          <button
            id="btn-anki-rating-hard"
            onClick={() => handleRating('hard')}
            className="py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Hard (2d)
          </button>
          <button
            id="btn-anki-rating-good"
            onClick={() => handleRating('good')}
            className="py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Good (4d)
          </button>
          <button
            id="btn-anki-rating-easy"
            onClick={() => handleRating('easy')}
            className="py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Easy (7d)
          </button>
        </div>
      ) : (
        <button
          id="btn-anki-reveal-answer"
          onClick={() => setFlipped(true)}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
        >
          REVEAL ANSWER (SPACE)
        </button>
      )}
    </div>
  );
};
