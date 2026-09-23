import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc } from '../utils/firestoreSafe';
import { useAuth } from './AuthContext';
import { getStaticCollection, getStaticData } from '../lib/staticData';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { Subject, PaidPdfNote, LiveClass, DailyQuizItem, LeaderboardEntry, RoutineItem, MotivationalQuote, NotificationItem, AppConfig, BannerItem } from '../types';

export const defaultBanners: BannerItem[] = [
  {
    id: 'banner_1',
    tag: 'बिहार बोर्ड परीक्षा फुल सिलेबस',
    title: 'टॉपर बैच - फुल सिलेबस',
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
    actionText: 'ज्वाइन करें',
    actionSub: 'VIP अनलॉक',
    bgGradient: 'from-red-900 via-stone-900 to-red-950',
    badgeColor: 'bg-amber-400 text-stone-950'
  },
  {
    id: 'banner_2',
    tag: 'स्पेशल स्टडी मटेरियल',
    title: 'टॉपर हैंडराइटिंग नोट्स',
    subtitle: 'संपूर्ण 10वीं सिलेबस कवरेज',
    features: [
      'VVI महत्वपूर्ण प्रश्नोत्तर',
      'संस्कृत पीयूषम् सम्पूर्ण श्लोकार्थ',
      'गणित सूत्र एवं ट्रिक्स',
      'बोर्ड परीक्षा मॉडल पेपर्स'
    ],
    subjects: ['NCERT आधारित', 'PYQ संग्रह', '100% स्कोरिंग'],
    oldPrice: '₹999',
    newPrice: '₹99 मात्र',
    priceLabel: '1 Month Fee',
    actionText: 'नोट्स देखें',
    actionSub: 'डाउनलोड करें',
    bgGradient: 'from-amber-900 via-stone-900 to-stone-950',
    badgeColor: 'bg-emerald-400 text-stone-950'
  },
  {
    id: 'banner_3',
    tag: '50 Objective MCQ Series',
    title: 'महा-टेस्ट सीरीज फुल सिलेबस',
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

export const defaultAppConfig: AppConfig = {
  helplineNumber: '9241511070',
  upiId: '9708868515@ybl',
  qrCodeDataUrl: '',
  appLogoUrl: '/app_logo.svg',
  youtubeUrl: 'https://www.youtube.com/@Vidyaagent2.0',
  instagramUrl: 'https://www.instagram.com/unbroken_raj_01?stkn=dmJwNzNhNDl0cXhz',
  whatsappGroupUrl: 'https://wa.me/919241511070?text=' + encodeURIComponent('नमस्ते सर, मुझे 10th BSEB फुल सिलेबस WhatsApp ग्रुप में जोड़ें।'),
  telegramUrl: 'https://t.me',
  price1Month: 99,
  price1Year: 600,
  banners: defaultBanners,
  apkUrl: 'https://ais-dev-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app',
  aabUrl: 'https://ais-dev-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app'
};

export const defaultRoutine: RoutineItem[] = [
  {
    id: 'rout_1',
    time: '06:30 AM - 07:30 AM',
    subject: 'संस्कृत (पीयूषम्)',
    topic: 'श्लोक वाचन, शब्दार्थ & व्याकरण',
    instructor: 'संस्कृत विशेषज्ञ',
    days: 'सोमवार, बुधवार, शुक्रवार',
    color: 'border-l-amber-500 bg-amber-50/50'
  },
  {
    id: 'rout_2',
    time: '07:30 AM - 08:30 AM',
    subject: 'विज्ञान (Science)',
    topic: 'भौतिकी / रसायन / जीवविज्ञान थ्योरी',
    instructor: 'साइंस टीम',
    days: 'प्रतिदिन (Mon - Sat)',
    color: 'border-l-blue-500 bg-blue-50/50'
  },
  {
    id: 'rout_3',
    time: '04:30 PM - 05:30 PM',
    subject: 'गणित (Mathematics)',
    topic: 'NCERT प्रश्नावली & उदाहरण अभ्यास',
    instructor: 'मैथ्स गुरु',
    days: 'प्रतिदिन (Mon - Sat)',
    color: 'border-l-red-500 bg-red-50/50'
  },
  {
    id: 'rout_4',
    time: '06:00 PM - 07:00 PM',
    subject: 'सामाजिक विज्ञान (SST)',
    topic: 'इतिहास, भूगोल, अर्थशास्त्र, आपदा प्रबंधन',
    instructor: 'SST एक्सपर्ट',
    days: 'मंगलवार, गुरुवार, शनिवार',
    color: 'border-l-emerald-500 bg-emerald-50/50'
  },
  {
    id: 'rout_5',
    time: '07:30 PM - 08:30 PM',
    subject: 'हिंदी (गोधूलि & व्याकरण)',
    topic: 'गद्य, पद्य एवं पत्र/निबंध लेखन',
    instructor: 'हिंदी विशेषज्ञ',
    days: 'सोमवार, बुधवार, शुक्रवार',
    color: 'border-l-purple-500 bg-purple-50/50'
  }
];

export const defaultQuotes: MotivationalQuote[] = [
  {
    id: 'q_1',
    quote: 'मंजिलें उन्हीं को मिलती हैं, जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!',
    author: 'बिहार बोर्ड टॉपर प्रेरणा',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'q_2',
    quote: 'अशिक्षा को हराओ, बिहार बोर्ड फुल सिलेबस में 90%+ अंक लाकर अपने माता-पिता का नाम रोशन करो!',
    author: 'राज सर',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'q_3',
    quote: 'संघर्ष ही सफलता की कुंजी है। प्रतिदिन 5 घंटे नियमित पढ़ाई ही आपको टॉपर बनाएगी।',
    author: 'टॉपर गुरु टीम',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🎉 टॉपर बैच फुल सिलेबस स्पेशल ऑफर!',
    description: 'बिहार बोर्ड 10वीं के सभी 6 विषयों का सम्पूर्ण कोर्स अब मात्र ₹99 (1 माह) या ₹600 (पूरे 1 वर्ष) में उपलब्ध है। अभी VIP बैच अनलॉक करें।',
    timeLabel: '10 मिनट पहले',
    isNew: true,
    actionType: 'vip',
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    title: '📝 संस्कृत (मङ्गलम्) के 50 नए VVI MCQs लाइव हैं',
    description: 'संस्कृत पीयूषम् के प्रथम पाठ के 50 चुनिंदा वस्तुनिष्ठ प्रश्नों का टेस्ट सेट अपलोड कर दिया गया है। अपना स्कोर तुरंत चेक करें।',
    timeLabel: 'आज, 09:30 AM',
    isNew: true,
    actionType: 'courses',
    createdAt: new Date().toISOString()
  }
];

export const defaultLiveClasses: LiveClass[] = [
  {
    id: 'live_default_1',
    title: 'संस्कृत - मङ्गलम् संपूर्ण व्याख्या एवं VVI ऑब्जेक्टिव प्रश्न (Live Class)',
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    subjectName: 'संस्कृत',
    teacherName: 'राज सर',
    scheduledAt: 'आज शाम 6:00 बजे',
    isLive: true,
    description: 'बिहार बोर्ड फुल सिलेबस परीक्षा के लिए संस्कृत प्रथम अध्याय मङ्गलम् का लाइव महामौरथन।',
    createdAt: new Date().toISOString()
  },
  {
    id: 'live_default_2',
    title: 'विज्ञान - रासायनिक समीकरण एवं अभिक्रियाएँ (Recorded Class)',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    subjectName: 'विज्ञान',
    teacherName: 'प्रिया मैम',
    scheduledAt: 'कल अपलोड किया गया',
    isLive: false,
    description: 'कक्षा 10वीं रसायन विज्ञान चैप्टर 1 के सभी महत्वपूर्ण प्रश्न उत्तर।',
    createdAt: new Date().toISOString()
  }
];

export const defaultDailyQuizzes: DailyQuizItem[] = [
  { id: 'dq_1', dateLabel: '19 सितम्बर', subjectName: 'संस्कृत', title: 'संस्कृत - मङ्गलम् एवं व्याकरण टेस्ट', chaptersCount: 16, totalQuestions: 438, createdAt: new Date().toISOString() },
  { id: 'dq_2', dateLabel: '18 सितम्बर', subjectName: 'अर्थव्यवस्था', title: 'भारतीय अर्थव्यवस्था का विकास - वस्तुनिष्ठ प्रश्न', chaptersCount: 5, totalQuestions: 150, createdAt: new Date().toISOString() },
  { id: 'dq_3', dateLabel: '17 सितम्बर', subjectName: 'भूगोल', title: 'भारत - संसाधन एवं उपयोग टेस्ट', chaptersCount: 7, totalQuestions: 200, createdAt: new Date().toISOString() },
  { id: 'dq_4', dateLabel: '16 सितम्बर', subjectName: 'इतिहास', title: 'यूरोप में राष्ट्रवाद - महत्वपूर्ण प्रश्न', chaptersCount: 8, totalQuestions: 250, createdAt: new Date().toISOString() },
  { id: 'dq_5', dateLabel: '15 सितम्बर', subjectName: 'गणित', title: 'वास्तविक संख्याएँ & बहुपद - सुपर टेस्ट', chaptersCount: 15, totalQuestions: 300, createdAt: new Date().toISOString() },
  { id: 'dq_6', dateLabel: '14 सितम्बर', subjectName: 'Mix - विज्ञान', title: 'भौतिकी, रसायन एवं जीवविज्ञान महामॉक टेस्ट', chaptersCount: 16, totalQuestions: 500, createdAt: new Date().toISOString() },
  { id: 'dq_7', dateLabel: '13 सितम्बर', subjectName: 'Mix - All Subject', title: 'बिहार बोर्ड 10वीं ऑल-सब्जेक्ट ग्रैंड टेस्ट', chaptersCount: 20, totalQuestions: 600, createdAt: new Date().toISOString() },
  { id: 'dq_8', dateLabel: '11 सितम्बर', subjectName: 'हिंदी - वर्णिका', title: 'वर्णिका भाग 2 सम्पूर्ण कथा वस्तुनिष्ठ टेस्ट', chaptersCount: 5, totalQuestions: 150, createdAt: new Date().toISOString() },
  { id: 'dq_9', dateLabel: '10 सितम्बर', subjectName: 'हिंदी - पद्य', title: 'पद्य खंड - सूरदास, कबीर के पद व कविताएँ', chaptersCount: 12, totalQuestions: 350, createdAt: new Date().toISOString() },
  { id: 'dq_10', dateLabel: '5 सितम्बर', subjectName: 'हिंदी - गद्य', title: 'गद्य खंड - श्रम विभाजन और जाति प्रथा', chaptersCount: 12, totalQuestions: 350, createdAt: new Date().toISOString() },
  { id: 'dq_11', dateLabel: '4 सितम्बर', subjectName: 'भौतिकी', title: 'प्रकाश का परावर्तन तथा अपवर्तन टेस्ट', chaptersCount: 4, totalQuestions: 120, createdAt: new Date().toISOString() },
  { id: 'dq_12', dateLabel: '3 सितम्बर', subjectName: 'रसायनशास्त्र', title: 'रासायनिक अभिक्रियाएँ एवं समीकरण', chaptersCount: 5, totalQuestions: 150, createdAt: new Date().toISOString() },
  { id: 'dq_13', dateLabel: '20 अगस्त', subjectName: 'जीवविज्ञान', title: 'जैव प्रक्रम (Life Processes) महाटेस्ट', chaptersCount: 6, totalQuestions: 180, createdAt: new Date().toISOString() }
];

export const defaultLeaderboard: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    studentName: 'राहुल कुमार (Topper)',
    district: 'पटना (Patna)',
    score: 492,
    totalMarks: 500,
    testName: 'बिहार बोर्ड फुल सिलेबस फाइनल मेगा टेस्ट',
    subjectName: 'सभी विषय (All Subjects)',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_2',
    studentName: 'प्रिया शर्मा',
    district: 'मुजफ्फरपुर (Muzaffarpur)',
    score: 486,
    totalMarks: 500,
    testName: 'संस्कृत मङ्गलम् महामौरथन टेस्ट',
    subjectName: 'संस्कृत',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_3',
    studentName: 'अमित कुमार यादव',
    district: 'दरभंगा (Darbhanga)',
    score: 481,
    totalMarks: 500,
    testName: 'विज्ञान VVI ऑब्जेक्टिव टेस्ट',
    subjectName: 'विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: false
  },
  {
    id: 'lb_4',
    studentName: 'नेहा कुमारी',
    district: 'समस्तीपुर (Samastipur)',
    score: 475,
    totalMarks: 500,
    testName: 'गणित त्रिकोणमिति मॉडल टेस्ट',
    subjectName: 'गणित',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_5',
    studentName: 'विवेक राज',
    district: 'गया (Gaya)',
    score: 468,
    totalMarks: 500,
    testName: 'सामाजिक विज्ञान इतिहास टेस्ट',
    subjectName: 'सामाजिक विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: false
  },
  {
    id: 'lb_6',
    studentName: 'सुनीता सिंह',
    district: 'बेगूसराय (Begusarai)',
    score: 462,
    totalMarks: 500,
    testName: 'हिन्दी गद्य खंड महाटेस्ट',
    subjectName: 'हिन्दी',
    createdAt: new Date().toISOString(),
    isVip: true
  }
];

interface DataContextType {
  subjects: Record<string, Subject>;
  paidNotes: PaidPdfNote[];
  liveClasses: LiveClass[];
  dailyQuizzes: DailyQuizItem[];
  leaderboard: LeaderboardEntry[];
  routine: RoutineItem[];
  motivationalQuotes: MotivationalQuote[];
  notifications: NotificationItem[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addPaidNote: (note: Omit<PaidPdfNote, 'id'>) => Promise<string>;
  deletePaidNote: (id: string) => Promise<void>;
  addLiveClass: (cls: Omit<LiveClass, 'id'>) => Promise<string>;
  deleteLiveClass: (id: string) => Promise<void>;
  addDailyQuiz: (quiz: Omit<DailyQuizItem, 'id'>) => Promise<string>;
  deleteDailyQuiz: (id: string) => Promise<void>;
  addLeaderboardScore: (entry: Omit<LeaderboardEntry, 'id'>) => Promise<string>;
  addRoutineItem: (item: Omit<RoutineItem, 'id'>) => Promise<string>;
  updateRoutineItem: (id: string, item: Partial<RoutineItem>) => Promise<void>;
  deleteRoutineItem: (id: string) => Promise<void>;
  addQuote: (quote: Omit<MotivationalQuote, 'id'>) => Promise<string>;
  deleteQuote: (id: string) => Promise<void>;
  toggleQuoteActive: (id: string, isActive: boolean) => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id'>) => Promise<string>;
  deleteNotification: (id: string) => Promise<void>;
  appConfig: AppConfig;
  updateSettings: (config: AppConfig) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const getMergedSubjects = (baseSubjects: Record<string, Subject>) => {
  const merged = { ...baseSubjects };
  try {
    const cached = localStorage.getItem('bseb_admin_chapters_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.keys(parsed).forEach(sId => {
        if (!merged[sId]) {
          merged[sId] = parsed[sId];
        } else {
          const existingMap = new Map((merged[sId].chapters || []).map((c: any) => [Number(c.chapter_no), c]));
          (parsed[sId].chapters || []).forEach((c: any) => {
            const chNo = Number(c.chapter_no);
            const baseCh = existingMap.get(chNo);
            if (baseCh && (baseCh.mcq?.length || 0) > (c.mcq?.length || 0)) {
              existingMap.set(chNo, { ...c, mcq: baseCh.mcq });
            } else {
              existingMap.set(chNo, c);
            }
          });
          merged[sId] = {
            ...merged[sId],
            subject_name_hindi: parsed[sId].subject_name_hindi || merged[sId].subject_name_hindi,
            chapters: Array.from(existingMap.values()).sort((a: any, b: any) => a.chapter_no - b.chapter_no)
          };
        }
      });
    }
  } catch {}
  return merged;
};

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Record<string, Subject>>(() => getMergedSubjects(defaultSubjectsData));
  const [paidNotes, setPaidNotes] = useState<PaidPdfNote[]>(defaultPaidPdfNotes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const data = await getStaticData();
        if (!data) return;

        // Subjects
        const subjectsMap: Record<string, Subject> = {};
        if (data.subjects && Array.isArray(data.subjects)) {
          data.subjects.forEach((sub: any) => {
            subjectsMap[sub.id] = sub as Subject;
          });
        }
        const baseSub = Object.keys(subjectsMap).length > 0 ? subjectsMap : defaultSubjectsData;
        setSubjects(getMergedSubjects(baseSub));

        // Paid Notes
        setPaidNotes(data.paid_notes || defaultPaidPdfNotes);

        // Live Classes
        const staticLive = data.live_classes || defaultLiveClasses;
        setLiveClasses((prev) => {
          const map = new Map<string, LiveClass>();
          staticLive.forEach((c: LiveClass) => map.set(c.id, c));
          prev.forEach(c => map.set(c.id, c));
          try {
            const cached = localStorage.getItem('bseb_live_classes_cache');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) parsed.forEach((c: LiveClass) => map.set(c.id, c));
            }
          } catch {}
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        });

        // Daily Quizzes
        setDailyQuizzes(data.daily_quizzes || defaultDailyQuizzes);

        // Leaderboard
        setLeaderboard(data.leaderboard || defaultLeaderboard);

        // Routine
        setRoutine(data.routine || defaultRoutine);

        // Quotes
        setMotivationalQuotes(data.motivational_quotes || defaultQuotes);

        // Notifications
        setNotifications(data.notifications || defaultNotifications);

        // App Config
        setAppConfig(data.app_config || defaultAppConfig);

      } catch (e) {
        console.error("Failed to load static data:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const fetchData = async () => {
    // fetchData is deprecated, replaced by initial load
  };

  // Real-time listener removed - using static data load instead

  const addPaidNote = async (noteData: Omit<PaidPdfNote, 'id'>): Promise<string> => {
    const id = 'note_' + Date.now();
    const newNote: PaidPdfNote = {
      id,
      ...noteData,
      uploadedAt: noteData.uploadedAt || new Date().toISOString()
    };

    setPaidNotes((prev) => [newNote, ...prev]);
    try {
      const updated = [newNote, ...paidNotes];
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeSetDoc(doc(db, 'paid_notes', id), newNote, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore note save notice:", e?.message || String(e));
    }
    return id;
  };

  const deletePaidNote = async (id: string): Promise<void> => {
    setPaidNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const updated = paidNotes.filter((n) => n.id !== id);
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'paid_notes', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore note delete notice:", e?.message || String(e));
    }
  };

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_live_classes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, LiveClass>();
          defaultLiveClasses.forEach(c => map.set(c.id, c));
          parsed.forEach(c => map.set(c.id, c));
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }
      }
    } catch {}
    return defaultLiveClasses;
  });

  // Real-time listener for live_classes
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'live_classes'), (snapshot) => {
        const classesFromDb: LiveClass[] = [];
        snapshot.forEach((docSnap) => {
          classesFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        
        setLiveClasses((prev) => {
          const map = new Map<string, LiveClass>();
          defaultLiveClasses.forEach(c => map.set(c.id, c));
          prev.forEach(c => map.set(c.id, c));
          classesFromDb.forEach(c => map.set(c.id, c));
          const combined = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          try {
            localStorage.setItem('bseb_live_classes_cache', JSON.stringify(combined));
          } catch {}
          return combined;
        });
      }, (err) => {
        console.warn("Live classes snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Live classes listener error:", err?.message || String(err));
    }
  }, []);

  const addLiveClass = async (classData: Omit<LiveClass, 'id'>): Promise<string> => {
    const id = 'live_' + Date.now();
    const newClass: LiveClass = {
      id,
      ...classData,
      createdAt: classData.createdAt || new Date().toISOString()
    };

    setLiveClasses((prev) => {
      const updated = [newClass, ...prev];
      try {
        localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save to server app_data.json permanently so it never disappears across sessions
    try {
      fetch('/api/save-live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      }).catch(() => {});
    } catch {}

    try {
      await safeSetDoc(doc(db, 'live_classes', id), newClass);
    } catch (e: any) {
      console.warn("Firestore live class save notice:", e?.message || String(e));
    }
    return id;
  };

  const deleteLiveClass = async (id: string): Promise<void> => {
    setLiveClasses((prev) => prev.filter((c) => c.id !== id));
    try {
      const updated = liveClasses.filter((c) => c.id !== id);
      localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
    } catch {}

    try {
      fetch('/api/delete-live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {});
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'live_classes', id));
    } catch (e: any) {
      console.warn("Firestore live class delete notice:", e?.message || String(e));
    }
  };

  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuizItem[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_daily_quizzes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultDailyQuizzes;
  });

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'daily_quizzes'), (snapshot) => {
        const quizzesFromDb: DailyQuizItem[] = [];
        snapshot.forEach((docSnap) => {
          quizzesFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setDailyQuizzes(quizzesFromDb.length > 0 ? quizzesFromDb : defaultDailyQuizzes);
      }, (err) => {
        console.warn("Daily quizzes snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Daily quizzes listener error:", err?.message || String(err));
    }
  }, []);

  const addDailyQuiz = async (quizData: Omit<DailyQuizItem, 'id'>): Promise<string> => {
    const id = 'quiz_' + Date.now();
    const newQuiz: DailyQuizItem = {
      id,
      ...quizData,
      createdAt: quizData.createdAt || new Date().toISOString()
    };

    setDailyQuizzes((prev) => [newQuiz, ...prev]);
    try {
      const updated = [newQuiz, ...dailyQuizzes];
      localStorage.setItem('bseb_daily_quizzes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeSetDoc(doc(db, 'daily_quizzes', id), newQuiz);
    } catch (e: any) {
      console.warn("Firestore daily quiz save notice:", e?.message || String(e));
    }
    return id;
  };

  const deleteDailyQuiz = async (id: string): Promise<void> => {
    setDailyQuizzes((prev) => prev.filter((q) => q.id !== id));
    try {
      const updated = dailyQuizzes.filter((q) => q.id !== id);
      localStorage.setItem('bseb_daily_quizzes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'daily_quizzes', id));
    } catch (e: any) {
      console.warn("Firestore daily quiz delete notice:", e?.message || String(e));
    }
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_leaderboard_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultLeaderboard;
  });

  // Real-time listener removed - using static data load instead

  const addLeaderboardScore = async (entryData: Omit<LeaderboardEntry, 'id'>): Promise<string> => {
    const id = 'lb_' + Date.now();
    const newEntry: LeaderboardEntry = {
      id,
      ...entryData,
      createdAt: entryData.createdAt || new Date().toISOString()
    };

    setLeaderboard((prev) => {
      const updated = [newEntry, ...prev];
      updated.sort((a, b) => b.score - a.score);
      try {
        localStorage.setItem('bseb_leaderboard_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'leaderboard', id), newEntry);
    } catch (e: any) {
      console.warn("Firestore leaderboard save notice:", e?.message || String(e));
    }
    return id;
  };

  const [routine, setRoutine] = useState<RoutineItem[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_routine_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultRoutine;
  });

  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuote[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_quotes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultQuotes;
  });

  // Routine Firestore listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'routine'), (snapshot) => {
        if (!snapshot.empty) {
          const list: RoutineItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          const merged = [...list];
          defaultRoutine.forEach((def) => {
            if (!merged.some(m => m.id === def.id)) merged.push(def);
          });
          setRoutine(merged);
          try {
            localStorage.setItem('bseb_routine_cache', JSON.stringify(merged));
          } catch {}
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  // Quotes Firestore listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'motivational_quotes'), (snapshot) => {
        if (!snapshot.empty) {
          const list: MotivationalQuote[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          const merged = [...list];
          defaultQuotes.forEach((def) => {
            if (!merged.some(m => m.id === def.id)) merged.push(def);
          });
          setMotivationalQuotes(merged);
          try {
            localStorage.setItem('bseb_quotes_cache', JSON.stringify(merged));
          } catch {}
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const addRoutineItem = async (itemData: Omit<RoutineItem, 'id'>): Promise<string> => {
    const id = 'rout_' + Date.now();
    const newItem: RoutineItem = { id, ...itemData };
    setRoutine((prev) => {
      const updated = [...prev, newItem];
      try { localStorage.setItem('bseb_routine_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeSetDoc(doc(db, 'routine', id), newItem);
    } catch (e: any) {
      console.warn("Firestore routine save notice:", e?.message);
    }
    return id;
  };

  const updateRoutineItem = async (id: string, itemData: Partial<RoutineItem>): Promise<void> => {
    setRoutine((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...itemData } : r));
      try { localStorage.setItem('bseb_routine_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      const target = routine.find(r => r.id === id);
      if (target) {
        await safeSetDoc(doc(db, 'routine', id), { ...target, ...itemData });
      }
    } catch (e: any) {
      console.warn("Firestore routine update notice:", e?.message);
    }
  };

  const deleteRoutineItem = async (id: string): Promise<void> => {
    setRoutine((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try { localStorage.setItem('bseb_routine_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeDeleteDoc(doc(db, 'routine', id));
    } catch (e: any) {
      console.warn("Firestore routine delete notice:", e?.message);
    }
  };

  const addQuote = async (quoteData: Omit<MotivationalQuote, 'id'>): Promise<string> => {
    const id = 'q_' + Date.now();
    const newQuote: MotivationalQuote = { id, ...quoteData, createdAt: new Date().toISOString() };
    setMotivationalQuotes((prev) => {
      const updated = [newQuote, ...prev];
      try { localStorage.setItem('bseb_quotes_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeSetDoc(doc(db, 'motivational_quotes', id), newQuote);
    } catch (e: any) {
      console.warn("Firestore quote save notice:", e?.message);
    }
    return id;
  };

  const deleteQuote = async (id: string): Promise<void> => {
    setMotivationalQuotes((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      try { localStorage.setItem('bseb_quotes_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeDeleteDoc(doc(db, 'motivational_quotes', id));
    } catch (e: any) {
      console.warn("Firestore quote delete notice:", e?.message);
    }
  };

  const toggleQuoteActive = async (id: string, isActive: boolean): Promise<void> => {
    setMotivationalQuotes((prev) => {
      const updated = prev.map((q) => (q.id === id ? { ...q, isActive } : q));
      try { localStorage.setItem('bseb_quotes_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      const target = motivationalQuotes.find(q => q.id === id);
      if (target) {
        await safeSetDoc(doc(db, 'motivational_quotes', id), { ...target, isActive });
      }
    } catch (e: any) {
      console.warn("Firestore quote toggle notice:", e?.message);
    }
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_notifications_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultNotifications;
  });

  // Notifications Firestore listener removed - using static data load instead

  const addNotification = async (itemData: Omit<NotificationItem, 'id'>): Promise<string> => {
    const id = 'notif_' + Date.now();
    const newItem: NotificationItem = { id, ...itemData, createdAt: new Date().toISOString() };
    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      try { localStorage.setItem('bseb_notifications_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeSetDoc(doc(db, 'notifications', id), newItem);
    } catch (e: any) {
      console.warn("Firestore notification save notice:", e?.message);
    }
    return id;
  };

  const deleteNotification = async (id: string): Promise<void> => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try { localStorage.setItem('bseb_notifications_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await safeDeleteDoc(doc(db, 'notifications', id));
    } catch (e: any) {
      console.warn("Firestore notification delete notice:", e?.message);
    }
  };

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    try {
      const cached = localStorage.getItem('bseb_app_config_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return { ...defaultAppConfig, ...parsed };
      }
    } catch {}
    return defaultAppConfig;
  });

  // Listen to remote payment_config in real time to sync Logo / DP / UPI across devices
  useEffect(() => {
    try {
      const paymentRef = doc(db, 'app_settings', 'payment_config');
      const unsub = onSnapshot(paymentRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAppConfig((prev) => {
            const updated = {
              ...prev,
              ...(data.upiId ? { upiId: data.upiId } : {}),
              ...(data.qrCodeUrl !== undefined ? { qrCodeDataUrl: data.qrCodeUrl } : {}),
              ...(data.appLogoUrl ? { appLogoUrl: data.appLogoUrl } : {}),
              ...(data.price ? { price1Year: Number(data.price) } : {}),
              ...(data.price1Year ? { price1Year: Number(data.price1Year) } : {}),
              ...(data.helplineNumber ? { helplineNumber: data.helplineNumber } : {})
            };
            try {
              localStorage.setItem('bseb_app_config_cache', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }, (err) => {
        console.warn("Payment config listener notice:", err?.message);
      });
      return () => unsub();
    } catch {}
  }, []);

  const updateSettings = async (newConfig: AppConfig): Promise<void> => {
    setAppConfig(newConfig);
    try {
      localStorage.setItem('bseb_app_config_cache', JSON.stringify(newConfig));
    } catch {}
    try {
      await safeSetDoc(doc(db, 'settings', 'app_config'), newConfig);
    } catch (e: any) {
      console.warn("Firestore settings update notice:", e?.message);
    }
    try {
      await safeSetDoc(doc(db, 'app_settings', 'payment_config'), {
        upiId: newConfig.upiId,
        qrCodeUrl: newConfig.qrCodeDataUrl,
        appLogoUrl: newConfig.appLogoUrl,
        price: newConfig.price1Year,
        price1Year: newConfig.price1Year,
        helplineNumber: newConfig.helplineNumber
      }, { merge: true }, 5000, true);
    } catch (e: any) {
      console.warn("Firestore payment_config update notice:", e?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <DataContext.Provider value={{ 
      subjects, 
      paidNotes, 
      liveClasses,
      dailyQuizzes,
      leaderboard,
      routine,
      motivationalQuotes,
      notifications,
      appConfig,
      loading, 
      refreshData: fetchData,
      addPaidNote,
      deletePaidNote,
      addLiveClass,
      deleteLiveClass,
      addDailyQuiz,
      deleteDailyQuiz,
      addLeaderboardScore,
      addRoutineItem,
      updateRoutineItem,
      deleteRoutineItem,
      addQuote,
      deleteQuote,
      toggleQuoteActive,
      addNotification,
      deleteNotification,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

