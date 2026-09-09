import React, { useState } from 'react';
import { Check, Lock, Star, Trophy, ArrowRight, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { audio } from '../utils/audio';
import { useGamificationStore } from '../store/useGamificationStore';
import { LevelProgressBar } from './gamification/LevelProgressBar';

interface PathStep {
  id: string;
  title: string;
  subtitle: string;
  type: 'lesson' | 'boss';
  status: 'completed' | 'active' | 'locked';
  xp: number;
  difficult?: boolean;
}

interface DrillContent {
  scenario: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

const DRILL_QUESTIONS: Record<string, DrillContent> = {
  node_1: {
    scenario: '58M presenting with inferior STEMI (II, III, aVF) and BP 82/48 with clear lung fields. What is the immediate priority?',
    options: [
      { text: 'Hold all nitrates, infuse 1L IV crystalloid bolus, and check right-sided lead V4R', correct: true, explanation: 'The RV is strictly preload-dependent. Systemic venodilators cause immediate cardiovascular collapse.' },
      { text: 'Administer sublingual nitroglycerin 0.4 mg for ischemic chest pain', correct: false, explanation: 'Contraindicated! Venodilation destroys RV preload.' },
      { text: 'Push IV Metoprolol 5 mg to reduce myocardial oxygen demand', correct: false, explanation: 'Contraindicated in bradycardia and acute cardiogenic shock.' },
    ],
  },
  node_2: {
    scenario: '24M with left tension pneumothorax, tracheal deviation to the right, and BP 70/40. What is the immediate priority?',
    options: [
      { text: 'Immediate needle or finger thoracostomy in 4th/5th ICS anterior axillary line', correct: true, explanation: 'Tension pneumothorax is a clinical emergency; decompression immediately relieves venous obstruction.' },
      { text: 'Send to CT scanner stat for definitive thoracic evaluation', correct: false, explanation: 'Fatal delay! Patients arrest during transport.' },
      { text: 'Positive-pressure endotracheal intubation (RSI) before decompression', correct: false, explanation: 'Positive pressure will acutely convert simple or tension pneumothorax into complete cardiovascular collapse.' },
    ],
  },
  node_3: {
    scenario: '62F with septic shock and refractory hypotension (MAP 52) despite 30 mL/kg balanced crystalloids. What is first-line vasopressor?',
    options: [
      { text: 'Initiate Norepinephrine infusion titrated to target MAP >= 65 mmHg', correct: true, explanation: 'Norepinephrine is the first-line vasopressor in septic shock (Surviving Sepsis Guidelines).' },
      { text: 'Infuse Dopamine at renal-dose rates (2-5 mcg/kg/min)', correct: false, explanation: 'Dopamine has higher tachyarrhythmia rates and no renal benefit.' },
      { text: 'Push boluses of Phenylephrine every 2 minutes', correct: false, explanation: 'Pure alpha-1 agonist causes reflex bradycardia and reduced cardiac output.' },
    ],
  },
  node_4: {
    scenario: '48M collapses abruptly; monitor demonstrates pulseless Ventricular Tachycardia at 220 bpm. The defibrillator arrives.',
    options: [
      { text: 'Immediate unsynchronized defibrillation (200J biphasic) followed by 2 minutes CPR', correct: true, explanation: 'Pulseless VT is a shockable arrest rhythm; rapid unsynchronized shock maximizes ROSC.' },
      { text: 'Deliver synchronized cardioversion at 50J', correct: false, explanation: 'Synchronization is impossible and ineffective in pulseless chaotic rhythms.' },
      { text: 'Administer 1 mg Epinephrine IV push before shock', correct: false, explanation: 'Early shocks take priority over vasopressors in shockable arrest.' },
    ],
  },
  node_boss: {
    scenario: 'CODE BLUE TRIAL: Refractory VFib cardiac arrest after 2 shocks and 1 mg Epinephrine. What is the first-line antiarrhythmic?',
    options: [
      { text: 'Administer Amiodarone 300 mg IV push (or Lidocaine 100 mg)', correct: true, explanation: 'ACLS standard: Amiodarone 300 mg IV push after second shock in refractory VF/pVT.' },
      { text: 'Administer Atropine 1 mg IV push', correct: false, explanation: 'Atropine has no role in ventricular fibrillation or pulseless arrest.' },
      { text: 'Push Adenosine 6 mg rapid IV push', correct: false, explanation: 'Adenosine only blocks AV nodal conduction in SVT; lethal in VF.' },
    ],
  },
};

const INITIAL_PATH: PathStep[] = [
  { id: 'node_1', title: 'Inferior STEMI & RV Infarct', subtitle: 'Preload Sensitivity', type: 'lesson', status: 'completed', xp: 50 },
  { id: 'node_2', title: 'Tension Pneumothorax', subtitle: 'Needle Decompression', type: 'lesson', status: 'active', xp: 50 },
  { id: 'node_3', title: 'Septic Shock Resus', subtitle: 'Norepinephrine Targets', type: 'lesson', status: 'locked', xp: 50 },
  { id: 'node_4', title: 'Pulseless VTach & VFib', subtitle: 'Defibrillation Rules', type: 'lesson', status: 'locked', xp: 50 },
  { id: 'node_boss', title: '👑 THE CHEST PAIN CASE', subtitle: 'Clinical Boss Battle • Branching Resus', type: 'boss', status: 'active', xp: 150, difficult: true },
];

export const LearnPath: React.FC<{
  onCompleteLesson?: (xp: number) => void;
  onStartBossCase?: () => void;
}> = ({ onCompleteLesson, onStartBossCase }) => {
  const [pathSteps, setPathSteps] = useState<PathStep[]>(INITIAL_PATH);
  const [activeLesson, setActiveLesson] = useState<PathStep | null>(null);
  const [quizState, setQuizState] = useState<{ answered: boolean; correct: boolean; mistakes: number } | null>(null);

  const {
    lessonsCompleted,
    perfectLessons,
    levelDetails,
    awardQuestionXP,
    completeLesson,
    completeClinicalCase,
  } = useGamificationStore();

  const handleStartNode = (step: PathStep) => {
    if (step.status === 'locked') return;
    if (step.id === 'node_boss' && onStartBossCase) {
      onStartBossCase();
      return;
    }
    setActiveLesson(step);
    setQuizState(null);
  };

  const handleAnswer = (isCorrect: boolean) => {
    const prevMistakes = quizState?.mistakes || 0;
    const currentMistakes = isCorrect ? prevMistakes : prevMistakes + 1;
    setQuizState({ answered: true, correct: isCorrect, mistakes: currentMistakes });

    if (activeLesson) {
      // Award question XP (+10 for normal, +20 for difficult boss trial). Awarded once per question.
      awardQuestionXP(
        `drill_${activeLesson.id}`,
        isCorrect,
        Boolean(activeLesson.difficult),
        activeLesson.title
      );
    }

    if (isCorrect) audio.playSuccess();
    else audio.playAlarm();
  };

  const handleFinishDrill = () => {
    if (!activeLesson) return;

    if (quizState?.correct) {
      const isPerfect = (quizState.mistakes || 0) === 0;

      // Complete lesson in centralized gamification engine: +50 XP (+50 bonus if perfect)
      const lessonResult = completeLesson(activeLesson.id, isPerfect, activeLesson.title);

      // If it's the boss trial, also complete as a clinical case: +100 XP
      if (activeLesson.type === 'boss') {
        completeClinicalCase(`case_${activeLesson.id}`, activeLesson.title);
      }

      if (onCompleteLesson) {
        onCompleteLesson(lessonResult.xp);
      }

      // Advance path state: current becomes completed, next locked becomes active
      setPathSteps((prev) => {
        const currentIndex = prev.findIndex((s) => s.id === activeLesson.id);
        return prev.map((step, idx) => {
          if (step.id === activeLesson.id) {
            return { ...step, status: 'completed' };
          }
          if (idx === currentIndex + 1 && step.status === 'locked') {
            return { ...step, status: 'active' };
          }
          return step;
        });
      });
    }

    setActiveLesson(null);
    setQuizState(null);
  };

  const currentDrill = activeLesson ? DRILL_QUESTIONS[activeLesson.id] || DRILL_QUESTIONS.node_2 : null;
  const isAlreadyCompleted = activeLesson ? lessonsCompleted.includes(activeLesson.id) : false;
  const isAlreadyPerfected = activeLesson ? perfectLessons.includes(activeLesson.id) : false;

  return (
    <div
      id="learn-path-container"
      className="flex-1 p-4 pb-20 space-y-4 animate-fadeIn select-none overflow-y-auto"
    >
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          CURRICULUM TREE
        </span>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          EMERGENCY RESUSCITATION
        </h2>
        <p className="text-xs text-slate-500 font-semibold">
          Complete micro-lessons (+50 XP) & flawless runs (+50 Bonus) to unlock the Code Blue Boss (+100 XP).
        </p>
      </div>

      {/* Embedded Level Progress Bar */}
      <LevelProgressBar details={levelDetails} compact />

      {/* Stepping Stones Pathway */}
      <div className="flex flex-col items-center space-y-5 py-2">
        {pathSteps.map((step) => {
          const isBoss = step.type === 'boss';
          const isDone = step.status === 'completed' || lessonsCompleted.includes(step.id);

          return (
            <div key={step.id} className="flex flex-col items-center">
              <button
                id={`btn-path-node-${step.id}`}
                onClick={() => handleStartNode(step)}
                disabled={step.status === 'locked'}
                className={`w-16 h-16 rounded-full flex items-center justify-center border-b-4 transition-all relative ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-700 text-white shadow-md cursor-pointer'
                    : step.status === 'active'
                    ? isBoss
                      ? 'bg-rose-600 border-rose-800 text-white shadow-lg animate-bounce cursor-pointer'
                      : 'bg-rose-600 border-rose-800 text-white shadow-lg ring-4 ring-rose-200 cursor-pointer'
                    : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                } active:border-b-0 active:translate-y-1`}
              >
                {isDone ? (
                  <Check className="w-8 h-8 stroke-[3]" />
                ) : step.status === 'locked' ? (
                  <Lock className="w-6 h-6" />
                ) : isBoss ? (
                  <Trophy className="w-8 h-8 stroke-[2.5]" />
                ) : (
                  <Star className="w-8 h-8 fill-white stroke-[2]" />
                )}
              </button>

              <div className="text-center mt-2 max-w-[170px]">
                <h4 className="text-xs font-black text-slate-800 leading-tight">
                  {step.title}
                </h4>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                  {step.subtitle}
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-1">
                  {isBoss ? '+100 XP Case' : '+50 XP Lesson'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Micro-Lesson Modal */}
      {activeLesson && currentDrill && (
        <div
          id="modal-micro-lesson"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                  {activeLesson.type === 'boss' ? 'BOSS CASE' : 'LESSON'} • +{activeLesson.xp} XP
                </span>
                {isAlreadyCompleted && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    BANKED
                  </span>
                )}
              </div>
              <button
                id="btn-close-lesson-modal"
                onClick={() => setActiveLesson(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-sm font-black text-slate-900 leading-snug">
              {currentDrill.scenario}
            </h3>

            <div className="space-y-2">
              {currentDrill.options.map((opt, i) => (
                <button
                  key={i}
                  id={`btn-drill-opt-${i}`}
                  disabled={quizState?.answered}
                  onClick={() => handleAnswer(opt.correct)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    quizState?.answered && opt.correct
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                      : quizState?.answered && !opt.correct
                      ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>{opt.text}</div>
                  {quizState?.answered && opt.correct && (
                    <div className="text-[10px] font-medium text-emerald-800 mt-1">
                      {opt.explanation}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {quizState?.answered && (
              <div className="space-y-2 pt-1">
                {quizState.correct ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-bold">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isAlreadyCompleted
                        ? 'Lesson already mastered (Practice review)'
                        : (quizState.mistakes || 0) === 0
                        ? 'Flawless run! +50 XP Lesson + 50 Bonus XP!'
                        : 'Protocol correct! +50 XP Lesson complete.'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                    Incorrect intervention! Review pathophysiology explanation above and retry.
                  </div>
                )}

                <button
                  id="btn-continue-lesson"
                  onClick={handleFinishDrill}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{quizState.correct ? 'FINISH & ADVANCE' : 'RETRY DRILL'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
