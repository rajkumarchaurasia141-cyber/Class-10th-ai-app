import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  Copy,
  Sparkles,
  Bot,
  Flame,
  ChevronRight,
  ChevronLeft,
  Share2,
  Award,
  Hash,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ALL_MATH_CHAPTER_SOLUTIONS, searchMathPrashnawali } from '../data/mathSolutionsIndex';
import { MathChapterExercises, MathPrashnawali, MathExerciseQuestion } from '../types';

interface MathPrashnawaliSolutionsProps {
  onAskAITeacher?: (questionText: string, chapterTitle: string) => void;
  initialChapterNumber?: number;
}

export const MathPrashnawaliSolutions: React.FC<MathPrashnawaliSolutionsProps> = ({
  onAskAITeacher,
  initialChapterNumber = 1,
}) => {
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(initialChapterNumber);
  const [selectedExerciseNumber, setSelectedExerciseNumber] = useState<string>('1.1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vviFilter, setVviFilter] = useState<'all' | 'vvi' | '5marks'>('all');

  // Current Chapter
  const currentChapter = useMemo(() => {
    return ALL_MATH_CHAPTER_SOLUTIONS.find((ch) => ch.chapterNumber === selectedChapterNumber) || ALL_MATH_CHAPTER_SOLUTIONS[0];
  }, [selectedChapterNumber]);

  // Current Exercise
  const currentExercise = useMemo(() => {
    const found = currentChapter.exercises.find((ex) => ex.exerciseNumber === selectedExerciseNumber);
    return found || currentChapter.exercises[0];
  }, [currentChapter, selectedExerciseNumber]);

  // Handle Chapter selection
  const handleSelectChapter = (chapterNum: number) => {
    setSelectedChapterNumber(chapterNum);
    const chapter = ALL_MATH_CHAPTER_SOLUTIONS.find((c) => c.chapterNumber === chapterNum);
    if (chapter && chapter.exercises.length > 0) {
      setSelectedExerciseNumber(chapter.exercises[0].exerciseNumber);
    }
  };

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchMathPrashnawali(searchQuery);
  }, [searchQuery]);

  // Copy solution
  const handleCopySolution = (q: MathExerciseQuestion) => {
    const textToCopy = `${q.qNumber}: ${q.questionText}\n\nहल:\n${q.detailedSolution}\n\nउत्तर: ${q.finalAnswer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return currentExercise.questions.filter((q) => {
      if (vviFilter === 'vvi') return q.vviLevel?.includes('VVI');
      if (vviFilter === '5marks') return q.marks === 5;
      return true;
    });
  }, [currentExercise, vviFilter]);

  // Next / Previous exercise
  const currentExIndex = currentChapter.exercises.findIndex((ex) => ex.exerciseNumber === currentExercise.exerciseNumber);
  const prevExercise = currentExIndex > 0 ? currentChapter.exercises[currentExIndex - 1] : null;
  const nextExercise = currentExIndex < currentChapter.exercises.length - 1 ? currentChapter.exercises[currentExIndex + 1] : null;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white p-6 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              100% NCERT नवीन पाठ्यक्रम 2025-26
            </span>
            <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-bold rounded-full text-xs flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-600 fill-red-600" />
              हर चैप्टर की हर प्रश्नावली
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            गणित सम्पूर्ण प्रश्नावली हल (Class 10 Math NCERT Solutions)
          </h1>
          <p className="text-sm md:text-base text-emerald-100 max-w-3xl leading-relaxed">
            अध्याय 1 से 15 तक सभी 15 अध्यायों के प्रत्येक प्रश्नावली (1.1 से 15.2) के शुद्ध, चरणबद्ध और बिहार बोर्ड परीक्षा उपयोगी 5-अंक व 2-अंक के मॉडल उत्तर।
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-emerald-100">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-amber-300" />
              <span>15 संपूर्ण अध्याय (All 15 Chapters)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Hash className="w-4 h-4 text-amber-300" />
              <span>प्रश्नावली 1.1 से 15.2 तक</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-amber-300" />
              <span>BSEB पिछले वर्षों के VVI प्रश्न हल</span>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="खोजें जैसे: '8.4', '1.3', 'पाइथागोरस', 'द्विघात', 'थेल्स', 'बहुलक', 'माध्यक'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded"
            >
              साफ़ करें
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
            <Layers className="w-4 h-4" />
            <span>फ़िल्टर करें:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setVviFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                vviFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              सभी प्रश्न
            </button>
            <button
              onClick={() => setVviFilter('vvi')}
              className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                vviFilter === 'vvi'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              🔥 VVI अति-महत्वपूर्ण
            </button>
            <button
              onClick={() => setVviFilter('5marks')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                vviFilter === '5marks'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              ⭐ 5 अंक दीर्घ उत्तरीय
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Display (if searching) */}
      {searchResults !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              खोज परिणाम: "{searchQuery}" ({searchResults.length} प्रश्नावली मिलीं)
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-emerald-600 hover:underline"
            >
              सभी अध्याय देखें
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                "{searchQuery}" के लिए कोई प्रश्न नहीं मिला। कृपया अध्याय संख्या या सूत्र से खोजें।
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((item, idx) => (
                <div
                  key={`${item.chapter.chapterNumber}-${item.exercise.exerciseNumber}-${idx}`}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        अध्याय {item.chapter.chapterNumber}: {item.chapter.chapterTitle}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {item.exercise.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapterNumber(item.chapter.chapterNumber);
                        setSelectedExerciseNumber(item.exercise.exerciseNumber);
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      इस प्रश्नावली पर जाएँ
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {item.matchedQuestions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        chapterTitle={item.chapter.chapterTitle}
                        onCopy={handleCopySolution}
                        isCopied={copiedId === q.id}
                        onAskAI={onAskAITeacher}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Regular Chapter & Exercise View */
        <div className="space-y-6">
          {/* Chapter Selector Grid / Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              गणित अध्याय चुनें (1 से 15):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {ALL_MATH_CHAPTER_SOLUTIONS.map((ch) => {
                const isSelected = ch.chapterNumber === selectedChapterNumber;
                return (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => handleSelectChapter(ch.chapterNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        अध्याय {ch.chapterNumber}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {ch.exercises.length} प्रश्नावली
                      </span>
                    </div>
                    <span className="text-xs font-semibold line-clamp-1">
                      {ch.chapterTitle.split('(')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Details & Exercise Buttons */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  अध्याय {currentChapter.chapterNumber} • {currentChapter.subCategory}
                </span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {currentChapter.chapterTitle}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">कुल प्रश्नावली:</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                  {currentChapter.exercises.length}
                </span>
              </div>
            </div>

            {/* Exercise Selector Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                इस अध्याय की प्रश्नावली चुनें:
              </label>
              <div className="flex flex-wrap gap-2">
                {currentChapter.exercises.map((ex) => {
                  const isExSelected = ex.exerciseNumber === currentExercise.exerciseNumber;
                  return (
                    <button
                      key={ex.exerciseNumber}
                      onClick={() => setSelectedExerciseNumber(ex.exerciseNumber)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isExSelected
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>प्रश्नावली {ex.exerciseNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isExSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                        }`}
                      >
                        {ex.questions.length} प्रश्न
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Exercise Concept & Key Formulas */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase">
                    प्रश्नावली {currentExercise.exerciseNumber} का मुख्य विषय
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {currentExercise.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {currentExercise.concept}
                  </p>
                </div>
              </div>

              {currentExercise.keyFormulas && currentExercise.keyFormulas.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    इस प्रश्नावली के मुख्य सूत्र (Key Formulas):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentExercise.keyFormulas.map((formula, idx) => (
                      <div
                        key={idx}
                        className="bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-zinc-700 text-xs font-mono font-medium text-emerald-950 dark:text-emerald-200"
                      >
                        • {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Questions List for Active Exercise */}
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  प्रश्नावली {currentExercise.exerciseNumber} के प्रश्न एवं चरणबद्ध हल ({filteredQuestions.length})
                </h4>
                <span className="text-xs text-zinc-500">
                  {vviFilter !== 'all' ? `फिल्टर: ${vviFilter}` : 'सभी प्रश्न'}
                </span>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  इस फ़िल्टर में कोई प्रश्न नहीं है। कृपया 'सभी प्रश्न' चुनें।
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      chapterTitle={currentChapter.chapterTitle}
                      onCopy={handleCopySolution}
                      isCopied={copiedId === q.id}
                      onAskAI={onAskAITeacher}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Exercise Pagination */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
              {prevExercise ? (
                <button
                  onClick={() => setSelectedExerciseNumber(prevExercise.exerciseNumber)}
                  className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  पिछली: {prevExercise.exerciseNumber}
                </button>
              ) : (
                <div />
              )}

              <span className="text-xs font-medium text-zinc-400">
                प्रश्नावली {currentExIndex + 1} / {currentChapter.exercises.length}
              </span>

              {nextExercise ? (
                <button
                  onClick={() => setSelectedExerciseNumber(nextExercise.exerciseNumber)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  अगली: {nextExercise.exerciseNumber}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const nextChap = selectedChapterNumber < 15 ? selectedChapterNumber + 1 : 1;
                    handleSelectChapter(nextChap);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  अगला अध्याय {selectedChapterNumber < 15 ? selectedChapterNumber + 1 : 1}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for Question Card
interface QuestionCardProps {
  question: MathExerciseQuestion;
  chapterTitle: string;
  onCopy: (q: MathExerciseQuestion) => void;
  isCopied: boolean;
  onAskAI?: (questionText: string, chapterTitle: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  chapterTitle,
  onCopy,
  isCopied,
  onAskAI,
}) => {
  const [showSteps, setShowSteps] = useState<boolean>(true);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 p-5 space-y-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all">
      {/* Header with tags */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
            {question.qNumber}
          </span>

          {question.vviLevel && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                question.vviLevel.includes('VVI')
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {question.vviLevel.includes('VVI') && (
                <Flame className="w-3 h-3 text-red-500 fill-red-500" />
              )}
              {question.vviLevel}
            </span>
          )}

          {question.marks && (
            <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded text-[11px] font-medium">
              {question.marks} अंक
            </span>
          )}

          {question.boardYear && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded text-[11px] font-semibold">
              {question.boardYear}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onCopy(question)}
            title="हल कॉपी करें"
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 transition-colors flex items-center gap-1 text-xs px-2.5"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">कॉपी हुआ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>कॉपी करें</span>
              </>
            )}
          </button>

          {onAskAI && (
            <button
              onClick={() => onAskAI(question.questionText, chapterTitle)}
              title="AI शिक्षक से पूछें"
              className="p-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 text-xs px-2.5 font-medium"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI से समझें</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line">
          {question.questionText}
        </p>
      </div>

      {/* Steps breakdown toggle */}
      {question.steps && question.steps.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>चरणबद्ध समाधान (Steps) {showSteps ? 'छिपाएं' : 'देखें'}</span>
          </button>

          {showSteps && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-900/30 space-y-1.5">
              {question.steps.map((step, sIdx) => (
                <div key={sIdx} className="text-xs text-amber-950 dark:text-amber-200/90 font-medium flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Solution Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
          विस्तृत हल (Detailed Solution):
        </label>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-emerald-200/70 dark:border-emerald-900/50 shadow-inner">
          <pre className="text-xs md:text-sm font-sans text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {question.detailedSolution}
          </pre>
        </div>
      </div>

      {/* Final Answer Highlight Box */}
      <div className="flex items-center gap-2 p-3 bg-emerald-100/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
          अंतिम उत्तर: <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{question.finalAnswer}</span>
        </div>
      </div>
    </div>
  );
};
