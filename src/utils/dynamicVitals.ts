import { PatientVitals, ClinicalAction } from '../types/nightShift';
/**
 * Parses systolic and diastolic from "120/80" string.
 */
export function parseBP(bpString: string): { sys: number; dia: number; map: number } {
  const parts = (bpString || '120/80').split('/').map((s) => parseInt(s.trim(), 10));
  const sys = isNaN(parts[0]) ? 120 : parts[0];
  const dia = isNaN(parts[1]) ? 80 : parts[1];
  const map = Math.round(dia + (sys - dia) / 3);
  return { sys, dia, map };
}
/**
 * Calculates updated vitals based on previous vitals, clinical actions taken,
 * and current physiologic status.
 */
export function calculateDynamicVitals(
  currentVitals: PatientVitals,
  action: ClinicalAction,
  newStability: number,
  circulation: number,
  breathing: number
): PatientVitals {
  const { sys: prevSys, dia: prevDia } = parseBP(currentVitals.bp);
  let newSys = prevSys;
  let newDia = prevDia;
  let newHr = currentVitals.hr;
  let newSpo2 = currentVitals.spo2;
  let newRr = currentVitals.rr;
  let newGcs = currentVitals.gcs;
  let newRhythm = currentVitals.rhythm;
  let newTemp = currentVitals.tempC;

  const actionName = action.name.toLowerCase();
  const isCorrect = action.impact.isCorrectIntervention;

  // 1. CARDIAC ARREST & DEFIBRILLATION
  if (actionName.includes('defibrillat') || actionName.includes('shock') || actionName.includes('cpr')) {
    if (currentVitals.rhythm.toLowerCase().includes('fibrillation') || currentVitals.hr === 0) {
      if (isCorrect) {
        newRhythm = 'Sinus Tachycardia';
        newHr = 104;
        newSys = 94;
        newDia = 58;
        newSpo2 = 91;
        newGcs = 6;
      }
    }
  }

  // 2. SYNCHRONIZED CARDIOVERSION
  else if (actionName.includes('cardioversion')) {
    if (isCorrect) {
      newRhythm = 'Normal Sinus Rhythm';
      newHr = 84;
      newSys = Math.min(130, newSys + 20);
      newDia = Math.min(85, newDia + 12);
    }
  }

  // 3. FLUID RESUSCITATION (Crystalloids / Blood)
  else if (
    actionName.includes('crystalloid') ||
    actionName.includes('saline') ||
    actionName.includes('fluid bolus') ||
    actionName.includes('prbc') ||
    actionName.includes('blood')
  ) {
    if (isCorrect) {
      // Hypovolemic or Septic Shock responding
      newSys = Math.min(130, newSys + 18);
      newDia = Math.min(84, newDia + 12);
      if (newHr > 100) {
        newHr = Math.max(76, newHr - 16); // compensatory tachycardia subsides
      }
      newGcs = Math.min(15, newGcs + 1);
    } else {
      // Fluid overload in cardiogenic pulmonary edema
      newSpo2 = Math.max(75, newSpo2 - 8);
      newRr = Math.min(42, newRr + 6);
      newHr = Math.min(150, newHr + 12);
    }
  }

  // 4. VASOPRESSORS (Norepinephrine / Epinephrine)
  else if (
    actionName.includes('norepinephrine') ||
    actionName.includes('vasopressor') ||
    actionName.includes('epinephrine')
  ) {
    if (isCorrect) {
      newSys = Math.max(105, newSys + 24);
      newDia = Math.max(65, newDia + 16);
      if (newHr > 120) newHr -= 10;
    } else {
      newSys = Math.min(220, newSys + 35);
      newHr = Math.min(160, newHr + 25);
    }
  }

  // 5. OXYGENATION & AIRWAY (Intubation, BiPAP, Non-rebreather, Cannula, BVM)
  else if (
    actionName.includes('oxygen') ||
    actionName.includes('bipap') ||
    actionName.includes('cpap') ||
    actionName.includes('intubat') ||
    actionName.includes('mask') ||
    actionName.includes('nebuliz')
  ) {
    if (isCorrect) {
      newSpo2 = Math.min(99, Math.max(95, newSpo2 + 12));
      newRr = Math.max(16, Math.min(24, newRr - 8));
      if (newHr > 105) newHr = Math.max(75, newHr - 12);
    } else {
      // e.g. contra-indicated sedation or delayed airway
      newSpo2 = Math.max(74, newSpo2 - 6);
      newGcs = Math.max(3, newGcs - 2);
    }
  }

  // 6. NEEDLE DECOMPRESSION / CHEST TUBE (Tension Pneumothorax)
  else if (actionName.includes('needle') || actionName.includes('thoracostomy') || actionName.includes('chest tube')) {
    if (isCorrect) {
      newSys = Math.max(112, newSys + 35);
      newDia = Math.max(72, newDia + 22);
      newSpo2 = Math.max(96, newSpo2 + 16);
      newHr = Math.max(82, newHr - 35);
      newRr = 18;
      newRhythm = 'Normal Sinus Rhythm';
    }
  }

  // 7. ANALGESIA / SEDATION (Fentanyl, Morphine)
  else if (actionName.includes('fentanyl') || actionName.includes('morphine') || actionName.includes('analges')) {
    if (isCorrect) {
      if (newHr > 90) newHr = Math.max(68, newHr - 12);
      if (newSys > 140) newSys = Math.max(120, newSys - 15);
      newRr = Math.max(14, newRr - 3);
    } else {
      // Sedative in compromised airway
      newGcs = Math.max(4, newGcs - 4);
      newSpo2 = Math.max(78, newSpo2 - 10);
      newRr = Math.max(6, newRr - 8);
    }
  }

  // 8. CONTRAINDICATED DRUGS (Beta blocker in shock, nitroglycerin in RV MI)
  else if (actionName.includes('metoprolol') || actionName.includes('beta blocker')) {
    if (!isCorrect) {
      newSys = Math.max(55, newSys - 35);
      newDia = Math.max(30, newDia - 20);
      newHr = Math.max(38, newHr - 35);
    }
  } else if (actionName.includes('nitroglycerin')) {
    if (!isCorrect) {
      newSys = Math.max(62, newSys - 38);
      newDia = Math.max(36, newDia - 22);
      newHr = Math.min(145, newHr + 20); // reflex tachycardia
    }
  }

  // 9. NALOXONE (Opioid reversal)
  else if (actionName.includes('naloxone') || actionName.includes('narcan')) {
    if (isCorrect) {
      newRr = 16;
      newSpo2 = 98;
      newGcs = 14;
      newHr = 88;
    }
  }

  // 10. GENERAL PHYSIOLOGIC DRIFT BASED ON STABILITY DELTA
  if (action.impact.stabilityDelta > 0) {
    // Healing drift towards normal homeostatic values
    if (newSpo2 < 95) newSpo2 = Math.min(98, newSpo2 + 3);
    if (newHr > 110) newHr = Math.max(80, newHr - 6);
    if (newHr < 55 && newHr > 0) newHr = Math.min(68, newHr + 8);
    if (newSys < 90) newSys = Math.min(115, newSys + 10);
    if (newSys > 160) newSys = Math.max(130, newSys - 10);
  } else if (action.impact.stabilityDelta < 0) {
    // Deterioration drift
    if (newSpo2 > 82) newSpo2 = Math.max(76, newSpo2 - 4);
    if (newHr >= 60 && newHr < 140) newHr = Math.min(155, newHr + 8);
    if (newSys > 70) newSys = Math.max(62, newSys - 12);
  }

  // Ensure physiological bounds
  newSys = Math.round(Math.max(40, Math.min(240, newSys)));
  newDia = Math.round(Math.max(20, Math.min(140, Math.min(newSys - 15, newDia))));
  newHr = Math.round(Math.max(0, Math.min(220, newHr)));
  newSpo2 = Math.round(Math.max(50, Math.min(100, newSpo2)));
  newRr = Math.round(Math.max(0, Math.min(55, newRr)));
  newGcs = Math.round(Math.max(3, Math.min(15, newGcs)));

  return {
    hr: newHr,
    bp: `${newSys}/${newDia}`,
    rr: newRr,
    spo2: newSpo2,
    tempC: newTemp,
    rhythm: newRhythm,
    gcs: newGcs,
  };
}
