import { CefrLevel } from './questionBank'

export interface GrammarExercise {
  id: string
  prompt: string
  answer: string
  options?: string[]      // for MCQ
  hint: string
  note: string
}

export interface GrammarNode {
  id: string              // e.g. "a1-g1"
  level: CefrLevel
  title: string
  subtitle: string
  concept: string         // e.g. "être & avoir"
  explanation: string[]   // paragraphs
  table?: { header: string[]; rows: string[][] }  // conjugation table etc.
  tip: string             // quick memory tip
  exercises: GrammarExercise[]
}

const GRAMMAR_NODES: GrammarNode[] = [
  // ── A1 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'a1-g1',
    level: 'A1',
    title: 'Grammar Checkpoint 1',
    subtitle: 'The two most important French verbs',
    concept: 'être & avoir',
    explanation: [
      'In French, être (to be) and avoir (to have) are the backbone of the language. Almost every tense uses them. Unlike English "I am" and "I have", French changes the verb ending for every pronoun.',
      'Notice that tu es uses "es" not "êtes" — that one\'s only for vous. And ils/elles always share the same form.',
    ],
    table: {
      header: ['Pronom', 'être (to be)', 'avoir (to have)'],
      rows: [
        ['je',       'suis',   'ai'],
        ['tu',       'es',     'as'],
        ['il / elle','est',    'a'],
        ['nous',     'sommes', 'avons'],
        ['vous',     'êtes',   'avez'],
        ['ils / elles','sont', 'ont'],
      ],
    },
    tip: '🧠 "Je suis" sounds like "je swee" — imagine saying "I\'m sweeping" to remember it means "I am".',
    exercises: [
      { id: 'a1g1-1', prompt: 'How do you say "She is French"?', answer: 'Elle est française.', options: ['Elle est française.', 'Elle êtes française.', 'Elle sont française.', 'Elle a française.'], hint: 'Use the "elle" form of être.', note: 'il/elle → est' },
      { id: 'a1g1-2', prompt: 'Fill in: "Nous _____ étudiants."', answer: 'sommes', options: ['sommes', 'êtes', 'sont', 'suis'], hint: 'First person plural.', note: 'nous → sommes' },
      { id: 'a1g1-3', prompt: 'Translate: "I have a dog."', answer: "J'ai un chien.", hint: 'Use avoir. "un chien" = a dog.', note: 'je → ai' },
      { id: 'a1g1-4', prompt: 'Fill in: "Tu _____ un beau vélo."', answer: 'as', options: ['as', 'est', 'avez', 'ont'], hint: 'Second person singular of avoir.', note: 'tu → as' },
      { id: 'a1g1-5', prompt: 'Translate: "They are tired." (mixed group)', answer: 'Ils sont fatigués.', hint: 'Mixed groups use "ils".', note: 'ils → sont' },
      { id: 'a1g1-6', prompt: '"Vous _____ un grand appartement."', answer: 'avez', options: ['avez', 'ont', 'as', 'êtes'], hint: 'Polite or plural "you" with avoir.', note: 'vous → avez' },
      { id: 'a1g1-7', prompt: 'True or False: "nous êtes" is correct French.', answer: 'Faux', options: ['Vrai', 'Faux', 'Peut-être', 'Parfois'], hint: 'Check the conjugation table again.', note: 'nous → sommes (never êtes)' },
    ],
  },

  // ── A1 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'a1-g2',
    level: 'A1',
    title: 'Grammar Checkpoint 2',
    subtitle: 'Everything has a gender in French',
    concept: 'Articles & Gender',
    explanation: [
      'Every French noun is either masculine (m) or feminine (f). This affects the article (the/a) that comes before it. There\'s no rule that perfectly predicts gender — you must learn it with each word.',
      'Definite articles: le (m) / la (f) / l\' (before vowel) / les (plural). Indefinite: un (m) / une (f) / des (plural).',
      'In spoken French, le and la both become l\' before a vowel or silent h: l\'ami, l\'heure.',
    ],
    table: {
      header: ['', 'Masculin', 'Féminin', 'Pluriel'],
      rows: [
        ['Défini (the)',   'le chat',   'la chatte', 'les chats'],
        ['Indéfini (a/an)', 'un livre',  'une table', 'des livres'],
        ['Before vowel',   "l'ami",     "l'amie",   "les amis"],
      ],
    },
    tip: '🧠 Words ending in -tion, -sion, -té are almost always feminine. Words ending in -ment, -age are usually masculine.',
    exercises: [
      { id: 'a1g2-1', prompt: 'Which article? "___ café" (the coffee)', answer: 'Le café', options: ['Le café', 'La café', 'Les café', "L'café"], hint: 'café is masculine.', note: 'café (m) → le' },
      { id: 'a1g2-2', prompt: 'Which article? "___ université"', answer: "L'université", options: ["L'université", 'Le université', 'La université', 'Un université'], hint: 'Starts with a vowel, feminine noun.', note: 'Before a vowel, la/le → l\'' },
      { id: 'a1g2-3', prompt: 'Translate: "a book" (un livre is masculine)', answer: 'un livre', hint: 'Masculine indefinite article.', note: 'un = a (masculine)' },
      { id: 'a1g2-4', prompt: '"___ maison est belle." (the house)', answer: 'La maison est belle.', options: ['La maison est belle.', 'Le maison est belle.', 'Les maison est belle.', "L'maison est belle."], hint: 'maison is feminine.', note: 'maison (f) → la' },
      { id: 'a1g2-5', prompt: '"I see ___ friends." (plural definite)', answer: 'les amis', hint: 'Definite plural for any gender.', note: 'Plural → les' },
      { id: 'a1g2-6', prompt: 'Translate: "a woman"', answer: 'une femme', hint: 'femme is feminine.', note: 'une = a (feminine)' },
      { id: 'a1g2-7', prompt: 'Which ending almost always signals feminine?', answer: '-tion', options: ['-ment', '-age', '-tion', '-eur'], hint: 'Think: nation, situation, attention…', note: '-tion words are 98% feminine in French.' },
    ],
  },

  // ── A2 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'a2-g1',
    level: 'A2',
    title: 'Grammar Checkpoint 1',
    subtitle: 'Talking about the past',
    concept: 'Passé Composé',
    explanation: [
      'The passé composé is the main past tense in spoken French. It\'s formed with avoir or être + past participle.',
      'Most verbs use avoir: j\'ai mangé (I ate), tu as vu (you saw). A group of ~17 verbs use être instead — remember them with the "DR MRS VANDERTRAMP" mnemonic or think of movement/change-of-state verbs.',
      'With être, the past participle agrees with the subject: Elle est allée (f), Ils sont allés (mp).',
    ],
    table: {
      header: ['Sujet', 'avoir + mangé', 'être + allé(e)'],
      rows: [
        ["j'", "j'ai mangé", 'je suis allé(e)'],
        ['tu', 'tu as mangé', 'tu es allé(e)'],
        ['il/elle', 'il a mangé', 'il est allé / elle est allée'],
        ['nous', 'nous avons mangé', 'nous sommes allés'],
        ['vous', 'vous avez mangé', 'vous êtes allé(s)'],
        ['ils/elles', 'ils ont mangé', 'ils sont allés'],
      ],
    },
    tip: '🧠 "DR MRS VANDERTRAMP" — each letter is a verb that takes être: Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Rentrer, Arriver, Mourir, Partir.',
    exercises: [
      { id: 'a2g1-1', prompt: 'Translate: "She ate a croissant."', answer: 'Elle a mangé un croissant.', hint: 'manger uses avoir.', note: 'avoir + mangé' },
      { id: 'a2g1-2', prompt: '"He went to Paris." — Does aller use avoir or être?', answer: 'être', options: ['avoir', 'être', 'neither', 'both'], hint: 'aller is a movement verb.', note: 'aller → être (allé)' },
      { id: 'a2g1-3', prompt: 'Fill in: "Nous _____ (arriver) hier."', answer: 'sommes arrivés', hint: 'arriver uses être.', note: 'être + arrivé, agreement with nous (m/pl)' },
      { id: 'a2g1-4', prompt: 'Translate: "Did you (tu) see the film?"', answer: 'Tu as vu le film ?', hint: 'voir uses avoir. Participle: vu.', note: 'avoir + vu' },
    ],
  },

  // ── A2 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'a2-g2',
    level: 'A2',
    title: 'Grammar Checkpoint 2',
    subtitle: 'Object pronouns',
    concept: 'Pronoms COD/COI',
    explanation: [
      'Instead of repeating a noun, French uses object pronouns placed BEFORE the verb (unlike English where they come after).',
      'Direct object pronouns: me, te, le/la, nous, vous, les. Indirect: me, te, lui, nous, vous, leur.',
      'Example: "Je regarde le film" → "Je le regarde". The pronoun jumps before the verb!',
    ],
    table: {
      header: ['Personne', 'Direct (COD)', 'Indirect (COI)'],
      rows: [
        ['1sg', 'me / m\'', 'me / m\''],
        ['2sg', 'te / t\'', 'te / t\''],
        ['3sg m', 'le / l\'', 'lui'],
        ['3sg f', 'la / l\'', 'lui'],
        ['1pl', 'nous', 'nous'],
        ['2pl', 'vous', 'vous'],
        ['3pl', 'les', 'leur'],
      ],
    },
    tip: '🧠 Key difference: "lui" and "leur" are indirect only. If you can ask "who?" after the verb, it\'s indirect. "Je parle à lui" → "Je lui parle".',
    exercises: [
      { id: 'a2g2-1', prompt: 'Replace: "Je vois Marie." → "Je ___ vois."', answer: 'la', options: ['la', 'lui', 'le', 'les'], hint: 'Marie is feminine, direct object.', note: 'COD féminin → la' },
      { id: 'a2g2-2', prompt: 'Replace: "Tu parles à Pierre." → "Tu ___ parles."', answer: 'lui', options: ['lui', 'le', 'la', 'leur'], hint: 'Parler à = indirect object, masculine.', note: 'COI sg → lui' },
      { id: 'a2g2-3', prompt: 'Translate using a pronoun: "I see them." (les livres)', answer: 'Je les vois.', hint: 'Plural direct object.', note: 'COD pluriel → les' },
    ],
  },

  // ── B1 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'b1-g1',
    level: 'B1',
    title: 'Grammar Checkpoint 1',
    subtitle: 'Ongoing actions in the past',
    concept: 'Imparfait vs Passé Composé',
    explanation: [
      'The imparfait describes ongoing states, habits, or backgrounds in the past ("I was doing", "I used to"). The passé composé describes completed events ("I did").',
      'Think of it as: passé composé = camera snapshot (a moment). Imparfait = a film playing in the background.',
      'Imparfait formation: take nous form of present, remove -ons, add endings: -ais, -ais, -ait, -ions, -iez, -aient.',
    ],
    table: {
      header: ['Imparfait (ongoing)', 'Passé Composé (completed)'],
      rows: [
        ['Il habitait Paris.', 'Il a déménagé à Paris.'],
        ['Je regardais la télé…', '…quand le téléphone a sonné.'],
        ['Quand j\'étais enfant…', "J'ai visité Paris en 2019."],
      ],
    },
    tip: '🧠 "Quand je regardais la télé, le téléphone a sonné." — The imparfait sets the scene (watching TV), the passé composé is the event that interrupts (phone rang).',
    exercises: [
      { id: 'b1g1-1', prompt: 'Which tense? "She used to live in Lyon."', answer: 'imparfait', options: ['imparfait', 'passé composé', 'présent', 'futur'], hint: 'Habitual past action.', note: 'Habitual → imparfait' },
      { id: 'b1g1-2', prompt: 'Fill: "Quand il _____ (dormir), le chien a aboyé."', answer: 'dormait', hint: 'Background action → imparfait.', note: 'dormir → dormait (imparfait)' },
      { id: 'b1g1-3', prompt: 'Translate: "I was reading when she arrived."', answer: 'Je lisais quand elle est arrivée.', hint: 'Reading = background (imparfait). Arrived = event (PC).', note: 'lisais (imparfait) + est arrivée (PC)' },
    ],
  },

  // ── B1 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'b1-g2', level: 'B1',
    title: 'Grammar Checkpoint 2', subtitle: 'Expressing conditions',
    concept: 'Conditionnel',
    explanation: [
      'The conditionnel (conditional) expresses hypothetical situations: "I would go", "She would say". It\'s also used for polite requests.',
      'Formation: infinitive + imparfait endings (-ais, -ais, -ait, -ions, -iez, -aient). For -re verbs, drop the final e first.',
    ],
    table: {
      header: ['Sujet', 'aller (to go)', 'vouloir (to want)'],
      rows: [
        ['je', 'j\'irais', 'je voudrais'],
        ['tu', 'tu irais', 'tu voudrais'],
        ['il/elle', 'il irait', 'elle voudrait'],
        ['nous', 'nous irions', 'nous voudrions'],
        ['vous', 'vous iriez', 'vous voudriez'],
      ],
    },
    tip: '🧠 "Je voudrais" (I would like) is the polite way to order in a restaurant — much more common than "je veux" which sounds blunt.',
    exercises: [
      { id: 'b1g2-1', prompt: 'Translate politely: "I would like a coffee."', answer: 'Je voudrais un café.', hint: 'Use the conditional of vouloir.', note: 'vouloir → je voudrais' },
      { id: 'b1g2-2', prompt: 'Fill: "Si j\'avais le temps, je _____ (voyager)."', answer: 'voyagerais', hint: 'Conditional of voyager.', note: 'voyager + ais → voyagerais' },
    ],
  },

  // ── B2/C1/C2 placeholders ─────────────────────────────────────────────────
  {
    id: 'b2-g1', level: 'B2',
    title: 'Grammar Checkpoint 1', subtitle: 'Linking ideas',
    concept: 'Subjonctif',
    explanation: [
      'The subjonctif expresses doubt, emotion, necessity, or subjective judgment. It\'s triggered by specific phrases and conjunctions.',
      'Common triggers: il faut que, je veux que, bien que, pour que, à condition que.',
    ],
    table: {
      header: ['Trigger phrase', 'Example'],
      rows: [
        ['Il faut que', 'Il faut que tu viennes.'],
        ['Je veux que', 'Je veux qu\'il soit là.'],
        ['Bien que', 'Bien qu\'il pleuve, on sort.'],
        ['Pour que', 'Je parle lentement pour que tu comprennes.'],
      ],
    },
    tip: '🧠 If you can replace the phrase with "it is important/necessary that…", it probably needs the subjonctif.',
    exercises: [
      { id: 'b2g1-1', prompt: 'Fill: "Il faut que tu _____ (venir)."', answer: 'viennes', hint: 'venir is irregular in subjonctif.', note: 'venir → viennes (subjonctif)' },
      { id: 'b2g1-2', prompt: 'Does "Je pense que" require the subjonctif?', answer: 'Non', options: ['Oui', 'Non', 'Parfois', 'Toujours'], hint: '"penser que" expresses certainty.', note: 'penser que → indicatif' },
    ],
  },
  { id: 'b2-g2', level: 'B2', title: 'Grammar Checkpoint 2', subtitle: 'Passive & Causative', concept: 'Voix passive & faire causatif', explanation: ['La voix passive: Le sujet reçoit l\'action. Formation: être + participe passé.', 'Le causatif: faire + infinitif exprime qu\'on fait faire quelque chose par quelqu\'un d\'autre.'], tip: '🧠 "Je fais couper mes cheveux" = I have my hair cut (someone does it for me).', exercises: [{ id: 'b2g2-1', prompt: 'Mettez à la voix passive: "Le chef cuisine le repas."', answer: 'Le repas est cuisiné par le chef.', hint: 'être + participe passé + par.', note: 'Voix passive: être + pp' }] },
  { id: 'c1-g1', level: 'C1', title: 'Grammar Checkpoint 1', subtitle: 'Nuancing register', concept: 'Registre & Niveaux de langue', explanation: ['French has distinct registers: familier, courant, soutenu. The same idea expressed at different levels signals education and social awareness.'], tip: '🧠 "boulot" (fam) = "travail" (courant) = "emploi" (soutenu) — all mean "work/job".', exercises: [{ id: 'c1g1-1', prompt: 'What is the formal equivalent of "bosser"?', answer: 'travailler', options: ['travailler', 'boulotter', 'œuvrer', 'faire'], hint: 'Think standard dictionary verb for "to work".', note: 'bosser (fam) → travailler (courant)' }] },
  { id: 'c1-g2', level: 'C1', title: 'Grammar Checkpoint 2', subtitle: 'Advanced linking', concept: 'Participe présent & Gérondif', explanation: ['Participe présent: verb + -ant (like English -ing). Gérondif: en + participe présent (while doing, by doing).'], tip: '🧠 "En travaillant, il écoute la radio." = While working, he listens to the radio.', exercises: [{ id: 'c1g2-1', prompt: 'Translate: "By practicing every day, she improved."', answer: 'En pratiquant tous les jours, elle s\'est améliorée.', hint: 'Gérondif: en + participe présent.', note: 'en + pratiquant = gérondif' }] },
  { id: 'c2-g1', level: 'C2', title: 'Grammar Checkpoint 1', subtitle: 'Rare but elegant', concept: 'Subjonctif passé & Concordance des temps', explanation: ['At C2 level, mastering sequence of tenses (concordance des temps) is essential for formal writing and speech.'], tip: '🧠 In subordinate clauses, the tense must logically match the main clause tense.', exercises: [{ id: 'c2g1-1', prompt: 'Fill: "Bien qu\'elle _____ (partir) tôt, elle est arrivée en retard."', answer: 'soit partie', hint: 'Bien que + subjonctif passé (completed action).', note: 'subjonctif passé: soit + participe passé' }] },
  { id: 'c2-g2', level: 'C2', title: 'Grammar Checkpoint 2', subtitle: 'Mastery of nuance', concept: 'Figures de style', explanation: ['Literary French uses rhetorical devices: anaphore, chiasme, litote, euphémisme. Recognizing them is required for the C2 DALF exam.'], tip: '🧠 Litote: saying less to mean more. "Ce n\'est pas mauvais" = it\'s actually quite good.', exercises: [{ id: 'c2g2-1', prompt: '"Ce n\'est pas sans intérêt" is an example of which device?', answer: 'litote', options: ['métaphore', 'litote', 'anaphore', 'chiasme'], hint: 'Understatement via negation.', note: 'Litote = understatement' }] },
]

export function getGrammarNode(id: string): GrammarNode | undefined {
  return GRAMMAR_NODES.find(g => g.id === id)
}

export function getGrammarNodesForLevel(level: CefrLevel): GrammarNode[] {
  return GRAMMAR_NODES.filter(g => g.level === level)
}

// Grammar node IDs per level (two per level, in tree order)
export const LEVEL_GRAMMAR_IDS: Record<CefrLevel, [string, string]> = {
  A1: ['a1-g1', 'a1-g2'],
  A2: ['a2-g1', 'a2-g2'],
  B1: ['b1-g1', 'b1-g2'],
  B2: ['b2-g1', 'b2-g2'],
  C1: ['c1-g1', 'c1-g2'],
  C2: ['c2-g1', 'c2-g2'],
}
