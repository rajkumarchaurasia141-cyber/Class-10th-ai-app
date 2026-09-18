import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, ChevronRight, Sparkles, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroCarouselBannerProps {
  onOpenVip: () => void;
  onExploreCourses: () => void;
}

export function HeroCarouselBanner({ onOpenVip, onExploreCourses }: HeroCarouselBannerProps) {
  const { isVIP, vipDetails } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'topper-batch',
      tag: 'बिहार बोर्ड परीक्षा 2027',
      title: 'टॉपर बैच - 2027',
      subtitle: '10th All Subjects (NCERT)',
      features: [
        'लाइव & रिकॉर्डेड क्लासेस',
        'हस्तलिखित चैप्टर नोट्स (PDF)',
        'डाउट समाधान & गाइडेंस',
        'चैप्टर वाइज 50 MCQ टेस्ट'
      ],
      subjects: ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'हिंदी'],
      oldPrice: '₹1800',
      newPrice: '₹99 / ₹600',
      priceLabel: 'Course Fee',
      actionText: isVIP ? 'बैच अनलॉक है' : 'ज्वाइन करें',
      actionSub: isVIP ? 'कंटेंट पढ़ें' : 'VIP अनलॉक',
      bgGradient: 'from-red-900 via-stone-900 to-red-950',
      badgeColor: 'bg-amber-400 text-stone-950'
    },
    {
      id: 'topper-notes',
      tag: 'स्पेशल स्टडी मटेरियल',
      title: 'टॉपर हैंडराइटिंग नोट्स',
      subtitle: 'संपूर्ण 10वीं सिलेबस कवरेज',
      features: [
        'VVI महत्वपूर्ण प्रश्नोत्तर',
        'संस्कृत पीयूषम् सम्पूर्ण श्लोकार्थ',
        'गणित सूत्र एवं ट्रिक्स',
        'बोर्ड परीक्षा मॉडल पेपर्स'
      ],
      subjects: ['NCERT आधारित', 'PYQ 2016-2027', '100% स्कोरिंग'],
      oldPrice: '₹999',
      newPrice: '₹99 मात्र',
      priceLabel: '1 Month Fee',
      actionText: 'नोट्स देखें',
      actionSub: 'डाउनलोड करें',
      bgGradient: 'from-amber-900 via-stone-900 to-stone-950',
      badgeColor: 'bg-emerald-400 text-stone-950'
    },
    {
      id: 'test-series',
      tag: '50 Objective MCQ Series',
      title: 'महा-टेस्ट सीरीज 2027',
      subtitle: 'प्रत्येक अध्याय के 50 चुनिंदा प्रश्न',
      features: [
        'तुरंत रिजल्ट व स्कोर कार्ड',
        'सटीक व्याख्या व सही उत्तर',
        'टाइम लिमिट अभ्यास',
        'रैंक व प्रोग्रेस रिपोर्ट'
      ],
      subjects: ['संस्कृत', 'विज्ञान', 'गणित', 'सामाजिक विज्ञान'],
      oldPrice: '₹500',
      newPrice: 'फ्री + VIP',
      priceLabel: 'All Tests',
      actionText: 'टेस्ट दें',
      actionSub: 'प्रैक्टिस शुरू करें',
      bgGradient: 'from-blue-950 via-stone-900 to-indigo-950',
      badgeColor: 'bg-amber-400 text-stone-950'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-red-900/30 transition-all">
      {/* Active Slide Card */}
      <div 
        onClick={isVIP ? onExploreCourses : onOpenVip}
        className={`bg-gradient-to-r ${slide.bgGradient} p-4 sm:p-5 text-white cursor-pointer relative overflow-hidden group select-none`}
      >
        {/* Decorative background glows */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-all pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          {/* Left Column: Heading & Checklist */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-600/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {slide.tag}
              </span>
              {isVIP && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" /> VIP अनलॉक
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 drop-shadow-sm">
                <span>{slide.title}</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                {slide.subtitle}
              </p>
            </div>

            {/* Features Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px] text-stone-200">
              {slide.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>

            {/* Subject Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {slide.subjects.map((sub, idx) => (
                <span key={idx} className="bg-black/40 text-stone-300 text-[9px] px-1.5 py-0.5 rounded border border-stone-700/50">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Price Circle & Action (Matches the exact circle in user screenshot!) */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            {/* Round Price Badge */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-red-700 via-red-800 to-stone-950 border-2 border-amber-400 p-1 flex flex-col items-center justify-center text-center shadow-lg shadow-black/50 group-hover:scale-105 transition-transform">
              <span className="text-[9px] text-stone-300 line-through leading-tight">
                {slide.oldPrice}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 leading-none">
                {slide.newPrice}
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-tight mt-0.5">
                {slide.priceLabel}
              </span>
            </div>

            {/* Action Pill */}
            <div className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-1.5 rounded-full text-xs font-black shadow-md transition-all">
              <span>{slide.actionText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Dots */}
      <div className="bg-stone-950/90 py-1.5 px-3 flex items-center justify-center gap-1.5 border-t border-stone-800">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-6 bg-red-500' : 'w-2 bg-stone-700 hover:bg-stone-500'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
