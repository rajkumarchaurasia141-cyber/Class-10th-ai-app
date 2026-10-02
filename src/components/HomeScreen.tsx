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
  ShieldCheck,
  MessageCircle,
  Zap,
  Lock,
  FileText
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
  const { subjects, motivationalQuotes, appConfig } = useData();
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
      case 'guess_paper':
        if (onNavigateTab) {
          onNavigateTab('downloads');
        } else if (!isVIP) {
          setShowPaywall(true);
        } else {
          onSelect && onSelect('sanskrit');
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

      {/* 2.2 Special Locked/Unlocked Guess Paper & VVI Notes Section (Sleek & Compact) */}
      <div 
        onClick={() => {
          if (isVIP) {
            onNavigateTab && onNavigateTab('downloads');
          } else {
            setShowPaywall(true);
          }
        }}
        className={`rounded-2xl p-2.5 sm:p-3 transition-all shadow-sm relative overflow-hidden cursor-pointer border-2 ${
          isVIP 
            ? 'bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-amber-400 text-white' 
            : 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-amber-400/80 hover:border-amber-500 text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm ${
              isVIP 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 ring-2 ring-amber-300' 
                : 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
            }`}>
              {isVIP ? <Sparkles className="w-5 h-5 fill-stone-950" /> : <Lock className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                  {isVIP ? '🔓 VIP अनलॉक' : '🔒 स्पेशल लॉक'}
                </span>
                <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                  100% VVI वायरल
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black tracking-tight mt-0.5 truncate text-stone-900">
                स्पेशल गेस पेपर & VVI बोर्ड नोट्स
              </h4>
              <p className="text-[10px] text-stone-600 truncate">
                {isVIP 
                  ? 'सभी 6 विषयों के सम्पूर्ण हल सहित गेस पेपर व वायरल सेट्स अनलॉक हैं।' 
                  : 'यह सेक्शन केवल पेड छात्रों के लिए है। ₹299 में अनलॉक करवाएं।'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isVIP ? (
              <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1">
                <span>पढ़ें</span>
                <ChevronRight className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1 animate-pulse">
                <Lock className="w-3 h-3" />
                <span>अनलॉक (₹299)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2.5 Crash Course Spotlight Banner (Strict 16:9 Aspect Ratio Banner) */}
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-amber-600 via-red-600 to-stone-950 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 text-white shadow-xl border-2 border-yellow-400/80 relative overflow-hidden flex flex-col justify-between">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-red-500/20 rounded-full blur-xl pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-stone-950 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            <Zap className="w-3 h-3 fill-current" />
            <span>स्पेशल टॉपर क्रैश कोर्स</span>
          </div>

          <div className="bg-black/50 border border-yellow-400/50 px-2 py-0.5 rounded-full text-yellow-300 text-[9px] sm:text-[10px] font-black">
            मात्र ₹299 (70% छूट)
          </div>
        </div>

        {/* Center Main Info */}
        <div className="relative z-10 space-y-0.5 sm:space-y-1 my-auto">
          <h3 className="text-sm sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight flex items-baseline gap-2">
            <span>बिहार बोर्ड 10वीं क्रैश कोर्स</span>
            <span className="text-yellow-300 font-extrabold text-xs sm:text-base">मात्र ₹299</span>
          </h3>
          <p className="text-[9px] sm:text-xs text-amber-100 font-medium leading-snug line-clamp-2">
            कम समय में 450+ अंक की पक्की तैयारी! सभी 6 विषयों के हस्तलिखित नोट्स, VVI प्रश्न और 50 MCQ टेस्ट।
          </p>

          <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-amber-200 font-bold pt-0.5">
            <span className="flex items-center gap-0.5">✔ 6 विषय नोट्स</span>
            <span className="flex items-center gap-0.5">✔ 100% VVI प्रश्न</span>
            <span className="flex items-center gap-0.5">✔ 50 MCQ टेस्ट</span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="relative z-10 flex items-center gap-2 pt-1 border-t border-yellow-400/20">
          <button
            onClick={() => setShowPaywall(true)}
            className="flex-1 px-3 py-1.5 sm:py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black text-[10px] sm:text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-yellow-200"
          >
            <span>कोर्स अनलॉक करें (₹299)</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <a
            href={`https://wa.me/91${appConfig.whatsappNumber || '9241511070'}?text=${encodeURIComponent('नमस्ते सर, मुझे BSEB 10वीं क्रैश कोर्स (₹299) ज्वाइन करना है।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer border border-emerald-400/40 shrink-0"
            title="व्हाट्सएप पर सहायता (9241511070)"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>

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

      {/* 4. Bihar Guru AI Assistant Card */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('chat')}
        className="bg-gradient-to-r from-red-900 via-stone-900 to-amber-950 text-white rounded-3xl p-4 shadow-md border border-amber-500/40 relative overflow-hidden cursor-pointer hover:border-amber-400 transition-all group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                  बिहार गुरु (Bihar Guru) AI Assistant
                </h4>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-0.5 font-bold">
                BSEB Class 9-10 • Hindi, English, Science, SST
              </p>
              <p className="text-[11px] text-stone-300 mt-0.5">
                आसान भाषा में समझें और परीक्षा अनुसार सटीक उत्तर पाएं ↗
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400 group-hover:text-stone-950 text-white flex items-center justify-center transition-all shrink-0 ml-2">
            <ChevronRight className="w-5 h-5" />
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
