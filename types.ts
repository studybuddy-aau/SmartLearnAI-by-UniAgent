export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface FileInput {
  name: string;
  type: string;
  data: string | ArrayBuffer; // Base64 or text
  mimeType: string;
}

// --- Content Structure ---

export interface StudyQuestion {
  question: string;
}

export interface Topic {
  title: string;
  content: string;
  studyQuestions: string[];
}

export interface ChapterSummary {
  title: string;
  topics: Topic[];
}

export interface SummaryData {
  title: string;
  chapters: ChapterSummary[];
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
}

export interface QuizChapter {
  title: string;
  questions: QuizQuestion[];
}

export interface QuizData {
  chapters: QuizChapter[];
}

export interface GeneratedContent {
  summary: SummaryData;
  flashcards: Flashcard[];
  quiz: QuizData;
}
