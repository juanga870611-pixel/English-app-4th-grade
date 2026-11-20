import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Turtle, Volume2 } from 'lucide-react';
import type { MicroStoryChallenge } from '../../types/curriculum';
import { playRetryTone, playSuccessChime } from '../../utils/soundFx';
import { speakEnglish, stopSpeech } from '../../utils/speech';

interface MicroStoryGameProps {
  challenge: MicroStoryChallenge;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

const SCENE_TONES = {
  sky: 'bg-sky-50 border-sky-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  amber: 'bg-amber-50 border-amber-200',
  rose: 'bg-rose-50 border-rose-200',
};

export const MicroStoryGame: React.FC<MicroStoryGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [showSpanish, setShowSpanish] = useState(false);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Record<string, boolean>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [hadMistake, setHadMistake] = useState(false);

  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      stopSpeech();
    };
  }, [sceneIdx]);

  const currentScene = challenge.scenes[sceneIdx];
  const isLastScene = sceneIdx === challenge.scenes.length - 1;
  const checkpointPassed = !currentScene.checkpoint || Boolean(answeredCheckpoints[currentScene.id]);

  // Phrase-by-phrase narration with sequential sentence highlighting
  const playSceneNarration = (slow: boolean) => {
    stopSpeech();
    cancelledRef.current = false;

    const sentences = currentScene.narrationEn;
    let index = 0;

    const speakNext = () => {
      if (cancelledRef.current || index >= sentences.length) {
        setActiveSentenceIdx(null);
        return;
      }
      const currentIdx = index;
      setActiveSentenceIdx(currentIdx);
      speakEnglish(sentences[currentIdx], {
        slow,
        onEnd: () => {
          if (cancelledRef.current) return;
          index += 1;
          speakNext();
        },
      });
    };

    speakNext();
  };

  const handleAnswerCheckpoint = (optionId: string) => {
    if (!currentScene.checkpoint || answeredCheckpoints[currentScene.id]) return;
    setSelectedChoices((prev) => ({ ...prev, [currentScene.id]: optionId }));

    if (optionId === currentScene.checkpoint.correctOptionId) {
      playSuccessChime(soundMuted);
      setAnsweredCheckpoints((prev) => ({ ...prev, [currentScene.id]: true }));
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  const handleNextScene = () => {
    if (!checkpointPassed) return;
    stopSpeech();
    if (isLastScene) {
      onComplete(!hadMistake);
    } else {
      setSceneIdx((i) => i + 1);
      setActiveSentenceIdx(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-amber-700">
            Microcuento interactivo · Escena {sceneIdx + 1} de {challenge.scenes.length}
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.titleEs}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowSpanish((s) => !s)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <BookOpen className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <span>{showSpanish ? 'Ocultar español' : 'Traducir escena'}</span>
        </button>
      </div>

      {/* Scene Progress Dots */}
      <div className="flex items-center gap-2" aria-label="Progreso del cuento">
        {challenge.scenes.map((scene, idx) => (
          <div
            key={scene.id}
            className={`h-2.5 flex-1 rounded-full transition-colors ${
              idx < sceneIdx
                ? 'bg-emerald-500'
                : idx === sceneIdx
                  ? 'bg-amber-500'
                  : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Illustrated Story Scene */}
      <div className={`rounded-2xl border p-5 sm:p-6 ${SCENE_TONES[currentScene.bgTone]}`}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white text-5xl shadow-xs"
            aria-hidden="true"
          >
            {currentScene.emoji}
          </div>

          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              {currentScene.narrationEn.map((sentence, idx) => {
                const isHighlighted = activeSentenceIdx === idx;
                return (
                  <p
                    key={idx}
                    onClick={() => {
                      setActiveSentenceIdx(idx);
                      speakEnglish(sentence, {
                        onEnd: () => setActiveSentenceIdx(null),
                      });
                    }}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 font-display text-lg font-bold leading-snug transition-colors sm:text-xl ${
                      isHighlighted
                        ? 'bg-amber-200 text-slate-950'
                        : 'text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {sentence}
                  </p>
                );
              })}
            </div>

            {showSpanish && (
              <p className="rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-700">
                {currentScene.translationEs}
              </p>
            )}

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => playSceneNarration(false)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border-b-4 border-sky-700 bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>Narrar escena</span>
              </button>
              <button
                type="button"
                onClick={() => playSceneNarration(true)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <Turtle className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                <span>Despacio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Comprehension Checkpoint */}
      {currentScene.checkpoint && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
          <p className="text-xs font-bold text-emerald-700">Pregunta rápida del cuento</p>
          <p className="font-display text-lg font-bold text-slate-900">
            {currentScene.checkpoint.questionEs}
          </p>
          <div className="space-y-2">
            {currentScene.checkpoint.options.map((opt) => {
              const isSelected = selectedChoices[currentScene.id] === opt.id;
              const isCorrect =
                answeredCheckpoints[currentScene.id] &&
                opt.id === currentScene.checkpoint!.correctOptionId;
              const isWrong =
                isSelected && opt.id !== currentScene.checkpoint!.correctOptionId;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(answeredCheckpoints[currentScene.id])}
                  onClick={() => handleAnswerCheckpoint(opt.id)}
                  className={`flex min-h-[48px] w-full items-center rounded-xl border border-b-4 px-4 py-2.5 text-left text-sm font-bold transition-colors sm:text-base ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : isWrong
                        ? 'border-rose-400 bg-rose-50 text-rose-950'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scene Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={sceneIdx === 0}
          onClick={() => setSceneIdx((i) => Math.max(0, i - 1))}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          disabled={!checkpointPassed}
          onClick={handleNextScene}
          className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 text-base font-bold text-white hover:bg-emerald-700 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <span>{isLastScene ? 'Terminar cuento' : 'Siguiente escena'}</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
