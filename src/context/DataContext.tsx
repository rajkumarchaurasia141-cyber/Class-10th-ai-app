import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { Subject, PaidPdfNote, LiveClass, LeaderboardEntry, RoutineItem, MotivationalQuote, NotificationItem, AppConfig } from '../types';
import { syncInitialCurriculumToFirestore } from '../utils/firestoreCurriculumSync';

export const defaultAppConfig: AppConfig = {
  helplineNumber: '9241511070',
  upiId: '9708868515@ybl',
  qrCodeDataUrl: '',
  youtubeUrl: 'https://www.youtube.com/@Vidyaagent2.0',
  instagramUrl: 'https://www.instagram.com/unbroken_raj_01?stkn=dmJwNzNhNDl0cXhz',
  whatsappGroupUrl: 'https://wa.me/919241511070?text=' + encodeURIComponent('नमस्ते सर, मुझे 10th BSEB 2027 WhatsApp ग्रुप में जोड़ें।'),
  telegramUrl: 'https://t.me',
  price1Month: 99,
  price1Year: 600
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
    quote: 'अशिक्षा को हराओ, बिहार बोर्ड 2027 में 90%+ अंक लाकर अपने माता-पिता का नाम रोशन करो!',
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
    title: '🎉 टॉपर बैच 2027 स्पेशल ऑफर!',
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
    description: 'बिहार बोर्ड 2027 परीक्षा के लिए संस्कृत प्रथम अध्याय मङ्गलम् का लाइव महामौरथन।',
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

export const defaultLeaderboard: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    studentName: 'राहुल कुमार (Topper)',
    district: 'पटना (Patna)',
    score: 492,
    totalMarks: 500,
    testName: 'बिहार बोर्ड 2027 फाइनल मेगा टेस्ट',
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

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Record<string, Subject>>(defaultSubjectsData);
  const [paidNotes, setPaidNotes] = useState<PaidPdfNote[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_paid_notes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPaidPdfNotes;
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subsSnap = await getDocs(collection(db, 'subjects'));
      const firestoreData: Record<string, any> = {};

      for (const docSnap of subsSnap.docs) {
        const sub = docSnap.data();
        const subId = docSnap.id;
        const chSnap = await getDocs(query(collection(db, 'subjects', subId, 'chapters'), orderBy('chapter_no', 'asc')));
        firestoreData[subId] = {
          ...sub,
          id: subId,
          chapters: chSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        };
      }

      // Merge: Start with default subjects, then overlay firestore data
      const merged: Record<string, Subject> = { ...defaultSubjectsData };

      Object.keys(firestoreData).forEach((subKey) => {
        if (!merged[subKey]) {
          merged[subKey] = firestoreData[subKey];
        } else {
          // Merge chapters
          const existingChapters = [...(merged[subKey].chapters || [])];
          const firestoreChapters = firestoreData[subKey].chapters || [];

          firestoreChapters.forEach((fCh: any) => {
            const idx = existingChapters.findIndex(c => c.chapter_no === fCh.chapter_no);
            if (idx >= 0) {
              const current = existingChapters[idx];
              existingChapters[idx] = {
                ...current,
                ...fCh,
                chapter_name_hindi: fCh.chapter_name_hindi || current.chapter_name_hindi,
                intro_hindi: fCh.intro_hindi || current.intro_hindi || '',
                notes_hindi: fCh.notes_hindi || current.notes_hindi || '',
                topper_tips: fCh.topper_tips || current.topper_tips || '',
                mcq: (fCh.mcq && fCh.mcq.length > 0) ? fCh.mcq : (current.mcq || []),
                subjective_qa: (fCh.subjective_qa && fCh.subjective_qa.length > 0) ? fCh.subjective_qa : (current.subjective_qa || [])
              };
            } else {
              existingChapters.push(fCh);
            }
          });

          existingChapters.sort((a, b) => a.chapter_no - b.chapter_no);

          merged[subKey] = {
            ...merged[subKey],
            ...firestoreData[subKey],
            chapters: existingChapters
          };
        }
      });

      setSubjects(merged);
    } catch (e: any) {
      console.warn("Data Fetch Notice:", e?.message || String(e));
      // Fallback to default data on network/permission error
      setSubjects(defaultSubjectsData);
    }
    setLoading(false);
  };

  // Real-time listener for paid_notes collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'paid_notes'), (snapshot) => {
        if (!snapshot.empty) {
          const notesFromDb: PaidPdfNote[] = [];
          snapshot.forEach((docSnap) => {
            notesFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Merge with default notes if not present
          const mergedNotes = [...notesFromDb];
          defaultPaidPdfNotes.forEach((def) => {
            if (!mergedNotes.some(n => n.id === def.id || (n.subjectId === def.subjectId && n.chapterNo === def.chapterNo))) {
              mergedNotes.push(def);
            }
          });
          setPaidNotes(mergedNotes);
          try {
            localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(mergedNotes));
          } catch {}
        } else {
          setPaidNotes(defaultPaidPdfNotes);
        }
      }, (err) => {
        console.warn("Paid notes snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Paid notes listener error:", err?.message || String(err));
    }
  }, []);

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
      await setDoc(doc(db, 'paid_notes', id), newNote);
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
      await deleteDoc(doc(db, 'paid_notes', id));
    } catch (e: any) {
      console.warn("Firestore note delete notice:", e?.message || String(e));
    }
  };

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_live_classes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultLiveClasses;
  });

  // Real-time listener for live_classes collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'live_classes'), (snapshot) => {
        if (!snapshot.empty) {
          const classesFromDb: LiveClass[] = [];
          snapshot.forEach((docSnap) => {
            classesFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          const mergedClasses = [...classesFromDb];
          defaultLiveClasses.forEach((def) => {
            if (!mergedClasses.some(c => c.id === def.id || c.youtubeUrl === def.youtubeUrl)) {
              mergedClasses.push(def);
            }
          });
          setLiveClasses(mergedClasses);
          try {
            localStorage.setItem('bseb_live_classes_cache', JSON.stringify(mergedClasses));
          } catch {}
        } else {
          setLiveClasses(defaultLiveClasses);
        }
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

    setLiveClasses((prev) => [newClass, ...prev]);
    try {
      const updated = [newClass, ...liveClasses];
      localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await setDoc(doc(db, 'live_classes', id), newClass);
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
      await deleteDoc(doc(db, 'live_classes', id));
    } catch (e: any) {
      console.warn("Firestore live class delete notice:", e?.message || String(e));
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

  // Real-time listener for leaderboard collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'leaderboard'), (snapshot) => {
        if (!snapshot.empty) {
          const listFromDb: LeaderboardEntry[] = [];
          snapshot.forEach((docSnap) => {
            listFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          const merged = [...listFromDb];
          defaultLeaderboard.forEach((def) => {
            if (!merged.some(m => m.id === def.id || (m.studentName === def.studentName && m.score === def.score))) {
              merged.push(def);
            }
          });
          // Sort by score descending
          merged.sort((a, b) => b.score - a.score);
          setLeaderboard(merged);
          try {
            localStorage.setItem('bseb_leaderboard_cache', JSON.stringify(merged));
          } catch {}
        } else {
          setLeaderboard(defaultLeaderboard);
        }
      }, (err) => {
        console.warn("Leaderboard snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Leaderboard listener error:", err?.message || String(err));
    }
  }, []);

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
      await setDoc(doc(db, 'leaderboard', id), newEntry);
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
      await setDoc(doc(db, 'routine', id), newItem);
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
        await setDoc(doc(db, 'routine', id), { ...target, ...itemData });
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
      await deleteDoc(doc(db, 'routine', id));
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
      await setDoc(doc(db, 'motivational_quotes', id), newQuote);
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
      await deleteDoc(doc(db, 'motivational_quotes', id));
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
        await setDoc(doc(db, 'motivational_quotes', id), { ...target, isActive });
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

  // Notifications Firestore listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const list: NotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          const merged = [...list];
          defaultNotifications.forEach((def) => {
            if (!merged.some(m => m.id === def.id)) merged.push(def);
          });
          setNotifications(merged);
          try {
            localStorage.setItem('bseb_notifications_cache', JSON.stringify(merged));
          } catch {}
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const addNotification = async (itemData: Omit<NotificationItem, 'id'>): Promise<string> => {
    const id = 'notif_' + Date.now();
    const newItem: NotificationItem = { id, ...itemData, createdAt: new Date().toISOString() };
    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      try { localStorage.setItem('bseb_notifications_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await setDoc(doc(db, 'notifications', id), newItem);
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
      await deleteDoc(doc(db, 'notifications', id));
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

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'app_config'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppConfig;
          const merged = { ...defaultAppConfig, ...data };
          setAppConfig(merged);
          try {
            localStorage.setItem('bseb_app_config_cache', JSON.stringify(merged));
          } catch {}
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const updateSettings = async (newConfig: AppConfig): Promise<void> => {
    setAppConfig(newConfig);
    try {
      localStorage.setItem('bseb_app_config_cache', JSON.stringify(newConfig));
    } catch {}
    try {
      await setDoc(doc(db, 'settings', 'app_config'), newConfig);
    } catch (e: any) {
      console.warn("Firestore settings update notice:", e?.message);
    }
  };

  useEffect(() => {
    fetchData();
    // Silently sync Sanskrit & Hindi Chapter 1 to Firestore if connected
    syncInitialCurriculumToFirestore().catch(() => {});
  }, [user]);

  return (
    <DataContext.Provider value={{ 
      subjects, 
      paidNotes, 
      liveClasses,
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

