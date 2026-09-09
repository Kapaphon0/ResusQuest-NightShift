import {
  DifficultyTierInfo,
  PatientArchetype,
  ClinicalAcuity,
  Patient,
  ClinicalAction,
  ShiftEvent,
  ShiftObjective,
  ClinicalStatusLevel,
} from '../types/nightShift';

export const DIFFICULTY_TIERS: DifficultyTierInfo[] = [
  {
    tier: 1,
    title: 'Orientation Shift',
    subtitle: 'Green Bay Acclimatization',
    description: 'Straightforward presentations, stable vitals, single active bed. Excellent for mastering basic triage and assessment fundamentals.',
    requiredReputationLevel: 1,
    patientCount: 4,
    criticalProbability: 0.05,
    simultaneousBeds: 1,
    mysteryProbability: 0.1,
    eventFrequency: 0.15,
    xpMultiplier: 0.6,
    stars: 1,
  },
  {
    tier: 2,
    title: 'Rookie Shift',
    subtitle: 'Foundational Resus',
    description: 'Basic emergency presentations. Introduction of mild respiratory distress and standard chest pain protocols.',
    requiredReputationLevel: 2,
    patientCount: 5,
    criticalProbability: 0.12,
    simultaneousBeds: 2,
    mysteryProbability: 0.15,
    eventFrequency: 0.2,
    xpMultiplier: 0.65,
    stars: 1,
  },
  {
    tier: 3,
    title: 'Busy ED',
    subtitle: 'Acute Intake Surge',
    description: 'Higher volume, occasional acute arrhythmia and sepsis cases requiring timely fluid resuscitation.',
    requiredReputationLevel: 3,
    patientCount: 6,
    criticalProbability: 0.2,
    simultaneousBeds: 2,
    mysteryProbability: 0.2,
    eventFrequency: 0.3,
    xpMultiplier: 0.7,
    stars: 2,
  },
  {
    tier: 4,
    title: 'High Acuity',
    subtitle: 'Hemodynamic Instability',
    description: 'Frequent unstable vitals, early shock recognition, and dynamic telemetry interpretation.',
    requiredReputationLevel: 5,
    patientCount: 6,
    criticalProbability: 0.3,
    simultaneousBeds: 3,
    mysteryProbability: 0.25,
    eventFrequency: 0.4,
    xpMultiplier: 0.75,
    stars: 3,
  },
  {
    tier: 5,
    title: 'Critical Shift',
    subtitle: 'Resuscitation Bay Lead',
    description: 'Code Blue cardiac arrests, tension pneumothorax, and refractory status epilepticus occur regularly.',
    requiredReputationLevel: 8,
    patientCount: 7,
    criticalProbability: 0.4,
    simultaneousBeds: 3,
    mysteryProbability: 0.3,
    eventFrequency: 0.5,
    xpMultiplier: 0.8,
    stars: 3,
  },
  {
    tier: 6,
    title: 'Advanced Shift',
    subtitle: 'Complex Differentials',
    description: 'Subtle ECG patterns (de Winter, Wellens, Sgarbossa), occult intoxications, and diagnostic uncertainty.',
    requiredReputationLevel: 12,
    patientCount: 7,
    criticalProbability: 0.45,
    simultaneousBeds: 3,
    mysteryProbability: 0.35,
    eventFrequency: 0.6,
    xpMultiplier: 0.85,
    stars: 4,
  },
  {
    tier: 7,
    title: 'Senior Shift',
    subtitle: 'Multi-Bed Trauma Command',
    description: 'Multiple simultaneous crashing patients. Prioritization is paramount: who needs you in the next 60 seconds?',
    requiredReputationLevel: 16,
    patientCount: 8,
    criticalProbability: 0.55,
    simultaneousBeds: 4,
    mysteryProbability: 0.4,
    eventFrequency: 0.7,
    xpMultiplier: 0.9,
    stars: 4,
  },
  {
    tier: 8,
    title: 'Nightmare Shift',
    subtitle: 'Extreme Uncertainty & Surge',
    description: 'Aggressive patient deterioration rates, delayed lab turnarounds, and sudden multisystem crashes.',
    requiredReputationLevel: 22,
    patientCount: 8,
    criticalProbability: 0.65,
    simultaneousBeds: 4,
    mysteryProbability: 0.45,
    eventFrequency: 0.8,
    xpMultiplier: 0.95,
    stars: 5,
  },
  {
    tier: 9,
    title: 'Disaster Shift',
    subtitle: 'Mass Inflow Protocol',
    description: 'Triage under severe resource constraints. Complex decision chains where incorrect interventions accelerate arrest.',
    requiredReputationLevel: 28,
    patientCount: 9,
    criticalProbability: 0.75,
    simultaneousBeds: 4,
    mysteryProbability: 0.5,
    eventFrequency: 0.9,
    xpMultiplier: 1.0,
    stars: 5,
  },
  {
    tier: 10,
    title: 'RESUSQUEST',
    subtitle: 'The Ultimate Resuscitation Crucible',
    description: 'Maximum emergency medicine challenge. Legendary mystery cases, spontaneous arrest cascades, and unrelenting high acuity.',
    requiredReputationLevel: 35,
    patientCount: 10,
    criticalProbability: 0.85,
    simultaneousBeds: 4,
    mysteryProbability: 0.6,
    eventFrequency: 1.0,
    xpMultiplier: 1.1,
    stars: 5,
  },
];

export const REPUTATION_RANKS = [
  { minLevel: 1, maxLevel: 4, title: 'ED Rookie', icon: 'Stethoscope' },
  { minLevel: 5, maxLevel: 9, title: 'Junior Clinician', icon: 'Hospital' },
  { minLevel: 10, maxLevel: 19, title: 'ED Practitioner', icon: 'Ambulance' },
  { minLevel: 20, maxLevel: 29, title: 'Senior Emergency Clinician', icon: 'Zap' },
  { minLevel: 30, maxLevel: 49, title: 'Resuscitation Specialist', icon: 'HeartPulse' },
  { minLevel: 50, maxLevel: 999, title: 'Emergency Master', icon: 'Crown' },
];

export function getReputationTitle(reputationTierOrLevel: number): string {
  const match = REPUTATION_RANKS.find(
    (r) => reputationTierOrLevel >= r.minLevel && reputationTierOrLevel <= r.maxLevel
  );
  return match ? match.title : 'ED Clinician';
}

export function calculateStatusLevel(stability: number): ClinicalStatusLevel {
  if (stability >= 75) return 'stable';
  if (stability >= 50) return 'concerning';
  if (stability >= 25) return 'critical';
  if (stability > 0) return 'peri_arrest';
  return 'arrest';
}

// ----------------------------------------------------
// CLINICAL CASES REPOSITORY (USMLE/ACLS/ATLS ALIGNED)
// ----------------------------------------------------

export interface CaseTemplate {
  id: string;
  archetype: PatientArchetype;
  chiefComplaint: string;
  acuity: ClinicalAcuity;
  presentationSummary: string;
  riskFactors: string[];
  startingVitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    tempC: number;
    rhythm: string;
    gcs: number;
  };
  startingState: {
    stability: number;
    airway: number;
    breathing: number;
    circulation: number;
    neurologicalStatus: number;
    pain: number;
    diseaseProgression: number;
    treatmentResponse: number;
  };
  hiddenClues: {
    category: 'history' | 'exam' | 'ecg' | 'labs' | 'pocus' | 'imaging' | 'collateral';
    title: string;
    description: string;
    costAP: number;
    isKeyClue?: boolean;
  }[];
  actions: ClinicalAction[];
  possibleDiagnoses: {
    id: string;
    name: string;
    isCorrect: boolean;
    explanation: string;
    category: string;
  }[];
  mysteryHint?: string;
  trajectory: {
    deteriorationRate: number;
    deteriorationEventMessage: string;
    complicationRisk: string;
    reversibleWith: string[];
  };
}

export const CASE_TEMPLATES: CaseTemplate[] = [
  // ROUTINE 1: Simple Ankle Sprain / Minor Trauma
  {
    id: 'case_routine_ankle',
    archetype: 'routine',
    chiefComplaint: 'Inversion ankle injury after stepping off curb',
    acuity: 1,
    presentationSummary: '24-year-old runner presenting with acute lateral right ankle swelling and tenderness following a twisting injury.',
    riskFactors: ['Recreational sports', 'No chronic medical illness'],
    startingVitals: {
      hr: 76,
      bp: '122/78',
      rr: 14,
      spo2: 99,
      tempC: 36.8,
      rhythm: 'Normal Sinus Rhythm',
      gcs: 15,
    },
    startingState: {
      stability: 95,
      airway: 100,
      breathing: 100,
      circulation: 98,
      neurologicalStatus: 100,
      pain: 45,
      diseaseProgression: 10,
      treatmentResponse: 0,
    },
    hiddenClues: [
      {
        category: 'exam',
        title: 'Ottawa Ankle Rules Assessment',
        description: 'Tenderness isolated to anterior talofibular ligament; NO posterior edge malleolar bony tenderness. Able to bear weight 4 steps.',
        costAP: 1,
        isKeyClue: true,
      },
      {
        category: 'imaging',
        title: '3-View Right Ankle X-Rays',
        description: 'Normal mortise alignment, no cortical breach, no syndesmotic widening.',
        costAP: 2,
      },
      {
        category: 'history',
        title: 'Mechanism & Collateral',
        description: 'Immediate swelling over lateral aspect, no auditory pop or sensation of snap.',
        costAP: 1,
      },
    ],
    actions: [
      {
        id: 'act_ice_wrap',
        name: 'RICE Protocol & Compression Splint',
        category: 'intervene',
        description: 'Apply elastic compression bandage, cryotherapy, and provide crutches with weight-bearing as tolerated.',
        costAP: 2,
        actionType: 'splint',
        impact: {
          stabilityDelta: 5,
          painDelta: -30,
          feedbackMessage: 'Pain noticeably subsides with supportive stabilization. Swelling contained.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_nsaid',
        name: 'Oral Ibuprofen 400mg + Paracetamol',
        category: 'intervene',
        description: 'Provide multimodal anti-inflammatory analgesia.',
        costAP: 1,
        actionType: 'medication',
        impact: {
          stabilityDelta: 0,
          painDelta: -25,
          feedbackMessage: 'Patient reports significant comfort and decreased throbbing.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_ct_overuse',
        name: 'Order Emergent Ankle CT Scan',
        category: 'investigate',
        description: 'High-radiation cross-sectional imaging for uncomplicated sprain.',
        costAP: 3,
        actionType: 'imaging',
        impact: {
          stabilityDelta: -5,
          feedbackMessage: 'Unnecessary radiation. Ottawa Ankle Rules were negative; CT is contraindicated.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'Over-ordering advanced imaging contrary to validated clinical decision rules.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_lateral_sprain',
        name: 'Grade I/II Lateral Ankle Ligamentous Sprain',
        isCorrect: true,
        explanation: 'Ottawa Ankle Rules negative; isolated ATFL tenderness with intact weight-bearing.',
        category: 'Musculoskeletal',
      },
      {
        id: 'dx_bimalleolar_fx',
        name: 'Bimalleolar Ankle Fracture',
        isCorrect: false,
        explanation: 'No malleolar tenderness, no deformity, X-rays clear.',
        category: 'Orthopedic',
      },
    ],
    trajectory: {
      deteriorationRate: 999,
      deteriorationEventMessage: 'Patient remains stable awaiting discharge instructions.',
      complicationRisk: 'Chronic instability if mobilized without guidance.',
      reversibleWith: ['RICE Protocol'],
    },
  },

  // COMPLEX 1: Atypical Chest Pain (Wellens Pattern vs Esophageal Spasm)
  {
    id: 'case_complex_wellens',
    archetype: 'complex',
    chiefComplaint: 'Episodic burning retrosternal chest pressure while resting',
    acuity: 2,
    presentationSummary: '58-year-old female presenting pain-free after a 45-minute episode of intense central chest squeezing that radiated into her jaw.',
    riskFactors: ['Hypertension', 'Post-menopausal', 'Hyperlipidemia', 'Smoking history'],
    startingVitals: {
      hr: 68,
      bp: '138/84',
      rr: 16,
      spo2: 98,
      tempC: 37.0,
      rhythm: 'Normal Sinus Rhythm',
      gcs: 15,
    },
    startingState: {
      stability: 78,
      airway: 100,
      breathing: 95,
      circulation: 85,
      neurologicalStatus: 100,
      pain: 10,
      diseaseProgression: 35,
      treatmentResponse: 0,
    },
    hiddenClues: [
      {
        category: 'ecg',
        title: 'Pain-Free 12-Lead ECG',
        description: 'Deeply inverted, symmetric T waves in V2 and V3 (Wellens Type B). No pathological Q waves; normal precordial R wave progression.',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'labs',
        title: 'High-Sensitivity Troponin I',
        description: 'Mildly elevated at 28 ng/L (upper reference limit 14 ng/L).',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'exam',
        title: 'Bedside Cardiovascular Exam',
        description: 'S1/S2 present, soft S4 gallop appreciated at apex. Lungs clear to auscultation bilaterally.',
        costAP: 1,
      },
      {
        category: 'pocus',
        title: 'Focused Echocardiogram (POCUS)',
        description: 'Subtle hypokinesis of the mid-anterior septum. Preserved overall ejection fraction ~55%.',
        costAP: 2,
      },
    ],
    actions: [
      {
        id: 'act_wellens_antiplatelet',
        name: 'Aspirin 324mg chewable + Heparin Bolus/Infusion',
        category: 'intervene',
        description: 'Administer dual antiplatelet and therapeutic anticoagulation for high-risk critical LAD stenosis.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: 10,
          feedbackMessage: 'Antithrombotic therapy initiated promptly to prevent complete anterior wall occlusion.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_wellens_cath',
        name: 'Immediate Interventional Cardiology Consult for Cath',
        category: 'intervene',
        description: 'Call interventional fellow for urgent catheterization; avoid stress testing!',
        costAP: 2,
        actionType: 'consult',
        impact: {
          stabilityDelta: 15,
          feedbackMessage: 'Cardiologist confirms Wellens syndrome: critical 95% proximal LAD stenosis. Taken for urgent PCI.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_wellens_stress_test',
        name: 'Order Exercise Treadmill Stress Test',
        category: 'investigate',
        description: 'Provocative stress test on patient with Wellens ECG waves.',
        costAP: 3,
        actionType: 'procedure',
        impact: {
          stabilityDelta: -50,
          circulationDelta: -60,
          feedbackMessage: 'CATASTROPHIC CONTRAINDICATION! Stress testing provoked massive anterior STEMI and cardiogenic shock.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'Wellens Syndrome represents impending critical LAD occlusion; exercise stress testing can provoke fatal anterior wall infarction.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_wellens',
        name: 'Wellens Syndrome (Critical Proximal LAD Stenosis)',
        isCorrect: true,
        explanation: 'Pain-free biphasic or deeply inverted symmetric T-waves in V2-V3 following angina.',
        category: 'Cardiology',
      },
      {
        id: 'dx_gerd',
        name: 'Gastroesophageal Reflux Disease (GERD)',
        isCorrect: false,
        explanation: 'Troponin leak and classic Wellens T-wave inversions rule out benign reflux.',
        category: 'Gastroenterology',
      },
      {
        id: 'dx_pericarditis',
        name: 'Acute Pericarditis',
        isCorrect: false,
        explanation: 'Lacks diffuse PR depression and diffuse ST elevation.',
        category: 'Cardiology',
      },
    ],
    trajectory: {
      deteriorationRate: 4,
      deteriorationEventMessage: 'Patient begins developing recurrent chest pressure and ST-segment elevation in anterior leads.',
      complicationRisk: 'Massive anterior myocardial infarction and sudden cardiac arrest.',
      reversibleWith: ['Aspirin', 'Heparin', 'Cath Lab'],
    },
  },

  // HIGH ACUITY 1: Septic Shock secondary to Urosepsis
  {
    id: 'case_high_urosepsis',
    archetype: 'high_acuity',
    chiefComplaint: 'Lethargy, high fever, and cloudy urine with severe hypotension',
    acuity: 3,
    presentationSummary: '72-year-old male from nursing facility with indwelling Foley catheter presenting with delirium, rigors, and skin mottling.',
    riskFactors: ['Chronic indwelling catheter', 'Type 2 Diabetes', 'Benign Prostatic Hyperplasia'],
    startingVitals: {
      hr: 128,
      bp: '82/48',
      rr: 26,
      spo2: 94,
      tempC: 39.2,
      rhythm: 'Sinus Tachycardia',
      gcs: 13,
    },
    startingState: {
      stability: 42,
      airway: 90,
      breathing: 70,
      circulation: 38,
      neurologicalStatus: 65,
      pain: 30,
      diseaseProgression: 60,
      treatmentResponse: 0,
    },
    hiddenClues: [
      {
        category: 'labs',
        title: 'Venous Blood Gas & Lactate',
        description: 'Lactate markedly elevated at 4.6 mmol/L; pH 7.28, HCO3 16 mEq/L (anion gap metabolic acidosis).',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'pocus',
        title: 'Focused IVC Collapsibility Exam',
        description: 'IVC diameter < 1.2 cm with >50% respiratory collapse, consistent with profound intravascular depletion.',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'labs',
        title: 'Urinalysis & Gram Stain',
        description: 'Urine gross turbid with leukocyte esterase 3+, nitrites positive, >50 WBC/HPF, Gram-negative rods.',
        costAP: 1,
      },
      {
        category: 'exam',
        title: 'Perfusion Assessment',
        description: 'Capillary refill 4.5 seconds. Knees show patchy mottling. Peripheral pulses weak.',
        costAP: 1,
      },
    ],
    actions: [
      {
        id: 'act_fluid_bolus_30',
        name: 'Rapid Infusion of 30 mL/kg Balanced Crystalloid (Plasma-Lyte / LR)',
        category: 'intervene',
        description: 'Deliver guideline-directed resuscitation bolus (approx 2000 mL) via pressure bag.',
        costAP: 2,
        actionType: 'fluid',
        impact: {
          stabilityDelta: 22,
          circulationDelta: 28,
          feedbackMessage: 'Blood pressure improves to 96/58 mmHg, HR decreases to 108 bpm. Skin perfusion warms.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_broad_abx',
        name: 'Broad-Spectrum IV Antibiotics (Cefepime + Vancomycin)',
        category: 'intervene',
        description: 'Administer within the golden first hour of septic shock.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: 15,
          feedbackMessage: 'Antibiotics infused rapidly after blood cultures drawn.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_norepinephrine',
        name: 'Norepinephrine Peripheral/Central Infusion (Titrate to MAP >= 65)',
        category: 'intervene',
        description: 'Initiate early vasopressor support for persistent shock despite fluid challenge.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: 18,
          circulationDelta: 25,
          feedbackMessage: 'MAP maintained at 68 mmHg. Renal perfusion restored with fresh urine output.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_delay_fluids',
        name: 'Administer 500mg IV Acetaminophen and Recheck Vitals in 2 Hours',
        category: 'intervene',
        description: 'Treating only the temperature while delaying fluid resuscitation.',
        costAP: 1,
        actionType: 'medication',
        impact: {
          stabilityDelta: -30,
          circulationDelta: -40,
          feedbackMessage: 'CRITICAL DETERIORATION: Mean arterial pressure drops to 45 mmHg. Patient becomes stuporous.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'Delayed resuscitation in septic shock increases mortality significantly every hour fluids and antibiotics are withheld.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_septic_shock',
        name: 'Septic Shock secondary to Urosepsis',
        isCorrect: true,
        explanation: 'Persistent hypotension (MAP < 65) with hyperlactatemia (>2 mmol/L) requiring fluid resuscitation and vasopressors.',
        category: 'Infectious Disease',
      },
      {
        id: 'dx_cardiogenic_shock',
        name: 'Primary Cardiogenic Shock',
        isCorrect: false,
        explanation: 'IVC is completely collapsed, eliminating cardiogenic volume overload as primary cause.',
        category: 'Cardiology',
      },
    ],
    trajectory: {
      deteriorationRate: 3,
      deteriorationEventMessage: 'Nurse calls out: "Doctor, systolic BP is now 74, lactate repeating at 5.8!"',
      complicationRisk: 'Multisystem organ failure, refractory metabolic acidosis, cardiac arrest.',
      reversibleWith: ['Balanced Crystalloids', 'Norepinephrine', 'Broad-spectrum Antibiotics'],
    },
  },

  // CRITICAL 1: Tension Pneumothorax after Blunt MVC
  {
    id: 'case_critical_tension_ptx',
    archetype: 'critical',
    chiefComplaint: 'Severe respiratory distress, tracheal deviation, and cyanosis following car crash',
    acuity: 4,
    presentationSummary: '31-year-old unrestrained driver struck a tree at 50 mph. Arrives via EMS in extremis, gasping with distended neck veins.',
    riskFactors: ['High-energy blunt chest trauma', 'Steering wheel impact'],
    startingVitals: {
      hr: 144,
      bp: '68/38',
      rr: 38,
      spo2: 78,
      tempC: 36.5,
      rhythm: 'Marked Sinus Tachycardia',
      gcs: 9,
    },
    startingState: {
      stability: 18,
      airway: 60,
      breathing: 20,
      circulation: 18,
      neurologicalStatus: 40,
      pain: 85,
      diseaseProgression: 80,
      treatmentResponse: 0,
    },
    hiddenClues: [
      {
        category: 'exam',
        title: 'Primary Trauma Survey (ABCDE)',
        description: 'Trachea deviated to LEFT. Absent breath sounds over entire RIGHT hemithorax with hyperresonance to percussion. Distended jugular veins.',
        costAP: 1,
        isKeyClue: true,
      },
      {
        category: 'pocus',
        title: 'eFAST Thoracic Window',
        description: 'Absence of lung sliding and barcode/stratosphere sign on M-mode over right 2nd intercostal space.',
        costAP: 1,
        isKeyClue: true,
      },
    ],
    actions: [
      {
        id: 'act_needle_decompression',
        name: 'Immediate Needle Thoracostomy / Finger Thoracostomy (Right 5th ICS anterior axillary line)',
        category: 'intervene',
        description: 'Perform immediate decompression before sending for portable chest X-ray.',
        costAP: 1,
        actionType: 'procedure',
        impact: {
          stabilityDelta: 55,
          breathingDelta: 60,
          circulationDelta: 50,
          feedbackMessage: 'AUDIBLE RUSH OF AIR! Tension relieved instantly. BP shoots up to 118/74, SpO2 rises to 95%.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_chest_tube',
        name: 'Placement of 28Fr Tube Thoracostomy',
        category: 'intervene',
        description: 'Definitive tube thoracostomy connected to underwater seal suction.',
        costAP: 2,
        actionType: 'procedure',
        impact: {
          stabilityDelta: 20,
          breathingDelta: 20,
          feedbackMessage: 'Chest tube secured with continuous bubbling; breath sounds returning.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_delay_for_xray',
        name: 'Send Patient to CT Scanner for Comprehensive Chest Imaging',
        category: 'investigate',
        description: 'Attempting to image an unstable patient with clinical tension pneumothorax.',
        costAP: 3,
        actionType: 'imaging',
        impact: {
          stabilityDelta: -60,
          circulationDelta: -80,
          feedbackMessage: 'DISASTER! Patient arrested in the CT scanner corridor due to complete venous return collapse.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'Tension pneumothorax is a CLINICAL diagnosis. Never delay decompression for imaging in an unstable patient.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_tension_ptx',
        name: 'Right Tension Pneumothorax with Obstructive Shock',
        isCorrect: true,
        explanation: 'Classic triad of unilateral absent breath sounds, tracheal shift, and hemodynamic collapse.',
        category: 'Trauma',
      },
      {
        id: 'dx_tamponade',
        name: 'Cardiac Tamponade',
        isCorrect: false,
        explanation: 'Does not explain unilateral absent breath sounds and hyperresonance.',
        category: 'Trauma',
      },
    ],
    trajectory: {
      deteriorationRate: 1,
      deteriorationEventMessage: 'Monitor alarms violently: Pulseless Electrical Activity (PEA) arrest imminent!',
      complicationRisk: 'PEA arrest from zero venous return to the right heart.',
      reversibleWith: ['Needle Thoracostomy', 'Finger Thoracostomy', 'Chest Tube'],
    },
  },

  // MYSTERY PATIENT 1: The Occult Ruptured Ectopic Pregnancy
  {
    id: 'case_mystery_ectopic',
    archetype: 'mysterious',
    chiefComplaint: '"I feel so dizzy and my shoulder hurts when I lie down"',
    acuity: 3,
    presentationSummary: '28-year-old female presents to ambulatory triage with vague lightheadedness and nausea. Says she thinks she has a stomach flu.',
    riskFactors: ['Sexually active', 'No prior medical history', 'History of pelvic infection 2 years ago'],
    startingVitals: {
      hr: 114,
      bp: '94/62',
      rr: 22,
      spo2: 97,
      tempC: 36.6,
      rhythm: 'Sinus Tachycardia',
      gcs: 15,
    },
    startingState: {
      stability: 55,
      airway: 100,
      breathing: 85,
      circulation: 50,
      neurologicalStatus: 90,
      pain: 50,
      diseaseProgression: 50,
      treatmentResponse: 0,
    },
    mysteryHint: 'Referred left shoulder tip pain (Kehr sign) + unexplained tachycardia in female of childbearing age.',
    hiddenClues: [
      {
        category: 'history',
        title: 'Detailed Menstrual & Gynecologic History',
        description: 'Last menstrual period was 7 weeks ago, thought it was just delayed due to job stress. Spotting noted 3 days ago.',
        costAP: 1,
        isKeyClue: true,
      },
      {
        category: 'exam',
        title: 'Abdominal & Kehr Sign Assessment',
        description: 'Mild lower quadrant guarding. Left shoulder tip pain worsens significantly in Trendelenburg position (diaphragmatic irritation from hemoperitoneum).',
        costAP: 1,
        isKeyClue: true,
      },
      {
        category: 'labs',
        title: 'STAT Urine Point-of-Care hCG & Blood Type',
        description: 'Urine hCG is strongly POSITIVE. Hemoglobin is 8.2 g/dL (acute blood loss). Type O-negative.',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'pocus',
        title: 'Focused Bedside Pelvic & RUQ Ultrasound',
        description: 'Free fluid identified in Morison pouch and rectouterine pouch (pouch of Douglas). Empty endometrial cavity with 2.5 cm adnexal mass with ring-of-fire vascularity.',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'ecg',
        title: '12-Lead ECG',
        description: 'Sinus tachycardia at 116 bpm, no ischemic changes.',
        costAP: 1,
      },
    ],
    actions: [
      {
        id: 'act_activate_obgyn_or',
        name: 'Immediate STAT OB/GYN Consult for Laparoscopy + Transfuse Uncrossed O-Neg Blood',
        category: 'intervene',
        description: 'Activate surgical suite for ruptured ectopic and initiate blood resuscitation.',
        costAP: 2,
        actionType: 'consult',
        impact: {
          stabilityDelta: 35,
          circulationDelta: 40,
          feedbackMessage: 'Blood infusing rapidly. OB/GYN arrives at bedside; patient transported directly to OR. 1.2L hemoperitoneum evacuated and bleeding controlled.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_discharge_flu',
        name: 'Prescribe Oral Ondansetron and Discharge Home with Flu Advice',
        category: 'intervene',
        description: 'Dismissing vague dizziness and nausea without pregnancy test.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: -60,
          circulationDelta: -70,
          feedbackMessage: 'CATASTROPHIC FAILURE: Patient collapses in waiting room 20 minutes later in hemorrhagic arrest.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'Never discharge a female of childbearing age with abdominal/shoulder pain or dizziness without verifying hCG.',
        },
      },
      {
        id: 'act_pocus_resus',
        name: 'Bedside POCUS + Two Large-Bore 16G IVs with Crystalloid Bolus',
        category: 'intervene',
        description: 'Rapid diagnostic confirmation and vascular access preparation.',
        costAP: 2,
        actionType: 'procedure',
        impact: {
          stabilityDelta: 15,
          circulationDelta: 20,
          feedbackMessage: 'Vascular access established and free peritoneal blood confirmed.',
          isCorrectIntervention: true,
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_ruptured_ectopic',
        name: 'Ruptured Ectopic Pregnancy with Hemoperitoneum',
        isCorrect: true,
        explanation: 'Positive hCG, free fluid on FAST exam, Kehr sign (diaphragmatic irritation from blood), and hemorrhagic shock.',
        category: 'Gynecology / Trauma',
      },
      {
        id: 'dx_gastroenteritis',
        name: 'Viral Gastroenteritis',
        isCorrect: false,
        explanation: 'Does not explain shoulder tip pain, positive hCG, and free fluid on POCUS.',
        category: 'Infectious Disease',
      },
      {
        id: 'dx_rotator_cuff',
        name: 'Acute Rotator Cuff Tendonitis',
        isCorrect: false,
        explanation: 'Kehr sign is referred pain from subdiaphragmatic blood, not primary orthopedic injury.',
        category: 'Orthopedic',
      },
    ],
    trajectory: {
      deteriorationRate: 3,
      deteriorationEventMessage: 'Patient becomes pale and clammy: BP slips to 80/50, heart rate jumps to 134 bpm!',
      complicationRisk: 'Exsanguinating hemorrhagic shock and cardiac arrest.',
      reversibleWith: ['STAT Surgery', 'O-Negative Blood Transfusion', 'Large-bore IVs'],
    },
  },

  // MYSTERY PATIENT 2: Massive Pulmonary Embolism Presenting as "Syncope and Anxiety"
  {
    id: 'case_mystery_pe',
    archetype: 'mysterious',
    chiefComplaint: '"I keep feeling breathless and I passed out while making coffee"',
    acuity: 3,
    presentationSummary: '46-year-old male arrives via private car after a sudden syncopal episode at home. Appears anxious and diaphoretic.',
    riskFactors: ['Recent transatlantic flight 4 days ago', 'Mild unilateral calf swelling noticed yesterday'],
    startingVitals: {
      hr: 118,
      bp: '98/64',
      rr: 28,
      spo2: 91,
      tempC: 37.1,
      rhythm: 'Sinus Tachycardia',
      gcs: 15,
    },
    startingState: {
      stability: 50,
      airway: 95,
      breathing: 55,
      circulation: 45,
      neurologicalStatus: 85,
      pain: 30,
      diseaseProgression: 55,
      treatmentResponse: 0,
    },
    mysteryHint: 'Unexplained hypoxia + sinus tachycardia with McGinn-White (S1Q3T3) pattern or right heart strain.',
    hiddenClues: [
      {
        category: 'ecg',
        title: '12-Lead ECG Evaluation',
        description: 'Sinus tachycardia at 122 bpm with prominent S wave in I, Q wave in III, and T wave inversion in III (S1Q3T3). T-wave inversions also in V1-V3 (right ventricular strain pattern).',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'pocus',
        title: 'Bedside Echocardiogram (Focused RV Assessment)',
        description: 'RV:LV ratio > 1.0 (severely dilated right ventricle) with McConnell sign (apical sparing with RV free wall hypokinesis). Paradoxical septal bowing ("D-shaped" left ventricle).',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'labs',
        title: 'Blood Gas & Cardiac Biomarkers',
        description: 'ABG shows acute respiratory alkalosis with hypoxia (PaO2 62 mmHg on room air, A-a gradient widened). Troponin I elevated (0.42 ng/mL) and NT-proBNP markedly elevated.',
        costAP: 2,
        isKeyClue: true,
      },
      {
        category: 'exam',
        title: 'Lower Extremity & Cardiopulmonary Exam',
        description: 'Right calf is 3 cm larger in circumference than left with pitting edema. Clear lungs bilaterally despite tachypnea.',
        costAP: 1,
      },
    ],
    actions: [
      {
        id: 'act_pe_anticoag_thrombolysis',
        name: 'Weight-Based IV Unfractionated Heparin + Prepare Systemic Thrombolytic (Alteplase 100mg)',
        category: 'intervene',
        description: 'Immediate anticoagulation and evaluation for thrombolysis if persistent hypotension/shock occurs.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: 30,
          breathingDelta: 30,
          circulationDelta: 25,
          feedbackMessage: 'Anticoagulation running. Oxygen saturation improves to 96% on supplemental non-rebreather mask.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_pe_fluids_caution',
        name: 'Conservative 250mL Fluid Challenge (Avoid RV Overload)',
        category: 'intervene',
        description: 'Cautious fluid management to avoid worsening acute cor pulmonale.',
        costAP: 1,
        actionType: 'fluid',
        impact: {
          stabilityDelta: 10,
          feedbackMessage: 'MAP stabilizes slightly without causing hepatic or jugular engorgement.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_pe_excessive_fluids',
        name: 'Aggressive 3-Liter Saline Bolus Under Pressure',
        category: 'intervene',
        description: 'Flooding the failing right ventricle with crystalloids.',
        costAP: 2,
        actionType: 'fluid',
        impact: {
          stabilityDelta: -35,
          circulationDelta: -45,
          feedbackMessage: 'SEVERE ADVERSE EVENT: Acute RV decompensation! Left ventricular filling collapses further, BP drops to 70/40.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'In massive PE, aggressive fluid loading over-distends the right ventricle, shifts the interventricular septum, and crushes left ventricular stroke volume.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_submassive_pe',
        name: 'High-Risk / Submassive Pulmonary Embolism',
        isCorrect: true,
        explanation: 'Right ventricular dilation, McConnell sign, elevated troponin, and hypoxia following syncope.',
        category: 'Pulmonary / Vascular',
      },
      {
        id: 'dx_panic_attack',
        name: 'Panic Disorder / Hyperventilation Syndrome',
        isCorrect: false,
        explanation: 'Severe hypoxia, right heart strain, and elevated troponin cannot be explained by panic.',
        category: 'Psychiatry',
      },
    ],
    trajectory: {
      deteriorationRate: 3,
      deteriorationEventMessage: 'Patient gasps for air; systolic BP drops below 85 mmHg as RV free wall fails.',
      complicationRisk: 'Obstructive shock and PEA cardiac arrest.',
      reversibleWith: ['Heparin', 'Systemic Thrombolysis', 'Cautious Fluid Strategy'],
    },
  },

  // CRITICAL 2: Ventricular Fibrillation Cardiac Arrest
  {
    id: 'case_critical_vfib',
    archetype: 'critical',
    chiefComplaint: 'Sudden collapse in ED waiting room, pulseless and apneic',
    acuity: 5,
    presentationSummary: '62-year-old male was checking in for chest discomfort when he suddenly slumped to the floor without warning.',
    riskFactors: ['Known CAD', 'Previous myocardial infarction', 'Heavy smoker'],
    startingVitals: {
      hr: 0,
      bp: '0/0',
      rr: 0,
      spo2: 0,
      tempC: 36.4,
      rhythm: 'Coarse Ventricular Fibrillation',
      gcs: 3,
    },
    startingState: {
      stability: 5,
      airway: 10,
      breathing: 0,
      circulation: 0,
      neurologicalStatus: 10,
      pain: 0,
      diseaseProgression: 95,
      treatmentResponse: 0,
    },
    hiddenClues: [
      {
        category: 'ecg',
        title: 'Defibrillator Monitor Rhythm Strip',
        description: 'Chaotic, irregular, undifferentiated waveform with no discernible P waves or QRS complexes: Coarse VFib.',
        costAP: 0,
        isKeyClue: true,
      },
      {
        category: 'exam',
        title: 'Pulse & Respiration Check',
        description: 'No carotid pulse palpable at 10 seconds. Agonal gasping noted.',
        costAP: 0,
        isKeyClue: true,
      },
    ],
    actions: [
      {
        id: 'act_defibrillate_200j',
        name: 'Immediate Biphasic Defibrillation at 200J + High-Quality CPR',
        category: 'intervene',
        description: 'Shock first without delay, then resume immediate chest compressions.',
        costAP: 1,
        actionType: 'procedure',
        impact: {
          stabilityDelta: 65,
          circulationDelta: 70,
          breathingDelta: 50,
          feedbackMessage: 'SHOCK DELIVERED! Two minutes of compressions completed. Rhythm check shows Return of Spontaneous Circulation (ROSC) with strong carotid pulse!',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_amiodarone_epi',
        name: 'Epinephrine 1mg IV + Amiodarone 300mg Bolus',
        category: 'intervene',
        description: 'ACLS pharmacological resuscitation for refractory ventricular fibrillation.',
        costAP: 2,
        actionType: 'medication',
        impact: {
          stabilityDelta: 25,
          circulationDelta: 20,
          feedbackMessage: 'Advanced pharmacotherapy administered according to ACLS algorithm.',
          isCorrectIntervention: true,
        },
      },
      {
        id: 'act_intubate_first',
        name: 'Halt Chest Compressions to Perform Prolonged Endotracheal Intubation',
        category: 'intervene',
        description: 'Stopping compressions to attempt an airway before shocking VFib.',
        costAP: 2,
        actionType: 'procedure',
        impact: {
          stabilityDelta: -40,
          circulationDelta: -50,
          feedbackMessage: 'LETHAL PROTOCOL BREACH! Prolonged pauses in chest compressions and delayed defibrillation cause cerebral and myocardial anoxia.',
          isCorrectIntervention: false,
          clinicalTrapExplanation: 'In witnessed VFib arrest, immediate defibrillation and uninterrupted chest compressions take absolute priority over advanced airway placement.',
        },
      },
    ],
    possibleDiagnoses: [
      {
        id: 'dx_vfib_arrest',
        name: 'Ventricular Fibrillation Cardiac Arrest secondary to Acute Coronary Occlusion',
        isCorrect: true,
        explanation: 'Shockable cardiac arrest rhythm requiring immediate unsynchronized defibrillation.',
        category: 'Resuscitation / ACLS',
      },
      {
        id: 'dx_asystole',
        name: 'Asystole',
        isCorrect: false,
        explanation: 'Coarse VFib rhythm strip shows distinct electrical amplitude; not flatline.',
        category: 'Cardiology',
      },
    ],
    trajectory: {
      deteriorationRate: 1,
      deteriorationEventMessage: 'Telemetry shows VF amplitude decaying into fine VF and asystole without prompt defibrillation!',
      complicationRisk: 'Irreversible hypoxic brain death within 3-4 minutes.',
      reversibleWith: ['Immediate Defibrillation', 'Continuous CPR', 'Epinephrine/Amiodarone'],
    },
  },
];

// ----------------------------------------------------
// RANDOM EVENTS POOL (PROBABILISTIC & DYNAMIC)
// ----------------------------------------------------

export const RANDOM_SHIFT_EVENTS: ShiftEvent[] = [
  {
    id: 'evt_ambulance_arrival',
    type: 'ambulance_arrival',
    title: 'Ambulance Inbound — ETA 3 Minutes',
    icon: 'Ambulance',
    description: 'County Paramedic Unit 4 reports inbound with an unstable 68-year-old female with severe respiratory distress and rales.',
    dialogue: 'Dispatch: "ResusQuest ED, Medic 4 inbound. SpO2 82% on 15L non-rebreather. Stridorous with diffuse wheezing. Have airway ready."',
    urgency: 'urgent',
    choices: [
      {
        id: 'prep_resus_bay',
        label: 'Prepare Resus Bay 1 with Video Laryngoscopy & BiPAP',
        actionCostAP: 1,
        outcomeMessage: 'Airway equipment primed at bedside. Patient transitions smoothly with zero delay upon arrival.',
        isOptimal: true,
        scoreBonus: 25,
      },
      {
        id: 'divert_corridor',
        label: 'Place in Corridor Bed Until Routine Triage Finishes',
        actionCostAP: 0,
        outcomeMessage: 'Patient decompensates in the hallway, requiring emergency crash intubation under poor lighting.',
        isOptimal: false,
        scoreBonus: -20,
      },
    ],
  },
  {
    id: 'evt_trauma_alert',
    type: 'trauma_alert',
    title: 'Code Trauma — Multiple Collision',
    icon: 'Siren',
    description: 'Level 1 Trauma Team activation requested. High-speed rollover collision with prolonged extrication.',
    dialogue: 'Trauma Nurse: "Doctor, EMS is pulling into the ambulance bay now with a trapped driver. Pelvis unstable on binder."',
    urgency: 'critical',
    choices: [
      {
        id: 'activate_mtp',
        label: 'Activate Massive Transfusion Protocol & Draw Trauma Blood Panel',
        actionCostAP: 2,
        outcomeMessage: 'Four units of uncrossed PRBCs and thawed plasma delivered immediately to bedside.',
        isOptimal: true,
        scoreBonus: 30,
      },
      {
        id: 'wait_for_cbc',
        label: 'Wait for Formal Lab Hemoglobin Before Calling Blood Bank',
        actionCostAP: 0,
        outcomeMessage: 'Dangerous delay: early trauma-induced coagulopathy worsens before blood arrives.',
        isOptimal: false,
        scoreBonus: -25,
      },
    ],
  },
  {
    id: 'evt_cardiac_arrest',
    type: 'cardiac_arrest',
    title: 'Code Blue — Resus Bay 1',
    icon: 'HeartPulse',
    description: 'An admitted patient with chest pain suddenly loses consciousness. Monitor alarms for polymorphic ventricular tachycardia.',
    dialogue: 'Bedside Nurse: "Doctor, he just went unresponsive! No carotid pulse! Defibrillator pads are on!"',
    urgency: 'critical',
    choices: [
      {
        id: 'immediate_shock',
        label: 'Call All Clear & Deliver Immediate 200J Defibrillation',
        actionCostAP: 1,
        outcomeMessage: 'Immediate shock restores normal sinus rhythm. Patient awakens asking what happened!',
        isOptimal: true,
        scoreBonus: 35,
      },
      {
        id: 'run_lab_first',
        label: 'Draw Blood Gas and Check Pupils First',
        actionCostAP: 0,
        outcomeMessage: 'Fatal hesitation: patient degenerates into refractory asystole.',
        isOptimal: false,
        scoreBonus: -40,
      },
    ],
  },
  {
    id: 'evt_critical_lab',
    type: 'critical_lab',
    title: 'Critical Lab Callback: Potassium 7.2 mEq/L',
    icon: 'AlertTriangle',
    description: 'Stat lab chemist calls with a panic value: Serum potassium is 7.2 mEq/L with severe hemolyzed sample ruled out.',
    dialogue: 'Central Lab: "Critical value for Bed 2: Potassium is 7.2 mEq/L. Please repeat 12-lead ECG immediately."',
    urgency: 'urgent',
    choices: [
      {
        id: 'hyperkalemia_cocktail',
        label: 'Administer IV Calcium Gluconate 10% (Membrane Stabilization) + Insulin/Dextrose',
        actionCostAP: 2,
        outcomeMessage: 'Myocardial cell membrane stabilized immediately, preventing sine-wave transition and ventricular fibrillation.',
        isOptimal: true,
        scoreBonus: 30,
      },
      {
        id: 'kayexalate_oral',
        label: 'Order Oral Sodium Polystyrene Sulfonate Alone',
        actionCostAP: 1,
        outcomeMessage: 'Kayexalate takes 4-6 hours to work and does not stabilize cardiac membranes. Patient develops peaked T-waves and sine-wave.',
        isOptimal: false,
        scoreBonus: -20,
      },
    ],
  },
  {
    id: 'evt_specialist_call',
    type: 'specialist_call',
    title: 'Cardiology Fellow Call',
    icon: 'PhoneCall',
    description: 'On-call interventional cardiologist calls regarding the telemetry strip sent 10 minutes ago.',
    dialogue: 'Dr. Vance (Cardiology): "I looked at the ECG for Bed 3. There is 1mm ST-elevation in III with reciprocal depression in I and aVL. Did you check posterior leads V7-V9?"',
    urgency: 'routine',
    choices: [
      {
        id: 'obtain_posterior',
        label: 'Obtain 15-Lead ECG with V7-V9 and RV Leads V4R',
        actionCostAP: 1,
        outcomeMessage: 'Reveals 2mm ST-elevation in V8 and V4R: Acute Inferoposterior STEMI with Right Ventricular infarction confirmed! Cath lab activated.',
        isOptimal: true,
        scoreBonus: 25,
      },
      {
        id: 'give_nitroglycerin',
        label: 'Administer Sublingual Nitroglycerin Without RV Check',
        actionCostAP: 1,
        outcomeMessage: 'Profound hypotension! Right ventricular infarcts depend heavily on preload; nitroglycerin crashed his blood pressure.',
        isOptimal: false,
        scoreBonus: -30,
      },
    ],
  },
  {
    id: 'evt_unexpected_deterioration',
    type: 'unexpected_deterioration',
    title: 'Unexpected Clinical Deterioration!',
    icon: 'TrendingDown',
    description: 'A previously stable patient in Bed 2 has suddenly desaturated to 84% with bilateral rales.',
    dialogue: 'Nurse: "Doctor, his breathing changed in the last 2 minutes. He is diaphoretic and unable to speak in full sentences!"',
    urgency: 'critical',
    choices: [
      {
        id: 'bedside_pocus_bipap',
        label: 'Perform STAT Bedside Lung Ultrasound & Initiate Non-Invasive BiPAP',
        actionCostAP: 2,
        outcomeMessage: 'Lung ultrasound shows diffuse B-lines (pulmonary edema). BiPAP reduces work of breathing and improves SpO2 to 94%.',
        isOptimal: true,
        scoreBonus: 30,
      },
      {
        id: 'give_sedative',
        label: 'Administer 2mg IV Lorazepam for Acute Anxiety',
        actionCostAP: 1,
        outcomeMessage: 'Respiratory drive blunted: patient enters hypercapnic coma requiring emergency intubation.',
        isOptimal: false,
        scoreBonus: -35,
      },
    ],
  },
  {
    id: 'evt_quiet_period',
    type: 'quiet_period',
    title: 'Department Lull — Shift Recovery',
    icon: 'Moon',
    description: 'Triage is momentarily clear. All ambulances dispatched elsewhere for the next 20 minutes.',
    dialogue: 'Charge Nurse: "Doctor, all beds are settled for now. Great time to review charts and replenish our clinical AP stamina."',
    urgency: 'routine',
    choices: [
      {
        id: 'replenish_ap',
        label: 'Review Department Roster & Replenish 3 Action Points',
        actionCostAP: 0,
        outcomeMessage: 'Stamina and clinical reserves restored for the upcoming shift surge.',
        isOptimal: true,
        scoreBonus: 15,
      },
    ],
  },
];

// ----------------------------------------------------
// RANDOM SHIFT OBJECTIVES POOL
// ----------------------------------------------------

export const OBJECTIVE_TEMPLATES: ShiftObjective[] = [
  {
    id: 'obj_manage_critical',
    title: 'Resuscitation Mastery',
    description: 'Successfully stabilize 2 critical or high-acuity patients without peri-arrest transition.',
    targetCount: 2,
    currentCount: 0,
    completed: false,
    bonusXP: 80,
    type: 'manage_critical',
  },
  {
    id: 'obj_ecg_correct',
    title: 'Diagnostic Precision',
    description: 'Correctly identify and act on 1 subtle or complex ECG pattern.',
    targetCount: 1,
    currentCount: 0,
    completed: false,
    bonusXP: 60,
    type: 'ecg_correct',
  },
  {
    id: 'obj_mystery_solved',
    title: 'Sherlock of the ER',
    description: 'Unravel 1 Mystery Patient case by investigating clues before guessing the diagnosis.',
    targetCount: 1,
    currentCount: 0,
    completed: false,
    bonusXP: 100,
    type: 'mystery_solved',
  },
  {
    id: 'obj_avoid_waste',
    title: 'High-Value Care',
    description: 'Avoid unnecessary, contra-indicated, or low-yield diagnostic investigations.',
    targetCount: 2,
    currentCount: 0,
    completed: false,
    bonusXP: 50,
    type: 'avoid_waste',
  },
  {
    id: 'obj_reassess_unstable',
    title: 'Dynamic Vigilance',
    description: 'Reassess every unstable patient within 2 turns of any pharmacological intervention.',
    targetCount: 2,
    currentCount: 0,
    completed: false,
    bonusXP: 70,
    type: 'reassess_unstable',
  },
];
