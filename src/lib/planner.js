export const MS_IN_DAY = 1000 * 60 * 60 * 24;
export const XP_PER_LEVEL = 100;

export const calculateXP = (difficulty) => {
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 20;
  return 30;
};

const normalizeDate = (date) => {
  const normalized = new Date(date);
  if (Number.isNaN(normalized.getTime())) return null;
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const updateStreak = (lastCompletedDate, completionDate) => {
  if (!lastCompletedDate) return { streak: 1, unlockedToday: true, saveDate: true };

  const previous = normalizeDate(lastCompletedDate);
  const next = normalizeDate(completionDate);
  if (!previous || !next) return { streak: 1, unlockedToday: true, saveDate: true };

  const daysDiff = Math.round((next - previous) / MS_IN_DAY);
  if (daysDiff === 0) return { streak: null, unlockedToday: false, saveDate: false };
  if (daysDiff === 1) return { streak: 'increment', unlockedToday: true, saveDate: true };
  if (daysDiff > 1) return { streak: 1, unlockedToday: true, saveDate: true };

  return { streak: null, unlockedToday: false, saveDate: false };
};

export const unlockPostcardPiece = (postcards) => {
  const next = postcards.map((postcard) => ({ ...postcard }));
  const target = next.find((item) => !item.completed && item.unlockedPieces < item.totalPieces);

  if (!target) return { postcards: next, unlockedCardId: null, pieceUnlocked: false };

  target.unlockedPieces += 1;
  target.completed = target.unlockedPieces >= target.totalPieces;
  return { postcards: next, unlockedCardId: target.id, pieceUnlocked: true };
};
