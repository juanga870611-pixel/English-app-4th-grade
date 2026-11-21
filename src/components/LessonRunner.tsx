import React, { useCallback, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, Mic, Play, RotateCcw, Star, Trophy, Unlock, Volume2 } from 'lucide-react';
import type { WeekLesson } from '../types/curriculum';
import type { WeekMistakeReviewItem } from '../utils/pedagogicalFeedback';
import { PASS_ACCURACY_THRESHOLD } from '../utils/progress';
import { playTapSound, playVictoryFanfare } from '../utils/soundFx';
import { speakEnglish, stopSpeech } from '../utils/speech';
import { CelebrationBurst } from './CelebrationBurst';
import { MascotGuide, VolumetricTrophySvg, type MascotMood } from './MascotGuide';
import { ListeningGame } from './games/ListeningGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { ReadingGame } from './games/ReadingGame';
import { WordSearchGame } from './games/WordSearchGame';
import { WordOrderGame } from './games/WordOrderGame';
import { MicroStoryGame } from './games/MicroStoryGame';
import { ArcadeGame } from './games/ArcadeGame';
import { SpeakingGame } from './games/SpeakingGame';

interface LessonRunnerProps {
  week: WeekLesson;
  mode?: 'full' | 'speaking_only';
  soundMuted: boolean;
  hasNextPlayableWeek: boolean;
  onExit: () => void;
  onSwitchToFullWeek?: () => void;
  onFinishWeek: (accuracy: number) => {
    starsEarned: 1 | 2 | 3;
    xpEarned: number;
    passed: boolean;
    unlockedNextWeek: boolean;
  };
  onGoToNextWeek: () => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({
  week,
  mode = 'full',
  soundMuted,
  hasNextPlayableWeek,
  onExit,
  onSwitchToFullWeek,
  onFinishWeek,
  onGoToNextWeek,
}) => {
  const activeChallenges =
    mode === 'speaking_only'
      ? week.challenges.filter((c) => c.type === 'speaking')
      : week.challenges;

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [mistakesLog, setMistakesLog] = useState<WeekMistakeReviewItem[]>([]);
  const [mascotState, setMascotState] = useState<{
    mood: MascotMood;
    message: string;
    subMessage?: string;
  }>({
    mood: 'neutral',
    message:
      mode === 'speaking_only'
        ? `¡Práctica Oral de la Semana ${week.weekNumber} (Nivel Oral ${week.moduleId})!`
        : `¡Vamos con la Semana ${week.weekNumber}: ${week.titleEs}!`,
    subMessage: week.grammarFocus,
  });

  const [summary, setSummary] = useState<{
    accuracy: number;
    starsEarned: 1 | 2 | 3;
    xpEarned: number;
    passed: boolean;
    unlockedNextWeek: boolean;
  } | null>(null);
  const [speakingOnlyDone, setSpeakingOnlyDone] = useState(false);

  const totalChallenges = activeChallenges.length;
  const currentChallenge = activeChallenges[challengeIdx];

  const handleMistake = useCallback((hintEs: string) => {
    setMascotState({
      mood: 'encouraging',
      message: '¡Casi! Lee la explicación de Beto abajo e inténtalo de nuevo.',
      subMessage: hintEs,
    });
  }, []);

  const handleSpeakingPass = useCallback((messageEs: string) => {
    setMascotState({
      mood: 'celebrating',
      message: messageEs,
      subMessage: 'Toca «Continuar» para avanzar al siguiente reto.',
    });
  }, []);

  const handleRecordMistakeDetail = useCallback((item: WeekMistakeReviewItem) => {
    setMistakesLog((prev) => {
      // Keep the latest distinct mistake per challengeId so the final review card stays focused and readable
      const filtered = prev.filter((m) => m.challengeId !== item.challengeId);
      return [...filtered, item];
    });
  }, []);

  const handleStepComplete = (firstTry: boolean) => {
    stopSpeech();
    const nextFirstTryCount = firstTryCount + (firstTry ? 1 : 0);
    setFirstTryCount(nextFirstTryCount);

    if (challengeIdx + 1 < totalChallenges) {
      setChallengeIdx((i) => i + 1);
      setMascotState({
        mood: 'happy',
        message: firstTry
          ? '¡Muy bien! Lo lograste al primer intento.'
          : '¡Bien hecho! Seguimos con el siguiente reto.',
        subMessage: `Reto ${challengeIdx + 2} de ${totalChallenges}`,
      });
    } else if (mode === 'speaking_only') {
      playVictoryFanfare(soundMuted);
      setSpeakingOnlyDone(true);
    } else {
      const accuracy = Math.round(
        50 + (nextFirstTryCount / Math.max(1, totalChallenges)) * 50
      );
      playVictoryFanfare(soundMuted);
      const outcome = onFinishWeek(accuracy);
      setSummary({
        accuracy,
        ...outcome,
      });
    }
  };

  const handleRestartWeek = () => {
    stopSpeech();
    setChallengeIdx(0);
    setFirstTryCount(0);
    setMistakesLog([]);
    setSummary(null);
    setSpeakingOnlyDone(false);
    setMascotState({
      mood: 'neutral',
      message:
        mode === 'speaking_only'
          ? `¡Vamos a practicar Speaking de la Semana ${week.weekNumber} otra vez!`
          : `¡Nuevo intento en la Semana ${week.weekNumber}! Tú puedes.`,
      subMessage: week.grammarFocus,
    });
  };

  // Summary Screen after quick Speaking-only practice
  if (speakingOnlyDone) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div
          data-testid="speaking-summary-screen"
          className="panel-3d relative rounded-3xl p-6 text-center sm:p-8 space-y-6"
        >
          <CelebrationBurst active variant="confetti" />
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-b-4 border-sky-300 bg-gradient-to-b from-sky-50 to-sky-100 shadow-inner">
            <Mic className="h-12 w-12 text-sky-600" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-bold text-sky-700">
              Speaking · Nivel Oral {week.moduleId} · Semana {week.weekNumber}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              ¡Excelente práctica en voz alta!
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Completaste los {totalChallenges} retos orales de «{week.titleEs}».
            </p>
          </div>

          <MascotGuide
            soundMuted={soundMuted}
            mood="celebrating"
            message="¡Tu pronunciación mejora cada vez que hablas en inglés!"
            subMessage="Recuerda completar también la semana completa para sumar tu 80% y desbloquear la siguiente."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                onExit();
              }}
              className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-b-[5px] border-slate-300 border-b-slate-400 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Volver al mapa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                handleRestartWeek();
              }}
              className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-b-[5px] border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 px-5 py-3 text-sm font-bold text-white hover:to-sky-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Practicar Speaking otra vez</span>
            </button>

            {onSwitchToFullWeek && (
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundMuted);
                  onSwitchToFullWeek();
                }}
                className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white hover:to-emerald-700"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Hacer semana completa</span>
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Summary Screen after completing all challenges
  if (summary) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="panel-3d relative rounded-3xl p-6 text-center sm:p-8 space-y-6">
          <CelebrationBurst active={summary.passed} variant="confetti" />
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-b-4 border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 shadow-inner">
            <VolumetricTrophySvg size={64} />
          </div>

          <div>
            <p className="text-xs font-bold text-emerald-700">
              Semana {week.weekNumber} completada
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {summary.passed ? '¡Excelente trabajo!' : '¡Buen esfuerzo!'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{week.titleEs}</p>
          </div>

          <div className="flex justify-center gap-3" aria-label={`Ganaste ${summary.starsEarned} de 3 estrellas`}>
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-12 w-12 transition-transform ${
                  s <= summary.starsEarned
                    ? 'animate-medal-float fill-amber-400 text-amber-500 drop-shadow-[0_4px_8px_rgba(245,158,11,0.45)]'
                    : 'text-slate-200'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Precisión</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                {summary.accuracy}%
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-800">Puntos ganados</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-emerald-700 tabular-nums">
                +{summary.xpEarned} XP
              </p>
            </div>
          </div>

          {summary.unlockedNextWeek ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
              <Unlock className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                ¡Superaste el {PASS_ACCURACY_THRESHOLD}%! Desbloqueaste la Semana {week.weekNumber + 1} de inmediato.
              </span>
            </div>
          ) : week.weekNumber === 36 && summary.passed ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
              <Trophy className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>
                ¡Felicitaciones! Completaste las 36 semanas de 4° de Primaria. ¡Exporta tu código final para tu profe!
              </span>
            </div>
          ) : !summary.passed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
              Necesitas al menos {PASS_ACCURACY_THRESHOLD}% para desbloquear la siguiente semana. ¡Inténtalo de nuevo!
            </div>
          ) : null}

          <MascotGuide
            soundMuted={soundMuted}
            mood={summary.passed ? 'celebrating' : 'encouraging'}
            message={
              summary.passed
                ? '¡Beto está muy orgulloso de ti! Tu progreso ya se guardó.'
                : '¡Cada intento te hace más fuerte en inglés!'
            }
          />

          {/* Tarjeta de repaso comparando lo que respondió frente a la forma correcta */}
          {mistakesLog.length > 0 && (
            <section
              aria-label="Tarjeta de repaso de errores con Beto"
              className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-left space-y-4"
            >
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-amber-700 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                    Tarjeta de repaso con Beto ({mistakesLog.length})
                  </h2>
                  <p className="text-xs text-slate-600">
                    Compara lo que respondiste antes con la forma correcta y escucha cada ejemplo:
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mistakesLog.map((item) => (
                  <div
                    key={item.challengeId}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-slate-500">
                        {item.challengeTypeLabel}
                      </p>
                      <p className="text-sm font-bold text-slate-900">{item.promptSummaryEs}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                        <p className="text-[11px] font-bold text-rose-700">Lo que respondiste</p>
                        <p className="mt-0.5 text-sm font-bold text-rose-950">
                          {item.studentAnswerEs}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-[11px] font-bold text-emerald-700">Forma correcta</p>
                        <p className="mt-0.5 text-sm font-bold text-emerald-950">
                          {item.correctAnswerEs}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700">{item.explanationEs}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900">{item.example.en}</p>
                        <p className="text-[11px] text-slate-600">{item.example.es}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakEnglish(item.example.en)}
                        aria-label={`Escuchar ejemplo de repaso: ${item.example.en}`}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-bold text-sky-900 hover:bg-sky-50 shrink-0"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                onExit();
              }}
              className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-b-[5px] border-slate-300 border-b-slate-400 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Volver al mapa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                handleRestartWeek();
              }}
              className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-b-[5px] border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 px-5 py-3 text-sm font-bold text-white hover:to-sky-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Repetir semana</span>
            </button>

            {summary.passed && hasNextPlayableWeek && (
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundMuted);
                  onGoToNextWeek();
                }}
                className="btn-3d inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white hover:to-emerald-700"
              >
                <span>Ir a Semana {week.weekNumber + 1}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const progressPct = Math.round(((challengeIdx + 1) / totalChallenges) * 100);

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Lesson Top 3D Progress Strip */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            playTapSound(soundMuted);
            stopSpeech();
            onExit();
          }}
          aria-label="Salir al mapa de aprendizaje"
          className="btn-3d inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Salir</span>
        </button>

        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 tabular-nums">
            <span>
              Semana {week.weekNumber} · {mode === 'speaking_only' ? `Speaking (Nivel ${week.moduleId})` : week.titleEs}
            </span>
            <span>Reto {challengeIdx + 1} / {totalChallenges}</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full border border-slate-300 bg-slate-200/80 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Volumetric Mascot Feedback Banner */}
      <MascotGuide
        compact
        soundMuted={soundMuted}
        mood={mascotState.mood}
        message={mascotState.message}
        subMessage={mascotState.subMessage}
      />

      {/* Active Interactive 3D Game Stage */}
      <section className="panel-3d relative rounded-3xl p-5 sm:p-7">
        {currentChallenge.type === 'listening' && (
          <ListeningGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'memory' && (
          <MemoryMatchGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'reading' && (
          <ReadingGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'word_search' && (
          <WordSearchGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'word_order' && (
          <WordOrderGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'micro_story' && (
          <MicroStoryGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'arcade' && (
          <ArcadeGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
        {currentChallenge.type === 'speaking' && (
          <SpeakingGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            grammarFocus={week.grammarFocus}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
            onPass={handleSpeakingPass}
            onMistakeDetail={handleRecordMistakeDetail}
          />
        )}
      </section>
    </main>
  );
};
