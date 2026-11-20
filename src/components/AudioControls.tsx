import React, { useState } from 'react';
import { Turtle, Volume2 } from 'lucide-react';
import { playTapSound } from '../utils/soundFx';
import { speakEnglish } from '../utils/speech';

interface AudioControlsProps {
  text: string;
  labelNormal?: string;
  labelSlow?: string;
  compact?: boolean;
  soundMuted?: boolean;
  onPlayed?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  text,
  labelNormal = 'Escuchar normal',
  labelSlow = 'Escuchar lento',
  compact = false,
  soundMuted = false,
  onPlayed,
}) => {
  const [speakingMode, setSpeakingMode] = useState<'normal' | 'slow' | null>(null);

  const handlePlay = (slow: boolean) => {
    playTapSound(soundMuted);
    const mode = slow ? 'slow' : 'normal';
    speakEnglish(text, {
      slow,
      muted: soundMuted,
      onStart: () => {
        setSpeakingMode(mode);
        onPlayed?.();
      },
      onEnd: () => {
        setSpeakingMode((prev) => (prev === mode ? null : prev));
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() => handlePlay(false)}
        aria-label={`${labelNormal}: ${text}`}
        className={`btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border-b-[5px] px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0 ${
          speakingMode === 'normal'
            ? 'border-sky-800 bg-gradient-to-b from-sky-500 to-sky-600 text-white'
            : 'border-sky-700 bg-gradient-to-b from-sky-400 to-sky-500 text-white hover:to-sky-600'
        }`}
      >
        <Volume2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{compact ? 'Normal' : labelNormal}</span>
      </button>

      <button
        type="button"
        onClick={() => handlePlay(true)}
        aria-label={`${labelSlow}: ${text}`}
        className={`btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-b-[5px] px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 whitespace-nowrap shrink-0 ${
          speakingMode === 'slow'
            ? 'border-amber-500 border-b-amber-600 bg-amber-100 text-amber-950'
            : 'border-slate-300 border-b-slate-400 bg-white text-slate-800 hover:bg-slate-50'
        }`}
      >
        <Turtle className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <span>{compact ? 'Lento' : labelSlow}</span>
      </button>
    </div>
  );
};
