import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_WEEKS } from '../data/curriculum';
import { findWordIndexAtChar, tokenizeForKaraoke } from './speech';
import {
  analyzeSequenceAttempt,
  analyzeWordOrderAttempt,
  getArcadeErrorFeedback,
  getMemoryMismatchFeedback,
  getMicroStoryCheckpointErrorFeedback,
  getPreAnswerHint,
  getSequenceErrorFeedback,
  getSuccessReinforcementExample,
  getVisualChoiceErrorFeedback,
  getWordBankErrorFeedback,
  getWordOrderErrorFeedback,
  getWordSearchErrorFeedback,
} from './pedagogicalFeedback';

test('tokenizeForKaraoke and findWordIndexAtChar track exact word offsets', () => {
  const tokens = tokenizeForKaraoke('You should dry your hands');
  assert.equal(tokens.length, 5);
  assert.equal(tokens[0].word, 'You');
  assert.equal(tokens[2].word, 'dry');
  assert.equal(findWordIndexAtChar(tokens, 0), 0);
  assert.equal(findWordIndexAtChar(tokens, tokens[2].start + 1), 2);
  assert.equal(findWordIndexAtChar(tokens, 999), 4);
});

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

test('getWordOrderErrorFeedback explains week rule and returns non-spoiling example with 3 grammar blocks', () => {
  const { payload } = getWordOrderErrorFeedback(
    {
      id: 'w2-c5',
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
  assert.equal(payload.exerciseCategory, 'open_sentence');
  assert.equal(payload.sceneTheme, 'health_ailments');
  assert.equal(payload.grammarBlocks.length, 3);
  assert.deepEqual(
    payload.grammarBlocks.map((b) => b.role),
    ['Sujeto', 'Verbo', 'Complemento']
  );
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

test('getPreAnswerHint works for every single challenge across all 36 weeks with grammar blocks and scenes', () => {
  const seenThemes = new Set<string>();

  for (const week of CURRICULUM_WEEKS) {
    for (const challenge of week.challenges) {
      const hint = getPreAnswerHint(challenge, week.grammarFocus);
      assert.equal(hint.kind, 'hint');
      assert.ok(hint.explanationEs.length > 0);
      assert.ok(hint.example.en.length > 0 && hint.example.es.length > 0);
      assert.equal(hint.grammarBlocks.length, 3, `Missing 3 grammar blocks in ${challenge.id}`);
      seenThemes.add(hint.sceneTheme);

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

  assert.ok(seenThemes.has('prepositions'));
  assert.ok(seenThemes.has('time_clock'));
  assert.ok(seenThemes.has('hygiene'));
  assert.ok(seenThemes.has('colombian_fauna'));
});

test('multiple choice error feedback differs per chosen option and detects topic-specific scenes', () => {
  const errBrush = getVisualChoiceErrorFeedback({
    challengeId: 'w1-c1',
    chosenLabel: 'Brush teeth',
    chosenEmoji: '🪥',
    chosenSpanish: 'Cepillar los dientes',
    correctLabel: 'Wash hands',
    correctSpanish: 'Lavar las manos',
    contextText: 'Wash your hands with soap.',
    hintEs: 'Wash es lavar.',
  });

  const errCandy = getVisualChoiceErrorFeedback({
    challengeId: 'w1-c1',
    chosenLabel: 'Eat candy',
    chosenEmoji: '🍬',
    chosenSpanish: 'Comer dulces',
    correctLabel: 'Wash hands',
    correctSpanish: 'Lavar las manos',
    contextText: 'Wash your hands with soap.',
    hintEs: 'Wash es lavar.',
  });

  assert.equal(errBrush.kind, 'error');
  assert.equal(errBrush.exerciseCategory, 'multiple_choice');
  assert.equal(errBrush.sceneTheme, 'hygiene');
  assert.ok(errBrush.visualComparison?.chosenEmoji === '🪥');
  assert.notEqual(errBrush.explanationEs, errCandy.explanationEs);
  assert.notEqual(errBrush.example.en.toLowerCase(), 'wash your hands with soap.');

  const prepErr = getVisualChoiceErrorFeedback({
    challengeId: 'w29-c1',
    chosenLabel: 'Under the chair',
    chosenEmoji: '🪑',
    chosenSpanish: 'Debajo de la silla',
    correctLabel: 'On the table',
    correctSpanish: 'Encima de la mesa',
    contextText: 'The ball is on the table.',
    hintEs: 'On es encima.',
  });
  assert.equal(prepErr.sceneTheme, 'prepositions');

  const clockErr = getVisualChoiceErrorFeedback({
    challengeId: 'w31-c1',
    chosenLabel: 'Three o’clock',
    chosenEmoji: '🕒',
    chosenSpanish: 'Las tres en punto',
    correctLabel: 'Nine o’clock',
    correctSpanish: 'Las nueve en punto',
    contextText: 'What time is it? It is nine o’clock.',
    hintEs: 'Nine es nueve.',
  });
  assert.equal(clockErr.sceneTheme, 'time_clock');
});

test('open-exercise and micro-story error feedback helpers return tailored scenes and blocks', () => {
  const wbErr = getWordBankErrorFeedback(
    {
      id: 'w2-c2',
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
  assert.equal(wbErr.sceneTheme, 'health_ailments');

  const seqErr = getSequenceErrorFeedback(
    {
      id: 'w5-c2',
      titleEs: 'Historia',
      passageEn: ['1.', '2.', '3.'],
      hintEs: 'Ordena.',
      sequenceItems: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    },
    ['c', 'b', 'a']
  );
  assert.deepEqual(seqErr.analysis.wrongPositions, [1, 3]);
  assert.equal(seqErr.payload.grammarBlocks.length, 3);

  const memErr = getMemoryMismatchFeedback('w1-c4', 'soap', 'jabón', 'teeth', 'dientes');
  assert.ok(memErr.wrongPartEs?.includes('soap'));
  assert.equal(memErr.sceneTheme, 'hygiene');

  const wsErr = getWordSearchErrorFeedback('w19-c3', 'XYZ', [
    { word: 'CONDOR', spanish: 'cóndor', emoji: '🦅' },
  ]);
  assert.ok(wsErr.wrongPartEs?.includes('XYZ'));
  assert.equal(wsErr.sceneTheme, 'colombian_fauna');

  const storyErr = getMicroStoryCheckpointErrorFeedback(
    'w21-c5',
    {
      id: 's1',
      emoji: '🌳',
      bgTone: 'emerald',
      narrationEn: ['We plant trees in the forest.'],
      translationEs: 'Plantamos árboles en el bosque.',
    },
    'Cut the trees',
    'Recuerda proteger el bosque.'
  );
  assert.equal(storyErr.sceneTheme, 'eco_habitats');
  assert.ok(storyErr.wrongPartEs?.includes('Cut the trees'));

  const arcErr = getArcadeErrorFeedback(
    { id: 'a1', word: 'Soda', spanish: 'Gaseosa', emoji: '🥤', bucket: 'right' },
    'left',
    {
      id: 'w3-c6',
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
  assert.equal(arcErr.sceneTheme, 'healthy_food');
});
