import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { WordOrderChallenge } from '../../types/curriculum';
import { AudioControls } from '../AudioControls';
import { playFlipSound, playRetryTone, playSuccessChime } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';

interface WordTile {
  id: string;
  word: string;
}

interface WordOrderGameProps {
  challenge: WordOrderChallenge;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

export const WordOrderGame: React.FC<WordOrderGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
}) => {
  const initialBank = useMemo<WordTile[]>(() => {
    const words = [
      ...challenge.correctSentence.split(' '),
      ...(challenge.extraDistractors ?? []),
    ];
    const tiles: WordTile[] = words.map((word, idx) => ({
      id: `${challenge.id}-${idx}-${word}`,
      word,
    }));

    let seed = challenge.id.split('').reduce((acc, ch) => acc * 19 + ch.charCodeAt(0), 13);
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, [challenge]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  const selectedTiles = selectedIds
    .map((id) => initialBank.find((t) => t.id === id))
    .filter((t): t is WordTile => Boolean(t));

  const bankTiles = initialBank.filter((t) => !selectedIds.includes(t.id));

  const addTile = (tileId: string) => {
    if (solved || selectedIds.includes(tileId)) return;
    playFlipSound(soundMuted);
    const tile = initialBank.find((t) => t.id === tileId);
    if (tile) speakEnglish(tile.word);
    setSelectedIds((prev) => [...prev, tileId]);
  };

  const removeTile = (tileId: string) => {
    if (solved) return;
    playFlipSound(soundMuted);
    setSelectedIds((prev) => prev.filter((id) => id !== tileId));
  };

  const handleCheck = () => {
    if (solved) return;
    const built = selectedTiles.map((t) => t.word).join(' ').trim();
    if (built === challenge.correctSentence.trim()) {
      setSolved(true);
      playSuccessChime(soundMuted);
      speakEnglish(challenge.correctSentence);
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  const handleDropToTray = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTileId) {
      addTile(draggedTileId);
      setDraggedTileId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-indigo-700">Ordenar oraciones · Word Order</p>
        <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
          {challenge.promptEs}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Meta en español: <span className="font-bold text-slate-900">&ldquo;{challenge.spanishMeaning}&rdquo;</span>
        </p>
      </div>

      {/* Answer Tray (supports tap or drag-and-drop) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToTray}
        aria-label="Zona de construcción de la oración"
        className={`min-h-[92px] rounded-2xl border-2 border-dashed p-4 transition-colors ${
          solved
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-300 bg-white'
        }`}
      >
        {selectedTiles.length === 0 ? (
          <p className="py-3 text-center text-sm font-medium text-slate-400">
            Toca o arrastra las fichas de abajo en el orden correcto...
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {selectedTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={solved}
                onClick={() => removeTile(tile.id)}
                aria-label={`Quitar palabra ${tile.word}`}
                className={`min-h-[44px] rounded-xl border border-b-4 px-4 py-2 font-display text-base font-bold transition-transform active:translate-y-0.5 ${
                  solved
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-sky-700 bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                {tile.word}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Word Bank */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">Fichas disponibles</p>
          {!solved && selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {bankTiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              draggable={!solved}
              onDragStart={() => setDraggedTileId(tile.id)}
              disabled={solved}
              onClick={() => addTile(tile.id)}
              className="min-h-[46px] rounded-xl border border-b-4 border-slate-300 bg-white px-4 py-2 font-display text-base font-bold text-slate-900 hover:border-sky-400 hover:bg-sky-50 active:translate-y-0.5"
            >
              {tile.word}
            </button>
          ))}
        </div>
      </div>

      {solved ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <AudioControls
            text={challenge.correctSentence}
            labelNormal="Escuchar oración"
            labelSlow="Lento"
            compact
          />
          <button
            type="button"
            onClick={() => onComplete(!hadMistake)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700"
          >
            Continuar
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={selectedTiles.length === 0}
            onClick={handleCheck}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400"
          >
            Comprobar oración
          </button>
        </div>
      )}
    </div>
  );
};
