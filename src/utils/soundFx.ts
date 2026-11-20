// Gentle synthesized Web Audio API sound effects (no external audio files needed)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextCtor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.08,
  delaySec = 0,
  endFreq?: number
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq && endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Ignore audio context restriction errors
  }
}

/** Tactile soft button press pop */
export function playTapSound(muted: boolean): void {
  if (muted) return;
  playTone(320, 0.055, 'triangle', 0.045, 0, 220);
}

/** Airy whoosh sweep for 3D flashcard & memory card flips */
export function playCardFlipSound(muted: boolean): void {
  if (muted) return;
  playTone(360, 0.09, 'sine', 0.05, 0, 620);
}

/** Playful two-note cheer when tapping Beto the Bear */
export function playBetoCheerSound(muted: boolean): void {
  if (muted) return;
  playTone(587.33, 0.1, 'triangle', 0.08, 0); // D5
  playTone(880, 0.16, 'triangle', 0.09, 0.08); // A5
}

export function playSuccessChime(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 0.12, 'triangle', 0.09, 0); // C5
  playTone(659.25, 0.16, 'triangle', 0.09, 0.08); // E5
  playTone(783.99, 0.18, 'triangle', 0.08, 0.16); // G5
}

export function playRetryTone(muted: boolean): void {
  if (muted) return;
  playTone(280, 0.14, 'sine', 0.06, 0);
  playTone(240, 0.16, 'sine', 0.05, 0.09);
}

export function playFlipSound(muted: boolean): void {
  if (muted) return;
  playTone(440, 0.06, 'sine', 0.04, 0, 540);
}

export function playVictoryFanfare(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 0.12, 'triangle', 0.09, 0);
  playTone(659.25, 0.12, 'triangle', 0.09, 0.09);
  playTone(783.99, 0.14, 'triangle', 0.09, 0.18);
  playTone(1046.5, 0.28, 'triangle', 0.1, 0.27);
}
