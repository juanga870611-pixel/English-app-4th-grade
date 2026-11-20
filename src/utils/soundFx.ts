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
  delaySec = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Ignore audio context restriction errors
  }
}

export function playSuccessChime(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 0.12, 'triangle', 0.09, 0); // C5
  playTone(659.25, 0.16, 'triangle', 0.09, 0.08); // E5
}

export function playRetryTone(muted: boolean): void {
  if (muted) return;
  playTone(280, 0.14, 'sine', 0.06, 0);
  playTone(240, 0.16, 'sine', 0.05, 0.09);
}

export function playFlipSound(muted: boolean): void {
  if (muted) return;
  playTone(440, 0.06, 'sine', 0.04, 0);
}

export function playVictoryFanfare(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 0.12, 'triangle', 0.09, 0);
  playTone(659.25, 0.12, 'triangle', 0.09, 0.09);
  playTone(783.99, 0.14, 'triangle', 0.09, 0.18);
  playTone(1046.5, 0.28, 'triangle', 0.1, 0.27);
}
