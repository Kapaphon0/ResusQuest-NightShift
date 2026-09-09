import { useState, useEffect, useCallback } from 'react';
import {
  GamificationState,
  Achievement,
  XPGainEvent,
  LevelUpEvent,
  XP_RULES,
} from '../types/gamification';
import { calculateLevelDetails } from '../utils/levelProgression';
import { audio } from '../utils/audio';

const GAMIFICATION_STORAGE_KEY = 'resus_gamification_v1';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_triage',
    title: 'First Resuscitation Decision',
    desc: 'Made your first correct bedside triage decision',
    icon: 'Activity',
    unlocked: false,
  },
  {
    id: 'ach_high_accuracy',
    title: 'Clinical Sharpshooter',
    desc: 'Maintain 85%+ accuracy across at least 10 answered questions',
    icon: 'ShieldCheck',
    unlocked: false,
  },
  {
    id: 'ach_first_lesson',
    title: 'Protocol Scholar',
    desc: 'Completed your first high-yield resuscitation module',
    icon: 'BookOpen',
    unlocked: false,
  },
  {
    id: 'ach_perfect_lesson',
    title: 'Flawless Preload Instincts',
    desc: 'Achieved a perfect score (+50 Bonus XP) on a clinical lesson',
    icon: 'Sparkles',
    unlocked: false,
  },
  {
    id: 'ach_clinical_case',
    title: 'Bedside Code Leader',
    desc: 'Successfully stabilized an emergency clinical case',
    icon: 'Award',
    unlocked: false,
  },
  {
    id: 'ach_apprentice',
    title: 'Apprentice Elevation',
    desc: 'Attained Level 5 Apprentice simulation game rank',
    icon: 'Zap',
    unlocked: false,
  },
  {
    id: 'ach_expert',
    title: 'Chief Resuscitationist',
    desc: 'Attained Level 40 Clinical Expert simulation game rank',
    icon: 'Flame',
    unlocked: false,
  },
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getInitialState(): GamificationState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const details = calculateLevelDetails(parsed.xp || 120);
        return {
          xp: parsed.xp ?? 120,
          level: details.level,
          title: details.title,
          streak: parsed.streak ?? 12,
          questionsAnswered: parsed.questionsAnswered ?? 14,
          correctAnswers: parsed.correctAnswers ?? 12,
          accuracy:
            parsed.questionsAnswered > 0
              ? Math.round((parsed.correctAnswers / parsed.questionsAnswered) * 100)
              : 86,
          lessonsCompleted: parsed.lessonsCompleted ?? ['node_1'],
          perfectLessons: parsed.perfectLessons ?? ['node_1'],
          topicsCompleted: parsed.topicsCompleted ?? ['acs_stemi'],
          clinicalCasesCompleted: parsed.clinicalCasesCompleted ?? [],
          completedQuestions: parsed.completedQuestions ?? ['triage_c1', 'triage_c2'],
          achievements: parsed.achievements?.length ? parsed.achievements : INITIAL_ACHIEVEMENTS,
          lastActiveDate: parsed.lastActiveDate ?? getTodayString(),
        };
      }
    } catch {
      // Ignore parse errors and fallback
    }
  }

  const initialXp = 120;
  const initialDetails = calculateLevelDetails(initialXp);
  return {
    xp: initialXp,
    level: initialDetails.level,
    title: initialDetails.title,
    streak: 12,
    questionsAnswered: 14,
    correctAnswers: 12,
    accuracy: 86,
    lessonsCompleted: ['node_1'],
    perfectLessons: ['node_1'],
    topicsCompleted: ['acs_stemi'],
    clinicalCasesCompleted: [],
    completedQuestions: ['triage_c1', 'triage_c2'],
    achievements: INITIAL_ACHIEVEMENTS,
    lastActiveDate: getTodayString(),
  };
}

let globalGamificationState: GamificationState = getInitialState();
const listeners = new Set<(state: GamificationState) => void>();

let activeXpQueue: XPGainEvent[] = [];
const xpEventListeners = new Set<(events: XPGainEvent[]) => void>();

let activeLevelUpEvent: LevelUpEvent | null = null;
const levelUpListeners = new Set<(event: LevelUpEvent | null) => void>();

function notifyStateChange(nextState: GamificationState) {
  globalGamificationState = nextState;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(nextState));
    }
  } catch {
    // Ignore storage issues
  }
  listeners.forEach((listener) => listener(nextState));
}

function triggerXpAnimation(event: XPGainEvent) {
  activeXpQueue = [...activeXpQueue, event];
  xpEventListeners.forEach((listener) => listener(activeXpQueue));
  audio.playXpChime();

  // Auto-dismiss individual toast after 2 seconds
  setTimeout(() => {
    activeXpQueue = activeXpQueue.filter((e) => e.id !== event.id);
    xpEventListeners.forEach((listener) => listener(activeXpQueue));
  }, 2000);
}

function triggerLevelUp(event: LevelUpEvent) {
  activeLevelUpEvent = event;
  levelUpListeners.forEach((listener) => listener(activeLevelUpEvent));
  audio.playLevelUp();
}

export function useGamificationStore() {
  const [state, setState] = useState<GamificationState>(globalGamificationState);
  const [xpEvents, setXpEvents] = useState<XPGainEvent[]>(activeXpQueue);
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(activeLevelUpEvent);

  useEffect(() => {
    listeners.add(setState);
    xpEventListeners.add(setXpEvents);
    levelUpListeners.add(setLevelUp);
    return () => {
      listeners.delete(setState);
      xpEventListeners.delete(setXpEvents);
      levelUpListeners.delete(setLevelUp);
    };
  }, []);

  const updateState = useCallback(
    (updater: (prev: GamificationState) => GamificationState) => {
      const next = updater(globalGamificationState);
      notifyStateChange(next);
    },
    []
  );

  /**
   * Evaluates and updates achievements based on updated state
   */
  const evaluateAchievements = (
    currentState: GamificationState,
    newLevel: number
  ): Achievement[] => {
    return currentState.achievements.map((ach) => {
      if (ach.unlocked) return ach;
      let shouldUnlock = false;

      switch (ach.id) {
        case 'ach_first_triage':
          shouldUnlock = currentState.correctAnswers >= 1;
          break;
        case 'ach_high_accuracy':
          shouldUnlock =
            currentState.questionsAnswered >= 10 && currentState.accuracy >= 85;
          break;
        case 'ach_first_lesson':
          shouldUnlock = currentState.lessonsCompleted.length >= 1;
          break;
        case 'ach_perfect_lesson':
          shouldUnlock = currentState.perfectLessons.length >= 1;
          break;
        case 'ach_clinical_case':
          shouldUnlock = currentState.clinicalCasesCompleted.length >= 1;
          break;
        case 'ach_apprentice':
          shouldUnlock = newLevel >= 5;
          break;
        case 'ach_expert':
          shouldUnlock = newLevel >= 40;
          break;
      }

      if (shouldUnlock) {
        return {
          ...ach,
          unlocked: true,
          unlockedAt: Date.now(),
        };
      }
      return ach;
    });
  };

  /**
   * Internal helper to add XP, check level-up, and evaluate achievements
   */
  const applyXpGain = useCallback(
    (amount: number, reason: string = 'Experience Gained', isBonus: boolean = false) => {
      if (amount <= 0) return;

      updateState((prev) => {
        const oldDetails = calculateLevelDetails(prev.xp);
        const newXp = prev.xp + amount;
        const newDetails = calculateLevelDetails(newXp);

        // Check for level up
        if (newDetails.level > oldDetails.level) {
          triggerLevelUp({
            previousLevel: oldDetails.level,
            newLevel: newDetails.level,
            previousTitle: oldDetails.title,
            newTitle: newDetails.title,
            timestamp: Date.now(),
          });
        }

        const nextAchievements = evaluateAchievements(prev, newDetails.level);

        return {
          ...prev,
          xp: newXp,
          level: newDetails.level,
          title: newDetails.title,
          achievements: nextAchievements,
        };
      });

      triggerXpAnimation({
        id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        amount,
        reason,
        timestamp: Date.now(),
        isBonus,
      });
    },
    [updateState]
  );

  /**
   * Direct helper to add XP with an optional label and bonus flag
   */
  const addXp = useCallback(
    (amount: number, reason: string = 'Experience Gained', isBonus: boolean = false) => {
      applyXpGain(amount, reason, isBonus);
    },
    [applyXpGain]
  );

  /**
   * Track answering a question (Triage card, micro-drill, or diagnostic item)
   * XP awarded once per question ID.
   */
  const awardQuestionXP = useCallback(
    (
      questionId: string,
      isCorrect: boolean,
      isDifficult: boolean = false,
      scenarioName?: string
    ): { awarded: boolean; xp: number } => {
      const alreadyRewarded = globalGamificationState.completedQuestions.includes(questionId);

      // Always update metrics: questionsAnswered, correctAnswers, accuracy
      updateState((prev) => {
        const newTotal = prev.questionsAnswered + 1;
        const newCorrect = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
        const accuracy = Math.round((newCorrect / newTotal) * 100);

        const updatedCompletedQuestions =
          isCorrect && !alreadyRewarded
            ? [...prev.completedQuestions, questionId]
            : prev.completedQuestions;

        return {
          ...prev,
          questionsAnswered: newTotal,
          correctAnswers: newCorrect,
          accuracy,
          completedQuestions: updatedCompletedQuestions,
        };
      });

      // Award XP ONLY if correct and not previously rewarded
      if (isCorrect && !alreadyRewarded) {
        const xpAmount = isDifficult
          ? XP_RULES.DIFFICULT_QUESTION
          : XP_RULES.CORRECT_QUESTION;
        const reason = isDifficult
          ? `Difficult Case Correct (+${xpAmount} XP)`
          : `Correct Triage Decision (+${xpAmount} XP)`;

        applyXpGain(xpAmount, scenarioName ? `${scenarioName}: ${reason}` : reason);
        return { awarded: true, xp: xpAmount };
      }

      return { awarded: false, xp: 0 };
    },
    [updateState, applyXpGain]
  );

  /**
   * Complete Lesson: +50 XP, +50 bonus XP if perfect score.
   * Awarded only once per lesson ID.
   */
  const completeLesson = useCallback(
    (
      lessonId: string,
      isPerfect: boolean,
      lessonTitle?: string
    ): { awarded: boolean; xp: number } => {
      const alreadyCompleted = globalGamificationState.lessonsCompleted.includes(lessonId);
      const alreadyPerfected = globalGamificationState.perfectLessons.includes(lessonId);

      let totalAwarded = 0;

      if (!alreadyCompleted) {
        let xpGained = XP_RULES.COMPLETE_LESSON; // +50 XP
        let isBonus = false;
        let reason = lessonTitle
          ? `${lessonTitle}: Lesson Complete (+50 XP)`
          : 'Lesson Complete (+50 XP)';

        if (isPerfect) {
          xpGained += XP_RULES.PERFECT_LESSON_BONUS; // +50 XP Bonus (100 total)
          isBonus = true;
          reason = lessonTitle
            ? `${lessonTitle}: Perfect Lesson (+100 XP)`
            : 'Perfect Lesson Bonus (+100 XP)';
        }

        updateState((prev) => ({
          ...prev,
          lessonsCompleted: [...prev.lessonsCompleted, lessonId],
          perfectLessons: isPerfect
            ? [...prev.perfectLessons, lessonId]
            : prev.perfectLessons,
        }));

        applyXpGain(xpGained, reason, isBonus);
        totalAwarded = xpGained;
      } else if (isPerfect && !alreadyPerfected) {
        // User retried a previously non-perfect lesson and got 100%
        const bonusXp = XP_RULES.PERFECT_LESSON_BONUS; // +50 XP
        updateState((prev) => ({
          ...prev,
          perfectLessons: [...prev.perfectLessons, lessonId],
        }));

        applyXpGain(
          bonusXp,
          lessonTitle
            ? `${lessonTitle}: Flawless Mastery (+${bonusXp} XP)`
            : `Flawless Mastery (+${bonusXp} XP)`,
          true
        );
        totalAwarded = bonusXp;
      }

      return { awarded: totalAwarded > 0, xp: totalAwarded };
    },
    [updateState, applyXpGain]
  );

  /**
   * Complete Clinical Case (e.g. Fog of War bedside case or Code blue trial): +100 XP
   * Awarded only once per case ID.
   */
  const completeClinicalCase = useCallback(
    (caseId: string, caseTitle?: string): { awarded: boolean; xp: number } => {
      const alreadyCompleted =
        globalGamificationState.clinicalCasesCompleted.includes(caseId);

      if (!alreadyCompleted) {
        const xpAmount = XP_RULES.COMPLETE_CLINICAL_CASE; // +100 XP
        updateState((prev) => ({
          ...prev,
          clinicalCasesCompleted: [...prev.clinicalCasesCompleted, caseId],
        }));

        applyXpGain(
          xpAmount,
          caseTitle
            ? `${caseTitle}: Clinical Case Resolved (+${xpAmount} XP)`
            : `Clinical Case Resolved (+${xpAmount} XP)`
        );
        return { awarded: true, xp: xpAmount };
      }

      return { awarded: false, xp: 0 };
    },
    [updateState, applyXpGain]
  );

  /**
   * Track completion of curriculum topics
   */
  const completeTopic = useCallback(
    (topicId: string) => {
      updateState((prev) => {
        if (prev.topicsCompleted.includes(topicId)) return prev;
        return {
          ...prev,
          topicsCompleted: [...prev.topicsCompleted, topicId],
        };
      });
    },
    [updateState]
  );

  const dismissLevelUp = useCallback(() => {
    activeLevelUpEvent = null;
    levelUpListeners.forEach((listener) => listener(null));
  }, []);

  const dismissXpToast = useCallback((id: string) => {
    activeXpQueue = activeXpQueue.filter((e) => e.id !== id);
    xpEventListeners.forEach((listener) => listener(activeXpQueue));
  }, []);

  const levelDetails = calculateLevelDetails(state.xp);

  return {
    // Core State
    ...state,
    levelDetails,
    // Animations & Events
    xpEvents,
    levelUp,
    dismissLevelUp,
    dismissXpToast,
    // Progression Actions
    awardQuestionXP,
    completeLesson,
    completeClinicalCase,
    completeTopic,
    applyXpGain,
    addXp,
  };
}
