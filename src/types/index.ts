export interface PatientVitals {
  hr: number;
  bp: string;
  rr: number;
  spo2: number | string;
  rhythm?: string;
}

export type InvestigationType = 'ecg' | 'exam' | 'pocus' | 'labs';

export interface InvestigationDetail {
  cost: number;
  revealed: boolean;
  data: string;
  badge: string;
  laymanBadge?: string;
  laymanData?: string;
}

export interface FogOfWarDecisionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  penaltyExplain: string;
  laymanLabel?: string;
  laymanPenaltyExplain?: string;
}

export interface FogOfWarPatient {
  id: string;
  title?: string;
  demographics: string;
  initialVitals: PatientVitals;
  startingAP: number;
  investigations: Record<InvestigationType, InvestigationDetail>;
  decisionOptions: FogOfWarDecisionOption[];
  clinicalPearl: string;
  laymanDemographics?: string;
  laymanPearl?: string;
}

export interface SwipeTriageCard {
  id: string;
  prompt: string;
  category: 'ECG' | 'TOX' | 'TRAUMA';
  correctAction: 'CRASH' | 'STABLE';
  takeaway: string;
  telemetry: PatientVitals;
  laymanPrompt?: string;
  laymanTakeaway?: string;
}

export interface ShiftPerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect:
    | 'extra_ap'
    | 'free_ecg'
    | 'time_freeze'
    | 'reveal_perk'
    | 'rapid_infuser'
    | 'bonus_xp';
}

export interface ShiftBed {
  id: number;
  type: 'swipe_triage' | 'fog_of_war';
  title: string;
  completed: boolean;
}

export interface ShiftMissedConcept {
  id: string;
  bedTitle: string;
  promptOrScenario: string;
  trapChosen: string;
  clinicalReason: string;
  correctAction: string;
  category: 'ECG' | 'TRAUMA' | 'TOX' | 'HEMODYNAMICS';
  timestamp: number;
  laymanReason?: string;
  laymanPrompt?: string;
  laymanTrap?: string;
  laymanAction?: string;
}

export interface UserProfile {
  name?: string;
  role?: string;
  titleEn?: string;
  level: number;
  xp: number;
  shiftsCompleted: number;
  attendingRating: number;
  streakDays: number;
  civilianMode?: boolean;
  accuracyRate?: number;
}
