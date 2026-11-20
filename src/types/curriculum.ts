export type ModuleId = 1 | 2 | 3 | 4;

export type PaceMode = 'standard_9m' | 'fast_7m';

export type ChallengeType =
  | 'listening'
  | 'memory'
  | 'reading'
  | 'word_search'
  | 'word_order'
  | 'micro_story'
  | 'arcade';

export interface VocabItem {
  id: string;
  word: string;
  spanish: string;
  emoji: string;
  category?: string;
}

export interface ListeningOption {
  id: string;
  label: string;
  spanish: string;
  emoji: string;
}

export interface ListeningChallenge {
  id: string;
  type: 'listening';
  mode: 'visual_choice' | 'word_bank';
  promptEs: string;
  audioText: string;
  hintEs: string;
  // For visual_choice
  options?: ListeningOption[];
  correctOptionId?: string;
  // For word_bank (fill in the blank)
  sentenceParts?: [string, string]; // e.g., ["I should ", " my teeth."]
  wordBank?: string[];
  correctWord?: string;
}

export interface MemoryPair {
  id: string;
  word: string;
  spanish: string;
  emoji: string;
  matchType?: 'emoji_word' | 'audio_word';
}

export interface MemoryChallenge {
  id: string;
  type: 'memory';
  mode: 'emoji_word' | 'audio_word';
  promptEs: string;
  hintEs: string;
  pairs: MemoryPair[]; // 4 to 6 pairs (8 to 12 cards)
}

export interface ReadingQuestion {
  questionEs: string;
  questionEn: string;
  options: { id: string; text: string; emoji?: string }[];
  correctOptionId: string;
}

export interface ReadingSequenceItem {
  id: string;
  textEn: string;
  textEs: string;
  emoji: string;
}

export interface ReadingChallenge {
  id: string;
  type: 'reading';
  mode: 'multiple_choice' | 'sequence';
  titleEn: string;
  titleEs: string;
  sceneEmoji: string;
  locationCol: string;
  passageEn: string[];
  passageEs: string;
  hintEs: string;
  question?: ReadingQuestion;
  sequenceItems?: ReadingSequenceItem[]; // In correct order
}

export interface WordSearchTarget {
  word: string; // Uppercase, no spaces
  spanish: string;
  emoji: string;
}

export interface WordSearchChallenge {
  id: string;
  type: 'word_search';
  gridSize: 8 | 10;
  promptEs: string;
  hintEs: string;
  targets: WordSearchTarget[];
}

export interface WordOrderChallenge {
  id: string;
  type: 'word_order';
  promptEs: string;
  spanishMeaning: string;
  correctSentence: string;
  hintEs: string;
  extraDistractors?: string[];
}

export interface MicroStoryScene {
  id: string;
  emoji: string;
  bgTone: 'sky' | 'emerald' | 'amber' | 'rose';
  narrationEn: string[];
  translationEs: string;
  checkpoint?: {
    questionEs: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
  };
}

export interface MicroStoryChallenge {
  id: string;
  type: 'micro_story';
  titleEn: string;
  titleEs: string;
  hintEs: string;
  scenes: MicroStoryScene[];
}

export interface ArcadeItem {
  id: string;
  word: string;
  spanish: string;
  emoji: string;
  bucket: 'left' | 'right';
}

export interface ArcadeChallenge {
  id: string;
  type: 'arcade';
  titleEs: string;
  promptEs: string;
  hintEs: string;
  leftBucket: { labelEn: string; labelEs: string; emoji: string; tone: 'emerald' | 'sky' };
  rightBucket: { labelEn: string; labelEs: string; emoji: string; tone: 'rose' | 'amber' };
  targetScore: number;
  timeLimitSec: number;
  items: ArcadeItem[];
}

export type WeekChallenge =
  | ListeningChallenge
  | MemoryChallenge
  | ReadingChallenge
  | WordSearchChallenge
  | WordOrderChallenge
  | MicroStoryChallenge
  | ArcadeChallenge;

export interface WeekLesson {
  weekNumber: number; // 1 to 36
  moduleId: ModuleId;
  weekInModule: number; // 1 to 9
  titleEn: string;
  titleEs: string;
  grammarFocus: string;
  vocabularyPreview: VocabItem[];
  hasMicroStory: boolean;
  isImplemented: boolean;
  challenges: WeekChallenge[];
}

export interface CurriculumModule {
  id: ModuleId;
  titleEn: string;
  titleEs: string;
  subtitleEs: string;
  menStandard: string;
  accentColor: 'emerald' | 'sky' | 'amber' | 'indigo';
  iconEmoji: string;
  weeksRange: [number, number];
}

export interface WeekCompletionRecord {
  weekNumber: number;
  bestAccuracy: number; // 0 to 100
  stars: 1 | 2 | 3;
  xpEarned: number;
  completedAt: string;
  attempts: number;
}

export interface StudentProgress {
  studentName: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  paceMode: PaceMode;
  soundMuted: boolean;
  unlockedMaxWeek: number; // 1..36
  completedWeeks: Record<number, WeekCompletionRecord>;
}
