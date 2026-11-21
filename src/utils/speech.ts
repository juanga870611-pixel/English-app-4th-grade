// Web Speech API wrapper configured for en-US & es-CO/es-ES pronunciation
// Includes hybrid Karaoke word synchronization (onboundary + deterministic fallback cadence).

let activePlaybackToken = 0;
let activeCadenceTimer: ReturnType<typeof setInterval> | null = null;
let activeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function clearTimers(): void {
  if (activeCadenceTimer) {
    clearInterval(activeCadenceTimer);
    activeCadenceTimer = null;
  }
  if (activeFallbackTimer) {
    clearTimeout(activeFallbackTimer);
    activeFallbackTimer = null;
  }
}

export function stopSpeech(): void {
  activePlaybackToken += 1;
  clearTimers();
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore environments where speechSynthesis throws on cancel
  }
}

export interface WordTokenRange {
  index: number;
  word: string;
  start: number;
  end: number;
}

/**
 * Splits text into word tokens with character offsets for Karaoke synchronization.
 */
export function tokenizeForKaraoke(text: string): WordTokenRange[] {
  const tokens: WordTokenRange[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      index: idx,
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    idx += 1;
  }
  return tokens;
}

/**
 * Maps a SpeechSynthesisEvent charIndex to the corresponding word token index.
 */
export function findWordIndexAtChar(tokens: WordTokenRange[], charIndex: number): number {
  if (tokens.length === 0) return -1;
  for (let i = 0; i < tokens.length; i++) {
    if (charIndex <= tokens[i].end) {
      return tokens[i].index;
    }
  }
  return tokens[tokens.length - 1].index;
}

function pickVoice(langPrefix: 'en' | 'es'): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (langPrefix === 'en') {
    return (
      voices.find((v) => v.lang === 'en-US' && v.localService) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null
    );
  }

  return (
    voices.find((v) => v.lang === 'es-CO') ||
    voices.find((v) => v.lang === 'es-MX') ||
    voices.find((v) => v.lang === 'es-419') ||
    voices.find((v) => v.lang.startsWith('es')) ||
    null
  );
}

export interface SpeakOptions {
  slow?: boolean;
  rate?: number;
  lang?: 'en-US' | 'es-CO';
  muted?: boolean;
  onStart?: () => void;
  onWordIndex?: (wordIdx: number) => void;
  onEnd?: () => void;
}

export function speakWithKaraoke(text: string, options: SpeakOptions = {}): void {
  const {
    slow = false,
    rate,
    lang = 'en-US',
    muted = false,
    onStart,
    onWordIndex,
    onEnd,
  } = options;

  stopSpeech();
  const token = activePlaybackToken;
  const tokens = tokenizeForKaraoke(text);
  const wordCount = Math.max(1, tokens.length);

  // Estimate per-word timing for visual Karaoke cadence (used both when muted/headless and as boundary backup)
  const baseMsPerWord = slow ? 460 : lang === 'es-CO' ? 270 : 300;
  const totalEstMs = Math.max(900, Math.min(12000, wordCount * baseMsPerWord + 350));

  let finished = false;
  let boundaryDriven = false;
  let simWordIdx = 0;

  const finishOnce = () => {
    if (finished || token !== activePlaybackToken) return;
    finished = true;
    clearTimers();
    onWordIndex?.(tokens.length - 1);
    onEnd?.();
  };

  onStart?.();
  if (tokens.length > 0) {
    onWordIndex?.(0);
  }

  // Smooth cadence timer for reliable Karaoke progression even in headless Chromium or muted mode
  activeCadenceTimer = setInterval(() => {
    if (finished || token !== activePlaybackToken || boundaryDriven) return;
    simWordIdx += 1;
    if (simWordIdx < tokens.length) {
      onWordIndex?.(simWordIdx);
    } else if (muted || !isSpeechSupported()) {
      finishOnce();
    }
  }, baseMsPerWord);

  if (muted || !isSpeechSupported()) {
    activeFallbackTimer = setTimeout(finishOnce, totalEstMs);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate ?? (slow ? 0.7 : lang === 'es-CO' ? 1.0 : 0.94);
  utterance.pitch = 1.05;

  const voice = pickVoice(lang.startsWith('es') ? 'es' : 'en');
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onboundary = (event: SpeechSynthesisEvent) => {
    if (finished || token !== activePlaybackToken) return;
    if (typeof event.charIndex === 'number') {
      boundaryDriven = true;
      const idx = findWordIndexAtChar(tokens, event.charIndex);
      if (idx >= 0) {
        simWordIdx = idx;
        onWordIndex?.(idx);
      }
    }
  };

  utterance.onend = finishOnce;
  utterance.onerror = finishOnce;

  try {
    window.speechSynthesis.speak(utterance);
    // Safety cap if headless browser never fires speechSynthesis.onend
    activeFallbackTimer = setTimeout(finishOnce, totalEstMs + 900);
  } catch {
    activeFallbackTimer = setTimeout(finishOnce, totalEstMs);
  }
}

export function speakEnglish(text: string, options: Omit<SpeakOptions, 'lang'> = {}): void {
  speakWithKaraoke(text, { ...options, lang: 'en-US' });
}

export function speakSpanish(text: string, options: Omit<SpeakOptions, 'lang'> = {}): void {
  speakWithKaraoke(text, { ...options, lang: 'es-CO' });
}
