import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, Maximize, Bot } from 'lucide-react';
import { LiveClass } from '../types';

interface SmartAiBoardPlayerProps {
  classItem: LiveClass;
}

export function SmartAiBoardPlayer({ classItem }: SmartAiBoardPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [spokenCharIndex, setSpokenCharIndex] = useState(0);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scriptText = classItem.description || 'Welcome to class. आज हम इस लाइव क्लास में महत्वपूर्ण प्रश्नों और NCERT नोट्स का अध्ययन करेंगे।';
  const isFemale = classItem.teacherName?.toLowerCase().includes('kk') || classItem.teacherName?.toLowerCase().includes('mam' ) || classItem.teacherName?.toLowerCase().includes('priya') || classItem.teacherName?.toLowerCase().includes('female');
  const teacherName = classItem.teacherName || (isFemale ? 'KK Mam' : 'Raj Sir');
  const teacherAvatar = isFemale 
    ? 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png' 
    : 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png';

  // Fast & responsive speech speed: ~14 characters per second
  const totalEstimatedTime = Math.max(10, Math.ceil(scriptText.length / 14));

  // Start speech instantly with zero delay
  const startSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const charIndex = Math.min(scriptText.length, Math.max(0, Math.floor((duration / totalEstimatedTime) * scriptText.length)));
    const textToSpeak = scriptText.substring(charIndex);

    if (!textToSpeak.trim()) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;

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

    utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        const actualIdx = charIndex + event.charIndex;
        setSpokenCharIndex(actualIdx);
        const progressSec = Math.floor((actualIdx / scriptText.length) * totalEstimatedTime);
        setDuration(progressSec);
      }
    };

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setSpokenCharIndex(scriptText.length);
      setDuration(totalEstimatedTime);
    };
    utterance.onerror = () => setIsPlaying(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Timer & Real-time typing sync
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setDuration(prev => {
          if (prev >= totalEstimatedTime) {
            setIsPlaying(false);
            return totalEstimatedTime;
          }
          const next = prev + 1;
          const computedCharIndex = Math.min(scriptText.length, Math.floor((next / totalEstimatedTime) * scriptText.length));
          setSpokenCharIndex(prevIdx => Math.max(prevIdx, computedCharIndex));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalEstimatedTime, scriptText.length]);

  const handlePlaySpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 800);
      return;
    }

    if (duration >= totalEstimatedTime) {
      setDuration(0);
      setSpokenCharIndex(0);
    }
    startSpeech();
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);
  };

  // Auto-play immediately on mount with zero lag
  useEffect(() => {
    const timer = setTimeout(() => {
      startSpeech();
    }, 150);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setDuration(newTime);
    const charIdx = Math.min(scriptText.length, Math.floor((newTime / totalEstimatedTime) * scriptText.length));
    setSpokenCharIndex(charIdx);
    if (isPlaying) {
      startSpeech();
    }
  };

  const handleSkipForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newTime = Math.min(totalEstimatedTime, duration + 10);
    setDuration(newTime);
    const charIdx = Math.min(scriptText.length, Math.floor((newTime / totalEstimatedTime) * scriptText.length));
    setSpokenCharIndex(charIdx);
    if (isPlaying) startSpeech();
  };

  const handleSkipBackward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newTime = Math.max(0, duration - 10);
    setDuration(newTime);
    const charIdx = Math.min(scriptText.length, Math.floor((newTime / totalEstimatedTime) * scriptText.length));
    setSpokenCharIndex(charIdx);
    if (isPlaying) startSpeech();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Clean paginated text display so board is never cluttered ("गाजर-माजर नहीं होना चाहिए")
  const activeText = scriptText.substring(0, Math.max(spokenCharIndex, Math.floor((duration / totalEstimatedTime) * scriptText.length)));
  
  // Split into clean sentence paragraphs for crystal clear board presentation
  const paragraphs = activeText.split(/(?<=[.!?|।\n])/).filter(Boolean);

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
      className="w-full aspect-video min-h-[380px] sm:min-h-[450px] bg-[#0f2a15] rounded-2xl overflow-hidden text-white border-2 border-stone-800 shadow-2xl flex flex-col justify-between relative select-none cursor-pointer group"
    >
      
      {/* Top Digital Board Header Banner */}
      <div className="pt-3 px-4 text-center z-10 bg-[#091b10] border-b border-emerald-900/60 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-emerald-300">BSEB DIGITAL SMART BOARD</span>
        </div>
        <div className="bg-[#163a22] border border-emerald-700/50 px-4 py-1 rounded-lg text-xs font-bold text-amber-300">
          {classItem.subjectName} : {classItem.title}
        </div>
        <span className="text-[10px] text-stone-400 font-mono">HD Live</span>
      </div>

      {/* Center Digital Board Teaching Area with Clean Paginated Text */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-7 text-center relative z-10 overflow-y-auto">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#133820_1px,transparent_1px),linear-gradient(to_bottom,#133820_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-30"></div>

        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          {paragraphs.slice(-3).map((para, idx) => (
            <div 
              key={`board-para-${idx}`} 
              className={`leading-relaxed font-sans transition-all duration-300 ${
                idx === paragraphs.slice(-3).length - 1 
                  ? 'text-sm sm:text-base md:text-lg font-bold text-emerald-100 bg-black/30 p-3 rounded-xl border border-emerald-500/30 shadow-md' 
                  : 'text-xs sm:text-sm text-emerald-300/80 font-medium'
              }`}
            >
              {para}
              {idx === paragraphs.slice(-3).length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-amber-400 ml-1 animate-pulse align-middle"></span>
              )}
            </div>
          ))}
        </div>

        {/* Center Play/Pause Flash Animation on Click */}
        {showCenterIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none animate-fade-in z-30">
            <div className="w-16 h-16 rounded-full bg-stone-900/90 text-white flex items-center justify-center shadow-2xl">
              {isPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
            </div>
          </div>
        )}

        {/* AI Teacher Avatar Box in Corner */}
        <div className="absolute bottom-3 right-3 z-25 bg-stone-900/95 text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 border-2 border-emerald-500/60 backdrop-blur-xs pointer-events-none">
          <div className="relative">
            <img 
              src={teacherAvatar} 
              alt={teacherName} 
              className={`w-10 h-10 rounded-xl object-cover bg-white border-2 ${
                isPlaying ? 'border-emerald-400 animate-pulse' : 'border-amber-400'
              }`}
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900 animate-ping"></div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-xs font-black leading-none text-white">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>{teacherName}</span>
            </div>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">
              {isPlaying ? '🎙️ बोर्ड पर पढ़ा रहे हैं...' : '⏸️ रुके हुए हैं'}
            </p>
          </div>
        </div>
      </div>

      {/* YouTube Style Bottom Control Bar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3.5 py-2.5 space-y-1.5 text-white"
      >
        {/* Progress Scrubber */}
        <div className="w-full bg-stone-700/80 h-2 rounded-full overflow-hidden cursor-pointer relative">
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

            {/* Skip Backward 10s */}
            <button
              onClick={handleSkipBackward}
              className="p-1 hover:bg-white/25 rounded-md text-stone-200 transition-colors cursor-pointer text-[10px] font-bold"
              title="10 सेकंड पीछे करें"
            >
              ⏪ 10s
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={handleSkipForward}
              className="p-1 hover:bg-white/25 rounded-md text-stone-200 transition-colors cursor-pointer text-[10px] font-bold"
              title="10 सेकंड आगे करें"
            >
              10s ⏩
            </button>

            <div className="flex items-center gap-1 font-mono text-[11px] text-stone-200 ml-1">
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
              className="p-1.5 hover:bg-white/25 rounded-lg text-white transition-colors cursor-pointer"
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
