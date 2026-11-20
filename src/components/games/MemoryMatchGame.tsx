import React, { useEffect, useMemo, useState } from 'react';
import { Volume2, XCircle } from 'lucide-react';
import type { MemoryChallenge } from '../../types/curriculum';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import {
  getMemoryMismatchFeedback,
  getPreAnswerHint,
  getSuccessReinforcementExample,
  type BetoFeedbackPayload,
  type WeekMistakeReviewItem,
} from '../../utils/pedagogicalFeedback';
import { playFlipSound, playRetryTone, playSuccessChime } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';

interface MemoryCard {
  uid: string;
  pairId: string;
  kind: 'cue' | 'word';
  word: string;
  spanish: string;
  emoji: string;
}

interface MemoryMatchGameProps {
  challenge: MemoryChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onMistakeDetail,
}) => {
  const cards = useMemo<MemoryCard[]>(() => {
    const raw: MemoryCard[] = [];
    challenge.pairs.forEach((pair) => {
      raw.push({
        uid: `${pair.id}-cue`,
        pairId: pair.id,
        kind: 'cue',
        word: pair.word,
        spanish: pair.spanish,
        emoji: pair.emoji,
      });
      raw.push({
        uid: `${pair.id}-word`,
        pairId: pair.id,
        kind: 'word',
        word: pair.word,
        spanish: pair.spanish,
        emoji: pair.emoji,
      });
    });

    let seed = challenge.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 17);
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [raw[i], raw[j]] = [raw[j], raw[i]];
    }
    return raw;
  }, [challenge]);

  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [mismatchUids, setMismatchUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [lockedBoard, setLockedBoard] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<BetoFeedbackPayload | null>(null);

  const allMatched = matchedPairIds.length === challenge.pairs.length;

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const successPayload = useMemo(
    () => getSuccessReinforcementExample(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  useEffect(() => {
    if (flippedUids.length !== 2) return;

    const [firstUid, secondUid] = flippedUids;
    const firstCard = cards.find((c) => c.uid === firstUid);
    const secondCard = cards.find((c) => c.uid === secondUid);
    if (!firstCard || !secondCard) return;

    setLockedBoard(true);

    if (firstCard.pairId === secondCard.pairId) {
      const timer = setTimeout(() => {
        playSuccessChime(soundMuted);
        setMatchedPairIds((prev) => [...prev, firstCard.pairId]);
        setFlippedUids([]);
        setMismatchUids([]);
        setErrorFeedback(null);
        setLockedBoard(false);
      }, 360);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        playRetryTone(soundMuted);
        setShowHint(false);
        setMistakeCount((m) => m + 1);
        setMismatchUids([firstUid, secondUid]);
        setLockedBoard(false);

        const feedback = getMemoryMismatchFeedback(
          challenge.id,
          firstCard.word,
          firstCard.spanish,
          secondCard.word,
          secondCard.spanish
        );
        setErrorFeedback(feedback);
        onMistake(challenge.hintEs);
        onMistakeDetail?.({
          challengeId: challenge.id,
          challengeTypeLabel: 'Juego de memoria',
          promptSummaryEs: challenge.promptEs,
          studentAnswerEs: `${firstCard.word} (${firstCard.spanish}) + ${secondCard.word} (${secondCard.spanish})`,
          correctAnswerEs: `${firstCard.word} = ${firstCard.spanish}`,
          explanationEs: feedback.explanationEs,
          example: feedback.example,
        });
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [flippedUids, cards, soundMuted, challenge.hintEs, challenge.id, challenge.promptEs, onMistake, onMistakeDetail]);

  const dismissMismatchAndContinue = () => {
    setMismatchUids([]);
    setFlippedUids([]);
  };

  const handleFlip = (card: MemoryCard) => {
    if (lockedBoard) return;
    if (matchedPairIds.includes(card.pairId)) return;

    // If two mismatched cards are currently shown in red, clicking any new unflipped card flips the old mismatch back cleanly
    if (mismatchUids.length > 0) {
      if (mismatchUids.includes(card.uid)) return;
      setMismatchUids([]);
      setFlippedUids([card.uid]);
      playFlipSound(soundMuted);
      if (card.kind === 'word' || challenge.mode === 'audio_word') {
        speakEnglish(card.word);
      }
      return;
    }

    if (flippedUids.includes(card.uid)) return;

    playFlipSound(soundMuted);
    if (card.kind === 'word' || challenge.mode === 'audio_word') {
      speakEnglish(card.word);
    }

    setFlippedUids((prev) => [...prev, card.uid]);
  };

  const gridCols = cards.length <= 8 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-700">Juego de memoria · Memory Match</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.promptEs}
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-600 tabular-nums">
            Parejas: {matchedPairIds.length} / {challenge.pairs.length}
          </p>
        </div>

        {!allMatched && (
          <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
        )}
      </div>

      {!allMatched && showHint && <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />}

      <div className={`grid gap-3 ${gridCols}`}>
        {cards.map((card) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isMismatch = mismatchUids.includes(card.uid);
          const isRevealed = isMatched || flippedUids.includes(card.uid) || isMismatch;

          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              disabled={isMatched}
              aria-label={
                isRevealed
                  ? `${card.word} (${card.spanish})`
                  : 'Voltear carta de memoria'
              }
              className="perspective-1000 h-28 w-full focus-visible:outline-2 focus-visible:outline-sky-600 sm:h-32"
            >
              <div
                className={`relative h-full w-full transition-transform duration-300 transform-style-3d ${
                  isRevealed ? 'rotate-y-180' : ''
                }`}
              >
                {/* Card Back */}
                <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-b-4 border-sky-700 bg-sky-500 text-white shadow-sm hover:bg-sky-600">
                  <span className="font-display text-2xl font-extrabold" aria-hidden="true">?</span>
                  <span className="mt-1 text-[11px] font-bold opacity-90">Tocar</span>
                </div>

                {/* Card Front */}
                <div
                  className={`backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 p-2 text-center ${
                    isMatched
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : isMismatch
                        ? 'border-rose-500 bg-rose-50 text-rose-950'
                        : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {isMismatch && (
                    <XCircle
                      className="absolute right-2 top-2 h-4 w-4 text-rose-600"
                      aria-hidden="true"
                    />
                  )}
                  {card.kind === 'cue' ? (
                    challenge.mode === 'audio_word' ? (
                      <>
                        <Volume2 className="h-8 w-8 text-sky-600" aria-hidden="true" />
                        <span className="mt-1.5 text-xs font-bold text-sky-800">Escuchar</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl" aria-hidden="true">{card.emoji}</span>
                        <span className="mt-1 text-[11px] font-medium text-slate-500">{card.spanish}</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                        {card.word}
                      </span>
                      {(isMatched || isMismatch) && (
                        <span className={`mt-0.5 text-[11px] font-semibold ${isMismatch ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {card.spanish}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Immediate Mismatch Explanation Card (never silent!) */}
      {!allMatched && errorFeedback && (
        <BetoFeedbackCard
          payload={errorFeedback}
          soundMuted={soundMuted}
          actionLabel={mismatchUids.length > 0 ? 'Voltear tarjetas e intentar de nuevo' : undefined}
          onAction={mismatchUids.length > 0 ? dismissMismatchAndContinue : undefined}
        />
      )}

      {allMatched && (
        <div className="space-y-4">
          <BetoFeedbackCard payload={successPayload} soundMuted={soundMuted} />
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-900">
              ¡Encontraste todas las parejas de vocabulario!
            </p>
            <button
              type="button"
              onClick={() => onComplete(mistakeCount <= 2)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
