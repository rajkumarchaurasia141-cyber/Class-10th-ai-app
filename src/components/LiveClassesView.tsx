import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Play, 
  Lock, 
  Crown, 
  Calendar, 
  User, 
  Sparkles, 
  X, 
  Gift, 
  MessageCircle, 
  ArrowRight,
  ArrowLeft,
  Video,
  Gauge,
  ShieldCheck,
  Maximize,
  Minimize,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LiveClass } from '../types';

interface LiveClassesViewProps {
  onOpenVip: () => void;
}

export function LiveClassesView({ onOpenVip }: LiveClassesViewProps) {
  const { liveClasses, appConfig, updateLiveClass } = useData();
  const { isVIP, isAdmin } = useAuth();
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [lockedClassPrompt, setLockedClassPrompt] = useState<LiveClass | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'vip'>('all');

  // Real-time clock for scheduled countdowns
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isClassScheduledFuture = (cls: LiveClass) => {
    if (cls.publishType === 'scheduled' && cls.scheduledDateTime) {
      const target = new Date(cls.scheduledDateTime).getTime();
      return !isNaN(target) && target > currentTime;
    }
    return false;
  };

  const getRemainingTime = (scheduledDateTime?: string) => {
    if (!scheduledDateTime) return null;
    const diff = new Date(scheduledDateTime).getTime() - currentTime;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, diff };
  };

  // Video Player Controls & Speed (up to 4x)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [speedToast, setSpeedToast] = useState<string>('');

  // Fullscreen Mode (YouTube style)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];

  // Auto-detect physical phone orientation: when phone is turned landscape, automatically adapt full screen
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      if (selectedClass) {
        if (isLandscape) {
          setIsFullscreen(true);
        } else if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          setIsFullscreen(false);
        }
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [selectedClass]);

  const userCanAccess = (cls: LiveClass) => {
    if (!cls.isVip) return true;
    return isVIP || isAdmin;
  };

  // Convert URL to Privacy-Enhanced & Distraction-Free embed URL with Fullscreen enabled (fs=1)
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
        // enablejsapi=1, fs=1 (allow fullscreen), modestbranding=1, rel=0 (no external videos)
        return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&controls=1&fs=0&playsinline=1&color=white`;
      }
    } catch {}
    return url;
  };

  const handleWatchClass = (cls: LiveClass) => {
    if (!userCanAccess(cls)) {
      setLockedClassPrompt(cls);
      return;
    }
    setPlaybackSpeed(1);
    setIsFullscreen(window.innerWidth > window.innerHeight);
    setShowControls(true);
    setSelectedClass(cls);
  };

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  }, []);

  // Toggle Fullscreen (YouTube style)
  const toggleFullscreen = async () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    try {
      if (nextState) {
        resetControlsTimer();
        const el = playerContainerRef.current || document.documentElement;
        if (el?.requestFullscreen) {
          await el.requestFullscreen().catch(() => {});
        } else if ((el as any)?.webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen().catch(() => {});
        }

        try {
          if ((screen.orientation as any)?.lock) {
            await (screen.orientation as any).lock('landscape').catch(() => {});
          }
        } catch {}
      } else {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          } else if ((document as any)?.webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen().catch(() => {});
          }
        }

        try {
          if (screen.orientation?.unlock) {
            screen.orientation.unlock();
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Fullscreen/orientation toggle:', e);
    }
  };

  // Sync native fullscreen change events (e.g. user presses hardware back or Esc)
  useEffect(() => {
    const handleFsChange = () => {
      const isNativeFsActive = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNativeFsActive && window.innerWidth <= window.innerHeight) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Send speed control command directly to player
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setPlaybackRate',
            args: [speed]
          }),
          '*'
        );
      } catch (e) {
        console.warn('Failed to send setPlaybackRate:', e);
      }
    }
    setSpeedToast(`⚡ स्पीड ${speed}x सेट की गई`);
    setTimeout(() => setSpeedToast(''), 2000);
  };

  // Auto-apply speed once iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
        if (playbackSpeed !== 1) {
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({
                event: 'command',
                func: 'setPlaybackRate',
                args: [playbackSpeed]
              }),
              '*'
            );
          }, 600);
        }
      } catch {}
    }
  };

  const freeCount = liveClasses.filter(c => !c.isVip).length;
  const vipCount = liveClasses.filter(c => c.isVip).length;

  const filteredClasses = liveClasses.filter((cls) => {
    if (activeFilter === 'free') return !cls.isVip;
    if (activeFilter === 'vip') return cls.isVip;
    return true;
  });

  const whatsappNumber = appConfig.whatsappNumber || '9241511070';

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-900 to-stone-950 rounded-3xl p-5 text-white shadow-lg border border-red-500/30 space-y-2">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />

        <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            BSEB फुल सिलेबस LIVE CLASSES
          </span>

          {(isVIP || isAdmin) ? (
            <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-300" />
              {isAdmin ? 'एडमिन मोड' : 'VIP एक्टिव (सभी अनलॉक)'}
            </span>
          ) : (
            <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              फ्री मोड (डेमो चालू)
            </span>
          )}
        </div>

        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            लाइव एवं रिकॉर्डेड कक्षाएं (Live Classes)
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            प्रतिदिन बिहार बोर्ड टॉपर फैकल्टी द्वारा कक्षाएं • 4x स्पीड व फुल स्क्रीन मोड।
          </p>
        </div>
      </div>

      {/* Notice Banner for Non-Paid Students */}
      {!isVIP && !isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border border-amber-400/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                <span>VIP लाइव कक्षाएं केवल पेड छात्रों के लिए सुरक्षित हैं</span>
              </h4>
              <p className="text-[11px] text-stone-600">
                🎁 <b>फ्री डेमो</b> क्लास आप अभी देख सकते हैं। 🔒 <b>VIP कक्षाएं</b> देखने के लिए ₹299 में VIP कोर्स अनलॉक करें।
              </p>
            </div>
          </div>
          <button
            onClick={onOpenVip}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs px-3.5 py-2 rounded-xl shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all flex items-center gap-1"
          >
            <span>VIP लें (₹299)</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
          }`}
        >
          सभी कक्षाएं ({liveClasses.length})
        </button>

        <button
          onClick={() => setActiveFilter('free')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'free'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>फ्री डेमो ({freeCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('vip')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'vip'
              ? 'bg-amber-500 text-stone-950 shadow-xs'
              : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>केवल VIP ({vipCount})</span>
        </button>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-stone-500 text-xs">
            इस फ़िल्टर में कोई क्लास उपलब्ध नहीं है।
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const hasAccess = userCanAccess(cls);

            return (
              <div
                key={cls.id}
                onClick={() => handleWatchClass(cls)}
                className={`bg-white hover:bg-slate-50 border rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group relative overflow-hidden ${
                  cls.isVip 
                    ? 'border-amber-300/80 bg-gradient-to-r from-amber-500/5 via-white to-white' 
                    : 'border-emerald-300/80 bg-gradient-to-r from-emerald-500/5 via-white to-white'
                }`}
              >
                {/* Access Ribbon Top Right */}
                {cls.isVip ? (
                  <span className={`absolute -top-1 -right-1 text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-1 ${
                    hasAccess 
                      ? 'bg-amber-500 text-stone-950' 
                      : 'bg-red-600 text-white animate-pulse'
                  }`}>
                    {hasAccess ? (
                      <>
                        <Crown className="w-2.5 h-2.5" />
                        <span>VIP अनलॉक</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5" />
                        <span>केवल VIP लॉक्ड</span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-1">
                    <Gift className="w-2.5 h-2.5" />
                    <span>फ्री डेमो</span>
                  </span>
                )}

                <div className="flex items-start gap-3 w-full sm:w-auto">
                  {/* Clean In-App Class Icon */}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform mt-0.5 relative overflow-hidden ${
                    cls.isVip
                      ? (hasAccess ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-900 text-amber-400 border-amber-500/50')
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {cls.isVip && !hasAccess ? (
                      <Lock className="w-7 h-7 text-amber-400" />
                    ) : (
                      <Video className={`w-7 h-7 ${cls.isVip ? 'text-amber-700' : 'text-emerald-700'}`} />
                    )}

                    {cls.isLive && (
                      <span className="absolute bottom-1 bg-red-600 text-white text-[8px] font-black px-1 rounded">
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isClassScheduledFuture(cls) ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-700" /> ⏳ शेड्यूल्ड (${cls.scheduledAt})
                        </span>
                      ) : cls.isLive ? (
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

                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {cls.scheduledAt}
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

                    {/* Notice if locked */}
                    {cls.isVip && !hasAccess && (
                      <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>यह क्लास केवल पेड (VIP) छात्रों के लिए सुरक्षित है।</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {hasAccess ? (
                    isClassScheduledFuture(cls) ? (
                      <span className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors">
                        <Clock className="w-3.5 h-3.5 text-stone-950" />
                        <span>शेड्यूल देखें</span>
                      </span>
                    ) : (
                      <span className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{cls.isLive ? 'लाइव देखें' : 'क्लास देखें'}</span>
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLockedClassPrompt(cls);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-amber-300 transition-all cursor-pointer animate-pulse"
                    >
                      <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>VIP लें (₹299)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Locked Class Prompt Modal */}
      {lockedClassPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl p-6 shadow-2xl text-stone-900 space-y-4 relative overflow-hidden">
            <button
              onClick={() => setLockedClassPrompt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-amber-100 text-amber-800 border-2 border-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1.5">
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                केवल पेड छात्रों के लिए
              </span>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                VIP लाइव क्लास लॉक है
              </h3>
              <p className="text-xs text-stone-600 font-semibold px-2">
                "{lockedClassPrompt.title}"
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>इस लाइव क्लास को अनलॉक कैसे करें?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                एडमिन द्वारा यह क्लास केवल <b>पेड (VIP) छात्रों</b> के लिए निर्धारित की गई है। मात्र <b>₹299</b> का बोर्ड क्रैश कोर्स ज्वाइन करते ही आपकी सभी VIP लाइव कक्षाएं, रिकॉर्डेड वीडियो और स्पेशल गेस पेपर तुरंत अनलॉक हो जाएंगे।
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setLockedClassPrompt(null);
                  onOpenVip();
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Crown className="w-4 h-4" />
                <span>VIP कोर्स परचेस करें (₹299)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`नमस्ते सर, मुझे Live Class "${lockedClassPrompt.title}" देखनी है। कृपया मेरा VIP कोर्स (₹299) एक्टिवेट करें।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर संपर्क करें ({whatsappNumber})</span>
              </a>

              <button
                type="button"
                onClick={() => setLockedClassPrompt(null)}
                className="w-full text-stone-500 hover:text-stone-800 text-xs font-semibold py-1 cursor-pointer"
              >
                बाद में करेंगे
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal with YouTube-style Fullscreen (Landscape) & 4x Speed */}
      {selectedClass && (
        <div 
          ref={playerContainerRef}
          onClick={() => {
            if (isFullscreen) {
              resetControlsTimer();
            }
          }}
          className={`fixed inset-0 z-50 bg-black flex flex-col ${
            isFullscreen 
              ? 'w-screen h-screen p-0 m-0 overflow-hidden' 
              : 'p-3 sm:p-4 items-center justify-center bg-black/95 backdrop-blur-md'
          }`}
        >
          <div className={`w-full overflow-hidden text-white flex flex-col relative transition-all ${
            isFullscreen 
              ? 'h-full flex-1 max-w-none rounded-none border-0 bg-black' 
              : 'max-w-2xl rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-200'
          }`}>
            
            {/* Modal Header: Top Bar */}
            {(!isFullscreen || showControls) && (
              <div className={`flex items-center justify-between gap-2 z-30 transition-all ${
                isFullscreen 
                  ? 'absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-xs' 
                  : 'p-3 sm:p-4 border-b border-stone-800 bg-stone-900/90'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  {isFullscreen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                      }}
                      className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shrink-0 mr-1"
                      title="Exit Full Screen"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0 shadow-xs ${
                    selectedClass.isVip ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {selectedClass.isVip ? 'VIP' : 'DEMO'} • {selectedClass.subjectName}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm line-clamp-1 text-white drop-shadow-sm">
                    {selectedClass.title}
                  </h3>
                </div>

                {/* Header Action Buttons (Only standard icons like YouTube, no text labels) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* YouTube style Fullscreen toggle icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="w-8 h-8 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-700/60 backdrop-blur-md shadow-md active:scale-95"
                    title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <Maximize className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(false);
                      setSelectedClass(null);
                    }}
                    className="w-8 h-8 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-700/60 backdrop-blur-md shadow-md"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Video Player Guard or Player */}
            {selectedClass.isVip && !userCanAccess(selectedClass) ? (
              <div className="p-8 text-center space-y-4 bg-stone-900 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">यह क्लास केवल पेड (VIP) छात्रों के लिए है</h3>
                <p className="text-stone-400 text-xs max-w-md mx-auto">
                  कृपया ₹299 का बोर्ड क्रैश कोर्स ज्वाइन करें और सभी लाइव कक्षाएं व रिकॉर्डेड वीडियो अनलॉक करें।
                </p>
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    onOpenVip();
                  }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                >
                  अभी VIP कोर्स अनलॉक करें (₹299)
                </button>
              </div>
            ) : isClassScheduledFuture(selectedClass) && getRemainingTime(selectedClass.scheduledDateTime) ? (
              /* Scheduled Class Waiting & Live Countdown Screen (Automatic Start when Time Arrives) */
              (() => {
                const rem = getRemainingTime(selectedClass.scheduledDateTime)!;
                return (
                  <div className={`relative w-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-4 select-none ${
                    isFullscreen ? 'flex-1 h-full w-full' : 'aspect-video'
                  }`}>
                    <div className="relative flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-red-600/15 animate-ping absolute" />
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border-2 border-amber-500/50 flex items-center justify-center relative shadow-xl">
                        <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        लाइव स्ट्रीम शेड्यूल्ड है (Standby)
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white line-clamp-2">
                        {selectedClass.title}
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        विषय: <strong className="text-amber-300">{selectedClass.subjectName}</strong> • शिक्षक: <strong className="text-white">{selectedClass.teacherName}</strong>
                      </p>
                    </div>

                    {/* Live Real-time Countdown Box */}
                    <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5 shadow-2xl w-full max-w-xs mx-auto space-y-2">
                      <div className="text-[10px] font-extrabold text-stone-400 flex items-center justify-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>क्लास शुरू होने में बाकी समय:</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                          <span className="block text-lg sm:text-xl font-black text-amber-400">
                            {String(rem.hours).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-stone-400">घंटे</span>
                        </div>
                        <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                          <span className="block text-lg sm:text-xl font-black text-amber-400">
                            {String(rem.minutes).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-stone-400">मिनट</span>
                        </div>
                        <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                          <span className="block text-lg sm:text-xl font-black text-amber-400">
                            {String(rem.seconds).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-stone-400">सेकंड</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] text-stone-400">
                        🔔 निर्धारित समय: <b>{selectedClass.scheduledAt}</b>
                        <br />
                        <span className="text-emerald-400 font-semibold text-[9.5px]">
                          ✓ समय होते ही यह क्लास अपने आप इसी स्क्रीन पर शुरू हो जाएगी।
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 border-t border-stone-800">
                          <button
                            type="button"
                            onClick={() => {
                              updateLiveClass(selectedClass.id, {
                                publishType: 'instant',
                                isLive: true,
                                scheduledDateTime: new Date().toISOString()
                              });
                              setSpeedToast('क्लास को तुरंत लाइव कर दिया गया है!');
                              setTimeout(() => setSpeedToast(''), 3000);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>एडमिन: अभी तुरंत लाइव शुरू करें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Realistic In-App Player - ZERO YouTube Distractions & Fully Masked */
              <div className={`relative w-full bg-black overflow-hidden flex items-center justify-center select-none ${
                isFullscreen ? 'flex-1 h-full w-full' : 'aspect-video'
              }`}>
                {/* 1. Sandboxed iframe without allow-popups prevents opening youtube.com */}
                <iframe
                  ref={iframeRef}
                  src={getEmbedUrl(selectedClass.youtubeUrl)}
                  title={selectedClass.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                />

                {/* 2. Top Shield Bar: Masks YouTube Title, Channel Avatar & "Watch on YouTube" button completely */}
                <div className="absolute top-0 left-0 right-0 h-11 bg-gradient-to-b from-stone-950 via-stone-950/95 to-transparent z-20 px-3 py-1.5 flex items-center justify-between pointer-events-auto select-none border-b border-white/5 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      {selectedClass.isLive ? 'LIVE' : 'CLASS'}
                    </span>
                    <span className="text-white text-xs font-bold truncate max-w-[200px] sm:max-w-md drop-shadow-sm">
                      {selectedClass.subjectName} • {selectedClass.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 font-extrabold bg-stone-900/90 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>विद्या एजेंट प्लेयर</span>
                  </div>
                </div>

                {/* 3. Bottom-Right Corner Shield: Masks YouTube Logo Watermark completely with Fullscreen & BSEB Badge */}
                <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1.5 pointer-events-auto">
                  <div className="bg-stone-950/95 text-stone-200 border border-stone-700/80 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>BSEB 10वीं</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="w-9 h-9 rounded-lg bg-stone-900/95 hover:bg-stone-800 text-white hover:text-amber-300 flex items-center justify-center transition-all backdrop-blur-md border border-stone-700/80 shadow-xl active:scale-90 cursor-pointer"
                    title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 stroke-[2.2]" />
                    ) : (
                      <Maximize className="w-5 h-5 stroke-[2.2]" />
                    )}
                  </button>
                </div>

                {/* Speed Floating Toast Notification */}
                {speedToast && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-black/90 text-yellow-300 border border-yellow-400/80 font-black text-xs px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-100 pointer-events-none text-center">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{speedToast}</span>
                  </div>
                )}
              </div>
            )}

            {/* Video Speed Controller Toolbar (Up to 4x Speed) */}
            {(!isFullscreen || showControls) && (
              <div className={`transition-all z-30 ${
                isFullscreen 
                  ? 'absolute bottom-0 left-0 right-14 p-3 bg-gradient-to-t from-black/95 via-black/85 to-transparent backdrop-blur-xs space-y-1.5' 
                  : 'bg-stone-900 border-t border-stone-800 p-3 space-y-1.5'
              }`}>
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>स्पीड कंट्रोलर (4x तक):</span>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-black text-yellow-300 bg-black/70 px-2 py-0.5 rounded-md border border-amber-500/40">
                    {playbackSpeed}x
                  </span>
                </div>

                {/* Speed Buttons Bar (0.75x to 4x) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetSpeed(speed);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 select-none ${
                        playbackSpeed === speed
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md scale-105 ring-2 ring-yellow-300'
                          : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/80 backdrop-blur-xs'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Info Footer (Only in normal dialog mode) */}
            {!isFullscreen && (
              <div className="bg-stone-950 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 p-3 sm:p-3.5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>शिक्षक: <strong className="text-white">{selectedClass.teacherName}</strong></span>
                  <span>समय: <strong className="text-white">{selectedClass.scheduledAt}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-stone-300 font-semibold">100% डिस्ट्रैक्शन-फ्री स्टडी प्लेयर</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
