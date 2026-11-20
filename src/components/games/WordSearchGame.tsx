import React, { useMemo, useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import type { WordSearchChallenge } from '../../types/curriculum';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import {
  getPreAnswerHint,
  getSuccessReinforcementExample,
  getWordSearchErrorFeedback,
  type BetoFeedbackPayload,
  type WeekMistakeReviewItem,
} from '../../utils/pedagogicalFeedback';
import {
  extractWordFromCoords,
  generateWordSearchBoard,
  getLineCoords,
  matchWordSelection,
  type GridCoord,
} from '../../utils/wordSearchGenerator';
import { playRetryTone, playSuccessChime, playTapSound } from '../../utils/soundFx';
import { speakEnglish } from '../../utils/speech';
import { CelebrationBurst } from '../CelebrationBurst';

interface WordSearchGameProps {
  challenge: WordSearchChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

function coordKey(c: GridCoord): string {
  return `${c.row}-${c.col}`;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onMistakeDetail,
}) => {
  const board = useMemo(() => {
    const seed = challenge.id.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
    return generateWordSearchBoard(
      challenge.targets.map((t) => t.word),
      challenge.gridSize,
      seed
    );
  }, [challenge]);

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(() => new Set());
  const [wrongCellKeys, setWrongCellKeys] = useState<Set<string>>(() => new Set());
  const [dragStart, setDragStart] = useState<GridCoord | null>(null);
  const [hoverCoord, setHoverCoord] = useState<GridCoord | null>(null);
  const [clickAnchor, setClickAnchor] = useState<GridCoord | null>(null);
  const [lastFoundInfo, setLastFoundInfo] = useState<{ word: string; spanish: string; emoji: string } | null>(null);
  const [hintRevealedWord, setHintRevealedWord] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<BetoFeedbackPayload | null>(null);

  const targetWordStrings = useMemo(
    () => challenge.targets.map((t) => t.word.toUpperCase()),
    [challenge]
  );

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const successPayload = useMemo(
    () => getSuccessReinforcementExample(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const previewCoords = useMemo(() => {
    const start = dragStart ?? clickAnchor;
    const end = hoverCoord;
    if (!start) return [];
    if (!end) return [start];
    const line = getLineCoords(start, end);
    return line.length ? line : [start];
  }, [dragStart, clickAnchor, hoverCoord]);

  const previewKeys = useMemo(() => new Set(previewCoords.map(coordKey)), [previewCoords]);

  const tryCommitSelection = (start: GridCoord, end: GridCoord) => {
    const line = getLineCoords(start, end);
    if (line.length < 2) {
      // Diagonal/jagged non-straight selection still gives visible feedback!
      if (start.row !== end.row || start.col !== end.col) {
        playRetryTone(soundMuted);
        setWrongCellKeys(new Set([coordKey(start), coordKey(end)]));
        const remaining = challenge.targets.filter(
          (t) => !foundWords.includes(t.word.toUpperCase())
        );
        const feedback = getWordSearchErrorFeedback(challenge.id, 'trazo torcido', remaining);
        setErrorFeedback(feedback);
        onMistake('Recuerda seleccionar en línea recta horizontal, vertical o diagonal.');
      }
      return false;
    }

    const matched = matchWordSelection(
      board.grid,
      line,
      targetWordStrings,
      new Set(foundWords)
    );

    if (matched) {
      playSuccessChime(soundMuted);
      speakEnglish(matched.toLowerCase());
      setFoundWords((prev) => [...prev, matched]);
      setFoundCellKeys((prev) => {
        const next = new Set(prev);
        line.forEach((c) => next.add(coordKey(c)));
        return next;
      });
      setWrongCellKeys(new Set());
      setErrorFeedback(null);
      const meta = challenge.targets.find((t) => t.word.toUpperCase() === matched);
      if (meta) {
        setLastFoundInfo({ word: meta.word, spanish: meta.spanish, emoji: meta.emoji });
      }
      setHintRevealedWord(null);
      return true;
    } else {
      playRetryTone(soundMuted);
      setShowHint(false);
      setWrongCellKeys(new Set(line.map(coordKey)));
      const formed = extractWordFromCoords(board.grid, line);
      const remaining = challenge.targets.filter(
        (t) => !foundWords.includes(t.word.toUpperCase())
      );
      const feedback = getWordSearchErrorFeedback(challenge.id, formed, remaining);
      setErrorFeedback(feedback);
      onMistake(challenge.hintEs);

      const nextTarget = remaining[0];
      if (nextTarget) {
        onMistakeDetail?.({
          challengeId: challenge.id,
          challengeTypeLabel: 'Sopa de letras',
          promptSummaryEs: challenge.promptEs,
          studentAnswerEs: `Selección "${formed}"`,
          correctAnswerEs: `${nextTarget.word} (${nextTarget.spanish})`,
          explanationEs: feedback.explanationEs,
          example: feedback.example,
        });
      }
      return false;
    }
  };

  const handleCellPointerDown = (coord: GridCoord) => {
    setWrongCellKeys(new Set());
    if (clickAnchor && (clickAnchor.row !== coord.row || clickAnchor.col !== coord.col)) {
      const line = getLineCoords(clickAnchor, coord);
      if (line.length >= 2) {
        tryCommitSelection(clickAnchor, coord);
      } else {
        tryCommitSelection(clickAnchor, coord);
      }
      setClickAnchor(null);
      setDragStart(null);
      setHoverCoord(null);
      return;
    }
    setDragStart(coord);
    setHoverCoord(coord);
  };

  const handleCellPointerEnter = (coord: GridCoord) => {
    if (dragStart || clickAnchor) {
      setHoverCoord(coord);
    }
  };

  const handleCellPointerUp = (coord: GridCoord) => {
    if (!dragStart) return;
    if (dragStart.row === coord.row && dragStart.col === coord.col) {
      if (clickAnchor && clickAnchor.row === coord.row && clickAnchor.col === coord.col) {
        setClickAnchor(null);
      } else {
        setClickAnchor(coord);
      }
      setDragStart(null);
      return;
    }
    tryCommitSelection(dragStart, coord);
    setDragStart(null);
    setClickAnchor(null);
    setHoverCoord(null);
  };

  const handleRevealHint = () => {
    const remaining = challenge.targets.find((t) => !foundWords.includes(t.word.toUpperCase()));
    if (!remaining) return;
    setUsedHint(true);
    setHintRevealedWord(remaining.word.toUpperCase());
    onMistake(`Pista: Busca la palabra "${remaining.word}" (${remaining.spanish}) empezando por la letra iluminada en amarillo.`);
  };

  const hintCoordKey = useMemo(() => {
    if (!hintRevealedWord) return null;
    const placed = board.placedWords.find((p) => p.word === hintRevealedWord);
    if (!placed || !placed.coords.length) return null;
    return coordKey(placed.coords[0]);
  }, [hintRevealedWord, board]);

  const allFound = foundWords.length === challenge.targets.length;

  return (
    <div className="relative space-y-5">
      <CelebrationBurst active={allFound} variant="confetti" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-700">Sopa de letras · Word Search</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.promptEs}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Arrastra el dedo/ratón o haz clic en la primera letra y luego en la última.
          </p>
        </div>

        {!allFound && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                handleRevealHint();
              }}
              className="btn-3d inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <HelpCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <span>Iluminar 1ª letra</span>
            </button>
          </div>
        )}
      </div>

      {!allFound && showHint && <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />}

      {lastFoundInfo && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-950">
          <span className="text-2xl" aria-hidden="true">{lastFoundInfo.emoji}</span>
          <span>
            ¡Encontraste <span className="font-mono">{lastFoundInfo.word}</span>! Significa &ldquo;{lastFoundInfo.spanish}&rdquo;.
          </span>
        </div>
      )}

      {!allFound && errorFeedback && <BetoFeedbackCard payload={errorFeedback} soundMuted={soundMuted} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div
          className="lg:col-span-7 flex justify-center select-none"
          onPointerLeave={() => {
            if (dragStart) {
              setDragStart(null);
            }
          }}
        >
          <div
            className="panel-3d grid gap-1.5 rounded-2xl p-2.5 sm:p-3.5"
            style={{
              gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
            }}
            role="grid"
            aria-label="Tablero de sopa de letras"
          >
            {board.grid.map((rowArr, r) =>
              rowArr.map((letter, c) => {
                const coord = { row: r, col: c };
                const key = coordKey(coord);
                const isFound = foundCellKeys.has(key);
                const isPreview = previewKeys.has(key);
                const isWrongCell = wrongCellKeys.has(key) && !isFound;
                const isHintStart = hintCoordKey === key && !isFound;

                return (
                  <button
                    key={key}
                    type="button"
                    onPointerDown={() => handleCellPointerDown(coord)}
                    onPointerEnter={() => handleCellPointerEnter(coord)}
                    onPointerUp={() => handleCellPointerUp(coord)}
                    aria-label={`Fila ${r + 1} columna ${c + 1}: letra ${letter}`}
                    className={`flex items-center justify-center rounded-lg border-b-[3px] font-display font-extrabold transition-transform touch-none active:translate-y-0.5 ${
                      board.size === 8
                        ? 'h-9 w-9 text-base sm:h-11 sm:w-11 sm:text-lg'
                        : 'h-7 w-7 text-xs sm:h-9 sm:w-9 sm:text-base'
                    } ${
                      isPreview
                        ? 'border-sky-700 bg-sky-500 text-white -translate-y-0.5 shadow-sm'
                        : isWrongCell
                          ? 'border-rose-400 bg-rose-200 text-rose-950 ring-2 ring-rose-400'
                          : isFound
                            ? 'border-emerald-700 bg-emerald-500 text-white'
                            : isHintStart
                              ? 'border-amber-500 bg-amber-300 text-amber-950 ring-2 ring-amber-500'
                              : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-2.5">
          <p className="text-xs font-bold text-slate-500 tabular-nums">
            Palabras encontradas: {foundWords.length} / {challenge.targets.length}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {challenge.targets.map((target) => {
              const found = foundWords.includes(target.word.toUpperCase());
              return (
                <button
                  key={target.word}
                  type="button"
                  onClick={() => speakEnglish(target.word.toLowerCase())}
                  aria-label={`Escuchar ${target.word}: ${target.spanish}`}
                  className={`btn-3d flex items-center justify-between gap-3 rounded-xl border border-b-4 px-3.5 py-2.5 text-left ${
                    found
                      ? 'border-emerald-300 border-b-emerald-400 bg-emerald-50 text-emerald-950'
                      : 'border-slate-200 border-b-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" aria-hidden="true">{target.emoji}</span>
                    <div>
                      <p className={`font-mono text-sm font-bold ${found ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                        {target.word}
                      </p>
                      <p className="text-xs text-slate-500">{target.spanish}</p>
                    </div>
                  </div>
                  {found && <Check className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {allFound && (
        <div className="space-y-4 pt-2">
          <BetoFeedbackCard payload={successPayload} soundMuted={soundMuted} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                onComplete(!usedHint);
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
