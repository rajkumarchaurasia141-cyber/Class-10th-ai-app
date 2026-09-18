import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  BookText, 
  Crown, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  GraduationCap, 
  Award,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { HeroCarouselBanner } from './HeroCarouselBanner';
import { FeatureGrid } from './FeatureGrid';
import { PaywallModal } from './PaywallModal';
import { ClassRoutineModal } from './ClassRoutineModal';
import { NcertBooksModal } from './NcertBooksModal';
import { SocialMediaModal } from './SocialMediaModal';
import { FreeTestModal } from './FreeTestModal';
import { FreeNotesModal } from './FreeNotesModal';

interface HomeScreenProps {
  onSelect: (subjectId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function HomeScreen({ onSelect, onNavigateTab }: HomeScreenProps) {
  const { subjects, loading } = useData();
  const { isVIP, vipDetails } = useAuth();

  // Modals state
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showFreeTest, setShowFreeTest] = useState(false);
  const [showFreeNotes, setShowFreeNotes] = useState(false);

  const handleFeatureNavigate = (id: string) => {
    switch (id) {
      case 'course':
        // Scroll to subjects or open subjects view
        const el = document.getElementById('all-subjects-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'free_courses':
        // Open first subject demo
        onSelect('sanskrit');
        break;
      case 'paid_notes':
        if (!isVIP) {
          setShowPaywall(true);
        } else {
          onSelect('sanskrit');
        }
        break;
      case 'paid_test':
        if (!isVIP) {
          setShowPaywall(true);
        } else {
          onSelect('sanskrit');
        }
        break;
      case 'ncert_book':
        setShowNcert(true);
        break;
      case 'free_notes':
        setShowFreeNotes(true);
        break;
      case 'free_test':
        setShowFreeTest(true);
        break;
      case 'routine':
        setShowRoutine(true);
        break;
      case 'social':
        setShowSocial(true);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 text-sm">
        विषय एवं पाठ्यक्रम लोड हो रहे हैं...
      </div>
    );
  }

  const subList = Object.values(subjects);

  return (
    <div className="p-3 sm:p-4 w-full max-w-2xl mx-auto space-y-4 pb-20">
      {/* 1. Hero Carousel Banner (Matches top banner in user screenshot) */}
      <HeroCarouselBanner 
        onOpenVip={() => setShowPaywall(true)}
        onExploreCourses={() => {
          const el = document.getElementById('all-subjects-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. 3x3 Feature Grid (Matches exact 9 icons & labels in user screenshot) */}
      <FeatureGrid onNavigate={handleFeatureNavigate} />

      {/* 3. VIP Status Banner / Teaser */}
      {isVIP ? (
        <div className="bg-gradient-to-r from-amber-500/15 via-white to-amber-500/10 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-stone-900">VIP एक्सेस सक्रिय</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[11px] text-stone-600">
                वैधता: {vipDetails?.formattedExpiry} तक ({vipDetails?.daysRemaining} दिन बाकी)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
          >
            विवरण
          </button>
        </div>
      ) : (
        <div 
          onClick={() => setShowPaywall(true)}
          className="bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 font-bold border border-white/20">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-black text-white">टॉपर VIP प्लान अनलॉक करें</div>
              <p className="text-[11px] text-amber-100">1 माह: ₹99 | 1 पूरा वर्ष: ₹600 मात्र</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white text-red-700 px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* 4. All Subjects Section */}
      <div id="all-subjects-section" className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <span className="w-2 h-4 rounded-full bg-red-600 inline-block"></span>
            <span>सभी विषय (Class 10th BSEB)</span>
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">{subList.length} विषय उपलब्ध</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {subList.map((sub: any) => {
            return (
              <div
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm border border-red-100 group-hover:scale-105 transition-transform shrink-0">
                    <BookText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-stone-900 text-sm truncate group-hover:text-red-700 transition-colors">
                      {sub.subject_name_hindi || sub.subject_name || sub.id}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">
                      {sub.chapters?.length || 0} अध्याय • नोट्स व MCQs
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-red-50 text-stone-400 group-hover:text-red-700 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
      {showNcert && <NcertBooksModal onClose={() => setShowNcert(false)} onOpenSubject={(id) => onSelect(id)} />}
      {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
      {showFreeTest && <FreeTestModal onClose={() => setShowFreeTest(false)} onOpenVip={() => setShowPaywall(true)} />}
      {showFreeNotes && (
        <FreeNotesModal 
          onClose={() => setShowFreeNotes(false)} 
          onOpenVip={() => setShowPaywall(true)} 
          onOpenSubject={(id) => onSelect(id)} 
        />
      )}
    </div>
  );
}
