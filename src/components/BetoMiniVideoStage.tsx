import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Turtle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { BetoFeedbackPayload, GrammarBlock } from '../utils/pedagogicalFeedback';
import {
  speakEnglish,
  speakSpanish,
  stopSpeech,
  tokenizeForKaraoke,
} from '../utils/speech';
import { AnimatedPedagogicalScene } from './AnimatedPedagogicalScene';

interface BetoMiniVideoStageProps {
  payload: BetoFeedbackPayload;
  soundMuted?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const BLOCK_STYLES: Record<GrammarBlock['role'], { card: string; badge: string }> = {
  Sujeto: {
    card: 'border-sky-300 bg-sky-50 text-sky-950',
    badge: 'text-sky-700',
  },
  Verbo: {
    card: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    badge: 'text-emerald-700',
  },
  Complemento: {
    card: 'border-amber-300 bg-amber-50 text-amber-950',
    badge: 'text-amber-700',
  },
};

const AnimatedBetoActor: React.FC<{
  mood: 'error' | 'hint';
  speaking: boolean;
}> = ({ mood, speaking }) => (
  <div
    className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 ${
      speaking ? 'animate-beto-talk' : ''
    }`}
    aria-hidden="true"
  >
    <svg width={54} height={54} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="20" cy="20" r="11" fill="#332924" />
      <circle cx="20" cy="20" r="6" fill="#C69C6D" />
      <circle cx="60" cy="20" r="11" fill="#332924" />
      <circle cx="60" cy="20" r="6" fill="#C69C6D" />
      {/* Head */}
      <ellipse cx="40" cy="43" rx="28" ry="26" fill="#3E322B" />
      {/* Spectacles */}
      <circle cx="29" cy="39" r="9.5" fill="#FDE68A" />
      <circle cx="51" cy="39" r="9.5" fill="#FDE68A" />
      <rect x="35" y="37" width="10" height="4" rx="2" fill="#FDE68A" />
      <circle cx="29" cy="39" r="3.6" fill="#1E1B18" />
      <circle cx="30" cy="37.8" r="1.2" fill="#FFFFFF" />
      <circle cx="51" cy="39" r="3.6" fill="#1E1B18" />
      <circle cx="52" cy="37.8" r="1.2" fill="#FFFFFF" />
      {/* Muzzle */}
      <ellipse cx="40" cy="52" rx="13" ry="10" fill="#F5E6D3" />
      <ellipse cx="40" cy="47.5" rx="4.5" ry="3" fill="#1E1B18" />
      {/* Speaking mouth vs calm mouth */}
      {speaking ? (
        <ellipse cx="40" cy="56" rx="4.5" ry="3.2" fill="#991B1B" />
      ) : mood === 'hint' ? (
        <path d="M34 54C36.5 57.5 43.5 57.5 46 54" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
      ) : (
        <path d="M35 55C37.5 54 42.5 54 45 55" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {/* Scarf */}
      <path d="M20 63C27 68 53 68 60 63L56 71C47 75 33 75 24 71L20 63Z" fill="#059669" />
      <path d="M26 67C34 70 46 70 54 67" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Waving paw */}
      <g className={speaking ? 'animate-beto-wave' : ''}>
        <circle cx="67" cy="57" r="7.5" fill="#3E322B" stroke="#F5E6D3" strokeWidth="1.5" />
      </g>
    </svg>
  </div>
);

interface KaraokeTextProps {
  text: string;
  activeWordIdx: number;
  highlightAll: boolean;
  tone: 'es' | 'en';
}

const KaraokeText: React.FC<KaraokeTextProps> = ({
  text,
  activeWordIdx,
  highlightAll,
  tone,
}) => {
  const tokens = useMemo(() => tokenizeForKaraoke(text), [text]);

  return (
    <span className="leading-relaxed">
      {tokens.map((token, idx) => {
        const isCurrent = !highlightAll && activeWordIdx === idx;
        const isSpoken = highlightAll || (activeWordIdx >= 0 && idx < activeWordIdx);
        return (
          <React.Fragment key={`${token.start}-${token.word}`}>
            <span
              data-karaoke-state={isCurrent ? 'active' : isSpoken ? 'spoken' : 'pending'}
              className={`inline-block rounded px-0.5 transition-colors duration-150 ${
                isCurrent
                  ? tone === 'es'
                    ? 'bg-amber-200 font-extrabold text-slate-950'
                    : 'bg-sky-200 font-extrabold text-slate-950'
                  : isSpoken
                    ? 'text-slate-950'
                    : 'text-slate-500'
              }`}
            >
              {token.word}
            </span>{' '}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export const BetoMiniVideoStage: React.FC<BetoMiniVideoStageProps> = ({
  payload,
  soundMuted = false,
  actionLabel,
  onAction,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(soundMuted);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [esWordIdx, setEsWordIdx] = useState<number>(-1);
  const [enWordIdx, setEnWordIdx] = useState<number>(-1);
  const [esDone, setEsDone] = useState<boolean>(false);
  const [enDone, setEnDone] = useState<boolean>(false);
  const [slowMode, setSlowMode] = useState<boolean>(false);

  const runTokenRef = useRef(0);
  const stepDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceMutedRef = useRef<boolean>(soundMuted);

  const isError = payload.kind === 'error';

  const stepLabels: [string, string, string] = [
    payload.step1Label ?? (isError ? '¿Por qué falló esta opción?' : 'Pista del tema'),
    payload.step2Label ?? 'Mira un ejemplo similar',
    payload.step3Label ?? '¡Tu segundo intento!',
  ];

  const clearScheduled = useCallback(() => {
    if (stepDelayRef.current) {
      clearTimeout(stepDelayRef.current);
      stepDelayRef.current = null;
    }
  }, []);

  const playStep2Audio = useCallback(
    (token: number, slow: boolean, autoAdvance: boolean) => {
      const muted = voiceMutedRef.current;
      setActiveStep(2);
      setEnDone(false);
      setEnWordIdx(0);
      setIsSpeaking(!muted);

      speakEnglish(payload.example.en, {
        slow,
        muted,
        onStart: () => {
          if (runTokenRef.current !== token) return;
          setIsSpeaking(!voiceMutedRef.current);
        },
        onWordIndex: (idx) => {
          if (runTokenRef.current !== token) return;
          setEnWordIdx(idx);
        },
        onEnd: () => {
          if (runTokenRef.current !== token) return;
          setIsSpeaking(false);
          setEnDone(true);
          if (autoAdvance) {
            stepDelayRef.current = setTimeout(() => {
              if (runTokenRef.current !== token) return;
              setActiveStep(3);
            }, 350);
          }
        },
      });
    },
    [payload.example.en]
  );

  const startStagePlayback = useCallback(
    (fromStep: 1 | 2 | 3 = 1, slow = false) => {
      clearScheduled();
      stopSpeech();
      runTokenRef.current += 1;
      const token = runTokenRef.current;
      const muted = voiceMutedRef.current;

      if (fromStep === 1) {
        setActiveStep(1);
        setEsDone(false);
        setEnDone(false);
        setEsWordIdx(0);
        setEnWordIdx(-1);
        setIsSpeaking(!muted);

        speakSpanish(payload.explanationEs, {
          muted,
          onStart: () => {
            if (runTokenRef.current !== token) return;
            setIsSpeaking(!voiceMutedRef.current);
          },
          onWordIndex: (idx) => {
            if (runTokenRef.current !== token) return;
            setEsWordIdx(idx);
          },
          onEnd: () => {
            if (runTokenRef.current !== token) return;
            setIsSpeaking(false);
            setEsDone(true);
            stepDelayRef.current = setTimeout(() => {
              if (runTokenRef.current !== token) return;
              playStep2Audio(token, slow, true);
            }, 250);
          },
        });
      } else if (fromStep === 2) {
        setEsDone(true);
        playStep2Audio(token, slow, true);
      } else {
        setEsDone(true);
        setEnDone(true);
        setIsSpeaking(false);
        setActiveStep(3);
      }
    },
    [clearScheduled, payload.explanationEs, playStep2Audio]
  );

  // Sync with global mute changes without restarting playback
  useEffect(() => {
    voiceMutedRef.current = soundMuted;
    setVoiceMuted(soundMuted);
    if (soundMuted) {
      stopSpeech();
      setIsSpeaking(false);
    }
  }, [soundMuted]);

  // Auto-play sequence whenever a new payload arrives
  useEffect(() => {
    startStagePlayback(1, false);
    return () => {
      runTokenRef.current += 1;
      clearScheduled();
      stopSpeech();
    };
  }, [payload, startStagePlayback, clearScheduled]);

  const handleToggleMute = () => {
    const nextMuted = !voiceMutedRef.current;
    voiceMutedRef.current = nextMuted;
    setVoiceMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
      setIsSpeaking(false);
    }
  };

  const handlePlaySlowEnglish = () => {
    setSlowMode(true);
    clearScheduled();
    stopSpeech();
    runTokenRef.current += 1;
    const token = runTokenRef.current;
    setEsDone(true);
    playStep2Audio(token, true, false);
  };

  const containerTheme = isError
    ? 'border-rose-300 bg-rose-50/90 text-rose-950'
    : 'border-amber-300 bg-amber-50/90 text-amber-950';

  return (
    <section
      data-testid="beto-mini-video-stage"
      data-active-step={activeStep}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-2xl border-2 p-4 sm:p-5 space-y-4 shadow-xs ${containerTheme}`}
    >
      {/* Top Theater Header: Animated Beto + Title + Replay/Mute Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AnimatedBetoActor mood={isError ? 'error' : 'hint'} speaking={isSpeaking} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              {isError ? (
                <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" aria-hidden="true" />
              ) : (
                <Lightbulb className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
              )}
              <span className={isError ? 'text-rose-800' : 'text-amber-800'}>
                {payload.titleEs}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">
              {isSpeaking
                ? 'Beto te está explicando con voz sincronizada...'
                : activeStep === 3
                  ? '¡Listo! Ya viste la pista y el ejemplo. Inténtalo ahora.'
                  : 'Mini-video guía de Beto · Paso a paso'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSlowMode(false);
              startStagePlayback(1, false);
            }}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
            <span>Repetir</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={voiceMuted}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            {voiceMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            )}
            <span>{voiceMuted ? 'Activar voz' : 'Silenciar'}</span>
          </button>
        </div>
      </div>

      {/* 3-Step Visual Progress Bar */}
      <nav aria-label="Pasos de la explicación de Beto" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {([1, 2, 3] as const).map((stepNum) => {
          const isCurrent = activeStep === stepNum;
          const isCompleted = activeStep > stepNum;
          return (
            <button
              key={stepNum}
              type="button"
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => startStagePlayback(stepNum, slowMode)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                isCurrent
                  ? 'border-sky-500 bg-sky-600 text-white shadow-xs'
                  : isCompleted
                    ? 'border-emerald-300 bg-emerald-100/80 text-emerald-950 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                  isCurrent
                    ? 'bg-white text-sky-700'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stepNum}
              </span>
              <span className="leading-snug">
                Paso {stepNum}: {stepLabels[stepNum - 1]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Stage Body: Wrong Marker + Karaoke Spanish + Animated SVG Scene + Model Whiteboard */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          {payload.wrongPartEs && (
            <div className="rounded-xl border border-rose-300 bg-white px-3.5 py-2.5 text-sm font-bold text-rose-900">
              {payload.wrongPartEs}
            </div>
          )}

          {/* Step 1 Karaoke Spanish Explanation */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
            <p className="text-[11px] font-extrabold text-amber-800">
              Paso 1 · Explicación de Beto (lectura sincronizada)
            </p>
            <p data-testid="karaoke-es-text" className="text-sm font-semibold text-slate-900">
              <KaraokeText
                text={payload.explanationEs}
                activeWordIdx={activeStep === 1 ? esWordIdx : -1}
                highlightAll={esDone || activeStep > 1}
                tone="es"
              />
            </p>
            {payload.hintEs && (
              <p className="text-xs font-medium text-slate-600">
                Clave rápida: {payload.hintEs}
              </p>
            )}
          </div>

          {/* Step 2 Karaoke English Model Example */}
          <div className="rounded-xl border border-sky-200 bg-white p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold text-sky-800">
                Paso 2 · Ejemplo modelo diferente en inglés
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startStagePlayback(2, false)}
                  aria-label={`Escuchar ejemplo modelo: ${payload.example.en}`}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900 hover:bg-sky-100"
                >
                  <Volume2 className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                  <span>Escuchar</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaySlowEnglish}
                  aria-label={`Escuchar ejemplo modelo despacio: ${payload.example.en}`}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Turtle className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Lento</span>
                </button>
              </div>
            </div>

            <p data-testid="karaoke-en-text" className="font-display text-base font-bold text-slate-900 sm:text-lg">
              <KaraokeText
                text={payload.example.en}
                activeWordIdx={activeStep === 2 ? enWordIdx : -1}
                highlightAll={enDone || activeStep === 3}
                tone="en"
              />
            </p>
            <p className="text-xs font-medium text-slate-600">{payload.example.es}</p>
          </div>
        </div>

        {/* Right Column: Topic-Specific Animated SVG Scene + Tailored Whiteboard */}
        <div className="lg:col-span-5 space-y-3">
          <AnimatedPedagogicalScene theme={payload.sceneTheme} activeStep={activeStep} />

          {/* Exercise-Type Specific Visual Whiteboard */}
          {payload.exerciseCategory === 'multiple_choice' && payload.visualComparison ? (
            <div
              data-testid="visual-comparison-clue"
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
            >
              <p className="text-[11px] font-extrabold text-slate-600">
                Comparación visual · ¿Por qué es distinta?
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-2">
                  <span className="block text-2xl" aria-hidden="true">
                    {payload.visualComparison.chosenEmoji}
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-rose-900 truncate">
                    {payload.visualComparison.chosenLabel}
                  </p>
                  <p className="text-[10px] font-medium text-rose-700 truncate">
                    {payload.visualComparison.chosenMeaningEs}
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2">
                  <span className="block text-2xl" aria-hidden="true">
                    {payload.visualComparison.targetClueEmoji}
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-emerald-900 truncate">
                    {payload.visualComparison.targetClueLabel}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-700">
                    Pista del tema
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              data-testid="grammar-blocks-whiteboard"
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
            >
              <p className="text-[11px] font-extrabold text-slate-600">
                Pizarra animada · Estructura por colores
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
                {payload.grammarBlocks.map((block, idx) => {
                  const style = BLOCK_STYLES[block.role];
                  return (
                    <div
                      key={`${block.role}-${idx}`}
                      style={{ animationDelay: `${idx * 140}ms` }}
                      className={`animate-pop-block flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 ${style.card}`}
                    >
                      <div className="min-w-0">
                        <span className={`block text-[10px] font-extrabold ${style.badge}`}>
                          {block.role}
                        </span>
                        <span className="block font-display text-xs font-extrabold truncate">
                          {block.textEn}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 text-right truncate">
                        {block.textEs}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 Banner + Optional Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white/90 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>
            {activeStep === 3
              ? 'Paso 3 activo: ¡Ya puedes realizar tu segundo intento arriba!'
              : 'Puedes hacer clic en cualquiera de los 3 pasos o probar tu respuesta cuando estés listo.'}
          </span>
        </div>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onAction();
            }}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl border-b-4 border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:translate-y-0.5"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
};
