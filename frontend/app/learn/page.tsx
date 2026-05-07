'use client'
/**
 * app/learn/page.tsx — v2.8
 * Fixes: completion modal with XP + next unit button, next unit auto-highlighted,
 * localStorage-first progress, session counter, background server sync.
 */
import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import SkillTree from '../../components/SkillTree'
import LessonFlow from '../../components/LessonFlow'
import GrammarLesson from '../../components/GrammarLesson'
import { UNIT_META, CEFR_ELO, type CefrLevel } from '../../lib/questionBank'
import { getGrammarNode } from '../../lib/grammarBank'
import {
  getCompletedUnits, getCompletedGrammar,
  markUnitComplete, markGrammarComplete,
  syncCompletedFromServer, getNextRecommendedUnit,
  incrementSessionCount, addSessionXp,
} from '../../lib/lessonProgress'
import { api } from '../../lib/api'

type View = 'tree' | 'lesson' | 'grammar'

const CEFR_COLOR: Record<CefrLevel, string> = {
  A1: '#34d399', A2: '#4f9cf9', B1: '#a78bfa',
  B2: '#f59e0b', C1: '#f87171', C2: '#e879f9',
}
const UNIT_XP: Record<CefrLevel, number> = { A1: 20, A2: 30, B1: 45, B2: 60, C1: 80, C2: 100 }

// ── Completion modal ──────────────────────────────────────────────────────────
function CompletionModal({ unitTitle, unitCefr, xpEarned, nextUnitId, sessionCount, onContinue, onNextUnit }: {
  unitTitle: string; unitCefr: CefrLevel; xpEarned: number
  nextUnitId: string | null; sessionCount: number
  onContinue: () => void; onNextUnit: () => void
}) {
  const color = CEFR_COLOR[unitCefr]
  const [vis, setVis] = useState(false)
  useEffect(() => { setTimeout(() => setVis(true), 40) }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      opacity: vis ? 1 : 0, transition: 'opacity .2s',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--s2, #161b22)', border: `2px solid ${color}`,
        borderRadius: 24, padding: '32px 28px', textAlign: 'center',
        transform: vis ? 'scale(1)' : 'scale(0.88)',
        transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: `0 0 40px ${color}33`,
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>🏆</div>
        <div style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.4rem', fontWeight: 700, color, marginBottom: 6 }}>
          Unité terminée !
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2, #8b949e)', marginBottom: 20 }}>{unitTitle}</div>

        {/* XP pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${color}18`, border: `1.5px solid ${color}`,
          borderRadius: 99, padding: '8px 24px',
          fontSize: 22, fontWeight: 900, color, marginBottom: 24,
          animation: 'xpPop .6s cubic-bezier(.34,1.56,.64,1)',
        }}>
          +{xpEarned} XP
        </div>

        {sessionCount >= 3 && (
          <div style={{
            background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            fontSize: 13, color: '#f59e0b',
          }}>
            💪 {sessionCount} unités aujourd'hui — belle session !
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nextUnitId && (
            <button onClick={onNextUnit} style={{
              width: '100%', padding: 14, background: color,
              border: 'none', borderRadius: 12, color: '#fff',
              fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: `0 4px 18px ${color}55`,
            }}>
              Unité suivante →
            </button>
          )}
          <button onClick={onContinue} style={{
            width: '100%', padding: 12,
            background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.12)',
            borderRadius: 12, color: 'var(--t2, #8b949e)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            Retour à l'arbre
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const { learner, setCurrentUnitId } = useApp()
  const elo = learner?.elo || 800

  const [view,             setView]           = useState<View>('tree')
  const [selectedUnit,     setSelectedUnit]   = useState<string | null>(null)
  const [selectedGrammar,  setSelectedGrammar]= useState<string | null>(null)
  const [completedUnits,   setCompletedUnits] = useState<Set<string>>(new Set())
  const [completedGrammar, setCompletedGrammar] = useState<Set<string>>(new Set())
  const [highlighted,      setHighlighted]    = useState<string | null>(null)
  const [showModal,        setShowModal]      = useState(false)
  const [modalData,        setModalData]      = useState<{
    unitId: string; cefr: CefrLevel; xp: number; nextUnitId: string | null; sessionCount: number
  } | null>(null)
  const [synced, setSynced] = useState(false)

  // Load localStorage immediately, sync server in background
  useEffect(() => {
    const localU = getCompletedUnits()
    const localG = getCompletedGrammar()
    setCompletedUnits(localU)
    setCompletedGrammar(localG)
    const next = getNextRecommendedUnit(UNIT_META, localU, elo, CEFR_ELO)
    if (next) { setHighlighted(next); setCurrentUnitId(next) }

    syncCompletedFromServer().then(({ units, grammar }) => {
      setCompletedUnits(units)
      setCompletedGrammar(grammar)
      setSynced(true)
      const nextSync = getNextRecommendedUnit(UNIT_META, units, elo, CEFR_ELO)
      if (nextSync) { setHighlighted(nextSync); setCurrentUnitId(nextSync) }
    })
  }, [elo]) // eslint-disable-line

  function goToTree() {
    setView('tree')
    setSelectedUnit(null)
    setSelectedGrammar(null)
    const next = getNextRecommendedUnit(UNIT_META, completedUnits, elo, CEFR_ELO)
    if (next) { setHighlighted(next); setCurrentUnitId(next) }
  }

  function handleSelectUnit(unitId: string) {
    setSelectedUnit(unitId); setCurrentUnitId(unitId); setView('lesson')
  }

  function handleSelectGrammar(grammarId: string) {
    setSelectedGrammar(grammarId); setView('grammar')
  }

  function handleLessonComplete(passed: boolean) {
    if (!passed || !selectedUnit) return
    markUnitComplete(selectedUnit)
    const newCompleted = new Set([...completedUnits, selectedUnit])
    setCompletedUnits(newCompleted)
    const session = incrementSessionCount()
    const unit = UNIT_META.find(u => u.id === selectedUnit)
    const cefr = (unit?.cefr ?? 'A1') as CefrLevel
    const xp = UNIT_XP[cefr]
    addSessionXp(xp)
    api.applyLearnProgress(true).catch(() => {})
    api.completeLesson({ unit_id: selectedUnit, cefr, questions_answered: 20, accuracy_pct: 85, xp_earned: xp }).catch(() => {})
    const next = getNextRecommendedUnit(UNIT_META, newCompleted, elo, CEFR_ELO)
    setModalData({ unitId: selectedUnit, cefr, xp, nextUnitId: next, sessionCount: session.sessionCount })
    setShowModal(true)
  }

  function handleGrammarComplete() {
    if (!selectedGrammar) return
    markGrammarComplete(selectedGrammar)
    setCompletedGrammar(prev => new Set([...prev, selectedGrammar]))
    goToTree()
  }

  function handleModalContinue() { setShowModal(false); setModalData(null); goToTree() }
  function handleModalNext() {
    if (!modalData?.nextUnitId) return
    const next = modalData.nextUnitId
    setShowModal(false); setModalData(null)
    handleSelectUnit(next)
  }

  const currentUnit    = selectedUnit    ? UNIT_META.find(u => u.id === selectedUnit)    : null
  const currentGrammar = selectedGrammar ? getGrammarNode(selectedGrammar)               : null

  return (
    <div className="learn-page-wrap">
      {/* Sync spinner */}
      {!synced && (
        <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50, fontSize: 11, color: 'var(--t4, #484f58)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          Sync…
        </div>
      )}

      {showModal && modalData && (
        <CompletionModal
          unitTitle={UNIT_META.find(u => u.id === modalData.unitId)?.title ?? modalData.unitId}
          unitCefr={modalData.cefr}
          xpEarned={modalData.xp}
          nextUnitId={modalData.nextUnitId}
          sessionCount={modalData.sessionCount}
          onContinue={handleModalContinue}
          onNextUnit={handleModalNext}
        />
      )}

      {view === 'tree' && (
        <SkillTree
          learnerElo={elo}
          completedUnits={completedUnits}
          completedGrammar={completedGrammar}
          currentUnitId={highlighted || ''}
          onSelectUnit={handleSelectUnit}
          onSelectGrammar={handleSelectGrammar}
        />
      )}

      {view === 'lesson' && currentUnit && (
        <LessonFlow unit={currentUnit} onComplete={handleLessonComplete} onBack={goToTree} />
      )}

      {view === 'grammar' && currentGrammar && (
        <GrammarLesson node={currentGrammar} onComplete={handleGrammarComplete} onBack={goToTree} />
      )}
    </div>
  )
}
