import { MathChapterExercises } from '../types';

export const MATH_SOLUTIONS_CH8: MathChapterExercises = {
  chapterNumber: 8,
  chapterTitle: 'त्रिकोणमिति का परिचय (Introduction to Trigonometry)',
  subCategory: 'त्रिकोणमिति (Trigonometry)',
  totalExercises: 4,
  exercises: [
    // ---------------- PRASHNAWALI 8.1 ----------------
    {
      exerciseNumber: '8.1',
      title: 'प्रश्नावली 8.1: त्रिकोणमितीय अनुपात (sin, cos, tan, cot, sec, cosec)',
      concept: 'समकोण त्रिभुज में न्यूनकोण के त्रिकोणमितीय अनुपात: sin θ = लंब/कर्ण, cos θ = आधार/कर्ण, tan θ = लंब/आधार। पाइथागोरस प्रमेय कर्ण² = लंब² + आधार²।',
      keyFormulas: [
        'sin A = लंब/कर्ण, cos A = आधार/कर्ण, tan A = लंब/आधार',
        'cosec A = 1/sin A, sec A = 1/cos A, cot A = 1/tan A',
        'पाइथागोरस प्रमेय: H² = P² + B²',
      ],
      questions: [
        {
          id: 'ch8-8-1-q1',
          qNumber: 'प्रश्न 1',
          questionText: 'Δ ABC में, जिसका कोण B समकोण है, AB = 24 cm और BC = 7 cm है। निम्नलिखित का मान ज्ञात कीजिए:\n(i) sin A, cos A\n(ii) sin C, cos C',
          steps: [
            'पाइथागोरस प्रमेय से: AC = √(AB² + BC²) = √(24² + 7²) = √(576 + 49) = √625 = 25 cm',
            'कोण A के लिए: सम्मुख भुजा (लंब) BC = 7 cm, संलग्न भुजा (आधार) AB = 24 cm, कर्ण AC = 25 cm',
            'sin A = BC/AC = 7/25, cos A = AB/AC = 24/25',
            'कोण C के लिए: लंब AB = 24 cm, आधार BC = 7 cm, कर्ण AC = 25 cm',
            'sin C = AB/AC = 24/25, cos C = BC/AC = 7/25',
          ],
          detailedSolution: `हल:
दिया है: Δ ABC में ∠B = 90°, AB = 24 cm, BC = 7 cm

पाइथागोरस प्रमेय के अनुसार:
AC² = AB² + BC²
AC² = 24² + 7²
AC² = 576 + 49 = 625
AC = √625 = 25 cm

(i) कोण A के संदर्भ में:
लंब (P) = BC = 7 cm
आधार (B) = AB = 24 cm
कर्ण (H) = AC = 25 cm

sin A = लंब / कर्ण = BC / AC = 7 / 25
cos A = आधार / कर्ण = AB / AC = 24 / 25

(ii) कोण C के संदर्भ में:
लंब (P) = AB = 24 cm
आधार (B) = BC = 7 cm
कर्ण (H) = AC = 25 cm

sin C = लंब / कर्ण = AB / AC = 24 / 25
cos C = आधार / कर्ण = BC / AC = 7 / 25`,
          finalAnswer: '(i) sin A = 7/25, cos A = 24/25 | (ii) sin C = 24/25, cos C = 7/25',
          keyFormula: 'sin = P/H, cos = B/H',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 3,
          boardYear: 'BSEB 2024, 2022, 2020',
        },
        {
          id: 'ch8-8-1-q4',
          qNumber: 'प्रश्न 4',
          questionText: 'यदि 15 cot A = 8 हो, तो sin A और sec A का मान ज्ञात कीजिए।',
          steps: [
            'cot A = 8/15 = आधार / लंब => B = 8k, P = 15k',
            'कर्ण H = √(P² + B²) = √(15² + 8²) = √(225 + 64) = √289 = 17k',
            'sin A = P/H = 15/17',
            'sec A = H/B = 17/8',
          ],
          detailedSolution: `हल:
दिया है: 15 cot A = 8
=> cot A = 8 / 15

हम जानते हैं कि cot A = आधार / लंब
माना आधार (B) = 8k तथा लंब (P) = 15k

पाइथागोरस प्रमेय से:
कर्ण (H) = √(P² + B²)
         = √[(15k)² + (8k)²]
         = √(225k² + 64k²)
         = √(289k²)
         = 17k

अब:
sin A = लंब / कर्ण = 15k / 17k = 15 / 17
sec A = कर्ण / आधार = 17k / 8k = 17 / 8`,
          finalAnswer: 'sin A = 15/17, sec A = 17/8',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 2,
          boardYear: 'BSEB 2023, 2021, 2019',
        },
      ],
    },

    // ---------------- PRASHNAWALI 8.2 ----------------
    {
      exerciseNumber: '8.2',
      title: 'प्रश्नावली 8.2: विशिष्ट कोणों के त्रिकोणमितीय अनुपात (0°, 30°, 45°, 60°, 90°)',
      concept: 'मानक कोणों के मानों का उपयोग कर व्यंजकों का मान ज्ञात करना तथा अज्ञात कोण ज्ञात करना।',
      keyFormulas: [
        'sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2',
        'cos 30° = √3/2, cos 45° = 1/√2, cos 60° = 1/2',
        'tan 30° = 1/√3, tan 45° = 1, tan 60° = √3',
      ],
      questions: [
        {
          id: 'ch8-8-2-q1-i',
          qNumber: 'प्रश्न 1 (i)',
          questionText: 'निम्नलिखित के मान निकालिए:\nsin 60° cos 30° + sin 30° cos 60°',
          steps: [
            'मान रखें: sin 60° = √3/2, cos 30° = √3/2, sin 30° = 1/2, cos 60° = 1/2',
            '(√3/2)(√3/2) + (1/2)(1/2) = 3/4 + 1/4 = 4/4 = 1',
          ],
          detailedSolution: `हल:
त्रिकोणमितीय सारणी से मान रखने पर:
sin 60° = √3 / 2
cos 30° = √3 / 2
sin 30° = 1 / 2
cos 60° = 1 / 2

व्यंजक:
sin 60° cos 30° + sin 30° cos 60°
= (√3 / 2) × (√3 / 2) + (1 / 2) × (1 / 2)
= 3/4 + 1/4
= (3 + 1) / 4
= 4/4
= 1`,
          finalAnswer: 'मान = 1',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 2,
          boardYear: 'BSEB 2024, 2022',
        },
        {
          id: 'ch8-8-2-q3',
          qNumber: 'प्रश्न 3',
          questionText: 'यदि tan (A + B) = √3 और tan (A - B) = 1/√3; 0° < A + B ≤ 90°; A > B तो A और B का मान ज्ञात कीजिए।',
          steps: [
            'tan (A + B) = √3 = tan 60° => A + B = 60°',
            'tan (A - B) = 1/√3 = tan 30° => A - B = 30°',
            'जोड़ने पर: 2A = 90° => A = 45°',
            'घटाने पर: 2B = 30° => B = 15°',
          ],
          detailedSolution: `हल:
1. tan (A + B) = √3
   चूँकि tan 60° = √3, अतः
   A + B = 60°  ... (समीकरण 1)

2. tan (A - B) = 1 / √3
   चूँकि tan 30° = 1 / √3, अतः
   A - B = 30°  ... (समीकरण 2)

समीकरण (1) और (2) को जोड़ने पर:
(A + B) + (A - B) = 60° + 30°
2A = 90°
A = 45°

A का मान समीकरण (1) में रखने पर:
45° + B = 60°
B = 60° - 45° = 15°

अतः कोण A = 45° तथा B = 15° है।`,
          finalAnswer: 'A = 45°, B = 15°',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 3,
          boardYear: 'BSEB 2024, 2023, 2021',
        },
      ],
    },

    // ---------------- PRASHNAWALI 8.3 ----------------
    {
      exerciseNumber: '8.3',
      title: 'प्रश्नावली 8.3: पूरक कोणों के त्रिकोणमितीय अनुपात',
      concept: 'sin(90° - A) = cos A, cos(90° - A) = sin A, tan(90° - A) = cot A, sec(90° - A) = cosec A।',
      keyFormulas: [
        'sin(90° - A) = cos A',
        'tan(90° - A) = cot A',
        'sec(90° - A) = cosec A',
      ],
      questions: [
        {
          id: 'ch8-8-3-q3',
          qNumber: 'प्रश्न 3',
          questionText: 'यदि tan 2A = cot (A - 18°), जहाँ 2A एक न्यूनकोण है, तो A का मान ज्ञात कीजिए।',
          steps: [
            'tan 2A = cot (90° - 2A)',
            'cot (90° - 2A) = cot (A - 18°)',
            '90° - 2A = A - 18° => 3A = 108° => A = 36°',
          ],
          detailedSolution: `हल:
दिया है: tan 2A = cot (A - 18°)

हम जानते हैं कि tan θ = cot (90° - θ)
अतः tan 2A = cot (90° - 2A)

समीकरण में प्रतिस्थापित करने पर:
cot (90° - 2A) = cot (A - 18°)

दोनों पक्षों के कोणों की तुलना करने पर:
90° - 2A = A - 18°
90° + 18° = A + 2A
108° = 3A
A = 108° / 3 = 36°

अतः कोण A का मान 36° है।`,
          finalAnswer: 'A = 36°',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 2,
          boardYear: 'BSEB 2023, 2020',
        },
      ],
    },

    // ---------------- PRASHNAWALI 8.4 ----------------
    {
      exerciseNumber: '8.4',
      title: 'प्रश्नावली 8.4: त्रिकोणमितीय सर्वसमिकाएँ (प्रश्न 5 के सभी 10 सिद्ध करने वाले प्रश्न)',
      concept: 'sin² A + cos² A = 1, 1 + tan² A = sec² A, 1 + cot² A = cosec² A पर आधारित 5 अंकों के सर्वोत्कृष्ट प्रश्न।',
      keyFormulas: [
        'sin² A + cos² A = 1',
        'sec² A - tan² A = 1',
        'cosec² A - cot² A = 1',
        'tan A = sin A / cos A, cot A = cos A / sin A',
      ],
      questions: [
        {
          id: 'ch8-8-4-q5-i',
          qNumber: 'प्रश्न 5 (i)',
          questionText: 'सिद्ध कीजिए: (cosec θ - cot θ)² = (1 - cos θ) / (1 + cos θ)',
          steps: [
            'L.H.S. = (1/sin θ - cos θ/sin θ)² = (1 - cos θ)² / sin² θ',
            '= (1 - cos θ)² / (1 - cos² θ) = [(1 - cos θ)(1 - cos θ)] / [(1 - cos θ)(1 + cos θ)]',
            '= (1 - cos θ) / (1 + cos θ) = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
बायाँ पक्ष (L.H.S.) = (cosec θ - cot θ)²

cosec θ और cot θ को sin θ और cos θ के पदों में लिखने पर:
= (1 / sin θ - cos θ / sin θ)²
= [(1 - cos θ) / sin θ]²
= (1 - cos θ)² / sin² θ

सर्वसमिका sin² θ = 1 - cos² θ का प्रयोग करने पर:
= (1 - cos θ)² / (1 - cos² θ)

सूत्र a² - b² = (a - b)(a + b) से हर का गुणनखंड करने पर:
= [(1 - cos θ)(1 - cos θ)] / [(1 - cos θ)(1 + cos θ)]

(1 - cos θ) को अंश और हर से काटने पर:
= (1 - cos θ) / (1 + cos θ)
= दायाँ पक्ष (R.H.S.)
(इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: (cosec θ - cot θ)² = (1 - cos θ)/(1 + cos θ)',
          keyFormula: 'sin² θ = 1 - cos² θ',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2023, 2022, 2020',
        },
        {
          id: 'ch8-8-4-q5-ii',
          qNumber: 'प्रश्न 5 (ii)',
          questionText: 'सिद्ध कीजिए: cos A / (1 + sin A) + (1 + sin A) / cos A = 2 sec A',
          steps: [
            'ल०स० लें: [cos² A + (1 + sin A)²] / [(1 + sin A) cos A]',
            '= [cos² A + 1 + 2 sin A + sin² A] / [(1 + sin A) cos A]',
            '= [2 + 2 sin A] / [(1 + sin A) cos A] = 2(1 + sin A) / [(1 + sin A) cos A]',
            '= 2 / cos A = 2 sec A = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
L.H.S. = cos A / (1 + sin A) + (1 + sin A) / cos A

ल०स०प० लेने पर:
= [cos² A + (1 + sin A)²] / [(1 + sin A) cos A]
= [cos² A + 1 + 2 sin A + sin² A] / [(1 + sin A) cos A]
= [(cos² A + sin² A) + 1 + 2 sin A] / [(1 + sin A) cos A]

चूँकि cos² A + sin² A = 1 होता है:
= [1 + 1 + 2 sin A] / [(1 + sin A) cos A]
= [2 + 2 sin A] / [(1 + sin A) cos A]
= 2(1 + sin A) / [(1 + sin A) cos A]
= 2 / cos A
= 2 sec A
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: 2 sec A',
          keyFormula: 'cos² A + sin² A = 1',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2021',
        },
        {
          id: 'ch8-8-4-q5-iii',
          qNumber: 'प्रश्न 5 (iii)',
          questionText: 'सिद्ध कीजिए: tan θ / (1 - cot θ) + cot θ / (1 - tan θ) = 1 + sec θ cosec θ',
          steps: [
            'tan θ और cot θ को sin θ और cos θ में बदलें',
            'L.H.S. = (sin² θ) / [cos θ (sin θ - cos θ)] - (cos² θ) / [sin θ (sin θ - cos θ)]',
            '= (sin³ θ - cos³ θ) / [sin θ cos θ (sin θ - cos θ)]',
            'सूत्र a³ - b³ = (a - b)(a² + ab + b²) का प्रयोग करें: = (1 + sin θ cos θ) / (sin θ cos θ) = 1 + sec θ cosec θ',
          ],
          detailedSolution: `उपपत्ति:
L.H.S. = tan θ / (1 - cot θ) + cot θ / (1 - tan θ)

tan θ = sin θ / cos θ तथा cot θ = cos θ / sin θ रखने पर:
= [ (sin θ / cos θ) / (1 - cos θ / sin θ) ] + [ (cos θ / sin θ) / (1 - sin θ / cos θ) ]
= [ (sin θ / cos θ) / { (sin θ - cos θ) / sin θ } ] + [ (cos θ / sin θ) / { (cos θ - sin θ) / cos θ } ]
= sin² θ / [cos θ (sin θ - cos θ)] - cos² θ / [sin θ (sin θ - cos θ)]

ल०स०प० = sin θ cos θ (sin θ - cos θ) लेने पर:
= (sin³ θ - cos³ θ) / [sin θ cos θ (sin θ - cos θ)]

सर्वसमिका a³ - b³ = (a - b)(a² + ab + b²) लगाने पर:
= [(sin θ - cos θ)(sin² θ + sin θ cos θ + cos² θ)] / [sin θ cos θ (sin θ - cos θ)]
= (sin² θ + cos² θ + sin θ cos θ) / (sin θ cos θ)
= (1 + sin θ cos θ) / (sin θ cos θ)
= 1 / (sin θ cos θ) + (sin θ cos θ) / (sin θ cos θ)
= sec θ cosec θ + 1
= 1 + sec θ cosec θ
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: 1 + sec θ cosec θ',
          keyFormula: 'a³ - b³ = (a - b)(a² + ab + b²)',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2023, 2020',
        },
        {
          id: 'ch8-8-4-q5-iv',
          qNumber: 'प्रश्न 5 (iv)',
          questionText: 'सिद्ध कीजिए: (1 + sec A) / sec A = sin² A / (1 - cos A)',
          steps: [
            'L.H.S. = (1 + 1/cos A) / (1/cos A) = [(cos A + 1)/cos A] / (1/cos A) = 1 + cos A',
            'R.H.S. = sin² A / (1 - cos A) = (1 - cos² A) / (1 - cos A) = [(1 - cos A)(1 + cos A)] / (1 - cos A) = 1 + cos A',
            'L.H.S. = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
बायाँ पक्ष (L.H.S.):
= (1 + sec A) / sec A
= 1/sec A + sec A/sec A
= cos A + 1
= 1 + cos A

दायाँ पक्ष (R.H.S.):
= sin² A / (1 - cos A)
सर्वसमिका sin² A = 1 - cos² A से:
= (1 - cos² A) / (1 - cos A)
= [(1 - cos A)(1 + cos A)] / (1 - cos A)
= 1 + cos A

चूँकि L.H.S. = R.H.S. = 1 + cos A
अतः सिद्ध हुआ: (1 + sec A)/sec A = sin² A / (1 - cos A)। (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ',
          keyFormula: 'sec A = 1/cos A, sin² A = 1 - cos² A',
          vviLevel: 'महत्वपूर्ण',
          marks: 3,
          boardYear: 'BSEB 2022',
        },
        {
          id: 'ch8-8-4-q5-v',
          qNumber: 'प्रश्न 5 (v)',
          questionText: 'सर्वसमिका cosec² A = 1 + cot² A को लागू करके सिद्ध कीजिए:\n(cos A - sin A + 1) / (cos A + sin A - 1) = cosec A + cot A',
          steps: [
            'अंश और हर को sin A से भाग दें: (cot A - 1 + cosec A) / (cot A + 1 - cosec A)',
            '= [(cot A + cosec A) - (cosec² A - cot² A)] / (cot A + 1 - cosec A)',
            '= (cosec A + cot A)[1 - (cosec A - cot A)] / (1 - cosec A + cot A)',
            '= cosec A + cot A = R.H.S.',
          ],
          detailedSolution: `उपपत्ति (BSEB 5-अंक स्पेशल):
L.H.S. = (cos A - sin A + 1) / (cos A + sin A - 1)

अंश और हर दोनों को sin A से विभाजित करने पर:
= [ (cos A/sin A) - (sin A/sin A) + (1/sin A) ] / [ (cos A/sin A) + (sin A/sin A) - (1/sin A) ]
= (cot A - 1 + cosec A) / (cot A + 1 - cosec A)
= [(cot A + cosec A) - 1] / (cot A - cosec A + 1)

हम जानते हैं कि cosec² A - cot² A = 1 होता है, अतः अंश में 1 का यह मान रखने पर:
= [(cosec A + cot A) - (cosec² A - cot² A)] / (cot A - cosec A + 1)
= [(cosec A + cot A) - (cosec A - cot A)(cosec A + cot A)] / (cot A - cosec A + 1)

उभयनिष्ठ (cosec A + cot A) बाहर लेने पर:
= (cosec A + cot A) [1 - (cosec A - cot A)] / (cot A - cosec A + 1)
= (cosec A + cot A) [1 - cosec A + cot A] / [cot A - cosec A + 1]

चूँकि [1 - cosec A + cot A] और [cot A - cosec A + 1] समान हैं, अतः वे कट जाते हैं:
= cosec A + cot A
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: cosec A + cot A',
          keyFormula: 'cosec² A - cot² A = 1',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2022, 2019',
        },
        {
          id: 'ch8-8-4-q5-vi',
          qNumber: 'प्रश्न 5 (vi)',
          questionText: 'सिद्ध कीजिए: √[(1 + sin A) / (1 - sin A)] = sec A + tan A',
          steps: [
            'करणी के अंदर हर का परिमेयकरण करें: √[ {(1 + sin A)(1 + sin A)} / {(1 - sin A)(1 + sin A)} ]',
            '= √[(1 + sin A)² / (1 - sin² A)] = √[(1 + sin A)² / cos² A]',
            '= (1 + sin A) / cos A = 1/cos A + sin A/cos A = sec A + tan A = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
L.H.S. = √[(1 + sin A) / (1 - sin A)]

करणी के अंतर्गत हर का परिमेयकरण (1 + sin A से गुणा) करने पर:
= √[ {(1 + sin A)(1 + sin A)} / {(1 - sin A)(1 + sin A)} ]
= √[ (1 + sin A)² / (1 - sin² A) ]

सर्वसमिका 1 - sin² A = cos² A लगाने पर:
= √[ (1 + sin A)² / cos² A ]
वर्गमूल हटाने पर:
= (1 + sin A) / cos A
= (1 / cos A) + (sin A / cos A)
= sec A + tan A
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: sec A + tan A',
          keyFormula: '1 - sin² A = cos² A',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2023, 2021, 2018, 2016',
        },
        {
          id: 'ch8-8-4-q5-vii',
          qNumber: 'प्रश्न 5 (vii)',
          questionText: 'सिद्ध कीजिए: (sin θ - 2 sin³ θ) / (2 cos³ θ - cos θ) = tan θ',
          steps: [
            'अंश से sin θ और हर से cos θ उभयनिष्ठ लें: [sin θ (1 - 2 sin² θ)] / [cos θ (2 cos² θ - 1)]',
            '1 - 2 sin² θ = (sin² θ + cos² θ) - 2 sin² θ = cos² θ - sin² θ',
            '2 cos² θ - 1 = 2 cos² θ - (sin² θ + cos² θ) = cos² θ - sin² θ',
            '= (sin θ / cos θ) = tan θ = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
L.H.S. = (sin θ - 2 sin³ θ) / (2 cos³ θ - cos θ)

अंश में से sin θ तथा हर में से cos θ उभयनिष्ठ लेने पर:
= [ sin θ (1 - 2 sin² θ) ] / [ cos θ (2 cos² θ - 1) ]

हम जानते हैं कि 1 = sin² θ + cos² θ:
अंश में:
1 - 2 sin² θ = (sin² θ + cos² θ) - 2 sin² θ = cos² θ - sin² θ

हर में:
2 cos² θ - 1 = 2 cos² θ - (sin² θ + cos² θ) = cos² θ - sin² θ

अतः:
= [ sin θ (cos² θ - sin² θ) ] / [ cos θ (cos² θ - sin² θ) ]
= sin θ / cos θ
= tan θ
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: tan θ',
          keyFormula: 'sin² θ + cos² θ = 1',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2023, 2020, 2017',
        },
        {
          id: 'ch8-8-4-q5-viii',
          qNumber: 'प्रश्न 5 (viii)',
          questionText: 'सिद्ध कीजिए: (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A',
          steps: [
            '(a + b)² से विस्तार करें: sin² A + 2 sin A cosec A + cosec² A + cos² A + 2 cos A sec A + sec² A',
            'sin² A + cos² A = 1, 2(1) + 2(1) = 4 => 1 + 4 = 5',
            'cosec² A = 1 + cot² A तथा sec² A = 1 + tan² A',
            '= 5 + (1 + cot² A) + (1 + tan² A) = 7 + tan² A + cot² A = R.H.S.',
          ],
          detailedSolution: `उपपत्ति (BSEB 5-अंक VVI):
L.H.S. = (sin A + cosec A)² + (cos A + sec A)²

विस्तार करने पर:
= (sin² A + 2 sin A cosec A + cosec² A) + (cos² A + 2 cos A sec A + sec² A)

पदों को व्यवस्थित करने पर:
= (sin² A + cos² A) + 2(sin A × 1/sin A) + 2(cos A × 1/cos A) + cosec² A + sec² A
= 1 + 2(1) + 2(1) + cosec² A + sec² A
= 1 + 2 + 2 + cosec² A + sec² A
= 5 + cosec² A + sec² A

सर्वसमिकाएँ cosec² A = 1 + cot² A और sec² A = 1 + tan² A रखने पर:
= 5 + (1 + cot² A) + (1 + tan² A)
= 5 + 1 + 1 + tan² A + cot² A
= 7 + tan² A + cot² A
= R.H.S. (इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: 7 + tan² A + cot² A',
          keyFormula: 'sin² A + cos² A = 1, sec² A = 1 + tan² A, cosec² A = 1 + cot² A',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2022, 2019',
        },
        {
          id: 'ch8-8-4-q5-ix',
          qNumber: 'प्रश्न 5 (ix)',
          questionText: 'सिद्ध कीजिए: (cosec A - sin A)(sec A - cos A) = 1 / (tan A + cot A)',
          steps: [
            'L.H.S. = (1/sin A - sin A)(1/cos A - cos A) = [(1 - sin² A)/sin A] × [(1 - cos² A)/cos A] = (cos² A/sin A) × (sin² A/cos A) = sin A cos A',
            'R.H.S. = 1 / (sin A/cos A + cos A/sin A) = 1 / [(sin² A + cos² A)/(sin A cos A)] = 1 / [1 / (sin A cos A)] = sin A cos A',
            'L.H.S. = R.H.S.',
          ],
          detailedSolution: `उपपत्ति:
बायाँ पक्ष (L.H.S.):
= (cosec A - sin A)(sec A - cos A)
= (1/sin A - sin A)(1/cos A - cos A)
= [ (1 - sin² A) / sin A ] × [ (1 - cos² A) / cos A ]
= (cos² A / sin A) × (sin² A / cos A)
= cos A sin A = sin A cos A

दायाँ पक्ष (R.H.S.):
= 1 / (tan A + cot A)
= 1 / [ (sin A / cos A) + (cos A / sin A) ]
= 1 / [ (sin² A + cos² A) / (sin A cos A) ]
चूँकि sin² A + cos² A = 1:
= 1 / [ 1 / (sin A cos A) ]
= sin A cos A

अतः L.H.S. = R.H.S. = sin A cos A
(इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ',
          keyFormula: '1 - sin² A = cos² A, 1 - cos² A = sin² A',
          vviLevel: 'महत्वपूर्ण',
          marks: 5,
          boardYear: 'BSEB 2023, 2021',
        },
        {
          id: 'ch8-8-4-q5-x',
          qNumber: 'प्रश्न 5 (x)',
          questionText: 'सिद्ध कीजिए: (1 + tan² A) / (1 + cot² A) = [ (1 - tan A) / (1 - cot A) ]² = tan² A',
          steps: [
            'भाग 1: (1 + tan² A)/(1 + cot² A) = sec² A / cosec² A = (1/cos² A) / (1/sin² A) = sin² A / cos² A = tan² A',
            'भाग 2: [ (1 - tan A) / (1 - 1/tan A) ]² = [ (1 - tan A) / {(tan A - 1)/tan A} ]² = [ -tan A ]² = tan² A',
          ],
          detailedSolution: `उपपत्ति:
1. प्रथम भाग:
= (1 + tan² A) / (1 + cot² A)
सर्वसमिका 1 + tan² A = sec² A तथा 1 + cot² A = cosec² A से:
= sec² A / cosec² A
= (1 / cos² A) / (1 / sin² A)
= sin² A / cos² A
= tan² A

2. द्वितीय भाग:
= [ (1 - tan A) / (1 - cot A) ]²
cot A = 1/tan A रखने पर:
= [ (1 - tan A) / (1 - 1/tan A) ]²
= [ (1 - tan A) / { (tan A - 1) / tan A } ]²
= [ (1 - tan A) × tan A / { -(1 - tan A) } ]²
= [ -tan A ]²
= tan² A

अतः (1 + tan² A)/(1 + cot² A) = [ (1 - tan A)/(1 - cot A) ]² = tan² A
(इति सिद्धम्)`,
          finalAnswer: 'सिद्ध हुआ: दोनों व्यंजक tan² A के बराबर हैं',
          keyFormula: '1 + tan² A = sec² A, 1 + cot² A = cosec² A',
          vviLevel: 'VVI (अति-महत्वपूर्ण)',
          marks: 5,
          boardYear: 'BSEB 2024, 2022',
        },
      ],
    },
  ],
};
