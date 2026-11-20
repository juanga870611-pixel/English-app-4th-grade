import type {
  ArcadeChallenge,
  ArcadeItem,
  ListeningChallenge,
  MemoryChallenge,
  MicroStoryChallenge,
  MicroStoryScene,
  ReadingChallenge,
  WeekChallenge,
  WordOrderChallenge,
  WordSearchChallenge,
} from '../types/curriculum';

export interface BilingualExample {
  en: string;
  es: string;
}

export interface BetoFeedbackPayload {
  kind: 'error' | 'hint' | 'success';
  titleEs: string;
  explanationEs: string;
  wrongPartEs?: string;
  hintEs?: string;
  example: BilingualExample;
}

export interface WeekMistakeReviewItem {
  challengeId: string;
  challengeTypeLabel: string;
  promptSummaryEs: string;
  studentAnswerEs: string;
  correctAnswerEs: string;
  explanationEs: string;
  example: BilingualExample;
}

export type WordOrderTileStatus = 'correct' | 'wrong_position' | 'distractor';

export interface WordOrderAnalysis {
  tileStatuses: WordOrderTileStatus[];
  distractorsUsed: string[];
  wrongPositionWords: { index: number; word: string; expected: string }[];
  missingWordsCount: number;
  extraWordsCount: number;
}

export interface SequenceAnalysis {
  itemStatuses: ('correct' | 'wrong_position')[];
  wrongPositions: number[]; // 1-based positions
}

interface GrammarPattern {
  id: string;
  test: (text: string) => boolean;
  ruleEs: string;
  hintExample: BilingualExample;
  successExample: BilingualExample;
}

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'have_has',
    test: (t) => /\b(have|has)\b|headache|fever|stomachache|toothache|cough|cold/i.test(t),
    ruleEs: 'Recuerda: con "I / You / We / They" usamos "have", y con "He / She / It" usamos "has".',
    hintExample: { en: 'He has a fever today.', es: 'Él tiene fiebre hoy.' },
    successExample: { en: 'My brother has a cold and needs rest.', es: 'Mi hermano tiene resfriado y necesita descanso.' },
  },
  {
    id: 'should_shouldnt',
    test: (t) => /\b(should|shouldn['’]?t|should not)\b/i.test(t),
    ruleEs: 'Usamos "should" para buenos consejos ("deberías") y "shouldn’t" para lo que debemos evitar ("no deberías").',
    hintExample: { en: 'You should drink clean water every day.', es: 'Deberías tomar agua limpia todos los días.' },
    successExample: { en: "Children shouldn't eat candy before sleeping.", es: 'Los niños no deberían comer dulces antes de dormir.' },
  },
  {
    id: 'how_many_much',
    test: (t) => /\bhow (many|much)\b/i.test(t),
    ruleEs: 'Usamos "How many" para cosas que podemos contar (apples, books) y "How much" para líquidos o cantidades no contables (water, milk).',
    hintExample: { en: 'How many bananas are in the basket?', es: '¿Cuántos bananos hay en la canasta?' },
    successExample: { en: 'How many students are in fourth grade?', es: '¿Cuántos estudiantes hay en cuarto grado?' },
  },
  {
    id: 'there_is_are',
    test: (t) => /\bthere (is|are)\b/i.test(t),
    ruleEs: 'Usamos "There is" para un solo animal, lugar u objeto (singular) y "There are" para dos o más (plural).',
    hintExample: { en: 'There are two parrots in the tree.', es: 'Hay dos loros en el árbol.' },
    successExample: { en: 'There is a library next to our school.', es: 'Hay una biblioteca al lado de nuestro colegio.' },
  },
  {
    id: 'can_cant',
    test: (t) => /\b(can|can['’]?t|cannot)\b/i.test(t),
    ruleEs: '"Can" expresa lo que alguien o un animal sabe hacer ("puede"), y "can’t" lo que no puede hacer.',
    hintExample: { en: 'A condor can fly high over the Andes.', es: 'Un cóndor puede volar alto sobre los Andes.' },
    successExample: { en: 'We can protect the river together.', es: 'Podemos proteger el río juntos.' },
  },
  {
    id: 'present_continuous',
    test: (t) => /\b(is|are|am)\s+[a-z]+ing\b/i.test(t),
    ruleEs: 'Para acciones que pasan ahora mismo usamos "is / are" + verbo terminado en "-ing" (por ejemplo: reading, walking, riding).',
    hintExample: { en: 'Camila is riding her bicycle now.', es: 'Camila está montando su bicicleta ahora.' },
    successExample: { en: 'The students are reading in the library.', es: 'Los estudiantes están leyendo en la biblioteca.' },
  },
  {
    id: 'time_clock',
    test: (t) => /\bo['’]?clock\b|\bwhat time\b/i.test(t),
    ruleEs: 'Para preguntar la hora decimos "What time is it?" y para responder en punto usamos "It is ... o’clock".',
    hintExample: { en: 'It is seven o’clock in the morning.', es: 'Son las siete en punto de la mañana.' },
    successExample: { en: 'Our English class starts at nine o’clock.', es: 'Nuestra clase de inglés empieza a las nueve en punto.' },
  },
  {
    id: 'imperatives',
    test: (t) => /\b(wash|brush|use soap|turn off|recycle|plant|look both|stop|be kind|don['’]?t|let['’]?s)\b/i.test(t),
    ruleEs: 'Para dar una instrucción saludable o invitación en inglés empezamos directamente con el verbo de acción (sin "to") o con "Let’s / Don’t".',
    hintExample: { en: 'Dry your hands with a clean towel.', es: 'Seca tus manos con una toalla limpia.' },
    successExample: { en: 'Let’s wash our hands before lunch.', es: 'Lavémonos las manos antes del almuerzo.' },
  },
  {
    id: 'prepositions',
    test: (t) => /\b(in|on|under|next to|between|near)\b/i.test(t),
    ruleEs: 'Las preposiciones indican ubicación: "in" (dentro), "on" (sobre), "under" (debajo), "next to" (al lado) y "between" (entre dos cosas).',
    hintExample: { en: 'The school is next to the green park.', es: 'El colegio está al lado del parque verde.' },
    successExample: { en: 'My backpack is under the desk.', es: 'Mi maleta está debajo del escritorio.' },
  },
  {
    id: 'possessives',
    test: (t) => /possessives|\b(his|her|our)\b|\b(my|your)\s+(name|family|mother|father|sister|brother|friend|teacher)\b/i.test(t),
    ruleEs: 'Los posesivos muestran de quién es algo: "my" (mi), "your" (tu), "his" (su, de él) y "her" (su, de ella).',
    hintExample: { en: 'Her name is Sofía and she is my friend.', es: 'Su nombre es Sofía y ella es mi amiga.' },
    successExample: { en: 'His brother plays soccer at school.', es: 'Su hermano juega fútbol en el colegio.' },
  },
  {
    id: 'to_be',
    test: (t) => /\b(am|is|are)\b/i.test(t),
    ruleEs: 'Con el verbo "to be": usamos "am" con "I", "is" con singular (he/she/it) y "are" con plural o "you/we/they".',
    hintExample: { en: 'My teacher is very kind and patient.', es: 'Mi profe es muy amable y paciente.' },
    successExample: { en: 'We are proud of our Colombian culture.', es: 'Estamos orgullosos de nuestra cultura colombiana.' },
  },
];

const FALLBACK_HINT_EXAMPLE: BilingualExample = {
  en: 'I practice English with my classmates every day.',
  es: 'Practico inglés con mis compañeros todos los días.',
};

const FALLBACK_SUCCESS_EXAMPLE: BilingualExample = {
  en: 'Great job! We learn new English words together.',
  es: '¡Buen trabajo! Aprendemos palabras nuevas en inglés juntos.',
};

function findGrammarPattern(contextText: string): GrammarPattern | null {
  for (const pattern of GRAMMAR_PATTERNS) {
    if (pattern.test(contextText)) {
      return pattern;
    }
  }
  return null;
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/[.,!?]+$/g, '');
}

/**
 * Ensures the returned example is NEVER identical to the target answer text.
 */
function pickSafeExample(
  candidate: BilingualExample,
  forbiddenText: string,
  fallback: BilingualExample
): BilingualExample {
  const normCandidate = candidate.en.toLowerCase();
  const normForbidden = forbiddenText.toLowerCase().trim();
  if (normForbidden && normCandidate === normForbidden) {
    return fallback;
  }
  return candidate;
}

export function analyzeWordOrderAttempt(
  builtWords: string[],
  correctSentence: string,
  extraDistractors: string[] = []
): WordOrderAnalysis {
  const targetWords = correctSentence.trim().split(/\s+/);
  const distractorSet = new Set(extraDistractors.map(normalizeWord));

  const tileStatuses: WordOrderTileStatus[] = [];
  const distractorsUsed: string[] = [];
  const wrongPositionWords: { index: number; word: string; expected: string }[] = [];

  builtWords.forEach((word, idx) => {
    const norm = normalizeWord(word);
    if (distractorSet.has(norm)) {
      tileStatuses.push('distractor');
      distractorsUsed.push(word);
    } else if (idx < targetWords.length && norm === normalizeWord(targetWords[idx])) {
      tileStatuses.push('correct');
    } else {
      tileStatuses.push('wrong_position');
      wrongPositionWords.push({
        index: idx + 1,
        word,
        expected: targetWords[idx] ?? '',
      });
    }
  });

  const nonDistractorCount = builtWords.filter((w) => !distractorSet.has(normalizeWord(w))).length;
  const missingWordsCount = Math.max(0, targetWords.length - nonDistractorCount);
  const extraWordsCount = Math.max(0, builtWords.length - targetWords.length);

  return {
    tileStatuses,
    distractorsUsed,
    wrongPositionWords,
    missingWordsCount,
    extraWordsCount,
  };
}

export function analyzeSequenceAttempt(
  currentOrderIds: string[],
  correctOrderIds: string[]
): SequenceAnalysis {
  const itemStatuses: ('correct' | 'wrong_position')[] = [];
  const wrongPositions: number[] = [];

  currentOrderIds.forEach((id, idx) => {
    if (id === correctOrderIds[idx]) {
      itemStatuses.push('correct');
    } else {
      itemStatuses.push('wrong_position');
      wrongPositions.push(idx + 1);
    }
  });

  return { itemStatuses, wrongPositions };
}

export function getPreAnswerHint(
  challenge: WeekChallenge,
  grammarFocus = ''
): BetoFeedbackPayload {
  const baseHint = challenge.hintEs || 'Lee despacio y fíjate en las palabras clave.';

  if (challenge.type === 'listening') {
    const pattern = findGrammarPattern(`${challenge.audioText} ${grammarFocus}`);
    const example = pickSafeExample(
      pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
      challenge.audioText,
      FALLBACK_HINT_EXAMPLE
    );
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs:
        challenge.mode === 'word_bank'
          ? `${baseHint} ${pattern ? pattern.ruleEs : 'Escucha con la tortuga para identificar la palabra exacta.'}`
          : `${baseHint} Escucha dos veces (normal y lento) buscando las palabras clave.`,
      example,
    };
  }

  if (challenge.type === 'memory') {
    const firstPair = challenge.pairs[0];
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs: `${baseHint} Di cada palabra en voz alta cuando voltees una tarjeta para recordarla mejor.`,
      example: firstPair
        ? {
            en: `Example word: "${firstPair.word}" means "${firstPair.spanish}".`,
            es: `Ejemplo de uso: "${firstPair.word}" significa "${firstPair.spanish}".`,
          }
        : FALLBACK_HINT_EXAMPLE,
    };
  }

  if (challenge.type === 'reading') {
    if (challenge.mode === 'sequence') {
      return {
        kind: 'hint',
        titleEs: 'Pista con ejemplo · Beto',
        explanationEs: `${baseHint} Busca qué ocurre al inicio, qué pasa en el medio y cómo termina la historia.`,
        example: {
          en: 'First, I wake up. Next, I eat breakfast. Finally, I go to school.',
          es: 'Primero me despierto. Luego desayuno. Finalmente voy al colegio.',
        },
      };
    }
    const pattern = findGrammarPattern(`${challenge.passageEn.join(' ')} ${grammarFocus}`);
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs: `${baseHint} Puedes volver a leer las líneas en inglés o tocar "Ver ayuda en español".`,
      example: pickSafeExample(
        pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
        challenge.passageEn.join(' '),
        FALLBACK_HINT_EXAMPLE
      ),
    };
  }

  if (challenge.type === 'word_search') {
    const firstTarget = challenge.targets[0];
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs: `${baseHint} Busca en línea recta (horizontal, vertical o diagonal). Todas las palabras están en mayúsculas.`,
      example: firstTarget
        ? {
            en: `We practice the word "${firstTarget.word.toLowerCase()}" in class.`,
            es: `Practicamos la palabra "${firstTarget.spanish}" en clase.`,
          }
        : FALLBACK_HINT_EXAMPLE,
    };
  }

  if (challenge.type === 'word_order') {
    const pattern = findGrammarPattern(`${challenge.correctSentence} ${grammarFocus}`);
    const example = pickSafeExample(
      pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
      challenge.correctSentence,
      FALLBACK_HINT_EXAMPLE
    );
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs: `${baseHint} ${pattern ? pattern.ruleEs : 'Observa este ejemplo resuelto con una estructura parecida:'}`,
      example,
    };
  }

  if (challenge.type === 'micro_story') {
    const pattern = findGrammarPattern(grammarFocus);
    return {
      kind: 'hint',
      titleEs: 'Pista con ejemplo · Beto',
      explanationEs: `${baseHint} Escucha la narración de la escena y fíjate en los detalles del personaje.`,
      example: pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
    };
  }

  // Arcade
  const leftLabel = `${challenge.leftBucket.labelEn} (${challenge.leftBucket.labelEs})`;
  const rightLabel = `${challenge.rightBucket.labelEn} (${challenge.rightBucket.labelEs})`;
  return {
    kind: 'hint',
    titleEs: 'Pista con ejemplo · Beto',
    explanationEs: `${baseHint} Lee la tarjeta antes de elegir entre "${leftLabel}" y "${rightLabel}".`,
    example: {
      en: 'Good habits help our community and nature stay healthy.',
      es: 'Los buenos hábitos ayudan a que nuestra comunidad y naturaleza estén sanas.',
    },
  };
}

export function getVisualChoiceErrorFeedback(params: {
  chosenLabel: string;
  chosenSpanish: string;
  correctLabel: string;
  correctSpanish: string;
  contextText: string;
  hintEs: string;
  grammarFocus?: string;
}): BetoFeedbackPayload {
  const { chosenLabel, chosenSpanish, contextText, hintEs, grammarFocus = '' } = params;
  const pattern = findGrammarPattern(`${contextText} ${grammarFocus}`);
  const example = pickSafeExample(
    pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
    contextText,
    FALLBACK_HINT_EXAMPLE
  );

  return {
    kind: 'error',
    titleEs: '¡Ups! Revisemos esa opción',
    wrongPartEs: `Elegiste: "${chosenLabel}" (${chosenSpanish})`,
    explanationEs: pattern
      ? `"${chosenLabel}" significa "${chosenSpanish}", pero no corresponde con lo que dice la frase. ${pattern.ruleEs}`
      : `"${chosenLabel}" significa "${chosenSpanish}", pero no coincide con las palabras clave de la pregunta.`,
    hintEs,
    example,
  };
}

export function getWordBankErrorFeedback(
  challenge: ListeningChallenge,
  chosenWord: string,
  grammarFocus = ''
): BetoFeedbackPayload {
  const parts = challenge.sentenceParts ?? ['', ''];
  const builtSentence = `${parts[0]}${chosenWord}${parts[1]}`;
  const pattern = findGrammarPattern(`${challenge.audioText} ${grammarFocus}`);
  const example = pickSafeExample(
    pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
    challenge.audioText,
    FALLBACK_HINT_EXAMPLE
  );

  return {
    kind: 'error',
    titleEs: 'Esa palabra no encaja en el espacio',
    wrongPartEs: `Tu oración quedó: "${builtSentence}"`,
    explanationEs: pattern
      ? `La palabra "${chosenWord}" no coincide con el audio ni con el sentido de la oración. ${pattern.ruleEs}`
      : `La palabra "${chosenWord}" no es la que escuchamos en el audio. Toca la tortuga para oír cada sílaba despacio.`,
    hintEs: challenge.hintEs,
    example,
  };
}

export function getWordOrderErrorFeedback(
  challenge: WordOrderChallenge,
  builtWords: string[],
  grammarFocus = ''
): { payload: BetoFeedbackPayload; analysis: WordOrderAnalysis } {
  const analysis = analyzeWordOrderAttempt(
    builtWords,
    challenge.correctSentence,
    challenge.extraDistractors ?? []
  );
  const pattern = findGrammarPattern(`${challenge.correctSentence} ${grammarFocus}`);
  const example = pickSafeExample(
    pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
    challenge.correctSentence,
    FALLBACK_HINT_EXAMPLE
  );

  const errorReasons: string[] = [];
  if (analysis.distractorsUsed.length > 0) {
    errorReasons.push(
      `La palabra "${analysis.distractorsUsed.join(', ')}" es un distractor y sobra en esta oración.`
    );
  }
  if (analysis.wrongPositionWords.length > 0) {
    const first = analysis.wrongPositionWords[0];
    errorReasons.push(
      `En la posición ${first.index} pusiste "${first.word}", pero ahí va otra palabra.`
    );
  }
  if (analysis.missingWordsCount > 0) {
    errorReasons.push(
      `Te falta agregar ${analysis.missingWordsCount} ${analysis.missingWordsCount === 1 ? 'palabra' : 'palabras'} para completar la idea.`
    );
  }

  const wrongPartEs = errorReasons.join(' ');
  const explanationEs = pattern
    ? `${pattern.ruleEs} Observa cómo se organiza este ejemplo parecido antes de tu nuevo intento:`
    : 'En inglés primero va quién realiza la acción (sujeto), luego el verbo y al final el complemento. Mira este ejemplo modelo:';

  return {
    analysis,
    payload: {
      kind: 'error',
      titleEs: '¡Casi! Revisa las fichas marcadas en rojo',
      wrongPartEs: wrongPartEs || `Tu orden actual fue: "${builtWords.join(' ')}"`,
      explanationEs,
      hintEs: challenge.hintEs,
      example,
    },
  };
}

export function getSequenceErrorFeedback(
  challenge: ReadingChallenge,
  currentOrderIds: string[]
): { payload: BetoFeedbackPayload; analysis: SequenceAnalysis } {
  const correctIds = (challenge.sequenceItems ?? []).map((item) => item.id);
  const analysis = analyzeSequenceAttempt(currentOrderIds, correctIds);

  return {
    analysis,
    payload: {
      kind: 'error',
      titleEs: 'El orden de la historia todavía no coincide',
      wrongPartEs:
        analysis.wrongPositions.length > 0
          ? `Las tarjetas en la posición ${analysis.wrongPositions.join(' y ')} están fuera de lugar (marcadas en rojo).`
          : 'Revisa el orden de los tres momentos.',
      explanationEs:
        'Compara tus tarjetas con la lectura de arriba: recuerda qué ocurrió primero, qué pasó después y qué sucedió al final.',
      hintEs: challenge.hintEs,
      example: {
        en: 'First, Mateo feels sick. Next, he visits the nurse. Finally, he rests.',
        es: 'Primero Mateo se siente mal. Luego visita a la enfermera. Al final descansa.',
      },
    },
  };
}

export function getMemoryMismatchFeedback(
  firstWord: string,
  firstSpanish: string,
  secondWord: string,
  secondSpanish: string
): BetoFeedbackPayload {
  const sameWord = normalizeWord(firstWord) === normalizeWord(secondWord);
  const example = sameWord
    ? FALLBACK_HINT_EXAMPLE
    : {
        en: `Remember: "${firstWord}" means "${firstSpanish}".`,
        es: `Recuerda: "${firstWord}" significa "${firstSpanish}", no "${secondSpanish}".`,
      };

  return {
    kind: 'error',
    titleEs: 'Estas dos tarjetas no son pareja',
    wrongPartEs: `Volteaste "${firstWord}" (${firstSpanish}) con "${secondWord}" (${secondSpanish}).`,
    explanationEs:
      'Fíjate muy bien en el dibujo, la pronunciación y la palabra escrita en inglés antes de voltear la segunda tarjeta.',
    example,
  };
}

export function getWordSearchErrorFeedback(
  formedLetters: string,
  remainingTargets: { word: string; spanish: string; emoji: string }[]
): BetoFeedbackPayload {
  const nextWord = remainingTargets[0];
  return {
    kind: 'error',
    titleEs: 'Esa selección no forma una palabra de la lista',
    wrongPartEs: `Marcaste las letras "${formedLetters}".`,
    explanationEs:
      'Las palabras solo van en línea recta (horizontal, vertical o diagonal). Mira las letras iniciales de las palabras que te faltan.',
    example: nextWord
      ? {
          en: `Find "${nextWord.word.toLowerCase()}" (${nextWord.spanish}) starting with "${nextWord.word[0]}".`,
          es: `Busca "${nextWord.word}" (${nextWord.spanish}): empieza por la letra "${nextWord.word[0]}".`,
        }
      : FALLBACK_HINT_EXAMPLE,
  };
}

export function getArcadeErrorFeedback(
  item: ArcadeItem,
  chosenBucket: 'left' | 'right',
  challenge: ArcadeChallenge
): BetoFeedbackPayload {
  const wrongBucketMeta = chosenBucket === 'left' ? challenge.leftBucket : challenge.rightBucket;
  const correctBucketMeta = item.bucket === 'left' ? challenge.leftBucket : challenge.rightBucket;

  return {
    kind: 'error',
    titleEs: '¡Cuidado! Esa tarjeta va en la otra categoría',
    wrongPartEs: `Pusiste "${item.word}" (${item.spanish}) en "${wrongBucketMeta.labelEn} · ${wrongBucketMeta.labelEs}".`,
    explanationEs: `"${item.word}" (${item.spanish}) corresponde a "${correctBucketMeta.labelEn} (${correctBucketMeta.labelEs})".`,
    hintEs: challenge.hintEs,
    example: {
      en: `${item.word} belongs to ${correctBucketMeta.labelEn.toLowerCase()}.`,
      es: `"${item.word}" (${item.spanish}) pertenece a "${correctBucketMeta.labelEs}".`,
    },
  };
}

export function getMicroStoryCheckpointErrorFeedback(
  scene: MicroStoryScene,
  chosenText: string,
  hintEs: string,
  grammarFocus = ''
): BetoFeedbackPayload {
  const sceneContext = scene.narrationEn.join(' ');
  const pattern = findGrammarPattern(`${sceneContext} ${grammarFocus}`);
  const example = pickSafeExample(
    pattern?.hintExample ?? FALLBACK_HINT_EXAMPLE,
    sceneContext,
    FALLBACK_HINT_EXAMPLE
  );

  return {
    kind: 'error',
    titleEs: '¡Leamos otra vez la escena!',
    wrongPartEs: `Elegiste: "${chosenText}"`,
    explanationEs:
      'Esa opción no coincide con lo que ocurrió en esta parte del cuento. Escucha la narración o toca "Traducir escena" para verificar.',
    hintEs,
    example,
  };
}

export function getSuccessReinforcementExample(
  challenge: WeekChallenge,
  grammarFocus = ''
): BetoFeedbackPayload {
  let context = grammarFocus;
  let forbidden = '';

  if (challenge.type === 'listening') {
    context += ` ${challenge.audioText}`;
    forbidden = challenge.audioText;
  } else if (challenge.type === 'word_order') {
    context += ` ${challenge.correctSentence}`;
    forbidden = challenge.correctSentence;
  } else if (challenge.type === 'reading') {
    context += ` ${challenge.passageEn.join(' ')}`;
  } else if (challenge.type === 'memory') {
    const p = challenge.pairs[0];
    return {
      kind: 'success',
      titleEs: '¡Excelente memoria! Ejemplo cotidiano:',
      explanationEs: 'Así puedes usar una de estas palabras en tu día a día:',
      example: p
        ? {
            en: `Today in English class we practiced "${p.word}"!`,
            es: `¡Hoy en clase de inglés practicamos "${p.word}" (${p.spanish})!`,
          }
        : FALLBACK_SUCCESS_EXAMPLE,
    };
  } else if (challenge.type === 'word_search') {
    const t = challenge.targets[0];
    return {
      kind: 'success',
      titleEs: '¡Sopa de letras completada! Ejemplo cotidiano:',
      explanationEs: 'Usa el vocabulario que encontraste en oraciones reales:',
      example: t
        ? {
            en: `Can you spell "${t.word.toLowerCase()}"? Yes, I can!`,
            es: `¿Puedes deletrear "${t.spanish}"? ¡Sí puedo!`,
          }
        : FALLBACK_SUCCESS_EXAMPLE,
    };
  }

  const pattern = findGrammarPattern(context);
  const example = pickSafeExample(
    pattern?.successExample ?? FALLBACK_SUCCESS_EXAMPLE,
    forbidden,
    FALLBACK_SUCCESS_EXAMPLE
  );

  return {
    kind: 'success',
    titleEs: '¡Muy bien! Ejemplo de uso cotidiano:',
    explanationEs: pattern
      ? pattern.ruleEs
      : 'Escucha cómo usar esta idea en una conversación real:',
    example,
  };
}
