// lib/grammar.ts
// Voltaire — French Grammar Reference
// 40+ rules organized by CEFR level and category

export interface GrammarExample {
  fr:   string
  en:   string
  note?: string
}

export interface GrammarRule {
  id:       string
  title:    string
  cefr:     'A1'|'A2'|'B1'|'B2'|'C1'|'C2'
  category: string
  summary:  string
  detail:   string
  examples: GrammarExample[]
  tip?:     string
}

export const CATEGORIES = ['All','Verbs','Nouns','Pronouns','Adjectives','Questions','Negation','Tenses','Prepositions','Numbers']

export const GRAMMAR: GrammarRule[] = [
  // ── A1 ────────────────────────────────────────────────────────────────────
  {
    id:'present-etre', title:'être — Present Tense', cefr:'A1', category:'Verbs',
    summary:'The most essential French verb — to be.',
    detail:'être is irregular and must be memorized. It is used for identity, origin, profession, and description. Unlike English, French uses avoir (not être) for hunger, thirst, age, etc.',
    examples:[
      {fr:'Je suis Jackson.',        en:'I am Jackson.'},
      {fr:'Tu es fatigué ?',         en:'Are you tired?'},
      {fr:'Il est médecin.',         en:'He is a doctor.', note:'No article before profession'},
      {fr:'Nous sommes à Paris.',    en:'We are in Paris.'},
    ],
    tip:'Profession: no article. "Je suis médecin" not "Je suis un médecin" — Duolingo gets this wrong constantly.'
  },
  {
    id:'present-avoir', title:'avoir — Present Tense', cefr:'A1', category:'Verbs',
    summary:'To have — and much more.',
    detail:'avoir is used for possession but also for hunger, thirst, age, fear, heat, cold, and need. These are false cognates — English uses "to be" for most of them.',
    examples:[
      {fr:'J\'ai un chat.',          en:'I have a cat.'},
      {fr:'Tu as quel âge ?',        en:'How old are you?', note:'Literally: you have what age?'},
      {fr:'J\'ai faim.',             en:'I am hungry.',     note:'Literally: I have hunger'},
      {fr:'Nous avons soif.',        en:'We are thirsty.',  note:'avoir soif, not être soif'},
    ],
    tip:'avoir faim/soif/chaud/froid/peur/besoin — all with avoir, never être.'
  },
  {
    id:'gender-nouns', title:'Noun Gender', cefr:'A1', category:'Nouns',
    summary:'Every French noun is masculine or feminine.',
    detail:'French nouns have gender that must be learned with the word. The article changes: le/un (masculine), la/une (feminine), les/des (plural). There are patterns but many exceptions.',
    examples:[
      {fr:'le livre',     en:'the book (m)'},
      {fr:'la table',     en:'the table (f)'},
      {fr:'un café',      en:'a coffee (m)'},
      {fr:'une baguette', en:'a baguette (f)'},
    ],
    tip:'Words ending in -tion, -ée, -ure are usually feminine. Words ending in -ment, -age are usually masculine.'
  },
  {
    id:'negation-ne-pas', title:'Negation: ne…pas', cefr:'A1', category:'Negation',
    summary:'The negation sandwich around the verb.',
    detail:'In French, negation wraps the verb: ne before, pas after. In spoken French, ne is often dropped — you\'ll hear "je sais pas" not "je ne sais pas". Both are correct in context.',
    examples:[
      {fr:'Je ne parle pas français.',  en:'I don\'t speak French.'},
      {fr:'Il n\'est pas là.',          en:'He is not here.',       note:'ne becomes n\' before vowel'},
      {fr:'Nous n\'avons pas le temps.',en:'We don\'t have time.'},
      {fr:'Je sais pas.',               en:'I don\'t know.',        note:'Casual — ne dropped'},
    ],
    tip:'ne...pas is basic negation. Others: ne...plus (no more), ne...jamais (never), ne...rien (nothing).'
  },
  {
    id:'questions-basic', title:'Asking Questions', cefr:'A1', category:'Questions',
    summary:'Three ways to ask a question in French.',
    detail:'1. Rising intonation (casual): "Tu parles français?" 2. Est-ce que (standard): "Est-ce que tu parles français?" 3. Inversion (formal/written): "Parles-tu français?"',
    examples:[
      {fr:'Tu viens ?',                    en:'Are you coming?',       note:'Intonation — most casual'},
      {fr:'Est-ce que tu viens ?',         en:'Are you coming?',       note:'Est-ce que — standard'},
      {fr:'Venez-vous ?',                  en:'Are you coming?',       note:'Inversion — formal/written'},
      {fr:'Où est-ce que tu vas ?',        en:'Where are you going?'},
    ],
    tip:'In everyday conversation, intonation (just raise your voice) is perfectly natural and most common.'
  },
  {
    id:'articles', title:'Definite and Indefinite Articles', cefr:'A1', category:'Nouns',
    summary:'le/la/les vs un/une/des',
    detail:'Definite articles (le, la, les) = "the" — for specific things. Indefinite articles (un, une, des) = "a/some" — for non-specific things. Before vowels: le/la → l\'.',
    examples:[
      {fr:'Le café est bon.',     en:'The coffee is good.',    note:'Specific coffee'},
      {fr:'Je veux un café.',     en:'I want a coffee.',       note:'Any coffee'},
      {fr:'J\'aime les chiens.', en:'I like dogs.',            note:'French generalizes with definite article'},
      {fr:'L\'hôtel est grand.', en:'The hotel is big.',       note:'l\' before vowel'},
    ],
    tip:'French uses definite articles where English uses none: "J\'aime le vin" = "I like wine" (not "the wine").'
  },

  // ── A2 ────────────────────────────────────────────────────────────────────
  {
    id:'passe-compose', title:'Passé Composé', cefr:'A2', category:'Tenses',
    summary:'The main past tense for completed actions.',
    detail:'Passé composé = avoir/être + past participle. Most verbs use avoir. The DR MRS VANDERTRAMP verbs (motion/state) use être: aller, venir, partir, arriver, entrer, sortir, naître, mourir, rester, tomber, descendre, monter, retourner.',
    examples:[
      {fr:'J\'ai mangé une pizza.',      en:'I ate a pizza.',           note:'avoir + mangé'},
      {fr:'Elle est allée à Paris.',     en:'She went to Paris.',        note:'être + allée (feminine!)'},
      {fr:'Nous sommes arrivés hier.',   en:'We arrived yesterday.',     note:'être + arrivés (plural!)'},
      {fr:'Il n\'a pas dormi.',          en:'He didn\'t sleep.',         note:'ne...pas around auxiliary'},
    ],
    tip:'DR MRS VANDERTRAMP: Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Rentrer, Arriver, Mourir, Partir.'
  },
  {
    id:'imparfait', title:'Imparfait', cefr:'A2', category:'Tenses',
    summary:'For habits, states, and ongoing past actions.',
    detail:'The imparfait describes: 1. Habits in the past ("I used to...") 2. Ongoing states/descriptions 3. Actions in progress when interrupted. Contrast with passé composé which is for completed actions.',
    examples:[
      {fr:'Je mangeais toujours là.',    en:'I always used to eat there.',  note:'Habit'},
      {fr:'Il faisait beau.',            en:'The weather was nice.',         note:'Description'},
      {fr:'Je lisais quand il est arrivé.', en:'I was reading when he arrived.', note:'Interrupted action'},
    ],
    tip:'Imparfait = ongoing/habitual/descriptive. Passé composé = specific completed events. They often appear together in the same story.'
  },
  {
    id:'pronouns-direct', title:'Direct Object Pronouns', cefr:'A2', category:'Pronouns',
    summary:'me, te, le, la, nous, vous, les — replace the direct object.',
    detail:'Direct object pronouns replace the noun receiving the verb\'s action. They go BEFORE the verb in French (unlike English where they come after). In passé composé, they go before avoir/être.',
    examples:[
      {fr:'Je mange la pomme. → Je la mange.',    en:'I eat the apple. → I eat it.'},
      {fr:'Tu connais Paul ? → Tu le connais ?',  en:'Do you know Paul? → Do you know him?'},
      {fr:'Il nous invite.',                       en:'He\'s inviting us.'},
      {fr:'Je l\'ai vu hier.',                     en:'I saw him/it yesterday.',  note:'Before avoir in PC'},
    ],
    tip:'Pronoun order before verb: me/te/se/nous/vous → le/la/les → lui/leur → y → en'
  },
  {
    id:'adjective-agreement', title:'Adjective Agreement', cefr:'A2', category:'Adjectives',
    summary:'Adjectives match the noun in gender and number.',
    detail:'French adjectives agree with the noun they describe. Add -e for feminine, -s for plural, -es for feminine plural. Many adjectives have irregular feminine forms. Most adjectives follow the noun (BAGS adjectives precede).',
    examples:[
      {fr:'un café chaud / une soupe chaude',  en:'a hot coffee / a hot soup'},
      {fr:'des livres intéressants',            en:'interesting books'},
      {fr:'une belle femme / un bel homme',    en:'a beautiful woman / a handsome man', note:'bel before masc vowel'},
      {fr:'le premier jour',                    en:'the first day',  note:'BAGS adjective before noun'},
    ],
    tip:'BAGS adjectives go BEFORE the noun: Beauty (beau), Age (jeune/vieux), Goodness (bon/mauvais), Size (grand/petit).'
  },
  {
    id:'prepositions-place', title:'Prepositions of Place', cefr:'A2', category:'Prepositions',
    summary:'à, en, dans, sur, sous, devant, derrière...',
    detail:'à + city, en + feminine country, au + masculine country, aux + plural country. Dans = inside a space. Sur = on top. In general: à is for cities, en/au/aux for countries.',
    examples:[
      {fr:'Je suis à Paris.',           en:'I am in Paris.',          note:'à + city always'},
      {fr:'Elle habite en France.',     en:'She lives in France.',     note:'en + feminine country'},
      {fr:'Il est au Canada.',          en:'He is in Canada.',         note:'au = à + le'},
      {fr:'Ils vont aux États-Unis.',   en:'They are going to the US.',note:'aux = à + les'},
    ],
    tip:'Country gender: most ending in -e are feminine (France, Espagne, Italie). Exceptions: le Mexique, le Cambodge.'
  },
  {
    id:'future-proche', title:'Futur Proche', cefr:'A2', category:'Tenses',
    summary:'Near future: aller + infinitive.',
    detail:'The most common way to express the near future in spoken French: conjugate aller + infinitive. More natural than the full future tense in conversation.',
    examples:[
      {fr:'Je vais manger.',          en:'I\'m going to eat.',         note:'Immediate future'},
      {fr:'On va partir demain.',     en:'We\'re going to leave tomorrow.'},
      {fr:'Il ne va pas venir.',      en:'He\'s not going to come.',   note:'Negation around aller'},
      {fr:'Qu\'est-ce que tu vas faire ?', en:'What are you going to do?'},
    ],
    tip:'Futur proche sounds more natural in conversation. Use the full future tense for promises, predictions, or formal writing.'
  },

  // ── B1 ────────────────────────────────────────────────────────────────────
  {
    id:'subjunctive', title:'Subjonctif', cefr:'B1', category:'Verbs',
    summary:'For doubt, emotion, necessity, and wishes.',
    detail:'The subjunctive is a mood (not tense) used after: il faut que, vouloir que, douter que, être content que, and many others. Trigger: subjunctive almost always follows "que" after these expressions.',
    examples:[
      {fr:'Il faut que tu viennes.',        en:'You have to come.',       note:'viennes not viens!'},
      {fr:'Je veux qu\'il parte.',          en:'I want him to leave.'},
      {fr:'C\'est dommage qu\'il pleuve.', en:'It\'s a shame it\'s raining.'},
      {fr:'Bien que je sois fatigué…',     en:'Although I am tired…'},
    ],
    tip:'Most common triggers: il faut que, vouloir que, bien que, pour que, avant que, à moins que, douter que.'
  },
  {
    id:'conditionnel', title:'Conditionnel Présent', cefr:'B1', category:'Tenses',
    summary:'For polite requests, hypotheticals, and reported speech.',
    detail:'Form: future stem + imperfect endings (-ais, -ais, -ait, -ions, -iez, -aient). Uses: 1. Polite requests (je voudrais) 2. Hypothetical conditions (si + imparfait) 3. Reported speech.',
    examples:[
      {fr:'Je voudrais un café.',            en:'I would like a coffee.',       note:'Most polite order form'},
      {fr:'Si j\'avais de l\'argent, j\'achèterais une maison.', en:'If I had money, I would buy a house.'},
      {fr:'Pourriez-vous m\'aider ?',        en:'Could you help me?',           note:'Polite request'},
      {fr:'Il a dit qu\'il viendrait.',      en:'He said he would come.',       note:'Reported speech'},
    ],
    tip:'si + imparfait → conditionnel. Never "si + conditionnel" — this is a common error even among advanced learners.'
  },
  {
    id:'relative-qui-que', title:'Relative Pronouns: qui / que', cefr:'B1', category:'Pronouns',
    summary:'qui = subject of clause, que = object of clause.',
    detail:'qui refers to the subject of the relative clause (who/that does the action). que refers to the object (who/that receives the action). Both can refer to people or things.',
    examples:[
      {fr:'L\'homme qui parle est mon père.',      en:'The man who is speaking is my father.',  note:'qui = subject'},
      {fr:'Le livre que je lis est intéressant.',  en:'The book I am reading is interesting.',  note:'que = object'},
      {fr:'La femme qui m\'a aidé.',               en:'The woman who helped me.'},
      {fr:'C\'est le film qu\'il a vu.',           en:'It\'s the film that he saw.'},
    ],
    tip:'Trick: if you can replace with "he/she/it" → use qui. If you can replace with "him/her/it" → use que.'
  },
  {
    id:'pronouns-y-en', title:'Pronouns: y and en', cefr:'B1', category:'Pronouns',
    summary:'y = there/it (place or abstract), en = some/of it/from there.',
    detail:'y replaces à + place or à + abstract idea. en replaces de + noun (partitive, quantity). Both go before the verb like other object pronouns.',
    examples:[
      {fr:'Tu vas à Paris ? → Tu y vas ?',    en:'Are you going to Paris? → Are you going there?'},
      {fr:'Je pense à ça. → J\'y pense.',     en:'I\'m thinking about that. → I\'m thinking about it.'},
      {fr:'Tu veux du café ? → Tu en veux ?', en:'Do you want coffee? → Do you want some?'},
      {fr:'Il revient de Lyon. → Il en revient.', en:'He\'s coming back from Lyon. → He\'s coming back from there.'},
    ],
    tip:'en is also used with numbers/quantities: "J\'en veux trois." = "I want three (of them)."'
  },
  {
    id:'comparison', title:'Comparatives and Superlatives', cefr:'B1', category:'Adjectives',
    summary:'plus...que, moins...que, aussi...que, le plus...',
    detail:'Comparatives: plus (more), moins (less), aussi (as)...que (than/as). Superlatives: le/la/les plus (the most), le/la/les moins (the least). Irregular: bon → meilleur, mauvais → pire.',
    examples:[
      {fr:'Paris est plus grand que Lyon.',          en:'Paris is bigger than Lyon.'},
      {fr:'Ce vin est moins cher que l\'autre.',     en:'This wine is less expensive than the other.'},
      {fr:'Elle est aussi intelligente que lui.',    en:'She is as intelligent as him.'},
      {fr:'C\'est le meilleur restaurant de Paris.', en:'It\'s the best restaurant in Paris.'},
    ],
    tip:'bon → meilleur (better/best), bien → mieux (better/best as adverb). Never "plus bon" or "plus bien".'
  },

  // ── B2 ────────────────────────────────────────────────────────────────────
  {
    id:'passe-simple', title:'Passé Simple', cefr:'B2', category:'Tenses',
    summary:'Literary past tense — reading only, never spoken.',
    detail:'The passé simple is the past tense of written literature, formal history, and journalism. You will NEVER use it in conversation, but you must be able to READ it. It replaces passé composé in formal written French.',
    examples:[
      {fr:'Il parla longuement.',     en:'He spoke at length.',         note:'parler → parla'},
      {fr:'Elle vint me voir.',       en:'She came to see me.',         note:'venir → vint (irregular)'},
      {fr:'Ils furent surpris.',      en:'They were surprised.',        note:'être → furent'},
    ],
    tip:'When reading classic French literature (Camus, Hugo, Flaubert) you\'ll see this constantly. Recognize it, don\'t panic.'
  },
  {
    id:'subjonctif-passe', title:'Subjonctif Passé', cefr:'B2', category:'Tenses',
    summary:'Past subjunctive for completed actions.',
    detail:'When the subjunctive action is completed (before the main clause), use subjonctif passé: avoir/être (subjunctive present) + past participle.',
    examples:[
      {fr:'Je suis content qu\'il soit venu.',    en:'I\'m glad he came.'},
      {fr:'Bien qu\'elle ait réussi, elle est modeste.', en:'Although she succeeded, she is modest.'},
    ],
    tip:'If the subjunctive action happened BEFORE the main clause → subjonctif passé. Same time or future → subjunctif présent.'
  },
  {
    id:'gerondif', title:'Gérondif', cefr:'B2', category:'Verbs',
    summary:'en + present participle — while/by doing.',
    detail:'The gérondif expresses simultaneity or manner: "by doing" or "while doing". Form: en + [nous form stem] + -ant. The subject of the gérondif must be the same as the main clause.',
    examples:[
      {fr:'J\'écoute de la musique en travaillant.',   en:'I listen to music while working.'},
      {fr:'Il a appris le français en regardant des films.', en:'He learned French by watching films.'},
      {fr:'En arrivant, j\'ai vu Paul.',               en:'Upon arriving, I saw Paul.'},
    ],
    tip:'The gérondif subject must match the main clause subject. "Il est tombé en courant" = He fell while running (he was running).'
  },

  // ── C1 ────────────────────────────────────────────────────────────────────
  {
    id:'negations-advanced', title:'Advanced Negations', cefr:'C1', category:'Negation',
    summary:'ne...que, ne...ni...ni, ne...guère, ne...point',
    detail:'Beyond ne...pas, French has several negation structures. ne...que = only (restrictive, not truly negative). ne...ni...ni = neither...nor. ne...guère = hardly (literary). ne...point = not at all (literary).',
    examples:[
      {fr:'Il ne mange que des légumes.', en:'He only eats vegetables.',       note:'ne...que = only'},
      {fr:'Je n\'ai ni faim ni soif.',   en:'I\'m neither hungry nor thirsty.', note:'ne...ni...ni'},
      {fr:'Elle ne dort guère.',         en:'She hardly sleeps.',               note:'Literary'},
    ],
  },
  {
    id:'style-indirect', title:'Discours Indirect', cefr:'C1', category:'Verbs',
    summary:'Reporting what someone said — tense shifts.',
    detail:'When reporting speech, tenses shift back: présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel. Time expressions also shift: aujourd\'hui → ce jour-là, demain → le lendemain.',
    examples:[
      {fr:'"Je pars." → Il a dit qu\'il partait.',           en:'"I\'m leaving." → He said he was leaving.'},
      {fr:'"J\'irai." → Elle a dit qu\'elle irait.',         en:'"I\'ll go." → She said she would go.'},
      {fr:'"Viens demain." → Il m\'a dit de venir le lendemain.', en:'"Come tomorrow." → He told me to come the next day.'},
    ],
  },
]

export const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2']
