import React, { useState } from 'react';
import { SubjectId, ChapterTrickItem } from '../types';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { NCERT_TRICKS } from '../data/ncertTricks';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Printer,
  Search,
  BookOpen,
  Atom,
  Calculator,
  Compass,
  Scroll,
} from 'lucide-react';

interface ChapterTricksHubProps {
  selectedSubjectId: SubjectId;
  onSelectSubject?: (subId: SubjectId) => void;
}

export const ChapterTricksHub: React.FC<ChapterTricksHubProps> = ({
  selectedSubjectId,
  onSelectSubject,
}) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter tricks
  const subjectTricks = NCERT_TRICKS.filter((t) => t.subjectId === selectedSubjectId);

  const filteredTricks = subjectTricks.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.trickTitle.toLowerCase().includes(q) ||
        t.mnemonic.toLowerCase().includes(q) ||
        t.chapterName.toLowerCase().includes(q) ||
        t.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (trick: ChapterTrickItem) => {
    const text = `【${trick.trickTitle}】\nअध्याय: ${trick.chapterName}\nट्रिक/स्मरण सूत्र: ${trick.mnemonic}\n\nव्याख्या:\n${trick.explanation}\n\nउदाहरण / प्रयोग:\n${trick.example}`;
    navigator.clipboard.writeText(text);
    setCopiedId(trick.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPdf = () => {
    let contentHtml = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18pt; color: #1c1917; border-bottom: 2px solid #d97706; padding-bottom: 6px;">
          ${currentSubject.hindiName} • NCERT विशेष स्मरण ट्रिक्स बैंक (Pocket Cheatsheet)
        </h2>
        <p style="color: #666; font-size: 11pt;">
          कक्षा 10वीं बिहार बोर्ड (BSEB) • सूत्र, नियम, अभिक्रियाएं एवं कालक्रम याद रखने की आसान ट्रिक्स
        </p>
      </div>
    `;

    filteredTricks.forEach((t, idx) => {
      contentHtml += `
        <div style="margin-bottom: 18px; padding: 14px 18px; border: 1px solid #e7e5e4; border-radius: 8px; background: #fafaf9;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; color: #b45309; font-size: 11pt; margin-bottom: 4px;">
            <span>ट्रिक संख्या ${idx + 1}: ${t.trickTitle}</span>
            <span>(${t.chapterName})</span>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 10px 14px; border-radius: 6px; font-weight: 700; color: #92400e; font-size: 12.5pt; margin: 8px 0;">
            स्मरण सूत्र (Mnemonic): ${t.mnemonic}
          </div>
          <div style="font-size: 11pt; color: #333; margin-bottom: 8px; line-height: 1.6;">
            <strong>व्याख्या:</strong> ${t.explanation}
          </div>
          <div style="background: #ffffff; padding: 10px 12px; border-left: 3px solid #059669; font-size: 10.5pt; white-space: pre-line; line-height: 1.5;">
            <strong>उदाहरण व प्रयोग:</strong><br/>
            ${t.example}
          </div>
        </div>
      `;
    });

    exportToPrintablePdf({
      title: `${currentSubject.hindiName} - स्मरण ट्रिक्स पॉकेट बुक`,
      subtitle: 'NCERT Class 10 Hindi Medium Memory Tricks',
      subject: currentSubject.hindiName,
      badge: 'BSEB 10वीं परीक्षा स्मरण ट्रिक्स',
      contentHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  NCERT अध्यायवार स्मरण ट्रिक्स (Memory Tricks & Shortcuts)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  शॉर्टकट बैंक
                </span>
              </div>
              <p className="text-sm text-stone-300 mt-1">
                जटिल सूत्रों, रासायनिक अभिक्रियाओं, इतिहास की महत्वपूर्ण तिथियों और व्याकरण नियमों को चुटकियों में याद रखने की सरल देशी ट्रिक्स।
              </p>
            </div>
          </div>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>ट्रिक्स PDF डाउनलोड करें</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/80 border border-stone-800 rounded-xl p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            सभी ट्रिक्स ({subjectTricks.length})
          </button>
          <button
            onClick={() => setSelectedCategory('formula')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'formula'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            सूत्र व मान सारणी
          </button>
          <button
            onClick={() => setSelectedCategory('reaction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'reaction'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            सक्रियता व अभिक्रियाएं
          </button>
          <button
            onClick={() => setSelectedCategory('rule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'rule'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            वैज्ञानिक व गणितीय नियम
          </button>
          <button
            onClick={() => setSelectedCategory('date_history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'date_history'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            आंदोलन व इतिहास
          </button>
          <button
            onClick={() => setSelectedCategory('grammar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'grammar'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            व्याकरण ट्रिक
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ट्रिक या अध्याय खोजें..."
            className="w-full sm:w-60 pl-9 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tricks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTricks.map((trick) => (
          <div
            key={trick.id}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700 font-medium">
                  {trick.chapterName}
                </span>
                <button
                  onClick={() => handleCopy(trick)}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                  title="ट्रिक कॉपी करें"
                >
                  {copiedId === trick.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {trick.trickTitle}
              </h3>

              {/* Mnemonic Highlight Box */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm mb-3">
                <span className="text-xs uppercase tracking-wider text-amber-400 block mb-0.5 font-extrabold">
                  याद रखने का जादुई सूत्र (Mnemonic):
                </span>
                {trick.mnemonic}
              </div>

              {/* Explanation */}
              <p className="text-xs text-stone-300 leading-relaxed mb-3">
                {trick.explanation}
              </p>

              {/* Example */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-xs text-stone-200 whitespace-pre-line leading-relaxed font-mono">
                <span className="text-emerald-400 font-bold block mb-1 font-sans">
                  उदाहरण एवं प्रयोग:
                </span>
                {trick.example}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
