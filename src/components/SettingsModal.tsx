import { useState } from 'react'
import type { AppSettings } from '../types'
import { DEFAULT_QUIZ_SETTINGS } from '../types'
import { exportLibraryData, importLibraryData } from '../lib/storage'

interface SettingsModalProps {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
  onClose: () => void
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings })
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const updateQuiz = (patch: Partial<AppSettings['quiz']>) => {
    setLocal((s) => ({ ...s, quiz: { ...s.quiz, ...patch } }))
  }

  const handleExport = () => {
    const blob = new Blob([exportLibraryData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pdf-quizzer-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const count = importLibraryData(reader.result as string)
        setImportMsg(`Imported ${count} papers`)
      } catch {
        setImportMsg('Import failed')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button type="button" onClick={onClose} className="btn-ghost">✕</button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium flex justify-between mb-2">
              Default questions
              <span className="tabular-nums">{local.quiz.questionCount}</span>
            </label>
            <input
              type="range"
              min={3}
              max={25}
              value={local.quiz.questionCount}
              onChange={(e) => updateQuiz({ questionCount: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {(['shuffleQuestions', 'shuffleOptions'] as const).map((key) => (
            <label key={key} className="flex items-center justify-between text-sm cursor-pointer">
              <span>{key === 'shuffleQuestions' ? 'Shuffle questions' : 'Shuffle options'}</span>
              <input
                type="checkbox"
                checked={local.quiz[key]}
                onChange={(e) => updateQuiz({ [key]: e.target.checked })}
              />
            </label>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">OpenAI API key (optional)</label>
          <input
            type="password"
            placeholder="sk-..."
            value={local.openAiApiKey ?? ''}
            onChange={(e) => setLocal((s) => ({ ...s, openAiApiKey: e.target.value || undefined }))}
            className="input"
          />
          <p className="text-xs text-muted mt-1">Better questions when set. Works offline without it.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={handleExport} className="btn-secondary flex-1 text-sm">
            Export
          </button>
          <label className="btn-secondary flex-1 text-sm text-center cursor-pointer">
            Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
        {importMsg && <p className="text-xs text-muted mb-4">{importMsg}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setLocal({ quiz: DEFAULT_QUIZ_SETTINGS }); onSave({ quiz: DEFAULT_QUIZ_SETTINGS }) }}
            className="btn-secondary flex-1"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => { onSave(local); onClose() }}
            className="btn-primary flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
