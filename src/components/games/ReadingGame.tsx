import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import type { ReadingChallenge, ReadingSequenceItem } from '../../types/curriculum';
import { AudioControls } from '../AudioControls';
import { BetoFeedbackCard, HintExampleButton } from '../BetoFeedbackCard';
import {
  getPreAnswerHint,
  getSequenceErrorFeedback,
  getSuccessReinforcementExample,
  getVisualChoiceErrorFeedback,
  type BetoFeedbackPayload,
  type SequenceAnalysis,
  type WeekMistakeReviewItem,
} from '../../utils/pedagogicalFeedback';
import { playRetryTone, playSuccessChime, playTapSound } from '../../utils/soundFx';
import { CelebrationBurst } from '../CelebrationBurst';

interface ReadingGameProps {
  challenge: ReadingChallenge;
  grammarFocus?: string;
  soundMuted: boolean;
  onComplete: (firstTry: boolean) => void;
  onMistake: (hintEs: string) => void;
  onMistakeDetail?: (item: WeekMistakeReviewItem) => void;
}

export const ReadingGame: React.FC<ReadingGameProps> = ({
  challenge,
  grammarFocus = '',
  soundMuted,
  onComplete,
  onMistake,
  onMistakeDetail,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wrongOptionIds, setWrongOptionIds] = useState<Set<string>>(() => new Set());
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<BetoFeedbackPayload | null>(null);
  const [sequenceAnalysis, setSequenceAnalysis] = useState<SequenceAnalysis | null>(null);

  const initialOrder = useMemo<ReadingSequenceItem[]>(() => {
    if (!challenge.sequenceItems) return [];
    const items = [...challenge.sequenceItems];
    if (items.length >= 3) {
      return [items[2], items[0], items[1]];
    }
    return items.reverse();
  }, [challenge]);

  const [seqOrder, setSeqOrder] = useState<ReadingSequenceItem[]>(initialOrder);

  const preHintPayload = useMemo(
    () => getPreAnswerHint(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const successPayload = useMemo(
    () => getSuccessReinforcementExample(challenge, grammarFocus),
    [challenge, grammarFocus]
  );

  const handleSelectOption = (optionId: string) => {
    if (solved || !challenge.question) return;
    setSelectedOptionId(optionId);
    if (optionId === challenge.question.correctOptionId) {
      setSolved(true);
      setErrorFeedback(null);
      setShowHint(false);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      setShowHint(false);
      setWrongOptionIds((prev) => new Set(prev).add(optionId));
      playRetryTone(soundMuted);

      const chosen = challenge.question.options.find((o) => o.id === optionId);
      const correct = challenge.question.options.find(
        (o) => o.id === challenge.question!.correctOptionId
      );

      const feedback = getVisualChoiceErrorFeedback({
        challengeId: challenge.id,
        chosenLabel: chosen?.text ?? optionId,
        chosenEmoji: chosen?.emoji ?? challenge.sceneEmoji,
        chosenSpanish: 'opción seleccionada',
        correctLabel: correct?.text ?? '',
        correctSpanish: '',
        contextText: challenge.passageEn.join(' '),
        hintEs: challenge.hintEs,
        grammarFocus,
      });

      setErrorFeedback(feedback);
      onMistake(challenge.hintEs);
      onMistakeDetail?.({
        challengeId: challenge.id,
        challengeTypeLabel: 'Lectura comprensiva',
        promptSummaryEs: challenge.question.questionEs,
        studentAnswerEs: chosen?.text ?? optionId,
        correctAnswerEs: correct?.text ?? '',
        explanationEs: feedback.explanationEs,
        example: feedback.example,
      });
    }
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    if (solved) return;
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= seqOrder.length) return;
    const copy = [...seqOrder];
    [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
    setSeqOrder(copy);
    // Clear old red markings when student edits order so they can test cleanly
    setSequenceAnalysis(null);
  };

  const handleCheckSequence = () => {
    if (!challenge.sequenceItems || solved) return;
    const isCorrect = seqOrder.every((item, idx) => item.id === challenge.sequenceItems![idx].id);
    if (isCorrect) {
      setSolved(true);
      setErrorFeedback(null);
      setSequenceAnalysis(null);
      setShowHint(false);
      playSuccessChime(soundMuted);
    } else {
      setHadMistake(true);
      setShowHint(false);
      playRetryTone(soundMuted);
      const { payload, analysis } = getSequenceErrorFeedback(
        challenge,
        seqOrder.map((i) => i.id)
      );
      setSequenceAnalysis(analysis);
      setErrorFeedback(payload);
      onMistake(challenge.hintEs);
      onMistakeDetail?.({
        challengeId: challenge.id,
        challengeTypeLabel: 'Secuencia de lectura',
        promptSummaryEs: challenge.titleEs,
        studentAnswerEs: seqOrder.map((s, i) => `${i + 1}. ${s.textEn}`).join(' / '),
        correctAnswerEs: challenge.sequenceItems
          .map((s, i) => `${i + 1}. ${s.textEn}`)
          .join(' / '),
        explanationEs: payload.explanationEs,
        example: payload.example,
      });
    }
  };

  const fullTextEn = challenge.passageEn.join(' ');

  return (
    <div className="relative space-y-5">
      <CelebrationBurst active={solved} variant="stars" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-amber-700">
            Lectura comprensiva · {challenge.locationCol}
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {challenge.titleEs}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!solved && (
            <HintExampleButton open={showHint} onToggle={() => setShowHint((v) => !v)} />
          )}
          <button
            type="button"
            onClick={() => {
              playTapSound(soundMuted);
              setShowTranslation((v) => !v);
            }}
            className="btn-3d inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <span>{showTranslation ? 'Ocultar ayuda en español' : 'Ver ayuda en español'}</span>
          </button>
        </div>
      </div>

      {/* Story Card */}
      <div className="panel-3d rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="cube-3d flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 text-4xl border border-amber-200"
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
            soundMuted={soundMuted}
            compact
          />
        </div>
      </div>

      {!solved && showHint && <BetoFeedbackCard payload={preHintPayload} soundMuted={soundMuted} />}

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
              const isWrong =
                (isSelected || wrongOptionIds.has(opt.id)) &&
                opt.id !== challenge.question!.correctOptionId;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={solved}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`btn-3d flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border-2 border-b-[5px] px-4 py-3 text-left ${
                    isCorrect
                      ? 'border-emerald-500 border-b-emerald-600 bg-gradient-to-b from-emerald-50 to-emerald-100/70 text-emerald-950'
                      : isWrong
                        ? 'border-rose-400 border-b-rose-500 bg-rose-50 text-rose-950'
                        : 'border-slate-200 border-b-slate-300 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50/40'
                  }`}
                >
                  {opt.emoji && (
                    <span className="text-2xl shrink-0" aria-hidden="true">
                      {opt.emoji}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{opt.text}</span>
                    {isWrong && (
                      <span className="block text-xs font-bold text-rose-700">
                        No coincide con la lectura · Prueba otra opción
                      </span>
                    )}
                  </div>
                  {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />}
                  {isWrong && <XCircle className="h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />}
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
            Ordena los momentos de la historia (1° al {challenge.sequenceItems.length}°) usando las flechas:
          </p>

          <div className="space-y-2.5">
            {seqOrder.map((item, idx) => {
              const status = sequenceAnalysis?.itemStatuses[idx];
              const isRowWrong = !solved && status === 'wrong_position';
              const isRowRight = !solved && status === 'correct';

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border border-b-4 p-3.5 transition-colors shadow-xs ${
                    solved || isRowRight
                      ? 'border-emerald-400 border-b-emerald-500 bg-emerald-50'
                      : isRowWrong
                        ? 'border-rose-400 border-b-rose-500 bg-rose-50'
                        : 'border-slate-200 border-b-slate-300 bg-white'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-extrabold tabular-nums ${
                      isRowWrong
                        ? 'bg-rose-200 text-rose-950'
                        : isRowRight || solved
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 sm:text-base">{item.textEn}</p>
                    <p className="text-xs text-slate-600">{item.textEs}</p>
                    {isRowWrong && (
                      <p className="mt-1 text-xs font-bold text-rose-700">
                        Posición {idx + 1} incorrecta · Mueve esta tarjeta
                      </p>
                    )}
                    {isRowRight && (
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        Posición {idx + 1} correcta
                      </p>
                    )}
                  </div>
                  {!solved && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          playTapSound(soundMuted);
                          moveItem(idx, -1);
                        }}
                        aria-label={`Subir evento: ${item.textEn}`}
                        className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl border border-b-[3px] border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === seqOrder.length - 1}
                        onClick={() => {
                          playTapSound(soundMuted);
                          moveItem(idx, 1);
                        }}
                        aria-label={`Bajar evento: ${item.textEn}`}
                        className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl border border-b-[3px] border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!solved && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCheckSequence}
                className="btn-3d inline-flex min-h-[48px] items-center justify-center rounded-xl border-b-4 border-sky-800 bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
              >
                Comprobar orden
              </button>
            </div>
          )}
        </div>
      )}

      {!solved && errorFeedback && <BetoFeedbackCard payload={errorFeedback} soundMuted={soundMuted} />}

      {solved && (
        <div className="space-y-4 pt-1">
          <BetoFeedbackCard payload={successPayload} soundMuted={soundMuted} />
          <div className="flex justify-end">
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
