import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Heart, Play, RotateCcw } from 'lucide-react';
import type { ArcadeChallenge, ArcadeItem } from '../../types/curriculum';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import {
  getArcadeErrorFeedback,
  getPreAnswerHint,
  getSuccessReinforcementExample,
  type BetoFeedbackPayload,
  type WeekMistakeReviewItem,
} from '../../utils/pedagogicalFeedback';
import { playRetryTone, playSuccessChime, playTapSound } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';
import { CelebrationBurst } from '../CelebrationBurst';
import { VolumetricTrophySvg } from '../MascotGuide';

interface ArcadeGameProps {
  challenge: ArcadeChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

type ArcadeState = 'READY' | 'PLAYING' | 'WON' | 'LOST';

export const ArcadeGame: React.FC<ArcadeGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onMistakeDetail,
}) => {
  const [gameState, setGameState] = useState<ArcadeState>('READY');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitSec);
  const [itemIndex, setItemIndex] = useState(0);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [pendingError, setPendingError] = useState<{
    item: ArcadeItem;
    nextLives: number;
    payload: BetoFeedbackPayload;
  } | null>(null);

  const deck = useMemo(() => {
    const items = [...challenge.items];
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

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const successPayload = useMemo(
    () => getSuccessReinforcementExample(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const startOrRestart = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setTimeLeft(challenge.timeLimitSec);
    setItemIndex(0);
    setFeedbackFlash(null);
    setPendingError(null);
    setShowHint(false);
    setGameState('PLAYING');
  };

  // Timer loop pauses while Beto explains an error or hint!
  useEffect(() => {
    if (gameState !== 'PLAYING' || pendingError || showHint) return;
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
  }, [gameState, pendingError, showHint]);

  const handleContinueAfterError = () => {
    if (!pendingError) return;
    const { nextLives } = pendingError;
    setPendingError(null);
    setFeedbackFlash(null);
    setItemIndex((i) => i + 1);
    if (nextLives <= 0) {
      setGameState('LOST');
    }
  };

  const handleSort = useCallback(
    (chosenBucket: 'left' | 'right') => {
      if (gameState !== 'PLAYING' || !currentItem || pendingError) return;

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
        setShowHint(false);
        setHadMistake(true);
        setFeedbackFlash('wrong');
        setCombo(0);

        const nextLives = lives - 1;
        setLives(nextLives);

        const payload = getArcadeErrorFeedback(currentItem, chosenBucket, challenge);
        setPendingError({ item: currentItem, nextLives, payload });
        onMistake(challenge.hintEs);

        const wrongBucket = chosenBucket === 'left' ? challenge.leftBucket : challenge.rightBucket;
        const rightBucket = currentItem.bucket === 'left' ? challenge.leftBucket : challenge.rightBucket;

        onMistakeDetail?.({
          challengeId: challenge.id,
          challengeTypeLabel: 'Mini-juego Arcade',
          promptSummaryEs: challenge.titleEs,
          studentAnswerEs: `${currentItem.word} -> ${wrongBucket.labelEs}`,
          correctAnswerEs: `${currentItem.word} -> ${rightBucket.labelEs}`,
          explanationEs: payload.explanationEs,
          example: payload.example,
        });
      }
    },
    [
      gameState,
      currentItem,
      pendingError,
      soundMuted,
      score,
      challenge,
      lives,
      onMistake,
      onMistakeDetail,
    ]
  );

  // Keyboard shortcuts (Left/Right arrows) for Chromebook lab play
  useEffect(() => {
    if (gameState !== 'PLAYING' || pendingError) return;
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
  }, [gameState, pendingError, handleSort]);

  return (
    <div className="relative space-y-5">
      <CelebrationBurst active={gameState === 'WON' || feedbackFlash === 'correct'} variant="confetti" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-rose-700">Mini-juego Arcade · Clasificación rápida</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.titleEs}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{challenge.promptEs}</p>
        </div>

        {(gameState === 'READY' || gameState === 'PLAYING') && (
          <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
        )}
      </div>

      {showHint && (gameState === 'READY' || gameState === 'PLAYING') && (
        <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />
      )}

      {/* Compact Game HUD */}
      <div className="panel-3d flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
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
          {combo >= 2 && <span className="text-amber-600">Combo x{combo}</span>}
          <span
            className={`inline-flex items-center gap-1 ${
              timeLeft <= 10 ? 'text-rose-600' : 'text-slate-700'
            }`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* READY STATE */}
      {gameState === 'READY' && (
        <div className="panel-3d rounded-2xl p-8 text-center space-y-4">
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
            onClick={() => {
              playTapSound(soundMuted);
              startOrRestart();
            }}
            className="btn-3d inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-7 py-3 text-base font-bold text-white hover:bg-emerald-700"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            <span>¡Empezar juego!</span>
          </button>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === 'PLAYING' && currentItem && (
        <div className="perspective-1000 space-y-5">
          <div
            className={`mx-auto max-w-sm rounded-3xl border-2 border-b-[7px] p-6 text-center transition-transform duration-200 ${
              feedbackFlash === 'correct'
                ? 'scale-105 -translate-y-1 border-emerald-500 border-b-emerald-700 bg-gradient-to-b from-white to-emerald-50 shadow-[0_18px_32px_-12px_rgba(16,185,129,0.35)]'
                : feedbackFlash === 'wrong' || pendingError
                  ? 'border-rose-500 border-b-rose-700 bg-rose-50 shadow-[0_14px_24px_-12px_rgba(225,29,72,0.28)]'
                  : 'border-slate-200 border-b-slate-300 bg-gradient-to-b from-white to-slate-50 shadow-[0_18px_30px_-14px_rgba(15,23,42,0.18)]'
            }`}
          >
            <span className="block text-6xl drop-shadow-sm" aria-hidden="true">
              {currentItem.emoji}
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">
              {currentItem.word}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">{currentItem.spanish}</p>
          </div>

          {pendingError ? (
            <BetoFeedbackCard
              payload={pendingError.payload}
              soundMuted={soundMuted}
              actionLabel={
                pendingError.nextLives <= 0
                  ? 'Ver resultado e intentar de nuevo'
                  : 'Entendido, seguir jugando'
              }
              onAction={handleContinueAfterError}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleSort('left')}
                className="btn-3d flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-b-[6px] border-emerald-600 border-b-emerald-800 bg-gradient-to-b from-emerald-50 to-emerald-100 p-4 text-emerald-950 hover:from-emerald-100 hover:to-emerald-200/70"
              >
                <span className="text-3xl" aria-hidden="true">{challenge.leftBucket.emoji}</span>
                <span className="font-display text-base font-extrabold">{challenge.leftBucket.labelEn}</span>
                <span className="text-xs font-semibold text-emerald-800">{challenge.leftBucket.labelEs}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSort('right')}
                className="btn-3d flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-b-[6px] border-rose-500 border-b-rose-700 bg-gradient-to-b from-rose-50 to-rose-100 p-4 text-rose-950 hover:from-rose-100 hover:to-rose-200/70"
              >
                <span className="text-3xl" aria-hidden="true">{challenge.rightBucket.emoji}</span>
                <span className="font-display text-base font-extrabold">{challenge.rightBucket.labelEn}</span>
                <span className="text-xs font-semibold text-rose-800">{challenge.rightBucket.labelEs}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOST STATE */}
      {gameState === 'LOST' && (
        <div className="rounded-2xl border-2 border-b-[6px] border-amber-300 border-b-amber-500 bg-gradient-to-b from-white to-amber-50 p-6 text-center space-y-4 shadow-sm">
          <p className="font-display text-xl font-extrabold text-amber-950">
            ¡Casi lo logras! Lograste {score} de {challenge.targetScore}.
          </p>
          <p className="text-sm text-amber-900">
            No te preocupes, puedes intentarlo de nuevo ahora mismo.
          </p>
          <button
            type="button"
            onClick={() => {
              playTapSound(soundMuted);
              startOrRestart();
            }}
            className="btn-3d inline-flex min-h-[48px] items-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-6 py-3 text-base font-bold text-white hover:bg-amber-600"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            <span>Reintentar juego</span>
          </button>
        </div>
      )}

      {/* WON STATE */}
      {gameState === 'WON' && (
        <div className="space-y-4">
          <BetoFeedbackCard payload={successPayload} soundMuted={soundMuted} />
          <div className="panel-3d-emerald rounded-2xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              <VolumetricTrophySvg size={60} />
            </div>
            <p className="font-display text-xl font-extrabold text-emerald-950">
              ¡Reto Arcade superado! ({score}/{challenge.targetScore})
            </p>
            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                onComplete(!hadMistake);
              }}
              className="btn-3d inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
