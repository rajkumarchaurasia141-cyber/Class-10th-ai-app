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
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { HeroCarouselBanner } from './HeroCarouselBanner';
import { FeatureGrid } from './FeatureGrid';
import { PaywallModal } from './PaywallModal';
import { ClassRoutineModal } from './ClassRoutineModal';
import { NcertBooksModal } from './NcertBooksModal';
import { SocialMediaModal } from './SocialMediaModal';
import { FreeTestModal } from './FreeTestModal';
import { FreeNotesModal } from './FreeNotesModal';
import { PaidTestHubModal } from './PaidTestHubModal';
import { PaidCourseModal } from './PaidCourseModal';

interface HomeScreenProps {
  onSelect?: (subjectId: string) => void;
  onOpenSubject?: (subjectId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenVip?: () => void;
}

export function HomeScreen({ onSelect, onOpenSubject, onNavigateTab, onOpenVip }: HomeScreenProps) {
  const { subjects, motivationalQuotes } = useData();
  const { isVIP, vipDetails, isAdmin, user } = useAuth();
  const handleSelectSubject = onSelect || onOpenSubject || (() => {});

  // Modals state
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showFreeTest, setShowFreeTest] = useState(false);
  const [showFreeNotes, setShowFreeNotes] = useState(false);
  const [showPaidTest, setShowPaidTest] = useState(false);
  const [showPaidCourse, setShowPaidCourse] = useState(false);

  const handleFeatureNavigate = (id: string) => {
    switch (id) {
      case 'course':
        setShowPaidCourse(true);
        break;
      case 'free_courses':
        // Open first subject demo
        onSelect('sanskrit');
        break;
      case 'paid_notes':
        if (onNavigateTab) {
          onNavigateTab('my_courses');
        } else if (!isVIP) {
          setShowPaywall(true);
        } else {
          onSelect('sanskrit');
        }
        break;
      case 'paid_test':
        setShowPaidTest(true);
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
      case 'leaderboard':
        if (onNavigateTab) {
          onNavigateTab('leaderboard');
        }
        break;
      default:
        break;
    }
  };

  const subList = Object.values(subjects);

  return (
    <div className="p-3 sm:p-4 w-full max-w-2xl mx-auto space-y-4 pb-20">
      {/* Admin Quick Access Banner (Automatically shown when logged in with Admin Gmail) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/40 rounded-2xl p-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">एडमिन मोड सक्रिय</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">सुपर एडमिन</span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 font-medium">
                नमस्ते {user?.name || 'एडमिन'}! आप सीधे एडमिन कंट्रोल में जा सकते हैं।
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('admin')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95 ml-2"
          >
            <span>एडमिन पैनल</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 0. Motivational Quote Banner (Dynamic from Admin Panel) */}
      {motivationalQuotes.filter(q => q.isActive).length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-300/80 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">आज का टॉपर सुविचार (Daily Thought)</div>
            <p className="text-xs font-extrabold text-stone-900 truncate">
              "{motivationalQuotes.filter(q => q.isActive)[0]?.quote}"
            </p>
          </div>
        </div>
      )}

      {/* 1. Hero Carousel Banner (Matches top banner in user screenshot) */}
      <HeroCarouselBanner 
        onOpenVip={() => setShowPaywall(true)}
        onExploreCourses={() => {
          const el = document.getElementById('all-subjects-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectSubject={(id: string) => handleSelectSubject(id)}
      />

      {/* 2. 3x3 Feature Grid (Matches exact 9 icons & labels in user screenshot) */}
      <FeatureGrid onNavigate={handleFeatureNavigate} />

      {/* 3. Free Study Campaign Announcement */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/15 to-emerald-600/10 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-stone-900">मुफ़्त शिक्षा अभियान (All Courses Unlocked)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-stone-600">
              बोर्ड परीक्षा की तैयारी के लिए सभी वीआईपी नोट्स, टेस्ट सीरीज और क्लासेज पूर्ण रूप से फ्री कर दी गई हैं।
            </p>
          </div>
        </div>
      </div>



      {/* 5. Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
      {showNcert && <NcertBooksModal onClose={() => setShowNcert(false)} onOpenSubject={(id) => handleSelectSubject(id)} />}
      {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
      {showFreeTest && <FreeTestModal onClose={() => setShowFreeTest(false)} onOpenVip={() => setShowPaywall(true)} />}
      {showFreeNotes && (
        <FreeNotesModal 
          onClose={() => setShowFreeNotes(false)} 
          onOpenVip={() => setShowPaywall(true)} 
          onOpenSubject={(id) => handleSelectSubject(id)} 
        />
      )}
      {showPaidTest && (
        <PaidTestHubModal 
          onClose={() => setShowPaidTest(false)} 
          onOpenVip={() => setShowPaywall(true)} 
          isVIP={isVIP}
        />
      )}
      {showPaidCourse && (
        <PaidCourseModal
          isOpen={showPaidCourse}
          onClose={() => setShowPaidCourse(false)}
          onSelectSubject={(id) => handleSelectSubject(id)}
          onOpenPaidTest={() => setShowPaidTest(true)}
        />
      )}
    </div>
  );
}
