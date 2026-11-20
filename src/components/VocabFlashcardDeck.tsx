import React, { useState } from 'react';
import { RotateCw, Volume2 } from 'lucide-react';
import type { VocabItem } from '../types/curriculum';
import { playCardFlipSound, playTapSound } from '../utils/soundFx';
import { speakEnglish } from '../utils/speech';

interface VocabFlashcardDeckProps {
  items: VocabItem[];
  soundMuted: boolean;
}

interface FlashcardProps {
  item: VocabItem;
  soundMuted: boolean;
}

const VocabFlashcard3D: React.FC<FlashcardProps> = ({ item, soundMuted }) => {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Math.round(-normY * 14 * 10) / 10,
      ry: Math.round(normX * 14 * 10) / 10,
    });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const handleFlipCard = () => {
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    playCardFlipSound(soundMuted);
    speakEnglish(item.word, { muted: soundMuted });
  };

  return (
    <div
      className="perspective-1000 h-36 w-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div
        className="h-full w-full transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        <button
          type="button"
          onClick={handleFlipCard}
          aria-pressed={flipped}
          aria-label={`${item.word} (${item.spanish}) — Toca para voltear tarjeta 3D`}
          data-testid={`flashcard-${item.id}`}
          data-flipped={flipped ? 'true' : 'false'}
          className={`transform-style-3d relative h-full w-full cursor-pointer text-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-2 focus-visible:outline-sky-600 rounded-2xl ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face (3D English Illustration Card) */}
          <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-between rounded-2xl border border-b-[5px] border-slate-200 border-b-sky-300 bg-gradient-to-b from-white via-sky-50/40 to-sky-100/60 p-2.5 shadow-[0_10px_20px_-10px_rgba(2,132,199,0.28),inset_0_2px_0_rgba(255,255,255,0.95)]">
            <div className="flex w-full items-center justify-between text-[10px] font-bold text-sky-700">
              <span>EN</span>
              <RotateCw className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
            </div>

            <div className="flex flex-col items-center">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-[0_4px_10px_-3px_rgba(15,23,42,0.14),inset_0_1px_0_#fff] border border-slate-100"
                aria-hidden="true"
              >
                {item.emoji}
              </span>
              <span className="mt-1.5 font-display text-sm font-extrabold text-slate-900 leading-tight">
                {item.word}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500">Toca para girar</span>
          </div>

          {/* Back Face (3D Spanish Translation & Audio Card) */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-between rounded-2xl border border-b-[5px] border-emerald-400 border-b-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-600 p-2.5 text-white shadow-[0_12px_22px_-10px_rgba(5,150,105,0.45),inset_0_2px_0_rgba(255,255,255,0.35)]">
            <div className="flex w-full items-center justify-between text-[10px] font-bold text-emerald-100">
              <span>ES</span>
              <Volume2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
              <span className="mt-1 font-display text-sm font-extrabold leading-tight">
                {item.spanish}
              </span>
              <span className="mt-0.5 text-[11px] font-semibold text-emerald-100">
                &ldquo;{item.word}&rdquo;
              </span>
            </div>

            <span
              onClick={(e) => {
                e.stopPropagation();
                playTapSound(soundMuted);
                speakEnglish(item.word, { muted: soundMuted });
              }}
              className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-white/30"
            >
              Escuchar de nuevo
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export const VocabFlashcardDeck: React.FC<VocabFlashcardDeckProps> = ({
  items,
  soundMuted,
}) => (
  <div className="mt-4 border-t border-slate-200/80 pt-4">
    <p className="mb-3 text-xs font-bold text-slate-600">
      Tarjetas 3D interactivas: mueve el cursor para inclinar y tócalas para girar y escuchar en inglés:
    </p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {items.map((item) => (
        <VocabFlashcard3D key={item.id} item={item} soundMuted={soundMuted} />
      ))}
    </div>
  </div>
);
