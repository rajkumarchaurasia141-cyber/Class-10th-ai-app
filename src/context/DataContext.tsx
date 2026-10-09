import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc } from '../utils/firestoreSafe';
import { useAuth } from './AuthContext';
import { getStaticCollection, getStaticData } from '../lib/staticData';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { Subject, PaidPdfNote, LiveClass, DailyQuizItem, LeaderboardEntry, RoutineItem, MotivationalQuote, NotificationItem, AppConfig, BannerItem, PyqItem, CrashCoursePdf } from '../types';

export const defaultBanners: BannerItem[] = [
  {
    id: 'banner_crash',
    tag: '⚡ स्पेशल बोर्ड परीक्षा क्रैश कोर्स',
    title: 'बिहार बोर्ड 10वीं टॉपर क्रैश कोर्स',
    subtitle: 'कम समय में 450+ अंक लाने का पक्का फॉर्मूला (Full Syllabus)',
    features: [
      'सभी 6 विषयों का सम्पूर्ण फास्ट-ट्रैक रिवीजन',
      'चैप्टर-वाइज VVI गैस प्रश्नोत्तर एवं हस्तलिखित नोट्स',
      'पिछले 10 वर्षों के बोर्ड मॉडल पेपर्स एवं लाइव सॉल्यूशन',
      'फुल लेंथ 50 MCQ टेस्ट सीरीज व डाउट समाधान'
    ],
    subjects: ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'हिंदी', 'अंग्रेजी'],
    oldPrice: '₹999',
    newPrice: '₹299 मात्र',
    buttonText: 'अभी VIP ज्वॉइन करें 👑',
    gradient: 'from-amber-600 via-red-600 to-stone-950',
    badgeText: '99% छात्र सफल'
  },
  {
    id: 'banner_pyq',
    tag: '📄 2018 - 2026 PYQ बैंक',
    title: 'बिहार बोर्ड पिछले वर्षों के प्रश्न पत्र',
    subtitle: 'सभी विषयों के प्रथम एवं द्वितीय पाली के ओरिजिनल प्रश्न पत्र व उत्तर',
    features: [
      'वर्ष 2018 से 2026 तक के सभी प्रश्न पत्र',
      'प्रत्येक प्रश्न का सटीक वस्तुनिष्ठ व सब्जेक्टिव हल',
      'बिहार बोर्ड परीक्षा पैटर्न पर आधारित मॉडल पेपर'
    ],
    subjects: ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'हिन्दी', 'संस्कृत'],
    oldPrice: 'मुफ्त',
    newPrice: 'FREE',
    buttonText: 'PYQ पीडीएफ देखें 📥',
    gradient: 'from-red-600 via-rose-600 to-amber-700',
    badgeText: '100% फ्री'
  }
];

export const defaultLiveClasses: LiveClass[] = [
  {
    id: 'live_demo_1',
    title: 'BSEB 10th गणित - वास्तविक संख्याएँ (Real Numbers) मैराथन क्लास',
    youtubeUrl: 'ai_studio_lecture',
    subjectName: 'गणित (Maths)',
    teacherName: 'Raj Sir',
    scheduledAt: 'आज शाम 7:00 बजे',
    isLive: true,
    isVip: false,
    description: '【 प्रश्न 】 : यूक्लिड विभाजन एल्गोरिथम से HCF कैसे निकालते हैं?\n【 उत्तर 】 : a = bq + r, जहाँ 0 ≤ r < b होता है।\n★ मुख्य बिंदु: म.स. और ल.स. का गुणनफल = दोनों संख्याओं का गुणनफल होता है।\nट्रिक: अभाज्य गुणनखंड विधि द्वारा सरलता से हल करें।',
    createdAt: new Date().toISOString()
  },
  {
    id: 'live_demo_2',
    title: 'BSEB 10th विज्ञान - रासायनिक अभिक्रियाएँ एवं समीकरण VVI वस्तुनिष्ठ प्रश्न',
    youtubeUrl: 'ai_studio_lecture',
    subjectName: 'विज्ञान (Science)',
    teacherName: 'KK Mam',
    scheduledAt: 'कल शाम 6:30 बजे',
    isLive: false,
    isVip: false,
    description: '【 प्रश्न 】 : वायु में जलाने से पहले मैग्नीशियम रिबन को साफ क्यों किया जाता है?\n【 उत्तर 】 : मैग्नीशियम रिबन की सतह पर मैग्नीशियम ऑक्साइड की जिद्दी परत जम जाती है, जिसे हटाने के लिए इसे रेगमार से साफ किया जाता है।',
    createdAt: new Date().toISOString()
  }
];

export const defaultDailyQuizzes: DailyQuizItem[] = [
  {
    id: 'quiz_1',
    title: 'बिहार बोर्ड 10वीं गणित - वास्तविक संख्याएँ (Real Numbers) ऑनलाइन टेस्ट',
    subject: 'गणित (Maths)',
    totalQuestions: 15,
    durationMinutes: 10,
    questions: [
      {
        question: 'दो संख्याओं a और b का म.स. (HCF) × ल.स. (LCM) किसके बराबर होता है?',
        options: ['a + b', 'a - b', 'a × b', 'a / b'],
        correctAnswer: 2,
        explanation: 'सूत्र से: HCF(a,b) × LCM(a,b) = a × b होता है।'
      },
      {
        question: 'निम्न में से कौन सी अभाज्य संख्या (Prime Number) है?',
        options: ['4', '9', '11', '15'],
        correctAnswer: 2,
        explanation: '11 केवल 1 और 11 से विभाजित होती है, अतः यह अभाज्य संख्या है।'
      }
    ]
  }
];

export const defaultLeaderboard: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    studentName: 'राहुल कुमार',
    district: 'पटना (Patna)',
    score: 486,
    totalMarks: 500,
    testName: 'बोर्ड परीक्षा ऑल इंडिया महाटेस्ट',
    subjectName: 'ऑल सब्जेक्ट',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_2',
    studentName: 'प्रिया कुमारी',
    district: 'मुजफ्फरपुर (Muzaffarpur)',
    score: 479,
    totalMarks: 500,
    testName: 'गणित टॉपर चैलेंज',
    subjectName: 'गणित',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_3',
    studentName: 'अमित शर्मा',
    district: 'समस्तीपुर (Samastipur)',
    score: 472,
    totalMarks: 500,
    testName: 'विज्ञान वीकली टेस्ट',
    subjectName: 'विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: false
  },
  {
    id: 'lb_4',
    studentName: 'नेहा गुप्ता',
    district: 'गया (Gaya)',
    score: 468,
    totalMarks: 500,
    testName: 'सामाजिक विज्ञान मेगा क्विज़',
    subjectName: 'सामाजिक विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_5',
    studentName: 'विकी कुमार',
    district: 'भागलपुर (Bhagalpur)',
    score: 465,
    totalMarks: 500,
    testName: 'संस्कृत पीयूषम् टेस्ट',
    subjectName: 'संस्कृत',
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

export const defaultRoutine: RoutineItem[] = [
  { id: 'rt_1', time: 'सुबह 5:00 - 6:30', title: 'गणित (Maths) फॉर्मूला रिवीजन', subject: 'गणित', isCompleted: false },
  { id: 'rt_2', time: 'सुबह 7:00 - 8:30', title: 'विज्ञान (Science) भौतिकी & रसायन', subject: 'विज्ञान', isCompleted: false },
  { id: 'rt_3', time: 'शाम 6:00 - 7:30', title: 'सामाजिक विज्ञान & इतिहास', subject: 'सामाजिक विज्ञान', isCompleted: false },
  { id: 'rt_4', time: 'रात 8:00 - 9:30', title: 'हिन्दी गद्य खंड & संस्कृत पीयूषम्', subject: 'हिन्दी', isCompleted: false }
];

export const defaultQuotes: MotivationalQuote[] = [
  { id: 'qt_1', quote: 'मंजिलें उन्हीं को मिलती हैं, जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!', author: 'डॉ. एपीजे अब्दुल कलाम', isActive: true },
  { id: 'qt_2', quote: 'बिहार बोर्ड 10वीं परीक्षा में 450+ अंक लाना अब हर छात्र का सपना सच होगा!', author: 'BSEB Topper Team', isActive: true }
];

export const defaultNotifications: NotificationItem[] = [
  { id: 'notif_1', title: '🎯 नया क्रैश कोर्स लाइव!', description: 'बिहार बोर्ड 10वीं के लिए सभी 6 विषयों का फास्ट-ट्रैक रिवीजन शुरू हो गया है।', timeLabel: 'अभी', isNew: true, actionType: 'courses', createdAt: new Date().toISOString() },
  { id: 'notif_2', title: '📄 PYQ बैंक अपडेटेड', description: 'पिछले वर्षों के ओरिजिनल प्रश्न पत्र उत्तर सहित अपलोड कर दिए गए हैं।', timeLabel: 'आज', isNew: true, actionType: 'courses', createdAt: new Date().toISOString() }
];

export const defaultAppConfig: AppConfig = {
  upiId: '9241511070@ybl',
  whatsappNumber: '9241511070',
  qrCodeDataUrl: '',
  appLogoUrl: '',
  price1Month: 99,
  price1Year: 499,
  helplineNumber: '9241511070',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  whatsappGroupUrl: 'https://chat.whatsapp.com',
  telegramUrl: 'https://t.me'
};

const defaultPyqs: PyqItem[] = [
  // 2026
  { id: 'pyq_2026_1', year: '2026', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2026 वार्षिक परीक्षा ओरिजिनल प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4520, uploadedAt: '2026-02-15' },
  { id: 'pyq_2026_2', year: '2026', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2026 प्रथम & द्वितीय पाली प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3890, uploadedAt: '2026-02-15' },
  { id: 'pyq_2026_3', year: '2026', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2026 बोर्ड परीक्षा प्रश्न पत्र व हल', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3120, uploadedAt: '2026-02-16' },
  { id: 'pyq_2026_4', year: '2026', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी (गोधूलि भाग-2) 2026 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 2950, uploadedAt: '2026-02-16' },
  { id: 'pyq_2026_5', year: '2026', subjectName: 'संस्कृत', title: 'BSEB 10th संस्कृत (पीयूषम्) 2026 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 2780, uploadedAt: '2026-02-17' },

  // 2025
  { id: 'pyq_2025_1', year: '2025', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2025 वार्षिक परीक्षा प्रश्न पत्र (Objective + Subjective)', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5420, uploadedAt: '2025-02-20' },
  { id: 'pyq_2025_2', year: '2025', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2025 प्रथम पाली PYQ Solution PDF', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4890, uploadedAt: '2025-02-20' },
  { id: 'pyq_2025_3', year: '2025', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2025 Model Paper with Answer', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4150, uploadedAt: '2025-02-21' },
  { id: 'pyq_2025_4', year: '2025', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी 2025 बोर्ड परीक्षा ओरिजिनल क्वेश्चन पेपर', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3920, uploadedAt: '2025-02-21' },
  { id: 'pyq_2025_5', year: '2025', subjectName: 'संस्कृत', title: 'BSEB 10th संस्कृत 2025 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3640, uploadedAt: '2025-02-22' },

  // 2024
  { id: 'pyq_2024_1', year: '2024', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2024 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 6200, uploadedAt: '2024-02-25' },
  { id: 'pyq_2024_2', year: '2024', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2024 ओरिजिनल क्वेश्चन पेपर', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5780, uploadedAt: '2024-02-25' },
  { id: 'pyq_2024_3', year: '2024', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2024 प्रश्न पत्र व हल', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4920, uploadedAt: '2024-02-26' },
  { id: 'pyq_2024_4', year: '2024', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी 2024 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4510, uploadedAt: '2024-02-26' },

  // 2023
  { id: 'pyq_2023_1', year: '2023', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2023 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 7100, uploadedAt: '2023-02-20' },
  { id: 'pyq_2023_2', year: '2023', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2023 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 6540, uploadedAt: '2023-02-20' },
  { id: 'pyq_2023_3', year: '2023', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2023 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5890, uploadedAt: '2023-02-21' },

  // 2022
  { id: 'pyq_2022_1', year: '2022', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2022 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 8200, uploadedAt: '2022-02-24' },
  { id: 'pyq_2022_2', year: '2022', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2022 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 7600, uploadedAt: '2022-02-24' },

  // 2021
  { id: 'pyq_2021_1', year: '2021', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2021 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 9100, uploadedAt: '2021-02-22' },
  { id: 'pyq_2021_2', year: '2021', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2021 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 8400, uploadedAt: '2021-02-22' },

  // 2020 to 2018
  { id: 'pyq_2020_1', year: '2020', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2020 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 10200, uploadedAt: '2020-02-20' },
  { id: 'pyq_2019_1', year: '2019', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2019 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 11500, uploadedAt: '2019-02-21' },
  { id: 'pyq_2018_1', year: '2018', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2018 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 12800, uploadedAt: '2018-02-22' }
];

export const defaultCrashCoursePdfs: CrashCoursePdf[] = [];

interface DataContextType {
  subjects: Record<string, Subject>;
  paidNotes: PaidPdfNote[];
  pyqs: PyqItem[];
  crashCoursePdfs: CrashCoursePdf[];
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
  addPyq: (item: Omit<PyqItem, 'id'>) => Promise<string>;
  deletePyq: (id: string) => Promise<void>;
  addCrashCoursePdf: (pdf: Omit<CrashCoursePdf, 'id'>) => Promise<string>;
  deleteCrashCoursePdf: (id: string) => Promise<void>;
  addLiveClass: (cls: Omit<LiveClass, 'id'>) => Promise<string>;
  updateLiveClass: (id: string, updates: Partial<LiveClass>) => Promise<void>;
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
          const existingMap = new Map();
          merged[sId].chapters.forEach((ch: any) => existingMap.set(ch.chapter_no, ch));
          parsed[sId].chapters.forEach((c: any) => {
            const chNo = c.chapter_no;
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

        // PYQs
        setPyqs(data.pyqs || defaultPyqs);

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

  const [pyqs, setPyqs] = useState<PyqItem[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_pyqs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPyqs;
  });

  const addPyq = async (pyqData: Omit<PyqItem, 'id'>): Promise<string> => {
    const id = 'pyq_' + Date.now();
    const newPyq: PyqItem = {
      id,
      ...pyqData,
      uploadedAt: pyqData.uploadedAt || new Date().toISOString()
    };

    setPyqs((prev) => {
      const updated = [newPyq, ...prev];
      try {
        localStorage.setItem('bseb_pyqs_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'pyqs', id), newPyq, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore pyq save notice:", e?.message || String(e));
    }
    return id;
  };

  const deletePyq = async (id: string): Promise<void> => {
    setPyqs((prev) => prev.filter((p) => p.id !== id));
    try {
      const updated = pyqs.filter((p) => p.id !== id);
      localStorage.setItem('bseb_pyqs_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'pyqs', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore pyq delete notice:", e?.message || String(e));
    }
  };

  // Crash Course PDFs State & Firestore sync
  const [crashCoursePdfs, setCrashCoursePdfs] = useState<CrashCoursePdf[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_crash_course_pdfs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Keep only admin-added items (clean out old dummy placeholders)
          return parsed.filter(item => 
            !item.id.startsWith('cc_pdf_sci') && 
            !item.id.startsWith('cc_pdf_math') && 
            !item.id.startsWith('cc_pdf_sst') && 
            !item.id.startsWith('cc_pdf_hin') && 
            !item.id.startsWith('cc_pdf_san')
          );
        }
      }
    } catch {}
    return [];
  });

  // Real-time listener for crash_course_pdfs
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'crash_course_pdfs'), (snapshot) => {
        const dbItems: CrashCoursePdf[] = [];
        snapshot.forEach((docSnap) => {
          dbItems.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        setCrashCoursePdfs((prev) => {
          const map = new Map<string, CrashCoursePdf>();
          defaultCrashCoursePdfs.forEach(item => map.set(item.id, item));
          prev.forEach(item => map.set(item.id, item));
          dbItems.forEach(item => map.set(item.id, item));
          const combined = Array.from(map.values());
          try {
            localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(combined));
          } catch {}
          return combined;
        });
      }, (err) => {
        console.warn("Crash course snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Crash course listener error:", err?.message || String(err));
    }
  }, []);

  const addCrashCoursePdf = async (pdfData: Omit<CrashCoursePdf, 'id'>): Promise<string> => {
    const id = 'cc_pdf_' + Date.now();
    const newPdf: CrashCoursePdf = {
      id,
      ...pdfData,
      uploadedAt: pdfData.uploadedAt || new Date().toISOString()
    };

    setCrashCoursePdfs((prev) => {
      const updated = [newPdf, ...prev];
      try {
        localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'crash_course_pdfs', id), newPdf, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore crash course pdf save notice:", e?.message || String(e));
    }
    return id;
  };

  const deleteCrashCoursePdf = async (id: string): Promise<void> => {
    setCrashCoursePdfs((prev) => prev.filter((p) => p.id !== id));
    try {
      const updated = crashCoursePdfs.filter((p) => p.id !== id);
      localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'crash_course_pdfs', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore crash course pdf delete notice:", e?.message || String(e));
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

  const updateLiveClass = async (id: string, updates: Partial<LiveClass>): Promise<void> => {
    setLiveClasses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'live_classes', id), updates, { merge: true }, 5000, true);
    } catch (e: any) {
      console.warn("Firestore live class update notice:", e?.message || String(e));
    }
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

  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuizItem[]>(defaultDailyQuizzes);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(defaultLeaderboard);
  const [routine, setRoutine] = useState<RoutineItem[]>(defaultRoutine);
  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuote[]>(defaultQuotes);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [appConfig, setAppConfig] = useState<AppConfig>(defaultAppConfig);

  const addDailyQuiz = async (quizData: Omit<DailyQuizItem, 'id'>): Promise<string> => {
    const id = 'quiz_' + Date.now();
    const newQuiz: DailyQuizItem = { id, ...quizData };
    setDailyQuizzes(prev => [newQuiz, ...prev]);
    return id;
  };

  const deleteDailyQuiz = async (id: string) => {
    setDailyQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const addLeaderboardScore = async (entry: Omit<LeaderboardEntry, 'id'>) => {
    const id = 'lb_' + Date.now();
    const newEntry: LeaderboardEntry = { id, ...entry, createdAt: new Date().toISOString() };
    setLeaderboard(prev => [newEntry, ...prev]);
    return id;
  };

  const addRoutineItem = async (itemData: Omit<RoutineItem, 'id'>) => {
    const id = 'rt_' + Date.now();
    const newItem: RoutineItem = { id, ...itemData };
    setRoutine(prev => [...prev, newItem]);
    return id;
  };

  const updateRoutineItem = async (id: string, updates: Partial<RoutineItem>) => {
    setRoutine(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoutineItem = async (id: string) => {
    setRoutine(prev => prev.filter(r => r.id !== id));
  };

  const addQuote = async (quoteData: Omit<MotivationalQuote, 'id'>) => {
    const id = 'qt_' + Date.now();
    const newQ: MotivationalQuote = { id, ...quoteData };
    setMotivationalQuotes(prev => [newQ, ...prev]);
    return id;
  };

  const deleteQuote = async (id: string) => {
    setMotivationalQuotes(prev => prev.filter(q => q.id !== id));
  };

  const toggleQuoteActive = async (id: string, isActive: boolean) => {
    setMotivationalQuotes(prev => prev.map(q => q.id === id ? { ...q, isActive } : q));
  };

  const addNotification = async (notifData: Omit<NotificationItem, 'id'>) => {
    const id = 'notif_' + Date.now();
    const newN: NotificationItem = { id, ...notifData, createdAt: new Date().toISOString() };
    setNotifications(prev => [newN, ...prev]);
    return id;
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateSettings = async (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    try {
      await safeSetDoc(doc(db, 'app_settings', 'payment_config'), {
        upiId: newConfig.upiId,
        whatsappNumber: newConfig.whatsappNumber || '9241511070',
        qrCodeUrl: newConfig.qrCodeDataUrl,
        appLogoUrl: newConfig.appLogoUrl,
        price: newConfig.price1Year || 299,
        price1Year: newConfig.price1Year || 299,
        helplineNumber: newConfig.helplineNumber || '9241511070'
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
      pyqs,
      crashCoursePdfs,
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
      addPyq,
      deletePyq,
      addCrashCoursePdf,
      deleteCrashCoursePdf,
      addLiveClass,
      updateLiveClass,
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
