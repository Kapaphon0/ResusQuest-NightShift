import { CompanionInfo } from '../types/avatar';

export const COMPANIONS_CATALOG: Record<string, CompanionInfo> = {
  pulse: {
    id: 'pulse',
    name: 'Pulse',
    title: 'The Vital Sentinel',
    personality: 'Calm & Analytical',
    description:
      'A compact, floating medical telemetry monitor with an animated sinus waveform. Reminds you to anchor clinical decisions in hemodynamics.',
    rarity: 'uncommon',
    quotes: {
      idle: [
        'Ready for tonight’s shift? Keep an eye on MAP and rhythm.',
        'Steady baseline rhythm. Let’s approach each bed methodically.',
        'Never treat telemetry without examining the patient first.',
      ],
      correct: [
        'QRS complexes narrowed. Excellent clinical reasoning!',
        'Perfusion parameters verified. Textbook management!',
        'Vitals stabilizing nicely under your guidance.',
      ],
      criticalVitals: [
        'Telemetry alarms firing. Check airway and pulses immediately.',
        'Notice the downward slope on blood pressure. Preload or afterload issue?',
        'Look at the vitals trend, not just the single snapshot.',
      ],
      levelUp: [
        'Processor speed up! Your clinical instincts are noticeably faster.',
        'Telemetry confirms: you have advanced in emergency competence!',
      ],
    },
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    title: 'The POCUS Probe',
    personality: 'Curious & Inquisitive',
    description:
      'A small ultrasound probe companion with a glowing acoustic fan beam. Encourages bedside visual confirmation.',
    rarity: 'rare',
    quotes: {
      idle: [
        'Always ask yourself: would bedside ultrasound answer this in 30 seconds?',
        'Is the IVC collapsing or plethoric? Every acoustic window tells a story.',
        'Curious about that lung base. Crackles or consolidation?',
      ],
      correct: [
        'Crystal-clear acoustic window! That diagnosis is confirmed.',
        'Spot-on identification of anatomy and pathology!',
        'You avoided anchoring bias. Great visual reasoning!',
      ],
      criticalVitals: [
        'Is fluid accumulating where it shouldn’t? Think pericardium and Morrison’s pouch.',
        'Hypotensive with distended neck veins? What acoustic signs come to mind?',
        'Scan the lung sliding before placing that positive pressure tube.',
      ],
      levelUp: [
        'Depth gain adjusted! You are seeing patient patterns with immense clarity.',
        'Acoustic resonance peak! New emergency capabilities unlocked!',
      ],
    },
  },
  rhythm: {
    id: 'rhythm',
    name: 'Rhythm',
    title: 'The Electrocardiograph',
    personality: 'Energetic & Enthusiastic',
    description:
      'A lively mini ECG strip creature with spark pulses along its leads. Passionate about vector loops and ST-segment deviations.',
    rarity: 'rare',
    quotes: {
      idle: [
        'Rate, rhythm, axis, intervals, hypertrophy, ischemia! Keep the drill going!',
        'Remember reciprocal changes in aVL when looking at inferior leads!',
        'Every milli-second on the PR and QTc counts!',
      ],
      correct: [
        'Synchronized cardioversion precision! That’s the right call!',
        'Zap! Direct hit on the culprit artery!',
        'Lead II to V6 are singing in harmony. Superb interpretation!',
      ],
      criticalVitals: [
        'Wide complex tachycardia! Is the patient stable or crashing?',
        'Look closely at lead aVR before you jump to conclusions.',
        'Ectopic beats detected. Keep defibrillator pads within arm’s reach.',
      ],
      levelUp: [
        'Voltage surge! Your ECG pattern recognition has reached new heights!',
        'P-wave to T-wave mastery unlocked! Congratulations on leveling up!',
      ],
    },
  },
  clot: {
    id: 'clot',
    name: 'Clot',
    title: 'The Biconcave Buddy',
    personality: 'Chaotic but Lovable',
    description:
      'A cheerful red blood cell companion sporting a tiny pediatric stethoscope. Reminds you about oxygenation, coagulation, and tissue perfusion.',
    rarity: 'epic',
    quotes: {
      idle: [
        'Keep that hemoglobin carrying oxygen to the end-organs!',
        'Fibrin mesh is ready if trauma rolls through triage!',
        'Hydration check! Even emergency clinicians need IV fluids (water)!',
      ],
      correct: [
        'Hooray! Perfusion restored to the microcirculation!',
        'Capillary refill is brisk and beautiful!',
        'We saved a whole bloodstream today!',
      ],
      criticalVitals: [
        'Lactate levels are climbing! We need fluid or pressors pronto!',
        'Is this hemorrhagic or distributive? Blood cells need answers!',
        'Tissue hypoxia looming. Protect the airway now!',
      ],
      levelUp: [
        'Hemoglobin saturation at 100%! Level up achieved!',
        'Erythropoietin boost! Your resuscitation stamina just increased!',
      ],
    },
  },
  lumi: {
    id: 'lumi',
    name: 'Lumi',
    title: 'The Resus Beacon',
    personality: 'Optimistic & Steadfast',
    description:
      'A bright emergency rotobeacon with an ambient warm glow. Illuminates critical resuscitation priorities when fog of war is thick.',
    rarity: 'legendary',
    quotes: {
      idle: [
        'Take a slow breath. In an emergency, the first pulse you take is your own.',
        'Keep calm, lead the room, and prioritize the ABCs.',
        'Clear closed-loop communication saves lives every night.',
      ],
      correct: [
        'Brilliant resuscitation leadership. The team is running smoothly.',
        'Clean protocol adherence. Outstanding patient stabilization!',
        'Your calm composure was contagious in that resuscitation bay.',
      ],
      criticalVitals: [
        'Take command of the room. Assign roles clearly before acting.',
        'Strip away the noise. What is the single immediate threat to life?',
        'Pause and reassess. Are interventions working or failing?',
      ],
      levelUp: [
        'Beacon shining at peak lumens! A true Emergency Master in the making!',
        'Resuscitation aura expanded! You inspire everyone in the department!',
      ],
    },
  },
};
