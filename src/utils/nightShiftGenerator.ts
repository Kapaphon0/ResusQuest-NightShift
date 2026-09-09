import {
  Patient,
  ShiftObjective,
  ShiftEvent,
  NightShiftState,
  ClinicalScores,
} from '../types/nightShift';
import {
  DIFFICULTY_TIERS,
  CASE_TEMPLATES,
  RANDOM_SHIFT_EVENTS,
  OBJECTIVE_TEMPLATES,
  calculateStatusLevel,
  CaseTemplate,
} from '../data/nightShiftMedicalData';

const FIRST_NAMES_MALE = ['James', 'Marcus', 'David', 'Carlos', 'Liam', 'Elijah', 'Arthur', 'Samuel', 'Robert'];
const FIRST_NAMES_FEMALE = ['Elena', 'Sophia', 'Maya', 'Beatrice', 'Claire', 'Zoe', 'Aaliyah', 'Hannah', 'Camila'];
const LAST_NAMES = ['Miller', 'Johnson', 'Patel', 'Kim', 'O\'Connor', 'Rodriguez', 'Tanaka', 'Wright', 'Novak'];

export function generatePatientFromTemplate(template: CaseTemplate, bedNumber: number): Patient {
  const isFemale = template.presentationSummary.includes('female') || Math.random() > 0.5;
  const firstName = isFemale
    ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
    : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  
  // Subtle age variation
  const baseAge = parseInt(template.presentationSummary.match(/\d+/)?.[0] || '45', 10);
  const age = Math.max(18, Math.min(88, baseAge + Math.floor(Math.random() * 5) - 2));

  const initialStability = template.startingState.stability;

  return {
    id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bedNumber,
    name: `${firstName} ${lastName}`,
    age,
    sex: isFemale ? 'Female' : 'Male',
    archetype: template.archetype,
    chiefComplaint: template.chiefComplaint,
    acuity: template.acuity,
    presentationSummary: `${age}-year-old ${isFemale ? 'female' : 'male'}. ${template.chiefComplaint}.`,
    riskFactors: [...template.riskFactors],
    vitals: { ...template.startingVitals },
    state: { ...template.startingState },
    statusLevel: calculateStatusLevel(initialStability),
    hiddenClues: template.hiddenClues.map((c, idx) => ({
      ...c,
      id: `clue_${idx}_${Date.now()}`,
      revealed: false,
    })),
    availableActions: template.actions.map((a) => ({ ...a })),
    possibleDiagnoses: template.possibleDiagnoses.map((d) => ({ ...d })),
    isMystery: template.archetype === 'mysterious',
    mysteryHint: template.mysteryHint,
    trajectory: { ...template.trajectory },
    actionsTaken: [],
    isStabilized: false,
    isDischargedOrTransferred: false,
    timeInBed: 0,
  };
}

export function generateInitialShift(
  tierNumber: number,
  shiftNumber: number = 1
): NightShiftState {
  const tierConfig = DIFFICULTY_TIERS.find((t) => t.tier === tierNumber) || DIFFICULTY_TIERS[0];

  // Pick balanced cases from templates
  // 1. Beginning: Routine / Complex
  // 2. Middle: Complex / High Acuity
  // 3. Late: Critical / Mysterious
  const routineTemplates = CASE_TEMPLATES.filter((c) => c.archetype === 'routine');
  const complexTemplates = CASE_TEMPLATES.filter((c) => c.archetype === 'complex');
  const highAcuityTemplates = CASE_TEMPLATES.filter((c) => c.archetype === 'high_acuity');
  const criticalTemplates = CASE_TEMPLATES.filter((c) => c.archetype === 'critical');
  const mysteryTemplates = CASE_TEMPLATES.filter((c) => c.archetype === 'mysterious');

  const selectedTemplates: CaseTemplate[] = [];

  // Always start with 1 routine/warmup or complex depending on tier
  if (tierNumber <= 4) {
    selectedTemplates.push(
      routineTemplates[Math.floor(Math.random() * routineTemplates.length)] || CASE_TEMPLATES[0]
    );
  } else {
    selectedTemplates.push(
      complexTemplates[Math.floor(Math.random() * complexTemplates.length)] || CASE_TEMPLATES[1]
    );
  }

  // Middle case
  if (Math.random() < 0.6 || tierNumber >= 4) {
    selectedTemplates.push(
      highAcuityTemplates[Math.floor(Math.random() * highAcuityTemplates.length)] || CASE_TEMPLATES[2]
    );
  } else {
    selectedTemplates.push(
      complexTemplates[Math.floor(Math.random() * complexTemplates.length)] || CASE_TEMPLATES[1]
    );
  }

  // Late cases: Critical or Mystery
  if (tierNumber >= 3 && Math.random() < (tierConfig.mysteryProbability || 0.3)) {
    selectedTemplates.push(
      mysteryTemplates[Math.floor(Math.random() * mysteryTemplates.length)] || CASE_TEMPLATES[4]
    );
  }

  if (tierNumber >= 2) {
    selectedTemplates.push(
      criticalTemplates[Math.floor(Math.random() * criticalTemplates.length)] || CASE_TEMPLATES[3]
    );
  }

  // Ensure minimum count for tier
  while (selectedTemplates.length < Math.min(tierConfig.patientCount, 5)) {
    const randomFallback = CASE_TEMPLATES[Math.floor(Math.random() * CASE_TEMPLATES.length)];
    selectedTemplates.push(randomFallback);
  }

  // Spawn initial beds based on simultaneousBeds setting
  const initialActivePatients: Patient[] = [];
  const initialCount = Math.min(tierConfig.simultaneousBeds, 2);

  for (let i = 0; i < initialCount; i++) {
    const template = selectedTemplates[i] || CASE_TEMPLATES[0];
    initialActivePatients.push(generatePatientFromTemplate(template, i + 1));
  }

  // 3 randomized objectives
  const shuffledObjectives = [...OBJECTIVE_TEMPLATES].sort(() => 0.5 - Math.random());
  const selectedObjectives: ShiftObjective[] = shuffledObjectives.slice(0, 3).map((obj) => ({
    ...obj,
    currentCount: 0,
    completed: false,
  }));

  const initialScores: ClinicalScores = {
    recognition: 5,
    prioritization: 5,
    diagnosis: 5,
    management: 5,
    reassessment: 5,
    resourceUse: 5,
    overallPercentage: 100,
  };

  return {
    shiftId: `shift_${Date.now()}`,
    shiftNumber,
    shiftTime: '22:00',
    shiftHours: '22:00 — 06:00',
    shiftProgress: 0,
    phase: 'lobby',
    selectedTier: tierNumber,
    currentAP: 8,
    maxAP: 8,
    departmentStatus: 'stable',
    activePatients: initialActivePatients,
    selectedBedIndex: 0,
    completedPatients: [],
    activeEvent: null,
    pendingPrioritization: false,
    objectives: selectedObjectives,
    scores: initialScores,
    mistakeHistory: [],
    activeNemesis: null,
    lastFeedback: null,
  };
}

export function advanceShiftClock(currentTime: string): { newTime: string; progress: number } {
  const times = ['22:00', '23:15', '00:30', '01:45', '03:00', '04:15', '05:30', '06:00'];
  const currentIndex = times.indexOf(currentTime);
  if (currentIndex === -1 || currentIndex >= times.length - 1) {
    return { newTime: '06:00', progress: 100 };
  }
  const nextTime = times[currentIndex + 1];
  const progress = Math.round(((currentIndex + 1) / (times.length - 1)) * 100);
  return { newTime: nextTime, progress };
}

export function getRandomEventForTier(tier: number, isLateShift: boolean): ShiftEvent | null {
  const tierConfig = DIFFICULTY_TIERS.find((t) => t.tier === tier) || DIFFICULTY_TIERS[0];
  const roll = Math.random();

  if (roll > tierConfig.eventFrequency) {
    return null;
  }

  // Filter events by urgency and shift time
  let candidateEvents = [...RANDOM_SHIFT_EVENTS];
  if (!isLateShift) {
    candidateEvents = candidateEvents.filter((e) => e.urgency !== 'critical');
  }

  if (candidateEvents.length === 0) return null;
  const picked = candidateEvents[Math.floor(Math.random() * candidateEvents.length)];
  return { ...picked, id: `evt_${Date.now()}` };
}
