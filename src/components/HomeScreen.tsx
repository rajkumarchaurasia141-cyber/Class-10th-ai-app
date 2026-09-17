import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileText,
  History,
  Camera,
  PlayCircle,
  Calculator,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ActiveMainTab, SubjectId } from '../types';

interface HomeScreenProps {
  onNavigateTab: (tab: ActiveMainTab) => void;
  onSelectSubject: (subjectId: SubjectId) => void;
  onOpenTips: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onSelectSubject,
  onOpenTips,
}) => {
  // Auto-Sliding Banner State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customBannerImage, setCustomBannerImage] = useState<string | null>("https://i.ibb.co/qF4jJdbN/Whats-App-Image-2025-03-05-at-00-58-15-e204c965.jpg");

  useEffect(() => {
    try {
      const savedImage = localStorage.getItem('custom_banner_image');
      if (savedImage) {
        setCustomBannerImage(savedImage);
      }
    } catch (e) {
      console.error("Error reading from localStorage", e);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomBannerImage(base64String);
        localStorage.setItem('custom_banner_image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const banners = [
    {
      title: "बिहार बोर्ड 10वीं टॉपर बैच 2026",
      subtitle: "संपूर्ण तैयारी",
      bg: "bg-gradient-to-r from-blue-600 to-indigo-600",
      image: "🎓",
      customImgUrl: "https://i.ibb.co/qF4jJdbN/Whats-App-Image-2025-03-05-at-00-58-15-e204c965.jpg" // Using your actual photo link here
    },
    {
      title: "चैप्टर-वाइज 50 MCQs डेली टेस्ट सीरीज़",
      subtitle: "लाइव",
      bg: "bg-gradient-to-r from-emerald-600 to-teal-600",
      image: "📝"
    },
    {
      title: "100% NCERT सटीक नोट्स",
      subtitle: "+ वीडियो लेक्चर्स",
      bg: "bg-gradient-to-r from-rose-600 to-pink-600",
      image: "📚"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* 1. App Welcome Logo Section */}
      <div className="flex flex-col items-center justify-center py-4 mb-2">
        <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-950 border-[3px] border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] overflow-hidden mb-4">
          <span className="text-amber-400 drop-shadow-md leading-none mt-2 text-4xl sm:text-6xl">🎓</span>
          <span className="text-white font-black tracking-tighter leading-none text-xl sm:text-3xl mt-1">PB</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Padhega Bihar <span className="text-amber-500">- 10th</span>
        </h2>
        <p className="text-stone-400 text-sm mt-1">बिहार बोर्ड की नंबर 1 तैयारी</p>
      </div>

      {/* 2. Auto-Sliding Banner */}
      <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-stone-800">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${banner.bg} p-6 flex items-center justify-between`}
          >
            <div className="flex flex-col justify-center h-full max-w-[65%] sm:max-w-[70%] z-20">
              <span className="inline-block px-2 py-1 rounded bg-black/20 text-white text-[10px] font-bold w-max mb-2 uppercase tracking-wide">
                {banner.subtitle}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                {banner.title}
              </h2>
            </div>
            {index === 0 ? (
              <div className="relative z-20 mr-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="banner-upload" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <label htmlFor="banner-upload" className="cursor-pointer group/img relative block">
                  {customBannerImage ? (
                    <img src={customBannerImage} alt="Profile" className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-full border-4 border-white/20 shadow-xl" />
                  ) : (
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center hover:bg-white/20 transition-colors">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 mb-1" />
                      <span className="text-[10px] sm:text-xs text-white/80 font-medium">Add Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="text-6xl sm:text-7xl opacity-90 drop-shadow-lg scale-110">
                {banner.image}
              </div>
            )}
          </div>
        ))}
        {/* Banner Indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Notice Strip (Marquee) */}
      <div className="bg-stone-900 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 overflow-hidden shadow-sm">
        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400">
          📢
        </span>
        <div className="flex-1 overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee text-sm font-semibold text-amber-100">
            बिहार बोर्ड 2026 परीक्षा के लिए नए नोट्स और टेस्ट सीरीज अपडेट कर दिए गए हैं! अपनी तैयारी को और मजबूत करें।
          </div>
        </div>
      </div>

      {/* 4. Main Grid Menu */}
      <div>
        <h3 className="text-white font-bold text-lg mb-3 px-1">एक्सप्लोर करें</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Live Class (Coming soon / Tips for now) */}
          <div 
            onClick={onOpenTips}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">लाइव क्लास</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Live Classes</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-full h-full" />
            </div>
          </div>

          {/* Chapter Notes & PDF */}
          <div 
            onClick={() => onNavigateTab('subjects')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">चैप्टर नोट्स व PDF</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Class Notes</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <FileText className="w-full h-full" />
            </div>
          </div>

          {/* Online Test Series */}
          <div 
            onClick={() => onNavigateTab('subjects')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <CheckSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">ऑनलाइन टेस्ट सीरीज़</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Online Tests</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <CheckSquareIcon className="w-full h-full" />
            </div>
          </div>

          {/* PYQ */}
          <div 
            onClick={() => onNavigateTab('pyq')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">पिछले 10 साल के PYQ</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Question Bank</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <History className="w-full h-full" />
            </div>
          </div>

          {/* NCERT Solutions */}
          <div 
            onClick={() => onNavigateTab('math-solutions')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">NCERT प्रश्नावली हल</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Maths & Science</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <Calculator className="w-full h-full" />
            </div>
          </div>

          {/* AI Teacher */}
          <div 
            onClick={() => onNavigateTab('ai-teacher')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between aspect-[4/3] sm:aspect-[3/2]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:drop-shadow-md">AI टीचर व फ़ोटो डाउट</h4>
              <p className="text-white/70 text-[10px] mt-0.5">Doubt Solver</p>
            </div>
            <div className="absolute -bottom-2 -right-2 text-white/10 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform">
              <Camera className="w-full h-full" />
            </div>
          </div>
          
        </div>
      </div>

      {/* 5. Latest Tests / Trending Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            ट्रेंडिंग / लेटेस्ट
          </h3>
        </div>
        
        <div className="space-y-3">
          {/* Trending Card 1 */}
          <div 
            onClick={() => { onSelectSubject('science'); onNavigateTab('subjects'); }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400">HOT</span>
                <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3"/> 5 Min Read</span>
              </div>
              <h4 className="text-white font-bold text-sm sm:text-base">विज्ञान: रासायनिक अभिक्रियाएं (VVI Notes)</h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0 text-stone-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Trending Card 2 */}
          <div 
            onClick={() => onNavigateTab('pyq')}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <History className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400">TEST</span>
              </div>
              <h4 className="text-white font-bold text-sm sm:text-base">गणित 2024 (प्रथम पाली) वस्तुनिष्ठ हल</h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0 text-stone-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

function CheckSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

