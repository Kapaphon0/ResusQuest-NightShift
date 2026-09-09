import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  ShiftBed,
  ShiftPerk,
  FogOfWarPatient,
  InvestigationType,
  ShiftMissedConcept,
} from '../types';
import {
  initialUserProfile,
  defaultShiftBeds,
  fogOfWarCases,
  swipeTriageCards,
} from '../data/shiftContent';
import { audio } from '../utils/audio';
import { calculateLevelDetails } from '../utils/levelProgression';

export type ShiftStatus = 'idle' | 'in_progress' | 'perk_draft' | 'shift_completed';

export interface ShiftState {
  status: ShiftStatus;
  currentBedIndex: number;
  beds: ShiftBed[];
  user: UserProfile;
  activePerks: ShiftPerk[];
  activeFogCase: FogOfWarPatient | null;
  currentAP: number;
  revealedInvestigations: Record<InvestigationType, boolean>;
  shiftScore: number;
  missedConcepts: ShiftMissedConcept[];
  decisionTimes: number[];
  totalAPSaved: number;
  isDraftingPerk: boolean;
  ankiQueueIds: string[];
}

const STORAGE_KEY = 'resus_shift_state_v1';
const ANKI_STORAGE_KEY = 'resus_anki_queue_v1';

const initialInvestigationsState: Record<InvestigationType, boolean> = {
  ecg: false,
  exam: false,
  pocus: false,
  labs: false,
};

function getInitialState(): ShiftState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Ensure activeFogCase matches current bed if in progress
          activeFogCase:
            parsed.currentBedIndex === 1
              ? fogOfWarCases[0]
              : parsed.currentBedIndex === 3
              ? fogOfWarCases[1]
              : parsed.activeFogCase || null,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    status: 'idle',
    currentBedIndex: 0,
    beds: defaultShiftBeds.map((b) => ({ ...b })),
    user: { ...initialUserProfile },
    activePerks: [],
    activeFogCase: null,
    currentAP: 6,
    revealedInvestigations: { ...initialInvestigationsState },
    shiftScore: 0,
    missedConcepts: [],
    decisionTimes: [],
    totalAPSaved: 0,
    isDraftingPerk: false,
    ankiQueueIds: [],
  };
}

// Global subscribers for lightweight store reactivity across components
let globalState: ShiftState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch {
      // Ignore storage quota
    }
  }
  listeners.forEach((listener) => listener());
}

function updateState(updater: (prev: ShiftState) => ShiftState) {
  globalState = updater(globalState);
  notify();
}

export function useShiftStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const startShift = useCallback(() => {
    updateState((prev) => {
      // Calculate starting AP with active perks
      const hasNurse = prev.activePerks.some((p) => p.effect === 'extra_ap');
      const startAP = 6 + (hasNurse ? 2 : 0);

      const freshBeds = defaultShiftBeds.map((b) => ({ ...b, completed: false }));

      return {
        ...prev,
        status: 'in_progress',
        currentBedIndex: 0,
        beds: freshBeds,
        currentAP: startAP,
        revealedInvestigations: { ...initialInvestigationsState },
        activeFogCase: null,
        shiftScore: 0,
        decisionTimes: [],
        totalAPSaved: 0,
        isDraftingPerk: false,
      };
    });
    audio.playHeartbeat(75, false);
  }, []);

  const draftPerk = useCallback((perk: ShiftPerk) => {
    updateState((prev) => {
      const alreadyHas = prev.activePerks.some((p) => p.id === perk.id);
      const updatedPerks = alreadyHas ? prev.activePerks : [...prev.activePerks, perk];

      // If drafted nurse perk while in bed, augment AP
      let currentAP = prev.currentAP;
      if (perk.effect === 'extra_ap' && !alreadyHas) {
        currentAP += 2;
      }

      return {
        ...prev,
        activePerks: updatedPerks,
        isDraftingPerk: false,
        status: 'in_progress',
        currentAP,
      };
    });
    audio.playPerkEquipped();
  }, []);

  const closePerkDraft = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      isDraftingPerk: false,
    }));
  }, []);

  const advanceBed = useCallback(() => {
    updateState((prev) => {
      const currentIdx = prev.currentBedIndex;
      const updatedBeds = prev.beds.map((b, idx) =>
        idx === currentIdx ? { ...b, completed: true } : b
      );

      const nextIdx = currentIdx + 1;

      // Bed 4 completed -> Shift Completed
      if (nextIdx >= updatedBeds.length) {
        audio.playDebriefChime();
        return {
          ...prev,
          beds: updatedBeds,
          currentBedIndex: currentIdx,
          status: 'shift_completed',
          isDraftingPerk: false,
        };
      }

      // Between beds: trigger perk draft modal
      const nextBed = updatedBeds[nextIdx];
      let nextFogCase: FogOfWarPatient | null = null;
      let nextAP = 6;
      const hasNurse = prev.activePerks.some((p) => p.effect === 'extra_ap');
      if (hasNurse) nextAP += 2;

      if (nextBed.type === 'fog_of_war') {
        nextFogCase = nextIdx === 1 ? fogOfWarCases[0] : fogOfWarCases[1];
      }

      audio.playSuccess();
      return {
        ...prev,
        beds: updatedBeds,
        currentBedIndex: nextIdx,
        activeFogCase: nextFogCase,
        currentAP: nextAP,
        revealedInvestigations: { ...initialInvestigationsState },
        isDraftingPerk: true,
        status: 'in_progress',
      };
    });
  }, []);

  const revealInvestigation = useCallback(
    (type: InvestigationType, cost: number) => {
      updateState((prev) => {
        if (prev.revealedInvestigations[type]) return prev;

        // Check perks (e.g. Free ECG or POCUS Fellowship)
        const hasFreeEcg =
          type === 'ecg' && prev.activePerks.some((p) => p.effect === 'free_ecg');
        const hasFreePocus =
          type === 'pocus' && prev.activePerks.some((p) => p.effect === 'reveal_perk');
        const effectiveCost = hasFreeEcg || hasFreePocus ? 0 : cost;

        if (prev.currentAP < effectiveCost) {
          audio.playAlarm();
          return prev;
        }

        audio.playHeartbeat(82, false);
        return {
          ...prev,
          currentAP: prev.currentAP - effectiveCost,
          revealedInvestigations: {
            ...prev.revealedInvestigations,
            [type]: true,
          },
        };
      });
    },
    []
  );

  const submitFogDecision = useCallback(
    (optionId: string, elapsedSeconds: number) => {
      let isCorrect = false;
      let penaltyExplain = '';
      const fogCase = globalState.activeFogCase;

      if (fogCase) {
        const option = fogCase.decisionOptions.find((o) => o.id === optionId);
        if (option) {
          isCorrect = option.isCorrect;
          penaltyExplain = option.penaltyExplain;
        }
      }

      updateState((prev) => {
        const newTimes = [...prev.decisionTimes, elapsedSeconds];
        const hasPharmacist = prev.activePerks.some((p) => p.effect === 'bonus_xp');
        const xpGain = isCorrect ? (hasPharmacist ? 65 : 50) : 10;
        const currentRating = prev.user.attendingRating;

        let updatedRating = currentRating;
        let newMissed = [...prev.missedConcepts];

        if (isCorrect) {
          updatedRating = Math.min(100, currentRating + 2);
          audio.playSuccess();
        } else {
          updatedRating = Math.max(0, currentRating - 6);
          audio.playAlarm();
          if (fogCase) {
            const correctOpt = fogCase.decisionOptions.find((o) => o.isCorrect);
            const trapOpt = fogCase.decisionOptions.find((o) => o.id === optionId);
            newMissed.push({
              id: `missed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              bedTitle: prev.beds[prev.currentBedIndex]?.title || 'Fog of War Resus',
              promptOrScenario: fogCase.demographics,
              trapChosen: trapOpt?.label || 'Incorrect intervention',
              clinicalReason: penaltyExplain || 'Contraindicated in current hemodynamic state.',
              correctAction: correctOpt?.label || 'Evidence-based resuscitation',
              category:
                prev.currentBedIndex === 1
                  ? 'HEMODYNAMICS'
                  : 'TRAUMA',
              timestamp: Date.now(),
            });
          }
        }

        const savedAP = prev.currentAP;

        return {
          ...prev,
          shiftScore: prev.shiftScore + xpGain,
          totalAPSaved: prev.totalAPSaved + savedAP,
          decisionTimes: newTimes,
          missedConcepts: newMissed,
          user: {
            ...prev.user,
            xp: prev.user.xp + xpGain,
            attendingRating: updatedRating,
          },
        };
      });

      return { isCorrect, penaltyExplain };
    },
    []
  );

  const submitSwipeTriage = useCallback(
    (cardId: string, action: 'CRASH' | 'STABLE', elapsedSeconds: number) => {
      const card = swipeTriageCards.find((c) => c.id === cardId);
      const isCorrect = card ? card.correctAction === action : false;

      updateState((prev) => {
        const newTimes = [...prev.decisionTimes, elapsedSeconds];
        const currentRating = prev.user.attendingRating;
        let updatedRating = currentRating;
        const xpGain = isCorrect ? 25 : 5;
        let newMissed = [...prev.missedConcepts];

        if (isCorrect) {
          updatedRating = Math.min(100, currentRating + 1);
          audio.playSuccess();
        } else {
          updatedRating = Math.max(0, currentRating - 4);
          audio.playAlarm();
          if (card) {
            newMissed.push({
              id: `missed-triage-${Date.now()}-${card.id}`,
              bedTitle: prev.beds[prev.currentBedIndex]?.title || 'Ambulance Bay Triage',
              promptOrScenario: card.prompt,
              trapChosen: `Classified as ${action}`,
              clinicalReason: card.takeaway,
              correctAction: `Classify as ${card.correctAction}`,
              category: card.category === 'ECG' ? 'ECG' : card.category === 'TRAUMA' ? 'TRAUMA' : 'TOX',
              timestamp: Date.now(),
            });
          }
        }

        return {
          ...prev,
          shiftScore: prev.shiftScore + xpGain,
          decisionTimes: newTimes,
          missedConcepts: newMissed,
          user: {
            ...prev.user,
            xp: prev.user.xp + xpGain,
            attendingRating: updatedRating,
          },
        };
      });

      return isCorrect;
    },
    []
  );

  const addToAnkiQueue = useCallback((conceptId: string) => {
    updateState((prev) => {
      if (prev.ankiQueueIds.includes(conceptId)) return prev;
      const updatedQueue = [...prev.ankiQueueIds, conceptId];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(ANKI_STORAGE_KEY, JSON.stringify(updatedQueue));
        }
      } catch {
        // Ignore storage
      }
      return {
        ...prev,
        ankiQueueIds: updatedQueue,
      };
    });
  }, []);

  const removeFromAnkiQueue = useCallback((conceptId: string) => {
    updateState((prev) => {
      const updatedQueue = prev.ankiQueueIds.filter((id) => id !== conceptId);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(ANKI_STORAGE_KEY, JSON.stringify(updatedQueue));
        }
      } catch {
        // Ignore storage
      }
      return {
        ...prev,
        ankiQueueIds: updatedQueue,
      };
    });
  }, []);

  const awardXP = useCallback((amount: number) => {
    updateState((prev) => {
      const updatedXP = prev.user.xp + amount;
      const calculatedLevel = calculateLevelDetails(updatedXP).level;
      return {
        ...prev,
        user: {
          ...prev.user,
          xp: updatedXP,
          level: calculatedLevel,
        },
      };
    });
    audio.playSuccess();
  }, []);

  const clockInNextShift = useCallback(() => {
    updateState((prev) => {
      const updatedShifts = prev.user.shiftsCompleted + 1;
      const bonusXP = 100;
      const totalXP = prev.user.xp + bonusXP;
      const calculatedLevel = calculateLevelDetails(totalXP).level;

      return {
        ...prev,
        status: 'idle',
        currentBedIndex: 0,
        beds: defaultShiftBeds.map((b) => ({ ...b, completed: false })),
        activePerks: [],
        activeFogCase: null,
        currentAP: 6,
        revealedInvestigations: { ...initialInvestigationsState },
        shiftScore: 0,
        missedConcepts: [],
        decisionTimes: [],
        totalAPSaved: 0,
        isDraftingPerk: false,
        user: {
          ...prev.user,
          level: calculatedLevel,
          xp: totalXP,
          shiftsCompleted: updatedShifts,
          attendingRating: Math.max(90, Math.min(99, prev.user.attendingRating + 1)),
          streakDays: prev.user.streakDays + 1,
        },
      };
    });
    audio.playDebriefChime();
  }, []);

  return {
    ...globalState,
    startShift,
    advanceBed,
    draftPerk,
    closePerkDraft,
    revealInvestigation,
    submitFogDecision,
    submitSwipeTriage,
    addToAnkiQueue,
    removeFromAnkiQueue,
    awardXP,
    clockInNextShift,
  };
}
