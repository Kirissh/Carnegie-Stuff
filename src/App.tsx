import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import UploadZone from './components/UploadZone'
import PaperCard from './components/PaperCard'
import QuizView from './components/QuizView'
import QuizResults from './components/QuizResults'
import QuizSetup, { type QuizStartOptions } from './components/QuizSetup'
import SettingsModal from './components/SettingsModal'
import { extractTextFromPdf, deriveTitle, countWords } from './lib/pdfParser'
import { generateQuizFromText, generateQuizWithAI } from './lib/quizGenerator'
import {
  getPapers, savePaper, deletePaper, getPaper,
  saveSession, updatePaperStats, getSettings, saveSettings,
} from './lib/storage'
import type { Paper, QuizSession, View, AppSettings } from './types'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [papers, setPapers] = useState<Paper[]>(() => getPapers())
  const [settings, setSettings] = useState<AppSettings>(() => getSettings())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [setupPaperId, setSetupPaperId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const refreshPapers = useCallback(() => {
    setPapers(getPapers())
  }, [])

  const handleUpload = useCallback(async (file: File) => {
    setProcessing(true)
    try {
      const { text, pageCount } = await extractTextFromPdf(file)
      if (text.length < 200) {
        throw new Error('Could not extract enough text. Try a text-based PDF.')
      }

      const paper: Paper = {
        id: uuidv4(),
        title: deriveTitle(file.name, text),
        fileName: file.name,
        text,
        pageCount,
        wordCount: countWords(text),
        uploadedAt: new Date().toISOString(),
        quizCount: 0,
        tags: [],
      }

      savePaper(paper)
      refreshPapers()
      showToast('PDF added')
    } finally {
      setProcessing(false)
    }
  }, [refreshPapers])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Remove this paper?')) {
      deletePaper(id)
      refreshPapers()
    }
  }, [refreshPapers])

  const openQuizSetup = useCallback((paperId: string) => {
    setSetupPaperId(paperId)
  }, [])

  const startQuiz = useCallback(async (paperId: string, options: QuizStartOptions) => {
    const paper = getPaper(paperId)
    if (!paper) return

    setSetupPaperId(null)
    setGenerating(true)

    const quizSettings = { ...settings.quiz, questionCount: options.questionCount }

    try {
      let questions
      if (settings.llm7ApiKey) {
        try {
          questions = await generateQuizWithAI(
            paper.text, quizSettings, settings.llm7ApiKey, options.topic || undefined,
          )
        } catch {
          questions = generateQuizFromText(paper.text, quizSettings, options.topic || undefined)
          showToast('AI failed — using offline mode')
        }
      } else {
        questions = generateQuizFromText(paper.text, quizSettings, options.topic || undefined)
      }

      const newSession: QuizSession = {
        id: uuidv4(),
        paperId: paper.id,
        paperTitle: paper.title,
        questions,
        answers: new Array(questions.length).fill(null),
        startedAt: new Date().toISOString(),
      }

      setSession(newSession)
      setView('quiz')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to generate quiz')
    } finally {
      setGenerating(false)
    }
  }, [settings])

  const handleQuizComplete = useCallback((completed: QuizSession) => {
    saveSession(completed)
    if (completed.score != null) {
      updatePaperStats(completed.paperId, completed.score)
      refreshPapers()
    }
    setSession(completed)
    setView('results')
  }, [refreshPapers])

  const handleRetry = useCallback(() => {
    if (session) openQuizSetup(session.paperId)
  }, [session, openQuizSetup])

  const setupPaper = setupPaperId ? getPaper(setupPaperId) : null

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setSession(null); setView('home') }}
            className="font-semibold text-sm"
          >
            PDF Quizzer
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="btn-ghost text-sm"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {generating && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="card px-6 py-4 text-sm">Generating quiz…</div>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold mb-1">Upload a PDF</h1>
              <p className="text-sm text-muted mb-4">Turn your document into a quiz.</p>
              <UploadZone onUpload={handleUpload} isProcessing={processing} />
            </div>

            {papers.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted mb-3">Your papers</h2>
                <div className="space-y-3">
                  {papers.map((p) => (
                    <PaperCard
                      key={p.id}
                      paper={p}
                      onQuiz={openQuizSetup}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'quiz' && session && (
          <QuizView
            session={session}
            onUpdate={setSession}
            onComplete={handleQuizComplete}
            onExit={() => { setSession(null); setView('home') }}
          />
        )}

        {view === 'results' && session && (
          <QuizResults
            session={session}
            onRetry={handleRetry}
            onHome={() => { setSession(null); setView('home') }}
          />
        )}
      </main>

      {setupPaper && (
        <QuizSetup
          paper={setupPaper}
          defaultQuestionCount={settings.quiz.questionCount}
          onStart={(opts) => startQuiz(setupPaper.id, opts)}
          onCancel={() => setSetupPaperId(null)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { setSettings(s); saveSettings(s) }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 card px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
