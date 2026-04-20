import { LESSON_PLANS, type LessonPhrase } from './lessonPlans'

export type QType = 'mcq'|'arrange'|'listen'|'translate'|'fill_blank'|'error_correct'
export type CefrLevel = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'

export interface BaseQ {
  type: QType
  cefr: CefrLevel
  unitId: string
  lessonType: 'vocab_intro'|'guided_dialog'|'grammar_focus'|'controlled_practice'|'fluency_drill'|'unit_review'
  prompt: string
  answer: string
  note?: string
}

export interface McqQ    extends BaseQ { type: 'mcq';           options: string[] }
export interface ArrQ    extends BaseQ { type: 'arrange';       words: string[] }
export interface ListQ   extends BaseQ { type: 'listen';        audioText: string }
export interface TransQ  extends BaseQ { type: 'translate';     direction: 'fr-en'|'en-fr' }
export interface FillQ   extends BaseQ { type: 'fill_blank' }
export interface ErrQ    extends BaseQ { type: 'error_correct' }
export type DrillQ = McqQ | ArrQ | ListQ | TransQ | FillQ | ErrQ

export const CEFR_ELO: Record<CefrLevel, { min: number; max: number }> = {
  A1: { min: 0, max: 999 },
  A2: { min: 1000, max: 1199 },
  B1: { min: 1200, max: 1399 },
  B2: { min: 1400, max: 1599 },
  C1: { min: 1600, max: 1799 },
  C2: { min: 1800, max: 9999 },
}

type Phrase = { fr: string; en: string; note: string }
export interface UnitMeta {
  id: string
  cefr: CefrLevel
  title: string
  lessonTypes: BaseQ['lessonType'][]
}

const PHRASES: Record<CefrLevel, Phrase[]> = {
  A1: [
    { fr: "Je m'appelle Camille.", en: "My name is Camille.", note: "Basic introduction." },
    { fr: "Je suis de Montréal.", en: "I am from Montreal.", note: "Identity phrase." },
    { fr: "Où sont les toilettes ?", en: "Where is the bathroom?", note: "Travel essential." },
    { fr: "Je ne comprends pas.", en: "I do not understand.", note: "Core negation." },
    { fr: "Je voudrais un café.", en: "I would like a coffee.", note: "Polite request." },
    { fr: "Nous sommes prêts.", en: "We are ready.", note: "Plural être agreement." },
    { fr: "Il fait froid ce soir.", en: "It is cold this evening.", note: "Weather expression." },
    { fr: "J'ai faim.", en: "I am hungry.", note: "Avoir for hunger." },
    { fr: "Tu parles français ?", en: "Do you speak French?", note: "Simple question form." },
    { fr: "Merci beaucoup.", en: "Thank you very much.", note: "Politeness marker." },
    { fr: "Nous allons au marché.", en: "We are going to the market.", note: "Movement phrase." },
    { fr: "La gare est ici.", en: "The station is here.", note: "Location phrase." },
    { fr: "Je suis fatigué.", en: "I am tired.", note: "Basic adjective sentence." },
    { fr: "Bonsoir à tous.", en: "Good evening everyone.", note: "Greeting in evening." },
    { fr: "Je parle un peu français.", en: "I speak a little French.", note: "Beginner self-report." },
    { fr: "Bonjour, comment allez-vous ?", en: "Hello, how are you?", note: "Formal greeting." },
    { fr: "Il est huit heures.", en: "It is eight o'clock.", note: "Telling time." },
    { fr: "J'habite à Lyon.", en: "I live in Lyon.", note: "Stating residence." },
    { fr: "Tu aimes le café ?", en: "Do you like coffee?", note: "Preference question." },
    { fr: "Je n'ai pas de voiture.", en: "I don\'t have a car.", note: "Negation with avoir." },
    { fr: "Il y a un chat ici.", en: "There is a cat here.", note: "il y a structure." },
    { fr: "Nous mangeons à midi.", en: "We eat at noon.", note: "Manger conjugation." },
    { fr: "Je travaille du lundi au vendredi.", en: "I work Monday to Friday.", note: "Days of the week." },
    { fr: "Il fait chaud aujourd'hui.", en: "It is hot today.", note: "Weather expression." },
    { fr: "Excusez-moi, parlez-vous anglais ?", en: "Excuse me, do you speak English?", note: "Travel phrase." },
    { fr: "Je voudrais l'addition, s'il vous plaît.", en: "I would like the bill, please.", note: "Restaurant phrase." },
    { fr: "C'est combien ?", en: "How much is it?", note: "Price question." },
    { fr: "Où est la banque ?", en: "Where is the bank?", note: "Directions phrase." },
    { fr: "Je ne sais pas.", en: "I don\'t know.", note: "Core response phrase." },
    { fr: "À bientôt !", en: "See you soon!", note: "Informal farewell." },
  ],
  A2: [
    { fr: "Nous avons visité Lyon hier.", en: "We visited Lyon yesterday.", note: "Passé composé with avoir." },
    { fr: "Elle va acheter du pain.", en: "She is going to buy bread.", note: "Futur proche." },
    { fr: "Je suis allé au marché.", en: "I went to the market.", note: "Aller with être." },
    { fr: "Il y a beaucoup de monde.", en: "There are many people.", note: "il y a structure." },
    { fr: "Je peux payer par carte ?", en: "Can I pay by card?", note: "Practical phrase." },
    { fr: "Nous restons dans un hôtel.", en: "We are staying in a hotel.", note: "Present habit." },
    { fr: "À quelle heure part le train ?", en: "At what time does the train leave?", note: "Schedule phrase." },
    { fr: "J'ai besoin d'aide.", en: "I need help.", note: "avoir besoin de." },
    { fr: "Tu as déjà fini ?", en: "Have you already finished?", note: "Adverb placement." },
    { fr: "Nous n'avons pas dormi.", en: "We did not sleep.", note: "Negation in past." },
    { fr: "Il faisait beau ce matin.", en: "The weather was nice this morning.", note: "Imperfect weather." },
    { fr: "Je vais travailler ce soir.", en: "I am going to work tonight.", note: "Near future action." },
    { fr: "Elle est arrivée en retard.", en: "She arrived late.", note: "Arriver with être." },
    { fr: "On se voit demain ?", en: "See you tomorrow?", note: "Common spoken pattern." },
    { fr: "Le musée ouvre à dix heures.", en: "The museum opens at ten o'clock.", note: "Routine timetable." },
    { fr: "J'ai visité ce musée l'année dernière.", en: "I visited this museum last year.", note: "Past tense with time marker." },
    { fr: "Est-ce que vous pouvez m'aider ?", en: "Can you help me?", note: "Polite request with est-ce que." },
    { fr: "Je préfère le train à l'avion.", en: "I prefer the train to the plane.", note: "Preference with prepositions." },
    { fr: "Nous allons passer une semaine à Nice.", en: "We are going to spend a week in Nice.", note: "Near future plan." },
    { fr: "Depuis combien de temps tu apprends le français ?", en: "How long have you been learning French?", note: "Depuis + duration." },
    { fr: "Il faisait nuit quand nous sommes rentrés.", en: "It was night when we got home.", note: "Imparfait + passé composé." },
    { fr: "Je cherche un appartement pas trop cher.", en: "I am looking for a not-too-expensive apartment.", note: "Practical daily language." },
    { fr: "Vous avez une chambre pour deux personnes ?", en: "Do you have a room for two people?", note: "Hotel vocabulary." },
    { fr: "Je suis tombé malade pendant les vacances.", en: "I got sick during the holidays.", note: "Passé composé + tomber." },
    { fr: "Nous devrions réserver à l'avance.", en: "We should book in advance.", note: "Devoir in conditionnel." },
    { fr: "Ils se sont retrouvés au café.", en: "They met up at the café.", note: "Reflexive verb in past." },
    { fr: "Le film commençait à vingt heures.", en: "The film started at eight o'clock.", note: "Imperfect for scheduled events." },
    { fr: "J'ai oublié mon parapluie à la maison.", en: "I forgot my umbrella at home.", note: "Common daily situation." },
    { fr: "Elle ne s'est pas levée tôt ce matin.", en: "She didn\'t get up early this morning.", note: "Reflexive verb in past, feminine." },
    { fr: "C'est combien ce pull ?", en: "How much is this sweater?", note: "Shopping question." },
  ],
  B1: [
    { fr: "Si j'avais plus de temps, je lirais.", en: "If I had more time, I would read.", note: "si + imparfait -> conditionnel." },
    { fr: "Il faut que tu viennes demain.", en: "You must come tomorrow.", note: "Subjunctive trigger." },
    { fr: "Je voudrais que vous m'expliquiez.", en: "I would like you to explain to me.", note: "Polite subordinate request." },
    { fr: "Le livre que j'ai acheté est utile.", en: "The book I bought is useful.", note: "Relative clause." },
    { fr: "J'habitais à Paris avant.", en: "I used to live in Paris before.", note: "Imperfect habit." },
    { fr: "Il a dit qu'il viendrait.", en: "He said he would come.", note: "Reported speech." },
    { fr: "Je m'intéresse à la politique.", en: "I am interested in politics.", note: "Reflexive verb." },
    { fr: "Bien qu'il soit tard, nous continuons.", en: "Although it is late, we continue.", note: "Concession + subjunctive." },
    { fr: "Je pense qu'il a raison.", en: "I think he is right.", note: "Opinion clause." },
    { fr: "Nous devons prendre une décision.", en: "We must make a decision.", note: "Obligation modal." },
    { fr: "Elle lit en écoutant de la musique.", en: "She reads while listening to music.", note: "Gerund en + participle." },
    { fr: "Il est possible que ce soit vrai.", en: "It is possible that this is true.", note: "Subjunctive uncertainty." },
    { fr: "Je ne suis pas d'accord avec toi.", en: "I do not agree with you.", note: "Opinion disagreement." },
    { fr: "Nous avons discuté pendant deux heures.", en: "We discussed for two hours.", note: "Duration expression." },
    { fr: "Avant de partir, je vais appeler Marie.", en: "Before leaving, I will call Marie.", note: "avant de + infinitive." },
    { fr: "À condition que tu fasses tes devoirs, tu peux sortir.", en: "Provided that you do your homework, you can go out.", note: "à condition que + subjunctive." },
    { fr: "Il vaut mieux partir tôt pour éviter les bouchons.", en: "It is better to leave early to avoid traffic jams.", note: "il vaut mieux + infinitive." },
    { fr: "Depuis qu'il a déménagé, il est beaucoup plus heureux.", en: "Since he moved, he is much happier.", note: "Depuis que + past action, present result." },
    { fr: "Je doute qu'il ait compris la question.", en: "I doubt he understood the question.", note: "douter que + subjunctive." },
    { fr: "Nous avons fini par trouver une solution.", en: "We ended up finding a solution.", note: "finir par + infinitive." },
    { fr: "Plus on pratique, plus on progresse.", en: "The more you practice, the more you progress.", note: "Plus...plus pattern." },
    { fr: "Il est grand temps que nous prenions une décision.", en: "It is high time we made a decision.", note: "il est temps que + subjunctive." },
    { fr: "Je tiens à préciser que ce n'est pas mon intention.", en: "I want to clarify that this is not my intention.", note: "tenir à + infinitive." },
    { fr: "On dirait qu'il va pleuvoir.", en: "It looks like it is going to rain.", note: "on dirait que idiom." },
    { fr: "Il a beau essayer, il n'y arrive pas.", en: "No matter how hard he tries, he cannot do it.", note: "avoir beau + infinitive." },
    { fr: "Je me demande s'il va revenir.", en: "I wonder if he will come back.", note: "se demander si indirect question." },
    { fr: "Elle s'en sort très bien malgré les obstacles.", en: "She manages very well despite the obstacles.", note: "s\'en sortir idiom." },
    { fr: "À force de travailler, elle a réussi à décrocher ce poste.", en: "Through hard work, she managed to land that position.", note: "à force de + infinitive." },
    { fr: "Ce n'est qu'après avoir réfléchi qu'on prend de bonnes décisions.", en: "It is only after reflecting that you make good decisions.", note: "ce n\'est qu\'après + perfect infinitive." },
    { fr: "Autant rester ici que d'y aller sous la pluie.", en: "We might as well stay here as go there in the rain.", note: "autant + infinitive." },
  ],
  B2: [
    { fr: "Si j'avais su, j'aurais agi autrement.", en: "If I had known, I would have acted differently.", note: "Third conditional." },
    { fr: "Néanmoins, cette solution reste imparfaite.", en: "Nevertheless, this solution remains imperfect.", note: "Concession connector." },
    { fr: "Cette question mérite d'être discutée.", en: "This issue deserves to be discussed.", note: "Passive infinitive." },
    { fr: "Il est essentiel que nous agissions vite.", en: "It is essential that we act quickly.", note: "Subjunctive urgency." },
    { fr: "La mesure a été mise en œuvre rapidement.", en: "The measure was implemented quickly.", note: "Passive past." },
    { fr: "Nous aurions dû anticiper cela.", en: "We should have anticipated that.", note: "Past conditional duty." },
    { fr: "Il est probable qu'ils soient déjà partis.", en: "It is likely they have already left.", note: "Subjunctive perfect." },
    { fr: "Je me suis rendu compte de mon erreur.", en: "I realized my mistake.", note: "Reflexive idiom." },
    { fr: "Le débat soulève des enjeux complexes.", en: "The debate raises complex issues.", note: "Abstract lexicon." },
    { fr: "Pourtant, les résultats sont mitigés.", en: "Yet, the results are mixed.", note: "Contrast connector." },
    { fr: "En revanche, cette option est plus stable.", en: "By contrast, this option is more stable.", note: "Formal contrast." },
    { fr: "Le projet avance malgré les critiques.", en: "The project moves forward despite criticism.", note: "malgré + noun." },
    { fr: "Il convient d'examiner les alternatives.", en: "One should examine alternatives.", note: "Formal recommendation." },
    { fr: "Cette réforme suscite des réactions variées.", en: "This reform triggers varied reactions.", note: "High-frequency formal phrase." },
    { fr: "Nous avons atteint nos objectifs principaux.", en: "We reached our main objectives.", note: "Summary statement." },
    { fr: "La situation est d'autant plus préoccupante que les ressources manquent.", en: "The situation is all the more worrying as resources are lacking.", note: "d\'autant plus que structure." },
    { fr: "Il n'est pas exclu que cette mesure soit reconsidérée.", en: "It is not out of the question that this measure may be reconsidered.", note: "Formal epistemic modality." },
    { fr: "Sans vouloir contredire votre analyse, je note quelques lacunes.", en: "Without wishing to contradict your analysis, I note some gaps.", note: "Polite academic disagreement." },
    { fr: "Ce phénomène est étroitement lié aux mutations sociales en cours.", en: "This phenomenon is closely linked to the ongoing social changes.", note: "Academic verb être lié à." },
    { fr: "Force est de reconnaître que les prévisions étaient erronées.", en: "One must acknowledge that the forecasts were wrong.", note: "Force est de + infinitive." },
    { fr: "Le bilan est mitigé : des points positifs, mais aussi des lacunes.", en: "The assessment is mixed: positive points, but also gaps.", note: "Balanced evaluation phrase." },
    { fr: "En dépit des progrès accomplis, des inégalités persistent.", en: "Despite the progress made, inequalities persist.", note: "en dépit de formal concession." },
    { fr: "Cela soulève des questions fondamentales sur notre modèle de société.", en: "This raises fundamental questions about our social model.", note: "Formal analytical expression." },
    { fr: "Nous assistons à un changement de paradigme sans précédent.", en: "We are witnessing an unprecedented paradigm shift.", note: "Formal observation phrase." },
    { fr: "À cela s'ajoute une série de facteurs aggravants.", en: "To this is added a series of aggravating factors.", note: "Additive connectors in formal writing." },
    { fr: "La portée de ces mesures reste difficile à évaluer.", en: "The scope of these measures remains difficult to assess.", note: "Academic hedging language." },
    { fr: "Il convient d'interroger les présupposés de cette théorie.", en: "One should question the assumptions of this theory.", note: "Formal critical stance." },
    { fr: "L'analyse des données révèle une tendance préoccupante.", en: "Data analysis reveals a worrying trend.", note: "Academic findings statement." },
    { fr: "Au regard des résultats obtenus, le dispositif mérite d'être renforcé.", en: "In light of the results obtained, the system deserves to be strengthened.", note: "au regard de formal evaluation." },
    { fr: "La réforme, bien qu'imparfaite, représente une avancée indéniable.", en: "The reform, though imperfect, represents an undeniable step forward.", note: "bien que + subjunctive implied, concessive." },
  ],
  C1: [
    { fr: "Loin d'être anodine, cette décision a des conséquences.", en: "Far from trivial, this decision has consequences.", note: "Advanced stylistic opening." },
    { fr: "Quoi qu'il arrive, nous resterons cohérents.", en: "Whatever happens, we will remain consistent.", note: "Concessive framework." },
    { fr: "Il convient de nuancer cette affirmation.", en: "This claim should be qualified.", note: "Academic register." },
    { fr: "Le rapport ne tient pas compte des disparités régionales.", en: "The report fails to account for regional disparities.", note: "Analytical precision." },
    { fr: "À supposer que cette hypothèse soit valide, que faire ?", en: "Assuming this hypothesis is valid, what should we do?", note: "Hypothetical framing." },
    { fr: "Force est de constater que la situation se dégrade.", en: "It must be acknowledged that the situation is worsening.", note: "Formal idiom." },
    { fr: "En somme, l'argument est convaincant mais incomplet.", en: "In sum, the argument is compelling but incomplete.", note: "Synthesis marker." },
    { fr: "Tout bien considéré, ce compromis reste pragmatique.", en: "All things considered, this compromise remains pragmatic.", note: "High-level summarization." },
    { fr: "N'eût été son soutien, nous aurions renoncé.", en: "Were it not for his support, we would have given up.", note: "Literary inversion." },
    { fr: "Cette proposition soulève des réserves légitimes.", en: "This proposal raises legitimate reservations.", note: "C1 argumentation language." },
    { fr: "Il importe de distinguer corrélation et causalité.", en: "It is important to distinguish correlation and causality.", note: "Analytical discourse." },
    { fr: "Le raisonnement, quoique solide, comporte des limites.", en: "The reasoning, though solid, has limits.", note: "Concessive nuance." },
    { fr: "Nous devons replacer ce débat dans son contexte.", en: "We must put this debate back in context.", note: "Discourse framing." },
    { fr: "Cette orientation paraît pertinente à long terme.", en: "This direction seems relevant in the long term.", note: "Strategic register." },
    { fr: "En définitive, la marge de manœuvre demeure réduite.", en: "Ultimately, the room for maneuver remains limited.", note: "Conclusion phrase." },
    { fr: "Sans préjuger des conclusions, l'enquête mérite d'être approfondie.", en: "Without prejudging the conclusions, the inquiry deserves to be deepened.", note: "sans préjuger de — nuanced epistemic stance." },
    { fr: "C'est précisément là que réside l'enjeu fondamental.", en: "This is precisely where the fundamental issue lies.", note: "C\'est là que réside — emphatic structure." },
    { fr: "Que l'on adhère ou non à cette thèse, elle mérite examen.", en: "Whether or not one subscribes to this thesis, it deserves examination.", note: "Que l\'on + subjunctive — formal concession." },
    { fr: "Il serait réducteur de limiter l'analyse à ce seul facteur.", en: "It would be reductive to limit the analysis to this single factor.", note: "il serait + conditionnel — intellectual modesty." },
    { fr: "La pertinence de cette approche ne saurait être niée.", en: "The relevance of this approach cannot be denied.", note: "ne saurait être — C1 formal modal." },
    { fr: "À travers ce prisme, la complexité du phénomène se révèle.", en: "Through this prism, the complexity of the phenomenon is revealed.", note: "Metaphorical academic lens." },
    { fr: "Cette thèse, pour séduisante qu'elle soit, présente des failles.", en: "This thesis, however appealing it may be, has flaws.", note: "pour + adj + que + subjonctif — concessive." },
    { fr: "Rien ne permet d'affirmer avec certitude que tel est le cas.", en: "Nothing allows us to assert with certainty that this is the case.", note: "Epistemic caution at C1 level." },
    { fr: "On ne saurait sous-estimer l'impact de cette décision.", en: "One cannot underestimate the impact of this decision.", note: "ne saurait + infinitive — formal negation." },
    { fr: "Ce faisant, nous risquons de négliger des aspects essentiels.", en: "In doing so, we risk neglecting essential aspects.", note: "ce faisant — advanced anaphoric connector." },
    { fr: "Le problème se pose en des termes entièrement nouveaux.", en: "The problem presents itself in entirely new terms.", note: "se poser en termes de — academic reformulation." },
    { fr: "Il n'est pas anodin que ce débat resurface aujourd'hui.", en: "It is not coincidental that this debate resurfaces today.", note: "il n\'est pas anodin que + subjonctif — implicit causality." },
    { fr: "Cette perspective oblige à repenser les catégories habituelles.", en: "This perspective forces us to rethink our usual categories.", note: "obliger à — intellectual challenge." },
    { fr: "Il importe de ne pas confondre cause et corrélation.", en: "It is important not to confuse cause and correlation.", note: "il importe de — formal injunction." },
    { fr: "En définitive, la question reste entière, faute de preuves décisives.", en: "Ultimately, the question remains open, for lack of decisive evidence.", note: "en définitive + faute de — conclusion marker." },
  ],
  C2: [
    { fr: "À peine avait-il parlé que les objections se sont multipliées.", en: "Hardly had he spoken when objections multiplied.", note: "C2 inversion pattern." },
    { fr: "Quoi qu'il en soit, la conclusion demeure inchangée.", en: "Be that as it may, the conclusion remains unchanged.", note: "Concessive idiom." },
    { fr: "Nul ne saurait nier la complexité du dossier.", en: "No one could deny the complexity of the case.", note: "Formal modal nuance." },
    { fr: "Ce n'est qu'en reformulant la question que nous avancerons.", en: "Only by reframing the issue can we move forward.", note: "Restrictive emphasis." },
    { fr: "Pour autant qu'on puisse en juger, la réforme reste inaboutie.", en: "As far as can be judged, the reform remains unfinished.", note: "Evaluative abstraction." },
    { fr: "Fût-ce au prix d'un effort considérable, il fallait persévérer.", en: "Even at considerable cost, one had to persevere.", note: "Literary concessive." },
    { fr: "Leur position est aussi intenable que contradictoire.", en: "Their stance is as untenable as it is contradictory.", note: "Rhetorical comparison." },
    { fr: "Dès lors, toute objection perd sa pertinence.", en: "From then on, any objection loses relevance.", note: "Strict consequence marker." },
    { fr: "Il va sans dire que cette thèse demeure discutable.", en: "It goes without saying that this thesis remains debatable.", note: "High-register stance." },
    { fr: "Revenir sur ses propos aurait sapé sa crédibilité.", en: "Backpedaling would have undermined his credibility.", note: "Idiomatic precision." },
    { fr: "Cette posture, cohérente en apparence, se fissure à l'analyse.", en: "This stance, coherent in appearance, cracks under analysis.", note: "Nuanced critique." },
    { fr: "Soit, pourvu que nous préservions la cohérence d'ensemble.", en: "So be it, provided we preserve overall coherence.", note: "Subjunctive condition." },
    { fr: "L'argumentation, pour brillante qu'elle soit, reste lacunaire.", en: "The argumentation, however brilliant, remains incomplete.", note: "Concessive sophistication." },
    { fr: "À cet égard, toute simplification serait trompeuse.", en: "In this respect, any simplification would be misleading.", note: "Formal evaluative register." },
    { fr: "En dernière analyse, la question demeure irrésolue.", en: "In final analysis, the issue remains unresolved.", note: "High-level conclusion." },
    { fr: "Pareille interprétation ne résiste pas à l'examen des faits.", en: "Such an interpretation does not hold up to scrutiny of the facts.", note: "ne pas résister à l\'examen — C2 critique." },
    { fr: "Nul ne peut se dérober à la responsabilité que cela implique.", en: "No one can escape the responsibility this implies.", note: "nul ne peut se dérober à — literary universalization." },
    { fr: "C'est à l'aune de ce critère qu'il convient de juger.", en: "It is by this criterion that one should judge.", note: "à l\'aune de — elevated formal benchmark phrase." },
    { fr: "L'argument, aussi sophistiqué soit-il, ne saurait convaincre.", en: "The argument, however sophisticated it may be, cannot convince.", note: "aussi...soit-il — C2 concessive inversion." },
    { fr: "Il y va de la crédibilité même de l'institution.", en: "The very credibility of the institution is at stake.", note: "il y va de — idiomatic stakes-framing." },
    { fr: "Cela étant, on ne peut ignorer les objections soulevées.", en: "That being said, one cannot ignore the objections raised.", note: "cela étant — formal transitional concession." },
    { fr: "Il eût été préférable d'agir avant que la situation ne se dégrade.", en: "It would have been preferable to act before the situation deteriorated.", note: "Subjonctif imparfait (literary)." },
    { fr: "Seule une lecture attentive révèle les contradictions internes.", en: "Only a careful reading reveals the internal contradictions.", note: "Seule... révèle — inversion for emphasis." },
    { fr: "Le paradoxe tient à ce que plus on sait, moins on est certain.", en: "The paradox lies in the fact that the more one knows, the less certain one is.", note: "tenir à ce que + subj — epistemic paradox." },
    { fr: "C'est là toute l'ambivalence de la modernité.", en: "This is the very ambivalence of modernity.", note: "C\'est là toute — rhetorical pointing." },
    { fr: "Aussi paradoxal que cela puisse paraître, l'absence de preuve renforce la thèse.", en: "As paradoxical as it may seem, the absence of proof reinforces the thesis.", note: "aussi...que + subjunctive — C2 argumentation." },
    { fr: "L'enjeu dépasse de loin les considérations immédiates.", en: "The stakes go far beyond immediate considerations.", note: "dépasser de loin — amplified formal assertion." },
    { fr: "Cette formulation, pour commode qu'elle soit, reste trompeuse.", en: "This formulation, however convenient it may be, remains misleading.", note: "pour...que — C2 adversative concession." },
    { fr: "Le silence éloquent des données parle de lui-même.", en: "The eloquent silence of the data speaks for itself.", note: "Rhetorical paradox construction." },
    { fr: "In fine, la rigueur de l'argumentation est le seul critère qui vaille.", en: "Ultimately, the rigor of argumentation is the only criterion that matters.", note: "in fine — Latinate register, C2 formal conclusion." },
  ],
}

function tokenizeForArrange(sentence: string): string[] {
  return sentence
    .replace(/[!?.,;:]/g, (m) => ` ${m} `)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
}

function makeOptions(level: CefrLevel, correctEn: string, i: number): string[] {
  const pool = PHRASES[level].map(p => p.en).filter(e => e !== correctEn)
  const d1 = pool[(i + 1) % pool.length]
  const d2 = pool[(i + 4) % pool.length]
  const d3 = pool[(i + 7) % pool.length]
  return [correctEn, d1, d2, d3]
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = (i * 31 + 7) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function chunks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const UNIT_TITLES: Record<string, string> = {
  // A1 — Beginner
  'a1-u1':  'The First Encounter',    // Greetings & introductions — from plan
  'a1-u2':  'The Rhythm of Life',     // Numbers, dates & time — from plan
  'a1-u3':  'All in the Family',      // Family & people
  'a1-u4':  'Café Culture',           // Food & drink
  'a1-u5':  'What Are You Wearing?',  // Colors & clothing
  'a1-u6':  'Getting Around',         // Places & directions
  'a1-u7':  'From Dawn to Dusk',      // Daily routines
  'a1-u8':  'The French Sky',         // Weather & seasons
  'a1-u9':  'At the Market',          // Shopping & money
  'a1-u10': 'À bientôt!',             // Travel & farewells
  // A2 — Elementary
  'a2-u1':  'Yesterday & Today',      // Passé composé intro
  'a2-u2':  'Plans & Promises',       // Futur proche
  'a2-u3':  'Check In, Check Out',    // Travel & accommodation
  'a2-u4':  'Life in the City',       // Urban vocabulary
  'a2-u5':  'Likes & Dislikes',       // Preferences & opinions
  'a2-u6':  'The Memory Palace',      // Imperfect tense
  'a2-u7':  'Getting Things Done',    // Modal verbs (pouvoir, devoir, vouloir)
  'a2-u8':  'Who Are They?',          // Describing people
  'a2-u9':  'The Journey',            // Transport & travel phrases
  'a2-u10': 'Home Sweet Home',        // Housing & furniture
  // B1 — Intermediate
  'b1-u1':  'What If…',              // Si + imparfait conditional
  'b1-u2':  'I Think, Therefore…',   // Opinion & subjunctive
  'b1-u3':  'The Story So Far',       // Mixed past tenses
  'b1-u4':  'In Other Words',         // Relative clauses
  'b1-u5':  'Habits of the Past',     // Imperfect habits
  'b1-u6':  'He Said, She Said',      // Reported speech
  'b1-u7':  'Mind & Emotion',         // Reflexive verbs
  'b1-u8':  'Against All Odds',       // Concession & contrast
  'b1-u9':  'The Long Game',          // Duration expressions
  'b1-u10': 'In the End',             // Conclusion structures
  // B2 — Upper-Intermediate
  'b2-u1':  'Roads Not Taken',        // Third conditional
  'b2-u2':  'Nevertheless',           // Discourse connectors
  'b2-u3':  'The Passive Voice',      // Passive constructions
  'b2-u4':  'It Is Essential That…', // Subjunctive in formal registers
  'b2-u5':  'The Big Picture',        // Abstract & academic lexicon
  'b2-u6':  'Should Have Known',      // Past modal obligation
  'b2-u7':  'In All Likelihood',      // Probability expressions
  'b2-u8':  'Coming to Terms',        // Reflexive idioms
  'b2-u9':  'The Argument',           // Debate & persuasion
  'b2-u10': 'Reading Between Lines',  // Nuance & implication
  // C1 — Advanced
  'c1-u1':  'The Subjunctive Mastered',
  'c1-u2':  'Cause & Effect',
  'c1-u3':  'The Art of Nuance',
  'c1-u4':  'Complex Clauses',
  'c1-u5':  'Register & Tone',
  'c1-u6':  'The Idiomatic Mind',
  'c1-u7':  'Literary Structures',
  'c1-u8':  'Formal Writing',
  'c1-u9':  'Academic Discourse',
  'c1-u10': 'The Native Speaker',
  // C2 — Mastery
  'c2-u1':  'Poetic Licence',
  'c2-u2':  'The Philosopher\'s Tongue',
  'c2-u3':  'Beyond Translation',
  'c2-u4':  'Wordplay & Wit',
  'c2-u5':  'The Grand Style',
  'c2-u6':  'Historical Register',
  'c2-u7':  'Argot & Verlan',
  'c2-u8':  'Political Rhetoric',
  'c2-u9':  'The Essay',
  'c2-u10': 'Fluency Unlocked',
}

export const UNIT_META: UnitMeta[] = (Object.keys(PHRASES) as CefrLevel[]).flatMap((level) => {
  return chunks(PHRASES[level], 3).map((_c, idx) => {
    const unitId = `${level.toLowerCase()}-u${idx + 1}`
    const plan   = LESSON_PLANS[unitId]
    return {
      id: unitId,
      cefr: level,
      title: plan?.title ?? UNIT_TITLES[unitId] ?? `${level} Unit ${idx + 1}`,
      lessonTypes: ['vocab_intro', 'guided_dialog', 'grammar_focus', 'controlled_practice', 'fluency_drill', 'unit_review'],
    }
  })
})

const GENERATED: DrillQ[] = (Object.keys(PHRASES) as CefrLevel[]).flatMap((level) => {
  const grouped = chunks(PHRASES[level], 3)
  return grouped.flatMap((group, gi) => group.flatMap((p, i) => {
    const unitId = `${level.toLowerCase()}-u${gi + 1}`
    const mcqOptions = shuffle(makeOptions(level, p.en, i))
    return [
      {
        type: 'translate',
        cefr: level,
        unitId,
        lessonType: 'vocab_intro',
        direction: 'en-fr',
        prompt: `Translate: "${p.en}"`,
        answer: p.fr,
        note: p.note,
      } as TransQ,
      {
        type: 'translate',
        cefr: level,
        unitId,
        lessonType: 'guided_dialog',
        direction: 'fr-en',
        prompt: `Translate: "${p.fr}"`,
        answer: p.en,
        note: p.note,
      } as TransQ,
      {
        type: 'arrange',
        cefr: level,
        unitId,
        lessonType: 'grammar_focus',
        prompt: `Build: "${p.en}"`,
        words: tokenizeForArrange(p.fr),
        answer: p.fr,
        note: p.note,
      } as ArrQ,
      {
        type: 'listen',
        cefr: level,
        unitId,
        lessonType: 'fluency_drill',
        prompt: 'Listen and type what you hear:',
        audioText: p.fr,
        answer: p.fr,
        note: p.note,
      } as ListQ,
      {
        type: 'mcq',
        cefr: level,
        unitId,
        lessonType: 'unit_review',
        prompt: `Choose the best translation: "${p.fr}"`,
        options: mcqOptions,
        answer: p.en,
        note: p.note,
      } as McqQ,
    ]
  }))
})

import { A2_EXTRA_QUESTIONS } from './a2ExtraQuestions'
export const QUESTION_BANK: DrillQ[] = [...GENERATED, ...A2_EXTRA_QUESTIONS]
export { PHRASES }

/** Returns the source phrases for a unit (for the intro card) */
export function getUnitPhrases(unitId: string): LessonPhrase[] {
  const plan = LESSON_PLANS[unitId]
  if (plan) return plan.phrases

  const frEn = GENERATED.filter(
    q => q.unitId === unitId && q.type === 'translate' && (q as TransQ).direction === 'fr-en'
  ) as TransQ[]
  return frEn.map(q => ({
    fr: q.prompt.replace(/^Translate: "/, '').replace(/"$/, ''),
    en: q.answer,
    note: q.note || '',
  }))
}

/** Split a unit's questions into practice and test sets */
export function getUnitLessonQuestions(unitId: string): { practice: DrillQ[]; test: DrillQ[] } {
  const plan = LESSON_PLANS[unitId]
  if (plan) {
    return {
      practice: plan.practice.slice(0, 15) as DrillQ[],
      test:     plan.test               as DrillQ[],
    }
  }

  const all = GENERATED.filter(q => q.unitId === unitId)
  const seed = unitId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shuffled = [...all].sort((a, b) => {
    const ha = (seed * 31 + a.type.charCodeAt(0)) % all.length
    const hb = (seed * 31 + b.type.charCodeAt(0)) % all.length
    return ha - hb
  })
  return { practice: shuffled.slice(0, 5), test: shuffled.slice(5, 10) }
}
