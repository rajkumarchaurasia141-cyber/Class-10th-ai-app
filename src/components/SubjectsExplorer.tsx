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
    <div className="max-w-4xl mx-auto pb-24 p-4 selection:bg-amber-500/30">
      <button onClick={onBack} className="text-amber-500 mb-6 flex items-center gap-2 font-medium hover:text-amber-400 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> विषय सूची पर वापस जाएँ
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-amber-500 tracking-wider uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            बिहार बोर्ड वर्ग 10
          </span>
          <h2 className="text-2xl md:text-3xl font-black mt-2 text-white">{subject.subject_name_hindi || subject.subject_name}</h2>
        </div>
        <div className="text-xs text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl w-fit">
          कुल अध्याय: <strong className="text-white">{chapters.length}</strong>
        </div>
      </div>

      {/* Chapters Horizontal Scroll */}
      <div className="flex gap-2.5 overflow-x-auto mb-6 pb-2 scrollbar-none">
        {chapters.map((ch: any, index: number) => (
          <button
            key={ch.id || `chapter-${ch.chapter_no}-${index}`}
            onClick={() => handleSelectChapter(ch.chapter_no)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCh === ch.chapter_no 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 scale-105' 
                : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <span>अध्याय {ch.chapter_no}</span>
            {ch.chapter_no > 1 && !isVIP && (
              <span className="text-[10px] bg-stone-950/80 text-amber-400 px-1.5 py-0.5 rounded ml-1">VIP</span>
            )}
          </button>
        ))}
      </div>

      {currentChapter ? (
        <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl animate-fade-in">
          <div className="p-6 border-b border-stone-800 bg-stone-950/60 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-amber-500">अध्याय क्रमांक {currentChapter.chapter_no}</span>
              <h3 className="text-xl md:text-2xl font-black text-white">{currentChapter.chapter_name_hindi}</h3>
            </div>
            {currentChapter.chapter_name && (
              <span className="text-xs text-stone-400 italic">({currentChapter.chapter_name})</span>
            )}
          </div>

          {/* 5 Navigation Tabs */}
          <div className="flex border-b border-stone-800 overflow-x-auto scrollbar-none bg-stone-900/90">
            <button 
              onClick={() => setActiveTab('intro')} 
              className={`p-3.5 sm:p-4 flex-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'intro' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-4 h-4" /> पाठ परिचय
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`p-3.5 sm:p-4 flex-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'notes' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4" /> विस्तृत नोट्स
            </button>
            <button 
              onClick={() => setActiveTab('tips')} 
              className={`p-3.5 sm:p-4 flex-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'tips' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> VVI टॉपर टिप्स
            </button>
            <button 
              onClick={() => setActiveTab('qna')} 
              className={`p-3.5 sm:p-4 flex-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'qna' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> NCERT प्रश्न-उत्तर
            </button>
            <button 
              onClick={() => setActiveTab('mcq')} 
              className={`p-3.5 sm:p-4 flex-1 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'mcq' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> वस्तुनिष्ठ (MCQ)
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* पाठ परिचय */}
            {activeTab === 'intro' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">अध्याय का संक्षिप्त परिचय एवं पृष्ठभूमि</h4>
                    <p className="text-xs text-stone-400">बिहार बोर्ड परीक्षा में पाठ के संदर्भ और लेखक से जुड़े कई प्रश्न पूछे जाते हैं।</p>
                  </div>
                </div>

                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800/80 leading-relaxed text-stone-300 whitespace-pre-wrap text-base">
                  {currentChapter.intro_hindi || currentChapter.notes_hindi?.slice(0, 400) || 'इस अध्याय का पाठ परिचय जल्द ही उपलब्ध होगा।'}
                </div>
              </div>
            )}

            {/* विस्तृत नोट्स */}
            {activeTab === 'notes' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-stone-950 p-6 sm:p-8 rounded-2xl border border-stone-800/80">
                  <div className="whitespace-pre-wrap text-stone-300 leading-relaxed text-sm sm:text-base font-normal">
                    {currentChapter.notes_hindi || 'इस अध्याय के विस्तृत नोट्स उपलब्ध नहीं हैं।'}
                  </div>
                </div>
              </div>
            )}

            {/* VVI टॉपर टिप्स */}
            {activeTab === 'tips' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 mt-1">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-black text-lg">टॉपर परीक्षा टिप्स & स्कोरिंग स्ट्रैटेजी</h4>
                    <p className="text-xs text-stone-400 mt-1">
                      पिछले 10 वर्षों के बिहार विद्यालय परीक्षा समिति (BSEB) के ट्रेंड्स और टॉपर्स की कॉपियों के विश्लेषण पर आधारित विशेष बिंदु।
                    </p>
                  </div>
                </div>

                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 whitespace-pre-wrap text-stone-200 leading-relaxed text-sm sm:text-base">
                  {currentChapter.topper_tips || 'इस अध्याय के VVI टॉपर टिप्स जल्द ही जोड़े जा रहे हैं।'}
                </div>
              </div>
            )}

            {/* प्रश्न-उत्तर (NCERT & Subjective) */}
            {activeTab === 'qna' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" /> महत्वपूर्ण परीक्षा प्रश्न-उत्तर
                  </h4>
                  <span className="text-xs text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {currentChapter.subjective_qa?.length || 0} प्रश्न
                  </span>
                </div>

                {currentChapter.subjective_qa?.length > 0 ? currentChapter.subjective_qa.map((q: any, idx: number) => (
                  <div key={`qna-${idx}`} className="bg-stone-950 p-6 rounded-2xl border border-stone-800/80 hover:border-stone-700 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        {q.type || 'महत्वपूर्ण प्रश्न'}
                      </span>
                      <span className="text-xs text-stone-500 font-mono">Q{idx + 1}</span>
                    </div>
                    <h5 className="font-bold text-white text-base sm:text-lg mb-3">प्र. {q.question}</h5>
                    <div className="h-px w-full bg-stone-800/80 mb-3"></div>
                    <p className="text-stone-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{q.answer}</p>
                  </div>
                )) : (
                  <p className="text-stone-400 text-center py-8">इस अध्याय के प्रश्न-उत्तर अभी उपलब्ध नहीं हैं।</p>
                )}
              </div>
            )}

            {/* 50 वस्तुनिष्ठ प्रश्न (MCQ) */}
            {activeTab === 'mcq' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <span className="text-sm text-stone-300 font-medium">
                    कुल वस्तुनिष्ठ प्रश्न: <strong className="text-amber-400">{currentChapter.mcq?.length || 0}</strong>
                  </span>
                  <span className="text-xs text-stone-500">
                    उत्तर जानने के लिए किसी भी विकल्प पर क्लिक करें।
                  </span>
                </div>

                {currentChapter.mcq?.length > 0 ? currentChapter.mcq.map((m: any, idx: number) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const selectedOption = selectedAnswers[idx];
                  
                  return (
                    <div key={`mcq-${idx}`} className="bg-stone-950/90 p-5 sm:p-6 rounded-2xl border border-stone-800/80">
                      <p className="font-bold mb-4 text-stone-100 text-base sm:text-lg">
                        <span className="text-amber-500 mr-2 font-mono">Q{idx + 1}.</span>
                        {m.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.options?.map((opt: string, oIdx: number) => {
                          let optStyle = 'border-stone-800 bg-stone-900 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800/50 cursor-pointer';
                          
                          if (isAnswered) {
                            if (m.correct_answer === oIdx) {
                              optStyle = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold';
                            } else if (selectedOption === oIdx) {
                              optStyle = 'border-red-500/50 bg-red-500/15 text-red-300';
                            } else {
                              optStyle = 'border-stone-800 bg-stone-900/40 text-stone-600 opacity-40 cursor-not-allowed';
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
                              className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${optStyle}`}
                            >
                              <span className="font-mono text-xs opacity-75 mr-2">[{String.fromCharCode(65 + oIdx)}]</span>
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-stone-300 animate-fade-in flex items-start gap-2">
                          <span className="font-bold text-amber-400 shrink-0">स्पष्टीकरण / व्याख्या:</span>
                          <span>{m.explanation || 'सही उत्तर: विकल्प ' + String.fromCharCode(65 + m.correct_answer)}</span>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-stone-400 text-center py-8">इस अध्याय के MCQs अभी उपलब्ध नहीं हैं।</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
          यह अध्याय अभी उपलब्ध नहीं है।
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

