export type DeteriorationLevel =
  | 'stable_presentation'
  | 'impending_ischemic_strain'
  | 'ventricular_ectopy'
  | 'stabilized_reperfusion_path';

export interface PatientDemographics {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  arrivalMethod: string;
  triageAcuity: string; // ESI Level 2
}

export interface PatientSymptoms {
  chiefComplaint: string;
  onset: string;
  provocation: string;
  quality: string;
  radiation: string;
  severity: string; // 9/10
  associatedSymptoms: string[];
}

export interface PatientHistory {
  pmh: string[];
  psh: string[];
  familyHistory: string;
  socialHistory: string;
}

export interface PatientMedication {
  name: string;
  dose: string;
  indication: string;
}

export interface PatientAllergy {
  allergen: string;
  reaction: string;
}

export interface CaseVitalSigns {
  hr: number;
  bpSystolic: number;
  bpDiastolic: number;
  rr: number;
  spo2: number;
  tempC: number;
  rhythm: string;
}

export interface ExamSystemFinding {
  system: string;
  revealed: boolean;
  finding: string;
  clinicalSignificance: string;
  isNormal: boolean;
}

export interface InvestigationResult {
  id: string;
  name: string;
  category: 'imaging' | 'cardiac_biomarker' | 'ecg' | 'general_lab' | 'bedside';
  costTimeMin: number;
  ordered: boolean;
  resultReady: boolean;
  resultTitle: string;
  resultDetails: string;
  isHighYield: boolean;
  interpretationNotes: string;
}

export interface RedFlagItem {
  id: string;
  description: string;
  identified: boolean;
  importance: 'critical' | 'moderate';
}

export interface DifferentialOption {
  id: string;
  diagnosis: string;
  status: 'primary_suspect' | 'ruled_out' | 'unlikely' | 'unaddressed';
  explanation: string;
}

export interface ManagementAction {
  id: string;
  title: string;
  category: 'antiplatelet' | 'anticoagulation' | 'anti_ischemic' | 'monitoring' | 'oxygen' | 'invasive';
  description: string;
  isIndicated: boolean;
  isContraindicated: boolean;
  applied: boolean;
  guidelineRationale: string;
}

export interface DispositionChoice {
  id: string;
  title: string;
  description: string;
  isCorrect: boolean;
  timeframe: string;
  debrief: string;
}

export interface CaseScoreBreakdown {
  historyTaking: number; // Max 20
  investigationSelection: number; // Max 20
  clinicalReasoning: number; // Max 20
  management: number; // Max 25
  timeEfficiency: number; // Max 15
  totalScore: number; // Max 100
}

export interface DebriefReport {
  whatWentWell: string[];
  whatWasMissed: string[];
  keyLearningPoints: string[];
}

export interface StructuredCaseState {
  demographics: PatientDemographics;
  symptoms: PatientSymptoms;
  history: PatientHistory;
  medications: PatientMedication[];
  allergies: PatientAllergy[];
  vitalSigns: CaseVitalSigns;
  examination: Record<string, ExamSystemFinding>;
  investigations: Record<string, InvestigationResult>;
  ecgFindings: {
    ordered: boolean;
    leadElevation: string[];
    reciprocalDepression: string[];
    culpritVessel: string;
    studentInterpreted: boolean;
    studentDiagnosis: string | null;
  };
  troponinResults: {
    ordered: boolean;
    baselineValue: number; // ng/L
    referenceUpperLimit: number;
    studentInterpreted: boolean;
  };
  redFlags: Record<string, RedFlagItem>;
  differentialDiagnosis: Record<string, DifferentialOption>;
  managementActions: Record<string, ManagementAction>;
  disposition: DispositionChoice | null;
  deteriorationState: DeteriorationLevel;
  elapsedMinutes: number;
  actionLog: {
    timestamp: number;
    actionName: string;
    category: string;
    impact: string;
  }[];
  isCompleted: boolean;
  scoreBreakdown: CaseScoreBreakdown | null;
  debriefReport: DebriefReport | null;
}
