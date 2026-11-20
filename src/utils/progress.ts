import type { PaceMode, StudentProgress, WeekCompletionRecord } from '../types/curriculum';

export const TOTAL_WEEKS = 36;
export const FAST_TRACK_TARGET_WEEKS = 28; // 7 months
export const PASS_ACCURACY_THRESHOLD = 80; // >= 80% unlocks next week immediately
export const STORAGE_KEY = 'english_explorers_col_g4_v1';

export function getTodayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialProgress(): StudentProgress {
  return {
    studentName: 'Estudiante 4°',
    xp: 0,
    streakDays: 1,
    lastActiveDate: getTodayIsoDate(),
    paceMode: 'fast_7m',
    soundMuted: false,
    unlockedMaxWeek: 1,
    completedWeeks: {},
  };
}

export function calculateStarsForAccuracy(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 92) return 3;
  if (accuracy >= PASS_ACCURACY_THRESHOLD) return 2;
  return 1;
}

export function calculateWeekXp(accuracy: number, challengeCount: number): number {
  const baseXp = challengeCount * 15;
  const accuracyBonus = accuracy >= 92 ? 30 : accuracy >= PASS_ACCURACY_THRESHOLD ? 15 : 5;
  return baseXp + accuracyBonus;
}

export function computeNextStreak(lastActiveDate: string, currentStreak: number, todayIso: string): number {
  if (!lastActiveDate) return 1;
  if (lastActiveDate === todayIso) return Math.max(1, currentStreak);

  const prev = new Date(`${lastActiveDate}T00:00:00Z`);
  const curr = new Date(`${todayIso}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays > 1) return 1;
  return Math.max(1, currentStreak);
}

export function applyWeekCompletion(
  progress: StudentProgress,
  weekNumber: number,
  accuracy: number,
  challengeCount: number,
  todayIso = getTodayIsoDate()
): {
  nextProgress: StudentProgress;
  starsEarned: 1 | 2 | 3;
  xpEarned: number;
  passed: boolean;
  unlockedNextWeek: boolean;
} {
  const clampedAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
  const passed = clampedAccuracy >= PASS_ACCURACY_THRESHOLD;
  const starsEarned = calculateStarsForAccuracy(clampedAccuracy);
  const xpEarned = calculateWeekXp(clampedAccuracy, challengeCount);

  const existing = progress.completedWeeks[weekNumber];
  const updatedRecord: WeekCompletionRecord = {
    weekNumber,
    bestAccuracy: existing ? Math.max(existing.bestAccuracy, clampedAccuracy) : clampedAccuracy,
    stars: existing ? (Math.max(existing.stars, starsEarned) as 1 | 2 | 3) : starsEarned,
    xpEarned: existing ? existing.xpEarned + xpEarned : xpEarned,
    completedAt: new Date().toISOString(),
    attempts: existing ? existing.attempts + 1 : 1,
  };

  let nextUnlocked = progress.unlockedMaxWeek;
  let unlockedNextWeek = false;

  if (passed && weekNumber >= progress.unlockedMaxWeek && weekNumber < TOTAL_WEEKS) {
    // Both modes unlock sequential week upon passing >= 80%; fast_7m enables immediate fast-track advancement
    nextUnlocked = weekNumber + 1;
    unlockedNextWeek = true;
  }

  const nextStreak = computeNextStreak(progress.lastActiveDate, progress.streakDays, todayIso);

  const nextProgress: StudentProgress = {
    ...progress,
    xp: progress.xp + xpEarned,
    streakDays: nextStreak,
    lastActiveDate: todayIso,
    unlockedMaxWeek: nextUnlocked,
    completedWeeks: {
      ...progress.completedWeeks,
      [weekNumber]: updatedRecord,
    },
  };

  return {
    nextProgress,
    starsEarned,
    xpEarned,
    passed,
    unlockedNextWeek,
  };
}

export function countTotalStars(progress: StudentProgress): number {
  return Object.values(progress.completedWeeks).reduce((sum, rec) => sum + rec.stars, 0);
}

export function countCompletedWeeks(progress: StudentProgress): number {
  return Object.keys(progress.completedWeeks).length;
}

export interface PaceProjection {
  completedCount: number;
  standardPercent: number; // % of 36-week standard route
  fastTrackPercent: number; // % of 28-week (7-month) fast-track milestone or accelerated projection
  projectedMonths: number;
  weeksPerMonthTarget: number;
  paceLabelEs: string;
}

export function calculatePaceProjection(progress: StudentProgress, paceMode: PaceMode): PaceProjection {
  const completedCount = countCompletedWeeks(progress);
  const standardPercent = Math.min(100, Math.round((completedCount / TOTAL_WEEKS) * 100));

  // In fast-track 7m mode, completing >= 80% lets student advance ~1.3x faster (36 weeks in 7 months = ~5.1 weeks/mo vs 4 weeks/mo)
  const effectiveDenominator = paceMode === 'fast_7m' ? FAST_TRACK_TARGET_WEEKS : TOTAL_WEEKS;
  const fastTrackPercent = Math.min(100, Math.round((completedCount / effectiveDenominator) * 100));

  const weeksPerMonthTarget = paceMode === 'fast_7m' ? 5.1 : 4.0;
  const remainingWeeks = Math.max(0, TOTAL_WEEKS - completedCount);
  const projectedMonths = Number((remainingWeeks / weeksPerMonthTarget).toFixed(1));

  const paceLabelEs =
    paceMode === 'fast_7m'
      ? 'Ruta rápida (7 meses · ≥80% desbloquea de inmediato)'
      : 'Ruta estándar (9 meses · 1 semana por clase)';

  return {
    completedCount,
    standardPercent,
    fastTrackPercent,
    projectedMonths,
    weeksPerMonthTarget,
    paceLabelEs,
  };
}

// Short deterministic alphanumeric progress code for teacher reporting in computer lab
// Format: E4-<WEEKS_COMPLETED_2D><STARS_3D>-<XP_4D>-<PACE_1C><CHECKSUM_3C>
export function generateProgressCode(progress: StudentProgress): string {
  const weeks = String(countCompletedWeeks(progress)).padStart(2, '0');
  const stars = String(countTotalStars(progress)).padStart(3, '0');
  const xp = String(Math.min(9999, progress.xp)).padStart(4, '0');
  const paceChar = progress.paceMode === 'fast_7m' ? 'R' : 'E';

  const rawPayload = `${weeks}${stars}${xp}${paceChar}`;
  let hash = 7;
  for (let i = 0; i < rawPayload.length; i++) {
    hash = (hash * 31 + rawPayload.charCodeAt(i)) % 46656; // 36^3
  }
  const checksum = hash.toString(36).toUpperCase().padStart(3, '0');

  return `E4-${weeks}${stars}-${xp}-${paceChar}${checksum}`;
}

export function verifyProgressCode(code: string): {
  valid: boolean;
  weeksCompleted?: number;
  totalStars?: number;
  xp?: number;
  paceMode?: PaceMode;
} {
  const trimmed = code.trim().toUpperCase();
  const match = /^E4-(\d{2})(\d{3})-(\d{4})-([RE])([0-9A-Z]{3})$/.exec(trimmed);
  if (!match) return { valid: false };

  const [, weeksStr, starsStr, xpStr, paceChar, checksum] = match;
  const rawPayload = `${weeksStr}${starsStr}${xpStr}${paceChar}`;
  let hash = 7;
  for (let i = 0; i < rawPayload.length; i++) {
    hash = (hash * 31 + rawPayload.charCodeAt(i)) % 46656;
  }
  const expectedChecksum = hash.toString(36).toUpperCase().padStart(3, '0');

  if (checksum !== expectedChecksum) return { valid: false };

  return {
    valid: true,
    weeksCompleted: Number(weeksStr),
    totalStars: Number(starsStr),
    xp: Number(xpStr),
    paceMode: paceChar === 'R' ? 'fast_7m' : 'standard_9m',
  };
}
