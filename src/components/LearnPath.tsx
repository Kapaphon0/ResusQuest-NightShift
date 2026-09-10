import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  Lock,
  Play,
  Skull,
  X,
  ChevronRight,
  BookOpen,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Activity,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { audio } from '../utils/audio';
import { useGamificationStore } from '../store/useGamificationStore';

export interface PathStep {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  type: 'lesson' | 'boss';
  status: 'completed' | 'active' | 'locked';
  xp: number;
  difficult?: boolean;
}

interface DrillContent {
  scenario: string;
  protocolTitle: string;
  warning: string;
  steps: { num: number; title: string; landmark: string; text: string }[];
  equipment: { name: string; value: string }[];
  options: { text: string; correct: boolean; explanation: string }[];
}

const STORAGE_KEY_UNLOCKED = 'resus_learn_unlocked_nodes';

const DRILL_QUESTIONS: Record<string, DrillContent> = {
  node_1: {
    protocolTitle: 'Inferior STEMI & RV Shock Protocol',
    warning: 'Nitrates, Morphine, and Diuretics abolish RV preload and trigger catastrophic cardiovascular collapse.',
    steps: [
      {
        num: 1,
        title: 'Lead V4R Electrocardiogram',
        landmark: '5th ICS Right MCL',
        text: 'Obtain right-sided 12-lead ECG immediately to detect right ventricular infarction (ST elevation >= 1mm in V4R).',
      },
      {
        num: 2,
        title: 'Hold All Preload Reducers',
        landmark: 'Medication Safety',
        text: 'Strictly withhold Nitroglycerin, Morphine, and Diuretics to protect right ventricular filling pressure.',
      },
      {
        num: 3,
        title: 'Aggressive Volume Loading',
        landmark: 'IV Crystalloids',
        text: 'Administer rapid 500–1000 mL IV balanced crystalloid bolus to maintain right-sided stroke volume.',
      },
    ],
    equipment: [
      { name: 'IV Access', value: 'Dual 18G' },
      { name: 'Fluid Bolus', value: '1,000 mL NS' },
    ],
    scenario: '58M presenting with inferior STEMI (II, III, aVF) and BP 82/48 with clear lung fields. What is the immediate life-saving priority?',
    options: [
      {
        text: 'Hold all nitrates, infuse 1L IV crystalloid bolus, and check right-sided lead V4R',
        correct: true,
        explanation: 'The RV is strictly preload-dependent. Systemic venodilators cause immediate refractory shock and cardiovascular collapse.',
      },
      {
        text: 'Administer sublingual nitroglycerin 0.4 mg for ischemic chest pain relief',
        correct: false,
        explanation: 'Lethal contraindication! Systemic venodilation abolishes RV filling, precipitating profound hypotension.',
      },
      {
        text: 'Push IV Metoprolol 5 mg to reduce myocardial oxygen demand',
        correct: false,
        explanation: 'Contraindicated in acute cardiogenic shock, bradycardia, and hemodynamic instability.',
      },
    ],
  },
  node_2: {
    protocolTitle: 'Needle & Finger Thoracostomy Protocol',
    warning: 'Positive-pressure ventilation prior to pleural decompression acutely precipitates complete cardiovascular collapse.',
    steps: [
      {
        num: 1,
        title: 'Emergency Landmark Identification',
        landmark: '5th ICS Anterior Axillary',
        text: 'Locate 5th Intercostal Space anterior axillary line (preferred adult emergency resuscitation site).',
      },
      {
        num: 2,
        title: 'Needle Catheter Trajectory',
        landmark: '14G / >= 8.25cm',
        text: 'Advance 14G catheter perpendicular to chest wall directly OVER superior rib border to bypass intercostal vessels.',
      },
      {
        num: 3,
        title: 'Audible Decompression & Tube Placement',
        landmark: 'Flash & Rush of Air',
        text: 'Confirm audible air release under high pressure; immediately convert to formal tube thoracostomy with water seal.',
      },
    ],
    equipment: [
      { name: 'Needle Gauge', value: '14G / 10G' },
      { name: 'Min Length', value: '8.25 cm' },
    ],
    scenario: '24M with traumatic left tension pneumothorax, tracheal deviation to right, SpO2 78%, and BP 70/40. What is the immediate resuscitation priority?',
    options: [
      {
        text: 'Immediate needle or finger thoracostomy in 4th/5th ICS anterior axillary line',
        correct: true,
        explanation: 'Tension pneumothorax is a clinical diagnosis requiring instant decompression to restore venous return and cardiac output.',
      },
      {
        text: 'Transport stat to CT scanner for definitive imaging of thoracic injury',
        correct: false,
        explanation: 'Fatal delay! Patients rapidly arrest during transit. Clinical decompression must precede any diagnostic imaging.',
      },
      {
        text: 'Proceed with positive-pressure endotracheal intubation (RSI) before chest decompression',
        correct: false,
        explanation: 'Positive pressure acutely increases intrathoracic pressure, collapsing the inferior vena cava and causing immediate cardiac arrest.',
      },
    ],
  },
  node_3: {
    protocolTitle: 'Emergency Pericardiocentesis Protocol',
    warning: "Beck's Triad: Hypotension, JVD, muffled heart sounds. Puncturing right ventricle causes fatal hemopericardium.",
    steps: [
      {
        num: 1,
        title: 'Subxiphoid Needle Angle',
        landmark: '30°–45° Left Shoulder',
        text: 'Insert 18G echogenic spinal needle 1 cm inferior to left xiphisternal junction, angled toward left shoulder.',
      },
      {
        num: 2,
        title: 'Continuous Negative Aspiration',
        landmark: '20 mL Syringe',
        text: 'Maintain continuous negative pressure until non-clotting pericardial blood is aspirated, immediately relieving tamponade.',
      },
      {
        num: 3,
        title: 'Seldinger Catheter Securing',
        landmark: 'Pigtail Catheter',
        text: 'Advance guidewire, dilate tract, and place pigtail catheter to gravity drainage until emergent surgical sternotomy.',
      },
    ],
    equipment: [
      { name: 'Needle', value: '18G 90mm Spinal' },
      { name: 'Syringe', value: '20 mL Luer-Lok' },
    ],
    scenario: '42F with penetrating chest trauma presents with BP 74/46, distant heart sounds, and engorged neck veins (Beck’s Triad). Bedside echo shows large pericardial effusion with RV diastolic collapse. What is the immediate priority?',
    options: [
      {
        text: 'Subxiphoid emergency pericardiocentesis with needle angled toward left shoulder while aspirating',
        correct: true,
        explanation: 'Pericardial tamponade is an obstructive shock emergency; removing as little as 20–50 mL of blood dramatically restores cardiac output.',
      },
      {
        text: 'Administer IV Furosemide 40 mg to reduce jugular venous distension and preload',
        correct: false,
        explanation: 'Lethal error! Tamponade requires high filling pressures. Diuretics cause instantaneous cardiovascular collapse.',
      },
      {
        text: 'Initiate positive-pressure mechanical ventilation with 15 cmH2O PEEP',
        correct: false,
        explanation: 'High intrathoracic pressure abolishes venous return in tamponade, causing immediate pulseless electrical activity (PEA).',
      },
    ],
  },
  node_4: {
    protocolTitle: 'Emergency Cricothyroidotomy Protocol',
    warning: 'Cannot Intubate, Cannot Oxygenate (CICO). Hesitation leads to irreversible anoxic brain injury within 180 seconds.',
    steps: [
      {
        num: 1,
        title: 'Laryngeal Handshake Landmark',
        landmark: 'Cricothyroid Membrane',
        text: 'Stabilize thyroid cartilage with non-dominant hand; palpate depression over cricothyroid membrane.',
      },
      {
        num: 2,
        title: 'Scalpel-Bougie-Tube Technique',
        landmark: 'Transverse Incision',
        text: 'Make a 2–3 cm horizontal incision through membrane; introduce tracheal hook and insert gum-elastic bougie.',
      },
      {
        num: 3,
        title: 'Definitive Airway Placement',
        landmark: 'Size 6.0 Cuffed ETT',
        text: 'Railroad size 6.0 cuffed endotracheal tube over bougie; inflate cuff and confirm bilateral breath sounds with end-tidal CO2.',
      },
    ],
    equipment: [
      { name: 'Scalpel', value: '#10 Surgical Blade' },
      { name: 'Airway Tube', value: 'Size 6.0 Cuffed' },
    ],
    scenario: '36M with massive facial trauma and torrential oral bleeding. Three rapid sequence intubation attempts fail, SpO2 plunges to 62%, bag-valve mask ventilation fails (CICO). What is the mandatory priority?',
    options: [
      {
        text: 'Immediate surgical cricothyroidotomy (scalpel-bougie-tube technique) through cricothyroid membrane',
        correct: true,
        explanation: 'Failed airway CICO algorithm requires immediate front-of-neck surgical access to prevent catastrophic hypoxic arrest.',
      },
      {
        text: 'Attempt a 4th direct laryngoscopy attempt with a smaller 5.0 endotracheal tube',
        correct: false,
        explanation: 'Repeated failed attempts cause laryngeal trauma, worsening hypoxemia and accelerating hypoxic cardiac arrest.',
      },
      {
        text: 'Administer another dose of IV rocuronium and await surgical team arrival',
        correct: false,
        explanation: 'Fatal delay! In a CICO crisis, front-of-neck airway must be established by the bedside physician immediately.',
      },
    ],
  },
  node_boss: {
    protocolTitle: 'The Unstable Code Blue: Refractory VF Protocol',
    warning: 'Refractory VF arrest failing standard shocks. Minimize off-chest pause time to under 5 seconds.',
    steps: [
      {
        num: 1,
        title: 'Dual Sequential Defibrillation (DSD)',
        landmark: 'Anterolateral + AP Pads',
        text: 'Apply second defibrillator set in anterior-posterior orientation; discharge sequentially (<1 sec apart) at 200J biphasic.',
      },
      {
        num: 2,
        title: 'Advanced Resuscitation Pharmacology',
        landmark: 'Amiodarone 300mg IV',
        text: 'Administer Amiodarone 300 mg IV push after shock #2; follow with 150 mg after shock #3, or Lidocaine 1–1.5 mg/kg.',
      },
      {
        num: 3,
        title: 'Post-ROSC Hemodynamic Stabilization',
        landmark: 'Target MAP >= 65 mmHg',
        text: 'Initiate Norepinephrine infusion, target normoxia (SpO2 92–98%), and activate emergent cardiac catheterization lab.',
      },
    ],
    equipment: [
      { name: 'Defibrillator', value: 'Dual 200J Array' },
      { name: 'Antiarrhythmic', value: 'Amiodarone 300mg' },
    ],
    scenario: 'BOSS CODE BLUE TRIAL: 54M in persistent pulseless Ventricular Fibrillation despite 3 consecutive shocks, 1 mg Epinephrine, and 300 mg Amiodarone. What is the evidence-based resuscitation strategy?',
    options: [
      {
        text: 'Dual sequential defibrillation (DSD) with second pad array and second dose Amiodarone 150 mg',
        correct: true,
        explanation: 'Dual sequential defibrillation alters vector trajectory and lowers defibrillation threshold in refractory ventricular fibrillation.',
      },
      {
        text: 'Pause compressions for 60 seconds to obtain a diagnostic baseline 12-lead ECG',
        correct: false,
        explanation: 'Fatal CPR interruption! Coronary perfusion pressure plummets to zero within 5 seconds of stopping compressions.',
      },
      {
        text: 'Push rapid IV bolus of Adenosine 12 mg to reset cardiac pacemaker rhythm',
        correct: false,
        explanation: 'Adenosine only blocks AV nodal conduction in SVT; it is completely ineffective and dangerous in pulseless chaotic VF.',
      },
    ],
  },
};

const INITIAL_PATH: PathStep[] = [
  {
    id: 'node_1',
    code: '01',
    title: 'Inferior STEMI & RV Infarct',
    subtitle: 'Right ventricular infarction workup & fluid loading',
    type: 'lesson',
    status: 'completed',
    xp: 50,
  },
  {
    id: 'node_2',
    code: '02',
    title: 'Tension Pneumothorax',
    subtitle: 'Needle & finger thoracostomy decompression',
    type: 'lesson',
    status: 'active',
    xp: 50,
  },
  {
    id: 'node_3',
    code: '03',
    title: 'Pericardiocentesis & Tamponade',
    subtitle: 'Subxiphoid emergency blind & echo-guided tap',
    type: 'lesson',
    status: 'locked',
    xp: 50,
  },
  {
    id: 'node_4',
    code: '04',
    title: 'Emergency Cricothyroidotomy',
    subtitle: 'Cannot intubate, cannot oxygenate surgical airway',
    type: 'lesson',
    status: 'locked',
    xp: 50,
  },
  {
    id: 'node_boss',
    code: 'BOSS',
    title: 'The Unstable Code Blue',
    subtitle: 'Refractory VF arrest with metabolic acidosis & airway collapse',
    type: 'boss',
    status: 'locked',
    xp: 150,
    difficult: true,
  },
];

function loadSavedSteps(): PathStep[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (!raw) return INITIAL_PATH;
    const parsed = JSON.parse(raw);

    // Support object mapping { [id]: status }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return INITIAL_PATH.map((step) => {
        const savedStatus = parsed[step.id];
        if (savedStatus === 'completed' || savedStatus === 'active' || savedStatus === 'locked') {
          return { ...step, status: savedStatus };
        }
        return step;
      });
    }

    // Support array of unlocked/completed node IDs
    if (Array.isArray(parsed)) {
      return INITIAL_PATH.map((step, idx) => {
        if (parsed.includes(step.id)) {
          const isLatest = parsed[parsed.length - 1] === step.id;
          return {
            ...step,
            status: isLatest ? 'active' : 'completed',
          };
        }
        return idx === 0 ? { ...step, status: 'completed' } : step;
      });
    }
  } catch (err) {
    console.warn('Unable to load saved curriculum steps:', err);
  }
  return INITIAL_PATH;
}

function saveStepsToStorage(steps: PathStep[]) {
  try {
    const progressMap: Record<string, 'completed' | 'active' | 'locked'> = {};
    steps.forEach((step) => {
      progressMap[step.id] = step.status;
    });
    localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(progressMap));
  } catch (err) {
    console.warn('Unable to persist curriculum steps:', err);
  }
}

interface LearnPathProps {
  onCompleteLesson?: (xp: number) => void;
  onStartBossCase?: () => void;
  onSwitchToAtlas?: () => void;
}

export const LearnPath: React.FC<LearnPathProps> = ({
  onCompleteLesson,
  onStartBossCase,
  onSwitchToAtlas,
}) => {
  const [pathSteps, setPathSteps] = useState<PathStep[]>(() => loadSavedSteps());
  const [activeLesson, setActiveLesson] = useState<PathStep | null>(null);
  const [protocolDrawerStep, setProtocolDrawerStep] = useState<PathStep | null>(null);
  const [quizState, setQuizState] = useState<{ answered: boolean; correct: boolean; mistakes: number } | null>(null);

  const {
    lessonsCompleted,
    awardQuestionXP,
    completeLesson,
    completeClinicalCase,
  } = useGamificationStore();

  // Sync state changes with localStorage
  useEffect(() => {
    saveStepsToStorage(pathSteps);
  }, [pathSteps]);

  const handleOpenProtocol = (step: PathStep) => {
    audio.playTelemetryClick();
    setProtocolDrawerStep(step);
  };

  const handleStartNode = (step: PathStep) => {
    if (step.status === 'locked') return;

    if (step.id === 'node_boss' && onStartBossCase) {
      audio.playAlarmPulse();
      onStartBossCase();
      return;
    }

    setProtocolDrawerStep(null);
    setActiveLesson(step);
    setQuizState(null);
    audio.playTelemetryClick();
  };

  const handleAnswer = (isCorrect: boolean) => {
    const prevMistakes = quizState?.mistakes || 0;
    const currentMistakes = isCorrect ? prevMistakes : prevMistakes + 1;
    setQuizState({ answered: true, correct: isCorrect, mistakes: currentMistakes });

    if (activeLesson) {
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
      const lessonResult = completeLesson(activeLesson.id, isPerfect, activeLesson.title);

      if (activeLesson.type === 'boss') {
        completeClinicalCase(`case_${activeLesson.id}`, activeLesson.title);
      }

      if (onCompleteLesson) {
        onCompleteLesson(lessonResult.xp);
      }

      // Guaranteed Sequential Unlock Progression:
      // When step index i completes:
      // - Step i becomes 'completed'
      // - Step i + 1 (if locked) becomes 'active'
      // - Downstream nodes and previously completed nodes are never relocked
      setPathSteps((prev) => {
        const currentIndex = prev.findIndex((s) => s.id === activeLesson.id);
        const updated = prev.map((step, idx) => {
          if (step.id === activeLesson.id) {
            return { ...step, status: 'completed' as const };
          }
          if (idx === currentIndex + 1 && step.status === 'locked') {
            return { ...step, status: 'active' as const };
          }
          return step;
        });
        saveStepsToStorage(updated);
        return updated;
      });
    }

    setActiveLesson(null);
    setQuizState(null);
  };

  const completedCount = pathSteps.filter(
    (s) => s.status === 'completed' || lessonsCompleted.includes(s.id)
  ).length;
  const totalCount = pathSteps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const currentProtocol = protocolDrawerStep
    ? DRILL_QUESTIONS[protocolDrawerStep.id] || DRILL_QUESTIONS.node_1
    : null;

  const currentDrill = activeLesson
    ? DRILL_QUESTIONS[activeLesson.id] || DRILL_QUESTIONS.node_1
    : null;

  return (
    <div
      id="learn-path-container"
      className="flex-1 flex flex-col w-full px-4 pt-3 pb-28 space-y-6 bg-slate-50 min-h-screen select-none relative overflow-y-auto"
    >
      {/* 1. Header & Milestone Tracker */}
      <div
        id="card-milestone-tracker"
        className="w-full bg-white rounded-3xl p-5 shadow-md border-2 border-slate-200 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 mx-auto">
          <Activity className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>RESUSCITATION CURRICULUM</span>
        </div>

        {/* High-Contrast Bold Centered Title */}
        <h1 className="text-base sm:text-lg font-black text-slate-900 text-center uppercase tracking-tight">
          UNIT 1: ACUTE RESUSCITATION — {completedCount} / {totalCount} COMPLETED
        </h1>

        {/* Centered Subtitle with comfortable line-height */}
        <p className="text-xs text-slate-500 text-center leading-relaxed mx-auto max-w-sm">
          Master critical clinical landmarks, rapid decompression, and emergency resuscitation protocols.
        </p>

        {/* Visual Progress Meter */}
        <div className="pt-1 space-y-1.5 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
            <span className="text-slate-400">Progression</span>
            <span className="text-rose-600 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              id="bar-milestone-progress"
              className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${Math.max(6, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Quick link to Protocol Atlas if available */}
        {onSwitchToAtlas && (
          <div className="pt-1">
            <button
              onClick={onSwitchToAtlas}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              <span>Browse Full Protocol Atlas & Guidelines</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Interactive Curriculum Stepping Stones (Sequential Nodes with w-20 h-20 targets, space-y-8, and vertical connector pipes) */}
      <div
        id="curriculum-tree-container"
        className="w-full bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200"
      >
        <div className="text-center mb-6">
          <h2 className="text-xs font-black text-slate-900 text-center uppercase tracking-tight">
            RESUSCITATION PATHWAY NODES
          </h2>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed mx-auto mt-0.5">
            Tap an active node to deploy clinical drill. Replay completed nodes anytime.
          </p>
        </div>

        {/* Curriculum Node Sequence */}
        <div className="flex flex-col items-center space-y-8">
          {pathSteps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isLocked = step.status === 'locked';
            const isBoss = step.type === 'boss';

            return (
              <React.Fragment key={step.id}>
                {/* Visual Connector Line between sequential nodes */}
                {index > 0 && (
                  <div className="flex flex-col items-center justify-center my-0 pointer-events-none">
                    <div className="w-0.5 h-8 bg-slate-300 border-l-2 border-dashed border-slate-300" />
                  </div>
                )}

                {/* Stepping Stone Item */}
                <div
                  id={`node-step-${step.id}`}
                  className="flex flex-col items-center text-center space-y-3 w-full max-w-xs mx-auto"
                >
                  {/* Tactical w-20 h-20 Stepping Stone Button */}
                  <div className="relative flex items-center justify-center">
                    {/* Active Radar Ping Effect */}
                    {isActive && (
                      <span className="absolute -inset-2 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                    )}

                    {isCompleted && (
                      <button
                        id={`btn-node-${step.id}`}
                        onClick={() => handleStartNode(step)}
                        title="Replay Completed Clinical Drill"
                        className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white shadow-lg flex flex-col items-center justify-center active:border-b-0 active:translate-y-1 transition-all cursor-pointer group"
                        type="button"
                      >
                        <CheckCircle2 className="w-8 h-8 stroke-[2.5] text-white" />
                        <span className="text-[10px] font-black font-mono uppercase tracking-wider mt-0.5">
                          DONE
                        </span>
                      </button>
                    )}

                    {isActive && !isBoss && (
                      <button
                        id={`btn-node-${step.id}`}
                        onClick={() => handleStartNode(step)}
                        title="Deploy Clinical Resuscitation Drill"
                        className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white shadow-xl flex flex-col items-center justify-center active:border-b-0 active:translate-y-1 transition-all cursor-pointer group"
                        type="button"
                      >
                        <Activity className="w-8 h-8 stroke-[2.5] text-white animate-pulse" />
                        <span className="text-[10px] font-black font-mono uppercase tracking-wider mt-0.5">
                          START
                        </span>
                      </button>
                    )}

                    {isActive && isBoss && (
                      <button
                        id={`btn-node-${step.id}`}
                        onClick={() => handleStartNode(step)}
                        title="Enter Boss Encounter"
                        className="w-20 h-20 rounded-full bg-gradient-to-b from-rose-700 to-slate-900 hover:from-rose-600 hover:to-slate-800 border-b-4 border-slate-950 text-white shadow-xl flex flex-col items-center justify-center active:border-b-0 active:translate-y-1 transition-all cursor-pointer group"
                        type="button"
                      >
                        <Skull className="w-8 h-8 stroke-[2.2] text-amber-300 animate-bounce" />
                        <span className="text-[10px] font-black font-mono uppercase tracking-wider text-amber-300 mt-0.5">
                          BOSS
                        </span>
                      </button>
                    )}

                    {isLocked && !isBoss && (
                      <div
                        id={`locked-node-${step.id}`}
                        className="w-20 h-20 rounded-full bg-slate-100 border-b-4 border-slate-200 text-slate-400 shadow-xs flex flex-col items-center justify-center cursor-not-allowed select-none"
                      >
                        <Lock className="w-7 h-7 text-slate-400" />
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                          LOCKED
                        </span>
                      </div>
                    )}

                    {isLocked && isBoss && (
                      <div
                        id={`locked-node-${step.id}`}
                        className="w-20 h-20 rounded-full bg-slate-100 border-b-4 border-slate-200 text-slate-400 shadow-xs flex flex-col items-center justify-center cursor-not-allowed select-none"
                      >
                        <Skull className="w-7 h-7 text-slate-400" />
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                          LOCKED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Centered Node Information & Metadata */}
                  <div className="space-y-1 w-full text-center">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <span
                        className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {isBoss ? 'BOSS TRIAL' : `DRILL ${step.code}`} • +{step.xp} XP
                      </span>
                    </div>

                    {/* Centered Bold High-Contrast Title */}
                    <h3 className="font-black text-slate-900 text-center uppercase tracking-tight text-sm">
                      {step.title}
                    </h3>

                    {/* Centered Subtitle with comfortable line-height */}
                    <p className="text-xs text-slate-500 text-center leading-relaxed mx-auto max-w-[280px]">
                      {step.subtitle}
                    </p>

                    {/* Action Controls for Completed / Active Nodes */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {isCompleted && (
                        <>
                          <button
                            onClick={() => handleStartNode(step)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            <span>Replay</span>
                          </button>

                          <button
                            onClick={() => handleOpenProtocol(step)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <BookOpen className="w-3 h-3 text-rose-600" />
                            <span>Protocol</span>
                          </button>
                        </>
                      )}

                      {isActive && (
                        <>
                          <button
                            onClick={() => handleStartNode(step)}
                            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{isBoss ? 'Start Trial' : 'Launch Drill'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenProtocol(step)}
                            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
                            title="Inspect Protocol First"
                          >
                            <BookOpen className="w-4 h-4 text-slate-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Clinical Protocol Review Drawer (Bottom Sheet Modal) */}
      {protocolDrawerStep && currentProtocol && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setProtocolDrawerStep(null)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-t-2 border-slate-200">
            {/* Drawer Drag Bar & Centered Header */}
            <div className="w-full px-6 pt-4 pb-3 flex flex-col items-center bg-white border-b border-slate-100 text-center">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-3" />
              
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono uppercase font-black tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  PROTOCOL • MODULE {protocolDrawerStep.code}
                </span>
                <button
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                  onClick={() => setProtocolDrawerStep(null)}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 text-center uppercase tracking-tight mt-2">
                {currentProtocol.protocolTitle}
              </h2>
              <p className="text-xs text-slate-500 text-center leading-relaxed mx-auto mt-0.5 max-w-sm">
                Evidence-based emergency resuscitation sequence & anatomical milestones
              </p>
            </div>

            {/* Scrollable Protocol Content */}
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {/* Alert Pitfall Box */}
              <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-200 space-y-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-rose-700 tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>CRITICAL CLINICAL TRAP</span>
                </div>
                <p className="text-xs text-rose-950 font-medium leading-relaxed max-w-md mx-auto">
                  {currentProtocol.warning}
                </p>
              </div>

              {/* Step-by-Step Surgical Sequence */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 text-center uppercase tracking-tight">
                  SURGICAL SEQUENCE & VERIFICATION
                </h4>
                {currentProtocol.steps.map((s) => (
                  <div
                    key={s.num}
                    className="p-3.5 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-200"
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono flex items-center justify-center shrink-0 font-bold text-xs">
                      {s.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          {s.title}
                        </span>
                        <span className="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {s.landmark}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {s.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Equipment Grid */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  CRITICAL EQUIPMENT SPECIFICATION
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentProtocol.equipment.map((eq) => (
                    <div
                      key={eq.name}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 text-center"
                    >
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">
                        {eq.name}
                      </span>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        {eq.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
              <button
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                onClick={() => setProtocolDrawerStep(null)}
                type="button"
              >
                Dismiss
              </button>
              <button
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                onClick={() => handleStartNode(protocolDrawerStep)}
                type="button"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Deploy Drill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Micro-Lesson Modal (p-6 internal padding, space-y-3 options, p-4 per option) */}
      {activeLesson && currentDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setActiveLesson(null)}
          />

          {/* Modal Card with p-6 internal padding */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4 z-10 border-2 border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header with Centered Title & Dismiss */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <span className="text-[10px] font-mono font-black uppercase text-rose-600 tracking-wider">
                  DRILL {activeLesson.code} • CLINICAL RESUSCITATION
                </span>
              </div>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setActiveLesson(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section & Module Title Centered */}
            <div className="text-center space-y-1">
              <h2 className="font-black text-slate-900 text-center uppercase tracking-tight text-base sm:text-lg">
                {activeLesson.title}
              </h2>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider text-center">
                Instant Scenario Assessment
              </p>
            </div>

            {/* Scenario Heading & Description with comfortable line height */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed text-center mx-auto">
                {currentDrill.scenario}
              </p>
            </div>

            {/* Options with space-y-3 and p-4 padding */}
            <div className="flex flex-col space-y-3">
              {currentDrill.options.map((opt, idx) => {
                const isSelected = quizState?.answered;
                const isOptionCorrect = opt.correct;

                let optClass =
                  'bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800';
                if (isSelected) {
                  if (isOptionCorrect) {
                    optClass = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-semibold shadow-xs';
                  } else {
                    optClass = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={Boolean(quizState?.answered)}
                    onClick={() => handleAnswer(opt.correct)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-xs flex flex-col gap-2 cursor-pointer ${optClass}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="leading-relaxed font-medium">{opt.text}</span>
                      {isSelected && isOptionCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>

                    {isSelected && isOptionCorrect && (
                      <p className="text-[11px] text-emerald-800 pt-2 border-t border-emerald-200 mt-1 leading-relaxed">
                        <strong className="uppercase">ACLS Guideline: </strong> {opt.explanation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Finish Button */}
            {quizState?.answered && (
              <button
                onClick={handleFinishDrill}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer active:border-b-0 active:translate-y-1 transition-all mt-1"
              >
                {quizState.correct ? 'Collect XP & Advance Pathway' : 'Review & Retry Protocol'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
