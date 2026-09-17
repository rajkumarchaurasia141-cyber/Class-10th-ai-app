import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Lightbulb,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap,
  RotateCcw,
  ListChecks,
  Printer,
  Search,
  Star,
  Award,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { SubjectId, ActiveMainTab } from '../types';
import { Class10ChapterData } from '../data/class10SubjectData';
import { useData } from '../context/DataContext';
import { MathPrashnawaliSolutions } from './MathPrashnawaliSolutions';

interface SubjectsExplorerProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (subjectId: SubjectId) => void;
  onNavigateToAITeacher: (subjectName: string, chapterName: string) => void;
}

type ChapterTab = 'notes' | 'mcq' | 'objective' | 'subjective' | 'trick' | 'exercises';

export const SubjectsExplorer: React.FC<SubjectsExplorerProps> = ({
  selectedSubjectId,
  onSelectSubject,
  onNavigateToAITeacher,
}) => {
  const [selectedChapterNo, setSelectedChapterNo] = useState<number>(1);
  const [activeChapterTab, setActiveChapterTab] = useState<ChapterTab>('notes');
  const [copiedNote, setCopiedNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [textSize, setTextSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-sm');

  // MCQ User state: map of question index -> selected option index
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  // Objective QA toggle state: map of question index -> boolean (show answer)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const { subjectsData } = useData();
  

  // 5-Min Test State (Dynamic time: 1 min per question)
  const [isTestMode, setIsTestMode] = useState(false);
  const [testTimeLeft, setTestTimeLeft] = useState(300);
  const [testSubmitted, setTestSubmitted] = useState(false);

  const startTest = () => {
    setIsTestMode(true);
    setTestSubmitted(false);
    setTestTimeLeft(300); // 5 mins
    setMcqAnswers({});
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestMode && !testSubmitted && testTimeLeft > 0) {
      timer = setInterval(() => {
        setTestTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTestMode && testTimeLeft === 0 && !testSubmitted) {
      submitTest();
    }
    return () => clearInterval(timer);
  }, [isTestMode, testTimeLeft, testSubmitted]);

  const submitTest = () => {
    setTestSubmitted(true);
  };

  const currentSubject = subjectsData[selectedSubjectId] || subjectsData['maths'] || Object.values(subjectsData)[0];
  const chapters = currentSubject?.chapters || [];
  const currentChapter: Class10ChapterData =
    chapters.find((c: any) => c.chapter_no === selectedChapterNo) || chapters[0];

  const handleSelectSubject = (id: SubjectId) => {
    onSelectSubject(id);
    setSelectedChapterNo(1);
    setMcqAnswers({});
    setRevealedAnswers({});
    setIsTestMode(false);
  };

  const handleSelectChapter = (chNo: number) => {
    setSelectedChapterNo(chNo);
    setMcqAnswers({});
    setRevealedAnswers({});
    setIsTestMode(false);
  };

  const handleMcqSelect = (qIdx: number, optIdx: number) => {
    if (mcqAnswers[qIdx] !== undefined && !isTestMode) return; // if not test mode, prevent change
    if (isTestMode && testSubmitted) return; // if test submitted, prevent change
    setMcqAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const resetMcqs = () => {
    setMcqAnswers({});
    setIsTestMode(false);
  };

  const toggleAnswerReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyNotes = () => {
    if (!currentChapter) return;
    navigator.clipboard.writeText(
      `${currentSubject.subject_name_hindi} - अध्याय ${currentChapter.chapter_no}: ${currentChapter.chapter_name_hindi}\n\n${currentChapter.notes_hindi}`
    );
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // Filter chapters by search
  const filteredChapters = chapters.filter(
    (c) =>
      c.chapter_name_hindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Breadcrumbs Header: Class 10 > Subject > Chapter */}
      <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-900/80 px-3.5 py-2.5 rounded-xl border border-stone-800 overflow-x-auto whitespace-nowrap">
        <span className="font-bold text-amber-400">Class 10 (कक्षा 10वीं)</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-600" />
        <span className="text-stone-300 font-medium">{currentSubject.subject_name_hindi}</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-600" />
        <span className="text-stone-100 font-semibold truncate max-w-[200px] sm:max-w-none">
          अध्याय {currentChapter.chapter_no}: {currentChapter.chapter_name_hindi}
        </span>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.values(subjectsData).length > 0 ? Object.values(subjectsData).map((sub: any) => {
          const isSelected = sub.subject_id === selectedSubjectId;
          return (
            <button
              key={sub.subject_id}
              onClick={() => handleSelectSubject(sub.subject_id as SubjectId)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
              }`}
            >
              <span>{sub.subject_name_hindi}</span>
            </button>
          );
        }) : <div className="text-stone-400 text-sm py-2">लोड हो रहा है...</div>}
      </div>

      {/* Chapter Selection Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              {currentSubject.subject_name_hindi} के अध्याय ({chapters.length})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="अध्याय खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Chapter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredChapters.map((ch, idx) => {
            const isChSelected = ch.chapter_no === selectedChapterNo;
            return (
              <button
                key={`${ch.chapter_no}-${idx}`}
                onClick={() => handleSelectChapter(ch.chapter_no)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 text-left border cursor-pointer ${
                  isChSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 font-semibold">
                    अध्याय {ch.chapter_no}
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    [{ch.subCategory}]
                  </span>
                </div>
                <div className="mt-1 font-semibold truncate max-w-[200px]">
                  {ch.chapter_name_hindi}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Content Main Area */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Chapter Header Banner */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                NCERT 100% प्रामाणिक पाठ्यक्रम
              </span>
              <span className="text-xs text-stone-400">
                {currentSubject.subject_name_hindi} • {currentChapter.subCategory}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              अध्याय {currentChapter.chapter_no}: {currentChapter.chapter_name_hindi}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                onNavigateToAITeacher(
                  currentSubject.subject_name_hindi,
                  currentChapter.chapter_name_hindi
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>AI Teacher से पूछें</span>
            </button>
          </div>
        </div>

        {/* 5 Tabs Navigation inside Chapter */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveChapterTab('notes')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeChapterTab === 'notes'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>अध्याय नोट्स (Notes)</span>
          </button>

          <button
            onClick={() => setActiveChapterTab('mcq')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeChapterTab === 'mcq'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>MCQ टेस्ट ({currentChapter.mcq.length})</span>
          </button>

          <button
            onClick={() => setActiveChapterTab('objective')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeChapterTab === 'objective'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>1-अंकीय वस्तुनिष्ठ ({currentChapter.objective_questions.length})</span>
          </button>

          <button
            onClick={() => setActiveChapterTab('subjective')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeChapterTab === 'subjective'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>लघु व दीर्घ प्रश्न (2, 3 व 5 अंक)</span>
          </button>

          <button
            onClick={() => setActiveChapterTab('trick')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeChapterTab === 'trick'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>ट्रिक से समझो</span>
          </button>

          {(selectedSubjectId === 'maths' || currentChapter.ncert_exercise_solutions) && (
            <button
              onClick={() => setActiveChapterTab('exercises')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeChapterTab === 'exercises'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-emerald-400/90 hover:text-emerald-300 bg-emerald-500/5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                {selectedSubjectId === 'maths' ? '📐 प्रश्नावली हल (1.1 से 15.2)' : '📚 NCERT अभ्यास हल (Q&A)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                100% NCERT
              </span>
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        <div className="p-4 sm:p-6">
          {/* 1. NOTES TAB */}
          {activeChapterTab === 'notes' && (
            <div id="printable-content" className={`space-y-4 ${textSize}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <div className="text-xs text-stone-400">
                  एनसीईआरटी पुस्तक के आधार पर तैयार किए गए संपूर्ण एवं शुद्ध नोट्स।
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-stone-900 rounded-lg p-1 border border-stone-800">
                    <button
                      onClick={() => setTextSize('text-sm')}
                      className={`p-1.5 rounded ${textSize === 'text-sm' ? 'bg-stone-800 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
                      title="छोटा अक्षर (Small)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTextSize('text-base')}
                      className={`p-1.5 rounded text-sm font-bold ${textSize === 'text-base' ? 'bg-stone-800 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
                      title="सामान्य अक्षर (Normal)"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setTextSize('text-lg')}
                      className={`p-1.5 rounded ${textSize === 'text-lg' ? 'bg-stone-800 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
                      title="बड़ा अक्षर (Large)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleCopyNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-750 text-stone-300 transition-colors"
                  >
                    {copiedNote ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">नोट्स कॉपी करें</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="font-bold">PDF / प्रिंट</span>
                  </button>
                </div>
              </div>

              {currentChapter.structured_notes ? (
                <div className="space-y-6">
                  {/* Introduction */}
                  <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-amber-400 mb-3 border-b border-stone-800 pb-2">अध्याय परिचय</h3>
                    <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{currentChapter.structured_notes.introduction}</p>
                  </div>
                  
                  {/* Key Definitions */}
                  {currentChapter.structured_notes.keyDefinitions && currentChapter.structured_notes.keyDefinitions.length > 0 && (
                    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-emerald-400 mb-3 border-b border-stone-800 pb-2">महत्वपूर्ण परिभाषाएं</h3>
                      <ul className="space-y-3">
                        {currentChapter.structured_notes.keyDefinitions.map((def, idx) => (
                          <li key={idx} className="text-sm text-stone-300 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span className="whitespace-pre-line">{def}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formulas & Principles */}
                  {currentChapter.structured_notes.formulasAndPrinciples && currentChapter.structured_notes.formulasAndPrinciples.length > 0 && (
                    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-blue-400 mb-3 border-b border-stone-800 pb-2">महत्वपूर्ण सूत्र / सिद्धांत</h3>
                      <ul className="space-y-3">
                        {currentChapter.structured_notes.formulasAndPrinciples.map((form, idx) => (
                          <li key={idx} className="text-sm text-stone-300 bg-stone-950 p-3 rounded-lg border border-stone-800">
                            {form}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* VVI Questions */}
                  {currentChapter.structured_notes.vviQuestions && currentChapter.structured_notes.vviQuestions.length > 0 && (
                    <div className="bg-stone-900/50 border border-rose-900/30 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-rose-400 mb-3 border-b border-stone-800 pb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
                        परीक्षा के लिए अति-महत्वपूर्ण प्रश्न (VVI)
                      </h3>
                      <div className="space-y-4">
                        {currentChapter.structured_notes.vviQuestions.map((vvi, idx) => (
                          <div key={idx} className="bg-stone-950 p-4 rounded-lg border border-stone-800">
                            <p className="font-semibold text-rose-300 text-sm mb-2">Q: {vvi.q} <span className="text-xs text-stone-500 bg-stone-900 px-2 py-0.5 rounded ml-2">{vvi.marks} अंक</span></p>
                            <p className="text-stone-300 text-sm whitespace-pre-line">A: {vvi.ans}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toppers Tips */}
                  {currentChapter.structured_notes.toppersTips && currentChapter.structured_notes.toppersTips.length > 0 && (
                    <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-amber-500 mb-3 border-b border-stone-800 pb-2 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        टॉपर टिप्स (Topper's Secrets)
                      </h3>
                      <ul className="space-y-2">
                        {currentChapter.structured_notes.toppersTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-amber-200/80 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">⭐</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-6 font-sans text-stone-200 text-sm leading-relaxed whitespace-pre-line select-text">
                  {currentChapter.notes_hindi}
                </div>
              )}

              {/* Shlokas Display (if available) */}
              {currentChapter.shlokas && currentChapter.shlokas.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-bold text-purple-400 border-b border-stone-800 pb-2 mb-4">
                    श्लोक एवं उनके अर्थ
                  </h3>
                  {currentChapter.shlokas.map((shloka, idx) => (
                    <div key={idx} className="bg-stone-900 border border-purple-900/30 rounded-xl p-5 shadow-sm">
                      <div className="text-center mb-4">
                        <p className="text-stone-100 font-medium text-base sm:text-lg whitespace-pre-line leading-relaxed font-sans text-amber-50">
                          {shloka.sanskrit}
                        </p>
                      </div>
                      <div className="bg-stone-950 rounded-lg p-4 border border-stone-800">
                        <span className="text-purple-400 font-bold text-xs uppercase mb-1 block">हिंदी अर्थ:</span>
                        <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                          {shloka.hindiMeaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1.5 NCERT EXERCISES TAB (Non-Math subjects) */}
          {activeChapterTab === 'exercises' && selectedSubjectId !== 'maths' && currentChapter.ncert_exercise_solutions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                <div>
                  <h3 className="text-emerald-400 font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    NCERT अभ्यास प्रश्नोत्तर (संपूर्ण हल)
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    पुस्तक के अभ्यास (Exercises) में दिए गए सभी प्रश्नों के सटीक और पूर्ण उत्तर।
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {currentChapter.ncert_exercise_solutions.map((sol, idx) => (
                  <div key={idx} className="bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-5 hover:border-emerald-900/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-stone-900 text-stone-400 text-xs font-bold px-2 py-1 rounded">
                        Q.{sol.qNumber}
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="text-stone-200 font-semibold text-sm">
                          {sol.question}
                        </h4>
                        <div className="text-stone-300 text-sm whitespace-pre-line leading-relaxed pl-2 border-l-2 border-emerald-900/50">
                          <span className="text-emerald-500 font-bold text-xs uppercase mb-1 block">उत्तर:</span>
                          {sol.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. MCQ TAB with GREEN / RED instant feedback & explanation OR Test Mode */}
          {activeChapterTab === 'mcq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    MCQ अभ्यास प्रश्न (Bihar Board Pattern)
                  </span>
                  <p className="text-xs text-stone-400">
                    {isTestMode ? (
                      testSubmitted ? 'टेस्ट समाप्त! आपका परिणाम नीचे है।' : 'टेस्ट चालू है... सही विकल्प चुनें'
                    ) : (
                      'सही विकल्प पर क्लिक करें: सही उत्तर हरा (Green) तथा गलत लाल (Red) दिखेगा।'
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isTestMode ? (
                    <button
                      onClick={startTest}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-stone-950"
                    >
                      <span>⏱️ 5 मिनट का टेस्ट शुरू करें</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!testSubmitted && (
                        <div className="text-xs font-bold bg-stone-800 px-3 py-1.5 rounded-lg text-amber-400">
                          समय: {Math.floor(testTimeLeft / 60)}:{(testTimeLeft % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                      <button
                        onClick={resetMcqs}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-750 text-stone-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>बाहर निकलें / पुनः हल करें</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {testSubmitted && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-5 rounded-xl text-center space-y-2">
                  <h3 className="text-xl font-bold text-emerald-400">टेस्ट परिणाम (Result)</h3>
                  <p className="text-stone-300 font-medium">
                    कुल प्रश्न: {currentChapter.mcq.length} | सही उत्तर: {Object.keys(mcqAnswers).filter(k => currentChapter.mcq[Number(k)].correct_answer === mcqAnswers[Number(k)]).length}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {currentChapter.mcq.map((item, qIdx) => {
                  const selectedOpt = mcqAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isUserCorrect = selectedOpt === item.correct_answer;
                  
                  // In test mode, answers are only revealed if submitted
                  const showFeedback = !isTestMode || testSubmitted;

                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                          प्रश्न संख्या {qIdx + 1}
                        </span>
                        {hasAnswered && showFeedback && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isUserCorrect
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isUserCorrect ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> सही उत्तर (+1)
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> गलत उत्तर (0)
                              </>
                            )}
                          </span>
                        )}
                        {hasAnswered && isTestMode && !testSubmitted && (
                           <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                             उत्तर दर्ज (Saved)
                           </span>
                        )}
                      </div>

                      <p className="text-stone-100 font-semibold text-sm sm:text-base">
                        {item.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          const isOptionCorrect = optIdx === item.correct_answer;

                          let optionStyle =
                            'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-850 hover:border-stone-700';

                          if (hasAnswered && showFeedback) {
                            if (isOptionCorrect) {
                              optionStyle = 'bg-emerald-500/20 text-emerald-200 border-emerald-500 font-bold';
                            } else if (isOptionSelected && !isOptionCorrect) {
                              optionStyle = 'bg-rose-500/20 text-rose-200 border-rose-500 font-semibold';
                            } else {
                              optionStyle = 'bg-stone-900/50 border-stone-850 text-stone-500 opacity-60';
                            }
                          } else if (hasAnswered && isOptionSelected && isTestMode && !testSubmitted) {
                            optionStyle = 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold';
                          }

                          const optionLetters = ['A', 'B', 'C', 'D'];

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered && showFeedback}
                              onClick={() => handleMcqSelect(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-stone-800/80 flex items-center justify-center font-bold text-xs shrink-0">
                                  {optionLetters[optIdx]}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {hasAnswered && showFeedback && isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {hasAnswered && showFeedback && isOptionSelected && !isOptionCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box shown once answered */}
                      {hasAnswered && showFeedback && (
                        <div className="mt-2 p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 animate-fade-in space-y-1">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            विस्तृत व्याख्या (Explanation):
                          </span>
                          <p className="leading-relaxed">{item.explanation_hindi}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Test Button at Bottom */}
              {isTestMode && !testSubmitted && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={submitTest}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    टेस्ट सबमिट करें
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. OBJECTIVE QUESTIONS (1-Linear) */}
          {activeChapterTab === 'objective' && (
            <div className="space-y-4">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    1-अंकीय वस्तुनिष्ठ प्रश्न-उत्तर (NCERT)
                  </span>
                  <p className="text-xs text-stone-400">
                    बोर्ड परीक्षा में रिक्त स्थान, एक शब्द या 1-पंक्ति में पूछे जाने वाले प्रश्न।
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentChapter.objective_questions.map((obj, idx) => {
                  const isRevealed = revealedAnswers[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-stone-800 bg-stone-950 p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-stone-100">
                            {obj.question}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAnswerReveal(idx)}
                          className="text-xs font-medium text-amber-400 hover:text-amber-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 shrink-0 cursor-pointer"
                        >
                          {isRevealed ? 'उत्तर छुपाएं' : 'उत्तर देखें'}
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="mt-3 pt-3 border-t border-stone-850 pl-7 text-xs sm:text-sm text-emerald-300 font-medium animate-fade-in flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj.answer}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SUBJECTIVE QA (2, 3 & 5 Marks) */}
          {activeChapterTab === 'subjective' && (
            <div className="space-y-4">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  लघु व दीर्घ उत्तरीय प्रश्न-उत्तर (Subjective Q&A)
                </span>
                <p className="text-xs text-stone-400">
                  बिहार बोर्ड में 2 अंक, 3 अंक तथा 5 अंक के लिए शत-प्रतिशत आदर्श मॉडल उत्तर।
                </p>
              </div>

              <div className="space-y-4">
                {currentChapter.subjective_qa.map((qa, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-800 bg-stone-950 p-4 sm:p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        प्रश्न संख्या {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {qa.marks} अंक (लघु / दीर्घ उत्तरीय)
                      </span>
                    </div>

                    <h3 className="text-stone-100 font-bold text-sm sm:text-base">
                      {qa.question}
                    </h3>

                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800/80 text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line select-text">
                      <span className="text-emerald-400 font-bold block mb-1.5">
                        आदर्श उत्तर (Model Answer):
                      </span>
                      {qa.answer_hindi_detailed}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. TRICK SE SAMJHO TAB */}
          {activeChapterTab === 'trick' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-950 to-stone-950 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                    <Lightbulb className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      Trick Se Samjho • देसी याददाश्त ट्रिक
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {currentChapter.trick_hindi.title}
                    </h3>
                  </div>
                </div>

                {/* Mnemonic Banner */}
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center">
                  <span className="text-xs text-amber-300 font-medium block mb-1">
                    याद रखने का जादुई सूत्र (Mnemonic):
                  </span>
                  <div className="text-base sm:text-xl font-extrabold text-amber-200 tracking-wide">
                    "{currentChapter.trick_hindi.mnemonic}"
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2 text-xs sm:text-sm text-stone-300">
                  <span className="font-bold text-white block">ट्रिक की व्याख्या:</span>
                  <p className="leading-relaxed bg-stone-900 p-3.5 rounded-xl border border-stone-800">
                    {currentChapter.trick_hindi.explanation}
                  </p>
                </div>

                {/* Example Application */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 space-y-1">
                  <span className="font-bold text-emerald-400">परीक्षा में प्रयोग का उदाहरण:</span>
                  <p>{currentChapter.trick_hindi.example}</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. MATH PRASHNAWALI SOLUTIONS TAB */}
          {activeChapterTab === 'exercises' && (
            <div className="pt-2">
              <MathPrashnawaliSolutions
                initialChapterNumber={currentChapter.chapter_no}
                onAskAITeacher={(q, ch) => onNavigateToAITeacher('गणित (Maths)', ch)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
