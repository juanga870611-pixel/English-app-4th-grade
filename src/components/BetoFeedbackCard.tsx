import React from 'react';
import { CheckCircle2, Lightbulb, Turtle, Volume2 } from 'lucide-react';
import type { BetoFeedbackPayload } from '../utils/pedagogicalFeedback';
import { playTapSound } from '../utils/soundFx';
import { speakEnglish } from '../utils/speech';
import { BetoMiniVideoStage } from './BetoMiniVideoStage';
import { VolumetricBetoSvg } from './MascotGuide';

interface BetoFeedbackCardProps {
  payload: BetoFeedbackPayload;
  soundMuted?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export const BetoFeedbackCard: React.FC<BetoFeedbackCardProps> = ({
  payload,
  soundMuted = false,
  actionLabel,
  onAction,
}) => {
  // Error and pre-answer hints render the interactive 3-step animated mini-video theater
  if (payload.kind === 'error' || payload.kind === 'hint') {
    return (
      <BetoMiniVideoStage
        payload={payload}
        soundMuted={soundMuted}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="panel-3d-emerald rounded-2xl p-4 sm:p-5 text-emerald-950 space-y-3"
    >
      <div className="flex items-start gap-3">
        <VolumetricBetoSvg size={48} mood="celebrating" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{payload.titleEs}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-slate-900">
            {payload.explanationEs}
          </p>
        </div>
      </div>

      {/* Everyday Reinforcement Example */}
      <div className="rounded-xl border border-b-4 border-slate-200 border-b-slate-300 bg-white p-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500">Ejemplo de uso cotidiano</p>
          <p className="mt-0.5 font-display text-base font-bold text-slate-900">
            {payload.example.en}
          </p>
          <p className="text-xs font-medium text-slate-600">{payload.example.es}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundMuted);
              speakEnglish(payload.example.en, { muted: soundMuted });
            }}
            aria-label={`Escuchar ejemplo: ${payload.example.en}`}
            className="btn-3d inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-b-4 border-sky-300 border-b-sky-400 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-100 whitespace-nowrap"
          >
            <Volume2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
            <span>Escuchar ejemplo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound(soundMuted);
              speakEnglish(payload.example.en, { slow: true, muted: soundMuted });
            }}
            aria-label={`Escuchar ejemplo despacio: ${payload.example.en}`}
            className="btn-3d inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-b-4 border-slate-300 border-b-slate-400 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Turtle className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span>Lento</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface HintExampleButtonProps {
  open: boolean;
  onToggle: () => void;
}

export const HintExampleButton: React.FC<HintExampleButtonProps> = ({ open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    className={`btn-3d inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-b-4 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 ${
      open
        ? 'border-amber-500 border-b-amber-600 bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950'
        : 'border-amber-300 border-b-amber-400 bg-gradient-to-b from-white to-amber-50 text-amber-900 hover:to-amber-100'
    }`}
  >
    <Lightbulb className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
    <span>{open ? 'Ocultar pista animada' : 'Ver pista animada'}</span>
  </button>
);
