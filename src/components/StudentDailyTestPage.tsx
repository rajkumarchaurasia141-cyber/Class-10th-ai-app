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
  ExternalLink,
  Check
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
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
  const [testTitle, setTestTitle] = useState('बिहार बोर्ड 10वीं दैनिक टेस्ट (Daily Test) 🎯');

  // Load today's test from Firestore with LocalStorage cache/fallback
  const loadTest = async () => {
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

    // 1. Instant check from localStorage
    try {
      const local = localStorage.getItem(key) || localStorage.getItem('daily_test_latest');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setLoading(false);
        }
      }
    } catch {}

    // 2. Fetch from Cloud Firestore
    try {
      const snap = await getDoc(doc(db, 'daily_tests', key));
      if (snap.exists() && Array.isArray(snap.data()?.questions) && snap.data()?.questions.length > 0) {
        setQuestions(snap.data()?.questions);
        if (snap.data()?.formattedDate) setTestDateFormatted(snap.data()?.formattedDate);
        if (snap.data()?.title) setTestTitle(snap.data()?.title);
      } else {
        // Fallback: check 'latest' published test in Firestore
        const latestSnap = await getDoc(doc(db, 'daily_tests', 'latest'));
        if (latestSnap.exists() && Array.isArray(latestSnap.data()?.questions) && latestSnap.data()?.questions.length > 0) {
          setQuestions(latestSnap.data()?.questions);
          if (latestSnap.data()?.formattedDate) setTestDateFormatted(latestSnap.data()?.formattedDate);
          if (latestSnap.data()?.title) setTestTitle(latestSnap.data()?.title);
        }
      }
    } catch (e) {
      console.warn('Error fetching daily test from Firestore:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Firestore subscription
  useEffect(() => {
    loadTest();

    const key = getTodayDateKey();
    const unsubKey = onSnapshot(doc(db, 'daily_tests', key), (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.questions) && snap.data()?.questions.length > 0) {
        setQuestions(snap.data()?.questions);
        if (snap.data()?.formattedDate) setTestDateFormatted(snap.data()?.formattedDate);
        if (snap.data()?.title) setTestTitle(snap.data()?.title);
        setLoading(false);
      }
    }, (err) => {
      console.warn('Daily test realtime subscription error (key):', err);
    });

    const unsubLatest = onSnapshot(doc(db, 'daily_tests', 'latest'), (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.questions) && snap.data()?.questions.length > 0) {
        setQuestions(snap.data()?.questions);
        if (snap.data()?.formattedDate) setTestDateFormatted(snap.data()?.formattedDate);
        if (snap.data()?.title) setTestTitle(snap.data()?.title);
        setLoading(false);
      }
    }, (err) => {
      console.warn('Daily test realtime subscription error (latest):', err);
    });

    return () => {
      unsubKey();
      unsubLatest();
    };
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
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Top Header & Sticky Score Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 sticky top-2 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center justify-between gap-3 flex-wrap">
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
                  <span className="text-[11px] sm:text-xs font-bold text-stone-500">
                    {testDateFormatted || 'दैनिक टेस्ट'}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-stone-900 mt-0.5">
                  {testTitle}
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
                  <div className="text-base sm:text-xl font-black text-stone-900">
                    {score} / {questions.length}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetTest}
                  disabled={answeredCount === 0}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    answeredCount > 0
                      ? 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300'
                      : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-200'
                  }`}
                  title="Reset Test"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">रीसेट करें</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress bar if questions present */}
          {questions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-bold">
                <span>हल किए गए प्रश्न: <b>{answeredCount} / {questions.length}</b></span>
                <span>{Math.round((answeredCount / questions.length) * 100)}% पूर्ण</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-[#D8B45A] h-full transition-all duration-300 rounded-full"
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
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                आज का टेस्ट अभी तक लाइव नहीं हुआ है
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                जैसे ही शिक्षक / एडमिन आज का दैनिक टेस्ट पब्लिश करेंगे, वह तुरंत यहाँ उपलब्ध हो जाएगा। कृपया थोड़ी देर बाद "रिफ्रेश करें" पर क्लिक करें।
              </p>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={loadTest}
                className="px-5 py-2.5 rounded-xl bg-[#F8E8B5] hover:bg-[#F3DE9A] text-stone-900 border border-[#D8B45A] font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>रिफ्रेश करें (Refresh)</span>
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
                <span>एडमिन हैं? टेस्ट डालें (/admin/daily-test)</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && questions.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-200 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-stone-600">आज का दैनिक टेस्ट लोड हो रहा है...</p>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-3.5">
            {questions.map((question, qIdx) => {
              const userAnswer = answers[qIdx];
              const isAnswered = userAnswer !== undefined;
              const isUserCorrect = isAnswered && userAnswer === question.correctIndex;

              return (
                <div
                  key={qIdx}
                  className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
                    isAnswered 
                      ? (isUserCorrect ? 'border-emerald-300' : 'border-rose-300')
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center border shadow-2xs transition-colors ${
                      isAnswered
                        ? (isUserCorrect ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300')
                        : 'bg-[#F8E8B5] text-stone-900 border-[#D8B45A]'
                    }`}>
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed">
                        {question.q}
                      </h2>
                    </div>
                  </div>

                  {/* 4 Clickable Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-3.5">
                    {question.options.map((optText, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectAnswer = question.correctIndex === optIdx;

                      // Style calculation
                      let optionBgStyle: React.CSSProperties = {};
                      let optionClasses = "relative p-3 rounded-xl text-xs sm:text-sm font-semibold transition border text-left flex items-center gap-2.5 ";

                      if (!isAnswered) {
                        // Unanswered state
                        optionClasses += "bg-white hover:bg-amber-50/50 hover:border-amber-400 border-stone-200 text-stone-800 cursor-pointer active:scale-[0.99]";
                      } else {
                        // Answered state
                        if (isCorrectAnswer) {
                          // Correct answer is green
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#16a34a' };
                        } else if (isSelected && !isCorrectAnswer) {
                          // Clicked wrong answer is red
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#dc2626' };
                        } else {
                          // Other neutral options
                          optionClasses += "bg-stone-50 border-stone-200 text-stone-400 opacity-60 ";
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
                                ? 'bg-white/25 text-white'
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
                      className={`mt-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                        isUserCorrect
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUserCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>शाबाश! सही उत्तर (+1 अंक) 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
              <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-[#D8B45A] space-y-3.5">
                <div className="w-14 h-14 bg-amber-100 text-[#D8B45A] rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-2xs">
                  🏆
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    टेस्ट समाप्त! आपका स्कोर: {score} / {questions.length}
                  </h3>
                  <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                    सफलता दर: {Math.round((score / questions.length) * 100)}%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  {score === questions.length 
                    ? 'अविश्वसनीय! आपने सभी प्रश्नों के 100% सही उत्तर दिए! बिहार बोर्ड टॉपर! 🌟' 
                    : score >= questions.length * 0.7 
                    ? 'शानदार प्रदर्शन! आपका प्रयास बहुत अच्छा रहा। गलत हुए प्रश्नों को याद कर लें। 👍' 
                    : 'नियमित अभ्यास से आप और बेहतर कर सकते हैं। रीसेट करके दोबारा प्रयास करें! 💪'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResetTest}
                    className="px-6 py-2.5 rounded-xl bg-[#F8E8B5] hover:bg-[#F3DE9A] text-stone-900 border border-[#D8B45A] font-black text-xs sm:text-sm transition shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>टेस्ट रीसेट करें / दोबारा दें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
