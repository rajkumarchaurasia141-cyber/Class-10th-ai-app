import React, { useState } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Search, 
  Lock,
  GraduationCap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PaidTestModal, GenericTestQuestion } from './PaidTestModal';
import { PAID_TEST_50_QUESTIONS } from '../data/paidTestQuestions';

interface PaidTestHubModalProps {
  onClose: () => void;
  onOpenVip?: () => void;
  isVIP?: boolean;
}

interface SubjectTab {
  id: string;
  name: string;
  nameHindi: string;
  badge?: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

const SUBJECT_TABS: SubjectTab[] = [
  {
    id: 'sanskrit',
    name: 'Sanskrit',
    nameHindi: 'संस्कृत (पीयूषम्)',
    badge: 'सभी 14 अध्याय लाइव (700 MCQ)',
    color: 'text-amber-800',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-300'
  },
  {
    id: 'hindi',
    name: 'Hindi',
    nameHindi: 'हिन्दी (गोधूलि)',
    badge: 'अध्याय 1 लाइव (50 MCQ)',
    color: 'text-rose-800',
    bgLight: 'bg-rose-500/10',
    borderColor: 'border-rose-300'
  },
  {
    id: 'math',
    name: 'Mathematics',
    nameHindi: 'गणित (Math)',
    badge: 'मॉडल सेट',
    color: 'text-blue-800',
    bgLight: 'bg-blue-500/10',
    borderColor: 'border-blue-300'
  },
  {
    id: 'science',
    name: 'Science',
    nameHindi: 'विज्ञान (Science)',
    badge: 'मॉडल सेट',
    color: 'text-emerald-800',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-300'
  },
  {
    id: 'history',
    name: 'History',
    nameHindi: 'इतिहास (इतिहास की दुनिया)',
    badge: 'सभी 8 अध्याय लाइव (400 MCQ)',
    color: 'text-amber-900',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-400'
  },
  {
    id: 'political_science',
    name: 'Political Science',
    nameHindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति)',
    badge: 'सभी 5 अध्याय लाइव (250 MCQ)',
    color: 'text-orange-900',
    bgLight: 'bg-orange-500/10',
    borderColor: 'border-orange-400'
  },
  {
    id: 'social',
    name: 'Social Science',
    nameHindi: 'सामाजिक विज्ञान',
    badge: 'मॉडल सेट',
    color: 'text-purple-800',
    bgLight: 'bg-purple-500/10',
    borderColor: 'border-purple-300'
  },
  {
    id: 'english',
    name: 'English',
    nameHindi: 'अंग्रेजी (Panorama)',
    badge: 'मॉडल सेट',
    color: 'text-indigo-800',
    bgLight: 'bg-indigo-500/10',
    borderColor: 'border-indigo-300'
  },
  {
    id: 'full_mock',
    name: 'Full Mock Test',
    nameHindi: '🔥 महा-मॉक टेस्ट (मिश्रित)',
    badge: '50 प्रश्न सम्पूर्ण',
    color: 'text-red-700',
    bgLight: 'bg-red-500/10',
    borderColor: 'border-red-400'
  }
];

export function PaidTestHubModal({ onClose, onOpenVip, isVIP = true }: PaidTestHubModalProps) {
  const { subjects } = useData();
  const [selectedTab, setSelectedTab] = useState<string>('sanskrit');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for active running test inside the hub
  const [activeTest, setActiveTest] = useState<{
    title: string;
    subtitle: string;
    questions: GenericTestQuestion[];
  } | null>(null);

  // If a test is currently launched, render the test modal directly
  if (activeTest) {
    return (
      <PaidTestModal
        onClose={() => setActiveTest(null)}
        onOpenVip={onOpenVip}
        isVIP={isVIP}
        testTitle={activeTest.title}
        testSubtitle={activeTest.subtitle}
        questions={activeTest.questions}
      />
    );
  }

  const currentSubject = subjects[selectedTab] || 
    (selectedTab === 'political_science' ? (subjects['political_science'] || subjects['polscience'] || subjects['civics']) : null) ||
    (selectedTab === 'history' ? subjects['history'] : null);
  const chapters = currentSubject?.chapters || [];

  // Filter chapters if search query is provided
  const filteredChapters = chapters.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      ch.chapter_name?.toLowerCase().includes(query) ||
      ch.chapter_name_hindi?.toLowerCase().includes(query) ||
      ch.chapter_no.toString().includes(query)
    );
  });

  const handleStartChapterTest = (ch: any) => {
    if (!isVIP && onOpenVip) {
      onOpenVip();
      return;
    }

    if (ch.mcq && ch.mcq.length > 0) {
      const formattedQuestions: GenericTestQuestion[] = ch.mcq.map((m: any, idx: number) => ({
        id: m.id || idx + 1,
        subject: currentSubject?.subject_name_hindi || 'विषय',
        chapter: ch.chapter_name_hindi,
        question: m.question,
        options: m.options,
        correct_answer: typeof m.correct_answer === 'number' ? m.correct_answer : (typeof m.correctIndex === 'number' ? m.correctIndex : 0),
        explanation: m.explanation || ''
      }));

      setActiveTest({
        title: `${currentSubject?.subject_name_hindi} • अध्याय ${ch.chapter_no}: ${ch.chapter_name_hindi}`,
        subtitle: `${formattedQuestions.length} वस्तुनिष्ठ प्रश्न • 50 मिनट समय • OMR टेस्ट मोड (BSEB फुल सिलेबस)`,
        questions: formattedQuestions
      });
    } else {
      alert(`अध्याय ${ch.chapter_no} का टेस्ट शीघ्र ही फायरस्टोर द्वारा लाइव किया जा रहा है। कृपया अध्याय 1 का टेस्ट लगाएं!`);
    }
  };

  const handleStartFullMock = () => {
    if (!isVIP && onOpenVip) {
      onOpenVip();
      return;
    }

    setActiveTest({
      title: 'बिहार बोर्ड 10वीं फुल सिलेबस • सम्पूर्ण ऑल-सब्जेक्ट महा-मॉक टेस्ट',
      subtitle: '50 प्रश्न • 50 मिनट • संस्कृत, हिन्दी, गणित, विज्ञान, सामाजिक विज्ञान • OMR मोड',
      questions: PAID_TEST_50_QUESTIONS as unknown as GenericTestQuestion[]
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[95vh] sm:h-[88vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-blue-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-lg border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white tracking-tight">
                  बिहार बोर्ड 10वीं फुल सिलेबस • पेड टेस्ट सीरीज
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  BSEB फुल सिलेबस
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                विषय चुनें और अध्यायवार 50 MCQ महा-मॉक टेस्ट लगाएं (OMR टाइमर मोड)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Highlights Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-[11px] text-stone-600 font-medium shrink-0 scrollbar-none">
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> 50 मिनट टाइमर
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OMR आधारित चेकिंग
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> तुरंत रिजल्ट व रैंक
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> सम्पूर्ण व्याख्या सहित
          </span>
          {!isVIP && (
            <button
              onClick={onOpenVip}
              className="ml-auto flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] shadow-sm shrink-0 cursor-pointer"
            >
              <Lock className="w-3 h-3" /> VIP अनलॉक (₹149)
            </button>
          )}
        </div>

        {/* Subjects Horizontal Bar / Tabs */}
        <div className="bg-white border-b border-slate-200 px-3 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {SUBJECT_TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900 ring-offset-1'
                    : 'bg-slate-100 hover:bg-slate-200 text-stone-700 border border-slate-200'
                }`}
              >
                <span>{tab.nameHindi}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isActive 
                      ? 'bg-amber-400 text-stone-950' 
                      : 'bg-slate-200 text-stone-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* If Full Mock is selected */}
          {selectedTab === 'full_mock' ? (
            <div className="max-w-2xl mx-auto py-4 animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider mb-4 shadow-sm">
                    <Flame className="w-4 h-4 text-red-600" /> ऑल-सब्जेक्ट महा-मॉक टेस्ट (फुल सिलेबस)
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
                    बिहार बोर्ड 10वीं सम्पूर्ण मॉडल टेस्ट सेट-1
                  </h3>
                  
                  <p className="text-blue-200 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl">
                    इस टेस्ट में संस्कृत, हिन्दी, गणित, विज्ञान और सामाजिक विज्ञान के सभी महत्वपूर्ण 50 वस्तुनिष्ठ प्रश्न शामिल हैं। परीक्षा हॉल जैसा 50 मिनट का टाइमर, OMR शीट और हर प्रश्न का व्याख्यात्मक हल।
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                      <p className="text-[10px] text-blue-200 font-medium">कुल प्रश्न</p>
                      <p className="text-lg font-black text-amber-300">50 MCQ</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                      <p className="text-[10px] text-blue-200 font-medium">कुल समय</p>
                      <p className="text-lg font-black text-white">50 मिनट</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                      <p className="text-[10px] text-blue-200 font-medium">पूर्णांक</p>
                      <p className="text-lg font-black text-white">50 अंक</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                      <p className="text-[10px] text-blue-200 font-medium">नेगेटिव मार्किंग</p>
                      <p className="text-lg font-black text-emerald-400">नहीं (0)</p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartFullMock}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>महा-मॉक टेस्ट शुरू करें</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Subject Title & Search Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-700" />
                    <span>{currentSubject?.subject_name_hindi || 'विषय'} • अध्यायवार टेस्ट सूची</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    जिस अध्याय का टेस्ट लगाना चाहते हैं, उस पर क्लिक करें। (कुल {chapters.length} अध्याय)
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="अध्याय खोजें..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Chapters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredChapters.map((ch) => {
                  const hasTest = ch.mcq && ch.mcq.length > 0;
                  const mcqCount = ch.mcq?.length || 0;

                  return (
                    <div
                      key={ch.chapter_no}
                      className={`bg-white rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                        hasTest
                          ? 'border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400'
                          : 'border-slate-200 opacity-90'
                      }`}
                    >
                      <div>
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-stone-700 text-[11px] font-black border border-slate-200">
                            अध्याय {ch.chapter_no}
                          </span>

                          {hasTest ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              {mcqCount} MCQ टेस्ट लाइव
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                              अपकमिंग टेस्ट
                            </span>
                          )}
                        </div>

                        {/* Chapter Title */}
                        <h4 className="font-bold text-stone-900 text-sm mb-1 leading-snug line-clamp-2">
                          {ch.chapter_name_hindi || ch.chapter_name}
                        </h4>

                        {ch.chapter_name && (
                          <p className="text-[11px] text-stone-500 mb-3 font-serif italic">
                            {ch.chapter_name}
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-stone-500 flex items-center gap-2">
                          {hasTest ? (
                            <>
                              <span className="font-bold text-blue-700">{mcqCount} प्रश्न</span>
                              <span>•</span>
                              <span>{Math.max(10, mcqCount)} मिनट</span>
                            </>
                          ) : (
                            <span className="text-stone-400 text-[10px]">
                              फायरस्टोर द्वारा प्रश्न जोड़े जा रहे हैं
                            </span>
                          )}
                        </div>

                        {hasTest ? (
                          <button
                            onClick={() => handleStartChapterTest(ch)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer transition-all shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>टेस्ट दें</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartChapterTest(ch)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-500 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <span>शीघ्र उपलब्ध</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredChapters.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                  <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    खोज परिणाम में कोई अध्याय नहीं मिला। कृपया दूसरा नाम खोजें।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Footer Note */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 shrink-0">
          <p className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              नोट: नए अध्यायों के टेस्ट फायरस्टोर द्वारा नियमित अपडेट किए जाते हैं।
            </span>
          </p>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 font-bold text-xs self-end sm:self-auto cursor-pointer transition-colors"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
}
