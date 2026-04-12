export type QType = 'mcq'|'arrange'|'listen'|'translate'
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

export interface McqQ extends BaseQ { type: 'mcq'; options: string[] }
export interface ArrQ extends BaseQ { type: 'arrange'; words: string[] }
export interface ListQ extends BaseQ { type: 'listen'; audioText: string }
export interface TransQ extends BaseQ { type: 'translate'; direction: 'fr-en'|'en-fr' }
export type DrillQ = McqQ | ArrQ | ListQ | TransQ

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
    { fr: "Je suis de Montr\u00e9al.", en: "I am from Montreal.", note: "Identity phrase." },
    { fr: "O\u00f9 sont les toilettes ?", en: "Where is the bathroom?", note: "Travel essential." },
    { fr: "Je ne comprends pas.", en: "I do not understand.", note: "Core negation." },
    { fr: "Je voudrais un caf\u00e9.", en: "I would like a coffee.", note: "Polite request." },
    { fr: "Nous sommes pr\u00eats.", en: "We are ready.", note: "Plural \u00eatre agreement." },
    { fr: "Il fait froid ce soir.", en: "It is cold this evening.", note: "Weather expression." },
    { fr: "J'ai faim.", en: "I am hungry.", note: "Avoir for hunger." },
    { fr: "Tu parles fran\u00e7ais ?", en: "Do you speak French?", note: "Simple question form." },
    { fr: "Merci beaucoup.", en: "Thank you very much.", note: "Politeness marker." },
    { fr: "Nous allons au march\u00e9.", en: "We are going to the market.", note: "Movement phrase." },
    { fr: "La gare est ici.", en: "The station is here.", note: "Location phrase." },
    { fr: "Je suis fatigu\u00e9.", en: "I am tired.", note: "Basic adjective sentence." },
    { fr: "Bonsoir \u00e0 tous.", en: "Good evening everyone.", note: "Greeting in evening." },
    { fr: "Je parle un peu fran\u00e7ais.", en: "I speak a little French.", note: "Beginner self-report." },
    { fr: "Bonjour, comment allez-vous ?", en: "Hello, how are you?", note: "Formal greeting." },
    { fr: "Il est huit heures.", en: "It is eight o'clock.", note: "Telling time." },
    { fr: "J'habite \u00e0 Lyon.", en: "I live in Lyon.", note: "Stating residence." },
    { fr: "Tu aimes le caf\u00e9 ?", en: "Do you like coffee?", note: "Preference question." },
    { fr: "Je n'ai pas de voiture.", en: "I don\\'t have a car.", note: "Negation with avoir." },
    { fr: "Il y a un chat ici.", en: "There is a cat here.", note: "il y a structure." },
    { fr: "Nous mangeons \u00e0 midi.", en: "We eat at noon.", note: "Manger conjugation." },
    { fr: "Je travaille du lundi au vendredi.", en: "I work Monday to Friday.", note: "Days of the week." },
    { fr: "Il fait chaud aujourd'hui.", en: "It is hot today.", note: "Weather expression." },
    { fr: "Excusez-moi, parlez-vous anglais ?", en: "Excuse me, do you speak English?", note: "Travel phrase." },
    { fr: "Je voudrais l'addition, s'il vous pla\u00eet.", en: "I would like the bill, please.", note: "Restaurant phrase." },
    { fr: "C'est combien ?", en: "How much is it?", note: "Price question." },
    { fr: "O\u00f9 est la banque ?", en: "Where is the bank?", note: "Directions phrase." },
    { fr: "Je ne sais pas.", en: "I don\\'t know.", note: "Core response phrase." },
    { fr: "\u00c0 bient\u00f4t !", en: "See you soon!", note: "Informal farewell." },
  ],
  A2: [
    { fr: "Nous avons visit\u00e9 Lyon hier.", en: "We visited Lyon yesterday.", note: "Pass\u00e9 compos\u00e9 with avoir." },
    { fr: "Elle va acheter du pain.", en: "She is going to buy bread.", note: "Futur proche." },
    { fr: "Je suis all\u00e9 au march\u00e9.", en: "I went to the market.", note: "Aller with \u00eatre." },
    { fr: "Il y a beaucoup de monde.", en: "There are many people.", note: "il y a structure." },
    { fr: "Je peux payer par carte ?", en: "Can I pay by card?", note: "Practical phrase." },
    { fr: "Nous restons dans un h\u00f4tel.", en: "We are staying in a hotel.", note: "Present habit." },
    { fr: "\u00c0 quelle heure part le train ?", en: "At what time does the train leave?", note: "Schedule phrase." },
    { fr: "J'ai besoin d'aide.", en: "I need help.", note: "avoir besoin de." },
    { fr: "Tu as d\u00e9j\u00e0 fini ?", en: "Have you already finished?", note: "Adverb placement." },
    { fr: "Nous n'avons pas dormi.", en: "We did not sleep.", note: "Negation in past." },
    { fr: "Il faisait beau ce matin.", en: "The weather was nice this morning.", note: "Imperfect weather." },
    { fr: "Je vais travailler ce soir.", en: "I am going to work tonight.", note: "Near future action." },
    { fr: "Elle est arriv\u00e9e en retard.", en: "She arrived late.", note: "Arriver with \u00eatre." },
    { fr: "On se voit demain ?", en: "See you tomorrow?", note: "Common spoken pattern." },
    { fr: "Le mus\u00e9e ouvre \u00e0 dix heures.", en: "The museum opens at ten o'clock.", note: "Routine timetable." },
    { fr: "J'ai visit\u00e9 ce mus\u00e9e l'ann\u00e9e derni\u00e8re.", en: "I visited this museum last year.", note: "Past tense with time marker." },
    { fr: "Est-ce que vous pouvez m'aider ?", en: "Can you help me?", note: "Polite request with est-ce que." },
    { fr: "Je pr\u00e9f\u00e8re le train \u00e0 l'avion.", en: "I prefer the train to the plane.", note: "Preference with prepositions." },
    { fr: "Nous allons passer une semaine \u00e0 Nice.", en: "We are going to spend a week in Nice.", note: "Near future plan." },
    { fr: "Depuis combien de temps tu apprends le fran\u00e7ais ?", en: "How long have you been learning French?", note: "Depuis + duration." },
    { fr: "Il faisait nuit quand nous sommes rentr\u00e9s.", en: "It was night when we got home.", note: "Imparfait + pass\u00e9 compos\u00e9." },
    { fr: "Je cherche un appartement pas trop cher.", en: "I am looking for a not-too-expensive apartment.", note: "Practical daily language." },
    { fr: "Vous avez une chambre pour deux personnes ?", en: "Do you have a room for two people?", note: "Hotel vocabulary." },
    { fr: "Je suis tomb\u00e9 malade pendant les vacances.", en: "I got sick during the holidays.", note: "Pass\u00e9 compos\u00e9 + tomber." },
    { fr: "Nous devrions r\u00e9server \u00e0 l'avance.", en: "We should book in advance.", note: "Devoir in conditionnel." },
    { fr: "Ils se sont retrouv\u00e9s au caf\u00e9.", en: "They met up at the caf\u00e9.", note: "Reflexive verb in past." },
    { fr: "Le film commen\u00e7ait \u00e0 vingt heures.", en: "The film started at eight o'clock.", note: "Imperfect for scheduled events." },
    { fr: "J'ai oubli\u00e9 mon parapluie \u00e0 la maison.", en: "I forgot my umbrella at home.", note: "Common daily situation." },
    { fr: "Elle ne s'est pas lev\u00e9e t\u00f4t ce matin.", en: "She didn\\'t get up early this morning.", note: "Reflexive verb in past, feminine." },
    { fr: "C'est combien ce pull ?", en: "How much is this sweater?", note: "Shopping question." },
  ],
  B1: [
    { fr: "Si j'avais plus de temps, je lirais.", en: "If I had more time, I would read.", note: "si + imparfait -> conditionnel." },
    { fr: "Il faut que tu viennes demain.", en: "You must come tomorrow.", note: "Subjunctive trigger." },
    { fr: "Je voudrais que vous m'expliquiez.", en: "I would like you to explain to me.", note: "Polite subordinate request." },
    { fr: "Le livre que j'ai achet\u00e9 est utile.", en: "The book I bought is useful.", note: "Relative clause." },
    { fr: "J'habitais \u00e0 Paris avant.", en: "I used to live in Paris before.", note: "Imperfect habit." },
    { fr: "Il a dit qu'il viendrait.", en: "He said he would come.", note: "Reported speech." },
    { fr: "Je m'int\u00e9resse \u00e0 la politique.", en: "I am interested in politics.", note: "Reflexive verb." },
    { fr: "Bien qu'il soit tard, nous continuons.", en: "Although it is late, we continue.", note: "Concession + subjunctive." },
    { fr: "Je pense qu'il a raison.", en: "I think he is right.", note: "Opinion clause." },
    { fr: "Nous devons prendre une d\u00e9cision.", en: "We must make a decision.", note: "Obligation modal." },
    { fr: "Elle lit en \u00e9coutant de la musique.", en: "She reads while listening to music.", note: "Gerund en + participle." },
    { fr: "Il est possible que ce soit vrai.", en: "It is possible that this is true.", note: "Subjunctive uncertainty." },
    { fr: "Je ne suis pas d'accord avec toi.", en: "I do not agree with you.", note: "Opinion disagreement." },
    { fr: "Nous avons discut\u00e9 pendant deux heures.", en: "We discussed for two hours.", note: "Duration expression." },
    { fr: "Avant de partir, je vais appeler Marie.", en: "Before leaving, I will call Marie.", note: "avant de + infinitive." },
    { fr: "\u00c0 condition que tu fasses tes devoirs, tu peux sortir.", en: "Provided that you do your homework, you can go out.", note: "\u00e0 condition que + subjunctive." },
    { fr: "Il vaut mieux partir t\u00f4t pour \u00e9viter les bouchons.", en: "It is better to leave early to avoid traffic jams.", note: "il vaut mieux + infinitive." },
    { fr: "Depuis qu'il a d\u00e9m\u00e9nag\u00e9, il est beaucoup plus heureux.", en: "Since he moved, he is much happier.", note: "Depuis que + past action, present result." },
    { fr: "Je doute qu'il ait compris la question.", en: "I doubt he understood the question.", note: "douter que + subjunctive." },
    { fr: "Nous avons fini par trouver une solution.", en: "We ended up finding a solution.", note: "finir par + infinitive." },
    { fr: "Plus on pratique, plus on progresse.", en: "The more you practice, the more you progress.", note: "Plus...plus pattern." },
    { fr: "Il est grand temps que nous prenions une d\u00e9cision.", en: "It is high time we made a decision.", note: "il est temps que + subjunctive." },
    { fr: "Je tiens \u00e0 pr\u00e9ciser que ce n'est pas mon intention.", en: "I want to clarify that this is not my intention.", note: "tenir \u00e0 + infinitive." },
    { fr: "On dirait qu'il va pleuvoir.", en: "It looks like it is going to rain.", note: "on dirait que idiom." },
    { fr: "Il a beau essayer, il n'y arrive pas.", en: "No matter how hard he tries, he cannot do it.", note: "avoir beau + infinitive." },
    { fr: "Je me demande s'il va revenir.", en: "I wonder if he will come back.", note: "se demander si indirect question." },
    { fr: "Elle s'en sort tr\u00e8s bien malgr\u00e9 les obstacles.", en: "She manages very well despite the obstacles.", note: "s\\'en sortir idiom." },
    { fr: "\u00c0 force de travailler, elle a r\u00e9ussi \u00e0 d\u00e9crocher ce poste.", en: "Through hard work, she managed to land that position.", note: "\u00e0 force de + infinitive." },
    { fr: "Ce n'est qu'apr\u00e8s avoir r\u00e9fl\u00e9chi qu'on prend de bonnes d\u00e9cisions.", en: "It is only after reflecting that you make good decisions.", note: "ce n\\'est qu\\'apr\u00e8s + perfect infinitive." },
    { fr: "Autant rester ici que d'y aller sous la pluie.", en: "We might as well stay here as go there in the rain.", note: "autant + infinitive." },
  ],
  B2: [
    { fr: "Si j'avais su, j'aurais agi autrement.", en: "If I had known, I would have acted differently.", note: "Third conditional." },
    { fr: "N\u00e9anmoins, cette solution reste imparfaite.", en: "Nevertheless, this solution remains imperfect.", note: "Concession connector." },
    { fr: "Cette question m\u00e9rite d'\u00eatre discut\u00e9e.", en: "This issue deserves to be discussed.", note: "Passive infinitive." },
    { fr: "Il est essentiel que nous agissions vite.", en: "It is essential that we act quickly.", note: "Subjunctive urgency." },
    { fr: "La mesure a \u00e9t\u00e9 mise en \u0153uvre rapidement.", en: "The measure was implemented quickly.", note: "Passive past." },
    { fr: "Nous aurions d\u00fb anticiper cela.", en: "We should have anticipated that.", note: "Past conditional duty." },
    { fr: "Il est probable qu'ils soient d\u00e9j\u00e0 partis.", en: "It is likely they have already left.", note: "Subjunctive perfect." },
    { fr: "Je me suis rendu compte de mon erreur.", en: "I realized my mistake.", note: "Reflexive idiom." },
    { fr: "Le d\u00e9bat soul\u00e8ve des enjeux complexes.", en: "The debate raises complex issues.", note: "Abstract lexicon." },
    { fr: "Pourtant, les r\u00e9sultats sont mitig\u00e9s.", en: "Yet, the results are mixed.", note: "Contrast connector." },
    { fr: "En revanche, cette option est plus stable.", en: "By contrast, this option is more stable.", note: "Formal contrast." },
    { fr: "Le projet avance malgr\u00e9 les critiques.", en: "The project moves forward despite criticism.", note: "malgr\u00e9 + noun." },
    { fr: "Il convient d'examiner les alternatives.", en: "One should examine alternatives.", note: "Formal recommendation." },
    { fr: "Cette r\u00e9forme suscite des r\u00e9actions vari\u00e9es.", en: "This reform triggers varied reactions.", note: "High-frequency formal phrase." },
    { fr: "Nous avons atteint nos objectifs principaux.", en: "We reached our main objectives.", note: "Summary statement." },
    { fr: "La situation est d'autant plus pr\u00e9occupante que les ressources manquent.", en: "The situation is all the more worrying as resources are lacking.", note: "d\\'autant plus que structure." },
    { fr: "Il n'est pas exclu que cette mesure soit reconsid\u00e9r\u00e9e.", en: "It is not out of the question that this measure may be reconsidered.", note: "Formal epistemic modality." },
    { fr: "Sans vouloir contredire votre analyse, je note quelques lacunes.", en: "Without wishing to contradict your analysis, I note some gaps.", note: "Polite academic disagreement." },
    { fr: "Ce ph\u00e9nom\u00e8ne est \u00e9troitement li\u00e9 aux mutations sociales en cours.", en: "This phenomenon is closely linked to the ongoing social changes.", note: "Academic verb \u00eatre li\u00e9 \u00e0." },
    { fr: "Force est de reconna\u00eetre que les pr\u00e9visions \u00e9taient erron\u00e9es.", en: "One must acknowledge that the forecasts were wrong.", note: "Force est de + infinitive." },
    { fr: "Le bilan est mitig\u00e9 : des points positifs, mais aussi des lacunes.", en: "The assessment is mixed: positive points, but also gaps.", note: "Balanced evaluation phrase." },
    { fr: "En d\u00e9pit des progr\u00e8s accomplis, des in\u00e9galit\u00e9s persistent.", en: "Despite the progress made, inequalities persist.", note: "en d\u00e9pit de formal concession." },
    { fr: "Cela soul\u00e8ve des questions fondamentales sur notre mod\u00e8le de soci\u00e9t\u00e9.", en: "This raises fundamental questions about our social model.", note: "Formal analytical expression." },
    { fr: "Nous assistons \u00e0 un changement de paradigme sans pr\u00e9c\u00e9dent.", en: "We are witnessing an unprecedented paradigm shift.", note: "Formal observation phrase." },
    { fr: "\u00c0 cela s'ajoute une s\u00e9rie de facteurs aggravants.", en: "To this is added a series of aggravating factors.", note: "Additive connectors in formal writing." },
    { fr: "La port\u00e9e de ces mesures reste difficile \u00e0 \u00e9valuer.", en: "The scope of these measures remains difficult to assess.", note: "Academic hedging language." },
    { fr: "Il convient d'interroger les pr\u00e9suppos\u00e9s de cette th\u00e9orie.", en: "One should question the assumptions of this theory.", note: "Formal critical stance." },
    { fr: "L'analyse des donn\u00e9es r\u00e9v\u00e8le une tendance pr\u00e9occupante.", en: "Data analysis reveals a worrying trend.", note: "Academic findings statement." },
    { fr: "Au regard des r\u00e9sultats obtenus, le dispositif m\u00e9rite d'\u00eatre renforc\u00e9.", en: "In light of the results obtained, the system deserves to be strengthened.", note: "au regard de formal evaluation." },
    { fr: "La r\u00e9forme, bien qu'imparfaite, repr\u00e9sente une avanc\u00e9e ind\u00e9niable.", en: "The reform, though imperfect, represents an undeniable step forward.", note: "bien que + subjunctive implied, concessive." },
  ],
  C1: [
    { fr: "Loin d'\u00eatre anodine, cette d\u00e9cision a des cons\u00e9quences.", en: "Far from trivial, this decision has consequences.", note: "Advanced stylistic opening." },
    { fr: "Quoi qu'il arrive, nous resterons coh\u00e9rents.", en: "Whatever happens, we will remain consistent.", note: "Concessive framework." },
    { fr: "Il convient de nuancer cette affirmation.", en: "This claim should be qualified.", note: "Academic register." },
    { fr: "Le rapport ne tient pas compte des disparit\u00e9s r\u00e9gionales.", en: "The report fails to account for regional disparities.", note: "Analytical precision." },
    { fr: "\u00c0 supposer que cette hypoth\u00e8se soit valide, que faire ?", en: "Assuming this hypothesis is valid, what should we do?", note: "Hypothetical framing." },
    { fr: "Force est de constater que la situation se d\u00e9grade.", en: "It must be acknowledged that the situation is worsening.", note: "Formal idiom." },
    { fr: "En somme, l'argument est convaincant mais incomplet.", en: "In sum, the argument is compelling but incomplete.", note: "Synthesis marker." },
    { fr: "Tout bien consid\u00e9r\u00e9, ce compromis reste pragmatique.", en: "All things considered, this compromise remains pragmatic.", note: "High-level summarization." },
    { fr: "N'e\u00fbt \u00e9t\u00e9 son soutien, nous aurions renonc\u00e9.", en: "Were it not for his support, we would have given up.", note: "Literary inversion." },
    { fr: "Cette proposition soul\u00e8ve des r\u00e9serves l\u00e9gitimes.", en: "This proposal raises legitimate reservations.", note: "C1 argumentation language." },
    { fr: "Il importe de distinguer corr\u00e9lation et causalit\u00e9.", en: "It is important to distinguish correlation and causality.", note: "Analytical discourse." },
    { fr: "Le raisonnement, quoique solide, comporte des limites.", en: "The reasoning, though solid, has limits.", note: "Concessive nuance." },
    { fr: "Nous devons replacer ce d\u00e9bat dans son contexte.", en: "We must put this debate back in context.", note: "Discourse framing." },
    { fr: "Cette orientation para\u00eet pertinente \u00e0 long terme.", en: "This direction seems relevant in the long term.", note: "Strategic register." },
    { fr: "En d\u00e9finitive, la marge de man\u0153uvre demeure r\u00e9duite.", en: "Ultimately, the room for maneuver remains limited.", note: "Conclusion phrase." },
    { fr: "Sans pr\u00e9juger des conclusions, l'enqu\u00eate m\u00e9rite d'\u00eatre approfondie.", en: "Without prejudging the conclusions, the inquiry deserves to be deepened.", note: "sans pr\u00e9juger de \u2014 nuanced epistemic stance." },
    { fr: "C'est pr\u00e9cis\u00e9ment l\u00e0 que r\u00e9side l'enjeu fondamental.", en: "This is precisely where the fundamental issue lies.", note: "C\\'est l\u00e0 que r\u00e9side \u2014 emphatic structure." },
    { fr: "Que l'on adh\u00e8re ou non \u00e0 cette th\u00e8se, elle m\u00e9rite examen.", en: "Whether or not one subscribes to this thesis, it deserves examination.", note: "Que l\\'on + subjunctive \u2014 formal concession." },
    { fr: "Il serait r\u00e9ducteur de limiter l'analyse \u00e0 ce seul facteur.", en: "It would be reductive to limit the analysis to this single factor.", note: "il serait + conditionnel \u2014 intellectual modesty." },
    { fr: "La pertinence de cette approche ne saurait \u00eatre ni\u00e9e.", en: "The relevance of this approach cannot be denied.", note: "ne saurait \u00eatre \u2014 C1 formal modal." },
    { fr: "\u00c0 travers ce prisme, la complexit\u00e9 du ph\u00e9nom\u00e8ne se r\u00e9v\u00e8le.", en: "Through this prism, the complexity of the phenomenon is revealed.", note: "Metaphorical academic lens." },
    { fr: "Cette th\u00e8se, pour s\u00e9duisante qu'elle soit, pr\u00e9sente des failles.", en: "This thesis, however appealing it may be, has flaws.", note: "pour + adj + que + subjonctif \u2014 concessive." },
    { fr: "Rien ne permet d'affirmer avec certitude que tel est le cas.", en: "Nothing allows us to assert with certainty that this is the case.", note: "Epistemic caution at C1 level." },
    { fr: "On ne saurait sous-estimer l'impact de cette d\u00e9cision.", en: "One cannot underestimate the impact of this decision.", note: "ne saurait + infinitive \u2014 formal negation." },
    { fr: "Ce faisant, nous risquons de n\u00e9gliger des aspects essentiels.", en: "In doing so, we risk neglecting essential aspects.", note: "ce faisant \u2014 advanced anaphoric connector." },
    { fr: "Le probl\u00e8me se pose en des termes enti\u00e8rement nouveaux.", en: "The problem presents itself in entirely new terms.", note: "se poser en termes de \u2014 academic reformulation." },
    { fr: "Il n'est pas anodin que ce d\u00e9bat resurface aujourd'hui.", en: "It is not coincidental that this debate resurfaces today.", note: "il n\\'est pas anodin que + subjonctif \u2014 implicit causality." },
    { fr: "Cette perspective oblige \u00e0 repenser les cat\u00e9gories habituelles.", en: "This perspective forces us to rethink our usual categories.", note: "obliger \u00e0 \u2014 intellectual challenge." },
    { fr: "Il importe de ne pas confondre cause et corr\u00e9lation.", en: "It is important not to confuse cause and correlation.", note: "il importe de \u2014 formal injunction." },
    { fr: "En d\u00e9finitive, la question reste enti\u00e8re, faute de preuves d\u00e9cisives.", en: "Ultimately, the question remains open, for lack of decisive evidence.", note: "en d\u00e9finitive + faute de \u2014 conclusion marker." },
  ],
  C2: [
    { fr: "\u00c0 peine avait-il parl\u00e9 que les objections se sont multipli\u00e9es.", en: "Hardly had he spoken when objections multiplied.", note: "C2 inversion pattern." },
    { fr: "Quoi qu'il en soit, la conclusion demeure inchang\u00e9e.", en: "Be that as it may, the conclusion remains unchanged.", note: "Concessive idiom." },
    { fr: "Nul ne saurait nier la complexit\u00e9 du dossier.", en: "No one could deny the complexity of the case.", note: "Formal modal nuance." },
    { fr: "Ce n'est qu'en reformulant la question que nous avancerons.", en: "Only by reframing the issue can we move forward.", note: "Restrictive emphasis." },
    { fr: "Pour autant qu'on puisse en juger, la r\u00e9forme reste inaboutie.", en: "As far as can be judged, the reform remains unfinished.", note: "Evaluative abstraction." },
    { fr: "F\u00fbt-ce au prix d'un effort consid\u00e9rable, il fallait pers\u00e9v\u00e9rer.", en: "Even at considerable cost, one had to persevere.", note: "Literary concessive." },
    { fr: "Leur position est aussi intenable que contradictoire.", en: "Their stance is as untenable as it is contradictory.", note: "Rhetorical comparison." },
    { fr: "D\u00e8s lors, toute objection perd sa pertinence.", en: "From then on, any objection loses relevance.", note: "Strict consequence marker." },
    { fr: "Il va sans dire que cette th\u00e8se demeure discutable.", en: "It goes without saying that this thesis remains debatable.", note: "High-register stance." },
    { fr: "Revenir sur ses propos aurait sap\u00e9 sa cr\u00e9dibilit\u00e9.", en: "Backpedaling would have undermined his credibility.", note: "Idiomatic precision." },
    { fr: "Cette posture, coh\u00e9rente en apparence, se fissure \u00e0 l'analyse.", en: "This stance, coherent in appearance, cracks under analysis.", note: "Nuanced critique." },
    { fr: "Soit, pourvu que nous pr\u00e9servions la coh\u00e9rence d'ensemble.", en: "So be it, provided we preserve overall coherence.", note: "Subjunctive condition." },
    { fr: "L'argumentation, pour brillante qu'elle soit, reste lacunaire.", en: "The argumentation, however brilliant, remains incomplete.", note: "Concessive sophistication." },
    { fr: "\u00c0 cet \u00e9gard, toute simplification serait trompeuse.", en: "In this respect, any simplification would be misleading.", note: "Formal evaluative register." },
    { fr: "En derni\u00e8re analyse, la question demeure irr\u00e9solue.", en: "In final analysis, the issue remains unresolved.", note: "High-level conclusion." },
    { fr: "Pareille interpr\u00e9tation ne r\u00e9siste pas \u00e0 l'examen des faits.", en: "Such an interpretation does not hold up to scrutiny of the facts.", note: "ne pas r\u00e9sister \u00e0 l\\'examen \u2014 C2 critique." },
    { fr: "Nul ne peut se d\u00e9rober \u00e0 la responsabilit\u00e9 que cela implique.", en: "No one can escape the responsibility this implies.", note: "nul ne peut se d\u00e9rober \u00e0 \u2014 literary universalization." },
    { fr: "C'est \u00e0 l'aune de ce crit\u00e8re qu'il convient de juger.", en: "It is by this criterion that one should judge.", note: "\u00e0 l\\'aune de \u2014 elevated formal benchmark phrase." },
    { fr: "L'argument, aussi sophistiqu\u00e9 soit-il, ne saurait convaincre.", en: "The argument, however sophisticated it may be, cannot convince.", note: "aussi...soit-il \u2014 C2 concessive inversion." },
    { fr: "Il y va de la cr\u00e9dibilit\u00e9 m\u00eame de l'institution.", en: "The very credibility of the institution is at stake.", note: "il y va de \u2014 idiomatic stakes-framing." },
    { fr: "Cela \u00e9tant, on ne peut ignorer les objections soulev\u00e9es.", en: "That being said, one cannot ignore the objections raised.", note: "cela \u00e9tant \u2014 formal transitional concession." },
    { fr: "Il e\u00fbt \u00e9t\u00e9 pr\u00e9f\u00e9rable d'agir avant que la situation ne se d\u00e9grade.", en: "It would have been preferable to act before the situation deteriorated.", note: "Subjonctif imparfait (literary)." },
    { fr: "Seule une lecture attentive r\u00e9v\u00e8le les contradictions internes.", en: "Only a careful reading reveals the internal contradictions.", note: "Seule... r\u00e9v\u00e8le \u2014 inversion for emphasis." },
    { fr: "Le paradoxe tient \u00e0 ce que plus on sait, moins on est certain.", en: "The paradox lies in the fact that the more one knows, the less certain one is.", note: "tenir \u00e0 ce que + subj \u2014 epistemic paradox." },
    { fr: "C'est l\u00e0 toute l'ambivalence de la modernit\u00e9.", en: "This is the very ambivalence of modernity.", note: "C\\'est l\u00e0 toute \u2014 rhetorical pointing." },
    { fr: "Aussi paradoxal que cela puisse para\u00eetre, l'absence de preuve renforce la th\u00e8se.", en: "As paradoxical as it may seem, the absence of proof reinforces the thesis.", note: "aussi...que + subjunctive \u2014 C2 argumentation." },
    { fr: "L'enjeu d\u00e9passe de loin les consid\u00e9rations imm\u00e9diates.", en: "The stakes go far beyond immediate considerations.", note: "d\u00e9passer de loin \u2014 amplified formal assertion." },
    { fr: "Cette formulation, pour commode qu'elle soit, reste trompeuse.", en: "This formulation, however convenient it may be, remains misleading.", note: "pour...que \u2014 C2 adversative concession." },
    { fr: "Le silence \u00e9loquent des donn\u00e9es parle de lui-m\u00eame.", en: "The eloquent silence of the data speaks for itself.", note: "Rhetorical paradox construction." },
    { fr: "In fine, la rigueur de l'argumentation est le seul crit\u00e8re qui vaille.", en: "Ultimately, the rigor of argumentation is the only criterion that matters.", note: "in fine \u2014 Latinate register, C2 formal conclusion." },
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

export const UNIT_META: UnitMeta[] = (Object.keys(PHRASES) as CefrLevel[]).flatMap((level) => {
  return chunks(PHRASES[level], 3).map((_c, idx) => ({
    id: `${level.toLowerCase()}-u${idx + 1}`,
    cefr: level,
    title: `${level} Unit ${idx + 1}`,
    lessonTypes: ['vocab_intro', 'guided_dialog', 'grammar_focus', 'controlled_practice', 'fluency_drill', 'unit_review'],
  }))
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

export const QUESTION_BANK: DrillQ[] = GENERATED
