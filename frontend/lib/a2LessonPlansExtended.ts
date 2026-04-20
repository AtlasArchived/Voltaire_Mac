import type { CefrLevel } from './questionBank'

type LessonType = 'vocab_intro'|'guided_dialog'|'grammar_focus'|'controlled_practice'|'fluency_drill'|'unit_review'
interface BaseLP { cefr: CefrLevel; unitId: string; lessonType: LessonType; prompt: string; answer: string; note?: string }
export interface LPTransQ extends BaseLP { type: 'translate';  direction: 'fr-en'|'en-fr' }
export interface LPMcqQ   extends BaseLP { type: 'mcq';        options: string[] }
export interface LPArrQ   extends BaseLP { type: 'arrange';    words: string[] }
export interface LPListQ  extends BaseLP { type: 'listen';     audioText: string }
export interface LPFillQ  extends BaseLP { type: 'fill_blank' }
export interface LPErrQ   extends BaseLP { type: 'error_correct' }
export type LPQ = LPTransQ|LPMcqQ|LPArrQ|LPListQ|LPFillQ|LPErrQ
export interface LessonPhrase { fr: string; en: string; note: string }
export interface LessonPlanData { title: string; theme: string; phrases: LessonPhrase[]; practice: LPQ[]; test: LPQ[] }

// Helpers scoped per unit (cefr fixed to A2)
function tr(u:string,d:'fr-en'|'en-fr',p:string,a:string,n=''):LPTransQ { return {type:'translate',cefr:'A2',unitId:u,lessonType:'vocab_intro',direction:d,prompt:p,answer:a,note:n} }
function mc(u:string,p:string,a:string,o:string[],n=''):LPMcqQ { return {type:'mcq',cefr:'A2',unitId:u,lessonType:'unit_review',prompt:p,answer:a,options:o,note:n} }
function ar(u:string,p:string,a:string,w:string[],n=''):LPArrQ { return {type:'arrange',cefr:'A2',unitId:u,lessonType:'grammar_focus',prompt:p,answer:a,words:w,note:n} }
function li(u:string,at:string,a:string,n=''):LPListQ { return {type:'listen',cefr:'A2',unitId:u,lessonType:'fluency_drill',prompt:'Listen and type:',audioText:at,answer:a,note:n} }
function fi(u:string,p:string,a:string,n=''):LPFillQ { return {type:'fill_blank',cefr:'A2',unitId:u,lessonType:'controlled_practice',prompt:p,answer:a,note:n} }
function er(u:string,p:string,a:string,n=''):LPErrQ { return {type:'error_correct',cefr:'A2',unitId:u,lessonType:'controlled_practice',prompt:p,answer:a,note:n} }

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 4 — "Life in the City"
// Urban vocabulary, directions review, prepositions of place
// ─────────────────────────────────────────────────────────────────────────────
const U4='a2-u4'
const a2u4Phrases:LessonPhrase[]=[
  {fr:'le quartier',en:'the neighbourhood',note:"From 'quatre' (four) — originally a quarter of a city. Every French city is a collection of quartiers with distinct identities."},
  {fr:'faire la queue',en:'to queue / stand in line',note:"Literally 'to make the tail' — the queue is the tail of the crowd. The French are famously impatient in queues."},
  {fr:'le centre-ville',en:'the city centre / downtown',note:"The French hyphened compound. Most French city centres have a pedestrianised zone — 'la zone piétonne'."},
  {fr:'les transports en commun',en:'public transport',note:"'En commun' = shared/in common. France has exceptional public transport — the SNCF network covers even small towns."},
  {fr:'le bouchon',en:'traffic jam',note:"Literally 'cork' or 'bottle stopper' — traffic that corks up a road. Also the word for a Lyonnaise bistrot."},
]
const a2u4Practice:LPQ[]=[
  tr(U4,'en-fr','I live in a nice neighbourhood.','J\'habite dans un beau quartier',"'Dans' is always used for neighbourhoods and districts — never 'en'."),
  tr(U4,'fr-en','Il y a beaucoup de bouchons le vendredi soir.','There is a lot of traffic on Friday evenings.',"Culture: Friday evening in any French city means extreme traffic. 'Les grands départs' before holidays are national news events."),
  mc(U4,'How do you say you are stuck in traffic?','Je suis dans les bouchons',['Je suis bloqué','Je suis dans les bouchons','J\'ai raté le bus','Je cherche un parking'],"'Dans les bouchons' is the standard spoken expression. Like corks, you're stuck."),
  ar(U4,'Build: \'I take public transport to get to work\'','Je prends les transports en commun pour aller au travail',['Je','prends','les','transports','en','commun','pour','aller','au','travail'],"'Pour aller à' = in order to go to. 'Au travail' = à + le travail (masculine)."),
  tr(U4,'fr-en','Le marché se tient tous les samedis matin.','The market is held every Saturday morning.',"'Se tenir' = to be held (for events). French outdoor markets are a weekly civic institution."),
  fi(U4,'Nous habitons dans le ___ nord de la ville.','quartier',"'Le quartier nord' = the northern neighbourhood. Quartiers are named by compass direction, history, or character."),
  er(U4,'Je dois faire la file pour entrer.','Je dois faire la queue pour entrer.',"'Faire la queue' is the standard French expression. 'Faire la file' is a Québécois variant — avoid in metropolitan France."),
  li(U4,'La mairie se trouve au centre-ville.','The town hall is in the city centre.',"'Se trouver' = to be located. More formal than 'est'. The mairie is always in the symbolic heart of the commune."),
  tr(U4,'en-fr','Is there a metro station near here?','Est-ce qu\'il y a une station de métro près d\'ici',"'Près d\'ici' = near here. The Paris Métro has 302 stations — you're rarely more than 500m from one."),
  ar(U4,'Build: \'The market is between the church and the town hall\'','Le marché est entre l\'église et la mairie',['Le','marché','est','entre','l\'église','et','la','mairie'],"'Entre' takes two items: entre A et B. The church and mairie facing each other across the square is classic French urban design."),
  mc(U4,'What does \'le coin\' mean in \'au coin de la rue\'?','the corner',['the coin','the corner','the neighbourhood','the end'],"'Le coin' = the corner. 'Au coin de la rue' = at the corner of the street. Also 'un coin sympa' = a nice spot."),
  fi(U4,'Le vélo est un moyen de transport ___ en ville.','pratique',"'Pratique' = practical. France has massively expanded urban cycling infrastructure since 2020 — Paris alone added 1,000km of bike lanes."),
  er(U4,'Il y a une bouchon sur l\'autoroute A6.','Il y a un bouchon sur l\'autoroute A6.',"'Bouchon' is masculine → 'un bouchon'. The A6 south of Paris is France's most notorious traffic corridor on holiday weekends."),
  tr(U4,'fr-en','Je préfère marcher — c\'est plus rapide que le bus.','I prefer to walk — it\'s faster than the bus.',"Urban walking ('marcher') is central to French city life. Hausmann redesigned Paris in the 1860s specifically for walking."),
  li(U4,'Il y a une grève des transports en commun demain.','Public transport strike tomorrow.',"Culture: France has the highest rate of strike action in Europe. 'Une grève' (strike) is a constitutional right. Transport workers use it regularly."),
]
const a2u4Test:LPQ[]=[
  tr(U4,'en-fr','There is a traffic jam on the motorway.','Il y a un bouchon sur l\'autoroute',"'Un bouchon' is masculine. 'L\'autoroute' is feminine — a useful gender pair to remember."),
  er(U4,'Je prends le transports en commun.','Je prends les transports en commun.',"'Transports en commun' is always plural — 'les', not 'le'."),
  mc(U4,'Which preposition follows \'habiter\' for a city?','à',['dans','à','en','sur'],"'Habiter à Paris' for cities. 'Habiter en France' for countries. 'Habiter dans' for neighbourhoods and streets."),
  tr(U4,'fr-en','Le quartier est animé le week-end.','The neighbourhood is lively at the weekend.',"'Animé' = lively, busy. Borrowed the word 'animated' but uses it for bustling places, not cartoons."),
  ar(U4,'Build: \'I have to queue for the museum\'','Je dois faire la queue pour le musée',['Je','dois','faire','la','queue','pour','le','musée'],"'Devoir' + infinitive = must/have to. The queue for the Louvre can be 2 hours long on summer weekends."),
  fi(U4,'Le ___ est un lieu de rencontre important dans les villes françaises.','marché',"The outdoor market as social and civic institution — not just retail."),
  er(U4,'Je cherche la station de métro de la plus proche.','Je cherche la station de métro la plus proche.',"Remove the spurious 'de'. 'La plus proche' = the nearest. No 'de' between the noun and superlative here."),
  tr(U4,'fr-en','Nous habitons dans le 6ème arrondissement.','We live in the 6th arrondissement.',"Paris is divided into 20 arrondissements — the 6th (Saint-Germain-des-Prés) is historically the intellectual heart of the Left Bank."),
  li(U4,'La zone piétonne est interdite aux voitures.','No cars in the pedestrian zone.',"'Piéton/piétonne' = pedestrian. 'Interdit' = forbidden. French city centres have increasingly large car-free zones."),
  tr(U4,'en-fr','The corner shop is open on Sundays.','L\'épicerie du coin est ouverte le dimanche',"'L\'épicerie du coin' = the corner shop — often run by North African families, open when everything else is closed."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 5 — "Likes & Dislikes"
// Preferences, opinions, comparatives
// ─────────────────────────────────────────────────────────────────────────────
const U5='a2-u5'
const a2u5Phrases:LessonPhrase[]=[
  {fr:'J\'adore / Je déteste',en:'I love / I hate',note:"Far stronger than aimer. 'Adorer' = to adore (worship-level). 'Détester' is the polite version of hatred in French."},
  {fr:'Je préfère X à Y',en:'I prefer X to Y',note:"Use 'à' (not 'que') to make the comparison: Je préfère le café au thé. 'Au' = à + le."},
  {fr:'Ça me plaît',en:'I like it / It pleases me',note:"The verb 'plaire' works backwards — the THING is the subject, not you. Like the Latin 'placere'."},
  {fr:'C\'est meilleur que',en:'It is better than',note:"'Meilleur' is the irregular comparative of 'bon'. Never say 'plus bon' — it sounds childish."},
  {fr:'J\'ai horreur de',en:'I can\'t stand / I have a horror of',note:"Even stronger than détester. 'Avoir horreur de' + infinitive or noun. Very satisfying to use."},
]
const a2u5Practice:LPQ[]=[
  tr(U5,'en-fr','I love French cinema.','J\'adore le cinéma français',"'Adorer' + le/la/les for general preferences — always use the definite article with verbs of preference."),
  mc(U5,'How do you say \'I can\'t stand traffic jams\'?','J\'ai horreur des bouchons',['Je n\'aime pas les bouchons','Je déteste les bouchons','J\'ai horreur des bouchons','Les bouchons me manquent'],"All three first options are negative — but 'avoir horreur de' is the most emphatic. 'Me manquent' means 'I miss' — the opposite!"),
  tr(U5,'fr-en','Le jazz me plaît beaucoup.','I like jazz a lot.',"Remember: 'plaire' is back-to-front. 'Le jazz' is the subject — jazz pleases me. Not 'I please jazz'."),
  ar(U5,'Build: \'I prefer wine to beer\'','Je préfère le vin à la bière',['Je','préfère','le','vin','à','la','bière'],"'À' for preference comparisons. 'À + la bière' stays separate — don't contract to 'al'."),
  fi(U5,'Ce film est ___ que le premier.','meilleur',"'Meilleur' = better (for quality). Never 'plus bon'. The comparative of 'bon' is always irregular: bon → meilleur."),
  er(U5,'Je préfère le café que le thé.','Je préfère le café au thé.',"Preference uses 'à', not 'que'. 'Que' is for quantity comparisons (plus que, moins que)."),
  li(U5,'Ça me plaît vraiment beaucoup.','I really like it.',"'Vraiment beaucoup' intensifies the pleasure. 'Ça me plaît' is the polite, moderate form — 'j\'adore' is more enthusiastic."),
  tr(U5,'fr-en','J\'ai horreur de faire la vaisselle.','I can\'t stand doing the dishes.',"'Avoir horreur de' + infinitive. 'La vaisselle' = the washing up. A universal domestic complaint."),
  mc(U5,'The comparative of \'bon\' is:','meilleur',['plus bon','bon plus','meilleur','mieux'],"'Meilleur' = better (adjective, replaces bon). 'Mieux' = better (adverb, replaces bien). Two irregular comparatives to memorise."),
  ar(U5,'Build: \'I don\'t like this neighbourhood as much\'','Ce quartier me plaît moins',['Ce','quartier','me','plaît','moins'],"'Me plaît moins' = pleases me less. Plaire always inverts — the place is the grammatical subject."),
  fi(U5,'Cette chanson me ___ énormément.','plaît',"'Me plaît' = pleases me. 'Enormément' intensifies — a good word to know for expressing strong positive reactions."),
  tr(U5,'en-fr','Do you prefer the mountains or the sea?','Tu préfères la montagne ou la mer',"Classic French debate. The country is split — les Pyrénées/Alpes vs the Atlantic/Mediterranean."),
  er(U5,'Je préfère manger à la maison que au restaurant.','Je préfère manger à la maison plutôt qu\'au restaurant.',"With infinitives, use 'plutôt que de' or 'plutôt que'. The 'que au' → 'qu\'au' contraction is also required."),
  li(U5,'Ce fromage est meilleur que celui-là.','This cheese is better than that one.',"'Celui-là' = that one (masculine). Demonstrative pronouns: celui-ci (this one) / celui-là (that one)."),
  tr(U5,'fr-en','Je déteste les lundis matin.','I hate Monday mornings.',"'Les lundis matin' = Monday mornings in general (habitual plural). A universal sentiment requiring no cultural explanation."),
]
const a2u5Test:LPQ[]=[
  tr(U5,'en-fr','I prefer spring to autumn.','Je préfère le printemps à l\'automne',"'À' for preference. 'L\'automne' — vowel contraction. Spring preferred by 62% of French people in surveys."),
  er(U5,'Ce restaurant est plus bon que l\'autre.','Ce restaurant est meilleur que l\'autre.',"'Plus bon' doesn't exist. Always 'meilleur' for the comparative of bon."),
  mc(U5,'How does \'plaire\' work grammatically?','The thing liked is the subject',['You are the subject','The thing liked is the subject','It works like \'aimer\'','There is no subject'],"Plaire inverts: 'Ce livre me plaît' = this book pleases me. The book is the subject, not me."),
  tr(U5,'fr-en','J\'ai horreur des films d\'horreur.','I can\'t stand horror films.',"Wordplay: 'avoir horreur' (to hate) + 'les films d\'horreur' (horror films). A neat coincidence."),
  ar(U5,'Build: \'Jazz pleases me more than classical music\'','Le jazz me plaît plus que la musique classique',['Le','jazz','me','plaît','plus','que','la','musique','classique'],"'Plus que' for quantity comparisons. Here 'plaire' + 'plus que' — jazz is the subject."),
  fi(U5,'Cette ville me ___ vraiment — je veux y revenir.','plaît',"'Me plaît' in present. 'Y revenir' = return there. 'Y' replaces 'à + place'."),
  er(U5,'Elle aime mieux le rouge que le bleu.','Elle préfère le rouge au bleu.',"'Aimer mieux' is understandable but dated. 'Préférer' + à is the modern standard."),
  tr(U5,'fr-en','Ce vin est moins bon que le précédent.','This wine is less good than the previous one.',"'Moins bon' = less good. Only 'plus bon' is impossible — 'moins bon' is perfectly correct."),
  li(U5,'Je n\'aime pas du tout les épinards.','I don\'t like spinach at all.',"'Du tout' intensifies negation — 'not at all'. Far stronger than just 'je n\'aime pas'."),
  tr(U5,'en-fr','It pleases me — I\'ll take it.','Ça me plaît — je le prends.',"Combining the preference structure with a purchase decision. Very natural in shops and markets."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 6 — "The Memory Palace"
// Imparfait — describing past states, habits, and ongoing actions
// ─────────────────────────────────────────────────────────────────────────────
const U6='a2-u6'
const a2u6Phrases:LessonPhrase[]=[
  {fr:'Quand j\'étais enfant',en:'When I was a child',note:"The classic imparfait opener. 'Étais' = was (être conjugated). Sets up habitual or descriptive past."},
  {fr:'Il faisait beau',en:'The weather was nice',note:"'Faisait' = imperfect of faire. Used for ongoing past states — the weather as it was, not a single event."},
  {fr:'Nous allions souvent',en:'We used to go often',note:"'Allions' = imperfect of aller. The imparfait encodes repetition and habit better than any tense in English."},
  {fr:'C\'était magnifique',en:'It was magnificent',note:"'C\'était' = imperfect of être + c\'est. Expressing how something was — a state, not an event."},
  {fr:'Je ne savais pas',en:'I didn\'t know',note:"'Savais' = imperfect of savoir. For knowledge as a state (not a single discovery). 'Je n\'ai pas su' = I failed to find out."},
]
const a2u6Practice:LPQ[]=[
  tr(U6,'en-fr','When I was a child, I loved chocolate.','Quand j\'étais enfant j\'adorais le chocolat',"Two imperfects: étais (state of being a child) + adorais (habitual feeling). Both ongoing."),
  tr(U6,'fr-en','Il habitait à Lyon avant de venir à Paris.','He used to live in Lyon before coming to Paris.',"'Habitait' = was living/used to live. Before a key change, use imparfait for background state."),
  mc(U6,'Which tense is used for \'it was raining when I arrived\'?','Il pleuvait quand je suis arrivé',['Il a plu quand je suis arrivé','Il pleuvait quand je suis arrivé','Il pleuva quand j\'arrivais','Il faisait pleuvoir quand j\'arrivai'],"Classic structure: imparfait (background/ongoing) + passé composé (the event that happened). Essential for storytelling."),
  ar(U6,'Build: \'Every Sunday we used to eat at my grandmother\'s\'','Tous les dimanches nous mangions chez ma grand-mère',['Tous','les','dimanches','nous','mangions','chez','ma','grand-mère'],"'Tous les dimanches' triggers imparfait automatically — repeated past action. 'Mangions' = imperfect of manger."),
  fi(U6,'Quand il ___ petit, il voulait être pompier.','était',"'Quand... était petit' = when he was little. Classic childhood description pattern. Pompier = firefighter."),
  er(U6,'Il a plu quand nous nous promenions.','Il pleuvait quand nous nous promenions.',"Both actions were ongoing simultaneously — both should be in the imparfait. If the rain started as an event, passé composé would work for it."),
  li(U6,'C\'était une époque merveilleuse.','It was a wonderful time.',"'Époque' = period of time, era. 'C\'était' = imperfect of c\'est. Describing a past period as a state."),
  tr(U6,'fr-en','Je ne savais pas qu\'il était marié.','I didn\'t know he was married.',"'Savais' = imperfect — describing a state of not knowing. If you suddenly found out, 'je n\'ai pas su' works too."),
  mc(U6,'The imparfait ending for \'nous\' is:','-ions',['--ais','-ions','-ait','-iez'],"'Nous' imparfait always ends in -ions: nous mangions, nous étions, nous allions. No exceptions."),
  ar(U6,'Build: \'She was reading while he was cooking\'','Elle lisait pendant qu\'il cuisinait',['Elle','lisait','pendant','qu\'il','cuisinait'],"Two simultaneous ongoing actions → both imparfait. 'Pendant que' = while/during."),
  fi(U6,'Il ___ beau et nous ___ au parc.','faisait / allions',"Two imperfects: weather state + habitual action. A classic warm-weather memory sentence."),
  tr(U6,'en-fr','We used to go to the market every Saturday.','Nous allions au marché tous les samedis',"'Tous les samedis' (every Saturday) = repeated → imparfait. 'Au marché' = à + le marché."),
  er(U6,'J\'ai voulu être docteur quand j\'étais petit.','Je voulais être docteur quand j\'étais petit.',"Childhood dream = ongoing state/feeling → imparfait 'voulais'. 'J\'ai voulu' implies a single moment of wanting, not a childhood aspiration."),
  li(U6,'Je me souviens très bien de cette époque.','I remember that time very well.',"'Se souvenir de' = to remember. A reflexive. The act of remembering the imparfait — appropriately wistful."),
  tr(U6,'fr-en','Ils n\'avaient pas beaucoup d\'argent mais ils étaient heureux.','They didn\'t have much money but they were happy.',"Two ongoing states in the past — both imparfait. The classic formula of nostalgia in every language."),
]
const a2u6Test:LPQ[]=[
  tr(U6,'en-fr','It was cold and we were inside.','Il faisait froid et nous étions à l\'intérieur',"Two imparfait states simultaneously. 'À l\'intérieur' = inside. 'À l\'extérieur' = outside."),
  er(U6,'Elle a aimé le chocolat quand elle était petite.','Elle aimait le chocolat quand elle était petite.',"A childhood habit/feeling → imparfait. 'Elle a aimé' would mean she liked it once, on a specific occasion."),
  mc(U6,'Choose the correct form for \'we were going\':','Nous allions',['Nous avons allé','Nous allions','Nous allons','Nous sommes allés'],"Imperfect of aller: nous allions. 'Nous sommes allés' = passé composé (a completed trip, not a habit)."),
  tr(U6,'fr-en','Quand j\'étais étudiant, je dormais très peu.','When I was a student, I slept very little.',"Two imparfait: état (étais étudiant) + habitude (dormais peu). The universal student experience."),
  ar(U6,'Build: \'He was watching TV when she called\'','Il regardait la télé quand elle a appelé',['Il','regardait','la','télé','quand','elle','a','appelé'],"Background (regardait = imparfait) interrupted by event (a appelé = passé composé). The classic storytelling structure."),
  fi(U6,'Nous ___ souvent en vacances en Bretagne.','allions',"'Souvent' (often) + past = imparfait. Brittany is the most visited French region by French holidaymakers."),
  er(U6,'Il a voulu un café, mais il n\'y avait plus.','Il voulait un café, mais il n\'y en avait plus.',"Ongoing desire = imparfait 'voulait'. Also: 'il n\'y en avait plus' = there was none left. 'En' replaces 'de café'."),
  tr(U6,'fr-en','Elle travaillait dans une école à l\'époque.','She was working in a school at the time.',"'À l\'époque' = at the time. A common phrase for placing past states in context."),
  li(U6,'Le soleil se couchait et tout était calme.','The sun was setting and everything was calm.',"Two imperfects painting a scene. Literary — the imparfait is the tense of description and atmosphere."),
  tr(U6,'en-fr','I didn\'t know what to say.','Je ne savais pas quoi dire',"'Savoir' in imparfait = state of not knowing. 'Quoi dire' = what to say (indirect question with infinitive)."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 7 — "Getting Things Done"
// Modal verbs: pouvoir, devoir, vouloir in present and compound tenses
// ─────────────────────────────────────────────────────────────────────────────
const U7='a2-u7'
const a2u7Phrases:LessonPhrase[]=[
  {fr:'Je peux vous aider ?',en:'Can I help you?',note:"'Pouvoir' = to be able to/can. This is how shop assistants greet you in France — not 'bonjour' alone."},
  {fr:'Tu dois partir maintenant',en:'You must leave now',note:"'Devoir' = must/have to. Carries obligation. 'Tu dois' is informal — 'vous devez' in formal contexts."},
  {fr:'Nous voulons réserver',en:'We want to book',note:"'Vouloir' = to want. 'Nous voulons' sounds demanding — 'nous voudrions' (conditional) is more polite."},
  {fr:'Il n\'a pas pu venir',en:'He wasn\'t able to come',note:"Passé composé of pouvoir: n\'a pas pu. The impossibility is a completed fact."},
  {fr:'J\'ai dû partir tôt',en:'I had to leave early',note:"Passé composé of devoir: j\'ai dû. 'Dû' with a circumflex to distinguish it from 'du' (partitive article)."},
]
const a2u7Practice:LPQ[]=[
  tr(U7,'en-fr','Can you help me please?','Tu peux m\'aider s\'il te plaît',"'Pouvoir' + infinitive. Informal 'te' because 'tu' is used. In a shop, use 'vous pouvez m\'aider s\'il vous plaît'."),
  tr(U7,'fr-en','Elle doit travailler ce week-end.','She has to work this weekend.',"'Devoir' = must/have to. The absence of choice is implicit."),
  mc(U7,'\'Nous voudrions une table pour deux\' is:','more polite than \'nous voulons\'',['less polite than \'nous voulons\'','more polite than \'nous voulons\'','the same as \'nous voulons\'','incorrect French'],"The conditional 'voudrions' is the restaurant standard. 'Nous voulons' in a restaurant sounds like a demand, not a request."),
  ar(U7,'Build: \'I was not able to finish my homework\'','Je n\'ai pas pu finir mes devoirs',['Je','n\'ai','pas','pu','finir','mes','devoirs'],"Passé composé of pouvoir: n\'ai pas pu. 'Pu' is the past participle — irregular."),
  fi(U7,'Il ___ travailler tôt demain matin.','doit',"'Il doit' = he must. Third person singular of devoir. Followed by infinitive."),
  er(U7,'Je dois à partir maintenant.','Je dois partir maintenant.',"Never add 'à' between devoir and the infinitive. Modal verbs (devoir, pouvoir, vouloir) directly precede the infinitive."),
  li(U7,'J\'ai dû annuler ma réservation.','I had to cancel my reservation.',"'Ai dû' = passé composé of devoir. The circumflex on 'dû' distinguishes it from 'du' (some/of the)."),
  tr(U7,'fr-en','Vous ne pouvez pas stationner ici.','You cannot park here.',"A sign you\'ll see across France. 'Stationner' = to park (formal). 'Se garer' is the spoken equivalent."),
  mc(U7,'Choose the politest way to ask for something in a restaurant:','Je voudrais',['Je veux','Je voudrais','Donnez-moi','Je voulais'],"'Voudrais' (conditional) always wins for politeness. 'Je voulais' (imparfait) is sometimes used too but less natural here."),
  ar(U7,'Build: \'She had to take the first train\'','Elle a dû prendre le premier train',['Elle','a','dû','prendre','le','premier','train'],"'A dû' + infinitive = had to. 'Premier' (first) comes before the noun — one of the rare French pre-noun adjectives."),
  fi(U7,'Est-ce que vous ___ m\'indiquer le chemin ?','pouvez',"Polite direction-asking formula. 'Pouvez-vous' or 'est-ce que vous pouvez' — both formal and correct."),
  tr(U7,'en-fr','We wanted to go but we couldn\'t.','Nous voulions y aller mais nous n\'avons pas pu',"'Voulions' = imparfait (ongoing desire). 'N\'avons pas pu' = passé composé (specific moment of impossibility)."),
  er(U7,'Elle veut pas venir ce soir.','Elle ne veut pas venir ce soir.',"The 'ne' must always be written in formal/written French. Dropping it is very casual speech only."),
  li(U7,'Tu peux me passer le sel s\'il te plaît ?','Can you pass me the salt?',"The most common table request in France. Saying 'je veux le sel' would be considered rude — always 'tu peux' or 'tu pourrais'."),
  tr(U7,'fr-en','Nous avons voulu essayer un nouveau restaurant.','We wanted to try a new restaurant.',"'Avons voulu' = passé composé — a specific decision was made. Contrasts with 'nous voulions' (ongoing desire)."),
]
const a2u7Test:LPQ[]=[
  tr(U7,'en-fr','He had to take the bus because his car broke down.','Il a dû prendre le bus parce que sa voiture est tombée en panne',"'A dû' + infinitive. 'Tomber en panne' = to break down — literally 'to fall into breakdown'."),
  er(U7,'Vous devez à partir avant midi.','Vous devez partir avant midi.',"No 'à' after devoir. Direct modal + infinitive: devoir partir."),
  mc(U7,'\'Elle n\'a pas pu venir\' means:','She was unable to come (that time)',['She doesn\'t want to come','She was unable to come (that time)','She is not allowed to come','She should not come'],"Passé composé of pouvoir (negated) = inability on a specific occasion. Not permission, not desire."),
  tr(U7,'fr-en','Vous pouvez payer par carte ou en espèces.','You can pay by card or in cash.',"'En espèces' = in cash (literally \'in species\'). The distinction between card and cash is key in French daily transactions."),
  ar(U7,'Build: \'Do we have to reserve in advance?\'','Est-ce qu\'on doit réserver à l\'avance',['Est-ce','qu\'on','doit','réserver','à','l\'avance'],"'À l\'avance' = in advance. 'On doit' = we must (informal we). Essential question for any popular French restaurant."),
  fi(U7,'Je ___ pas finir le repas — c\'était trop grand.','n\'ai pas pu',"'N\'ai pas pu' = was unable to. The full passé composé negative of pouvoir."),
  er(U7,'Nous voulu réserver une chambre.','Nous avons voulu réserver une chambre.',"'Vouloir' needs the auxiliary 'avoir' in the passé composé. Never drop the auxiliary."),
  tr(U7,'fr-en','Tu dois appeler avant de venir.','You have to call before coming.',"'Avant de' + infinitive = before doing. A very frequent construction in French daily planning."),
  li(U7,'Je n\'ai pas pu dormir à cause du bruit.','I couldn\'t sleep because of the noise.',"'À cause de' = because of. A classic Parisian night complaint — sirens, neighbours, celebrations."),
  tr(U7,'en-fr','She wanted to speak but she couldn\'t.','Elle voulait parler mais elle n\'a pas pu',"'Voulait' = imparfait (she wanted, ongoing). 'N\'a pas pu' = passé composé (a specific moment of impossibility)."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 8 — "Who Are They?"
// Describing people: adjectives, physical and personality
// ─────────────────────────────────────────────────────────────────────────────
const U8='a2-u8'
const a2u8Phrases:LessonPhrase[]=[
  {fr:'Il est grand et mince',en:'He is tall and slim',note:"Physical descriptions. Both adjectives go AFTER être — no placement ambiguity here."},
  {fr:'Elle a les cheveux bruns',en:'She has dark brown hair',note:"'Avoir' for physical features (hair, eyes). 'Les cheveux' = hair (always plural in French). 'Brun' ≠ brown eyes — that's 'marron'."},
  {fr:'Il a l\'air sympa',en:'He seems nice',note:"'Avoir l\'air' = to seem/look. Followed by an adjective. 'L\'air' stays masculine even when describing a woman: elle a l\'air fatiguée."},
  {fr:'Elle est très souriante',en:'She is very smiley / warm',note:"'Souriant/e' = smiley, with a warm disposition. From 'sourire' (to smile). A high-value adjective in French social vocabulary."},
  {fr:'Il a la quarantaine',en:'He is in his forties',note:"'Avoir la trentaine/quarantaine/cinquantaine' — approximate age expressions. Far more common in French than stating exact age."},
]
const a2u8Practice:LPQ[]=[
  tr(U8,'en-fr','She has long blonde hair.','Elle a les cheveux longs et blonds',"Hair is always 'les cheveux' (plural). Adjectives agree: longs (m.pl) and blonds (m.pl) because 'cheveux' is masculine plural."),
  tr(U8,'fr-en','Il a l\'air fatigué aujourd\'hui.','He seems tired today.',"'Avoir l\'air' + adjective. 'Fatigué' stays masculine because 'l\'air' is masculine, even if the person is female."),
  mc(U8,'Which is correct for \'she seems intelligent\'?','Elle a l\'air intelligente',['Elle a l\'air intelligent','Elle a l\'air intelligente','Elle est l\'air intelligente','Elle semble intelligente'],"Both 'elle a l\'air intelligente' AND 'elle a l\'air intelligent' are accepted, but the feminine form is increasingly preferred. 'Elle semble intelligente' is also correct."),
  ar(U8,'Build: \'My sister has brown eyes and curly hair\'','Ma sœur a les yeux marron et les cheveux bouclés',['Ma','sœur','a','les','yeux','marron','et','les','cheveux','bouclés'],"'Marron' for eyes (invariable, like the colour). 'Bouclés' = curly, agrees with 'cheveux' (m.pl)."),
  fi(U8,'Il est grand et il a les cheveux ___.','courts',"'Courts' = short (m.pl), agreeing with 'cheveux'. 'Longs' (long), 'courts' (short), 'mi-longs' (medium-length)."),
  er(U8,'Elle a les yeux bleus et les cheveux courts et blonde.','Elle a les yeux bleus et les cheveux courts et blonds.',"'Cheveux' is masculine plural → 'blonds' not 'blonde'. The most common gender error in physical descriptions."),
  li(U8,'Il a la cinquantaine et il est très élégant.','He is in his fifties and very elegant.',"'Avoir la cinquantaine' = approximate age. Elegant appearance is highly valued in French culture — dressing well is a form of respect."),
  tr(U8,'fr-en','Mon collègue est très travailleur et fiable.','My colleague is very hard-working and reliable.',"'Travailleur' = hard-working (from 'travailler'). 'Fiable' = reliable. Two key workplace vocabulary adjectives."),
  mc(U8,'Which adjective pair is NOT a true opposite in French?','grand / gros',['grand / petit','beau / laid','sympa / antipathique','grand / gros'],"'Grand' = tall/big, 'gros' = fat/large — different dimensions entirely. 'Petit' is the true opposite of 'grand'."),
  ar(U8,'Build: \'She seems very kind and patient\'','Elle a l\'air très gentille et patiente',['Elle','a','l\'air','très','gentille','et','patiente'],"'Gentille' = kind (feminine of 'gentil' — double l in feminine). 'Patiente' = patient."),
  fi(U8,'Mon voisin est très ___ — il dit toujours bonjour.','sympa',"'Sympa' = short for sympathique. Perhaps the most commonly used positive descriptor in French daily speech."),
  tr(U8,'en-fr','He looks about thirty years old.','Il a l\'air d\'avoir la trentaine',"'Avoir l\'air de' + infinitive = to appear to. 'Avoir la trentaine' = to be in one\'s thirties."),
  er(U8,'Elle est les cheveux noirs et les yeux verts.','Elle a les cheveux noirs et les yeux verts.',"Physical features use 'avoir' (not 'être'). You have physical attributes — you don\'t be them."),
  li(U8,'Il est plutôt discret mais très généreux.','Rather discreet but very generous.',"'Plutôt' = rather/quite. 'Discret' = discreet, reserved. A personality pairing valued in French culture — quiet generosity."),
  tr(U8,'fr-en','Elle a une personnalité très attachante.','She has a very endearing personality.',"'Attachant/e' = endearing, likeable — literally 'that attaches/binds you'. A warm adjective with no single English equivalent."),
]
const a2u8Test:LPQ[]=[
  tr(U8,'en-fr','She has short black hair and green eyes.','Elle a les cheveux courts et noirs et les yeux verts',"All agreements: cheveux (m.pl) → courts, noirs. Yeux (m.pl) → verts."),
  er(U8,'Il a l\'air sympa et souriante.','Il a l\'air sympa et souriant.',"The adjective after 'avoir l\'air' should agree with the person. He ('il') → 'souriant' not 'souriante'."),
  tr(U8,'fr-en','Mon patron a la quarantaine et il est très dynamique.','My boss is in his forties and very dynamic.',"'Dynamique' is invariable — same for m/f. Dynamic energy is valued in French management culture."),
  mc(U8,'How do you describe someone as \'in their twenties\'?','Elle a la vingtaine',['Elle a vingt ans','Elle est vingtaine','Elle a la vingtaine','Elle est dans les vingt'],"'Avoir la vingtaine' = to be approximately in one\'s twenties. A polite way to avoid stating someone\'s exact age."),
  ar(U8,'Build: \'He seems tired but he is smiling\'','Il a l\'air fatigué mais il sourit',['Il','a','l\'air','fatigué','mais','il','sourit'],"'L\'air fatigué' (avoir l\'air + adjective) + 'il sourit' (present of sourire). Two contrasting observations."),
  fi(U8,'Elle est grande, mince et très ___ dans sa façon de s\'habiller.','élégante',"'Élégante' = elegant (feminine). French fashion literacy is embedded in the vocabulary of description."),
  er(U8,'Il a les cheveux brun et les yeux verte.','Il a les cheveux bruns et les yeux verts.',"Both adjectives must be masculine plural: bruns (for cheveux m.pl) and verts (for yeux m.pl)."),
  tr(U8,'fr-en','Elle est très drôle — elle me fait toujours rire.','She is very funny — she always makes me laugh.',"'Drôle' = funny. 'Faire rire' = to make laugh. 'Me fait rire' = makes me laugh."),
  li(U8,'Il est de taille moyenne et plutôt réservé.','Average height and rather reserved.',"'De taille moyenne' = of average height. A common way to start a description without extremes."),
  tr(U8,'en-fr','My friend is very funny and always cheerful.','Mon ami est très drôle et toujours gai',"'Gai' = cheerful, happy. Also now has a secondary meaning — context usually makes the intended meaning clear."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 9 — "The Journey"
// Transport, travel vocabulary, asking for information
// ─────────────────────────────────────────────────────────────────────────────
const U9='a2-u9'
const a2u9Phrases:LessonPhrase[]=[
  {fr:'Le prochain train part à quelle heure ?',en:'What time does the next train leave?',note:"The essential SNCF question. 'Prochain' before the noun for transport: le prochain train, la prochaine correspondance."},
  {fr:'Un aller-retour pour Lyon',en:'A return ticket to Lyon',note:"'Aller-retour' = there and back. 'Aller simple' = one way. Always state your destination after 'pour'."},
  {fr:'Il faut changer à Marseille',en:'You have to change at Marseille',note:"'Il faut' + infinitive = one must/it is necessary to. Impersonal — no subject. 'Changer' = to change trains."},
  {fr:'Le quai numéro cinq',en:'Platform five',note:"'Le quai' = the platform (literally 'the quay'). French station announcements always reference 'le quai' and 'la voie'."},
  {fr:'En retard de vingt minutes',en:'Twenty minutes late',note:"Standard SNCF delay announcement. 'Avoir X minutes de retard' — the structure uses 'avoir', not 'être'."},
]
const a2u9Practice:LPQ[]=[
  tr(U9,'en-fr','A return ticket to Paris please.','Un aller-retour pour Paris s\'il vous plaît',"The most-uttered sentence at French train station ticket windows."),
  tr(U9,'fr-en','Le TGV pour Bordeaux a du retard.','The TGV to Bordeaux is delayed.',"'Avoir du retard' = to be delayed. The TGV (Train à Grande Vitesse) connects Paris-Bordeaux in 2h04 since 2017."),
  mc(U9,'How do you ask for a platform number?','C\'est quel quai ?',['Où est le train ?','C\'est quel quai ?','Quel numéro de gare ?','Le train est où ?'],"'C\'est quel quai ?' = which platform is it? The quickest practical question at any French station."),
  ar(U9,'Build: \'Do I have to change trains?\'','Est-ce qu\'il faut changer de train',['Est-ce','qu\'il','faut','changer','de','train'],"'Il faut' is impersonal — never 'je faut'. 'Changer de' + vehicle for switching transport."),
  fi(U9,'Le prochain métro ___ dans trois minutes.','arrive',"Departure boards always show 'arrive dans X minutes'. The metro is the most used urban transport in France."),
  er(U9,'Je voudrais un ticket aller-simple pour Lyon.','Je voudrais un billet aller simple pour Lyon.',"'Billet' = train/plane ticket. 'Ticket' = metro/bus ticket. Never use 'ticket' for a train. Also: 'aller simple' (no hyphen)."),
  li(U9,'Votre train est annoncé voie 4.','Your train is announced on track 4.',"'Voie' = track (the rail itself). 'Quai' = platform (where you stand). French announcements use both — know the difference."),
  tr(U9,'fr-en','Il faut composter son billet avant de monter dans le train.','You must validate your ticket before getting on the train.',"Critical! French trains require validation ('composter') before boarding. Not doing so = fine. The yellow machines are on every platform."),
  mc(U9,'\'Composter\' a ticket means:','To validate it in the machine',['To buy it','To validate it in the machine','To cancel it','To upgrade it'],"The yellow composting machines on French platforms are mandatory. Inspectors check religiously. 'J\'ai oublié de composter' is not accepted as an excuse."),
  ar(U9,'Build: \'The Lyon train leaves from platform 3 in 10 minutes\'','Le train pour Lyon part du quai 3 dans dix minutes',['Le','train','pour','Lyon','part','du','quai','3','dans','dix','minutes'],"'Du quai' = de + le quai (mandatory contraction). 'Dans dix minutes' = in ten minutes."),
  fi(U9,'Le vol est ___ de quarante minutes.','en retard',"'En retard de' + time = delayed by. Essential for airport announcements."),
  tr(U9,'en-fr','I missed my connection.','J\'ai raté ma correspondance',"'Rater' = to miss (informal). 'Manquer' also works but 'rater' is more spoken. 'Correspondance' = connection (literally 'correspondence')."),
  er(U9,'Est-ce qu\'il y a une correspondance à Lyon ?','Est-ce qu\'il faut une correspondance à Lyon ?',"'Il y a une correspondance' = there is a connection (factual). 'Il faut une correspondance' = a connection is required (necessary). Completely different meaning."),
  li(U9,'Attention à la fermeture automatique des portes.','Mind the automatic door closing.',"The most-heard phrase on French metro and trains. 'Attention' = watch out. 'Fermeture' = closing (from fermer)."),
  tr(U9,'fr-en','Le train a vingt minutes de retard suite à un incident technique.','The train is twenty minutes late due to a technical incident.',"SNCF's most common announcement. 'Suite à' = following/due to. 'Incident technique' = the diplomatic term for breakdown."),
]
const a2u9Test:LPQ[]=[
  tr(U9,'en-fr','I would like a one-way ticket to Marseille.','Je voudrais un billet aller simple pour Marseille',"'Aller simple' (no hyphen, unlike aller-retour). 'Billet' not 'ticket' for trains."),
  er(U9,'J\'ai oublié de composter — c\'est un ticket.','J\'ai oublié de composter — c\'est un billet.',"Train tickets are 'billets', not 'tickets'. The distinction matters legally as well as linguistically."),
  mc(U9,'\'Il faut changer à Paris\' means:','You must change trains in Paris',['The train stops in Paris','You must change trains in Paris','The train is cancelled in Paris','Paris is the final stop'],"'Il faut' = one must. 'Changer' = change trains. 'À Paris' = at Paris (station)."),
  tr(U9,'fr-en','Le train a dix minutes de retard à cause d\'un incident de voyageur.','The train is ten minutes late due to a passenger incident.',"SNCF\'s euphemism for a medical emergency or suicide on the tracks. One of the most common delay reasons in France."),
  ar(U9,'Build: \'What time does the next train to Paris leave?\'','À quelle heure part le prochain train pour Paris',['À','quelle','heure','part','le','prochain','train','pour','Paris'],"Inversion for questions: 'part le train' instead of 'le train part'. 'Prochain' goes before the noun in transport contexts."),
  fi(U9,'Il faut ___ son billet avant de monter.','composter',"The golden rule of French rail travel. 'Composter' = to validate in the yellow machine. Inspectors fine without mercy."),
  er(U9,'Le train part du voie 7.','Le train part du quai 7.',"'Quai' = platform. 'Voie' = track. Departure boards show 'quai' for where passengers stand."),
  tr(U9,'fr-en','J\'ai raté mon train à cause des bouchons.','I missed my train because of traffic jams.',"'Rater' = to miss. 'À cause de' = because of. 'Bouchons' = traffic. The quintessential Paris commuter excuse."),
  li(U9,'Prochain arrêt : Châtelet - Les Halles.','Next stop: Châtelet Les Halles.',"The largest underground station in the world — 5 metro lines, 3 RER lines, and hundreds of thousands of daily passengers."),
  tr(U9,'en-fr','The train from Bordeaux is arriving on platform 6.','Le train en provenance de Bordeaux arrive au quai 6',"'En provenance de' = coming from (formal announcement language). 'Au quai' = à + le quai."),
]

// ─────────────────────────────────────────────────────────────────────────────
// A2 Unit 10 — "Home Sweet Home"
// Housing, furniture, rooms, giving your address
// ─────────────────────────────────────────────────────────────────────────────
const U10='a2-u10'
const a2u10Phrases:LessonPhrase[]=[
  {fr:'J\'habite dans un appartement',en:'I live in a flat',note:"'Dans un appartement' — always 'dans' for housing types. Never 'en appartement'. The majority of French urban dwellers rent."},
  {fr:'Au deuxième étage',en:'On the third floor (UK) / third floor (US)',note:"France uses 'rez-de-chaussée' for ground floor, then 'premier étage' = 1st floor above ground. Always one floor higher than UK."},
  {fr:'La salle de séjour',en:'The living room',note:"Also 'le salon' in casual speech. 'Séjour' = stay — the room where you linger. 'Salon' is more formal, 'séjour' is practical."},
  {fr:'Chez moi',en:'At my place / my home',note:"'Chez' + person = at someone\'s home/place. 'Chez moi' (my place), 'chez toi' (your place), 'chez le médecin' (at the doctor\'s)."},
  {fr:'Les charges comprises',en:'Bills included',note:"Essential for renting in France. 'Charges' = utility costs. 'CC' (charges comprises) in French property listings means utilities are included."},
]
const a2u10Practice:LPQ[]=[
  tr(U10,'en-fr','I live in a flat on the second floor.','J\'habite dans un appartement au deuxième étage',"'Au deuxième étage' = UK 3rd floor, US 3rd floor. French count from 'rez-de-chaussée' (ground)."),
  tr(U10,'fr-en','La cuisine est en face de la salle de bains.','The kitchen is opposite the bathroom.',"'En face de' = opposite/facing. 'La salle de bains' = the bathroom (literally 'bath room')."),
  mc(U10,'What does \'chez moi\' mean?','At my place',['In my house','At my place','My home address','My neighbourhood'],"'Chez' + person = at someone\'s place. 'Chez moi' literally means \'at the home of me\'. No preposition \'à\' needed."),
  ar(U10,'Build: \'There are three bedrooms and a garden\'','Il y a trois chambres et un jardin',['Il','y','a','trois','chambres','et','un','jardin'],"'Chambres' = bedrooms (not 'rooms' in general). 'Pièces' = rooms (general). 'Il y a trois pièces' = 3 rooms total."),
  fi(U10,'Notre appartement est ___ rez-de-chaussée.','au',"'Au rez-de-chaussée' = on the ground floor. 'Au' = à + le. 'Rez-de-chaussée' = literally 'level of the road surface'."),
  er(U10,'J\'habite en appartement au troisième.','J\'habite dans un appartement au troisième.',"'Dans un appartement' — always use 'dans un/une' for housing types. 'En appartement' is incorrect."),
  li(U10,'L\'appartement fait quatre-vingts mètres carrés.','80 square metres.',"'Mètres carrés' (m²) = square metres. French flats are described in m². 80m² is considered comfortable for a Paris flat."),
  tr(U10,'fr-en','On cherche une maison avec un grand jardin.','We are looking for a house with a big garden.',"'On cherche' = informal we are looking. French dream: 'la maison avec jardin'. City dwellers prize outdoor space enormously."),
  mc(U10,'\'Les charges comprises\' in a rental listing means:','Bills are included in the rent',['The flat is furnished','Bills are included in the rent','The deposit is included','Parking is included'],"'CC' (charges comprises) is standard notation in French rental listings. It means water, heating etc. are in the stated price."),
  ar(U10,'Build: \'My bedroom is next to the living room\'','Ma chambre est à côté du salon',['Ma','chambre','est','à','côté','du','salon'],"'Du salon' = de + le salon (masculine). 'À côté de' = next to, always followed by 'de'."),
  fi(U10,'La salle de ___ est à gauche de la cuisine.','bains',"'La salle de bains' = the bathroom. 'La salle de séjour' = the living room. Two very different rooms — don't confuse them."),
  tr(U10,'en-fr','Come over to mine this evening.','Viens chez moi ce soir',"'Venir chez moi' = to come to my place. The 'chez' construction replaces 'à ma maison' completely."),
  er(U10,'Il habite dans le quatrième étage.','Il habite au quatrième étage.',"'Au' (not 'dans le') for floor numbers. Always: 'au rez-de-chaussée', 'au premier étage', 'au deuxième', etc."),
  li(U10,'Le loyer est de mille euros charges comprises.','1000 euros including bills.',"'Le loyer' = rent. 'De mille euros' = of 1000 euros. A realistic Paris rent for a studio (25–30m²) in 2024."),
  tr(U10,'fr-en','Le salon est lumineux et le balcon donne sur la cour.','The living room is bright and the balcony overlooks the courtyard.',"'Lumineux' = bright/light-filled. A top property selling point in France. 'Donner sur' = to overlook/face."),
]
const a2u10Test:LPQ[]=[
  tr(U10,'en-fr','I live on the ground floor.','J\'habite au rez-de-chaussée',"'Au rez-de-chaussée' — the most French of French floors. Literally 'at the level of the road surface'."),
  er(U10,'Nous cherchons un appartement dans le deuxième étage.','Nous cherchons un appartement au deuxième étage.',"Floor numbers use 'au' (à + le), not 'dans le'. Always: 'au premier étage', 'au deuxième étage'."),
  mc(U10,'How many rooms does \'un F3\' have in a French listing?','3 rooms (plus kitchen and bathroom)',['3 bedrooms','3 rooms (plus kitchen and bathroom)','3 floors','3 windows'],"French listings use F1, F2, F3 etc. 'F3' = 3 rooms (pièces) + separate kitchen + bathroom. A 'T3' is the same thing."),
  tr(U10,'fr-en','La cuisine est équipée et la salle à manger est spacieuse.','The kitchen is fitted and the dining room is spacious.',"'Cuisine équipée' = fitted kitchen (key selling point). 'Salle à manger' = dining room — literally 'room to eat'."),
  ar(U10,'Build: \'We are looking for a furnished flat\'','Nous cherchons un appartement meublé',['Nous','cherchons','un','appartement','meublé'],"'Meublé' = furnished. 'Non meublé' = unfurnished. In France, furnished rentals ('location meublée') have different legal rules."),
  fi(U10,'Il y a quatre ___ dans notre appartement.','pièces',"'Pièces' = rooms in general (for counting). 'Chambres' = specifically bedrooms. Un F4 = 'quatre pièces'."),
  er(U10,'Je vais chez mon maison ce soir.','Je rentre chez moi ce soir.',"'Chez moi' already means 'my home' — never 'chez mon maison'. Also 'rentrer chez soi' is more natural than 'aller chez moi'."),
  tr(U10,'fr-en','Le loyer est de 800 euros par mois, charges comprises.','The rent is 800 euros per month, bills included.',"The complete rental specification. 'Par mois' = per month. 'CC' = charges comprises."),
  li(U10,'L\'appartement est au cinquième sans ascenseur.','5th floor with no lift.',"'Sans ascenseur' = no lift. The words every Paris apartment-hunter dreads. Responsible for thousands of calves in excellent condition."),
  tr(U10,'en-fr','I will see you at your place at eight.','Je te retrouve chez toi à vingt heures',"'Chez toi' = at your place. 'Je te retrouve' = I\'ll meet you. 'Vingt heures' = 8 PM in 24h clock."),
]

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const A2_LESSON_PLANS_EXTENDED: Record<string,LessonPlanData> = {
  'a2-u4':  { title:'Life in the City',      theme:'Urban vocabulary, prepositions of place, city life',  phrases:a2u4Phrases,  practice:a2u4Practice,  test:a2u4Test },
  'a2-u5':  { title:'Likes & Dislikes',      theme:'Preferences, opinions, comparatives (meilleur/mieux)', phrases:a2u5Phrases,  practice:a2u5Practice,  test:a2u5Test },
  'a2-u6':  { title:'The Memory Palace',     theme:'Imparfait — past states, habits, descriptions',       phrases:a2u6Phrases,  practice:a2u6Practice,  test:a2u6Test },
  'a2-u7':  { title:'Getting Things Done',   theme:'Pouvoir, devoir, vouloir — modals in all tenses',     phrases:a2u7Phrases,  practice:a2u7Practice,  test:a2u7Test },
  'a2-u8':  { title:'Who Are They?',         theme:'Describing people — physical and personality',         phrases:a2u8Phrases,  practice:a2u8Practice,  test:a2u8Test },
  'a2-u9':  { title:'The Journey',           theme:'Transport, SNCF, travel vocabulary, validation',      phrases:a2u9Phrases,  practice:a2u9Practice,  test:a2u9Test },
  'a2-u10': { title:'Home Sweet Home',       theme:'Housing, rooms, floor numbers, renting in France',    phrases:a2u10Phrases, practice:a2u10Practice, test:a2u10Test },
}
