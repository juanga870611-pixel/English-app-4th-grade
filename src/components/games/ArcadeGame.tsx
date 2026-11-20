import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Heart, Play, RotateCcw, Trophy } from 'lucide-react';
import type { ArcadeChallenge } from '../../types/curriculum';
import { playRetryTone, playSuccessChime } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';

interface ArcadeGameProps {
  challenge: ArcadeChallenge;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

type ArcadeState = 'READY' | 'PLAYING' | 'WON' | 'LOST';

export const ArcadeGame: React.FC<ArcadeGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
}) => {
  const [gameState, setGameState] = useState<ArcadeState>('READY');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitSec);
  const [itemIndex, setItemIndex] = useState(0);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);
  const [hadMistake, setHadMistake] = useState(false);

  const deck = useMemo(() => {
    const items = [...challenge.items];
    // Deterministic shuffle
    let seed = challenge.id.split('').reduce((a, c) => a + c.charCodeAt(0), 29);
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [challenge]);

  const currentItem = deck[itemIndex % deck.length];

  const startOrRestart = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setTimeLeft(challenge.timeLimitSec);
    setItemIndex(0);
    setFeedbackFlash(null);
    setGameState('PLAYING');
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('LOST');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleSort = useCallback(
    (chosenBucket: 'left' | 'right') => {
      if (gameState !== 'PLAYING' || !currentItem) return;

      if (currentItem.bucket === chosenBucket) {
        playSuccessChime(soundMuted);
        speakEnglish(currentItem.word);
        setFeedbackFlash('correct');
        setTimeout(() => setFeedbackFlash(null), 260);

        const nextScore = score + 1;
        setScore(nextScore);
        setCombo((c) => c + 1);
        setItemIndex((i) => i + 1);

        if (nextScore >= challenge.targetScore) {
          setGameState('WON');
        }
      } else {
        playRetryTone(soundMuted);
        setHadMistake(true);
        onMistake(challenge.hintEs);
        setFeedbackFlash('wrong');
        setTimeout(() => setFeedbackFlash(null), 280);

        setCombo(0);
        const nextLives = lives - 1;
        setLives(nextLives);
        setItemIndex((i) => i + 1);

        if (nextLives <= 0) {
          setGameState('LOST');
        }
      }
    },
    [gameState, currentItem, soundMuted, score, challenge.targetScore, challenge.hintEs, lives, onMistake]
  );

  // Keyboard shortcuts (Left/Right arrows) for Chromebook lab play
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSort('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSort('right');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleSort]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-rose-700">Mini-juego Arcade · Clasificación rápida</p>
        <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
          {challenge.titleEs}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{challenge.promptEs}</p>
      </div>

      {/* Compact Game HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-1.5" aria-label={`Vidas restantes: ${lives}`}>
          {[1, 2, 3].map((heartIdx) => (
            <Heart
              key={heartIdx}
              className={`h-5 w-5 ${
                heartIdx <= lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
          <span className="text-emerald-700">
            Meta: {score} / {challenge.targetScore}
          </span>
          {combo >= 2 && (
            <span className="text-amber-600">Combo x{combo}</span>
          )}
          <span className={`inline-flex items-center gap-1 ${timeLeft <= 10 ? 'text-rose-600' : 'text-slate-700'}`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* READY STATE */}
      {gameState === 'READY' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4">
          <div className="flex justify-center gap-4 text-4xl" aria-hidden="true">
            <span>{challenge.leftBucket.emoji}</span>
            <span>⚡</span>
            <span>{challenge.rightBucket.emoji}</span>
          </div>
          <p className="font-display text-lg font-bold text-slate-900">
            Clasifica {challenge.targetScore} tarjetas en {challenge.timeLimitSec} segundos
          </p>
          <p className="text-xs text-slate-500">
            Usa los botones en pantalla o las flechas ⬅️ ➡️ del teclado.
          </p>
          <button
            type="button"
            onClick={startOrRestart}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-7 py-3 text-base font-bold text-white hover:bg-emerald-700"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            <span>¡Empezar juego!</span>
          </button>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === 'PLAYING' && currentItem && (
        <div className="space-y-5">
          {/* Active Card */}
          <div
            className={`mx-auto max-w-sm rounded-2xl border-2 p-6 text-center transition-transform ${
              feedbackFlash === 'correct'
                ? 'scale-105 border-emerald-500 bg-emerald-50'
                : feedbackFlash === 'wrong'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <span className="block text-6xl" aria-hidden="true">
              {currentItem.emoji}
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">
              {currentItem.word}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">{currentItem.spanish}</p>
          </div>

          {/* Two Classification Buckets */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => handleSort('left')}
              className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-b-4 border-emerald-600 bg-emerald-50 p-4 text-emerald-950 transition-transform hover:bg-emerald-100 active:translate-y-0.5"
            >
              <span className="text-3xl" aria-hidden="true">{challenge.leftBucket.emoji}</span>
              <span className="font-display text-base font-extrabold">{challenge.leftBucket.labelEn}</span>
              <span className="text-xs font-semibold text-emerald-800">{challenge.leftBucket.labelEs}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSort('right')}
              className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-b-4 border-rose-500 bg-rose-50 p-4 text-rose-950 transition-transform hover:bg-rose-100 active:translate-y-0.5"
            >
              <span className="text-3xl" aria-hidden="true">{challenge.rightBucket.emoji}</span>
              <span className="font-display text-base font-extrabold">{challenge.rightBucket.labelEn}</span>
              <span className="text-xs font-semibold text-rose-800">{challenge.rightBucket.labelEs}</span>
            </button>
          </div>
        </div>
      )}

      {/* LOST STATE */}
      {gameState === 'LOST' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
          <p className="font-display text-xl font-extrabold text-amber-950">
            ¡Casi lo logras! Lograste {score} de {challenge.targetScore}.
          </p>
          <p className="text-sm text-amber-900">
            No te preocupes, puedes intentarlo de nuevo ahora mismo.
          </p>
          <button
            type="button"
            onClick={startOrRestart}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-6 py-3 text-base font-bold text-white hover:bg-amber-600"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            <span>Reintentar juego</span>
          </button>
        </div>
      )}

      {/* WON STATE */}
      {gameState === 'WON' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-4">
          <Trophy className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
          <p className="font-display text-xl font-extrabold text-emerald-950">
            ¡Reto Arcade superado! ({score}/{challenge.targetScore})
          </p>
          <button
            type="button"
            onClick={() => onComplete(!hadMistake)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};
