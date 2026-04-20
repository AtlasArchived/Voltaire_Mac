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
// A1 Unit 4 — "Café Culture"
// ─────────────────────────────────────────────────────────────────────────────
const X = 'a1-u4'
const a1u4Practice: LPQ[] = [
  t(X, 'en-fr', 'I would like a coffee.',                              'Je voudrais un café',               "Use 'un' — café is masculine. Don't forget the accent on é."),
  t(X, 'fr-en', "Translate: \"L'addition, s'il vous plaît.\"",         'The bill please',                   "French waiters will never bring the bill until you ask. It's considered rude to rush you."),
  m(X, 'Which phrase is the most polite way to order?',                'Je voudrais',                       ['Je veux','Je voudrais','Donne-moi',"J'ai"], "'Je veux' (I want) sounds demanding. 'Je voudrais' (I would like) is the conditional — golden rule of French manners."),
  t(X, 'fr-en', 'Translate: "un café"',                               'an espresso',                       "In France, 'un café' is always an espresso. For filter coffee ask for 'un café allongé'."),
  l(X, "Une carafe d'eau, s'il vous plaît.",                           'A pitcher of water',                "By law, French restaurants must provide free tap water. Never pay for bottled unless you want bubbles."),
  a(X, "Build: 'A coffee please'",                                     "Un café s'il vous plaît",           ["Un","café","s'il","vous","plaît"], "Standard word order: Item + Please."),
  f(X, 'Je voudrais un pain ___ chocolat.',                            'au',                                "'Au' = à + le. Used for flavors and fillings: pain au chocolat, café au lait."),
  m(X, 'How do you get a male waiter\'s attention?',                   'Monsieur',                          ['Garçon','Monsieur','Hé','Homme'], "Never say 'Garçon' (boy) — it's outdated and offensive. 'Monsieur' or 'Madame' is the modern standard."),
  e(X, 'Je voudrais une croissant.',                                   'Je voudrais un croissant',          "Croissant is masculine. From Old French 'creissant' (crescent moon shape). Gender agreement matters even at breakfast."),
  t(X, 'en-fr', 'Thank you very much, sir.',                          'Merci beaucoup monsieur',            "Add 'monsieur' or 'madame' after merci for extra politeness — and extra French credibility."),
  t(X, 'fr-en', "Translate: \"C'est combien ?\"",                     'How much is it?',                   "'Combien' sounds like 'combine' — you're asking for the combined total."),
  l(X, 'Un thé ou un café ?',                                         'A tea or a coffee',                  "'Ou' = or. Don't confuse with 'où' (where) — same sound, completely different word."),
  a(X, "Build: 'How much is it please?'",                             "C'est combien s'il vous plaît",     ["C'est","combien","s'il","vous","plaît"], "Use this when a price isn't on the menu."),
  f(X, 'Je voudrais ___ thé, s\'il vous plaît.',                      'un',                                "Thé is masculine. Pronounced 'tay' — like the English letter T."),
  e(X, "Je veux un café s'il te plaît.",                              "Je voudrais un café s'il vous plaît","Two errors: 'Je veux' is too blunt for a waiter; 'te' is informal. Always 'voudrais' + 'vous' with café staff."),
]

const a1u4Test: LPQ[] = [
  t(X, 'fr-en', 'Je voudrais un pain au chocolat.',                   'I would like a chocolate pastry',   "Literally 'bread with chocolate'. In the South-West it's called 'une chocolatine' — a fierce regional debate."),
  t(X, 'en-fr', 'The bill, please.',                                  "L'addition s'il vous plaît",        "Always 'l'' before 'addition' — it starts with a vowel. Think: the waiter is doing the math 'addition'."),
  m(X, 'What is the free water called?',                              'Une carafe d\'eau',                 ["Une bouteille d'eau","Une carafe d'eau","Un verre d'eau","L'eau minérale"], "'Carafe' is the specific term for the free tap water pitcher."),
  m(X, 'Which of these is masculine?',                                'Café',                              ['Addition','Carafe','Eau','Café'], "Addition, carafe, and eau are all feminine. Café is the odd one out."),
  a(X, "Build: 'I would like a pitcher of water'",                   "Je voudrais une carafe d'eau",      ['Je','voudrais','une','carafe',"d'eau"], "Perfect phrase for a budget-friendly French lunch."),
  f(X, "S'il ___ plaît.",                                            'vous',                              "Literally: 'If it to you pleases.' Always 'vous' with strangers and service staff."),
  e(X, 'Je voudrais un eau.',                                         'Je voudrais une eau',               "Eau is feminine — even though it sounds like just 'O', it needs 'une'."),
  e(X, 'Merci beaucoup, Garçon.',                                    'Merci beaucoup monsieur',            "Avoid 'Garçon' — it treats the professional like a servant. 'Monsieur' is respectful and modern."),
  l(X, 'C\'est huit euros, monsieur.',                               'Eight euros',                        "'Huit' (8) is pronounced 'weet' — like the English word 'wheat'."),
  t(X, 'fr-en', "Translate: \"S'il vous plaît\"",                    'Please (formal)',                    "Literally 'If it pleases you.' Use 'tu' form (s'il te plaît) only with friends and children."),
]

const a1u4Phrases: LessonPhrase[] = [
  { fr: 'Un café',              en: 'An espresso',          note: "In France, 'un café' is always a small espresso — never a mug. Ask for 'un allongé' for a longer drink." },
  { fr: 'Je voudrais…',         en: 'I would like…',        note: "The conditional of 'vouloir'. More polite than 'Je veux' (I want), which sounds like a demand to French ears." },
  { fr: "S'il vous plaît",      en: 'Please (formal)',      note: "Literally 'If it pleases you.' Always use 'vous' with café and restaurant staff — never 'te'." },
  { fr: "L'addition",           en: 'The bill',             note: "From the math term 'addition'. The waiter adds it all up — and won't bring it until you ask." },
  { fr: "Une carafe d'eau",     en: 'A pitcher of water',   note: "By French law, restaurants must give you tap water for free. 'Carafe' signals you want the free pitcher, not bottled." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 5 — "What Are You Wearing?"
// ─────────────────────────────────────────────────────────────────────────────
const Y = 'a1-u5'
const a1u5Practice: LPQ[] = [
  t(Y, 'fr-en', 'Une robe rouge',                                      'A red dress',                       "'Rouge' is identical for masculine and feminine — it already ends in e."),
  m(Y, 'A yellow hat',                                                  'Un chapeau jaune',                  ['Un jaune chapeau','Un chapeau jaune','Une chapeau jaune','Un chapeau jaunne'], "Colors almost always sit AFTER the noun in French — the opposite of English."),
  t(Y, 'fr-en', 'Translate: "rouge, jaune, rose, noir"',               'red, yellow, pink, black',          "'Noir' is the root of 'film noir' — and the Parisian wardrobe staple."),
  f(Y, 'Une veste ___ (pink).',                                         'rose',                              "Many flower names — rose, violette — are used for both colors and girls' names in France."),
  l(Y, 'Un pull noir.',                                                 'Black',                             "In French fashion, 'le noir' is considered the most versatile and elegant color."),
  t(Y, 'en-fr', 'A green skirt',                                       'Une jupe verte',                    "Jupe is feminine → 'vert' becomes 'verte'. The silent t is now audible!"),
  a(Y, "Build: 'The shirt is white'",                                   'La chemise est blanche',            ['La','chemise','est','blanche'], "'Blanc' has an irregular feminine: 'blanche'. Think of blanching vegetables — turning them white."),
  e(Y, 'Une bleue veste',                                               'Une veste bleue',                   "Color placement: always Noun → Color, never Color → Noun."),
  m(Y, 'Complete: Des chaussures ___ (grey).',                          'grises',                            ['gris','grise','grises','grisey'], "'Chaussures' is feminine plural → 'grises'. Both the gender and plural e/s are added."),
  f(Y, 'Ma robe est ___ (purple).',                                     'violette',                          "Violet (m) → violette (f). The double t is the feminine marker here."),
  t(Y, 'en-fr', 'I wear orange socks.',                                'Je porte des chaussettes orange',   "Invariable alert: 'orange' is a fruit name — it never takes an s or e, even with plural feminine nouns."),
  l(Y, 'Mon manteau est marron.',                                       'Brown',                             "'Marron' = chestnut. Like 'orange', it is invariable — never changes form."),
  a(Y, "Build: 'She has a blue dress'",                                 'Elle a une robe bleue',             ['Elle','a','une','robe','bleue'], "Agreement: robe (f) → bleue (f). The final e is silent but essential in writing."),
  t(Y, 'fr-en', 'Translate: "manteau, chaussettes, pantalon, pull"',  'coat, socks, pants, sweater',       "'Pull' is from English 'pullover' — French fashion borrowed it wholesale."),
  e(Y, 'Je porte des jupes oranges.',                                   'Je porte des jupes orange',         "Common mistake: fruit/noun colors are invariable. 'Oranges' is never correct as a color."),
]

const a1u5Test: LPQ[] = [
  t(Y, 'en-fr', 'The green dress',                                     'La robe verte',                     "Both color placement (after noun) and gender agreement (robe = f → verte) are tested here."),
  t(Y, 'fr-en', "J'ai des chaussures noires.",                         'I have black shoes',                "The s on 'noires' matches plural 'chaussures'. Both feminine and plural endings stack: noir → noire → noires."),
  m(Y, 'Complete: Une chemise ___',                                     'blanche',                           ['blanc','blanche','blanch','blanches'], "'Chemise' is feminine singular → 'blanche'. The irregular form replaces the final c with che."),
  m(Y, 'Complete: Un pantalon ___',                                     'gris',                              ['gris','grise','grises','grisey'], "'Pantalon' is masculine. 'Gris' already ends in s — it doesn't change for plural either."),
  a(Y, "Build: 'She wears a red jacket'",                              'Elle porte une veste rouge',         ['Elle','porte','une','veste','rouge'], "'Porter' (to wear/carry) uses the same form as porte in architecture — something that carries."),
  f(Y, 'Ma robe est ___ (purple).',                                    'violette',                           "Irregular feminine: -et → -ette. Violet is also a girl's name in France."),
  e(Y, 'Un blanc chapeau',                                             'Un chapeau blanc',                   "Noun first, color second — always. This is the most common error for English speakers."),
  e(Y, 'Elle a des jupes oranges.',                                    'Elle a des jupes orange',            "'Orange' stays 'orange' forever — no agreement, no plural s, no exceptions."),
  l(Y, 'Le manteau est vert.',                                         'Green',                              "The t in 'vert' (masculine) is silent. Add 'e' → 'verte' (feminine) and the t is suddenly heard."),
  t(Y, 'fr-en', 'Translate: "verte, blanche, noire, bleue"',          'green, white, black, blue',          "All four are feminine forms. The agreement endings are the hallmark of a precise French speaker."),
]

const a1u5Phrases: LessonPhrase[] = [
  { fr: 'Une robe rouge',         en: 'A red dress',           note: "Colors come AFTER the noun — the direct opposite of English word order." },
  { fr: 'Une jupe verte',         en: 'A green skirt',         note: "'Vert' (m) → 'verte' (f). The silent t finally becomes audible in the feminine form." },
  { fr: 'Une chemise blanche',    en: 'A white shirt',         note: "'Blanc' → 'blanche' — one of the most irregular color agreements. Think: blanching." },
  { fr: 'Des chaussures orange',  en: 'Orange shoes',          note: "Fruit and nut colors (orange, marron) are INVARIABLE — they never take gender or plural endings." },
  { fr: 'Un pantalon gris',       en: 'Grey pants',            note: "'Gris' already ends in s — the masculine singular and masculine plural are identical." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 6 — "Getting Around"
// ─────────────────────────────────────────────────────────────────────────────
const Z = 'a1-u6'
const a1u6Practice: LPQ[] = [
  t(Z, 'en-fr', 'Where is the bakery?',                                  'Où est la boulangerie',                  "Most shops ending in -erie are feminine. You're never far from a boulangerie in France — follow the smell."),
  t(Z, 'fr-en', 'La mairie se trouve ici.',                              'The town hall is located here',          "The Mairie is the civic heart of every French commune — where weddings and voting take place."),
  t(Z, 'en-fr', 'Excuse me, where is the station?',                     'Excusez-moi où est la gare',             "Always open with 'Bonjour, excusez-moi' — skipping the greeting is considered very rude."),
  m(Z, 'To go straight ahead, you say:',                                 'Allez tout droit',                       ['Tournez à droite','Allez tout droit','Allez à droite','Tournez à gauche'], "'Tout droit' = straight. 'À droite' = right. They look similar but send you in very different directions."),
  m(Z, "Which article is correct for 'the park'?",                       'le parc',                                ['la parc','le parc','le parque','la mairie'], "Parc is masculine. From the same root as English 'paddock' — an enclosed area."),
  a(Z, "Build: 'Go straight ahead and turn left'",                       'Allez tout droit et tournez à gauche',   ['Allez','tout','droit','et','tournez','à','gauche'], "Command form (vous) is standard when giving directions to a stranger."),
  a(Z, "Build: 'The bank is next to the pharmacy'",                      'La banque est à côté de la pharmacie',  ['La','banque','est','à','côté','de','la','pharmacie'], "'À côté de' requires the 'de' to link to the next location."),
  f(Z, 'La pharmacie est à ___ de la banque.',                           'droite',                                 "Full preposition: 'à droite de' = to the right of. Always à + [direction] + de."),
  f(Z, "Le musée est ___ face de l'école.",                              'en',                                     "The preposition is always 'en face de' — never 'à face de'. Think: in the face of the building."),
  e(Z, 'Tournez à la gauche.',                                           'Tournez à gauche',                       "Direction phrases drop the article: 'à gauche' and 'à droite', never 'à la gauche'."),
  e(Z, 'Je vais à le supermarché.',                                      'Je vais au supermarché',                 "Critical rule: 'à + le' MUST contract to 'au'. 'À le' is a major red flag in French."),
  l(Z, "La gare est loin de l'hôpital.",                                 'No it is far from the hospital',         "'Loin de' = far from. 'Près de' = near. Opposites connected by the same 'de' structure."),
  l(Z, 'Le parc est au bout de la rue.',                                 'At the end of the street',               "'Au bout de' uses the au contraction (à + le). 'Bout' sounds like 'boot'."),
  t(Z, 'fr-en', 'Translate: "la mairie, la gare, l\'école, le musée"',  'town hall, train station, school, museum', "'École' is feminine and starts with a vowel — always l'école, never la école."),
  t(Z, 'fr-en', 'Translate: "à gauche, à droite, tout droit, traversez"', 'left, right, straight ahead, cross',  "'Gauche' also means clumsy/tactless in French — the origin of the English word 'gauche'."),
]

const a1u6Test: LPQ[] = [
  t(Z, 'en-fr', 'To go to the museum, please?',                         "Pour aller au musée s'il vous plaît",    "'Au' = à + le musée. Never write 'à le musée'."),
  t(Z, 'fr-en', "Le supermarché est entre la banque et l'école.",       'The supermarket is between the bank and the school', "'Entre' works just like English 'between'. Note l'école — vowel contraction."),
  m(Z, "Where do French people get married and vote?",                   'La mairie',                              ['Le musée','La mairie','La gare','Le parc'], "The Mairie is the symbol of the French Republic — every commune has one."),
  m(Z, "Which contraction is correct for 'to the parks' (plural)?",     'aux parcs',                              ['à les parcs','au parcs','aux parcs','à la parcs'], "Plural contraction: 'à + les' always becomes 'aux'. A + le = au, A + les = aux."),
  a(Z, "Build: 'Turn right after the bridge'",                          'Tournez à droite après le pont',         ['Tournez','à','droite','après','le','pont'], "'Après-ski', 'après tout' — 'après' means after in all contexts."),
  f(Z, "L'école se trouve ___ côté de la pharmacie.",                   'à',                                      "Full preposition: 'à côté de'. The 'à' must never be dropped."),
  e(Z, "C'est à le bout de la rue.",                                     "C'est au bout de la rue",               "Never write 'à le' — always contract to 'au' with masculine nouns."),
  e(Z, 'Où est le pharmacie ?',                                          'Où est la pharmacie ?',                  "Places ending in -ie (pharmacie, boulangerie, boucherie) are almost always feminine."),
  l(Z, 'Prenez la première rue à gauche.',                              'The first street on the left',            "'Première' is the feminine form of 'first', agreeing with 'la rue'. Prenez = take (imperative)."),
  t(Z, 'fr-en', 'Translate: "en face de, à côté de, près de, loin de"', 'opposite, next to, near, far from',    "All four use 'de' to connect to the place — a consistent pattern worth memorising."),
]

const a1u6Phrases: LessonPhrase[] = [
  { fr: 'La mairie',          en: 'The town hall',          note: "Every French commune has one. From Latin 'maior' (greater). Where weddings and elections happen." },
  { fr: 'Où se trouve… ?',    en: 'Where is… located?',    note: "More sophisticated than 'Où est'. Literally: 'Where does it find itself?' — a reflexive construction." },
  { fr: 'Allez tout droit',   en: 'Go straight ahead',     note: "Don't confuse with 'à droite' (right). Tout droit = straight. Easy mix-up, painful consequence." },
  { fr: 'Tournez à gauche',   en: 'Turn left',             note: "'Gauche' also means clumsy/awkward — the origin of the English word 'gauche'." },
  { fr: 'Au bout de',         en: 'At the end of',         note: "'au' = à + le (mandatory contraction). Never write 'à le' — it doesn't exist in French." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 7 — "From Dawn to Dusk"
// ─────────────────────────────────────────────────────────────────────────────
const A7 = 'a1-u7'
const a1u7Practice: LPQ[] = [
  t(A7, 'en-fr', 'I wake up.',                                          'Je me réveille',                        "Reflexive verbs need 'me' — the action is done to yourself. From ré- (again) + veiller (to watch)."),
  t(A7, 'fr-en', 'Je me lève tôt.',                                     'I get up early',                        "'Tôt' sounds like 'toe'. The accent marks a pronunciation shift. Think: stubbing your toe getting up early."),
  t(A7, 'en-fr', 'She gets dressed.',                                   "Elle s'habille",                        "'Se' becomes 's'' before a vowel or silent h — keeps the sound flowing: s'habille, not se habille."),
  m(A7, "Choose the correct phrase for 'You wash yourself' (informal):", 'Tu te laves',                          ['Tu laves','Tu te laves','Tu me laves','Tu se laves'], "Reflexive pronouns match the subject: je me, tu te, il/elle se. 'Tu laves' means you are washing something else."),
  m(A7, "Which time expression means 'The evening'?",                   'Le soir',                               ['Le matin',"L'après-midi",'Le soir','La nuit'], "Culture: In France, 'le soir' is for the main family meal — often lasting 2 hours or more."),
  a(A7, "Build: 'First I get up'",                                      "D'abord je me lève",                    ["D'abord",'je','me','lève'], "'D'abord' = from à + bord (the edge/rim). You are starting at the very edge of your day."),
  a(A7, "Build: 'Then he brushes his teeth'",                           'Ensuite il se brosse les dents',        ['Ensuite','il','se','brosse','les','dents'], "We use 'les dents' (the teeth) because 'se' already signals they are his own teeth."),
  f(A7, 'Je ___ réveille à huit heures.',                               'me',                                    "Without 'me', the sentence means 'I am waking someone else up'. The pronoun is not optional."),
  f(A7, 'Enfin, il ___ couche.',                                        'se',                                    "'Il' always matches with 'se' in reflexive verbs. Me, te, se, nous, vous, se — in that order."),
  e(A7, 'Je lève à sept heures.',                                       'Je me lève à sept heures',              "Classic English-speaker error: French requires 'I get myself up' — the reflexive 'me' is mandatory."),
  e(A7, 'Je te lave le matin.',                                         'Je me lave le matin',                   "Unless you are washing a baby or a car, use 'me'. 'Je te lave' means you are washing someone else."),
  l(A7, 'Enfin, je me couche.',                                         'Finally',                               "'Enfin' signals the end of any sequence. It often carries a sense of relief — finally hitting the pillow."),
  l(A7, "Je me repose l'après-midi.",                                   'Resting',                               "Culture: 'Se reposer' after lunch is a vital part of daily rhythm in many French-speaking regions."),
  t(A7, 'fr-en', 'Translate: "se lever, se réveiller, se coucher, se reposer"', 'to get up, to wake up, to go to bed, to rest', "All reflexive — subject + matching pronoun + verb. The structure never changes."),
  t(A7, 'fr-en', "Translate: \"d'abord, ensuite, enfin, tous les jours\"", 'first, then, finally, every day',  "These four words turn a list of verbs into a story. 'Ensuite' from 'suite' — rooms following each other."),
]

const a1u7Test: LPQ[] = [
  t(A7, 'en-fr', 'Every day I rest.',                                   'Tous les jours je me repose',           "'Tous les jours' can go at the start or end of the sentence."),
  t(A7, 'fr-en', 'Il se brosse les dents le soir.',                    'He brushes his teeth in the evening',   "Body parts take the definite article (les dents, not ses dents) with reflexive verbs."),
  m(A7, "How do you say 'Finally, I go to bed'?",                      'Enfin, je me couche',                   ['Ensuite, je me couche',"D'abord, je me couche",'Enfin, je me couche','Enfin, je couche'], "'Enfin' = finally. The last option drops the reflexive 'me' — a fatal error."),
  m(A7, "Choose the correct conjugation of 'se lever' for 'Il':",       'Il se lève',                            ['Il se lave','Il se lève','Il me lève','Il lève'], "The è accent (grave) opens the vowel sound. 'Il se lave' is 'he washes' — a different verb entirely."),
  a(A7, "Build: 'Then she gets dressed'",                              "Ensuite elle s'habille",                 ['Ensuite','elle',"s'habille"], "The elided s' before a vowel/silent h is mandatory — always write s'habille, never se habille."),
  f(A7, 'Le matin, je ___ réveille tôt.',                              'me',                                    "'Me' is the first-person reflexive pronoun. It acts as the object of 'réveiller'."),
  e(A7, 'Je me couche tard le nuit.',                                   'Je me couche tard la nuit',             "'Nuit' is feminine → 'la nuit'. 'Le nuit' does not exist."),
  e(A7, 'Tu laves le soir.',                                            'Tu te laves le soir',                   "Missing the reflexive 'te'. Without it, you are washing something else entirely."),
  l(A7, 'Je me lève à six heures.',                                    'Six o\'clock',                           "Combining reflexive verbs with time expressions is the heart of describing a daily routine."),
  t(A7, 'fr-en', "Translate: \"le matin, l'après-midi, le soir, la nuit\"", 'the morning, the afternoon, the evening, the night', "Note: 'la nuit' is feminine. All others are masculine. Each carries its own cultural rhythm in France."),
]

const a1u7Phrases: LessonPhrase[] = [
  { fr: 'Je me réveille',          en: 'I wake up',              note: "From ré- (again) + veiller (to watch). To 'watch again' — re-entering the waking world." },
  { fr: 'Je me lève',              en: 'I get up',               note: "The è signals a pronunciation shift. NEVER drop the 'me' — without it, you are lifting something else." },
  { fr: "D'abord / ensuite / enfin", en: 'First / then / finally', note: "The narrative backbone of any routine. These three words turn verbs into a story." },
  { fr: 'Je me couche',            en: 'I go to bed',            note: "Think: 'couch' — putting yourself on a surface to rest. The reflexive shows you are doing it to yourself." },
  { fr: "L'apéro",                 en: 'Pre-dinner drinks',      note: "Short for apéritif. A sacred French social hour between work and dinner to 'open' the appetite." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 8 — "The French Sky"
// ─────────────────────────────────────────────────────────────────────────────
const A8 = 'a1-u8'
const a1u8Practice: LPQ[] = [
  t(A8, 'fr-en', 'Il fait froid.',                                      'It is cold',                            "'Faire' (to make/do) carries all basic weather sensations. The impersonal 'il' is not 'he' — it's the world."),
  t(A8, 'en-fr', 'It is beautiful in summer.',                         'Il fait beau en été',                   "'En' before été because it starts with a vowel. 'Au' is reserved for le printemps only."),
  t(A8, 'fr-en', 'Il y a du vent en automne.',                         'It is windy in autumn',                 "'Il y a' = there is/are. You are literally saying 'There is some wind' — wind is a thing, not a quality."),
  m(A8, "How do you ask 'What is the weather like?'",                   'Quel temps fait-il ?',                  ['Comment est le ciel ?','Quel temps fait-il ?','Il fait quel temps ?',"Est-ce qu'il est beau ?"], "'Temps' means both weather AND time — to the French, the shifting sky and the passing hours are one concept."),
  m(A8, "Which season uses the preposition 'au'?",                      'le printemps',                          ["l'été","l'automne","l'hiver",'le printemps'], "Printemps starts with a consonant and is masculine → 'au'. Été, automne, hiver all start with vowels → 'en'."),
  a(A8, "Build: 'It is sunny'",                                         'Il fait du soleil',                     ['Il','fait','du','soleil'], "'Du soleil' uses the partitive article — some sunshine. Soleil is masculine."),
  a(A8, "Build: 'In winter it snows'",                                  'En hiver il neige',                     ['En','hiver','il','neige'], "'Neige' shares its root with 'niveous' (snow-white). 'Il neige' exists only in the 'il' form."),
  f(A8, "Il ___ mauvais aujourd'hui.",                                  'fait',                                  "Use 'fait' for weather qualities — good (beau) and bad (mauvais). These describe the state of the sky."),
  f(A8, '___ printemps, il y a des fleurs.',                            'Au',                                    "Spring is the only season needing 'au'. The others all start with vowels and pair with 'en'."),
  e(A8, "C'est chaud en été.",                                          'Il fait chaud en été',                  "Never use 'C'est' for weather. 'C'est chaud' means a physical object is hot, like a coffee cup."),
  e(A8, 'En printemps, il pleut.',                                      'Au printemps, il pleut',                "The most common season error. Printemps is masculine, starts with a consonant → always 'au printemps'."),
  l(A8, 'Il pleut beaucoup en automne.',                                'A lot',                                 "'Beaucoup' = a lot. Literally 'a fine stroke' (beau + coup). Think of a heavy downpour striking the ground."),
  l(A8, 'Il y a du brouillard ce matin.',                              'Fog',                                   "'Brouillard' shares its root with 'embroil' — things get tangled and mixed up in the mist."),
  t(A8, 'fr-en', 'Translate: "hiver, neige, été, chaud"',              'winter, snow, summer, hot',             "French weather is a national obsession — and a prime subject for 'râler' (complaining)."),
  t(A8, 'fr-en', 'Translate: "Il fait, Il y a, Il pleut, Au printemps"', 'It makes (quality), There is, It rains, In spring', "Three different constructions for weather. Knowing which one fits which word is what separates learners from speakers."),
]

const a1u8Test: LPQ[] = [
  t(A8, 'en-fr', 'It is cold in winter.',                              'Il fait froid en hiver',                "Combines 'il fait' + weather quality + 'en' + vowel-starting season."),
  t(A8, 'fr-en', "Il y a des nuages aujourd'hui.",                     'It is cloudy today',                    "'Aujourd'hui' literally means 'on the day of today' — a famously redundant phrase even in French."),
  m(A8, 'Which expression describes a storm?',                          "Il y a de l'orage",                    ['Il fait du vent','Il fait mauvais',"Il y a de l'orage",'Il neige'], "'Orage' is related to 'aurora' — think of the charged light before and after a storm."),
  m(A8, "Select the correct preposition: '___ automne, il fait du vent.'", 'En',                               ['Au','En','À la','Dans'], "Automne starts with a vowel → 'en'. Only printemps (consonant, masculine) gets 'au'."),
  a(A8, "Build: 'In spring the weather is nice'",                       'Au printemps il fait beau',             ['Au','printemps','il','fait','beau'], "The classic French spring sentence. Gets the au + il fait combination in one go."),
  f(A8, 'Il fait ___ soleil aujourd\'hui.',                             'du',                                    "Soleil is masculine → 'du' (de + le). Partitive article for a substance-like noun."),
  e(A8, 'Il fait nuages.',                                              'Il y a des nuages',                    "You cannot 'make' clouds. Clouds simply exist — use 'il y a'. Reserve 'il fait' for qualities like beau/mauvais."),
  e(A8, 'Il y a chaud au printemps.',                                   'Il fait chaud au printemps',            "Heat is a weather quality → 'il fait'. 'Il y a' is for things: wind, clouds, fog, storms."),
  l(A8, 'La canicule est en été.',                                     'In summer',                             "Canicule = from Canicula (Little Dog Star), which rises with the sun during the hottest days."),
  t(A8, 'fr-en', 'Translate: "chaud / froid, beau / mauvais, soleil / nuages, été / hiver"', 'hot / cold, nice / bad, sun / clouds, summer / winter', "Opposite pairs are the fastest way to build a mental map of weather vocabulary."),
]

const a1u8Phrases: LessonPhrase[] = [
  { fr: 'Il fait beau',           en: 'The weather is nice',      note: "The 'il' is impersonal — not 'he', but the state of the world. French weather literally 'makes' beauty." },
  { fr: 'Quel temps fait-il ?',   en: 'What is the weather like?', note: "'Temps' means BOTH weather and time. To the French, the shifting sky and passing hours share the same word." },
  { fr: 'Il pleut',               en: 'It is raining',            note: "From Latin 'pluere'. Exists ONLY in the 'il' form — you cannot say 'I rain' or 'you rain'." },
  { fr: 'Au printemps',           en: 'In spring',                note: "The only season using 'au'. Été, automne, hiver all start with vowels and use 'en' instead." },
  { fr: 'La canicule',            en: 'The heatwave',             note: "From Latin Canicula (Little Dog Star). A major national conversation in France since the devastating summer of 2003." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 9 — "At the Market"
// ─────────────────────────────────────────────────────────────────────────────
const A9 = 'a1-u9'
const a1u9Practice: LPQ[] = [
  t(A9, 'fr-en', "C'est combien le kilo ?",                            'How much is it per kilo',                "The most useful market phrase. Pair with 'le kilo' or 'la pièce' to specify per-unit pricing."),
  t(A9, 'en-fr', 'I would like a baguette.',                           'Je voudrais une baguette',               "'Je voudrais' = conditional of vouloir. Far more polite than 'je veux' (I want), which sounds blunt."),
  t(A9, 'fr-en', "Une livre de tomates s'il vous plaît.",              'Half a kilo of tomatoes please',         "'Une livre' = 500g in France (a metric pound), not the British 454g pound. Always 500g flat."),
  m(A9, "Which partitive article goes with 'pommes' (apples)?",         'des',                                    ['du','de la','des',"de l'"], "'Des' for plural nouns. Use du (m sing), de la (f sing), de l' (vowel), des (plural)."),
  m(A9, "Which is the polite way to ask for something at a shop?",      'Je voudrais',                            ['Je veux','Donnez-moi','Je voudrais','Apporte'], "'Je veux' is rude in shops. 'Donnez-moi' is a command. 'Je voudrais' is the polished standard."),
  a(A9, "Build: 'I would like two croissants please'",                  "Je voudrais deux croissants s'il vous plaît", ['Je','voudrais','deux','croissants',"s'il",'vous','plaît'], "'S'il vous plaît' literally = 'if it pleases you'. The vous form is standard with strangers."),
  a(A9, "Build: 'It is too expensive'",                                 "C'est trop cher",                        ["C'est",'trop','cher'], "'Trop' = too (excessive). 'Très' = very. Don't confuse them — trop carries criticism."),
  f(A9, 'Je voudrais ___ fromage.',                                     'du',                                     "Fromage is masculine singular → du. Partitive article means 'some' — required in French even when English drops it."),
  f(A9, "C'est combien ___ kilo ?",                                     'le',                                     "'Le kilo' = per kilo. The article specifies a unit price — same with 'la pièce' (each)."),
  e(A9, 'Je veux pain.',                                                'Je voudrais du pain',                    "Two errors: 'je veux' is too direct, and French requires the partitive 'du' before unspecified bread."),
  e(A9, 'Je voudrais le pommes.',                                       'Je voudrais des pommes',                 "Use 'des' for unspecified plural quantities. 'Le pommes' is grammatically impossible — wrong gender AND wrong number."),
  l(A9, 'Une baguette coûte un euro.',                                 'One euro',                                "A standard baguette price in France is around €1–€1.20. Ask 'C\'est combien ?' to check."),
  l(A9, 'Trois cents grammes de fromage.',                             'Three hundred grams of cheese',          "Note: after a quantity expression (cent grammes, un kilo, une livre), use 'de' alone — never 'du' or 'des'."),
  t(A9, 'fr-en', 'Translate: "fraise, pomme, tomate, fromage"',        'strawberry, apple, tomato, cheese',      "Build a market vocab map. Most fruits and vegetables in French are feminine."),
  t(A9, 'fr-en', "Translate: \"du, de la, des, de l'\"",                "some (masc), some (fem), some (plural), some (vowel-start)", "The four faces of the partitive article — match by gender, number, and the next sound."),
]

const a1u9Test: LPQ[] = [
  t(A9, 'en-fr', 'How much for the cheese?',                            "C'est combien le fromage",              "The 'le' specifies you're asking the price of the cheese as a category, not a specific piece."),
  t(A9, 'fr-en', 'Je voudrais une livre de pommes.',                   'I would like half a kilo of apples',     "'Une livre de' = 500g of. Note the 'de' (not 'des') after a quantity word."),
  m(A9, "How do you say 'It's too expensive'?",                        "C'est trop cher",                        ["C'est trop cher","C'est très bon","C'est pas mal","C'est cher trop"], "'Trop' must come before the adjective. 'Cher trop' is wrong word order."),
  m(A9, "Which is the partitive for water (l'eau, feminine)?",          "de l'",                                  ['du','de la','des',"de l'"], "Eau starts with a vowel → de l'. The l' contraction prevents the awkward 'de eau'."),
  a(A9, "Build: 'I would like some bread and some cheese'",             'Je voudrais du pain et du fromage',     ['Je','voudrais','du','pain','et','du','fromage'], "Both pain and fromage are masculine → both take 'du'. The partitive must be repeated."),
  f(A9, 'Donnez-moi ___ confiture.',                                   'de la',                                  "Confiture is feminine singular → de la. (For polite contexts, prefer 'Je voudrais de la confiture'.)"),
  e(A9, "C'est combien la kilo ?",                                     "C'est combien le kilo ?",                "Kilo is masculine → 'le kilo'. 'La kilo' is a beginner gender mistake."),
  e(A9, "Je voudrais des l'eau.",                                       "Je voudrais de l'eau",                  "Eau is singular and starts with a vowel → de l'. 'Des l'eau' breaks two rules at once."),
  l(A9, 'Ça fait dix euros.',                                           'Ten euros',                              "'Ça fait' = that comes to. Standard phrase at checkout — the cashier's way of giving the total."),
  t(A9, 'fr-en', 'Translate: "le marché, la boulangerie, la fromagerie, la poissonnerie"', 'the market, the bakery, the cheese shop, the fish shop', "Most -erie shops are feminine. Each French town has a network of these specialized food shops."),
]

const a1u9Phrases: LessonPhrase[] = [
  { fr: 'Au marché',          en: 'At the market',         note: "Open-air markets are the heart of French food culture — most towns have one twice a week." },
  { fr: "C'est combien ?",    en: 'How much is it?',       note: "The most useful market phrase. Pair with 'le kilo' or 'la pièce' for unit pricing." },
  { fr: 'Une livre',          en: 'Half a kilo (500g)',    note: "Literally 'a pound', but the French livre is exactly 500g — a clean metric round number." },
  { fr: 'Du / de la / des',   en: 'Some (m / f / plural)', note: "The partitive article. Required in French even when English drops it: 'I want bread' = 'Je veux DU pain'." },
  { fr: 'Je voudrais',        en: 'I would like',          note: "Conditional of vouloir. The polite standard at any French shop or restaurant — never use 'je veux'." },
]

// ─────────────────────────────────────────────────────────────────────────────
// A1 Unit 10 — "À bientôt!"
// ─────────────────────────────────────────────────────────────────────────────
const AA = 'a1-u10'
const a1u10Practice: LPQ[] = [
  t(AA, 'fr-en', 'À bientôt !',                                         'See you soon',                          "Literally 'until soon'. The standard warm goodbye between friends, colleagues, and acquaintances."),
  t(AA, 'en-fr', 'Have a good trip!',                                   'Bon voyage',                             "'Bon' + activity is a French formula: bon appétit, bon courage, bon weekend, bon voyage."),
  t(AA, 'fr-en', 'À demain matin.',                                    'See you tomorrow morning',               "'À' + time word builds dozens of farewells: à lundi, à ce soir, à plus tard, à jeudi."),
  m(AA, "Which means 'See you tonight'?",                              'À ce soir',                              ['À demain','À bientôt','À ce soir','À plus tard'], "'Ce soir' = tonight (literally 'this evening'). 'À ce soir' is used when parting earlier in the day."),
  m(AA, "How do you say 'I'm going to France'?",                       'Je vais en France',                       ['Je vais à France','Je vais en France','Je vais au France','Je vais France'], "Feminine countries take 'en'. France, Italie, Espagne, Allemagne are all feminine → 'en France', 'en Italie'."),
  a(AA, "Build: 'Have a good weekend!'",                                'Bon weekend',                            ['Bon','weekend'], "French has fully adopted 'le weekend' from English. 'Bon weekend' is said every Friday afternoon across France."),
  a(AA, "Build: 'I am going to Canada in summer'",                     'Je vais au Canada en été',              ['Je','vais','au','Canada','en','été'], "Canada is masculine → au (à + le). 'En été' for summer (vowel start). Two prepositions, two rules."),
  f(AA, 'Je vais ___ Italie cet été.',                                 'en',                                    "Italie is feminine → 'en'. The pattern: en + feminine country, au + masculine country, aux + plural country."),
  f(AA, 'À ___ semaine prochaine !',                                   'la',                                    "'La semaine prochaine' = next week. The article 'la' is mandatory — a fixed expression."),
  e(AA, 'Je vais à France.',                                            'Je vais en France',                     "Never 'à' + country. Use 'en' for feminine, 'au' for masculine, 'aux' for plural countries."),
  e(AA, 'Je vais en Canada.',                                           'Je vais au Canada',                     "Canada is masculine (le Canada) → au, not en. Easy memory hook: most countries ending in -a are feminine, but Canada bucks the trend."),
  l(AA, 'Bon voyage et à bientôt.',                                     'Have a good trip and see you soon',     "The classic French send-off: a wish for the journey, plus the promise of reunion."),
  l(AA, 'Je pars en vacances demain.',                                 'I am leaving on holiday tomorrow',       "'Partir en vacances' = to leave on holiday. The French take their summer holidays very seriously — many businesses close in August."),
  t(AA, 'fr-en', 'Translate: "à demain, à bientôt, à ce soir, à plus tard"', 'see you tomorrow, see you soon, see you tonight, see you later', "All built from 'à' + a time word. Memorize the pattern, generate dozens of farewells."),
  t(AA, 'fr-en', "Translate: \"le départ, l'arrivée, le voyage, les vacances\"", 'departure, arrival, trip, holidays', "'Vacances' is always plural in French — you cannot have just one vacance."),
]

const a1u10Test: LPQ[] = [
  t(AA, 'en-fr', 'See you next week!',                                  'À la semaine prochaine',                 "'À' + 'la semaine prochaine'. Note both the article 'la' and the position of 'prochaine' AFTER the noun."),
  t(AA, 'fr-en', 'Faites bon voyage.',                                  'Have a safe trip',                       "'Faites' is the vous-form imperative of faire — formal, used with strangers or in professional contexts."),
  m(AA, "Which country is masculine and uses 'au'?",                   'le Canada',                              ['la France','le Canada',"l'Italie","l'Espagne"], "Canada is the famous masculine exception. Most -e ending countries are feminine; Canada is not."),
  m(AA, "How do you wish someone strength/courage for a hard task?",   'Bon courage',                            ['Bonne chance','Bon courage','Bonne journée','Bon appétit'], "'Bonne chance' = good luck (random). 'Bon courage' = strength for a hard task. Different scenarios."),
  a(AA, "Build: 'See you tomorrow at the train station'",              'À demain à la gare',                     ['À','demain','à','la','gare'], "Two 'à' in a row — first for the time (à demain), second for the place (à la gare)."),
  f(AA, 'Je voyage ___ Espagne en mai.',                              'en',                                    "Espagne is feminine → en. May is just 'en mai' (no article needed for months)."),
  e(AA, 'Bon voyage à toi, à plus tarde.',                              'Bon voyage à toi, à plus tard',         "'À plus tard' — no 'e' on tard. Common spelling slip influenced by Spanish 'tarde'."),
  e(AA, 'À la lundi !',                                                 'À lundi !',                              "Days of the week never take an article in farewells. 'À lundi', 'À mardi', 'À jeudi' — never 'à le lundi'."),
  l(AA, 'Je reviens dans deux semaines.',                              'I will be back in two weeks',            "'Dans + duration' = in X amount of time (future). 'Il y a + duration' = X ago (past)."),
  t(AA, 'fr-en', 'Translate: "en France, au Canada, en Italie, aux États-Unis"', 'in France, in Canada, in Italy, in the United States', "The four prepositions: en (fem), au (masc), aux (plural). Master these and you can talk about any country."),
]

const a1u10Phrases: LessonPhrase[] = [
  { fr: 'À bientôt',           en: 'See you soon',          note: "Literally 'until soon'. The warm, default goodbye between friends and colleagues across France." },
  { fr: 'Bon voyage',          en: 'Have a good trip',     note: "'Bon' + activity = a French wishing formula: bon appétit, bon courage, bon weekend, bon voyage, bonne journée." },
  { fr: 'À demain',            en: 'See you tomorrow',     note: "'À' + time word builds dozens of farewells: à lundi, à ce soir, à plus tard, à jeudi, à la prochaine." },
  { fr: 'Je vais en France',   en: 'I am going to France', note: "Feminine countries take 'en' (en France, en Italie). Masculine countries take 'au' (au Canada, au Japon). Plural takes 'aux' (aux États-Unis)." },
  { fr: 'Faites bon voyage',   en: 'Have a safe trip (formal)', note: "The vous-form imperative — used with strangers or in professional contexts. The tu-form is 'fais bon voyage'." },
]

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const LESSON_PLANS: Record<string, LessonPlanData> = {
  'a1-u1':  { title: 'The First Encounter',     theme: 'Greetings & Introductions',                       phrases: a1u1Phrases,  practice: a1u1Practice,  test: a1u1Test  },
  'a1-u2':  { title: 'The Rhythm of Life',      theme: 'Numbers, Dates & Time',                           phrases: a1u2Phrases,  practice: a1u2Practice,  test: a1u2Test  },
  'a1-u3':  { title: 'All in the Family',       theme: 'Family members, possessives & relationships',     phrases: a1u3Phrases,  practice: a1u3Practice,  test: a1u3Test  },
  'a1-u4':  { title: 'Café Culture',            theme: 'Ordering food & drink, polite requests',          phrases: a1u4Phrases,  practice: a1u4Practice,  test: a1u4Test  },
  'a1-u5':  { title: 'What Are You Wearing?',   theme: 'Colors, clothing & adjective agreement',          phrases: a1u5Phrases,  practice: a1u5Practice,  test: a1u5Test  },
  'a1-u6':  { title: 'Getting Around',          theme: 'Directions, city places & prepositions',          phrases: a1u6Phrases,  practice: a1u6Practice,  test: a1u6Test  },
  'a1-u7':  { title: 'From Dawn to Dusk',       theme: 'Daily routines, reflexive verbs & time of day',   phrases: a1u7Phrases,  practice: a1u7Practice,  test: a1u7Test  },
  'a1-u8':  { title: 'The French Sky',          theme: 'Weather expressions, seasons & the impersonal il', phrases: a1u8Phrases,  practice: a1u8Practice,  test: a1u8Test  },
  'a1-u9':  { title: 'At the Market',           theme: 'Shopping, partitive articles & polite requests',  phrases: a1u9Phrases,  practice: a1u9Practice,  test: a1u9Test  },
  'a1-u10': { title: 'À bientôt!',              theme: 'Farewells, travel & countries with prepositions', phrases: a1u10Phrases, practice: a1u10Practice, test: a1u10Test },
}
