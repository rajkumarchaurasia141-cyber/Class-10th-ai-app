import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle,
  Instagram,
  Youtube,
  ArrowRight
} from 'lucide-react';
import { FeatureGrid } from './FeatureGrid';
import { ClassRoutineModal } from './ClassRoutineModal';
import { NcertBooksModal } from './NcertBooksModal';
import { SocialMediaModal } from './SocialMediaModal';
import { AdsterraBanner } from './AdsterraBanner';
import { triggerAd } from '../utils/adManager';

interface HomeScreenProps {
  onSelect?: (subjectId: string) => void;
  onOpenSubject?: (subjectId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenVip?: () => void;
}

export function HomeScreen({ onSelect, onOpenSubject, onNavigateTab, onOpenVip }: HomeScreenProps) {
  const { subjects, motivationalQuotes, appConfig } = useData();
  const { isVIP, isAdmin, user } = useAuth();
  const handleSelectSubject = onSelect || onOpenSubject || (() => {});

  const [showRoutine, setShowRoutine] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  const handleFeatureNavigate = (id: string) => {
    // Trigger ad when navigating away
    triggerAd();

    switch (id) {
      case 'course':
        if (onNavigateTab) {
          onNavigateTab('my_courses');
        } else {
          handleSelectSubject('sanskrit');
        }
        break;
      case 'test_pdfs':
      case 'crash_course':
        if (onNavigateTab) {
          onNavigateTab('crash_course');
        }
        break;
      case 'daily_test':
        if (onNavigateTab) {
          onNavigateTab('daily_test');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-2.5 sm:p-3 w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 pb-12">
      {/* Admin Quick Access Banner */}
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigateTab && onNavigateTab('admin_daily_test')}
              className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-[10px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              title="Daily Test Manager"
            >
              <span>📝 डेली टेस्ट</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('admin')}
              className="px-2.5 py-1 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[10px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs ml-1"
            >
              <span>एडमिन पैनल</span>
              <ArrowRight className="w-3 h-3 text-[#222222]" />
            </button>
          </div>
        </div>
      )}

      {/* Motivational Quote Ticker */}
      {motivationalQuotes.filter(q => q.isActive).length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#D8B45A] shrink-0" />
          <span className="text-[10px] font-black uppercase text-[#D8B45A] tracking-wider shrink-0">सुविचार:</span>
          <p className="text-[11px] font-bold text-[#222222] truncate">
            "{motivationalQuotes.filter(q => q.isActive)[0]?.quote}"
          </p>
        </div>
      )}

      {/* Main Features Grid (Exactly 3 Cards: Course, Test & PDFs, Daily Test) */}
      <FeatureGrid onNavigate={handleFeatureNavigate} />

      {/* Free Study Campaign Announcement */}
      <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF4D6] text-[#222222] border border-[#EADBB8] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 fill-[#D8B45A] text-[#D8B45A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#222222]">100% मुफ़्त शिक्षा अभियान (All Courses Free)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-[#777777] leading-snug mt-0.5">
              बिहार बोर्ड परीक्षा की तैयारी के लिए सभी कोर्सेज, टेस्ट सीरीज और पीडीएफ नोट्स पूर्ण रूप से मुफ्त उपलब्ध हैं।
            </p>
          </div>
        </div>
      </div>

      {/* Connect With Us Section (WhatsApp, Instagram, YouTube) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-[#222222] flex items-center gap-1.5">
            <span className="w-2 h-3.5 rounded-full bg-[#D8B45A] inline-block"></span>
            <span>Connect With Us (जुड़ें)</span>
          </h3>
          <span className="text-[10px] text-[#777777] font-bold">Official Social Media</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/91${appConfig.whatsappNumber || '9241511070'}?text=${encodeURIComponent('नमस्ते सर, मुझे BSEB GURU 10वीं कोर्स की जानकारी चाहिए।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <MessageCircle className="w-6 h-6 fill-emerald-600 text-white" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-emerald-600 transition-colors">
                WhatsApp
              </h4>
              <p className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Connect Now
              </p>
            </div>
          </a>

          {/* Instagram Card */}
          <a
            href={appConfig.instagramUrl || 'https://instagram.com/unbroken_raj_01'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-rose-600 transition-colors">
                Instagram
              </h4>
              <p className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Follow Now
              </p>
            </div>
          </a>

          {/* YouTube Card */}
          <a
            href={appConfig.youtubeUrl || 'https://youtube.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Youtube className="w-6 h-6 fill-red-600 text-white" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-red-600 transition-colors">
                YouTube
              </h4>
              <p className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                Subscribe
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Bihar Guru AI Assistant Card */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('chat')}
        className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#EADBB8] hover:border-[#D8B45A] transition-all group cursor-pointer relative overflow-hidden"
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
                BSEB Class 10 • All Subjects Doubt Solver
              </p>
              <p className="text-[11px] text-[#777777] mt-0.5">
                आसान भाषा में समझें और परीक्षा अनुसार सटीक उत्तर पाएं ↗
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF4D6] border border-[#EADBB8] group-hover:bg-[#F8E8B5] text-[#222222] flex items-center justify-center transition-all shrink-0 ml-2">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Adsterra 300x250 Banner Ad (Centered at Bottom) */}
      <AdsterraBanner />

      {/* Modals */}
      {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
      {showNcert && <NcertBooksModal onClose={() => setShowNcert(false)} onOpenSubject={(id) => handleSelectSubject(id)} />}
      {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
    </div>
  );
}
