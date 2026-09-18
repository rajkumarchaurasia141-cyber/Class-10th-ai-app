import React, { useState } from 'react';
import { 
  Radio, 
  Youtube, 
  Play, 
  Lock, 
  Crown, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LiveClass } from '../types';

interface LiveClassesViewProps {
  onOpenVip: () => void;
}

export function LiveClassesView({ onOpenVip }: LiveClassesViewProps) {
  const { liveClasses } = useData();
  const { isVIP } = useAuth();
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  // Helper to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      } else if (url.length === 11) {
        videoId = url;
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
    } catch {}
    return url;
  };

  const handleWatchClass = (cls: LiveClass) => {
    // All paid batch students or VIP can watch live classes
    if (isVIP || cls.id.startsWith('live_default')) {
      setSelectedClass(cls);
    } else {
      onOpenVip();
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-900 to-stone-950 rounded-3xl p-5 text-white shadow-lg border border-red-500/30 space-y-2">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />

        <div className="flex items-center justify-between relative z-10">
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            BSEB 2027 LIVE CLASSES
          </span>

          {isVIP ? (
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" /> VIP एक्सेस
            </span>
          ) : (
            <button
              onClick={onOpenVip}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" /> VIP जॉइन करें
            </button>
          )}
        </div>

        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            लाइव एवं रिकॉर्डेड कक्षाएं (Live Classes)
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            प्रतिदिन बिहार बोर्ड टॉपर फैकल्टी द्वारा लाइव महामौरथन कक्षाएं और VVI डाउट्स सेशन।
          </p>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {liveClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-stone-500 text-xs">
            अभी कोई लाइव क्लास शेड्यूल नहीं है। एडमिन द्वारा लिंक जोड़ते ही यहाँ दिखाई देगी।
          </div>
        ) : (
          liveClasses.map((cls) => (
            <div
              key={cls.id}
              onClick={() => handleWatchClass(cls)}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform mt-0.5 relative overflow-hidden">
                  <Youtube className="w-7 h-7 text-red-600" />
                  {cls.isLive && (
                    <span className="absolute bottom-1 bg-red-600 text-white text-[8px] font-black px-1 rounded">
                      LIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cls.isLive ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" /> लाइव क्लास
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        रिकॉर्डेड क्लास
                      </span>
                    )}

                    <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
                      {cls.subjectName}
                    </span>

                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {cls.teacherName}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-red-700 transition-colors leading-snug">
                    {cls.title}
                  </h4>

                  {cls.description && (
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {cls.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>क्लास देखें</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  {selectedClass.subjectName}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base line-clamp-1">
                  {selectedClass.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* YouTube Embed Player */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={getEmbedUrl(selectedClass.youtubeUrl)}
                title={selectedClass.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 bg-stone-900/60 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-3">
                <span>शिक्षक: <strong className="text-white">{selectedClass.teacherName}</strong></span>
                <span>समय: <strong className="text-white">{selectedClass.scheduledAt}</strong></span>
              </div>

              <a
                href={selectedClass.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                YouTube पर खोलें <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
