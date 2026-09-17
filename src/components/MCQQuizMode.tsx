import React, { useState, useEffect } from 'react';
import { SubjectId, MCQItem } from '../types';
import { BSEB_SUBJECTS, SAMPLE_MCQS } from '../data/bsebSyllabus';
import { FULL_50_BSEB_MCQS } from '../data/bseb50MCQs';
import { cleanAsterisksAndFormat } from '../utils/notesFormatter';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Award,
  BookOpen,
  ChevronRight,
  Download,
  Clock,
  LayoutGrid,
  Check,
  Flame,
  Target,
} from 'lucide-react';

interface MCQQuizModeProps {
  selectedSubjectId: SubjectId;
}

export const MCQQuizMode: React.FC<MCQQuizModeProps> = ({ selectedSubjectId }) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];

  // Modes: 'mega50' | 'subject' | 'aiCustom'
  const [testMode, setTestMode] = useState<'mega50' | 'subject'>('mega50');
  const [questions, setQuestions] = useState<MCQItem[]>(FULL_50_BSEB_MCQS);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loadingNewQuestions, setLoadingNewQuestions] = useState(false);
  const [aiGenerateCount, setAiGenerateCount] = useState<number>(10);
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60); // 45 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleLoadMega50 = () => {
    setTestMode('mega50');
    setQuestions(FULL_50_BSEB_MCQS);
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
    setTimerSeconds(45 * 60);
    setIsTimerRunning(true);
  };

  const handleLoadSubjectMCQs = () => {
    setTestMode('subject');
    const filtered = SAMPLE_MCQS.filter((q) => q.subjectId === selectedSubjectId);
    setQuestions(filtered.length > 0 ? filtered : FULL_50_BSEB_MCQS.slice(0, 20));
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
  };

  const handleGenerateAIQuestions = async (countToGenerate: number = aiGenerateCount) => {
    setLoadingNewQuestions(true);
    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.hindiName,
          count: countToGenerate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'क्विज़ लोड करने में समस्या आई।');
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: MCQItem[] = data.questions.map((q: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          subjectId: selectedSubjectId,
          question: cleanAsterisksAndFormat(q.question),
          options: (q.options || []).map((o: string) => cleanAsterisksAndFormat(o)) as [
            string,
            string,
            string,
            string
          ],
          correctIndex: q.correctIndex ?? 0,
          explanation: cleanAsterisksAndFormat(q.explanation || 'BSEB मानक उत्तर।'),
          chapter: currentSubject.hindiName,
        }));
        setQuestions(formatted);
        setSelectedAnswers({});
        setActiveQuestionIndex(0);
      }
    } catch (err) {
      console.error('Quiz Generation error:', err);
    } finally {
      setLoadingNewQuestions(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] === q.correctIndex
  ).length;

  const handleExportTestPdf = () => {
    let html = '';
    const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    html += `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 16pt; font-weight: 800; color: #92400e;">वस्तुनिष्ठ मॉक टेस्ट स्कोरकार्ड</div>
        <div style="font-size: 14pt; font-weight: 700; color: #1c1917; margin-top: 6px;">
          प्राप्तांक: <strong>${correctCount} / ${questions.length}</strong> (सफलता दर: ${scorePct}%)
        </div>
        <div style="font-size: 10.5pt; color: #78716c; margin-top: 4px;">
          हल किए गए: ${answeredCount} | सही: ${correctCount} | गलत: ${answeredCount - correctCount} | अनुत्तरित: ${questions.length - answeredCount}
        </div>
      </div>
    `;

    questions.forEach((q, idx) => {
      const uAns = selectedAnswers[q.id];
      const isAns = uAns !== undefined;
      const isCor = isAns && uAns === q.correctIndex;

      html += `
        <div class="question-card" style="border-left: 4px solid ${
          isAns ? (isCor ? '#16a34a' : '#dc2626') : '#d97706'
        };">
          <div style="display: flex; justify-content: space-between; font-size: 10pt; color: #78350f; font-weight: 700; margin-bottom: 4px;">
            <span>प्रश्न संख्या ${idx + 1} • 1 अंक</span>
            <span>${q.chapter || currentSubject.hindiName}</span>
          </div>
          <div class="q-text">${cleanAsterisksAndFormat(q.question)}</div>
          <div style="margin: 8px 0; font-size: 11pt;">
      `;

      q.options.forEach((opt, oIdx) => {
        const letters = ['(A)', '(B)', '(C)', '(D)'];
        const isThisCorrect = oIdx === q.correctIndex;
        const isThisUser = uAns === oIdx;

        let badge = '';
        let color = '#292524';
        let weight = 'normal';

        if (isThisCorrect) {
          badge = ' ✔ (सही उत्तर)';
          color = '#15803d';
          weight = 'bold';
        }
        if (isThisUser && !isThisCorrect) {
          badge = ' ✖ (आपका चयन)';
          color = '#b91c1c';
          weight = 'bold';
        }

        html += `
          <div style="padding: 2px 0; color: ${color}; font-weight: ${weight};">
            ${letters[oIdx]} ${cleanAsterisksAndFormat(opt)} ${badge}
          </div>
        `;
      });

      html += `
          </div>
          <div class="q-answer">
            <strong>उत्तर एवं स्पष्ट व्याख्या:</strong><br/>
            ${cleanAsterisksAndFormat(q.explanation)}
          </div>
        </div>
      `;
    });

    exportToPrintablePdf({
      title: `${testMode === 'mega50' ? '50 वस्तुनिष्ठ महा-मॉक टेस्ट' : currentSubject.hindiName + ' वस्तुनिष्ठ प्रश्नोत्तरी'}`,
      subtitle: `बिहार बोर्ड (BSEB) 10वीं परीक्षा • OMR पैटर्न मॉडल टेस्ट पेपर`,
      subject: testMode === 'mega50' ? 'संपूर्ण पाठ्यक्रम (50 MCQs)' : currentSubject.hindiName,
      badge: 'बिहार विद्यालय परीक्षा समिति (BSEB) पटना • कक्षा 10वीं',
      contentHtml: html,
    });
  };

  return (
    <div className="space-y-4">
      {/* Mega 50 Objective Test Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>BSEB 50% ऑब्जेक्टिव स्पेशल • जितने चाहें उतने प्रश्न लगाएं</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" />
              <span>50 वस्तुनिष्ठ (MCQ) महा-मॉक टेस्ट व असीमित अभ्यास</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              बिहार बोर्ड 10वीं में 50 अंक सीधे ऑब्जेक्टिव से आते हैं। यहाँ पूरे 50 प्रश्नों का असली बोर्ड परीक्षा जैसा टेस्ट दें या AI से तुरंत 10, 20, 50 नए प्रश्न बनवाएं।
            </p>
          </div>

          {/* Action Mode Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="mega-50-btn"
              onClick={handleLoadMega50}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                testMode === 'mega50'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                  : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>50 महा-मॉक टेस्ट</span>
            </button>

            <button
              id="subject-mcq-btn"
              onClick={handleLoadSubjectMCQs}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                testMode === 'subject'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                  : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{currentSubject.hindiName} प्रश्न</span>
            </button>

            <button
              id="export-test-pdf-btn"
              onClick={handleExportTestPdf}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="टेस्ट व व्याख्या की PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>PDF डाउनलोड</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Stats, Timer & AI Generator count */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Answered counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">प्रगति:</span>
            <span className="text-sm font-bold text-white">
              {answeredCount} / {questions.length}
            </span>
          </div>

          {/* Correct score */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>सही: {correctCount}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-amber-300 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 text-[10px] text-stone-400 hover:text-stone-200 underline"
            >
              {isTimerRunning ? 'रोकें' : 'शुरू'}
            </button>
          </div>
        </div>

        {/* AI Generator on-demand count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">नए AI प्रश्न बनाएं:</span>
          <select
            value={aiGenerateCount}
            onChange={(e) => setAiGenerateCount(Number(e.target.value))}
            className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value={10}>10 प्रश्न</option>
            <option value={20}>20 प्रश्न</option>
            <option value={50}>50 प्रश्न (महा-मॉक)</option>
          </select>

          <button
            onClick={() => handleGenerateAIQuestions(aiGenerateCount)}
            disabled={loadingNewQuestions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingNewQuestions ? 'तैयार हो रहा है...' : 'तुरंत जनरेट करें'}</span>
          </button>
        </div>
      </div>

      {/* OMR Grid Navigator (1 to 50) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2.5 text-xs">
          <span className="font-bold text-stone-300 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>OMR शीट प्रश्न नेविगेटर (कुल {questions.length} प्रश्न):</span>
          </span>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> सही
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> गलत
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-800 inline-block"></span> शेष
            </span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-25 gap-1.5">
          {questions.map((q, idx) => {
            const uAns = selectedAnswers[q.id];
            const hasAns = uAns !== undefined;
            const isCor = hasAns && uAns === q.correctIndex;

            let btnStyle = 'bg-stone-800/80 text-stone-400 hover:bg-stone-700';
            if (hasAns) {
              btnStyle = isCor ? 'bg-emerald-600 text-white font-bold' : 'bg-rose-600 text-white font-bold';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQuestionIndex(idx);
                  const el = document.getElementById(`mcq-card-${q.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-all ${btnStyle} ${
                  activeQuestionIndex === idx ? 'ring-2 ring-amber-400 scale-105' : ''
                }`}
                title={`प्रश्न संख्या ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const userAnswer = selectedAnswers[q.id];
          const hasAnswered = userAnswer !== undefined;
          const isUserCorrect = hasAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              id={`mcq-card-${q.id}`}
              className={`bg-stone-900 border rounded-2xl p-5 sm:p-6 transition-all shadow-md ${
                hasAnswered
                  ? isUserCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-rose-500/40 bg-rose-950/10'
                  : 'border-stone-800 hover:border-stone-750'
              }`}
            >
              {/* Question Header (Strictly clean question numbers without star symbols) */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-amber-300 font-bold text-xs shrink-0 mt-0.5 border border-stone-700">
                    प्रश्न संख्या {qIndex + 1}
                  </span>
                  <div>
                    {q.chapter && (
                      <span className="text-xs text-amber-400/90 font-medium block mb-1">
                        {q.chapter}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {cleanAsterisksAndFormat(q.question)}
                    </h3>
                  </div>
                </div>

                {hasAnswered && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      isUserCorrect
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isUserCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> सही (+1)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> गलत (0)
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {q.options.map((optionText, optIdx) => {
                  const optionLetters = ['(A)', '(B)', '(C)', '(D)'];
                  const isSelected = userAnswer === optIdx;
                  const isCorrect = q.correctIndex === optIdx;

                  let optionStyle =
                    'bg-stone-950/60 border-stone-800 text-stone-200 hover:bg-stone-800/80 hover:border-stone-700 cursor-pointer';

                  if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle =
                        'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/40 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'bg-rose-950/40 border-rose-500/60 text-rose-200 ring-1 ring-rose-500/40';
                    } else {
                      optionStyle = 'bg-stone-950/30 border-stone-850 text-stone-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      id={`mcq-opt-${q.id}-${optIdx}`}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          hasAnswered && isCorrect
                            ? 'bg-emerald-500 text-stone-950'
                            : hasAnswered && isSelected && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span className="flex-1 leading-snug">
                        {cleanAsterisksAndFormat(optionText)}
                      </span>
                      {hasAnswered && isCorrect && (
                        <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after answer is selected */}
              {hasAnswered && (
                <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-4 text-xs sm:text-sm text-stone-300">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>
                      सही उत्तर: {['(A)', '(B)', '(C)', '(D)'][q.correctIndex]} — प्रामाणिक व्याख्या:
                    </span>
                  </div>
                  <p className="leading-relaxed text-stone-200 pl-5">
                    {cleanAsterisksAndFormat(q.explanation)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Scoreboard Banner */}
      {answeredCount === questions.length && questions.length > 0 && (
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <Award className="w-14 h-14 text-amber-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-2xl font-extrabold text-white mb-2">
            बधाई! संपूर्ण {questions.length} ऑब्जेक्टिव टेस्ट संपन्न हुआ!
          </h3>
          <p className="text-base text-stone-300 max-w-xl mx-auto mb-6">
            आपने कुल <span className="font-bold text-white">{questions.length}</span> में से{' '}
            <span className="font-extrabold text-amber-400 text-2xl">{correctCount}</span> अंक (
            {Math.round((correctCount / questions.length) * 100)}%) प्राप्त किए।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setTimerSeconds(45 * 60);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>पुनः टेस्ट दें</span>
            </button>

            <button
              onClick={handleExportTestPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>टेस्ट रिजल्ट व उत्तर PDF डाउनलोड करें</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
