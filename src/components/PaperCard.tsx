import { useState } from 'react'
import type { Paper } from '../types'

interface PaperCardProps {
  paper: Paper
  onQuiz: (id: string) => void
  onDelete: (id: string) => void
}

export default function PaperCard({ paper, onQuiz, onDelete }: PaperCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm truncate">{paper.title}</h3>
        <p className="text-xs text-muted mt-0.5">
          {paper.pageCount} pages · {paper.wordCount.toLocaleString()} words
          {paper.bestScore != null && ` · best ${paper.bestScore}%`}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        {confirmDelete ? (
          <>
            <button type="button" onClick={() => onDelete(paper.id)} className="text-xs text-red-600">
              Confirm
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost text-xs">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => onQuiz(paper.id)} className="btn-primary text-xs px-3 py-1.5">
              Quiz
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn-ghost text-xs">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
