import type { CefrLevel } from './questionBank'

// ─────────────────────────────────────────────────────────────────────────────
// Types for lesson plan questions (superset of DrillQ)
// ─────────────────────────────────────────────────────────────────────────────
type LessonType = 'vocab_intro'|'guided_dialog'|'grammar_focus'|'controlled_practice'|'fluency_drill'|'unit_review'

interface BaseLP {
  cefr: CefrLevel
  unitId: string
  lessonType: LessonType
  prompt: string
  answer: string
  note?: string
}
export interface LPTransQ  extends BaseLP { type: 'translate';     direction: 'fr-en'|'en-fr' }
export interface LPMcqQ    extends BaseLP { type: 'mcq';           options: string[] }
export interface LPArrQ    extends BaseLP { type: 'arrange';       words: string[] }
export interface LPListQ   extends BaseLP { type: 'listen';        audioText: string }
export interface LPFillQ   extends BaseLP { type: 'fill_blank' }
export interface LPErrQ    extends BaseLP { type: 'error_correct' }
export type LPQ = LPTransQ | LPMcqQ | LPArrQ | LPListQ | LPFillQ | LPErrQ

export interface LessonPhrase { fr: string; en: string; note: string }

export interface LessonPlanData {
  title: string
  theme: string
  phrases: LessonPhrase[]   // shown on intro card
  practice: LPQ[]           // up to 15 shown in practice round
  test: LPQ[]               // exactly 10 unit-test questions
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function t(unitId: string, dir: 'fr-en'|'en-fr', prompt: string, answer: string, note = ''): LPTransQ {
  return { type: 'translate', cefr: 'A1', unitId, lessonType: 'vocab_intro', direction: dir, prompt, answer, note }
}
function m(unitId: string, prompt: string, answer: string, options: string[], note = ''): LPMcqQ {
  return { type: 'mcq', cefr: 'A1', unitId, lessonType: 'unit_review', prompt, answer, options, note }
}
function a(unitId: string, prompt: string, answer: string, words: string[], note = ''): LPArrQ {
  return { type: 'arrange', cefr: 'A1', unitId, lessonType: 'grammar_focus', prompt, answer, words, note }
}
function l(unitId: string, audioText: string, answer: string, note = ''): LPListQ {
  return { type: 'listen', cefr: 'A1', unitId, lessonType: 'fluency_drill', prompt: 'Listen and answer:', audioText, answer, note }
}
function f(unitId: string, prompt: string, answer: string, note = ''): LPFillQ {
  return { type: 'fill_blank', cefr: 'A1', unitId, lessonType: 'controlled_practice', prompt, answer, note }
}
function e(unitId: string, prompt: string, answer: string, note = ''): LPErrQ {
  return { type: 'error_correct', cefr: 'A1', unitId, lessonType: 'controlled_practice', prompt, answer, note }
}

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 1 — "The First Encounter"
// ─────────────────────────────────────────────────────────────────────────────
const U = 'a1-u1'
const a1u1Practice: LPQ[] = [
  t(U, 'fr-en', 'Translate: "Bonjour"',                              'Hello',                       'Bon = Good, Jour = Day'),
  m(U, "Which greeting is appropriate for a job interview?",          'Bonjour',                     ['Salut','Bonjour','Coucou','Ça va'], 'Salut and Coucou are too informal for professional settings.'),
  t(U, 'en-fr', 'My name is... (I call myself...)',                  "Je m'appelle",                "Reflexive: Je (I) + m' (myself) + appelle (call)."),
  a(U, "Build: 'My name is Marie'",                                  "Je m'appelle Marie",          ['appelle','Je',"m'",'Marie'], 'Subject + Reflexive + Verb + Name.'),
  m(U, "What does 'Enchanté' literally mean?",                        'Enchanted',                   ['Enchanted','English','Entered','Encouraged'], 'From Latin incantare — to cast a spell.'),
  f(U, 'Comment ___ va ?',                                           'ça',                          "ça = it/that. From the verb 'aller' (to go)."),
  m(U, "Which greeting do you use with your boss?",                   'Bonjour',                     ['Bonjour','Salut','Coucou','Allô'], 'Respect is foundational in French culture.'),
  m(U, "If a woman writes 'Nice to meet you', how should she spell it?", 'Enchantée',              ['Enchanté','Enchantée','Enchante','Enchant'], 'Adjectives agree with gender — add an e for feminine.'),
  t(U, 'fr-en', 'Translate: "Salut, ça va ?"',                       "Hi, how's it going?",         "A common way to start a text or chat with a friend."),
  l(U, "Enchanté, je m'appelle Luc.",                                 'Nice to meet you, my name is Luc.',  'Combining the meeting phrase with the name introduction.'),
  a(U, "Build: 'How is it going?' (3 words)",                         'Comment ça va',               ['Comment','ça','va'], "Comment (How) + ça (it) + va (goes)."),
  f(U, "___ m'appelle Sophie.",                                       'Je',                          "'Je' is I — the first person subject."),
  m(U, "Which word literally means 'To God'?",                        'Adieu',                       ['Bonjour','Adieu','Salut','Merci'], "A (To) + Dieu (God). Used historically as a final goodbye."),
  e(U, "Correct the mistake: Je m'appelle est Paul.",                 "Je m'appelle Paul",           "The reflexive verb m'appelle already carries the full meaning — no 'est' needed."),
  t(U, 'fr-en', 'Translate: "Bonsoir"',                               'Good evening',                "'Soir' means evening. Used from dusk onwards."),
]

const a1u1Test: LPQ[] = [
  t(U, 'en-fr', 'Good morning, how are you?',                        'Bonjour, ça va ?',            "Uses 'Bonjour' for hello and 'ça va' for the question."),
  e(U, "Identify the error: Enchanté, je m'appelle est Jacques.",     "Je m'appelle Jacques",        "Never use 'est' with 'm'appelle'."),
  m(U, "Which greeting is most appropriate for a priest or teacher?", 'Bonjour',                     ['Salut','Coucou','Bonjour','Ça va'], 'Formal settings require Bonjour as a sign of respect.'),
  f(U, 'Enchanté___ (to a woman).',                                   'e',                           'Gender agreement requires the extra e for feminine.'),
  a(U, "Build: 'How is it going?' (formal)",                          'comment ça va ?',             ['va','comment','ça','?'], "Question word 'Comment' starts the sentence."),
  t(U, 'en-fr', 'Morning greeting',                                   'Bonjour',                     'Covers temporal register.'),
  e(U, "Correct the spelling: Je m'apelle Sophie.",                   "Je m'appelle Sophie",         "The verb 'appeler' doubles the l in je m'appelle."),
  t(U, 'fr-en', 'Translate: "Salut, enchanté !"',                     'Hi, nice to meet you!',       'A friendly, informal introduction.'),
  m(U, "What is the historical meaning of 'Adieu'?",                  'To God',                      ['To God','To the day','To the king','To the health'], 'Reflects the historical Christian roots of the language.'),
  t(U, 'en-fr', 'Good evening, my name is Marie. Nice to meet you.', 'Bonsoir, je m\'appelle Marie. Enchantée.', 'Synthesis: greeting + reflexive intro + gender agreement.'),
]

const a1u1Phrases: LessonPhrase[] = [
  { fr: 'Bonjour',        en: 'Good morning / Hello',              note: "'Bon = Good, Jour = Day. The master key to French social interaction." },
  { fr: 'Salut',          en: 'Hi / Bye (Informal)',               note: "Only with friends — never in formal settings." },
  { fr: 'Ça va ?',        en: "How are things?",                   note: "From 'aller' (to go). Can be both question and answer." },
  { fr: "Je m'appelle…",  en: 'My name is… (I call myself…)',      note: "Reflexive: Je + m' + appelle. Never add 'est'." },
  { fr: 'Enchanté(e)',    en: 'Delighted / Nice to meet you',      note: "Add 'e' in writing if you are female. Same pronunciation." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 2 — "The Rhythm of Life"
// ─────────────────────────────────────────────────────────────────────────────
const V = 'a1-u2'
const a1u2Practice: LPQ[] = [
  t(V, 'fr-en', 'Translate: "un, deux, trois, quatre"',             'one, two, three, four',       'The foundations of the decimal system.'),
  m(V, "Which day is 'Mars Day'?",                                   'Mardi',                       ['Lundi','Mardi','Mercredi','Jeudi'], 'Mardi = Mars + dies (Latin for day).'),
  f(V, 'The number 7 (the p is silent!)',                            'sept',                        'Sept + em = September. The p is never pronounced.'),
  t(V, 'en-fr', 'It is noon.',                                      'Il est midi',                 "Use the impersonal 'Il est'. Midi stands alone — no 'heures'."),
  t(V, 'fr-en', 'Translate: "janvier, février, mars, avril"',       'January, February, March, April', 'French months are never capitalized.'),
  m(V, 'How do you say 11?',                                        'onze',                        ['onze','douze','treize','dix'], 'Onze (11), Douze (12), Treize (13) — all end in -ze.'),
  a(V, "Build: 'It is eight o'clock'",                              'Il est huit heures',          ['huit','Il','heures','est'], 'Subject + Verb + Number + Hours.'),
  t(V, 'fr-en', 'Translate: "Lundi, Mardi, Mercredi"',              'Monday, Tuesday, Wednesday',  'Moon, Mars, Mercury — planetary origins.'),
  m(V, "If a Frenchman says '15h', what time is it in 12-hour clock?", '3:00 PM',                ['5:00 PM','3:00 PM','1:00 PM','11:00 AM'], '15 − 12 = 3. This is the 24-hour clock.'),
  f(V, 'Le ___ mai (May 1st).',                                     'premier',                     "Use 'premier' for the 1st of the month. All other days use cardinal numbers."),
  t(V, 'fr-en', 'Translate: "dix, vingt, trente, quarante"',        '10, 20, 30, 40',              'Vingt (20) comes from Latin viginti.'),
  l(V, 'Quelle heure est-il ?',                                      'What time is it?',            'Asking for the time officially.'),
  t(V, 'en-fr', 'October 31st',                                     'Le 31 octobre',               "Note that 'octobre' is not capitalized."),
  e(V, 'Correct the date format: Juin 5.',                           'Le 5 juin',                   "In French: 'The [Number] [Month]'."),
  m(V, "What does 'Minuit' mean?",                                   'Midnight',                    ['Noon','Midnight','Minute','Morning'], 'Mi (middle) + Nuit (night). The counterpart to Midi.'),
]

const a1u2Test: LPQ[] = [
  t(V, 'en-fr', '11, 12, 13',                                       'onze, douze, treize',         "Testing the specific '-ze' sequence of the teens."),
  e(V, 'Correct the date: Janvier le 1.',                            'Le premier janvier',          "Dates must be 'The + Ordinal/Number + Month' and months are lowercase."),
  m(V, "What time is 'minuit'?",                                     '12:00 AM',                    ['12:00 PM','12:00 AM','6:00 PM','6:00 AM'], 'Minuit = Middle of Night.'),
  f(V, 'Il est dix-neuf ___ (7:00 PM).',                            'heures',                      "Official time requires the word 'heures'."),
  a(V, "Build the question: What time is it?",                       'quelle heure est-il ?',       ['est','quelle','il','heure','?'], 'Standard question inversion for time.'),
  t(V, 'fr-en', 'Translate: "Lundi"',                               'Monday',                      'Luna-day — the day of the moon.'),
  e(V, 'Correct the logic: Il est trois heure.',                     'Il est trois heures',         "'Heures' must be plural for any time other than 'une heure'."),
  t(V, 'fr-en', 'Translate: "Le quatorze juillet mille sept cent quatre-vingt-neuf."', 'July 14, 1789', 'Synthesis of numbers and dates — the start of the French Revolution.'),
  m(V, 'Which day is named after Mercury?',                          'Mercredi',                    ['Mardi','Mercredi','Jeudi','Vendredi'], 'Mercredi = Mercury + dies.'),
  t(V, 'en-fr', 'It is 2:00 PM on Tuesday, May 1st.',               'Il est quatorze heures le mardi premier mai', 'Synthesis: 24-hour clock, day of week, and the premier rule.'),
]

const a1u2Phrases: LessonPhrase[] = [
  { fr: 'Sept',                  en: 'Seven',           note: "The 'p' is silent. Think of September — the 7th month in the old Roman calendar." },
  { fr: 'Onze',                  en: 'Eleven',          note: "Starts with a vowel sound but 'le onze' never contracts to l'onze." },
  { fr: 'Lundi / Mardi',         en: 'Monday / Tuesday', note: 'Named after the Moon and Mars. French days are never capitalized.' },
  { fr: 'Quelle heure est-il ?', en: 'What time is it?', note: "'Heure' is feminine (Quelle). In spoken French: 'Il est quelle heure ?'" },
  { fr: 'Midi / Minuit',         en: 'Noon / Midnight', note: 'These never take the word heures after them.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 3 — "All in the Family"
// ─────────────────────────────────────────────────────────────────────────────
const W = 'a1-u3'
const a1u3Practice: LPQ[] = [
  t(W, 'en-fr', 'My father is tall.',                                'Mon père est grand',          "Use 'mon' because 'père' is masculine."),
  t(W, 'fr-en', 'Translate: "Voici ma mère."',                      'Here is my mother.',          "'Ma' is the feminine form of 'my'."),
  m(W, '___ frère est petit.',                                       'Mon',                         ['Mon','Ma','Mes','Ma\''], "Frère is masculine singular — 'mon' is correct."),
  t(W, 'fr-en', 'Translate: "père"',                                'father',                      'From Latin pater. Think: patriarch, paternal.'),
  l(W, "J'ai deux sœurs.",                                          'Two',                         'Cultural note: siblings in French families often greet each other with la bise (cheek kisses).'),
  a(W, "Build: 'My sister is intelligent'",                         'Ma sœur est intelligente',    ['Ma','sœur','est','intelligente'], "Adjectives add 'e' to agree with the feminine noun sœur."),
  f(W, "C'est ___ oncle.",                                          'mon',                         "Even though 'oncle' starts with a vowel, 'mon' is used — and conveniently it prevents a sound clash too."),
  m(W, '___ cousin est drôle.',                                     'Ton',                         ['Ton','Ta','Tes','Ma'], "'Ton' is the informal 'your' for masculine singular nouns."),
  e(W, "C'est mon mère.",                                           "C'est ma mère",               "Common error: possessive must match the noun's gender. 'Mère' is feminine → 'ma'."),
  t(W, 'en-fr', 'His sister is nice.',                              'Sa sœur est sympathique',     "Culture: French Sunday family dinners ('le repas du dimanche') can last 2–3 hours."),
  t(W, 'fr-en', 'Translate: "oncle"',                              'uncle',                       "'Tante' (aunt) shares the same Latin root — 'amita'. Think: auntie."),
  l(W, 'Voici mon grand-père et ma grand-mère.',                    'Grandfather and grandmother', "'Grand' = great/big. Grand-père literally means Great-father."),
  a(W, "Build: 'My cousins are French'",                            'Mes cousins sont français',   ['Mes','cousins','sont','français'], "'Mes' is the plural possessive for both genders."),
  f(W, '___ enfants sont jeunes.',                                  'Ses',                         "Use 'ses' for plural his/her. Pronounced 'say'. Ses enfants = his or her children."),
  e(W, 'Sa frère est petit.',                                       'Son frère est petit',         "Even if 'she' owns the brother, 'frère' is masculine → 'son'. The possessive follows the noun, not the owner."),
]

const a1u3Test: LPQ[] = [
  t(W, 'en-fr', 'Her brother has a dog.',                          'Son frère a un chien',        "Use 'avoir' (a) for possessions. 'Son' because frère is masculine."),
  m(W, '___ amie est ici.',                                        'Mon',                         ['Mon','Ma','Me','Mes'], "Advanced rule: 'ma' becomes 'mon' before a vowel sound — 'mon amie' flows better."),
  t(W, 'fr-en', 'Translate: "fils"',                              'son',                         "The 'l' is completely silent. Sounds like 'fees'. Fils ends in 's' even in singular."),
  e(W, 'Ma frère est grand.',                                     'Mon frère est grand',         'Subject-possessive agreement is based on the noun gender, not the speaker.'),
  l(W, 'Elle est ma tante préférée.',                             'My favorite aunt',            "Note adjective placement: 'préférée' comes after the noun in French."),
  a(W, "Build: 'Your son is funny'",                              'Ton fils est drôle',          ['Ton','fils','est','drôle'], "'Fils' ends in 's' in singular — it looks plural but isn't."),
  f(W, "Ma ___ s'appelle Claire.",                                'fille',                       "'Fille' = daughter (with possessive 'ma') or girl (without possessive)."),
  e(W, "C'est sa mari.",                                          "C'est son mari",              "'Mari' is masculine → requires 'son', even when the wife is the speaker."),
  m(W, '___ parents sont à Paris.',                               'Ses',                         ['Ses','Son','Sa','Ma'], "Plural nouns always take 'mes', 'tes', or 'ses' — never the singular forms."),
  t(W, 'en-fr', 'Here is my aunt.',                              'Voici ma tante',              "'Voici' = Vois (see) + ici (here). Literally 'See here.'"),
]

const a1u3Phrases: LessonPhrase[] = [
  { fr: 'Mon père / Ma mère',   en: 'My father / My mother',     note: "From Latin pater and mater — the roots of patriarch, maternal, fraternal." },
  { fr: 'Mon frère / Ma sœur',  en: 'My brother / My sister',    note: "Fraternity = brotherhood. Sorority = sisterhood. The same Latin roots survive in French." },
  { fr: 'Son frère / Sa sœur',  en: 'His or her brother / sister', note: "Critical rule: the possessive matches the noun's gender — not the owner's." },
  { fr: 'Mon amie',             en: 'My friend (female)',         note: "Use 'mon' instead of 'ma' before any vowel sound to keep speech flowing." },
  { fr: 'Mon fils / Ma fille',  en: 'My son / My daughter',      note: "'Fils': the l is completely silent. 'Fille': sounds like fee-yuh. Both also mean boy/girl." },
]

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const LESSON_PLANS: Record<string, LessonPlanData> = {
  'a1-u1': { title: 'The First Encounter',  theme: 'Greetings & Introductions',         phrases: a1u1Phrases, practice: a1u1Practice, test: a1u1Test },
  'a1-u2': { title: 'The Rhythm of Life',   theme: 'Numbers, Dates & Time',             phrases: a1u2Phrases, practice: a1u2Practice, test: a1u2Test },
  'a1-u3': { title: 'All in the Family',    theme: 'Family members, possessives & relationships', phrases: a1u3Phrases, practice: a1u3Practice, test: a1u3Test },
}
