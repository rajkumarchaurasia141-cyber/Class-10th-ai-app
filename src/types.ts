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
