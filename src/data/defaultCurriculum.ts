import { Subject } from '../types';
import { hindiChapter1Data } from './hindiChapter1Data';
import { hindiChapter2Data } from './hindiChapter2Data';
import { hindiChapter3Data } from './hindiChapter3Data';
import { hindiChapter4Data } from './hindiChapter4Data';
import { hindiChapter5Data } from './hindiChapter5Data';
import { hindiChapter6Data } from './hindiChapter6Data';
import { hindiChapter7Data } from './hindiChapter7Data';
import { hindiChapter8Data } from './hindiChapter8Data';
import { hindiChapter9Data } from './hindiChapter9Data';
import { hindiChapter10Data } from './hindiChapter10Data';
import { hindiChapter11Data } from './hindiChapter11Data';
import { hindiChapter12Data } from './hindiChapter12Data';
import { sanskritChapter1Data } from './sanskritChapter1Data';
import { 
  sanskritChapter2Data, 
  sanskritChapter3Data, 
  sanskritChapter4Data 
} from './sanskritChapters2to4';
import { 
  sanskritChapter5Data, 
  sanskritChapter6Data, 
  sanskritChapter7Data 
} from './sanskritChapters5to7';
import { 
  sanskritChapter8Data, 
  sanskritChapter9Data, 
  sanskritChapter10Data 
} from './sanskritChapters8to10';
import { 
  sanskritChapter11Data, 
  sanskritChapter12Data, 
  sanskritChapter13Data, 
  sanskritChapter14Data 
} from './sanskritChapters11to14';
import { 
  hindiPadhyaChapter1, 
  hindiPadhyaChapter2, 
  hindiPadhyaChapter3, 
  hindiPadhyaChapter4, 
  hindiPadhyaChapter5, 
  hindiPadhyaChapter6 
} from './hindiPadhyaChapters1to6';
import { 
  hindiPadhyaChapter7, 
  hindiPadhyaChapter8, 
  hindiPadhyaChapter9, 
  hindiPadhyaChapter10, 
  hindiPadhyaChapter11, 
  hindiPadhyaChapter12 
} from './hindiPadhyaChapters7to12';
import {
  hindiVarnikaChapter25,
  hindiVarnikaChapter26,
  hindiVarnikaChapter27,
  hindiVarnikaChapter28,
  hindiVarnikaChapter29
} from './hindiVarnikaChapters1to5';

import { scienceChapter1Data } from './scienceChapter1Data';
import { 
  scienceChapter2Data, 
  scienceChapter3Data, 
  scienceChapter4Data, 
  scienceChapter5Data 
} from './scienceChapters2to5';
import { 
  scienceChapter6Data, 
  scienceChapter7Data, 
  scienceChapter8Data, 
  scienceChapter9Data 
} from './scienceChapters6to9';
import { 
  scienceChapter10Data, 
  scienceChapter11Data, 
  scienceChapter12Data, 
  scienceChapter13Data 
} from './scienceChapters10to13';
import { 
  scienceChapter14Data, 
  scienceChapter15Data, 
  scienceChapter16Data 
} from './scienceChapters14to16';
import { historyChapter1Data } from './historyChapter1Data';
import { historyChapter2Data } from './historyChapter2Data';
import { historyChapter3Data } from './historyChapter3Data';
import { historyChapter4Data } from './historyChapter4Data';
import { historyChapter5Data } from './historyChapter5Data';
import { historyChapter6Data } from './historyChapter6Data';
import { historyChapter7Data } from './historyChapter7Data';
import { historyChapter8Data } from './historyChapter8Data';
import { polScienceChapter1Data } from './polScienceChapter1Data';
import { polScienceChapter2Data } from './polScienceChapter2Data';
import { polScienceChapter3Data } from './polScienceChapter3Data';
import { polScienceChapter4Data } from './polScienceChapter4Data';
import { polScienceChapter5Data } from './polScienceChapter5Data';
import { geographyChapter1Data } from './geographyChapter1Data';
import { geographyChapter2Data } from './geographyChapter2Data';
import { geographyChapter3Data } from './geographyChapter3Data';
import { geographyChapter4Data } from './geographyChapter4Data';
import { geographyChapter5Data } from './geographyChapter5Data';
import { geographyChapter6Data } from './geographyChapter6Data';
import { economicsChapter1Data } from './economicsChapter1Data';
import { economicsChapter2Data } from './economicsChapter2Data';
import { economicsChapter3Data } from './economicsChapter3Data';
import { economicsChapter4Data } from './economicsChapter4Data';
import { economicsChapter5Data } from './economicsChapter5Data';
import { economicsChapter6Data } from './economicsChapter6Data';
import { economicsChapter7Data } from './economicsChapter7Data';

export const defaultSubjectsData: Record<string, Subject> = {
  economics: {
    id: 'economics',
    subject_name: 'Economics (Our Economy Part-2)',
    subject_name_hindi: 'अर्थशास्त्र (हमारी अर्थव्यवस्था भाग-2)',
    chapters: [
      economicsChapter1Data,
      economicsChapter2Data,
      economicsChapter3Data,
      economicsChapter4Data,
      economicsChapter5Data,
      economicsChapter6Data,
      economicsChapter7Data
    ]
  },
  arthashastra: {
    id: 'arthashastra',
    subject_name: 'Economics (Our Economy Part-2)',
    subject_name_hindi: 'अर्थशास्त्र (हमारी अर्थव्यवस्था भाग-2)',
    chapters: [
      economicsChapter1Data,
      economicsChapter2Data,
      economicsChapter3Data,
      economicsChapter4Data,
      economicsChapter5Data,
      economicsChapter6Data,
      economicsChapter7Data
    ]
  },
  geography: {
    id: 'geography',
    subject_name: 'Geography (India: Resources and Utilization)',
    subject_name_hindi: 'भूगोल (भारत : संसाधन एवं उपयोग भाग-2)',
    chapters: [
      geographyChapter1Data,
      geographyChapter2Data,
      geographyChapter3Data,
      geographyChapter4Data,
      geographyChapter5Data,
      geographyChapter6Data
    ]
  },
  bhugol: {
    id: 'bhugol',
    subject_name: 'Geography (India: Resources and Utilization)',
    subject_name_hindi: 'भूगोल (भारत : संसाधन एवं उपयोग भाग-2)',
    chapters: [
      geographyChapter1Data,
      geographyChapter2Data,
      geographyChapter3Data,
      geographyChapter4Data,
      geographyChapter5Data,
      geographyChapter6Data
    ]
  },
  political_science: {
    id: 'political_science',
    subject_name: 'Political Science (Democratic Politics - II)',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  polscience: {
    id: 'polscience',
    subject_name: 'Political Science (Democratic Politics - II)',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  civics: {
    id: 'civics',
    subject_name: 'Civics / Political Science',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  history: {
    id: 'history',
    subject_name: 'History (Social Science)',
    subject_name_hindi: 'इतिहास (इतिहास की दुनिया भाग-2)',
    chapters: [
      historyChapter1Data,
      historyChapter2Data,
      historyChapter3Data,
      historyChapter4Data,
      historyChapter5Data,
      historyChapter6Data,
      historyChapter7Data,
      historyChapter8Data
    ]
  },
  sanskrit: {
    id: 'sanskrit',
    subject_name: 'Sanskrit',
    subject_name_hindi: 'संस्कृत (पीयूषम् भाग-2)',
    chapters: [
      sanskritChapter1Data,
      sanskritChapter2Data,
      sanskritChapter3Data,
      sanskritChapter4Data,
      sanskritChapter5Data,
      sanskritChapter6Data,
      sanskritChapter7Data,
      sanskritChapter8Data,
      sanskritChapter9Data,
      sanskritChapter10Data,
      sanskritChapter11Data,
      sanskritChapter12Data,
      sanskritChapter13Data,
      sanskritChapter14Data
    ]
  },
  science: {
    id: 'science',
    subject_name: 'Science',
    subject_name_hindi: 'विज्ञान (भौतिकी, रसायन, जीवविज्ञान)',
    chapters: [
      scienceChapter1Data,
      scienceChapter2Data,
      scienceChapter3Data,
      scienceChapter4Data,
      scienceChapter5Data,
      scienceChapter6Data,
      scienceChapter7Data,
      scienceChapter8Data,
      scienceChapter9Data,
      scienceChapter10Data,
      scienceChapter11Data,
      scienceChapter12Data,
      scienceChapter13Data,
      scienceChapter14Data,
      scienceChapter15Data,
      scienceChapter16Data
    ]
  },
  hindi: {
    id: 'hindi',
    subject_name: 'Hindi (Complete 29 Chapters)',
    subject_name_hindi: 'हिन्दी (गोधूलि एवं वर्णिका - संपूर्ण 29 अध्याय)',
    chapters: [
      hindiChapter1Data, hindiChapter2Data, hindiChapter3Data, hindiChapter4Data, 
      hindiChapter5Data, hindiChapter6Data, hindiChapter7Data, hindiChapter8Data, 
      hindiChapter9Data, hindiChapter10Data, hindiChapter11Data, hindiChapter12Data,
      hindiPadhyaChapter1, hindiPadhyaChapter2, hindiPadhyaChapter3, hindiPadhyaChapter4, 
      hindiPadhyaChapter5, hindiPadhyaChapter6, hindiPadhyaChapter7, hindiPadhyaChapter8, 
      hindiPadhyaChapter9, hindiPadhyaChapter10, hindiPadhyaChapter11, hindiPadhyaChapter12,
      hindiVarnikaChapter25, hindiVarnikaChapter26, hindiVarnikaChapter27, hindiVarnikaChapter28, hindiVarnikaChapter29
    ]
  },
  math: {
    id: 'math',
    subject_name: 'Mathematics',
    subject_name_hindi: 'गणित (Maths)',
    chapters: [
      {
        chapter_no: 1,
        chapter_name: 'Real Numbers',
        chapter_name_hindi: 'वास्तविक संख्याएँ',
        intro_hindi: `【 पाठ परिचय 】
कक्षा 9 में हमने परिमेय और अपरिमेय संख्याओं के बारे में जाना था। इन दोनों के सम्मिलित समुच्चय को 'वास्तविक संख्याएँ' (Real Numbers) कहते हैं। 

कक्षा 10 के इस प्रथम अध्याय में हम वास्तविक संख्याओं के दो अति महत्वपूर्ण गुणों का अध्ययन करते हैं:
१. यूक्लिड विभाजन प्रमेयिका (Euclid's Division Lemma) - जिसका प्रयोग दो धनात्मक पूर्णांकों का महत्तम समापवर्तक (HCF) ज्ञात करने के लिए किया जाता है।
२. अंकगणित की आधारभूत प्रमेय (Fundamental Theorem of Arithmetic) - जिसके अनुसार प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के गुणनफल के रूप में अद्वितीय रूप से व्यक्त किया जा सकता है। साथ ही √2, √3, √5 को अपरिमेय सिद्ध करना और दशमलव प्रसार (शांत या अशांत आवर्ती) की जाँच करना सीखते हैं।`,
        notes_hindi: `【 मुख्य सूत्र एवं प्रमेय 】

१. यूक्लिड विभाजन प्रमेयिका (Euclid's Division Lemma):
▶ किन्हीं दो धनात्मक पूर्णांकों a और b के लिए ऐसी अद्वितीय पूर्ण संख्याएँ q (भागफल) और r (शेषफल) विद्यमान होती हैं कि:
  a = bq + r , जहाँ 0 ≤ r < b
  (भाज्य = भाजक × भागफल + शेषफल)

२. दो संख्याओं का संबंध:
▶ दो धनात्मक पूर्णांकों a और b के लिए:
  HCF(a, b) × LCM(a, b) = a × b
  (ल.स. × म.स. = पहली संख्या × दूसरी संख्या)

३. अपरिमेयता सिद्ध करना:
▶ यदि p एक अभाज्य संख्या है और p, a² को विभाजित करती है, तो p, a को भी विभाजित करेगी। (विरोधाभास विधि से √2, √3, √5 अपरिमेय सिद्ध किए जाते हैं)।

४. परिमेय संख्याओं का दशमलव प्रसार:
▶ यदि किसी परिमेय संख्या p/q (जहाँ p और q सह-अभाज्य हैं) के हर (q) का अभाज्य गुणनखंड:
  2^n × 5^m के रूप का है (जहाँ n, m ऋणेतर पूर्णांक हैं), तो उसका दशमलव प्रसार 'शांत' (Terminating) होगा।
▶ यदि हर में 2 और 5 के अतिरिक्त कोई अन्य अभाज्य संख्या (जैसे 3, 7) आती है, तो दशमलव प्रसार 'अशांत आवर्ती' (Non-terminating Repeating) होगा।`,
        topper_tips: `【 🏆 VVI टॉपर परीक्षा टिप्स (Bihar Board Special) 】
१. यूक्लिड विभाजन एल्गोरिथ्म से HCF निकालने का 2 अंक का प्रश्न हर वर्ष 100% पूछा जाता है।
२. "सिद्ध कीजिए कि √5 एक अपरिमेय संख्या है" - यह 3 या 5 अंक का पक्का प्रश्न है।
३. बिना लम्बी विभाजन प्रक्रिया किए बताइए कि 17/8 शांत है या अशांत? उत्तर: 8 = 2³, अतः 2^n के रूप का है, इसलिए यह शांत है।
४. पाई (π) एक अपरिमेय संख्या है, जबकि 22/7 एक परिमेय संख्या है। यह ऑब्जेक्टिव में बार-बार आता है।`,
        subjective_qa: [
          {
            type: 'लघु उत्तरीय',
            question: 'यूक्लिड विभाजन एल्गोरिथ्म का प्रयोग करके 135 और 225 का HCF (म.स.) ज्ञात कीजिए।',
            answer: 'चरण 1: 225 > 135\n225 = 135 × 1 + 90 (चूँकि शेषफल 90 ≠ 0)\nचरण 2: 135 = 90 × 1 + 45 (चूँकि शेषफल 45 ≠ 0)\nचरण 3: 90 = 45 × 2 + 0\nयहाँ शेषफल 0 प्राप्त हो गया है और इस चरण का भाजक 45 है।\nअतः HCF(135, 225) = 45।'
          },
          {
            type: 'लघु उत्तरीय',
            question: 'जाँच कीजिए कि क्या किसी प्राकृत संख्या n के लिए, संख्या 6^n अंक 0 पर समाप्त हो सकती है?',
            answer: 'यदि कोई संख्या शून्य (0) पर समाप्त होना चाहती है, तो उसके अभाज्य गुणनखंड में कम से कम एक बार 2 × 5 आना अनिवार्य है।\nयहाँ 6^n = (2 × 3)^n = 2^n × 3^n है।\nचूँकि 6^n के अभाज्य गुणनखंडों में 5 नहीं है, अंकगणित की आधारभूत प्रमेय की अद्वितीयता के अनुसार 6^n का 5 कोई गुणनखंड नहीं हो सकता। अतः किसी भी प्राकृत संख्या n के लिए 6^n कभी भी शून्य (0) पर समाप्त नहीं हो सकती।'
          }
        ],
        mcq: [
          {
            question: 'पाई (π) किस प्रकार की संख्या है?',
            options: ['परिमेय संख्या', 'अपरिमेय संख्या', 'पूर्णांक संख्या', 'प्राकृत संख्या'],
            correct_answer: 1,
            explanation: 'पाई (π) एक अपरिमेय संख्या है, क्योंकि इसका दशमलव मान अशांत अनावर्ती होता है।'
          },
          {
            question: 'यदि दो संख्याओं का HCF = 15 और LCM = 300 है, तथा एक संख्या 60 है, तो दूसरी संख्या क्या होगी?',
            options: ['50', '75', '100', '125'],
            correct_answer: 1,
            explanation: 'दूसरी संख्या = (HCF × LCM) / पहली संख्या = (15 × 300) / 60 = 4500 / 60 = 75।'
          },
          {
            question: 'निम्न में से किसका दशमलव प्रसार शांत (Terminating) है?',
            options: ['17/8', '3/7', '7/30', '13/125'],
            correct_answer: 0,
            explanation: '17/8 में हर 8 = 2^3 है (2^n के रूप में), अतः यह शांत है। (13/125 भी 5^3 शांत है)।'
          }
        ]
      }
    ]
  }
};
