import React, { useState, useEffect } from 'react';
import { SubjectId, Chapter, ChapterTestPaper, ChapterTestQuestion } from '../types';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { SAMPLE_CHAPTER_TESTS } from '../data/chapterTests';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  Award,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Printer,
  Sparkles,
  ChevronDown,
  BookOpen,
  FileCheck,
  Check,
  Flame,
  HelpCircle,
} from 'lucide-react';

interface ChapterTestSectionProps {
  selectedSubjectId: SubjectId;
  defaultChapterName?: string;
  onSelectSubject?: (subId: SubjectId) => void;
}

export const ChapterTestSection: React.FC<ChapterTestSectionProps> = ({
  selectedSubjectId,
  defaultChapterName,
}) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];

  // Selected chapter
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(() => {
    if (defaultChapterName) {
      const match = currentSubject.chapters.find((c) => c.name === defaultChapterName);
      if (match) return match;
    }
    return currentSubject.chapters[0];
  });

  // Test state: 'setup' | 'running' | 'completed'
  const [testState, setTestState] = useState<'setup' | 'running' | 'completed'>('setup');
  const [activeTest, setActiveTest] = useState<ChapterTestPaper | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  // Test session state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  // Synchronize when subject changes
  useEffect(() => {
    setSelectedChapter(currentSubject.chapters[0]);
    setTestState('setup');
    setActiveTest(null);
  }, [selectedSubjectId]);

  // Timer effect
  useEffect(() => {
    if (testState !== 'running') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState]);

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Test Handler
  const handleStartTest = async (questionCount: number = 10) => {
    // Check if we have pre-seeded test for this chapter
    const preSeeded = SAMPLE_CHAPTER_TESTS[selectedChapter.id];

    if (preSeeded && preSeeded.questions.length >= questionCount) {
      const paper: ChapterTestPaper = {
        ...preSeeded,
        durationMinutes: questionCount * 1.5,
        questions: preSeeded.questions.slice(0, questionCount),
      };
      setActiveTest(paper);
      setSecondsRemaining(Math.round(paper.durationMinutes * 60));
      setUserAnswers({});
      setFlaggedQuestions({});
      setCurrentQuestionIdx(0);
      setTestState('running');
      return;
    }

    // Generate dynamic test paper via API
    setLoadingTest(true);
    try {
      const response = await fetch('/api/gemini/chapter-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.hindiName,
          chapter: selectedChapter.name,
          count: questionCount,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.questions) {
        throw new Error(data.error || 'टेस्ट लोड नहीं हो सका।');
      }

      const paper: ChapterTestPaper = {
        id: `test-gen-${Date.now()}`,
        subjectId: selectedSubjectId,
        chapterId: selectedChapter.id,
        chapterName: selectedChapter.name,
        totalMarks: data.questions.length,
        durationMinutes: Math.round(data.questions.length * 1.5),
        questions: data.questions,
      };

      setActiveTest(paper);
      setSecondsRemaining(Math.round(paper.durationMinutes * 60));
      setUserAnswers({});
      setFlaggedQuestions({});
      setCurrentQuestionIdx(0);
      setTestState('running');
    } catch (err: any) {
      alert(`त्रुटि: ${err.message || 'कृपया पुनः प्रयास करें।'}`);
    } finally {
      setLoadingTest(false);
    }
  };

  // Submit test
  const handleSubmitTest = () => {
    const unanswered = activeTest
      ? activeTest.questions.filter((_, idx) => userAnswers[idx] === undefined).length
      : 0;
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `आपके अभी भी ${unanswered} प्रश्न अनुत्तरित हैं। क्या आप टेस्ट सबमिट करना चाहते हैं?`
      );
      if (!confirmSubmit) return;
    }
    setTestState('completed');
  };

  // Score Calculations
  const calculateResults = () => {
    if (!activeTest) return { score: 0, total: 0, percent: 0, correct: 0, incorrect: 0, unattempted: 0 };
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    activeTest.questions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (userAns === undefined) {
        unattempted++;
      } else if (userAns === q.correctOptionIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const total = activeTest.questions.length;
    const percent = Math.round((correct / total) * 100);
    return { score: correct, total, percent, correct, incorrect, unattempted };
  };

  const results = calculateResults();

  // Export PDF of Test Paper & Solutions
  const handleExportTestPdf = () => {
    if (!activeTest) return;

    let contentHtml = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18pt; color: #1c1917; border-bottom: 2px solid #d97706; padding-bottom: 6px;">
          ${activeTest.chapterName} • अध्यायवार आधिकारिक टेस्ट पेपर एवं हल
        </h2>
        <p style="color: #666; font-size: 11pt;">
          विषय: ${currentSubject.hindiName} | कुल प्रश्न: ${activeTest.questions.length} | पूर्ण अंक: ${activeTest.totalMarks}
        </p>
      </div>
    `;

    activeTest.questions.forEach((q, idx) => {
      const userChoice = userAnswers[idx];
      const isCorrect = userChoice === q.correctOptionIndex;

      contentHtml += `
        <div style="margin-bottom: 20px; padding: 12px 16px; border: 1px solid #e7e5e4; border-radius: 8px; background: #fafaf9;">
          <div style="font-weight: 700; font-size: 12pt; color: #1c1917; margin-bottom: 8px;">
            प्रश्न संख्या ${idx + 1}: ${q.question} [1 अंक]
          </div>
          <div style="margin-bottom: 10px; font-size: 11pt; color: #444;">
            ${
              q.options
                ? q.options
                    .map(
                      (opt, oIdx) =>
                        `<div style="margin-bottom: 3px; ${
                          oIdx === q.correctOptionIndex ? 'font-weight: bold; color: #047857;' : ''
                        }">(${String.fromCharCode(65 + oIdx)}) ${opt} ${
                          oIdx === q.correctOptionIndex ? '✓ [सही विकल्प]' : ''
                        }</div>`
                    )
                    .join('')
                : ''
            }
          </div>
          <div style="padding: 8px 12px; background: #ffffff; border-left: 3px solid #d97706; font-size: 10.5pt; color: #1c1917;">
            <strong>NCERT प्रामाणिक व्याख्या:</strong> ${q.explanation || q.modelAnswer}
          </div>
        </div>
      `;
    });

    exportToPrintablePdf({
      title: `${activeTest.chapterName} - अध्याय टेस्ट व हल`,
      subtitle: `${currentSubject.hindiName} • बिहार बोर्ड 10वीं NCERT टेस्ट सीरीज`,
      subject: currentSubject.hindiName,
      badge: `स्कोर: ${results.score}/${results.total} (${results.percent}%)`,
      contentHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Test Setup Mode */}
      {testState === 'setup' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      अध्यायवार टेस्ट सेक्शन (Chapter Test Series)
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      BSEB 2025-26
                    </span>
                  </div>
                  <p className="text-sm text-stone-300 mt-1">
                    प्रत्येक अध्याय की वास्तविक बोर्ड परीक्षा पैटर्न पर आधारित लाइव टेस्ट सीरीज। टाइमर, OMR ट्रैकर, तत्काल स्कोर और 100% सही व्याख्या।
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter Selection */}
            <div className="mt-6 pt-5 border-t border-stone-800">
              <label className="block text-xs font-semibold text-stone-400 mb-2">
                टेस्ट देने के लिए अध्याय चुनें ({currentSubject.hindiName}):
              </label>
              <div className="relative max-w-xl">
                <select
                  value={selectedChapter.id}
                  onChange={(e) => {
                    const ch = currentSubject.chapters.find((c) => c.id === e.target.value);
                    if (ch) setSelectedChapter(ch);
                  }}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-amber-500 appearance-none pr-10"
                >
                  {currentSubject.chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} {ch.subCategory ? `(${ch.subCategory})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Test Modes Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Test */}
            <div className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                    क्विक टेस्ट
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Timer className="w-3.5 h-3.5" />
                    <span>15 मिनट</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1">10 वस्तुनिष्ठ प्रश्न</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  कम समय में अध्याय के मुख्य सिद्धांतों और सूत्रों का त्वरित पुनरीक्षण।
                </p>
              </div>
              <button
                onClick={() => handleStartTest(10)}
                disabled={loadingTest}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {loadingTest ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>10 प्रश्न टेस्ट शुरू करें</span>
              </button>
            </div>

            {/* Standard Test */}
            <div className="bg-stone-900 border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg shadow-amber-500/5">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                सर्वाधिक लोकप्रिय
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    मानक टेस्ट
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Timer className="w-3.5 h-3.5" />
                    <span>25 मिनट</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1">15 वस्तुनिष्ठ प्रश्न</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  NCERT अभ्यास एवं बिहार बोर्ड विगत वर्षों के संतुलित प्रश्नों का संपूर्ण टेस्ट।
                </p>
              </div>
              <button
                onClick={() => handleStartTest(15)}
                disabled={loadingTest}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {loadingTest ? <Sparkles className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                <span>15 प्रश्न मानक टेस्ट शुरू करें</span>
              </button>
            </div>

            {/* Mega Board Pattern Test */}
            <div className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    बोर्ड मॉडल टेस्ट
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Timer className="w-3.5 h-3.5" />
                    <span>35 मिनट</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1">20 गहन प्रश्न</h3>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  गहन अध्ययन और राज्य टॉपर स्तर की तैयारी की प्रामाणिक परीक्षा।
                </p>
              </div>
              <button
                onClick={() => handleStartTest(20)}
                disabled={loadingTest}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {loadingTest ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>20 प्रश्न मॉडल टेस्ट शुरू करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Running Test Screen */}
      {testState === 'running' && activeTest && (
        <div className="space-y-5">
          {/* Test Navigation Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="text-xs text-stone-400">अध्याय: {activeTest.chapterName}</div>
              <div className="text-sm font-bold text-white">
                प्रश्न संख्या {currentQuestionIdx + 1} / {activeTest.questions.length}
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  secondsRemaining < 180
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : 'bg-stone-800 text-amber-400 border-stone-700'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                onClick={handleSubmitTest}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow"
              >
                टेस्ट सबमिट करें
              </button>
            </div>
          </div>

          {/* Question and OMR Palette Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Question Card (3 Columns) */}
            <div className="lg:col-span-3 space-y-4">
              {(() => {
                const q = activeTest.questions[currentQuestionIdx];
                if (!q) return null;
                const userChoice = userAnswers[currentQuestionIdx];

                return (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                        प्रश्न {currentQuestionIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setFlaggedQuestions((prev) => ({
                              ...prev,
                              [currentQuestionIdx]: !prev[currentQuestionIdx],
                            }))
                          }
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            flaggedQuestions[currentQuestionIdx]
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-stone-800 text-stone-400 border-stone-700'
                          }`}
                        >
                          {flaggedQuestions[currentQuestionIdx] ? '★ समीक्षा के लिए चिह्नित' : '☆ मार्क फॉर रिव्यू'}
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                      {q.question}
                    </h3>

                    {/* Options */}
                    {q.options && (
                      <div className="space-y-3 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userChoice === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestionIdx]: oIdx,
                                }))
                              }
                              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                                  : 'bg-stone-800/80 border-stone-700/80 text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isSelected
                                      ? 'bg-amber-500 text-stone-950 font-extrabold'
                                      : 'bg-stone-700 text-stone-300'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Bottom Nav Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                      <button
                        onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                        disabled={currentQuestionIdx === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 text-xs font-semibold"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>पिछला प्रश्न</span>
                      </button>

                      <button
                        onClick={() =>
                          setUserAnswers((prev) => {
                            const copy = { ...prev };
                            delete copy[currentQuestionIdx];
                            return copy;
                          })
                        }
                        className="text-xs text-stone-400 hover:text-stone-200 underline"
                      >
                        उत्तर साफ़ करें
                      </button>

                      <button
                        onClick={() =>
                          setCurrentQuestionIdx((p) =>
                            Math.min(activeTest.questions.length - 1, p + 1)
                          )
                        }
                        disabled={currentQuestionIdx === activeTest.questions.length - 1}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 text-xs font-semibold"
                      >
                        <span>अगला प्रश्न</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* OMR Question Palette (1 Column) */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                प्रश्न पैलेट (OMR ट्रैकर)
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {activeTest.questions.map((_, idx) => {
                  const isAnswered = userAnswers[idx] !== undefined;
                  const isFlagged = flaggedQuestions[idx];
                  const isCurrent = currentQuestionIdx === idx;

                  let bg = 'bg-stone-800 text-stone-400 border-stone-700';
                  if (isCurrent) {
                    bg = 'bg-amber-500 text-stone-950 font-bold border-amber-400 ring-2 ring-amber-400/40';
                  } else if (isFlagged) {
                    bg = 'bg-amber-500/30 text-amber-300 border-amber-500';
                  } else if (isAnswered) {
                    bg = 'bg-emerald-600 text-white font-bold border-emerald-500';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600"></span>
                  <span>उत्तर दिया ({Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-stone-800 border border-stone-700"></span>
                  <span>अनुत्तरित ({activeTest.questions.length - Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500"></span>
                  <span>मार्क फॉर रिव्यू ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Test Results Screen */}
      {testState === 'completed' && activeTest && (
        <div className="space-y-6">
          {/* Result Scorecard */}
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
                <Award className="w-9 h-9" />
              </div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                अध्याय टेस्ट परिणाम • {activeTest.chapterName}
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                {results.score} / {results.total}
              </h2>
              <p className="text-sm font-semibold text-stone-300 mt-1">
                प्राप्तांक प्रतिशत: {results.percent}%
              </p>

              {/* Performance Badge */}
              <div className="mt-3">
                {results.percent >= 90 ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                    ★ बिहार बोर्ड राज्य टॉपर ग्रेड (A+)
                  </span>
                ) : results.percent >= 60 ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs">
                    ✓ प्रथम श्रेणी (1st Division Grade A)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
                    ! अधिक अभ्यास व रिविजन की आवश्यकता
                  </span>
                )}
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-800 text-center">
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-lg font-bold text-emerald-400">{results.correct}</div>
                  <div className="text-xs text-stone-400">सही उत्तर</div>
                </div>
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-lg font-bold text-rose-400">{results.incorrect}</div>
                  <div className="text-xs text-stone-400">गलत उत्तर</div>
                </div>
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-lg font-bold text-stone-400">{results.unattempted}</div>
                  <div className="text-xs text-stone-400">छोड़े गए</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  onClick={handleExportTestPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>टेस्ट पेपर व हल PDF डाउनलोड करें</span>
                </button>
                <button
                  onClick={() => setTestState('setup')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>नया टेस्ट दें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Question by Question Review */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              <span>विस्तृत समीक्षा एवं 100% सही उत्तर व्याख्या:</span>
            </h3>

            {activeTest.questions.map((q, idx) => {
              const userChoice = userAnswers[idx];
              const isCorrect = userChoice === q.correctOptionIndex;
              const isSkipped = userChoice === undefined;

              return (
                <div
                  key={idx}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 font-bold">
                      प्रश्न {idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        सही उत्तर (+1 अंक)
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-stone-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        छोड़ा गया
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        गलत उत्तर
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{q.question}</h4>

                  {/* Options with Review Colors */}
                  {q.options && (
                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = oIdx === q.correctOptionIndex;
                        const isThisChosen = oIdx === userChoice;

                        let style = 'bg-stone-950 text-stone-300 border-stone-800';
                        if (isThisCorrect) {
                          style = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold';
                        } else if (isThisChosen && !isCorrect) {
                          style = 'bg-rose-500/15 border-rose-500/50 text-rose-300 line-through';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold">({String.fromCharCode(65 + oIdx)})</span>
                              <span>{opt}</span>
                            </div>
                            {isThisCorrect && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                100% सही
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Detailed Explanation */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border-l-4 border-amber-500 text-xs text-stone-300 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-1">
                      NCERT प्रामाणिक व्याख्या:
                    </span>
                    {q.explanation || q.modelAnswer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
