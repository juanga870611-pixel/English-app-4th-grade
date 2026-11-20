import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ListeningChallenge } from '../../types/curriculum';
import { AudioControls } from '../AudioControls';
import { playRetryTone, playSuccessChime } from '../../utils/soundFx';

interface ListeningGameProps {
  challenge: ListeningChallenge;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
}

export const ListeningGame: React.FC<ListeningGameProps> = ({
  challenge,
  soundMuted,
  onComplete,
  onMistake,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);

  const handleSelectVisual = (optionId: string) => {
    if (solved) return;
    setSelectedId(optionId);

    if (optionId === challenge.correctOptionId) {
      setSolved(true);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  const handleSelectWord = (word: string) => {
    if (solved) return;
    setSelectedId(word);

    if (word === challenge.correctWord) {
      setSolved(true);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      playRetryTone(soundMuted);
      onMistake(challenge.hintEs);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-sky-700">Comprensión auditiva · Listening</p>
        <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
          {challenge.promptEs}
        </h2>
      </div>

      {/* Speech Synthesis Player */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
        <p className="mb-3 text-xs font-semibold text-sky-900">
          Usa la bocina para velocidad normal o la tortuga para escuchar más despacio:
        </p>
        <AudioControls text={challenge.audioText} />
      </div>

      {/* Mode 1: Visual Card Choice */}
      {challenge.mode === 'visual_choice' && challenge.options && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {challenge.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isCorrect = solved && opt.id === challenge.correctOptionId;
            const isWrong = isSelected && opt.id !== challenge.correctOptionId;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={solved}
                onClick={() => handleSelectVisual(opt.id)}
                aria-label={`${opt.label} (${opt.spanish})`}
                className={`flex min-h-[84px] items-center gap-4 rounded-2xl border border-b-4 p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-sky-600 ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                    : isWrong
                      ? 'border-rose-400 bg-rose-50 text-rose-950'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50/40 active:translate-y-0.5'
                }`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl" aria-hidden="true">
                  {opt.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold text-slate-900">{opt.label}</p>
                  <p className="text-xs font-medium text-slate-500">{opt.spanish}</p>
                </div>
                {isCorrect && <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 2: Word Bank Completion */}
      {challenge.mode === 'word_bank' && challenge.sentenceParts && challenge.wordBank && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              {challenge.sentenceParts[0]}
              <span
                className={`mx-1.5 inline-block min-w-[120px] rounded-xl border-2 px-3 py-1 font-mono text-lg ${
                  solved
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-dashed border-sky-400 bg-sky-50 text-sky-900'
                }`}
              >
                {selectedId ?? '_______'}
              </span>
              {challenge.sentenceParts[1]}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {challenge.wordBank.map((word) => {
              const isSelected = selectedId === word;
              const isCorrect = solved && word === challenge.correctWord;
              const isWrong = isSelected && word !== challenge.correctWord;

              return (
                <button
                  key={word}
                  type="button"
                  disabled={solved}
                  onClick={() => handleSelectWord(word)}
                  className={`min-h-[48px] rounded-xl border border-b-4 px-5 py-2.5 font-display text-base font-bold transition-transform active:translate-y-0.5 ${
                    isCorrect
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isWrong
                        ? 'border-rose-400 bg-rose-50 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {solved && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onComplete(!hadMistake)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700 active:translate-y-0.5"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};
