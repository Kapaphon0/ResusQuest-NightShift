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
import { GAME_BALANCE } from '../constants/gameBalance';

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
  isCivilianMode: boolean;
}

const STORAGE_KEY = 'resus_shift_state_v1';
const ANKI_STORAGE_KEY = 'resus_anki_queue_v1';
const CIVILIAN_MODE_STORAGE_KEY = 'resus_shift_civilian_mode';

const initialInvestigationsState: Record<InvestigationType, boolean> = {
  ecg: false,
  exam: false,
  pocus: false,
  labs: false,
};

const getStorage = (key: string) => {
  try {
    return typeof window !== 'undefined' ? window.localStorage?.getItem(key) : null;
  } catch {
    return null;
  }
};

function getInitialState(): ShiftState {
  const savedCivilian = getStorage(CIVILIAN_MODE_STORAGE_KEY);
  const storedCivilianMode = savedCivilian !== null ? savedCivilian === 'true' : false;
  const saved = getStorage(STORAGE_KEY);

  if (saved) {
    try {
      const p = JSON.parse(saved);
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        const resolvedCivilianMode = savedCivilian !== null
          ? storedCivilianMode
          : Boolean(p.isCivilianMode ?? p.user?.civilianMode ?? false);

        const u = p.user ?? {};
        const sanitizedUser: UserProfile = {
          name: typeof u.name === 'string' ? u.name : initialUserProfile.name,
          role: typeof u.role === 'string' ? u.role : initialUserProfile.role,
          level: Number.isFinite(u.level) ? u.level : initialUserProfile.level,
          xp: Number.isFinite(u.xp) ? u.xp : initialUserProfile.xp,
          shiftsCompleted: Number.isFinite(u.shiftsCompleted) ? u.shiftsCompleted : initialUserProfile.shiftsCompleted,
          attendingRating: Number.isFinite(u.attendingRating) ? u.attendingRating : GAME_BALANCE.ATTENDING_RATING.DEFAULT_START,
          streakDays: Number.isFinite(u.streakDays) ? u.streakDays : initialUserProfile.streakDays,
          civilianMode: resolvedCivilianMode,
        };

        const bedIdx = Number.isInteger(p.currentBedIndex) && p.currentBedIndex >= 0 && p.currentBedIndex < defaultShiftBeds.length
          ? p.currentBedIndex
          : 0;

        return {
          status: ['idle', 'in_progress', 'perk_draft', 'shift_completed'].includes(p.status) ? p.status : 'idle',
          currentBedIndex: bedIdx,
          beds: Array.isArray(p.beds) && p.beds.length === defaultShiftBeds.length ? p.beds : defaultShiftBeds.map((b) => ({ ...b })),
          user: sanitizedUser,
          activePerks: Array.isArray(p.activePerks) ? p.activePerks : [],
          activeFogCase: bedIdx === 1 ? fogOfWarCases[0] : bedIdx === 3 ? fogOfWarCases[1] : (p.activeFogCase ?? null),
          currentAP: Number.isFinite(p.currentAP) ? Math.max(0, Math.min(GAME_BALANCE.MAX_AP_WITH_PERK, p.currentAP)) : GAME_BALANCE.BASE_AP,
          revealedInvestigations: p.revealedInvestigations && typeof p.revealedInvestigations === 'object'
            ? { ...initialInvestigationsState, ...p.revealedInvestigations }
            : { ...initialInvestigationsState },
          shiftScore: Number.isFinite(p.shiftScore) ? p.shiftScore : 0,
          missedConcepts: Array.isArray(p.missedConcepts) ? p.missedConcepts : [],
          decisionTimes: Array.isArray(p.decisionTimes) ? p.decisionTimes : [],
          totalAPSaved: Number.isFinite(p.totalAPSaved) ? p.totalAPSaved : 0,
          isDraftingPerk: Boolean(p.isDraftingPerk),
          ankiQueueIds: Array.isArray(p.ankiQueueIds) ? p.ankiQueueIds : [],
          isCivilianMode: resolvedCivilianMode,
        };
      }
    } catch (err) {
      console.warn('Failed to parse saved shift state:', err);
    }
  }

  return {
    status: 'idle',
    currentBedIndex: 0,
    beds: defaultShiftBeds.map((b) => ({ ...b })),
    user: { ...initialUserProfile, civilianMode: storedCivilianMode },
    activePerks: [],
    activeFogCase: null,
    currentAP: GAME_BALANCE.BASE_AP,
    revealedInvestigations: { ...initialInvestigationsState },
    shiftScore: 0,
    missedConcepts: [],
    decisionTimes: [],
    totalAPSaved: 0,
    isDraftingPerk: false,
    ankiQueueIds: [],
    isCivilianMode: storedCivilianMode,
  };
}

let globalState: ShiftState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(globalState));
      window.localStorage?.setItem(CIVILIAN_MODE_STORAGE_KEY, String(globalState.isCivilianMode));
    }
  } catch {
    // Ignore quota
  }
  listeners.forEach((l) => l());
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
      const startAP = hasNurse
        ? GAME_BALANCE.MAX_AP_WITH_PERK
        : GAME_BALANCE.BASE_AP;

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
        currentAP = Math.min(
          GAME_BALANCE.MAX_AP_WITH_PERK,
          currentAP + GAME_BALANCE.NURSE_PERK_AP_BONUS
        );
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
      let nextAP: number = GAME_BALANCE.BASE_AP;
      const hasNurse = prev.activePerks.some((p) => p.effect === 'extra_ap');
      if (hasNurse) {
        nextAP = Math.min(
          GAME_BALANCE.MAX_AP_WITH_PERK,
          nextAP + GAME_BALANCE.NURSE_PERK_AP_BONUS
        );
      }

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
      const fogCase = globalState.activeFogCase;

      if (!fogCase) {
        console.warn('submitFogDecision called but no active Fog of War case exists.');
        return { isCorrect: false, penaltyExplain: 'No active Fog of War case exists.' };
      }

      const option = fogCase.decisionOptions.find((o) => o.id === optionId);
      if (!option) {
        console.warn(`Invalid decision option: ${optionId}`);
        return { isCorrect: false, penaltyExplain: `Invalid decision option: ${optionId}` };
      }

      const isCorrect = option.isCorrect;
      const penaltyExplain = option.penaltyExplain;

      updateState((prev) => {
        const newTimes = [...prev.decisionTimes, elapsedSeconds];
        const hasPharmacist = prev.activePerks.some((p) => p.effect === 'bonus_xp');
        const xpGain = isCorrect
          ? hasPharmacist
            ? GAME_BALANCE.XP_REWARDS.FOG_CORRECT_PHARMACIST
            : GAME_BALANCE.XP_REWARDS.FOG_CORRECT
          : GAME_BALANCE.XP_REWARDS.FOG_INCORRECT;
        const currentRating = prev.user.attendingRating;

        let updatedRating = currentRating;
        let newMissed = [...prev.missedConcepts];

        if (isCorrect) {
          updatedRating = Math.min(
            100,
            currentRating + GAME_BALANCE.ATTENDING_RATING.CORRECT_BOOST
          );
          audio.playSuccess();
        } else {
          updatedRating = Math.max(
            0,
            currentRating - GAME_BALANCE.ATTENDING_RATING.PENALTY_FOG_TRAP
          );
          audio.playAlarm();
          if (fogCase) {
            const correctOpt = fogCase.decisionOptions.find((o) => o.isCorrect);
            const trapOpt = fogCase.decisionOptions.find((o) => o.id === optionId);
            newMissed.push({
              id: `missed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              bedTitle: prev.beds[prev.currentBedIndex]?.title || 'Fog of War Resus',
              promptOrScenario: fogCase.demographics,
              laymanPrompt: fogCase.laymanDemographics || fogCase.demographics,
              trapChosen: trapOpt?.label || 'Incorrect intervention',
              laymanTrap: trapOpt?.laymanLabel || trapOpt?.label || 'Dangerous intervention',
              clinicalReason: penaltyExplain || 'Contraindicated in current hemodynamic state.',
              laymanReason: trapOpt?.laymanPenaltyExplain || fogCase.laymanPearl || penaltyExplain || 'This intervention worsened patient stability.',
              correctAction: correctOpt?.label || 'Evidence-based resuscitation',
              laymanAction: correctOpt?.laymanLabel || correctOpt?.label || 'Appropriate life-saving intervention',
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
      if (!card) {
        console.warn(`submitSwipeTriage: Card ID "${cardId}" not found in swipe triage deck.`);
        return false;
      }
      const isCorrect = card.correctAction === action;

      updateState((prev) => {
        const newTimes = [...prev.decisionTimes, elapsedSeconds];
        const currentRating = prev.user.attendingRating;
        let updatedRating = currentRating;
        const xpGain = isCorrect
          ? GAME_BALANCE.XP_REWARDS.TRIAGE_CORRECT
          : GAME_BALANCE.XP_REWARDS.TRIAGE_INCORRECT;
        let newMissed = [...prev.missedConcepts];

        if (isCorrect) {
          updatedRating = Math.min(
            100,
            currentRating + GAME_BALANCE.ATTENDING_RATING.CORRECT_TRIAGE_BOOST
          );
          audio.playSuccess();
        } else {
          updatedRating = Math.max(
            0,
            currentRating - GAME_BALANCE.ATTENDING_RATING.PENALTY_TRIAGE_TRAP
          );
          audio.playAlarm();
          if (card) {
            newMissed.push({
              id: `missed-triage-${Date.now()}-${card.id}`,
              bedTitle: prev.beds[prev.currentBedIndex]?.title || 'Ambulance Bay Triage',
              promptOrScenario: card.prompt,
              laymanPrompt: card.laymanPrompt || card.prompt,
              trapChosen: `Classified as ${action === 'CRASH' ? 'CRASH / STAT' : 'STABLE / MEDS'}`,
              laymanTrap: `Classified as ${action === 'CRASH' ? '🚨 CRITICAL / SHOCK' : '🛡️ STABLE / MONITOR'}`,
              clinicalReason: card.takeaway,
              laymanReason: card.laymanTakeaway || card.takeaway,
              correctAction: `Classify as ${card.correctAction === 'CRASH' ? 'CRASH / STAT' : 'STABLE / MEDS'}`,
              laymanAction: `Classify as ${card.correctAction === 'CRASH' ? '🚨 CRITICAL / SHOCK NOW' : '🛡️ STABLE / MONITOR'}`,
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
      const bonusXP: number = GAME_BALANCE.XP_REWARDS.SHIFT_COMPLETION;
      const totalXP = prev.user.xp + bonusXP;
      const calculatedLevel = calculateLevelDetails(totalXP).level;

      return {
        ...prev,
        status: 'idle',
        currentBedIndex: 0,
        beds: defaultShiftBeds.map((b) => ({ ...b, completed: false })),
        activePerks: [],
        activeFogCase: null,
        currentAP: GAME_BALANCE.BASE_AP,
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

  const toggleCivilianMode = useCallback(() => {
    updateState((prev) => {
      const nextMode = !prev.isCivilianMode;
      return {
        ...prev,
        isCivilianMode: nextMode,
        user: {
          ...prev.user,
          civilianMode: nextMode,
        },
      };
    });
  }, []);

  const setCivilianMode = useCallback((enabled: boolean) => {
    updateState((prev) => ({
      ...prev,
      isCivilianMode: enabled,
      user: {
        ...prev.user,
        civilianMode: enabled,
      },
    }));
  }, []);

  return {
    ...globalState,
    isCivilianMode: globalState.isCivilianMode,
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
    toggleCivilianMode,
    setCivilianMode,
  };
}
