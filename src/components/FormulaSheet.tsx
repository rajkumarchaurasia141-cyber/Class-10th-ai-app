import React, { useState } from 'react';
import { SubjectId } from '../types';
import {
  FileSpreadsheet,
  Calculator,
  Zap,
  Atom,
  Languages,
  BookOpen,
  Copy,
  Check,
  Search,
} from 'lucide-react';

export const FormulaSheet: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'maths' | 'physics' | 'chemistry' | 'grammar'>('maths');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formulasData = {
    maths: [
      {
        topic: 'वास्तविक संख्याएं',
        name: 'यूक्लिड विभाजन प्रमेयिका',
        formula: 'a = bq + r ,  जहाँ 0 ≤ r < b',
        note: 'दो धनात्मक पूर्णांक a और b के म०स० (HCF) निकालने में प्रयुक्त।',
      },
      {
        topic: 'वास्तविक संख्याएं',
        name: 'दो संख्याओं के ल०स० और म०स० में संबंध',
        formula: 'पहली संख्या × दूसरी संख्या = HCF × LCM',
        note: 'प्रत्येक वर्ष 1 या 2 अंक में पूछा जाता है।',
      },
      {
        topic: 'द्विघात समीकरण',
        name: 'द्विघाती सूत्र (श्रीधराचार्य नियम)',
        formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
        note: 'विविक्तकर (Discriminant) D = b² - 4ac. यदि D > 0 तो मूल वास्तविक व भिन्न, D = 0 तो मूल वास्तविक व समान, D < 0 तो कोई वास्तविक मूल नहीं।',
      },
      {
        topic: 'समानांतर श्रेढ़ी (A.P.)',
        name: 'n-वाँ पद एवं n पदों का योग',
        formula: 'aₙ = a + (n - 1)d   |   Sₙ = (n/2)[2a + (n - 1)d] = (n/2)[a + l]',
        note: 'जहाँ a = प्रथम पद, d = सार्व अंतर, n = पदों की संख्या, l = अंतिम पद।',
      },
      {
        topic: 'निर्देशांक ज्यामिति',
        name: 'दूरी सूत्र एवं विभाजन सूत्र',
        formula: 'दूरी AB = √[(x₂ - x₁)² + (y₂ - y₁)²]   |   विभाजन P(x, y) = ((m₁x₂ + m₂x₁)/(m₁ + m₂), (m₁y₂ + m₂y₁)/(m₁ + m₂))',
        note: 'मध्य बिंदु के निर्देशांक = ((x₁ + x₂)/2, (y₁ + y₂)/2).',
      },
      {
        topic: 'त्रिकोणमिति',
        name: 'त्रिकोणमितीय सर्वसमिकाएं (Identities)',
        formula: '1) sin² θ + cos² θ = 1  |  2) 1 + tan² θ = sec² θ  |  3) 1 + cot² θ = cosec² θ',
        note: 'पूरक कोण: sin(90° - θ) = cos θ, tan(90° - θ) = cot θ, sec(90° - θ) = cosec θ.',
      },
      {
        topic: 'त्रिकोणमिति',
        name: 'विशिष्ट कोणों के त्रिकोणमितीय मान (0°, 30°, 45°, 60°, 90°)',
        formula: 'sin 0°=0, 30°=1/2, 45°=1/√2, 60°=√3/2, 90°=1 | tan 0°=0, 30°=1/√3, 45°=1, 60°=√3, 90°=अपरिभाषित',
        note: 'मान सारणी से कम से कम 5 वस्तुनिष्ठ प्रश्न बोर्ड में आते हैं।',
      },
      {
        topic: 'क्षेत्रमिति',
        name: 'वृत्त, बेलन, शंकु व गोला के प्रमुख सूत्र',
        formula: 'वृत्त परिधि = 2πr, क्षे० = πr² | बेलन वक्र = 2πrh, कुल = 2πr(r+h), आयतन = πr²h | शंकु आयतन = (1/3)πr²h | गोला आयतन = (4/3)πr³',
        note: 'छिन्नक (Frustum) का आयतन = (1/3)πh(r₁² + r₂² + r₁r₂).',
      },
      {
        topic: 'सांख्यिकी',
        name: 'माध्य, माध्यक और बहुलक में संबंध',
        formula: 'बहुलक = 3 × माध्यक - 2 × माध्य   (Mode = 3 Median - 2 Mean)',
        note: 'प्रत्येक वर्ष वस्तुनिष्ठ में अनिवार्य रूप से पूछा जाता है।',
      },
    ],
    physics: [
      {
        topic: 'प्रकाशिकी',
        name: 'दर्पण सूत्र एवं आवर्धन सूत्र',
        formula: '1/v + 1/u = 1/f   |   m = -v/u = h₂/h₁',
        note: 'अवतल दर्पण की फोकस दूरी (f) ऋणात्मक (-) तथा उत्तल दर्पण की धनात्मक (+) होती है।',
      },
      {
        topic: 'प्रकाशिकी',
        name: 'लेंस सूत्र एवं आवर्धन सूत्र',
        formula: '1/v - 1/u = 1/f   |   m = v/u = h₂/h₁',
        note: 'लेंस की क्षमता P = 1/f (मीटर में), इसका SI मात्रक डायोप्टर (D) है।',
      },
      {
        topic: 'प्रकाशिकी',
        name: 'स्नेल का नियम (अपवर्तन का द्वितीय नियम)',
        formula: 'μ = sin i / sin r = स्थिरांक',
        note: 'अपवर्तनांक माध्यम में प्रकाश की चाल के अनुपात को दर्शाता है।',
      },
      {
        topic: 'विद्युत',
        name: 'ओम का नियम (Ohm\'s Law)',
        formula: 'V = I × R   |   R = ρ(L/A)',
        note: 'V = विभवांतर (वोल्ट), I = धारा (एम्पियर), R = प्रतिरोध (ओम), ρ = प्रतिरोधकता (ओम-मीटर)।',
      },
      {
        topic: 'विद्युत',
        name: 'प्रतिरोधों का श्रेणीक्रम एवं समांतर क्रम',
        formula: 'श्रेणीक्रम: R_eq = R₁ + R₂ + R₃   |   समांतर क्रम: 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃',
        note: 'घरेलू वायरिंग सदैव समांतर क्रम में की जाती है।',
      },
      {
        topic: 'विद्युत',
        name: 'जूल का तापन नियम एवं विद्युत शक्ति',
        formula: 'H = I²Rt = VIt = (V²/R)t   |   P = VI = I²R = V²/R',
        note: '1 kWh (1 यूनिट) = 3.6 × 10⁶ जूल।',
      },
    ],
    chemistry: [
      {
        topic: 'अम्ल, क्षारक एवं लवण',
        name: 'pH स्केल एवं जल का आयनिक गुणनफल',
        formula: 'pH = -log₁₀[H⁺]  |  उदासीन जल = 7, अम्ल < 7, क्षार > 7',
        note: 'शुद्ध रक्त का pH = 7.4, आमाशय रस = 1.2, नींबू का रस = 2.2.',
      },
      {
        topic: 'रासायनिक अभिक्रियाएं',
        name: 'विरंजक चूर्ण (Bleaching Powder)',
        formula: 'Ca(OH)₂ + Cl₂ → CaOCl₂ + H₂O',
        note: 'कीटाणुनाशक और वस्त्र उद्योग में उपयोग।',
      },
      {
        topic: 'रासायनिक अभिक्रियाएं',
        name: 'बेकिंग सोडा (खाने का सोडा)',
        formula: 'NaHCO₃ (सोडियम हाइड्रोजन कार्बोनेट)',
        note: 'गर्म करने पर CO₂ गैस निकलती है जिससे केक या रोटी स्पंजी बनती है।',
      },
      {
        topic: 'रासायनिक अभिक्रियाएं',
        name: 'धोने का सोडा (Washing Soda)',
        formula: 'Na₂CO₃·10H₂O (सोडियम कार्बोनेट डेकाहाइड्रेट)',
        note: 'इसमें क्रिस्टलन जल के 10 अणु होते हैं।',
      },
      {
        topic: 'रासायनिक अभिक्रियाएं',
        name: 'प्लास्टर ऑफ पेरिस (P.O.P.)',
        formula: 'CaSO₄·½H₂O (कैल्शियम सल्फेट हेमीहाइड्रेट)',
        note: 'जिप्सम CaSO₄·2H₂O को 373 K पर गर्म करने पर बनता है।',
      },
    ],
    grammar: [
      {
        topic: 'हिंदी व्याकरण',
        name: 'संधि के प्रकार',
        formula: '1) स्वर संधि (दीर्घ, गुण, वृद्धि, यण, अयादि)  2) व्यंजन संधि  3) विसर्ग संधि',
        note: 'उदाहरण: विद्या + आलय = विद्यालय (दीर्घ स्वर संधि), नर + ईश = नरेश (गुण स्वर संधि)।',
      },
      {
        topic: 'हिंदी व्याकरण',
        name: 'समास के 6 प्रमुख भेद',
        formula: '1. अव्ययीभाव (प्रति, यथा) 2. तत्पुरुष (कारक चिन्ह) 3. कर्मधारय (विशेषण-विशेष्य) 4. द्विगु (संख्यावाची) 5. द्वंद्व (दोनों पद प्रधान) 6. बहुव्रीहि (अन्य पद प्रधान)',
        note: 'दशानन = बहुव्रीहि, चौराहा = द्विगु, माता-पिता = द्वंद्व, नीलगगन = कर्मधारय।',
      },
      {
        topic: 'संस्कृत व्याकरण',
        name: 'प्रमुख लकारों की पहचान (Tenses)',
        formula: 'लट् लकार (वर्तमान), लोट् लकार (आज्ञा), लङ् लकार (भूतकाल: अ+धातु), विधिलिङ् (चाहिए), लृट् लकार (भविष्यत्)',
        note: 'लट् लकार प्रथम पुरुष एकवचन: पठति, पठतः, पठन्ति।',
      },
      {
        topic: 'संस्कृत व्याकरण',
        name: 'कारक और विभक्तियां',
        formula: 'कर्ता (प्रथमा), कर्म (द्वितीया), करण (तृतीया - से/द्वारा), संप्रदान (चतुर्थी - के लिए), अपादान (पंचमी - अलग होना), संबंध (षष्ठी), अधिकरण (सप्तमी - में/पर)',
        note: 'संस्कृत अनुवाद में कारक चिन्हों के अनुसार विभक्तियों का प्रयोग होता है।',
      },
    ],
  };

  const categories = [
    { id: 'maths' as const, label: 'गणित सूत्र', icon: Calculator, color: 'text-blue-400' },
    { id: 'physics' as const, label: 'भौतिकी नियम', icon: Zap, color: 'text-amber-400' },
    { id: 'chemistry' as const, label: 'रसायन सूत्र व समीकरण', icon: Atom, color: 'text-emerald-400' },
    { id: 'grammar' as const, label: 'हिंदी व संस्कृत व्याकरण नियम', icon: Languages, color: 'text-purple-400' },
  ];

  const currentList = formulasData[activeCategory].filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              बोर्ड परीक्षा त्वरित रीविज़न शीट
            </span>
            <span className="text-xs text-stone-400">सभी आवश्यक सूत्र व नियम</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            BSEB 10वीं फॉर्मूला व सिद्धांत चीट-शीट
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            परीक्षा हॉल में जाने से पहले इन सभी सूत्रों और समीकरणों को कंठस्थ कर लें।
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="सूत्र या नियम खोजें..."
            className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-sm ring-1 ring-amber-500/20'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {currentList.map((item, index) => {
          const itemKey = `${activeCategory}-${index}`;
          const isCopied = copiedKey === itemKey;

          return (
            <div
              key={itemKey}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {item.topic}
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.name}: ${item.formula}`, itemKey)}
                    className="text-stone-400 hover:text-stone-200 p-1 rounded hover:bg-stone-800 transition-colors"
                    title="सूत्र कॉपी करें"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-2">{item.name}</h3>

                <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 mb-2 font-mono text-xs sm:text-sm text-amber-300 select-all overflow-x-auto">
                  {item.formula}
                </div>
              </div>

              {item.note && (
                <p className="text-xs text-stone-400 pt-2 border-t border-stone-850/80 leading-relaxed">
                  💡 <span className="text-stone-300 font-medium">सुझाव:</span> {item.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
