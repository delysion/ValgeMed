const xpPerLevel = 60;
const maxLevel = 100;

export function progressionLevel(totalXp: number) {
  const earned = Math.max(0, Math.floor(totalXp));
  const level = Math.min(maxLevel, Math.floor(earned / xpPerLevel) + 1);
  return { level, xp: level === maxLevel ? xpPerLevel : earned % xpPerLevel, xpToNext: xpPerLevel };
}
