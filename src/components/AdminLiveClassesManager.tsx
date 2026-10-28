import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Youtube,
  CheckCircle,
  AlertCircle,
  Radio,
  Calendar,
  User,
  PlaySquare,
  Lock,
  Unlock,
  Clock,
  Users,
  Eye,
  Upload,
  Pin,
  Edit3,
  CheckCircle2,
  XCircle,
  FileVideo,
  Server,
  Sparkles,
  Image as ImageIcon,
  Subtitles,
  ThumbsUp,
  BarChart3,
  Play,
  Square,
  X,
  ArrowUpDown,
  ListVideo,
  ExternalLink,
  Search,
  BookOpen
} from 'lucide-react';
import { useData, isAiStudioLectureItem } from '../context/DataContext';
import {
  LiveClass,
  LiveWatchRecord,
  VideoSourceType,
  VideoContentType,
  VideoPublicationStatus,
  LiveStreamStatus,
  LibraryCategoryType
} from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { subscribeClassAttendance, DEFAULT_BATCH_STUDENTS } from '../services/attendanceTracker';
import {
  extractYouTubeVideoId,
  extractYouTubePlaylistId,
  isValidYouTubeUrlOrId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeSearchShortcutUrl
} from '../utils/youtubeHelper';

interface StreamProviderConfig {
  provider: string;
  ingestRtmpUrl: string;
  hasStreamKeyConfigured: boolean;
  playbackBaseUrl: string;
  maxUploadSizeMb: number;
}

const LIBRARY_CATEGORIES: { id: LibraryCategoryType; label: string; hindi: string }[] = [
  { id: 'Complete Courses', label: 'Complete Courses', hindi: '🎓 संपूर्ण कोर्स (Complete Courses)' },
  { id: 'Chapter-wise Lectures', label: 'Chapter-wise Lectures', hindi: '📖 अध्याय-वार लेक्चर (Chapter-wise)' },
  { id: 'Objective & Subjective', label: 'Objective & Subjective', hindi: '✍️ वस्तुनिष्ठ व सब्जेक्टिव प्रश्न' },
  { id: 'Previous-Year Questions', label: 'Previous-Year Questions', hindi: '📜 पिछले वर्षों के प्रश्न (PYQ)' },
  { id: 'Model Paper Solutions', label: 'Model Paper Solutions', hindi: '📄 मॉडल पेपर हल (Model Papers)' },
  { id: 'Revision Classes', label: 'Revision Classes', hindi: '⚡ रिवीजन क्लास (Revision)' },
  { id: 'Exam Preparation', label: 'Exam Preparation', hindi: '🎯 परीक्षा की तैयारी (Exam Prep)' }
];

const BIHAR_BOARD_SUBJECTS = [
  { value: 'गणित', label: '📐 गणित (Mathematics)' },
  { value: 'विज्ञान', label: '🔬 विज्ञान (Science)' },
  { value: 'सामाजिक विज्ञान', label: '🏛️ सामाजिक विज्ञान (Social Science)' },
  { value: 'हिन्दी', label: '📖 हिन्दी (Hindi)' },
  { value: 'संस्कृत', label: '🪔 संस्कृत (Sanskrit)' },
  { value: 'अंग्रेजी', label: '🔤 अंग्रेजी (English)' },
  { value: 'VVI & Trick Classes', label: '🔥 VVI & Trick Classes' },
  { value: 'सामान्य', label: '🎯 सामान्य / मार्गदर्शन (General)' }
];

export function AdminLiveClassesManager() {
  const { liveClasses: rawLiveClasses, subjects, addLiveClass, updateLiveClass, deleteLiveClass } = useData();
  const liveClasses = useMemo(
    () => (rawLiveClasses || []).filter((c) => !isAiStudioLectureItem(c)),
    [rawLiveClasses]
  );

  // Form state (supports both Create & Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [captionsUrl, setCaptionsUrl] = useState('');
  const [subjectName, setSubjectName] = useState('गणित');
  const [chapterName, setChapterName] = useState('');
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategoryType>('Chapter-wise Lectures');
  const [category, setCategory] = useState<string>('Classes');
  const [contentType, setContentType] = useState<VideoContentType>('recorded');
  const [teacherName, setTeacherName] = useState('राज सर');
  const [duration, setDuration] = useState('45:00');
  const [publishType, setPublishType] = useState<'instant' | 'scheduled'>('instant');
  const [publicationStatus, setPublicationStatus] = useState<VideoPublicationStatus>('published');
  const [streamStatus, setStreamStatus] = useState<LiveStreamStatus>('ended');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [scheduledAt, setScheduledAt] = useState('आज शाम 7:00 बजे');
  const [isLive, setIsLive] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(10);
  const [description, setDescription] = useState('');

  // Filters
  const [adminSubjectFilter, setAdminSubjectFilter] = useState<string>('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');

  // Upload & Feedback states
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<'video' | 'thumbnail' | 'captions' | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Streaming provider config panel
  const [showStreamSetup, setShowStreamSetup] = useState(false);
  const [streamConfig, setStreamConfig] = useState<StreamProviderConfig | null>(null);

  // Admin Preview Modal
  const [previewClass, setPreviewClass] = useState<LiveClass | null>(null);

  // Attendance Modal state
  const [attendanceModalClass, setAttendanceModalClass] = useState<LiveClass | null>(null);
  const [activeRecords, setActiveRecords] = useState<LiveWatchRecord[]>([]);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const captionsInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLFormElement>(null);

  // Dynamically list chapters for the selected Bihar Board Class 10 subject
  const availableChaptersForSubject = useMemo(() => {
    const subjectList = Object.values(subjects || {});
    const matchedSubject = subjectList.find(
      (s) =>
        s.subject_name_hindi === subjectName ||
        s.hindi === subjectName ||
        s.subject_name?.toLowerCase() === subjectName.toLowerCase() ||
        (s.subject_name_hindi && subjectName.includes(s.subject_name_hindi))
    );
    return matchedSubject?.chapters || [];
  }, [subjects, subjectName]);

  // Live validation of the entered YouTube Video or Playlist URL
  const ytValidation = useMemo(() => {
    return isValidYouTubeUrlOrId(youtubeUrl);
  }, [youtubeUrl]);

  useEffect(() => {
    fetch('/api/live-stream/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStreamConfig(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!attendanceModalClass) {
      setActiveRecords([]);
      return;
    }
    const unsub = subscribeClassAttendance(attendanceModalClass.id, (records) => {
      setActiveRecords(records);
    });
    return () => unsub();
  }, [attendanceModalClass]);

  // Auto-generate human readable scheduledAt label when date/time changes
  const handleScheduleChange = (dateVal: string, timeVal: string) => {
    setScheduledDate(dateVal);
    setScheduledTime(timeVal);
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const [hStr, mStr] = timeVal.split(':');
      let h = parseInt(hStr, 10);
      const m = mStr || '00';
      const ampm = h >= 12 ? 'शाम' : 'सुबह';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;

      let prefix = '';
      if (dateVal === today) prefix = 'आज';
      else if (dateVal === tomorrow) prefix = 'कल';
      else prefix = dateVal;

      setScheduledAt(`${prefix} ${ampm} ${h}:${m} बजे`);
    } catch {
      setScheduledAt(`${dateVal} ${timeVal}`);
    }
  };

  // Sync category & contentType defaults when user switches contentType
  const handleContentTypeChange = (type: VideoContentType) => {
    setContentType(type);
    if (type === 'live') {
      setCategory('Live');
      setIsLive(publishType === 'instant');
      setStreamStatus(publishType === 'instant' ? 'live' : 'scheduled');
    } else if (type === 'short') {
      setCategory('Shorts');
      setIsLive(false);
      setStreamStatus('ended');
      if (duration === '45:00') setDuration('00:58');
    } else if (type === 'crash_course') {
      setCategory('Crash Course');
      setIsLive(false);
      setStreamStatus('ended');
    } else {
      setCategory('Classes');
      setIsLive(false);
      setStreamStatus('ended');
    }
  };

  // File upload handler (video, thumbnail, or captions)
  const handleFileUpload = async (
    file: File,
    mediaKind: 'video' | 'thumbnail' | 'captions'
  ) => {
    setUploadingMedia(mediaKind);
    setErrorMsg('');
    try {
      const maxMb = streamConfig?.maxUploadSizeMb || 50;
      if (file.size > maxMb * 1024 * 1024) {
        throw new Error(
          `फ़ाइल का आकार ${maxMb}MB से कम होना चाहिए। बड़ी वीडियो के लिए डायरेक्ट MP4 या HLS (.m3u8) URL का उपयोग करें।`
        );
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('फ़ाइल पढ़ने में त्रुटि'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          base64Data,
          mediaKind
        })
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'अपलोड विफल रहा');
      }

      if (mediaKind === 'video') {
        setPlaybackUrl(data.url);
        setYoutubeUrl(data.url);
        setVideoSourceType('video_file');
        setSuccessMsg(`वीडियो फ़ाइल (${file.name}) सफलतापूर्वक अपलोड हो गई!`);
      } else if (mediaKind === 'thumbnail') {
        setThumbnailUrl(data.url);
        setSuccessMsg(`कस्टम थंबनेल (${file.name}) सफलतापूर्वक अपलोड हो गया!`);
      } else if (mediaKind === 'captions') {
        setCaptionsUrl(data.url);
        setSuccessMsg(`सबटाइटल (.vtt) फ़ाइल सफलतापूर्वक अपलोड हो गई!`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'फ़ाइल अपलोड में त्रुटि हुई');
    } finally {
      setUploadingMedia(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setYoutubeUrl('');
    setPlaybackUrl('');
    setThumbnailUrl('');
    setCaptionsUrl('');
    setChapterName('');
    setLibraryCategory('Chapter-wise Lectures');
    setDescription('');
    setVideoSourceType('youtube');
    setContentType('recorded');
    setCategory('Classes');
    setPublicationStatus('published');
    setStreamStatus('ended');
    setIsLive(false);
    setFeatured(false);
    setDisplayOrder(10);
    setDuration('45:00');
  };

  const handleEditClass = (cls: LiveClass) => {
    setEditingId(cls.id);
    setTitle(cls.title || '');
    setVideoSourceType(
      cls.videoSourceType && cls.videoSourceType !== 'ai_board'
        ? cls.videoSourceType
        : cls.playbackUrl?.endsWith('.m3u8')
        ? 'hls_stream'
        : cls.playbackUrl?.match(/\.(mp4|webm|ogg)$/i) || cls.youtubeUrl?.startsWith('/uploads/')
        ? 'video_file'
        : 'youtube'
    );
    setYoutubeUrl(cls.youtubeUrl || '');
    setPlaybackUrl(cls.playbackUrl || cls.youtubeUrl || '');
    setThumbnailUrl(cls.thumbnailUrl || '');
    setCaptionsUrl(cls.captionsUrl || '');
    setSubjectName(cls.subjectName || 'गणित');
    setChapterName(cls.chapterName || '');
    setLibraryCategory(cls.libraryCategory || 'Chapter-wise Lectures');
    setCategory(cls.category || (cls.isLive ? 'Live' : 'Classes'));
    setContentType(cls.contentType || (cls.isLive ? 'live' : 'recorded'));
    setTeacherName(cls.teacherName || 'राज सर');
    setDuration(cls.duration || '45:00');
    setPublishType(cls.publishType || 'instant');
    setPublicationStatus(cls.publicationStatus || 'published');
    setStreamStatus(cls.streamStatus || (cls.isLive ? 'live' : 'ended'));
    setScheduledAt(cls.scheduledAt || 'अभी लाइव');
    setIsLive(Boolean(cls.isLive));
    setIsVip(Boolean(cls.isVip));
    setFeatured(Boolean(cls.featured));
    setDisplayOrder(typeof cls.displayOrder === 'number' ? cls.displayOrder : 10);
    setDescription(cls.description || '');
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryUrl =
      videoSourceType === 'youtube'
        ? youtubeUrl.trim()
        : playbackUrl.trim() || youtubeUrl.trim();

    if (!title.trim() || !primaryUrl) {
      setErrorMsg('कृपया वीडियो का शीर्षक (Title) और वीडियो/प्लेलिस्ट स्रोत (URL या फ़ाइल) प्रदान करें।');
      return;
    }

    if (videoSourceType === 'youtube') {
      const check = isValidYouTubeUrlOrId(primaryUrl);
      if (!check.valid) {
        setErrorMsg(
          'कृपया मान्य YouTube वीडियो लिंक (watch?v=..., youtu.be/..., live/...) या पब्लिक प्लेलिस्ट लिंक (playlist?list=PL...) दर्ज करें।'
        );
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let finalScheduledDateTime = new Date().toISOString();
      if (publishType === 'scheduled') {
        const parsedDt = new Date(`${scheduledDate}T#${scheduledTime}:00`.replace('#', ''));
        if (!isNaN(parsedDt.getTime())) {
          finalScheduledDateTime = parsedDt.toISOString();
        }
      }

      const ytId = videoSourceType === 'youtube' ? extractYouTubeVideoId(primaryUrl) : null;
      const ytPlaylistId = videoSourceType === 'youtube' ? extractYouTubePlaylistId(primaryUrl) : null;

      let normalizedUrl = primaryUrl;
      if (videoSourceType === 'youtube') {
        if (ytId && ytPlaylistId) {
          normalizedUrl = `https://www.youtube.com/watch?v=${ytId}&list=${ytPlaylistId}`;
        } else if (ytId) {
          normalizedUrl = `https://www.youtube.com/watch?v=${ytId}`;
        } else if (ytPlaylistId) {
          normalizedUrl = `https://www.youtube.com/playlist?list=${ytPlaylistId}`;
        }
      }

      const autoThumb =
        thumbnailUrl.trim() || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '');

      // Parse duration MM:SS to seconds
      let durationSeconds = 2700;
      if (duration.includes(':')) {
        const parts = duration.split(':').map((n) => parseInt(n, 10) || 0);
        if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
        else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }

      const effectiveIsLive =
        publishType === 'scheduled'
          ? false
          : contentType === 'live' || streamStatus === 'live' || isLive;

      const effectiveStreamStatus: LiveStreamStatus =
        publishType === 'scheduled'
          ? 'scheduled'
          : effectiveIsLive
          ? 'live'
          : streamStatus === 'offline'
          ? 'offline'
          : 'ended';

      const payload: Omit<LiveClass, 'id'> = {
        title: title.trim(),
        youtubeUrl: normalizedUrl,
        playbackUrl: normalizedUrl,
        thumbnailUrl: autoThumb,
        captionsUrl: captionsUrl.trim(),
        videoSourceType,
        contentType,
        category,
        libraryCategory,
        subjectName,
        chapterName: chapterName.trim() || undefined,
        youtubePlaylistId: ytPlaylistId || undefined,
        isPlaylist: Boolean(ytPlaylistId),
        teacherName: teacherName.trim() || 'राज सर',
        duration: duration.trim() || '45:00',
        durationSeconds,
        scheduledAt:
          scheduledAt.trim() ||
          (effectiveIsLive ? '🔴 अभी लाइव' : publishType === 'scheduled' ? 'शेड्यूल्ड' : 'रिकॉर्डेड क्लास'),
        isLive: effectiveIsLive,
        streamStatus: effectiveStreamStatus,
        publicationStatus,
        featured,
        displayOrder: Number(displayOrder) || 10,
        isVip,
        description: description.trim(),
        publishType,
        scheduledDateTime: finalScheduledDateTime,
        publishedAt: publicationStatus === 'published' ? new Date().toISOString() : undefined,
        isUploaded: true
      };

      if (editingId) {
        await updateLiveClass(editingId, payload);
        setSuccessMsg(`"${title.trim()}" को सफलतापूर्वक अपडेट कर दिया गया है!`);
      } else {
        await addLiveClass({
          ...payload,
          viewsCount: 1,
          likesCount: 0
        });
        setSuccessMsg(
          publicationStatus === 'published'
            ? 'वीडियो/प्लेलिस्ट सफलतापूर्वक पब्लिश हो गई है और छात्रों के बिहार बोर्ड वीडियो लाइब्रेरी में दिख रही है!'
            : `वीडियो "${publicationStatus}" स्थिति में सुरक्षित कर लिया गया है (केवल एडमिन को दिखेगा)।`
        );
      }

      resetForm();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg('सहेजने में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Real-time stream lifecycle control (Start Live / End Live)
  const handleStreamLifecycle = async (
    cls: LiveClass,
    action: 'start_live' | 'end_live'
  ) => {
    try {
      const nowIso = new Date().toISOString();
      const updates: Partial<LiveClass> =
        action === 'start_live'
          ? {
              isLive: true,
              streamStatus: 'live',
              contentType: 'live',
              category: 'Live',
              publishType: 'instant',
              publicationStatus: 'published',
              scheduledAt: '🔴 अभी लाइव (LIVE NOW)',
              publishedAt: nowIso
            }
          : {
              isLive: false,
              streamStatus: 'ended',
              contentType: 'recorded',
              scheduledAt: 'रिकॉर्डेड क्लास (Stream Ended)'
            };

      await fetch('/api/live-stream/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cls.id, action })
      }).catch(() => {});

      await updateLiveClass(cls.id, updates);
      setSuccessMsg(
        action === 'start_live'
          ? `🔴 "${cls.title}" अब लाइव स्ट्रीम हो रहा है! सभी छात्रों के ऐप में LIVE बैज सक्रिय हो गया है।`
          : `⏹️ "${cls.title}" की लाइव स्ट्रीम समाप्त कर दी गई है और इसे रिकॉर्डेड क्लास में बदल दिया गया है।`
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('स्ट्रीम स्टेटस बदलने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handlePublicationChange = async (
    cls: LiveClass,
    newStatus: VideoPublicationStatus
  ) => {
    try {
      await updateLiveClass(cls.id, {
        publicationStatus: newStatus,
        publishedAt: newStatus === 'published' ? new Date().toISOString() : cls.publishedAt
      });
      setSuccessMsg(`"${cls.title}" की प्रकाशन स्थिति बदलकर "${newStatus.toUpperCase()}" कर दी गई है।`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg('प्रकाशन स्थिति बदलने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleToggleFeatured = async (cls: LiveClass) => {
    try {
      await updateLiveClass(cls.id, { featured: !cls.featured });
      setSuccessMsg(
        !cls.featured
          ? `⭐ "${cls.title}" को फीचर्ड (Pin to Top) कर दिया गया है!`
          : `"${cls.title}" को फीचर्ड सूची से हटा दिया गया है।`
      );
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg('फीचर्ड बदलने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleToggleVip = async (id: string, currentIsVip: boolean) => {
    try {
      await updateLiveClass(id, { isVip: !currentIsVip });
      setSuccessMsg(`क्लास का एक्सेस स्टेटस बदलकर "${!currentIsVip ? 'VIP लॉक्ड' : 'फ्री डेमो'}" कर दिया गया है।`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg('स्टेटस बदलने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleDelete = async (id: string, classTitle: string) => {
    if (window.confirm(`क्या आप वाकई "${classTitle}" वीडियो/क्लास को स्थायी रूप से हटाना चाहते हैं?`)) {
      await deleteLiveClass(id);
    }
  };

  // Filtered classes for Admin Table
  const filteredClasses = liveClasses
    .filter((c) => {
      if (adminSubjectFilter !== 'all' && c.subjectName !== adminSubjectFilter) return false;
      const pubStatus = c.publicationStatus || 'published';
      if (adminStatusFilter !== 'all' && pubStatus !== adminStatusFilter) return false;
      if (
        adminCategoryFilter !== 'all' &&
        (c.libraryCategory || c.category || 'Classes') !== adminCategoryFilter &&
        (c.category || 'Classes') !== adminCategoryFilter
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  // Summary metrics
  const totalPublished = liveClasses.filter((c) => (c.publicationStatus || 'published') === 'published').length;
  const totalLiveNow = liveClasses.filter((c) => c.isLive || c.streamStatus === 'live').length;
  const totalDraftOrPending = liveClasses.filter((c) =>
    ['draft', 'pending_approval', 'unpublished', 'rejected'].includes(c.publicationStatus || '')
  ).length;
  const totalViews = liveClasses.reduce((acc, c) => acc + (c.viewsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Analytics Summary */}
      <div className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
              <Radio className="w-5 h-5 animate-pulse text-red-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                बिहार बोर्ड कक्षा 10वीं YouTube वीडियो लाइब्रेरी & लाइव स्टूडियो (Admin)
              </h3>
              <p className="text-xs text-stone-400">
                बिना किसी API Key के वेरिफाइड YouTube वीडियो व पब्लिक प्लेलिस्ट (Playlists) को विषय और अध्याय के अनुसार प्रबंधित करें।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowStreamSetup(!showStreamSetup)}
            className="bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{showStreamSetup ? 'स्ट्रीमिंग कॉन्फ़िग छुपाएं' : '📡 RTMP / HLS लाइव स्ट्रीम सेटअप'}</span>
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-amber-400" /> कुल पब्लिश्ड वीडियो
            </div>
            <div className="text-xl font-black text-white mt-0.5">{totalPublished}</div>
          </div>
          <div className="bg-stone-900/90 border border-red-900/40 rounded-2xl p-3">
            <div className="text-[11px] text-red-400 font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> अभी लाइव (LIVE)
            </div>
            <div className="text-xl font-black text-red-400 mt-0.5">{totalLiveNow}</div>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> ड्राफ्ट / पेंडिंग
            </div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{totalDraftOrPending}</div>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> कुल व्यूज (Plays)
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{totalViews.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Provider-Independent RTMP / HLS Streaming Configuration Drawer */}
        {showStreamSetup && (
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-amber-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" /> बाहरी लाइव स्ट्रीमिंग प्रोवाइडर (OBS / Cloudflare Stream / Mux / Custom HLS)
              </h4>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Provider: {streamConfig?.provider || 'custom_hls'}
              </span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              आप OBS Studio, Larix Broadcaster, Cloudflare Stream, Mux या YouTube Live से स्ट्रीम कर सकते हैं। प्राइवेट स्ट्रीम की (Stream Key) कभी भी फ्रंटएंड कोड में नहीं भेजी जाती है:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-bold uppercase">RTMP Ingest Server (सर्वर पर्यावरण से)</div>
                <div className="font-mono text-amber-300 text-xs mt-1 select-all break-all">
                  {streamConfig?.ingestRtmpUrl || 'rtmp://live.padhegabihar.com/live'}
                </div>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-bold uppercase">Playback Format (छात्रों के प्लेयर हेतु)</div>
                <div className="text-stone-200 text-xs mt-1">
                  HLS (<code className="text-emerald-400">.m3u8</code>), Direct <code className="text-emerald-400">.mp4/.webm</code>, या अधिकृत YouTube Video/Playlist URL
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Video & Playlist Form */}
      <form
        ref={formTopRef}
        onSubmit={handleSaveOrUpdate}
        className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>वीडियो / प्लेलिस्ट संपादित करें (Edit Mode)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-amber-400" />
                <span>नया YouTube वीडियो, पब्लिक प्लेलिस्ट या लाइव क्लास जोड़ें</span>
              </>
            )}
          </h4>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1 rounded-xl font-bold cursor-pointer"
            >
              ✕ एडिट रद्द करें
            </button>
          )}
        </div>

        {/* Step 1: Video Source Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-stone-300 block">
            1. वीडियो स्रोत चुनें (Select Video / Playlist Source Type):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'youtube', label: 'YouTube Video / Live / Playlist', icon: Youtube, desc: 'YouTube वीडियो, लाइव या प्लेलिस्ट लिंक' },
              { id: 'video_file', label: 'MP4 / वीडियो अपलोड', icon: FileVideo, desc: 'फ़ाइल अपलोड या डायरेक्ट MP4' },
              { id: 'hls_stream', label: 'HLS Live (.m3u8)', icon: Radio, desc: 'OBS / Cloudflare / Mux HLS' }
            ].map((src) => {
              const Icon = src.icon;
              const active = videoSourceType === src.id;
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => {
                    setVideoSourceType(src.id as VideoSourceType);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-white">
                    <Icon className={`w-4 h-4 ${active ? 'text-red-400' : 'text-stone-400'}`} />
                    <span>{src.label}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{src.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject Selection */}
        <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">विषय चुनें (Subject)</label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            >
              {BIHAR_BOARD_SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Content Type, Tab & Approval Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-900/70 p-3.5 rounded-2xl border border-stone-800">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">कंटेंट प्रकार (Content Type)</label>
            <select
              value={contentType}
              onChange={(e) => handleContentTypeChange(e.target.value as VideoContentType)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="recorded">📼 रिकॉर्डेड क्लास (Recorded Video)</option>
              <option value="live">🔴 लाइव स्ट्रीम (Live Stream)</option>
              <option value="crash_course">⚡ क्रैश कोर्स (Crash Course)</option>
              <option value="short">📱 शॉर्ट वीडियो (Shorts)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">कैटेगरी टैब (Category Chip)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="Classes">📚 Classes (नियमित क्लास)</option>
              <option value="Live">🔴 Live (लाइव सेशन)</option>
              <option value="Crash Course">⚡ Crash Course (क्रैश कोर्स)</option>
              <option value="Shorts">📱 Shorts (शॉर्ट ट्रिक्स)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-400">प्रकाशन व अप्रूवल स्थिति (Status)</label>
            <select
              value={publicationStatus}
              onChange={(e) => setPublicationStatus(e.target.value as VideoPublicationStatus)}
              className="w-full bg-stone-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="published">✅ Published (पब्लिश्ड - छात्रों को दिखेगा)</option>
              <option value="draft">📝 Draft (ड्राफ्ट - केवल एडमिन को दिखेगा)</option>
              <option value="pending_approval">⏳ Pending Approval (अप्रूवल के लिए लंबित)</option>
              <option value="unpublished">🚫 Unpublished (अनपब्लिश्ड / छुपाया गया)</option>
              <option value="rejected">❌ Rejected (अस्वीकृत)</option>
            </select>
          </div>
        </div>

        {/* Step 4: Publishing Mode (Instant vs Scheduled) */}
        <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>प्रकाशन समय (Instant या Scheduled Live):</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPublishType('instant');
                  if (contentType === 'live') {
                    setIsLive(true);
                    setStreamStatus('live');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                  publishType === 'instant'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
              >
                🟢 तुरंत (Instant)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPublishType('scheduled');
                  setIsLive(false);
                  setStreamStatus('scheduled');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                  publishType === 'scheduled'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                    : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
              >
                ⏰ शेड्यूल करें (Schedule)
              </button>
            </div>
          </div>

          {publishType === 'scheduled' && (
            <div className="pt-2 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">शेड्यूल तारीख (Date)</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleScheduleChange(e.target.value, scheduledTime)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">शेड्यूल समय (Time)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => handleScheduleChange(scheduledDate, e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Main Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-stone-300">वीडियो / प्लेलिस्ट का शीर्षक (Title) *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा: बिहार बोर्ड 10th गणित - त्रिकोणमिति संपूर्ण अध्याय लेक्चर या प्लेलिस्ट"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Dynamic Source Input based on videoSourceType */}
          {videoSourceType === 'youtube' && (
            <div className="space-y-2 sm:col-span-2 bg-stone-900/60 p-3.5 rounded-2xl border border-stone-800">
              <label className="text-xs font-bold text-stone-300 flex items-center justify-between flex-wrap gap-1">
                <span>YouTube वीडियो लिंक या पब्लिक प्लेलिस्ट लिंक (Video or Public Playlist URL) *</span>
                <span className="text-[10px] text-amber-400">
                  समर्थित: watch?v=..., youtu.be/..., live/..., playlist?list=PL...
                </span>
              </label>
              <input
                type="text"
                required
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  setPlaybackUrl(e.target.value);
                }}
                placeholder="https://www.youtube.com/watch?v=... या https://www.youtube.com/playlist?list=PL..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />

              {youtubeUrl.trim() && (
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {ytValidation.valid ? (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-2 flex-wrap">
                      <span>✓ मान्य YouTube लिंक सत्यापित:</span>
                      {ytValidation.videoId && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                          Video ID: {ytValidation.videoId}
                        </span>
                      )}
                      {ytValidation.playlistId && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <ListVideo className="w-3 h-3" /> Playlist ID: {ytValidation.playlistId}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-400 font-bold">
                      ⚠️ कोई मान्य YouTube Video ID या Playlist ID नहीं मिली। कृपया सही लिंक पेस्ट करें।
                    </div>
                  )}

                  {ytValidation.valid && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewClass({
                          id: 'temp_preview',
                          title: title || 'YouTube Preview',
                          youtubeUrl,
                          playbackUrl: youtubeUrl,
                          videoSourceType: 'youtube',
                          subjectName,
                          chapterName,
                          libraryCategory,
                          youtubePlaylistId: ytValidation.playlistId || undefined,
                          isPlaylist: Boolean(ytValidation.playlistId),
                          teacherName,
                          scheduledAt: 'Preview',
                          isLive: false,
                          publicationStatus: publicationStatus
                        })
                      }
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>अभी प्लेयर में टेस्ट/प्रीव्यू करें</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {videoSourceType === 'video_file' && (
            <div className="space-y-2 sm:col-span-2 bg-stone-900/60 p-3.5 rounded-2xl border border-stone-800">
              <label className="text-xs font-bold text-stone-300 block">
                डायरेक्ट वीडियो फ़ाइल (.mp4 / .webm) अपलोड करें या URL पेस्ट करें *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={playbackUrl}
                  onChange={(e) => {
                    setPlaybackUrl(e.target.value);
                    setYoutubeUrl(e.target.value);
                  }}
                  placeholder="https://.../video.mp4 या नीचे बटन से फ़ाइल अपलोड करें"
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'video');
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingMedia === 'video'}
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingMedia === 'video' ? 'अपलोड हो रहा है...' : 'डिवाइस से वीडियो चुनें'}</span>
                </button>
              </div>
            </div>
          )}

          {videoSourceType === 'hls_stream' && (
            <div className="space-y-1.5 sm:col-span-2 bg-stone-900/60 p-3.5 rounded-2xl border border-red-900/40">
              <label className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> HLS Live Stream Playback URL (.m3u8) *
              </label>
              <input
                type="text"
                required
                value={playbackUrl}
                onChange={(e) => {
                  setPlaybackUrl(e.target.value);
                  setYoutubeUrl(e.target.value);
                }}
                placeholder="उदा: https://customer-xyz.cloudflarestream.com/.../manifest/video.m3u8"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          )}

          {/* Custom Thumbnail URL or Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>16:9 थंबनेल (Thumbnail URL या इमेज अपलोड)</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="खाली छोड़ने पर ऑटो-थंबनेल बनेगा"
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'thumbnail');
                }}
              />
              <button
                type="button"
                disabled={uploadingMedia === 'thumbnail'}
                onClick={() => thumbInputRef.current?.click()}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-stone-700"
                title="कस्टम थंबनेल फोटो अपलोड करें"
              >
                {uploadingMedia === 'thumbnail' ? '...' : '📷 अपलोड'}
              </button>
            </div>
          </div>

          {/* Captions (.vtt) URL or Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
              <Subtitles className="w-3.5 h-3.5 text-amber-400" />
              <span>सबटाइटल / कैप्शन (.vtt URL - वैकल्पिक)</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={captionsUrl}
                onChange={(e) => setCaptionsUrl(e.target.value)}
                placeholder="WebVTT (.vtt) सबटाइटल लिंक"
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <input
                ref={captionsInputRef}
                type="file"
                accept=".vtt,text/vtt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'captions');
                }}
              />
              <button
                type="button"
                disabled={uploadingMedia === 'captions'}
                onClick={() => captionsInputRef.current?.click()}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-stone-700"
              >
                {uploadingMedia === 'captions' ? '...' : 'CC फाइल'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">शिक्षक / चैनल का नाम (Teacher / Channel)</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="उदा: राज सर (पढ़ेगा बिहार)"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">वीडियो अवधि (Duration MM:SS)</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="उदा: 45:20 या Playlist"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">डिस्प्ले क्रम (Display Order - छोटा नंबर ऊपर दिखेगा)</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 10)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> एक्सेस नियंत्रण (Free vs VIP)
            </label>
            <select
              value={isVip ? 'true' : 'false'}
              onChange={(e) => setIsVip(e.target.value === 'true')}
              className="w-full bg-stone-900 border border-amber-600/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="false">🎁 फ्री (सभी छात्रों के लिए खुला)</option>
              <option value="true">🔒 VIP केवल (केवल पेड छात्रों के लिए)</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400" />
                <span>⭐ फीचर्ड वीडियो/प्लेलिस्ट के रूप में पिन करें (Pin to Top)</span>
              </span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-stone-300">
            विस्तृत विवरण / नोट्स (Video Description & Board Notes)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="वीडियो के मुख्य टॉपिक्स, फॉर्मूले या महत्वपूर्ण बिंदु यहाँ लिखें..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <Video className="w-4 h-4" />
            <span>
              {loading
                ? 'सहेजा जा रहा है...'
                : editingId
                ? 'परिवर्तन सहेजें (Update Video/Playlist)'
                : publicationStatus === 'published'
                ? 'अभी पब्लिश करें (Publish to Live Library)'
                : `सहेजें (${publicationStatus.toUpperCase()})`}
            </span>
          </button>

          {!editingId && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setPublicationStatus('draft');
                setTimeout(() => {
                  formTopRef.current?.requestSubmit();
                }, 50);
              }}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-5 py-3 rounded-xl text-xs cursor-pointer border border-stone-700"
            >
              📝 ड्राफ्ट में सेव करें
            </button>
          )}
        </div>
      </form>

      {/* Content Moderation & Management List */}
      <div className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-red-500" />
            <span>वीडियो, प्लेलिस्ट और लाइव स्ट्रीम प्रबंधन ({filteredClasses.length} / {liveClasses.length})</span>
          </h4>

          {/* Moderation Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `सभी (${liveClasses.length})` },
              { id: 'published', label: `✅ पब्लिश्ड (${totalPublished})` },
              { id: 'draft', label: '📝 ड्राफ्ट' },
              { id: 'pending_approval', label: '⏳ पेंडिंग अप्रूवल' },
              { id: 'unpublished', label: '🚫 अनपब्लिश्ड' },
              { id: 'rejected', label: '❌ रिजेक्टेड' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setAdminStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  adminStatusFilter === st.id
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Subject Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-900">
          <select
            value={adminCategoryFilter}
            onChange={(e) => setAdminCategoryFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 font-bold"
          >
            <option value="all">📂 सभी लाइब्रेरी कैटेगरी (All Categories)</option>
            <option value="Live">🔴 Live</option>
            <option value="Classes">📚 Classes</option>
            <option value="Crash Course">⚡ Crash Course</option>
            <option value="Shorts">📱 Shorts</option>
            {LIBRARY_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.hindi}
              </option>
            ))}
          </select>

          <select
            value={adminSubjectFilter}
            onChange={(e) => setAdminSubjectFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 font-bold"
          >
            <option value="all">📖 सभी विषय (All Subjects)</option>
            {BIHAR_BOARD_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              इस फ़िल्टर में कोई वीडियो या प्लेलिस्ट नहीं मिली।
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const pubStatus = cls.publicationStatus || 'published';
              const ytThumb = getYouTubeThumbnailUrl(cls.youtubeUrl);
              const thumbSrc = cls.thumbnailUrl || ytThumb;
              const isCurrentlyLive = cls.isLive || cls.streamStatus === 'live';
              const hasPlaylist = Boolean(cls.isPlaylist || cls.youtubePlaylistId || extractYouTubePlaylistId(cls.youtubeUrl));

              return (
                <div
                  key={cls.id}
                  className={`bg-stone-900 border rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 transition-all ${
                    isCurrentlyLive
                      ? 'border-red-500/50 ring-1 ring-red-500/20'
                      : cls.featured
                      ? 'border-amber-500/40'
                      : 'border-stone-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3.5">
                    {/* 16:9 Thumbnail Preview */}
                    <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0">
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={cls.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-red-950/40 to-stone-950 p-2 text-center">
                          <PlaySquare className="w-6 h-6 text-amber-400 mb-1" />
                          <span className="text-[10px] font-black text-stone-300 line-clamp-1">
                            {cls.subjectName}
                          </span>
                        </div>
                      )}

                      {/* Status Badge on Thumbnail */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        {isCurrentlyLive ? (
                          <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                          </span>
                        ) : hasPlaylist ? (
                          <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                            <ListVideo className="w-3 h-3" /> PLAYLIST
                          </span>
                        ) : cls.streamStatus === 'scheduled' ? (
                          <span className="bg-amber-500 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded shadow">
                            SCHEDULED
                          </span>
                        ) : (
                          <span className="bg-black/80 text-stone-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {cls.category || 'Classes'}
                          </span>
                        )}
                      </div>

                      {cls.duration && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {cls.duration}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Publication status badge */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            pubStatus === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : pubStatus === 'pending_approval'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : pubStatus === 'draft'
                              ? 'bg-stone-800 text-stone-300 border border-stone-700'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {pubStatus === 'published'
                            ? '✓ Published'
                            : pubStatus === 'pending_approval'
                            ? '⏳ Pending Approval'
                            : pubStatus === 'draft'
                            ? '📝 Draft'
                            : pubStatus === 'rejected'
                            ? '❌ Rejected'
                            : '🚫 Unpublished'}
                        </span>

                        {cls.featured && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}

                        <span className="bg-stone-800 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {cls.subjectName}
                        </span>

                        {cls.chapterName && (
                          <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            अध्याय: {cls.chapterName}
                          </span>
                        )}

                        {cls.libraryCategory && (
                          <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {cls.libraryCategory}
                          </span>
                        )}

                        <span className="bg-stone-800/80 text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ArrowUpDown className="w-2.5 h-2.5" /> क्रम: #{cls.displayOrder ?? 10}
                        </span>

                        {cls.isVip ? (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                            🔒 VIP
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                            🎁 FREE
                          </span>
                        )}
                      </div>

                      <h5 className="font-extrabold text-white text-sm leading-snug">{cls.title}</h5>

                      <div className="flex items-center gap-3 text-[11px] text-stone-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-400" /> {cls.teacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" /> {cls.scheduledAt}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Eye className="w-3 h-3" /> {(cls.viewsCount || 0).toLocaleString('en-IN')} views
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <ThumbsUp className="w-3 h-3" /> {(cls.likesCount || 0).toLocaleString('en-IN')} likes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Action Toolbar */}
                  <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2 flex-wrap">
                    {/* Live Stream Real-Time Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!isCurrentlyLive ? (
                        <button
                          type="button"
                          onClick={() => handleStreamLifecycle(cls, 'start_live')}
                          className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                          title="इस वीडियो/स्ट्रीम को अभी लाइव (LIVE) शुरू करें"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Go Live (Start Stream)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStreamLifecycle(cls, 'end_live')}
                          className="bg-stone-800 hover:bg-stone-700 text-red-400 border border-red-500/40 text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="लाइव स्ट्रीम समाप्त करें और रिकॉर्डेड में बदलें"
                        >
                          <Square className="w-3 h-3 fill-red-400" />
                          <span>End Stream</span>
                        </button>
                      )}

                      {/* Approve / Publish / Unpublish */}
                      {pubStatus !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => handlePublicationChange(cls, 'published')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublicationChange(cls, 'unpublished')}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer border border-stone-700"
                        >
                          <XCircle className="w-3.5 h-3.5 text-stone-400" />
                          <span>Unpublish</span>
                        </button>
                      )}

                      {pubStatus === 'pending_approval' && (
                        <button
                          type="button"
                          onClick={() => handlePublicationChange(cls, 'rejected')}
                          className="bg-red-950 hover:bg-red-900 text-red-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-red-800 cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>

                    {/* Secondary Controls: Preview, Pin, VIP, Attendance, Edit, Delete */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPreviewClass(cls)}
                        className="bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-stone-700 flex items-center gap-1 cursor-pointer"
                        title="पब्लिश करने से पहले प्रीव्यू चलाएं"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>प्रीव्यू (Preview)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(cls)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer ${
                          cls.featured
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                        }`}
                        title="फीचर्ड पिन टॉगल करें"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{cls.featured ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVip(cls.id, !!cls.isVip)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer ${
                          cls.isVip
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {cls.isVip ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{cls.isVip ? 'VIP' : 'Free'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceModalClass(cls)}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>अटेंडेंस</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditClass(cls)}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-1.5 rounded-xl border border-stone-700 cursor-pointer"
                        title="संपादित करें (Edit)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(cls.id, cls.title)}
                        className="bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 p-1.5 rounded-xl border border-stone-700 cursor-pointer"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Preview Modal (Supports single YouTube videos, public YouTube playlists, MP4/HLS, and Smart AI Board) */}
      {previewClass && (
        <div
          onClick={() => setPreviewClass(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-950 border border-stone-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3 p-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  Admin Preview Mode ({previewClass.publicationStatus || 'published'})
                </span>
                <h4 className="font-black text-sm text-white mt-1 line-clamp-1">{previewClass.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewClass(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              {previewClass.videoSourceType === 'video_file' ||
              previewClass.videoSourceType === 'hls_stream' ||
              previewClass.playbackUrl?.match(/\.(mp4|webm|ogg|m3u8)$/i) ? (
                <video
                  src={previewClass.playbackUrl || previewClass.youtubeUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  {previewClass.captionsUrl && (
                    <track kind="subtitles" src={previewClass.captionsUrl} srcLang="hi" label="हिन्दी" default />
                  )}
                </video>
              ) : isValidYouTubeUrlOrId(previewClass.youtubeUrl).valid ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewClass.youtubeUrl, {
                    useNoCookie: true,
                    autoplay: true,
                    playlistId: previewClass.youtubePlaylistId
                  })}
                  title={previewClass.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-200">Smart AI Board Interactive Lecture</p>
                  <p className="text-[11px] text-stone-400 line-clamp-3">{previewClass.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="text-xs text-stone-400">
                विषय: <b className="text-white">{previewClass.subjectName}</b>
                {previewClass.chapterName ? (
                  <>
                    {' '}
                    • अध्याय: <b className="text-blue-300">{previewClass.chapterName}</b>
                  </>
                ) : null}{' '}
                • श्रेणी:{' '}
                <b className="text-amber-300">
                  {previewClass.libraryCategory || previewClass.category || 'Classes'}
                </b>
              </div>
              {previewClass.id !== 'temp_preview' &&
                (previewClass.publicationStatus || 'published') !== 'published' && (
                  <button
                    type="button"
                    onClick={() => {
                      handlePublicationChange(previewClass, 'published');
                      setPreviewClass(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer"
                  >
                    ✅ अभी अप्रूव और पब्लिश करें
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Class Attendance Modal */}
      {attendanceModalClass && (
        <ClassAttendanceModal
          isOpen={!!attendanceModalClass}
          onClose={() => setAttendanceModalClass(null)}
          classTitle={attendanceModalClass.title}
          isLive={attendanceModalClass.isLive}
          activeRecords={activeRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          isAdmin={true}
        />
      )}
    </div>
  );
}
