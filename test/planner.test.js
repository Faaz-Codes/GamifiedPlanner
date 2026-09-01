import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateXP, unlockPostcardPiece, updateStreak } from '../src/lib/planner.js';

test('awards XP by task difficulty', () => {
  assert.equal(calculateXP('easy'), 10);
  assert.equal(calculateXP('medium'), 20);
  assert.equal(calculateXP('hard'), 30);
});

test('streak changes only once per day and resets after a gap', () => {
  assert.deepEqual(updateStreak(null, '2026-09-01T08:00:00'), { streak: 1, unlockedToday: true, saveDate: true });
  assert.deepEqual(updateStreak('2026-09-01T08:00:00', '2026-09-01T22:00:00'), { streak: null, unlockedToday: false, saveDate: false });
  assert.deepEqual(updateStreak('2026-09-01T08:00:00', '2026-09-02T08:00:00'), { streak: 'increment', unlockedToday: true, saveDate: true });
  assert.deepEqual(updateStreak('2026-09-01T08:00:00', '2026-09-04T08:00:00'), { streak: 1, unlockedToday: true, saveDate: true });
});

test('invalid stored completion date recovers with a fresh daily unlock', () => {
  assert.deepEqual(updateStreak('not-a-date', '2026-09-01T08:00:00'), { streak: 1, unlockedToday: true, saveDate: true });
});

test('unlocks pieces in order without mutating existing postcards', () => {
  const postcards = [
    { id: 1, unlockedPieces: 1, totalPieces: 2, completed: false },
    { id: 2, unlockedPieces: 0, totalPieces: 2, completed: false }
  ];
  const result = unlockPostcardPiece(postcards);
  assert.equal(result.unlockedCardId, 1);
  assert.equal(result.postcards[0].unlockedPieces, 2);
  assert.equal(result.postcards[0].completed, true);
  assert.equal(postcards[0].unlockedPieces, 1);
  assert.equal(unlockPostcardPiece(result.postcards).unlockedCardId, 2);
});
