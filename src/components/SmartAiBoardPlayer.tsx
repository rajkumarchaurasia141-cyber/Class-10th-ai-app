import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, Maximize, Bot } from 'lucide-react';
import { LiveClass } from '../types';

interface SmartAiBoardPlayerProps {
  classItem: LiveClass;
}

export function SmartAiBoardPlayer({ classItem }: SmartAiBoardPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scriptText = classItem.description || 'Welcome to class. आज हम इस लाइव क्लास में महत्वपूर्ण प्रश्नों और NCERT नोट्स का अध्ययन करेंगे।';
  const isFemale = classItem.teacherName?.toLowerCase().includes('kk') || classItem.teacherName?.toLowerCase().includes('mam' ) || classItem.teacherName?.toLowerCase().includes('priya') || classItem.teacherName?.toLowerCase().includes('female');
  const teacherName = classItem.teacherName || (isFemale ? 'KK Mam' : 'Raj Sir');
  const teacherAvatar = isFemale 
    ? 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png' 
    : 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png';

  // Accurate Hindi speech speed: ~12 characters per second
  const totalEstimatedTime = Math.max(15, Math.ceil(scriptText.length / 12));

  // Timer & Perfectly Synchronized Typing animation while playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setDuration(prev => {
          if (prev >= totalEstimatedTime) {
            setIsPlaying(false);
            return totalEstimatedTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalEstimatedTime]);

  const handlePlaySpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 800);
      return;
    }

    window.speechSynthesis.cancel();
    if (duration >= totalEstimatedTime) {
      setDuration(0);
    }

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const hindiVoices = voices.filter(v => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hindiVoices.length > 0) {
      if (isFemale) {
        const femaleVoice = hindiVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('google'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.3;
      } else {
        const maleVoice = hindiVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('rahul'));
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.85;
      }
    } else {
      utterance.pitch = isFemale ? 1.3 : 0.85;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);
  };

  // Auto-play on mount immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlaySpeech();
    }, 200);
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlayPause = () => {
    handlePlaySpeech();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate typed length proportionally and perfectly synchronized with duration / speech
  const currentTypedLength = Math.min(
    scriptText.length,
    Math.floor((duration / totalEstimatedTime) * scriptText.length)
  );
  const activeText = scriptText.substring(0, currentTypedLength || (duration === 0 ? 0 : scriptText.length));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={togglePlayPause}
      className="w-full aspect-video min-h-[360px] sm:min-h-[420px] bg-[#fbfaf5] rounded-2xl overflow-hidden text-stone-900 border border-stone-300 shadow-2xl flex flex-col justify-between relative select-none cursor-pointer group"
    >
      
      {/* Top Whiteboard Title Banner */}
      <div className="pt-3 px-4 text-center z-10">
        <div className="inline-block bg-[#f4f2e8] border border-stone-300/80 px-5 py-1.5 rounded-xl shadow-xs">
          <h3 className="font-bold text-xs sm:text-sm text-stone-700 tracking-wide">
            {classItem.subjectName} : {classItem.title}
          </h3>
        </div>
      </div>

      {/* Center Whiteboard Teaching Area with Perfectly Synchronized Live Text */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center relative z-10">
        <div className="max-w-xl mx-auto space-y-2">
          <div className="text-xs sm:text-sm md:text-base font-semibold text-stone-800 leading-relaxed font-sans px-2">
            {activeText}
          </div>
        </div>

        {/* Center Play/Pause Flash Animation on Click */}
        {showCenterIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-stone-900/80 text-white flex items-center justify-center shadow-2xl">
              {isPlaying ? <Play className="w-7 h-7 fill-white ml-1" /> : <Pause className="w-7 h-7 fill-white" />}
            </div>
          </div>
        )}

        {/* AI Robot / Live Teacher Box in Corner */}
        <div className="absolute bottom-3 right-3 z-20 bg-stone-900/90 text-white px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500/50 backdrop-blur-xs animate-fade-in pointer-events-none">
          <div className="relative">
            <img 
              src={teacherAvatar} 
              alt={teacherName} 
              className={`w-9 h-9 rounded-lg object-cover bg-white border-2 ${
                isPlaying ? 'border-emerald-400 animate-pulse' : 'border-amber-400'
              }`}
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900 animate-ping"></div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-[11px] font-black leading-none text-white">
              <Bot className="w-3 h-3 text-emerald-400" />
              <span>{teacherName}</span>
            </div>
            <p className="text-[9px] text-emerald-300 font-semibold mt-0.5">
              {isPlaying ? '🎙️ लाइव बोल रहे हैं...' : '⏸️ रुके हुए हैं'}
            </p>
          </div>
        </div>
      </div>

      {/* YouTube Style Bottom Control Bar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 py-2 space-y-1 text-white"
      >
        {/* Progress Scrubber */}
        <div className="w-full bg-stone-600/80 h-1.5 rounded-full overflow-hidden cursor-pointer relative">
          <div 
            className="bg-red-600 h-full transition-all duration-300 relative"
            style={{ width: `${(duration / totalEstimatedTime) * 100}%` }}
          />
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlayPause}
              className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>

            <div className="flex items-center gap-1 font-mono text-[11px] text-stone-200">
              <span className="font-bold">{formatTime(duration)}</span>
              <span>/</span>
              <span>{formatTime(totalEstimatedTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">
              🎓 {classItem.subjectName}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
