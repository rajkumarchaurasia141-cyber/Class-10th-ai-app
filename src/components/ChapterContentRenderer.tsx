import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Check, 
  AlertCircle,
  Lightbulb,
  Bookmark,
  Share2,
  Copy,
  ChevronRight
} from 'lucide-react';

interface ChapterContentRendererProps {
  activeTab: 'intro' | 'notes' | 'tips' | 'qna' | 'mcq';
  currentChapter: any;
  onStartPaidTest: () => void;
}

export const ChapterContentRenderer: React.FC<ChapterContentRendererProps> = ({
  activeTab,
  currentChapter,
  onStartPaidTest
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyQA = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to format general notes text with styled headers, bullet points and highlights
  const renderFormattedNotes = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: string[] = [];

    const flushCurrentBlock = (key: string) => {
      if (currentBlock.length > 0) {
        const text = currentBlock.join('\n').trim();
        if (text) {
          elements.push(
            <div key={key} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all leading-relaxed text-slate-800 text-[14.5px] font-normal">
              {text.split('\n').map((l, lIdx) => {
                // Bullet lines
                if (l.trim().startsWith('▶') || l.trim().startsWith('•') || l.trim().startsWith('-')) {
                  const cleanLine = l.replace(/^[▶•\-]\s*/, '');
                  return (
                    <div key={`bullet-${lIdx}`} className="flex items-start gap-2.5 my-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                      <span className="text-slate-800 leading-relaxed font-medium">
                        {highlightKeywords(cleanLine)}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={`p-${lIdx}`} className="mb-2 last:mb-0">
                    {highlightKeywords(l)}
                  </p>
                );
              })}
            </div>
          );
        }
        currentBlock = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Section Banner: 【 ... 】
      if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
        flushCurrentBlock(`flush-before-${idx}`);
        const title = trimmed.replace(/[【】]/g, '');
        elements.push(
          <div key={`section-hdr-${idx}`} className="mt-4 mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 text-white shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200 block">महत्वपूर्ण खंड</span>
              <h3 className="font-black text-sm sm:text-base text-white tracking-wide">{title}</h3>
            </div>
          </div>
        );
        return;
      }

      // Major Subheading (e.g. १. जाति प्रथा का मुख्य दोष: or 1. or क.)
      const isMajorSubheading = /^[१२३४५६७८९०0-9]+[.)]\s+/.test(trimmed) && trimmed.includes(':');
      if (isMajorSubheading) {
        flushCurrentBlock(`flush-sub-${idx}`);
        elements.push(
          <div key={`subhdr-${idx}`} className="mt-4 mb-2 p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-transparent border-l-4 border-indigo-600 rounded-r-xl flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
              {trimmed.charAt(0)}
            </span>
            <h4 className="font-extrabold text-indigo-950 text-sm sm:text-[15px]">
              {trimmed.replace(/^[१२३४५६७८९०0-9]+[.)]\s*/, '')}
            </h4>
          </div>
        );
        return;
      }

      currentBlock.push(line);
    });

    flushCurrentBlock('flush-final');
    return elements;
  };

  // Helper to highlight terms in quotes or specific keywords
  const highlightKeywords = (str: string) => {
    // Regex for single or double quotes
    const parts = str.split(/(['"][^'"]+['"])/g);
    return parts.map((part, i) => {
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        return (
          <span key={`hl-${i}`} className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-md mx-0.5 border border-rose-200/60">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. पाठ परिचय (INTRO) */}
      {activeTab === 'intro' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Banner Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-50 to-rose-50 border border-amber-300/80 rounded-3xl flex items-start gap-3.5 shadow-xs">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-500 text-white rounded-2xl shadow-sm shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                  पाठ परिचय एवं लेखक संदर्भ
                </span>
                <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  BSEB अनिवार्य
                </span>
              </div>
              <h4 className="text-stone-950 font-black text-sm sm:text-base">
                {currentChapter.chapter_name_hindi || 'अध्याय का संक्षिप्त परिचय'}
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                बोर्ड परीक्षा में लेखक के जीवन, उनकी रचनाओं तथा पाठ के मूल उद्देश्य से 5 से 8 अंक के प्रश्न अवश्य आते हैं।
              </p>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="space-y-3.5">
            {currentChapter.intro_hindi ? (
              renderFormattedNotes(currentChapter.intro_hindi)
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय का पाठ परिचय जल्द ही उपलब्ध होगा।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. विस्तृत नोट्स (NOTES) */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-fade-in">
          {/* Notes Top Header */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-50 to-purple-50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-indigo-950 text-sm sm:text-base">संपूर्ण विस्तृत अध्याय नोट्स</h4>
                <p className="text-xs text-indigo-700/80">
                  एनसीईआरटी (NCERT) मानक पाठ्यक्रम एवं टॉपर विश्लेषण पर आधारित
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex bg-white text-indigo-900 font-bold text-xs px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
              Revision Ready
            </span>
          </div>

          {/* Notes Rendered Content */}
          <div className="space-y-3.5">
            {currentChapter.notes_hindi ? (
              renderFormattedNotes(currentChapter.notes_hindi)
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय के विस्तृत नोट्स उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VVI टॉपर टिप्स (TIPS) */}
      {activeTab === 'tips' && (
        <div className="space-y-4 animate-fade-in">
          {/* Gold Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/25 via-yellow-100/60 to-amber-50 border-2 border-amber-400/80 rounded-3xl flex items-start gap-3.5 shadow-sm">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 text-stone-950 rounded-2xl shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🏆 TOPPER SECRETS
                </span>
                <span className="text-[11px] text-amber-900 font-bold">100/100 Target</span>
              </div>
              <h4 className="text-stone-950 font-black text-sm sm:text-base">
                बिहार बोर्ड VVI टॉपर परीक्षा टिप्स & मार्क्स बूस्टर
              </h4>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                इन मुख्य बिंदुओं, महत्वपूर्ण तारीखों और उत्तर लिखने की विधियों को याद रखकर आप परीक्षा में पूरे अंक ला सकते हैं।
              </p>
            </div>
          </div>

          {/* Rendered Tips */}
          <div className="space-y-3">
            {currentChapter.topper_tips ? (
              currentChapter.topper_tips.split('\n').filter((l: string) => l.trim().length > 0).map((line: string, idx: number) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('【')) {
                  return (
                    <div key={`tip-hdr-${idx}`} className="p-3 bg-amber-100/80 border border-amber-300 rounded-2xl text-amber-950 font-black text-xs sm:text-sm text-center">
                      {trimmed.replace(/[【】]/g, '')}
                    </div>
                  );
                }

                // Check if it's a Q&A tip: e.g. "१. डॉ. आंबेडकर का जन्म कब हुआ? उत्तर: 14 अप्रैल 1891..."
                const hasAnswer = trimmed.includes('उत्तर:') || trimmed.includes('उत्तर :');
                let qPart = trimmed;
                let aPart = '';
                if (hasAnswer) {
                  const split = trimmed.split(/उत्तर\s*:\s*/);
                  qPart = split[0];
                  aPart = split[1] || '';
                }

                return (
                  <div key={`tip-item-${idx}`} className="p-4 bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs hover:border-amber-400 transition-all space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-xl bg-amber-400 text-stone-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-stone-900 font-bold text-sm leading-snug">
                          {qPart}
                        </p>
                      </div>
                    </div>

                    {hasAnswer && (
                      <div className="ml-8 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start gap-2">
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0">
                          सटीक उत्तर
                        </span>
                        <span className="leading-relaxed">{aPart}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय के VVI टॉपर टिप्स जल्द ही उपलब्ध होंगे।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. NCERT एवं महत्वपूर्ण प्रश्नोत्तर (QNA) - EXTRA VIBRANT & DISTINCT COLORS */}
      {activeTab === 'qna' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar */}
          <div className="p-4 bg-gradient-to-r from-rose-700 via-red-600 to-indigo-700 text-white rounded-3xl shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl text-white shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-200 block">
                  NCERT अभ्यास & मॉडल उत्तर
                </span>
                <h4 className="font-black text-sm sm:text-base text-white">
                  अध्याय के संपूर्ण परीक्षा उपयोगी प्रश्न-उत्तर
                </h4>
              </div>
            </div>
            <span className="bg-white/25 text-white font-black text-xs px-3 py-1 rounded-full shrink-0">
              {currentChapter.subjective_qa?.length || 0} प्रश्न
            </span>
          </div>

          {/* Question & Answer Cards */}
          <div className="space-y-4">
            {currentChapter.subjective_qa && currentChapter.subjective_qa.length > 0 ? (
              currentChapter.subjective_qa.map((qa: any, idx: number) => {
                const isLong = qa.type?.includes('दीर्घ') || qa.question?.length > 70;
                
                return (
                  <div 
                    key={`qna-card-${idx}`} 
                    className="overflow-hidden rounded-3xl border-2 border-indigo-100 bg-white shadow-xs hover:shadow-md transition-all"
                  >
                    {/* ===== 1. QUESTION SECTION (DISTINCT INDIGO / ROSE COLOR) ===== */}
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Question Number Badge */}
                          <span className="bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                            <span>प्रश्न {idx + 1}</span>
                          </span>
                          
                          {/* Question Type Tag */}
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                            isLong 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          }`}>
                            {qa.type || 'महत्वपूर्ण प्रश्न'} • {isLong ? '5 अंक' : '2 अंक'}
                          </span>
                        </div>

                        {/* Copy Question Button */}
                        <button
                          onClick={() => handleCopyQA(`प्र. ${qa.question}\n\nउ. ${qa.answer}`, idx)}
                          title="प्रश्न-उत्तर कॉपी करें"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-300">कॉपी हो गया!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px] hidden sm:inline">कॉपी</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Question Text - Bold, High-Visibility Distinct Font */}
                      <h5 className="font-extrabold text-white text-[15px] sm:text-base leading-snug tracking-wide">
                        {qa.question}
                      </h5>
                    </div>

                    {/* ===== 2. ANSWER SECTION (DISTINCT EMERALD / SOFT CARD COLOR) ===== */}
                    <div className="p-4 sm:p-5 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 border-t-2 border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>उत्तर (आदर्श उत्तर)</span>
                        </span>
                        <span className="text-[11px] text-emerald-800 font-bold">
                          बोर्ड परीक्षा मानक
                        </span>
                      </div>

                      {/* Answer Text - Highly Readable, Deep Slate Color, Generous Line Height */}
                      <div className="border-l-4 border-emerald-500 pl-3.5 sm:pl-4 py-1">
                        <p className="text-slate-800 font-medium text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
                          {highlightKeywords(qa.answer)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
                इस अध्याय के प्रश्न-उत्तर अभी उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. वस्तुनिष्ठ प्रश्न (50 MCQS) */}
      {activeTab === 'mcq' && (
        <div className="space-y-4 animate-fade-in">
          {/* Timed Test Hero Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  परीक्षा हॉल मोड
                </span>
                <h4 className="font-black text-sm sm:text-base text-white mt-0.5">
                  50 MCQ महा-मॉक टेस्ट (OMR टाइमर मोड)
                </h4>
                <p className="text-xs text-blue-200">
                  50 मिनट का समय • निगेटिव मार्किंग विश्लेषण • तुरंत रिपोर्ट कार्ड
                </p>
              </div>
            </div>
            <button
              onClick={onStartPaidTest}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 text-xs font-black self-start sm:self-auto shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>टाइमर टेस्ट शुरू करें</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">
                कुल वस्तुनिष्ठ प्रश्न:
              </span>
              <span className="bg-rose-100 text-rose-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {currentChapter.mcq?.length || 0} MCQs
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              उत्तर देखने के लिए विकल्प पर क्लिक करें
            </span>
          </div>

          {/* MCQ List */}
          <div className="space-y-3.5">
            {currentChapter.mcq && currentChapter.mcq.length > 0 ? (
              currentChapter.mcq.map((m: any, idx: number) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const selectedOption = selectedAnswers[idx];

                return (
                  <div 
                    key={`mcq-item-${idx}`} 
                    className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-2.5">
                      <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <p className="font-extrabold text-slate-900 text-[14.5px] sm:text-base leading-snug">
                        {m.question}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {m.options?.map((opt: string, oIdx: number) => {
                        let optStyle = 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer';
                        const optionLetter = String.fromCharCode(65 + oIdx);

                        if (isAnswered) {
                          if (m.correct_answer === oIdx) {
                            optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs';
                          } else if (selectedOption === oIdx) {
                            optStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                          } else {
                            optStyle = 'border-slate-200 bg-slate-100/50 text-slate-400 opacity-60 cursor-not-allowed';
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
                            className={`p-3 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${optStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isAnswered && m.correct_answer === oIdx 
                                ? 'bg-emerald-600 text-white'
                                : isAnswered && selectedOption === oIdx
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700'
                            }`}>
                              {optionLetter}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {isAnswered && m.correct_answer === oIdx && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Alert */}
                    {isAnswered && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs sm:text-sm text-stone-900 animate-fade-in flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-400 text-stone-950 shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-amber-900 block mb-0.5">
                            सही उत्तर व्याख्या (Explanation):
                          </span>
                          <p className="leading-relaxed font-medium text-stone-800">
                            {m.explanation || `सही उत्तर विकल्प [${String.fromCharCode(65 + m.correct_answer)}] है।`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
                इस अध्याय के MCQs अभी उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
