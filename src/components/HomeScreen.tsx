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
import { CrashCoursePaywallModal } from './CrashCoursePaywallModal';

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
  const [showCrashCourseModal, setShowCrashCourseModal] = useState(false);

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
      case 'crash_course':
        if (onNavigateTab) {
          onNavigateTab('crash_course');
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
    <div className="p-2.5 sm:p-3 w-full max-w-2xl mx-auto space-y-2.5 sm:space-y-3 pb-8">
      {/* Admin Quick Access Banner (Automatically shown when logged in with Admin Gmail) */}
      {isAdmin && (
        <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-xl p-2 px-3 text-[#222222] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F8E8B5] text-[#222222] border border-[#D8B45A]/50 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#D8B45A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-[#222222]">एडमिन मोड सक्रिय</span>
                <span className="text-[9px] bg-[#FFF4D6] text-[#D8B45A] border border-[#EADBB8] px-1.5 py-0.2 rounded font-black">सुपर एडमिन</span>
              </div>
              <p className="text-[10px] text-[#777777] truncate">
                नमस्ते {user?.name || 'राजकुमार sir'}!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('admin')}
            className="px-2.5 py-1 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[10px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs ml-2"
          >
            <span>एडमिन पैनल</span>
            <ArrowRight className="w-3 h-3 text-[#222222]" />
          </button>
        </div>
      )}

      {/* 1. Hero Carousel Banner (Strict 16:9 Aspect Ratio) */}
      <HeroCarouselBanner 
        onOpenVip={() => setShowPaywall(true)}
        onExploreCourses={() => {
          const el = document.getElementById('all-subjects-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectSubject={(id: string) => handleSelectSubject(id)}
      />

      {/* 1.5 Motivational Quote Ticker (Dynamic from Admin Panel) */}
      {motivationalQuotes.filter(q => q.isActive).length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D8B45A] shrink-0" />
          <span className="text-[9px] font-black uppercase text-[#D8B45A] tracking-wider shrink-0">सुविचार:</span>
          <p className="text-[10px] font-bold text-[#222222] truncate">
            "{motivationalQuotes.filter(q => q.isActive)[0]?.quote}"
          </p>
        </div>
      )}

      {/* 2. 3x3 Feature Grid (All 9 icons visible right on the screen) */}
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
        className={`rounded-2xl p-2.5 sm:p-3 transition-all shadow-xs relative overflow-hidden cursor-pointer border ${
          isVIP 
            ? 'bg-[#FFFFFF] border-[#D8B45A] text-[#222222]' 
            : 'bg-[#FFFFFF] border-[#EADBB8] hover:border-[#D8B45A] text-[#222222]'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
              isVIP 
                ? 'bg-[#F8E8B5] text-[#222222] ring-1 ring-[#D8B45A]' 
                : 'bg-[#FFF4D6] text-[#D8B45A] ring-1 ring-[#EADBB8]'
            }`}>
              {isVIP ? <Sparkles className="w-5 h-5 fill-[#D8B45A] text-[#D8B45A]" /> : <Lock className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-[#222222] bg-[#F8E8B5] px-1.5 py-0.2 rounded border border-[#D8B45A]/50">
                  {isVIP ? '🔓 VIP अनलॉक' : '🔒 स्पेशल लॉक'}
                </span>
                <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                  100% VVI वायरल
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black tracking-tight mt-0.5 truncate text-[#222222]">
                स्पेशल गेस पेपर & VVI बोर्ड नोट्स
              </h4>
              <p className="text-[10px] text-[#777777] truncate">
                {isVIP 
                  ? 'सभी 6 विषयों के सम्पूर्ण हल सहित गेस पेपर व वायरल सेट्स अनलॉक हैं।' 
                  : 'यह सेक्शन केवल पेड छात्रों के लिए है। ₹499 में फुल कोर्स अनलॉक करवाएं।'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isVIP ? (
              <span className="px-3 py-1.5 bg-[#F8E8B5] hover:bg-[#F3DD9C] text-[#222222] border border-[#D8B45A] font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1">
                <span>पढ़ें</span>
                <ChevronRight className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-[#F8E8B5] hover:bg-[#F3DD9C] text-[#222222] border border-[#D8B45A] font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#D8B45A]" />
                <span>अनलॉक (₹499)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2.3 PYQ Previous Year Questions Section Card */}
      <div 
        onClick={() => {
          if (onNavigateTab) {
            onNavigateTab('pyqs');
          }
        }}
        className="rounded-2xl p-2.5 sm:p-3 transition-all shadow-xs relative overflow-hidden cursor-pointer border bg-[#FFFFFF] border-[#EADBB8] hover:border-[#D8B45A] text-[#222222]"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs bg-[#FFF4D6] text-[#222222] ring-1 ring-[#EADBB8]">
              📄
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-[#222222] bg-[#F8E8B5] px-1.5 py-0.2 rounded border border-[#D8B45A]/50">
                  📚 PYQ बैंक
                </span>
                <span className="text-[9px] font-black uppercase text-[#777777] bg-[#FFF4D6] border border-[#EADBB8] px-1.5 py-0.2 rounded">
                  2015 - 2025
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black tracking-tight mt-0.5 truncate text-[#222222]">
                पिछले वर्षों के प्रश्न पत्र (PYQs)
              </h4>
              <p className="text-[10px] text-[#777777] truncate">
                पिछले 10 वर्षों के बोर्ड परीक्षा प्रश्न पत्र व हल पीडीएफ डाउनलोड करें।
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1.5 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1">
              <span>देखें</span>
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
        </div>
      </div>

      {/* 2.4 Dedicated Crash Course Section Card (Strictly NO year as requested) */}
      <div 
        onClick={() => {
          if (onNavigateTab) {
            onNavigateTab('crash_course');
          }
        }}
        className="rounded-2xl p-2.5 sm:p-3 transition-all shadow-xs relative overflow-hidden cursor-pointer border bg-[#FFFFFF] border-[#EADBB8] hover:border-[#D8B45A] text-[#222222]"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs bg-[#F8E8B5] text-[#222222] ring-1 ring-[#D8B45A]">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-[#222222] bg-[#F8E8B5] px-1.5 py-0.2 rounded border border-[#D8B45A]/50">
                  🚀 फास्ट-ट्रैक
                </span>
                <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                  सम्पूर्ण 6 विषय
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black tracking-tight mt-0.5 truncate text-[#222222]">
                Crash Course (Class 10th)
              </h4>
              <p className="text-[10px] text-[#777777] truncate">
                चैप्टर-वाइज स्पेशल नोट्स, फॉर्मूला शीट्स और 30 VVI टेस्ट सेट्स।
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1.5 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1">
              <span>खोलें</span>
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 Crash Course Spotlight Banner (Strict 16:9 Aspect Ratio Banner) */}
      <div className="w-full aspect-[16/9] bg-[#FFFFFF] rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 text-[#222222] shadow-xs border border-[#EADBB8] relative overflow-hidden flex flex-col justify-between">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FFF4D6] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#F8E8B5]/40 rounded-full blur-xl pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#F8E8B5] border border-[#D8B45A]/50 text-[#222222] text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            <Zap className="w-3 h-3 fill-[#D8B45A] text-[#D8B45A]" />
            <span>स्पेशल टॉपर क्रैश कोर्स</span>
          </div>

          <div className="bg-[#FFF4D6] border border-[#EADBB8] px-2 py-0.5 rounded-full text-[#222222] text-[9px] sm:text-[10px] font-black">
            मात्र ₹299 (70% छूट)
          </div>
        </div>

        {/* Center Main Info */}
        <div className="relative z-10 space-y-0.5 sm:space-y-1 my-auto">
          <h3 className="text-sm sm:text-xl md:text-2xl font-black text-[#222222] tracking-tight leading-tight flex items-baseline gap-2">
            <span>बिहार बोर्ड 10वीं क्रैश कोर्स</span>
            <span className="text-[#D8B45A] font-extrabold text-xs sm:text-base">मात्र ₹299</span>
          </h3>
          <p className="text-[9px] sm:text-xs text-[#777777] font-medium leading-snug line-clamp-2">
            कम समय में 450+ अंक की पक्की तैयारी! सभी 6 विषयों के हस्तलिखित नोट्स, VVI प्रश्न और 50 MCQ टेस्ट।
          </p>

          <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-[#222222] font-bold pt-0.5">
            <span className="flex items-center gap-0.5 text-[#222222]">✔ 6 विषय नोट्स</span>
            <span className="flex items-center gap-0.5 text-[#222222]">✔ 100% VVI प्रश्न</span>
            <span className="flex items-center gap-0.5 text-[#222222]">✔ 50 MCQ टेस्ट</span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="relative z-10 flex items-center gap-2 pt-1 border-t border-[#EADBB8]">
          <button
            onClick={() => setShowCrashCourseModal(true)}
            className="flex-1 px-3 py-1.5 sm:py-2 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[10px] sm:text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>कोर्स अनलॉक करें (₹299)</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3] text-[#222222]" />
          </button>
          <a
            href={`https://wa.me/91${appConfig.whatsappNumber || '9241511070'}?text=${encodeURIComponent('नमस्ते सर, मुझे BSEB 10वीं क्रैश कोर्स (₹299) ज्वाइन करना है।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer border border-emerald-400/40 shrink-0"
            title="व्हाट्सएप पर सहायता (9241511070)"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Free Study Campaign Announcement */}
      <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF4D6] text-[#222222] border border-[#EADBB8] flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 fill-[#D8B45A] text-[#D8B45A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#222222]">मुफ़्त शिक्षा अभियान (All Courses Unlocked)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-[#777777]">
              बोर्ड परीक्षा की तैयारी के लिए सभी वीआईपी नोट्स, टेस्ट सीरीज और क्लासेज पूर्ण रूप से फ्री कर दी गई हैं।
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bihar Guru AI Assistant Card */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('chat')}
        className="bg-[#FFFFFF] rounded-3xl p-4 shadow-xs border border-[#EADBB8] hover:border-[#D8B45A] transition-all group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E8B5] border border-[#D8B45A]/50 text-[#222222] flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6 fill-[#D8B45A] text-[#D8B45A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-[#222222] text-sm sm:text-base leading-tight">
                  बिहार गुरु (Bihar Guru) AI Assistant
                </h4>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#D8B45A] mt-0.5 font-bold">
                BSEB Class 9-10 • Hindi, English, Science, SST
              </p>
              <p className="text-[11px] text-[#777777] mt-0.5">
                आसान भाषा में समझें और परीक्षा अनुसार सटीक उत्तर पाएं ↗
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF4D6] border border-[#EADBB8] group-hover:bg-[#F8E8B5] group-hover:text-[#222222] text-[#777777] flex items-center justify-center transition-all shrink-0 ml-2">
            <ChevronRight className="w-5 h-5 text-[#222222]" />
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
      {showCrashCourseModal && (
        <CrashCoursePaywallModal
          onClose={() => setShowCrashCourseModal(false)}
        />
      )}
    </div>
  );
}
