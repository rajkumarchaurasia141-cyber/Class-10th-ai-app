import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Flame, 
  Zap, 
  Award, 
  ArrowRight,
  GraduationCap,
  Video,
  FileText,
  PlaySquare,
  HelpCircle,
  TrendingUp,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroCarouselBannerProps {
  onOpenVip: () => void;
  onExploreCourses: () => void;
  onSelectSubject?: (subjectId: string) => void;
}

export function HeroCarouselBanner({ onOpenVip, onExploreCourses, onSelectSubject }: HeroCarouselBannerProps) {
  const { isVIP } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 5500; // 5.5 seconds per slide

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
    setProgress(0);
  }, []);

  // Auto-slide effect with progress tracking
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext(); // Swiped left -> next slide
    } else if (distance < -50) {
      handlePrev(); // Swiped right -> prev slide
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-red-900/40 select-none bg-stone-950 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Slider Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-stone-900/80 z-30">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-300 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Slides Track */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* ============================================================== */}
        {/* SLIDE 1: ALL IN ONE COURSE POSTER (₹99 / ₹600 Special Offer) */}
        {/* ============================================================== */}
        <div className="w-full shrink-0 relative bg-gradient-to-br from-stone-950 via-red-950 to-neutral-950 p-4 sm:p-6 overflow-hidden">
          {/* Background Glows & Accent Graphics */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header: Branding + Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-red-900/40 pb-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md border border-amber-300/40">
                BR
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white drop-shadow-sm">पढ़ेगा BR</span>
                  <span className="text-[10px] bg-red-600/40 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-bold">10th BSEB</span>
                </div>
                <div className="text-[9px] text-stone-400 font-medium tracking-wide">Study | Learn | Grow</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full text-amber-300 text-[10px] font-bold shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Your Success Our Mission</span>
            </div>
          </div>

          {/* Center Title & Raj Sir Badge */}
          <div className="mt-3 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-1 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5" />
                बिहार बोर्ड Class 10
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                  ALL IN ONE COURSE
                </span>
              </h2>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                अब पढ़ाई होगी और भी आसान ! सभी 5 विषय एक साथ
              </p>
            </div>

            {/* RAJ SIR Brush Badge */}
            <div className="self-end sm:self-auto bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white px-3.5 py-1.5 rounded-xl border border-amber-400/50 shadow-lg text-center transform sm:rotate-1 hover:rotate-0 transition-transform">
              <div className="text-[9px] text-amber-300 font-extrabold tracking-widest uppercase">GUIDED BY</div>
              <div className="text-sm sm:text-base font-black tracking-wider text-white flex items-center justify-center gap-1">
                <span>RAJ SIR</span>
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              </div>
            </div>
          </div>

          {/* 6 Neon Glow Feature Boxes (Exact from User Poster) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 relative z-10">
            {/* 1. All Books */}
            <div className="bg-blue-950/40 border border-blue-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-blue-300 leading-tight">ALL BOOKS</div>
                <div className="text-[9px] text-stone-300 truncate">सभी विषयों की किताबें</div>
              </div>
            </div>

            {/* 2. Notes */}
            <div className="bg-cyan-950/40 border border-cyan-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-cyan-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-cyan-300 leading-tight">NOTES</div>
                <div className="text-[9px] text-stone-300 truncate">सम्पूर्ण चैप्टर नोट्स</div>
              </div>
            </div>

            {/* 3. Live Classes */}
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-rose-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Video className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-rose-300 leading-tight flex items-center gap-1">
                  <span>LIVE CLASS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                </div>
                <div className="text-[9px] text-stone-300 truncate">सीधे क्लास से जुड़ें</div>
              </div>
            </div>

            {/* 4. Recorded Class */}
            <div className="bg-purple-950/40 border border-purple-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-purple-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PlaySquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-purple-300 leading-tight">RECORDED</div>
                <div className="text-[9px] text-stone-300 truncate">कभी भी, कहीं भी देखें</div>
              </div>
            </div>

            {/* 5. Cartoon Classes */}
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-emerald-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-emerald-300 leading-tight">CARTOON CLASS</div>
                <div className="text-[9px] text-stone-300 truncate">कार्टून से आसान समझ</div>
              </div>
            </div>

            {/* 6. Free Test Series */}
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-2 flex items-center gap-2 shadow-xs hover:border-amber-400 transition-all">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-stone-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                <Clock className="w-3.5 h-3.5 text-stone-950" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-amber-300 leading-tight">TEST SERIES</div>
                <div className="text-[9px] text-stone-300 truncate">अभ्यास से बनेगा परफेक्ट</div>
              </div>
            </div>
          </div>

          {/* Pricing Row: ₹99 PER MONTH & ₹600 YEARLY OFFER */}
          <div className="mt-3.5 bg-gradient-to-r from-red-950 via-stone-900 to-red-950 border-2 border-amber-400/60 rounded-2xl p-2.5 sm:p-3 relative z-10 flex flex-wrap items-center justify-between gap-2 shadow-xl">
            {/* Offer 1: ₹99 / Month */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-stone-800">
              <div className="text-left">
                <div className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">JOIN COURSE</div>
                <div className="text-base sm:text-lg font-black text-white flex items-baseline gap-1 leading-none">
                  <span className="text-amber-300">₹99</span>
                  <span className="text-[10px] text-stone-300 font-bold">/ MONTH</span>
                </div>
              </div>
            </div>

            {/* Offer 2: Yearly ₹600 (The Big Offer!) */}
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">YEARLY OFFER</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 line-through">₹700</span>
                  <span className="text-xl sm:text-2xl font-black text-yellow-300 leading-none drop-shadow-md">
                    ₹600
                  </span>
                  <span className="text-[10px] text-amber-200 font-extrabold">में पूरा साल</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenVip}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0 border border-amber-200"
              >
                <span>अभी ज्वाइन करें</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Bottom Trust Line */}
          <div className="mt-2.5 flex items-center justify-between text-[9px] sm:text-[10px] text-stone-400 font-bold px-1 relative z-10 border-t border-stone-800/80 pt-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3 stroke-[3]" /> 100% बोर्ड पैटर्न
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3 h-3" /> सही दिशा सही तैयारी
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <Award className="w-3 h-3" /> कम खर्च ज्यादा फायदा
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SLIDE 2: संस्कृत FULL COURSE — ALL IN ONE BOOK (Raj Sir)      */}
        {/* ============================================================== */}
        <div className="w-full shrink-0 relative bg-gradient-to-br from-red-950 via-stone-950 to-neutral-950 p-4 sm:p-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {/* Left 3D Book Graphic Mockup */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative w-44 sm:w-48 h-56 sm:h-60 rounded-xl bg-gradient-to-tr from-stone-900 via-red-950 to-red-900 border-2 border-amber-400/80 shadow-2xl p-3 flex flex-col justify-between overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform">
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-red-950 to-stone-900 border-r border-amber-500/40" />

                {/* Top Badge */}
                <div className="pl-2 flex items-center justify-between">
                  <div className="text-[9px] font-black text-amber-400 tracking-wider">पढ़ेगा BR</div>
                  <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
                    CLASS 10
                  </div>
                </div>

                {/* Book Centerpiece Calligraphy */}
                <div className="pl-2 text-center my-auto">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-[0_4px_10px_rgba(239,68,68,0.8)]">
                    संस्कृत
                  </div>
                  <div className="inline-block bg-yellow-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-sm tracking-wider uppercase mt-1">
                    FULL COURSE
                  </div>
                  <div className="block bg-red-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-sm tracking-wider uppercase mt-0.5">
                    ALL IN ONE BOOK
                  </div>
                </div>

                {/* Book Bottom Badge & Teacher */}
                <div className="pl-2 pt-1 border-t border-amber-500/30 flex items-center justify-between">
                  <span className="text-[8px] text-stone-300 font-bold">BSEB 2027</span>
                  <span className="text-[9px] font-black text-amber-300 bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                    RAJ SIR
                  </span>
                </div>
              </div>
            </div>

            {/* Right Course Features & Content */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40">
                  स्पेशल बुक एडिशन
                </span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> सम्पूर्ण 14 पाठ (700 MCQs)
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  संस्कृत फुल कोर्स - ALL IN ONE BOOK
                </h3>
                <p className="text-xs text-stone-300 font-medium mt-0.5">
                  मंगलम् से लेकर शास्त्रकाराः तक सभी 14 पाठों के हिंदी अनुवाद, व्याकरण व अभ्यास।
                </p>
              </div>

              {/* 5 Features Checklist (Exact from user image) */}
              <div className="space-y-1 text-xs text-stone-200 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    📖
                  </div>
                  <span><strong>सम्पूर्ण नोट्स</strong> — हर चैप्टर के सरल हिंदी में</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    👑
                  </div>
                  <span><strong>Topper's Notes</strong> — परीक्षा में आने वाले मुख्य बिंदु</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    📑
                  </div>
                  <span><strong>पिछले 10 वर्षों के PYQs</strong> — 10 साल के बोर्ड प्रश्न</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    🎯
                  </div>
                  <span><strong>हर चैप्टर के 50 MCQs</strong> — वस्तुनिष्ठ प्रश्न व OMR टेस्ट</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    if (onSelectSubject) onSelectSubject('sanskrit');
                    else onExploreCourses();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-amber-300/40"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>संस्कृत पढ़ें (Free Demo)</span>
                </button>

                <button
                  onClick={onOpenVip}
                  className="px-3.5 py-2 bg-black/60 hover:bg-stone-900 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-400/50 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP पूरा कोर्स अनलॉक (₹99 / ₹600)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SLIDE 3: हिंदी FULL COURSE — ALL IN ONE BOOK (Raj Sir)        */}
        {/* ============================================================== */}
        <div className="w-full shrink-0 relative bg-gradient-to-br from-stone-950 via-red-950 to-neutral-950 p-4 sm:p-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {/* Left 3D Book Graphic Mockup */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative w-44 sm:w-48 h-56 sm:h-60 rounded-xl bg-gradient-to-tr from-stone-900 via-red-950 to-neutral-900 border-2 border-amber-400/80 shadow-2xl p-3 flex flex-col justify-between overflow-hidden transform 1 hover:rotate-0 transition-transform">
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-red-950 to-stone-900 border-r border-amber-500/40" />

                {/* Top Badge */}
                <div className="pl-2 flex items-center justify-between">
                  <div className="text-[9px] font-black text-amber-400 tracking-wider">पढ़ेगा BR</div>
                  <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
                    CLASS 10
                  </div>
                </div>

                {/* Book Centerpiece Calligraphy */}
                <div className="pl-2 text-center my-auto">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-[0_4px_10px_rgba(239,68,68,0.8)]">
                    हिंदी
                  </div>
                  <div className="inline-block bg-yellow-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-sm tracking-wider uppercase mt-1">
                    FULL COURSE
                  </div>
                  <div className="block bg-red-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-sm tracking-wider uppercase mt-0.5">
                    ALL IN ONE BOOK
                  </div>
                </div>

                {/* Book Bottom Badge & Teacher */}
                <div className="pl-2 pt-1 border-t border-amber-500/30 flex items-center justify-between">
                  <span className="text-[8px] text-stone-300 font-bold">गोधूलि & वर्णिका</span>
                  <span className="text-[9px] font-black text-amber-300 bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                    RAJ SIR
                  </span>
                </div>
              </div>
            </div>

            {/* Right Course Features & Content */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40">
                  गोधूलि + वर्णिका
                </span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> सम्पूर्ण 24 पाठ (गद्य + पद्य)
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  हिंदी फुल कोर्स - ALL IN ONE BOOK
                </h3>
                <p className="text-xs text-stone-300 font-medium mt-0.5">
                  श्रम विभाजन, भारत से हम क्या सीखें, नाखून क्यों बढ़ते हैं आदि सभी पाठों के नोट्स व समाधान।
                </p>
              </div>

              {/* 5 Features Checklist (Exact from user image) */}
              <div className="space-y-1 text-xs text-stone-200 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    📖
                  </div>
                  <span><strong>सम्पूर्ण नोट्स</strong> — लेखक परिचय, भावार्थ व सारांश</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    👑
                  </div>
                  <span><strong>Topper's Notes</strong> — सटीक व्याख्या एवं परीक्षा टिप्स</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    📑
                  </div>
                  <span><strong>पिछले 10 वर्षों के PYQs</strong> — बार-बार पूछे गए बोर्ड प्रश्न</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    🎯
                  </div>
                  <span><strong>हर चैप्टर के 50 MCQs</strong> — 1200+ वस्तुनिष्ठ प्रश्न</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    if (onSelectSubject) onSelectSubject('hindi');
                    else onExploreCourses();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-amber-300/40"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>हिंदी पढ़ें (Free Demo)</span>
                </button>

                <button
                  onClick={onOpenVip}
                  className="px-3.5 py-2 bg-black/60 hover:bg-stone-900 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-400/50 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP पूरा कोर्स अनलॉक (₹99 / ₹600)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-950/80 hover:bg-stone-900 text-white border border-stone-700/80 flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-950/80 hover:bg-stone-900 text-white border border-stone-700/80 flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all z-20"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Bottom Interactive Slide Indicators & Titles */}
      <div className="bg-stone-950/95 py-2 px-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800 z-20 relative">
        <div className="flex items-center gap-1.5">
          {[
            { label: 'ALL IN ONE (₹99/₹600)', color: 'bg-amber-400' },
            { label: 'संस्कृत बुक (RAJ SIR)', color: 'bg-red-500' },
            { label: 'हिंदी बुक (RAJ SIR)', color: 'bg-orange-500' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                setProgress(0);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentSlide === idx
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md border border-amber-300/40 scale-105'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentSlide === idx ? 'bg-white animate-pulse' : 'bg-stone-600'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
          <span className="text-amber-400 font-black">{currentSlide + 1}</span>
          <span>/</span>
          <span>3</span>
          <span className="text-[9px] text-stone-500 ml-1">
            {isPaused ? '(रुका हुआ)' : '(ऑटो-स्लाइडिंग)'}
          </span>
        </div>
      </div>
    </div>
  );
}
