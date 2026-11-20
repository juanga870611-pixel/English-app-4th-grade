import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { WordOrderChallenge } from '../../types/curriculum';
import { AudioControls } from '../AudioControls';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import {
  getPreAnswerHint,
  getSuccessReinforcementExample,
  getWordOrderErrorFeedback,
  type BetoFeedbackPayload,
  type WeekMistakeReviewItem,
  type WordOrderAnalysis,
} from '../../utils/pedagogicalFeedback';
import { playFlipSound, playRetryTone, playSuccessChime } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';

interface WordTile {
  id: string;
  word: string;
}

interface WordOrderGameProps {
  challenge: WordOrderChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

export const WordOrderGame: React.FC<WordOrderGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onMistakeDetail,
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
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<BetoFeedbackPayload | null>(null);
  const [attemptAnalysis, setAttemptAnalysis] = useState<WordOrderAnalysis | null>(null);

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const successPayload = useMemo(
    () => getSuccessReinforcementExample(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

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
    setAttemptAnalysis(null);
  };

  const removeTile = (tileId: string) => {
    if (solved) return;
    playFlipSound(soundMuted);
    setSelectedIds((prev) => prev.filter((id) => id !== tileId));
    setAttemptAnalysis(null);
  };

  const handleCheck = () => {
    if (solved) return;
    const builtWords = selectedTiles.map((t) => t.word);
    const built = builtWords.join(' ').trim();
    if (built === challenge.correctSentence.trim()) {
      setSolved(true);
      setErrorFeedback(null);
      setAttemptAnalysis(null);
      setShowHint(false);
      playSuccessChime(soundMuted);
      speakEnglish(challenge.correctSentence);
    } else {
      setHadMistake(true);
      setShowHint(false);
      playRetryTone(soundMuted);
      const { payload, analysis } = getWordOrderErrorFeedback(
        challenge,
        builtWords,
        grammarFocus
      );
      setAttemptAnalysis(analysis);
      setErrorFeedback(payload);
      onMistake(challenge.hintEs);
      onMistakeDetail?.({
        challengeId: challenge.id,
        challengeTypeLabel: 'Ordenar oración',
        promptSummaryEs: `${challenge.promptEs} (${challenge.spanishMeaning})`,
        studentAnswerEs: built || '(sin palabras)',
        correctAnswerEs: challenge.correctSentence,
        explanationEs: payload.explanationEs,
        example: payload.example,
      });
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-indigo-700">Ordenar oraciones · Word Order</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.promptEs}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Meta en español: <span className="font-bold text-slate-900">&ldquo;{challenge.spanishMeaning}&rdquo;</span>
          </p>
        </div>

        {!solved && (
          <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
        )}
      </div>

      {!solved && showHint && <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />}

      {/* Answer Tray (supports tap or drag-and-drop) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToTray}
        aria-label="Zona de construcción de la oración"
        className={`min-h-[92px] rounded-2xl border-2 border-dashed p-4 transition-colors ${
          solved
            ? 'border-emerald-500 bg-emerald-50'
            : attemptAnalysis
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-300 bg-white'
        }`}
      >
        {selectedTiles.length === 0 ? (
          <p className="py-3 text-center text-sm font-medium text-slate-400">
            Toca o arrastra las fichas de abajo en el orden correcto...
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedTiles.map((tile, idx) => {
              const status = attemptAnalysis?.tileStatuses[idx];
              const isTileWrong = !solved && (status === 'wrong_position' || status === 'distractor');
              const isTileRight = !solved && status === 'correct';

              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={solved}
                  onClick={() => removeTile(tile.id)}
                  aria-label={`Quitar palabra ${tile.word}${
                    status === 'distractor'
                      ? ' (palabra sobrante)'
                      : status === 'wrong_position'
                        ? ' (posición incorrecta)'
                        : ''
                  }`}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-b-4 px-4 py-2 font-display text-base font-bold transition-transform active:translate-y-0.5 ${
                    solved
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isTileWrong
                        ? 'border-rose-500 bg-rose-100 text-rose-950'
                        : isTileRight
                          ? 'border-emerald-600 bg-emerald-500 text-white'
                          : 'border-sky-700 bg-sky-500 text-white hover:bg-sky-600'
                  }`}
                >
                  <span>{tile.word}</span>
                  {status === 'distractor' && (
                    <span className="text-[11px] font-extrabold text-rose-700">· sobra</span>
                  )}
                  {status === 'wrong_position' && (
                    <span className="text-[11px] font-extrabold text-rose-700">· orden</span>
                  )}
                </button>
              );
            })}

            {!solved && attemptAnalysis && attemptAnalysis.missingWordsCount > 0 && (
              <span className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-dashed border-rose-400 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800">
                + falta(n) {attemptAnalysis.missingWordsCount} palabra(s)
              </span>
            )}
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
              onClick={() => {
                setSelectedIds([]);
                setAttemptAnalysis(null);
              }}
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

      {!solved && errorFeedback && <BetoFeedbackCard payload={errorFeedback} soundMuted={soundMuted} />}

      {solved ? (
        <div className="space-y-4">
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
          <BetoFeedbackCard payload={successPayload} soundMuted={soundMuted} />
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
