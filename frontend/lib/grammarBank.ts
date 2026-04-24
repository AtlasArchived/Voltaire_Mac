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

  // ── B2 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'b2-g1',
    level: 'B2',
    title: 'Grammar Checkpoint 1',
    subtitle: 'Expressing doubt, emotion & necessity',
    concept: 'Subjonctif',
    explanation: [
      'The subjonctif expresses doubt, emotion, necessity, or subjective judgment. It\'s triggered by specific phrases and conjunctions.',
      'Common triggers: il faut que, je veux que, bien que, pour que, à condition que, quoique, avant que.',
      'Formation: take the ils/elles form of the present, remove -ent, add -e, -es, -e, -ions, -iez, -ent. Irregular stems: être → soi-, avoir → ai-/ay-, aller → aill-/all-.',
    ],
    table: {
      header: ['Trigger phrase', 'Example'],
      rows: [
        ['Il faut que', 'Il faut que tu viennes.'],
        ['Je veux que', 'Je veux qu\'il soit là.'],
        ['Bien que', 'Bien qu\'il pleuve, on sort.'],
        ['Pour que', 'Je parle lentement pour que tu comprennes.'],
        ['Avant que', 'Finis avant qu\'il parte.'],
        ['À condition que', 'J\'accepte à condition que tu travailles.'],
      ],
    },
    tip: '🧠 If you can replace the phrase with "it is important/necessary that…", it probably needs the subjonctif.',
    exercises: [
      { id: 'b2g1-1', prompt: 'Fill: "Il faut que tu _____ (venir)."', answer: 'viennes', hint: 'venir is irregular in subjonctif.', note: 'venir → viennes (subjonctif)' },
      { id: 'b2g1-2', prompt: 'Does "Je pense que" require the subjonctif?', answer: 'Non', options: ['Oui', 'Non', 'Parfois', 'Toujours'], hint: '"penser que" expresses certainty.', note: 'penser que → indicatif' },
      { id: 'b2g1-3', prompt: 'Fill: "Bien qu\'il _____ (être) fatigué, il continue."', answer: 'soit', hint: 'être → soit in subjonctif.', note: 'être → soit (subjonctif irrégulier)' },
      { id: 'b2g1-4', prompt: 'Fill: "Je veux que vous _____ (finir) avant midi."', answer: 'finissiez', hint: 'Regular -ir verb: finir → ils finissent → finiss- + -iez.', note: 'finir → finissiez (subjonctif)' },
      { id: 'b2g1-5', prompt: 'Which triggers the subjonctif?', answer: 'avant que', options: ['parce que', 'avant que', 'depuis que', 'pendant que'], hint: 'Only conjunctions of time/concession/purpose use subjonctif.', note: 'avant que → subjonctif' },
      { id: 'b2g1-6', prompt: 'Translate: "I\'m surprised that she didn\'t come."', answer: 'Je suis surpris qu\'elle ne soit pas venue.', hint: 'Surprise triggers subjonctif. Use subjonctif passé for the completed action.', note: 'être surpris que → subjonctif passé' },
    ],
  },

  // ── B2 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'b2-g2',
    level: 'B2',
    title: 'Grammar Checkpoint 2',
    subtitle: 'Passive voice & causative constructions',
    concept: 'Voix passive & Faire causatif',
    explanation: [
      'La voix passive: the subject receives the action instead of performing it. Formation: être + past participle (agreeing with subject) + par + agent.',
      'The causative (faire + infinitive) expresses that the subject has someone else do the action for them: "Je fais réparer ma voiture" = I have my car repaired.',
      'Both are common in formal writing and press. The passive is also frequently replaced by "on" in conversational French.',
    ],
    table: {
      header: ['Structure', 'Example', 'English'],
      rows: [
        ['Active', 'Le chef prépare le repas.', 'The chef prepares the meal.'],
        ['Passive', 'Le repas est préparé par le chef.', 'The meal is prepared by the chef.'],
        ['Passive (past)', 'La lettre a été envoyée.', 'The letter was sent.'],
        ['Causatif', 'Je fais couper mes cheveux.', 'I have my hair cut.'],
        ['Causatif + agent', 'Elle fait réparer la voiture par le garagiste.', 'She has the car fixed by the mechanic.'],
      ],
    },
    tip: '🧠 "Je fais couper mes cheveux" = someone cuts my hair for me. "Je coupe mes cheveux" = I cut my own hair.',
    exercises: [
      { id: 'b2g2-1', prompt: 'Mettez à la voix passive: "Le chef cuisine le repas."', answer: 'Le repas est cuisiné par le chef.', hint: 'être + participe passé + par.', note: 'Voix passive: être + pp + par' },
      { id: 'b2g2-2', prompt: 'Mettez à la voix passive: "Les élèves ont résolu le problème."', answer: 'Le problème a été résolu par les élèves.', hint: 'Past passive: avoir été + pp.', note: 'Passé passif: a été + résolu' },
      { id: 'b2g2-3', prompt: 'Does the past participle agree with the subject in the passive?', answer: 'Oui', options: ['Oui', 'Non', 'Parfois', 'Jamais'], hint: 'In the passive, être is the auxiliary — it always triggers agreement.', note: 'Être passive → pp agrees with subject' },
      { id: 'b2g2-4', prompt: 'Translate using faire causatif: "She has the house painted."', answer: 'Elle fait peindre la maison.', hint: 'faire + infinitif. No agreement with the following noun.', note: 'faire + peindre (causatif)' },
      { id: 'b2g2-5', prompt: 'Fill: "On _____ (construire) ce pont en 1890." — voix passive implicite.', answer: 'a construit', hint: 'In French, "on + active" often replaces the passive in speech.', note: 'on + passé composé replaces passive colloquially' },
    ],
  },

  // ── C1 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'c1-g1',
    level: 'C1',
    title: 'Grammar Checkpoint 1',
    subtitle: 'Speaking and writing at the right level',
    concept: 'Registre & Niveaux de langue',
    explanation: [
      'French has distinct registers: familier (informal), courant (standard), and soutenu (formal/literary). Choosing the right register signals education and social awareness.',
      'In spoken French, many grammar rules are relaxed: "ne" is often dropped in negation, "tu" replaces "vous" among peers, liaisons are skipped.',
      'In written and formal French: double negation is maintained (ne...pas), subjunctives appear, and vocabulary is elevated.',
    ],
    table: {
      header: ['Familier', 'Courant', 'Soutenu'],
      rows: [
        ['boulot', 'travail', 'emploi / labeur'],
        ['bosser', 'travailler', 'œuvrer'],
        ['mec / gars', 'homme / garçon', 'individu / monsieur'],
        ['c\'est pas bien', 'ce n\'est pas bien', 'cela n\'est guère convenable'],
        ['j\'sais pas', 'je ne sais pas', 'je l\'ignore'],
        ['kiffer', 'aimer', 'apprécier / affectionner'],
      ],
    },
    tip: '🧠 "boulot" (fam) = "travail" (courant) = "emploi" (soutenu) — all mean "work/job".',
    exercises: [
      { id: 'c1g1-1', prompt: 'What is the formal equivalent of "bosser"?', answer: 'travailler', options: ['travailler', 'boulotter', 'œuvrer', 'faire'], hint: 'Think standard dictionary verb for "to work".', note: 'bosser (fam) → travailler (courant)' },
      { id: 'c1g1-2', prompt: 'Which is the most soutenu way to say "I don\'t know"?', answer: 'Je l\'ignore.', options: ['Je sais pas.', 'Je ne sais pas.', 'Je l\'ignore.', 'J\'ai aucune idée.'], hint: 'soutenu uses elevated vocabulary and full negation.', note: 'ignorer = not know (soutenu)' },
      { id: 'c1g1-3', prompt: 'In formal speech, which rule must NOT be dropped?', answer: 'ne in negation', options: ['ne in negation', 'liaison after "et"', 'elision of "le"', 'agreement of adjectives'], hint: '"Je sais pas" is familier — "je ne sais pas" is required in writing.', note: 'ne-pas: never drop "ne" in soutenu' },
      { id: 'c1g1-4', prompt: 'Elevate this sentence to soutenu: "C\'est super comme idée."', answer: 'C\'est une idée remarquable.', hint: 'Replace "super" (fam) with a formal adjective.', note: 'super → remarquable / excellente' },
      { id: 'c1g1-5', prompt: 'Which register uses "ne...guère" as a negation?', answer: 'soutenu', options: ['familier', 'courant', 'soutenu', 'argot'], hint: 'ne...guère means "hardly/scarcely" — only in elevated writing.', note: 'ne...guère = soutenu negation' },
    ],
  },

  // ── C1 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'c1-g2',
    level: 'C1',
    title: 'Grammar Checkpoint 2',
    subtitle: 'Linking actions with verbal nouns',
    concept: 'Participe présent & Gérondif',
    explanation: [
      'The participe présent (present participle) is formed by taking the nous form of the present tense, removing -ons, and adding -ant. It functions like an adjective or adverb.',
      'The gérondif adds "en" before the participe présent and means "while doing" or "by doing". Both subject and the gérondif action must share the same subject.',
      'Three common irregulars: être → étant, avoir → ayant, savoir → sachant.',
    ],
    table: {
      header: ['Form', 'Formation', 'Example'],
      rows: [
        ['Participe présent', 'nous form - ons + ant', 'parlant, finissant, vendant'],
        ['Gérondif', 'en + participe présent', 'en parlant, en finissant'],
        ['Étant (être)', 'irregular', 'Étant malade, il reste chez lui.'],
        ['Ayant (avoir)', 'irregular', 'Ayant fini, elle est sortie.'],
        ['Sachant (savoir)', 'irregular', 'Sachant la vérité, il se tut.'],
      ],
    },
    tip: '🧠 "En travaillant, il écoute la radio." = While working, he listens to the radio. Both actions share the same subject (il).',
    exercises: [
      { id: 'c1g2-1', prompt: 'Translate: "By practicing every day, she improved."', answer: 'En pratiquant tous les jours, elle s\'est améliorée.', hint: 'Gérondif: en + participe présent.', note: 'en + pratiquant = gérondif' },
      { id: 'c1g2-2', prompt: 'Form the participe présent of "finir".', answer: 'finissant', hint: 'nous finissons → finiss- + ant.', note: 'finir → finissant' },
      { id: 'c1g2-3', prompt: 'What is the participe présent of "être"?', answer: 'étant', options: ['étant', 'être', 'soyant', 'estant'], hint: 'Irregular — must be memorized.', note: 'être → étant (irrégulier)' },
      { id: 'c1g2-4', prompt: 'Fill: "_____ (savoir) qu\'il avait tort, elle n\'insista pas." (participe présent)', answer: 'Sachant', hint: 'savoir → sachant (irregular).', note: 'savoir → sachant' },
      { id: 'c1g2-5', prompt: 'Which sentence is grammatically correct?', answer: 'En chantant, elle cuisine.', options: ['En chantant, la cuisine est faite.', 'En chantant, elle cuisine.', 'En chantant par elle, la maison résonne.', 'Chantant par lui, la rue est animée.'], hint: 'The gérondif subject and main clause subject must be the same person.', note: 'Gérondif requires same subject in both clauses' },
    ],
  },

  // ── C2 Grammar 1 ──────────────────────────────────────────────────────────
  {
    id: 'c2-g1',
    level: 'C2',
    title: 'Grammar Checkpoint 1',
    subtitle: 'Mastering sequence of tenses',
    concept: 'Subjonctif passé & Concordance des temps',
    explanation: [
      'At C2 level, mastering sequence of tenses (concordance des temps) is essential for formal writing and speech.',
      'The subjonctif passé is formed with avoir/être in the subjonctif présent + past participle. It expresses a completed action in a subjunctive clause.',
      'In formal/literary French, the subjonctif imparfait and plus-que-parfait replace the présent and passé forms in past contexts — essential for the DALF C2 exam.',
    ],
    table: {
      header: ['Main clause tense', 'Subordinate subjonctif', 'Example'],
      rows: [
        ['Present/Future', 'Subjonctif présent', 'Je veux qu\'il vienne.'],
        ['Present/Future', 'Subjonctif passé', 'Je suis content qu\'elle soit arrivée.'],
        ['Past (formal)', 'Subjonctif imparfait', 'Il voulait qu\'elle vînt.'],
        ['Past (formal)', 'Subjonctif plus-que-parfait', 'Il aurait voulu qu\'elle fût venue.'],
      ],
    },
    tip: '🧠 In subordinate clauses, the tense must logically match the main clause tense. The subjonctif imparfait/plus-que-parfait appear mainly in literature and formal essays.',
    exercises: [
      { id: 'c2g1-1', prompt: 'Fill: "Bien qu\'elle _____ (partir) tôt, elle est arrivée en retard."', answer: 'soit partie', hint: 'Bien que + subjonctif passé (completed action).', note: 'subjonctif passé: soit + participe passé' },
      { id: 'c2g1-2', prompt: 'Form the subjonctif passé of "avoir (eu)": "Bien qu\'il _____ beaucoup de chance."', answer: 'ait eu', hint: 'avoir → ait (subj. présent) + eu (pp).', note: 'avoir → ait eu (subjonctif passé)' },
      { id: 'c2g1-3', prompt: 'Which form is used after a past main verb in literary French?', answer: 'subjonctif imparfait', options: ['subjonctif présent', 'subjonctif imparfait', 'conditionnel passé', 'indicatif imparfait'], hint: 'Formal past sequence requires imparfait du subjonctif.', note: 'Formal past → subjonctif imparfait' },
      { id: 'c2g1-4', prompt: 'Translate formally: "He wanted her to come." (literary)', answer: 'Il voulait qu\'elle vînt.', hint: 'venir → subjonctif imparfait (3sg) = vînt.', note: 'venir → vînt (subjonctif imparfait, littéraire)' },
      { id: 'c2g1-5', prompt: 'Fill: "Je regrette qu\'elle _____ (ne pas pouvoir) assister à la cérémonie." (subjonctif passé)', answer: 'n\'ait pas pu', hint: 'subjonctif passé of pouvoir: avoir (ait) + pu.', note: 'pouvoir → n\'ait pas pu (subj. passé négatif)' },
    ],
  },

  // ── C2 Grammar 2 ──────────────────────────────────────────────────────────
  {
    id: 'c2-g2',
    level: 'C2',
    title: 'Grammar Checkpoint 2',
    subtitle: 'Literary devices in French',
    concept: 'Figures de style',
    explanation: [
      'Literary French uses rhetorical devices (figures de style): anaphore, chiasme, litote, euphémisme, hyperbole, métaphore, oxymore. Recognizing them is required for the C2 DALF exam.',
      'Litote says less to mean more ("ce n\'est pas mauvais" = it\'s quite good). Hyperbole exaggerates. Euphémisme softens. Anaphore repeats words at the start of clauses. Chiasme reverses the structure (AB → BA).',
    ],
    table: {
      header: ['Figure', 'Definition', 'Example'],
      rows: [
        ['Litote', 'Understatement via negation', '"Ce n\'est pas sans intérêt."'],
        ['Hyperbole', 'Exaggeration', '"Je t\'ai dit mille fois de ranger ta chambre."'],
        ['Euphémisme', 'Softening unpleasant reality', '"Il nous a quittés." (He died.)'],
        ['Anaphore', 'Repetition at start of clauses', '"Liberté, égalité, fraternité."'],
        ['Chiasme', 'Inverted parallel structure AB/BA', '"Il faut manger pour vivre, non vivre pour manger."'],
        ['Oxymore', 'Contradictory terms together', '"Cette obscure clarté…" (Corneille)'],
      ],
    },
    tip: '🧠 Litote: saying less to mean more. "Ce n\'est pas mauvais" = it\'s actually quite good.',
    exercises: [
      { id: 'c2g2-1', prompt: '"Ce n\'est pas sans intérêt" is an example of which device?', answer: 'litote', options: ['métaphore', 'litote', 'anaphore', 'chiasme'], hint: 'Understatement via negation.', note: 'Litote = understatement' },
      { id: 'c2g2-2', prompt: 'Identify the figure: "Je t\'ai répété mille fois de fermer la porte."', answer: 'hyperbole', options: ['litote', 'hyperbole', 'euphémisme', 'oxymore'], hint: '"Mille fois" is clearly an exaggeration.', note: 'Hyperbole = exaggeration' },
      { id: 'c2g2-3', prompt: 'Which figure softens the word "mourir" into "nous quitter"?', answer: 'euphémisme', options: ['litote', 'anaphore', 'euphémisme', 'chiasme'], hint: 'Replacing a harsh reality with a gentler expression.', note: 'Euphémisme = polite softening' },
      { id: 'c2g2-4', prompt: '"Il faut manger pour vivre, non vivre pour manger." — Which device?', answer: 'chiasme', options: ['anaphore', 'oxymore', 'chiasme', 'euphémisme'], hint: 'Notice the AB / BA inversion of "manger" and "vivre".', note: 'Chiasme = inverted parallel (AB→BA)' },
      { id: 'c2g2-5', prompt: 'Identify: "Cette obscure clarté qui tombe des étoiles." (Corneille)', answer: 'oxymore', options: ['métaphore', 'oxymore', 'litote', 'anaphore'], hint: '"Obscure clarté" = dark light — two contradictory terms.', note: 'Oxymore = contradictory terms combined' },
    ],
  },
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
