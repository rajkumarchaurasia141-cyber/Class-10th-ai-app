import React, { useState } from 'react';
import { 
  Crown, 
  FileText, 
  BookOpen, 
  Lock, 
  Download, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Search, 
  BookText,
  ShieldCheck,
  Zap,
  Star,
  GraduationCap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaidPdfNote } from '../types';
import { PdfViewerModal } from './PdfViewerModal';

interface MyCoursesViewProps {
  onSelectSubject: (subjectId: string) => void;
  onOpenVip: () => void;
}

export function MyCoursesView({ onSelectSubject, onOpenVip }: MyCoursesViewProps) {
  const { subjects, paidNotes, loading } = useData();
  const { isVIP, vipDetails } = useAuth();
  
  const [activeCourseTab, setActiveCourseTab] = useState<'notes' | 'subjects'>('notes');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePdfNote, setActivePdfNote] = useState<PaidPdfNote | null>(null);

  const subList = Object.values(subjects);

  // Filter paid notes
  const filteredNotes = paidNotes.filter((note) => {
    const matchesSubject = selectedSubjectFilter === 'all' || note.subjectId === selectedSubjectFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      note.title.toLowerCase().includes(query) ||
      note.subjectName.toLowerCase().includes(query) ||
      (note.chapterName && note.chapterName.toLowerCase().includes(query));
    return matchesSubject && matchesQuery;
  });

  const handleOpenPdf = (note: PaidPdfNote) => {
    // If student has VIP or note is the free preview sample (e.g. sanskrit ch1)
    if (isVIP || note.id === 'sanskrit-ch1-mangalam-pdf' || !note.isPaid) {
      setActivePdfNote(note);
    } else {
      onOpenVip();
    }
  };

  const handleDirectDownload = (note: PaidPdfNote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVIP && note.id !== 'sanskrit-ch1-mangalam-pdf') {
      onOpenVip();
      return;
    }

    if (note.pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.download = `${note.subjectName}_${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(note.pdfUrl, '_blank');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Topper Batch फुल सिलेबस Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-stone-900 rounded-3xl p-5 text-white shadow-lg border border-red-500/30">
        {/* Background glow effects */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-red-500/20 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              BSEB 10TH SPECIAL BATCH
            </span>

            {isVIP ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                VIP बैच सक्रिय
              </span>
            ) : (
              <button
                onClick={onOpenVip}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow transition-all active:scale-95 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                बैच जॉइन करें
              </button>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-300" />
              टॉपर बैच (Topper Batch फुल सिलेबस)
            </h2>
            <p className="text-xs text-stone-200 mt-1">
              कक्षा 10वीं बिहार विद्यालय परीक्षा समिति (BSEB) फुल सिलेबस के लिए सम्पूर्ण डिजिटल कोर्स, हस्तलिखित पेड नोट्स व टेस्ट सीरीज़।
            </p>
          </div>

          {/* Batch Features Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">6 विषय</span>
              <span className="text-[10px] text-stone-300">सम्पूर्ण पाठ्यक्रम</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">PDF नोट्स</span>
              <span className="text-[10px] text-stone-300">हस्तलिखित व VVI</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">50 MCQs</span>
              <span className="text-[10px] text-stone-300">प्रति अध्याय टेस्ट</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Sub-Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveCourseTab('notes')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeCourseTab === 'notes'
              ? 'bg-white text-red-700 shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>🌟 पेड नोट्स (Paid PDF Notes)</span>
          <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {paidNotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCourseTab('subjects')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeCourseTab === 'subjects'
              ? 'bg-white text-red-700 shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>अध्याय & टेस्ट (Chapters & Test)</span>
        </button>
      </div>

      {/* View Content based on Selected Tab */}
      {activeCourseTab === 'notes' ? (
        <div className="space-y-3.5">
          {/* VIP Access Banner if Not VIP */}
          {!isVIP && (
            <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                    पेड नोट्स लॉक्ड हैं (Paid PDF Notes Locked)
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    टॉपर बैच जॉइन करें और सभी 6 विषयों के सम्पूर्ण PDF नोट्स तुरंत अनलॉक करें।
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenVip}
                className="bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow active:scale-95 transition-all cursor-pointer"
              >
                अनलॉक करें
              </button>
            </div>
          )}

          {/* Search & Subject Filter Chips */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="पीडीएफ नोट्स या अध्याय खोजें..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-600 shadow-2xs"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                सभी विषय ({paidNotes.length})
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('sanskrit')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'sanskrit'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                संस्कृत
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('science')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'science'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                विज्ञान
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('math')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'math'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                गणित
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('hindi')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'hindi'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('social_science')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'social_science'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                सामाजिक विज्ञान
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('english')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'english'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
                }`}
              >
                अंग्रेजी
              </button>
            </div>
          </div>

          {/* Paid PDF Notes Cards List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-stone-500 text-xs">
                कोई PDF नोट नहीं मिला। कृपया दूसरा विषय चुनें या एडमिन पैनल से नए नोट्स जोड़ें।
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isUnlocked = isVIP || note.id === 'sanskrit-ch1-mangalam-pdf' || !note.isPaid;

                return (
                  <div
                    key={note.id}
                    onClick={() => handleOpenPdf(note)}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group relative overflow-hidden"
                  >
                    {/* Free Sample Badge */}
                    {!isVIP && note.id === 'sanskrit-ch1-mangalam-pdf' && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg">
                        फ्री सैंपल
                      </span>
                    )}

                    <div className="flex items-start gap-3 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 overflow-hidden flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-red-100">
                            {note.subjectName}
                          </span>
                          {note.chapterNo && (
                            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
                              अध्याय {note.chapterNo}
                            </span>
                          )}
                          <span className="text-[11px] text-stone-400">
                            {note.totalPages || 12} पृष्ठ • {note.fileSize || '2.5 MB'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-red-700 transition-colors leading-snug">
                          {note.title}
                        </h4>

                        {note.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">
                            {note.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions and Status Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isUnlocked ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleDirectDownload(note, e)}
                            className="bg-slate-100 hover:bg-red-50 text-stone-600 hover:text-red-700 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="PDF डाउनलोड करें"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <span className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            <span>PDF पढ़ें</span>
                          </span>
                        </>
                      ) : (
                        <span className="bg-amber-500/15 border border-amber-500/30 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>अनलॉक करें</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Subjects & Chapters Tab */
        <div className="space-y-2.5">
          <div className="bg-slate-100 rounded-2xl p-3 text-xs text-stone-600">
            प्रत्येक विषय में अध्याय-वार सम्पूर्ण पाठ, व्याख्या, टॉपर टिप्स और 50 वस्तुनिष्ठ (MCQ) ऑनलाइन टेस्ट दिए गए हैं।
          </div>

          {subList.map((sub: any) => (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-100 group-hover:scale-105 transition-transform shrink-0">
                  <BookText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-red-700 transition-colors">
                    {sub.subject_name_hindi || sub.subject_name || sub.id}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {sub.chapters?.length || 0} सम्पूर्ण अध्याय • नोट्स, टिप्स & 50 MCQs
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-50 text-stone-400 group-hover:text-red-700 flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activePdfNote && (
        <PdfViewerModal
          note={activePdfNote}
          onClose={() => setActivePdfNote(null)}
        />
      )}
    </div>
  );
}
