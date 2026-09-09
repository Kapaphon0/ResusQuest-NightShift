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
}

export interface FogOfWarDecisionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  penaltyExplain: string;
}

export interface FogOfWarPatient {
  id: string;
  demographics: string;
  initialVitals: PatientVitals;
  startingAP: number;
  investigations: Record<InvestigationType, InvestigationDetail>;
  decisionOptions: FogOfWarDecisionOption[];
  clinicalPearl: string;
}

export interface SwipeTriageCard {
  id: string;
  prompt: string;
  category: 'ECG' | 'TOX' | 'TRAUMA';
  correctAction: 'CRASH' | 'STABLE';
  takeaway: string;
  telemetry: PatientVitals;
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
}
