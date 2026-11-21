import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Square,
  Turtle,
  Volume2,
} from 'lucide-react';
import type { OralLevel, SpeakingChallenge } from '../../types/curriculum';
import {
  getPreAnswerHint,
  type WeekMistakeReviewItem,
} from '../../utils/pedagogicalFeedback';
import { evaluateSpokenAttempt, type SpeakingEvaluation } from '../../utils/speakingEvaluator';
import { playRetryTone, playSuccessChime, playTapSound } from '../../utils/soundFx';
import { speakEnglish, stopSpeech } from '../../utils/speech';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import { CelebrationBurst } from '../CelebrationBurst';
import { VolumetricBetoSvg } from '../MascotGuide';

interface SpeakingGameProps {
  challenge: SpeakingChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onPass?: (messageEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstanceLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstanceLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

const ORAL_LEVEL_META: Record<
  OralLevel,
  { titleEs: string; badgeTone: string; barTone: string }
> = {
  1: {
    titleEs: 'Palabras y frases cortas',
    badgeTone: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    barTone: 'bg-emerald-500',
  },
  2: {
    titleEs: 'Frases simples de convivencia',
    badgeTone: 'border-sky-300 bg-sky-50 text-sky-900',
    barTone: 'bg-sky-500',
  },
  3: {
    titleEs: 'Oraciones completas · Naturaleza',
    badgeTone: 'border-amber-300 bg-amber-50 text-amber-900',
    barTone: 'bg-amber-500',
  },
  4: {
    titleEs: 'Mini-reto conversacional con Beto',
    badgeTone: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    barTone: 'bg-indigo-500',
  },
};

export const SpeakingGame: React.FC<SpeakingGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onPass,
}) => {
  const recognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const [micUnavailable, setMicUnavailable] = useState<boolean>(() => !recognitionCtor);
  const [micReasonEs, setMicReasonEs] = useState<string>(
    recognitionCtor
      ? ''
      : 'Este navegador no incluye reconocimiento de voz nativo para inglés.'
  );

  const [showTranslation, setShowTranslation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speakingRateMode, setSpeakingRateMode] = useState<'normal' | 'slow' | 'question' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [fallbackCompleted, setFallbackCompleted] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const evaluationCardRef = useRef<HTMLDivElement | null>(null);

  const levelMeta = ORAL_LEVEL_META[challenge.oralLevel];

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  // Detect computers with 0 audio input devices when browser exposes enumerateDevices
  useEffect(() => {
    if (!recognitionCtor) {
      setMicUnavailable(true);
      return;
    }
    let cancelled = false;
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (cancelled) return;
          const hasAudioInput = devices.some((d) => d.kind === 'audioinput');
          if (!hasAudioInput) {
            setMicUnavailable(true);
            setMicReasonEs('No detectamos un micrófono conectado en este computador.');
          }
        })
        .catch(() => {
          // Ignore permission restrictions until user clicks mic
        });
    }
    return () => {
      cancelled = true;
    };
  }, [recognitionCtor]);

  // Cleanup recognition & speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors
        }
        recognitionRef.current = null;
      }
      stopSpeech();
    };
  }, []);

  const handlePlayPhrase = (slow: boolean) => {
    playTapSound(soundMuted);
    const mode = slow ? 'slow' : 'normal';
    speakEnglish(challenge.targetPhraseEn, {
      slow,
      rate: slow ? 0.7 : undefined,
      muted: soundMuted,
      onStart: () => setSpeakingRateMode(mode),
      onEnd: () => setSpeakingRateMode((prev) => (prev === mode ? null : prev)),
    });
  };

  const handlePlayBetoQuestion = () => {
    if (!challenge.betoQuestionEn) return;
    playTapSound(soundMuted);
    speakEnglish(challenge.betoQuestionEn, {
      muted: soundMuted,
      onStart: () => setSpeakingRateMode('question'),
      onEnd: () => setSpeakingRateMode((prev) => (prev === 'question' ? null : prev)),
    });
  };

  const finalizeTranscript = (transcriptText: string) => {
    const cleanText = transcriptText.trim();
    if (!cleanText) {
      setIsListening(false);
      setLiveTranscript('');
      return;
    }

    const result = evaluateSpokenAttempt(challenge.targetPhraseEn, cleanText);
    setEvaluation(result);
    setAttempts((prev) => prev + 1);
    setLiveTranscript(cleanText);

    if (result.passed) {
      playSuccessChime(soundMuted);
      onPass?.(result.betoMessageEs);
    } else {
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }

    requestAnimationFrame(() => {
      evaluationCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleStartListening = () => {
    if (!recognitionCtor) {
      setMicUnavailable(true);
      return;
    }

    playTapSound(soundMuted);
    stopSpeech();
    setShowHint(false);
    setEvaluation(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';

    try {
      const rec = new recognitionCtor();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let finalJoined = '';
        let interimJoined = '';
        let bestCandidate = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          if (res.isFinal) {
            // Pick highest-scoring alternative against target phrase
            let bestAlt = res[0].transcript;
            let bestScore = evaluateSpokenAttempt(challenge.targetPhraseEn, bestAlt).goodCount;
            for (let a = 1; a < res.length; a++) {
              const altText = res[a]?.transcript ?? '';
              const altScore = evaluateSpokenAttempt(challenge.targetPhraseEn, altText).goodCount;
              if (altScore > bestScore) {
                bestScore = altScore;
                bestAlt = altText;
              }
            }
            finalJoined += `${bestAlt} `;
          } else {
            interimJoined += `${res[0].transcript} `;
          }
        }

        finalTranscriptRef.current = finalJoined.trim();
        interimTranscriptRef.current = interimJoined.trim();
        bestCandidate = `${finalJoined} ${interimJoined}`.trim();
        setLiveTranscript(bestCandidate);
      };

      rec.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed' ||
          event.error === 'audio-capture' ||
          event.error === 'network'
        ) {
          setMicUnavailable(true);
          setMicReasonEs(
            event.error === 'not-allowed' || event.error === 'service-not-allowed'
              ? 'El permiso del micrófono está desactivado en este equipo.'
              : 'No pudimos conectar con el micrófono del computador.'
          );
        } else if (event.error === 'no-speech') {
          playRetryTone(soundMuted);
          setLiveTranscript('');
          setMicReasonEs('No se escuchó voz. Acércate al micrófono o usa el modo sin micrófono.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        const captured = (finalTranscriptRef.current || interimTranscriptRef.current).trim();
        if (captured) {
          finalizeTranscript(captured);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      setMicUnavailable(true);
      setMicReasonEs('No fue posible iniciar el micrófono en este dispositivo.');
    }
  };

  const handleStopListening = () => {
    playTapSound(soundMuted);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  const handleFallbackComplete = () => {
    playSuccessChime(soundMuted);
    setFallbackCompleted(true);
    setTimeout(() => {
      onComplete(true);
    }, 350);
  };

  const showCelebration = Boolean(evaluation?.passed || fallbackCompleted);

  return (
    <div className="relative space-y-5" data-testid="speaking-game-stage">
      <CelebrationBurst active={showCelebration} variant="confetti" />

      {/* Top Header + Visual Oral Level 1–4 Meter */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              data-testid="speaking-level-indicator"
              className={`inline-flex items-center gap-2 rounded-xl border border-b-[3px] px-3 py-1 text-xs font-extrabold ${levelMeta.badgeTone}`}
            >
              <span>Nivel Oral {challenge.oralLevel}</span>
              <span className="flex items-center gap-1" aria-hidden="true">
                {([1, 2, 3, 4] as const).map((lvl) => (
                  <span
                    key={lvl}
                    className={`h-2.5 w-2 rounded-xs transition-colors ${
                      lvl <= challenge.oralLevel ? levelMeta.barTone : 'bg-slate-300/70'
                    }`}
                  />
                ))}
              </span>
            </span>
            <span className="text-xs font-bold text-slate-600">{levelMeta.titleEs}</span>
          </div>

          <h2 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.promptEs}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!evaluation?.passed && (
            <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
          )}
          <button
            type="button"
            onClick={() => {
              playTapSound(soundMuted);
              setShowTranslation((v) => !v);
            }}
            className="btn-3d inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <span>{showTranslation ? 'Ocultar español' : 'Ver traducción'}</span>
          </button>
        </div>
      </div>

      {showHint && !evaluation?.passed && (
        <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />
      )}

      {/* Level 4 Mini-Conversational Question from Beto */}
      {challenge.betoQuestionEn && (
        <div
          data-testid="speaking-beto-question"
          className="rounded-2xl border-2 border-b-[5px] border-indigo-200 border-b-indigo-300 bg-gradient-to-b from-indigo-50/90 to-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <VolumetricBetoSvg size={50} mood="happy" speaking={speakingRateMode === 'question'} />
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-indigo-700">
                Beto te pregunta en inglés:
              </p>
              <p className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                &ldquo;{challenge.betoQuestionEn}&rdquo;
              </p>
              {showTranslation && challenge.betoQuestionEs && (
                <p className="text-xs font-medium text-slate-600">{challenge.betoQuestionEs}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlayBetoQuestion}
            className="btn-3d inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-b-4 border-indigo-300 border-b-indigo-400 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-50 shrink-0 whitespace-nowrap"
          >
            <Volume2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />
            <span>Escuchar pregunta</span>
          </button>
        </div>
      )}

      {/* PASO 1: Listen & Prepare Card */}
      <div className="panel-3d rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-sky-800">
            Paso 1 · Escucha y prepárate
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {challenge.betoQuestionEn ? 'Tu respuesta modelo' : 'Frase para pronunciar'}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="cube-3d flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50 to-sky-100 text-4xl"
            aria-hidden="true"
          >
            {challenge.emoji}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p
              data-testid="speaking-target-phrase"
              className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl leading-snug"
            >
              {challenge.targetPhraseEn}
            </p>
            {showTranslation && (
              <p className="text-sm font-medium text-slate-600">{challenge.translationEs}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handlePlayPhrase(false)}
            aria-label={`Escuchar normal: ${challenge.targetPhraseEn}`}
            className={`btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border-b-[5px] px-4 py-2 text-sm font-bold whitespace-nowrap ${
              speakingRateMode === 'normal'
                ? 'border-sky-800 bg-gradient-to-b from-sky-500 to-sky-600 text-white'
                : 'border-sky-700 bg-gradient-to-b from-sky-400 to-sky-500 text-white hover:to-sky-600'
            }`}
          >
            <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Escuchar normal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayPhrase(true)}
            aria-label={`Escuchar despacio a 0.7x: ${challenge.targetPhraseEn}`}
            className={`btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-b-[5px] px-4 py-2 text-sm font-bold whitespace-nowrap ${
              speakingRateMode === 'slow'
                ? 'border-amber-500 border-b-amber-600 bg-amber-100 text-amber-950'
                : 'border-slate-300 border-b-slate-400 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Turtle className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>Escuchar despacio 🐢</span>
          </button>
        </div>
      </div>

      {/* PASO 2 & 3: Animated 3D Mic + Word-by-Word Feedback OR School PC Fallback */}
      {micUnavailable ? (
        <div
          data-testid="speaking-no-mic-fallback"
          className="rounded-2xl border-2 border-b-[6px] border-amber-300 border-b-amber-500 bg-gradient-to-b from-amber-50 to-white p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="cube-3d flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-amber-800">
              <MicOff className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-display text-base font-extrabold text-slate-900">
                Modo sin micrófono · Compatible con computadores escolares
              </p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {micReasonEs || 'El micrófono no está habilitado en este equipo.'} ¡No te preocupes!
                Escucha a Beto arriba y pronuncia la frase en voz alta en tu clase o en casa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {recognitionCtor && (
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundMuted);
                  setMicUnavailable(false);
                  setMicReasonEs('');
                }}
                className="text-xs font-bold text-sky-700 underline underline-offset-2 hover:text-sky-900"
              >
                Intentar activar micrófono de nuevo
              </button>
            )}

            <button
              type="button"
              data-testid="speaking-fallback-continue"
              onClick={handleFallbackComplete}
              className="btn-3d ml-auto inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-3 text-base font-bold text-white hover:to-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <span>Lo dije en voz alta (Continuar)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-3d rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-emerald-800">
              Paso 2 · ¡Tu turno de hablar en inglés!
            </span>
            <button
              type="button"
              data-testid="speaking-no-mic-toggle"
              onClick={() => {
                playTapSound(soundMuted);
                setMicUnavailable(true);
                setMicReasonEs('Activaste el modo de práctica sin micrófono.');
              }}
              className="text-xs font-bold text-slate-500 underline underline-offset-2 hover:text-slate-800"
            >
              ¿Sin micrófono en este PC?
            </button>
          </div>

          {/* 3D Animated Microphone Stage */}
          <div className="flex flex-col items-center justify-center py-2 text-center space-y-4">
            <div className="relative flex items-center justify-center">
              {isListening && (
                <>
                  <span
                    aria-hidden="true"
                    className="animate-mic-wave pointer-events-none absolute h-24 w-24 rounded-full border-4 border-rose-400/70"
                  />
                  <span
                    aria-hidden="true"
                    className="animate-mic-wave-delayed pointer-events-none absolute h-24 w-24 rounded-full border-4 border-sky-400/60"
                  />
                </>
              )}

              <button
                type="button"
                data-testid="speaking-mic-button"
                onClick={isListening ? handleStopListening : handleStartListening}
                aria-label={isListening ? 'Detener micrófono' : 'Presionar micrófono y hablar en inglés'}
                className={`btn-3d relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-b-[7px] text-white ${
                  isListening
                    ? 'border-rose-700 border-b-rose-900 bg-gradient-to-b from-rose-500 to-rose-600 shadow-[0_14px_28px_-6px_rgba(225,29,72,0.5)]'
                    : 'border-emerald-700 border-b-emerald-900 bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_14px_28px_-6px_rgba(16,185,129,0.45)]'
                }`}
              >
                {isListening ? (
                  <Square className="h-8 w-8 fill-white" aria-hidden="true" />
                ) : (
                  <Mic className="h-9 w-9" aria-hidden="true" />
                )}
              </button>
            </div>

            <p className="text-sm font-bold text-slate-700">
              {isListening
                ? 'Escuchando en inglés... habla claro y toca para terminar'
                : 'Toca el micrófono 3D y pronuncia la frase'}
            </p>

            {micReasonEs && !isListening && !evaluation && (
              <p className="text-xs font-semibold text-amber-800">{micReasonEs}</p>
            )}

            {(isListening || liveTranscript) && !evaluation && (
              <div className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">
                {liveTranscript || 'Escuchando tu voz...'}
              </div>
            )}
          </div>

          {/* PASO 3: Word-by-Word Friendly Feedback */}
          {evaluation && (
            <div
              ref={evaluationCardRef}
              data-testid="speaking-evaluation-card"
              className={`rounded-2xl border-2 border-b-[5px] p-4 sm:p-5 space-y-4 ${
                evaluation.passed
                  ? 'border-emerald-300 border-b-emerald-500 bg-gradient-to-b from-emerald-50/90 to-white'
                  : 'border-amber-300 border-b-amber-500 bg-gradient-to-b from-amber-50/90 to-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <VolumetricBetoSvg
                  size={48}
                  mood={evaluation.passed ? 'celebrating' : 'encouraging'}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-600">
                    Paso 3 · Resultado palabra por palabra ({evaluation.goodCount}/{evaluation.totalCount})
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {evaluation.betoMessageEs}
                  </p>
                </div>
              </div>

              {/* Word-by-word green / amber chips */}
              <div
                data-testid="speaking-word-chips"
                className="flex flex-wrap gap-2"
                aria-label="Evaluación palabra por palabra"
              >
                {evaluation.words.map((w) => (
                  <span
                    key={`${w.index}-${w.displayWord}`}
                    data-word-status={w.status}
                    className={`inline-flex items-center gap-1 rounded-xl border-2 border-b-[4px] px-3 py-1.5 font-display text-sm font-extrabold ${
                      w.status === 'good'
                        ? 'border-emerald-400 border-b-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-amber-400 border-b-amber-600 bg-amber-50 text-amber-950'
                    }`}
                  >
                    <span>{w.displayWord}</span>
                    {w.status === 'good' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    )}
                  </span>
                ))}
              </div>

              <p className="text-xs font-medium text-slate-600">
                Lo que escuchó el micrófono: <span className="font-bold text-slate-900">&ldquo;{liveTranscript}&rdquo;</span>
              </p>

              {/* Action buttons: Try again / Effort XP advance after 2+ attempts / Continue */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                {!evaluation.passed && (
                  <button
                    type="button"
                    onClick={handleStartListening}
                    className="btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4 text-sky-700" aria-hidden="true" />
                    <span>Intentar de nuevo</span>
                  </button>
                )}

                {!evaluation.passed && attempts >= 2 && (
                  <button
                    type="button"
                    data-testid="speaking-effort-continue"
                    onClick={() => {
                      playSuccessChime(soundMuted);
                      onComplete(false);
                    }}
                    className="btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border-b-4 border-sky-800 bg-gradient-to-b from-sky-500 to-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:to-sky-700"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>Avanzar por esfuerzo (+XP)</span>
                  </button>
                )}

                {evaluation.passed && (
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound(soundMuted);
                      onComplete(attempts === 1);
                    }}
                    className="btn-3d inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-3 text-base font-bold text-white hover:to-emerald-700"
                  >
                    <span>Continuar</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
