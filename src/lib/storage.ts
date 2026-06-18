import type { AppSettings, Paper, QuizSession } from '../types'
import { DEFAULT_APP_SETTINGS } from '../types'

const PAPERS_KEY = 'quasar-papers'
const SESSIONS_KEY = 'quasar-sessions'
const SETTINGS_KEY = 'quasar-settings'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getPapers(): Paper[] {
  return load<Paper[]>(PAPERS_KEY, [])
}

export function savePaper(paper: Paper): void {
  const papers = getPapers()
  const idx = papers.findIndex((p) => p.id === paper.id)
  if (idx >= 0) papers[idx] = paper
  else papers.unshift(paper)
  save(PAPERS_KEY, papers)
}

export function deletePaper(id: string): void {
  save(PAPERS_KEY, getPapers().filter((p) => p.id !== id))
}

export function getPaper(id: string): Paper | undefined {
  return getPapers().find((p) => p.id === id)
}

export function updatePaperStats(id: string, score: number): void {
  const paper = getPaper(id)
  if (!paper) return
  paper.quizCount += 1
  paper.lastQuizzedAt = new Date().toISOString()
  paper.bestScore = paper.bestScore != null ? Math.max(paper.bestScore, score) : score
  savePaper(paper)
}

export function getSessions(): QuizSession[] {
  return load<QuizSession[]>(SESSIONS_KEY, [])
}

export function saveSession(session: QuizSession): void {
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx >= 0) sessions[idx] = session
  else sessions.unshift(session)
  save(SESSIONS_KEY, sessions.slice(0, 50))
}

export function getSessionsForPaper(paperId: string): QuizSession[] {
  return getSessions().filter((s) => s.paperId === paperId)
}

export function getSettings(): AppSettings {
  return load<AppSettings>(SETTINGS_KEY, DEFAULT_APP_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  save(SETTINGS_KEY, settings)
}

export function exportLibraryData(): string {
  return JSON.stringify({ papers: getPapers(), sessions: getSessions() }, null, 2)
}

export function importLibraryData(json: string): number {
  const data = JSON.parse(json) as { papers?: Paper[] }
  if (!data.papers?.length) throw new Error('Invalid backup file')
  const existing = getPapers()
  const merged = [...data.papers]
  for (const p of existing) {
    if (!merged.find((m) => m.id === p.id)) merged.push(p)
  }
  save(PAPERS_KEY, merged)
  return data.papers.length
}
