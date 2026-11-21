// Pure-logic child-friendly Speaking evaluator for Grade 4 Colombian EFL learners

export interface SpokenWordResult {
  index: number;
  displayWord: string;
  cleanWord: string;
  status: 'good' | 'improve';
}

export interface SpeakingEvaluation {
  words: SpokenWordResult[];
  goodCount: number;
  totalCount: number;
  scorePercent: number;
  passed: boolean;
  allGood: boolean;
  betoMessageEs: string;
}

const CONTRACTION_MAP: Record<string, string> = {
  "don't": 'do not',
  "doesn't": 'does not',
  "can't": 'cannot',
  "shouldn't": 'should not',
  "i'm": 'i am',
  "it's": 'it is',
  "she's": 'she is',
  "he's": 'he is',
  "we're": 'we are',
  "they're": 'they are',
  "let's": 'let us',
  "o'clock": 'oclock',
};

const NUMBER_WORDS: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
};

const CHILD_EFL_EQUIVALENTS: Record<string, string[]> = {
  to: ['too', 'two'],
  too: ['to', 'two'],
  two: ['to', 'too'],
  for: ['four'],
  four: ['for'],
  there: ['their'],
  their: ['there'],
  no: ['know'],
  know: ['no'],
  right: ['write'],
  write: ['right'],
  sun: ['son'],
  see: ['sea'],
  sea: ['see'],
  wear: ['where'],
  where: ['wear'],
  teeth: ['teath', 'teet', 'tooth'],
  wash: ['was', 'watch'],
  brush: ['brash', 'blush'],
  soap: ['soup', 'so'],
  oclock: ['clock', 'oclock'],
  clock: ['oclock'],
  tree: ['three'],
  trees: ['threes'],
  lets: ['let', 'less'],
  us: ['as'],
  cannot: ['cant', 'can'],
  cant: ['cannot', 'can'],
  is: ['its', 'his'],
  sofia: ['sophia'],
  condor: ['condo'],
  paramo: ['paramo'],
};

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function cleanSingleToken(raw: string): string {
  const lowered = stripDiacritics(raw.toLowerCase()).replace(/’/g, "'");
  if (CONTRACTION_MAP[lowered]) {
    return CONTRACTION_MAP[lowered];
  }
  const stripped = lowered.replace(/[^a-z0-9]/g, '');
  if (NUMBER_WORDS[stripped]) {
    return NUMBER_WORDS[stripped];
  }
  return stripped;
}

export function normalizeSpeechTokens(text: string): string[] {
  const rawTokens = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (const raw of rawTokens) {
    const cleaned = cleanSingleToken(raw);
    if (!cleaned) continue;
    for (const part of cleaned.split(/\s+/)) {
      if (part) out.push(part);
    }
  }
  return out;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[b.length];
}

export function isChildFriendlyWordMatch(targetClean: string, spokenClean: string): boolean {
  if (!targetClean || !spokenClean) return false;
  if (targetClean === spokenClean) return true;

  // Equivalent phonetic / homophone words common in Web Speech en-US for kids
  const eq = CHILD_EFL_EQUIVALENTS[targetClean];
  if (eq && eq.includes(spokenClean)) return true;

  // Plural / ending tolerance for longer words (e.g. classmates/classmate, animals/animal)
  if (
    targetClean.length >= 4 &&
    spokenClean.length >= 4 &&
    (targetClean === `${spokenClean}s` ||
      spokenClean === `${targetClean}s` ||
      targetClean === `${spokenClean}ed` ||
      spokenClean === `${targetClean}ed`)
  ) {
    return true;
  }

  // Gentle edit-distance tolerance for young EFL accent
  const maxLen = Math.max(targetClean.length, spokenClean.length);
  const dist = levenshtein(targetClean, spokenClean);
  if (maxLen >= 4 && maxLen <= 6 && dist <= 1) return true;
  if (maxLen >= 7 && dist <= 2) return true;

  return false;
}

export function evaluateSpokenAttempt(
  targetPhraseEn: string,
  spokenTranscript: string
): SpeakingEvaluation {
  const displayTokens = targetPhraseEn.trim().split(/\s+/).filter(Boolean);
  const spokenTokens = normalizeSpeechTokens(spokenTranscript);

  let spokenCursor = 0;
  const words: SpokenWordResult[] = displayTokens.map((displayWord, index) => {
    const cleanTarget = cleanSingleToken(displayWord);
    const targetParts = cleanTarget.split(/\s+/).filter(Boolean);
    const primaryTarget = targetParts[0] ?? cleanTarget;

    // Look ahead slightly in spokenTokens so one missed word doesn't derail the rest
    let matchedIdx = -1;
    const lookAheadLimit = Math.min(spokenTokens.length, spokenCursor + 4);
    for (let j = spokenCursor; j < lookAheadLimit; j++) {
      if (
        isChildFriendlyWordMatch(primaryTarget, spokenTokens[j]) ||
        (targetParts.length > 1 && isChildFriendlyWordMatch(targetParts.join(''), spokenTokens[j]))
      ) {
        matchedIdx = j;
        break;
      }
    }

    // Fallback global check for short phrases in case child spoke slightly out of order
    if (matchedIdx === -1 && spokenTokens.some((tok) => isChildFriendlyWordMatch(primaryTarget, tok))) {
      matchedIdx = spokenCursor;
    }

    if (matchedIdx !== -1) {
      spokenCursor = Math.max(spokenCursor, matchedIdx + 1);
    }

    return {
      index,
      displayWord,
      cleanWord: primaryTarget,
      status: matchedIdx !== -1 ? 'good' : 'improve',
    };
  });

  const totalCount = words.length;
  const goodCount = words.filter((w) => w.status === 'good').length;
  const scorePercent = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
  const allGood = totalCount > 0 && goodCount === totalCount;
  const passed =
    allGood ||
    (totalCount <= 3 && goodCount >= Math.max(1, totalCount - 1) && scorePercent >= 65) ||
    (totalCount >= 4 && scorePercent >= 70);

  let betoMessageEs: string;
  if (allGood) {
    betoMessageEs = '¡Excelente pronunciación! Cada palabra sonó clara y segura.';
  } else if (passed) {
    betoMessageEs =
      '¡Muy bien! Se entendió súper claro. Si quieres, escucha de nuevo las palabras en ámbar o continúa.';
  } else if (goodCount > 0) {
    betoMessageEs =
      '¡Buen intento! Ya lograste varias palabras en verde. Escucha despacio con la tortuga 🐢 y prueba otra vez.';
  } else {
    betoMessageEs =
      '¡Ánimo! Escucha primero a Beto con el botón despacio 🐢 y repite la frase cerca del micrófono.';
  }

  return {
    words,
    goodCount,
    totalCount,
    scorePercent,
    passed,
    allGood,
    betoMessageEs,
  };
}
