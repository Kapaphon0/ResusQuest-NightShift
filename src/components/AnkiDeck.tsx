import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2 } from 'lucide-react';
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
    front: 'Why are nitrates strictly contraindicated in acute RV myocardial infarction?',
    back: 'Loss of RV Preload Induction. The infarcted right ventricle behaves as a passive conduit. Systemic venous return directly dictates left ventricular filling.',
    pearl: "Consider Starling's law of the heart when ischemic RV output is strictly dependent on venous return pressures.",
    intervalDays: 1,
  },
  {
    id: 'c2',
    front: 'What is the first-line vasopressor in septic shock, and what is the target MAP?',
    back: 'Norepinephrine (Levophed). Target Mean Arterial Pressure (MAP) ≥ 65 mmHg to maintain vital organ microvascular perfusion.',
    pearl: 'Initiate early if initial fluid resuscitation (30 mL/kg balanced crystalloids) fails to restore MAP.',
    intervalDays: 1,
  },
  {
    id: 'c3',
    front: 'What is the definitive immediate intervention for unstable polymorphic ventricular tachycardia?',
    back: 'Immediate unsynchronized high-energy defibrillation (200J biphasic). Rapid unsynchronized shock takes priority over drugs.',
    pearl: 'Synchronization is impossible because polymorphic irregular waveforms prevent stable R-wave gating.',
    intervalDays: 2,
  },
];

export const AnkiDeck: React.FC<{
  onCardReviewed: () => void;
  initialCards?: Flashcard[];
}> = ({ onCardReviewed, initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards || SEED_CARDS);
  const [totalCount] = useState<number>((initialCards || SEED_CARDS).length);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [hintOpen, setHintOpen] = useState<boolean>(false);
  const [dossierOpen, setDossierOpen] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(258); // 04:18

  // Session timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentCard = cards[0];
  const reviewedCount = totalCount - cards.length;
  const progressPct = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 100;

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (rating === 'again') audio.playAlarm();
    else audio.playSuccess();

    setIsFlipped(false);
    setHintOpen(false);
    setCards((prev) => prev.slice(1));
    onCardReviewed();
  };

  const handleRestart = () => {
    setCards(initialCards || SEED_CARDS);
    setIsFlipped(false);
    setHintOpen(false);
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
            Recall Queue Cleared!
          </h3>
          <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
            All spaced repetition intervals are preserved. Missed concepts from future Night Shifts will automatically appear here.
          </p>
        </div>
        <button
          id="btn-restart-anki-deck"
          onClick={handleRestart}
          className="mt-2 py-3 px-5 rounded-2xl bg-primary hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <RotateCw className="w-4 h-4" />
          <span>Practice Deck Again</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="recall-cockpit-container"
      className="flex-1 flex flex-col w-full px-3 pt-3 pb-24 gap-3 bg-surface min-h-screen select-none relative overflow-y-auto"
    >
      {/* 1. Retention Telemetry Header */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-slate-200/60">
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
            <span className="font-label-mono text-label-mono text-primary uppercase font-bold tracking-wider">
              {cards.length} {cards.length === 1 ? 'CARD' : 'CARDS'} DUE IN SHIFT
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-label-mono text-label-mono">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>SESSION {formatSessionTime(sessionSeconds)}</span>
          </div>
        </div>

        {/* Key Metric Barometer Array */}
        <div className="grid grid-cols-3 gap-1 py-2 bg-surface-container-low rounded-lg px-2 text-center">
          <div className="flex flex-col items-center">
            <span className="font-label-micro text-label-micro text-secondary uppercase">30D Recall</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-metric-md text-metric-md text-on-surface">92</span>
              <span className="font-label-micro text-label-micro text-secondary">%</span>
            </div>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200/60">
            <span className="font-label-micro text-label-micro text-secondary uppercase">SM-2 Multi</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-metric-md text-metric-md text-on-surface">{currentCard.intervalDays * 1.5}</span>
              <span className="font-label-micro text-label-micro text-secondary">x</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-label-micro text-label-micro text-secondary uppercase">Daily Heap</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-metric-md text-metric-md text-primary font-bold">
                {reviewedCount}
              </span>
              <span className="font-label-micro text-label-micro text-secondary">/ {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Red Cadence Progress Bar */}
        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(15, progressPct)}%` }}
          />
        </div>
      </section>

      {/* 2. 3D Interactive Clinical Flashcard Section */}
      <section className="w-full relative [perspective:1000px]">
        <div
          id="flashcard-container"
          onClick={() => {
            audio.playTelemetryClick();
            setIsFlipped(!isFlipped);
          }}
          className={`relative w-full min-h-[380px] transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* FRONT OF CARD: Question & ECG Snapshot */}
          <div
            id="card-front"
            className="absolute inset-0 w-full bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-xs border border-slate-200/70 [backface-visibility:hidden]"
          >
            <div className="flex flex-col gap-2.5">
              {/* Card Tag & Action Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-error-container rounded-md">
                  <span
                    className="material-symbols-outlined text-primary text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span className="font-label-mono text-label-mono text-primary font-bold tracking-tight uppercase">
                    CARDIOVASCULAR • V4R STEMI
                  </span>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  <span className="font-label-micro text-label-micro uppercase">
                    CARD #{currentCard.id}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">touch_app</span>
                </div>
              </div>

              {/* Prompt Typography */}
              <div className="mt-1">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                  {currentCard.front}
                </h2>
              </div>

              {/* Lead V4R ECG Telemetry Snapshot Vector */}
              <div className="w-full bg-surface-container-low rounded-lg p-2 relative overflow-hidden border border-slate-200/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-mono text-label-mono text-secondary uppercase tracking-widest text-[9px]">
                    LEAD V4R • 25mm/s • 10mm/mV
                  </span>
                  <span className="font-label-micro text-label-micro px-1 py-0.5 bg-primary-container text-on-primary rounded font-bold">
                    ST ELEV +2.5mm
                  </span>
                </div>

                {/* ECG Waveform Grid */}
                <svg className="w-full h-16 text-on-surface" fill="none" preserveAspectRatio="none" viewBox="0 0 340 70">
                  <path d="M 0 10 H 340 M 0 25 H 340 M 0 40 H 340 M 0 55 H 340" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
                  <path d="M 30 0 V 70 M 70 0 V 70 M 110 0 V 70 M 150 0 V 70 M 190 0 V 70 M 230 0 V 70 M 270 0 V 70 M 310 0 V 70" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
                  <path
                    d="M 0 45 L 35 45 L 42 42 L 48 45 L 60 45 L 64 52 L 72 12 L 80 54 L 84 32 L 120 32 L 132 45 L 175 45 L 182 42 L 188 45 L 200 45 L 204 52 L 212 12 L 220 54 L 224 32 L 260 32 L 272 45 L 340 45"
                    stroke="#b70011"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <div className="text-primary font-label-micro text-label-micro font-bold flex items-center justify-end gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                  <span>INFARCT RECIPROCAL RECESSION</span>
                </div>
              </div>

              {/* Expandable Hint Pod */}
              <div className="w-full">
                <button
                  id="hint-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHintOpen(!hintOpen);
                  }}
                  className="w-full flex items-center justify-between py-2 px-3 bg-surface-container rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                    <span className="font-label-sans text-label-sans text-on-surface font-semibold">PHYSIOLOGY HINT</span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-secondary text-[16px] transition-transform ${
                      hintOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {hintOpen && (
                  <div
                    id="hint-content"
                    className="mt-1 p-2.5 bg-surface-container-high rounded-lg text-on-surface font-body-sm text-body-sm leading-relaxed border border-slate-200/50"
                  >
                    {currentCard.pearl || "Consider Starling's law of the heart when ischemic RV output is strictly dependent on venous return pressures."}
                  </div>
                )}
              </div>
            </div>

            {/* Flip Trigger Banner */}
            <div className="pt-3 flex items-center justify-center gap-1 text-secondary font-label-mono text-label-mono border-t border-slate-100">
              <span className="material-symbols-outlined text-[16px] text-primary">flip</span>
              <span className="uppercase tracking-wider">TAP CARD TO REVEAL PROTOCOL</span>
            </div>
          </div>

          {/* BACK OF CARD: Pathophysiology & Action Directive */}
          <div
            id="card-back"
            className="absolute inset-0 w-full bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-xs border border-slate-200/70 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <div className="flex flex-col gap-2.5">
              {/* Back Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded-md">
                  <span className="material-symbols-outlined text-on-surface text-[14px]">clinical_notes</span>
                  <span className="font-label-mono text-label-mono text-on-surface font-bold uppercase">CORRECT DIRECTIVE</span>
                </div>
                <span className="font-label-micro text-label-micro text-secondary uppercase font-mono">REV-{currentCard.id}</span>
              </div>

              {/* Key Diagnostic Answer Point */}
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {currentCard.back.split('.')[0]}
                </h3>
                <p className="font-body-md text-body-md text-secondary leading-normal">
                  {currentCard.back.split('.').slice(1).join('.') || currentCard.back}
                </p>
              </div>

              {/* Pathophysiology Core Points Container */}
              <div className="flex flex-col gap-1.5 bg-surface-container-low p-2.5 rounded-lg border border-slate-200/40">
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="font-body-sm text-body-sm text-on-surface">
                    <strong>Nitroglycerin venodilation</strong> causes precipitous drops in systemic pre-load.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="font-body-sm text-body-sm text-on-surface">
                    <strong>Stroke Volume Collapse:</strong> RV failure leads to immediate downstream LV underfilling and severe circulatory shock.
                  </span>
                </div>
              </div>

              {/* Trauma Red Directive Callout */}
              <div className="bg-primary text-on-primary p-2.5 rounded-lg flex flex-col gap-1 shadow-xs">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">crisis_alert</span>
                  <span className="font-label-mono text-label-mono font-bold tracking-wider uppercase">PRIMARY DIRECTIVE</span>
                </div>
                <p className="font-body-sm text-body-sm font-semibold leading-snug text-white">
                  Withhold vasodilators & diuretics. Administer immediate IV Crystalloid Bolus (500–1000 mL) to optimize right-sided preload.
                </p>
              </div>
            </div>

            {/* Flip Back Footnote */}
            <div className="pt-2 flex items-center justify-center gap-1 text-secondary font-label-mono text-label-micro border-t border-slate-100">
              <span className="material-symbols-outlined text-[14px]">undo</span>
              <span className="uppercase">TAP TO RETURN TO QUERY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dossier Expansion Trigger Button */}
      <button
        id="open-dossier-btn"
        onClick={() => setDossierOpen(true)}
        className="w-full py-2.5 px-3 bg-surface-container-lowest rounded-xl shadow-xs border border-slate-200/70 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">science</span>
          <span className="font-label-mono text-label-mono font-bold text-on-surface tracking-wide uppercase">
            INSPECT PATHOPHYSIOLOGY DOSSIER
          </span>
        </div>
        <span className="material-symbols-outlined text-secondary text-[18px]">open_in_full</span>
      </button>

      {/* 4. SM-2 Confidence Grading Cockpit */}
      <section className="w-full bg-surface-container-lowest p-2.5 rounded-xl shadow-xs border border-slate-200/70 flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="font-label-micro text-label-micro text-secondary uppercase font-bold tracking-wider">
            SM-2 ESTIMATED LATENCY
          </span>
          <span className="font-label-micro text-label-micro text-secondary uppercase">
            RATING MATRIX
          </span>
        </div>

        {/* 4-Button Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Again Button */}
          <button
            id="btn-anki-rating-again"
            onClick={() => handleRating('again')}
            className="flex flex-col items-center justify-center p-2 bg-surface-container-low rounded-lg transition-transform active:scale-95 group hover:bg-error-container cursor-pointer"
            type="button"
          >
            <span className="font-label-mono text-label-mono text-primary font-bold">Again</span>
            <span className="font-label-micro text-label-micro text-secondary mt-1">&lt;1 min</span>
            <div className="w-full h-1 bg-primary-container rounded-full mt-1.5" />
          </button>

          {/* Hard Button */}
          <button
            id="btn-anki-rating-hard"
            onClick={() => handleRating('hard')}
            className="flex flex-col items-center justify-center p-2 bg-surface-container-low rounded-lg transition-transform active:scale-95 group hover:bg-surface-container cursor-pointer"
            type="button"
          >
            <span className="font-label-mono text-label-mono text-on-surface font-bold">Hard</span>
            <span className="font-label-micro text-label-micro text-secondary mt-1">1 day</span>
            <div className="w-full h-1 bg-on-surface-variant rounded-full mt-1.5" />
          </button>

          {/* Good Button */}
          <button
            id="btn-anki-rating-good"
            onClick={() => handleRating('good')}
            className="flex flex-col items-center justify-center p-2 bg-surface-container-low rounded-lg transition-transform active:scale-95 group hover:bg-surface-container cursor-pointer"
            type="button"
          >
            <span className="font-label-mono text-label-mono text-secondary font-bold">Good</span>
            <span className="font-label-micro text-label-micro text-secondary mt-1">3 days</span>
            <div className="w-full h-1 bg-secondary rounded-full mt-1.5" />
          </button>

          {/* Easy Button */}
          <button
            id="btn-anki-rating-easy"
            onClick={() => handleRating('easy')}
            className="flex flex-col items-center justify-center p-2 bg-surface-container-low rounded-lg transition-transform active:scale-95 group hover:bg-surface-container cursor-pointer"
            type="button"
          >
            <span className="font-label-mono text-label-mono text-on-surface font-bold">Easy</span>
            <span className="font-label-micro text-label-micro text-secondary mt-1">6 days</span>
            <div className="w-full h-1 bg-inverse-surface rounded-full mt-1.5" />
          </button>
        </div>
      </section>

      {/* 5. Secondary Pathophysiology Dossier Modal Drawer */}
      {dossierOpen && (
        <div className="fixed inset-0 z-50 flex items-end animate-fadeIn">
          {/* Backdrop Dim */}
          <div
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-xs"
            onClick={() => setDossierOpen(false)}
          />

          {/* Drawer Canvas */}
          <div className="relative w-full max-h-[750px] bg-surface-container-lowest rounded-t-2xl p-4 shadow-2xl flex flex-col gap-3 overflow-y-auto transform transition-transform duration-300 ease-out z-10">
            {/* Handle & Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-xs" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  RV INFARCTION HEMODYNAMICS
                </h3>
              </div>
              <button
                className="p-1 text-secondary hover:text-on-surface cursor-pointer rounded-lg hover:bg-slate-100"
                onClick={() => setDossierOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Graphic 1: PV Loop Comparison */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-label-mono text-secondary uppercase">
                  PV LOOP: RV COMPLIANCE COLLAPSE
                </span>
                <span className="font-label-micro text-label-micro text-primary font-bold">
                  EDV/ESV SHIFT
                </span>
              </div>
              <div className="w-full h-36 bg-surface-container-low rounded-lg p-2 relative border border-slate-200/50">
                <svg className="w-full h-full text-on-surface" fill="none" viewBox="0 0 300 120">
                  <path d="M 30 15 V 105 H 280" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                  <text fill="currentColor" fontFamily="JetBrains Mono" fontSize="8" opacity="0.4" x="35" y="25">
                    LV/RV PRESSURE (mmHg)
                  </text>
                  <text fill="currentColor" fontFamily="JetBrains Mono" fontSize="8" opacity="0.4" x="200" y="100">
                    VOLUME (mL)
                  </text>
                  {/* Normal RV Loop (Slate Dotted) */}
                  <path
                    d="M 90 95 C 130 95 160 85 170 80 C 175 60 170 35 155 35 C 125 35 100 55 90 95 Z"
                    stroke="#565e74"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  {/* Ischemic RV Loop (Trauma Red) */}
                  <path
                    d="M 120 98 C 145 98 175 92 185 88 C 188 75 180 60 160 60 C 135 60 125 80 120 98 Z"
                    stroke="#b70011"
                    strokeWidth="2"
                  />
                  <path d="M 155 45 L 140 65" stroke="#b70011" strokeWidth="1.5" />
                </svg>
                <div className="absolute bottom-2 left-3 flex gap-3 font-label-micro text-label-micro">
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-secondary inline-block" /> Normal Baseline
                  </span>
                  <span className="text-primary flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-primary inline-block" /> Ischemic RV Profile
                  </span>
                </div>
              </div>
            </div>

            {/* Graphic 2: Coronary Anatomy Dependency */}
            <div className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono text-secondary uppercase">
                CORONARY OCCLUSION TERRITORY
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-surface-container rounded-lg flex flex-col gap-0.5">
                  <span className="font-label-micro text-label-micro text-secondary uppercase">Culprit Artery</span>
                  <span className="font-body-md text-body-md font-bold text-on-surface">Proximal RCA</span>
                  <span className="font-body-sm text-body-sm text-secondary">Branches: Acute Marginal & PDA</span>
                </div>
                <div className="p-2.5 bg-surface-container rounded-lg flex flex-col gap-0.5">
                  <span className="font-label-micro text-label-micro text-secondary uppercase">Complication</span>
                  <span className="font-body-md text-body-md font-bold text-primary">AV Block (III°)</span>
                  <span className="font-body-sm text-body-sm text-secondary">AV Nodal Branch ischemia in 90%</span>
                </div>
              </div>
            </div>

            {/* Action Footer within Drawer */}
            <button
              className="w-full py-3 bg-inverse-surface text-inverse-on-surface rounded-xl font-label-mono text-label-mono font-bold tracking-wider uppercase mt-1 cursor-pointer active:scale-98 transition-all"
              onClick={() => setDossierOpen(false)}
              type="button"
            >
              RETURN TO COCKPIT RECALL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

