import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { SubjectId, VVIQuestionItem } from '../types';
import { BSEB_SUBJECTS, SAMPLE_VVI_QUESTIONS } from '../data/bsebSyllabus';
import {
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Printer,
  Bookmark,
  BookOpen,
  Filter,
} from 'lucide-react';

interface VVIQuestionBankProps {
  selectedSubjectId: SubjectId;
}

export const VVIQuestionBank: React.FC<VVIQuestionBankProps> = ({ selectedSubjectId }) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];

  const [marksFilter, setMarksFilter] = useState<'all' | '2-3' | '5'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(SAMPLE_VVI_QUESTIONS[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customVVIList, setCustomVVIList] = useState<VVIQuestionItem[]>([]);

  const combinedList = [...SAMPLE_VVI_QUESTIONS, ...customVVIList];

  const filteredQuestions = combinedList.filter((item) => {
    const matchesSubject = item.subjectId === selectedSubjectId;
    if (!matchesSubject) return false;
    if (marksFilter === '2-3') return item.marks === 2 || item.marks === 3;
    if (marksFilter === '5') return item.marks === 5;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCustomVVI = async (type: 'short' | 'long') => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            type === 'short'
              ? `बिहार बोर्ड कक्षा 10वीं ${currentSubject.hindiName} के लिए 2-3 अंक का एक अति-महत्वपूर्ण (VVI) मॉडल प्रश्न और उसका आदर्श सटीक उत्तर तैयार करें।`
              : `बिहार बोर्ड कक्षा 10वीं ${currentSubject.hindiName} के लिए 5 अंक का एक अति-महत्वपूर्ण (VVI) दीर्घ उत्तरीय मॉडल प्रश्न और उसका संपूर्ण उत्तर (भूमिका, मुख्य बिंदु, सूत्र/समीकरण, निष्कर्ष सहित) तैयार करें।`,
          subject: currentSubject.hindiName,
          format: type === 'short' ? 'short' : 'long',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'प्रश्न तैयार करने में समस्या आई।');

      const newItem: VVIQuestionItem = {
        id: `ai-vvi-${Date.now()}`,
        question: `BSEB 10वीं ${currentSubject.hindiName} VVI ${
          type === 'short' ? 'लघु उत्तरीय (2-3 अंक)' : 'दीर्घ उत्तरीय (5 अंक)'
        } मॉडल प्रश्न`,
        subjectId: selectedSubjectId,
        chapter: currentSubject.hindiName,
        marks: type === 'short' ? 2 : 5,
        answerType: type === 'short' ? 'लघु उत्तरीय (2-3 अंक)' : 'दीर्घ उत्तरीय (5 अंक)',
        answer: data.reply,
        tips: 'यह प्रश्न बिहार बोर्ड की आगामी परीक्षा हेतु अत्यधिक संभावित (VVI) है।',
      };

      setCustomVVIList((prev) => [newItem, ...prev]);
      setExpandedId(newItem.id);
    } catch (err) {
      console.error('Failed to generate VVI question:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              BSEB मॉडल उत्तर बैंक
            </span>
            <span className="text-xs text-stone-400">2-3 अंक एवं 5 अंक मानक</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {currentSubject.hindiName}: अति-महत्वपूर्ण (VVI) प्रश्न बैंक
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            बोर्ड परीक्षा में पूरे अंक प्राप्त करने हेतु आदर्श संरचना, सूत्र एवं निष्कर्ष सहित हल।
          </p>
        </div>

        {/* Action Buttons to generate more */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="vvi-gen-short-btn"
            onClick={() => handleGenerateCustomVVI('short')}
            disabled={aiGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs sm:text-sm font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>2-3 अंक VVI बनवाएं</span>
          </button>
          <button
            id="vvi-gen-long-btn"
            onClick={() => handleGenerateCustomVVI('long')}
            disabled={aiGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/10"
          >
            <Award className="w-3.5 h-3.5" />
            <span>5 अंक दीर्घ उत्तरीय बनवाएं</span>
          </button>
        </div>
      </div>

      {/* Marks Filter Tabs */}
      <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-1.5 rounded-xl">
        <span className="text-xs text-stone-400 font-medium px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> अंक प्रकार:
        </span>
        {[
          { id: 'all', label: 'सभी प्रश्न' },
          { id: '2-3', label: 'लघु उत्तरीय (2 से 3 अंक)' },
          { id: '5', label: 'दीर्घ उत्तरीय (5 अंक)' },
        ].map((f) => (
          <button
            key={f.id}
            id={`vvi-filter-${f.id}`}
            onClick={() => setMarksFilter(f.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              marksFilter === f.id
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-stone-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-200">
              इस श्रेणी में अभी कोई प्रश्न नहीं है
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              ऊपर दिए गए बटनों पर क्लिक करके AI शिक्षक से तुरंत नया मॉडल प्रश्न तैयार करवाएं।
            </p>
            <button
              onClick={() => handleGenerateCustomVVI('short')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
            >
              प्रश्न तैयार करें
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden transition-all hover:border-stone-700"
              >
                {/* Accordion Header */}
                <button
                  id={`vvi-item-toggle-${q.id}`}
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 bg-stone-850/60 hover:bg-stone-800/80 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 mt-0.5 ${
                        q.marks === 5
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {q.marks} अंक ({q.marks === 5 ? 'दीर्घ' : 'लघु'})
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] text-amber-400/80 font-medium mb-0.5">
                        {q.chapter} {q.subCategory ? `• ${q.subCategory}` : ''}
                      </div>
                      <h3 className="font-semibold text-stone-100 text-sm sm:text-base leading-snug">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  <div className="p-1 rounded bg-stone-800 text-stone-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-stone-800 bg-stone-900/90 space-y-4">
                    {/* Model Answer Markdown */}
                    <div className="prose prose-invert max-w-none text-sm sm:text-base prose-headings:text-amber-300 prose-strong:text-amber-200 prose-p:my-2 prose-ul:my-2 prose-li:my-1 text-stone-200 leading-relaxed">
                      <Markdown>{q.answer}</Markdown>
                    </div>

                    {/* Teacher's Exam Tips */}
                    {q.tips && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
                        <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300">शिक्षक का परीक्षा सुझाव: </span>
                          <span>{q.tips}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Tools */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800 text-xs">
                      <button
                        onClick={() => handleCopy(q.answer, q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white border border-stone-700 transition-colors"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === q.id ? 'कॉपी हो गया' : 'उत्तर कॉपी करें'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
