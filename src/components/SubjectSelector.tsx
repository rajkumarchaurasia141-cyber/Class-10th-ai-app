import React from 'react';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import { SubjectId, Chapter } from '../types';
import {
  Calculator,
  FlaskConical,
  Globe,
  BookOpen,
  Scroll,
  Languages,
  BookMarked,
} from 'lucide-react';

interface SubjectSelectorProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  selectedChapterId?: string;
  onSelectChapter?: (chapter: Chapter | null) => void;
  showChapterDropdown?: boolean;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubjectId,
  onSelectSubject,
  selectedChapterId,
  onSelectChapter,
  showChapterDropdown = true,
}) => {
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-5 h-5" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Scroll':
        return <Scroll className="w-5 h-5" />;
      case 'Languages':
        return <Languages className="w-5 h-5" />;
      default:
        return <BookMarked className="w-5 h-5" />;
    }
  };

  const activeSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 sm:p-4 mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          विषय चुनें (BSEB 10वीं पाठ्यक्रम)
        </span>
        {activeSubject && (
          <span className="text-xs text-amber-400 font-medium">
            {activeSubject.tagline}
          </span>
        )}
      </div>

      {/* Subject Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BSEB_SUBJECTS.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              id={`subject-select-btn-${sub.id}`}
              onClick={() => {
                onSelectSubject(sub.id);
                if (onSelectChapter) {
                  onSelectChapter(null);
                }
              }}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all border ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                  : 'bg-stone-850/80 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-stone-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-md ${
                  isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {getSubjectIcon(sub.iconName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{sub.hindiName}</div>
                <div className="text-[11px] text-stone-500 truncate">{sub.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chapter Dropdown if enabled */}
      {showChapterDropdown && activeSubject && onSelectChapter && (
        <div className="mt-3 pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="chapter-select-dropdown" className="text-xs font-medium text-stone-400 whitespace-nowrap">
            अध्याय चुनें:
          </label>
          <select
            id="chapter-select-dropdown"
            value={selectedChapterId || ''}
            onChange={(e) => {
              const chId = e.target.value;
              const found = activeSubject.chapters.find((c) => c.id === chId) || null;
              onSelectChapter(found);
            }}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="">-- सभी अध्याय / पूरा विषय --</option>
            {activeSubject.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.subCategory ? `[${ch.subCategory}] ` : ''}
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
