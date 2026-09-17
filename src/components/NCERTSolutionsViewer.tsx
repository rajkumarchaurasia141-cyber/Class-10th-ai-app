import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { SubjectId, Chapter } from '../types';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { NCERT_SOLUTIONS } from '../data/ncertSolutions';
import { cleanAsterisksAndFormat, notesToHtmlForPdf } from '../utils/notesFormatter';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  BookCheck,
  Sparkles,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  Award,
  ChevronDown,
  Layers,
  Search,
} from 'lucide-react';

interface NCERTSolutionsViewerProps {
  selectedSubjectId: SubjectId;
  onSelectSubject?: (subId: SubjectId) => void;
  onNavigateToTest?: (chapterName: string) => void;
}

export const NCERTSolutionsViewer: React.FC<NCERTSolutionsViewerProps> = ({
  selectedSubjectId,
  onNavigateToTest,
}) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(currentSubject.chapters[0]);
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'in_text' | 'vvi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSolutions, setAiSolutions] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If the user switches subject, update the default chapter
  React.useEffect(() => {
    setSelectedChapter(currentSubject.chapters[0]);
    setAiSolutions(null);
  }, [selectedSubjectId]);

  // Filter static pre-seeded solutions
  const chapterPreSeeded = NCERT_SOLUTIONS.filter(
    (item) => item.subjectId === selectedSubjectId && item.chapterId === selectedChapter.id
  );

  const filteredPreSeeded = chapterPreSeeded.filter((item) => {
    if (filterType === 'exercise' && item.questionType !== 'exercise') return false;
    if (filterType === 'in_text' && item.questionType !== 'in_text') return false;
    if (filterType === 'vvi' && item.examImportance !== 'अति-महत्वपूर्ण (VVI)') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.correctAnswer.toLowerCase().includes(q) ||
        (item.keyFormula && item.keyFormula.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFetchAiSolutions = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/gemini/ncert-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.hindiName,
          chapter: selectedChapter.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'समाधान लोड करने में समस्या आई।');
      }

      const cleanText = cleanAsterisksAndFormat(data.solutions || '');
      setAiSolutions(cleanText);
    } catch (err: any) {
      setAiSolutions(
        `# ⚠️ NCERT समाधान लोड करने में समस्या आई\n\n${err.message || 'कृपया थोड़ी देर बाद पुनः प्रयास करें।'}`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPdf = () => {
    let htmlContent = '';

    if (aiSolutions) {
      htmlContent = notesToHtmlForPdf(aiSolutions);
    } else if (filteredPreSeeded.length > 0) {
      htmlContent = `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18pt; color: #1c1917; border-bottom: 2px solid #d97706; padding-bottom: 6px;">
            ${selectedChapter.name} • NCERT पाठ्यपुस्तक 100% सही हल
          </h2>
          <p style="color: #666; font-size: 11pt;">बिहार विद्यालय परीक्षा समिति (BSEB) कक्षा 10वीं • शुद्ध हिंदी माध्यम</p>
        </div>
      `;

      filteredPreSeeded.forEach((item, idx) => {
        htmlContent += `
          <div style="margin-bottom: 24px; padding: 14px 18px; border: 1px solid #e7e5e4; border-radius: 8px; background-color: #fafaf9;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #b45309;">
              <span>${item.questionNumber} (${item.questionTypeLabel})</span>
              <span>[${item.examImportance || 'महत्वपूर्ण'}]</span>
            </div>
            <div style="font-weight: 700; font-size: 13pt; margin-bottom: 10px; color: #1c1917;">
              प्रश्न: ${item.question}
            </div>
            <div style="background: #ffffff; padding: 12px; border-left: 3px solid #d97706; white-space: pre-line; line-height: 1.6;">
              <strong>सही उत्तर / हल:</strong><br/>
              ${item.correctAnswer}
            </div>
            ${
              item.keyFormula
                ? `<div style="margin-top: 8px; font-size: 11pt; color: #047857;"><strong>मुख्य सूत्र:</strong> ${item.keyFormula}</div>`
                : ''
            }
          </div>
        `;
      });
    } else {
      alert('डाउनलोड करने के लिए पहले समाधान लोड करें।');
      return;
    }

    exportToPrintablePdf({
      title: `${selectedChapter.name} - NCERT 100% सही समाधान`,
      subtitle: `${currentSubject.hindiName} • NCERT Book Hindi Medium • BSEB 10th Board`,
      subject: currentSubject.hindiName,
      badge: 'NCERT पाठ्यपुस्तक संपूर्ण हल • शत-प्रतिशत प्रामाणिक',
      contentHtml: htmlContent,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BookCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  NCERT पाठ्यपुस्तक शत-प्रतिशत सही प्रश्न-उत्तर
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  100% Verified
                </span>
              </div>
              <p className="text-sm text-stone-300 mt-1">
                कक्षा 10वीं NCERT हिंदी माध्यम की पुस्तक के पाठगत प्रश्न (In-text) तथा अध्याय के अंत के अभ्यास प्रश्नों के सटीक, चरणबद्ध व प्रामाणिक उत्तर।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-sm font-medium transition-colors"
              title="PDF डाउनलोड या प्रिंट करें"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>PDF डाउनलोड करें</span>
            </button>
          </div>
        </div>

        {/* Chapter Selection Bar */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              अध्याय चुनें ({currentSubject.hindiName}):
            </label>
            <div className="relative">
              <select
                value={selectedChapter.id}
                onChange={(e) => {
                  const ch = currentSubject.chapters.find((c) => c.id === e.target.value);
                  if (ch) {
                    setSelectedChapter(ch);
                    setAiSolutions(null);
                  }
                }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-amber-500 appearance-none pr-10"
              >
                {currentSubject.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} {ch.subCategory ? `(${ch.subCategory})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleFetchAiSolutions}
              disabled={loadingAi}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingAi ? 'समाधान तैयार हो रहा है...' : 'संपूर्ण NCERT हल AI द्वारा प्राप्त करें'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/70 border border-stone-800 rounded-xl p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            सभी प्रश्न ({chapterPreSeeded.length})
          </button>
          <button
            onClick={() => setFilterType('exercise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'exercise'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            अभ्यास प्रश्न (Exercise)
          </button>
          <button
            onClick={() => setFilterType('in_text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'in_text'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            पाठगत प्रश्न (In-Text)
          </button>
          <button
            onClick={() => setFilterType('vvi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'vvi'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            अति-महत्वपूर्ण (VVI)
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="प्रश्न या सूत्र खोजें..."
            className="w-full sm:w-60 pl-9 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* AI Live Solutions Display (if generated) */}
      {aiSolutions && (
        <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sparkles className="w-5 h-5" />
              <span>AI द्वारा तैयार संपूर्ण NCERT प्रश्न-उत्तर: {selectedChapter.name}</span>
            </div>
            <button
              onClick={() => handleCopy(aiSolutions, 'ai-sol')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 border border-stone-700"
            >
              {copiedId === 'ai-sol' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'ai-sol' ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-stone-200 text-sm leading-relaxed whitespace-pre-line">
            <Markdown>{aiSolutions}</Markdown>
          </div>
        </div>
      )}

      {/* Pre-seeded Verified Solutions Cards */}
      <div className="space-y-4">
        {filteredPreSeeded.length > 0 ? (
          filteredPreSeeded.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                    {item.questionNumber}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 font-medium">
                    {item.questionTypeLabel}
                  </span>
                  {item.examImportance && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {item.examImportance}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(`${item.question}\n\nउत्तर:\n${item.correctAnswer}`, item.id)}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                  title="उत्तर कॉपी करें"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Question */}
              <h3 className="text-base font-bold text-white mb-3 leading-snug">
                प्रश्न: {item.question}
              </h3>

              {/* Steps (if available) */}
              {item.steps && item.steps.length > 0 && (
                <div className="mb-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>चरणबद्ध हल (Step-by-Step Working):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-stone-300 list-disc list-inside">
                    {item.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Answer Box */}
              <div className="p-4 rounded-xl bg-stone-950 border-l-4 border-amber-500 text-stone-200 text-sm leading-relaxed whitespace-pre-line font-normal">
                <span className="font-bold text-amber-400 block mb-1">100% सही उत्तर:</span>
                {item.correctAnswer}
              </div>

              {/* Key Formula Footer */}
              {item.keyFormula && (
                <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>मुख्य सूत्र / नियम: {item.keyFormula}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : !aiSolutions ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-stone-900 border border-stone-800">
            <BookCheck className="w-12 h-12 text-amber-500/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">इस अध्याय के सत्यापित प्रश्न-उत्तर लोड करें</h3>
            <p className="text-sm text-stone-400 max-w-md mx-auto mt-1 mb-5">
              NCERT पाठ्यपुस्तक के सभी पाठगत एवं अभ्यास प्रश्नों का शत-प्रतिशत प्रामाणिक हल देखने के लिए नीचे दिए बटन पर क्लिक करें।
            </p>
            <button
              onClick={handleFetchAiSolutions}
              disabled={loadingAi}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingAi ? 'तैयार हो रहा है...' : 'अभी NCERT हल लोड करें'}</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Quick Link to Chapter Test */}
      {onNavigateToTest && (
        <div className="bg-gradient-to-r from-amber-500/10 via-stone-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Award className="w-7 h-7 text-amber-400 shrink-0 hidden sm:block" />
            <div>
              <h4 className="text-sm font-bold text-white">इस अध्याय की तैयारी की परीक्षा लें?</h4>
              <p className="text-xs text-stone-400">अध्यायवार टेस्ट सेक्शन में 20 या 30 प्रश्नों का ऑनलाइन टेस्ट दें और अपना स्कोर जानें।</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTest(selectedChapter.name)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold whitespace-nowrap transition-colors"
          >
            अध्यायवार टेस्ट दें →
          </button>
        </div>
      )}
    </div>
  );
};
