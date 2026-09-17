import { SCIENCE_CHAPTERS } from './scienceCompleteData';
import { SOCIAL_SCIENCE_CHAPTERS } from './socialScienceCompleteData';
import { HINDI_CHAPTERS } from './hindiCompleteData';
import { SANSKRIT_CHAPTERS } from './sanskritCompleteData';

export interface Class10ChapterData {
  chapter_no: number;
  chapter_name_hindi: string;
  subCategory: string;
  objective_questions: Array<{
    question: string;
    answer: string;
  }>;
  mcq: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
    correct_answer: number; // 0, 1, 2, 3
    explanation_hindi: string;
    boardYear?: string;
  }>;
  subjective_qa: Array<{
    question: string;
    marks: number;
    answer_hindi_detailed: string;
    boardYear?: string;
    vviTag?: string;
    points?: string[];
  }>;
  notes_hindi: string;
  structured_notes?: {
    introduction: string;
    keyDefinitions: string[];
    formulasAndPrinciples: string[];
    vviQuestions: Array<{
      q: string;
      ans: string;
      marks: number;
    }>;
    toppersTips?: string[];
  };
  ncert_exercise_solutions?: Array<{
    qNumber: string;
    question: string;
    answer: string;
    marks?: number;
  }>;
  shlokas?: Array<{
    sanskrit: string;
    hindiMeaning: string;
  }>;
  trick_hindi?: {
    title: string;
    mnemonic: string;
    explanation: string;
    example: string;
  };
}

export interface SubjectWithChapters {
  subject_id: string;
  subject_name: string;
  subject_name_hindi: string;
  icon: string;
  tagline: string;
  color: string;
  chapters: Class10ChapterData[];
}

export const CLASS_10_DATABASE: Record<string, SubjectWithChapters> = {
  maths: {
    subject_id: 'maths',
    subject_name: 'Mathematics',
    subject_name_hindi: 'गणित (Maths)',
    icon: 'Calculator',
    tagline: 'NCERT गणित: वास्तविक संख्याएँ, बहुपद, त्रिकोणमिति व सांख्यिकी',
    color: 'from-blue-600 to-indigo-600',
    chapters: [
      {
        chapter_no: 1,
        chapter_name_hindi: 'वास्तविक संख्याएँ (Real Numbers)',
        subCategory: 'बीजगणित',
        objective_questions: [
          {
            question: 'यूक्लिड विभाजन प्रमेयिका का सामान्य सूत्र क्या है?',
            answer: 'a = bq + r, जहाँ 0 ≤ r < b होता है (भाज्य = भाजक × भागफल + शेषफल)।',
          },
          {
            question: 'दो संख्याओं के म०स० (HCF) और ल०स० (LCM) में क्या संबंध होता है?',
            answer: 'पहली संख्या × दूसरी संख्या = म०स० (HCF) × ल०स० (LCM)।',
          },
          {
            question: '√2, √3, और π कैसी संख्याएँ हैं?',
            answer: 'ये सभी अपरिमेय संख्याएँ (Irrational Numbers) हैं।',
          },
          {
            question: 'किसी परिमेय संख्या p/q का दशमलव प्रसार कब सांत होता है?',
            answer: 'जब हर q के अभाज्य गुणनखंड 2ⁿ × 5ᵐ के रूप के हों (जहाँ n, m ऋणेतर पूर्णांक हैं)।',
          },
          {
            question: 'अंकगणित की आधारभूत प्रमेय (Fundamental Theorem of Arithmetic) क्या है?',
            answer: 'प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के एक अद्वितीय गुणनफल के रूप में व्यक्त किया जा सकता है।',
          },
        ],
        mcq: [
          {
            id: 'm1-mcq-1',
            question: 'यदि दो धनात्मक पूर्णांक a और b के लिए HCF(a, b) × LCM(a, b) का मान क्या होगा?',
            options: ['a + b', 'a - b', 'a × b', 'a / b'],
            correct_answer: 2,
            explanation_hindi: 'सूत्र: दो संख्याओं का गुणनफल सदैव उनके HCF और LCM के गुणनफल के बराबर होता है, अर्थात् a × b = HCF(a, b) × LCM(a, b)।',
          },
          {
            id: 'm1-mcq-2',
            question: 'निम्न में से कौन-सी संख्या अपरिमेय (Irrational) है?',
            options: ['√(4/9)', '√9', '√7', '0.333...'],
            correct_answer: 2,
            explanation_hindi: '√7 का पूर्ण वर्गमूल नहीं निकलता और इसका दशमलव प्रसार अशांत-अनावर्ती होता है, अतः यह एक अपरिमेय संख्या है। बाकी सभी परिमेय हैं।',
          },
          {
            id: 'm1-mcq-3',
            question: 'संख्या 17/8 का दशमलव प्रसार कैसा होगा?',
            options: ['सांत (Terminating)', 'अशांत आवर्ती', 'अशांत अनावर्ती', 'इनमें से कोई नहीं'],
            correct_answer: 0,
            explanation_hindi: 'हर 8 = 2³ है, जो 2ⁿ × 5⁰ के रूप का है। जब हर केवल 2 या 5 की घात में हो, तो दशमलव प्रसार हमेशा सांत होता है।',
          },
          {
            id: 'm1-mcq-4',
            question: 'यूक्लिड विभाजन एल्गोरिदम दो धनात्मक पूर्णांकों के क्या परिकलित करने की तकनीक है?',
            options: ['ल०स० (LCM)', 'म०स० (HCF)', 'भागफल', 'शेषफल'],
            correct_answer: 1,
            explanation_hindi: 'यूक्लिड विभाजन एल्गोरिदम का प्रयोग मुख्य रूप से दो धनात्मक पूर्णांकों का महत्तम समापवर्तक (HCF) ज्ञात करने के लिए किया जाता है।',
          },
        ],
        subjective_qa: [
          {
            question: 'सिद्ध कीजिए कि √5 एक अपरिमेय संख्या है। (BSEB 5 अंक)',
            marks: 5,
            answer_hindi_detailed: `उपपत्ति:
चरण 1: मान लिया कि √5 एक परिमेय संख्या है।
अतः हम दो सह-अभाज्य पूर्णांक a और b (जहाँ b ≠ 0) प्राप्त कर सकते हैं कि:
√5 = a/b

चरण 2: दोनों पक्षों का वर्ग करने पर:
5 = a²/b²
=> a² = 5b² ... (समीकरण 1)
यहाँ 5, a² को विभाजित करता है।
प्रमेय 1.3 के अनुसार, 5, a को भी विभाजित करेगा।

चरण 3: अतः हम a = 5c लिख सकते हैं (जहाँ c एक पूर्णांक है)।
a का मान समीकरण 1 में रखने पर:
(5c)² = 5b²
=> 25c² = 5b²
=> b² = 5c²
इसका अर्थ है कि 5, b² को विभाजित करता है, अतः 5, b को भी विभाजित करेगा।

चरण 4: समीकरणों से स्पष्ट है कि 5, a और b दोनों का एक उभयनिष्ठ गुणनखंड (Common Factor) है।
परन्तु यह हमारी इस मान्यता का विरोध करता है कि a और b सह-अभाज्य हैं।
यह विरोधाभास हमारी गलत कल्पना (कि √5 परिमेय है) के कारण हुआ है।

अतः निष्कर्ष: √5 एक अपरिमेय संख्या है। (इति सिद्धम्)`,
          },
          {
            question: 'अभाज्य गुणनखंडन विधि द्वारा 96 और 404 का म०स० (HCF) ज्ञात कीजिए और फिर इनका ल०स० (LCM) ज्ञात कीजिए। (2 अंक)',
            marks: 2,
            answer_hindi_detailed: `हल:
1. संख्याओं का अभाज्य गुणनखंडन करने पर:
96 = 2 × 2 × 2 × 2 × 2 × 3 = 2⁵ × 3
404 = 2 × 2 × 101 = 2² × 101

2. म०स० (HCF):
उभयनिष्ठ अभाज्य गुणनखंडों की सबसे छोटी घात का गुणनफल:
HCF(96, 404) = 2² = 4

3. ल०स० (LCM):
सूत्र: LCM = (संख्याओं का गुणनफल) / HCF
LCM = (96 × 404) / 4 = 96 × 101 = 9696.
उत्तर: HCF = 4 तथा LCM = 9696.`,
          },
        ],
        notes_hindi: `1. NCERT परिचय:
वास्तविक संख्याएँ परिमेय और अपरिमेय संख्याओं का संयुक्त समुच्चय होती हैं। कक्षा 10 में हम यूक्लिड विभाजन प्रमेयिका और अंकगणित की आधारभूत प्रमेय का गहन अध्ययन करते हैं।

2. मुख्य परिभाषाएं व तथ्य:
• यूक्लिड विभाजन प्रमेयिका: दो धनात्मक पूर्णांकों a और b के लिए ऐसी अद्वितीय पूर्ण संख्याएँ q और r विद्यमान हैं कि a = bq + r, जहाँ 0 ≤ r < b.
• परिमेय संख्या: जिसे p/q के रूप में लिखा जा सके, जहाँ p और q पूर्णांक हैं तथा q ≠ 0.
• अपरिमेय संख्या: जिसका दशमलव प्रसार अशांत और अनावर्ती होता है।

3. महत्वपूर्ण सूत्र:
• a = bq + r (भाज्य = भाजक × भागफल + शेषफल)
• पहली संख्या × दूसरी संख्या = HCF × LCM
• सांत दशमलव की शर्त: q = 2ⁿ × 5ᵐ

4. बोर्ड परीक्षा टिप्स:
• √2, √3, √5 को अपरिमेय सिद्ध करने वाला प्रश्न 3 या 5 अंकों में निश्चित आता है। इसके सभी चरण क्रमानुसार लिखें।`,
        trick_hindi: {
          title: 'सांत व अशांत दशमलव पहचानने की ट्रिक',
          mnemonic: 'हर में दिखे 2 या 5, दशमलव होगा बिल्कुल सांत (2 and 5 rule)!',
          explanation: 'यदि किसी भिन्न के सरलतम रूप में हर (denominator) के गुणनखंड केवल 2, 5 या दोनों हों, तो वह हमेशा सांत (terminating) होगा। 2 और 5 के अलावा कोई अन्य अभाज्य संख्या (जैसे 3, 7, 11) आने पर वह अशांत आवर्ती होगा।',
          example: '13/3125: यहाँ 3125 = 5⁵ है (केवल 5 आया), इसलिए बिना भाग दिए तुरंत कहें कि यह "सांत" है!',
        },
      },
      {
        chapter_no: 8,
        chapter_name_hindi: 'त्रिकोणमिति का परिचय (Trigonometry)',
        subCategory: 'त्रिकोणमिति',
        objective_questions: [
          {
            question: 'sin² θ + cos² θ का मान क्या होता है?',
            answer: '1 (एक सर्वसमिका है)।',
          },
          {
            question: 'tan 45° और cot 45° का मान कितना होता है?',
            answer: '1 होता है।',
          },
          {
            question: '1 + tan² θ किसके बराबर होता है?',
            answer: 'sec² θ के बराबर होता है।',
          },
          {
            question: 'sin (90° - θ) का मान क्या होता है?',
            answer: 'cos θ होता है।',
          },
        ],
        mcq: [
          {
            id: 'm8-mcq-1',
            question: 'यदि tan θ = 4/3 हो, तो sin θ का मान क्या होगा?',
            options: ['4/5', '3/5', '5/4', '3/4'],
            correct_answer: 0,
            explanation_hindi: 'tan θ = लंब / आधार = 4/3। कर्ण = √(4² + 3²) = √(16 + 9) = √25 = 5। अतः sin θ = लंब / कर्ण = 4/5।',
          },
          {
            id: 'm8-mcq-2',
            question: 'sec² 60° - 1 का मान निम्नलिखित में से कौन-सा है?',
            options: ['2', '3', '4', '1'],
            correct_answer: 1,
            explanation_hindi: 'sec 60° = 2 होता है। अतः sec² 60° - 1 = (2)² - 1 = 4 - 1 = 3। (सर्वसमिका sec² θ - 1 = tan² θ से tan² 60° = (√3)² = 3)।',
          },
          {
            id: 'm8-mcq-3',
            question: '(1 - cos² θ)(1 + cot² θ) का मान क्या होगा?',
            options: ['0', '-1', '1', 'sin² θ'],
            correct_answer: 2,
            explanation_hindi: '1 - cos² θ = sin² θ तथा 1 + cot² θ = cosec² θ। अतः sin² θ × cosec² θ = sin² θ × (1/sin² θ) = 1।',
          },
        ],
        subjective_qa: [
          {
            question: 'सिद्ध कीजिए कि: (cosec θ - cot θ)² = (1 - cos θ) / (1 + cos θ) (BSEB 5 अंक)',
            marks: 5,
            answer_hindi_detailed: `हल:
बायाँ पक्ष (L.H.S.) = (cosec θ - cot θ)²
= (1/sin θ - cos θ/sin θ)²
= [(1 - cos θ) / sin θ]²
= (1 - cos θ)² / sin² θ

सर्वसमिका sin² θ = 1 - cos² θ का प्रयोग करने पर:
= (1 - cos θ)² / (1 - cos² θ)

सूत्र a² - b² = (a - b)(a + b) से हर का गुणनखंड करने पर:
= [(1 - cos θ)(1 - cos θ)] / [(1 - cos θ)(1 + cos θ)]

उभयनिष्ठ पद (1 - cos θ) को काटने पर:
= (1 - cos θ) / (1 + cos θ) = दायाँ पक्ष (R.H.S.)
इति सिद्धम्।`,
          },
        ],
        notes_hindi: `1. NCERT परिचय:
त्रिकोणमिति समकोण त्रिभुज की भुजाओं और कोणों के बीच के संबंधों का अध्ययन है।

2. मूल त्रिकोणमितीय अनुपात:
• sin θ = लंब / कर्ण
• cos θ = आधार / कर्ण
• tan θ = लंब / आधार
• cosec θ = कर्ण / लंब
• sec θ = कर्ण / आधार
• cot θ = आधार / लंब

3. प्रमुख सर्वसमिकाएं:
• sin² θ + cos² θ = 1
• 1 + tan² θ = sec² θ  => sec² θ - tan² θ = 1
• 1 + cot² θ = cosec² θ => cosec² θ - cot² θ = 1`,
        trick_hindi: {
          title: 'त्रिकोणमितीय अनुपात याद रखने की देसी ट्रिक',
          mnemonic: 'लाल / कका (LAL / KKA)',
          explanation: 'L = लंब, A = आधार, K = कर्ण।\nL/K = sin (लंब बटे कर्ण)\nA/K = cos (आधार बटे कर्ण)\nL/A = tan (लंब बटे आधार)\nउल्टा करने पर K/L = cosec, K/A = sec, A/L = cot प्राप्त होता है।',
          example: 'जब भी परीक्षा में sin, cos, tan का सूत्र भूलें, रफ कार्य में तुरंत LAL/KKA लिख लें!',
        },
      },
      { chapter_no: 2, chapter_name_hindi: 'बहुपद (Polynomials)', subCategory: 'बीजगणित', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 3, chapter_name_hindi: 'दो चर वाले रैखिक समीकरण युग्म', subCategory: 'बीजगणित', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 4, chapter_name_hindi: 'द्विघात समीकरण (Quadratic Equations)', subCategory: 'बीजगणित', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 5, chapter_name_hindi: 'समांतर श्रेढ़ियाँ (Arithmetic Progressions)', subCategory: 'बीजगणित', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 6, chapter_name_hindi: 'त्रिभुज (Triangles)', subCategory: 'ज्यामिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 7, chapter_name_hindi: 'निर्देशांक ज्यामिति (Coordinate Geometry)', subCategory: 'ज्यामिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 9, chapter_name_hindi: 'त्रिकोणमिति के कुछ अनुप्रयोग', subCategory: 'त्रिकोणमिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 10, chapter_name_hindi: 'वृत्त (Circles)', subCategory: 'ज्यामिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 11, chapter_name_hindi: 'रचनाएँ (Constructions)', subCategory: 'ज्यामिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 12, chapter_name_hindi: 'वृत्तों से संबंधित क्षेत्रफल', subCategory: 'क्षेत्रमिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 13, chapter_name_hindi: 'पृष्ठीय क्षेत्रफल और आयतन', subCategory: 'क्षेत्रमिति', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 14, chapter_name_hindi: 'सांख्यिकी (Statistics)', subCategory: 'सांख्यिकी और प्रायिकता', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
      { chapter_no: 15, chapter_name_hindi: 'प्रायिकता (Probability)', subCategory: 'सांख्यिकी और प्रायिकता', mcq: [], objective_questions: [], subjective_qa: [], notes_hindi: 'NCERT नोट्स और फुल-टेस्ट 50 MCQ डेटाबेस से लोड किए जा रहे हैं...' },
    ],
  },
  science: {
    subject_id: 'science',
    subject_name: 'Science',
    subject_name_hindi: 'विज्ञान (Science)',
    icon: 'FlaskConical',
    tagline: 'भौतिकी, रसायनशास्त्र एवं जीवविज्ञान के संपूर्ण NCERT अध्याय',
    color: 'from-emerald-600 to-teal-600',
    chapters: SCIENCE_CHAPTERS,
  },
  social_science: {
    subject_id: 'social_science',
    subject_name: 'Social Science',
    subject_name_hindi: 'सामाजिक विज्ञान (Social Science)',
    icon: 'Globe',
    tagline: 'इतिहास, भूगोल, राजनीति विज्ञान, अर्थशास्त्र एवं आपदा प्रबंधन',
    color: 'from-amber-600 to-orange-600',
    chapters: SOCIAL_SCIENCE_CHAPTERS,
  },
  hindi: {
    subject_id: 'hindi',
    subject_name: 'Hindi',
    subject_name_hindi: 'हिंदी (Hindi)',
    icon: 'BookOpen',
    tagline: 'गोधूलि (भाग 2), वर्णिका (भाग 2) एवं मानक हिंदी व्याकरण',
    color: 'from-rose-600 to-red-600',
    chapters: HINDI_CHAPTERS,
  },
  sanskrit: {
    subject_id: 'sanskrit',
    subject_name: 'Sanskrit',
    subject_name_hindi: 'संस्कृत (Sanskrit)',
    icon: 'Scroll',
    tagline: 'पीयूषम् (भाग 2), सूक्तियाँ, श्लोक अर्थ एवं संस्कृत व्याकरण',
    color: 'from-purple-600 to-violet-600',
    chapters: SANSKRIT_CHAPTERS,
  },
  english: {
    subject_id: 'english',
    subject_name: 'English',
    subject_name_hindi: 'अंग्रेज़ी (English)',
    icon: 'Languages',
    tagline: 'Panorama Part 2, Prose, Poetry & English Grammar for BSEB',
    color: 'from-sky-600 to-cyan-600',
    chapters: [
      {
        chapter_no: 1,
        chapter_name_hindi: 'The Pace for Living (R.C. Hutchinson)',
        subCategory: 'Panorama: Prose',
        objective_questions: [
          {
            question: "Who is the author of 'The Pace for Living'?",
            answer: 'R.C. Hutchinson (a British novelist).',
          },
          {
            question: 'Where did the author see a play involving an elderly corn-merchant?',
            answer: 'In Dublin, Ireland.',
          },
          {
            question: 'What was the chief character in the play?',
            answer: 'An elderly corn-merchant in a small Irish country town.',
          },
        ],
        mcq: [
          {
            id: 'en1-mcq-1',
            question: 'The author classifies himself as a member of the tribe of:',
            options: ['Fast thinkers', 'Slow thinkers', 'Modern thinkers', 'Quick decision makers'],
            correct_answer: 1,
            explanation_hindi: 'R.C. Hutchinson says: "I speak with prejudice, because I belong to the tribe of slow thinkers, those who are cursed with l’esprit de l’escalier (thinking of the right reply hours later)."',
          },
        ],
        subjective_qa: [
          {
            question: 'How does the author describe the fast pace of modern life in simple Hindi explanation? (2 marks)',
            marks: 2,
            answer_hindi_detailed: `उत्तर (Hindi Translation & Explanation):
लेखक R.C. Hutchinson आधुनिक जीवन की तीव्र गति (Fast Pace) पर व्यंग्य करते हैं। वे कहते हैं कि आज मनुष्य मशीनों, हवाई जहाजों और गाड़ियों की तरह 90 मील प्रति घंटे की रफ्तार से सोचना चाहता है।
यह तेज रफ्तार उन लोगों के लिए मजेदार हो सकती है जो आधुनिक गति के साथ ढल चुके हैं, परंतु धीमी गति से सोचने वाले लोगों (Slow Thinkers) के लिए आधुनिक युग में आजीविका कमाना एक बड़ी चुनौती बन गया है।`,
          },
        ],
        notes_hindi: `1. NCERT पाठ परिचय (In Hindi):
'द पेस फॉर लिविंग' पाठ आधुनिक युग की आपाधापी, तेज गति और मानसिक तनाव पर प्रकाश डालता है। लेखक डबलिन के एक नाटक का उदाहरण देते हैं जहाँ एक बूढ़ा मक्का व्यापारी अपनी पत्नी के फिजूलखर्च और आधुनिक जीवन की तेज रफ्तार से परेशान है।

2. Key Vocabulary with Hindi Meaning:
• Despair = निराशा
• Fantastic = काल्पनिक / शानदार
• Prejudice = पूर्वाग्रह
• Escapist = यथार्थ से पलायन करने वाला`,
        trick_hindi: {
          title: 'Author and Place Memory Shortcut',
          mnemonic: 'Pace (रफ्तार) से चला Dublin का Corn Merchant',
          explanation: 'The Pace for Living = R.C. Hutchinson, नाटक देखा = Dublin में, मुख्य पात्र = Corn Merchant.',
          example: 'Objective सवाल में सीधे पूछा जाता है कि play कहाँ देखा गया था: Dublin!',
        },
      },
    ],
  },
};
