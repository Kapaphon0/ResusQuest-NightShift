import {
  StructuredCaseState,
  CaseScoreBreakdown,
  DebriefReport,
} from '../types/bossCase';

export const INITIAL_CHEST_PAIN_CASE: StructuredCaseState = {
  demographics: {
    name: 'Robert Vance',
    age: 62,
    gender: 'Male',
    occupation: 'Retired Mechanical Engineer',
    arrivalMethod: 'Ambulance (EMS ALS transport)',
    triageAcuity: 'Emergency Severity Index (ESI) Level 2 — High Acuity',
  },
  symptoms: {
    chiefComplaint: 'Crushing substernal chest pressure radiating to the left jaw and arm',
    onset: 'Began suddenly 2 hours ago while mowing the lawn in the garden.',
    provocation: 'Persistent at rest; not relieved by sitting down, drinking water, or antacids.',
    quality: 'Described as an "elephant sitting on my chest", tight, heavy, squeezing.',
    radiation: 'Radiates to the left shoulder, inner left arm, and angle of the left jaw.',
    severity: 'Rated 9 out of 10 in severity.',
    associatedSymptoms: [
      'Profuse cold diaphoresis',
      'Nausea without vomiting',
      'Mild shortness of breath on arrival',
      'Sense of impending doom',
    ],
  },
  history: {
    pmh: [
      'Hypertension (diagnosed 10 years ago)',
      'Type 2 Diabetes Mellitus (HbA1c 7.8% on oral agents)',
      'Hyperlipidemia (elevated LDL)',
    ],
    psh: ['Inguinal hernia repair (12 years ago)'],
    familyHistory:
      'Father experienced fatal myocardial infarction at age 54. Mother alive with osteoporosis.',
    socialHistory:
      '35 pack-year tobacco smoking history (quit 2 years ago). Denies alcohol abuse or illicit drug use (no cocaine/amphetamines).',
  },
  medications: [
    { name: 'Lisinopril', dose: '20 mg PO daily', indication: 'Hypertension' },
    { name: 'Metformin', dose: '1000 mg PO BID', indication: 'Type 2 Diabetes' },
    { name: 'Atorvastatin', dose: '40 mg PO QHS', indication: 'Hyperlipidemia' },
  ],
  allergies: [
    { allergen: 'Penicillin', reaction: 'Urticaria / diffuse erythematous hives' },
  ],
  vitalSigns: {
    hr: 104,
    bpSystolic: 148,
    bpDiastolic: 92,
    rr: 22,
    spo2: 94,
    tempC: 37.1,
    rhythm: 'Sinus Tachycardia with occasional PVCs',
  },
  examination: {
    general: {
      system: 'General Appearance',
      revealed: false,
      finding:
        'Acutely distressed, clutching center of sternum with clenched fist (Levine sign), pale and visibly diaphoretic with beads of cool perspiration on forehead.',
      clinicalSignificance: 'Classic autonomic activation and ischemic distress.',
      isNormal: false,
    },
    cardiovascular: {
      system: 'Cardiovascular',
      revealed: false,
      finding:
        'S1 and S2 present, regular tachycardia at 104 bpm. Soft S4 gallop audible at apex (atrial kick against stiffened ischemic ventricle). No systolic murmurs, no holosystolic regurgitant murmur, no pericardial friction rub. JVP normal at 3 cm above sternal angle.',
      clinicalSignificance:
        'S4 indicates acute diastolic dysfunction from left ventricular ischemia. Absence of new murmur rules out acute papillary muscle rupture or VSD.',
      isNormal: false,
    },
    respiratory: {
      system: 'Respiratory / Pulmonary',
      revealed: false,
      finding:
        'Bilateral breath sounds present throughout. Faint bibasilar inspiratory crackles (rales) at the lung bases. Trachea midline. No wheezing or stridor.',
      clinicalSignificance:
        'Bibasilar crackles represent early pulmonary venous congestion / elevated LV end-diastolic pressure (Killip Class II).',
      isNormal: false,
    },
    pulses: {
      system: 'Vascular & Peripheral Pulses',
      revealed: false,
      finding:
        'Bilateral radial, brachial, femoral, and dorsalis pedis pulses are 2+ and completely symmetrical. Blood pressure identical in both arms (148/92 right vs 146/90 left). Capillary refill 2.5 seconds.',
      clinicalSignificance:
        'Symmetrical pulses and equal bilateral arm pressures make Acute Aortic Dissection with branch vessel compromise significantly less likely.',
      isNormal: true,
    },
    chest_wall: {
      system: 'Chest Wall Palpation',
      revealed: false,
      finding:
        'Palpation of sternum, costochondral junctions, and pectoralis musculature does not reproduce or exacerbate the pain.',
      clinicalSignificance:
        'Excludes musculoskeletal chest wall syndrome (costochondritis / Tietze).',
      isNormal: true,
    },
    abdomen: {
      system: 'Abdomen',
      revealed: false,
      finding:
        'Soft, non-tender, non-distended. Bowel sounds present. No epigastric tenderness, no pulsatile abdominal aortic mass.',
      clinicalSignificance:
        'Rules out acute pancreatitis, perforated peptic ulcer, or expanding AAA.',
      isNormal: true,
    },
  },
  investigations: {
    ecg: {
      id: 'ecg',
      name: '12-Lead Diagnostic Electrocardiogram (ECG)',
      category: 'ecg',
      costTimeMin: 3,
      ordered: false,
      resultReady: false,
      resultTitle: '12-Lead ECG (Door-to-ECG Target < 10 mins)',
      resultDetails:
        'Sinus tachycardia at 102 bpm. Prominent 2.5 mm ST-segment elevation in leads V1, V2, V3, and V4 with tall, hyperacute T waves. Reciprocal ST-segment depressions in inferior leads (II, III, and aVF). PR intervals normal.',
      isHighYield: true,
      interpretationNotes:
        'ACUTE ANTEROSEPTAL STEMI. Culprit lesion is acute thrombotic occlusion of the proximal/mid Left Anterior Descending (LAD) coronary artery.',
    },
    troponin: {
      id: 'troponin',
      name: 'High-Sensitivity Cardiac Troponin I (hs-cTnI)',
      category: 'cardiac_biomarker',
      costTimeMin: 15,
      ordered: false,
      resultReady: false,
      resultTitle: 'High-Sensitivity Troponin I',
      resultDetails:
        'hs-cTnI: 480 ng/L (Upper Reference Limit: < 14 ng/L). Markedly elevated indicating acute myocardial necrosis.',
      isHighYield: true,
      interpretationNotes:
        'Confirms myocardial injury. However, in STEMI, CATH LAB ACTIVATION MUST NOT WAIT for biomarker results!',
    },
    cxr: {
      id: 'cxr',
      name: 'Portable Bedside Chest Radiograph (CXR)',
      category: 'imaging',
      costTimeMin: 12,
      ordered: false,
      resultReady: false,
      resultTitle: 'Portable AP Chest Radiograph',
      resultDetails:
        'Normal cardiothoracic ratio. Mediastinal width normal (< 8 cm); no aortic knob widening or double contour. Clear lung apices, mild vascular cephalization at bases. No pneumothorax, no pneumomediastinum.',
      isHighYield: true,
      interpretationNotes:
        'Essential pre-reperfusion imaging to rule out widened mediastinum (Aortic Dissection) and pneumothorax before full anticoagulation.',
    },
    pocus: {
      id: 'pocus',
      name: 'Point-of-Care Echocardiography (POCUS / Focus Echo)',
      category: 'bedside',
      costTimeMin: 5,
      ordered: false,
      resultReady: false,
      resultTitle: 'Bedside Focused Cardiac Ultrasound',
      resultDetails:
        'Clear parasternal and apical views: Regional wall motion abnormality with hypokinesis of the anterior septum and cardiac apex. Preserved right ventricular size and TAPSE (21 mm). Ascending aorta caliber 3.2 cm (normal). No pericardial effusion.',
      isHighYield: true,
      interpretationNotes:
        'Directly visualizes ischemia in the LAD distribution and excludes pericardial tamponade or proximal aortic root dissection.',
    },
    labs_general: {
      id: 'labs_general',
      name: 'Basic Metabolic Panel & Complete Blood Count (BMP + CBC)',
      category: 'general_lab',
      costTimeMin: 20,
      ordered: false,
      resultReady: false,
      resultTitle: 'Stat BMP, CBC & Coagulation',
      resultDetails:
        'WBC 11.4 x10^3/uL (mild stress demargination), Hb 14.2 g/dL, Platelets 238,000/uL. Na 139 mEq/L, K 4.2 mEq/L, Creatinine 1.0 mg/dL (eGFR > 60 mL/min), Glucose 178 mg/dL. PT/INR 1.0, aPTT 28 sec.',
      isHighYield: true,
      interpretationNotes:
        'Renal function preserved (safe for contrast angiography in cath lab). Normal potassium prevents arrhythmia vulnerability.',
    },
    ct_angio: {
      id: 'ct_angio',
      name: 'CT Angiography of Chest (PE & Dissection Protocol)',
      category: 'imaging',
      costTimeMin: 45,
      ordered: false,
      resultReady: false,
      resultTitle: 'CT Angiogram Chest',
      resultDetails:
        'Requires transporting an unstable ischemic patient out of the resuscitation bay to the radiology suite. Result delayed by 45 minutes.',
      isHighYield: false,
      interpretationNotes:
        'CRITICAL DELAY TRAP: Transferring a diagnosed STEMI patient to CT scan causes catastrophic reperfusion delay and increases mortality. Dissection was ruled out clinically, on CXR, and on echo.',
    },
  },
  ecgFindings: {
    ordered: false,
    leadElevation: ['V1', 'V2', 'V3', 'V4'],
    reciprocalDepression: ['II', 'III', 'aVF'],
    culpritVessel: 'Left Anterior Descending (LAD) Coronary Artery',
    studentInterpreted: false,
    studentDiagnosis: null,
  },
  troponinResults: {
    ordered: false,
    baselineValue: 480,
    referenceUpperLimit: 14,
    studentInterpreted: false,
  },
  redFlags: {
    rf_retrosternal_crushing: {
      id: 'rf_retrosternal_crushing',
      description: 'Crushing retrosternal chest pain > 20 minutes radiating to jaw and left arm',
      identified: false,
      importance: 'critical',
    },
    rf_autonomic_diaphoresis: {
      id: 'rf_autonomic_diaphoresis',
      description: 'Marked diaphoresis, pallor, and autonomic activation (Levine sign)',
      identified: false,
      importance: 'critical',
    },
    rf_cad_risk_factors: {
      id: 'rf_cad_risk_factors',
      description: 'Multiple high-risk CAD factors (Age 62, HTN, Diabetes, Smoking, Family premature CAD)',
      identified: false,
      importance: 'critical',
    },
    rf_pulmonary_crackles: {
      id: 'rf_pulmonary_crackles',
      description: 'Bibasilar inspiratory crackles signaling early LV decompensation (Killip II)',
      identified: false,
      importance: 'moderate',
    },
    rf_stemi_ecg: {
      id: 'rf_stemi_ecg',
      description: 'ST-Segment elevation ≥ 2.5 mm in contiguous precordial leads V1–V4 with reciprocal depression',
      identified: false,
      importance: 'critical',
    },
  },
  differentialDiagnosis: {
    stemi: {
      id: 'stemi',
      diagnosis: 'Acute ST-Elevation Myocardial Infarction (Anteroseptal STEMI - LAD Occlusion)',
      status: 'unaddressed',
      explanation:
        'Confirmed by ST elevations in V1–V4, reciprocal inferior ST depression, positive troponin, and regional wall motion defect.',
    },
    aortic_dissection: {
      id: 'aortic_dissection',
      diagnosis: 'Acute Type A Aortic Dissection',
      status: 'unaddressed',
      explanation:
        'Ruled out: Bilateral pulses and arm BPs are equal, no tearing back pain, normal mediastinum on CXR, normal aortic root on POCUS.',
    },
    pulmonary_embolism: {
      id: 'pulmonary_embolism',
      diagnosis: 'Massive Pulmonary Embolism',
      status: 'unaddressed',
      explanation:
        'Ruled out: No unilateral leg edema, no RV strain on ECG/echo, normal TAPSE, localized ST elevation in LAD territory rather than S1Q3T3.',
    },
    tension_pneumothorax: {
      id: 'tension_pneumothorax',
      diagnosis: 'Tension Pneumothorax',
      status: 'unaddressed',
      explanation:
        'Ruled out: Equal bilateral breath sounds, trachea is midline, no pneumothorax seen on chest x-ray.',
    },
    pericarditis: {
      id: 'pericarditis',
      diagnosis: 'Acute Pericarditis',
      status: 'unaddressed',
      explanation:
        'Ruled out: Pain is not pleuritic or positional; ST elevations are anatomical (V1-V4) with reciprocal depression (not diffuse concavity with PR depression).',
    },
  },
  managementActions: {
    aspirin: {
      id: 'aspirin',
      title: 'Aspirin 325 mg (Chewed, Non-Enteric Coated)',
      category: 'antiplatelet',
      description: 'Immediate antiplatelet therapy to inhibit thromboxane A2 and halt platelet aggregation.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Class I AHA/ACC recommendation. Chewing ensures rapid buccal and gastric absorption within minutes.',
    },
    p2y12_inhibitor: {
      id: 'p2y12_inhibitor',
      title: 'Ticagrelor 180 mg PO (or Prasugrel 60 mg / Clopidogrel 600 mg)',
      category: 'antiplatelet',
      description: 'Potent P2Y12 platelet receptor inhibitor for dual antiplatelet therapy (DAPT).',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Class I AHA/ESC recommendation: DAPT is mandatory prior to primary percutaneous coronary intervention (PCI).',
    },
    heparin: {
      id: 'heparin',
      title: 'Unfractionated Heparin IV Bolus (60 units/kg, max 4000 units)',
      category: 'anticoagulation',
      description: 'Parenteral anticoagulation to prevent recurrent thrombosis and support stent deployment.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Class I recommendation. Unfractionated heparin allows precise intra-procedural ACT monitoring in the cath lab.',
    },
    nitroglycerin: {
      id: 'nitroglycerin',
      title: 'Sublingual Nitroglycerin 0.4 mg (SL Q5min x 3 doses)',
      category: 'anti_ischemic',
      description: 'Venodilator reducing cardiac preload, wall stress, and myocardial oxygen demand.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Appropriate for active ischemic chest pain when systolic BP > 90 mmHg and no right ventricular infarct (safe in anterior STEMI).',
    },
    oxygen_withhold: {
      id: 'oxygen_withhold',
      title: 'Withhold Routine Supplemental Oxygen (Monitor SpO2 on Room Air at 94%)',
      category: 'oxygen',
      description: 'Avoiding hyperoxia in normoxic ACS patients.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'AHA / AVOID Trial Guidelines: Supplemental oxygen in normoxic patients (SpO2 ≥ 90%) induces coronary vasoconstriction, generates free radicals, and increases myocardial infarct size.',
    },
    oxygen_high_flow: {
      id: 'oxygen_high_flow',
      title: '100% Non-Rebreather High-Flow Oxygen Mask (15 L/min)',
      category: 'oxygen',
      description: 'Aggressive high-concentration oxygen therapy.',
      isIndicated: false,
      isContraindicated: true,
      applied: false,
      guidelineRationale:
        'CONTRAINDICATED IN NORMOXIA: Induces coronary microvascular spasm and expands myocardial infarction area. Guideline target is SpO2 90–96% only.',
    },
    defib_pads_telemetry: {
      id: 'defib_pads_telemetry',
      title: 'Continuous Cardiac Telemetry & Hands-Free Defibrillator Pads',
      category: 'monitoring',
      description: 'Immediate application of defibrillator pads to chest wall for rapid shock delivery.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Primary cause of out-of-hospital and early ED mortality in acute STEMI is ventricular fibrillation (VF) or pulseless VT. Defib pads save critical seconds.',
    },
    iv_access: {
      id: 'iv_access',
      title: 'Establish Dual Large-Bore IV Access (18-Gauge)',
      category: 'invasive',
      description: 'Two reliable peripheral lines for rapid emergency resuscitation medications.',
      isIndicated: true,
      isContraindicated: false,
      applied: false,
      guidelineRationale:
        'Essential for rapid heparin administration, procedural contrast sedation, and immediate resuscitation if arrest occurs.',
    },
    beta_blocker_iv: {
      id: 'beta_blocker_iv',
      title: 'Intravenous Metoprolol 5 mg IV Push',
      category: 'anti_ischemic',
      description: 'Immediate IV beta-blockade to reduce heart rate.',
      isIndicated: false,
      isContraindicated: true,
      applied: false,
      guidelineRationale:
        'HAZARD WARNING (COMMIT Trial): IV beta-blockers in acute STEMI with risk of heart failure (bibasilar crackles, Killip II, age > 60) precipitously increase the incidence of cardiogenic shock.',
    },
  },
  disposition: null,
  deteriorationState: 'stable_presentation',
  elapsedMinutes: 0,
  actionLog: [],
  isCompleted: false,
  scoreBreakdown: null,
  debriefReport: null,
};

export const DISPOSITION_OPTIONS = [
  {
    id: 'cath_lab_primary_pci',
    title: 'Stat Cardiac Catheterization Suite Activation for Primary PCI',
    description:
      'Activate interventional cardiology team immediately with Door-to-Balloon time target < 90 minutes. Transfer directly on telemetry with defibrillator pads.',
    isCorrect: true,
    timeframe: 'Target < 90 minutes door-to-balloon',
    debrief:
      'Flawless disposition! Emergent reperfusion via primary PCI is the gold standard for acute STEMI, restoring coronary patency and salvaging ischemic myocardium.',
  },
  {
    id: 'admit_telemetry_ward',
    title: 'Admit to General Inpatient Telemetry Ward for Serial Troponins',
    description:
      'Transfer patient to floor bed to await 3-hour and 6-hour repeat cardiac biomarkers before consulting cardiology.',
    isCorrect: false,
    timeframe: 'Delayed 6 to 12 hours',
    debrief:
      'CATASTROPHIC DELAY: A patient with STEMI on 12-lead ECG requires immediate emergent coronary reperfusion. Admitting to floor causes irreversible transmural myocardial necrosis and lethal arrhythmia.',
  },
  {
    id: 'emergency_fibrinolysis',
    title: 'Administer IV Fibrinolytic Therapy (Alteplase / Tenecteplase)',
    description:
      'Inject full-dose systemic thrombolytic agent in ED resuscitation bay.',
    isCorrect: false,
    timeframe: 'Immediate',
    debrief:
      'SUBOPTIMAL CHOICE: In a facility with a 24/7 on-site cardiac cath lab, Primary PCI is superior to fibrinolysis. Fibrinolysis is reserved only when PCI transfer delay exceeds 120 minutes and carries higher intracranial hemorrhage risk.',
  },
  {
    id: 'outpatient_stress_test',
    title: 'Discharge Home with Outpatient Nuclear Stress Test in 48 Hours',
    description:
      'Provide prescription for nitroglycerin and advise follow-up with primary care physician.',
    isCorrect: false,
    timeframe: 'Discharged',
    debrief:
      'FATAL TRAP: Discharging an active STEMI patient with ongoing ST-segment elevation leads to out-of-hospital cardiac arrest and death.',
  },
];

export function calculateCaseScoreAndDebrief(
  state: StructuredCaseState
): { score: CaseScoreBreakdown; debrief: DebriefReport } {
  // 1. History Taking (Max 20 pts)
  let historyScore = 0;
  const didWell: string[] = [];
  const missed: string[] = [];
  const keyPearls: string[] = [];

  // Check which history actions were unlocked or red flags acknowledged
  const rfIdentified = Object.values(state.redFlags).filter((r) => r.identified).length;
  historyScore += Math.min(12, rfIdentified * 3);

  const examCount = Object.values(state.examination).filter((e) => e.revealed).length;
  historyScore += Math.min(8, examCount * 1.6);
  historyScore = Math.round(historyScore);

  if (state.redFlags.rf_retrosternal_crushing.identified) {
    didWell.push('Identified classic retrosternal ischemic chest pain radiating to the left jaw and arm.');
  } else {
    missed.push('Failed to thoroughly explore the character and radiation of retrosternal chest pain.');
  }

  if (state.redFlags.rf_cad_risk_factors.identified) {
    didWell.push('Elicited comprehensive cardiovascular risk profile (Diabetes, HTN, 35-pack-year smoking, early family MI).');
  } else {
    missed.push('Missed eliciting the significant family history of premature sudden cardiac death (father at age 54).');
  }

  // 2. Investigation Selection (Max 20 pts)
  let invScore = 0;
  if (state.investigations.ecg.ordered) {
    invScore += 8;
    didWell.push('Ordered stat 12-Lead ECG within clinical arrival window (Door-to-ECG standard).');
  } else {
    missed.push('Did not order an immediate 12-lead ECG — Door-to-ECG < 10 mins is the bedrock of ACS care.');
  }

  if (state.investigations.troponin.ordered) {
    invScore += 4;
    didWell.push('Sent high-sensitivity cardiac troponin I for baseline biomarker evaluation.');
  }

  if (state.investigations.cxr.ordered) {
    invScore += 4;
    didWell.push('Ordered portable bedside chest radiograph to evaluate mediastinum and rule out pneumothorax prior to anticoagulation.');
  }

  if (state.investigations.pocus.ordered) {
    invScore += 4;
    didWell.push('Utilized bedside focused echocardiography (POCUS) confirming anteroseptal regional wall motion abnormality and normal aorta.');
  }

  if (state.investigations.ct_angio.ordered) {
    invScore = Math.max(4, invScore - 8);
    missed.push('Ordered CT Angiogram for chest pain in acute STEMI: Avoid unnecessary imaging transport that delays emergency cath lab reperfusion!');
  }

  // 3. Clinical Reasoning (Max 20 pts)
  let reasoningScore = 0;
  if (state.ecgFindings.studentInterpreted) {
    reasoningScore += 10;
    didWell.push('Accurately localized ST-segment elevations (V1–V4) to the Left Anterior Descending (LAD) anteroseptal territory.');
  } else {
    missed.push('Incomplete 12-lead ECG interpretation: Missed the hyperacute anteroseptal ST elevation and reciprocal inferior depression.');
  }

  if (state.troponinResults.studentInterpreted) {
    reasoningScore += 4;
    didWell.push('Correctly recognized that while troponin confirms myocardial necrosis, Cath Lab activation MUST NOT wait for lab biomarker turnaround in STEMI.');
  }

  const ruledOutDissection = state.differentialDiagnosis.aortic_dissection.status === 'ruled_out';
  if (ruledOutDissection) {
    reasoningScore += 3;
    didWell.push('Clinically evaluated and safely excluded acute aortic dissection (equal bilateral arm BPs and pulses, normal mediastinum).');
  } else {
    missed.push('Did not actively document ruling out Acute Aortic Dissection prior to aggressive heparinization.');
  }

  if (state.differentialDiagnosis.stemi.status === 'primary_suspect') {
    reasoningScore += 3;
  }

  // 4. Management (Max 25 pts)
  let mgmtScore = 0;
  if (state.managementActions.aspirin.applied) {
    mgmtScore += 5;
    didWell.push('Administered chewable Aspirin 325 mg immediately to arrest coronary platelet thrombus.');
  } else {
    missed.push('Omitted immediate chewable Aspirin 325 mg (mandatory Class I recommendation in ACS).');
  }

  if (state.managementActions.p2y12_inhibitor.applied) {
    mgmtScore += 4;
    didWell.push('Initiated Dual Antiplatelet Therapy (DAPT) with potent P2Y12 inhibitor (Ticagrelor).');
  } else {
    missed.push('Missed dual antiplatelet loading (P2Y12 inhibitor) prior to cardiac catheterization.');
  }

  if (state.managementActions.heparin.applied) {
    mgmtScore += 4;
    didWell.push('Administered IV Unfractionated Heparin bolus to prevent recurrent coronary thrombosis.');
  }

  if (state.managementActions.defib_pads_telemetry.applied) {
    mgmtScore += 4;
    didWell.push('Applied continuous defibrillator pads and telemetry — essential protection against early ischemic ventricular fibrillation.');
  } else {
    missed.push('Failed to preemptively attach hands-free defibrillator pads in acute anterior STEMI.');
  }

  if (state.managementActions.iv_access.applied) {
    mgmtScore += 3;
    didWell.push('Secured dual large-bore IV access for resuscitation.');
  }

  if (state.managementActions.oxygen_withhold.applied) {
    mgmtScore += 3;
    didWell.push('Adhered to modern AHA/ESC oxygenation guidelines: Withheld routine supplemental O2 in normoxic patient (SpO2 94%) to avoid coronary vasoconstriction.');
  }

  if (state.managementActions.oxygen_high_flow.applied) {
    mgmtScore = Math.max(0, mgmtScore - 4);
    missed.push('Applied routine high-flow oxygen to a normoxic patient (SpO2 94%): Hyperoxia causes coronary arterial vasoconstriction and increases myocardial infarct size.');
  }

  if (state.managementActions.beta_blocker_iv.applied) {
    mgmtScore = Math.max(0, mgmtScore - 6);
    missed.push('Administered IV beta-blocker in acute STEMI with bibasilar crackles (Killip II): High risk of precipitating cardiogenic shock (COMMIT trial contraindication).');
  }

  if (state.managementActions.nitroglycerin.applied) {
    mgmtScore += 2;
    didWell.push('Administered sublingual nitroglycerin appropriately with blood pressure monitoring.');
  }

  // 5. Time Efficiency & Disposition (Max 15 pts)
  let timeScore = 0;
  if (state.disposition?.isCorrect) {
    timeScore += 10;
    didWell.push('Activated the Cardiac Catheterization Team for emergent Primary Percutaneous Coronary Intervention (PCI).');
  } else {
    missed.push('Selected an inappropriate or delayed disposition for an acute STEMI patient.');
  }

  // Time penalty if elapsed simulated time was delayed
  if (state.elapsedMinutes <= 15) {
    timeScore += 5;
    didWell.push('Maintained rapid Door-to-Cath Lab activation under 15 minutes of ED arrival.');
  } else if (state.elapsedMinutes <= 25) {
    timeScore += 3;
  } else {
    timeScore += 1;
    missed.push('Excessive bedside deliberation: Reperfusion was delayed beyond the optimal door-to-activation window.');
  }

  // Key Learning Pearls
  keyPearls.push(
    'DOOR-TO-BALLOON TARGET: In acute STEMI, the goal is primary PCI reperfusion within < 90 minutes of first medical contact. Time is myocardium.'
  );
  keyPearls.push(
    'OXYGEN IN ACS (AHA/AVOID TRIAL): Routine supplemental oxygen is contraindicated when SpO2 ≥ 90%. Normoxic hyperoxia causes coronary vasoconstriction and augments reactive oxygen species.'
  );
  keyPearls.push(
    'NEVER WAIT FOR TROPONIN IN STEMI: Diagnostic ST-segment elevation on a 12-lead ECG is an emergent indication for reperfusion; waiting for laboratory biomarker confirmation causes irreversible myocardial death.'
  );
  keyPearls.push(
    'KILLIP CLASSIFICATION: Bibasilar inspiratory crackles signify elevated LV end-diastolic pressure (Killip Class II) and warn of impending cardiogenic shock; IV beta-blockers must be avoided.'
  );
  keyPearls.push(
    'RULE OUT AORTIC DISSECTION BEFORE HEPARIN: Always verify bilateral upper extremity blood pressure equality and pulse symmetry to ensure you are not anticoagulating an ascending aortic tear.'
  );

  const totalScore = Math.min(
    100,
    Math.max(0, historyScore + invScore + reasoningScore + mgmtScore + timeScore)
  );

  return {
    score: {
      historyTaking: Math.min(20, historyScore),
      investigationSelection: Math.min(20, invScore),
      clinicalReasoning: Math.min(20, reasoningScore),
      management: Math.min(25, mgmtScore),
      timeEfficiency: Math.min(15, timeScore),
      totalScore,
    },
    debrief: {
      whatWentWell: didWell,
      whatWasMissed: missed,
      keyLearningPoints: keyPearls,
    },
  };
}
