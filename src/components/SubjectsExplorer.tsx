import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaywallModal } from './PaywallModal';
import { FileText, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';

export function SubjectsExplorer({ subjectId, onBack }: any) {
  const { subjects } = useData();
  const { isVIP } = useAuth();
  const [selectedCh, setSelectedCh] = useState(1);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const subject = subjects[subjectId];
  if (!subject) return <div className="p-4 text-center">विषय नहीं मिला</div>;

  const chapters = subject.chapters || [];
  const currentChapter = chapters.find((c: any) => c.chapter_no === selectedCh) || chapters[0];

  const handleSelectChapter = (chNo: number) => {
    if (chNo > 1 && !isVIP) {
      setShowPaywall(true);
      return;
    }
    setSelectedCh(chNo);
    setSelectedAnswers({});
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 p-4">
      <button onClick={onBack} className="text-amber-500 mb-6 flex items-center gap-2 font-medium hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> विषय सूची पर वापस जाएँ
      </button>
      
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-white">{subject.subject_name_hindi || subject.subject_name}</h2>

      <div className="flex gap-3 overflow-x-auto mb-6 pb-2 scrollbar-none">
        {chapters.map((ch: any, index: number) => (
          <button
            key={ch.id || `chapter-${ch.chapter_no}-${index}`}
            onClick={() => handleSelectChapter(ch.chapter_no)}
            className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all ${selectedCh === ch.chapter_no ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 scale-105' : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700'}`}
          >
            Ch {ch.chapter_no}
          </button>
        ))}
      </div>

      {currentChapter ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-xl animate-fade-in">
          <div className="p-5 border-b border-stone-800 bg-stone-950/50">
            <h3 className="text-xl font-bold text-white">अध्याय {currentChapter.chapter_no}: {currentChapter.chapter_name_hindi}</h3>
          </div>

          <div className="flex border-b border-stone-800 overflow-x-auto scrollbar-none">
            <button onClick={() => setActiveTab('notes')} className={`p-4 flex-1 font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-300'}`}>
              <FileText className="w-4 h-4" /> नोट्स
            </button>
            <button onClick={() => setActiveTab('mcq')} className={`p-4 flex-1 font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'mcq' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-300'}`}>
              <CheckCircle2 className="w-4 h-4" /> 50 MCQ
            </button>
            <button onClick={() => setActiveTab('qna')} className={`p-4 flex-1 font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'qna' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-300'}`}>
              <MessageSquare className="w-4 h-4" /> प्रश्न-उत्तर
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'notes' && (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-stone-300 leading-relaxed text-sm md:text-base">{currentChapter.notes_hindi || 'इस अध्याय के नोट्स अभी उपलब्ध नहीं हैं।'}</div>
              </div>
            )}
            {activeTab === 'mcq' && (
              <div className="space-y-6">
                {currentChapter.mcq?.length > 0 ? currentChapter.mcq.map((m: any, idx: number) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const selectedOption = selectedAnswers[idx];
                  
                  return (
                    <div key={`mcq-${idx}`} className="bg-stone-950/80 p-5 rounded-2xl border border-stone-800/80">
                      <p className="font-bold mb-4 text-stone-100 text-lg">प्रश्न {idx + 1}. {m.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.options?.map((opt: string, oIdx: number) => {
                          let optStyle = 'border-stone-800 bg-stone-900 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800/50 cursor-pointer';
                          
                          if (isAnswered) {
                             if (m.correct_answer === oIdx) {
                               optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                             } else if (selectedOption === oIdx) {
                               optStyle = 'border-red-500/50 bg-red-500/10 text-red-400';
                             } else {
                               optStyle = 'border-stone-800 bg-stone-900/50 text-stone-500 opacity-50 cursor-not-allowed';
                             }
                          }

                          return (
                            <div 
                              key={`opt-${idx}-${oIdx}`} 
                              onClick={() => {
                                if (!isAnswered) {
                                  setSelectedAnswers(prev => ({ ...prev, [idx]: oIdx }));
                                }
                              }}
                              className={`p-3 rounded-xl border-2 font-medium transition-colors ${optStyle}`}
                            >
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          );
                        })}
                      </div>
                      {isAnswered && m.explanation && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-stone-300 animate-fade-in">
                          <span className="font-bold text-amber-500">व्याख्या: </span>{m.explanation}
                        </div>
                      )}
                    </div>
                  );
                }) : <p className="text-stone-400">इस अध्याय के MCQs अभी उपलब्ध नहीं हैं।</p>}
              </div>
            )}
            {activeTab === 'qna' && (
              <div className="space-y-6">
                {currentChapter.subjective_qa?.length > 0 ? currentChapter.subjective_qa.map((q: any, idx: number) => (
                  <div key={`qna-${idx}`} className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
                    <h4 className="font-bold mb-3 text-amber-400 text-lg">प्रश्न: {q.question}</h4>
                    <div className="h-px w-full bg-stone-800 mb-4"></div>
                    <p className="text-stone-300 leading-relaxed">{q.answer}</p>
                  </div>
                )) : <p className="text-stone-400">इस अध्याय के प्रश्न-उत्तर अभी उपलब्ध नहीं हैं।</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
         <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800 text-stone-400">यह अध्याय अभी उपलब्ध नहीं है।</div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}
