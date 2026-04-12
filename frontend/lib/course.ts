// lib/course.ts
// Voltaire — Course Structure
// 132 units / 652 lessons across A1–C2
// 2× Duolingo French (272 units) · 4× Babbel French (150+ lessons)

export type LessonType = 'vocab'|'grammar'|'conversation'|'listening'|'culture'|'review'

export const LESSON_TYPE_ICONS: Record<LessonType, string> = {
  vocab:        '📝',
  grammar:      '📐',
  conversation: '💬',
  listening:    '🔉',
  culture:      '🗼',
  review:       '🔁',
}

export const LESSON_TYPE_COLORS: Record<LessonType, string> = {
  vocab:        '#4f9cf9',
  grammar:      '#a78bfa',
  conversation: '#58cc02',
  listening:    '#1cb0f6',
  culture:      '#ffd900',
  review:       '#ff9600',
}

export interface Lesson {
  id:       string
  title:    string
  type:     LessonType
  xp:       number
  locked:   boolean
  complete: boolean
  current:  boolean
  crown?:   number
}

export interface CourseUnit {
  id:       string
  title:    string
  subtitle: string
  cefr:     string
  emoji:    string
  color:    string
  eloMin:   number
  locked:   boolean
  lessons:  Lesson[]
}

// ── Static course data ────────────────────────────────────────────────────────

interface LDef { id: string; title: string; type: LessonType; xp: number }
interface UDef {
  id: string; title: string; subtitle: string
  cefr: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'
  emoji: string; color: string; lessons: LDef[]
}

const C: Record<string,string> = {
  A1:'#58cc02', A2:'#1cb0f6', B1:'#a78bfa', B2:'#ffd900', C1:'#ff9600', C2:'#ff4b4b'
}

const UNITS: UDef[] = [

  // ══════════════════════════════════════════════════════════════════════════
  //  A1 — Les Fondations  (28 units × 5 lessons = 140 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'a1u01', title:'Les Salutations', subtitle:'Greetings & first introductions',
    cefr:'A1', emoji:'👋', color:C.A1, lessons:[
      { id:'a1u01l1', title:'Bonjour & Bonsoir',        type:'conversation', xp:10 },
      { id:'a1u01l2', title:'Se présenter',              type:'conversation', xp:10 },
      { id:'a1u01l3', title:'Tu vs Vous',                type:'grammar',      xp:10 },
      { id:'a1u01l4', title:'Les formules de politesse', type:'vocab',        xp:10 },
      { id:'a1u01l5', title:'Salutations: bilan',        type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u02', title:'Les Nombres', subtitle:'Numbers 1–100 & counting',
    cefr:'A1', emoji:'🔢', color:C.A1, lessons:[
      { id:'a1u02l1', title:'Nombres 1–10',              type:'vocab',        xp:10 },
      { id:'a1u02l2', title:'Nombres 11–20',             type:'vocab',        xp:10 },
      { id:'a1u02l3', title:'Nombres 21–100',            type:'vocab',        xp:10 },
      { id:'a1u02l4', title:'Numéros de téléphone',      type:'conversation', xp:10 },
      { id:'a1u02l5', title:'Les nombres: bilan',        type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u03', title:'Les Couleurs', subtitle:'Colors, shapes & basic description',
    cefr:'A1', emoji:'🎨', color:C.A1, lessons:[
      { id:'a1u03l1', title:'Les couleurs primaires',    type:'vocab',        xp:10 },
      { id:'a1u03l2', title:'Les couleurs avancées',     type:'vocab',        xp:10 },
      { id:'a1u03l3', title:'Accord des couleurs',       type:'grammar',      xp:10 },
      { id:'a1u03l4', title:'Décrire un objet',          type:'conversation', xp:10 },
      { id:'a1u03l5', title:'Couleurs & formes: bilan',  type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u04', title:'La Famille', subtitle:'Family members & relationships',
    cefr:'A1', emoji:'👨‍👩‍👧', color:C.A1, lessons:[
      { id:'a1u04l1', title:'Parents & enfants',         type:'vocab',        xp:10 },
      { id:'a1u04l2', title:'Frères, sœurs & cousins',  type:'vocab',        xp:10 },
      { id:'a1u04l3', title:'Mon / ma / mes',            type:'grammar',      xp:10 },
      { id:'a1u04l4', title:'Ma famille à moi',          type:'conversation', xp:10 },
      { id:'a1u04l5', title:'La famille: bilan',         type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u05', title:'Être & Avoir', subtitle:'The two essential French verbs',
    cefr:'A1', emoji:'⚙️', color:C.A1, lessons:[
      { id:'a1u05l1', title:'être au présent',           type:'grammar',      xp:10 },
      { id:'a1u05l2', title:'avoir au présent',          type:'grammar',      xp:10 },
      { id:'a1u05l3', title:'Expressions avec avoir',    type:'grammar',      xp:10 },
      { id:'a1u05l4', title:'être ou avoir ?',           type:'conversation', xp:10 },
      { id:'a1u05l5', title:'être & avoir: bilan',       type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u06', title:'Les Articles', subtitle:'Le, la, l\', les — un, une, des',
    cefr:'A1', emoji:'📖', color:C.A1, lessons:[
      { id:'a1u06l1', title:'Articles définis',          type:'grammar',      xp:10 },
      { id:'a1u06l2', title:'Articles indéfinis',        type:'grammar',      xp:10 },
      { id:'a1u06l3', title:'Genre des noms',            type:'grammar',      xp:10 },
      { id:'a1u06l4', title:'Articles & négation',       type:'grammar',      xp:10 },
      { id:'a1u06l5', title:'Les articles: bilan',       type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u07', title:'La Nourriture', subtitle:'Food, drinks & expressing taste',
    cefr:'A1', emoji:'🥖', color:C.A1, lessons:[
      { id:'a1u07l1', title:'Fruits & légumes',          type:'vocab',        xp:10 },
      { id:'a1u07l2', title:'Les repas du jour',         type:'vocab',        xp:10 },
      { id:'a1u07l3', title:'Exprimer ses goûts',        type:'conversation', xp:10 },
      { id:'a1u07l4', title:'Au marché',                 type:'listening',    xp:10 },
      { id:'a1u07l5', title:'La nourriture: bilan',      type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u08', title:'Au Café', subtitle:'Ordering, paying & café culture',
    cefr:'A1', emoji:'☕', color:C.A1, lessons:[
      { id:'a1u08l1', title:'Les boissons',              type:'vocab',        xp:10 },
      { id:'a1u08l2', title:'Commander au comptoir',     type:'conversation', xp:10 },
      { id:'a1u08l3', title:'L\'addition, s\'il vous plaît', type:'conversation', xp:10 },
      { id:'a1u08l4', title:'La culture du café',        type:'culture',      xp:10 },
      { id:'a1u08l5', title:'Au café: bilan',            type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u09', title:'Les Animaux', subtitle:'Pets, farm animals & wildlife',
    cefr:'A1', emoji:'🐾', color:C.A1, lessons:[
      { id:'a1u09l1', title:'Animaux de compagnie',      type:'vocab',        xp:10 },
      { id:'a1u09l2', title:'Animaux sauvages',          type:'vocab',        xp:10 },
      { id:'a1u09l3', title:'Décrire un animal',         type:'grammar',      xp:10 },
      { id:'a1u09l4', title:'Mon animal préféré',        type:'conversation', xp:10 },
      { id:'a1u09l5', title:'Les animaux: bilan',        type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u10', title:'Chez Soi', subtitle:'Home, rooms & furniture',
    cefr:'A1', emoji:'🏠', color:C.A1, lessons:[
      { id:'a1u10l1', title:'Les pièces de la maison',   type:'vocab',        xp:10 },
      { id:'a1u10l2', title:'Les meubles',               type:'vocab',        xp:10 },
      { id:'a1u10l3', title:'Décrire son logement',      type:'conversation', xp:10 },
      { id:'a1u10l4', title:'J\'habite à…',              type:'conversation', xp:10 },
      { id:'a1u10l5', title:'Chez soi: bilan',           type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u11', title:'L\'Heure', subtitle:'Telling time & daily schedule',
    cefr:'A1', emoji:'🕐', color:C.A1, lessons:[
      { id:'a1u11l1', title:'Quelle heure est-il ?',     type:'conversation', xp:10 },
      { id:'a1u11l2', title:'Heures formelles & informelles', type:'vocab',   xp:10 },
      { id:'a1u11l3', title:'Matin, midi, soir',         type:'vocab',        xp:10 },
      { id:'a1u11l4', title:'Prendre rendez-vous',       type:'conversation', xp:10 },
      { id:'a1u11l5', title:'L\'heure: bilan',           type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u12', title:'La Météo', subtitle:'Weather, seasons & forecasts',
    cefr:'A1', emoji:'☀️', color:C.A1, lessons:[
      { id:'a1u12l1', title:'Il fait beau / mauvais',    type:'vocab',        xp:10 },
      { id:'a1u12l2', title:'Les quatre saisons',        type:'vocab',        xp:10 },
      { id:'a1u12l3', title:'La météo du jour',          type:'listening',    xp:10 },
      { id:'a1u12l4', title:'Météo & vêtements',         type:'conversation', xp:10 },
      { id:'a1u12l5', title:'La météo: bilan',           type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u13', title:'Les Directions', subtitle:'Getting around the city',
    cefr:'A1', emoji:'🗺️', color:C.A1, lessons:[
      { id:'a1u13l1', title:'Gauche, droite, tout droit', type:'vocab',       xp:10 },
      { id:'a1u13l2', title:'Les lieux de la ville',     type:'vocab',        xp:10 },
      { id:'a1u13l3', title:'Demander son chemin',       type:'conversation', xp:10 },
      { id:'a1u13l4', title:'Naviguer la ville',         type:'listening',    xp:10 },
      { id:'a1u13l5', title:'Les directions: bilan',     type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u14', title:'Révision A1', subtitle:'Mid-level A1 checkpoint',
    cefr:'A1', emoji:'🌟', color:C.A1, lessons:[
      { id:'a1u14l1', title:'Vocabulaire A1',            type:'vocab',        xp:15 },
      { id:'a1u14l2', title:'Grammaire A1',              type:'grammar',      xp:15 },
      { id:'a1u14l3', title:'Conversation A1',           type:'conversation', xp:15 },
      { id:'a1u14l4', title:'Écoute A1',                 type:'listening',    xp:15 },
      { id:'a1u14l5', title:'Bilan A1',                  type:'review',       xp:25 },
    ]
  },
  // ── A1 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'a1u15', title:'Les Verbes -ER', subtitle:'Regular -ER verbs — the core pattern',
    cefr:'A1', emoji:'🔤', color:C.A1, lessons:[
      { id:'a1u15l1', title:'Parler, manger, habiter',   type:'grammar',      xp:10 },
      { id:'a1u15l2', title:'Conjuguer au présent',      type:'grammar',      xp:10 },
      { id:'a1u15l3', title:'Négation des verbes -ER',   type:'grammar',      xp:10 },
      { id:'a1u15l4', title:'Verbes -ER en contexte',    type:'conversation', xp:10 },
      { id:'a1u15l5', title:'Verbes -ER: bilan',         type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u16', title:'Les Jours & Le Calendrier', subtitle:'Days, weeks, months & dates',
    cefr:'A1', emoji:'📅', color:C.A1, lessons:[
      { id:'a1u16l1', title:'Les jours de la semaine',   type:'vocab',        xp:10 },
      { id:'a1u16l2', title:'Les mois de l\'année',      type:'vocab',        xp:10 },
      { id:'a1u16l3', title:'Quelle est la date ?',      type:'conversation', xp:10 },
      { id:'a1u16l4', title:'Les anniversaires',         type:'conversation', xp:10 },
      { id:'a1u16l5', title:'Le calendrier: bilan',      type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u17', title:'Les Pays & Nationalités', subtitle:'Countries, capitals & nationalities',
    cefr:'A1', emoji:'🌍', color:C.A1, lessons:[
      { id:'a1u17l1', title:'Les pays d\'Europe',        type:'vocab',        xp:10 },
      { id:'a1u17l2', title:'Le monde francophone',      type:'vocab',        xp:10 },
      { id:'a1u17l3', title:'Les nationalités',          type:'grammar',      xp:10 },
      { id:'a1u17l4', title:'D\'où venez-vous ?',        type:'conversation', xp:10 },
      { id:'a1u17l5', title:'Pays & nationalités: bilan', type:'review',      xp:15 },
    ]
  },
  {
    id:'a1u18', title:'Les Professions', subtitle:'Jobs, trades & what people do',
    cefr:'A1', emoji:'🧑‍💼', color:C.A1, lessons:[
      { id:'a1u18l1', title:'Les métiers courants',      type:'vocab',        xp:10 },
      { id:'a1u18l2', title:'Qu\'est-ce que vous faites ?', type:'conversation', xp:10 },
      { id:'a1u18l3', title:'Professions & articles',    type:'grammar',      xp:10 },
      { id:'a1u18l4', title:'Mon rêve professionnel',    type:'conversation', xp:10 },
      { id:'a1u18l5', title:'Les professions: bilan',    type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u19', title:'La Personnalité', subtitle:'Personality adjectives & character',
    cefr:'A1', emoji:'😊', color:C.A1, lessons:[
      { id:'a1u19l1', title:'Adjectifs positifs',        type:'vocab',        xp:10 },
      { id:'a1u19l2', title:'Adjectifs négatifs',        type:'vocab',        xp:10 },
      { id:'a1u19l3', title:'Il est / elle est…',        type:'grammar',      xp:10 },
      { id:'a1u19l4', title:'Décrire ses amis',          type:'conversation', xp:10 },
      { id:'a1u19l5', title:'La personnalité: bilan',    type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u20', title:'Les Prépositions', subtitle:'Prepositions of place & movement',
    cefr:'A1', emoji:'📍', color:C.A1, lessons:[
      { id:'a1u20l1', title:'Sur, sous, devant, derrière', type:'vocab',      xp:10 },
      { id:'a1u20l2', title:'Dans, entre, à côté de',    type:'vocab',        xp:10 },
      { id:'a1u20l3', title:'À, en, au, aux (pays & villes)', type:'grammar', xp:10 },
      { id:'a1u20l4', title:'Localiser des objets',      type:'conversation', xp:10 },
      { id:'a1u20l5', title:'Les prépositions: bilan',   type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u21', title:'Au Supermarché', subtitle:'Grocery shopping & everyday purchases',
    cefr:'A1', emoji:'🛒', color:C.A1, lessons:[
      { id:'a1u21l1', title:'Rayons & produits',         type:'vocab',        xp:10 },
      { id:'a1u21l2', title:'Les quantités',             type:'vocab',        xp:10 },
      { id:'a1u21l3', title:'Combien ça coûte ?',        type:'conversation', xp:10 },
      { id:'a1u21l4', title:'Faire la liste de courses', type:'listening',    xp:10 },
      { id:'a1u21l5', title:'Au supermarché: bilan',     type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u22', title:'Les Verbes -IR & -RE', subtitle:'Regular IR & RE verb patterns',
    cefr:'A1', emoji:'📗', color:C.A1, lessons:[
      { id:'a1u22l1', title:'Finir, choisir, réussir',   type:'grammar',      xp:10 },
      { id:'a1u22l2', title:'Attendre, vendre, répondre', type:'grammar',     xp:10 },
      { id:'a1u22l3', title:'-IR & -RE en contexte',     type:'conversation', xp:10 },
      { id:'a1u22l4', title:'Mélange -ER/-IR/-RE',       type:'grammar',      xp:10 },
      { id:'a1u22l5', title:'Verbes -IR & -RE: bilan',   type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u23', title:'La Négation', subtitle:'Ne…pas & basic negation structures',
    cefr:'A1', emoji:'🚫', color:C.A1, lessons:[
      { id:'a1u23l1', title:'Ne…pas au présent',         type:'grammar',      xp:10 },
      { id:'a1u23l2', title:'Ne…pas au passé composé',   type:'grammar',      xp:10 },
      { id:'a1u23l3', title:'Non & pas de',              type:'grammar',      xp:10 },
      { id:'a1u23l4', title:'Répondre négativement',     type:'conversation', xp:10 },
      { id:'a1u23l5', title:'La négation: bilan',        type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u24', title:'Les Questions', subtitle:'Three ways to ask — A1 question forms',
    cefr:'A1', emoji:'❓', color:C.A1, lessons:[
      { id:'a1u24l1', title:'Intonation montante',       type:'grammar',      xp:10 },
      { id:'a1u24l2', title:'Est-ce que…',               type:'grammar',      xp:10 },
      { id:'a1u24l3', title:'Qui, quoi, où, quand',      type:'vocab',        xp:10 },
      { id:'a1u24l4', title:'Questions en contexte',     type:'conversation', xp:10 },
      { id:'a1u24l5', title:'Les questions: bilan',      type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u25', title:'Les Activités Quotidiennes', subtitle:'Daily routines & habits',
    cefr:'A1', emoji:'⏰', color:C.A1, lessons:[
      { id:'a1u25l1', title:'Se lever & se coucher',     type:'vocab',        xp:10 },
      { id:'a1u25l2', title:'Manger & travailler',       type:'vocab',        xp:10 },
      { id:'a1u25l3', title:'Ma journée type',           type:'conversation', xp:10 },
      { id:'a1u25l4', title:'La routine d\'un Français', type:'culture',      xp:10 },
      { id:'a1u25l5', title:'Activités quotidiennes: bilan', type:'review',   xp:15 },
    ]
  },
  {
    id:'a1u26', title:'Le Corps Humain', subtitle:'Body parts & basic health expressions',
    cefr:'A1', emoji:'🫀', color:C.A1, lessons:[
      { id:'a1u26l1', title:'La tête',                   type:'vocab',        xp:10 },
      { id:'a1u26l2', title:'Le corps',                  type:'vocab',        xp:10 },
      { id:'a1u26l3', title:'J\'ai mal à…',              type:'grammar',      xp:10 },
      { id:'a1u26l4', title:'Chez le médecin (A1)',      type:'conversation', xp:10 },
      { id:'a1u26l5', title:'Le corps: bilan',           type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u27', title:'À l\'Hôtel', subtitle:'Hotel check-in, requests & travel basics',
    cefr:'A1', emoji:'🏨', color:C.A1, lessons:[
      { id:'a1u27l1', title:'Réserver une chambre',      type:'conversation', xp:10 },
      { id:'a1u27l2', title:'À la réception',            type:'conversation', xp:10 },
      { id:'a1u27l3', title:'Les équipements',           type:'vocab',        xp:10 },
      { id:'a1u27l4', title:'Demander des services',     type:'listening',    xp:10 },
      { id:'a1u27l5', title:'À l\'hôtel: bilan',         type:'review',       xp:15 },
    ]
  },
  {
    id:'a1u28', title:'Révision A1 Avancée', subtitle:'Full A1 mastery — survival French complete',
    cefr:'A1', emoji:'🏅', color:C.A1, lessons:[
      { id:'a1u28l1', title:'Grand vocabulaire A1',      type:'vocab',        xp:20 },
      { id:'a1u28l2', title:'Grande grammaire A1',       type:'grammar',      xp:20 },
      { id:'a1u28l3', title:'Grande conversation A1',    type:'conversation', xp:20 },
      { id:'a1u28l4', title:'Grande écoute A1',          type:'listening',    xp:20 },
      { id:'a1u28l5', title:'Grand bilan A1',            type:'review',       xp:30 },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  A2 — Les Conversations  (34 units × 5 lessons = 170 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'a2u01', title:'Le Passé Composé', subtitle:'Completed past — the core past tense',
    cefr:'A2', emoji:'⏪', color:C.A2, lessons:[
      { id:'a2u01l1', title:'Auxiliaire avoir',          type:'grammar',      xp:15 },
      { id:'a2u01l2', title:'Auxiliaire être',           type:'grammar',      xp:15 },
      { id:'a2u01l3', title:'Participes irréguliers',    type:'grammar',      xp:15 },
      { id:'a2u01l4', title:'Négation au passé',         type:'grammar',      xp:15 },
      { id:'a2u01l5', title:'Passé composé: bilan',      type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u02', title:'L\'Imparfait', subtitle:'Habits, states & ongoing past actions',
    cefr:'A2', emoji:'🌊', color:C.A2, lessons:[
      { id:'a2u02l1', title:'Formation de l\'imparfait', type:'grammar',      xp:15 },
      { id:'a2u02l2', title:'Habitudes passées',         type:'conversation', xp:15 },
      { id:'a2u02l3', title:'Descriptions au passé',     type:'grammar',      xp:15 },
      { id:'a2u02l4', title:'Imparfait vs Passé composé', type:'grammar',     xp:15 },
      { id:'a2u02l5', title:'L\'imparfait: bilan',       type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u03', title:'Au Restaurant', subtitle:'Ordering, recommendations & French cuisine',
    cefr:'A2', emoji:'🍽️', color:C.A2, lessons:[
      { id:'a2u03l1', title:'Lire la carte',             type:'vocab',        xp:15 },
      { id:'a2u03l2', title:'Commander un repas',        type:'conversation', xp:15 },
      { id:'a2u03l3', title:'Faire une recommandation',  type:'conversation', xp:15 },
      { id:'a2u03l4', title:'La gastronomie française',  type:'culture',      xp:15 },
      { id:'a2u03l5', title:'Au restaurant: bilan',      type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u04', title:'Les Transports', subtitle:'Getting around France',
    cefr:'A2', emoji:'🚆', color:C.A2, lessons:[
      { id:'a2u04l1', title:'Le métro & le bus',         type:'vocab',        xp:15 },
      { id:'a2u04l2', title:'Acheter un billet',         type:'conversation', xp:15 },
      { id:'a2u04l3', title:'Voyages en train',          type:'conversation', xp:15 },
      { id:'a2u04l4', title:'Horaires & retards',        type:'listening',    xp:15 },
      { id:'a2u04l5', title:'Les transports: bilan',     type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u05', title:'Les Achats', subtitle:'Shopping, prices & returns',
    cefr:'A2', emoji:'🛍️', color:C.A2, lessons:[
      { id:'a2u05l1', title:'Dans les magasins',         type:'vocab',        xp:15 },
      { id:'a2u05l2', title:'Comparer les prix',         type:'conversation', xp:15 },
      { id:'a2u05l3', title:'Faire du shopping',         type:'conversation', xp:15 },
      { id:'a2u05l4', title:'Rendre un article',         type:'conversation', xp:15 },
      { id:'a2u05l5', title:'Les achats: bilan',         type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u06', title:'Le Corps & La Santé', subtitle:'Body parts, health & the doctor',
    cefr:'A2', emoji:'🏥', color:C.A2, lessons:[
      { id:'a2u06l1', title:'Les parties du corps',      type:'vocab',        xp:15 },
      { id:'a2u06l2', title:'Chez le médecin',           type:'conversation', xp:15 },
      { id:'a2u06l3', title:'Les symptômes',             type:'vocab',        xp:15 },
      { id:'a2u06l4', title:'À la pharmacie',            type:'conversation', xp:15 },
      { id:'a2u06l5', title:'La santé: bilan',           type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u07', title:'Le Travail', subtitle:'Jobs, the workplace & career',
    cefr:'A2', emoji:'💼', color:C.A2, lessons:[
      { id:'a2u07l1', title:'Les métiers',               type:'vocab',        xp:15 },
      { id:'a2u07l2', title:'Mon travail',               type:'conversation', xp:15 },
      { id:'a2u07l3', title:'Au bureau',                 type:'conversation', xp:15 },
      { id:'a2u07l4', title:'Chercher un emploi',        type:'conversation', xp:15 },
      { id:'a2u07l5', title:'Le travail: bilan',         type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u08', title:'L\'École', subtitle:'School subjects, schedule & French education',
    cefr:'A2', emoji:'🎒', color:C.A2, lessons:[
      { id:'a2u08l1', title:'Les matières scolaires',    type:'vocab',        xp:15 },
      { id:'a2u08l2', title:'Mon emploi du temps',       type:'conversation', xp:15 },
      { id:'a2u08l3', title:'Notes & résultats',         type:'conversation', xp:15 },
      { id:'a2u08l4', title:'Le système scolaire français', type:'culture',   xp:15 },
      { id:'a2u08l5', title:'L\'école: bilan',           type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u09', title:'Les Émotions', subtitle:'Feelings, expressing emotions & empathy',
    cefr:'A2', emoji:'💛', color:C.A2, lessons:[
      { id:'a2u09l1', title:'Les sentiments',            type:'vocab',        xp:15 },
      { id:'a2u09l2', title:'Exprimer ses émotions',     type:'conversation', xp:15 },
      { id:'a2u09l3', title:'Réconforter quelqu\'un',    type:'conversation', xp:15 },
      { id:'a2u09l4', title:'Émotions & culture française', type:'culture',   xp:15 },
      { id:'a2u09l5', title:'Les émotions: bilan',       type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u10', title:'Les Loisirs', subtitle:'Sports, hobbies & free time',
    cefr:'A2', emoji:'⚽', color:C.A2, lessons:[
      { id:'a2u10l1', title:'Les sports',                type:'vocab',        xp:15 },
      { id:'a2u10l2', title:'Les hobbies',               type:'vocab',        xp:15 },
      { id:'a2u10l3', title:'Parler de ses loisirs',     type:'conversation', xp:15 },
      { id:'a2u10l4', title:'Invitations & sorties',     type:'conversation', xp:15 },
      { id:'a2u10l5', title:'Les loisirs: bilan',        type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u11', title:'La Nature', subtitle:'Landscapes, environment & outdoor France',
    cefr:'A2', emoji:'🌿', color:C.A2, lessons:[
      { id:'a2u11l1', title:'Les paysages',              type:'vocab',        xp:15 },
      { id:'a2u11l2', title:'La campagne française',     type:'culture',      xp:15 },
      { id:'a2u11l3', title:'L\'environnement',          type:'vocab',        xp:15 },
      { id:'a2u11l4', title:'Protéger la nature',        type:'conversation', xp:15 },
      { id:'a2u11l5', title:'La nature: bilan',          type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u12', title:'Les Vêtements', subtitle:'Clothing, fashion & French style',
    cefr:'A2', emoji:'👗', color:C.A2, lessons:[
      { id:'a2u12l1', title:'Les habits',                type:'vocab',        xp:15 },
      { id:'a2u12l2', title:'S\'habiller pour l\'occasion', type:'conversation', xp:15 },
      { id:'a2u12l3', title:'Les couleurs & la mode',    type:'conversation', xp:15 },
      { id:'a2u12l4', title:'La mode française',         type:'culture',      xp:15 },
      { id:'a2u12l5', title:'Les vêtements: bilan',      type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u13', title:'Le Logement', subtitle:'Housing, household chores & daily routine',
    cefr:'A2', emoji:'🏘️', color:C.A2, lessons:[
      { id:'a2u13l1', title:'Types d\'appartements',     type:'vocab',        xp:15 },
      { id:'a2u13l2', title:'Chercher un logement',      type:'conversation', xp:15 },
      { id:'a2u13l3', title:'Les tâches ménagères',      type:'vocab',        xp:15 },
      { id:'a2u13l4', title:'La vie quotidienne',        type:'conversation', xp:15 },
      { id:'a2u13l5', title:'Le logement: bilan',        type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u14', title:'Le Futur Proche', subtitle:'Near future — aller + infinitive',
    cefr:'A2', emoji:'🔮', color:C.A2, lessons:[
      { id:'a2u14l1', title:'Aller + infinitif',         type:'grammar',      xp:15 },
      { id:'a2u14l2', title:'Projets & intentions',      type:'conversation', xp:15 },
      { id:'a2u14l3', title:'Futur proche négatif',      type:'grammar',      xp:15 },
      { id:'a2u14l4', title:'Plans pour le week-end',    type:'conversation', xp:15 },
      { id:'a2u14l5', title:'Le futur proche: bilan',    type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u15', title:'Les Pronoms COD', subtitle:'Direct object pronouns — me, te, le, la, les',
    cefr:'A2', emoji:'🔄', color:C.A2, lessons:[
      { id:'a2u15l1', title:'Le, la, les',               type:'grammar',      xp:15 },
      { id:'a2u15l2', title:'Me, te, nous, vous',        type:'grammar',      xp:15 },
      { id:'a2u15l3', title:'Pronoms au passé composé',  type:'grammar',      xp:15 },
      { id:'a2u15l4', title:'Pronoms à l\'impératif',    type:'grammar',      xp:15 },
      { id:'a2u15l5', title:'Pronoms COD: bilan',        type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u16', title:'Les Adjectifs', subtitle:'Agreement, BAGS adjectives & irregular forms',
    cefr:'A2', emoji:'✏️', color:C.A2, lessons:[
      { id:'a2u16l1', title:'Accord en genre & nombre',  type:'grammar',      xp:15 },
      { id:'a2u16l2', title:'Adjectifs BAGS',            type:'grammar',      xp:15 },
      { id:'a2u16l3', title:'Adjectifs irréguliers',     type:'grammar',      xp:15 },
      { id:'a2u16l4', title:'Décrire les personnes',     type:'conversation', xp:15 },
      { id:'a2u16l5', title:'Les adjectifs: bilan',      type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u17', title:'Révision A2', subtitle:'Mid-level A2 checkpoint',
    cefr:'A2', emoji:'🌟', color:C.A2, lessons:[
      { id:'a2u17l1', title:'Vocabulaire A2',            type:'vocab',        xp:20 },
      { id:'a2u17l2', title:'Grammaire A2',              type:'grammar',      xp:20 },
      { id:'a2u17l3', title:'Conversation A2',           type:'conversation', xp:20 },
      { id:'a2u17l4', title:'Écoute A2',                 type:'listening',    xp:20 },
      { id:'a2u17l5', title:'Bilan A2',                  type:'review',       xp:30 },
    ]
  },
  // ── A2 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'a2u18', title:'Les Pronoms COI', subtitle:'Indirect object pronouns — lui, leur, me, te',
    cefr:'A2', emoji:'↩️', color:C.A2, lessons:[
      { id:'a2u18l1', title:'Lui & leur',                type:'grammar',      xp:15 },
      { id:'a2u18l2', title:'Me, te, nous, vous (COI)',  type:'grammar',      xp:15 },
      { id:'a2u18l3', title:'COD & COI ensemble',        type:'grammar',      xp:15 },
      { id:'a2u18l4', title:'Pronoms COI en contexte',   type:'conversation', xp:15 },
      { id:'a2u18l5', title:'Pronoms COI: bilan',        type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u19', title:'Les Verbes Pronominaux', subtitle:'Reflexive verbs — se lever, se coucher…',
    cefr:'A2', emoji:'🪞', color:C.A2, lessons:[
      { id:'a2u19l1', title:'Formation des pronominaux', type:'grammar',      xp:15 },
      { id:'a2u19l2', title:'Pronominaux de routine',    type:'vocab',        xp:15 },
      { id:'a2u19l3', title:'Au passé composé',          type:'grammar',      xp:15 },
      { id:'a2u19l4', title:'Pronominaux réciproques',   type:'grammar',      xp:15 },
      { id:'a2u19l5', title:'Verbes pronominaux: bilan', type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u20', title:'Le Futur Simple', subtitle:'Simple future — -rai, -ras, -ra, -rons, -rez, -ront',
    cefr:'A2', emoji:'🚀', color:C.A2, lessons:[
      { id:'a2u20l1', title:'Formation du futur simple', type:'grammar',      xp:15 },
      { id:'a2u20l2', title:'Futur simples irréguliers', type:'grammar',      xp:15 },
      { id:'a2u20l3', title:'Promesses & prédictions',   type:'conversation', xp:15 },
      { id:'a2u20l4', title:'Futur proche vs futur simple', type:'grammar',   xp:15 },
      { id:'a2u20l5', title:'Le futur simple: bilan',    type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u21', title:'L\'Impératif', subtitle:'Commands, instructions & recipes',
    cefr:'A2', emoji:'📢', color:C.A2, lessons:[
      { id:'a2u21l1', title:'Impératif présent',         type:'grammar',      xp:15 },
      { id:'a2u21l2', title:'Impératif irrégulier',      type:'grammar',      xp:15 },
      { id:'a2u21l3', title:'Impératif négatif',         type:'grammar',      xp:15 },
      { id:'a2u21l4', title:'Recettes & instructions',   type:'conversation', xp:15 },
      { id:'a2u21l5', title:'L\'impératif: bilan',       type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u22', title:'Les Adverbes', subtitle:'Adverb formation, placement & common adverbs',
    cefr:'A2', emoji:'📈', color:C.A2, lessons:[
      { id:'a2u22l1', title:'Adverbes en -ment',         type:'grammar',      xp:15 },
      { id:'a2u22l2', title:'Adverbes de fréquence',     type:'vocab',        xp:15 },
      { id:'a2u22l3', title:'Adverbes de temps & lieu',  type:'vocab',        xp:15 },
      { id:'a2u22l4', title:'Placement des adverbes',    type:'grammar',      xp:15 },
      { id:'a2u22l5', title:'Les adverbes: bilan',       type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u23', title:'La Négation Avancée', subtitle:'Ne…plus, ne…jamais, ne…rien, ne…personne',
    cefr:'A2', emoji:'🔇', color:C.A2, lessons:[
      { id:'a2u23l1', title:'Ne…plus (no more)',         type:'grammar',      xp:15 },
      { id:'a2u23l2', title:'Ne…jamais (never)',         type:'grammar',      xp:15 },
      { id:'a2u23l3', title:'Ne…rien / ne…personne',    type:'grammar',      xp:15 },
      { id:'a2u23l4', title:'Négations multiples',       type:'conversation', xp:15 },
      { id:'a2u23l5', title:'Négation avancée: bilan',   type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u24', title:'Les Expressions de Temps', subtitle:'Depuis, pendant, il y a & time markers',
    cefr:'A2', emoji:'⏱️', color:C.A2, lessons:[
      { id:'a2u24l1', title:'Depuis + présent',          type:'grammar',      xp:15 },
      { id:'a2u24l2', title:'Il y a + passé composé',    type:'grammar',      xp:15 },
      { id:'a2u24l3', title:'Pendant & pour',            type:'grammar',      xp:15 },
      { id:'a2u24l4', title:'Situer dans le temps',      type:'conversation', xp:15 },
      { id:'a2u24l5', title:'Expressions de temps: bilan', type:'review',     xp:20 },
    ]
  },
  {
    id:'a2u25', title:'Au Téléphone', subtitle:'Phone calls, appointments & voicemail',
    cefr:'A2', emoji:'📱', color:C.A2, lessons:[
      { id:'a2u25l1', title:'Décrocher & raccrocher',    type:'vocab',        xp:15 },
      { id:'a2u25l2', title:'Laisser un message',        type:'conversation', xp:15 },
      { id:'a2u25l3', title:'Prendre un rendez-vous',    type:'listening',    xp:15 },
      { id:'a2u25l4', title:'Problèmes de réseau',       type:'conversation', xp:15 },
      { id:'a2u25l5', title:'Au téléphone: bilan',       type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u26', title:'La Banque & L\'Argent', subtitle:'Banking, money & financial vocabulary',
    cefr:'A2', emoji:'🏦', color:C.A2, lessons:[
      { id:'a2u26l1', title:'Les billets & pièces',      type:'vocab',        xp:15 },
      { id:'a2u26l2', title:'À la banque',               type:'conversation', xp:15 },
      { id:'a2u26l3', title:'Payer & retirer',           type:'conversation', xp:15 },
      { id:'a2u26l4', title:'Budget & dépenses',         type:'vocab',        xp:15 },
      { id:'a2u26l5', title:'La banque: bilan',          type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u27', title:'Les Médias', subtitle:'TV, radio, press & social media',
    cefr:'A2', emoji:'📺', color:C.A2, lessons:[
      { id:'a2u27l1', title:'La télévision française',   type:'vocab',        xp:15 },
      { id:'a2u27l2', title:'La radio & les podcasts',   type:'listening',    xp:15 },
      { id:'a2u27l3', title:'Les journaux',              type:'vocab',        xp:15 },
      { id:'a2u27l4', title:'Les réseaux sociaux (A2)',  type:'conversation', xp:15 },
      { id:'a2u27l5', title:'Les médias: bilan',         type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u28', title:'La Cuisine Française', subtitle:'Cooking verbs, recipes & French dishes',
    cefr:'A2', emoji:'👨‍🍳', color:C.A2, lessons:[
      { id:'a2u28l1', title:'Les verbes de cuisine',     type:'vocab',        xp:15 },
      { id:'a2u28l2', title:'Une recette simple',        type:'listening',    xp:15 },
      { id:'a2u28l3', title:'Les plats régionaux',       type:'culture',      xp:15 },
      { id:'a2u28l4', title:'Partager une recette',      type:'conversation', xp:15 },
      { id:'a2u28l5', title:'La cuisine: bilan',         type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u29', title:'Les Fêtes & Traditions', subtitle:'French holidays, customs & celebrations',
    cefr:'A2', emoji:'🎉', color:C.A2, lessons:[
      { id:'a2u29l1', title:'Noël & Pâques',             type:'culture',      xp:15 },
      { id:'a2u29l2', title:'Le 14 juillet',             type:'culture',      xp:15 },
      { id:'a2u29l3', title:'Fêtes régionales',          type:'vocab',        xp:15 },
      { id:'a2u29l4', title:'Souhaiter & féliciter',     type:'conversation', xp:15 },
      { id:'a2u29l5', title:'Les fêtes: bilan',          type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u30', title:'Les Verbes Irréguliers', subtitle:'Venir, voir, prendre, savoir & more',
    cefr:'A2', emoji:'⚠️', color:C.A2, lessons:[
      { id:'a2u30l1', title:'Venir, tenir & dérivés',    type:'grammar',      xp:15 },
      { id:'a2u30l2', title:'Voir, croire & dérivés',    type:'grammar',      xp:15 },
      { id:'a2u30l3', title:'Prendre, mettre & dérivés', type:'grammar',      xp:15 },
      { id:'a2u30l4', title:'Savoir, connaître, pouvoir', type:'grammar',     xp:15 },
      { id:'a2u30l5', title:'Irréguliers: bilan',        type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u31', title:'En Ville', subtitle:'Urban life, city services & civic vocabulary',
    cefr:'A2', emoji:'🏙️', color:C.A2, lessons:[
      { id:'a2u31l1', title:'Les services publics',      type:'vocab',        xp:15 },
      { id:'a2u31l2', title:'À la mairie',               type:'conversation', xp:15 },
      { id:'a2u31l3', title:'Les quartiers',             type:'vocab',        xp:15 },
      { id:'a2u31l4', title:'La vie urbaine',            type:'listening',    xp:15 },
      { id:'a2u31l5', title:'En ville: bilan',           type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u32', title:'La Santé Avancée', subtitle:'Symptoms, prescriptions & lifestyle health',
    cefr:'A2', emoji:'💊', color:C.A2, lessons:[
      { id:'a2u32l1', title:'Maladies courantes',        type:'vocab',        xp:15 },
      { id:'a2u32l2', title:'L\'ordonnance',             type:'conversation', xp:15 },
      { id:'a2u32l3', title:'Alimentation & santé',      type:'conversation', xp:15 },
      { id:'a2u32l4', title:'Sport & bien-être',         type:'listening',    xp:15 },
      { id:'a2u32l5', title:'Santé avancée: bilan',      type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u33', title:'Les Relations Sociales', subtitle:'Friendships, social norms & French etiquette',
    cefr:'A2', emoji:'🤗', color:C.A2, lessons:[
      { id:'a2u33l1', title:'Faire connaissance',        type:'conversation', xp:15 },
      { id:'a2u33l2', title:'L\'amitié en France',       type:'culture',      xp:15 },
      { id:'a2u33l3', title:'La bise & les codes',       type:'culture',      xp:15 },
      { id:'a2u33l4', title:'Invitations & refus polis', type:'conversation', xp:15 },
      { id:'a2u33l5', title:'Relations sociales: bilan', type:'review',       xp:20 },
    ]
  },
  {
    id:'a2u34', title:'Révision A2 Avancée', subtitle:'Full A2 mastery — elementary speaker confirmed',
    cefr:'A2', emoji:'🏅', color:C.A2, lessons:[
      { id:'a2u34l1', title:'Grand vocabulaire A2',      type:'vocab',        xp:25 },
      { id:'a2u34l2', title:'Grande grammaire A2',       type:'grammar',      xp:25 },
      { id:'a2u34l3', title:'Grande conversation A2',    type:'conversation', xp:25 },
      { id:'a2u34l4', title:'Grande écoute A2',          type:'listening',    xp:25 },
      { id:'a2u34l5', title:'Grand bilan A2',            type:'review',       xp:35 },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  B1 — L'Autonomie  (26 units × 5 lessons = 130 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'b1u01', title:'Le Conditionnel', subtitle:'Polite requests, hypotheticals & reported speech',
    cefr:'B1', emoji:'🤔', color:C.B1, lessons:[
      { id:'b1u01l1', title:'Formation du conditionnel', type:'grammar',      xp:20 },
      { id:'b1u01l2', title:'Requêtes polies',           type:'conversation', xp:20 },
      { id:'b1u01l3', title:'Si + imparfait + conditionnel', type:'grammar',  xp:20 },
      { id:'b1u01l4', title:'Discours rapporté',         type:'grammar',      xp:20 },
      { id:'b1u01l5', title:'Le conditionnel: bilan',    type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u02', title:'Le Subjonctif', subtitle:'Doubt, emotion, necessity & wishes',
    cefr:'B1', emoji:'💭', color:C.B1, lessons:[
      { id:'b1u02l1', title:'Formation du subjonctif',   type:'grammar',      xp:20 },
      { id:'b1u02l2', title:'Il faut que & vouloir que', type:'grammar',      xp:20 },
      { id:'b1u02l3', title:'Expressions d\'émotion',    type:'grammar',      xp:20 },
      { id:'b1u02l4', title:'Subjonctif irrégulier',     type:'grammar',      xp:20 },
      { id:'b1u02l5', title:'Le subjonctif: bilan',      type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u03', title:'Exprimer des Opinions', subtitle:'Giving views, agreeing & disagreeing',
    cefr:'B1', emoji:'🗣️', color:C.B1, lessons:[
      { id:'b1u03l1', title:'Donner son avis',           type:'conversation', xp:20 },
      { id:'b1u03l2', title:'Nuancer son propos',        type:'vocab',        xp:20 },
      { id:'b1u03l3', title:'Accord & désaccord',        type:'conversation', xp:20 },
      { id:'b1u03l4', title:'Débattre poliment',         type:'conversation', xp:20 },
      { id:'b1u03l5', title:'Les opinions: bilan',       type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u04', title:'La Presse Française', subtitle:'News, media & current events',
    cefr:'B1', emoji:'📰', color:C.B1, lessons:[
      { id:'b1u04l1', title:'Lire un article de presse', type:'listening',    xp:20 },
      { id:'b1u04l2', title:'Le journal télévisé',       type:'listening',    xp:20 },
      { id:'b1u04l3', title:'Gros titres & manchettes',  type:'vocab',        xp:20 },
      { id:'b1u04l4', title:'Actualités françaises',     type:'culture',      xp:20 },
      { id:'b1u04l5', title:'La presse: bilan',          type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u05', title:'Le Débat', subtitle:'Structuring arguments & logical connectors',
    cefr:'B1', emoji:'⚖️', color:C.B1, lessons:[
      { id:'b1u05l1', title:'Structurer un argument',    type:'conversation', xp:20 },
      { id:'b1u05l2', title:'Connecteurs logiques',      type:'grammar',      xp:20 },
      { id:'b1u05l3', title:'Défendre une position',     type:'conversation', xp:20 },
      { id:'b1u05l4', title:'Réfuter un argument',       type:'conversation', xp:20 },
      { id:'b1u05l5', title:'Le débat: bilan',           type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u06', title:'Les Pronoms Y & En', subtitle:'Advanced pronouns — replace à and de + noun',
    cefr:'B1', emoji:'🔀', color:C.B1, lessons:[
      { id:'b1u06l1', title:'Y — lieu & abstrait',       type:'grammar',      xp:20 },
      { id:'b1u06l2', title:'En — de + nom',             type:'grammar',      xp:20 },
      { id:'b1u06l3', title:'Y & En à l\'impératif',     type:'grammar',      xp:20 },
      { id:'b1u06l4', title:'Ordre des pronoms',         type:'grammar',      xp:20 },
      { id:'b1u06l5', title:'Y & En: bilan',             type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u07', title:'Les Pronoms Relatifs', subtitle:'Qui, que, où, dont & ce qui / ce que',
    cefr:'B1', emoji:'🔗', color:C.B1, lessons:[
      { id:'b1u07l1', title:'Qui & que',                 type:'grammar',      xp:20 },
      { id:'b1u07l2', title:'Où',                        type:'grammar',      xp:20 },
      { id:'b1u07l3', title:'Dont',                      type:'grammar',      xp:20 },
      { id:'b1u07l4', title:'Ce qui & ce que',           type:'grammar',      xp:20 },
      { id:'b1u07l5', title:'Pronoms relatifs: bilan',   type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u08', title:'La Comparaison', subtitle:'Comparatives, superlatives & irregular forms',
    cefr:'B1', emoji:'📊', color:C.B1, lessons:[
      { id:'b1u08l1', title:'Comparatifs',               type:'grammar',      xp:20 },
      { id:'b1u08l2', title:'Superlatifs',               type:'grammar',      xp:20 },
      { id:'b1u08l3', title:'Bon / meilleur / mieux',    type:'grammar',      xp:20 },
      { id:'b1u08l4', title:'Comparaisons culturelles',  type:'conversation', xp:20 },
      { id:'b1u08l5', title:'La comparaison: bilan',     type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u09', title:'Les Voyages', subtitle:'Planning trips, hotels & problem-solving',
    cefr:'B1', emoji:'✈️', color:C.B1, lessons:[
      { id:'b1u09l1', title:'Planifier un voyage',       type:'conversation', xp:20 },
      { id:'b1u09l2', title:'À l\'hôtel',               type:'conversation', xp:20 },
      { id:'b1u09l3', title:'Voyager en France',         type:'culture',      xp:20 },
      { id:'b1u09l4', title:'Résoudre un problème',      type:'conversation', xp:20 },
      { id:'b1u09l5', title:'Les voyages: bilan',        type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u10', title:'La Vie Sociale', subtitle:'Relationships, invitations & French etiquette',
    cefr:'B1', emoji:'🤝', color:C.B1, lessons:[
      { id:'b1u10l1', title:'Les relations',             type:'vocab',        xp:20 },
      { id:'b1u10l2', title:'Invitations formelles',     type:'conversation', xp:20 },
      { id:'b1u10l3', title:'Exprimer la gratitude',     type:'conversation', xp:20 },
      { id:'b1u10l4', title:'Politesse & culture',       type:'culture',      xp:20 },
      { id:'b1u10l5', title:'La vie sociale: bilan',     type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u11', title:'Le Monde du Travail', subtitle:'Professional French, emails & interviews',
    cefr:'B1', emoji:'📋', color:C.B1, lessons:[
      { id:'b1u11l1', title:'L\'entretien d\'embauche',  type:'conversation', xp:20 },
      { id:'b1u11l2', title:'Email professionnel',       type:'grammar',      xp:20 },
      { id:'b1u11l3', title:'Réunions & présentations',  type:'conversation', xp:20 },
      { id:'b1u11l4', title:'Le monde des affaires',     type:'vocab',        xp:20 },
      { id:'b1u11l5', title:'Le travail avancé: bilan',  type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u12', title:'La Technologie', subtitle:'Internet, devices & digital France',
    cefr:'B1', emoji:'💻', color:C.B1, lessons:[
      { id:'b1u12l1', title:'Internet & les réseaux',    type:'vocab',        xp:20 },
      { id:'b1u12l2', title:'Appareils électroniques',   type:'vocab',        xp:20 },
      { id:'b1u12l3', title:'Les médias sociaux',        type:'conversation', xp:20 },
      { id:'b1u12l4', title:'Le numérique en France',    type:'culture',      xp:20 },
      { id:'b1u12l5', title:'La technologie: bilan',     type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u13', title:'Révision B1', subtitle:'Mid-level B1 checkpoint',
    cefr:'B1', emoji:'🌟', color:C.B1, lessons:[
      { id:'b1u13l1', title:'Vocabulaire B1',            type:'vocab',        xp:25 },
      { id:'b1u13l2', title:'Grammaire B1',              type:'grammar',      xp:25 },
      { id:'b1u13l3', title:'Conversation B1',           type:'conversation', xp:25 },
      { id:'b1u13l4', title:'Écoute B1',                 type:'listening',    xp:25 },
      { id:'b1u13l5', title:'Bilan B1',                  type:'review',       xp:35 },
    ]
  },
  // ── B1 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'b1u14', title:'Le Plus-que-parfait', subtitle:'Pluperfect — actions before another past action',
    cefr:'B1', emoji:'⏮️', color:C.B1, lessons:[
      { id:'b1u14l1', title:'Formation du PQP',          type:'grammar',      xp:20 },
      { id:'b1u14l2', title:'PQP avec être & avoir',     type:'grammar',      xp:20 },
      { id:'b1u14l3', title:'PQP & passé composé',       type:'grammar',      xp:20 },
      { id:'b1u14l4', title:'Narrer au passé',           type:'conversation', xp:20 },
      { id:'b1u14l5', title:'Plus-que-parfait: bilan',   type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u15', title:'Le Futur Antérieur', subtitle:'Future perfect — will have done',
    cefr:'B1', emoji:'⏭️', color:C.B1, lessons:[
      { id:'b1u15l1', title:'Formation du futur antérieur', type:'grammar',   xp:20 },
      { id:'b1u15l2', title:'Quand + futur antérieur',   type:'grammar',      xp:20 },
      { id:'b1u15l3', title:'Futur ant. vs futur simple', type:'grammar',     xp:20 },
      { id:'b1u15l4', title:'Futur antérieur en contexte', type:'conversation',xp:20 },
      { id:'b1u15l5', title:'Futur antérieur: bilan',    type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u16', title:'Les Pronoms Démonstratifs', subtitle:'Celui, celle, ceux, celles & ça',
    cefr:'B1', emoji:'👆', color:C.B1, lessons:[
      { id:'b1u16l1', title:'Celui-ci & celui-là',       type:'grammar',      xp:20 },
      { id:'b1u16l2', title:'Celui qui / que / dont',    type:'grammar',      xp:20 },
      { id:'b1u16l3', title:'Ça & ce',                   type:'grammar',      xp:20 },
      { id:'b1u16l4', title:'Démonstratifs en contexte', type:'conversation', xp:20 },
      { id:'b1u16l5', title:'Pronoms démonstr.: bilan',  type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u17', title:'Les Pronoms Possessifs', subtitle:'Le mien, la tienne, les nôtres…',
    cefr:'B1', emoji:'🏷️', color:C.B1, lessons:[
      { id:'b1u17l1', title:'Le mien / la mienne',       type:'grammar',      xp:20 },
      { id:'b1u17l2', title:'Le tien, le sien',          type:'grammar',      xp:20 },
      { id:'b1u17l3', title:'Le nôtre, le vôtre, le leur', type:'grammar',    xp:20 },
      { id:'b1u17l4', title:'Possessifs en contexte',    type:'conversation', xp:20 },
      { id:'b1u17l5', title:'Pronoms possessifs: bilan', type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u18', title:'L\'Expression de la Cause', subtitle:'Parce que, puisque, car, comme…',
    cefr:'B1', emoji:'🔎', color:C.B1, lessons:[
      { id:'b1u18l1', title:'Parce que & car',           type:'grammar',      xp:20 },
      { id:'b1u18l2', title:'Puisque & comme',           type:'grammar',      xp:20 },
      { id:'b1u18l3', title:'À cause de & grâce à',     type:'grammar',      xp:20 },
      { id:'b1u18l4', title:'Exprimer la cause',         type:'conversation', xp:20 },
      { id:'b1u18l5', title:'Expression de la cause: bilan', type:'review',   xp:25 },
    ]
  },
  {
    id:'b1u19', title:'L\'Expression de la Conséquence', subtitle:'Donc, alors, ainsi, c\'est pourquoi',
    cefr:'B1', emoji:'➡️', color:C.B1, lessons:[
      { id:'b1u19l1', title:'Donc & alors',              type:'grammar',      xp:20 },
      { id:'b1u19l2', title:'Ainsi & c\'est pourquoi',   type:'grammar',      xp:20 },
      { id:'b1u19l3', title:'Si bien que & de sorte que', type:'grammar',     xp:20 },
      { id:'b1u19l4', title:'Exprimer la conséquence',   type:'conversation', xp:20 },
      { id:'b1u19l5', title:'Conséquence: bilan',        type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u20', title:'L\'Expression du But', subtitle:'Pour, afin de, pour que, afin que',
    cefr:'B1', emoji:'🎯', color:C.B1, lessons:[
      { id:'b1u20l1', title:'Pour + infinitif',          type:'grammar',      xp:20 },
      { id:'b1u20l2', title:'Pour que + subjonctif',     type:'grammar',      xp:20 },
      { id:'b1u20l3', title:'Afin de / afin que',        type:'grammar',      xp:20 },
      { id:'b1u20l4', title:'Exprimer le but',           type:'conversation', xp:20 },
      { id:'b1u20l5', title:'Expression du but: bilan',  type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u21', title:'L\'Expression de la Concession', subtitle:'Bien que, quoique, même si, pourtant',
    cefr:'B1', emoji:'🔄', color:C.B1, lessons:[
      { id:'b1u21l1', title:'Bien que + subjonctif',     type:'grammar',      xp:20 },
      { id:'b1u21l2', title:'Même si + indicatif',       type:'grammar',      xp:20 },
      { id:'b1u21l3', title:'Pourtant, cependant, néanmoins', type:'grammar', xp:20 },
      { id:'b1u21l4', title:'Exprimer la concession',    type:'conversation', xp:20 },
      { id:'b1u21l5', title:'Concession: bilan',         type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u22', title:'L\'Environnement', subtitle:'Ecology, climate & sustainability',
    cefr:'B1', emoji:'🌱', color:C.B1, lessons:[
      { id:'b1u22l1', title:'Le changement climatique',  type:'vocab',        xp:20 },
      { id:'b1u22l2', title:'Les énergies renouvelables', type:'vocab',       xp:20 },
      { id:'b1u22l3', title:'Recyclage & éco-gestes',    type:'conversation', xp:20 },
      { id:'b1u22l4', title:'La France verte',           type:'culture',      xp:20 },
      { id:'b1u22l5', title:'L\'environnement: bilan',   type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u23', title:'Les Sciences', subtitle:'Science vocabulary, research & innovation',
    cefr:'B1', emoji:'🔬', color:C.B1, lessons:[
      { id:'b1u23l1', title:'Les disciplines scientifiques', type:'vocab',    xp:20 },
      { id:'b1u23l2', title:'La recherche en France',    type:'culture',      xp:20 },
      { id:'b1u23l3', title:'Découvertes & inventions',  type:'listening',    xp:20 },
      { id:'b1u23l4', title:'Débattre de la science',    type:'conversation', xp:20 },
      { id:'b1u23l5', title:'Les sciences: bilan',       type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u24', title:'La Géographie de la France', subtitle:'Regions, cities & French landscapes',
    cefr:'B1', emoji:'🗾', color:C.B1, lessons:[
      { id:'b1u24l1', title:'Les régions françaises',    type:'culture',      xp:20 },
      { id:'b1u24l2', title:'Les grands fleuves & montagnes', type:'vocab',   xp:20 },
      { id:'b1u24l3', title:'Les DOM-TOM',               type:'culture',      xp:20 },
      { id:'b1u24l4', title:'Voyager en régions',        type:'conversation', xp:20 },
      { id:'b1u24l5', title:'Géographie: bilan',         type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u25', title:'La Cuisine Avancée', subtitle:'Advanced gastronomy, Michelin & wine',
    cefr:'B1', emoji:'🍷', color:C.B1, lessons:[
      { id:'b1u25l1', title:'La haute cuisine française', type:'culture',     xp:20 },
      { id:'b1u25l2', title:'Le vin & les fromages',     type:'culture',      xp:20 },
      { id:'b1u25l3', title:'Critiquer un plat',         type:'conversation', xp:20 },
      { id:'b1u25l4', title:'Gastronomie en contexte',   type:'listening',    xp:20 },
      { id:'b1u25l5', title:'Cuisine avancée: bilan',    type:'review',       xp:25 },
    ]
  },
  {
    id:'b1u26', title:'Révision B1 Avancée', subtitle:'Full B1 mastery — independent speaker confirmed',
    cefr:'B1', emoji:'🏅', color:C.B1, lessons:[
      { id:'b1u26l1', title:'Grand vocabulaire B1',      type:'vocab',        xp:30 },
      { id:'b1u26l2', title:'Grande grammaire B1',       type:'grammar',      xp:30 },
      { id:'b1u26l3', title:'Grande conversation B1',    type:'conversation', xp:30 },
      { id:'b1u26l4', title:'Grande écoute B1',          type:'listening',    xp:30 },
      { id:'b1u26l5', title:'Grand bilan B1',            type:'review',       xp:40 },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  B2 — La Maîtrise  (22 units × 5 lessons = 110 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'b2u01', title:'Les Registres de Langue', subtitle:'Formal, informal & literary registers',
    cefr:'B2', emoji:'🎭', color:C.B2, lessons:[
      { id:'b2u01l1', title:'Langue formelle',           type:'grammar',      xp:25 },
      { id:'b2u01l2', title:'Langue familière',          type:'vocab',        xp:25 },
      { id:'b2u01l3', title:'Langue soutenue',           type:'grammar',      xp:25 },
      { id:'b2u01l4', title:'Registres en contexte',     type:'conversation', xp:25 },
      { id:'b2u01l5', title:'Les registres: bilan',      type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u02', title:'La Littérature Française', subtitle:'Major authors, texts & literary analysis',
    cefr:'B2', emoji:'📚', color:C.B2, lessons:[
      { id:'b2u02l1', title:'Les grands auteurs',        type:'culture',      xp:25 },
      { id:'b2u02l2', title:'Analyser un texte',         type:'listening',    xp:25 },
      { id:'b2u02l3', title:'Le roman français',         type:'culture',      xp:25 },
      { id:'b2u02l4', title:'Extraits choisis',          type:'listening',    xp:25 },
      { id:'b2u02l5', title:'La littérature: bilan',     type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u03', title:'L\'Argot & Le Verlan', subtitle:'Slang, verlan & youth language',
    cefr:'B2', emoji:'🔥', color:C.B2, lessons:[
      { id:'b2u03l1', title:'L\'argot courant',          type:'vocab',        xp:25 },
      { id:'b2u03l2', title:'Le verlan',                 type:'vocab',        xp:25 },
      { id:'b2u03l3', title:'Expressions idiomatiques',  type:'vocab',        xp:25 },
      { id:'b2u03l4', title:'La langue des jeunes',      type:'conversation', xp:25 },
      { id:'b2u03l5', title:'L\'argot: bilan',           type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u04', title:'La Philosophie', subtitle:'Abstract debate & French philosophical tradition',
    cefr:'B2', emoji:'🧠', color:C.B2, lessons:[
      { id:'b2u04l1', title:'Les grands philosophes',    type:'culture',      xp:25 },
      { id:'b2u04l2', title:'Débat philosophique',       type:'conversation', xp:25 },
      { id:'b2u04l3', title:'La philosophie française',  type:'culture',      xp:25 },
      { id:'b2u04l4', title:'Argumentation abstraite',   type:'conversation', xp:25 },
      { id:'b2u04l5', title:'La philosophie: bilan',     type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u05', title:'L\'Art & Le Cinéma', subtitle:'Film, contemporary art & cultural critique',
    cefr:'B2', emoji:'🎬', color:C.B2, lessons:[
      { id:'b2u05l1', title:'Le cinéma français',        type:'culture',      xp:25 },
      { id:'b2u05l2', title:'Analyser un film',          type:'conversation', xp:25 },
      { id:'b2u05l3', title:'L\'art contemporain',       type:'vocab',        xp:25 },
      { id:'b2u05l4', title:'Critique culturelle',       type:'conversation', xp:25 },
      { id:'b2u05l5', title:'L\'art & le cinéma: bilan', type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u06', title:'L\'Histoire de France', subtitle:'Revolution, Empire, Republic & modern France',
    cefr:'B2', emoji:'⚜️', color:C.B2, lessons:[
      { id:'b2u06l1', title:'Les grands événements',     type:'culture',      xp:25 },
      { id:'b2u06l2', title:'La Révolution française',   type:'culture',      xp:25 },
      { id:'b2u06l3', title:'La France moderne',         type:'culture',      xp:25 },
      { id:'b2u06l4', title:'Histoire & identité',       type:'conversation', xp:25 },
      { id:'b2u06l5', title:'L\'histoire: bilan',        type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u07', title:'Le Passé Simple', subtitle:'Literary past — reading classic French',
    cefr:'B2', emoji:'🖋️', color:C.B2, lessons:[
      { id:'b2u07l1', title:'Reconnaître le passé simple', type:'grammar',    xp:25 },
      { id:'b2u07l2', title:'Formes régulières',         type:'grammar',      xp:25 },
      { id:'b2u07l3', title:'Formes irrégulières',       type:'grammar',      xp:25 },
      { id:'b2u07l4', title:'Lire la littérature classique', type:'listening', xp:25 },
      { id:'b2u07l5', title:'Le passé simple: bilan',    type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u08', title:'Le Subjonctif Passé', subtitle:'Past subjunctive for completed actions',
    cefr:'B2', emoji:'⏳', color:C.B2, lessons:[
      { id:'b2u08l1', title:'Formation du subjonctif passé', type:'grammar',  xp:25 },
      { id:'b2u08l2', title:'Emplois du subjonctif passé', type:'grammar',    xp:25 },
      { id:'b2u08l3', title:'Bien que + subjonctif passé', type:'grammar',    xp:25 },
      { id:'b2u08l4', title:'Pratique du subjonctif passé', type:'conversation', xp:25 },
      { id:'b2u08l5', title:'Subjonctif passé: bilan',   type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u09', title:'Le Gérondif', subtitle:'En + present participle — while/by doing',
    cefr:'B2', emoji:'🔁', color:C.B2, lessons:[
      { id:'b2u09l1', title:'Formation du gérondif',     type:'grammar',      xp:25 },
      { id:'b2u09l2', title:'Simultanéité & manière',    type:'grammar',      xp:25 },
      { id:'b2u09l3', title:'Gérondif vs participe présent', type:'grammar',  xp:25 },
      { id:'b2u09l4', title:'Gérondif en contexte',      type:'conversation', xp:25 },
      { id:'b2u09l5', title:'Le gérondif: bilan',        type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u10', title:'La Politique', subtitle:'French institutions, political vocabulary & Europe',
    cefr:'B2', emoji:'🏛️', color:C.B2, lessons:[
      { id:'b2u10l1', title:'Les institutions françaises', type:'culture',    xp:25 },
      { id:'b2u10l2', title:'Vocabulaire politique',      type:'vocab',        xp:25 },
      { id:'b2u10l3', title:'Débat politique',           type:'conversation', xp:25 },
      { id:'b2u10l4', title:'La France & l\'Europe',     type:'culture',      xp:25 },
      { id:'b2u10l5', title:'La politique: bilan',       type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u11', title:'Révision B2', subtitle:'Mid-level B2 checkpoint',
    cefr:'B2', emoji:'🌟', color:C.B2, lessons:[
      { id:'b2u11l1', title:'Vocabulaire B2',            type:'vocab',        xp:30 },
      { id:'b2u11l2', title:'Grammaire B2',              type:'grammar',      xp:30 },
      { id:'b2u11l3', title:'Conversation B2',           type:'conversation', xp:30 },
      { id:'b2u11l4', title:'Écoute B2',                 type:'listening',    xp:30 },
      { id:'b2u11l5', title:'Bilan B2',                  type:'review',       xp:40 },
    ]
  },
  // ── B2 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'b2u12', title:'Le Conditionnel Passé', subtitle:'Past conditional — would have done',
    cefr:'B2', emoji:'🔙', color:C.B2, lessons:[
      { id:'b2u12l1', title:'Formation du cond. passé',  type:'grammar',      xp:25 },
      { id:'b2u12l2', title:'Si + PQP + cond. passé',   type:'grammar',      xp:25 },
      { id:'b2u12l3', title:'Regrets & reproches',       type:'conversation', xp:25 },
      { id:'b2u12l4', title:'Cond. passé en contexte',   type:'grammar',      xp:25 },
      { id:'b2u12l5', title:'Conditionnel passé: bilan', type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u13', title:'La Voix Passive', subtitle:'Passive constructions — être + participe passé',
    cefr:'B2', emoji:'🔃', color:C.B2, lessons:[
      { id:'b2u13l1', title:'Formation du passif',       type:'grammar',      xp:25 },
      { id:'b2u13l2', title:'Passif à tous les temps',   type:'grammar',      xp:25 },
      { id:'b2u13l3', title:'On vs le passif',           type:'grammar',      xp:25 },
      { id:'b2u13l4', title:'Passif en contexte',        type:'conversation', xp:25 },
      { id:'b2u13l5', title:'Voix passive: bilan',       type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u14', title:'Les Gallicismes', subtitle:'French idioms, fixed phrases & false friends',
    cefr:'B2', emoji:'💡', color:C.B2, lessons:[
      { id:'b2u14l1', title:'Gallicismes courants',      type:'vocab',        xp:25 },
      { id:'b2u14l2', title:'Faux amis (false friends)', type:'vocab',        xp:25 },
      { id:'b2u14l3', title:'Expressions figées',        type:'vocab',        xp:25 },
      { id:'b2u14l4', title:'Gallicismes en contexte',   type:'conversation', xp:25 },
      { id:'b2u14l5', title:'Les gallicismes: bilan',    type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u15', title:'La Sociologie', subtitle:'Society, inequality & sociological vocabulary',
    cefr:'B2', emoji:'👥', color:C.B2, lessons:[
      { id:'b2u15l1', title:'La société française',      type:'culture',      xp:25 },
      { id:'b2u15l2', title:'Les inégalités sociales',   type:'vocab',        xp:25 },
      { id:'b2u15l3', title:'Immigration & intégration', type:'conversation', xp:25 },
      { id:'b2u15l4', title:'Analyser la société',       type:'listening',    xp:25 },
      { id:'b2u15l5', title:'La sociologie: bilan',      type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u16', title:'L\'Économie', subtitle:'Economic concepts, globalization & French economy',
    cefr:'B2', emoji:'📈', color:C.B2, lessons:[
      { id:'b2u16l1', title:'L\'économie française',     type:'culture',      xp:25 },
      { id:'b2u16l2', title:'Vocabulaire économique',    type:'vocab',        xp:25 },
      { id:'b2u16l3', title:'La mondialisation',         type:'conversation', xp:25 },
      { id:'b2u16l4', title:'Débat économique',          type:'listening',    xp:25 },
      { id:'b2u16l5', title:'L\'économie: bilan',        type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u17', title:'La France Francophone', subtitle:'Québec, Afrique, Antilles & the wider French world',
    cefr:'B2', emoji:'🌐', color:C.B2, lessons:[
      { id:'b2u17l1', title:'Le Québec & le Canada',     type:'culture',      xp:25 },
      { id:'b2u17l2', title:'L\'Afrique francophone',    type:'culture',      xp:25 },
      { id:'b2u17l3', title:'Les Antilles françaises',   type:'culture',      xp:25 },
      { id:'b2u17l4', title:'Accents & variétés',        type:'listening',    xp:25 },
      { id:'b2u17l5', title:'Monde francophone: bilan',  type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u18', title:'Les Proverbes Français', subtitle:'Proverbs, sayings & fixed expressions',
    cefr:'B2', emoji:'📜', color:C.B2, lessons:[
      { id:'b2u18l1', title:'Proverbes du quotidien',    type:'vocab',        xp:25 },
      { id:'b2u18l2', title:'Proverbes de sagesse',      type:'culture',      xp:25 },
      { id:'b2u18l3', title:'Expressions proverbiales',  type:'vocab',        xp:25 },
      { id:'b2u18l4', title:'Proverbes en contexte',     type:'conversation', xp:25 },
      { id:'b2u18l5', title:'Les proverbes: bilan',      type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u19', title:'Le Théâtre', subtitle:'Drama, performing arts & theatrical vocabulary',
    cefr:'B2', emoji:'🎭', color:C.B2, lessons:[
      { id:'b2u19l1', title:'Le théâtre classique',      type:'culture',      xp:25 },
      { id:'b2u19l2', title:'Molière & Racine',          type:'culture',      xp:25 },
      { id:'b2u19l3', title:'Le théâtre contemporain',   type:'vocab',        xp:25 },
      { id:'b2u19l4', title:'Critiquer une pièce',       type:'conversation', xp:25 },
      { id:'b2u19l5', title:'Le théâtre: bilan',         type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u20', title:'La Musique Française', subtitle:'Chanson française, variété & contemporary music',
    cefr:'B2', emoji:'🎵', color:C.B2, lessons:[
      { id:'b2u20l1', title:'La chanson française',      type:'culture',      xp:25 },
      { id:'b2u20l2', title:'De Piaf à aujourd\'hui',   type:'culture',      xp:25 },
      { id:'b2u20l3', title:'Analyser des paroles',      type:'listening',    xp:25 },
      { id:'b2u20l4', title:'Parler de musique',         type:'conversation', xp:25 },
      { id:'b2u20l5', title:'La musique: bilan',         type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u21', title:'La Mode & Le Luxe', subtitle:'Fashion houses, luxury brands & French aesthetics',
    cefr:'B2', emoji:'👜', color:C.B2, lessons:[
      { id:'b2u21l1', title:'Les grandes maisons',       type:'culture',      xp:25 },
      { id:'b2u21l2', title:'Le luxe à la française',    type:'culture',      xp:25 },
      { id:'b2u21l3', title:'Vocabulaire de la mode',    type:'vocab',        xp:25 },
      { id:'b2u21l4', title:'Critiquer un défilé',       type:'conversation', xp:25 },
      { id:'b2u21l5', title:'Mode & luxe: bilan',        type:'review',       xp:30 },
    ]
  },
  {
    id:'b2u22', title:'Révision B2 Avancée', subtitle:'Full B2 mastery — upper intermediate confirmed',
    cefr:'B2', emoji:'🏅', color:C.B2, lessons:[
      { id:'b2u22l1', title:'Grand vocabulaire B2',      type:'vocab',        xp:35 },
      { id:'b2u22l2', title:'Grande grammaire B2',       type:'grammar',      xp:35 },
      { id:'b2u22l3', title:'Grande conversation B2',    type:'conversation', xp:35 },
      { id:'b2u22l4', title:'Grande écoute B2',          type:'listening',    xp:35 },
      { id:'b2u22l5', title:'Grand bilan B2',            type:'review',       xp:45 },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  C1 — L'Excellence  (16 units × 5 lessons = 80 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'c1u01', title:'La Rhétorique', subtitle:'Persuasion, eloquence & formal speech',
    cefr:'C1', emoji:'🎙️', color:C.C1, lessons:[
      { id:'c1u01l1', title:'Figures de style',          type:'grammar',      xp:35 },
      { id:'c1u01l2', title:'Persuasion & éloquence',    type:'conversation', xp:35 },
      { id:'c1u01l3', title:'Discours formel',           type:'conversation', xp:35 },
      { id:'c1u01l4', title:'L\'art de l\'argumentation', type:'conversation', xp:35 },
      { id:'c1u01l5', title:'La rhétorique: bilan',      type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u02', title:'La Stylistique', subtitle:'Advanced style, register & literary writing',
    cefr:'C1', emoji:'🖊️', color:C.C1, lessons:[
      { id:'c1u02l1', title:'Style & registre avancé',   type:'grammar',      xp:35 },
      { id:'c1u02l2', title:'Écriture littéraire',       type:'grammar',      xp:35 },
      { id:'c1u02l3', title:'Nuances sémantiques',       type:'vocab',        xp:35 },
      { id:'c1u02l4', title:'Rédaction avancée',         type:'conversation', xp:35 },
      { id:'c1u02l5', title:'La stylistique: bilan',     type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u03', title:'La Littérature Avancée', subtitle:'Proust, Camus, Sartre — reading & analysis',
    cefr:'C1', emoji:'📖', color:C.C1, lessons:[
      { id:'c1u03l1', title:'Proust & la mémoire',       type:'culture',      xp:35 },
      { id:'c1u03l2', title:'Camus & l\'absurde',        type:'culture',      xp:35 },
      { id:'c1u03l3', title:'Structure narrative',       type:'listening',    xp:35 },
      { id:'c1u03l4', title:'Symbolisme & allégorie',    type:'conversation', xp:35 },
      { id:'c1u03l5', title:'Littérature avancée: bilan', type:'review',      xp:45 },
    ]
  },
  {
    id:'c1u04', title:'Le Discours Indirect', subtitle:'Reported speech — tense shifts & time expressions',
    cefr:'C1', emoji:'💬', color:C.C1, lessons:[
      { id:'c1u04l1', title:'Transposition des temps',   type:'grammar',      xp:35 },
      { id:'c1u04l2', title:'Expressions temporelles',   type:'grammar',      xp:35 },
      { id:'c1u04l3', title:'Rapporter un discours',     type:'grammar',      xp:35 },
      { id:'c1u04l4', title:'Discours indirect libre',   type:'grammar',      xp:35 },
      { id:'c1u04l5', title:'Discours indirect: bilan',  type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u05', title:'Les Négations Avancées', subtitle:'Ne…que, ne…ni…ni, ne…guère & literary negation',
    cefr:'C1', emoji:'🚫', color:C.C1, lessons:[
      { id:'c1u05l1', title:'Ne…que (only)',             type:'grammar',      xp:35 },
      { id:'c1u05l2', title:'Ne…ni…ni',                  type:'grammar',      xp:35 },
      { id:'c1u05l3', title:'Ne…guère & ne…point',       type:'grammar',      xp:35 },
      { id:'c1u05l4', title:'Négations littéraires',     type:'grammar',      xp:35 },
      { id:'c1u05l5', title:'Négations avancées: bilan', type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u06', title:'La Grammaire de Précision', subtitle:'Plus-que-parfait, conditionnel passé & subjonctif imparfait',
    cefr:'C1', emoji:'🎯', color:C.C1, lessons:[
      { id:'c1u06l1', title:'Accord du participe passé', type:'grammar',      xp:35 },
      { id:'c1u06l2', title:'Le plus-que-parfait',       type:'grammar',      xp:35 },
      { id:'c1u06l3', title:'Le conditionnel passé',     type:'grammar',      xp:35 },
      { id:'c1u06l4', title:'Subjonctif imparfait',      type:'grammar',      xp:35 },
      { id:'c1u06l5', title:'Grammaire de précision: bilan', type:'review',   xp:45 },
    ]
  },
  {
    id:'c1u07', title:'La Langue des Médias', subtitle:'Journalism, media analysis & editorial writing',
    cefr:'C1', emoji:'📡', color:C.C1, lessons:[
      { id:'c1u07l1', title:'Journalisme français',      type:'culture',      xp:35 },
      { id:'c1u07l2', title:'Analyser les médias',       type:'listening',    xp:35 },
      { id:'c1u07l3', title:'Rédiger un article',        type:'conversation', xp:35 },
      { id:'c1u07l4', title:'Médias & société',          type:'conversation', xp:35 },
      { id:'c1u07l5', title:'Langue des médias: bilan',  type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u08', title:'Révision C1', subtitle:'Mid-level C1 checkpoint',
    cefr:'C1', emoji:'🌟', color:C.C1, lessons:[
      { id:'c1u08l1', title:'Vocabulaire C1',            type:'vocab',        xp:40 },
      { id:'c1u08l2', title:'Grammaire C1',              type:'grammar',      xp:40 },
      { id:'c1u08l3', title:'Conversation C1',           type:'conversation', xp:40 },
      { id:'c1u08l4', title:'Écoute C1',                 type:'listening',    xp:40 },
      { id:'c1u08l5', title:'Bilan C1',                  type:'review',       xp:50 },
    ]
  },
  // ── C1 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'c1u09', title:'Le Subjonctif Imparfait', subtitle:'Literary subjunctive — recognition & use',
    cefr:'C1', emoji:'📜', color:C.C1, lessons:[
      { id:'c1u09l1', title:'Formation du subj. imparfait', type:'grammar',   xp:35 },
      { id:'c1u09l2', title:'Emplois littéraires',        type:'grammar',     xp:35 },
      { id:'c1u09l3', title:'Subj. imparfait classique', type:'listening',    xp:35 },
      { id:'c1u09l4', title:'Reconnaître & traduire',    type:'conversation', xp:35 },
      { id:'c1u09l5', title:'Subj. imparfait: bilan',    type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u10', title:'Les Gallicismes Avancés', subtitle:'Advanced idioms & near-native expression',
    cefr:'C1', emoji:'✨', color:C.C1, lessons:[
      { id:'c1u10l1', title:'Gallicismes littéraires',   type:'vocab',        xp:35 },
      { id:'c1u10l2', title:'Tournures idiomatiques',    type:'vocab',        xp:35 },
      { id:'c1u10l3', title:'Expressions régionales',    type:'culture',      xp:35 },
      { id:'c1u10l4', title:'Gallicismes en discours',   type:'conversation', xp:35 },
      { id:'c1u10l5', title:'Gallicismes avancés: bilan', type:'review',      xp:45 },
    ]
  },
  {
    id:'c1u11', title:'La Traduction', subtitle:'Translation skills, false friends & cross-cultural nuance',
    cefr:'C1', emoji:'🔁', color:C.C1, lessons:[
      { id:'c1u11l1', title:'Faux amis avancés',         type:'vocab',        xp:35 },
      { id:'c1u11l2', title:'Traduire le littéraire',    type:'grammar',      xp:35 },
      { id:'c1u11l3', title:'Problèmes de traduction',   type:'conversation', xp:35 },
      { id:'c1u11l4', title:'Équivalences culturelles',  type:'culture',      xp:35 },
      { id:'c1u11l5', title:'La traduction: bilan',      type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u12', title:'L\'Oral Avancé', subtitle:'Spontaneous speech, debate & formal presentation',
    cefr:'C1', emoji:'🎤', color:C.C1, lessons:[
      { id:'c1u12l1', title:'Discours spontané',         type:'conversation', xp:35 },
      { id:'c1u12l2', title:'Gérer le silence',          type:'conversation', xp:35 },
      { id:'c1u12l3', title:'Présentation formelle',     type:'conversation', xp:35 },
      { id:'c1u12l4', title:'Interaction à haut niveau', type:'listening',    xp:35 },
      { id:'c1u12l5', title:'Oral avancé: bilan',        type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u13', title:'La Correspondance Formelle', subtitle:'Formal letters, emails & administrative French',
    cefr:'C1', emoji:'✉️', color:C.C1, lessons:[
      { id:'c1u13l1', title:'Lettre formelle',           type:'grammar',      xp:35 },
      { id:'c1u13l2', title:'Email administratif',       type:'grammar',      xp:35 },
      { id:'c1u13l3', title:'Formules de politesse',     type:'vocab',        xp:35 },
      { id:'c1u13l4', title:'Réclamation & plainte',     type:'conversation', xp:35 },
      { id:'c1u13l5', title:'Correspondance: bilan',     type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u14', title:'Le Lexique Spécialisé', subtitle:'Law, medicine, science & domain-specific French',
    cefr:'C1', emoji:'🔭', color:C.C1, lessons:[
      { id:'c1u14l1', title:'Vocabulaire juridique',     type:'vocab',        xp:35 },
      { id:'c1u14l2', title:'Vocabulaire médical',       type:'vocab',        xp:35 },
      { id:'c1u14l3', title:'Vocabulaire scientifique',  type:'vocab',        xp:35 },
      { id:'c1u14l4', title:'Registres techniques',      type:'conversation', xp:35 },
      { id:'c1u14l5', title:'Lexique spécialisé: bilan', type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u15', title:'La Phonétique', subtitle:'Pronunciation, liaison, élision & intonation',
    cefr:'C1', emoji:'🔊', color:C.C1, lessons:[
      { id:'c1u15l1', title:'Les sons du français',      type:'listening',    xp:35 },
      { id:'c1u15l2', title:'Liaison & élision',         type:'grammar',      xp:35 },
      { id:'c1u15l3', title:'Accent & intonation',       type:'listening',    xp:35 },
      { id:'c1u15l4', title:'Réduire son accent',        type:'conversation', xp:35 },
      { id:'c1u15l5', title:'La phonétique: bilan',      type:'review',       xp:45 },
    ]
  },
  {
    id:'c1u16', title:'Révision C1 Avancée', subtitle:'Full C1 mastery — near-native proficiency confirmed',
    cefr:'C1', emoji:'🏅', color:C.C1, lessons:[
      { id:'c1u16l1', title:'Grand vocabulaire C1',      type:'vocab',        xp:45 },
      { id:'c1u16l2', title:'Grande grammaire C1',       type:'grammar',      xp:45 },
      { id:'c1u16l3', title:'Grande conversation C1',    type:'conversation', xp:45 },
      { id:'c1u16l4', title:'Grande écoute C1',          type:'listening',    xp:45 },
      { id:'c1u16l5', title:'Grand bilan C1',            type:'review',       xp:55 },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  C2 — La Maîtrise Totale  (6 units, 22 lessons)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id:'c2u01', title:'Expression Native', subtitle:'Register mastery, advanced idioms & spontaneous speech',
    cefr:'C2', emoji:'💎', color:C.C2, lessons:[
      { id:'c2u01l1', title:'Nuances de registre',       type:'conversation', xp:50 },
      { id:'c2u01l2', title:'Idiomes avancés',           type:'vocab',        xp:50 },
      { id:'c2u01l3', title:'Humour & ironie',           type:'conversation', xp:50 },
      { id:'c2u01l4', title:'Expression spontanée',      type:'conversation', xp:50 },
    ]
  },
  {
    id:'c2u02', title:'La Nuance', subtitle:'Fine semantic distinctions & complex syntax',
    cefr:'C2', emoji:'🔬', color:C.C2, lessons:[
      { id:'c2u02l1', title:'Distinction sémantique',    type:'grammar',      xp:50 },
      { id:'c2u02l2', title:'Syntaxe complexe',          type:'grammar',      xp:50 },
      { id:'c2u02l3', title:'Maîtrise stylistique',      type:'grammar',      xp:50 },
      { id:'c2u02l4', title:'Expression personnelle',    type:'conversation', xp:50 },
    ]
  },
  {
    id:'c2u03', title:'L\'Excellence Totale', subtitle:'Mastery — indistinguishable from a native speaker',
    cefr:'C2', emoji:'🏆', color:C.C2, lessons:[
      { id:'c2u03l1', title:'Dissertation avancée',      type:'conversation', xp:60 },
      { id:'c2u03l2', title:'Joute verbale',             type:'conversation', xp:60 },
      { id:'c2u03l3', title:'Maîtrise totale',           type:'review',       xp:75 },
    ]
  },
  // ── C2 Part 2 ──────────────────────────────────────────────────────────────
  {
    id:'c2u04', title:'La Création Littéraire', subtitle:'Creative writing — poetry, fiction & prose style',
    cefr:'C2', emoji:'✍️', color:C.C2, lessons:[
      { id:'c2u04l1', title:'Écrire un poème',           type:'conversation', xp:60 },
      { id:'c2u04l2', title:'La nouvelle courte',        type:'grammar',      xp:60 },
      { id:'c2u04l3', title:'Style & voix narrative',    type:'grammar',      xp:60 },
      { id:'c2u04l4', title:'Revision & polish',         type:'review',       xp:70 },
    ]
  },
  {
    id:'c2u05', title:'Le Français Soutenu', subtitle:'Elevated register — oratory, essay & formal debate',
    cefr:'C2', emoji:'🎓', color:C.C2, lessons:[
      { id:'c2u05l1', title:'Le discours solennel',      type:'conversation', xp:60 },
      { id:'c2u05l2', title:'La dissertation philosophique', type:'grammar',  xp:60 },
      { id:'c2u05l3', title:'Rhétorique soutenue',       type:'conversation', xp:60 },
      { id:'c2u05l4', title:'Soutenu en contexte',       type:'listening',    xp:70 },
    ]
  },
  {
    id:'c2u06', title:'Maîtrise Absolue', subtitle:'Final benchmark — absolute mastery certified',
    cefr:'C2', emoji:'👑', color:C.C2, lessons:[
      { id:'c2u06l1', title:'Grand oral final',          type:'conversation', xp:75 },
      { id:'c2u06l2', title:'Analyse de texte complète', type:'listening',    xp:75 },
      { id:'c2u06l3', title:'Maîtrise absolue',          type:'review',       xp:100 },
    ]
  },
]

// ── Elo progression config ────────────────────────────────────────────────────
// Halved step sizes to accommodate double the content within the same elo bands.
// All values stay within questionBank CEFR_ELO ranges.

const CEFR_START: Record<string,number> = {
  A1: 800, A2: 1000, B1: 1200, B2: 1400, C1: 1600, C2: 1800
}
const CEFR_STEP: Record<string,number> = {
  A1: 1,  A2: 1,  B1: 1,  B2: 1,  C1: 2,  C2: 15
}

// ── buildCourse ───────────────────────────────────────────────────────────────

export function buildCourse(elo: number, _xp: number): CourseUnit[] {
  // Mutable elo pointers per CEFR level — reset fresh each call
  const ptr: Record<string,number> = { ...CEFR_START }

  return UNITS.map(unit => {
    const step    = CEFR_STEP[unit.cefr]
    const unitMin = ptr[unit.cefr]

    const lessons: Lesson[] = unit.lessons.map(l => {
      const lockAt     = ptr[unit.cefr]   // elo needed to unlock this lesson
      ptr[unit.cefr]  += step             // advance pointer
      const completeAt = ptr[unit.cefr]   // elo at which lesson is complete

      return {
        id:       l.id,
        title:    l.title,
        type:     l.type,
        xp:       l.xp,
        locked:   elo < lockAt,
        complete: elo >= completeAt,
        current:  elo >= lockAt && elo < completeAt,
      }
    })

    return {
      id:       unit.id,
      title:    unit.title,
      subtitle: unit.subtitle,
      cefr:     unit.cefr,
      emoji:    unit.emoji,
      color:    unit.color,
      eloMin:   unitMin,
      locked:   elo < unitMin,
      lessons,
    }
  })
}
