export type GenderPresentation = 'feminine' | 'masculine' | 'neutral';
export type BodyType = 'athletic' | 'slender' | 'broad' | 'compact';
export type HeightStyle = 'standard' | 'tall' | 'petite';
export type HairStyle =
  | 'short_crop'
  | 'buzz'
  | 'parted'
  | 'curly_fade'
  | 'high_ponytail'
  | 'scrub_cap'
  | 'long_braids'
  | 'wavy_bob';
export type FaceStyle = 'determined' | 'focused' | 'calm' | 'compassionate';
export type EyeStyle = 'alert' | 'sharp' | 'kind' | 'intense';

export type ScrubStyle =
  | 'scrubs_navy'
  | 'scrubs_burgundy'
  | 'scrubs_slate'
  | 'scrubs_emerald'
  | 'scrubs_cobalt'
  | 'scrubs_midnight';

export type OutfitStyle =
  | 'basic_scrubs'
  | 'ed_fitted_scrubs'
  | 'trauma_jumpsuit'
  | 'white_coat_over_scrubs'
  | 'resus_specialist_parka'
  | 'chief_attending_coat';

export type StethoscopeStyle =
  | 'none'
  | 'basic_single_head'
  | 'cardiology_dual_lumen'
  | 'digital_electronic_scope'
  | 'gold_master_stethoscope';

export type BadgeStyle =
  | 'paper_id'
  | 'ed_trainee_badge'
  | 'rfid_specialist_badge'
  | 'chief_gold_keycard';

export type WatchStyle =
  | 'none'
  | 'trauma_silicone_timer'
  | 'smart_telemetry_watch'
  | 'chronograph_sweep_second';

export type GlassesStyle =
  | 'none'
  | 'safety_goggles'
  | 'classic_wire'
  | 'trauma_shield';

export type MaskStyle =
  | 'none'
  | 'surgical_blue'
  | 'n95_particulate'
  | 'resus_filter_mask';

export type AccessoryStyle =
  | 'none'
  | 'penlight_in_pocket'
  | 'trauma_shears_holster'
  | 'ekg_calipers'
  | 'pager_clip';

export type CompanionId = 'none' | 'pulse' | 'echo' | 'rhythm' | 'clot' | 'lumi';

export type ClinicalTier =
  | 'novice' // Level 1-4: Medical Novice
  | 'intern' // Level 5-9: ED Trainee
  | 'practitioner' // Level 10-19: Emergency Practitioner
  | 'resus_specialist' // Level 20-29: Resuscitation Specialist
  | 'emergency_master'; // Level 30+: Emergency Master

export interface AvatarAppearance {
  // Character Anatomy
  name: string;
  genderPresentation: GenderPresentation;
  skinTone: string; // Hex color code
  hairStyle: HairStyle;
  hairColor: string; // Hex color code
  faceStyle: FaceStyle;
  eyeStyle: EyeStyle;
  eyeColor: string; // Hex color code
  bodyType: BodyType;
  heightStyle: HeightStyle;

  // Medical Wardrobe & Equipment
  scrubColor: string; // Hex color or primary color
  outfitStyle: OutfitStyle;
  stethoscopeStyle: StethoscopeStyle;
  badgeStyle: BadgeStyle;
  watchStyle: WatchStyle;
  glassesStyle: GlassesStyle;
  maskStyle: MaskStyle;
  accessoryStyle: AccessoryStyle;
  companionId: CompanionId;
}

export type ItemCategory =
  | 'equipment'
  | 'outfits'
  | 'accessories'
  | 'pets'
  | 'badges'
  | 'special';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface UnlockRequirement {
  type: 'level' | 'milestone' | 'mastery' | 'cases';
  threshold: number | string;
  label: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  slotType:
    | 'outfit'
    | 'stethoscope'
    | 'badge'
    | 'watch'
    | 'glasses'
    | 'mask'
    | 'accessory'
    | 'companion'
    | 'equipment';
  value: string; // Corresponds to appearance enum or equipment ID
  unlockRequirement: UnlockRequirement;
  nightShiftEffect?: string; // Informational/convenience effect description (never replaces knowledge)
}

export interface CompanionInfo {
  id: CompanionId;
  name: string;
  title: string;
  personality: string;
  description: string;
  rarity: ItemRarity;
  quotes: {
    idle: string[];
    correct: string[];
    criticalVitals: string[];
    levelUp: string[];
  };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'clinical' | 'study' | 'shift' | 'mastery';
  requirementText: string;
  rewardText: string;
  rewardItemId?: string;
  rewardXP: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  progress: number;
  maxProgress: number;
}

export interface MedicalMasteryDomain {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  percentage: number; // 0 - 100
  questionsCount: number;
  casesCount: number;
  rewardTierUnlocked: number; // 0 (none), 1 (50%), 2 (75%), 3 (90%), 4 (100%)
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXP: number;
  completed: boolean;
}
