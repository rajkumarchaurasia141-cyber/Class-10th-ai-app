import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaywallModal } from './PaywallModal';
import { FileText, CheckCircle2, MessageSquare, ArrowLeft, BookOpen, Award, Sparkles, HelpCircle } from 'lucide-react';

export function SubjectsExplorer({ subjectId, onBack }: any) {
  const { subjects } = useData();
  const { isVIP } = useAuth();
  const [selectedCh, setSelectedCh] = useState(1);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'notes' | 'tips' | 'qna' | 'mcq'>('intro');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

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
    setSelectedAnswers({});
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
            {subject.subject_name_hindi || subject.subject_name}
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

          {/* 5 Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-white">
            <button 
              onClick={() => setActiveTab('intro')} 
              className={`p-3 sm:p-3.5 flex-1 font-bold text-xs flex items-center justify-center gap-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'intro' ? 'border-red-700 text-red-700 bg-red-50/50' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> पाठ परिचय
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`p-3 sm:p-3.5 flex-1 font-bold text-xs flex items-center justify-center gap-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'notes' ? 'border-red-700 text-red-700 bg-red-50/50' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> विस्तृत नोट्स
            </button>
            <button 
              onClick={() => setActiveTab('tips')} 
              className={`p-3 sm:p-3.5 flex-1 font-bold text-xs flex items-center justify-center gap-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'tips' ? 'border-red-700 text-red-700 bg-red-50/50' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> टॉपर टिप्स
            </button>
            <button 
              onClick={() => setActiveTab('qna')} 
              className={`p-3 sm:p-3.5 flex-1 font-bold text-xs flex items-center justify-center gap-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'qna' ? 'border-red-700 text-red-700 bg-red-50/50' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> NCERT प्रश्न
            </button>
            <button 
              onClick={() => setActiveTab('mcq')} 
              className={`p-3 sm:p-3.5 flex-1 font-bold text-xs flex items-center justify-center gap-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'mcq' ? 'border-red-700 text-red-700 bg-red-50/50' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> 50 MCQs
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {/* पाठ परिचय */}
            {activeTab === 'intro' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-stone-900 font-extrabold text-sm">अध्याय का संक्षिप्त परिचय एवं पृष्ठभूमि</h4>
                    <p className="text-[11px] text-stone-600">बिहार बोर्ड परीक्षा में पाठ के संदर्भ और लेखक से जुड़े कई प्रश्न पूछे जाते हैं।</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 leading-relaxed text-stone-800 whitespace-pre-wrap text-sm">
                  {currentChapter.intro_hindi || currentChapter.notes_hindi?.slice(0, 400) || 'इस अध्याय का पाठ परिचय जल्द ही उपलब्ध होगा।'}
                </div>
              </div>
            )}

            {/* विस्तृत नोट्स */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="whitespace-pre-wrap text-stone-800 leading-relaxed text-sm font-normal">
                    {currentChapter.notes_hindi || 'इस अध्याय के विस्तृत नोट्स उपलब्ध नहीं हैं।'}
                  </div>
                </div>
              </div>
            )}

            {/* VVI टॉपर टिप्स */}
            {activeTab === 'tips' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-50 to-transparent border border-amber-300 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-amber-400 text-stone-950 rounded-xl shrink-0 mt-0.5">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-stone-900 font-black text-sm">टॉपर परीक्षा टिप्स & स्कोरिंग स्ट्रैटेजी</h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      पिछले 10 वर्षों के बिहार बोर्ड (BSEB) के ट्रेंड्स और टॉपर्स की कॉपियों के विश्लेषण पर आधारित।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 whitespace-pre-wrap text-stone-800 leading-relaxed text-sm">
                  {currentChapter.topper_tips || 'इस अध्याय के VVI टॉपर टिप्स जल्द ही जोड़े जा रहे हैं।'}
                </div>
              </div>
            )}

            {/* प्रश्न-उत्तर (NCERT & Subjective) */}
            {activeTab === 'qna' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-red-600" /> महत्वपूर्ण परीक्षा प्रश्न-उत्तर
                  </h4>
                  <span className="text-xs text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {currentChapter.subjective_qa?.length || 0} प्रश्न
                  </span>
                </div>

                {currentChapter.subjective_qa?.length > 0 ? currentChapter.subjective_qa.map((q: any, idx: number) => (
                  <div key={`qna-${idx}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        {q.type || 'महत्वपूर्ण प्रश्न'}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">Q{idx + 1}</span>
                    </div>
                    <h5 className="font-extrabold text-stone-900 text-sm">प्र. {q.question}</h5>
                    <div className="h-px w-full bg-slate-200"></div>
                    <p className="text-stone-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{q.answer}</p>
                  </div>
                )) : (
                  <p className="text-stone-400 text-center py-6 text-xs">इस अध्याय के प्रश्न-उत्तर अभी उपलब्ध नहीं हैं।</p>
                )}
              </div>
            )}

            {/* 50 वस्तुनिष्ठ प्रश्न (MCQ) */}
            {activeTab === 'mcq' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-xs text-stone-700 font-semibold">
                    कुल वस्तुनिष्ठ प्रश्न: <strong className="text-red-700">{currentChapter.mcq?.length || 0}</strong>
                  </span>
                  <span className="text-[10px] text-stone-500">
                    उत्तर जानने हेतु विकल्प पर क्लिक करें
                  </span>
                </div>

                {currentChapter.mcq?.length > 0 ? currentChapter.mcq.map((m: any, idx: number) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const selectedOption = selectedAnswers[idx];
                  
                  return (
                    <div key={`mcq-${idx}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="font-bold mb-3 text-stone-900 text-sm">
                        <span className="text-red-700 mr-1.5 font-mono">Q{idx + 1}.</span>
                        {m.question}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {m.options?.map((opt: string, oIdx: number) => {
                          let optStyle = 'border-slate-200 bg-white text-stone-700 hover:border-red-300 hover:bg-slate-100 cursor-pointer';
                          
                          if (isAnswered) {
                            if (m.correct_answer === oIdx) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (selectedOption === oIdx) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                            } else {
                              optStyle = 'border-slate-200 bg-slate-100/60 text-stone-400 opacity-50 cursor-not-allowed';
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
                              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${optStyle}`}
                            >
                              <span className="font-mono text-[10px] opacity-75 mr-1.5">[{String.fromCharCode(65 + oIdx)}]</span>
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-stone-800 animate-fade-in flex items-start gap-2">
                          <span className="font-bold text-amber-800 shrink-0">व्याख्या:</span>
                          <span>{m.explanation || 'सही उत्तर: विकल्प ' + String.fromCharCode(65 + m.correct_answer)}</span>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-stone-400 text-center py-6 text-xs">इस अध्याय के MCQs अभी उपलब्ध नहीं हैं।</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-stone-500 text-xs">
          यह अध्याय अभी उपलब्ध नहीं है।
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

