'use client'
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, Learner, StreakState, AdaptiveProfile, AdaptiveNextLesson, C1Status, C2Status,
         CefrMission, CefrCheckpoint, AiCoachPlan, ReviewQueueItem, Story, StoryDetail, WeakSkillItem, MemorySummary } from '../lib/api'
import { QUESTION_BANK, CEFR_ELO, UNIT_META, DrillQ, type CefrLevel } from '../lib/questionBank'
import { answersEquivalent } from '../lib/appHelpers'
import Onboarding from '../components/Onboarding'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const QUESTIONS: DrillQ[] = QUESTION_BANK

interface Mistake { prompt: string; answer: string; note: string }
interface CheckpointSession {
  level: string; indices: number[]; pos: number
  correct: number; startedAt: number; endAt: number
}

interface AppState {
  // Global learner data
  ready:         boolean
  learner:       Learner | null
  setLearner:    (l: Learner) => void
  streak:        StreakState | null
  due:           number
  setDue:        (n: number) => void
  hearts:        boolean[]
  xpPop:         number | null
  setXpPop:      (n: number | null) => void
  adaptive:      AdaptiveProfile | null
  c1Status:      C1Status | null
  c2Status:      C2Status | null
  missions:      CefrMission[]
  aiCoachPlan:   AiCoachPlan | null
  weakSkills:    WeakSkillItem[]
  reviewQueue:   ReviewQueueItem[]
  nextBestLesson: AdaptiveNextLesson | null
  memory:        MemorySummary | null
  mistakes:      Mistake[]
  settingsMap:   Record<string, string>
  setSettingsMap: (fn: (prev: Record<string,string>) => Record<string,string>) => void
  savingSettings: boolean
  currentUnitId: string
  setCurrentUnitId: (id: string) => void
  unitStats:     { answered: number; correct: number }
  setUnitStats:  (fn: (prev: { answered: number; correct: number }) => { answered: number; correct: number }) => void
  stories:       Story[]
  setStories:    (s: Story[]) => void
  storySession:  StoryDetail | null
  setStorySession: (d: StoryDetail | null) => void

  // Checkpoint
  checkpointSession: CheckpointSession | null
  checkpointResult:  CefrCheckpoint | null
  checkpointBusy:    boolean

  // Learn state
  qi:          number
  answered:    boolean
  correct:     boolean | null
  score:       { c: number; t: number }
  comboStreak: number
  arranged:    string[]
  setArranged: (fn: (prev: string[]) => string[]) => void
  available:   string[]
  setAvailable:(fn: (prev: string[]) => string[]) => void
  listenInput: string
  setListenInput: (s: string) => void
  speaking:    boolean
  setSpeaking: (b: boolean) => void
  transInput:  string
  setTransInput: (s: string) => void
  arrangeAiFeedback: { corrected: string; explanation: string; next_step?: string } | null
  arrangeAiLoading:  boolean
  questionStartedAt: number

  setStreak:       (s: StreakState) => void
  setNextBestLesson: (n: AdaptiveNextLesson) => void

  // Shared functions
  getEligibleQuestions: () => DrillQ[]
  resetQ:      (idx: number, useAbsolute?: boolean) => void
  submitAnswer:(userAnswer: string) => void
  nextQ:       () => void
  tapAvail:    (word: string, idx: number) => void
  tapArranged: (word: string, idx: number) => void
  playAudio:   (text: string) => void
  startCheckpoint: (level: string) => void
  practicePrompt:  (prompt: string) => void
  saveSetting: (key: string, value: string) => Promise<void>
  refreshStoriesList: () => Promise<void>
  openStoryCard: (s: Story) => Promise<void>

  // Computed helpers
  unlockedUnits: typeof UNIT_META
  checkpointProgress: string
  checkpointSecondsLeft: number
}

const Ctx = createContext<AppState | null>(null)

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp must be inside AppProvider')
  return c
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [ready,      setReady]     = useState(false)
  const [onboarding, setOnboard]   = useState(false)
  const [learner,    setLearner]   = useState<Learner | null>(null)
  const [streak,     setStreak]    = useState<StreakState | null>(null)
  const [due,        setDue]       = useState(0)
  const [xpPop,      setXpPop]     = useState<number | null>(null)
  const [hearts,     setHearts]    = useState([true,true,true,true,true])
  const [adaptive,   setAdaptive]  = useState<AdaptiveProfile | null>(null)
  const [c1Status,   setC1Status]  = useState<C1Status | null>(null)
  const [c2Status,   setC2Status]  = useState<C2Status | null>(null)
  const [missions,   setMissions]  = useState<CefrMission[]>([])
  const [aiCoachPlan,setAiCoachPlan] = useState<AiCoachPlan | null>(null)
  const [weakSkills, setWeakSkills]= useState<WeakSkillItem[]>([])
  const [reviewQueue,setReviewQueue]= useState<ReviewQueueItem[]>([])
  const [nextBestLesson, setNextBestLesson] = useState<AdaptiveNextLesson | null>(null)
  const [memory,     setMemory]    = useState<MemorySummary | null>(null)
  const [mistakes,   setMistakes]  = useState<Mistake[]>([])
  const [settingsMap,setSettingsMap] = useState<Record<string,string>>({})
  const [savingSettings,setSavingSettings] = useState(false)
  const [currentUnitId, setCurrentUnitId] = useState('')
  const [unitStats,  setUnitStats] = useState({ answered: 0, correct: 0 })
  const [stories,    setStories]   = useState<Story[]>([])
  const [storySession, setStorySession] = useState<StoryDetail | null>(null)

  const [checkpointSession, setCheckpointSession] = useState<CheckpointSession | null>(null)
  const [checkpointResult,  setCheckpointResult]  = useState<CefrCheckpoint | null>(null)
  const [checkpointBusy,    setCheckpointBusy]    = useState(false)
  const [checkpointTick,    setCheckpointTick]    = useState(0)

  // Learn state
  const [qi,          setQi]         = useState(0)
  const [answered,    setAnswered]   = useState(false)
  const [correct,     setCorrect]    = useState<boolean | null>(null)
  const [score,       setScore]      = useState({ c: 0, t: 0 })
  const [comboStreak, setComboStreak]= useState(0)
  const [arranged,    setArranged]   = useState<string[]>([])
  const [available,   setAvailable]  = useState<string[]>([])
  const [listenInput, setListenInput]= useState('')
  const [speaking,    setSpeaking]   = useState(false)
  const [transInput,  setTransInput] = useState('')
  const [arrangeAiFeedback, setArrangeAiFeedback] = useState<{ corrected: string; explanation: string; next_step?: string } | null>(null)
  const [arrangeAiLoading,  setArrangeAiLoading]  = useState(false)
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())
  const sessionPoolRef = useRef<DrillQ[]>([])

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname === '/login') { setReady(true); return }
    (async () => {
      const failMsg = 'Voltaire API unreachable. Make sure the Backend API workflow is running.'
      try {
        const { onboarded } = await api.getOnboardingStatus()
        if (!onboarded) { setOnboard(true); return }
        const settled = await Promise.allSettled([
          api.getLearner(), api.getStreak(), api.getDueCount(),
          api.getAdaptiveProfile(), api.getC1Status(), api.getC2Status(),
          api.getNextBestLesson(), api.getSettings(), api.getCefrMissions(),
          api.getAiCoachPlan(), api.getWeakSkillReport(), api.getReviewQueue(12),
          api.getMemory(),
        ])
        const [lr,sr,dr,pr,c1r,c2r,nbr,settingsR,missionsR,planR,weakR,queueR,memR] = settled
        const l = lr.status === 'fulfilled' ? lr.value : null
        if (!l) {
          const alive = await api.health().then(() => true).catch(() => false)
          toast.error(alive ? 'Could not load learner profile. Refresh or check backend logs.' : failMsg)
          return
        }
        setLearner(l)
        if (sr.status==='fulfilled') setStreak(sr.value)
        if (dr.status==='fulfilled') setDue(dr.value.count)
        if (pr.status==='fulfilled') setAdaptive(pr.value)
        if (c1r.status==='fulfilled') setC1Status(c1r.value)
        if (c2r.status==='fulfilled') setC2Status(c2r.value)
        if (nbr.status==='fulfilled') setNextBestLesson(nbr.value)
        if (settingsR.status==='fulfilled') setSettingsMap(settingsR.value.settings || {})
        if (missionsR.status==='fulfilled') setMissions(missionsR.value.missions || [])
        if (planR.status==='fulfilled') setAiCoachPlan(planR.value)
        if (weakR.status==='fulfilled') setWeakSkills(weakR.value.skills || [])
        if (queueR.status==='fulfilled') setReviewQueue(queueR.value.items || [])
        if (memR.status==='fulfilled') setMemory(memR.value)
        const settingsRes = settingsR.status==='fulfilled' ? settingsR.value : { settings: {} as Record<string,string> }
        const firstUnlocked = UNIT_META.find(u => (l.elo||800) >= CEFR_ELO[u.cefr].min)?.id || UNIT_META[0]?.id || ''
        setCurrentUnitId(settingsRes.settings?.current_unit || firstUnlocked)
        setReady(true)
        resetQ(0)
      } catch { toast.error(failMsg) }
    })()
  }, [])

  // Checkpoint timer
  useEffect(() => {
    if (!checkpointSession) return
    const id = setInterval(() => setCheckpointTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [checkpointSession])

  useEffect(() => {
    if (checkpointSession && Date.now() >= checkpointSession.endAt) finishCheckpoint(true)
  }, [checkpointTick, checkpointSession])

  const checkpointSecondsLeft = checkpointSession
    ? Math.max(0, Math.ceil((checkpointSession.endAt - Date.now()) / 1000)) : 0
  const checkpointProgress = checkpointSession
    ? `${checkpointSession.level} checkpoint • ${checkpointSession.pos+1}/${checkpointSession.indices.length} • ${checkpointSecondsLeft}s` : ''

  // ── Helpers ──────────────────────────────────────────────────────────────
  const unlockedUnits = UNIT_META.filter(u => (learner?.elo || 800) >= CEFR_ELO[u.cefr].min)

  // Reshuffle the question pool when the unit changes.
  // NOTE: intentionally does NOT depend on learner.elo — ELO updates happen
  // after every answered question and would otherwise reset qi mid-session.
  useEffect(() => {
    if (!currentUnitId) return   // wait until the unit is known
    const elo = learner?.elo || 800
    const unlocked = QUESTIONS.filter(q => elo >= CEFR_ELO[q.cefr].min)
    const inUnit = unlocked.filter(q => q.unitId === currentUnitId)
    const pool = inUnit.length > 0 ? inUnit : unlocked
    sessionPoolRef.current = [...pool].sort(() => Math.random() - 0.5)
    setQi(0)
    setAnswered(false)
    setCorrect(null)
  }, [currentUnitId])  // eslint-disable-line react-hooks/exhaustive-deps

  function getEligibleQuestions(): DrillQ[] {
    if (sessionPoolRef.current.length > 0) return sessionPoolRef.current
    const elo = learner?.elo || 800
    const unlocked = QUESTIONS.filter(q => elo >= CEFR_ELO[q.cefr].min)
    if (!currentUnitId) return unlocked
    const inUnit = unlocked.filter(q => q.unitId === currentUnitId)
    return inUnit.length > 0 ? inUnit : unlocked
  }

  function chooseNextUnlockedUnit(current: string): string {
    const idx = unlockedUnits.findIndex(u => u.id === current)
    if (idx >= 0 && idx < unlockedUnits.length - 1) return unlockedUnits[idx+1].id
    return current
  }

  function chooseAdaptiveNextIndex() {
    const pool = getEligibleQuestions()
    const total = pool.length
    const current = qi % total
    const byPrompt = new Set((adaptive?.focus_prompts||[]).map(f=>f.prompt))
    const promptPool = pool.map((q,i)=>({q,i})).filter(({q,i})=>i!==current&&byPrompt.has(q.prompt)).map(({i})=>i)
    if (promptPool.length>0 && Math.random()<0.6) return promptPool[Math.floor(Math.random()*promptPool.length)]
    const weakType = adaptive?.weak_types?.[0]?.q_type
    if (weakType) {
      const typePool = pool.map((q,i)=>({q,i})).filter(({q,i})=>i!==current&&q.type===weakType).map(({i})=>i)
      if (typePool.length>0 && Math.random()<0.7) return typePool[Math.floor(Math.random()*typePool.length)]
    }
    return (qi+1) % total
  }

  function resetQ(idx: number, useAbsolute = false) {
    const pool = useAbsolute ? QUESTIONS : getEligibleQuestions()
    const q = pool[idx % pool.length]
    setQi(idx); setAnswered(false); setCorrect(null)
    setListenInput(''); setTransInput('')
    if (q.type === 'arrange') {
      const shuffled = [...q.words].sort(() => Math.random() - .5)
      setAvailable(shuffled); setArranged([])
    }
    setQuestionStartedAt(Date.now())
    setArrangeAiFeedback(null); setArrangeAiLoading(false)
  }

  async function fetchArrangeFeedback(userAnswer: string, question: DrillQ) {
    try {
      setArrangeAiLoading(true)
      const fb = await api.getAiMistakeFeedback({
        q_type: question.type, cefr: question.cefr,
        prompt: question.prompt, user_answer: userAnswer,
        expected_answer: question.answer, note: question.note || '',
      })
      setArrangeAiFeedback({
        corrected: fb.corrected || question.answer,
        explanation: fb.explanation || 'Word order is off. Try subject + verb + complements.',
        next_step: fb.next_step || 'Retry a similar sentence now.',
      })
    } catch {
      setArrangeAiFeedback({
        corrected: question.answer,
        explanation: 'Word order is off. Try keeping subject + verb first.',
        next_step: 'Retry one similar sentence now.',
      })
    } finally { setArrangeAiLoading(false) }
  }

  function submitAnswer(userAnswer: string) {
    if (answered) return
    const pool = getEligibleQuestions()
    const q = pool[qi % pool.length]
    const ok = answersEquivalent(userAnswer, q.answer)
    const responseMs = Date.now() - questionStartedAt
    setAnswered(true); setCorrect(ok)
    setScore(s => ({ c: s.c+(ok?1:0), t: s.t+1 }))
    setUnitStats(s => ({ answered: s.answered+1, correct: s.correct+(ok?1:0) }))
    if (checkpointSession) setCheckpointSession(p => p ? ({ ...p, correct: p.correct+(ok?1:0) }) : p)
    if (ok) {
      setComboStreak(c => c+1)
      const xp = 10 + Math.min(comboStreak*3, 15)
      setXpPop(xp)
      if (comboStreak >= 4) confetti({ particleCount:90,spread:75,origin:{y:.6},colors:['#58cc02','#ffd900','#4f9cf9','#a78bfa'] })
    } else {
      setComboStreak(0)
      setHearts(h => { const n=[...h]; const li=n.lastIndexOf(true); if(li>=0) n[li]=false; return n })
      if (q.note) setMistakes(m => [...m, { prompt:q.prompt, answer:q.answer, note:q.note||'' }])
      fetchArrangeFeedback(userAnswer, q)
    }
    api.applyLearnProgress(ok).then(async () => {
      try {
        const [l,s,c1,c2,nextBest,missionsRes] = await Promise.all([
          api.getLearner(), api.getStreak(), api.getC1Status(),
          api.getC2Status(), api.getNextBestLesson(), api.getCefrMissions()
        ])
        setLearner(l); setStreak(s); setC1Status(c1); setC2Status(c2)
        setNextBestLesson(nextBest); setMissions(missionsRes.missions||[])
        const nextAnswered = unitStats.answered+1
        const nextCorrect  = unitStats.correct+(ok?1:0)
        if (nextAnswered >= 10 && (nextCorrect/nextAnswered) >= 0.75) {
          const accuracyPct = Math.round((nextCorrect/nextAnswered)*100)
          const xpEarned = nextCorrect * 12 + (nextAnswered - nextCorrect) * 4
          const unitCefr = UNIT_META.find(u => u.id === currentUnitId)?.cefr || 'A1'
          api.completeLesson({ unit_id: currentUnitId, cefr: unitCefr, questions_answered: nextAnswered, accuracy_pct: accuracyPct, xp_earned: xpEarned })
            .then(() => api.getMemory().then(setMemory).catch(()=>{}))
            .catch(()=>{})
          const nextUnit = chooseNextUnlockedUnit(currentUnitId)
          if (nextUnit && nextUnit !== currentUnitId) {
            setCurrentUnitId(nextUnit)
            api.saveSetting('current_unit', nextUnit).catch(()=>{})
            setUnitStats({ answered:0, correct:0 })
            toast.success(`Unit complete. Moving to ${nextUnit.toUpperCase()}`)
          }
        }
      } catch {}
    }).catch(()=>{})
    api.logAdaptiveEvent({
      q_type: q.type, cefr: q.cefr,
      skill_tag: q.type==='arrange'?'syntax':q.type==='listen'?'listening':q.type==='translate'?'lexicon':'grammar',
      prompt: q.prompt, correct: ok, response_ms: responseMs,
      user_answer: userAnswer, expected_answer: q.answer,
    }).then(() => api.getAdaptiveProfile().then(setAdaptive).catch(()=>{})).catch(()=>{})
  }

  async function finishCheckpoint(timeout = false) {
    if (!checkpointSession) return
    const total = checkpointSession.indices.length
    const pct = Math.round((checkpointSession.correct / Math.max(total,1)) * 100)
    setCheckpointBusy(true)
    try {
      const res = await api.runCefrCheckpoint(checkpointSession.level, pct)
      setCheckpointResult({ ...res, recommendation: timeout ? `Time expired. ${res.recommendation}` : res.recommendation })
      const [missionsRes,c1] = await Promise.all([api.getCefrMissions(), api.getC1Status()])
      setMissions(missionsRes.missions||[]); setC1Status(c1)
      api.getC2Status().then(setC2Status).catch(()=>{})
      if (!res.passed) router.push('/review')
    } catch { toast.error('Checkpoint submission failed') }
    finally { setCheckpointBusy(false); setCheckpointSession(null) }
  }

  function nextQ() {
    if (checkpointSession) {
      const nextPos = checkpointSession.pos+1
      if (nextPos >= checkpointSession.indices.length) { finishCheckpoint(false); return }
      const nextIdx = checkpointSession.indices[nextPos]
      setCheckpointSession(p => p ? ({ ...p, pos: nextPos }) : p)
      resetQ(nextIdx, true); return
    }
    resetQ(chooseAdaptiveNextIndex())
  }

  function tapAvail(word: string, idx: number) {
    if (answered) return
    setAvailable(a => { const n=[...a]; n.splice(idx,1); return n })
    setArranged(a => [...a, word])
  }
  function tapArranged(word: string, idx: number) {
    if (answered) return
    setArranged(a => { const n=[...a]; n.splice(idx,1); return n })
    setAvailable(a => [...a, word])
  }

  function playAudio(text: string) {
    if (speaking) return
    setSpeaking(true)
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'fr-FR'
    const cfgRate = Number(settingsMap.audio_speed || '0.85')
    utter.rate = Number.isFinite(cfgRate) ? Math.max(0.6, Math.min(1.2, cfgRate)) : 0.85
    const voices = window.speechSynthesis.getVoices()
    const frVoice = voices.find(v => v.lang.startsWith('fr'))
    if (frVoice) utter.voice = frVoice
    utter.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  function indicesForLevel(level: string): number[] {
    const target = level.toUpperCase()
    return QUESTIONS.map((q,i)=>({q,i})).filter(({q})=>q.cefr===target).map(({i})=>i)
  }
  function sampleIndices(pool: number[], n: number): number[] {
    const copy = [...pool]
    for (let i=copy.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]] }
    return copy.slice(0, Math.min(n, copy.length))
  }

  function startCheckpoint(level: string) {
    const indices = sampleIndices(indicesForLevel(level), 8)
    if (indices.length < 4) { toast.error('Not enough questions for this checkpoint yet'); return }
    const now = Date.now()
    setCheckpointResult(null)
    setCheckpointSession({ level, indices, pos:0, correct:0, startedAt:now, endAt:now+2*60*1000 })
    router.push('/learn')
    resetQ(indices[0], true)
  }

  function practicePrompt(prompt: string) {
    const idx = QUESTIONS.findIndex(q => q.prompt === prompt)
    if (idx >= 0) {
      const targetUnit = QUESTIONS[idx].unitId
      if (targetUnit) setCurrentUnitId(targetUnit)
      router.push('/learn')
      resetQ(idx, true)
    }
  }

  async function saveSetting(key: string, value: string) {
    setSavingSettings(true)
    try {
      await api.saveSetting(key, value)
      setSettingsMap(p => ({ ...p, [key]: value }))
      if (key === 'daily_goal_xp') { const s = await api.getStreak(); setStreak(s) }
      toast.success('Saved')
    } catch { toast.error('Could not save setting') }
    finally { setSavingSettings(false) }
  }

  async function refreshStoriesList() {
    try { const r = await api.getStories(); setStories(r.stories||[]) }
    catch { setStories([]) }
  }

  async function openStoryCard(s: Story) {
    if (!s.unlocked) { toast.error('Reach this CEFR level to unlock.'); return }
    try { const d = await api.getStory(s.id); setStorySession(d) }
    catch { toast.error('Could not load story.') }
  }

  // ── Onboarding / Loading ──────────────────────────────────────────────────
  if (onboarding) return (
    <Onboarding onComplete={async () => {
      setOnboard(false)
      const [l,s] = await Promise.all([api.getLearner(), api.getStreak()])
      setLearner(l); setStreak(s); setReady(true); resetQ(0)
    }} />
  )

  if (!ready) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,background:'#0d1117'}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'1.1rem',letterSpacing:'.3em',color:'#4f9cf9',fontWeight:700}}>VOLTAIRE</div>
      <div style={{width:28,height:28,border:'3px solid #21262d',borderTop:'3px solid #4f9cf9',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    </div>
  )

  const value: AppState = {
    ready, learner, setLearner: (l: Learner) => setLearner(l),
    streak, setStreak: (s: StreakState) => setStreak(s),
    due, setDue, hearts, xpPop, setXpPop,
    adaptive, c1Status, c2Status, missions, aiCoachPlan, weakSkills, reviewQueue,
    nextBestLesson, setNextBestLesson: (n: AdaptiveNextLesson) => setNextBestLesson(n),
    memory,
    mistakes, settingsMap, setSettingsMap, savingSettings,
    currentUnitId, setCurrentUnitId, unitStats, setUnitStats,
    stories, setStories, storySession, setStorySession,
    checkpointSession, checkpointResult, checkpointBusy,
    qi, answered, correct, score, comboStreak,
    arranged, setArranged, available, setAvailable,
    listenInput, setListenInput, speaking, setSpeaking,
    transInput, setTransInput,
    arrangeAiFeedback, arrangeAiLoading, questionStartedAt,
    getEligibleQuestions, resetQ, submitAnswer, nextQ,
    tapAvail, tapArranged, playAudio,
    startCheckpoint, practicePrompt, saveSetting,
    refreshStoriesList, openStoryCard,
    unlockedUnits, checkpointProgress, checkpointSecondsLeft,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
