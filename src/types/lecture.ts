export interface Lecture {
  id: string;
  subject: string;
  topic: string;
  teacherName: string;
  className: string;
  date: Date;
  duration: number; // in seconds
  status: 'transcribing' | 'summarizing' | 'completed' | 'failed';
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  detailedNotes?: string;
  keyPoints?: string[];
  questions?: Question[];
  tasks?: Task[];
  errorMessage?: string;
}

export interface Question {
  id: string;
  type: 'short' | 'mcq';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Task {
  id: string;
  task: string;
  completed: boolean;
}

export interface AppSettings {
  preferredLanguage: 'english' | 'hindi' | 'hinglish';
  summaryLength: 'short' | 'medium' | 'detailed';
  darkMode: boolean;
}
