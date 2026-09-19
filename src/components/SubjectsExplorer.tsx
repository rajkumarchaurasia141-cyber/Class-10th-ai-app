import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaywallModal } from './PaywallModal';
import { PaidTestModal } from './PaidTestModal';
import { ChapterContentRenderer } from './ChapterContentRenderer';
import { 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Sparkles, 
  BookMarked 
} from 'lucide-react';

export function SubjectsExplorer({ subjectId, onBack }: any) {
  const { subjects } = useData();
  const { isVIP } = useAuth();
  const [selectedCh, setSelectedCh] = useState(1);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPaidTest, setShowPaidTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'notes' | 'tips' | 'qna' | 'mcq'>('intro');

  const subject = subjects[subjectId];
  if (!subject) return <div className="p-4 text-center text-stone-400">विषय नहीं मिला</div>;

  const chapters = subject.chapters || [];
  const currentChapter = chapters.find((c: any) => c.chapter_no === selectedCh) || chapters[0];

  const handleSelectChapter = (chNo: number) => {
    if (chNo > 1 && !isVIP) {
      setShowPaywall(true);
      return;
    }
    setSelectedCh(chNo);
    setActiveTab('intro');
  };

  return (
    <div className="max-w-lg mx-auto pb-24 p-3 sm:p-4 selection:bg-red-500/30">
      <button 
        onClick={onBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 mb-4 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>विषय सूची पर वापस</span>
      </button>
      
      <div className="bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-3xl p-4 sm:p-5 mb-4 shadow-sm flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
            बिहार बोर्ड वर्ग 10
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
            {subjectId === 'hindi' ? (
              selectedCh <= 12 ? 'हिंदी गोधूलि (गद्य खंड)' :
              selectedCh <= 24 ? 'हिंदी गोधूलि (काव्य खंड)' :
              'हिंदी वर्णिका'
            ) : (subject.subject_name_hindi || subject.subject_name)}
          </h2>
        </div>
        <div className="text-xs text-amber-100 bg-black/30 border border-white/20 px-3 py-1.5 rounded-xl shrink-0 font-medium">
          कुल अध्याय: <strong className="text-white">{chapters.length}</strong>
        </div>
      </div>

      {/* Chapters Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1 scrollbar-none">
        {chapters.map((ch: any, index: number) => (
          <button
            key={ch.id || `chapter-${ch.chapter_no}-${index}`}
            onClick={() => handleSelectChapter(ch.chapter_no)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
              selectedCh === ch.chapter_no 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-white text-stone-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>अध्याय {ch.chapter_no}</span>
            {ch.chapter_no > 1 && !isVIP && (
              <span className="text-[9px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded ml-1">VIP</span>
            )}
          </button>
        ))}
      </div>

      {currentChapter ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-xs font-bold text-red-700">अध्याय क्रमांक {currentChapter.chapter_no}</span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">{currentChapter.chapter_name_hindi}</h3>
            </div>
            {currentChapter.chapter_name && (
              <span className="text-xs text-stone-500 italic">({currentChapter.chapter_name})</span>
            )}
          </div>

          {/* 5 Distinctive Colorful Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/80 p-1.5 gap-1.5">
            {/* Tab 1: पाठ परिचय */}
            <button 
              onClick={() => setActiveTab('intro')} 
              className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'intro' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ring-1 ring-amber-400' 
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> 
              <span>पाठ परिचय</span>
            </button>

            {/* Tab 2: विस्तृत नोट्स */}
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'notes' 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm ring-1 ring-indigo-400' 
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 
              <span>विस्तृत नोट्स</span>
            </button>

            {/* Tab 3: टॉपर टिप्स */}
            <button 
              onClick={() => setActiveTab('tips')} 
              className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'tips' 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-sm ring-1 ring-amber-300' 
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> 
              <span>टॉपर टिप्स</span>
            </button>

            {/* Tab 4: NCERT प्रश्न-उत्तर */}
            <button 
              onClick={() => setActiveTab('qna')} 
              className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'qna' 
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm ring-1 ring-rose-400' 
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> 
              <span>NCERT प्रश्न</span>
            </button>

            {/* Tab 5: 50 MCQs */}
            <button 
              onClick={() => setActiveTab('mcq')} 
              className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'mcq' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm ring-1 ring-blue-400' 
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> 
              <span>50 MCQs</span>
            </button>
          </div>

          {/* Render Active Tab using Modern ChapterContentRenderer */}
          <div className="p-3.5 sm:p-5 bg-slate-50/50 min-h-[400px]">
            <ChapterContentRenderer 
              activeTab={activeTab}
              currentChapter={currentChapter}
              onStartPaidTest={() => setShowPaidTest(true)}
            />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-stone-500 text-xs">
          यह अध्याय अभी उपलब्ध नहीं है।
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showPaidTest && (
        <PaidTestModal 
          onClose={() => setShowPaidTest(false)} 
          onOpenVip={() => setShowPaywall(true)} 
          isVIP={isVIP}
          testTitle={`${subject.subject_name_hindi} • अध्याय ${currentChapter.chapter_no}: ${currentChapter.chapter_name_hindi}`}
          testSubtitle={`${currentChapter.mcq?.length || 50} प्रश्न • ${Math.max(10, currentChapter.mcq?.length || 50)} मिनट समय • OMR टेस्ट मोड (BSEB 2027)`}
          questions={currentChapter.mcq && currentChapter.mcq.length > 0 ? currentChapter.mcq.map((m: any, idx: number) => ({
            id: m.id || idx + 1,
            subject: subject.subject_name_hindi,
            chapter: currentChapter.chapter_name_hindi,
            question: m.question,
            options: m.options,
            correct_answer: m.correct_answer,
            explanation: m.explanation || ''
          })) : undefined}
        />
      )}
    </div>
  );
}

