export type PatientArchetype = 'routine' | 'complex' | 'high_acuity' | 'critical' | 'mysterious';

export type ClinicalAcuity = 1 | 2 | 3 | 4 | 5; // 1: Routine, 2: Complex, 3: High Acuity, 4: Critical, 5: Peri-Arrest/Arrest

export type ClinicalStatusLevel = 'stable' | 'concerning' | 'critical' | 'peri_arrest' | 'arrest';

export interface PatientVitals {
  hr: number;
  bp: string; // e.g. "120/80"
  rr: number;
  spo2: number;
  tempC: number;
  rhythm: string; // e.g. "Sinus Tachycardia", "Ventricular Tachycardia", "NSR"
  gcs: number; // 3 - 15
}

export interface PatientState {
  stability: number; // 0 - 100
  airway: number; // 0 - 100
  breathing: number; // 0 - 100
  circulation: number; // 0 - 100
  neurologicalStatus: number; // 0 - 100
  pain: number; // 0 - 100
  diseaseProgression: number; // 0 - 100
  treatmentResponse: number; // 0 - 100
}

export interface ClinicalClue {
  id: string;
  category: 'history' | 'exam' | 'ecg' | 'labs' | 'pocus' | 'imaging' | 'collateral';
  title: string;
  description: string;
  revealed: boolean;
  costAP: number;
  isKeyClue?: boolean;
}

export interface ClinicalAction {
  id: string;
  name: string;
  category: 'assess' | 'investigate' | 'intervene' | 'reassess';
  description: string;
  costAP: number;
  actionType: string;
  // Clinical impact
  impact: {
    stabilityDelta: number;
    circulationDelta?: number;
    breathingDelta?: number;
    airwayDelta?: number;
    painDelta?: number;
    feedbackMessage: string;
    isCorrectIntervention: boolean;
    clinicalTrapExplanation?: string;
  };
}

export interface DiagnosisOption {
  id: string;
  name: string;
  isCorrect: boolean;
  explanation: string;
  category: string;
}

export interface ClinicalTrajectory {
  deteriorationRate: number; // AP ticks or turns before condition drops
  deteriorationEventMessage: string;
  complicationRisk: string;
  reversibleWith: string[];
}

export interface Patient {
  id: string;
  bedNumber: number;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Non-binary';
  archetype: PatientArchetype;
  chiefComplaint: string;
  acuity: ClinicalAcuity;
  presentationSummary: string;
  riskFactors: string[];
  vitals: PatientVitals;
  state: PatientState;
  statusLevel: ClinicalStatusLevel;
  hiddenClues: ClinicalClue[];
  availableActions: ClinicalAction[];
  possibleDiagnoses: DiagnosisOption[];
  confirmedDiagnosis?: string;
  isMystery: boolean;
  mysteryHint?: string;
  trajectory: ClinicalTrajectory;
  actionsTaken: string[];
  isStabilized: boolean;
  isDischargedOrTransferred: boolean;
  timeInBed: number; // ticks
  hasDeterioratedRecently?: boolean;
  deteriorationWarning?: string;
}

export type ShiftEventType =
  | 'ambulance_arrival'
  | 'trauma_alert'
  | 'cardiac_arrest'
  | 'pediatric_emergency'
  | 'massive_hemorrhage'
  | 'specialist_call'
  | 'critical_lab'
  | 'unexpected_deterioration'
  | 'multiple_patients'
  | 'quiet_period'
  | 'mystery_patient'
  | 'mass_casualty'
  | 'disaster_alert';

export interface ShiftEventChoice {
  id: string;
  label: string;
  actionCostAP?: number;
  outcomeMessage: string;
  isOptimal: boolean;
  scoreBonus: number;
  patientImpact?: {
    bedIndex?: number;
    stabilityDelta: number;
  };
}

export interface ShiftEvent {
  id: string;
  type: ShiftEventType;
  title: string;
  icon: string;
  description: string;
  dialogue?: string;
  choices: ShiftEventChoice[];
  spawnPatient?: Partial<Patient>;
  urgency: 'routine' | 'urgent' | 'critical';
  resolved?: boolean;
}

export interface ShiftObjective {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  bonusXP: number;
  type: 'manage_critical' | 'ecg_correct' | 'mystery_solved' | 'avoid_waste' | 'reassess_unstable';
}

export interface DifficultyTierInfo {
  tier: number;
  title: string;
  subtitle: string;
  description: string;
  requiredReputationLevel: number;
  patientCount: number;
  criticalProbability: number;
  simultaneousBeds: number;
  mysteryProbability: number;
  eventFrequency: number;
  xpMultiplier: number; // 1.0 down to 0.6
  stars: number;
}

export interface ClinicalScores {
  recognition: number; // 1 - 5 stars
  prioritization: number; // 1 - 5 stars
  diagnosis: number; // 1 - 5 stars
  management: number; // 1 - 5 stars
  reassessment: number; // 1 - 5 stars
  resourceUse: number; // 1 - 5 stars
  overallPercentage: number; // 0 - 100%
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  conceptTag: 'SHOCK' | 'ECG' | 'AIRWAY' | 'TRAUMA' | 'OVER_TESTING' | 'DELAYED_REASSESSMENT' | 'SEPSIS';
  patientName: string;
  scenario: string;
  mistakeMade: string;
  clinicalReason: string;
  correctApproach: string;
}

export interface NemesisAlert {
  conceptTag: string;
  timesFailed: number;
  title: string;
  description: string;
  unlockPearl: string;
}

export interface PlayerReputation {
  tier: number; // 1 - 10
  tierTitle: string;
  reputationXP: number;
  maxReputationXP: number;
  unlockedTiers: number[];
  shiftsCompleted: number;
  totalResuscitations: number;
  mysteriesSolved: number;
}

export interface NightShiftState {
  shiftId: string;
  shiftNumber: number;
  shiftTime: string; // "22:00", "23:30", "01:00", etc.
  shiftHours: string; // "22:00 — 06:00"
  shiftProgress: number; // 0 to 100%
  phase: 'lobby' | 'active' | 'debrief';
  selectedTier: number;
  currentAP: number;
  maxAP: number;
  departmentStatus: 'stable' | 'busy' | 'critical' | 'code_blue';
  activePatients: Patient[];
  selectedBedIndex: number;
  completedPatients: Patient[];
  activeEvent: ShiftEvent | null;
  pendingPrioritization: boolean;
  objectives: ShiftObjective[];
  scores: ClinicalScores;
  mistakeHistory: MistakeRecord[];
  activeNemesis: NemesisAlert | null;
  pendingSwipeTriage?: boolean;
  swipeTriageCountThisShift?: number;
  lastFeedback: {
    message: string;
    type: 'success' | 'warning' | 'critical' | 'info';
    timestamp: number;
  } | null;
}
