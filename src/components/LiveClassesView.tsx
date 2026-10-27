import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Crown,
  Calendar,
  User,
  Sparkles,
  X,
  Gift,
  MessageCircle,
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
  Settings,
  Users,
  Eye,
  ExternalLink,
  RefreshCw,
  Search,
  MoreVertical,
  ThumbsUp,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Subtitles,
  PictureInPicture2,
  RotateCcw,
  Pin,
  Filter
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { safeSetDoc } from '../utils/firestoreSafe';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LiveClass, LiveWatchRecord, UserVideoInteraction, VideoCategoryTab } from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { SmartAiBoardPlayer } from './SmartAiBoardPlayer';
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeDirectWatchUrl,
  getYouTubeThumbnailUrl
} from '../utils/youtubeHelper';
import {
  syncWatchHeartbeat,
  subscribeClassAttendance,
  getAttendanceDocId,
  formatWatchDuration,
  DEFAULT_BATCH_STUDENTS
} from '../services/attendanceTracker';
import { AdsterraBanner } from './AdsterraBanner';

interface LiveClassesViewProps {
  onOpenVip: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const CATEGORY_CHIPS: { id: VideoCategoryTab | 'Saved' | 'Continue'; label: string; hindi: string }[] = [
  { id: 'All', label: 'All', hindi: 'सभी (All)' },
  { id: 'Live', label: 'Live', hindi: '🔴 लाइव (Live)' },
  { id: 'Classes', label: 'Classes', hindi: '📚 क्लासेस' },
  { id: 'Crash Course', label: 'Crash Course', hindi: '⚡ क्रैश कोर्स' },
  { id: 'Shorts', label: 'Shorts', hindi: '📱 शॉर्ट्स' },
  { id: 'Recently Added', label: 'Recently Added', hindi: '🆕 हाल ही में जोड़े गए' },
  { id: 'Continue', label: 'Continue Watching', hindi: '⏱️ देखना जारी रखें' },
  { id: 'Saved', label: 'Saved', hindi: '🔖 सेव किए गए' }
];

// Format seconds into MM:SS or HH:MM:SS
function formatTimeDisplay(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Format relative upload time in Hindi
function formatRelativeDate(isoDate?: string, fallbackLabel?: string): string {
  if (!isoDate) return fallbackLabel || 'हाल ही में';
  const time = new Date(isoDate).getTime();
  if (isNaN(time)) return fallbackLabel || 'हाल ही में';
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSec < 60) return 'अभी-अभी';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} घंटे पहले`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays} दिन पहले`;
  return new Date(isoDate).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Format compact views count (e.g. 4.8K)
function formatViewsCount(count?: number): string {
  const num = typeof count === 'number' && count > 0 ? count : 1240;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

// Subject visual theme helper for resilient 16:9 poster thumbnails
function getSubjectPosterTheme(subjectName: string) {
  if (subjectName.includes('गणित')) {
    return {
      gradient: 'from-blue-950 via-indigo-900 to-slate-950',
      accent: 'bg-amber-400 text-slate-950',
      badge: '📐 BSEB 10th MATHS'
    };
  }
  if (subjectName.includes('विज्ञान')) {
    return {
      gradient: 'from-emerald-950 via-teal-900 to-slate-950',
      accent: 'bg-emerald-400 text-slate-950',
      badge: '🔬 BSEB 10th SCIENCE'
    };
  }
  if (subjectName.includes('सामाजिक')) {
    return {
      gradient: 'from-amber-950 via-orange-900 to-stone-950',
      accent: 'bg-amber-300 text-stone-950',
      badge: '🏛️ SOCIAL SCIENCE'
    };
  }
  if (subjectName.includes('संस्कृत')) {
    return {
      gradient: 'from-rose-950 via-red-900 to-stone-950',
      accent: 'bg-yellow-400 text-stone-950',
      badge: '🪔 संस्कृत पीयूषम्'
    };
  }
  if (subjectName.includes('हिन्दी')) {
    return {
      gradient: 'from-purple-950 via-fuchsia-900 to-stone-950',
      accent: 'bg-pink-300 text-stone-950',
      badge: '📖 गोधूलि & वर्णिका'
    };
  }
  return {
    gradient: 'from-red-950 via-stone-900 to-black',
    accent: 'bg-amber-400 text-stone-950',
    badge: '🔥 VVI TOPPER CLASS'
  };
}

export function LiveClassesView({ onOpenVip }: LiveClassesViewProps) {
  const { liveClasses, appConfig, updateLiveClass } = useData();
  const { isVIP, isAdmin, user, isPaid } = useAuth();

  // Theme State (Clean Light Theme default as requested, with optional Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bseb_live_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bseb_live_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Search, Category & Subject Filter State
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<VideoCategoryTab | 'Saved' | 'Continue'>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Selected Video Player State
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [lockedClassPrompt, setLockedClassPrompt] = useState<LiveClass | null>(null);
  const [menuOpenClass, setMenuOpenClass] = useState<LiveClass | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState<boolean>(false);

  // Broken image fallback tracker
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  // User Interactions (Likes, Saved/Watch Later, Resume Progress) persisted in localStorage + Firestore
  const userKey = user?.email || (user as any)?.uid || 'guest_student';
  const interactionsStorageKey = `bseb_video_interactions_${userKey}`;

  const [interactions, setInteractions] = useState<Record<string, UserVideoInteraction>>(() => {
    try {
      const raw = localStorage.getItem(interactionsStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveInteraction = useCallback(
    (videoId: string, patch: Partial<UserVideoInteraction>) => {
      setInteractions((prev) => {
        const existing = prev[videoId] || { videoId, userId: userKey };
        const updatedItem: UserVideoInteraction = {
          ...existing,
          ...patch,
          videoId,
          userId: userKey,
          lastWatchedAt: new Date().toISOString()
        };
        const nextMap = { ...prev, [videoId]: updatedItem };
        try {
          localStorage.setItem(interactionsStorageKey, JSON.stringify(nextMap));
        } catch {}

        // Persist asynchronously to Firestore for authenticated users
        if (user?.email) {
          const docId = `${user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${videoId}`;
          safeSetDoc(doc(db, 'video_interactions', docId), updatedItem, { merge: true }).catch(() => {});
        }
        return nextMap;
      });
    },
    [interactionsStorageKey, user?.email, userKey]
  );

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

  const isClassScheduledFuture = useCallback(
    (cls: LiveClass) => {
      if (
        (cls.publishType === 'scheduled' || cls.streamStatus === 'scheduled') &&
        cls.scheduledDateTime
      ) {
        const target = new Date(cls.scheduledDateTime).getTime();
        return !isNaN(target) && target > currentTime;
      }
      return false;
    },
    [currentTime]
  );

  const getRemainingTime = (scheduledDateTime?: string) => {
    if (!scheduledDateTime) return null;
    const diff = new Date(scheduledDateTime).getTime() - currentTime;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, diff };
  };

  // Native HTML5 <video> & YouTube Player Refs & Controls
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [speedToast, setSpeedToast] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Native HTML5 video playback state
  const [isNativePlaying, setIsNativePlaying] = useState<boolean>(false);
  const [isNativeMuted, setIsNativeMuted] = useState<boolean>(false);
  const [nativeVolume, setNativeVolume] = useState<number>(1);
  const [nativeCurrentTime, setNativeCurrentTime] = useState<number>(0);
  const [nativeDuration, setNativeDuration] = useState<number>(0);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);
  const [pipSupported, setPipSupported] = useState<boolean>(false);

  useEffect(() => {
    setPipSupported(
      typeof document !== 'undefined' && Boolean((document as any).pictureInPictureEnabled)
    );
  }, []);

  // Auto-detect physical phone orientation
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

  // Real-time Class Attendance & Watch Time + Continue Watching Progress Tracking
  useEffect(() => {
    if (!selectedClass) {
      setMyWatchSeconds(0);
      return;
    }

    const studentKey =
      user?.email || (user as any)?.uid || 'student_' + Math.random().toString(36).substring(2, 8);
    const studentName = user?.name || (user?.email ? user.email.split('@')[0] : 'विद्यार्थी');
    const docId = getAttendanceDocId(selectedClass.id, studentKey);

    const record: LiveWatchRecord = {
      id: docId,
      classId: selectedClass.id,
      classTitle: selectedClass.title,
      isLive: Boolean(selectedClass.isLive || selectedClass.streamStatus === 'live'),
      studentId: studentKey,
      studentName,
      studentEmail: user?.email || '',
      isPaid: Boolean(isVIP || isPaid),
      joinedAt: new Date().toISOString(),
      lastHeartbeat: Date.now(),
      watchSeconds: 0,
      isOnline: true
    };

    syncWatchHeartbeat(record, false);

    const initialResume = interactions[selectedClass.id]?.watchProgressSeconds || 0;
    let currentSeconds = 0;

    const secondTimer = setInterval(() => {
      currentSeconds += 1;
      setMyWatchSeconds(currentSeconds);
      record.watchSeconds = currentSeconds;

      // Save progress every 5 seconds for Continue Watching (if not using native video timeupdate)
      if (currentSeconds % 5 === 0 && !nativeVideoRef.current) {
        const estDuration = selectedClass.durationSeconds || 2700;
        saveInteraction(selectedClass.id, {
          watchProgressSeconds: Math.min(initialResume + currentSeconds, estDuration),
          durationSeconds: estDuration
        });
      }
    }, 1000);

    const syncTimer = setInterval(() => {
      syncWatchHeartbeat(record, false);
    }, 60000);

    const unsubAttendance = subscribeClassAttendance(selectedClass.id, (records) => {
      setActiveAttendanceRecords(records);
    });

    return () => {
      clearInterval(secondTimer);
      clearInterval(syncTimer);
      unsubAttendance();
      record.watchSeconds = currentSeconds;
      syncWatchHeartbeat(record, true);
    };
  }, [selectedClass?.id, user, isVIP, isPaid]);

  const userCanAccess = (cls: LiveClass) => {
    if (!cls.isVip) return true;
    return isVIP || isAdmin;
  };

  // Determine playback mode for a video item
  const getPlaybackMode = (cls: LiveClass): 'ai_board' | 'native_video' | 'youtube' => {
    const url = cls.playbackUrl || cls.youtubeUrl || '';
    if (
      cls.videoSourceType === 'ai_board' ||
      url === 'ai_studio_lecture' ||
      url.includes('ai_studio') ||
      cls.youtubeUrl === 'dQw4w9WgXcQ' ||
      (cls.description &&
        cls.description.length > 10 &&
        !url.includes('youtube.com') &&
        !url.includes('youtu.be') &&
        !url.match(/\.(mp4|webm|ogg|m3u8)$/i) &&
        !url.startsWith('/uploads/'))
    ) {
      return 'ai_board';
    }
    if (
      cls.videoSourceType === 'video_file' ||
      cls.videoSourceType === 'hls_stream' ||
      url.match(/\.(mp4|webm|ogg|m3u8)$/i) ||
      url.startsWith('/uploads/') ||
      url.startsWith('data:video/')
    ) {
      return 'native_video';
    }
    return 'youtube';
  };

  // Open a video in the YouTube-style player page
  const handleWatchClass = (cls: LiveClass) => {
    if (!userCanAccess(cls)) {
      setLockedClassPrompt(cls);
      return;
    }
    setPlaybackSpeed(1);
    setDescriptionExpanded(false);
    setIsFullscreen(window.innerWidth > window.innerHeight);
    setShowControls(true);
    setSelectedClass(cls);

    // Increment view count
    const currentViews = cls.viewsCount || 1240;
    updateLiveClass(cls.id, { viewsCount: currentViews + 1 }).catch(() => {});

    // Show resume toast if previously watched > 10s
    const savedSec = interactions[cls.id]?.watchProgressSeconds || 0;
    if (savedSec > 10) {
      setSpeedToast(`⏱️ ${formatTimeDisplay(savedSec)} से देखना जारी रखा गया`);
      setTimeout(() => setSpeedToast(''), 3000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Like on a video
  const handleToggleLike = (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLiked = Boolean(interactions[cls.id]?.liked);
    const nextLiked = !currentLiked;
    saveInteraction(cls.id, { liked: nextLiked });

    const baseLikes = cls.likesCount || 250;
    const nextLikesCount = Math.max(0, baseLikes + (nextLiked ? 1 : -1));
    updateLiveClass(cls.id, { likesCount: nextLikesCount }).catch(() => {});

    setSpeedToast(nextLiked ? '👍 वीडियो को लाइक किया गया!' : 'लाइक हटाया गया');
    setTimeout(() => setSpeedToast(''), 2000);
  };

  // Toggle Save / Watch Later on a video
  const handleToggleSave = (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentSaved = Boolean(interactions[cls.id]?.saved);
    const nextSaved = !currentSaved;
    saveInteraction(cls.id, { saved: nextSaved });

    setSpeedToast(
      nextSaved ? '🔖 "सेव किए गए (Watch Later)" में जोड़ा गया!' : 'सेव सूची से हटाया गया'
    );
    setTimeout(() => setSpeedToast(''), 2200);
  };

  // Native Share or Copy Link
  const handleShareVideo = async (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = window.location.origin + '/?tab=live&video=' + encodeURIComponent(cls.id);
    const shareTitle = `${cls.title} | पढ़ेगा बिहार Live`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${cls.teacherName} की यह महत्वपूर्ण क्लास देखें: ${cls.title}`,
          url: shareUrl
        });
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setSpeedToast('🔗 वीडियो का लिंक कॉपी हो गया! अब दोस्तों को शेयर करें।');
      setTimeout(() => setSpeedToast(''), 2500);
    } catch {
      setSpeedToast('शेयर लिंक तैयार है');
      setTimeout(() => setSpeedToast(''), 2000);
    }
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
      } else {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          } else if ((document as any)?.webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen().catch(() => {});
          }
        }
      }
    } catch {}
  };

  // Picture-in-Picture for native HTML5 <video>
  const handleTogglePiP = async () => {
    const videoEl = nativeVideoRef.current;
    if (!videoEl) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if ((videoEl as any).requestPictureInPicture) {
        await (videoEl as any).requestPictureInPicture();
      }
    } catch {
      setSpeedToast('Picture-in-Picture इस ब्राउज़र में उपलब्ध नहीं है');
      setTimeout(() => setSpeedToast(''), 2000);
    }
  };

  // Set Playback Speed on both Native <video> and YouTube IFrame
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = speed;
    }
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
      } catch {}
    }
    setSpeedToast(`⚡ प्लेबैक स्पीड ${speed}x सेट की गई`);
    setTimeout(() => setSpeedToast(''), 2000);
  };

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
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

  // Embed URL with resume support (`start` param)
  const getEmbedUrlWithResume = (cls: LiveClass) => {
    const base = getYouTubeEmbedUrl(cls.youtubeUrl, { useNoCookie, dataSaver: dataSaverMode });
    const resumeSec = Math.floor(interactions[cls.id]?.watchProgressSeconds || 0);
    if (resumeSec > 10 && !cls.isLive && base.includes('?')) {
      return `${base}&start=${resumeSec}`;
    }
    return base;
  };

  // STRICT ADMIN CONTENT FILTER:
  // Ordinary users ONLY see content that has been approved & published by the Admin!
  const publishedClasses = useMemo(() => {
    return liveClasses
      .filter((cls) => {
        const status = cls.publicationStatus || 'published';
        return status === 'published';
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [liveClasses]);

  const liveNowCount = useMemo(
    () => publishedClasses.filter((c) => c.isLive || c.streamStatus === 'live').length,
    [publishedClasses]
  );

  // Continue Watching list
  const continueWatchingList = useMemo(() => {
    return publishedClasses.filter((cls) => {
      const prog = interactions[cls.id]?.watchProgressSeconds || 0;
      return prog >= 10;
    });
  }, [publishedClasses, interactions]);

  // Subject filter chips
  const subjects = useMemo(
    () => ['all', ...Array.from(new Set(publishedClasses.map((c) => c.subjectName).filter(Boolean)))],
    [publishedClasses]
  );

  // Filtered Feed based on Category Chip, Subject, and Search Query
  const filteredFeed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = publishedClasses.filter((cls) => {
      // Search match
      if (q) {
        const hay = `${cls.title} ${cls.description || ''} ${cls.subjectName} ${cls.teacherName} ${cls.category || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Subject match
      if (selectedSubject !== 'all' && cls.subjectName !== selectedSubject) {
        return false;
      }

      // Category chip match
      if (activeCategory === 'Live') {
        return Boolean(cls.isLive || cls.streamStatus === 'live' || cls.category === 'Live' || cls.contentType === 'live');
      }
      if (activeCategory === 'Classes') {
        return (cls.category || 'Classes') === 'Classes' || cls.contentType === 'recorded';
      }
      if (activeCategory === 'Crash Course') {
        return cls.category === 'Crash Course' || cls.contentType === 'crash_course';
      }
      if (activeCategory === 'Shorts') {
        return cls.category === 'Shorts' || cls.contentType === 'short';
      }
      if (activeCategory === 'Saved') {
        return Boolean(interactions[cls.id]?.saved);
      }
      if (activeCategory === 'Continue') {
        return (interactions[cls.id]?.watchProgressSeconds || 0) >= 5;
      }
      return true;
    });

    if (activeCategory === 'Recently Added') {
      list = [...list].sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt || 0).getTime() -
          new Date(a.publishedAt || a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [publishedClasses, searchQuery, selectedSubject, activeCategory, interactions]);

  // Related videos for the active player (only from Admin-approved published content)
  const relatedVideos = useMemo(() => {
    if (!selectedClass) return [];
    const others = publishedClasses.filter((c) => c.id !== selectedClass.id);
    const sameSubject = others.filter((c) => c.subjectName === selectedClass.subjectName);
    const rest = others.filter((c) => c.subjectName !== selectedClass.subjectName);
    return [...sameSubject, ...rest].slice(0, 8);
  }, [publishedClasses, selectedClass]);

  const whatsappNumber = appConfig.whatsappNumber || '9241511070';

  // Render 16:9 Thumbnail with resilient Educational Studio Poster fallback
  const renderThumbnail = (cls: LiveClass, compact = false) => {
    const ytThumb = getYouTubeThumbnailUrl(cls.youtubeUrl);
    const thumbSrc = cls.thumbnailUrl || ytThumb;
    const isFailed = failedThumbnails[cls.id];
    const isCurrentlyLive = Boolean(cls.isLive || cls.streamStatus === 'live');
    const isScheduled = isClassScheduledFuture(cls);
    const isShort = cls.category === 'Shorts' || cls.contentType === 'short';
    const progressSec = interactions[cls.id]?.watchProgressSeconds || 0;
    const totalSec = cls.durationSeconds || 2700;
    const progressPercent = progressSec > 5 ? Math.min(100, Math.round((progressSec / totalSec) * 100)) : 0;
    const posterTheme = getSubjectPosterTheme(cls.subjectName);

    return (
      <div
        className={`relative w-full aspect-video overflow-hidden bg-slate-900 select-none ${
          compact ? 'rounded-xl' : 'sm:rounded-2xl'
        }`}
      >
        {thumbSrc && !isFailed ? (
          <img
            src={thumbSrc}
            alt={cls.title}
            loading="lazy"
            onError={() => setFailedThumbnails((prev) => ({ ...prev, [cls.id]: true }))}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          /* High-Contrast 16:9 Bihar Board Studio Poster Thumbnail */
          <div
            className={`w-full h-full bg-gradient-to-br ${posterTheme.gradient} p-3.5 sm:p-5 flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between gap-2 relative z-10">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider ${posterTheme.accent}`}
              >
                {posterTheme.badge}
              </span>
              {cls.featured && (
                <span className="bg-white/15 backdrop-blur-xs text-amber-300 text-[9px] font-black px-2 py-0.5 rounded">
                  ⭐ FEATURED
                </span>
              )}
            </div>

            <div className="my-auto py-1 relative z-10">
              <h4
                className={`font-black text-white leading-snug line-clamp-2 drop-shadow ${
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                }`}
              >
                {cls.title}
              </h4>
            </div>

            <div className="flex items-center justify-between gap-2 relative z-10 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-[10px]">
                  {cls.teacherName?.charAt(0) || 'R'}
                </span>
                <span className="truncate max-w-[130px]">{cls.teacherName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Center Subtle Play Affordance on Hover */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-black/65 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white opacity-90 group-hover:scale-110 transition-transform shadow-lg">
            {cls.isVip && !userCanAccess(cls) ? (
              <Lock className="w-5 h-5 text-amber-400" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Top-Left VIP / Free / Featured Pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          {cls.isVip ? (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Crown className="w-3 h-3" /> VIP
            </span>
          ) : (
            <span className="bg-emerald-600/95 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              FREE
            </span>
          )}
          {isShort && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              SHORTS
            </span>
          )}
        </div>

        {/* Bottom-Right Duration or LIVE Badge (YouTube-Exact Position) */}
        <div className="absolute bottom-2 right-2 z-10">
          {isScheduled ? (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Clock className="w-3 h-3" /> UPCOMING
            </span>
          ) : isCurrentlyLive ? (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
            </span>
          ) : (
            <span className="bg-black/85 text-white text-[11px] font-bold px-1.5 py-0.5 rounded tracking-tight">
              {cls.duration || '45:20'}
            </span>
          )}
        </div>

        {/* Bottom Red Watch Progress Bar (YouTube Resume Indicator) */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-10">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors pb-16 ${
        darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Floating Toast Notification */}
      {speedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-amber-300 border border-amber-500/40 font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <span>{speedToast}</span>
        </div>
      )}

      {/* ===================================================================
          1. YOUTUBE-STYLE STICKY TOP NAVIGATION BAR (Inside Live Section)
         =================================================================== */}
      <div
        className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          darkMode
            ? 'bg-[#0f0f0f]/95 border-stone-800 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
          {/* Left: App Brand Logo & Live Identity */}
          {selectedClass ? (
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              className={`min-h-[44px] px-2.5 rounded-xl flex items-center gap-2 font-black text-xs sm:text-sm cursor-pointer transition-colors ${
                darkMode ? 'hover:bg-stone-800 text-white' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5 text-red-600" />
              <span>वापस फ़ीड पर (All Videos)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-xs">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base sm:text-lg tracking-tight">
                    पढ़ेगा बिहार
                  </span>
                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                    LIVE
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold block ${
                    darkMode ? 'text-stone-400' : 'text-slate-500'
                  }`}
                >
                  Official Video & Live Platform
                </span>
              </div>
            </div>
          )}

          {/* Center / Expandable Search Input */}
          <div className={`flex-1 max-w-md mx-2 ${searchOpen ? 'block' : 'hidden md:block'}`}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedClass) setSelectedClass(null);
                }}
                placeholder="वीडियो, विषय या शिक्षक खोजें (Search classes)..."
                className={`w-full pl-9 pr-8 py-2 rounded-full text-xs font-medium border focus:outline-none focus:border-red-600 transition-colors ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-400'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons: Mobile Search Toggle, Live Count, Theme Toggle, Saved/Profile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`md:hidden min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center cursor-pointer ${
                darkMode ? 'hover:bg-stone-800 text-stone-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="खोजें (Search)"
            >
              <Search className="w-5 h-5" />
            </button>

            {liveNowCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null);
                  setActiveCategory('Live');
                }}
                className="hidden sm:flex items-center gap-1.5 bg-red-600/10 text-red-600 border border-red-600/30 px-2.5 py-1.5 rounded-full text-xs font-black cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{liveNowCount} LIVE</span>
              </button>
            )}

            {/* Light / Dark Mode Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                darkMode
                  ? 'hover:bg-stone-800 text-amber-400'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title={darkMode ? 'लाइट मोड (Light Mode)' : 'डार्क मोड (Dark Mode)'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Saved / Profile Quick Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedClass(null);
                setActiveCategory(activeCategory === 'Saved' ? 'All' : 'Saved');
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="सेव किए गए वीडियो और प्रोफ़ाइल"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Category Chips Bar (YouTube Mobile Layout) */}
        {!selectedClass && (
          <div
            className={`max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t ${
              darkMode ? 'border-stone-800/80' : 'border-slate-100'
            }`}
          >
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(chip.id);
                    setVisibleCount(8);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? darkMode
                        ? 'bg-white text-black font-black shadow-xs'
                        : 'bg-slate-900 text-white font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800/90 text-stone-200 hover:bg-stone-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {chip.hindi}
                </button>
              );
            })}
          </div>
        )}

        {/* Subject Filter Bar */}
        {!selectedClass && (
          <div
            className={`max-w-7xl mx-auto px-3 sm:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t ${
              darkMode ? 'border-stone-900 bg-stone-950/60' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3" /> विषय:
            </span>
            {subjects.map((subj) => {
              const active = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                    active
                      ? 'bg-red-600 text-white font-black'
                      : darkMode
                      ? 'text-stone-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {subj === 'all' ? 'सभी विषय' : subj}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================
          2. DEDICATED VIDEO PLAYER PAGE (When a Video is Selected)
         =================================================================== */}
      {selectedClass ? (
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:p-5">
          {/* Left 2 Columns: Video Player + Info + Actions + Description */}
          <div className="lg:col-span-2 space-y-3">
            {/* Player Container */}
            <div
              ref={playerContainerRef}
              onClick={() => {
                if (isFullscreen) resetControlsTimer();
              }}
              className={
                isFullscreen
                  ? 'fixed inset-0 z-50 bg-black w-screen h-screen flex flex-col justify-center overflow-hidden'
                  : 'sticky top-14 z-20 lg:static bg-black w-full lg:rounded-2xl overflow-hidden shadow-xl'
              }
            >
              {/* Scheduled Countdown Screen if Scheduled in Future */}
              {isClassScheduledFuture(selectedClass) &&
              getRemainingTime(selectedClass.scheduledDateTime) ? (
                (() => {
                  const rem = getRemainingTime(selectedClass.scheduledDateTime)!;
                  return (
                    <div className="aspect-video w-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>लाइव स्ट्रीम शेड्यूल्ड है ({selectedClass.scheduledAt})</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white max-w-md line-clamp-2">
                        {selectedClass.title}
                      </h3>
                      <div className="grid grid-cols-3 gap-2.5 max-w-xs w-full">
                        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                          <span className="block text-xl font-black text-amber-400">
                            {String(rem.hours).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-stone-400">घंटे</span>
                        </div>
                        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                          <span className="block text-xl font-black text-amber-400">
                            {String(rem.minutes).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-stone-400">मिनट</span>
                        </div>
                        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                          <span className="block text-xl font-black text-amber-400">
                            {String(rem.seconds).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-stone-400">सेकंड</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            updateLiveClass(selectedClass.id, {
                              publishType: 'instant',
                              isLive: true,
                              streamStatus: 'live',
                              scheduledDateTime: new Date().toISOString()
                            });
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-4 h-4 fill-white" />
                          <span>एडमिन: अभी तुरंत लाइव शुरू करें</span>
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : getPlaybackMode(selectedClass) === 'ai_board' ? (
                /* 1. Smart AI Board Interactive Lecture Player */
                <div className="w-full bg-black flex items-center justify-center p-1 sm:p-2">
                  <SmartAiBoardPlayer classItem={selectedClass} />
                </div>
              ) : getPlaybackMode(selectedClass) === 'native_video' ? (
                /* 2. Native HTML5 <video> Player (for Uploaded MP4/WebM & HLS .m3u8 Streams) */
                <div
                  className={`relative w-full bg-black flex flex-col justify-center ${
                    isFullscreen ? 'flex-1 h-full' : 'aspect-video'
                  }`}
                >
                  <video
                    ref={nativeVideoRef}
                    src={selectedClass.playbackUrl || selectedClass.youtubeUrl}
                    poster={selectedClass.thumbnailUrl || undefined}
                    playsInline
                    autoPlay
                    onPlay={() => setIsNativePlaying(true)}
                    onPause={() => setIsNativePlaying(false)}
                    onLoadedMetadata={(e) => {
                      const vid = e.currentTarget;
                      setNativeDuration(vid.duration || selectedClass.durationSeconds || 0);
                      const savedPos = interactions[selectedClass.id]?.watchProgressSeconds || 0;
                      if (savedPos > 5 && (!vid.duration || savedPos < vid.duration - 10)) {
                        vid.currentTime = savedPos;
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const vid = e.currentTarget;
                      setNativeCurrentTime(vid.currentTime);
                      if (Math.floor(vid.currentTime) % 5 === 0 && vid.currentTime > 5) {
                        saveInteraction(selectedClass.id, {
                          watchProgressSeconds: Math.floor(vid.currentTime),
                          durationSeconds: Math.floor(vid.duration || selectedClass.durationSeconds || 2700)
                        });
                      }
                    }}
                    className="w-full h-full object-contain"
                  >
                    {selectedClass.captionsUrl && captionsEnabled && (
                      <track
                        kind="subtitles"
                        src={selectedClass.captionsUrl}
                        srcLang="hi"
                        label="हिन्दी"
                        default
                      />
                    )}
                  </video>

                  {/* Custom Video Control Bar Overlay */}
                  <div className="bg-gradient-to-t from-black/95 via-black/75 to-transparent p-2.5 sm:p-3 space-y-2 text-white">
                    {/* Interactive Seek Bar */}
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span>{formatTimeDisplay(nativeCurrentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={nativeDuration || 100}
                        value={nativeCurrentTime}
                        onChange={(e) => {
                          const nextTime = Number(e.target.value);
                          setNativeCurrentTime(nextTime);
                          if (nativeVideoRef.current) {
                            nativeVideoRef.current.currentTime = nextTime;
                          }
                        }}
                        className="flex-1 h-1.5 accent-red-600 cursor-pointer"
                      />
                      <span>{formatTimeDisplay(nativeDuration)}</span>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const v = nativeVideoRef.current;
                            if (!v) return;
                            if (v.paused) v.play();
                            else v.pause();
                          }}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
                          title={isNativePlaying ? 'Pause' : 'Play'}
                        >
                          {isNativePlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        {/* Volume & Mute */}
                        <button
                          type="button"
                          onClick={() => {
                            const v = nativeVideoRef.current;
                            if (!v) return;
                            v.muted = !v.muted;
                            setIsNativeMuted(v.muted);
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                          title={isNativeMuted ? 'Unmute' : 'Mute'}
                        >
                          {isNativeMuted ? (
                            <VolumeX className="w-4 h-4 text-red-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isNativeMuted ? 0 : nativeVolume}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNativeVolume(val);
                            setIsNativeMuted(val === 0);
                            if (nativeVideoRef.current) {
                              nativeVideoRef.current.volume = val;
                              nativeVideoRef.current.muted = val === 0;
                            }
                          }}
                          className="w-16 sm:w-20 h-1 accent-white cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Captions Toggle when captionsUrl is present */}
                        {selectedClass.captionsUrl && (
                          <button
                            type="button"
                            onClick={() => setCaptionsEnabled(!captionsEnabled)}
                            className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer ${
                              captionsEnabled ? 'bg-red-600 text-white' : 'bg-white/15 text-stone-300'
                            }`}
                            title="Subtitles / Captions"
                          >
                            CC
                          </button>
                        )}

                        {/* Picture-in-Picture */}
                        {pipSupported && (
                          <button
                            type="button"
                            onClick={handleTogglePiP}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                            title="Picture-in-Picture (PiP)"
                          >
                            <PictureInPicture2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Fullscreen */}
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          title="Fullscreen"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                          ) : (
                            <Maximize className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. Authorized YouTube Embed Player (No external channel recommendations) */
                <div
                  className={`relative w-full bg-black overflow-hidden flex items-center justify-center ${
                    isFullscreen ? 'flex-1 h-full' : 'aspect-video'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    key={`${selectedClass.youtubeUrl}_${useNoCookie ? 'nocookie' : 'std'}`}
                    src={getEmbedUrlWithResume(selectedClass)}
                    title={selectedClass.title}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                  />
                </div>
              )}

              {/* Speed & Mode Helper Strip inside Player Card */}
              {!isFullscreen && (
                <div className="bg-stone-950 text-stone-300 px-3 py-2 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] font-black text-amber-400 flex items-center gap-1 shrink-0">
                      <Gauge className="w-3.5 h-3.5" /> स्पीड:
                    </span>
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSetSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-black cursor-pointer transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getPlaybackMode(selectedClass) === 'youtube' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setUseNoCookie((prev) => !prev)}
                          className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded-lg border border-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          <span>{useNoCookie ? 'प्राइवेसी मोड' : 'स्टैंडर्ड मोड'}</span>
                        </button>
                        <a
                          href={getYouTubeDirectWatchUrl(selectedClass.youtubeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>YouTube</span>
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="bg-stone-800 hover:bg-stone-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize className="w-3 h-3" />
                      <span>फुल-स्क्रीन</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Metadata, Channel Bar, Engagement Action Buttons & Description */}
            <div className="px-3 sm:px-1 space-y-3">
              {/* Video Title & Views/Time Line */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(selectedClass.isLive || selectedClass.streamStatus === 'live') && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                    </span>
                  )}
                  <span className="bg-red-600/10 text-red-600 text-[11px] font-extrabold px-2 py-0.5 rounded">
                    #{selectedClass.subjectName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      darkMode ? 'bg-stone-800 text-stone-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedClass.category || 'Classes'}
                  </span>
                </div>

                <h1 className="text-base sm:text-lg font-black leading-snug">
                  {selectedClass.title}
                </h1>

                <div
                  className={`text-xs flex items-center gap-2 flex-wrap ${
                    darkMode ? 'text-stone-400' : 'text-slate-500'
                  }`}
                >
                  <span>{formatViewsCount(selectedClass.viewsCount)} views</span>
                  <span>•</span>
                  <span>
                    {formatRelativeDate(selectedClass.publishedAt || selectedClass.createdAt, selectedClass.scheduledAt)}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    आपका वॉच-टाइम: {formatWatchDuration(myWatchSeconds)}
                  </span>
                </div>
              </div>

              {/* Channel / Teacher Row + Live Attendance Trigger */}
              <div
                className={`flex items-center justify-between gap-3 py-2.5 border-y ${
                  darkMode ? 'border-stone-800' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                    {selectedClass.teacherName?.charAt(0) || 'R'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm truncate flex items-center gap-1">
                      <span>{selectedClass.teacherName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        darkMode ? 'text-stone-400' : 'text-slate-500'
                      }`}
                    >
                      पढ़ेगा बिहार (Official BSEB Faculty)
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{activeAttendanceRecords.filter((r) => r.isOnline).length || 1} लाइव छात्र</span>
                </button>
              </div>

              {/* YouTube-Style Horizontal Action Buttons Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    interactions[selectedClass.id]?.liked
                      ? 'bg-red-600 text-white font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{(selectedClass.likesCount || 250).toLocaleString('en-IN')}</span>
                </button>

                {/* Save / Watch Later Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSave(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    interactions[selectedClass.id]?.saved
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{interactions[selectedClass.id]?.saved ? 'सेव किया गया' : 'सेव करें'}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={(e) => handleShareVideo(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>शेयर करें</span>
                </button>

                {/* Attendance List Button */}
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(true)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-emerald-400'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>अटेंडेंस रिपोर्ट</span>
                </button>

                {/* Settings & Voice Translate Button */}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>ऑडियो & सेटिंग्स</span>
                </button>
              </div>

              {/* Expandable Description Box (YouTube Style) */}
              <div
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className={`p-3.5 rounded-2xl text-xs cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-stone-900 hover:bg-stone-800/90 text-stone-200'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-black mb-1">
                  <span>
                    📚 क्लास विवरण और महत्वपूर्ण नोट्स ({selectedClass.subjectName})
                  </span>
                  <span className="flex items-center gap-1 text-red-600 text-[11px]">
                    {descriptionExpanded ? (
                      <>
                        कम दिखाएं <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        पूरा पढ़ें <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </div>
                <p
                  className={`whitespace-pre-line leading-relaxed ${
                    descriptionExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {selectedClass.description ||
                    `${selectedClass.teacherName} द्वारा बिहार बोर्ड कक्षा 10वीं (${selectedClass.subjectName}) की विशेष परीक्षा उपयोगी क्लास।`}
                </p>
              </div>

              {/* Banner Ad below Video Player as required */}
              <div className="py-2 flex justify-center">
                <AdsterraBanner />
              </div>
            </div>
          </div>

          {/* Right Column (or Below on Mobile): Related Videos from App's Own Approved Catalog */}
          <div className="px-3 sm:px-1 lg:px-0 mt-4 lg:mt-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-red-600 fill-red-600" />
                <span>अगली संबंधित क्लासेस (Up Next)</span>
              </h3>
              <span
                className={`text-[11px] font-bold ${
                  darkMode ? 'text-stone-400' : 'text-slate-500'
                }`}
              >
                केवल अप्रूव्ड क्लासेस
              </span>
            </div>

            <div className="space-y-3">
              {relatedVideos.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleWatchClass(rel)}
                  className={`group flex gap-3 p-2 rounded-2xl cursor-pointer transition-colors ${
                    darkMode ? 'hover:bg-stone-900' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="w-40 sm:w-44 shrink-0">{renderThumbnail(rel, true)}</div>
                  <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                        {rel.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-1 truncate ${
                          darkMode ? 'text-stone-400' : 'text-slate-500'
                        }`}
                      >
                        {rel.teacherName} • {rel.subjectName}
                      </p>
                    </div>
                    <div
                      className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                        darkMode ? 'text-stone-400' : 'text-slate-500'
                      }`}
                    >
                      <span>{formatViewsCount(rel.viewsCount)} views</span>
                      <span>•</span>
                      <span>{formatRelativeDate(rel.publishedAt || rel.createdAt, rel.scheduledAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================
            3. YOUTUBE-STYLE MAIN VIDEO FEED (When Browsing the Live Section)
           =================================================================== */
        <div className="max-w-7xl mx-auto px-0 sm:px-4 pt-2 sm:pt-4 space-y-5">
          {/* Continue Watching Strip (Shown on All tab if user has partially watched videos) */}
          {activeCategory === 'All' && !searchQuery && continueWatchingList.length > 0 && (
            <div className="px-3 sm:px-0 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span>देखना जारी रखें (Continue Watching)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveCategory('Continue')}
                  className="text-[11px] font-bold text-red-600 cursor-pointer"
                >
                  सभी देखें →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {continueWatchingList.slice(0, 5).map((cw) => {
                  const sec = interactions[cw.id]?.watchProgressSeconds || 0;
                  return (
                    <div
                      key={`cw_${cw.id}`}
                      onClick={() => handleWatchClass(cw)}
                      className={`w-56 sm:w-64 shrink-0 rounded-2xl overflow-hidden border p-2 cursor-pointer group transition-all ${
                        darkMode
                          ? 'bg-stone-900 border-stone-800 hover:border-stone-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {renderThumbnail(cw, true)}
                      <div className="pt-2 px-1">
                        <h4 className="font-bold text-xs line-clamp-1">{cw.title}</h4>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">
                          ⏱️ {formatTimeDisplay(sec)} से आगे देखें
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video Feed Grid (Full-width mobile cards like YouTube App, 2-3 cols on Desktop) */}
          {filteredFeed.length === 0 ? (
            <div className="mx-3 sm:mx-0 p-10 rounded-3xl border border-dashed border-slate-300 dark:border-stone-800 text-center space-y-3 my-6">
              <Video className="w-12 h-12 text-red-600 mx-auto opacity-80" />
              <h3 className="font-black text-base">इस श्रेणी में कोई वीडियो नहीं मिला</h3>
              <p
                className={`text-xs max-w-md mx-auto ${
                  darkMode ? 'text-stone-400' : 'text-slate-500'
                }`}
              >
                {searchQuery
                  ? `"${searchQuery}" से मेल खाने वाला कोई पब्लिश्ड वीडियो उपलब्ध नहीं है।`
                  : 'अभी इस कैटेगरी में कोई वीडियो उपलब्ध नहीं है।'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedSubject('all');
                  setSearchQuery('');
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2.5 rounded-full text-xs cursor-pointer shadow-md"
              >
                सभी वीडियो दिखाएं (Reset Filters)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 sm:gap-6">
              {filteredFeed.slice(0, visibleCount).map((cls) => {
                const isSaved = Boolean(interactions[cls.id]?.saved);
                return (
                  <div
                    key={cls.id}
                    onClick={() => handleWatchClass(cls)}
                    className="group cursor-pointer flex flex-col"
                  >
                    {/* 16:9 Thumbnail */}
                    {renderThumbnail(cls, false)}

                    {/* Below Thumbnail: Avatar + Title/Metadata + 3-Dot Menu (YouTube Exact Layout) */}
                    <div className="flex items-start gap-3 px-3 sm:px-1 pt-3">
                      {/* Channel / Teacher Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {cls.teacherName?.charAt(0) || 'R'}
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                          {cls.title}
                        </h3>
                        <div
                          className={`text-xs mt-1 flex items-center gap-1.5 flex-wrap leading-tight ${
                            darkMode ? 'text-stone-400' : 'text-slate-600'
                          }`}
                        >
                          <span className="font-medium">{cls.teacherName}</span>
                          <span>•</span>
                          <span className="font-semibold text-red-600 dark:text-amber-400">
                            {cls.subjectName}
                          </span>
                          <span>•</span>
                          <span>{formatViewsCount(cls.viewsCount)} views</span>
                          <span>•</span>
                          <span>
                            {formatRelativeDate(cls.publishedAt || cls.createdAt, cls.scheduledAt)}
                          </span>
                        </div>
                      </div>

                      {/* Three-Dot (⋮) Menu Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenClass(cls);
                        }}
                        className={`min-h-[44px] min-w-[44px] -mr-2 -mt-1 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                          darkMode
                            ? 'hover:bg-stone-800 text-stone-300'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="विकल्प (More Options)"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {isSaved && (
                      <div className="px-3 sm:px-1 pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Bookmark className="w-3 h-3 fill-current" /> Watch Later में सेव है
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Pagination Button */}
          {filteredFeed.length > visibleCount && (
            <div className="pt-4 pb-2 flex justify-center px-3">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className={`px-6 py-3 rounded-full text-xs font-black cursor-pointer border transition-all shadow-xs ${
                  darkMode
                    ? 'bg-stone-900 hover:bg-stone-800 text-white border-stone-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                और वीडियो लोड करें ({filteredFeed.length - visibleCount} बाकी हैं)
              </button>
            </div>
          )}

          {/* Banner Ad at bottom of Live Classes Feed */}
          <div className="px-3 pt-2 flex justify-center">
            <AdsterraBanner />
          </div>
        </div>
      )}

      {/* ===================================================================
          4. THREE-DOT (⋮) BOTTOM SHEET / ACTION MENU FOR EACH VIDEO
         =================================================================== */}
      {menuOpenClass && (
        <div
          onClick={() => setMenuOpenClass(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-4 space-y-2 shadow-2xl ${
              darkMode ? 'bg-stone-900 text-white border border-stone-800' : 'bg-white text-slate-900'
            }`}
          >
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-stone-700 rounded-full mx-auto mb-2 sm:hidden" />
            <div className="pb-2 border-b border-slate-200 dark:border-stone-800">
              <h4 className="font-black text-xs sm:text-sm line-clamp-1">{menuOpenClass.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                {menuOpenClass.teacherName} • {menuOpenClass.subjectName} • {menuOpenClass.duration || '45:20'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleWatchClass(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Play className="w-4 h-4 text-red-600" />
              <span>अभी वीडियो चलाएं (Play Now)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleToggleSave(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>
                {interactions[menuOpenClass.id]?.saved
                  ? 'सेव सूची (Watch Later) से हटाएं'
                  : 'बाद में देखने के लिए सेव करें (Save to Watch Later)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleToggleLike(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>
                {interactions[menuOpenClass.id]?.liked ? 'लाइक हटाएं (Unlike)' : 'वीडियो लाइक करें (Like)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleShareVideo(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>दोस्तों के साथ शेयर करें (Share)</span>
            </button>

            {(interactions[menuOpenClass.id]?.watchProgressSeconds || 0) > 0 && (
              <button
                type="button"
                onClick={() => {
                  saveInteraction(menuOpenClass.id, { watchProgressSeconds: 0, completed: false });
                  setSpeedToast('वॉच हिस्ट्री प्रोग्रेस रीसेट कर दी गई');
                  setTimeout(() => setSpeedToast(''), 2000);
                  setMenuOpenClass(null);
                }}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>शुरू से देखें (Reset Watch Progress)</span>
              </button>
            )}

            {/* Admin Quick Moderation inside 3-dot Menu */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-500 px-3">
                  Admin Quick Controls
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextLive = !menuOpenClass.isLive;
                    updateLiveClass(menuOpenClass.id, {
                      isLive: nextLive,
                      streamStatus: nextLive ? 'live' : 'ended',
                      category: nextLive ? 'Live' : 'Classes'
                    });
                    setMenuOpenClass(null);
                  }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-red-500 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>
                    {menuOpenClass.isLive
                      ? '⏹️ लाइव स्ट्रीम समाप्त करें (End Live)'
                      : '🔴 अभी लाइव स्ट्रीम शुरू करें (Go Live)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateLiveClass(menuOpenClass.id, { featured: !menuOpenClass.featured });
                    setMenuOpenClass(null);
                  }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-amber-500 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Pin className="w-4 h-4" />
                  <span>{menuOpenClass.featured ? 'फीचर्ड से हटाएं' : '⭐ फीचर्ड में पिन करें'}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpenClass(null)}
              className="w-full min-h-[44px] mt-1 rounded-xl bg-slate-100 dark:bg-stone-800 font-black text-xs cursor-pointer"
            >
              बंद करें (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          5. VIP LOCKED CLASS PROMPT MODAL
         =================================================================== */}
      {lockedClassPrompt && (
        <div
          onClick={() => setLockedClassPrompt(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-center text-white shadow-2xl space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black">यह प्रीमियम (VIP) क्लास है!</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              <b>"{lockedClassPrompt.title}"</b> केवल पेड VIP बैच के छात्रों के लिए उपलब्ध है।
            </p>
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLockedClassPrompt(null);
                  onOpenVip();
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black py-3 rounded-xl text-xs cursor-pointer shadow-lg"
              >
                👑 अभी VIP बैच जॉइन करें (₹299)
              </button>
              <a
                href={`https://wa.me/91${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `नमस्ते सर! मुझे "${lockedClassPrompt.title}" VIP क्लास अनलॉक करनी है।`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp सहायता ({whatsappNumber})</span>
              </a>
              <button
                type="button"
                onClick={() => setLockedClassPrompt(null)}
                className="w-full bg-stone-800 text-stone-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                वापस जाएँ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          6. VIDEO SETTINGS / VOICE TRANSLATION & SPEED MODAL
         =================================================================== */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-sm">वीडियो सेटिंग्स, स्पीड & भाषा (Audio/CC)</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <h5 className="font-black text-xs text-white">⚡ डेटा सेवर / लो-नेटवर्क मोड</h5>
                <p className="text-[10px] text-stone-400">कम डेटा में बिना बफरिंग के स्मूथ प्लेबैक</p>
              </div>
              <button
                type="button"
                onClick={() => setDataSaverMode(!dataSaverMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                  dataSaverMode ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {dataSaverMode ? '✓ ऑन' : 'ऑफ'}
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400">प्लेबैक स्पीड (Playback Speed):</div>
              <div className="grid grid-cols-7 gap-1.5">
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSetSpeed(spd)}
                    className={`py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-stone-300 space-y-1.5">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4" /> ऑडियो ट्रैक और सबटाइटल (Captions):
              </div>
              <p className="text-[11px] leading-relaxed">
                प्लेयर में <b>CC</b> या <b>⚙️ Settings</b> आइकन दबाकर आप हिंदी/अंग्रेजी ऑडियो ट्रैक और सबटाइटल बदल सकते हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              बंद करें (Done)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          7. CLASS ATTENDANCE & LIVE WATCH TIME MODAL
         =================================================================== */}
      {selectedClass && (
        <ClassAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          classTitle={selectedClass.title}
          isLive={Boolean(selectedClass.isLive || selectedClass.streamStatus === 'live')}
          activeRecords={activeAttendanceRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          currentStudentId={user?.email || (user as any)?.uid || 'student'}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
