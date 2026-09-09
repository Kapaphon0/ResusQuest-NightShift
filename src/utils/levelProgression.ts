/**
 * Level progression calculator with quadratic increasing XP requirements.
 * XP delta between levels increases by 25 per level:
 * Level 1 -> 2: 100 XP
 * Level 2 -> 3: 125 XP
 * Level 3 -> 4: 150 XP
 * Level 4 -> 5: 175 XP
 */

export function getCumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  // sum_{k=0}^{n-1} (100 + 25k) = 100*n + 25 * (n-1)*n / 2
  return 100 * n + (25 * (n - 1) * n) / 2;
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Medical Master';
  if (level >= 40) return 'Clinical Expert';
  if (level >= 30) return 'Senior Clinician';
  if (level >= 20) return 'Junior Clinician';
  if (level >= 10) return 'Clinical Apprentice';
  if (level >= 5) return 'Apprentice';
  return 'Medical Novice';
}

export interface LevelDetails {
  level: number;
  title: string;
  totalXp: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  xpIntoLevel: number;
  xpRequiredForLevel: number;
  progressPercent: number;
}

export function calculateLevelDetails(totalXp: number): LevelDetails {
  const safeXp = Math.max(0, totalXp);

  // Find level where cumulative XP for level <= safeXp < cumulative XP for level+1
  let level = 1;
  while (getCumulativeXpForLevel(level + 1) <= safeXp) {
    level++;
  }

  const currentLevelBaseXp = getCumulativeXpForLevel(level);
  const nextLevelBaseXp = getCumulativeXpForLevel(level + 1);
  const xpRequiredForLevel = nextLevelBaseXp - currentLevelBaseXp;
  const xpIntoLevel = safeXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpIntoLevel / xpRequiredForLevel) * 100))
  );

  return {
    level,
    title: getLevelTitle(level),
    totalXp: safeXp,
    currentLevelBaseXp,
    nextLevelBaseXp,
    xpIntoLevel,
    xpRequiredForLevel,
    progressPercent,
  };
}
