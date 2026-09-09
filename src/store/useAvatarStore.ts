import { useState, useEffect, useCallback } from 'react';
import {
  AvatarAppearance,
  ClinicalTier,
  InventoryItem,
  Milestone,
  MedicalMasteryDomain,
  DailyQuest,
} from '../types/avatar';
import { INVENTORY_ITEMS_CATALOG } from '../data/avatarItemsData';
import { INITIAL_MILESTONES } from '../data/milestonesData';
import { INITIAL_MASTERY_DOMAINS } from '../data/masteryData';
import { audio } from '../utils/audio';

const AVATAR_STORAGE_KEY = 'resus_avatar_state_v1';

export const DEFAULT_AVATAR_APPEARANCE: AvatarAppearance = {
  name: 'Dr. Alex Chen',
  genderPresentation: 'neutral',
  skinTone: '#E0B596',
  hairStyle: 'parted',
  hairColor: '#1E293B',
  faceStyle: 'determined',
  eyeStyle: 'alert',
  eyeColor: '#334155',
  bodyType: 'athletic',
  heightStyle: 'standard',

  scrubColor: '#0284C7', // Medical Sky/Navy
  outfitStyle: 'basic_scrubs',
  stethoscopeStyle: 'basic_single_head',
  badgeStyle: 'paper_id',
  watchStyle: 'trauma_silicone_timer',
  glassesStyle: 'none',
  maskStyle: 'none',
  accessoryStyle: 'penlight_in_pocket',
  companionId: 'pulse',
};

const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_1',
    title: 'Bedside Scholar',
    description: 'Complete 1 resuscitation curriculum lesson',
    progress: 1,
    target: 1,
    rewardXP: 30,
    completed: true,
  },
  {
    id: 'quest_2',
    title: 'Rapid Triage Pulse',
    description: 'Answer 5 clinical triage questions correctly',
    progress: 3,
    target: 5,
    rewardXP: 40,
    completed: false,
  },
  {
    id: 'quest_3',
    title: 'Night Shift Duty',
    description: 'Stabilize 1 critical emergency clinical case',
    progress: 0,
    target: 1,
    rewardXP: 50,
    completed: false,
  },
];

export interface AvatarStoreState {
  appearance: AvatarAppearance;
  unlockedItemIds: string[];
  milestones: Milestone[];
  masteryDomains: MedicalMasteryDomain[];
  dailyQuests: DailyQuest[];
  isOnboarded: boolean;
  avatarStudioOpen: boolean;
  inventoryModalOpen: boolean;
}

function getInitialStoreState(): AvatarStoreState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          appearance: { ...DEFAULT_AVATAR_APPEARANCE, ...parsed.appearance },
          unlockedItemIds: parsed.unlockedItemIds || [
            'outfit_basic_scrubs',
            'outfit_fitted_scrubs',
            'scope_basic_single_head',
            'badge_paper_id',
            'glasses_safety_goggles',
            'mask_surgical_blue',
            'acc_penlight_pocket',
            'pet_pulse',
            'watch_trauma_timer',
          ],
          milestones: parsed.milestones || INITIAL_MILESTONES,
          masteryDomains: parsed.masteryDomains || INITIAL_MASTERY_DOMAINS,
          dailyQuests: parsed.dailyQuests || INITIAL_DAILY_QUESTS,
          isOnboarded: parsed.isOnboarded ?? true,
          avatarStudioOpen: false,
          inventoryModalOpen: false,
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    appearance: DEFAULT_AVATAR_APPEARANCE,
    unlockedItemIds: [
      'outfit_basic_scrubs',
      'outfit_fitted_scrubs',
      'scope_basic_single_head',
      'badge_paper_id',
      'glasses_safety_goggles',
      'mask_surgical_blue',
      'acc_penlight_pocket',
      'pet_pulse',
      'watch_trauma_timer',
    ],
    milestones: INITIAL_MILESTONES,
    masteryDomains: INITIAL_MASTERY_DOMAINS,
    dailyQuests: INITIAL_DAILY_QUESTS,
    isOnboarded: true,
    avatarStudioOpen: false,
    inventoryModalOpen: false,
  };
}

let globalAvatarState: AvatarStoreState = getInitialStoreState();
const listeners = new Set<(state: AvatarStoreState) => void>();

function notifyState(next: AvatarStoreState) {
  globalAvatarState = next;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        AVATAR_STORAGE_KEY,
        JSON.stringify({
          appearance: next.appearance,
          unlockedItemIds: next.unlockedItemIds,
          milestones: next.milestones,
          masteryDomains: next.masteryDomains,
          dailyQuests: next.dailyQuests,
          isOnboarded: next.isOnboarded,
        })
      );
    }
  } catch {
    // storage fallback
  }
  listeners.forEach((fn) => fn(next));
}

export function getClinicalTier(level: number): ClinicalTier {
  if (level >= 30) return 'emergency_master';
  if (level >= 20) return 'resus_specialist';
  if (level >= 10) return 'practitioner';
  if (level >= 5) return 'intern';
  return 'novice';
}

export function getClinicalTierTitle(tier: ClinicalTier): string {
  switch (tier) {
    case 'emergency_master':
      return 'Emergency Master';
    case 'resus_specialist':
      return 'Resuscitation Specialist';
    case 'practitioner':
      return 'Emergency Practitioner';
    case 'intern':
      return 'ED Trainee';
    case 'novice':
    default:
      return 'Medical Novice';
  }
}

export function useAvatarStore() {
  const [state, setState] = useState<AvatarStoreState>(globalAvatarState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const updateState = useCallback(
    (updater: (prev: AvatarStoreState) => AvatarStoreState) => {
      const next = updater(globalAvatarState);
      notifyState(next);
    },
    []
  );

  const updateAppearance = useCallback(
    (partial: Partial<AvatarAppearance>) => {
      updateState((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          ...partial,
        },
      }));
    },
    [updateState]
  );

  const equipItem = useCallback(
    (item: InventoryItem) => {
      audio.playPerkEquipped();
      updateState((prev) => {
        const app = { ...prev.appearance };
        switch (item.slotType) {
          case 'outfit':
            app.outfitStyle = item.value as any;
            break;
          case 'stethoscope':
            app.stethoscopeStyle = item.value as any;
            break;
          case 'badge':
            app.badgeStyle = item.value as any;
            break;
          case 'watch':
            app.watchStyle = item.value as any;
            break;
          case 'glasses':
            app.glassesStyle = item.value as any;
            break;
          case 'mask':
            app.maskStyle = item.value as any;
            break;
          case 'accessory':
            app.accessoryStyle = item.value as any;
            break;
          case 'companion':
            app.companionId = item.value as any;
            break;
        }

        // Ensure item is marked unlocked
        const unlocked = prev.unlockedItemIds.includes(item.id)
          ? prev.unlockedItemIds
          : [...prev.unlockedItemIds, item.id];

        return {
          ...prev,
          appearance: app,
          unlockedItemIds: unlocked,
        };
      });
    },
    [updateState]
  );

  const unlockItem = useCallback(
    (itemId: string) => {
      updateState((prev) => {
        if (prev.unlockedItemIds.includes(itemId)) return prev;
        return {
          ...prev,
          unlockedItemIds: [...prev.unlockedItemIds, itemId],
        };
      });
    },
    [updateState]
  );

  const claimMilestone = useCallback(
    (milestoneId: string): { rewardXP: number; rewardItemId?: string } => {
      let claimedRewardXP = 0;
      let claimedRewardItemId: string | undefined = undefined;

      updateState((prev) => {
        const updated = prev.milestones.map((m) => {
          if (m.id === milestoneId && m.isUnlocked && !m.isClaimed) {
            claimedRewardXP = m.rewardXP;
            claimedRewardItemId = m.rewardItemId;
            return { ...m, isClaimed: true };
          }
          return m;
        });

        const nextUnlocked =
          claimedRewardItemId && !prev.unlockedItemIds.includes(claimedRewardItemId)
            ? [...prev.unlockedItemIds, claimedRewardItemId]
            : prev.unlockedItemIds;

        return {
          ...prev,
          milestones: updated,
          unlockedItemIds: nextUnlocked,
        };
      });

      if (claimedRewardXP > 0) {
        audio.playLevelUp();
      }

      return { rewardXP: claimedRewardXP, rewardItemId: claimedRewardItemId };
    },
    [updateState]
  );

  const setAvatarStudioOpen = useCallback(
    (open: boolean) => {
      updateState((prev) => ({ ...prev, avatarStudioOpen: open }));
    },
    [updateState]
  );

  const setInventoryModalOpen = useCallback(
    (open: boolean) => {
      updateState((prev) => ({ ...prev, inventoryModalOpen: open }));
    },
    [updateState]
  );

  const completeOnboarding = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      isOnboarded: true,
      avatarStudioOpen: false,
    }));
  }, [updateState]);

  const randomizeAppearance = useCallback(() => {
    const skinTones = ['#FCE7D6', '#E0B596', '#C68B59', '#8D5524', '#593B2B'];
    const hairColors = ['#1E293B', '#331B0B', '#78350F', '#B45309', '#94A3B8'];
    const hairStyles = [
      'short_crop',
      'buzz',
      'parted',
      'curly_fade',
      'high_ponytail',
      'scrub_cap',
      'long_braids',
      'wavy_bob',
    ];
    const scrubColors = [
      '#0284C7',
      '#991B1B',
      '#059669',
      '#475569',
      '#4338CA',
      '#0F172A',
    ];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    updateAppearance({
      skinTone: pick(skinTones),
      hairColor: pick(hairColors),
      hairStyle: pick(hairStyles) as any,
      scrubColor: pick(scrubColors),
    });
    audio.playTelemetryClick();
  }, [updateAppearance]);

  return {
    ...state,
    catalog: INVENTORY_ITEMS_CATALOG,
    updateAppearance,
    equipItem,
    unlockItem,
    claimMilestone,
    setAvatarStudioOpen,
    setInventoryModalOpen,
    completeOnboarding,
    randomizeAppearance,
  };
}
