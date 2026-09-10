export interface DomainDetailConfig {
  competencies: string[];
  protocol: string;
  benchmark: string;
}

export const DOMAIN_COMPETENCIES: Record<string, DomainDetailConfig> = {
  cardiology: {
    competencies: [
      'STEMI Localization & Rapid Cath Lab Activation',
      'Wide vs Narrow Complex ACLS Dysrhythmias',
      'Cardiogenic Shock & Inotrope / Pressor Titration',
      'Bedside Cardiac FOCUS Sonography (Effusion/LV Function)',
    ],
    protocol: 'ACLS 2025 Refractory VF/pVT ECMO Bundle',
    benchmark: 'USMLE/ABEM High-Yield Cardiology',
  },
  airway: {
    competencies: [
      'Crash RSI: Hemodynamically Neutral Etomidate/Roc Dosing',
      'Difficult Airway & Failed Intubation Rescue Sequences',
      'Surgical Cricothyrotomy Landmarks (Scalpel-Bougie-Tube)',
      'NPPV (BiPAP) vs Intubation in ARDS / Acute Pulmonary Edema',
    ],
    protocol: 'Difficult Airway Society (DAS) Step 4 Algorithm',
    benchmark: 'ATLS/Airway Resuscitation Standard',
  },
  circulation: {
    competencies: [
      'Damage Control Resuscitation & Massive Transfusion (MTP 1:1:1)',
      'Septic Shock 1-Hour Bundle & Norepinephrine First-Line',
      'Refractory Anaphylaxis Epinephrine Protocols & Airway Vigilance',
      'Central Venous Access & Arterial Line Monitoring',
    ],
    protocol: 'Surviving Sepsis Campaign Guidelines',
    benchmark: 'ABEM Emergency Hemodynamics',
  },
  trauma: {
    competencies: [
      'Extended FAST (eFAST) 4-Quadrant Pleural & Peritoneal Scan',
      'Tension Pneumothorax Needle / Finger Thoracostomy',
      'Open-Book Pelvic Ring Fracture Sheet / Binder Stabilization',
      'Massive Hemothorax Evacuation via 28-32 Fr Chest Tube',
    ],
    protocol: 'ATLS 10th Edition Resuscitation Sequence',
    benchmark: 'EAST Trauma Resuscitation Core',
  },
  neurology: {
    competencies: [
      'Acute Stroke NIHSS & Tenecteplase (TNK) Thrombolysis',
      'Status Epilepticus Rapid Benzodiazepine to Keppra Escalation',
      'Subarachnoid Hemorrhage Hunt-Hess Grading & Non-contrast CT',
      'Elevated ICP Osmotherapy (3% Hypertonic Saline / Mannitol)',
    ],
    protocol: 'AHA/ASA Acute Ischemic Stroke Protocol',
    benchmark: 'Neurocritical Care Emergency Core',
  },
  toxicology: {
    competencies: [
      'Toxidrome Identification (Sympathomimetic vs Anticholinergic)',
      'Opioid Overdose & Naloxone Titration (Avoiding Flash Edema)',
      'Acetaminophen Toxicity & Rumack-Matthew Nomogram NAC Protocol',
      'Toxic Alcohols (Methanol / Ethylene Glycol) Fomepizole',
    ],
    protocol: 'ACMT Critical Poisoning Reversal Bundle',
    benchmark: 'American College of Medical Toxicology',
  },
  critical_care: {
    competencies: [
      'Refractory Septic Shock Vasopressin & Stress-Dose Hydrocortisone',
      'ARDS Lung-Protective Mechanical Ventilation (6 mL/kg PBW)',
      'Severe Acid-Base Crisis & Bicarbonate / Dialysis Triggers',
      'Targeted Temperature Management in Post-ROSC Coma',
    ],
    protocol: 'SCCM Post-Cardiac Arrest Resuscitation Bundle',
    benchmark: 'Society of Critical Care Medicine (SCCM)',
  },
  pediatrics: {
    competencies: [
      'Broselow Length-Based Tape Resuscitation Dosing',
      'Pediatric Septic Shock: Rapid 20 mL/kg Crystalloid Boluses',
      'Status Asthmaticus Continuous Nebulizers & IV Magnesium',
      'Neonatal Resuscitation Program (NRP) Heart Rate Sequence',
    ],
    protocol: 'PALS / AAP Pediatric Emergency Guidelines',
    benchmark: 'Pediatric Advanced Life Support (PALS)',
  },
  infectious: {
    competencies: [
      'Empiric Meningitis Antimicrobial Bundles & Dexamethasone Timing',
      'Necrotizing Soft-Tissue Infection Emergent Surgical Debridement',
      'Neutropenic Fever Cefepime/Vancomycin Urgent Protocol',
      'Severe Sepsis Blood Cultures & Lactate Clearance Targets',
    ],
    protocol: 'IDSA Guideline-Directed Antimicrobial Therapy',
    benchmark: 'IDSA Emergency Infectious Diseases',
  },
  obstetrics: {
    competencies: [
      'Perimortem Cesarean Delivery (<5 Minute Resuscitative Hysterotomy)',
      'Severe Preeclampsia / Eclampsia Magnesium Sulfate Protocol',
      'Postpartum Hemorrhage Oxytocin / TXA 1g Infusion',
      'Ruptured Ectopic Pregnancy Hemorrhagic Shock Resuscitation',
    ],
    protocol: 'ACOG Obstetric Resuscitation Bundle',
    benchmark: 'ACOG Critical Care Obstetrics',
  },
  environmental: {
    competencies: [
      'Severe Hypothermia Rewarming & Cold-Water Drowning CPR Rules',
      'Exertional Heat Stroke Immediate Evaporative Cooling',
      'High Altitude Pulmonary / Cerebral Edema (HAPE / HACE) Protocols',
      'Pit Viper Envenomation & CroFab Antivenom Dosing',
    ],
    protocol: 'Wilderness Medical Society Environmental Guidelines',
    benchmark: 'WMS Environmental Core Curricula',
  },
  breathing: {
    competencies: [
      'Life-Threatening Status Asthmaticus Heliox & IM Epinephrine',
      'Massive Pulmonary Embolism Systemic Thrombolysis (Alteplase)',
      'COPD Exacerbation Noninvasive Positive Pressure (BiPAP)',
      'Flail Chest & Pulmonary Contusion Aggressive Pulmonary Toilet',
    ],
    protocol: 'ATS/ERS Emergency Pulmonary Guidelines',
    benchmark: 'American Thoracic Society (ATS)',
  },
};
