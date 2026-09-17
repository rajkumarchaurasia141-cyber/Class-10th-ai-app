export type SubjectId =
  | 'maths'
  | 'science'
  | 'social_science'
  | 'hindi'
  | 'sanskrit'
  | 'english';

export type QuestionFormat =
  | 'mcq'      // वस्तुनिष्ठ प्रश्न (4 विकल्प + उत्तर + व्याख्या)
  | 'short'    // लघु उत्तरीय (2-3 अंक)
  | 'long'     // दीर्घ उत्तरीय (5 अंक)
  | 'notes';   // विस्तृत नोट्स (परिचय + परिभाषाएं + सूत्र + VVI)

export interface SubCategory {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
  subCategory?: string;
  chapterNumber?: number;
  highlightTopic?: string;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  hindiName: string;
  tagline: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  subCategories: SubCategory[];
  chapters: Chapter[];
}

export interface StudyNote {
  chapterTitle: string;
  subjectTitle: string;
  introduction: string;
  keyDefinitions: string[];
  formulasAndPrinciples: string[];
  vviQuestions: {
    question: string;
    answer: string;
    marks: number;
    type: 'लघु उत्तरीय' | 'दीर्घ उत्तरीय' | 'वस्तुनिष्ठ';
  }[];
}

export interface MCQItem {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
  subjectId: SubjectId;
  chapter?: string;
}

export interface VVIQuestionItem {
  id: string;
  question: string;
  subjectId: SubjectId;
  subCategory?: string;
  chapter: string;
  marks: 2 | 3 | 5;
  answerType: 'लघु उत्तरीय (2-3 अंक)' | 'दीर्घ उत्तरीय (5 अंक)';
  answer: string;
  tips?: string;
}

export type ActiveMainTab = 'home' | 'subjects' | 'pyq' | 'ai-teacher' | 'tricks' | 'math-solutions';

export interface MathExerciseQuestion {
  id: string;
  qNumber: string;
  questionText: string;
  steps: string[];
  detailedSolution: string;
  finalAnswer: string;
  keyFormula?: string;
  vviLevel?: 'VVI (अति-महत्वपूर्ण)' | 'महत्वपूर्ण' | 'सामान्य';
  marks?: number;
  boardYear?: string;
}

export interface MathPrashnawali {
  exerciseNumber: string; // e.g. "1.1", "8.4"
  title: string;
  concept: string;
  keyFormulas: string[];
  questions: MathExerciseQuestion[];
}

export interface MathChapterExercises {
  chapterNumber: number; // 1 to 15
  chapterTitle: string;
  subCategory: string;
  totalExercises: number;
  exercises: MathPrashnawali[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subjectId?: SubjectId;
  questionFormat?: QuestionFormat;
  chapter?: string;
  imageUrl?: string;
}

export interface NCERTSolutionItem {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  questionType: 'in_text' | 'exercise' | 'mcq' | 'long';
  questionTypeLabel: string;
  questionNumber: string;
  question: string;
  correctAnswer: string;
  steps?: string[];
  keyFormula?: string;
  examImportance?: 'अति-महत्वपूर्ण (VVI)' | 'महत्वपूर्ण' | 'सामान्य';
}

export interface ChapterTrickItem {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  trickTitle: string;
  mnemonic: string;
  explanation: string;
  example: string;
  category: 'formula' | 'reaction' | 'rule' | 'date_history' | 'grammar';
}

export interface ChapterTestQuestion {
  id: string;
  questionNumber: number;
  question: string;
  type: 'mcq' | 'short' | 'long';
  options?: [string, string, string, string];
  correctOptionIndex?: number;
  marks: number;
  modelAnswer: string;
  explanation: string;
}

export interface ChapterTestPaper {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  totalMarks: number;
  durationMinutes: number;
  questions: ChapterTestQuestion[];
}

