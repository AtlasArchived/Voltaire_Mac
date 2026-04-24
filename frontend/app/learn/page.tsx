'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import SkillTree from '../../components/SkillTree'
import LessonFlow from '../../components/LessonFlow'
import GrammarLesson from '../../components/GrammarLesson'
import { UNIT_META } from '../../lib/questionBank'
import { getGrammarNode } from '../../lib/grammarBank'
import {
  getCompletedUnits, getCompletedGrammar,
  markUnitComplete, markGrammarComplete,
  syncCompletedFromServer,
} from '../../lib/lessonProgress'

type View = 'tree' | 'lesson' | 'grammar'

export default function LearnPage() {
  const { learner, setCurrentUnitId } = useApp()

  const [view,            setView]            = useState<View>('tree')
  const [selectedUnit,    setSelectedUnit]    = useState<string | null>(null)
  const [selectedGrammar, setSelectedGrammar] = useState<string | null>(null)
  const [completedUnits,  setCompletedUnits]  = useState<Set<string>>(new Set())
  const [completedGrammar,setCompletedGrammar]= useState<Set<string>>(new Set())

  useEffect(() => {
    setCompletedUnits(getCompletedUnits())
    setCompletedGrammar(getCompletedGrammar())
    syncCompletedFromServer().then(({ units, grammar }) => {
      setCompletedUnits(units)
      setCompletedGrammar(grammar)
    })
  }, [])

  function handleSelectUnit(unitId: string) {
    setSelectedUnit(unitId)
    setCurrentUnitId(unitId)
    setView('lesson')
  }

  function handleSelectGrammar(grammarId: string) {
    setSelectedGrammar(grammarId)
    setView('grammar')
  }

  function handleLessonComplete(passed: boolean) {
    if (passed && selectedUnit) {
      markUnitComplete(selectedUnit)
      setCompletedUnits(prev => new Set(Array.from(prev).concat(selectedUnit)))
    }
  }

  function handleGrammarComplete() {
    if (selectedGrammar) {
      markGrammarComplete(selectedGrammar)
      setCompletedGrammar(prev => new Set(Array.from(prev).concat(selectedGrammar)))
    }
  }

  function handleBack() {
    setView('tree')
    setSelectedUnit(null)
    setSelectedGrammar(null)
  }

  const currentUnit    = selectedUnit    ? UNIT_META.find(u => u.id === selectedUnit) : null
  const currentGrammar = selectedGrammar ? getGrammarNode(selectedGrammar) : null

  return (
    <div className="learn-page-wrap">
      {view === 'tree' && (
        <SkillTree
          learnerElo={learner?.elo || 0}
          completedUnits={completedUnits}
          completedGrammar={completedGrammar}
          currentUnitId={selectedUnit || ''}
          onSelectUnit={handleSelectUnit}
          onSelectGrammar={handleSelectGrammar}
        />
      )}

      {view === 'lesson' && currentUnit && (
        <LessonFlow
          unit={currentUnit}
          onComplete={handleLessonComplete}
          onBack={handleBack}
        />
      )}

      {view === 'grammar' && currentGrammar && (
        <GrammarLesson
          node={currentGrammar}
          onComplete={handleGrammarComplete}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
