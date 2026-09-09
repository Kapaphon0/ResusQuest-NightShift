import { useState, useEffect, useCallback } from 'react';
import {
  NightShiftState,
  PlayerReputation,
  ClinicalAction,
  MistakeRecord,
  NemesisAlert,
  Patient,
  ClinicalScores,
} from '../types/nightShift';
import {
  DIFFICULTY_TIERS,
  CASE_TEMPLATES,
  getReputationTitle,
  calculateStatusLevel,
} from '../data/nightShiftMedicalData';
import {
  generateInitialShift,
  generatePatientFromTemplate,
  advanceShiftClock,
  getRandomEventForTier,
} from '../utils/nightShiftGenerator';
import { calculateDynamicVitals } from '../utils/dynamicVitals';
import { audio } from '../utils/audio';

const SHIFT_STORAGE_KEY = 'resus_night_shift_v2';
const REPUTATION_STORAGE_KEY = 'resus_reputation_v2';
const MISTAKES_STORAGE_KEY = 'resus_mistakes_v2';

function getInitialReputation(): PlayerReputation {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(REPUTATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return {
    tier: 1,
    tierTitle: 'ED Rookie',
    reputationXP: 120,
    maxReputationXP: 300,
    unlockedTiers: [1, 2, 3],
    shiftsCompleted: 0,
    totalResuscitations: 0,
    mysteriesSolved: 0,
  };
}

function getInitialMistakes(): MistakeRecord[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [
    {
      id: 'pre_mistake_1',
      timestamp: Date.now() - 86400000,
      conceptTag: 'SHOCK',
      patientName: 'Previous Case',
      scenario: '70yo male with urosepsis and MAP 50',
      mistakeMade: 'Delayed fluid resuscitation',
      clinicalReason: 'Withholding early balanced crystalloids accelerates multi-organ ischemia.',
      correctApproach: 'Administer 30 mL/kg balanced crystalloids within the golden first hour.',
    },
  ];
}

function getInitialShiftState(): NightShiftState {
  const initialRep = getInitialReputation();
  const activeTier = initialRep.unlockedTiers.length > 0 ? initialRep.unlockedTiers[0] : 1;
  return generateInitialShift(activeTier, 27);
}

// Global state holders
let globalShift: NightShiftState = getInitialShiftState();
let globalReputation: PlayerReputation = getInitialReputation();
let globalMistakes: MistakeRecord[] = getInitialMistakes();

const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(globalShift));
      window.localStorage.setItem(REPUTATION_STORAGE_KEY, JSON.stringify(globalReputation));
      window.localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(globalMistakes));
    } catch {
      // Storage quota safety
    }
  }
  listeners.forEach((l) => l());
}

function updateShift(updater: (prev: NightShiftState) => NightShiftState) {
  globalShift = updater(globalShift);
  notify();
}

function updateReputation(updater: (prev: PlayerReputation) => PlayerReputation) {
  globalReputation = updater(globalReputation);
  notify();
}

export function useNightShiftStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ----------------------------------------------------
  // SELECT DIFFICULTY (Full Revert / Escalation Freedom)
  // ----------------------------------------------------
  const selectDifficulty = useCallback((tier: number) => {
    updateShift((prev) => {
      // If higher tier than unlocked, warn but allow if player has overall experience
      const isUnlocked = globalReputation.unlockedTiers.includes(tier);
      const chosenTier = isUnlocked ? tier : prev.selectedTier;

      audio.playTelemetryClick();
      return {
        ...prev,
        selectedTier: chosenTier,
        lastFeedback: isUnlocked
          ? {
              message: `Night Shift difficulty set to Tier ${chosenTier}: ${
                DIFFICULTY_TIERS.find((t) => t.tier === chosenTier)?.title || ''
              }.`,
              type: 'info',
              timestamp: Date.now(),
            }
          : {
              message: `Tier ${tier} is locked. Increase ED Reputation to unlock.`,
              type: 'warning',
              timestamp: Date.now(),
            },
      };
    });
  }, []);

  // ----------------------------------------------------
  // START SHIFT
  // ----------------------------------------------------
  const startShift = useCallback(() => {
    audio.playHeartbeat(80, false);
    audio.playPerkEquipped();

    updateShift((prev) => {
      const freshShift = generateInitialShift(prev.selectedTier, prev.shiftNumber);
      return {
        ...freshShift,
        phase: 'active',
        shiftTime: '22:00',
        shiftProgress: 0,
        mistakeHistory: [...globalMistakes],
        lastFeedback: {
          message: 'Shift #027 commenced. Check initial telemetry and prioritize beds.',
          type: 'info',
          timestamp: Date.now(),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // BED SELECTION
  // ----------------------------------------------------
  const selectBed = useCallback((index: number) => {
    audio.playTelemetryClick();
    updateShift((prev) => ({
      ...prev,
      selectedBedIndex: index,
    }));
  }, []);

  // ----------------------------------------------------
  // CLINICAL ACTIONS & CONSEQUENCE ENGINE
  // ----------------------------------------------------
  const performClinicalAction = useCallback(
    (action: ClinicalAction, targetBedIndex?: number) => {
      updateShift((prev) => {
        const bedIdx = targetBedIndex ?? prev.selectedBedIndex;
        const currentPatient = prev.activePatients[bedIdx];
        if (!currentPatient) return prev;

        // AP Check
        if (prev.currentAP < action.costAP) {
          audio.playWarningTone();
          return {
            ...prev,
            lastFeedback: {
              message: 'Insufficient clinical stamina (AP)! Restock or wait for recovery period.',
              type: 'warning',
              timestamp: Date.now(),
            },
          };
        }

        const remainingAP = prev.currentAP - action.costAP;
        const impact = action.impact;

        // Apply dynamic clinical state changes
        const currentStability = currentPatient.state.stability;
        const newStability = Math.max(0, Math.min(100, currentStability + impact.stabilityDelta));
        const newCirculation = Math.max(
          0,
          Math.min(100, (currentPatient.state.circulation || 50) + (impact.circulationDelta || 0))
        );
        const newBreathing = Math.max(
          0,
          Math.min(100, (currentPatient.state.breathing || 50) + (impact.breathingDelta || 0))
        );
        const newAirway = Math.max(
          0,
          Math.min(100, (currentPatient.state.airway || 50) + (impact.airwayDelta || 0))
        );
        const newPain = Math.max(
          0,
          Math.min(100, (currentPatient.state.pain || 50) + (impact.painDelta || 0))
        );

        const newStatusLevel = calculateStatusLevel(newStability);

        // Sound cues based on outcome
        if (impact.isCorrectIntervention) {
          audio.playSuccess();
        } else {
          audio.playAlarm();
        }

        // Mistake & Nemesis Tracking
        let updatedMistakes = [...globalMistakes];
        let newNemesis: NemesisAlert | null = prev.activeNemesis;

        if (!impact.isCorrectIntervention && impact.clinicalTrapExplanation) {
          const conceptTag = action.category === 'investigate' ? 'OVER_TESTING' : 'SHOCK';
          const newRecord: MistakeRecord = {
            id: `mistake_${Date.now()}`,
            timestamp: Date.now(),
            conceptTag,
            patientName: currentPatient.name,
            scenario: currentPatient.chiefComplaint,
            mistakeMade: action.name,
            clinicalReason: impact.clinicalTrapExplanation,
            correctApproach: 'Follow standard ACLS/ATLS resuscitation protocol.',
          };
          updatedMistakes.unshift(newRecord);
          globalMistakes = updatedMistakes;

          // Check for recurring failure (3 times)
          const matchingFails = updatedMistakes.filter((m) => m.conceptTag === conceptTag).length;
          if (matchingFails >= 3) {
            newNemesis = {
              conceptTag,
              timesFailed: matchingFails,
              title: `Nemesis Protocol: ${conceptTag}`,
              description: `You have encountered repeat difficulty with ${conceptTag}. Re-evaluate physiologic priorities.`,
              unlockPearl: 'Always address ABCs and maintain organ perfusion before diagnostic excursions.',
            };
          }
        }

        // Update scores
        const scoreBonus = impact.isCorrectIntervention ? 2 : -4;
        const updatedScores: ClinicalScores = {
          ...prev.scores,
          management: Math.max(1, Math.min(5, prev.scores.management + (impact.isCorrectIntervention ? 0.2 : -0.5))),
          overallPercentage: Math.max(
            10,
            Math.min(100, prev.scores.overallPercentage + scoreBonus)
          ),
        };

        // Dynamic vitals calculation based on clinical decision & physiologic response
        const newVitals = calculateDynamicVitals(
          currentPatient.vitals,
          action,
          newStability,
          newCirculation,
          newBreathing
        );

        // Advance patient in bed
        const updatedPatients = prev.activePatients.map((p, idx) => {
          if (idx !== bedIdx) return p;
          return {
            ...p,
            vitals: newVitals,
            state: {
              ...p.state,
              stability: newStability,
              circulation: newCirculation,
              breathing: newBreathing,
              airway: newAirway,
              pain: newPain,
              treatmentResponse: p.state.treatmentResponse + 1,
            },
            statusLevel: newStatusLevel,
            isStabilized: newStability >= 75,
            actionsTaken: [...p.actionsTaken, action.id],
            hasDeterioratedRecently: !impact.isCorrectIntervention,
            deteriorationWarning: !impact.isCorrectIntervention ? impact.feedbackMessage : undefined,
          };
        });

        // Time clock advance
        const clockUpdate = advanceShiftClock(prev.shiftTime);

        // Check for probabilistic random event
        const isLate = clockUpdate.progress >= 50;
        const potentialEvent =
          !prev.activeEvent && Math.random() < 0.25
            ? getRandomEventForTier(prev.selectedTier, isLate)
            : prev.activeEvent;

        // Check for occasional SwipeTriage surge (1-2 per session)
        const triageCount = prev.swipeTriageCountThisShift || 0;
        let shouldTriggerTriage = false;
        if (!prev.pendingSwipeTriage && triageCount < 2) {
          if (triageCount === 0 && clockUpdate.progress >= 28) {
            shouldTriggerTriage = true;
          } else if (triageCount === 1 && clockUpdate.progress >= 65) {
            shouldTriggerTriage = true;
          }
        }

        return {
          ...prev,
          currentAP: remainingAP,
          shiftTime: clockUpdate.newTime,
          shiftProgress: clockUpdate.progress,
          activePatients: updatedPatients,
          scores: updatedScores,
          activeEvent: potentialEvent,
          activeNemesis: newNemesis,
          pendingSwipeTriage: shouldTriggerTriage ? true : prev.pendingSwipeTriage,
          swipeTriageCountThisShift: triageCount,
          lastFeedback: {
            message: impact.feedbackMessage,
            type: impact.isCorrectIntervention ? 'success' : 'critical',
            timestamp: Date.now(),
          },
        };
      });
    },
    []
  );

  // ----------------------------------------------------
  // REVEAL HIDDEN CLUE (POCUS, ECG, LABS, EXAM)
  // ----------------------------------------------------
  const revealClue = useCallback((clueId: string, costAP: number) => {
    updateShift((prev) => {
      const patient = prev.activePatients[prev.selectedBedIndex];
      if (!patient) return prev;

      if (prev.currentAP < costAP) {
        audio.playWarningTone();
        return {
          ...prev,
          lastFeedback: {
            message: 'Need more AP to run this investigation.',
            type: 'warning',
            timestamp: Date.now(),
          },
        };
      }

      audio.playMonitorBeep(720);
      const updatedClues = patient.hiddenClues.map((c) =>
        c.id === clueId ? { ...c, revealed: true } : c
      );

      const updatedPatients = prev.activePatients.map((p, idx) =>
        idx === prev.selectedBedIndex ? { ...p, hiddenClues: updatedClues } : p
      );

      return {
        ...prev,
        currentAP: prev.currentAP - costAP,
        activePatients: updatedPatients,
        scores: {
          ...prev.scores,
          recognition: Math.min(5, prev.scores.recognition + 0.1),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // CONFIRM DIAGNOSIS
  // ----------------------------------------------------
  const confirmDiagnosis = useCallback((diagnosisId: string) => {
    updateShift((prev) => {
      const patient = prev.activePatients[prev.selectedBedIndex];
      if (!patient) return prev;

      const choice = patient.possibleDiagnoses.find((d) => d.id === diagnosisId);
      const isCorrect = choice?.isCorrect ?? false;

      if (isCorrect) {
        audio.playSuccess();
        // Check objective
        const updatedObjectives = prev.objectives.map((obj) => {
          if (obj.type === 'mystery_solved' && patient.isMystery) {
            return { ...obj, currentCount: obj.currentCount + 1, completed: true };
          }
          if (obj.type === 'ecg_correct' && patient.hiddenClues.some((c) => c.revealed && c.category === 'ecg')) {
            return { ...obj, currentCount: obj.currentCount + 1, completed: true };
          }
          return obj;
        });

        const updatedPatients = prev.activePatients.map((p, idx) =>
          idx === prev.selectedBedIndex
            ? { ...p, confirmedDiagnosis: choice?.name, isStabilized: true }
            : p
        );

        return {
          ...prev,
          activePatients: updatedPatients,
          objectives: updatedObjectives,
          scores: {
            ...prev.scores,
            diagnosis: Math.min(5, prev.scores.diagnosis + 0.5),
            overallPercentage: Math.min(100, prev.scores.overallPercentage + 5),
          },
          lastFeedback: {
            message: `Accurate Diagnosis: ${choice?.name}. ${choice?.explanation}`,
            type: 'success',
            timestamp: Date.now(),
          },
        };
      } else {
        audio.playAlarm();
        return {
          ...prev,
          scores: {
            ...prev.scores,
            diagnosis: Math.max(1, prev.scores.diagnosis - 0.8),
            overallPercentage: Math.max(10, prev.scores.overallPercentage - 8),
          },
          lastFeedback: {
            message: `Incorrect Diagnosis: ${choice?.name}. ${choice?.explanation}`,
            type: 'critical',
            timestamp: Date.now(),
          },
        };
      }
    });
  }, []);

  // ----------------------------------------------------
  // REASSESS PATIENT
  // ----------------------------------------------------
  const reassessPatient = useCallback((bedIndex: number) => {
    audio.playMonitorBeep(840);
    updateShift((prev) => {
      const targetPatient = prev.activePatients[bedIndex];
      if (!targetPatient) return prev;

      // Update objective 'reassess_unstable'
      const updatedObjectives = prev.objectives.map((obj) => {
        if (obj.type === 'reassess_unstable' && targetPatient.statusLevel !== 'stable') {
          const nextCount = obj.currentCount + 1;
          return {
            ...obj,
            currentCount: nextCount,
            completed: nextCount >= obj.targetCount,
          };
        }
        return obj;
      });

      return {
        ...prev,
        objectives: updatedObjectives,
        scores: {
          ...prev.scores,
          reassessment: Math.min(5, prev.scores.reassessment + 0.3),
        },
        lastFeedback: {
          message: `Reassessing Bed ${targetPatient.bedNumber} (${targetPatient.name}): Status is ${targetPatient.statusLevel.toUpperCase()}. SpO2: ${targetPatient.vitals.spo2}%, HR: ${targetPatient.vitals.hr} bpm.`,
          type: 'info',
          timestamp: Date.now(),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // PRIORITIZE PATIENT (Multiple Patients Manager)
  // ----------------------------------------------------
  const prioritizePatient = useCallback((bedIndex: number) => {
    updateShift((prev) => {
      const chosenPatient = prev.activePatients[bedIndex];
      if (!chosenPatient) return prev;

      // Find actual highest acuity / lowest stability patient
      const sortedByUrgency = [...prev.activePatients].sort(
        (a, b) => a.state.stability - b.state.stability
      );
      const mostCritical = sortedByUrgency[0];

      const isOptimal =
        chosenPatient.id === mostCritical.id ||
        chosenPatient.state.stability <= mostCritical.state.stability + 15;

      if (isOptimal) {
        audio.playSuccess();
      } else {
        audio.playWarningTone();
      }

      return {
        ...prev,
        selectedBedIndex: bedIndex,
        pendingPrioritization: false,
        scores: {
          ...prev.scores,
          prioritization: Math.min(
            5,
            Math.max(1, prev.scores.prioritization + (isOptimal ? 0.4 : -0.6))
          ),
        },
        lastFeedback: isOptimal
          ? {
              message: `Optimal prioritization: Bed ${chosenPatient.bedNumber} (${chosenPatient.name}) is the most hemodynamically fragile.`,
              type: 'success',
              timestamp: Date.now(),
            }
          : {
              message: `Suboptimal prioritization: Bed ${mostCritical.bedNumber} (${mostCritical.name}) is in acute crisis and needed immediate attention!`,
              type: 'warning',
              timestamp: Date.now(),
            },
      };
    });
  }, []);

  // ----------------------------------------------------
  // RESOLVE RANDOM EVENT
  // ----------------------------------------------------
  const resolveRandomEvent = useCallback((choiceId: string) => {
    updateShift((prev) => {
      if (!prev.activeEvent) return prev;
      const choice = prev.activeEvent.choices.find((c) => c.id === choiceId);
      if (!choice) return prev;

      if (choice.isOptimal) {
        audio.playSuccess();
      } else {
        audio.playAlarm();
      }

      // If quiet period choice gave AP
      let newAP = prev.currentAP;
      if (prev.activeEvent.type === 'quiet_period' && choice.id === 'replenish_ap') {
        newAP = Math.min(prev.maxAP, prev.currentAP + 3);
      }

      return {
        ...prev,
        currentAP: newAP,
        activeEvent: null,
        scores: {
          ...prev.scores,
          management: Math.min(
            5,
            Math.max(1, prev.scores.management + (choice.isOptimal ? 0.3 : -0.5))
          ),
          overallPercentage: Math.min(
            100,
            Math.max(10, prev.scores.overallPercentage + (choice.isOptimal ? 5 : -10))
          ),
        },
        lastFeedback: {
          message: choice.outcomeMessage,
          type: choice.isOptimal ? 'success' : 'critical',
          timestamp: Date.now(),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // DISCHARGE / ADMIT PATIENT
  // ----------------------------------------------------
  const dischargeOrAdmitPatient = useCallback((bedIndex: number) => {
    updateShift((prev) => {
      const patient = prev.activePatients[bedIndex];
      if (!patient) return prev;

      audio.playDebriefChime();

      const newCompleted = [...prev.completedPatients, { ...patient, isDischargedOrTransferred: true }];
      const tierConfig = DIFFICULTY_TIERS.find((t) => t.tier === prev.selectedTier) || DIFFICULTY_TIERS[0];

      // Check if shift is finished
      if (newCompleted.length >= tierConfig.patientCount || prev.shiftProgress >= 100) {
        return {
          ...prev,
          phase: 'debrief',
          completedPatients: newCompleted,
          shiftTime: '06:00',
          shiftProgress: 100,
          departmentStatus: 'stable',
        };
      }

      // Spawn replacement patient in that bed
      const unusedTemplates = CASE_TEMPLATES.filter(
        (t) => !newCompleted.some((c) => c.chiefComplaint === t.chiefComplaint)
      );
      const nextTemplate =
        unusedTemplates[Math.floor(Math.random() * unusedTemplates.length)] || CASE_TEMPLATES[0];
      const replacementPatient = generatePatientFromTemplate(nextTemplate, patient.bedNumber);

      const updatedActive = prev.activePatients.map((p, idx) =>
        idx === bedIndex ? replacementPatient : p
      );

      return {
        ...prev,
        activePatients: updatedActive,
        completedPatients: newCompleted,
        currentAP: Math.min(prev.maxAP, prev.currentAP + 2), // replenish 2 AP for bed turnaround
        lastFeedback: {
          message: `Bed ${patient.bedNumber} cleared and sanitized. Inbound patient: ${replacementPatient.name} (${replacementPatient.chiefComplaint}).`,
          type: 'info',
          timestamp: Date.now(),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // COMPLETE SHIFT & PROGRESSION REWARD
  // ----------------------------------------------------
  const completeShift = useCallback(() => {
    audio.playDebriefChime();
    audio.playLevelUp();

    const tierConfig =
      DIFFICULTY_TIERS.find((t) => t.tier === globalShift.selectedTier) || DIFFICULTY_TIERS[0];
    const performance = globalShift.scores.overallPercentage;
    const baseXP = 300;
    const earnedXP = Math.round(baseXP * tierConfig.xpMultiplier * (performance / 100));
    const reputationGain = Math.round(150 * (performance / 100));

    // Update reputation store
    updateReputation((rep) => {
      const newRepXP = rep.reputationXP + reputationGain;
      const willTierUp = newRepXP >= rep.maxReputationXP && rep.tier < 10;
      const nextTier = willTierUp ? rep.tier + 1 : rep.tier;
      const nextUnlocked = willTierUp && !rep.unlockedTiers.includes(nextTier)
        ? [...rep.unlockedTiers, nextTier]
        : rep.unlockedTiers;

      return {
        ...rep,
        tier: nextTier,
        tierTitle: getReputationTitle(nextTier * 3),
        reputationXP: willTierUp ? newRepXP - rep.maxReputationXP : newRepXP,
        maxReputationXP: Math.round(rep.maxReputationXP * 1.25),
        unlockedTiers: nextUnlocked,
        shiftsCompleted: rep.shiftsCompleted + 1,
        totalResuscitations: rep.totalResuscitations + globalShift.completedPatients.filter((p) => p.isStabilized).length,
        mysteriesSolved: rep.mysteriesSolved + globalShift.completedPatients.filter((p) => p.isMystery && p.isStabilized).length,
      };
    });

    updateShift((prev) => ({
      ...prev,
      phase: 'debrief',
      shiftTime: '06:00',
      shiftProgress: 100,
    }));

    return { earnedXP, reputationGain };
  }, []);

  // ----------------------------------------------------
  // SWIPE TRIAGE SURGE INTEGRATION (1-2 per session)
  // ----------------------------------------------------
  const triggerSwipeTriage = useCallback(() => {
    audio.playAlarm();
    updateShift((prev) => ({
      ...prev,
      pendingSwipeTriage: true,
    }));
  }, []);

  const dismissSwipeTriage = useCallback(() => {
    updateShift((prev) => ({
      ...prev,
      pendingSwipeTriage: false,
    }));
  }, []);

  const completeSwipeTriage = useCallback((scoreBonus: number = 10, apReward: number = 3) => {
    audio.playSuccess();
    updateShift((prev) => {
      const nextCount = (prev.swipeTriageCountThisShift || 0) + 1;
      return {
        ...prev,
        pendingSwipeTriage: false,
        swipeTriageCountThisShift: nextCount,
        currentAP: Math.min(prev.maxAP, prev.currentAP + apReward),
        scores: {
          ...prev.scores,
          prioritization: Math.min(5, prev.scores.prioritization + 0.4),
          overallPercentage: Math.min(100, prev.scores.overallPercentage + scoreBonus),
        },
        lastFeedback: {
          message: `Ambulance Triage Surge Cleared: +${apReward} AP Restored & Prioritization Score Boosted!`,
          type: 'success',
          timestamp: Date.now(),
        },
      };
    });
  }, []);

  // ----------------------------------------------------
  // PLAY AGAIN / RESTART FRESH SHIFT
  // ----------------------------------------------------
  const restartShift = useCallback(() => {
    audio.playTelemetryClick();
    updateShift((prev) => {
      const nextShiftNumber = prev.shiftNumber + 1;
      return generateInitialShift(prev.selectedTier, nextShiftNumber);
    });
  }, []);

  return {
    shift: globalShift,
    reputation: globalReputation,
    mistakes: globalMistakes,
    selectDifficulty,
    startShift,
    selectBed,
    performClinicalAction,
    revealClue,
    confirmDiagnosis,
    reassessPatient,
    prioritizePatient,
    resolveRandomEvent,
    dischargeOrAdmitPatient,
    completeShift,
    restartShift,
    triggerSwipeTriage,
    dismissSwipeTriage,
    completeSwipeTriage,
  };
}
