import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_MODULES, CURRICULUM_WEEKS } from './curriculum';
import { generateWordSearchBoard } from '../utils/wordSearchGenerator';

test('curriculum defines 4 MEN modules covering weeks 1-36 cleanly', () => {
  assert.equal(CURRICULUM_MODULES.length, 4);
  assert.equal(CURRICULUM_WEEKS.length, 36);

  CURRICULUM_WEEKS.forEach((week, index) => {
    const expectedWeek = index + 1;
    assert.equal(week.weekNumber, expectedWeek, `Expected week ${expectedWeek}`);
    assert.equal(week.isImplemented, true, `Week ${expectedWeek} must be implemented`);
    assert.equal(week.vocabularyPreview.length, 6, `Week ${expectedWeek} should have 6 vocab preview items`);
    assert.ok(week.challenges.length >= 5, `Week ${expectedWeek} should have at least 5 challenges`);

    const expectedModuleId = Math.ceil(expectedWeek / 9);
    assert.equal(week.moduleId, expectedModuleId, `Week ${expectedWeek} belongs to module ${expectedModuleId}`);
  });
});

test('all challenge IDs across the 36 weeks are unique and all 7 game mechanics are valid', () => {
  const seenIds = new Set<string>();

  for (const week of CURRICULUM_WEEKS) {
    for (const challenge of week.challenges) {
      assert.ok(!seenIds.has(challenge.id), `Duplicate challenge id: ${challenge.id}`);
      seenIds.add(challenge.id);

      if (challenge.type === 'listening') {
        assert.ok(challenge.audioText.trim().length > 0, `${challenge.id} missing audioText`);
        if (challenge.mode === 'visual_choice') {
          assert.ok((challenge.options?.length ?? 0) >= 3, `${challenge.id} needs >=3 options`);
          assert.ok(
            challenge.options?.some((o) => o.id === challenge.correctOptionId),
            `${challenge.id} correctOptionId missing in options`
          );
        } else {
          assert.equal(challenge.sentenceParts?.length, 2, `${challenge.id} needs 2 sentenceParts`);
          assert.ok(
            challenge.wordBank?.includes(challenge.correctWord ?? ''),
            `${challenge.id} correctWord missing from wordBank`
          );
        }
      }

      if (challenge.type === 'memory') {
        assert.ok(
          challenge.pairs.length >= 4 && challenge.pairs.length <= 6,
          `${challenge.id} memory pairs should be 4..6`
        );
      }

      if (challenge.type === 'reading') {
        assert.ok(challenge.passageEn.length >= 3, `${challenge.id} passageEn too short`);
        if (challenge.mode === 'multiple_choice') {
          assert.ok(challenge.question, `${challenge.id} missing reading question`);
          assert.ok(
            challenge.question.options.some((o) => o.id === challenge.question?.correctOptionId),
            `${challenge.id} reading correctOptionId invalid`
          );
        } else {
          assert.ok((challenge.sequenceItems?.length ?? 0) >= 3, `${challenge.id} sequence needs >=3 items`);
        }
      }

      if (challenge.type === 'word_search') {
        assert.ok(challenge.targets.length >= 4, `${challenge.id} needs >=4 word search targets`);
        for (const target of challenge.targets) {
          assert.ok(
            /^[A-Z]+$/.test(target.word) && target.word.length <= challenge.gridSize,
            `${challenge.id} invalid target "${target.word}" for grid ${challenge.gridSize}`
          );
        }
        const seed = challenge.id.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
        const board = generateWordSearchBoard(
          challenge.targets.map((t) => t.word),
          challenge.gridSize,
          seed
        );
        assert.equal(
          board.placedWords.length,
          challenge.targets.length,
          `${challenge.id} failed to place all words in grid`
        );
      }

      if (challenge.type === 'word_order') {
        assert.ok(challenge.correctSentence.split(/\s+/).length >= 3, `${challenge.id} sentence too short`);
      }

      if (challenge.type === 'micro_story') {
        assert.equal(challenge.scenes.length, 4, `${challenge.id} micro_story should have 4 scenes`);
        const checkpoints = challenge.scenes.filter((s) => Boolean(s.checkpoint));
        assert.equal(checkpoints.length, 2, `${challenge.id} micro_story should have 2 checkpoints`);
        for (const scene of checkpoints) {
          assert.ok(
            scene.checkpoint!.options.some((o) => o.id === scene.checkpoint!.correctOptionId),
            `${challenge.id} checkpoint option mismatch`
          );
        }
      }

      if (challenge.type === 'arcade') {
        assert.ok(challenge.items.length >= challenge.targetScore, `${challenge.id} needs >= targetScore items`);
        const hasLeft = challenge.items.some((i) => i.bucket === 'left');
        const hasRight = challenge.items.some((i) => i.bucket === 'right');
        assert.ok(hasLeft && hasRight, `${challenge.id} arcade needs items for both buckets`);
      }
    }
  }
});

test('every week flagged hasMicroStory includes a micro_story challenge', () => {
  for (const week of CURRICULUM_WEEKS) {
    const hasStoryChallenge = week.challenges.some((c) => c.type === 'micro_story');
    assert.equal(
      hasStoryChallenge,
      week.hasMicroStory,
      `Week ${week.weekNumber} hasMicroStory=${week.hasMicroStory} mismatch`
    );
  }
});

test('all 36 weeks include 2-3 speaking challenges with gradual progression across modules 1-4', () => {
  for (const week of CURRICULUM_WEEKS) {
    const speakingChallenges = week.challenges.filter((c) => c.type === 'speaking');
    assert.ok(
      speakingChallenges.length >= 2 && speakingChallenges.length <= 3,
      `Week ${week.weekNumber} expected 2-3 speaking challenges, got ${speakingChallenges.length}`
    );

    for (const sc of speakingChallenges) {
      assert.equal(
        sc.oralLevel,
        week.moduleId,
        `Week ${week.weekNumber} challenge ${sc.id} expected oralLevel ${week.moduleId}, got ${sc.oralLevel}`
      );
      assert.ok(sc.targetPhraseEn.trim().length > 0, `${sc.id} missing targetPhraseEn`);
      assert.ok(sc.translationEs.trim().length > 0, `${sc.id} missing translationEs`);

      const wordCount = sc.targetPhraseEn.trim().split(/\s+/).length;

      if (week.moduleId === 1) {
        assert.ok(
          wordCount >= 2 && wordCount <= 3,
          `${sc.id} Module 1 should be 2-3 words, got ${wordCount} ("${sc.targetPhraseEn}")`
        );
      } else if (week.moduleId === 2) {
        assert.ok(
          wordCount >= 4 && wordCount <= 5,
          `${sc.id} Module 2 should be 4-5 words, got ${wordCount} ("${sc.targetPhraseEn}")`
        );
      } else if (week.moduleId === 3) {
        assert.ok(
          wordCount >= 5,
          `${sc.id} Module 3 should be a complete sentence (>=5 words), got ${wordCount} ("${sc.targetPhraseEn}")`
        );
      } else if (week.moduleId === 4) {
        assert.ok(
          Boolean(sc.betoQuestionEn?.trim()) && Boolean(sc.betoQuestionEs?.trim()),
          `${sc.id} Module 4 must include Beto question in EN and ES`
        );
        assert.ok(
          wordCount >= 4,
          `${sc.id} Module 4 response should be a complete sentence (>=4 words), got ${wordCount} ("${sc.targetPhraseEn}")`
        );
      }
    }
  }
});

