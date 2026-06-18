import { useMemo, useState } from 'react'
import type { Paper } from '../types'
import { extractTopicSuggestions } from '../lib/topicExtractor'

export interface QuizStartOptions {
  questionCount: number
  topic: string
}

interface QuizSetupProps {
  paper: Paper
  defaultQuestionCount: number
  onStart: (options: QuizStartOptions) => void
  onCancel: () => void
}

export default function QuizSetup({ paper, defaultQuestionCount, onStart, onCancel }: QuizSetupProps) {
  const suggestions = useMemo(() => extractTopicSuggestions(paper.text), [paper.text])
  const [questionCount, setQuestionCount] = useState(defaultQuestionCount)
  const [topic, setTopic] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">Start quiz</h2>
        <p className="text-sm text-muted mb-6 truncate">{paper.title}</p>

        <label className="block text-sm font-medium mb-2">
          Questions
          <span className="float-right tabular-nums">{questionCount}</span>
        </label>
        <input
          type="range"
          min={3}
          max={25}
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="w-full mb-6"
        />

        <label className="block text-sm font-medium mb-2">Topic focus</label>
        <p className="text-xs text-muted mb-3">Pick a suggestion or type your own. Leave blank for the whole document.</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className={`chip ${topic === s ? 'chip-active' : ''}`}
            >
              {s.length > 40 ? s.slice(0, 40) + '…' : s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="e.g. neural networks, experiment design…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input mb-6"
        />

        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onStart({ questionCount, topic: topic.trim() })}
            className="btn-primary flex-1"
          >
            Generate quiz
          </button>
        </div>
      </div>
    </div>
  )
}
