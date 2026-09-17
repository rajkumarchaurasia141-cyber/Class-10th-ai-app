import React, { useState } from 'react';
import {
  History,
  Calendar,
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  GraduationCap,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { SubjectId, ActiveMainTab } from '../types';
import { BSEB_PYQ_DATA, PYQItem } from '../data/bsebPYQ';

interface Pichhle10SaalPYQProps {
  onAskAITeacher: (questionText: string, subjectName: string, chapterName: string) => void;
}

export const Pichhle10SaalPYQ: React.FC<Pichhle10SaalPYQProps> = ({ onAskAITeacher }) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'short' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const years: (number | 'all')[] = [
    'all',
    2026,
    2025,
    2024,
    2023,
    2022,
    2021,
    2020,
    2019,
    2018,
    2017,
    2016,
  ];

  const subjects = [
    { id: 'all', label: 'सभी विषय' },
    { id: 'maths' as SubjectId, label: 'गणित (Maths)' },
    { id: 'science' as SubjectId, label: 'विज्ञान (Science)' },
    { id: 'social_science' as SubjectId, label: 'सामाजिक विज्ञान' },
    { id: 'hindi' as SubjectId, label: 'हिंदी (Hindi)' },
    { id: 'sanskrit' as SubjectId, label: 'संस्कृत (Sanskrit)' },
    { id: 'english' as SubjectId, label: 'अंग्रेज़ी (English)' },
  ];

  // Filtering
  const filteredPYQs = BSEB_PYQ_DATA.filter((item) => {
    if (selectedYear !== 'all' && item.year !== selectedYear) return false;
    if (selectedSubject !== 'all' && item.subjectId !== selectedSubject) return false;
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

  const handleCopySolution = (item: PYQItem) => {
    const text = `[BSEB ${item.year} - ${item.subjectName}]\nअध्याय: ${item.chapter}\n${item.questionNumber}: ${item.question}\n\nहल:\n${item.solution}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/70 via-stone-900 to-stone-900 border border-blue-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>विगत 10 वर्ष के ऑफिशियल बोर्ड पेपर्स</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pichhle 10 Saal Ke Papers (2016-2026)
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              बिहार विद्यालय परीक्षा समिति (BSEB) कक्षा 10वीं के वास्तविक प्रश्न-पत्र, प्रत्येक प्रश्न के साथ उसका अध्याय नाम और 100% सही व विस्तृत हिंदी हल।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-900/90 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                कुल उपलब्ध प्रश्न
              </span>
              <span className="text-xl font-extrabold text-amber-400">
                {BSEB_PYQ_DATA.length}+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3.5 shadow-md">
        {/* Year Filter Slider */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>वर्ष चुनें (Year-wise Filter):</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {years.map((yr) => {
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {yr === 'all' ? 'सभी वर्ष (2016-2026)' : `वर्ष ${yr}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter Bar */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-300">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>विषय चुनें (Subject-wise Filter):</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id as SubjectId | 'all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Filter & Search Bar */}
        <div className="pt-2 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-medium text-stone-400 shrink-0">प्रारूप:</span>
            {[
              { id: 'all', label: 'सभी' },
              { id: 'mcq', label: '1 अंक (MCQ)' },
              { id: 'short', label: '2-3 अंक (लघु)' },
              { id: 'long', label: '5 अंक (दीर्घ)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-stone-700 text-white font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="प्रश्न या अध्याय खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* PYQ List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-400 px-1">
          <span>
            दिखाए जा रहे प्रश्न: <strong className="text-stone-200">{filteredPYQs.length}</strong>
          </span>
          <span>BSEB Official Class 10 Pattern</span>
        </div>

        {filteredPYQs.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-stone-500" />
            <p className="text-sm font-medium">चुने गए फ़िल्टर के लिए कोई प्रश्न नहीं मिला।</p>
            <p className="text-xs text-stone-500 mt-1">कृपया वर्ष या विषय फ़िल्टर बदलकर देखें।</p>
          </div>
        ) : (
          filteredPYQs.map((item) => {
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6 space-y-4 shadow-sm hover:border-stone-700 transition-all"
              >
                {/* Header badges: Year, Subject, Chapter Name, Question Type */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      BSEB {item.year} Annual Exam
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                      {item.subjectName}
                    </span>
                    {/* Chapter Name Mentioned as mandated */}
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      अध्याय: {item.chapter}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                      {item.questionNumber} • {item.marks} अंक
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {item.question}
                  </h3>

                  {/* If MCQ type, show options */}
                  {item.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {item.options.map((opt, idx) => {
                        const isCorrect = idx === item.correctIndex;
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-bold'
                                : 'bg-stone-950 border-stone-800 text-stone-400'
                            }`}
                          >
                            <span>
                              {['(A)', '(B)', '(C)', '(D)'][idx]} {opt}
                            </span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Detailed Solution in Pure Hindi */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80 text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line select-text">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      विस्तृत बिहार बोर्ड मॉडल समाधान (Solution):
                    </span>
                    <button
                      onClick={() => handleCopySolution(item)}
                      className="text-stone-400 hover:text-amber-400 transition-colors p-1"
                      title="हल कॉपी करें"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {item.solution}
                </div>

                {/* Exam Tips if available */}
                {item.examTips && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Award className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>बोर्ड परीक्षा टिप:</strong> {item.examTips}
                    </span>
                  </div>
                )}

                {/* Card Footer: Ask AI Teacher */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => onAskAITeacher(item.question, item.subjectName, item.chapter)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>AI Teacher से इस प्रश्न को और समझें</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
