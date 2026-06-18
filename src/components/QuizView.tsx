import { useState, useEffect, useCallback } from 'react'
import type { QuizSession } from '../types'

interface QuizViewProps {
  session: QuizSession
  onUpdate: (session: QuizSession) => void
  onComplete: (session: QuizSession) => void
  onExit: () => void
}

export default function QuizView({ session, onUpdate, onComplete, onExit }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(session.answers[0] ?? null)
  const [revealed, setRevealed] = useState(session.answers[0] !== null)

  const questions = session.questions
  const current = questions[currentIndex]
  const total = questions.length

  useEffect(() => {
    const answer = session.answers[currentIndex]
    setSelected(answer)
    setRevealed(answer !== null)
  }, [currentIndex, session.answers])

  const saveAnswer = useCallback(
    (index: number, answer: number) => {
      const newAnswers = [...session.answers]
      newAnswers[index] = answer
      onUpdate({ ...session, answers: newAnswers })
    },
    [session, onUpdate],
  )

  const handleSelect = (optionIndex: number) => {
    if (revealed) return
    setSelected(optionIndex)
    saveAnswer(currentIndex, optionIndex)
    setRevealed(true)
  }

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    const correct = session.answers.filter(
      (a, i) => a === questions[i].correctIndex,
    ).length
    const score = Math.round((correct / total) * 100)
    onComplete({
      ...session,
      completedAt: new Date().toISOString(),
      score,
    })
  }

  const isCorrect = selected === current.correctIndex

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="btn-ghost text-sm">← Back</button>
        <span className="text-sm text-muted">{currentIndex + 1} / {total}</span>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-medium leading-relaxed mb-6 whitespace-pre-line">
          {current.question}
        </h2>

        <div className="space-y-2">
          {current.options.map((option, i) => {
            let className = 'option'
            if (revealed) {
              if (i === current.correctIndex) className += ' option-correct'
              else if (i === selected) className += ' option-wrong'
              else className += ' option-dim'
            } else if (selected === i) {
              className += ' option-selected'
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={className}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>

        {revealed && (
          <p className={`mt-4 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'Correct' : `Incorrect — answer is ${String.fromCharCode(65 + current.correctIndex)}`}
          </p>
        )}

        {revealed && current.explanation && (
          <p className="mt-2 text-sm text-muted">{current.explanation}</p>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleNext}
            disabled={!revealed}
            className="btn-primary"
          >
            {currentIndex < total - 1 ? 'Next' : 'See results'}
          </button>
        </div>
      </div>
    </div>
  )
}
