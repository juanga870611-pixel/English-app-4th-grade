import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSpokenAttempt, isChildFriendlyWordMatch, normalizeSpeechTokens } from './speakingEvaluator';

test('normalizeSpeechTokens ignores case, punctuation, contractions, and digits', () => {
  assert.deepEqual(
    normalizeSpeechTokens("Brush your teeth! It's 8 o'clock."),
    ['brush', 'your', 'teeth', 'it', 'is', 'eight', 'oclock']
  );
});

test('isChildFriendlyWordMatch tolerates homophones and young EFL accent variations', () => {
  assert.equal(isChildFriendlyWordMatch('teeth', 'teath'), true);
  assert.equal(isChildFriendlyWordMatch('classmates', 'classmate'), true);
  assert.equal(isChildFriendlyWordMatch('healthy', 'helthy'), true);
  assert.equal(isChildFriendlyWordMatch('mango', 'soda'), false);
});

test('evaluateSpokenAttempt colors matched words green and missing/mispronounced words amber', () => {
  const exact = evaluateSpokenAttempt('Brush your teeth!', 'brush your teeth');
  assert.equal(exact.allGood, true);
  assert.equal(exact.passed, true);
  assert.equal(exact.scorePercent, 100);
  assert.ok(exact.words.every((w) => w.status === 'good'));

  const partial = evaluateSpokenAttempt('We respect our classmates.', 'we banana our classmates');
  assert.equal(partial.allGood, false);
  assert.equal(partial.passed, true); // 3/4 = 75% >= 70%
  assert.equal(partial.words[0].status, 'good');
  assert.equal(partial.words[1].status, 'improve');
  assert.equal(partial.words[2].status, 'good');
  assert.equal(partial.words[3].status, 'good');

  const low = evaluateSpokenAttempt('Turn off the tap to save water.', 'hello');
  assert.equal(low.passed, false);
  assert.equal(low.goodCount, 0);
});
