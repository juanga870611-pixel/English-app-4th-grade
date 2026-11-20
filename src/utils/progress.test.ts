import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyWeekCompletion,
  calculatePaceProjection,
  calculateStarsForAccuracy,
  createInitialProgress,
  generateProgressCode,
  verifyProgressCode,
} from './progress';

test('stars calculation matches accuracy thresholds', () => {
  assert.equal(calculateStarsForAccuracy(95), 3);
  assert.equal(calculateStarsForAccuracy(92), 3);
  assert.equal(calculateStarsForAccuracy(85), 2);
  assert.equal(calculateStarsForAccuracy(80), 2);
  assert.equal(calculateStarsForAccuracy(75), 1);
});

test('completing week with >= 80% immediately unlocks next week', () => {
  const initial = createInitialProgress();
  const res = applyWeekCompletion(initial, 1, 83, 6, '2026-11-19');
  assert.equal(res.passed, true);
  assert.equal(res.unlockedNextWeek, true);
  assert.equal(res.nextProgress.unlockedMaxWeek, 2);
  assert.equal(res.starsEarned, 2);
  assert.ok(res.xpEarned > 0);
});

test('completing week with < 80% does not unlock next week', () => {
  const initial = createInitialProgress();
  const res = applyWeekCompletion(initial, 1, 60, 6, '2026-11-19');
  assert.equal(res.passed, false);
  assert.equal(res.unlockedNextWeek, false);
  assert.equal(res.nextProgress.unlockedMaxWeek, 1);
});

test('pace projection computes standard vs fast 7-month percentages', () => {
  let state = createInitialProgress();
  state = applyWeekCompletion(state, 1, 95, 6, '2026-11-19').nextProgress;
  state = applyWeekCompletion(state, 2, 90, 6, '2026-11-19').nextProgress;

  const fastProj = calculatePaceProjection(state, 'fast_7m');
  const stdProj = calculatePaceProjection(state, 'standard_9m');

  assert.equal(fastProj.completedCount, 2);
  assert.ok(fastProj.fastTrackPercent > stdProj.standardPercent);
  assert.ok(fastProj.projectedMonths < stdProj.projectedMonths);
});

test('progress code generation and checksum verification round-trips accurately', () => {
  let state = createInitialProgress();
  state = applyWeekCompletion(state, 1, 100, 6, '2026-11-19').nextProgress;
  const code = generateProgressCode(state);

  const check = verifyProgressCode(code);
  assert.equal(check.valid, true);
  assert.equal(check.weeksCompleted, 1);
  assert.equal(check.totalStars, 3);
  assert.equal(check.xp, state.xp);
  assert.equal(check.paceMode, 'fast_7m');

  // Tampered code must fail checksum
  const tampered = code.slice(0, -1) + (code.endsWith('A') ? 'B' : 'A');
  assert.equal(verifyProgressCode(tampered).valid, false);
});
