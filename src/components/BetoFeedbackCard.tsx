import React from 'react';
import { CheckCircle2, Lightbulb, Turtle, Volume2 } from 'lucide-react';
import type { BetoFeedbackPayload } from '../utils/pedagogicalFeedback';
import { speakEnglish } from '../utils/speech';
import { BetoMiniVideoStage } from './BetoMiniVideoStage';

interface BetoFeedbackCardProps {
  payload: BetoFeedbackPayload;
  soundMuted?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export const BetoMiniAvatar: React.FC<{ mood: 'error' | 'hint' | 'success' }> = ({ mood }) => (
  <svg
    width={40}
    height={40}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="11" fill="#332924" />
    <circle cx="20" cy="20" r="6" fill="#C69C6D" />
    <circle cx="60" cy="20" r="11" fill="#332924" />
    <circle cx="60" cy="20" r="6" fill="#C69C6D" />
    <ellipse cx="40" cy="43" rx="28" ry="26" fill="#3E322B" />
    <circle cx="29" cy="39" r="9.5" fill="#FDE68A" />
    <circle cx="51" cy="39" r="9.5" fill="#FDE68A" />
    <rect x="35" y="37" width="10" height="4" rx="2" fill="#FDE68A" />
    <circle cx="29" cy="39" r="3.6" fill="#1E1B18" />
    <circle cx="30" cy="37.8" r="1.2" fill="#FFFFFF" />
    <circle cx="51" cy="39" r="3.6" fill="#1E1B18" />
    <circle cx="52" cy="37.8" r="1.2" fill="#FFFFFF" />
    <ellipse cx="40" cy="52" rx="13" ry="10" fill="#F5E6D3" />
    <ellipse cx="40" cy="47.5" rx="4.5" ry="3" fill="#1E1B18" />
    {mood === 'success' ? (
      <path d="M34 54C36 58 44 58 46 54" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
    ) : (
      <path d="M35 55C37.5 54 42.5 54 45 55" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
    )}
    <path d="M20 63C27 68 53 68 60 63L56 71C47 75 33 75 24 71L20 63Z" fill="#059669" />
    <path d="M26 67C34 70 46 70 54 67" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

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
      className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5 text-emerald-950 space-y-3"
    >
      <div className="flex items-start gap-3">
        <BetoMiniAvatar mood="success" />
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
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            onClick={() => speakEnglish(payload.example.en, { muted: soundMuted })}
            aria-label={`Escuchar ejemplo: ${payload.example.en}`}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-100 whitespace-nowrap"
          >
            <Volume2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
            <span>Escuchar ejemplo</span>
          </button>
          <button
            type="button"
            onClick={() => speakEnglish(payload.example.en, { slow: true, muted: soundMuted })}
            aria-label={`Escuchar ejemplo despacio: ${payload.example.en}`}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
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
    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
      open
        ? 'border-amber-400 bg-amber-100 text-amber-950'
        : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
    }`}
  >
    <Lightbulb className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
    <span>{open ? 'Ocultar pista animada' : 'Ver pista animada'}</span>
  </button>
);
