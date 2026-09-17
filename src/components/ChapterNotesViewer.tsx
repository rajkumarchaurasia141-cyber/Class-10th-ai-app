import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { SubjectId, Chapter } from '../types';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { cleanAsterisksAndFormat, notesToHtmlForPdf } from '../utils/notesFormatter';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  BookMarked,
  Sparkles,
  Copy,
  Check,
  Printer,
  Download,
  BookOpen,
  HelpCircle,
  FileCheck,
  FileText,
} from 'lucide-react';

interface ChapterNotesViewerProps {
  selectedSubjectId: SubjectId;
  selectedChapter: Chapter | null;
  onSelectChapter: (ch: Chapter | null) => void;
  onNavigateToSolutions?: (chapterName: string) => void;
  onNavigateToTest?: (chapterName: string) => void;
  onNavigateToTricks?: () => void;
}

export const ChapterNotesViewer: React.FC<ChapterNotesViewerProps> = ({
  selectedSubjectId,
  selectedChapter,
  onSelectChapter,
  onNavigateToSolutions,
  onNavigateToTest,
  onNavigateToTricks,
}) => {
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];
  const [notesContent, setNotesContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const handleGenerateNotes = async (chapterToGenerate?: Chapter) => {
    const chapter = chapterToGenerate || selectedChapter;
    if (!chapter) return;

    setLoading(true);
    try {
      const response = await fetch('/api/gemini/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.hindiName,
          chapter: chapter.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'नोट्स लोड करने में समस्या आई।');
      }

      // Sanitize any stray asterisks and ensure professional question numbering
      const cleanNotes = cleanAsterisksAndFormat(data.notes || '');
      setNotesContent(cleanNotes);
    } catch (err: any) {
      setNotesContent(
        `# ⚠️ नोट्स तैयार करने में क्षणिक बाधा आई\n\n${err.message || 'कृपया कुछ क्षण बाद पुनः प्रयास करें।'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notesContent) return;
    const cleaned = cleanAsterisksAndFormat(notesContent);
    navigator.clipboard.writeText(cleaned);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (!notesContent || !selectedChapter) return;
    const contentHtml = notesToHtmlForPdf(notesContent);
    exportToPrintablePdf({
      title: `${selectedChapter.name} - विस्तृत परीक्षा नोट्स`,
      subtitle: `${currentSubject.hindiName} • 100% शुद्ध हिंदी माध्यम • BSEB 10th Board`,
      subject: currentSubject.hindiName,
      badge: 'बिहार विद्यालय परीक्षा समिति (BSEB) पटना • कक्षा 10वीं',
      contentHtml,
    });
  };

  const sanitizedDisplayNotes = notesContent ? cleanAsterisksAndFormat(notesContent) : null;

  return (
    <div className="space-y-4">
      {/* Chapter Selection Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-400" />
            <span>NCERT अध्यायवार संपूर्ण परीक्षा नोट्स व ट्रिक्स</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            NCERT हिंदी माध्यम • 1. परिचय • 2. मुख्य तथ्य • 3. सूत्र व समीकरण • 4. विशेष स्मरण ट्रिक्स • 5. VVI प्रश्न • 6. अभ्यास प्रश्न हल
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="chapter-notes-dropdown"
            value={selectedChapter?.id || ''}
            onChange={(e) => {
              const ch = currentSubject.chapters.find((c) => c.id === e.target.value) || null;
              onSelectChapter(ch);
              if (ch) handleGenerateNotes(ch);
            }}
            className="bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">-- अध्याय चुनें --</option>
            {currentSubject.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>

          <button
            id="generate-notes-btn"
            onClick={() => handleGenerateNotes()}
            disabled={!selectedChapter || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'तैयार हो रहा है...' : 'नोट्स तैयार करें'}</span>
          </button>
        </div>
      </div>

      {/* Main Notes Content Area */}
      {loading ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {selectedChapter?.name} के व्यापक नोट्स तैयार किए जा रहे हैं...
            </h3>
            <p className="text-xs text-stone-400 max-w-md mt-1">
              BSEB बोर्ड परीक्षा के 4-भाग प्रारूप (परिचय, परिभाषाएं, सूत्र/प्रमेय, और VVI प्रश्न) के अनुसार संकलन हो रहा है।
            </p>
          </div>
        </div>
      ) : notesContent ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Notes Top Action Bar */}
          <div className="bg-stone-850 px-4 sm:px-6 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentSubject.hindiName}
              </span>
              <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {selectedChapter?.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1 text-xs rounded bg-stone-800 text-stone-300 hover:text-white border border-stone-700"
                title="फॉन्ट साइज बदलें"
              >
                {fontSize === 'normal' ? 'फॉन्ट A+' : 'फॉन्ट A-'}
              </button>
              <button
                id="copy-notes-btn"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
              </button>
              <button
                id="export-pdf-notes-btn"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 border border-amber-400 shadow-sm transition-all"
                title="BSEB मानक PDF फाइल डाउनलोड या प्रिंट करें"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF डाउनलोड / प्रिंट</span>
              </button>
            </div>
          </div>

          {/* Rendered Notes (Zero Star Symbols & Clear Question Numbers) */}
          <div
            className={`p-6 sm:p-8 ${
              fontSize === 'large' ? 'text-lg leading-relaxed' : 'text-base leading-normal'
            }`}
          >
            <div className="prose prose-invert max-w-none prose-h1:text-2xl prose-h1:text-amber-400 prose-h1:border-b prose-h1:border-stone-800 prose-h1:pb-2 prose-h2:text-xl prose-h2:text-amber-300 prose-h2:mt-6 prose-h3:text-lg prose-h3:text-amber-200 prose-p:text-stone-200 prose-p:my-2.5 prose-li:text-stone-200 prose-strong:text-amber-200 prose-strong:font-bold prose-hr:border-stone-700 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-800/40 prose-blockquote:py-1.5">
              <Markdown>{sanitizedDisplayNotes || ''}</Markdown>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-8 pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {onNavigateToSolutions && selectedChapter && (
                <button
                  onClick={() => onNavigateToSolutions(selectedChapter.name)}
                  className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center justify-between">
                    <span>100% सही NCERT हल</span>
                    <span>→</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    इस अध्याय के पाठगत व अभ्यास प्रश्नों के चरणबद्ध उत्तर देखें।
                  </p>
                </button>
              )}

              {onNavigateToTest && selectedChapter && (
                <button
                  onClick={() => onNavigateToTest(selectedChapter.name)}
                  className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                    <span>अध्याय टेस्ट दें</span>
                    <span>→</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    इस अध्याय का 15 या 25 मिनट का ऑनलाइन टेस्ट दें और स्कोर जानें।
                  </p>
                </button>
              )}

              {onNavigateToTricks && (
                <button
                  onClick={onNavigateToTricks}
                  className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-sky-400 group-hover:text-sky-300 flex items-center justify-between">
                    <span>स्मरण ट्रिक्स बैंक</span>
                    <span>→</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    सूत्रों व अभिक्रियाओं को याद रखने की आसान देशी ट्रिक्स देखें।
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Chapter Quick Directory */
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">
              {currentSubject.hindiName} के किस अध्याय के नोट्स चाहिए?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              नीचे दी गई सूची में से किसी भी अध्याय पर क्लिक करें, AI शिक्षक तुरंत 4-भाग में विस्तृत नोट्स तैयार कर देंगे।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSubject.chapters.map((ch) => (
              <button
                key={ch.id}
                id={`chapter-card-${ch.id}`}
                onClick={() => {
                  onSelectChapter(ch);
                  handleGenerateNotes(ch);
                }}
                className="group p-3.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-amber-400/80 font-medium">
                    {ch.subCategory || currentSubject.hindiName}
                  </div>
                  <div className="font-semibold text-sm text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {ch.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
