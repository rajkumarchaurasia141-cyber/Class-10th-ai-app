import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Search,
  BookOpen,
  Copy,
  Check,
  GraduationCap,
  Layers,
  Zap,
} from 'lucide-react';
import { SubjectId, ChapterTrickItem } from '../types';
import { NCERT_TRICKS } from '../data/ncertTricks';

interface TrickSeSamjhoProps {
  onAskAITeacher: (trickTitle: string, subjectName: string, chapterName: string) => void;
}

export const TrickSeSamjho: React.FC<TrickSeSamjhoProps> = ({ onAskAITeacher }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = [
    { id: 'all', label: 'सभी विषय' },
    { id: 'maths' as SubjectId, label: 'गणित (Maths)' },
    { id: 'science' as SubjectId, label: 'विज्ञान (Science)' },
    { id: 'social_science' as SubjectId, label: 'सामाजिक विज्ञान' },
    { id: 'hindi' as SubjectId, label: 'हिंदी (Hindi)' },
    { id: 'sanskrit' as SubjectId, label: 'संस्कृत (Sanskrit)' },
    { id: 'english' as SubjectId, label: 'अंग्रेज़ी (English)' },
  ];

  const categories = [
    { id: 'all', label: 'सभी ट्रिक्स' },
    { id: 'formula', label: '📐 सूत्र ट्रिक्स' },
    { id: 'reaction', label: '🧪 रासायनिक अभिक्रिया' },
    { id: 'rule', label: '⚖️ नियम व सिद्धांत' },
    { id: 'date_history', label: '📅 इतिहास की तिथियां' },
    { id: 'grammar', label: '📖 व्याकरण शॉर्टकट' },
  ];

  const filteredTricks = NCERT_TRICKS.filter((item) => {
    if (selectedSubject !== 'all' && item.subjectId !== selectedSubject) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.trickTitle.toLowerCase().includes(q) ||
        item.mnemonic.toLowerCase().includes(q) ||
        item.chapterName.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (item: ChapterTrickItem) => {
    const text = `[ट्रिक से समझो - ${item.chapterName}]\n${item.trickTitle}\n\nसूत्र/Mnemonic: "${item.mnemonic}"\n\nव्याख्या:\n${item.explanation}\n\nउदाहरण:\n${item.example}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSubjectName = (subId: SubjectId) => {
    switch (subId) {
      case 'maths':
        return 'गणित';
      case 'science':
        return 'विज्ञान';
      case 'social_science':
        return 'सामाजिक विज्ञान';
      case 'hindi':
        return 'हिंदी';
      case 'sanskrit':
        return 'संस्कृत';
      case 'english':
        return 'अंग्रेज़ी';
      default:
        return 'सामान्य';
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/70 via-stone-900 to-stone-900 border border-purple-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>कठिन टॉपिक को आसान बनाने की देसी तकनीक</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Trick Se Samjho (ट्रिक से समझो)
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              कठिन गणितीय सूत्र, विज्ञान की रासायनिक अभिक्रियाएं, सक्रियता श्रेणी, इतिहास की प्रमुख तारीखें और संस्कृत व्याकरण याद रखने के अचूक शॉर्टकट्स।
            </p>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
              कुल ट्रिक्स
            </span>
            <span className="text-xl font-extrabold text-amber-400">
              {NCERT_TRICKS.length}+
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3.5 shadow-md">
        {/* Subject Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-300">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>विषय चुनें (Subject):</span>
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
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Search */}
        <div className="pt-2 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-700 text-white font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="ट्रिक या सूत्र खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Tricks List */}
      <div className="space-y-4">
        {filteredTricks.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-stone-500" />
            <p className="text-sm font-medium">कोई ट्रिक नहीं मिली।</p>
            <p className="text-xs text-stone-500 mt-1">कृपया खोज शब्द या विषय फ़िल्टर बदलें।</p>
          </div>
        ) : (
          filteredTricks.map((trick) => (
            <div
              key={trick.id}
              className="rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:p-6 space-y-4 shadow-sm hover:border-purple-500/40 transition-all"
            >
              {/* Card Header: Subject, Chapter Name, Category */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                        {getSubjectName(trick.subjectId)}
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        {trick.chapterName}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(trick)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
                >
                  {copiedId === trick.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">कॉपी हुआ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>ट्रिक कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-white">
                {trick.trickTitle}
              </h3>

              {/* Mnemonic / Shortcut Highlight Box */}
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center">
                <span className="text-[11px] font-semibold text-amber-400 block mb-1 uppercase tracking-wider">
                  याद रखने का देसी सूत्र (Mnemonic):
                </span>
                <div className="text-base sm:text-xl font-extrabold text-amber-200">
                  "{trick.mnemonic}"
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2 text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line bg-stone-950 p-4 rounded-xl border border-stone-800">
                <span className="font-bold text-white block">ट्रिक की व्याख्या:</span>
                <p>{trick.explanation}</p>
              </div>

              {/* Example */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/90 text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                <span className="font-bold text-emerald-400 block mb-1">
                  बोर्ड परीक्षा में उपयोग का उदाहरण:
                </span>
                <p>{trick.example}</p>
              </div>

              {/* Card Footer: Ask AI Teacher */}
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() =>
                    onAskAITeacher(
                      `कृपया मुझे "${trick.chapterName}" के इस विषय: "${trick.trickTitle}" को और अधिक ट्रिक्स व उदाहरणों के साथ समझाएं।`,
                      getSubjectName(trick.subjectId),
                      trick.chapterName
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>AI Teacher से और ट्रिक्स पूछें</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
