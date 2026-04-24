'use client'
import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { SkeletonQuestion as LoadingSkeleton } from './LoadingSkeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
}

interface PlacementQuizProps {
  onComplete: (score: number) => void
}

export default function PlacementQuiz({ onComplete }: PlacementQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState<string | null>(null)

  useEffect(() => {
    api.getPlacementQuiz()
      .then(data => {
        setQuestions(data.questions || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        // If quiz fails to load, just skip to onboarding with a score of 0
        onComplete(0)
      })
  }, [onComplete])

  const handleAnswer = (option: string) => {
    if (answered) return
    setAnswered(option)
    if (option === questions[currentQ].answer) {
      setScore(s => s + 1)
    }
    setTimeout(() => {
      setAnswered(null)
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1)
      } else {
        onComplete(score + (option === questions[currentQ].answer ? 1 : 0))
      }
    }, 1200)
  }

  if (loading || questions.length === 0) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-box">
          <h1 className="onboarding-title">Finding your level...</h1>
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const progress = Math.round(((currentQ + 1) / questions.length) * 100)

  return (
    <div className="onboarding-container">
      <div className="onboarding-box" style={{ maxWidth: 640 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lesson-progress-row" style={{ padding: '0 0 16px' }}>
              <div className="lesson-prog-track"><div className="lesson-prog-fill" style={{ width: `${progress}%` }}/></div>
            </div>
            <h1 className="onboarding-title" style={{ marginTop: 0, marginBottom: 12 }}>Placement Quiz</h1>
            <p className="q-prompt" style={{ minHeight: 40 }}>{q.question}</p>
            <div className="options single-col">
              {q.options.map((opt, i) => {
                let cls = ''
                if (answered) {
                  if (opt === q.answer) cls = 'correct'
                  else if (opt === answered) cls = 'wrong'
                }
                return (
                  <button
                    key={i}
                    className={`opt ${cls}`}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!answered}
                  >
                    <span className="opt-letter">{['A', 'B', 'C', 'D'][i]}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
