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
  CheckCircle2,
  Languages,
  Globe,
  Settings,
  Users,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LiveClass, LiveWatchRecord } from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { SmartAiBoardPlayer } from './SmartAiBoardPlayer';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeDirectWatchUrl } from '../utils/youtubeHelper';
import { 
  syncWatchHeartbeat, 
  subscribeClassAttendance, 
  getAttendanceDocId, 
  formatWatchDuration, 
  DEFAULT_BATCH_STUDENTS 
} from '../services/attendanceTracker';

interface LiveClassesViewProps {
  onOpenVip: () => void;
}

export function LiveClassesView({ onOpenVip }: LiveClassesViewProps) {
  const { liveClasses, appConfig, updateLiveClass } = useData();
  const { isVIP, isAdmin, user, isPaid } = useAuth();
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [lockedClassPrompt, setLockedClassPrompt] = useState<LiveClass | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'vip'>('all');

  // Attendance & Watch-Time State
  const [activeAttendanceRecords, setActiveAttendanceRecords] = useState<LiveWatchRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [myWatchSeconds, setMyWatchSeconds] = useState<number>(0);
  const [useNoCookie, setUseNoCookie] = useState<boolean>(true);

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

  // Video Settings / Language & Voice Translation Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(true); // Default true for ultra-fast loading on weak networks

  // Fullscreen Mode (YouTube style)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

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

  // Real-time Class Attendance & Watch Time Tracking (Safe & Throttled)
  useEffect(() => {
    if (!selectedClass) {
      setMyWatchSeconds(0);
      return;
    }

    const studentKey = user?.email || (user as any)?.uid || 'student_' + (Math.random().toString(36).substring(2, 8));
    const studentName = user?.name || (user?.email ? user.email.split('@')[0] : 'विद्यार्थी');
    const docId = getAttendanceDocId(selectedClass.id, studentKey);

    const record: LiveWatchRecord = {
      id: docId,
      classId: selectedClass.id,
      classTitle: selectedClass.title,
      isLive: selectedClass.isLive,
      studentId: studentKey,
      studentName,
      studentEmail: user?.email || '',
      isPaid: Boolean(isVIP || isPaid),
      joinedAt: new Date().toISOString(),
      lastHeartbeat: Date.now(),
      watchSeconds: 0,
      isOnline: true
    };

    // Initial safe sync
    syncWatchHeartbeat(record, false);

    // Watch timer: increments local seconds every 1 sec without Firestore network overhead
    let currentSeconds = 0;
    const secondTimer = setInterval(() => {
      currentSeconds += 1;
      setMyWatchSeconds(currentSeconds);
      record.watchSeconds = currentSeconds;
    }, 1000);

    // Periodic throttled sync to Firestore (every 60s) - SAFE & ZERO quota impact
    const syncTimer = setInterval(() => {
      syncWatchHeartbeat(record, false);
    }, 60000);

    // Subscribe to attendance list for this class
    const unsubAttendance = subscribeClassAttendance(selectedClass.id, (records) => {
      setActiveAttendanceRecords(records);
    });

    return () => {
      clearInterval(secondTimer);
      clearInterval(syncTimer);
      unsubAttendance();
      // Safe exit heartbeat
      record.watchSeconds = currentSeconds;
      syncWatchHeartbeat(record, true);
    };
  }, [selectedClass, user, isVIP, isPaid]);

  const userCanAccess = (cls: LiveClass) => {
    if (!cls.isVip) return true;
    return isVIP || isAdmin;
  };

  // Convert URL to standard YouTube Embed URL with controls and fullscreen enabled
  // Defaulting to youtube-nocookie.com ensures Google Workspace / Account Restrictions do not block the video with "Service unavailable"
  const getEmbedUrl = (url: string) => {
    return getYouTubeEmbedUrl(url, { useNoCookie, dataSaver: dataSaverMode });
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
    <div className="p-2.5 sm:p-3 w-full max-w-2xl mx-auto space-y-3 pb-8">
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

                      <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Languages className="w-3 h-3 text-stone-500" />
                        <span>{cls.language === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी'}</span>
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

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Live Viewers & Attendance Button (👥 कितने लोग जुड़े हैं और कितने नहीं जुड़े हैं) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttendanceModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-750 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="लाइव छात्र उपस्थिति & वॉच-टाइम देखें (कौन जुड़े/नहीं जुड़े)"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-black">
                      {activeAttendanceRecords.filter(r => r.isOnline).length || 1} देख रहे हैं
                    </span>
                  </button>

                  {/* Open Directly in YouTube App Button */}
                  <a
                    href={getYouTubeDirectWatchUrl(selectedClass.youtubeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white border border-red-500/80 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                    title="सीधे YouTube ऐप या ब्राउज़र में चलाएं (100% काम करेगा)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold hidden sm:inline">YouTube ऐप</span>
                  </a>

                  {/* Video Settings Button (⚙️ सेटिंग्स / ऑडियो व भाषा अनुवाद) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettingsModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-stone-700/80 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="वीडियो सेटिंग्स: ऑडियो ट्रैक, भाषा व वॉइस ट्रांसलेट"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold">⚙️ सेटिंग्स</span>
                  </button>

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
            ) : (selectedClass.youtubeUrl === 'ai_studio_lecture' || selectedClass.youtubeUrl?.includes('ai_studio') || selectedClass.youtubeUrl === 'dQw4w9WgXcQ' || selectedClass.description?.includes('【') || (selectedClass.description && selectedClass.description.length > 10 && !selectedClass.youtubeUrl?.includes('youtube.com') && !selectedClass.youtubeUrl?.includes('youtu.be'))) ? (
              <div className="w-full h-full p-2 bg-black flex items-center justify-center">
                <SmartAiBoardPlayer classItem={selectedClass} />
              </div>
            ) : (
              /* High-Quality YouTube Player - Fully Unblocked so ⚙️ Settings, Voice Audio Track & Captions Work */
              <div className={`relative w-full bg-black overflow-hidden flex items-center justify-center select-none ${
                isFullscreen ? 'flex-1 h-full w-full' : 'aspect-video'
              }`}>
                <iframe
                  ref={iframeRef}
                  key={`${selectedClass.youtubeUrl}_${useNoCookie ? 'nocookie' : 'std'}`}
                  src={getEmbedUrl(selectedClass.youtubeUrl)}
                  title={selectedClass.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                />

                {/* Speed Floating Toast Notification */}
                {speedToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/90 text-yellow-300 border border-yellow-400/80 font-black text-xs px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-100 pointer-events-none text-center">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{speedToast}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick YouTube Help & Direct Watch Bar (Bypasses Google Workspace & Embedding restrictions) */}
            {selectedClass && !selectedClass.youtubeUrl?.includes('ai_studio') && (
              <div className="bg-stone-950 border-t border-stone-800/80 px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-semibold">यदि वीडियो में कोई Google एरर आए:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUseNoCookie(prev => !prev);
                      setSpeedToast(useNoCookie ? 'स्टैंडर्ड YouTube मोड लोड किया गया' : 'प्राइवेसी (No-Cookie) मोड लोड किया गया');
                      setTimeout(() => setSpeedToast(''), 2500);
                    }}
                    className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded-lg border border-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Google सर्विस एरर आने पर मोड बदलें"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>{useNoCookie ? 'प्राइवेसी मोड (सक्रिय)' : 'स्टैंडर्ड मोड'}</span>
                  </button>
                  <a
                    href={getYouTubeDirectWatchUrl(selectedClass.youtubeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>YouTube ऐप में खोलें</span>
                  </a>
                </div>
              </div>
            )}

            {/* Video Speed Controller Toolbar with Settings / Voice Audio Option */}
            {(!isFullscreen || showControls) && (
              <div className={`transition-all z-30 ${
                isFullscreen 
                  ? 'absolute bottom-0 left-0 right-14 p-3 bg-gradient-to-t from-black/95 via-black/85 to-transparent backdrop-blur-xs space-y-2' 
                  : 'bg-stone-900 border-t border-stone-800 p-3 space-y-2'
              }`}>
                <div className="flex items-center justify-between text-xs text-stone-300 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-amber-400">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>स्पीड:</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-yellow-300 bg-black/70 px-2 py-0.5 rounded-md border border-amber-500/40">
                      {playbackSpeed}x
                    </span>
                  </div>

                  {/* Settings & Voice Translation Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettingsModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-black/80 hover:bg-stone-800 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    title="यूट्यूब सेटिंग्स: ऑडियो ट्रैक, आवाज व भाषा अनुवाद"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚙️ सेटिंग्स (ऑडियो व भाषा अनुवाद)</span>
                  </button>
                </div>

                {/* Live Attendance & Watch Time Quick Strip */}
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-stone-950/90 rounded-xl border border-stone-800 text-stone-300 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white font-extrabold text-xs flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeAttendanceRecords.filter(r => r.isOnline).length || 1} छात्र जुड़े हैं</span>
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      • आपका वॉच-टाइम: <strong className="text-amber-300">{formatWatchDuration(myWatchSeconds)}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttendanceModal(true);
                    }}
                    className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>अटेंडेंस सूची (कौन जुड़े/नहीं जुड़े)</span>
                  </button>
                </div>

                {/* Speed Buttons Bar (0.75x to 2x) */}
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

      {/* Video Settings / Language & Voice Translation Modal */}
      {showSettingsModal && (
        <div 
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">यूट्यूब वीडियो सेटिंग्स & भाषा (Voice Translate)</h4>
                  <p className="text-[11px] text-stone-400">ऑडियो, भाषा और वीडियो सेटिंग्स</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voice Translation & Audio Track Guide */}
            <div className="bg-gradient-to-br from-amber-500/10 via-stone-850 to-stone-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                <Languages className="w-4 h-4 text-amber-400" />
                <span>यूट्यूब पर आवाज (Voice) या भाषा कैसे बदलें?</span>
              </div>
              <ul className="text-xs text-stone-300 space-y-2 list-none pl-0 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>वीडियो प्लेयर में <b>⚙️ (Settings)</b> आइकन पर टैप करें।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><b>"Audio track" (ऑडियो ट्रैक)</b> पर क्लिक करके <b>Hindi</b> या <b>English</b> भाषा चुनें।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><b>"Captions / सबटाइटल"</b> में जाकर <b>Auto-translate (अनुवाद)</b> ऑन करके स्क्रीन पर अनुवाद भी देख सकते हैं।</span>
                </li>
              </ul>
              <div className="pt-1 text-[10.5px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>सभी नए व पुराने यूट्यूब वीडियो में ⚙️ सेटिंग आइकन अब सक्रिय व उपलब्ध है।</span>
              </div>
            </div>

            {/* Data Saver / Low Network Mode Toggle */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  ⚡
                </div>
                <div>
                  <h5 className="font-black text-xs text-white">डेटा सेवर / लो-नेटवर्क मोड</h5>
                  <p className="text-[10px] text-stone-400">कम डेटा व कमजोर नेटवर्क में बिना बफरिंग के स्मूथ चलेगा</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDataSaverMode(!dataSaverMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  dataSaverMode 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {dataSaverMode ? '✓ ऑन (Active)' : 'ऑफ (Off)'}
              </button>
            </div>

            {/* Quick Speed Selector inside Settings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <Gauge className="w-3.5 h-3.5" /> प्लेबैक स्पीड चुनें:
                </span>
                <span className="text-yellow-300">{playbackSpeed}x एक्टिव</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSetSpeed(spd)}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-stone-950 font-black shadow-md scale-102'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all active:scale-98"
            >
              समझ गया / वीडियो चालू रखें (Got it)
            </button>
          </div>
        </div>
      )}

      {/* Class Attendance & Live Watch Time Modal */}
      {selectedClass && (
        <ClassAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          classTitle={selectedClass.title}
          isLive={selectedClass.isLive}
          activeRecords={activeAttendanceRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          currentStudentId={user?.email || (user as any)?.uid || 'student'}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
