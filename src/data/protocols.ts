export interface ProtocolItem {
  id: string;
  title: string;
  category: 'CARDIAC' | 'TRAUMA' | 'TOX' | 'PULMONARY';
  subtitle: string;
  presentation: string;
  pitfall: string;
  protocol: string;
  pearl: string;
}

export const PROTOCOLS: ProtocolItem[] = [
  {
    id: 'proto-rv-infarct',
    title: 'Right Ventricular STEMI',
    category: 'CARDIAC',
    subtitle: 'Inferior wall ischemia with right ventricular involvement',
    presentation: 'Inferior ST-elevation in II, III, aVF with clear lung fields and profound hypotension.',
    pitfall: 'Administering sublingual nitroglycerin, morphine, or beta-blockers precipitates sudden cardiovascular collapse due to venous pooling and acute loss of right ventricular preload.',
    protocol: 'Order right-sided 12-lead (V4R). Resuscitate with 1,000 mL crystalloid fluid boluses to optimize RV filling pressures, initiate emergent PCI activation, and administer inotropic/vasopressor support (norepinephrine) if MAP remains < 65.',
    pearl: 'Remember: The right ventricle is thin-walled and acts purely as a conduit dependent on preload. Fluid loading is therapeutic, whereas venodilators are fatal.',
  },
  {
    id: 'proto-tension-ptx',
    title: 'Tension Pneumothorax',
    category: 'TRAUMA',
    subtitle: 'One-way pleural valve leading to mediastinal shift and obstructive shock',
    presentation: 'Tracheal deviation, absent unilateral breath sounds, hyperresonance, and profound hypotension with distended neck veins.',
    pitfall: 'Delaying decompression to obtain an upright chest X-ray or transport the patient to CT imaging; or applying positive-pressure ventilation (RSI) prior to releasing pleural pressure.',
    protocol: 'Immediate clinical diagnosis without imaging. Perform emergent needle thoracostomy (2nd ICS midclavicular or 4th/5th ICS anterior axillary line) or rapid finger thoracostomy, followed by 28-32 Fr tube thoracostomy connected to underwater seal.',
    pearl: 'ATLS 10th edition prioritizes the 4th/5th intercostal space anterior axillary line for needle and finger thoracostomy due to lower failure rates and thinner chest wall musculature.',
  },
  {
    id: 'proto-hyperk',
    title: 'Hyperkalemic Sine Wave',
    category: 'CARDIAC',
    subtitle: 'Life-threatening electrical cardiotoxicity from hyperkalemia',
    presentation: 'Peaked symmetrical T-waves, PR prolongation, QRS widening progressing into a classic sinusoidal wave pattern.',
    pitfall: 'Administering potassium-shifting agents (insulin/dextrose, albuterol) without first stabilizing cardiac myocyte membrane with IV calcium.',
    protocol: 'Immediate IV Calcium Gluconate 3g or Calcium Chloride 1g over 2-5 minutes to antagonize cardiotoxicity. Follow with 10 units regular insulin IV + 25-50g D50W, continuous nebulized albuterol (10-20 mg), and stat preparation for emergent hemodialysis.',
    pearl: 'Calcium does NOT lower serum potassium; it temporarily restores resting membrane potential threshold (-90mV to -70mV) to prevent imminent asystole or ventricular fibrillation.',
  },
  {
    id: 'proto-massive-transfusion',
    title: 'Traumatic Hemorrhagic Shock',
    category: 'TRAUMA',
    subtitle: 'Lethal triad of hypothermia, coagulopathy, and acidosis',
    presentation: 'Class IV hemorrhagic shock: HR > 140, unrecordable or systolic BP < 90, confusion, cold extremities.',
    pitfall: 'Infusing liters of room-temperature 0.9% Normal Saline, which dilutes clotting factors, worsens hypothermia, and induces severe hyperchloremic metabolic acidosis.',
    protocol: 'Activate Massive Transfusion Protocol (MTP) with 1:1:1 ratio of packed red blood cells (pRBCs), fresh frozen plasma (FFP), and platelets. Administer Tranexamic Acid (TXA) 1g IV over 10 min within 3 hours of trauma. Rapid surgical hemorrhage control.',
    pearl: 'CRASH-2 trial evidence: TXA reduces all-cause mortality when given < 3 hours post-injury; administration after 3 hours increases mortality risk.',
  },
  {
    id: 'proto-tca-tox',
    title: 'Tricyclic Antidepressant Overdose',
    category: 'TOX',
    subtitle: 'Sodium channel blockade, anticholinergic toxidrome, and cardiac dysrhythmias',
    presentation: 'Altered mental status, dilated pupils, dry skin, tachycardia, QRS duration > 100 ms, terminal R wave in lead aVR > 3 mm.',
    pitfall: 'Administering physostigmine (can induce refractory asystole in TCA overdose) or Type 1A/1C antiarrhythmics (procainamide, flecainide).',
    protocol: 'Administer Sodium Bicarbonate 1-2 mEq/kg IV push bolus, titrating to serum pH 7.50-7.55 and QRS narrowing. Maintain infusion of 3 ampules D5W at 150-200 mL/hr.',
    pearl: 'Sodium bicarbonate overcomes fast sodium channel blockade via two distinct mechanisms: increasing extracellular sodium concentration and alkalinizing serum pH to favor uncharged drug dissociation from cardiac channels.',
  },
  {
    id: 'proto-crashing-asthma',
    title: 'Acute Severe Asthma Exacerbation',
    category: 'PULMONARY',
    subtitle: 'Severe dynamic hyperinflation and breath stacking',
    presentation: 'Silent chest, pulsus paradoxus, diaphoresis, respiratory fatigue, upright tripod positioning.',
    pitfall: 'Aggressive rapid sequence intubation with high respiratory rates and tidal volumes, causing massive intrinsic PEEP (auto-PEEP), acute tension pneumothorax, and sudden cardiac arrest.',
    protocol: 'Maximal medical therapy: continuous nebulized albuterol + ipratropium, IV methylprednisolone 125 mg, IV Magnesium Sulfate 2g over 20 min, subcutaneous/IM Epinephrine (0.3 mg 1:1,000). If intubation unavoidable, use low rate (8-10 bpm), long expiratory time (I:E 1:4), and tolerate permissive hypercapnia.',
    pearl: 'If a ventilated asthmatic acutely arrests, immediately disconnect the endotracheal tube from the ventilator circuit and compress both sides of the chest to manually exhale trapped air.',
  },
];
