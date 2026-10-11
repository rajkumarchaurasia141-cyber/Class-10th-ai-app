import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  FileText, 
  Copy, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export interface DailyTestQuestion {
  q: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `daily_test_${y}-${m}-${d}`;
}

export function parseDailyTestText(text: string): DailyTestQuestion[] {
  if (!text || !text.trim()) return [];

  // Split by one or more blank lines
  const rawBlocks = text.split(/\n\s*\n+/);
  const questions: DailyTestQuestion[] = [];

  for (const block of rawBlocks) {
    const lines = block
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 5) continue;

    let q = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let ansStr = '';

    for (const line of lines) {
      if (/^(Q|प्रश्न|Question)\s*[:.]/i.test(line)) {
        q = line.replace(/^(Q|प्रश्न|Question)\s*[:.]\s*/i, '').trim();
      } else if (!q && /^\d+[\s.)-]/i.test(line)) {
        q = line.replace(/^\d+[\s.)-]+\s*/i, '').trim();
      } else if (/^A[.)\]]/i.test(line) || /^\(A\)/i.test(line)) {
        optA = line.replace(/^(\(A\)|A[.)\]])\s*/i, '').trim();
      } else if (/^B[.)\]]/i.test(line) || /^\(B\)/i.test(line)) {
        optB = line.replace(/^(\(B\)|B[.)\]])\s*/i, '').trim();
      } else if (/^C[.)\]]/i.test(line) || /^\(C\)/i.test(line)) {
        optC = line.replace(/^(\(C\)|C[.)\]])\s*/i, '').trim();
      } else if (/^D[.)\]]/i.test(line) || /^\(D\)/i.test(line)) {
        optD = line.replace(/^(\(D\)|D[.)\]])\s*/i, '').trim();
      } else if (/^(Ans|Answer|उत्तर)\s*[:.]/i.test(line)) {
        ansStr = line.replace(/^(Ans|Answer|उत्तर)\s*[:.]\s*/i, '').trim();
      }
    }

    // Determine correct option index
    let correctIndex = -1;
    const cleanAns = ansStr.toUpperCase().trim();
    if (cleanAns.includes('B')) correctIndex = 1;
    else if (cleanAns.includes('C')) correctIndex = 2;
    else if (cleanAns.includes('D')) correctIndex = 3;
    else if (cleanAns.includes('A')) correctIndex = 0;

    if (q && optA && optB && optC && optD && correctIndex >= 0) {
      questions.push({
        q,
        options: [optA, optB, optC, optD],
        correctIndex
      });
    }
  }

  return questions;
}

const SAMPLE_TEXT = `Q: गुरुत्वीय नियतांक क्या है?
A) 9.8
B) 6.67x10^-11
C) 3x10^8
D) 1.6
Ans: B

Q: प्रकाश के अपवर्तन के कितने नियम हैं?
A) 1
B) 2
C) 3
D) 4
Ans: B

Q: मानव नेत्र के किस भाग पर वस्तु का प्रतिबिम्ब बनता है?
A) कॉर्निया
B) परितारिका
C) पुतली
D) दृष्टिपटल (रेटिना)
Ans: D

Q: रासायनिक अभिक्रिया में भाग लेने वाले पदार्थों को क्या कहा जाता है?
A) अभिकारक (Reactants)
B) प्रतिफल (Products)
C) उत्प्रेरक (Catalyst)
D) इनमें से कोई नहीं
Ans: A

Q: भारत में योजना आयोग का गठन कब किया गया था?
A) 15 मार्च 1950
B) 15 सितंबर 1950
C) 15 अक्टूबर 1951
D) 1 जनवरी 2015
Ans: A`;

interface AdminDailyTestPageProps {
  onBack?: () => void;
  onNavigateToStudent?: () => void;
}

export function AdminDailyTestPage({ onBack, onNavigateToStudent }: AdminDailyTestPageProps) {
  const [inputText, setInputText] = useState('');
  const [todayKey, setTodayKey] = useState(getTodayDateKey());
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [lastPublishedTime, setLastPublishedTime] = useState<string | null>(null);

  // Live parsed questions preview
  const parsedPreview = parseDailyTestText(inputText);

  // Check currently published test in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPublishedCount(parsed.length);
        }
      } else {
        setPublishedCount(0);
      }
    } catch (e) {
      setPublishedCount(0);
    }
  }, [todayKey]);

  const handlePublish = () => {
    const questions = parseDailyTestText(inputText);
    if (questions.length === 0) {
      alert("कोई भी प्रश्न सही प्रारूप में नहीं मिला! कृपया प्रारूप की जांच करें:\n\nQ: प्रश्न...\nA) विकल्प 1\nB) विकल्प 2\nC) विकल्प 3\nD) विकल्प 4\nAns: B");
      return;
    }

    try {
      localStorage.setItem(todayKey, JSON.stringify(questions));
      setPublishedCount(questions.length);
      setLastPublishedTime(new Date().toLocaleTimeString('hi-IN'));
      alert(`Published ${questions.length} questions`);
    } catch (e) {
      console.error(e);
      alert("LocalStorage में सेव करने में त्रुटि आई।");
    }
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const handleClear = () => {
    if (window.confirm("क्या आप टेक्स्ट को साफ करना चाहते हैं?")) {
      setInputText('');
    }
  };

  const handleDeletePublished = () => {
    if (window.confirm(`क्या आप आज का पब्लिश किया गया टेस्ट (${todayKey}) हटाना चाहते हैं?`)) {
      localStorage.removeItem(todayKey);
      setPublishedCount(0);
      alert("आज का टेस्ट हटा दिया गया है।");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4D6] py-6 px-4 sm:px-6 lg:px-8 text-[#222222]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="वापस जाएँ"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#D8B45A] text-stone-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin Panel
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    /admin/daily-test
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  Daily Test Manager 📝
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  बिहार बोर्ड मैट्रिक क्लास 10th - दैनिक टेस्ट बनाएं और पब्लिश करें (Zero Backend, LocalStorage)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToStudent) {
                    onNavigateToStudent();
                  } else {
                    window.location.href = '/daily-test';
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>छात्र पेज देखें (/daily-test)</span>
              </button>
            </div>
          </div>

          {/* Current Status Banner */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700">
              <Calendar className="w-4 h-4 text-[#D8B45A]" />
              <span>Key: <b>{todayKey}</b></span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                publishedCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'
              }`}>
                {publishedCount > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>आज पब्लिश प्रश्न: <b>{publishedCount}</b></span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>आज कोई टेस्ट पब्लिश नहीं है</span>
                  </>
                )}
              </span>

              {publishedCount > 0 && (
                <button
                  type="button"
                  onClick={handleDeletePublished}
                  className="text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 text-xs cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  हटाएं
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D8B45A]" />
                प्रश्न पेस्ट करें (Paste Questions)
              </h2>
              <p className="text-xs text-stone-500">
                10-20 प्रश्न एक साथ पेस्ट करें, हर प्रश्न के बीच एक खाली लाइन (Blank Line) रखें
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                नमूना प्रश्न लोड करें (Sample)
              </button>
              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  साफ करें
                </button>
              )}
            </div>
          </div>

          {/* Format Explanation Box */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 text-xs text-stone-700 font-mono leading-relaxed">
            <div className="font-bold text-amber-900 mb-1 font-sans flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              मानक प्रारूप (Exact Format):
            </div>
            <pre className="text-[11px] text-stone-800 bg-white/70 p-2 rounded border border-amber-100 overflow-x-auto whitespace-pre">
{`Q: गुरुत्वीय नियतांक क्या है?
A) 9.8
B) 6.67x10^-11
C) 3x10^8
D) 1.6
Ans: B`}
            </pre>
          </div>

          {/* Big Textarea */}
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`यहाँ प्रश्न पेस्ट करें (Format: Q:, A), B), C), D), Ans: B)...\n\nQ: गुरुत्वीय नियतांक क्या है?\nA) 9.8\nB) 6.67x10^-11\nC) 3x10^8\nD) 1.6\nAns: B`}
              className="w-full h-72 sm:h-80 p-4 border border-stone-300 rounded-xl font-mono text-sm leading-relaxed bg-[#FFFDF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D8B45A] focus:border-transparent resize-y"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-stone-600">
              {parsedPreview.length > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {parsedPreview.length} प्रश्न सही ढंग से पहचाने गए (Ready to publish)
                </span>
              ) : (
                <span className="text-stone-400">
                  ऊपर बॉक्स में प्रश्न पेस्ट करें
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={parsedPreview.length === 0}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                parsedPreview.length > 0
                  ? 'bg-[#F8E8B5] hover:bg-[#F3DE9A] text-stone-900 border border-[#D8B45A]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              }`}
            >
              <Send className="w-4 h-4" />
              Publish Today's Test ({parsedPreview.length})
            </button>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#D8B45A]" />
              <h2 className="text-lg font-black text-stone-900">
                Preview of Parsed Questions ({parsedPreview.length})
              </h2>
            </div>
            {parsedPreview.length > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                Valid Format ✓
              </span>
            )}
          </div>

          {parsedPreview.length === 0 ? (
            <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-500">अभी कोई प्रश्न पार्स नहीं हुआ है</p>
              <p className="text-xs text-stone-400 mt-1">
                ऊपर दिए गए बॉक्स में प्रश्न पेस्ट करें या "नमूना प्रश्न लोड करें" पर क्लिक करें
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {parsedPreview.map((item, index) => {
                const optLabels = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#D8B45A] text-stone-950 font-black text-xs flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                          {item.q}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {item.options.map((opt, optIdx) => {
                            const isCorrect = item.correctIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-1 ring-emerald-400'
                                    : 'bg-white border-stone-200 text-stone-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {optLabels[optIdx]}
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-black">
                                    Correct ✓
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-2.5 text-xs text-stone-500 font-mono flex items-center gap-1.5">
                          <span>सही उत्तर (Correct Ans):</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {optLabels[item.correctIndex]}) {item.options[item.correctIndex]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
