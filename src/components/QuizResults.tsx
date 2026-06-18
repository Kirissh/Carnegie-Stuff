import type { QuizSession } from '../types'

interface QuizResultsProps {
  session: QuizSession
  onRetry: () => void
  onHome: () => void
}

export default function QuizResults({ session, onRetry, onHome }: QuizResultsProps) {
  const score = session.score ?? 0
  const correct = session.answers.filter((a, i) => a === session.questions[i].correctIndex).length
  const total = session.questions.length

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-6 text-center">
        <p className="text-3xl font-semibold mb-1">{score}%</p>
        <p className="text-sm text-muted mb-1">{correct} of {total} correct</p>
        <p className="text-xs text-muted mb-6 truncate">{session.paperTitle}</p>

        <div className="space-y-2 mb-6 text-left max-h-64 overflow-y-auto">
          {session.questions.map((q, i) => {
            const userAnswer = session.answers[i]
            const isCorrect = userAnswer === q.correctIndex
            return (
              <div
                key={q.id}
                className={`text-sm p-3 rounded-lg border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <p className="line-clamp-2">{q.question.replace(/\n/g, ' ')}</p>
                {!isCorrect && userAnswer != null && (
                  <p className="text-xs text-muted mt-1">
                    Correct: {q.options[q.correctIndex]}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 justify-center">
          <button type="button" onClick={onRetry} className="btn-primary">Try again</button>
          <button type="button" onClick={onHome} className="btn-secondary">Home</button>
        </div>
      </div>
    </div>
  )
}
