import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_WEEKS } from '../data/curriculum';
import {
  analyzeSequenceAttempt,
  analyzeWordOrderAttempt,
  getArcadeErrorFeedback,
  getMemoryMismatchFeedback,
  getPreAnswerHint,
  getSequenceErrorFeedback,
  getSuccessReinforcementExample,
  getVisualChoiceErrorFeedback,
  getWordBankErrorFeedback,
  getWordOrderErrorFeedback,
  getWordSearchErrorFeedback,
} from './pedagogicalFeedback';

test('analyzeWordOrderAttempt detects distractors, wrong position, and missing words', () => {
  const analysis = analyzeWordOrderAttempt(
    ['She', 'have', 'headache'],
    'She has a headache',
    ['have']
  );

  assert.deepEqual(analysis.tileStatuses, ['correct', 'distractor', 'wrong_position']);
  assert.deepEqual(analysis.distractorsUsed, ['have']);
  assert.equal(analysis.missingWordsCount, 2);
});

test('getWordOrderErrorFeedback explains have/has and returns non-spoiling example', () => {
  const { payload } = getWordOrderErrorFeedback(
    {
      id: 'test-wo',
      type: 'word_order',
      promptEs: 'Ordena',
      spanishMeaning: 'Ella tiene dolor de cabeza.',
      correctSentence: 'She has a headache',
      extraDistractors: ['have'],
      hintEs: 'Usa has con She.',
    },
    ['She', 'have', 'a', 'headache'],
    'have / has'
  );

  assert.equal(payload.kind, 'error');
  assert.ok(payload.wrongPartEs?.includes('have'));
  assert.ok(payload.explanationEs.includes('has'));
  assert.notEqual(payload.example.en.toLowerCase(), 'she has a headache');
  assert.ok(payload.example.en.length > 5 && payload.example.es.length > 5);
});

test('analyzeSequenceAttempt flags exact out-of-order positions', () => {
  const analysis = analyzeSequenceAttempt(['s3', 's2', 's1'], ['s1', 's2', 's3']);
  assert.deepEqual(analysis.itemStatuses, ['wrong_position', 'correct', 'wrong_position']);
  assert.deepEqual(analysis.wrongPositions, [1, 3]);
});

test('getPreAnswerHint works for every single challenge across all 36 weeks without spoiling exact answers', () => {
  for (const week of CURRICULUM_WEEKS) {
    for (const challenge of week.challenges) {
      const hint = getPreAnswerHint(challenge, week.grammarFocus);
      assert.equal(hint.kind, 'hint');
      assert.ok(hint.explanationEs.length > 0);
      assert.ok(hint.example.en.length > 0 && hint.example.es.length > 0);

      if (challenge.type === 'word_order') {
        assert.notEqual(
          hint.example.en.toLowerCase().trim(),
          challenge.correctSentence.toLowerCase().trim(),
          `Hint spoiled word_order in ${challenge.id}`
        );
      }

      if (challenge.type === 'listening') {
        assert.notEqual(
          hint.example.en.toLowerCase().trim(),
          challenge.audioText.toLowerCase().trim(),
          `Hint spoiled listening in ${challenge.id}`
        );
      }

      const success = getSuccessReinforcementExample(challenge, week.grammarFocus);
      assert.equal(success.kind, 'success');
      assert.ok(success.example.en.length > 0 && success.example.es.length > 0);
    }
  }
});

test('error feedback helpers return non-empty visual markers and bilingual examples', () => {
  const mcErr = getVisualChoiceErrorFeedback({
    chosenLabel: 'Brush teeth',
    chosenSpanish: 'Cepillar los dientes',
    correctLabel: 'Wash hands',
    correctSpanish: 'Lavar las manos',
    contextText: 'Wash your hands with soap.',
    hintEs: 'Wash es lavar.',
  });
  assert.equal(mcErr.kind, 'error');
  assert.ok(mcErr.wrongPartEs?.includes('Brush teeth'));
  assert.equal(mcErr.example.en, 'Dry your hands with a clean towel.');

  const wbErr = getWordBankErrorFeedback(
    {
      id: 'wb-1',
      type: 'listening',
      mode: 'word_bank',
      promptEs: 'Completa',
      audioText: 'She has a stomachache.',
      sentenceParts: ['She has a ', '.'],
      wordBank: ['stomachache', 'fever'],
      correctWord: 'stomachache',
      hintEs: 'Escucha despacio.',
    },
    'fever'
  );
  assert.ok(wbErr.wrongPartEs?.includes('fever'));

  const seqErr = getSequenceErrorFeedback(
    {
      id: 'seq-1',
      type: 'reading',
      mode: 'sequence',
      titleEn: 'Story',
      titleEs: 'Historia',
      sceneEmoji: '🏥',
      locationCol: 'Bogotá',
      passageEn: ['1.', '2.', '3.'],
      passageEs: '1. 2. 3.',
      hintEs: 'Ordena.',
      sequenceItems: [
        { id: 'a', textEn: 'A', textEs: 'A', emoji: '1️⃣' },
        { id: 'b', textEn: 'B', textEs: 'B', emoji: '2️⃣' },
        { id: 'c', textEn: 'C', textEs: 'C', emoji: '3️⃣' },
      ],
    },
    ['c', 'b', 'a']
  );
  assert.deepEqual(seqErr.analysis.wrongPositions, [1, 3]);

  const memErr = getMemoryMismatchFeedback('soap', 'jabón', 'teeth', 'dientes');
  assert.ok(memErr.wrongPartEs?.includes('soap'));

  const wsErr = getWordSearchErrorFeedback('XYZ', [{ word: 'SOAP', spanish: 'jabón', emoji: '🧼' }]);
  assert.ok(wsErr.wrongPartEs?.includes('XYZ'));

  const arcErr = getArcadeErrorFeedback(
    { id: 'a1', word: 'Soda', spanish: 'Gaseosa', emoji: '🥤', bucket: 'right' },
    'left',
    {
      id: 'arc-1',
      type: 'arcade',
      titleEs: 'Arcade',
      promptEs: 'Sort',
      hintEs: 'Hint',
      leftBucket: { labelEn: 'Healthy', labelEs: 'Saludable', emoji: '🥗', tone: 'emerald' },
      rightBucket: { labelEn: 'Unhealthy', labelEs: 'Poco sano', emoji: '🚫', tone: 'rose' },
      targetScore: 1,
      timeLimitSec: 30,
      items: [{ id: 'a1', word: 'Soda', spanish: 'Gaseosa', emoji: '🥤', bucket: 'right' }],
    }
  );
  assert.ok(arcErr.wrongPartEs?.includes('Soda'));
});
