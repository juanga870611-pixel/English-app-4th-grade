// Web Speech API wrapper configured for en-US pronunciation
// Handles normal and slow (turtle) playback rates cleanly.

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore environments where speechSynthesis throws on cancel
  }
  currentUtterance = null;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

export interface SpeakOptions {
  slow?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speakEnglish(text: string, options: SpeakOptions = {}): void {
  const { slow = false, onStart, onEnd } = options;
  if (!isSpeechSupported()) {
    onStart?.();
    setTimeout(() => onEnd?.(), slow ? 900 : 500);
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.62 : 0.95;
  utterance.pitch = 1.05;

  const voice = pickEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  let finished = false;
  const finishOnce = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };

  utterance.onstart = () => onStart?.();
  utterance.onend = finishOnce;
  utterance.onerror = finishOnce;

  currentUtterance = utterance;

  try {
    onStart?.();
    window.speechSynthesis.speak(utterance);
    // Fallback safety timer in case headless Chromium never fires onend
    const estMs = Math.max(800, Math.min(4500, text.length * (slow ? 95 : 65)));
    setTimeout(finishOnce, estMs);
  } catch {
    finishOnce();
  }
}
