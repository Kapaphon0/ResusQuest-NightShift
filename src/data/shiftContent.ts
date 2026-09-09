import {
  UserProfile,
  ShiftBed,
  ShiftPerk,
  FogOfWarPatient,
  SwipeTriageCard,
} from '../types';

/**
 * Initial clinical user profile
 */
export const initialUserProfile: UserProfile = {
  name: 'Dr. Alex Mercer',
  role: 'Emergency Medicine Resident',
  level: 1,
  xp: 150,
  shiftsCompleted: 42,
  attendingRating: 96,
  streakDays: 3,
};

/**
 * Default Night Shift Emergency Department Beds
 */
export const defaultShiftBeds: ShiftBed[] = [
  {
    id: 1,
    type: 'swipe_triage',
    title: 'Bed 1: Ambulance Bay Rapid Triage',
    completed: false,
  },
  {
    id: 2,
    type: 'fog_of_war',
    title: 'Bed 2: Acute Resus Bay - Inferior RV Infarct',
    completed: false,
  },
  {
    id: 3,
    type: 'swipe_triage',
    title: 'Bed 3: Surge Critical Triage',
    completed: false,
  },
  {
    id: 4,
    type: 'fog_of_war',
    title: 'Bed 4: Trauma Bay 1 - Tension Pneumothorax',
    completed: false,
  },
];

/**
 * Tactical Shift Perks available in the ED armory
 */
export const shiftPerks: ShiftPerk[] = [
  {
    id: 'perk-veteran-nurse',
    name: 'Veteran Triage Nurse',
    description: '+2 Starting Action Points (AP) in Fog-of-War resuscitation bays.',
    icon: 'ShieldAlert',
    effect: 'extra_ap',
  },
  {
    id: 'perk-pocus-fellow',
    name: 'POCUS Fellowship',
    description: 'Bedside ultrasound revealing occult pathology at 0 Action Point cost.',
    icon: 'Scan',
    effect: 'reveal_perk',
  },
  {
    id: 'perk-cath-alert',
    name: 'Fast-Track Cath Alert',
    description: 'Stat 12-lead ECG telemetry pre-cleared without AP expenditure.',
    icon: 'Zap',
    effect: 'free_ecg',
  },
  {
    id: 'perk-spidey-sense',
    name: 'Clinical Spidey-Sense',
    description: 'Early warning prompt highlights contraindicated critical pitfalls.',
    icon: 'Eye',
    effect: 'time_freeze',
  },
  {
    id: 'perk-rapid-infuser',
    name: 'Rapid Infuser',
    description: 'Instantly restore hemodynamics during profound preload-dependent shock.',
    icon: 'Flame',
    effect: 'rapid_infuser',
  },
  {
    id: 'perk-emergency-pharm',
    name: 'Emergency Pharmacist',
    description: 'Earn +25% bonus shift XP for perfect first-line pharmacotherapy choices.',
    icon: 'Pill',
    effect: 'bonus_xp',
  },
];

/**
 * High-Yield Fog of War Clinical Resuscitation Cases
 */
export const fogOfWarCases: FogOfWarPatient[] = [
  {
    id: 'fog-rv-infarct',
    demographics:
      '56-year-old male presenting with acute retrosternal crushing chest pain radiating to the jaw, severe diaphoresis, nausea, and sudden presyncope.',
    initialVitals: {
      hr: 52,
      bp: '88/54',
      rr: 18,
      spo2: 96,
      rhythm: 'Sinus Bradycardia with 1st Deg AV Block',
    },
    startingAP: 6,
    investigations: {
      ecg: {
        cost: 2,
        revealed: false,
        badge: '12-LEAD ECG + RIGHT-SIDED LEADS',
        data: 'ST-segment elevation in leads II, III, and aVF with reciprocal ST-depression in I and aVL. Lead V4R demonstrates 1.5 mm ST-segment elevation, pathognomonic for acute Right Ventricular Infarction.',
      },
      exam: {
        cost: 1,
        revealed: false,
        badge: 'PHYSICAL EXAM',
        data: 'Marked Jugular Venous Distension (JVD) elevated to angle of the jaw with positive Kussmaul sign. Lungs are completely clear to auscultation bilaterally (no rales/crackles). Cool, pale, clammy extremities with weak radial pulses.',
      },
      pocus: {
        cost: 2,
        revealed: false,
        badge: 'BEDSIDE CARDIAC ULTRASOUND',
        data: 'Severely dilated and hypokinetic right ventricle (RV:LV basal diameter ratio > 1.0). Underfilled, hyperdynamic left ventricle. Plethoric IVC (diameter 2.4 cm) with <20% respiratory collapsibility.',
      },
      labs: {
        cost: 2,
        revealed: false,
        badge: 'STAT SERUM LABS',
        data: 'High-Sensitivity Troponin I: 4.82 ng/mL (Markedly elevated). Venous Lactate: 3.2 mmol/L. Potassium: 4.3 mEq/L. Serum Creatinine: 1.2 mg/dL. Point-of-Care Glucose: 138 mg/dL.',
      },
    },
    decisionOptions: [
      {
        id: 'opt-nitrates',
        label:
          'Administer 0.4 mg Sublingual Nitroglycerin spray and initiate IV Nitroglycerin infusion for persistent ischemic chest pain.',
        isCorrect: false,
        penaltyExplain:
          'CONTRAINDICATED! In RV infarction, stroke volume is strictly preload-dependent. Systemic venodilators such as nitroglycerin precipitate catastrophic, refractory hypotension and cardiogenic collapse.',
      },
      {
        id: 'opt-betablocker',
        label:
          'Administer IV Metoprolol 5 mg and IV Morphine 4 mg to blunt myocardial oxygen demand.',
        isCorrect: false,
        penaltyExplain:
          'DANGEROUS! Beta-blockers worsen ischemia-mediated AV nodal conduction block, exacerbate bradycardia, and eliminate critical compensatory cardiac chronotropy in cardiogenic shock.',
      },
      {
        id: 'opt-saline-cath',
        label:
          'Administer 1,000 mL IV 0.9% Normal Saline bolus to augment RV preload and immediately activate the Cardiac Catheterization Lab for emergent primary PCI.',
        isCorrect: true,
        penaltyExplain: '',
      },
      {
        id: 'opt-rsi',
        label:
          'Perform immediate Rapid Sequence Intubation (RSI) with high PEEP for airway protection.',
        isCorrect: false,
        penaltyExplain:
          'HAZARDOUS! Mechanical positive-pressure ventilation acutely increases intrathoracic pressure, collapsing right heart venous return and triggering sudden pulseless electrical activity (PEA) arrest.',
      },
    ],
    clinicalPearl:
      'Inferior wall STEMIs with Right Ventricular involvement (V4R ST elevation) present with the classic triad: Hypotension, JVD, and CLEAR lung fields. They are strictly PRELOAD-DEPENDENT: aggressively volume-resuscitate with crystalloid, strictly withhold nitrates, morphine, and beta-blockers, and prioritize emergent catheterization.',
  },
  {
    id: 'fog-tension-ptx',
    demographics:
      '24-year-old male unrestrained driver status-post 60 mph motor vehicle collision with steering-wheel blunt thoracic trauma. Arrives in severe respiratory distress, agitation, and progressive cyanosis.',
    initialVitals: {
      hr: 142,
      bp: '72/40',
      rr: 40,
      spo2: '78%',
      rhythm: 'Sinus Tachycardia',
    },
    startingAP: 6,
    investigations: {
      ecg: {
        cost: 1,
        revealed: false,
        badge: '12-LEAD ECG',
        data: 'Sinus tachycardia at 142 bpm. Low QRS voltage across all leads with acute rightward axis deviation secondary to mediastinal displacement.',
      },
      exam: {
        cost: 1,
        revealed: false,
        badge: 'PRIMARY SURVEY / TRAUMA EXAM',
        data: 'Severe respiratory distress with intercostal retractions. Absent breath sounds over the right hemithorax with marked hyperresonance to percussion. Trachea palpably deviated to the LEFT. Engorged jugular neck veins.',
      },
      pocus: {
        cost: 2,
        revealed: false,
        badge: 'E-FAST THORACIC ULTRASOUND',
        data: 'Complete absence of lung sliding on the right anterior thorax with Stratosphere / Barcode sign on M-mode. Leftward mediastinal shift with diastolic collapse of the right atrium and IVC compression.',
      },
      labs: {
        cost: 2,
        revealed: false,
        badge: 'STAT ARTERIAL BLOOD GAS',
        data: 'pH: 7.14, PaCO2: 62 mmHg, PaO2: 46 mmHg (on 100% Non-Rebreather Mask), Base Excess: -7.8 mEq/L, Lactate: 5.4 mmol/L, Hemoglobin: 13.2 g/dL.',
      },
    },
    decisionOptions: [
      {
        id: 'opt-ct-scan',
        label:
          'Transfer immediately to the Radiology Suite for stat 128-slice contrast-enhanced Trauma Chest CT.',
        isCorrect: false,
        penaltyExplain:
          'LETHAL DELAY! Tension pneumothorax is an immediate clinical diagnosis. Transferring a hemodynamically decompensating patient to the scanner is a classic cause of preventable trauma mortality.',
      },
      {
        id: 'opt-decompression',
        label:
          'Perform immediate right-sided needle thoracostomy (5th intercostal space anterior axillary line or 2nd ICS midclavicular) followed immediately by definitive tube thoracostomy.',
        isCorrect: true,
        penaltyExplain: '',
      },
      {
        id: 'opt-rsi-peep',
        label:
          'Perform immediate Rapid Sequence Intubation (RSI) with high PEEP for profound hypoxemic respiratory failure.',
        isCorrect: false,
        penaltyExplain:
          'CATASTROPHIC! Introducing positive pressure ventilation into an unrelieved tension pneumothorax further spikes intrathoracic pressure, totally extinguishing venous return and inducing immediate cardiac arrest.',
      },
      {
        id: 'opt-pericardiocentesis',
        label:
          'Perform bedside emergent subxiphoid pericardiocentesis for presumed acute cardiac tamponade.',
        isCorrect: false,
        penaltyExplain:
          'INCORRECT DIAGNOSIS! Although hypotension and JVD occur in tamponade, unilateral absent breath sounds, tracheal deviation, and hyperresonance to percussion confirm Tension Pneumothorax.',
      },
    ],
    clinicalPearl:
      'Tension Pneumothorax is a pure CLINICAL emergency: never delay decompression for radiography or CT imaging. Immediate thoracostomy rapidly relieves tension physiology, re-establishes venous return to the heart, and prevents imminent PEA arrest.',
  },
];

/**
 * Rapid 1-second Emergency Swipe Triage Scenarios
 */
export const swipeTriageCards: SwipeTriageCard[] = [
  {
    id: 'triage-pulseless-vt',
    category: 'ECG',
    prompt:
      '62-year-old male collapses abruptly in the triage waiting room; monitor displays monomorphic wide-complex tachycardia at 220 bpm, and carotid pulse is ABSENT.',
    telemetry: {
      hr: 220,
      bp: '0/0',
      rr: 0,
      spo2: '0%',
      rhythm: 'Ventricular Tachycardia (Pulseless)',
    },
    correctAction: 'CRASH',
    takeaway:
      'Pulseless VT is a shockable cardiac arrest rhythm. Initiate high-quality chest compressions immediately and deliver rapid unsynchronized defibrillation (200 J biphasic).',
  },
  {
    id: 'triage-stable-afib',
    category: 'ECG',
    prompt:
      '68-year-old female presents with 3 days of mild palpitations and fatigue. Patient is fully oriented, warm and dry, speaking in complete sentences with no chest discomfort or dyspnea.',
    telemetry: {
      hr: 136,
      bp: '128/78',
      rr: 18,
      spo2: 98,
      rhythm: 'Atrial Fibrillation with RVR',
    },
    correctAction: 'STABLE',
    takeaway:
      'Hemodynamically stable Atrial Fibrillation with Rapid Ventricular Response (RVR) is managed with intravenous rate control (e.g., Diltiazem or Metoprolol), not emergency electrical cardioversion.',
  },
  {
    id: 'triage-uncal-herniation',
    category: 'TRAUMA',
    prompt:
      '31-year-old pedestrian struck at high speed; Glasgow Coma Scale 4, right pupil blown to 7 mm and fixed, decerebrate posturing, and irregular agonal gasping.',
    telemetry: {
      hr: 44,
      bp: '198/112',
      rr: 8,
      spo2: 89,
      rhythm: 'Sinus Bradycardia (Cushing Triad)',
    },
    correctAction: 'CRASH',
    takeaway:
      'Cushing Triad (severe hypertension, bradycardia, irregular respirations) paired with an uncal blown pupil indicates imminent brainstem herniation. Initiate rapid osmotherapy (hypertonic saline), neuroprotective intubation, and emergent craniotomy alert.',
  },
  {
    id: 'triage-opiate-od',
    category: 'TOX',
    prompt:
      '28-year-old male found somnolent on a park bench with pinpoint pupils and track marks. Has strong palpable radial pulses and spontaneous breathing at 10 breaths/min.',
    telemetry: {
      hr: 68,
      bp: '112/70',
      rr: 10,
      spo2: 95,
      rhythm: 'Normal Sinus Rhythm',
    },
    correctAction: 'STABLE',
    takeaway:
      'Opioid overdose with maintained spontaneous respiration and normal arterial oxygenation should be carefully managed with titrated low-dose Naloxone (0.04-0.1 mg IV/IN) to restore adequate ventilation while avoiding severe precipitated withdrawal.',
  },
  {
    id: 'triage-massive-pe',
    category: 'TRAUMA',
    prompt:
      '54-year-old female, 10 days post-total knee arthroplasty, suddenly clutches her chest with severe dyspnea, turns slate grey, and slumps into unresponsive pulseless electrical activity.',
    telemetry: {
      hr: 0,
      bp: '0/0',
      rr: 0,
      spo2: '0%',
      rhythm: 'PEA (Pulseless Electrical Activity)',
    },
    correctAction: 'CRASH',
    takeaway:
      'Sudden cardiovascular collapse and PEA arrest in a high-risk postoperative setting indicates massive occlusive Pulmonary Embolism. Deliver continuous ACLS CPR and administer push-dose rescue systemic thrombolysis (Alteplase 50 mg IV).',
  },
  {
    id: 'triage-hyperkalemia-sine',
    category: 'ECG',
    prompt:
      '72-year-old end-stage renal disease patient on hemodialysis who missed 3 consecutive dialysis sessions; profoundly lethargic with monitor demonstrating wide, bizarre sine-wave complexes.',
    telemetry: {
      hr: 36,
      bp: '76/40',
      rr: 24,
      spo2: 94,
      rhythm: 'Sine-Wave Hyperkalemia',
    },
    correctAction: 'CRASH',
    takeaway:
      'A sine-wave ECG pattern is pre-terminal and signals imminent ventricular fibrillation or asystolic arrest. Administer immediate IV Calcium Gluconate (or Calcium Chloride) for cardiac membrane stabilization, followed by aggressive intracellular shift agents and emergent dialysis.',
  },
  {
    id: 'triage-anaphylaxis',
    category: 'TOX',
    prompt:
      '19-year-old female ingested a peanut dessert 10 minutes ago; presents with inspiratory stridor, profound facial and tongue edema, diffuse urticaria, inability to vocalize, and altered sensorium.',
    telemetry: {
      hr: 148,
      bp: '68/38',
      rr: 34,
      spo2: 86,
      rhythm: 'Sinus Tachycardia',
    },
    correctAction: 'CRASH',
    takeaway:
      'Severe anaphylactic shock with upper airway obstruction and hemodynamic collapse requires immediate intramuscular Epinephrine (0.3-0.5 mg of 1:1,000 IM into the anterolateral thigh), high-flow oxygen, aggressive crystalloid fluid boluses, and airway preparation.',
  },
  {
    id: 'triage-thunderclap-sah',
    category: 'TRAUMA',
    prompt:
      '45-year-old female presents ambulatory to triage clutching her occiput, describing the "worst headache of my life" reaching peak 10/10 intensity in 2 seconds while weightlifting. GCS 15, no focal weakness, mild nuchal rigidity.',
    telemetry: {
      hr: 82,
      bp: '144/88',
      rr: 16,
      spo2: 99,
      rhythm: 'Normal Sinus Rhythm',
    },
    correctAction: 'STABLE',
    takeaway:
      'Thunderclap headache is concerning for aneurysmal Subarachnoid Hemorrhage (SAH). Because the patient is alert, normotensive, and neurologically intact, rapid non-contrast head CT within 6 hours (followed by lumbar puncture if CT is negative) is the correct protocolized pathway.',
  },
];
