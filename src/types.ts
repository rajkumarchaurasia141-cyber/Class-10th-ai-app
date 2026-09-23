export interface MCQItem {
  question: string;
  options: string[];
  correct_answer: number; // index 0-3
  explanation?: string;
}

export interface QAItem {
  question: string;
  answer: string;
  type?: 'लघु उत्तरीय' | 'दीर्घ उत्तरीय' | 'NCERT';
}

export interface Chapter {
  id?: string;
  chapter_no: number;
  chapter_name: string;
  chapter_name_hindi: string;
  intro_hindi?: string; // पाठ परिचय
  notes_hindi: string; // विस्तृत नोट्स एवं व्याख्या
  topper_tips?: string; // VVI टॉपर टिप्स
  mcq: MCQItem[];
  subjective_qa: QAItem[];
  isVIP?: boolean;
}

export interface Subject {
  id: string;
  subject_name: string;
  subject_name_hindi: string;
  icon?: string;
  chapters: Chapter[];
}

export interface PaidPdfNote {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterNo?: number;
  chapterName?: string;
  title: string;
  description?: string;
  pdfUrl: string;
  totalPages?: number;
  fileSize?: string;
  isPaid?: boolean;
  uploadedAt?: string;
}

export interface LiveClass {
  id: string;
  title: string;
  youtubeUrl: string;
  subjectName: string;
  teacherName: string;
  scheduledAt: string;
  isLive: boolean;
  description?: string;
  createdAt: string;
}

export interface DailyQuizItem {
  id: string;
  dateLabel: string; // e.g. "19 सितम्बर"
  subjectName: string; // e.g. "संस्कृत"
  title: string; // e.g. "संस्कृत - मङ्गलम् टेस्ट"
  chaptersCount?: number;
  totalQuestions?: number;
  youtubeUrl?: string;
  description?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  district: string;
  score: number;
  totalMarks: number;
  testName: string;
  subjectName: string;
  avatarColor?: string;
  createdAt: string;
  isVip?: boolean;
}

export interface RoutineItem {
  id: string;
  time: string;
  subject: string;
  topic: string;
  instructor: string;
  days: string;
  color: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  isNew: boolean;
  actionType?: 'live' | 'vip' | 'courses' | 'none';
  createdAt: string;
}

export interface BannerItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  features: string[];
  subjects: string[];
  oldPrice: string;
  newPrice: string;
  priceLabel: string;
  actionText: string;
  actionSub: string;
  bgGradient: string;
  badgeColor: string;
}

export interface AppConfig {
  helplineNumber: string;
  upiId: string;
  qrCodeDataUrl?: string;
  youtubeUrl: string;
  instagramUrl: string;
  whatsappGroupUrl: string;
  telegramUrl: string;
  price1Month: number;
  price1Year: number;
  banners?: BannerItem[];
  adminEmails?: string[];
  apkUrl?: string;
  aabUrl?: string;
}


