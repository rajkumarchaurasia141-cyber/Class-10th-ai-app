import React, { useState } from 'react';
import { SubjectId } from '../types';
import { BSEB_PYQ_DATA, PYQItem } from '../data/bsebPYQ';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import { cleanAsterisksAndFormat } from '../utils/notesFormatter';
import {
  History,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Download,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PYQBankProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
}

export const PYQBank: React.FC<PYQBankProps> = ({
  selectedSubjectId,
  onSelectSubject,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'short' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({
    'pyq-m-2024-1': true,
    'pyq-s-2024-1': true,
  });
  const [aiExplainingId, setAiExplainingId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

  const years = [2024, 2023, 2022, 2021, 2020];

  const filteredQuestions = BSEB_PYQ_DATA.filter((item) => {
    if (selectedSubjectId && item.subjectId !== selectedSubjectId) return false;
    if (selectedYear !== 'all' && item.year !== selectedYear) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        item.solution.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAskAIExplanation = async (item: PYQItem) => {
    setAiExplainingId(item.id);
    try {
      const res = await fetch('/api/gemini/pyq-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          subject: item.subjectName,
          year: item.year,
          marks: item.marks,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setAiExplanations((prev) => ({
          ...prev,
          [item.id]: cleanAsterisksAndFormat(data.explanation),
        }));
        setExpandedSolutions((prev) => ({ ...prev, [item.id]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiExplainingId(null);
    }
  };

  const handleExportPYQs = () => {
    const currentSub = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId);
    let html = '';

    filteredQuestions.forEach((q, idx) => {
      html += `
        <div class="question-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="q-badge">${q.year} • ${q.questionNumber} • ${q.marks} अंक</span>
            <span style="font-size: 10pt; color: #78350f; font-weight: 600;">${q.chapter}</span>
          </div>
          <div class="q-text">${idx + 1}. ${cleanAsterisksAndFormat(q.question)}</div>
      `;

      if (q.options && q.correctIndex !== undefined) {
        html += `<div style="margin: 8px 0; font-size: 11pt;">`;
        q.options.forEach((opt, oIdx) => {
          const isCorrect = oIdx === q.correctIndex;
          html += `<div style="padding: 2px 0; ${isCorrect ? 'font-weight: 700; color: #15803d;' : ''}">
            (${String.fromCharCode(65 + oIdx)}) ${opt} ${isCorrect ? '✔ (सही उत्तर)' : ''}
          </div>`;
        });
        html += `</div>`;
      }

      html += `
        <div class="q-answer">
          <strong>आदर्श उत्तर / हल:</strong><br/>
          ${cleanAsterisksAndFormat(q.solution).replace(/\n/g, '<br/>')}
        </div>
      `;

      if (q.examTips) {
        html += `
          <div style="margin-top: 6px; font-size: 10pt; color: #b45309; font-style: italic;">
            💡 <strong>बोर्ड एग्जाम टिप:</strong> ${cleanAsterisksAndFormat(q.examTips)}
          </div>
        `;
      }

      html += `</div>`;
    });

    exportToPrintablePdf({
      title: `${currentSub?.hindiName || 'BSEB'} विगत वर्ष प्रश्न संग्रह (PYQ)`,
      subtitle: `वर्ष ${selectedYear === 'all' ? '2020-2024' : selectedYear} • आधिकारिक बोर्ड परीक्षा प्रश्न एवं संपूर्ण हल`,
      subject: currentSub?.hindiName,
      badge: 'बिहार विद्यालय परीक्षा समिति (BSEB) विगत वर्ष प्रश्न-पत्र',
      contentHtml: html,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>BSEB 10वीं बोर्ड परीक्षा 2020–2024 प्रामाणिक प्रश्न बैंक</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-amber-400" />
              <span>विगत वर्ष प्रश्न (PYQ Bank with Solutions)</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              बिहार बोर्ड परीक्षा में 60% से अधिक प्रश्न विगत 5 वर्षों के पेपर्स से दोहराए जाते हैं। यहाँ प्रत्येक प्रश्न का अंकवार सटीक हल और मार्किंग स्कीम उपलब्ध है।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="export-pyq-pdf-btn"
              onClick={handleExportPYQs}
              disabled={filteredQuestions.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PYQ PDF डाउनलोड करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-stone-400 font-semibold shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>विषय:</span>
          </span>
          {BSEB_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              id={`pyq-subject-${sub.id}`}
              onClick={() => onSelectSubject(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubjectId === sub.id
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                  : 'bg-stone-850 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              {sub.hindiName}
            </button>
          ))}
        </div>

        {/* Year, Type & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 border-t border-stone-800/80">
          {/* Year selector */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              id="pyq-year-select"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">सभी वर्ष (2020-2024)</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  वर्ष {y} बोर्ड पेपर
                </option>
              ))}
            </select>
          </div>

          {/* Type selector */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              id="pyq-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">सभी प्रश्न प्रकार (MCQ / लघु / दीर्घ)</option>
              <option value="mcq">वस्तुनिष्ठ (1 अंक - MCQ)</option>
              <option value="short">लघु उत्तरीय (2-3 अंक)</option>
              <option value="long">दीर्घ उत्तरीय (5 अंक)</option>
            </select>
          </div>

          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="प्रश्न, अध्याय या विषय का कीवर्ड खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>
          कुल <strong>{filteredQuestions.length}</strong> विगत वर्ष प्रश्न उपलब्ध हैं
        </span>
        <button
          onClick={() => {
            const allExpanded: Record<string, boolean> = {};
            filteredQuestions.forEach((q) => {
              allExpanded[q.id] = true;
            });
            setExpandedSolutions(allExpanded);
          }}
          className="text-amber-400 hover:underline font-semibold"
        >
          सभी उत्तर खोलें
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-400">
            <History className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-300">
              चयनित फिल्टर के अनुसार कोई प्रश्न नहीं मिला।
            </p>
            <p className="text-xs text-stone-500 mt-1">
              कृपया दूसरा वर्ष या प्रश्न प्रकार चुनें।
            </p>
          </div>
        ) : (
          filteredQuestions.map((item, index) => {
            const isExpanded = !!expandedSolutions[item.id];
            const aiExpl = aiExplanations[item.id];
            const isAiLoading = aiExplainingId === item.id;

            return (
              <div
                key={item.id}
                id={`pyq-card-${item.id}`}
                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all shadow-md"
              >
                {/* Header info */}
                <div className="bg-stone-850/80 px-4 sm:px-6 py-3 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      BSEB {item.year}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                      {item.questionNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {item.marks} {item.marks === 1 ? 'अंक (MCQ)' : 'अंक'}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-amber-400/90 flex items-center gap-1.5">
                    <span>{item.subjectName}</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-300">{item.chapter}</span>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug flex-1">
                      {cleanAsterisksAndFormat(item.question)}
                    </h3>
                  </div>

                  {/* MCQ Options if present */}
                  {item.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                      {item.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 ${
                            oIdx === item.correctIndex && isExpanded
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-stone-950/60 border-stone-800 text-stone-300'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{cleanAsterisksAndFormat(opt)}</span>
                          {oIdx === item.correctIndex && isExpanded && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solution block (Collapsible) */}
                  {isExpanded && (
                    <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3 mt-2">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>आदर्श उत्तर एवं चरणबद्ध व्याख्या:</span>
                        </span>
                        {item.examTips && (
                          <span className="text-xs text-amber-300/80 italic hidden sm:inline-block">
                            💡 टिप: {cleanAsterisksAndFormat(item.examTips)}
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                        {cleanAsterisksAndFormat(item.solution)}
                      </div>

                      {/* AI Enhanced explanation if requested */}
                      {aiExpl && (
                        <div className="mt-3 p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-2">
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI गुरु की अतिरिक्त सरल व्याख्या व मार्किंग गाइड:</span>
                          </div>
                          <div className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line">
                            {aiExpl}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
                    <button
                      onClick={() => toggleSolution(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>उत्तर छिपाएं</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>उत्तर और हल देखें</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAskAIExplanation(item)}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-50 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAiLoading ? 'AI समझा रहा है...' : 'AI से और सरल व्याख्या पूछें'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
