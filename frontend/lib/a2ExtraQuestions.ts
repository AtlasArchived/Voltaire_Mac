/**
 * A2 Expanded Question Bank
 * Standalone drill questions supplementing the lesson plan auto-generated content.
 * Covers: passé composé, futur proche, imparfait, modals, preferences, city, travel, housing.
 * Import and spread into QUESTION_BANK in questionBank.ts.
 */
import type { McqQ, ArrQ, ListQ, TransQ, DrillQ } from './questionBank'

// Helper wrappers
const tr = (cefr:'A2', u:string, d:'fr-en'|'en-fr', p:string, a:string, n=''):TransQ =>
  ({type:'translate',cefr,unitId:u,lessonType:'vocab_intro',direction:d,prompt:p,answer:a,note:n})
const mc = (cefr:'A2', u:string, p:string, a:string, o:string[], n=''):McqQ =>
  ({type:'mcq',cefr,unitId:u,lessonType:'unit_review',prompt:p,answer:a,options:o,note:n})
const ar = (cefr:'A2', u:string, p:string, a:string, w:string[], n=''):ArrQ =>
  ({type:'arrange',cefr,unitId:u,lessonType:'grammar_focus',prompt:p,answer:a,words:w,note:n})
const li = (cefr:'A2', u:string, at:string, a:string, n=''):ListQ =>
  ({type:'listen',cefr,unitId:u,lessonType:'fluency_drill',prompt:'Listen and type:',audioText:at,answer:a,note:n})

const L = 'A2' as const

export const A2_EXTRA_QUESTIONS: DrillQ[] = [

  // ── A2-U1: Passé composé ──────────────────────────────────────────────────
  tr(L,'a2-u1','en-fr','I read the whole book yesterday.','J\'ai lu tout le livre hier','Lire → lu. Irregular. \'Tout le livre\' = the whole book.'),
  ar(L,'a2-u1','Build: \'They finished the project last week\'','Ils ont fini le projet la semaine dernière',['Ils','ont','fini','le','projet','la','semaine','dernière'],'Finir = regular -ir → fini. \'La semaine dernière\' = last week.'),
  mc(L,'a2-u1','Past participle of \'voir\' (to see):','vu',['voyé','vu','voir','vis'],'Voir → vu. One of the 20 essential irregular participles.'),
  tr(L,'a2-u1','fr-en','Nous avons attendu pendant une heure.','We waited for an hour.','Attendre → attendu (regular -re). \'Pendant\' = for (duration in the past).'),
  li(L,'a2-u1','J\'ai oublié mon parapluie à la maison.','I forgot my umbrella at home.','Oublier → oublié. \'Parapluie\' = umbrella — literally \'for rain\'.'),
  tr(L,'a2-u1','en-fr','She called me this morning.','Elle m\'a appelé ce matin','Appeler → appelé. \'M\'a\' = has me (called). Object pronoun before the auxiliary.'),
  mc(L,'a2-u1','Which is the passé composé of \'écrire\'?','J\'ai écrit',['J\'ai écris','J\'ai écrit','J\'écrit','J\'ai écrire'],'Écrire → écrit (irregular). Think: inscription.'),
  ar(L,'a2-u1','Build: \'Did you understand the lesson?\'','Tu as compris la leçon',['Tu','as','compris','la','leçon'],'Comprendre → compris. Irregular. Essential academic verb.'),

  // ── A2-U2: Futur proche ───────────────────────────────────────────────────
  tr(L,'a2-u2','en-fr','We are going to visit the Eiffel Tower tomorrow.','Nous allons visiter la Tour Eiffel demain','Near future + famous landmark. Always \'la Tour Eiffel\', never without the article.'),
  ar(L,'a2-u2','Build: \'It\'s going to be a long day\'','Ça va être une longue journée',['Ça','va','être','une','longue','journée'],'\'Longue\' goes BEFORE journée — BAGS adjective (beauty, age, goodness, size).'),
  mc(L,'a2-u2','Near future of \'vous finissez\':','Vous allez finir',['Vous allez finissez','Vous allez finir','Vous finirez','Vous allons finir'],'Always: subject + conjugated aller + infinitive. Never conjugate the second verb.'),
  li(L,'a2-u2','On va se revoir bientôt.','We\'ll see each other again soon.','\'Se revoir\' = reflexive infinitive. \'On va\' = informal near future.'),
  tr(L,'a2-u2','fr-en','Tu vas me manquer.','I am going to miss you.','The French \'manquer\' is backwards: \'Tu vas me manquer\' = you are going to be missed by me.'),
  ar(L,'a2-u2','Build: \'She\'s not going to come to the party\'','Elle ne va pas venir à la soirée',['Elle','ne','va','pas','venir','à','la','soirée'],'Negation wraps around \'va\': ne...pas. The infinitive stays after \'pas\'.'),

  // ── A2-U3: Hotels & Travel ────────────────────────────────────────────────
  tr(L,'a2-u3','en-fr','Could we have a room on the quiet side?','Nous pourrions avoir une chambre côté calme','\'Côté calme\' = on the quiet side. Premium request in noisy city hotels.'),
  mc(L,'a2-u3','What does \'la demi-pension\' mean?','Half board (breakfast + dinner)',['Breakfast only','Half board (breakfast + dinner)','Full board','Self catering'],'\'Demi-pension\' = half board. \'Pension complète\' = full board. \'Chambre seule\' = room only.'),
  li(L,'a2-u3','Votre chambre sera prête à partir de quinze heures.','Your room will be ready from 3pm.','\'Sera prête\' = future tense (will be ready). \'À partir de\' = from (a time onwards).'),
  tr(L,'a2-u3','fr-en','Le petit-déjeuner est servi jusqu\'à dix heures.','Breakfast is served until ten o\'clock.','\'Jusqu\'à\' = until. \'Servi\' = served (past participle as adjective).'),
  ar(L,'a2-u3','Build: \'I have a reservation under the name Dupont\'','J\'ai une réservation au nom de Dupont',['J\'ai','une','réservation','au','nom','de','Dupont'],'\'Au nom de\' = in the name of. The essential hotel check-in phrase.'),

  // ── A2-U4: City Life ──────────────────────────────────────────────────────
  tr(L,'a2-u4','en-fr','There is a metro strike today.','Il y a une grève de métro aujourd\'hui','\'Grève\' = strike. France has the most strike days in Europe per year. Very practical vocabulary.'),
  mc(L,'a2-u4','What is \'le vélib\'?','A Paris bike-sharing scheme',['A Paris taxi service','A Paris bike-sharing scheme','A Paris metro line','A Paris bus pass'],'\'Vélib\'\' = vélo (bike) + liberté (freedom). Paris\'s pioneering self-service bike system, launched 2007.'),
  li(L,'a2-u4','Le quartier est très animé le soir.','The neighbourhood is very lively in the evening.','\'Animé\' = lively, buzzing. From \'animer\' (to liven up).'),
  ar(L,'a2-u4','Build: \'I take the metro to avoid traffic jams\'','Je prends le métro pour éviter les bouchons',['Je','prends','le','métro','pour','éviter','les','bouchons'],'\'Pour éviter\' = in order to avoid. \'Les bouchons\' = traffic jams.'),
  tr(L,'a2-u4','fr-en','Le marché bio a lieu tous les dimanches matin.','The organic market takes place every Sunday morning.','\'Avoir lieu\' = to take place. \'Bio\' = organic — short for biologique.'),

  // ── A2-U5: Likes & Dislikes ───────────────────────────────────────────────
  tr(L,'a2-u5','en-fr','I really can\'t stand queuing.','J\'ai vraiment horreur de faire la queue','\'Avoir horreur de\' + infinitive = intense dislike. Queuing is a shared national frustration.'),
  mc(L,'a2-u5','\'Mieux\' vs \'meilleur\' — which is used with verbs?','mieux',['meilleur','mieux','plus bien','le mieux'],'\'Mieux\' = better (adverb, with verbs). \'Meilleur\' = better (adjective, with nouns).'),
  ar(L,'a2-u5','Build: \'She prefers summer to winter\'','Elle préfère l\'été à l\'hiver',['Elle','préfère','l\'été','à','l\'hiver'],'\'Préférer\' + noun + à + noun. No \'que\' — that\'s only for comparisons of quantity.'),
  tr(L,'a2-u5','fr-en','Ce film m\'a vraiment plu.','I really liked this film.','\'A plu\' = passé composé of plaire. The film pleased me (past tense).'),
  li(L,'a2-u5','Je préfère lire plutôt que regarder la télé.','I prefer reading to watching TV.','\'Plutôt que\' + infinitive = rather than. \'Lire\' = to read.'),

  // ── A2-U6: Imparfait ──────────────────────────────────────────────────────
  tr(L,'a2-u6','en-fr','The streets were empty and it was raining.','Les rues étaient vides et il pleuvait','Two imperfects describing a scene — both ongoing states/conditions.'),
  mc(L,'a2-u6','\'Je lisais quand le téléphone a sonné\' — why imparfait for \'lisais\'?','It was an ongoing background action',['It happened once','It was an ongoing background action','It happened before \'a sonné\'','It is more polite'],'Imparfait for ongoing background + passé composé for the interrupting event. The cornerstone of French past-tense storytelling.'),
  ar(L,'a2-u6','Build: \'As a child she used to love dancing\'','Enfant elle adorait danser',['Enfant','elle','adorait','danser'],'\'Enfant\' as a time marker triggers imparfait. \'Adorait\' = imperfect of adorer.'),
  li(L,'a2-u6','Quand nous étions étudiants nous sortions tous les soirs.','When we were students we went out every night.','\'Sortions\' = imparfait of sortir. \'Tous les soirs\' (every evening) guarantees imparfait.'),
  tr(L,'a2-u6','fr-en','Il faisait beau et les enfants jouaient dans le jardin.','The weather was nice and the children were playing in the garden.','Classic imparfait scene-setting. Both actions simultaneously ongoing.'),

  // ── A2-U7: Modals ─────────────────────────────────────────────────────────
  tr(L,'a2-u7','en-fr','Could you speak more slowly please?','Vous pourriez parler plus lentement s\'il vous plaît','\'Pourriez\' = conditional of pouvoir. Infinitely more polite than \'pouvez\'. Ideal for language learners.'),
  ar(L,'a2-u7','Build: \'She had to cancel her appointment\'','Elle a dû annuler son rendez-vous',['Elle','a','dû','annuler','son','rendez-vous'],'\'A dû\' = passé composé of devoir. \'Rendez-vous\' = appointment (also the English borrowing).'),
  mc(L,'a2-u7','\'Je voulais te demander quelque chose\' means:','I wanted to ask you something (polite softening)',['I demanded something','I want to ask you something','I wanted to ask you something (polite softening)','I had to ask'],'Using imparfait \'voulais\' softens a request — less direct than \'je veux\'. A key French politeness strategy.'),
  tr(L,'a2-u7','fr-en','Nous n\'avons pas pu nous garer près du restaurant.','We couldn\'t park near the restaurant.','\'N\'avons pas pu\' = couldn\'t (specific occasion). Parking near French restaurants is famously difficult.'),
  li(L,'a2-u7','Tu devrais aller chez le médecin.','You should go to the doctor.','\'Devrais\' = conditional of devoir (should). More advice-giving than \'dois\' (must).'),

  // ── A2-U8: Describing people ──────────────────────────────────────────────
  tr(L,'a2-u8','en-fr','She has shoulder-length hair.','Elle a les cheveux mi-longs','\'Mi-longs\' = mid-length (shoulder-length). The \'mi-\' prefix = half/mid in many French compounds.'),
  mc(L,'a2-u8','\'Il a l\'air intelligent\' OR \'Il a l\'air intelligente\' — describing a man:','Il a l\'air intelligent',['Il a l\'air intelligente','Il a l\'air intelligent','Both are correct','Neither is correct'],'When describing a man, the adjective after \'avoir l\'air\' agrees with the man → masculine.'),
  ar(L,'a2-u8','Build: \'He has a kind face and a warm smile\'','Il a un visage bienveillant et un sourire chaleureux',['Il','a','un','visage','bienveillant','et','un','sourire','chaleureux'],'\'Bienveillant\' = kind/benevolent. \'Chaleureux\' = warm (literally having warmth).'),
  tr(L,'a2-u8','fr-en','Elle est très extravertie et aime rencontrer du monde.','She is very extroverted and loves meeting people.','\'Du monde\' = people (some people/the world). \'Rencontrer du monde\' = to meet people.'),
  li(L,'a2-u8','Il est d\'une patience à toute épreuve.','He has rock-solid patience.','\'À toute épreuve\' = unshakeable (literally \'to every test\'). Idiomatic — a mark of true fluency to use this.'),

  // ── A2-U9: Transport ──────────────────────────────────────────────────────
  tr(L,'a2-u9','en-fr','The train on platform 2 is cancelled.','Le train au quai 2 est annulé','\'Annulé\' = cancelled. Platform 2 → \'au quai 2\' (au = à + le).'),
  ar(L,'a2-u9','Build: \'I need a ticket to Lyon for tomorrow morning\'','J\'ai besoin d\'un billet pour Lyon pour demain matin',['J\'ai','besoin','d\'un','billet','pour','Lyon','pour','demain','matin'],'Two \'pour\': one for destination, one for time. Both correct here.'),
  mc(L,'a2-u9','On the TGV, \'la première classe\' means:','First class (more expensive, more space)',['First train of the day','First class (more expensive, more space)','First carriage','Platform one'],'First class (Première) on the TGV offers wider seats, power outlets, and a quieter environment.'),
  li(L,'a2-u9','Le train au départ de Paris arrive à Lyon à 14h22.','Train from Paris arrives in Lyon at 14:22.','\'Au départ de\' = departing from. SNCF timetables use 24h clock without exception.'),
  tr(L,'a2-u9','fr-en','Je voudrais une place côté fenêtre dans la voiture 12.','I would like a window seat in carriage 12.','\'Côté fenêtre\' = window side. \'La voiture\' = the carriage (not the car — \'la voiture\' is context-dependent).'),

  // ── A2-U10: Housing ───────────────────────────────────────────────────────
  tr(L,'a2-u10','en-fr','The flat is bright and well located.','L\'appartement est lumineux et bien situé','\'Lumineux\' and \'bien situé\' are the two most important French property adjectives. Both are top search criteria.'),
  ar(L,'a2-u10','Build: \'We are looking for a 3-room flat near the centre\'','Nous cherchons un appartement de trois pièces près du centre',['Nous','cherchons','un','appartement','de','trois','pièces','près','du','centre'],'\'De trois pièces\' = 3 rooms. \'Près du centre\' = near the centre (près de + le = du).'),
  mc(L,'a2-u10','What is \'le rez-de-chaussée\'?','The ground floor',['The cellar','The ground floor','The first floor above ground','The basement'],'\'Rez-de-chaussée\' = ground level (literally \'flush with the roadway\'). French buildings count floors from here.'),
  li(L,'a2-u10','L\'appartement est meublé avec une terrasse.','Furnished flat with a terrace.','\'Meublé\' = furnished. \'Terrasse\' in a Paris listing is a luxury — any outdoor space at all.'),
  tr(L,'a2-u10','fr-en','Le propriétaire demande deux mois de caution.','The landlord is asking for two months\' deposit.','\'Le propriétaire\' = landlord/owner. \'La caution\' = deposit. Two months is the French legal maximum for unfurnished rentals.'),
  ar(L,'a2-u10','Build: \'Is there a lift in the building?\'','Est-ce qu\'il y a un ascenseur dans l\'immeuble',['Est-ce','qu\'il','y','a','un','ascenseur','dans','l\'immeuble'],'\'L\'immeuble\' = the building/apartment block. \'Ascenseur\' = lift — critical information for a 5th-floor flat.'),
]
