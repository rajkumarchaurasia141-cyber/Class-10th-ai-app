import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BookOpen, 
  HelpCircle, 
  Calendar,
  Sparkles,
  Share2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getTodayDateKey, DailyTestQuestion } from './AdminDailyTestPage';

interface StudentDailyTestPageProps {
  onBack?: () => void;
  onNavigateToAdmin?: () => void;
}

export function StudentDailyTestPage({ onBack, onNavigateToAdmin }: StudentDailyTestPageProps) {
  const [todayKey, setTodayKey] = useState<string>(getTodayDateKey());
  const [questions, setQuestions] = useState<DailyTestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  // Store user answer index for each question: { [questionIndex]: selectedOptionIndex }
  const [answers, setAnswers] = useState<{ [qIndex: number]: number }>({});
  const [testDateFormatted, setTestDateFormatted] = useState('');

  // Load today's test from localStorage
  const loadTest = () => {
    setLoading(true);
    const key = getTodayDateKey();
    setTodayKey(key);

    const now = new Date();
    const formatted = now.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setTestDateFormatted(formatted);

    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        } else {
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error(e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTest();
  }, []);

  // Compute score
  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((acc, [qIdx, selectedOpt]) => {
    const q = questions[Number(qIdx)];
    if (q && q.correctIndex === selectedOpt) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    // If already answered this question, disable further clicks
    if (answers[questionIndex] !== undefined) return;

    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleResetTest = () => {
    if (Object.keys(answers).length === 0) return;
    if (window.confirm("क्या आप टेस्ट को रीसेट करके दोबारा शुरू करना चाहते हैं?")) {
      setAnswers({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const optLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222]">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Top Header & Sticky Score Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="मुख्य पृष्ठ पर वापस जाएँ"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#D8B45A] text-stone-900 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    बिहार बोर्ड मैट्रिक 10th
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-stone-500">
                    {testDateFormatted || 'आज का टेस्ट'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  Daily Test (दैनिक टेस्ट) 🎯
                </h1>
              </div>
            </div>

            {/* Score & Reset Button */}
            {questions.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="bg-[#FFFDF9] border-2 border-[#D8B45A] px-3 sm:px-4 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                    Live Score
                  </div>
                  <div className="text-lg sm:text-xl font-black text-stone-900">
                    Score: {score}/{questions.length}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetTest}
                  disabled={answeredCount === 0}
                  className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    answeredCount > 0
                      ? 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300'
                      : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-200'
                  }`}
                  title="Reset Test"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset Test</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress bar if questions present */}
          {questions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-bold">
                <span>हल किए गए प्रश्न: {answeredCount} / {questions.length}</span>
                <span>{Math.round((answeredCount / questions.length) * 100)}% पूर्ण</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#D8B45A] h-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Empty State when no test found */}
        {!loading && questions.length === 0 && (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-stone-200 space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 text-[#D8B45A] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#D8B45A]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              {/* Exact required text */}
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Aaj ka test admin ne abhi tak nahi dala hai
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                कृपया थोड़ी देर बाद पुनः देखें। जैसे ही शिक्षक/एडमिन आज का दैनिक टेस्ट पब्लिश करेंगे, वह यहाँ उपलब्ध हो जाएगा।
              </p>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={loadTest}
                className="px-5 py-2.5 rounded-xl bg-[#F8E8B5] hover:bg-[#F3DE9A] text-stone-900 border border-[#D8B45A] font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                रिफ्रेश करें (Refresh)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToAdmin) {
                    onNavigateToAdmin();
                  } else {
                    window.location.href = '/admin/daily-test';
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-stone-500" />
                एडमिन हैं? टेस्ट डालें (/admin/daily-test)
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question, qIdx) => {
              const userAnswer = answers[qIdx];
              const isAnswered = userAnswer !== undefined;
              const isUserCorrect = isAnswered && userAnswer === question.correctIndex;

              return (
                <div
                  key={qIdx}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 transition"
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F8E8B5] text-stone-900 font-black text-xs sm:text-sm flex items-center justify-center border border-[#D8B45A]">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed">
                        {question.q}
                      </h2>
                    </div>
                  </div>

                  {/* 4 Clickable Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4">
                    {question.options.map((optText, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectAnswer = question.correctIndex === optIdx;

                      // Style calculation
                      let optionBgStyle: React.CSSProperties = {};
                      let optionClasses = "relative p-3.5 rounded-xl text-xs sm:text-sm font-semibold transition border text-left flex items-center gap-3 ";

                      if (!isAnswered) {
                        // Unanswered state
                        optionClasses += "bg-white hover:bg-stone-50 hover:border-amber-300 border-stone-200 text-stone-800 cursor-pointer active:scale-[0.99]";
                      } else {
                        // Answered state
                        if (isCorrectAnswer) {
                          // Correct answer is always green (#22c55e)
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#22c55e' };
                        } else if (isSelected && !isCorrectAnswer) {
                          // Clicked wrong answer is red (#ef4444)
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#ef4444' };
                        } else {
                          // Other neutral options
                          optionClasses += "bg-stone-50 border-stone-200 text-stone-400 opacity-70 ";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          style={optionBgStyle}
                          className={optionClasses}
                        >
                          {/* Option badge (A, B, C, D) */}
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition ${
                              isAnswered && (isCorrectAnswer || isSelected)
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {optLabels[optIdx]}
                          </span>

                          <span className="flex-1 text-left leading-snug">
                            {optText}
                          </span>

                          {/* Icons feedback */}
                          {isAnswered && isCorrectAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrectAnswer && (
                            <XCircle className="w-5 h-5 text-white flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback notice after answered */}
                  {isAnswered && (
                    <div
                      className={`mt-3.5 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                        isUserCorrect
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isUserCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>शाबाश! सही उत्तर (+1 अंक) 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>
                              गलत उत्तर! सही उत्तर था: <b>विकल्प ({optLabels[question.correctIndex]}) {question.options[question.correctIndex]}</b>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Summary Card when all answered */}
            {answeredCount === questions.length && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-[#D8B45A] space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-[#D8B45A] rounded-full flex items-center justify-center mx-auto text-2xl">
                  🏆
                </div>
                <h3 className="text-xl font-black text-stone-900">
                  टेस्ट समाप्त! आपका स्कोर: {score} / {questions.length}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  {score === questions.length 
                    ? 'अविश्वसनीय! आपने सभी प्रश्नों के सही उत्तर दिए! बिहार बोर्ड टॉपर! 🌟' 
                    : score >= questions.length / 2 
                    ? 'बहुत अच्छा प्रयास! गलत हुए प्रश्नों को याद कर लें। 👍' 
                    : 'नियमित अभ्यास करें और बेहतर स्कोर पाएं। रीसेट करके दोबारा प्रयास करें! 💪'}
                </p>
                <button
                  type="button"
                  onClick={handleResetTest}
                  className="px-6 py-2.5 rounded-xl bg-[#F8E8B5] hover:bg-[#F3DE9A] text-stone-900 border border-[#D8B45A] font-black text-sm transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  टेस्ट रीसेट करें / दोबारा दें
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
