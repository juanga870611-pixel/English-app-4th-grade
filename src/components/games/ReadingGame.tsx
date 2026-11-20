import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, CheckCircle2 } from 'lucide-react';
import type { ReadingChallenge, ReadingSequenceItem } from '../../types/curriculum';
import { AudioControls } from '../AudioControls';
import { playRetryTone, playSuccessChime } from '../../utils/soundFx';

interface ReadingGameProps {
  challenge: ReadingChallenge;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

export const ReadingGame: React.FC<ReadingGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);

  // Sequence ordering state
  const initialOrder = useMemo<ReadingSequenceItem[]>(() => {
    if (!challenge.sequenceItems) return [];
    // Rotate order so it doesn't start solved
    const items = [...challenge.sequenceItems];
    if (items.length >= 3) {
      return [items[2], items[0], items[1]];
    }
    return items.reverse();
  }, [challenge]);

  const [seqOrder, setSeqOrder] = useState<ReadingSequenceItem[]>(initialOrder);

  const handleSelectOption = (optionId: string) => {
    if (solved || !challenge.question) return;
    setSelectedOptionId(optionId);
    if (optionId === challenge.question.correctOptionId) {
      setSolved(true);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    if (solved) return;
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= seqOrder.length) return;
    const copy = [...seqOrder];
    [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
    setSeqOrder(copy);
  };

  const handleCheckSequence = () => {
    if (!challenge.sequenceItems || solved) return;
    const isCorrect = seqOrder.every((item, idx) => item.id === challenge.sequenceItems![idx].id);
    if (isCorrect) {
      setSolved(true);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  const fullTextEn = challenge.passageEn.join(' ');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-amber-700">
            Lectura comprensiva · {challenge.locationCol}
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.titleEs}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <BookOpen className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <span>{showTranslation ? 'Ocultar ayuda en español' : 'Ver ayuda en español'}</span>
        </button>
      </div>

      {/* Story Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-4xl border border-amber-200"
            aria-hidden="true"
          >
            {challenge.sceneEmoji}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold text-slate-500">{challenge.titleEn}</p>
            <div className="space-y-1.5 text-base font-medium leading-relaxed text-slate-900 sm:text-lg">
              {challenge.passageEn.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {showTranslation && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 border border-amber-200">
                {challenge.passageEs}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <AudioControls
            text={fullTextEn}
            labelNormal="Escuchar lectura"
            labelSlow="Leer despacio"
            compact
          />
        </div>
      </div>

      {/* Mode 1: Multiple Choice Question */}
      {challenge.mode === 'multiple_choice' && challenge.question && (
        <div className="space-y-3">
          <p className="font-display text-lg font-bold text-slate-900">
            {challenge.question.questionEs}
          </p>
          <p className="text-sm font-medium text-slate-500">{challenge.question.questionEn}</p>

          <div className="space-y-2.5 pt-1">
            {challenge.question.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrect = solved && opt.id === challenge.question!.correctOptionId;
              const isWrong = isSelected && opt.id !== challenge.question!.correctOptionId;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={solved}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border border-b-4 px-4 py-3 text-left transition-all ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : isWrong
                        ? 'border-rose-400 bg-rose-50 text-rose-950'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50/40'
                  }`}
                >
                  {opt.emoji && (
                    <span className="text-2xl shrink-0" aria-hidden="true">
                      {opt.emoji}
                    </span>
                  )}
                  <span className="flex-1 text-base font-semibold">{opt.text}</span>
                  {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Sequence Ordering */}
      {challenge.mode === 'sequence' && challenge.sequenceItems && (
        <div className="space-y-3">
          <p className="font-display text-lg font-bold text-slate-900">
            Ordena los momentos de la historia (1° al 3°) usando las flechas:
          </p>

          <div className="space-y-2.5">
            {seqOrder.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                  solved
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-display text-sm font-extrabold text-slate-700 tabular-nums">
                  {idx + 1}
                </span>
                <span className="text-2xl shrink-0" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 sm:text-base">{item.textEn}</p>
                  <p className="text-xs text-slate-500">{item.textEs}</p>
                </div>
                {!solved && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label={`Subir evento: ${item.textEn}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === seqOrder.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label={`Bajar evento: ${item.textEn}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!solved && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCheckSequence}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-sky-800 bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
              >
                Comprobar orden
              </button>
            </div>
          )}
        </div>
      )}

      {solved && (
        <div className="flex justify-end pt-2">
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
