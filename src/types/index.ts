export interface Paper {
  id: string
  title: string
  fileName: string
  text: string
  pageCount: number
  wordCount: number
  uploadedAt: string
  lastQuizzedAt?: string
  quizCount: number
  bestScore?: number
  tags: string[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  sourceSentence?: string
}

export interface QuizSession {
  id: string
  paperId: string
  paperTitle: string
  questions: QuizQuestion[]
  answers: (number | null)[]
  startedAt: string
  completedAt?: string
  score?: number
  timeLimitSeconds?: number
}

export interface QuizSettings {
  questionCount: number
  timeLimitMinutes: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showExplanations: boolean
}

export interface AppSettings {
  quiz: QuizSettings
  openAiApiKey?: string
}

export type View = 'home' | 'library' | 'quiz' | 'results' | 'upload'

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionCount: 10,
  timeLimitMinutes: 0,
  shuffleQuestions: true,
  shuffleOptions: true,
  showExplanations: true,
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  quiz: DEFAULT_QUIZ_SETTINGS,
}
