export interface MedicalGlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  category: 'cardiology' | 'resuscitation' | 'pharmacology' | 'trauma' | 'diagnostics' | 'airway';
  plainDefinition: string;
  whyItMatters: string;
  iconName?: string;
}

export const MEDICAL_GLOSSARY: Record<string, MedicalGlossaryEntry> = {
  'rv-infarction': {
    id: 'rv-infarction',
    term: 'RV Infarction',
    aliases: ['rv infarct', 'right ventricular infarction', 'rv stemi', 'inferior stemi with rv involvement'],
    category: 'cardiology',
    plainDefinition: 'A heart attack affecting the right ventricle—the chamber responsible for pumping deoxygenated blood to the lungs.',
    whyItMatters: 'The right ventricle relies heavily on high fluid volume (preload) to pump blood forward. Giving blood pressure-lowering drugs like nitroglycerin collapses blood pressure instantly.',
  },
  'inotrope': {
    id: 'inotrope',
    term: 'Inotrope',
    aliases: ['inotropes', 'inotropic', 'inotropic support', 'dobutamine', 'milrinone'],
    category: 'pharmacology',
    plainDefinition: 'A medication that alters the muscular squeezing strength of the heartbeat.',
    whyItMatters: 'Positive inotropes (like Dobutamine) force a failing heart to squeeze harder, but they also increase myocardial oxygen demand and can trigger lethal cardiac arrhythmias.',
  },
  'preload': {
    id: 'preload',
    term: 'Preload',
    aliases: ['preload-dependent', 'filling pressure', 'end-diastolic volume'],
    category: 'cardiology',
    plainDefinition: 'The amount of blood stretching the heart chambers just before they contract to pump blood.',
    whyItMatters: 'If preload drops too low (e.g. severe dehydration or vasodilator drugs), the heart pump runs dry and blood pressure crashes immediately.',
  },
  'afterload': {
    id: 'afterload',
    term: 'Afterload',
    aliases: ['systemic vascular resistance', 'arterial resistance'],
    category: 'cardiology',
    plainDefinition: 'The resistance and pressure the heart must push against to eject blood into the body.',
    whyItMatters: 'High afterload overworks the heart during heart failure, while dangerously low afterload causes septic circulatory collapse.',
  },
  'alteplase': {
    id: 'alteplase',
    term: 'Alteplase (tPA)',
    aliases: ['alteplase', 'tpa', 'thrombolysis', 'thrombolytic', 'clot buster'],
    category: 'pharmacology',
    plainDefinition: 'A powerful intravenous enzyme that rapidly dissolves blood clots inside critical blood vessels.',
    whyItMatters: 'Life-saving in massive pulmonary embolisms and acute ischemic strokes, but carries a high risk of catastrophic fatal internal or intracranial bleeding.',
  },
  'hyperkalemia': {
    id: 'hyperkalemia',
    term: 'Hyperkalemia',
    aliases: ['elevated potassium', 'high potassium', 'serum potassium > 6.0'],
    category: 'resuscitation',
    plainDefinition: 'Dangerously high levels of potassium electrolyte circulating in the bloodstream.',
    whyItMatters: 'Potassium controls heart electricity; high levels destabilize the heart muscle, leading to peaked T-waves, sine waves, and sudden cardiac arrest unless shielded by IV Calcium.',
  },
  'calcium-gluconate': {
    id: 'calcium-gluconate',
    term: 'Calcium Gluconate',
    aliases: ['calcium chloride', 'iv calcium', 'membrane stabilization'],
    category: 'pharmacology',
    plainDefinition: 'An intravenous mineral solution given to quickly stabilize and shield cardiac cell membranes.',
    whyItMatters: 'It does NOT lower blood potassium levels, but it buys 30-60 minutes of critical electrical armor preventing the heart from going into ventricular fibrillation.',
  },
  'pericardiocentesis': {
    id: 'pericardiocentesis',
    term: 'Pericardiocentesis',
    aliases: ['needle pericardiocentesis', 'subxiphoid tap', 'pericardial tap'],
    category: 'trauma',
    plainDefinition: 'Inserting an emergency needle through the chest into the sac surrounding the heart to drain trapped blood or fluid.',
    whyItMatters: 'In cardiac tamponade, draining as little as 15–30 mL of fluid relieves crushing pressure on the heart and restores life-saving blood pressure immediately.',
  },
  'tension-pneumothorax': {
    id: 'tension-pneumothorax',
    term: 'Tension Pneumothorax',
    aliases: ['tension pneumo', 'pneumothorax with tension', 'trapped chest air'],
    category: 'trauma',
    plainDefinition: 'A one-way valve tear in the lung where air enters the chest cavity on inspiration but cannot escape, building dangerous pressure.',
    whyItMatters: 'The rising air pressure kinks the vena cava and crushes the heart flat. Demands instant needle decompression without waiting for X-rays.',
  },
  'needle-decompression': {
    id: 'needle-decompression',
    term: 'Needle Decompression',
    aliases: ['needle thoracostomy', 'finger thoracostomy', 'chest decompression'],
    category: 'trauma',
    plainDefinition: 'Placing a large-bore needle into the 4th/5th intercostal space mid-axillary line to vent pressurized trapped air.',
    whyItMatters: 'Instantly converts a lethal tension pneumothorax into an open simple pneumothorax, un-kinking major blood vessels and restoring cardiac return.',
  },
  'stemi': {
    id: 'stemi',
    term: 'STEMI',
    aliases: ['st-elevation myocardial infarction', 'code stemi', 'st elevation'],
    category: 'cardiology',
    plainDefinition: 'ST-Elevation Myocardial Infarction: a full-thickness heart attack caused by a completely blocked coronary artery.',
    whyItMatters: 'Heart muscle cells begin dying within 20 minutes of total blockage. Time is muscle—requires immediate catheterization lab balloon angioplasty.',
  },
  'vasopressor': {
    id: 'vasopressor',
    term: 'Vasopressor',
    aliases: ['norepinephrine', 'levophed', 'epinephrine drip', 'pressors'],
    category: 'pharmacology',
    plainDefinition: 'A potent medication that constricts blood vessels to raise critically low blood pressure in shock.',
    whyItMatters: 'Essential in septic and vasodilatory shock to guarantee blood flow reaches the brain and kidneys, but can cause peripheral limb ischemia if fluid deficit is uncorrected.',
  },
  'cardiogenic-shock': {
    id: 'cardiogenic-shock',
    term: 'Cardiogenic Shock',
    aliases: ['pump failure', 'cardiac failure shock'],
    category: 'cardiology',
    plainDefinition: 'Severe circulatory failure caused by the heart’s inability to pump sufficient blood despite normal blood volume.',
    whyItMatters: 'Giving excessive IV fluids will flood the lungs with pulmonary edema. Requires gentle inotropic support or mechanical circulatory assist devices.',
  },
  'naloxone': {
    id: 'naloxone',
    term: 'Naloxone (Narcan)',
    aliases: ['narcan', 'opioid antagonist', 'intranasal naloxone'],
    category: 'pharmacology',
    plainDefinition: 'A pure opioid receptor blocker that rapidly reverses life-threatening respiratory depression caused by opioids like fentanyl or heroin.',
    whyItMatters: 'Restores spontaneous breathing within 2–3 minutes. However, its duration of action is shorter than many opioids, so patients can crash back into overdose after 45 minutes.',
  },
  'epinephrine': {
    id: 'epinephrine',
    term: 'Epinephrine',
    aliases: ['epipen', 'adrenaline', 'im epinephrine', 'iv epinephrine'],
    category: 'pharmacology',
    plainDefinition: 'Adrenaline hormone that opens constricted airways (beta-2) and tightens leaky blood vessels (alpha-1).',
    whyItMatters: 'The first-line and only medication that stops the progression of fatal anaphylaxis. Must be administered into the anterolateral thigh without delay.',
  },
  'agonal-breathing': {
    id: 'agonal-breathing',
    term: 'Agonal Breathing',
    aliases: ['agonal gasps', 'gasping', 'dying breaths'],
    category: 'airway',
    plainDefinition: 'Reflexive, irregular snorting or gasping sounds caused by brainstem ischemia when blood has stopped circulating.',
    whyItMatters: 'Agonal gasps are NOT real breathing; they are a hallmark sign of cardiac arrest. Bystanders frequently confuse gasping with normal breathing and mistakenly delay CPR.',
  },
  'aed': {
    id: 'aed',
    term: 'AED',
    aliases: ['automated external defibrillator', 'defibrillator', 'defib pads'],
    category: 'resuscitation',
    plainDefinition: 'Automated External Defibrillator: a portable computerized device that analyzes heart rhythms and delivers electric shocks when needed.',
    whyItMatters: 'Delivering a defibrillation shock within the first 3 minutes of Ventricular Fibrillation increases survival rates to over 70%.',
  },
  'vfib': {
    id: 'vfib',
    term: 'Ventricular Fibrillation (V-Fib)',
    aliases: ['v-fib', 'vf', 'fibrillation'],
    category: 'cardiology',
    plainDefinition: 'A chaotic, disorganized electrical quiver in the ventricles preventing any coordinated pumping of blood.',
    whyItMatters: 'Zero blood flows to the brain. The patient is pulseless and in cardiac arrest. The only cure is an immediate electric shock from a defibrillator.',
  },
  'angioedema': {
    id: 'angioedema',
    term: 'Angioedema',
    aliases: ['facial swelling', 'tongue swelling', 'lip swelling'],
    category: 'airway',
    plainDefinition: 'Rapid swelling of the deep layers of the skin, lips, tongue, and throat tissues.',
    whyItMatters: 'Can swell the upper airway completely shut in minutes, resulting in rapid asphyxiation if not treated immediately with epinephrine and airway control.',
  },
  'stridor': {
    id: 'stridor',
    term: 'Stridor',
    aliases: ['high-pitched inspiratory sound', 'laryngeal stridor'],
    category: 'airway',
    plainDefinition: 'A high-pitched harsh whistling sound heard on inspiration caused by turbulent airflow through a narrowed upper airway.',
    whyItMatters: 'An ominous sign of impending total upper airway obstruction. Requires urgent clinical preparation for difficult intubation or surgical airway.',
  },
  'tamponade': {
    id: 'tamponade',
    term: 'Cardiac Tamponade',
    aliases: ['pericardial tamponade', 'becks triad'],
    category: 'cardiology',
    plainDefinition: 'Compression of the heart caused by blood or fluid accumulating rapidly inside the stiff pericardial sac.',
    whyItMatters: 'Presents with Beck’s triad (muffled heart tones, jugular venous distension, hypotension) and causes obstructive shock that only needle pericardiocentesis can relieve.',
  },
  'pocus': {
    id: 'pocus',
    term: 'POCUS (Ultrasound)',
    aliases: ['point-of-care ultrasound', 'focused ultrasound', 'bedside echo'],
    category: 'diagnostics',
    plainDefinition: 'Point-of-Care Ultrasound: real-time sonography performed right at the patient’s bedside by the treating clinician.',
    whyItMatters: 'Differentiates shock causes (cardiac pump failure vs pneumothorax vs internal bleeding) in under 60 seconds without moving unstable patients to radiology.',
  },
  'abg': {
    id: 'abg',
    term: 'Arterial Blood Gas (ABG)',
    aliases: ['arterial gas', 'blood gas', 'blood acid-base'],
    category: 'diagnostics',
    plainDefinition: 'A blood test drawn from an artery measuring blood pH, oxygen, carbon dioxide, and acid-base status.',
    whyItMatters: 'Measures exact cellular respiration and gas exchange; reveals severe metabolic acidosis and tissue hypoperfusion before outward vitals collapse.',
  },
  'cxr': {
    id: 'cxr',
    term: 'Chest X-Ray (CXR)',
    aliases: ['portable chest x-ray', 'radiograph', 'chest film'],
    category: 'diagnostics',
    plainDefinition: 'A rapid radiographic image of the lungs, heart silhouette, ribs, and pleural spaces.',
    whyItMatters: 'Detects pulmonary edema, pneumothorax, pneumonia, widened mediastinum, and endotracheal tube placement at the bedside.',
  },
  'ekg': {
    id: 'ekg',
    term: '12-Lead EKG',
    aliases: ['ecg', 'electrocardiogram', '12-lead telemetry'],
    category: 'diagnostics',
    plainDefinition: 'A graphical recording of the electrical voltage vectors generated by the heart muscle over time.',
    whyItMatters: 'The gold standard for detecting acute arterial occlusions (STEMI), deadly conduction blocks, electrolyte toxicity, and fatal arrhythmias.',
  },
};

/**
 * Searches the glossary database for a matching entry by key or alias.
 */
export function findGlossaryEntry(searchTerm: string): MedicalGlossaryEntry | null {
  if (!searchTerm) return null;
  const normalized = searchTerm.toLowerCase().trim();

  // 1. Direct ID match
  if (MEDICAL_GLOSSARY[normalized]) {
    return MEDICAL_GLOSSARY[normalized];
  }

  // 2. Direct Term or Alias match
  for (const entry of Object.values(MEDICAL_GLOSSARY)) {
    if (entry.term.toLowerCase() === normalized) {
      return entry;
    }
    if (entry.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return entry;
    }
  }

  return null;
}
