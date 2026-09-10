import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, ShieldCheck, AlertTriangle, RotateCcw, CheckCircle2, Volume2, VolumeX, Radio, Compass, ChevronRight } from 'lucide-react';
import { audio } from '../../utils/audio';
import { useGamificationStore } from '../../store/useGamificationStore';
export interface CivilianScenarioStep {
  id: string;
  stepNumber: number;
  instruction: string;
  actionTitle: string;
  actionPrompt: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
    explanation: string;
  }[];
}
export interface CivilianScenario {
  id: string;
  sceneNumber: number;
  title: string;
  subtitle: string;
  location: string;
  victimDescription: string;
  vitalsNote: string;
  physiologicalMeaning: string;
  dangerLevel: 'EXTREME' | 'CRITICAL' | 'URGENT';
  recommendedTool: string;
  steps: CivilianScenarioStep[];
}
export const CIVILIAN_SCENARIOS: CivilianScenario[] = [
  {
    id: 'civilian-scene-1-ohca',
    sceneNumber: 1,
    title: 'Sudden Out-of-Hospital Cardiac Arrest',
    subtitle: 'High-Quality Bystander CPR & Public AED Deployment',
    location: 'Public Fitness Center / Running Track',
    victimDescription: '54yo athlete suddenly collapsed mid-stride. Completely unresponsive. Face is dusky and gasping intermittently (agonal gasps). No carotid pulse detected.',
    vitalsNote: 'Heart stopped pumping blood. Agonal gasping is a dying reflex, NOT normal breathing!',
    physiologicalMeaning: 'The heart is in Ventricular Fibrillation: electrically quivering with zero forward circulation. The brain will permanently die in 4–6 minutes without immediate chest compressions and an AED shock.',
    dangerLevel: 'EXTREME',
    recommendedTool: 'Automated External Defibrillator (AED)',
    steps: [
      {
        id: 'step-1-1',
        stepNumber: 1,
        instruction: 'Step 1 • Immediate Recognition & Emergency Activation',
        actionTitle: 'Assess Responsiveness and Call for Help',
        actionPrompt: 'You tap the victim’s shoulders firmly and shout. No response. They take an occasional noisy, irregular gasp. What is your immediate first move?',
        options: [
          {
            id: 'opt-1-1-correct',
            label: 'Call 911, point directly at a bystander to bring the nearest AED, and begin CPR immediately',
            isCorrect: true,
            feedback: 'Spot-on! Agonal gasps indicate cardiac arrest. Designating a specific bystander to fetch the AED prevents bystander hesitation.',
            explanation: 'Every 60-second delay in CPR decreases survival by 7-10%. Agonal gasping must never be mistaken for normal breathing.',
          },
          {
            id: 'opt-1-1-wrong-1',
            label: 'Wait 2 minutes to see if the irregular gasping becomes steady breathing',
            isCorrect: false,
            feedback: 'FATAL DELAY: Agonal gasping is a brainstem death reflex, not breathing! The heart has stopped.',
            explanation: 'Gasping occurs in up to 40% of sudden cardiac arrests. Never wait or watch.',
          },
          {
            id: 'opt-1-1-wrong-2',
            label: 'Place the victim in the recovery position and pour water on their face',
            isCorrect: false,
            feedback: 'CRITICAL ERROR: A pulseless patient needs blood pumped to the brain immediately.',
            explanation: 'Recovery position is only for breathing, responsive victims.',
          },
        ],
      },
      {
        id: 'step-1-2',
        stepNumber: 2,
        instruction: 'Step 2 • High-Quality Chest Compressions',
        actionTitle: 'Lock Hands & Deliver Compressions',
        actionPrompt: 'You are kneeling beside the victim on the firm floor. How do you deliver effective bystander chest compressions?',
        options: [
          {
            id: 'opt-1-2-correct',
            label: 'Heel of hand on center of chest, interlock fingers, lock elbows straight, push 2–2.4 inches deep at 100–120 beats/min',
            isCorrect: true,
            feedback: 'Flawless mechanics! Full chest recoil between compressions allows the heart chambers to refill with blood.',
            explanation: 'Think of the beat of the song "Stayin\' Alive" (100–120 bpm). Deep compressions squeeze the heart between sternum and spine.',
          },
          {
            id: 'opt-1-2-wrong-1',
            label: 'Push gently on the stomach to avoid cracking any ribs',
            isCorrect: false,
            feedback: 'INEFFECTIVE: Pushing the abdomen does not compress the cardiac pump and triggers massive vomiting.',
            explanation: 'Rib fractures may occur during life-saving CPR; adequate 2-inch depth is required to circulate blood.',
          },
          {
            id: 'opt-1-2-wrong-2',
            label: 'Compress slowly at 40 beats/min to conserve personal stamina',
            isCorrect: false,
            feedback: 'TOO SLOW: 40 bpm cannot generate sufficient mean arterial pressure to perfuse the brain.',
            explanation: 'A rate of 100–120 bpm is internationally mandated by AHA/ERC resuscitation guidelines.',
          },
        ],
      },
      {
        id: 'step-1-3',
        stepNumber: 3,
        instruction: 'Step 3 • Automated External Defibrillator (AED) Application',
        actionTitle: 'Apply Pads While Continuing Compressions',
        actionPrompt: 'A bystander sprints back with a public AED. You open the case and press POWER. Where do the two adhesive pads go on the bare chest?',
        options: [
          {
            id: 'opt-1-3-correct',
            label: 'Pad 1: Upper right chest (below collarbone). Pad 2: Lower left side of ribs (under armpit)',
            isCorrect: true,
            feedback: 'Perfect anterior-lateral vector! This creates an electrical pathway directly across the heart ventricles.',
            explanation: 'Do not stop CPR while the partner unpacks pads. Apply them directly onto dry, bare skin.',
          },
          {
            id: 'opt-1-3-wrong-1',
            label: 'Both pads placed side-by-side directly over the center of the sternum',
            isCorrect: false,
            feedback: 'INCORRECT: Electricity would short-circuit across the sternum without traveling through the cardiac chambers.',
            explanation: 'Defibrillation vector requires diagonal transmission across the myocardium.',
          },
          {
            id: 'opt-1-3-wrong-2',
            label: 'One pad on the forehead and one pad on the abdomen',
            isCorrect: false,
            feedback: 'DANGEROUS: AED pads must surround the thoracic cavity.',
            explanation: 'Follow the pictorial diagrams stamped directly onto the AED pads.',
          },
        ],
      },
      {
        id: 'step-1-4',
        stepNumber: 4,
        instruction: 'Step 4 • Shock Advisory & Immediate Resumption',
        actionTitle: 'Clear Victim & Deliver Defibrillation',
        actionPrompt: 'The AED announces: "Analyzing rhythm... Shock advised! Charging... Stand clear of patient!" What is your action?',
        options: [
          {
            id: 'opt-1-4-correct',
            label: 'Loudly command "EVERYBODY CLEAR!", visually verify no one is touching the victim, press the glowing SHOCK button, then resume CPR immediately',
            isCorrect: true,
            feedback: 'EXEMPLARY RESUSCITATION! Shock delivered safely, and you immediately resumed compressions without checking pulse.',
            explanation: 'A stunned heart after a defibrillation shock cannot pump effectively for several minutes; immediate chest compressions are mandatory.',
          },
          {
            id: 'opt-1-4-wrong-1',
            label: 'Hold the victim\'s hand to comfort them while pressing the shock button',
            isCorrect: false,
            feedback: 'EXTREME SHOCK HAZARD: You will receive the 200-Joule electric current into your own body!',
            explanation: 'Always ensure total visual and verbal clearance before shocking.',
          },
          {
            id: 'opt-1-4-wrong-2',
            label: 'Press shock and then stand back for 5 minutes waiting for them to wake up',
            isCorrect: false,
            feedback: 'FATAL PAUSE: Post-shock myocardium requires continuous manual circulatory support.',
            explanation: 'Resume CPR within 5 seconds of shock delivery.',
          },
        ],
      },
    ],
  },
  {
    id: 'civilian-scene-2-anaphylaxis',
    sceneNumber: 2,
    title: 'Severe Allergic Anaphylaxis at a Restaurant',
    subtitle: 'Airway Compromise & Epinephrine Auto-Injector (EpiPen)',
    location: 'Seafood Bistro Dining Room',
    victimDescription: '28yo diner took a bite of shrimp risotto. Within 3 minutes: throat tightness, hoarse rasping voice, audible high-pitched stridor, lips and eyelids severely swollen (angioedema), generalized red itchy hives.',
    vitalsNote: 'Upper airway is rapidly swelling shut. Blood vessels are dilating and leaking fluid.',
    physiologicalMeaning: 'Severe Anaphylaxis: Massive systemic histamine and leukotriene release causing profound bronchial constriction, life-threatening laryngeal edema, and distributive shock.',
    dangerLevel: 'CRITICAL',
    recommendedTool: 'EpiPen (Epinephrine Auto-Injector 0.3mg)',
    steps: [
      {
        id: 'step-2-1',
        stepNumber: 1,
        instruction: 'Step 1 • Airway Recognition & Rapid Action',
        actionTitle: 'Identify Life-Threatening Airway Closure',
        actionPrompt: 'The victim is clutching their neck, wheezing with a harsh whistling breath sound (stridor), and whispering "Can\'t breathe". Their friend pulls an EpiPen from their purse. What is the immediate treatment?',
        options: [
          {
            id: 'opt-2-1-correct',
            label: 'Administer the Epinephrine Auto-Injector into the mid-outer thigh immediately, without waiting',
            isCorrect: true,
            feedback: 'Crucial life-saving decision! Epinephrine is the ONLY first-line medication that halts fatal anaphylaxis.',
            explanation: 'Antihistamines take 30-45 minutes to work and do NOT reverse airway swelling or shock. Epinephrine works within seconds.',
          },
          {
            id: 'opt-2-1-wrong-1',
            label: 'Give them a glass of cold water to drink and 2 Benadryl pills',
            isCorrect: false,
            feedback: 'FATAL CHOKING HAZARD: An obstructed airway cannot swallow pills, and oral antihistamines are too slow.',
            explanation: 'Oral medications have zero role during acute respiratory compromise.',
          },
          {
            id: 'opt-2-1-wrong-2',
            label: 'Have them breathe into a brown paper bag to calm their anxiety',
            isCorrect: false,
            feedback: 'DANGEROUS MISTAKE: This is physical airway swelling and hypoxia, not hyperventilation anxiety!',
            explanation: 'Withholding epinephrine in anaphylaxis is the primary cause of death.',
          },
        ],
      },
      {
        id: 'step-2-2',
        stepNumber: 2,
        instruction: 'Step 2 • Correct Auto-Injector Technique',
        actionTitle: 'Administer Epinephrine into Anterolateral Thigh',
        actionPrompt: 'You hold the EpiPen auto-injector. What is the exact mechanical sequence for safe and effective injection?',
        options: [
          {
            id: 'opt-2-2-correct',
            label: 'Pull off blue safety release ("Blue to the sky"), jab orange tip firmly at 90° into outer mid-thigh ("Orange to the thigh") until click, hold firmly for 3 seconds',
            isCorrect: true,
            feedback: 'Masterful technique! "Blue to the sky, Orange to the thigh." Injecting into the vastus lateralis provides rapid vascular absorption.',
            explanation: 'It is safely designed to inject straight through denim jeans or trousers. Holding for 3 seconds ensures full dose delivery.',
          },
          {
            id: 'opt-2-2-wrong-1',
            label: 'Inject the needle directly into the victim\'s chest over the heart like in movies',
            isCorrect: false,
            feedback: 'DEADLY HOLLYWOOD MYTH: An intracardiac injection causes cardiac rupture, pneumothorax, and death!',
            explanation: 'EpiPens must ONLY be administered intramuscularly into the anterolateral mid-thigh.',
          },
          {
            id: 'opt-2-2-wrong-2',
            label: 'Gently touch the needle tip to the arm and immediately pull away',
            isCorrect: false,
            feedback: 'INCOMPLETE DOSE: Pulling away prematurely wastes the medication before the spring-loaded plunger fires.',
            explanation: 'Hold firmly against the thigh for 3 full seconds.',
          },
        ],
      },
      {
        id: 'step-2-3',
        stepNumber: 3,
        instruction: 'Step 3 • Patient Positioning & Second Dose Readiness',
        actionTitle: 'Prevent Postural Collapse & Monitor Response',
        actionPrompt: 'The injection is complete. The victim wants to stand up and walk outside for fresh air. How do you position them, and what is your monitoring plan?',
        options: [
          {
            id: 'opt-2-3-correct',
            label: 'Keep them lying flat with legs elevated (or seated if breathing is difficult), do NOT let them stand up, and prepare a second EpiPen if no improvement in 5–15 min',
            isCorrect: true,
            feedback: 'Outstanding physiological understanding! Standing up during anaphylaxis causes "empty heart syndrome" and sudden cardiac arrest.',
            explanation: 'Blood vessels are leaky and dilated; sudden standing drains blood from the heart and brain. Up to 20% of anaphylaxis cases require a second dose.',
          },
          {
            id: 'opt-2-3-wrong-1',
            label: 'Have them run around the block to get their circulation moving',
            isCorrect: false,
            feedback: 'CATASTROPHIC: Physical exertion precipitates instant cardiovascular collapse during anaphylactic shock.',
            explanation: 'Patients in anaphylaxis must remain strictly rested and recumbent.',
          },
          {
            id: 'opt-2-3-wrong-2',
            label: 'Since one shot was given, cancel the 911 ambulance call',
            isCorrect: false,
            feedback: 'DANGEROUS: Biphasic allergic reactions often rebound hours later after epinephrine metabolizes.',
            explanation: 'All anaphylaxis victims require emergency medical transport for observation.',
          },
        ],
      },
    ],
  },
  {
    id: 'civilian-scene-3-overdose',
    sceneNumber: 3,
    title: 'Unconscious Suspected Opioid Overdose',
    subtitle: 'Respiratory Depression & Intranasal Naloxone (Narcan)',
    location: 'Public Transit Station Bench',
    victimDescription: '24yo found slumped over on a wooden bench. Completely unarousable to loud shouting or painful sternal rub. Breathing is shallow and gurgling at only 4 breaths per minute. Lips and nailbeds are deep blue (cyanosis). Pupils are pinpoint.',
    vitalsNote: 'Severe respiratory depression. Hypoxia will induce cardiac arrest within minutes.',
    physiologicalMeaning: 'Opioids (Fentanyl/Heroin) have shut down the respiratory control center in the brainstem. Without rescue breathing and opioid receptor antagonism, the brain will suffer hypoxic death.',
    dangerLevel: 'CRITICAL',
    recommendedTool: 'Narcan (Naloxone Nasal Spray 4mg)',
    steps: [
      {
        id: 'step-3-1',
        stepNumber: 1,
        instruction: 'Step 1 • Overdose Assessment & 911 Activation',
        actionTitle: 'Verify Overdose Triage Signs',
        actionPrompt: 'You observe pinpoint pupils, blue lips, and only 4 slow gasping breaths per minute. What emergency protocol must be enacted first?',
        options: [
          {
            id: 'opt-3-1-correct',
            label: 'Call 911 on speakerphone, check for a clear airway, and immediately prepare intranasal Naloxone (Narcan)',
            isCorrect: true,
            feedback: 'Accurate triage! The triad of coma, pinpoint pupils, and bradypnea is textbook opioid toxicity.',
            explanation: 'Act quickly before the hypoxia triggers secondary cardiac arrest.',
          },
          {
            id: 'opt-3-1-wrong-1',
            label: 'Place the victim into an ice-cold shower or slap their cheeks repeatedly',
            isCorrect: false,
            feedback: 'INEFFECTIVE & HARMFUL: Slapping or ice baths causes hypothermia and aspiration without reversing brainstem depression.',
            explanation: 'Only a biochemical opioid receptor antagonist (Naloxone) can reverse the overdose.',
          },
          {
            id: 'opt-3-1-wrong-2',
            label: 'Inject milk or salt water into their veins',
            isCorrect: false,
            feedback: 'LETHAL FOLKLORE: Injecting household fluids triggers fatal pulmonary embolisms and infections.',
            explanation: 'Naloxone nasal spray is needle-free, safe, and works in 2-3 minutes.',
          },
        ],
      },
      {
        id: 'step-3-2',
        stepNumber: 2,
        instruction: 'Step 2 • Intranasal Naloxone Administration',
        actionTitle: 'Administer Nasal Spray Correctly',
        actionPrompt: 'You peel back the Narcan blister pack. How do you deliver the 4mg intranasal dose?',
        options: [
          {
            id: 'opt-3-2-correct',
            label: 'Tilt head back, insert nozzle tip into one nostril until fingers touch bottom of nose, press plunger firmly with thumb',
            isCorrect: true,
            feedback: 'Perfect administration! The concentrated mist is rapidly absorbed through the rich nasal mucosal blood vessels.',
            explanation: 'Do NOT prime the device beforehand, as that dispenses and wastes the single life-saving dose.',
          },
          {
            id: 'opt-3-2-wrong-1',
            label: 'Test-spray the device twice into the open air to make sure the nozzle is clear',
            isCorrect: false,
            feedback: 'DOSE DESTROYED: Narcan nasal devices contain exactly ONE dose. Test-spraying empties the medication completely!',
            explanation: 'Never press the plunger until the nozzle is inside the patient\'s nostril.',
          },
          {
            id: 'opt-3-2-wrong-2',
            label: 'Pour the liquid into their mouth to swallow',
            isCorrect: false,
            feedback: 'CHOKING HAZARD & INEFFECTIVE: An unconscious person will aspirate liquid into the lungs, and oral naloxone has low bioavailability.',
            explanation: 'Intranasal mucosal delivery enters the bloodstream directly.',
          },
        ],
      },
      {
        id: 'step-3-3',
        stepNumber: 3,
        instruction: 'Step 3 • Rescue Breathing & Recovery Positioning',
        actionTitle: 'Support Oxygenation While Naloxone Takes Effect',
        actionPrompt: 'The spray has been delivered, but it takes 2–3 minutes for naloxone to displace fentanyl from brain receptors. The victim still takes only 3 breaths/min. What do you do during these 3 minutes?',
        options: [
          {
            id: 'opt-3-3-correct',
            label: 'Provide rescue breaths with a pocket mask (1 breath every 5 seconds). Once breathing returns, roll them into the Recovery Position on their side',
            isCorrect: true,
            feedback: 'EXCELLENT RESUSCITATOR! Oxygenating the hypoxic brain prevents arrest. The side recovery position prevents vomiting and airway aspiration as they wake up.',
            explanation: 'Victims often vomit upon awakening from an overdose. The recovery position keeps the airway patent and draining downward.',
          },
          {
            id: 'opt-3-3-wrong-1',
            label: 'Walk away immediately because the spray will do everything automatically',
            isCorrect: false,
            feedback: 'FATAL NEGLECT: If the patient remains hypoxic without rescue breaths, cardiac arrest can occur before the spray binds.',
            explanation: 'Stay and support ventilation until EMS arrives.',
          },
          {
            id: 'opt-3-3-wrong-2',
            label: 'Tie their hands together in case they wake up startled',
            isCorrect: false,
            feedback: 'INAPPROPRIATE: Restraints are dangerous and compromise airway management.',
            explanation: 'Calm verbal reassurance and side positioning is the clinical standard.',
          },
        ],
      },
    ],
  },
  {
    id: 'civilian-scene-4-choking',
    sceneNumber: 4,
    title: 'Choking & Foreign Body Airway Obstruction',
    subtitle: 'Back Blows, Abdominal Thrusts (Heimlich), and CPR Transition',
    location: 'Community Center Dining Hall',
    victimDescription: '60yo dinner guest stood up abruptly, clutching both hands to their throat (universal choking sign). Face has turned crimson, progressing to dusky purple. Eyes are wide with terror. Unable to speak, cough, or make any sound.',
    vitalsNote: 'Complete mechanical airway blockage. Severe acute hypoxia.',
    physiologicalMeaning: 'A bolus of unchewed food is wedged tightly across the glottic opening, preventing all airflow. Acute asphyxiation will cause loss of consciousness in under 45 seconds.',
    dangerLevel: 'EXTREME',
    recommendedTool: 'Tactile Physical Intervention (Heimlich Maneuver)',
    steps: [
      {
        id: 'step-4-1',
        stepNumber: 1,
        instruction: 'Step 1 • Rapid Obstruction Triage',
        actionTitle: 'Differentiate Severe vs Mild Choking',
        actionPrompt: 'The person is clutching their throat. What question do you ask immediately to confirm a complete, life-threatening airway blockage?',
        options: [
          {
            id: 'opt-4-1-correct',
            label: 'Ask "Are you choking? Can you speak or cough?" If they can only nod silently without sound, initiate physical intervention immediately',
            isCorrect: true,
            feedback: 'Precise triage! If a choking person can forcefully cough or speak, encourage them to cough. Silent choking indicates total obstruction requiring immediate thrusts.',
            explanation: 'Air must pass through the vocal cords to make sound. Total silence means zero airflow.',
          },
          {
            id: 'opt-4-1-wrong-1',
            label: 'Offer them a piece of bread to push the stuck food down',
            isCorrect: false,
            feedback: 'CATASTROPHIC: Adding more solid food compounds the blockage and seals the airway permanently.',
            explanation: 'Never feed or give liquids to a choking victim.',
          },
          {
            id: 'opt-4-1-wrong-2',
            label: 'Perform a blind finger sweep deep into their throat with your index finger',
            isCorrect: false,
            feedback: 'HAZARDOUS: Blind finger sweeps push foreign objects deeper into the larynx, converting partial occlusions into total fatal impactions.',
            explanation: 'Blind sweeps are strictly forbidden by all international resuscitation guidelines.',
          },
        ],
      },
      {
        id: 'step-4-2',
        stepNumber: 2,
        instruction: 'Step 2 • Back Blows & Abdominal Thrusts (Heimlich)',
        actionTitle: 'Deliver Physical Dislodgement Maneuvers',
        actionPrompt: 'The victim is silently nodding yes. How do you execute the international first-response sequence to dislodge the foreign body?',
        options: [
          {
            id: 'opt-4-2-correct',
            label: 'Support chest and lean victim forward: deliver 5 firm back blows between shoulder blades with heel of hand. If unrelieved, deliver 5 inward/upward abdominal thrusts just above the navel',
            isCorrect: true,
            feedback: 'Textbook execution! Back blows combined with upward abdominal thrusts create an artificial cough pressure wave blowing the object upward.',
            explanation: 'Alternate 5 back blows and 5 abdominal thrusts until the object pops out or the patient loses consciousness.',
          },
          {
            id: 'opt-4-2-wrong-1',
            label: 'Hang the victim upside down by their ankles and shake them vigorously',
            isCorrect: false,
            feedback: 'DANGEROUS & UNREALISTIC: Creates head trauma and spinal injury in adult patients.',
            explanation: 'Firm back blows and upward subdiaphragmatic thrusts are proven effective.',
          },
          {
            id: 'opt-4-2-wrong-2',
            label: 'Punch the victim directly on the breastbone (sternum)',
            isCorrect: false,
            feedback: 'INCORRECT: Abdominal thrusts must be positioned below the xiphoid process and above the navel.',
            explanation: 'Placing thrusts on the lower sternal bone can break the xiphoid tip into the liver.',
          },
        ],
      },
      {
        id: 'step-4-3',
        stepNumber: 3,
        instruction: 'Step 3 • Unconscious Choking Transition to CPR',
        actionTitle: 'Manage Sudden Loss of Consciousness',
        actionPrompt: 'Despite thrusts, the object does not dislodge. The victim suddenly goes limp in your arms and loses consciousness. What is the mandatory protocol transition?',
        options: [
          {
            id: 'opt-4-3-correct',
            label: 'Carefully ease them to the floor, call 911, and start 30 chest compressions immediately. Before rescue breaths, look in the mouth and remove the object ONLY if visible',
            isCorrect: true,
            feedback: 'LIFE-SAVING PROTOCOL MASTERY! Chest compressions produce higher intrathoracic airway pressure than abdominal thrusts, and maintain vital cardiac output.',
            explanation: 'Each time you open the airway for breaths, inspect the mouth. If you see the dislodged object, grasp and remove it. Never do a blind sweep.',
          },
          {
            id: 'opt-4-3-wrong-1',
            label: 'Keep them standing against the wall and continue abdominal thrusts while they are unconscious',
            isCorrect: false,
            feedback: 'INEFFECTIVE & COLLAPSE RISK: An unconscious body cannot be supported upright for thrusts.',
            explanation: 'The standard of care for unconscious choking is immediate CPR on the floor.',
          },
          {
            id: 'opt-4-3-wrong-2',
            label: 'Perform an emergency pen tracheotomy into their neck with a kitchen knife',
            isCorrect: false,
            feedback: 'LETHAL: Kitchen tracheotomies cause fatal carotid or jugular lacerations, severe hemorrhage, and asphyxiation.',
            explanation: 'Chest compressions are highly effective at expelling tracheal foreign bodies.',
          },
        ],
      },
    ],
  },
];

interface CivilianNightShiftProps {
  onSwitchToHospitalBay?: () => void;
}

export const CivilianNightShift: React.FC<CivilianNightShiftProps> = ({
  onSwitchToHospitalBay,
}) => {
  const { addXp } = useGamificationStore();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [stepFeedback, setStepFeedback] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    feedback: string;
    explanation: string;
  } | null>(null);

  // Completed scenario tracking
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('resusquest_civilian_scenarios_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Metronome for CPR practice
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeRef = useRef<NodeJS.Timeout | null>(null);

  const activeScenario = CIVILIAN_SCENARIOS[selectedScenarioIndex];
  const activeStep = activeScenario.steps[currentStepIndex] || activeScenario.steps[0];
  const isScenarioCompleted = !!completedScenarios[activeScenario.id];

  // Metronome audio loop (110 bpm = ~545ms interval)
  useEffect(() => {
    if (isMetronomeActive) {
      metronomeRef.current = setInterval(() => {
        audio.playMonitorBeep(880);
      }, 545);
    } else {
      if (metronomeRef.current) {
        clearInterval(metronomeRef.current);
        metronomeRef.current = null;
      }
    }

    return () => {
      if (metronomeRef.current) {
        clearInterval(metronomeRef.current);
      }
    };
  }, [isMetronomeActive]);

  const handleSelectOption = (option: CivilianScenarioStep['options'][0]) => {
    if (stepFeedback?.submitted) return;
    setSelectedOptionId(option.id);
    audio.playTelemetryClick();

    const isCorrect = option.isCorrect;
    setStepFeedback({
      submitted: true,
      isCorrect,
      feedback: option.feedback,
      explanation: option.explanation,
    });

    if (isCorrect) {
      audio.playSuccess();
      addXp(35);
    } else {
      audio.playAlarmPulse();
    }
  };

  const handleNextStep = () => {
    audio.playTelemetryClick();
    setSelectedOptionId(null);
    setStepFeedback(null);

    if (currentStepIndex + 1 < activeScenario.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Scenario Completed!
      const updated = { ...completedScenarios, [activeScenario.id]: true };
      setCompletedScenarios(updated);
      try {
        localStorage.setItem('resusquest_civilian_scenarios_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      audio.playLevelUp();
      addXp(100);
    }
  };

  const handleResetScenario = () => {
    audio.playTelemetryClick();
    setCurrentStepIndex(0);
    setSelectedOptionId(null);
    setStepFeedback(null);
  };

  return (
    <div
      id="civilian-night-shift-container"
      className="flex-1 flex flex-col justify-between overflow-y-auto select-none pb-28 bg-slate-950 text-slate-100"
    >
      {/* 1. First-Responder Atmospheric Top Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-3 shadow-xl border-b-4 border-amber-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black border border-amber-400/50 shadow-md">
              <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider">
                  Civilian First Responder
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-950 text-amber-300 uppercase tracking-wide">
                  BYSTANDER EMS
                </span>
              </div>
              <span className="text-[10px] text-slate-900 font-bold block leading-none">
                Community Emergency Preparedness & Out-of-Hospital Life Support
              </span>
            </div>
          </div>

          {/* Quick toggle to return to hospital trauma bay if desired */}
          {onSwitchToHospitalBay && (
            <button
              onClick={onSwitchToHospitalBay}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Switch to Hospital Trauma Bay"
            >
              Hospital Bay →
            </button>
          )}
        </div>

        {/* CPR Metronome Trainer Bar */}
        <div className="flex items-center justify-between bg-slate-950/20 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-slate-950/30">
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-950">
            <Activity className="w-3.5 h-3.5 text-slate-950" />
            <span>CPR Metronome (110 BPM):</span>
          </div>

          <button
            onClick={() => {
              audio.playTelemetryClick();
              setIsMetronomeActive((prev) => !prev);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
              isMetronomeActive
                ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                : 'bg-slate-950 text-amber-300'
            }`}
          >
            {isMetronomeActive ? (
              <>
                <Volume2 className="w-3 h-3" />
                <span>PULSING (110 BPM)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3" />
                <span>START METRONOME</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Scenario Selector Carousel */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>Active First-Response Emergencies (Select Scene):</span>
          <span className="font-mono text-amber-400">
            {Object.keys(completedScenarios).length}/{CIVILIAN_SCENARIOS.length} Solved
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CIVILIAN_SCENARIOS.map((scen, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            const isDone = !!completedScenarios[scen.id];

            return (
              <button
                key={scen.id}
                onClick={() => {
                  audio.playTelemetryClick();
                  setSelectedScenarioIndex(idx);
                  setCurrentStepIndex(0);
                  setSelectedOptionId(null);
                  setStepFeedback(null);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-2 ring-amber-500/40'
                    : isDone
                    ? 'bg-slate-900/90 border-emerald-500/40 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-black uppercase text-amber-400">
                    SCENE {scen.sceneNumber}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>

                <div className="text-[11px] font-black text-white leading-tight mt-1 line-clamp-2">
                  {scen.title}
                </div>

                <div className="text-[9px] text-slate-400 font-semibold mt-1 truncate">
                  {scen.recommendedTool}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Scene Stage */}
      <div className="p-3 space-y-3">
        {/* Scene Briefing Card */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-black uppercase tracking-wider">
                  {activeScenario.dangerLevel} DANGER
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>{activeScenario.location}</span>
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight">
                {activeScenario.title}
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                {activeScenario.subtitle}
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Victim Bedside Description */}
          <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Dispatch Presentation & On-Scene Findings:
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {activeScenario.victimDescription}
            </p>
          </div>

          {/* Physiological Interpretation Card (Visual interpretation over numbers) */}
          <div className="bg-rose-950/30 rounded-2xl p-3 border border-rose-900/50 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>What Is Happening Inside The Body (Physiological Reality):</span>
            </div>
            <p className="text-rose-200/90 leading-relaxed font-medium">
              {activeScenario.physiologicalMeaning}
            </p>
          </div>

          {/* First-Aid Kit Tool Recommendation */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">First-Aid Kit Focus:</span>
              <span className="text-amber-300 font-bold">
                {activeScenario.recommendedTool}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Step {currentStepIndex + 1} of {activeScenario.steps.length}
            </span>
          </div>
        </div>

        {/* 4. Active First-Responder Tactical Decision Card */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-wider">
              {activeStep.instruction}
            </span>
            <h3 className="text-sm font-black text-white">
              {activeStep.actionTitle}
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-snug">
              {activeStep.actionPrompt}
            </p>
          </div>

          {/* Decision Options */}
          <div className="space-y-2.5">
            {activeStep.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isSubmitted = Boolean(stepFeedback?.submitted);

              return (
                <button
                  key={option.id}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected && option.isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md ring-2 ring-emerald-500/40'
                      : isSelected && !option.isCorrect
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-md ring-2 ring-rose-500/40'
                      : isSubmitted
                      ? 'bg-slate-950 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50 border-b-4 active:border-b-2 active:translate-y-0.5 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black leading-snug">
                      {option.label}
                    </span>
                    {isSelected && option.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isSelected && !option.isCorrect && (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Immediate Tactical Feedback Display */}
          {stepFeedback && (
            <div
              className={`p-3.5 rounded-2xl border space-y-1.5 text-xs animate-in fade-in duration-150 ${
                stepFeedback.isCorrect
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black uppercase tracking-wide">
                {stepFeedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>CORRECT PROTOCOL (+35 XP)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>CRITICAL FIRST-RESPONSE ERROR</span>
                  </>
                )}
              </div>
              <p className="font-bold leading-relaxed">
                {stepFeedback.feedback}
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed pt-0.5 border-t border-white/10">
                <span className="font-bold">Clinical Pearl:</span> {stepFeedback.explanation}
              </p>
            </div>
          )}

          {/* Next Step / Advance Button */}
          {stepFeedback?.submitted && (
            <button
              onClick={handleNextStep}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                stepFeedback.isCorrect
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 border-amber-800 text-white'
              }`}
            >
              <span>
                {currentStepIndex + 1 < activeScenario.steps.length
                  ? 'ADVANCE TO NEXT RESCUE STEP →'
                  : 'COMPLETE CIVILIAN EMERGENCY SCENE (+100 XP) 🏆'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scene Completed Banner */}
        {isScenarioCompleted && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scene Mastered & Saved in Personal Portfolio!</span>
            </div>
            <button
              onClick={handleResetScenario}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Practice Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
