export interface DiagnosticInterpretation {
  rawTelemetry: string;
  physiologicalMeaning: string;
  dangerAlert: string;
  organAtRisk: string;
}

/**
 * Returns a human-understandable physiological explanation for diagnostic findings
 * (EKG, CXR, ABG, POCUS, Labs) matching USMLE/clinical guidelines.
 */
export function interpretDiagnosticClue(
  category: string,
  title: string,
  rawDescription: string
): DiagnosticInterpretation {
  const lowerDesc = rawDescription.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // 1. EKG / ECG
  if (
    category === 'ecg' ||
    lowerTitle.includes('ecg') ||
    lowerTitle.includes('ekg') ||
    lowerTitle.includes('telemetry')
  ) {
    if (
      lowerDesc.includes('st elevation in ii, iii, avf') ||
      lowerDesc.includes('inferior') ||
      lowerDesc.includes('stemi')
    ) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '🚨 Heart Attack Warning',
        physiologicalMeaning:
          'The bottom wall of the heart is suffocating from a blocked blood vessel right now.',
        organAtRisk: 'Inferior Myocardium & Right Ventricle',
      };
    }
    if (lowerDesc.includes('vfib') || lowerDesc.includes('ventricular fibrillation')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '🚨 Cardiac Arrest Emergency',
        physiologicalMeaning:
          'The heart chambers are quivering chaotically with zero forward blood flow to the brain.',
        organAtRisk: 'Entire Brain & Body',
      };
    }
    if (lowerDesc.includes('peaked t') || lowerDesc.includes('hyperkalemia')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Toxic Potassium Surge',
        physiologicalMeaning:
          'Dangerous electrolyte voltage overload is threatening to freeze the heart muscle.',
        organAtRisk: 'Cardiac Conduction System',
      };
    }
    if (lowerDesc.includes('sgarbossa') || lowerDesc.includes('lbbb') || lowerDesc.includes('anterior')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '🚨 Critical Coronary Occlusion',
        physiologicalMeaning:
          'Major arterial blood supply to the main heart pumping chamber is cut off.',
        organAtRisk: 'Left Ventricle Anterior Wall',
      };
    }

    return {
      rawTelemetry: rawDescription,
      dangerAlert: 'Heart Rhythm Analysis',
      physiologicalMeaning:
        'The heart’s electrical firing pattern indicates severe cardiovascular distress.',
      organAtRisk: 'Cardiovascular Circulatory Circuit',
    };
  }

  // 2. CXR / Chest Imaging
  if (
    category === 'imaging' ||
    lowerTitle.includes('cxr') ||
    lowerTitle.includes('x-ray') ||
    lowerTitle.includes('chest film')
  ) {
    if (
      lowerDesc.includes('deep sulcus') ||
      lowerDesc.includes('pneumothorax') ||
      lowerDesc.includes('mediastinal shift')
    ) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '🚨 Lung Collapse',
        physiologicalMeaning:
          'Trapped high-pressure air inside the chest is crushing the heart flat and blocking blood flow.',
        organAtRisk: 'Lungs, Great Vessels & Heart Refill',
      };
    }
    if (lowerDesc.includes('edema') || lowerDesc.includes('kerley') || lowerDesc.includes('congestion')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Fluid In Lungs (Pulmonary Edema)',
        physiologicalMeaning:
          'Back-pressure from a failing heart pump is forcing water directly into the lung air sacs.',
        organAtRisk: 'Alveolar Gas Exchange',
      };
    }
    if (lowerDesc.includes('infiltrate') || lowerDesc.includes('consolidation')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Severe Lung Infection',
        physiologicalMeaning:
          'Pus and inflammatory fluid have filled lung tissue, preventing oxygen uptake.',
        organAtRisk: 'Pulmonary Parenchyma',
      };
    }

    return {
      rawTelemetry: rawDescription,
      dangerAlert: 'Thoracic Structural Finding',
      physiologicalMeaning:
        'Physical imaging reveals anatomical compromise inside the chest or skeletal framework.',
      organAtRisk: 'Thoracic Cavity',
    };
  }

  // 3. ABG / VBG / Arterial Blood Gas
  if (
    lowerTitle.includes('abg') ||
    lowerTitle.includes('arterial blood gas') ||
    lowerTitle.includes('vbg') ||
    lowerTitle.includes('blood gas')
  ) {
    return {
      rawTelemetry: rawDescription,
      dangerAlert: '⚠️ Acidic Blood Poisoning',
      physiologicalMeaning:
        'High carbon dioxide and lactic acid buildup indicate the body’s tissues are starving for oxygen.',
      organAtRisk: 'Cellular Metabolism & Cellular pH',
    };
  }

  // 4. POCUS / Ultrasound
  if (
    category === 'pocus' ||
    lowerTitle.includes('pocus') ||
    lowerTitle.includes('ultrasound') ||
    lowerTitle.includes('echo')
  ) {
    if (
      lowerDesc.includes('pericardial') ||
      lowerDesc.includes('effusion') ||
      lowerDesc.includes('tamponade') ||
      lowerDesc.includes('rv collapse')
    ) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Fluid Compression Trap Around Heart',
        physiologicalMeaning:
          'Trapped blood or fluid in the stiff heart sac is physically crushing the pump so it cannot refill.',
        organAtRisk: 'Cardiac Diastolic Filling',
      };
    }
    if (lowerDesc.includes('hyperdynamic') || lowerDesc.includes('inferior vena cava')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Empty Heart Chamber Warning',
        physiologicalMeaning:
          'The heart is squeezing against nearly empty chambers due to severe dehydration or blood loss.',
        organAtRisk: 'Venous Return & Preload',
      };
    }

    return {
      rawTelemetry: rawDescription,
      dangerAlert: 'Bedside Sonogram Finding',
      physiologicalMeaning:
        'Real-time sound waves reveal anatomical fluid shifts and organ wall dynamics.',
      organAtRisk: 'Target Organ Function',
    };
  }

  // 5. Labs / Stat Serums
  if (category === 'labs' || lowerTitle.includes('labs') || lowerTitle.includes('troponin') || lowerTitle.includes('potassium')) {
    if (lowerDesc.includes('troponin') || lowerDesc.includes('trop')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '🚨 Heart Cell Death Marker',
        physiologicalMeaning:
          'Dead and dying heart muscle cells are leaking intracellular structural protein directly into the blood.',
        organAtRisk: 'Myocardium',
      };
    }
    if (lowerDesc.includes('lactate') || lowerDesc.includes('acidosis')) {
      return {
        rawTelemetry: rawDescription,
        dangerAlert: '⚠️ Cellular Starvation Alarm (High Lactate)',
        physiologicalMeaning:
          'Tissues across the body are choking for oxygen and resorting to emergency fermentation, generating lactic acid.',
        organAtRisk: 'Systemic Microvasculature',
      };
    }
  }

  // General Fallback
  return {
    rawTelemetry: rawDescription,
    dangerAlert: 'Clinical Finding',
    physiologicalMeaning: rawDescription,
    organAtRisk: 'Overall Patient Stability',
  };
}

/**
 * Returns plain-English physiological interpretation for vital signs
 */
export function interpretVitals(vitals: {
  hr: number;
  bp: string;
  spo2: number;
  rr?: number;
  rhythm?: string;
}) {
  const bpParts = vitals.bp.split('/').map((n) => parseInt(n.trim(), 10));
  const sys = isNaN(bpParts[0]) ? 120 : bpParts[0];
  const dia = isNaN(bpParts[1]) ? 80 : bpParts[1];
  const map = Math.round(dia + (sys - dia) / 3);

  const isArrest = vitals.hr === 0;
  const isHypotensive = map < 65 && vitals.hr > 0;
  const isHypertensiveEmergency = sys > 180 || dia > 110;
  const isTachy = vitals.hr > 110;
  const isBrady = vitals.hr > 0 && vitals.hr < 60;
  const isHypoxemic = vitals.spo2 < 92;
  const isTachypneic = (vitals.rr || 16) > 24;

  let bpMeaning = 'Adequate perfusion pressure reaching brain and kidneys.';
  if (isArrest) {
    bpMeaning = '🚨 ZERO BLOOD PRESSURE: Heart has ceased pumping; initiate CPR immediately.';
  } else if (isHypotensive) {
    bpMeaning = `🚨 Critically low blood pressure (${vitals.bp}) — organs (brain & kidneys) are losing blood flow.`;
  } else if (isHypertensiveEmergency) {
    bpMeaning = `⚠️ Dangerous hypertensive crisis (${vitals.bp}) — high pressure threatens brain bleed and heart overload.`;
  }

  let hrMeaning = 'Heart is beating at a physiological resting pace.';
  if (isArrest) {
    hrMeaning = '🚨 CARDIAC ARREST: No pulse.';
  } else if (isTachy) {
    hrMeaning = `⚠️ Heart is beating dangerously fast (${vitals.hr} bpm) trying to compensate for low oxygen or blood loss.`;
  } else if (isBrady) {
    hrMeaning = `⚠️ Heart is beating dangerously slow (${vitals.hr} bpm) to supply adequate blood to the brain.`;
  }

  let o2Meaning = 'Blood is carrying healthy oxygen saturation to tissues.';
  if (isHypoxemic) {
    o2Meaning = `🚨 Critically low blood oxygen (${vitals.spo2}%) — brain and tissues are suffocating.`;
  }

  let rrMeaning = 'Normal respiratory rate.';
  if (isTachypneic) {
    rrMeaning = `⚠️ Fast respiratory rate (${vitals.rr}/min) — body is struggling to expel excess acid and take in oxygen.`;
  }

  return {
    bpMeaning,
    hrMeaning,
    o2Meaning,
    rrMeaning,
    map,
    isHypotensive,
    isArrest,
    isHypoxemic,
  };
}
