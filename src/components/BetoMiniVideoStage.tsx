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
import { VolumetricBetoSvg } from './MascotGuide';
import { playBetoCheerSound, playTapSound } from '../utils/soundFx';

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
  muted: boolean;
  onCheer?: () => void;
}> = ({ mood, speaking, muted, onCheer }) => {
  const [jumping, setJumping] = useState(false);

  const handleTap = () => {
    playBetoCheerSound(muted);
    setJumping(true);
    onCheer?.();
    setTimeout(() => setJumping(false), 680);
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      data-testid="interactive-beto-button"
      aria-label="Saludar a Beto el Oso Guía"
      title="¡Toca a Beto para recibir ánimo!"
      className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-b-4 border-amber-300 bg-gradient-to-b from-white to-amber-50 shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-600"
    >
      <VolumetricBetoSvg
        size={56}
        mood={jumping ? 'celebrating' : mood === 'hint' ? 'happy' : 'encouraging'}
        speaking={speaking}
        jumping={jumping}
      />
    </button>
  );
};

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
  const [betoCheered, setBetoCheered] = useState<boolean>(false);

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
    ? 'border-rose-300 border-b-[6px] border-b-rose-400 bg-gradient-to-b from-rose-50 to-rose-100/80 text-rose-950 shadow-[0_14px_28px_-12px_rgba(225,29,72,0.22)]'
    : 'border-amber-300 border-b-[6px] border-b-amber-400 bg-gradient-to-b from-amber-50 to-amber-100/80 text-amber-950 shadow-[0_14px_28px_-12px_rgba(217,119,6,0.2)]';

  return (
    <section
      data-testid="beto-mini-video-stage"
      data-active-step={activeStep}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-3xl border-2 p-4 sm:p-5 space-y-4 ${containerTheme}`}
    >
      {/* Top Theater Header: Animated Beto + Title + Replay/Mute Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AnimatedBetoActor
            mood={isError ? 'error' : 'hint'}
            speaking={isSpeaking}
            muted={voiceMuted}
            onCheer={() => {
              setBetoCheered(true);
              setTimeout(() => setBetoCheered(false), 2400);
            }}
          />
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
              {betoCheered
                ? '¡Ánimo explorador! Con calma lo vas a lograr.'
                : isSpeaking
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
              playTapSound(voiceMuted);
              setSlowMode(false);
              startStagePlayback(1, false);
            }}
            className="btn-3d inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
            <span>Repetir</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={voiceMuted}
            className="btn-3d inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
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
              onClick={() => {
                playTapSound(voiceMuted);
                startStagePlayback(stepNum, slowMode);
              }}
              className={`btn-3d flex items-center gap-2 rounded-xl border border-b-4 px-3 py-2 text-left text-xs font-bold transition-colors ${
                isCurrent
                  ? 'border-sky-700 bg-sky-600 text-white'
                  : isCompleted
                    ? 'border-emerald-400 bg-emerald-100/90 text-emerald-950 hover:bg-emerald-100'
                    : 'border-slate-300 bg-white/95 text-slate-700 hover:bg-white'
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
          <div className="panel-3d rounded-2xl p-3.5 space-y-1.5">
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
          <div className="panel-3d rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold text-sky-800">
                Paso 2 · Ejemplo modelo diferente en inglés
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(voiceMuted);
                    startStagePlayback(2, false);
                  }}
                  aria-label={`Escuchar ejemplo modelo: ${payload.example.en}`}
                  className="btn-3d inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-b-[3px] border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900 hover:bg-sky-100"
                >
                  <Volume2 className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                  <span>Escuchar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(voiceMuted);
                    handlePlaySlowEnglish();
                  }}
                  aria-label={`Escuchar ejemplo modelo despacio: ${payload.example.en}`}
                  className="btn-3d inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-b-[3px] border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
              playTapSound(voiceMuted);
              stopSpeech();
              onAction();
            }}
            className="btn-3d inline-flex min-h-[42px] items-center justify-center rounded-xl border-b-4 border-slate-950 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
};
