import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Star, Trophy, Unlock } from 'lucide-react';
import type { WeekLesson } from '../types/curriculum';
import { PASS_ACCURACY_THRESHOLD } from '../utils/progress';
import { playVictoryFanfare } from '../utils/soundFx';
import { stopSpeech } from '../utils/speech';
import { MascotGuide, type MascotMood } from './MascotGuide';
import { ListeningGame } from './games/ListeningGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { ReadingGame } from './games/ReadingGame';
import { WordSearchGame } from './games/WordSearchGame';
import { WordOrderGame } from './games/WordOrderGame';
import { MicroStoryGame } from './games/MicroStoryGame';
import { ArcadeGame } from './games/ArcadeGame';

interface LessonRunnerProps {
  week: WeekLesson;
  soundMuted: boolean;
  hasNextPlayableWeek: boolean;
  onExit: () => void;
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
  soundMuted,
  hasNextPlayableWeek,
  onExit,
  onFinishWeek,
  onGoToNextWeek,
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [mascotState, setMascotState] = useState<{
    mood: MascotMood;
    message: string;
    subMessage?: string;
  }>({
    mood: 'neutral',
    message: `¡Vamos con la Semana ${week.weekNumber}: ${week.titleEs}!`,
    subMessage: week.grammarFocus,
  });

  const [summary, setSummary] = useState<{
    accuracy: number;
    starsEarned: 1 | 2 | 3;
    xpEarned: number;
    passed: boolean;
    unlockedNextWeek: boolean;
  } | null>(null);

  const totalChallenges = week.challenges.length;
  const currentChallenge = week.challenges[challengeIdx];

  const handleMistake = (hintEs: string) => {
    setMascotState({
      mood: 'encouraging',
      message: '¡Casi! Inténtalo una vez más sin afán.',
      subMessage: hintEs,
    });
  };

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
    } else {
      // Calculate final week accuracy (weighted fairly so completing all challenges gives strong base + bonus for first-try accuracy)
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
    setSummary(null);
    setMascotState({
      mood: 'neutral',
      message: `¡Nuevo intento en la Semana ${week.weekNumber}! Tú puedes.`,
      subMessage: week.grammarFocus,
    });
  };

  // Summary Screen after completing all challenges
  if (summary) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border border-amber-200">
            <Trophy className="h-11 w-11 text-amber-500" aria-hidden="true" />
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

          {/* Stars Earned */}
          <div className="flex justify-center gap-3" aria-label={`Ganaste ${summary.starsEarned} de 3 estrellas`}>
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-12 w-12 ${
                  s <= summary.starsEarned
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Metrics Grid */}
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
          ) : !summary.passed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
              Necesitas al menos {PASS_ACCURACY_THRESHOLD}% para desbloquear la siguiente semana. ¡Inténtalo de nuevo!
            </div>
          ) : null}

          <MascotGuide
            mood={summary.passed ? 'celebrating' : 'encouraging'}
            message={
              summary.passed
                ? '¡Beto está muy orgulloso de ti! Tu progreso ya se guardó.'
                : '¡Cada intento te hace más fuerte en inglés!'
            }
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-b-4 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Volver al mapa</span>
            </button>

            <button
              type="button"
              onClick={handleRestartWeek}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-b-4 border-sky-700 bg-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-sky-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Repetir semana</span>
            </button>

            {summary.passed && hasNextPlayableWeek && (
              <button
                type="button"
                onClick={onGoToNextWeek}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
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
      {/* Lesson Top Progress Strip */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onExit();
          }}
          aria-label="Salir al mapa de aprendizaje"
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Salir</span>
        </button>

        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500 tabular-nums">
            <span>Semana {week.weekNumber} · {week.titleEs}</span>
            <span>Reto {challengeIdx + 1} / {totalChallenges}</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mascot Feedback Banner */}
      <MascotGuide
        compact
        mood={mascotState.mood}
        message={mascotState.message}
        subMessage={mascotState.subMessage}
      />

      {/* Active Interactive Mechanic Stage */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-7 shadow-xs">
        {currentChallenge.type === 'listening' && (
          <ListeningGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'memory' && (
          <MemoryMatchGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'reading' && (
          <ReadingGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'word_search' && (
          <WordSearchGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'word_order' && (
          <WordOrderGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'micro_story' && (
          <MicroStoryGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
        {currentChallenge.type === 'arcade' && (
          <ArcadeGame
            key={currentChallenge.id}
            challenge={currentChallenge}
            soundMuted={soundMuted}
            onComplete={handleStepComplete}
            onMistake={handleMistake}
          />
        )}
      </section>
    </main>
  );
};
