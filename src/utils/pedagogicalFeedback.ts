import type {
  ArcadeChallenge,
  ArcadeItem,
  ListeningChallenge,
  MicroStoryScene,
  WeekChallenge,
  WordOrderChallenge,
} from '../types/curriculum';

export interface BilingualExample {
  en: string;
  es: string;
}

export type SceneTheme =
  | 'hygiene'
  | 'health_ailments'
  | 'healthy_food'
  | 'sports_routine'
  | 'family_traits'
  | 'emotions_peace'
  | 'colombian_fauna'
  | 'eco_habitats'
  | 'prepositions'
  | 'time_clock'
  | 'city_transport'
  | 'global_digital';

export interface GrammarBlock {
  role: 'Sujeto' | 'Verbo' | 'Complemento';
  textEn: string;
  textEs: string;
}

export interface VisualComparisonClue {
  chosenLabel: string;
  chosenEmoji: string;
  chosenMeaningEs: string;
  targetClueLabel: string;
  targetClueEmoji: string;
}

export interface BetoFeedbackPayload {
  kind: 'error' | 'hint' | 'success';
  titleEs: string;
  explanationEs: string;
  wrongPartEs?: string;
  hintEs?: string;
  example: BilingualExample;
  sceneTheme: SceneTheme;
  exerciseCategory: 'multiple_choice' | 'open_sentence';
  grammarBlocks: GrammarBlock[];
  visualComparison?: VisualComparisonClue;
  step1Label?: string;
  step2Label?: string;
  step3Label?: string;
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
  wrongPositions: number[];
}

interface TopicBlueprint {
  sceneTheme: SceneTheme;
  topicEs: string;
  clueLabel: string;
  clueEmoji: string;
  ruleEs: string;
  modelBlocks: [GrammarBlock, GrammarBlock, GrammarBlock];
  modelExample: BilingualExample;
  altBlocks: [GrammarBlock, GrammarBlock, GrammarBlock];
  altExample: BilingualExample;
  successExample: BilingualExample;
}

const WEEK_TOPIC_BLUEPRINTS: Record<number, TopicBlueprint> = {
  1: {
    sceneTheme: 'hygiene',
    topicEs: 'hábitos de higiene diaria con agua y jabón',
    clueLabel: 'Higiene personal',
    clueEmoji: '🧼',
    ruleEs: 'Para dar instrucciones de aseo usamos el verbo directo: "Wash..." (lavar) o "Brush..." (cepillar).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'You should', textEs: 'Tú deberías' },
      { role: 'Verbo', textEn: 'dry', textEs: 'secar' },
      { role: 'Complemento', textEn: 'your hands with a clean towel', textEs: 'tus manos con una toalla limpia' },
    ],
    modelExample: { en: 'You should dry your hands with a clean towel.', es: 'Deberías secar tus manos con una toalla limpia.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'use', textEs: 'usamos' },
      { role: 'Complemento', textEn: 'clean water every morning', textEs: 'agua limpia cada mañana' },
    ],
    altExample: { en: 'We use clean water every morning.', es: 'Usamos agua limpia cada mañana.' },
    successExample: { en: 'Let’s wash our hands before eating lunch.', es: 'Lavémonos las manos antes de almorzar.' },
  },
  2: {
    sceneTheme: 'health_ailments',
    topicEs: 'dolencias del cuerpo y el verbo have / has',
    clueLabel: 'Dolencia y cuidado',
    clueEmoji: '🤒',
    ruleEs: 'Con "He / She" usamos "has" para expresar una dolencia; con "I / You / We" usamos "have".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'He', textEs: 'Él' },
      { role: 'Verbo', textEn: 'has', textEs: 'tiene' },
      { role: 'Complemento', textEn: 'a high fever today', textEs: 'fiebre alta hoy' },
    ],
    modelExample: { en: 'He has a high fever today.', es: 'Él tiene fiebre alta hoy.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'My sister', textEs: 'Mi hermana' },
      { role: 'Verbo', textEn: 'has', textEs: 'tiene' },
      { role: 'Complemento', textEn: 'a mild cough at home', textEs: 'una tos leve en casa' },
    ],
    altExample: { en: 'My sister has a mild cough at home.', es: 'Mi hermana tiene una tos leve en casa.' },
    successExample: { en: 'When you have a fever, you should rest well.', es: 'Cuando tienes fiebre, deberías descansar bien.' },
  },
  3: {
    sceneTheme: 'healthy_food',
    topicEs: 'lonchera saludable y uso de should / shouldn’t',
    clueLabel: 'Alimentos saludables',
    clueEmoji: '🥭',
    ruleEs: 'Usamos "should" para alimentos nutritivos como frutas y "shouldn’t" para dulces o gaseosas.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'You', textEs: 'Tú' },
      { role: 'Verbo', textEn: 'should eat', textEs: 'deberías comer' },
      { role: 'Complemento', textEn: 'fresh papaya and carrots', textEs: 'papaya fresca y zanahorias' },
    ],
    modelExample: { en: 'You should eat fresh papaya and carrots.', es: 'Deberías comer papaya fresca y zanahorias.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Children', textEs: 'Los niños' },
      { role: 'Verbo', textEn: "shouldn't eat", textEs: 'no deberían comer' },
      { role: 'Complemento', textEn: 'too much candy at break', textEs: 'demasiados dulces en el descanso' },
    ],
    altExample: { en: "Children shouldn't eat too much candy at break.", es: 'Los niños no deberían comer demasiados dulces en el descanso.' },
    successExample: { en: 'I bring a sweet banana in my green lunchbox.', es: 'Traigo un banano dulce en mi lonchera verde.' },
  },
  4: {
    sceneTheme: 'sports_routine',
    topicEs: 'rutina saludable de descanso, agua y ejercicio',
    clueLabel: 'Rutina saludable',
    clueEmoji: '🏃',
    ruleEs: 'En inglés primero va quién realiza el hábito (Sujeto), luego "should" + acción y al final la frecuencia.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Students', textEs: 'Los estudiantes' },
      { role: 'Verbo', textEn: 'should drink', textEs: 'deberían tomar' },
      { role: 'Complemento', textEn: 'fresh water after sports', textEs: 'agua fresca después del deporte' },
    ],
    modelExample: { en: 'Students should drink fresh water after sports.', es: 'Los estudiantes deberían tomar agua fresca después del deporte.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'eat', textEs: 'comemos' },
      { role: 'Complemento', textEn: 'a healthy breakfast every day', textEs: 'un desayuno saludable cada día' },
    ],
    altExample: { en: 'We eat a healthy breakfast every day.', es: 'Comemos un desayuno saludable cada día.' },
    successExample: { en: 'Sleeping eight hours keeps our body strong.', es: 'Dormir ocho horas mantiene nuestro cuerpo fuerte.' },
  },
  5: {
    sceneTheme: 'health_ailments',
    topicEs: 'remedios médicos y consejos en la clínica',
    clueLabel: 'Visita médica',
    clueEmoji: '🩺',
    ruleEs: 'Para dar recomendaciones médicas en clase combinamos "You should" + verbo en forma simple (take, drink, visit).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'You', textEs: 'Tú' },
      { role: 'Verbo', textEn: 'should drink', textEs: 'deberías tomar' },
      { role: 'Complemento', textEn: 'warm chamomile tea slowly', textEs: 'té tibio de manzanilla despacio' },
    ],
    modelExample: { en: 'You should drink warm chamomile tea slowly.', es: 'Deberías tomar té tibio de manzanilla despacio.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'The nurse', textEs: 'La enfermera' },
      { role: 'Verbo', textEn: 'checks', textEs: 'revisa' },
      { role: 'Complemento', textEn: 'your temperature with care', textEs: 'tu temperatura con cuidado' },
    ],
    altExample: { en: 'The nurse checks your temperature with care.', es: 'La enfermera revisa tu temperatura con cuidado.' },
    successExample: { en: 'A bandage protects a small cut on your knee.', es: 'Una curita protege una herida pequeña en tu rodilla.' },
  },
  6: {
    sceneTheme: 'sports_routine',
    topicEs: 'deportes favoritos y actividades físicas al aire libre',
    clueLabel: 'Juego activo',
    clueEmoji: '⚽',
    ruleEs: 'Con "like" usamos verbo con "-ing" (playing, running), y con "Let’s" el verbo va simple (Let’s jump).',
    modelBlocks: [
      { role: 'Sujeto', textEn: "Let's", textEs: 'Vamos a' },
      { role: 'Verbo', textEn: 'play', textEs: 'jugar' },
      { role: 'Complemento', textEn: 'basketball in the school yard', textEs: 'baloncesto en el patio del colegio' },
    ],
    modelExample: { en: "Let's play basketball in the school yard.", es: 'Vamos a jugar baloncesto en el patio del colegio.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'They', textEs: 'Ellos' },
      { role: 'Verbo', textEn: 'like riding', textEs: 'les gusta montar' },
      { role: 'Complemento', textEn: 'bicycles on Sunday morning', textEs: 'bicicleta el domingo por la mañana' },
    ],
    altExample: { en: 'They like riding bicycles on Sunday morning.', es: 'Les gusta montar bicicleta el domingo por la mañana.' },
    successExample: { en: 'Playing sports makes our heart happy and strong.', es: 'Hacer deporte pone nuestro corazón feliz y fuerte.' },
  },
  7: {
    sceneTheme: 'sports_routine',
    topicEs: 'bienestar emocional, calma y autocuidado',
    clueLabel: 'Calma y descanso',
    clueEmoji: '🌬️',
    ruleEs: 'Expresamos estados con "I feel + adjetivo" (calm, tired) y consejos con "should + verbo" (breathe slowly).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'should talk', textEs: 'deberíamos hablar' },
      { role: 'Complemento', textEn: 'with family when worried', textEs: 'con la familia cuando estamos preocupados' },
    ],
    modelExample: { en: 'We should talk with family when worried.', es: 'Deberíamos hablar con la familia cuando estamos preocupados.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'She', textEs: 'Ella' },
      { role: 'Verbo', textEn: 'feels', textEs: 'se siente' },
      { role: 'Complemento', textEn: 'calm after breathing slowly', textEs: 'tranquila después de respirar despacio' },
    ],
    altExample: { en: 'She feels calm after breathing slowly.', es: 'Ella se siente tranquila después de respirar despacio.' },
    successExample: { en: 'Taking three deep breaths helps you feel calm.', es: 'Respirar profundo tres veces te ayuda a sentirte tranquilo.' },
  },
  8: {
    sceneTheme: 'healthy_food',
    topicEs: 'el menú escolar y cantidades (How many / How much)',
    clueLabel: 'Menú escolar',
    clueEmoji: '🥗',
    ruleEs: 'Usamos "How many" para alimentos contables en plural (oranges, eggs) y "How much" para líquidos o masa (milk, rice).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'How many', textEs: 'Cuántas' },
      { role: 'Verbo', textEn: 'oranges are', textEs: 'naranjas hay' },
      { role: 'Complemento', textEn: 'on the kitchen tray', textEs: 'en la bandeja de la cocina' },
    ],
    modelExample: { en: 'How many oranges are on the kitchen tray?', es: '¿Cuántas naranjas hay en la bandeja de la cocina?' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Our school', textEs: 'Nuestro colegio' },
      { role: 'Verbo', textEn: 'serves', textEs: 'sirve' },
      { role: 'Complemento', textEn: 'beans, rice, and fresh fruit', textEs: 'fríjoles, arroz y fruta fresca' },
    ],
    altExample: { en: 'Our school serves beans, rice, and fresh fruit.', es: 'Nuestro colegio sirve fríjoles, arroz y fruta fresca.' },
    successExample: { en: 'A balanced plate includes protein, rice, and salad.', es: 'Un plato balanceado incluye proteína, arroz y ensalada.' },
  },
  9: {
    sceneTheme: 'hygiene',
    topicEs: 'repaso integral de salud, higiene, dolencias y nutrición',
    clueLabel: 'Salud integral',
    clueEmoji: '🏆',
    ruleEs: 'Integramos "should" para hábitos sanos, "has/have" para dolencias e imperativos para el cuidado diario.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Children', textEs: 'Los niños' },
      { role: 'Verbo', textEn: 'should drink', textEs: 'deberían tomar' },
      { role: 'Complemento', textEn: 'water and sleep early', textEs: 'agua y dormir temprano' },
    ],
    modelExample: { en: 'Children should drink water and sleep early.', es: 'Los niños deberían tomar agua y dormir temprano.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Mateo', textEs: 'Mateo' },
      { role: 'Verbo', textEn: 'brushes', textEs: 'cepilla' },
      { role: 'Complemento', textEn: 'his teeth three times daily', textEs: 'sus dientes tres veces al día' },
    ],
    altExample: { en: 'Mateo brushes his teeth three times daily.', es: 'Mateo cepilla sus dientes tres veces al día.' },
    successExample: { en: 'Healthy habits make us feel strong every week!', es: '¡Los hábitos saludables nos hacen sentir fuertes cada semana!' },
  },
  10: {
    sceneTheme: 'family_traits',
    topicEs: 'familia, amigos y posesivos (my, your, his, her)',
    clueLabel: 'Familia y posesivos',
    clueEmoji: '👨‍👩‍👧‍👦',
    ruleEs: 'Usamos "his" cuando hablamos de algo de un niño/hombre y "her" cuando pertenece a una niña/mujer.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Her name', textEs: 'Su nombre (de ella)' },
      { role: 'Verbo', textEn: 'is', textEs: 'es' },
      { role: 'Complemento', textEn: 'Elena, my best friend', textEs: 'Elena, mi mejor amiga' },
    ],
    modelExample: { en: 'Her name is Elena, my best friend.', es: 'Su nombre es Elena, mi mejor amiga.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'This', textEs: 'Este' },
      { role: 'Verbo', textEn: 'is', textEs: 'es' },
      { role: 'Complemento', textEn: 'my little brother Mateo', textEs: 'mi hermano menor Mateo' },
    ],
    altExample: { en: 'This is my little brother Mateo.', es: 'Este es mi hermano menor Mateo.' },
    successExample: { en: 'My grandmother tells wonderful stories in the afternoon.', es: 'Mi abuela cuenta historias maravillosas en la tarde.' },
  },
  11: {
    sceneTheme: 'family_traits',
    topicEs: 'rasgos físicos y verbo to be (is / are)',
    clueLabel: 'Rasgos físicos',
    clueEmoji: '👧🏽',
    ruleEs: 'Con una sola persona ("My friend", "She", "He") usamos "is"; con varias personas ("They", "We") usamos "are".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'My cousin', textEs: 'Mi prima' },
      { role: 'Verbo', textEn: 'is', textEs: 'es' },
      { role: 'Complemento', textEn: 'short with curly hair', textEs: 'baja con cabello crespo' },
    ],
    modelExample: { en: 'My cousin is short with curly hair.', es: 'Mi prima es baja con cabello crespo.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'He', textEs: 'Él' },
      { role: 'Verbo', textEn: 'has', textEs: 'tiene' },
      { role: 'Complemento', textEn: 'big brown eyes and glasses', textEs: 'ojos cafés grandes y gafas' },
    ],
    altExample: { en: 'He has big brown eyes and glasses.', es: 'Él tiene ojos cafés grandes y gafas.' },
    successExample: { en: 'Everyone in our classroom looks unique and special.', es: 'Cada persona en nuestro salón se ve única y especial.' },
  },
  12: {
    sceneTheme: 'emotions_peace',
    topicEs: 'valores humanos y adjetivos de personalidad',
    clueLabel: 'Valores y respeto',
    clueEmoji: '🤝',
    ruleEs: 'Para describir cualidades usamos "Sujeto + is/are + valor" (kind, honest, respectful, friendly).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'My classmate', textEs: 'Mi compañero' },
      { role: 'Verbo', textEn: 'is', textEs: 'es' },
      { role: 'Complemento', textEn: 'friendly and very respectful', textEs: 'amigable y muy respetuoso' },
    ],
    modelExample: { en: 'My classmate is friendly and very respectful.', es: 'Mi compañero es amigable y muy respetuoso.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'An honest student', textEs: 'Un estudiante honesto' },
      { role: 'Verbo', textEn: 'always tells', textEs: 'siempre dice' },
      { role: 'Complemento', textEn: 'the truth with kindness', textEs: 'la verdad con amabilidad' },
    ],
    altExample: { en: 'An honest student always tells the truth with kindness.', es: 'Un estudiante honesto siempre dice la verdad con amabilidad.' },
    successExample: { en: 'Being kind makes our school a happier place.', es: 'Ser amable hace de nuestro colegio un lugar más feliz.' },
  },
  13: {
    sceneTheme: 'emotions_peace',
    topicEs: 'emociones y sentimientos en el salón de clase',
    clueLabel: 'Emociones',
    clueEmoji: '😊',
    ruleEs: 'Preguntamos con "How do you feel?" (con "do", no "is") y respondemos "I feel..." o "I am...".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'How', textEs: 'Cómo' },
      { role: 'Verbo', textEn: 'do you feel', textEs: 'te sientes' },
      { role: 'Complemento', textEn: 'before the art class', textEs: 'antes de la clase de arte' },
    ],
    modelExample: { en: 'How do you feel before the art class?', es: '¿Cómo te sientes antes de la clase de arte?' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'I', textEs: 'Yo' },
      { role: 'Verbo', textEn: 'feel', textEs: 'me siento' },
      { role: 'Complemento', textEn: 'excited about the school trip', textEs: 'emocionado por la salida escolar' },
    ],
    altExample: { en: 'I feel excited about the school trip.', es: 'Me siento emocionado por la salida escolar.' },
    successExample: { en: 'All emotions are welcome when we express them respectfully.', es: 'Todas las emociones son válidas cuando las expresamos con respeto.' },
  },
  14: {
    sceneTheme: 'emotions_peace',
    topicEs: 'palabras mágicas de cortesía y buenos modales',
    clueLabel: 'Cortesía',
    clueEmoji: '🙏',
    ruleEs: 'Decimos "please" al pedir algo, "thank you" al agradecer, "you are welcome" al responder y "sorry" al disculparnos.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Thank you', textEs: 'Muchas gracias' },
      { role: 'Verbo', textEn: 'for sharing', textEs: 'por compartir' },
      { role: 'Complemento', textEn: 'your colored pencils', textEs: 'tus lápices de colores' },
    ],
    modelExample: { en: 'Thank you for sharing your colored pencils.', es: 'Muchas gracias por compartir tus lápices de colores.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Excuse me,', textEs: 'Disculpa,' },
      { role: 'Verbo', textEn: 'may I pass', textEs: 'puedo pasar' },
      { role: 'Complemento', textEn: 'to my desk please', textEs: 'a mi pupitre por favor' },
    ],
    altExample: { en: 'Excuse me, may I pass to my desk please?', es: 'Disculpa, ¿puedo pasar a mi pupitre por favor?' },
    successExample: { en: 'Saying "please" and "thank you" opens doors everywhere!', es: '¡Decir "por favor" y "gracias" abre puertas en todas partes!' },
  },
  15: {
    sceneTheme: 'emotions_peace',
    topicEs: 'acuerdos de convivencia en el aula',
    clueLabel: 'Acuerdos de aula',
    clueEmoji: '✋',
    ruleEs: 'Usamos "We + acción" (We listen, We share) para acuerdos positivos y "Don’t..." para lo que evitamos.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'raise', textEs: 'levantamos' },
      { role: 'Complemento', textEn: 'our hands before speaking', textEs: 'nuestras manos antes de hablar' },
    ],
    modelExample: { en: 'We raise our hands before speaking.', es: 'Levantamos nuestras manos antes de hablar.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Good friends', textEs: 'Los buenos amigos' },
      { role: 'Verbo', textEn: 'share', textEs: 'comparten' },
      { role: 'Complemento', textEn: 'books and take turns', textEs: 'libros y toman turnos' },
    ],
    altExample: { en: 'Good friends share books and take turns.', es: 'Los buenos amigos comparten libros y toman turnos.' },
    successExample: { en: 'Listening to each other helps everyone learn better.', es: 'Escucharnos unos a otros ayuda a que todos aprendamos mejor.' },
  },
  16: {
    sceneTheme: 'family_traits',
    topicEs: 'celebrar la diversidad y culturas de Colombia',
    clueLabel: 'Diversidad cultural',
    clueEmoji: '🎶',
    ruleEs: 'Con "We / They" usamos "are", y para hablar de gustos usamos "loves / likes + verbo-ing".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'He', textEs: 'Él' },
      { role: 'Verbo', textEn: 'is from', textEs: 'es de' },
      { role: 'Complemento', textEn: 'Quibdó and loves music', textEs: 'Quibdó y ama la música' },
    ],
    modelExample: { en: 'He is from Quibdó and loves music.', es: 'Él es de Quibdó y ama la música.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'celebrate', textEs: 'celebramos' },
      { role: 'Complemento', textEn: 'different traditions with joy', textEs: 'diferentes tradiciones con alegría' },
    ],
    altExample: { en: 'We celebrate different traditions with joy.', es: 'Celebramos diferentes tradiciones con alegría.' },
    successExample: { en: 'Our differences make Colombia rich in culture and friendship.', es: 'Nuestras diferencias hacen a Colombia rica en cultura y amistad.' },
  },
  17: {
    sceneTheme: 'emotions_peace',
    topicEs: 'resolver conflictos pacíficamente con diálogo',
    clueLabel: 'Diálogo y paz',
    clueEmoji: '🕊️',
    ruleEs: 'Para resolver un problema usamos "Don’t shout" (no grites) y "Let’s talk" (hablemos).',
    modelBlocks: [
      { role: 'Sujeto', textEn: "Let's", textEs: 'Vamos a' },
      { role: 'Verbo', textEn: 'listen', textEs: 'escuchar' },
      { role: 'Complemento', textEn: 'calmly and make a deal', textEs: 'con calma y hacer un acuerdo' },
    ],
    modelExample: { en: "Let's listen calmly and make a deal.", es: 'Escuchemos con calma y hagamos un acuerdo.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'I', textEs: 'Yo' },
      { role: 'Verbo', textEn: 'forgive', textEs: 'perdono a' },
      { role: 'Complemento', textEn: 'my friend after talking', textEs: 'mi amigo después de dialogar' },
    ],
    altExample: { en: 'I forgive my friend after talking.', es: 'Perdono a mi amigo después de dialogar.' },
    successExample: { en: 'A calm conversation solves problems much better than shouting.', es: 'Una conversación tranquila resuelve problemas mucho mejor que gritar.' },
  },
  18: {
    sceneTheme: 'emotions_peace',
    topicEs: 'Festival de Paz y convivencia escolar',
    clueLabel: 'Festival de paz',
    clueEmoji: '🌟',
    ruleEs: 'Combinamos familia, emociones, cortesía y respeto con "We + verbo en presente" y "is/are".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Our class', textEs: 'Nuestra clase' },
      { role: 'Verbo', textEn: 'builds', textEs: 'construye' },
      { role: 'Complemento', textEn: 'peace with kind words', textEs: 'paz con palabras amables' },
    ],
    modelExample: { en: 'Our class builds peace with kind words.', es: 'Nuestra clase construye paz con palabras amables.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Friends', textEs: 'Los amigos' },
      { role: 'Verbo', textEn: 'help', textEs: 'ayudan' },
      { role: 'Complemento', textEn: 'each other at school', textEs: 'unos a otros en el colegio' },
    ],
    altExample: { en: 'Friends help each other at school.', es: 'Los amigos se ayudan unos a otros en el colegio.' },
    successExample: { en: 'Congratulations! Peace begins with respect every day.', es: '¡Felicitaciones! La paz empieza con respeto cada día.' },
  },
  19: {
    sceneTheme: 'colombian_fauna',
    topicEs: 'fauna colombiana (cóndor, oso de anteojos, jaguar, delfín)',
    clueLabel: 'Fauna de Colombia',
    clueEmoji: '🦅',
    ruleEs: 'Para hablar de dónde vive un animal en singular agregamos "-s" al verbo: "The jaguar lives in...".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'The pink dolphin', textEs: 'El delfín rosado' },
      { role: 'Verbo', textEn: 'lives', textEs: 'vive' },
      { role: 'Complemento', textEn: 'in the Amazon river', textEs: 'en el río Amazonas' },
    ],
    modelExample: { en: 'The pink dolphin lives in the Amazon river.', es: 'El delfín rosado vive en el río Amazonas.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'A colorful toucan', textEs: 'Un tucán colorido' },
      { role: 'Verbo', textEn: 'eats', textEs: 'come' },
      { role: 'Complemento', textEn: 'sweet fruit in the forest', textEs: 'fruta dulce en el bosque' },
    ],
    altExample: { en: 'A colorful toucan eats sweet fruit in the forest.', es: 'Un tucán colorido come fruta dulce en el bosque.' },
    successExample: { en: 'Colombia is home to the spectacled bear and the Andean condor!', es: '¡Colombia es hogar del oso de anteojos y el cóndor andino!' },
  },
  20: {
    sceneTheme: 'colombian_fauna',
    topicEs: 'animales salvajes/de granja y uso de There is / There are',
    clueLabel: 'There is / There are',
    clueEmoji: '🐸',
    ruleEs: 'Usamos "There is" cuando hay UN solo animal, y "There are" cuando contamos DOS o más animales.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'There is', textEs: 'Hay (uno)' },
      { role: 'Verbo', textEn: 'a white cow', textEs: 'una vaca blanca' },
      { role: 'Complemento', textEn: 'on the green farm', textEs: 'en la granja verde' },
    ],
    modelExample: { en: 'There is a white cow on the green farm.', es: 'Hay una vaca blanca en la granja verde.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'There are', textEs: 'Hay (varios)' },
      { role: 'Verbo', textEn: 'four yellow ducks', textEs: 'cuatro patos amarillos' },
      { role: 'Complemento', textEn: 'in the small lake', textEs: 'en el lago pequeño' },
    ],
    altExample: { en: 'There are four yellow ducks in the small lake.', es: 'Hay cuatro patos amarillos en el lago pequeño.' },
    successExample: { en: 'There are wild jaguars in the forest and cows on the farm.', es: 'Hay jaguares salvajes en la selva y vacas en la granja.' },
  },
  21: {
    sceneTheme: 'eco_habitats',
    topicEs: 'hábitats naturales (forest, river, ocean, farm, mountain)',
    clueLabel: 'Hábitats naturales',
    clueEmoji: '🏞️',
    ruleEs: 'Cada animal pertenece a su hábitat: usamos "lives in the..." (forest, river, ocean, mountain).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'The whale', textEs: 'La ballena' },
      { role: 'Verbo', textEn: 'lives', textEs: 'vive' },
      { role: 'Complemento', textEn: 'in the blue ocean', textEs: 'en el océano azul' },
    ],
    modelExample: { en: 'The whale lives in the blue ocean.', es: 'La ballena vive en el océano azul.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'The condor', textEs: 'El cóndor' },
      { role: 'Verbo', textEn: 'flies', textEs: 'vuela' },
      { role: 'Complemento', textEn: 'above the high mountain', textEs: 'sobre la montaña alta' },
    ],
    altExample: { en: 'The condor flies above the high mountain.', es: 'El cóndor vuela sobre la montaña alta.' },
    successExample: { en: 'Every habitat gives food and shelter to living beings.', es: 'Cada hábitat brinda alimento y refugio a los seres vivos.' },
  },
  22: {
    sceneTheme: 'colombian_fauna',
    topicEs: 'habilidades de los animales con can / can’t',
    clueLabel: 'Habilidades (can/can’t)',
    clueEmoji: '🐒',
    ruleEs: 'Después de "can" o "can’t" siempre va el verbo de habilidad sin cambios: "can climb", "can’t fly".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'A parrot', textEs: 'Un loro' },
      { role: 'Verbo', textEn: 'can fly', textEs: 'puede volar' },
      { role: 'Complemento', textEn: 'across the green valley', textEs: 'por el valle verde' },
    ],
    modelExample: { en: 'A parrot can fly across the green valley.', es: 'Un loro puede volar por el valle verde.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'A turtle', textEs: 'Una tortuga' },
      { role: 'Verbo', textEn: 'can swim,', textEs: 'puede nadar,' },
      { role: 'Complemento', textEn: "but it can't jump", textEs: 'pero no puede saltar' },
    ],
    altExample: { en: "A turtle can swim, but it can't jump.", es: 'Una tortuga puede nadar, pero no puede saltar.' },
    successExample: { en: 'Monkeys can climb trees fast, while fish can swim underwater!', es: '¡Los micos trepan árboles rápido, mientras los peces nadan bajo el agua!' },
  },
  23: {
    sceneTheme: 'eco_habitats',
    topicEs: 'ahorro de agua y energía eléctrica',
    clueLabel: 'Ahorro de agua',
    clueEmoji: '💧',
    ruleEs: 'Para cuidar los recursos usamos "Turn off..." (apagar/cerrar) y "Save..." (ahorrar).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Always', textEs: 'Siempre' },
      { role: 'Verbo', textEn: 'turn off', textEs: 'apaga' },
      { role: 'Complemento', textEn: 'the lights during the day', textEs: 'las luces durante el día' },
    ],
    modelExample: { en: 'Always turn off the lights during the day.', es: 'Siempre apaga las luces durante el día.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'save', textEs: 'ahorramos' },
      { role: 'Complemento', textEn: 'water while brushing teeth', textEs: 'agua mientras nos cepillamos' },
    ],
    altExample: { en: 'We save water while brushing teeth.', es: 'Ahorramos agua mientras nos cepillamos.' },
    successExample: { en: 'Closing the tap saves dozens of liters of water every week!', es: '¡Cerrar la llave ahorra decenas de litros de agua cada semana!' },
  },
  24: {
    sceneTheme: 'eco_habitats',
    topicEs: 'las 3R (Reduce, Reuse, Recycle) y separación de residuos',
    clueLabel: 'Reciclaje 3R',
    clueEmoji: '♻️',
    ruleEs: 'Usamos "We should recycle..." seguido del material limpio (paper, plastic, glass).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Students', textEs: 'Los estudiantes' },
      { role: 'Verbo', textEn: 'should reuse', textEs: 'deberían reutilizar' },
      { role: 'Complemento', textEn: 'clean glass jars at home', textEs: 'frascos de vidrio limpios en casa' },
    ],
    modelExample: { en: 'Students should reuse clean glass jars at home.', es: 'Los estudiantes deberían reutilizar frascos de vidrio limpios en casa.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'put', textEs: 'ponemos' },
      { role: 'Complemento', textEn: 'dry paper in the white bin', textEs: 'papel seco en la caneca blanca' },
    ],
    altExample: { en: 'We put dry paper in the white bin.', es: 'Ponemos papel seco en la caneca blanca.' },
    successExample: { en: 'Recycling clean plastic and paper protects our planet!', es: '¡Reciclar plástico y papel limpio protege nuestro planeta!' },
  },
  25: {
    sceneTheme: 'eco_habitats',
    topicEs: 'sembrar árboles y cuidar las plantas',
    clueLabel: 'Sembrar árboles',
    clueEmoji: '🌱',
    ruleEs: 'Para invitar a cuidar el planeta empezamos con "Let us..." o "Let’s..." + verbo (plant, water, protect).',
    modelBlocks: [
      { role: 'Sujeto', textEn: "Let's", textEs: 'Vamos a' },
      { role: 'Verbo', textEn: 'water', textEs: 'regar' },
      { role: 'Complemento', textEn: 'the young seeds with care', textEs: 'las semillas jóvenes con cuidado' },
    ],
    modelExample: { en: "Let's water the young seeds with care.", es: 'Vamos a regar las semillas jóvenes con cuidado.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Trees', textEs: 'Los árboles' },
      { role: 'Verbo', textEn: 'give', textEs: 'dan' },
      { role: 'Complemento', textEn: 'fresh air and shade for birds', textEs: 'aire fresco y sombra para las aves' },
    ],
    altExample: { en: 'Trees give fresh air and shade for birds.', es: 'Los árboles dan aire fresco y sombra para las aves.' },
    successExample: { en: 'A tiny seed with soil, rain, and sun grows into a tall tree.', es: 'Una pequeña semilla con tierra, lluvia y sol crece en un gran árbol.' },
  },
  26: {
    sceneTheme: 'eco_habitats',
    topicEs: 'guardianes ecológicos en el colegio',
    clueLabel: 'Patrulla verde',
    clueEmoji: '🌿',
    ruleEs: 'Expresamos compromisos ambientales con "We can + verbo + lugar" (protect our river, keep the yard clean).',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Our patrol', textEs: 'Nuestra patrulla' },
      { role: 'Verbo', textEn: 'can clean', textEs: 'puede limpiar' },
      { role: 'Complemento', textEn: 'the garden every Friday', textEs: 'el jardín cada viernes' },
    ],
    modelExample: { en: 'Our patrol can clean the garden every Friday.', es: 'Nuestra patrulla puede limpiar el jardín cada viernes.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'protect', textEs: 'protegemos' },
      { role: 'Complemento', textEn: 'birds and trees at school', textEs: 'aves y árboles en el colegio' },
    ],
    altExample: { en: 'We protect birds and trees at school.', es: 'Protegemos aves y árboles en el colegio.' },
    successExample: { en: 'Every fourth-grade student can be an eco-guardian!', es: '¡Cada estudiante de cuarto grado puede ser un guardián ecológico!' },
  },
  27: {
    sceneTheme: 'colombian_fauna',
    topicEs: 'gran desafío ambiental (fauna, hábitats, can/can’t y 3R)',
    clueLabel: 'Desafío ambiental',
    clueEmoji: '🌎',
    ruleEs: 'Integramos "There are" (plural), "can" (capacidad) y verbos ecológicos para proteger la naturaleza.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'There are', textEs: 'Hay (muchos)' },
      { role: 'Verbo', textEn: 'tall trees', textEs: 'árboles altos' },
      { role: 'Complemento', textEn: 'we can protect together', textEs: 'que podemos proteger juntos' },
    ],
    modelExample: { en: 'There are tall trees we can protect together.', es: 'Hay árboles altos que podemos proteger juntos.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Colombian rivers', textEs: 'Los ríos colombianos' },
      { role: 'Verbo', textEn: 'stay', textEs: 'se mantienen' },
      { role: 'Complemento', textEn: 'clean when we recycle', textEs: 'limpios cuando reciclamos' },
    ],
    altExample: { en: 'Colombian rivers stay clean when we recycle.', es: 'Los ríos colombianos se mantienen limpios cuando reciclamos.' },
    successExample: { en: 'Great eco-work! You completed all of Module 3.', es: '¡Gran trabajo ecológico! Completaste todo el Módulo 3.' },
  },
  28: {
    sceneTheme: 'city_transport',
    topicEs: 'lugares del barrio (school, park, library, bakery, hospital)',
    clueLabel: 'Lugares del barrio',
    clueEmoji: '🏫',
    ruleEs: 'Usamos "There is a..." para describir UN lugar en nuestro barrio y "There are..." para varios.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'There is', textEs: 'Hay (un)' },
      { role: 'Verbo', textEn: 'a warm bakery', textEs: 'una panadería cálida' },
      { role: 'Complemento', textEn: 'near my house', textEs: 'cerca de mi casa' },
    ],
    modelExample: { en: 'There is a warm bakery near my house.', es: 'Hay una panadería cálida cerca de mi casa.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Students', textEs: 'Los estudiantes' },
      { role: 'Verbo', textEn: 'read books', textEs: 'leen libros' },
      { role: 'Complemento', textEn: 'at the public library', textEs: 'en la biblioteca pública' },
    ],
    altExample: { en: 'Students read books at the public library.', es: 'Los estudiantes leen libros en la biblioteca pública.' },
    successExample: { en: 'Our neighborhood has parks, schools, and friendly neighbors.', es: 'Nuestro barrio tiene parques, colegios y vecinos amables.' },
  },
  29: {
    sceneTheme: 'prepositions',
    topicEs: 'preposiciones de lugar (in, on, under, next to, between)',
    clueLabel: 'Ubicación espacial',
    clueEmoji: '📍',
    ruleEs: '"in" = dentro, "on" = encima, "under" = debajo, "next to" = al lado y "between" = en medio de dos.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'The cat', textEs: 'El gato' },
      { role: 'Verbo', textEn: 'is', textEs: 'está' },
      { role: 'Complemento', textEn: 'on the wooden table', textEs: 'encima de la mesa de madera' },
    ],
    modelExample: { en: 'The cat is on the wooden table.', es: 'El gato está encima de la mesa de madera.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'The hospital', textEs: 'El hospital' },
      { role: 'Verbo', textEn: 'is', textEs: 'está' },
      { role: 'Complemento', textEn: 'next to the bakery', textEs: 'al lado de la panadería' },
    ],
    altExample: { en: 'The hospital is next to the bakery.', es: 'El hospital está al lado de la panadería.' },
    successExample: { en: 'The park is between the school and the museum!', es: '¡El parque está entre el colegio y el museo!' },
  },
  30: {
    sceneTheme: 'city_transport',
    topicEs: 'medios de transporte en Colombia (bus, bicycle, metro, boat)',
    clueLabel: 'Transporte',
    clueEmoji: '🚲',
    ruleEs: 'Para decir en qué transporte viajamos usamos la preposición "by": "by bus", "by bicycle", "by metro".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'She', textEs: 'Ella' },
      { role: 'Verbo', textEn: 'travels', textEs: 'viaja' },
      { role: 'Complemento', textEn: 'to Medellín by metro', textEs: 'a Medellín en metro' },
    ],
    modelExample: { en: 'She travels to Medellín by metro.', es: 'Ella viaja a Medellín en metro.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Many people', textEs: 'Muchas personas' },
      { role: 'Verbo', textEn: 'cross', textEs: 'cruzan' },
      { role: 'Complemento', textEn: 'the river by wooden boat', textEs: 'el río en lancha de madera' },
    ],
    altExample: { en: 'Many people cross the river by wooden boat.', es: 'Muchas personas cruzan el río en lancha de madera.' },
    successExample: { en: 'Riding a bicycle is healthy and keeps the city air clean.', es: 'Montar bicicleta es saludable y mantiene limpio el aire de la ciudad.' },
  },
  31: {
    sceneTheme: 'time_clock',
    topicEs: 'la hora en punto en inglés (What time is it? / o’clock)',
    clueLabel: 'Reloj y horas',
    clueEmoji: '⏰',
    ruleEs: 'Preguntamos "What time is it?" y respondemos las horas exactas con "It is + número + o’clock".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'It', textEs: 'Son' },
      { role: 'Verbo', textEn: 'is', textEs: 'las' },
      { role: 'Complemento', textEn: "seven o'clock in the morning", textEs: 'siete en punto de la mañana' },
    ],
    modelExample: { en: "It is seven o'clock in the morning.", es: 'Son las siete en punto de la mañana.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Our recess', textEs: 'Nuestro descanso' },
      { role: 'Verbo', textEn: 'starts', textEs: 'empieza' },
      { role: 'Complemento', textEn: "at ten o'clock sharp", textEs: 'a las diez en punto' },
    ],
    altExample: { en: "Our recess starts at ten o'clock sharp.", es: 'Nuestro descanso empieza a las diez en punto.' },
    successExample: { en: "At twelve o'clock noon, it is time for lunch!", es: '¡A las doce en punto del mediodía es hora del almuerzo!' },
  },
  32: {
    sceneTheme: 'city_transport',
    topicEs: 'presente continuo (acciones pasando ahora: is / are + -ing)',
    clueLabel: 'Acciones en curso',
    clueEmoji: '🚴',
    ruleEs: 'Con "He/She" usamos "is + verbo-ing", y con "They/We" usamos "are + verbo-ing".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Lucas', textEs: 'Lucas' },
      { role: 'Verbo', textEn: 'is riding', textEs: 'está montando' },
      { role: 'Complemento', textEn: 'his blue bicycle right now', textEs: 'su bicicleta azul ahora mismo' },
    ],
    modelExample: { en: 'Lucas is riding his blue bicycle right now.', es: 'Lucas está montando su bicicleta azul ahora mismo.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'The girls', textEs: 'Las niñas' },
      { role: 'Verbo', textEn: 'are drawing', textEs: 'están dibujando' },
      { role: 'Complemento', textEn: 'maps in the classroom', textEs: 'mapas en el salón' },
    ],
    altExample: { en: 'The girls are drawing maps in the classroom.', es: 'Las niñas están dibujando mapas en el salón.' },
    successExample: { en: 'Right now, we are learning English in an interactive way!', es: '¡En este momento estamos aprendiendo inglés de forma interactiva!' },
  },
  33: {
    sceneTheme: 'city_transport',
    topicEs: 'seguridad vial y señales de tránsito',
    clueLabel: 'Seguridad vial',
    clueEmoji: '🚦',
    ruleEs: 'Las señales viales dan órdenes claras: "Stop" (para), "Wear a helmet" (usa casco), "Cross at the zebra".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Always', textEs: 'Siempre' },
      { role: 'Verbo', textEn: 'wear', textEs: 'usa' },
      { role: 'Complemento', textEn: 'your helmet on the bike', textEs: 'tu casco en la bicicleta' },
    ],
    modelExample: { en: 'Always wear your helmet on the bike.', es: 'Siempre usa tu casco en la bicicleta.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Pedestrians', textEs: 'Los peatones' },
      { role: 'Verbo', textEn: 'cross', textEs: 'cruzan' },
      { role: 'Complemento', textEn: 'safely on the zebra lines', textEs: 'con seguridad por la cebra' },
    ],
    altExample: { en: 'Pedestrians cross safely on the zebra lines.', es: 'Los peatones cruzan con seguridad por la cebra.' },
    successExample: { en: 'Looking left and right keeps everyone safe on the street.', es: 'Mirar a la izquierda y derecha mantiene a todos seguros en la calle.' },
  },
  34: {
    sceneTheme: 'global_digital',
    topicEs: 'países, nacionalidades y culturas del mundo',
    clueLabel: 'Culturas del mundo',
    clueEmoji: '🌍',
    ruleEs: 'Para preguntar el país de origen decimos "Where is [persona] from?" y respondemos "[Persona] is from [país]".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Ana', textEs: 'Ana' },
      { role: 'Verbo', textEn: 'is from', textEs: 'es de' },
      { role: 'Complemento', textEn: 'Brazil and speaks Portuguese', textEs: 'Brasil y habla portugués' },
    ],
    modelExample: { en: 'Ana is from Brazil and speaks Portuguese.', es: 'Ana es de Brasil y habla portugués.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'Where', textEs: 'De dónde' },
      { role: 'Verbo', textEn: 'is', textEs: 'es' },
      { role: 'Complemento', textEn: 'your pen pal from', textEs: 'tu amigo por carta' },
    ],
    altExample: { en: 'Where is your pen pal from?', es: '¿De dónde es tu amigo por carta?' },
    successExample: { en: 'Learning English helps us meet friends from every continent.', es: 'Aprender inglés nos ayuda a conocer amigos de todos los continentes.' },
  },
  35: {
    sceneTheme: 'global_digital',
    topicEs: 'ciudadanía digital y uso seguro de internet',
    clueLabel: 'Seguridad digital',
    clueEmoji: '🛡️',
    ruleEs: 'En internet seguimos reglas claras: "Be kind online", "Keep passwords private" y "Ask an adult".',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Always', textEs: 'Siempre' },
      { role: 'Verbo', textEn: 'ask', textEs: 'consulta con' },
      { role: 'Complemento', textEn: 'an adult before downloading files', textEs: 'un adulto antes de descargar archivos' },
    ],
    modelExample: { en: 'Always ask an adult before downloading files.', es: 'Siempre consulta con un adulto antes de descargar archivos.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
      { role: 'Verbo', textEn: 'keep', textEs: 'mantenemos' },
      { role: 'Complemento', textEn: 'our personal passwords private', textEs: 'nuestras contraseñas privadas' },
    ],
    altExample: { en: 'We keep our personal passwords private.', es: 'Mantenemos nuestras contraseñas privadas.' },
    successExample: { en: 'Smart digital citizens treat others kindly and protect their privacy.', es: 'Los buenos ciudadanos digitales tratan con respeto y protegen su privacidad.' },
  },
  36: {
    sceneTheme: 'global_digital',
    topicEs: 'evaluación final de Graduación 4° de Primaria',
    clueLabel: 'Graduación 4°',
    clueEmoji: '🎓',
    ruleEs: 'Repasamos todos los tiempos de 4°: "We are...", "can", "should", "There is/are" y preposiciones.',
    modelBlocks: [
      { role: 'Sujeto', textEn: 'Fourth graders', textEs: 'Los de cuarto grado' },
      { role: 'Verbo', textEn: 'are proud', textEs: 'están orgullosos' },
      { role: 'Complemento', textEn: 'of their English progress', textEs: 'de su progreso en inglés' },
    ],
    modelExample: { en: 'Fourth graders are proud of their English progress.', es: 'Los de cuarto grado están orgullosos de su progreso en inglés.' },
    altBlocks: [
      { role: 'Sujeto', textEn: 'You', textEs: 'Tú' },
      { role: 'Verbo', textEn: 'can explore', textEs: 'puedes explorar' },
      { role: 'Complemento', textEn: 'many stories in English now', textEs: 'muchas historias en inglés ahora' },
    ],
    altExample: { en: 'You can explore many stories in English now.', es: 'Puedes explorar muchas historias en inglés ahora.' },
    successExample: { en: 'Congratulations! You are ready for fifth grade English!', es: '¡Felicitaciones! ¡Estás listo para el inglés de quinto grado!' },
  },
};

function getWeekNumberFromId(id: string): number {
  const match = /^w(\d+)-/i.exec(id);
  if (match) {
    const num = Number(match[1]);
    if (num >= 1 && num <= 36) return num;
  }
  return 1;
}

function detectQuestionSpecificScene(contextText: string, defaultTheme: SceneTheme): SceneTheme {
  const t = contextText.toLowerCase();
  if (/\bo['’]?clock\b|\bwhat time\b|\bnine o['’]?clock\b/.test(t)) return 'time_clock';
  if (/\b(in|on|under|next to|between)\b/.test(t) && /ball|chair|library|park|box|table|cat/.test(t)) return 'prepositions';
  if (/\b(wash|brush|soap|teeth|shower)\b/.test(t)) return 'hygiene';
  if (/\b(fever|headache|stomachache|toothache|cough|medicine|nurse|clinic|doctor|bandage)\b/.test(t)) return 'health_ailments';
  if (/\b(mango|banana|carrot|apple|milk|soda|lunchbox|salad|chicken|how many)\b/.test(t)) return 'healthy_food';
  if (/\b(soccer|basketball|jump|run|exercise|sleep|breathe|calm)\b/.test(t)) return 'sports_routine';
  if (/\b(condor|bear|jaguar|toucan|dolphin|monkey|horse|frog|fish)\b/.test(t)) return 'colombian_fauna';
  if (/\b(recycle|paper|plastic|glass|tap|save water|plant trees|forest|ocean|river)\b/.test(t)) return 'eco_habitats';
  if (/\b(bus|bicycle|metro|boat|airplane|helmet|zebra|bakery|hospital)\b/.test(t)) return 'city_transport';
  if (/\b(mother|father|sister|brother|grandma|tall|short|curly)\b/.test(t)) return 'family_traits';
  if (/\b(please|thank you|excuse me|sorry|forgive|shout|kind|honest|happy|sad|angry|excited)\b/.test(t)) return 'emotions_peace';
  if (/\b(colombia|brazil|japan|password|online|adult|proud|world)\b/.test(t)) return 'global_digital';
  return defaultTheme;
}

function pickSafeBlueprintExample(
  blueprint: TopicBlueprint,
  forbiddenText: string
): { example: BilingualExample; blocks: [GrammarBlock, GrammarBlock, GrammarBlock] } {
  const normForbidden = forbiddenText.toLowerCase().trim();
  const normModel = blueprint.modelExample.en.toLowerCase().trim();
  if (normForbidden && (normModel === normForbidden || normForbidden.includes(normModel))) {
    return { example: blueprint.altExample, blocks: blueprint.altBlocks };
  }
  return { example: blueprint.modelExample, blocks: blueprint.modelBlocks };
}

function buildSpecificChoiceWhy(params: {
  chosenLabel: string;
  chosenSpanish: string;
  correctLabel: string;
  correctSpanish: string;
  contextText: string;
  blueprint: TopicBlueprint;
}): string {
  const { chosenLabel, chosenSpanish, correctLabel, correctSpanish, contextText, blueprint } = params;
  const chosenClean = chosenLabel.trim();
  const chosenMean = chosenSpanish ? ` («${chosenSpanish}»)` : '';
  const lowerCtx = contextText.toLowerCase();

  // Specific contrast explanation based on chosen option vs actual prompt context
  if (/soda|candy|cake|chips|donut/i.test(chosenClean) && !/soda|candy|cake|chips|donut/i.test(lowerCtx)) {
    return `Seleccionaste "${chosenClean}"${chosenMean}, que representa comida poco saludable o con exceso de azúcar, pero en esta pregunta sobre ${blueprint.topicEs} la frase describe una opción distinta.`;
  }
  if (/brush|teeth/i.test(chosenClean) && /wash|hands|soap/i.test(lowerCtx)) {
    return `Seleccionaste "${chosenClean}"${chosenMean}, que trata sobre los dientes, pero la frase habla de lavar las manos con agua y jabón.`;
  }
  if (/wash|hands|soap/i.test(chosenClean) && /brush|teeth|toothache/i.test(lowerCtx)) {
    return `Seleccionaste "${chosenClean}"${chosenMean}, que se refiere a las manos y el jabón, pero la situación trata sobre el cuidado dental.`;
  }
  if (/fever|headache|stomachache|toothache|cough/i.test(chosenClean) && correctLabel && correctLabel !== chosenLabel) {
    const targetEs = correctSpanish ? ` (${correctSpanish})` : '';
    return `Elegiste "${chosenClean}"${chosenMean}, pero el audio o texto menciona otra situación clínica distinta${targetEs ? ` relacionada con ${blueprint.topicEs}` : ''}. Fíjate en la palabra exacta de la frase.`;
  }
  if (/hospital|library|bakery|park|school/i.test(chosenClean)) {
    return `Elegiste el lugar "${chosenClean}"${chosenMean}, pero la pista habla de una actividad diferente dentro de ${blueprint.topicEs}.`;
  }
  if (/bus|bicycle|metro|boat|airplane|train/i.test(chosenClean)) {
    return `Escogiste "${chosenClean}"${chosenMean}, que es otro medio de transporte; vuelve a fijarte en cómo viaja el personaje en esta escena.`;
  }

  return `Elegiste "${chosenClean}"${chosenMean}, pero esa idea no encaja con el contexto de ${blueprint.topicEs}. ${blueprint.ruleEs}`;
}

export function analyzeWordOrderAttempt(
  builtWords: string[],
  correctSentence: string,
  extraDistractors: string[] = []
): WordOrderAnalysis {
  const targetWords = correctSentence.trim().split(/\s+/);
  const distractorSet = new Set(extraDistractors.map((w) => w.trim().toLowerCase().replace(/[.,!?]+$/g, '')));

  const tileStatuses: WordOrderTileStatus[] = [];
  const distractorsUsed: string[] = [];
  const wrongPositionWords: { index: number; word: string; expected: string }[] = [];

  const normalize = (w: string) => w.trim().toLowerCase().replace(/[.,!?]+$/g, '');

  builtWords.forEach((word, idx) => {
    const norm = normalize(word);
    if (distractorSet.has(norm)) {
      tileStatuses.push('distractor');
      distractorsUsed.push(word);
    } else if (idx < targetWords.length && norm === normalize(targetWords[idx])) {
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

  const nonDistractorCount = builtWords.filter((w) => !distractorSet.has(normalize(w))).length;
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
  _grammarFocus = ''
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const baseHint = challenge.hintEs || blueprint.ruleEs;

  if (challenge.type === 'listening') {
    const { example, blocks } = pickSafeBlueprintExample(blueprint, challenge.audioText);
    const sceneTheme = detectQuestionSpecificScene(challenge.audioText, blueprint.sceneTheme);
    const isWordBank = challenge.mode === 'word_bank';

    return {
      kind: 'hint',
      titleEs: `Pista animada · Semana ${weekNum}`,
      explanationEs: isWordBank
        ? `En este ejercicio de ${blueprint.topicEs}, escucha con la tortuga qué palabra falta. ${blueprint.ruleEs}`
        : `En este reto sobre ${blueprint.topicEs}, escucha las palabras clave del audio. ${baseHint}`,
      example,
      sceneTheme,
      exerciseCategory: isWordBank ? 'open_sentence' : 'multiple_choice',
      grammarBlocks: blocks,
      visualComparison: !isWordBank
        ? {
            chosenLabel: 'Escucha primero',
            chosenEmoji: '🎧',
            chosenMeaningEs: 'Identifica sujeto y acción',
            targetClueLabel: blueprint.clueLabel,
            targetClueEmoji: blueprint.clueEmoji,
          }
        : undefined,
      step1Label: 'Regla clave',
      step2Label: 'Ejemplo animado',
      step3Label: '¡Tu respuesta!',
    };
  }

  if (challenge.type === 'memory') {
    const firstPair = challenge.pairs[0];
    const ex: BilingualExample = firstPair
      ? {
          en: `We practice "${firstPair.word}" in our ${weekNum <= 9 ? 'health' : weekNum <= 18 ? 'peace' : weekNum <= 27 ? 'eco' : 'city'} class.`,
          es: `Practicamos «${firstPair.word}» (${firstPair.spanish}) en nuestra clase de la semana ${weekNum}.`,
        }
      : blueprint.modelExample;

    return {
      kind: 'hint',
      titleEs: `Pista animada · Memoria Semana ${weekNum}`,
      explanationEs: `Para emparejar las tarjetas de ${blueprint.topicEs}, pronuncia en voz alta cada palabra en inglés y asóciala con su dibujo.`,
      example: ex,
      sceneTheme: blueprint.sceneTheme,
      exerciseCategory: 'open_sentence',
      grammarBlocks: [
        { role: 'Sujeto', textEn: 'We', textEs: 'Nosotros' },
        { role: 'Verbo', textEn: 'match', textEs: 'emparejamos' },
        {
          role: 'Complemento',
          textEn: firstPair ? `"${firstPair.word}" with ${firstPair.emoji}` : 'words with pictures',
          textEs: firstPair ? `«${firstPair.spanish}» con su dibujo` : 'palabras con dibujos',
        },
      ],
      step1Label: 'Estrategia visual',
      step2Label: 'Ejemplo animado',
      step3Label: '¡A emparejar!',
    };
  }

  if (challenge.type === 'reading') {
    const passageText = challenge.passageEn.join(' ');
    const sceneTheme = detectQuestionSpecificScene(passageText, blueprint.sceneTheme);
    if (challenge.mode === 'sequence') {
      return {
        kind: 'hint',
        titleEs: `Pista animada · Ordena la historia (${challenge.locationCol})`,
        explanationEs: `Esta lectura en ${challenge.locationCol} cuenta 3 momentos seguidos sobre ${blueprint.topicEs}. Identifica qué sucede al inicio, en el nudo y al cierre.`,
        example: {
          en: 'First, Sofia wakes up. Next, she brushes her teeth. Finally, she goes to school.',
          es: 'Primero Sofía despierta. Luego cepilla sus dientes. Al final va al colegio.',
        },
        sceneTheme,
        exerciseCategory: 'open_sentence',
        grammarBlocks: [
          { role: 'Sujeto', textEn: 'First (1°)', textEs: 'Al inicio' },
          { role: 'Verbo', textEn: 'Next (2°)', textEs: 'Después' },
          { role: 'Complemento', textEn: 'Finally (3°)', textEs: 'Al final' },
        ],
        step1Label: 'Conectores de orden',
        step2Label: 'Secuencia modelo',
        step3Label: '¡Ordena tú!',
      };
    }
    const { example, blocks } = pickSafeBlueprintExample(blueprint, passageText);
    return {
      kind: 'hint',
      titleEs: `Pista animada · Lectura en ${challenge.locationCol}`,
      explanationEs: `En «${challenge.titleEs}», busca el detalle clave sobre ${blueprint.topicEs}. ${baseHint}`,
      example,
      sceneTheme,
      exerciseCategory: 'multiple_choice',
      grammarBlocks: blocks,
      visualComparison: {
        chosenLabel: challenge.locationCol,
        chosenEmoji: challenge.sceneEmoji,
        chosenMeaningEs: 'Escenario de la lectura',
        targetClueLabel: blueprint.clueLabel,
        targetClueEmoji: blueprint.clueEmoji,
      },
      step1Label: 'Lectura clave',
      step2Label: 'Ejemplo animado',
      step3Label: '¡Elige la opción!',
    };
  }

  if (challenge.type === 'word_search') {
    const t0 = challenge.targets[0];
    return {
      kind: 'hint',
      titleEs: `Pista animada · Sopa de letras Semana ${weekNum}`,
      explanationEs: `Todas las palabras escondidas tratan sobre ${blueprint.topicEs} y aparecen en línea recta (horizontal, vertical o diagonal).`,
      example: t0
        ? {
            en: `Today we spell "${t0.word.toLowerCase()}" (${t0.spanish}) in class.`,
            es: `Hoy deletreamos «${t0.word}» (${t0.spanish}) en clase.`,
          }
        : blueprint.modelExample,
      sceneTheme: blueprint.sceneTheme,
      exerciseCategory: 'open_sentence',
      grammarBlocks: blueprint.modelBlocks,
      step1Label: 'Cómo buscar',
      step2Label: 'Vocabulario en uso',
      step3Label: '¡Encuentra las palabras!',
    };
  }

  if (challenge.type === 'word_order') {
    const { example, blocks } = pickSafeBlueprintExample(blueprint, challenge.correctSentence);
    const sceneTheme = detectQuestionSpecificScene(challenge.correctSentence, blueprint.sceneTheme);
    return {
      kind: 'hint',
      titleEs: `Pista animada · Estructura Semana ${weekNum}`,
      explanationEs: `Vamos a construir una oración sobre ${blueprint.topicEs}. ${blueprint.ruleEs}`,
      example,
      sceneTheme,
      exerciseCategory: 'open_sentence',
      grammarBlocks: blocks,
      step1Label: 'Regla gramatical',
      step2Label: 'Pizarra animada',
      step3Label: '¡Ordena las fichas!',
    };
  }

  if (challenge.type === 'micro_story') {
    const { example, blocks } = pickSafeBlueprintExample(blueprint, '');
    return {
      kind: 'hint',
      titleEs: `Pista animada · ${challenge.titleEs}`,
      explanationEs: `En este microcuento sobre ${blueprint.topicEs}, escucha frase por frase y observa quién realiza la acción en la escena.`,
      example,
      sceneTheme: blueprint.sceneTheme,
      exerciseCategory: 'multiple_choice',
      grammarBlocks: blocks,
      visualComparison: {
        chosenLabel: 'Escucha el cuento',
        chosenEmoji: '📖',
        chosenMeaningEs: 'Fíjate en la escena actual',
        targetClueLabel: blueprint.clueLabel,
        targetClueEmoji: blueprint.clueEmoji,
      },
      step1Label: 'Detalle del cuento',
      step2Label: 'Ejemplo parecido',
      step3Label: '¡Responde!',
    };
  }

  // Arcade
  return {
    kind: 'hint',
    titleEs: `Pista animada · ${challenge.titleEs}`,
    explanationEs: `Clasifica cada tarjeta pensando si corresponde a «${challenge.leftBucket.labelEs}» o a «${challenge.rightBucket.labelEs}» dentro de ${blueprint.topicEs}.`,
    example: blueprint.modelExample,
    sceneTheme: blueprint.sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: blueprint.modelBlocks,
    step1Label: 'Criterio rápido',
    step2Label: 'Ejemplo guía',
    step3Label: '¡A clasificar!',
  };
}

export function getVisualChoiceErrorFeedback(params: {
  challengeId?: string;
  chosenLabel: string;
  chosenEmoji?: string;
  chosenSpanish: string;
  correctLabel: string;
  correctSpanish: string;
  contextText: string;
  hintEs: string;
  grammarFocus?: string;
}): BetoFeedbackPayload {
  const {
    challengeId = 'w1-c1',
    chosenLabel,
    chosenEmoji = '❓',
    chosenSpanish,
    correctLabel,
    correctSpanish,
    contextText,
    hintEs,
  } = params;

  const weekNum = getWeekNumberFromId(challengeId);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const sceneTheme = detectQuestionSpecificScene(contextText, blueprint.sceneTheme);
  const { example, blocks } = pickSafeBlueprintExample(blueprint, contextText);

  const specificReason = buildSpecificChoiceWhy({
    chosenLabel,
    chosenSpanish,
    correctLabel,
    correctSpanish,
    contextText,
    blueprint,
  });

  return {
    kind: 'error',
    titleEs: `Analicemos tu elección en Semana ${weekNum}`,
    wrongPartEs: `Elegiste: "${chosenLabel}"${chosenSpanish ? ` (${chosenSpanish})` : ''}`,
    explanationEs: specificReason,
    hintEs,
    example,
    sceneTheme,
    exerciseCategory: 'multiple_choice',
    grammarBlocks: blocks,
    visualComparison: {
      chosenLabel,
      chosenEmoji,
      chosenMeaningEs: chosenSpanish || 'Opción elegida',
      targetClueLabel: blueprint.clueLabel,
      targetClueEmoji: blueprint.clueEmoji,
    },
    step1Label: '¿Por qué falló esta opción?',
    step2Label: 'Mira un ejemplo similar',
    step3Label: '¡Tu segundo intento!',
  };
}

export function getWordBankErrorFeedback(
  challenge: ListeningChallenge,
  chosenWord: string,
  _grammarFocus = ''
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const sceneTheme = detectQuestionSpecificScene(challenge.audioText, blueprint.sceneTheme);
  const { example, blocks } = pickSafeBlueprintExample(blueprint, challenge.audioText);

  const parts = challenge.sentenceParts ?? ['', ''];
  const builtSentence = `${parts[0]}${chosenWord}${parts[1]}`;

  return {
    kind: 'error',
    titleEs: `Revisemos el espacio en blanco · Semana ${weekNum}`,
    wrongPartEs: `Tu oración quedó: "${builtSentence}"`,
    explanationEs: `Colocaste "${chosenWord}" en el espacio, pero en este tema de ${blueprint.topicEs} esa palabra no coincide con el audio ni completa bien la idea. ${blueprint.ruleEs}`,
    hintEs: challenge.hintEs,
    example,
    sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: blocks,
    step1Label: '¿Qué parte falló?',
    step2Label: 'Pizarra con ejemplo nuevo',
    step3Label: '¡Tu segundo intento!',
  };
}

export function getWordOrderErrorFeedback(
  challenge: WordOrderChallenge,
  builtWords: string[],
  _grammarFocus = ''
): { payload: BetoFeedbackPayload; analysis: WordOrderAnalysis } {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const sceneTheme = detectQuestionSpecificScene(challenge.correctSentence, blueprint.sceneTheme);
  const { example, blocks } = pickSafeBlueprintExample(blueprint, challenge.correctSentence);

  const analysis = analyzeWordOrderAttempt(
    builtWords,
    challenge.correctSentence,
    challenge.extraDistractors ?? []
  );

  const errorReasons: string[] = [];
  if (analysis.distractorsUsed.length > 0) {
    errorReasons.push(
      `La ficha "${analysis.distractorsUsed.join(', ')}" es un distractor que no pertenece a «${challenge.spanishMeaning}».`
    );
  }
  if (analysis.wrongPositionWords.length > 0) {
    const first = analysis.wrongPositionWords[0];
    errorReasons.push(
      `En la posición ${first.index} ubicaste "${first.word}", pero en inglés ese lugar corresponde a otra función.`
    );
  }
  if (analysis.missingWordsCount > 0) {
    errorReasons.push(
      `Falta agregar ${analysis.missingWordsCount} ${analysis.missingWordsCount === 1 ? 'ficha' : 'fichas'} para completar la oración.`
    );
  }

  return {
    analysis,
    payload: {
      kind: 'error',
      titleEs: `Ajustemos el orden · Semana ${weekNum}`,
      wrongPartEs: errorReasons.join(' ') || `Orden actual: "${builtWords.join(' ')}"`,
      explanationEs: `Estamos practicando ${blueprint.topicEs}. ${blueprint.ruleEs} Observa en la pizarra cómo se construye paso a paso una oración diferente con la misma estructura:`,
      hintEs: challenge.hintEs,
      example,
      sceneTheme,
      exerciseCategory: 'open_sentence',
      grammarBlocks: blocks,
      step1Label: '¿Qué parte tiene el error?',
      step2Label: 'Construcción animada',
      step3Label: '¡Tu segundo intento!',
    },
  };
}

export function getSequenceErrorFeedback(
  challenge: { id: string; titleEs: string; passageEn: string[]; hintEs: string; sequenceItems?: { id: string }[] },
  currentOrderIds: string[]
): { payload: BetoFeedbackPayload; analysis: SequenceAnalysis } {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const sceneTheme = detectQuestionSpecificScene(challenge.passageEn.join(' '), blueprint.sceneTheme);

  const correctIds = (challenge.sequenceItems ?? []).map((item) => item.id);
  const analysis = analyzeSequenceAttempt(currentOrderIds, correctIds);

  return {
    analysis,
    payload: {
      kind: 'error',
      titleEs: `Reordenemos «${challenge.titleEs}»`,
      wrongPartEs:
        analysis.wrongPositions.length > 0
          ? `Las tarjetas en la posición ${analysis.wrongPositions.join(' y ')} están en un momento equivocado (marcadas en rojo).`
          : 'Revisa el orden cronológico de los eventos.',
      explanationEs: `En esta historia sobre ${blueprint.topicEs}, primero ocurre la situación inicial, luego la acción principal y por último el desenlace.`,
      hintEs: challenge.hintEs,
      example: {
        en: 'First, Mateo feels sick. Next, he visits the nurse. Finally, he drinks warm tea.',
        es: 'Primero Mateo se siente mal. Luego visita a la enfermera. Al final toma té tibio.',
      },
      sceneTheme,
      exerciseCategory: 'open_sentence',
      grammarBlocks: [
        { role: 'Sujeto', textEn: '1. First', textEs: 'Inicio' },
        { role: 'Verbo', textEn: '2. Next', textEs: 'Desarrollo' },
        { role: 'Complemento', textEn: '3. Finally', textEs: 'Cierre' },
      ],
      step1Label: 'Posiciones fuera de orden',
      step2Label: 'Modelo en 3 pasos',
      step3Label: '¡Reordena ahora!',
    },
  };
}

export function getMemoryMismatchFeedback(
  challengeId: string,
  firstWord: string,
  firstSpanish: string,
  secondWord: string,
  secondSpanish: string
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challengeId);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];

  return {
    kind: 'error',
    titleEs: `No forman pareja · Memoria Semana ${weekNum}`,
    wrongPartEs: `Volteaste "${firstWord}" (${firstSpanish}) con "${secondWord}" (${secondSpanish}).`,
    explanationEs: `"${firstWord}" significa «${firstSpanish}», mientras que "${secondWord}" significa «${secondSpanish}». Memoriza dónde quedó cada una dentro de ${blueprint.topicEs}.`,
    example: {
      en: `Remember: "${firstWord}" is "${firstSpanish}", and "${secondWord}" is "${secondSpanish}".`,
      es: `Recuerda: «${firstWord}» es ${firstSpanish} y «${secondWord}» es ${secondSpanish}.`,
    },
    sceneTheme: blueprint.sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: [
      { role: 'Sujeto', textEn: firstWord, textEs: firstSpanish },
      { role: 'Verbo', textEn: '≠', textEs: 'es distinto de' },
      { role: 'Complemento', textEn: secondWord, textEs: secondSpanish },
    ],
    step1Label: 'Tarjetas que no coinciden',
    step2Label: 'Ejemplo para recordar',
    step3Label: '¡Sigue buscando!',
  };
}

export function getWordSearchErrorFeedback(
  challengeId: string,
  formedLetters: string,
  remainingTargets: { word: string; spanish: string; emoji: string }[]
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challengeId);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const nextWord = remainingTargets[0];

  return {
    kind: 'error',
    titleEs: `Selección incorrecta · Sopa Semana ${weekNum}`,
    wrongPartEs: `Uniste las letras "${formedLetters}".`,
    explanationEs: `La secuencia "${formedLetters}" no corresponde a ninguna palabra de ${blueprint.topicEs} en tu lista. Verifica trazar en línea recta desde la primera letra hasta la última.`,
    example: nextWord
      ? {
          en: `Look for "${nextWord.word.toLowerCase()}" (${nextWord.spanish}) starting with "${nextWord.word[0]}".`,
          es: `Busca «${nextWord.word}» (${nextWord.spanish}): empieza con la letra "${nextWord.word[0]}".`,
        }
      : blueprint.modelExample,
    sceneTheme: blueprint.sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: [
      { role: 'Sujeto', textEn: nextWord ? `Starts: ${nextWord.word[0]}` : 'Straight line', textEs: 'Letra inicial' },
      { role: 'Verbo', textEn: '→ / ↓ / ↘', textEs: 'Dirección recta' },
      { role: 'Complemento', textEn: nextWord ? `${nextWord.word.length} letters` : 'Target word', textEs: nextWord ? `${nextWord.word.length} letras` : 'Palabra meta' },
    ],
    step1Label: '¿Qué letras marcaste?',
    step2Label: 'Pista visual del tablero',
    step3Label: '¡Traza de nuevo!',
  };
}

export function getArcadeErrorFeedback(
  item: ArcadeItem,
  chosenBucket: 'left' | 'right',
  challenge: ArcadeChallenge
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const wrongBucketMeta = chosenBucket === 'left' ? challenge.leftBucket : challenge.rightBucket;
  const correctBucketMeta = item.bucket === 'left' ? challenge.leftBucket : challenge.rightBucket;

  return {
    kind: 'error',
    titleEs: `Revisemos esta tarjeta · ${challenge.titleEs}`,
    wrongPartEs: `Pusiste "${item.word}" (${item.spanish}) en «${wrongBucketMeta.labelEs}».`,
    explanationEs: `En ${blueprint.topicEs}, «${item.word}» (${item.spanish}) pertenece a «${correctBucketMeta.labelEn} · ${correctBucketMeta.labelEs}» y no a «${wrongBucketMeta.labelEs}».`,
    hintEs: challenge.hintEs,
    example: {
      en: `${item.word} goes into ${correctBucketMeta.labelEn.toLowerCase()} because of its meaning.`,
      es: `«${item.word}» (${item.spanish}) va en «${correctBucketMeta.labelEs}».`,
    },
    sceneTheme: blueprint.sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: [
      { role: 'Sujeto', textEn: item.word, textEs: item.spanish },
      { role: 'Verbo', textEn: 'belongs to', textEs: 'pertenece a' },
      { role: 'Complemento', textEn: correctBucketMeta.labelEn, textEs: correctBucketMeta.labelEs },
    ],
    step1Label: '¿Dónde la pusiste?',
    step2Label: 'Categoría correcta',
    step3Label: '¡Sigue jugando!',
  };
}

export function getMicroStoryCheckpointErrorFeedback(
  challengeId: string,
  scene: MicroStoryScene,
  chosenText: string,
  hintEs: string,
  _grammarFocus = ''
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challengeId);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];
  const sceneContext = scene.narrationEn.join(' ');
  const sceneTheme = detectQuestionSpecificScene(sceneContext, blueprint.sceneTheme);
  const { example, blocks } = pickSafeBlueprintExample(blueprint, sceneContext);

  return {
    kind: 'error',
    titleEs: `Revisemos la escena del cuento · Semana ${weekNum}`,
    wrongPartEs: `Elegiste: "${chosenText}"`,
    explanationEs: `La respuesta "${chosenText}" no coincide con lo que pasa en esta escena sobre ${blueprint.topicEs}. Escucha de nuevo la narración o toca «Traducir escena» para confirmar el detalle exacto.`,
    hintEs,
    example,
    sceneTheme,
    exerciseCategory: 'multiple_choice',
    grammarBlocks: blocks,
    visualComparison: {
      chosenLabel: chosenText,
      chosenEmoji: scene.emoji,
      chosenMeaningEs: 'No coincide con la escena',
      targetClueLabel: blueprint.clueLabel,
      targetClueEmoji: blueprint.clueEmoji,
    },
    step1Label: '¿Por qué no coincide?',
    step2Label: 'Ejemplo del tema',
    step3Label: '¡Elige otra respuesta!',
  };
}

export function getSuccessReinforcementExample(
  challenge: WeekChallenge,
  _grammarFocus = ''
): BetoFeedbackPayload {
  const weekNum = getWeekNumberFromId(challenge.id);
  const blueprint = WEEK_TOPIC_BLUEPRINTS[weekNum] ?? WEEK_TOPIC_BLUEPRINTS[1];

  return {
    kind: 'success',
    titleEs: `¡Muy bien! Ejemplo cotidiano · Semana ${weekNum}`,
    explanationEs: `${blueprint.ruleEs} Escucha esta frase práctica de ${blueprint.topicEs}:`,
    example: blueprint.successExample,
    sceneTheme: blueprint.sceneTheme,
    exerciseCategory: 'open_sentence',
    grammarBlocks: blueprint.modelBlocks,
  };
}
