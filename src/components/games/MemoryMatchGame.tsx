import React, { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { MemoryChallenge } from '../../types/curriculum';
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
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
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

    // Deterministic-friendly shuffle seeded by challenge id
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
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [lockedBoard, setLockedBoard] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const allMatched = matchedPairIds.length === challenge.pairs.length;

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
        setLockedBoard(false);
      }, 360);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        playRetryTone(soundMuted);
        setMistakeCount((m) => m + 1);
        if (mistakeCount >= 3) {
          onMistake(challenge.hintEs);
        }
        setFlippedUids([]);
        setLockedBoard(false);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [flippedUids, cards, soundMuted, challenge.hintEs, mistakeCount, onMistake]);

  const handleFlip = (card: MemoryCard) => {
    if (lockedBoard) return;
    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedUids.includes(card.uid)) return;

    playFlipSound(soundMuted);

    // Speak English word when flipping a word card or audio cue card
    if (card.kind === 'word' || challenge.mode === 'audio_word') {
      speakEnglish(card.word);
    }

    setFlippedUids((prev) => [...prev, card.uid]);
  };

  const gridCols = cards.length <= 8 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-emerald-700">Juego de memoria · Memory Match</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.promptEs}
          </h2>
        </div>
        <p className="text-sm font-bold text-slate-600 tabular-nums">
          Parejas: {matchedPairIds.length} / {challenge.pairs.length}
        </p>
      </div>

      <div className={`grid gap-3 ${gridCols}`}>
        {cards.map((card) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isRevealed = isMatched || flippedUids.includes(card.uid);

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
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
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
                      {isMatched && (
                        <span className="mt-0.5 text-[11px] font-semibold text-emerald-700">
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

      {allMatched && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-900">
            ¡Encontraste todas las parejas de vocabulario!
          </p>
          <button
            type="button"
            onClick={() => onComplete(mistakeCount <= 4)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};
