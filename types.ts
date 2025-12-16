
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  COURSE_GENERATOR = 'COURSE_GENERATOR',
  LESSON_VIEW = 'LESSON_VIEW',
  QUIZ = 'QUIZ',
  MY_LIBRARY = 'MY_LIBRARY',
  STUDY_GROUPS = 'STUDY_GROUPS',
  MY_DETAILS = 'MY_DETAILS',
  AI_LAB = 'AI_LAB'
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  level: string;
  xp: number;
  avatar: string;
  role: string;
  learningGoal: number; // minutes
  style: string;
  // Tracking Stats
  totalHours: number;
  coursesCompleted: number;
  averageScore: number;
  streak: number;
  // Education Details
  educationLevel: string; // e.g. High School, University
  grade: string;          // e.g. 10th Grade, Sophomore
  fieldOfStudy: string;   // e.g. Science, Computer Science
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  progress: number;
  // New fields for the UI
  category?: string;
  instructor?: string;
  duration?: string;
  imageGradient?: string;
  level?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  topics: string[];
  isCompleted: boolean;
  content?: string; // Markdown content
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  feedback: string;
}

export interface UserStats {
  streak: number;
  xp: number;
  level: number;
  totalTimeLearned: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  type: 'Book' | 'Video' | 'Article';
  category: string;
  thumbnailGradient: string;
  isSaved?: boolean;
  link?: string;
  description?: string;
}

export interface StudyGroup {
  id: string;
  title: string;
  memberCount: number;
  category: string;
  icon: string; // Emoji or specific icon identifier
  isMember: boolean;
  color: string;
}

export interface LessonNote {
  id: string;
  quote: string;
  text: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  context?: string; // The selected text context
}
