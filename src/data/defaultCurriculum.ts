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

export const defaultSubjectsData: Record<string, Subject> = {
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
      {
        chapter_no: 1,
        chapter_name: 'Chemical Reactions and Equations',
        chapter_name_hindi: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
        intro_hindi: `【 पाठ परिचय 】
प्रकृति में प्रतिदिन अनेक परिवर्तन घटित होते हैं - जैसे दूध का फटना, लोहे पर जंग लगना, भोजन का पकना और हमारे शरीर में पाचन क्रिया। ये सभी 'रासायनिक परिवर्तन' हैं। 

जब एक या एक से अधिक पदार्थ आपस में क्रिया करके भिन्न गुणधर्मों वाले नए पदार्थ बनाते हैं, तो उसे रासायनिक अभिक्रिया (Chemical Reaction) कहा जाता है। इस अध्याय में हम रासायनिक समीकरणों को लिखना, उन्हें द्रव्यमान संरक्षण के नियम के अनुसार संतुलित करना तथा विभिन्न प्रकार की अभिक्रियाओं (संयोजन, वियोजन, विस्थापन, उपचयन-अपचयन) का गहन अध्ययन करते हैं।`,
        notes_hindi: `【 मुख्य संकल्पनाएँ एवं समीकरण 】

१. अभिकारक एवं उत्पाद:
▶ अभिकारक (Reactants): अभिक्रिया में भाग लेने वाले मूल पदार्थ। (तीर के बाईं ओर, L.H.S.)
▶ उत्पाद (Products): अभिक्रिया के फलस्वरूप बनने वाले नए पदार्थ। (तीर के दाईं ओर, R.H.S.)

२. रासायनिक समीकरण का संतुलन (द्रव्यमान संरक्षण का नियम):
▶ नियम: किसी भी रासायनिक अभिक्रिया में द्रव्यमान का न तो निर्माण होता है और न ही विनाश। इसलिए तीर के दोनों ओर प्रत्येक तत्व के परमाणुओं की संख्या समान होनी चाहिए।
▶ उदाहरण: Fe + H2O → Fe3O4 + H2
  संतुलित रूप: 3Fe + 4H2O → Fe3O4 + 4H2

३. अभिक्रियाओं के प्रमुख प्रकार:
▶ (क) संयोजन अभिक्रिया (Combination Reaction): दो या दो से अधिक अभिकारक मिलकर केवल एक एकल उत्पाद बनाते हैं।
  उदा: CaO (बिना बुझा चूना) + H2O → Ca(OH)2 (बुझा हुआ चूना) + ऊष्मा
▶ (ख) वियोजन (अपघटन) अभिक्रिया (Decomposition): एकल अभिकारक टूटकर दो या अधिक छोटे उत्पाद बनाता है।
  उदा: 2FeSO4 (हरा) --ऊष्मा--> Fe2O3 + SO2 + SO3
  उदा: 2Pb(NO3)2 --ऊष्मा--> 2PbO + 4NO2 (भूरा धुआँ) + O2
▶ (ग) विस्थापन अभिक्रिया (Displacement): अधिक क्रियाशील तत्व कम क्रियाशील तत्व को उसके यौगिक से हटा देता है।
  उदा: Fe + CuSO4 (नीला) → FeSO4 (हल्का हरा) + Cu (लाल-भूरा)
▶ (घ) द्विविस्थापन अभिक्रिया (Double Displacement): आयनों का परस्पर आदान-प्रदान होता है (अवक्षेप बनता है)।
  उदा: Na2SO4 + BaCl2 → BaSO4↓ (सफेद अवक्षेप) + 2NaCl
▶ (ङ) उपचयन एवं अपचयन (Redox Reaction):
  - उपचयन (Oxidation): ऑक्सीजन का जुड़ना या हाइड्रोजन का निकलना।
  - अपचयन (Reduction): हाइड्रोजन का जुड़ना या ऑक्सीजन का निकलना।

४. संक्षारण एवं विकृतगंधिता:
▶ संक्षारण (Corrosion): जब धातुएँ वायु, नमी और अम्ल के संपर्क में आकर नष्ट होने लगती हैं। (जैसे लोहे पर जंग लगना)। रोकथाम: पेंट करना, यशदलेपन (जस्तीकरण/Galvanization)।
▶ विकृतगंधिता (Rancidity): वसा तथा तेलयुक्त खाद्य पदार्थों का उपचयित होकर गंध और स्वाद बिगड़ जाना। रोकथाम: नाइट्रोजन गैस भरना (जैसे चिप्स की थैली में)।`,
        topper_tips: `【 🏆 VVI टॉपर परीक्षा टिप्स (Bihar Board Special) 】
१. श्वसन को ऊष्माक्षेपी (Exothermic) अभिक्रिया क्यों कहते हैं? (2 अंक का 100% आने वाला प्रश्न)।
  उत्तर: पाचन के बाद ग्लूकोज कोशिकाओं में ऑक्सीजन से मिलकर ऊर्जा मुक्त करता है (C6H12O6 + 6O2 → 6CO2 + 6H2O + ऊर्जा)।
२. चिप्स की थैली में कौन-सी गैस भरी जाती है? उत्तर: नाइट्रोजन (उपचयन रोकने के लिए)।
३. लोहे की कील को कॉपर सल्फेट के विलयन में डुबोने पर रंग क्यों बदल जाता है? उत्तर: विस्थापन अभिक्रिया के कारण आयरन, कॉपर को विस्थापित कर हरा फेरस सल्फेट बना लेता है।
४. लेड नाइट्रेट को गर्म करने पर किस रंग का धुआँ निकलता है? उत्तर: भूरे रंग का नाइट्रोजन डाइऑक्साइड (NO2)।`,
        subjective_qa: [
          {
            type: 'लघु उत्तरीय',
            question: 'रासायनिक समीकरण को संतुलित करना क्यों आवश्यक है?',
            answer: 'द्रव्यमान संरक्षण के नियम के अनुसार किसी भी रासायनिक अभिक्रिया में द्रव्यमान का न तो सृजन (निर्माण) किया जा सकता है और न ही विनाश। अतः रासायनिक अभिक्रिया के पहले (अभिकारकों) तथा उसके बाद (उत्पादों) प्रत्येक तत्व के कुल परमाणुओं की संख्या बराबर रहनी चाहिए, इसलिए समीकरण को संतुलित करना अनिवार्य है।'
          },
          {
            type: 'लघु उत्तरीय',
            question: 'संयोजन और वियोजन अभिक्रिया में क्या मुख्य अंतर है? प्रत्येक का एक-एक उदाहरण दें।',
            answer: 'संयोजन अभिक्रिया में दो या अधिक पदार्थ मिलकर एक नया एकल उत्पाद बनाते हैं (उदा: C + O2 → CO2)। इसके विपरीत, वियोजन अभिक्रिया में एकल अभिकारक ऊष्मा, प्रकाश या विद्युत द्वारा टूटकर दो या अधिक सरल उत्पादों में विभाजित होता है (उदा: CaCO3 --ऊष्मा--> CaO + CO2)।'
          },
          {
            type: 'दीर्घ उत्तरीय',
            question: 'रेडॉक्स (उपचयन-अपचयन) अभिक्रिया किसे कहते हैं? समीकरण सहित समझाएँ।',
            answer: 'जिस रासायनिक अभिक्रिया में एक अभिकारक उपचयित (ऑक्सीजन ग्रहण या हाइड्रोजन त्याग) होता है तथा दूसरा अभिकारक अपचयित (ऑक्सीजन त्याग या हाइड्रोजन ग्रहण) होता है, उसे उपचयन-अपचयन या रेडॉक्स अभिक्रिया कहते हैं।\nउदाहरण: CuO + H2 --ऊष्मा--> Cu + H2O\nयहाँ CuO से ऑक्सीजन हट रहा है, अतः CuO का अपचयन Cu में हो रहा है। वहीं H2 ऑक्सीजन ग्रहण कर रहा है, अतः H2 का उपचयन H2O में हो रहा है।'
          }
        ],
        mcq: [
          {
            question: 'श्वसन किस प्रकार की रासायनिक अभिक्रिया है?',
            options: ['उपचयन / ऊष्माक्षेपी', 'संयोजन', 'अपचयन', 'ऊष्माशोषी'],
            correct_answer: 0,
            explanation: 'श्वसन में ग्लूकोज के विखंडन से ऊर्जा निकलती है, अतः यह ऊष्माक्षेपी एवं उपचयन अभिक्रिया है।'
          },
          {
            question: 'चिप्स की थैली में विकृतगंधिता से बचाने के लिए कौन-सी गैस भरी जाती है?',
            options: ['ऑक्सीजन', 'नाइट्रोजन', 'हाइड्रोजन', 'क्लोरीन'],
            correct_answer: 1,
            explanation: 'नाइट्रोजन एक अक्रिय गैस है जो तेल-वसा के उपचयन (Oxidation) को रोकती है।'
          },
          {
            question: 'लोहे को जंग से बचाने के लिए उस पर जस्ते (जिंक) की परत चढ़ाने की क्रिया को क्या कहते हैं?',
            options: ['विद्युत अपघटन', 'संक्षारण', 'यशदलेपन (जस्तीकरण)', 'अपचयन'],
            correct_answer: 2,
            explanation: 'जिंक की परत चढ़ाने की विधि को यशदलेपन या गैल्वनीकरण (Galvanization) कहते हैं।'
          },
          {
            question: 'सिल्वर क्लोराइड (AgCl) का रंग कैसा होता है?',
            options: ['श्वेत (सफेद)', 'पीला', 'हरा', 'काला'],
            correct_answer: 0,
            explanation: 'सिल्वर क्लोराइड श्वेत रंग का होता है, जो धूप में धूसर (ग्रे) हो जाता है।'
          }
        ]
      }
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
