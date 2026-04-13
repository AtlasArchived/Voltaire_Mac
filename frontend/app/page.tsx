'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, Learner, StreakState, AdaptiveProfile, AdaptiveNextLesson, C1Status, C2Status, CefrMission, CefrCheckpoint, AiCoachPlan, ReviewQueueItem, Story, StoryDetail, WeakSkillItem, PatternDiagnosis, GeneratedDrillQ, PerformanceSummary, PerformanceTrend, streamLesson } from '../lib/api'
import { GRAMMAR, GrammarRule, CATEGORIES, CEFR_LEVELS } from '../lib/grammar'
import { buildCourse, LESSON_TYPE_ICONS, LESSON_TYPE_COLORS } from '../lib/course'
import { QUESTION_BANK, CEFR_ELO, UNIT_META, DrillQ, type CefrLevel } from '../lib/questionBank'
import Onboarding  from '../components/Onboarding'
import VoiceMode   from '../components/VoiceMode'
import StoryPlayer from '../components/StoryPlayer'
import SkillTree   from '../components/SkillTree'
import WordHints   from '../components/WordHints'
import MemoryLog   from '../components/MemoryLog'
import { AchievementQueue } from '../components/AchievementToast'
import DailyStreakModal, { shouldShowStreakModal } from '../components/DailyStreakModal'
import LevelUpModal from '../components/LevelUpModal'
import Leaderboard from '../components/Leaderboard'
import WordOfTheDay from '../components/WordOfTheDay'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

// ── Achievement type ──────────────────────────────────────────────────────────
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp: number
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = 'learn'|'chat'|'mathieu'|'voice'|'stories'|'map'|'grammar'|'review'|'memory'|'settings'|'leaderboard'|'performance'

interface Msg   { role:'assistant'|'user'; text:string }
interface ArrangeAiFeedback { corrected: string; explanation: string; next_step?: string }
interface CheckpointSession {
  level: string
  indices: number[]
  pos: number
  correct: number
  startedAt: number
  endAt: number
}

function questionDifficultyWeight(kind: string): number {
  if (kind === 'mcq') return 0.6
  if (kind === 'arrange') return 1.0
  if (kind === 'translate') return 1.2
  if (kind === 'listen') return 1.35
  return 1.0
}

function skillKeyForQuestion(q: DrillQ): string {
  return `${q.cefr}:${q.type}`
}

// ── Markdown ──────────────────────────────────────────────────────────────────
function md(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/GRADE:\s*CORRECT/gi,'<span class="grade-correct">✓ Correct!</span>')
    .replace(/GRADE:\s*PARTIAL/gi,'<span class="grade-partial">◑ Partial</span>')
    .replace(/GRADE:\s*WRONG/gi,  '<span class="grade-wrong">✗ Incorrect</span>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .split(/\n\n+/).map(p=>p.trim()).filter(Boolean)
    .map(p=>p.startsWith('<')?p:`<p>${p.replace(/\n/g,'<br/>')}</p>`).join('')
}

// ── XP popup ──────────────────────────────────────────────────────────────────
function XpPop({xp,onDone}:{xp:number;onDone:()=>void}) {
  useEffect(()=>{const t=setTimeout(onDone,1000);return()=>clearTimeout(t)},[onDone])
  return (
    <motion.div
      initial={{opacity:0, y:0, scale:.7}}
      animate={{opacity:[0,1,1,0], y:[-4,-28,-40,-52], scale:[.7,1.15,1,.9]}}
      transition={{duration:1, times:[0,.15,.7,1]}}
      style={{
        position:'fixed', top:70, right:28,
        background:'linear-gradient(135deg,#ffd900,#ff9600)',
        color:'#000', fontSize:15, fontWeight:900,
        padding:'7px 16px', borderRadius:99,
        zIndex:999, pointerEvents:'none',
        boxShadow:'0 4px 20px rgba(255,217,0,.5)',
        letterSpacing:'.04em',
      }}
    >
      +{xp} XP ⚡
    </motion.div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function Dots({color='var(--blue)'}:{color?:string}) {
  return <div className="tdots">{[0,1,2].map(i=><div key={i} className="tdot" style={{background:color,animationDelay:`${i*.15}s`}}/>)}</div>
}

/** Strip trailing "Answer: …" / "Réponse: …" style labels (learners often paste whole UI text). */
function extractAfterLastAnswerLabel(raw: string): string {
  const lower = raw.toLowerCase()
  const needles = ['answer:', 'réponse:', 'reponse:', 'response:', 'translation:', 'traduction:']
  let bestIdx = -1
  let bestLen = 0
  for (const n of needles) {
    const idx = lower.lastIndexOf(n)
    if (idx > bestIdx) {
      bestIdx = idx
      bestLen = n.length
    }
  }
  if (bestIdx >= 0) return raw.slice(bestIdx + bestLen).trim()
  return raw.trim()
}

function normalizeAnswerCore(raw: string, extractLabel: boolean): string {
  let s = extractLabel ? extractAfterLastAnswerLabel(raw) : raw.trim()
  s = s.replace(/[\u2019\u2018\u0060\u00b4]/g, "'")
  s = s.toLowerCase().replace(/\s+/g, ' ').trim()
  s = s.replace(/^["'«»]+|["'«»]+$/g, '')
  s = s.replace(/[.!?…]+$/g, '').trim()
  return s
}

function stripMarks(s: string): string {
  try {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  } catch {
    return s
  }
}

/** Levenshtein distance; used for one-typo tolerance on longer answers. */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let v0 = Array.from({ length: n + 1 }, (_, j) => j)
  let v1 = new Array<number>(n + 1).fill(0)
  for (let i = 0; i < m; i++) {
    v1[0] = i + 1
    for (let j = 0; j < n; j++) {
      const cost = a[i] === b[j] ? 0 : 1
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
    }
    ;[v0, v1] = [v1, v0]
  }
  return v0[n]
}

/** Accept answers one (or two, for long strings) edits away from expected — e.g. m'apelle vs m'appelle. */
function nearlyMatches(userNorm: string, expNorm: string): boolean {
  if (expNorm.length < 10) return false
  const d = levenshtein(userNorm, expNorm)
  if (d <= 1) return true
  if (expNorm.length >= 32 && d <= 2) return true
  return false
}

/** Lenient compare: labels, quotes, final punctuation, curly apostrophes; optional substring when user pasted extra chatter. */
function answersEquivalent(userRaw: string, expectedRaw: string): boolean {
  const exp = normalizeAnswerCore(expectedRaw, false)
  if (!exp) return false
  const userLabeled = normalizeAnswerCore(userRaw, true)
  const userFull = normalizeAnswerCore(userRaw, false)
  if (userLabeled === exp || userFull === exp) return true
  const minLen = 8
  if (exp.length >= minLen && (userFull.includes(exp) || userLabeled.includes(exp))) return true
  if (stripMarks(userLabeled) === stripMarks(exp) || stripMarks(userFull) === stripMarks(exp)) return true
  for (const u of [userLabeled, userFull]) {
    if (!u) continue
    if (nearlyMatches(u, exp)) return true
    const su = stripMarks(u)
    const se = stripMarks(exp)
    if (su !== u || se !== exp) {
      if (nearlyMatches(su, se)) return true
    }
  }
  return false
}

const QUESTIONS: DrillQ[] = QUESTION_BANK

function courseLessonIndexToUnitId(cefr: string, lessonIndex: number): string {
  const L = cefr.toUpperCase() as CefrLevel
  const units = UNIT_META.filter(u => u.cefr === L)
  if (!units.length) return UNIT_META[0]?.id ?? ''
  const idx = Math.min(Math.max(0, lessonIndex), units.length - 1)
  return units[idx].id
}

function toLogSnippet(value: string, max = 120): string {
  const clean = (value || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1)}...`
}

function performanceInsight(summary: PerformanceSummary | null): string {
  if (!summary || summary.attempts < 5) {
    return 'Complete at least 5 drills to unlock targeted coaching insights.'
  }
  const acc = summary.accuracy
  const topWeak = [...(summary.by_type || [])]
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0]
  if (acc < 0.62) {
    return `Stabilize first: focus ${topWeak?.q_type || 'mixed'} drills for 10 minutes, then do 5 easy checks to rebuild confidence.`
  }
  if (acc < 0.78) {
    return `Good progress. Prioritize ${topWeak?.q_type || 'your weakest type'} with short correction loops (3-5 attempts each).`
  }
  return `Strong momentum. Keep pushing productive output: prioritize translate/listen and run one checkpoint prep block today.`
}

function xpMultiplierFromCombo(combo: number): number {
  if (combo >= 10) return 2
  if (combo >= 6) return 1.6
  if (combo >= 3) return 1.3
  return 1
}

export default function App() {
  const [ready,      setReady]     = useState(false)
  const [onboarding, setOnboard]   = useState(false)
  const [learner,    setLearner]   = useState<Learner|null>(null)
  const [streak,     setStreak]    = useState<StreakState|null>(null)
  const [due,        setDue]       = useState(0)
  const [mode,       setMode]      = useState<Mode>('learn')
  const [xpPop,      setXpPop]     = useState<number|null>(null)
  const [hearts,     setHearts]    = useState([true,true,true,true,true])
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [welcomeVisible, setWelcomeVisible] = useState(false)
  const [dailyGoalCelebrated, setDailyGoalCelebrated] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const shownMilestonesRef = useRef<Set<number>>(new Set())
  const shownAchievementsRef = useRef<Set<string>>(new Set())
  const questClaimedRef = useRef<Set<string>>(new Set())
  const lessonSegmentClaimedRef = useRef<Set<number>>(new Set())

  // New wave-3 state
  const [showStreakModal, setShowStreakModal] = useState(false)
  const [levelUpOld, setLevelUpOld] = useState<string|null>(null)
  const [levelUpNew, setLevelUpNew] = useState<string|null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lightMode, setLightMode] = useState(false)
  const prevCefrRef = useRef<string|null>(null)

  function addAchievement(a: Achievement) {
    const key = a.id
    if (shownAchievementsRef.current.has(key)) return
    shownAchievementsRef.current.add(key)
    setAchievements(prev => [...prev, a])
  }

  function dismissAchievement(id: string) {
    setAchievements(prev => prev.filter(a => a.id !== id))
  }

  // Drill state
  const [qi,         setQi]        = useState(0)
  const [answered,   setAnswered]  = useState(false)
  const [correct,    setCorrect]   = useState<boolean|null>(null)
  const [score,      setScore]     = useState({c:0,t:0})
  const [comboStreak,setComboStreak]=useState(0)
  // Arrange state
  const [arranged,   setArranged]  = useState<string[]>([])
  const [available,  setAvailable] = useState<string[]>([])
  // Listen state
  const [listenInput,setListenInput]=useState('')
  const [speaking,   setSpeaking]  = useState(false)
  // Translate state
  const [transInput, setTransInput]=useState('')
  // Mistake tracking
  const [mistakes,   setMistakes]  = useState<{prompt:string;answer:string;note:string}[]>([])
  const [arrangeAiFeedback, setArrangeAiFeedback] = useState<ArrangeAiFeedback | null>(null)
  const [arrangeAiLoading,  setArrangeAiLoading]  = useState(false)
  const [aiCoachPlan, setAiCoachPlan] = useState<AiCoachPlan | null>(null)
  const [adaptive, setAdaptive] = useState<AdaptiveProfile | null>(null)
  const [c1Status, setC1Status] = useState<C1Status | null>(null)
  const [c2Status, setC2Status] = useState<C2Status | null>(null)
  const [missions, setMissions] = useState<CefrMission[]>([])
  const [checkpointResult, setCheckpointResult] = useState<CefrCheckpoint | null>(null)
  const [checkpointBusy, setCheckpointBusy] = useState(false)
  const [checkpointSession, setCheckpointSession] = useState<CheckpointSession | null>(null)
  const [checkpointTick, setCheckpointTick] = useState(0)
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now())
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({})
  const [savingSettings, setSavingSettings] = useState(false)
  const [currentUnitId, setCurrentUnitId] = useState<string>('')
  const [unitStats, setUnitStats] = useState<{ answered: number; correct: number }>({ answered: 0, correct: 0 })
  const [showTree, setShowTree] = useState(true)
  const [weakSkills, setWeakSkills] = useState<WeakSkillItem[]>([])
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([])
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null)
  const [performanceDays, setPerformanceDays] = useState<7 | 14 | 30>(14)
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [storySession, setStorySession] = useState<StoryDetail | null>(null)
  const [nextBestLesson, setNextBestLesson] = useState<AdaptiveNextLesson | null>(null)
  const [patternDiagnosis, setPatternDiagnosis] = useState<PatternDiagnosis | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<DrillQ[]>([])
  const [generatingPractice, setGeneratingPractice] = useState<string | null>(null) // skill_tag being generated
  const recentQuestionIdxRef = useRef<number[]>([])
  const recentOutcomesRef = useRef<{ type: string; ok: boolean; prompt: string; responseMs: number }[]>([])
  const skillMasteryRef = useRef<Record<string, { mastery: number; lastSeenAt: number }>>({})
  const masteryDirtyRef = useRef(0)

  // Chat state
  const [chatMsgs,   setChatMsgs]  = useState<Msg[]>([])
  const [chatIn,     setChatIn]    = useState('')
  const [streaming,  setStreaming] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Mathieu state
  const [mMsgs,      setMMsgs]     = useState<Msg[]>([])
  const [mIn,        setMIn]       = useState('')
  const [mBusy,      setMBusy]     = useState(false)
  const [mInfo,      setMInfo]     = useState({mood:'jovial',special:''})
  const mBottomRef = useRef<HTMLDivElement>(null)

  // Grammar state
  const [gramSearch, setGramSearch]=useState('')
  const [gramFilter, setGramFilter]=useState<string>('All')
  const [gramExpand, setGramExpand]=useState<string|null>(null)

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      const failMsg =
        'Voltaire API unreachable. On macOS: double-click start.command (or run ./start.sh). If the backend is up, open http://localhost:8000/api/health in your browser.'
      try {
        const { onboarded } = await api.getOnboardingStatus()
        if (!onboarded) { setOnboard(true); return }
        const settled = await Promise.allSettled([
          api.getLearner(),
          api.getStreak(),
          api.getDueCount(),
          api.getAdaptiveProfile(),
          api.getC1Status(),
          api.getC2Status(),
          api.getNextBestLesson(),
          api.getSettings(),
          api.getCefrMissions(),
          api.getAiCoachPlan(),
          api.getWeakSkillReport(),
          api.getReviewQueue(12),
          api.getPatternDiagnosis(),
          api.getPerformanceSummary(14),
          api.getPerformanceTrend(30),
          api.getAdaptiveMastery(),
        ])
        const [
          lr, sr, dr, pr, c1r, c2r, nbr, settingsR, missionsR, planR, weakR, queueR, diagR, perfR, trendR, masteryR,
        ] = settled
        const l = lr.status === 'fulfilled' ? lr.value : null
        if (!l) {
          const alive = await api.health().then(() => true).catch(() => false)
          toast.error(
            alive
              ? 'Could not load your learner profile. Refresh the page or check backend logs.'
              : failMsg
          )
          return
        }
        if (sr.status === 'fulfilled') setStreak(sr.value)
        if (dr.status === 'fulfilled') setDue(dr.value.count)
        if (pr.status === 'fulfilled') setAdaptive(pr.value)
        if (c1r.status === 'fulfilled') setC1Status(c1r.value)
        if (c2r.status === 'fulfilled') setC2Status(c2r.value)
        if (nbr.status === 'fulfilled') setNextBestLesson(nbr.value)
        if (settingsR.status === 'fulfilled') setSettingsMap(settingsR.value.settings || {})
        if (missionsR.status === 'fulfilled') setMissions(missionsR.value.missions || [])
        if (planR.status === 'fulfilled') setAiCoachPlan(planR.value)
        if (weakR.status === 'fulfilled') setWeakSkills(weakR.value.skills || [])
        if (queueR.status === 'fulfilled') setReviewQueue(queueR.value.items || [])
        if (diagR.status === 'fulfilled') setPatternDiagnosis(diagR.value)
        if (perfR.status === 'fulfilled') setPerformanceSummary(perfR.value)
        if (trendR.status === 'fulfilled') setPerformanceTrend(trendR.value)
        if (masteryR.status === 'fulfilled' && masteryR.value?.mastery) {
          const loaded: Record<string, { mastery: number; lastSeenAt: number }> = {}
          for (const [k, v] of Object.entries(masteryR.value.mastery)) {
            const item = (v || {}) as { mastery?: number; lastSeenAt?: number }
            const mastery = Number(item.mastery ?? 0.6)
            const lastSeenAt = Number(item.lastSeenAt ?? Date.now())
            loaded[k] = {
              mastery: Math.max(0, Math.min(1, Number.isFinite(mastery) ? mastery : 0.6)),
              lastSeenAt: Number.isFinite(lastSeenAt) ? lastSeenAt : Date.now(),
            }
          }
          skillMasteryRef.current = loaded
        }
        const settingsRes = settingsR.status === 'fulfilled' ? settingsR.value : { settings: {} as Record<string, string> }
        const firstUnlockedUnit = UNIT_META.find(u => (l.elo || 800) >= CEFR_ELO[u.cefr].min)?.id || UNIT_META[0]?.id || ''
        setCurrentUnitId(settingsRes.settings?.current_unit || firstUnlockedUnit)
        setReady(true)
        resetQ(0)
        const failed = settled.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        if (failed.length) {
          console.warn('Some startup endpoints failed (app still loads):', failed.map(f => String(f.reason)))
        }
      } catch {
        toast.error(failMsg)
      }
    })()
  },[])

  useEffect(()=>{ chatBottomRef.current?.scrollIntoView({behavior:'smooth'}) },[chatMsgs])
  useEffect(()=>{ mBottomRef.current?.scrollIntoView({behavior:'smooth'}) },[mMsgs])
  useEffect(() => {
    if (mode !== 'performance') return
    api.getPerformanceSummary(performanceDays).then(setPerformanceSummary).catch(() => {})
    api.getPerformanceTrend(30).then(setPerformanceTrend).catch(() => {})
  }, [mode, performanceDays])
  useEffect(() => {
    const flushOnUnload = () => {
      if (masteryDirtyRef.current <= 0) return
      // Best-effort final save on exit/navigation.
      void api.saveAdaptiveMastery(skillMasteryRef.current).catch(() => {})
    }
    window.addEventListener('beforeunload', flushOnUnload)
    return () => window.removeEventListener('beforeunload', flushOnUnload)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't intercept when typing in an input / textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // ? key: toggle shortcut help modal
      if (e.key === '?') {
        setShowShortcuts(s => !s)
        return
      }

      if (mode === 'learn' && !showTree) {
        const pool = checkpointSession ? QUESTIONS : getEligibleQuestions()
        const q = pool[qi % pool.length]

        // Number keys 1-4: select MCQ option
        if (['1','2','3','4'].includes(e.key) && q.type === 'mcq' && !answered) {
          const idx = parseInt(e.key) - 1
          const opts = (q as any).options as string[]
          if (opts && idx < opts.length) {
            submitAnswer(opts[idx])
          }
          return
        }

        // Enter: submit arrange or continue
        if (e.key === 'Enter') {
          if (answered) {
            nextQ()
          } else if (q.type === 'arrange' && arranged.length > 0) {
            submitAnswer(arranged.join(' '))
          }
          return
        }

        // Escape: go back to skill tree
        if (e.key === 'Escape') {
          setShowTree(true)
          setGeneratedQuestions([])
          return
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, showTree, answered, qi, arranged, checkpointSession])

  // ── Light/dark mode sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }, [lightMode])

  // ── Daily streak modal ────────────────────────────────────────────────────
  useEffect(() => {
    if (ready && streak && shouldShowStreakModal(streak.current_streak)) {
      const t = setTimeout(() => setShowStreakModal(true), 900)
      return () => clearTimeout(t)
    }
  }, [ready, streak])

  // ── Level-up detection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!learner) return
    const CEFR_ORDER = ['A1','A2','B1','B2','C1','C2'] as const
    const currentCefr = CEFR_ORDER.slice().reverse().find(l => (learner.elo || 800) >= CEFR_ELO[l].min) ?? 'A1'
    if (prevCefrRef.current && prevCefrRef.current !== currentCefr) {
      const oldIdx = CEFR_ORDER.indexOf(prevCefrRef.current as typeof CEFR_ORDER[number])
      const newIdx = CEFR_ORDER.indexOf(currentCefr as typeof CEFR_ORDER[number])
      if (newIdx > oldIdx) {
        setLevelUpOld(prevCefrRef.current)
        setLevelUpNew(currentCefr)
      }
    }
    prevCefrRef.current = currentCefr
  }, [learner?.elo])

  // ── Welcome back message ──────────────────────────────────────────────────
  useEffect(() => {
    if (ready && learner) {
      setWelcomeVisible(true)
      const t = setTimeout(() => setWelcomeVisible(false), 4000)
      return () => clearTimeout(t)
    }
  }, [ready]) // only on initial ready

  // ── Streak milestone toasts ───────────────────────────────────────────────
  useEffect(() => {
    if (!streak) return
    const s = streak.current_streak
    const milestones = [3, 7, 14, 30, 60, 100]
    for (const m of milestones) {
      if (s === m && !shownMilestonesRef.current.has(m)) {
        shownMilestonesRef.current.add(m)
        const msgs: Record<number,string> = {
          3:  '3-day streak! You\'re building momentum.',
          7:  '7 days straight! You\'re on fire 🔥',
          14: '2 weeks! Consistency is your superpower.',
          30: '30-day streak! Incroyable!',
          60: '2 months! You\'re a force.',
          100:'100 days! Legendary dedication 🏆',
        }
        toast.success(`🔥 ${msgs[m]}`, { duration: 4000 })
        addAchievement({
          id: `streak-${m}`,
          title: `${m}-Day Streak!`,
          description: msgs[m],
          icon: '🔥',
          xp: m * 5,
        })
        break
      }
    }
  }, [streak])

  // ── Daily goal celebration ────────────────────────────────────────────────
  useEffect(() => {
    if (!streak || dailyGoalCelebrated) return
    const xpToday = streak.xp_today || 0
    const xpGoal  = streak.daily_goal_xp || 50
    if (xpToday >= xpGoal && xpGoal > 0) {
      setDailyGoalCelebrated(true)
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ['#58cc02', '#ffd900', '#4f9cf9'] })
      addAchievement({
        id: `daily-goal-${new Date().toDateString()}`,
        title: 'Daily Goal Complete!',
        description: `You hit your ${xpGoal} XP goal today. Amazing work!`,
        icon: '🎯',
        xp: 25,
      })
    }
  }, [streak, dailyGoalCelebrated])

  // ── Quest completion rewards (Duolingo/Babbel style) ─────────────────────
  useEffect(() => {
    const quests = [
      { id: 'dq-15-drills', done: score.t >= 15, title: 'Quest Complete: 15 Drills', xp: 20, icon: '🧩' },
      { id: 'dq-8-correct', done: score.c >= 8, title: 'Quest Complete: 8 Correct', xp: 20, icon: '✅' },
      { id: 'dq-5-combo', done: comboStreak >= 5, title: 'Quest Complete: 5x Combo', xp: 25, icon: '⚡' },
    ]
    for (const q of quests) {
      if (!q.done || questClaimedRef.current.has(q.id)) continue
      questClaimedRef.current.add(q.id)
      setSessionXp(s => s + q.xp)
      setXpPop(q.xp)
      toast.success(`${q.icon} ${q.title} (+${q.xp} bonus XP)`, { duration: 2800 })
      addAchievement({
        id: q.id,
        title: q.title,
        description: 'Daily quest reward unlocked.',
        icon: q.icon,
        xp: q.xp,
      })
    }
  }, [score.t, score.c, comboStreak])

  // ── Lesson segment milestones (every 10 attempts) ────────────────────────
  useEffect(() => {
    if (score.t <= 0 || score.t % 10 !== 0) return
    if (lessonSegmentClaimedRef.current.has(score.t)) return
    lessonSegmentClaimedRef.current.add(score.t)
    const perfect = score.c >= score.t
    const bonus = perfect ? 30 : 18
    setSessionXp(s => s + bonus)
    setXpPop(bonus)
    confetti({
      particleCount: perfect ? 110 : 75,
      spread: perfect ? 80 : 60,
      origin: { y: 0.55 },
      colors: perfect ? ['#58cc02', '#ffd900', '#4f9cf9'] : ['#ffd900', '#4f9cf9'],
    })
    toast.success(
      perfect
        ? `Perfect set! ${score.c}/${score.t} correct (+${bonus} XP)`
        : `Lesson set complete: ${score.t} attempts (+${bonus} XP)`,
      { duration: 3200 },
    )
  }, [score.t, score.c])

  // ── Lesson milestone achievements ────────────────────────────────────────
  useEffect(() => {
    if (!learner) return
    const totalLessons = learner.xp ? Math.floor(learner.xp / 10) : 0
    const milestones: Record<number, { title: string; description: string; icon: string; xp: number }> = {
      10:  { title: '10 Lessons Down!',    description: 'You completed your first 10 lessons. Keep it up!',         icon: '📚', xp: 20  },
      25:  { title: '25 Lesson Milestone', description: 'A quarter century of lessons — you\'re serious!',           icon: '⭐', xp: 50  },
      50:  { title: '50 Lessons Strong',   description: 'Half a hundred! Your French is really growing.',            icon: '💪', xp: 75  },
      100: { title: '100 Lesson Legend',   description: 'One hundred lessons completed. C\'est incroyable!',         icon: '🏆', xp: 150 },
    }
    for (const [count, meta] of Object.entries(milestones)) {
      const n = Number(count)
      if (totalLessons >= n) {
        addAchievement({ id: `lessons-${n}`, ...meta })
      }
    }
  }, [learner?.xp])

  const grammarWeakPrimed = useRef(false)
  useEffect(() => {
    if (mode !== 'grammar') {
      grammarWeakPrimed.current = false
      return
    }
    if (grammarWeakPrimed.current || weakSkills.length === 0) return
    setGramSearch(weakSkills[0].skill_tag)
    grammarWeakPrimed.current = true
  }, [mode, weakSkills])

  // ── Question management ───────────────────────────────────────────────────
  function getEligibleQuestions(): DrillQ[] {
    const currentElo = learner?.elo || 800
    const unlocked = QUESTIONS.filter(q => {
      const band = CEFR_ELO[q.cefr]
      return currentElo >= band.min
    })
    if (!currentUnitId) return [...generatedQuestions, ...unlocked]
    const inUnit = unlocked.filter(q => q.unitId === currentUnitId)
    const base = inUnit.length > 0 ? inUnit : unlocked
    // Prepend AI-generated questions so they appear first when active
    return generatedQuestions.length > 0 ? [...generatedQuestions, ...base] : base
  }

  function resetQ(idx: number, useAbsolute = false, overridePool?: DrillQ[]) {
    const pool = overridePool ?? (useAbsolute ? QUESTIONS : getEligibleQuestions())
    const q = pool[idx % pool.length]
    setQi(idx)
    setAnswered(false)
    setCorrect(null)
    setListenInput('')
    setTransInput('')
    if (q.type === 'arrange') {
      const shuffled = [...q.words].sort(()=>Math.random()-.5)
      setAvailable(shuffled)
      setArranged([])
    }
    setQuestionStartedAt(Date.now())
    setArrangeAiFeedback(null)
    setArrangeAiLoading(false)
  }

  const unlockedUnits = UNIT_META.filter(u => (learner?.elo || 800) >= CEFR_ELO[u.cefr].min)

  function chooseNextUnlockedUnit(current: string): string {
    const idx = unlockedUnits.findIndex(u => u.id === current)
    if (idx >= 0 && idx < unlockedUnits.length - 1) return unlockedUnits[idx + 1].id
    return current
  }

  function chooseAdaptiveNextIndex() {
    const pool = getEligibleQuestions()
    const total = pool.length
    if (total <= 1) return 0
    const current = qi % total
    const focusPrompts = new Set((adaptive?.focus_prompts || []).map(f => f.prompt))
    const weakType = adaptive?.weak_types?.[0]?.q_type || ''
    const reviewQTypes = new Set((reviewQueue || []).slice(0, 4).map(r => r.q_type))
    const weakPromptHints = new Set(
      mistakes.slice(-6).flatMap(m => [m.prompt, m.answer]).map(s => s.trim()).filter(Boolean),
    )
    const recentIdx = recentQuestionIdxRef.current
    const recentOutcomes = recentOutcomesRef.current.slice(-16)
    const recentByType = new Map<string, { total: number; wrong: number }>()
    for (const row of recentOutcomes) {
      const prev = recentByType.get(row.type) || { total: 0, wrong: 0 }
      prev.total += 1
      if (!row.ok) prev.wrong += 1
      recentByType.set(row.type, prev)
    }
    const recentTotal = recentOutcomes.length
    const recentCorrect = recentOutcomes.filter(r => r.ok).length
    const recentAccuracy = recentTotal > 0 ? recentCorrect / recentTotal : 0.75
    const avgResponseMs =
      recentTotal > 0 ? recentOutcomes.reduce((s, r) => s + r.responseMs, 0) / recentTotal : 5500

    // Keep learner around a healthy challenge band.
    // Too easy -> increase complexity, too hard/slow -> stabilize with simpler prompts.
    const struggle = recentAccuracy < 0.62 || (recentAccuracy < 0.7 && avgResponseMs > 10000)
    const cruising = recentAccuracy > 0.84 && avgResponseMs < 7000

    const candidates = pool
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => i !== current)
      .map(({ q, i }) => {
        let weight = 1
        const qDiff = questionDifficultyWeight(q.type)
        const sk = skillKeyForQuestion(q)

        // Avoid immediate repetition unless pool is tiny.
        if (recentIdx.includes(i)) weight *= 0.15
        if (recentIdx.slice(-1)[0] === i) weight *= 0.05

        // Backend adaptive priorities.
        if (focusPrompts.has(q.prompt)) weight += 2.3
        if (weakType && q.type === weakType) weight += 1.8
        if (reviewQTypes.has(q.type)) weight += 0.8

        // Revisit patterns the learner recently missed.
        if (weakPromptHints.has(q.prompt) || weakPromptHints.has(q.answer)) weight += 1.0

        // Per-type recency error-rate boost.
        const stat = recentByType.get(q.type)
        if (stat && stat.total >= 2) {
          const errRate = stat.wrong / stat.total
          if (errRate > 0.35) weight += (errRate - 0.35) * 2.5
        }

        // Mastery decay model: strong skills fade over time and get resurfaced.
        const s = skillMasteryRef.current[sk]
        if (s) {
          const elapsedHours = Math.max(0, (Date.now() - s.lastSeenAt) / 3_600_000)
          const forgetting = Math.min(0.35, elapsedHours * 0.012)
          const effectiveMastery = Math.max(0, Math.min(1, s.mastery - forgetting))
          const reinforcementNeed = 1 - effectiveMastery
          weight += reinforcementNeed * 1.4

          // Mild diversification: avoid hammering same skill back-to-back
          // unless mastery says it still needs focused practice.
          if (Date.now() - s.lastSeenAt < 90_000 && reinforcementNeed < 0.55) {
            weight -= 0.25
          }
        } else {
          // Unseen skill gets a slight discovery boost.
          weight += 0.25
        }

        // Difficulty autopilot based on recent performance.
        if (struggle) {
          if (qDiff <= 1.0) weight += 0.9
          if (qDiff >= 1.25) weight -= 0.45
        } else if (cruising) {
          if (qDiff >= 1.2) weight += 0.75
          if (qDiff <= 0.7) weight -= 0.25
        }

        // Streak bonus nudges toward productive output.
        if (comboStreak >= 4 && !struggle) {
          if (q.type === 'translate' || q.type === 'listen') weight += 0.55
          if (q.type === 'mcq') weight -= 0.15
        }

        return { i, weight: Math.max(weight, 0.05) }
      })

    if (candidates.length === 0) return (qi + 1) % total
    const totalWeight = candidates.reduce((s, c) => s + c.weight, 0)
    let r = Math.random() * totalWeight
    for (const c of candidates) {
      r -= c.weight
      if (r <= 0) return c.i
    }
    return candidates[candidates.length - 1].i
  }

  function indicesForLevel(level: string): number[] {
    const target = level.toUpperCase()
    return QUESTIONS
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.cefr === target)
      .map(({ i }) => i)
  }

  function sampleIndices(pool: number[], n: number): number[] {
    const copy = [...pool]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, Math.min(n, copy.length))
  }

  async function fetchArrangeFeedback(userAnswer: string, question: DrillQ) {
    try {
      setArrangeAiLoading(true)
      const fb = await api.getAiMistakeFeedback({
        q_type: question.type,
        cefr: question.cefr,
        prompt: question.prompt,
        user_answer: userAnswer,
        expected_answer: question.answer,
        note: question.note || '',
      })
      setArrangeAiFeedback({
        corrected: fb.corrected || question.answer,
        explanation: fb.explanation || 'Word order is off. Try following subject + verb + complements.',
        next_step: fb.next_step || 'Retry a similar sentence now.',
      })
    } catch {
      setArrangeAiFeedback({
        corrected: question.answer,
        explanation: 'Word order is off. Try keeping subject + verb first, then the rest of the sentence.',
        next_step: 'Retry one similar sentence now.',
      })
    } finally {
      setArrangeAiLoading(false)
    }
  }

  function submitAnswer(userAnswer: string) {
    if (answered) return
    // During a checkpoint, qi is absolute into QUESTIONS; otherwise use eligible subset.
    const pool = checkpointSession ? QUESTIONS : getEligibleQuestions()
    const q = pool[qi % pool.length]
    const ok = answersEquivalent(userAnswer, q.answer)
    const responseMs = Date.now() - questionStartedAt
    setAnswered(true)
    setCorrect(ok)
    setFeedbackVisible(true)
    setScore(s=>({c:s.c+(ok?1:0),t:s.t+1}))
    setUnitStats(s => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0) }))
    if (!checkpointSession) {
      const idx = qi % pool.length
      recentQuestionIdxRef.current = [...recentQuestionIdxRef.current.slice(-4), idx]
      recentOutcomesRef.current = [
        ...recentOutcomesRef.current.slice(-19),
        { type: q.type, ok, prompt: q.prompt, responseMs },
      ]

      // Update session mastery estimate for this skill bucket.
      // Correct answers raise mastery gradually; wrong answers lower it faster.
      const sk = skillKeyForQuestion(q)
      const prev = skillMasteryRef.current[sk] || { mastery: 0.6, lastSeenAt: Date.now() }
      const elapsedHours = Math.max(0, (Date.now() - prev.lastSeenAt) / 3_600_000)
      const decay = Math.max(0.7, 1 - elapsedHours * 0.015)
      const decayed = prev.mastery * decay
      const delta = ok ? 0.11 : -0.2
      skillMasteryRef.current[sk] = {
        mastery: Math.max(0, Math.min(1, decayed + delta)),
        lastSeenAt: Date.now(),
      }
      masteryDirtyRef.current += 1
      if (masteryDirtyRef.current >= 5) {
        masteryDirtyRef.current = 0
        void api.saveAdaptiveMastery(skillMasteryRef.current).catch(() => {})
      }
    }
    void api
      .logLessonMemory({
        lesson_id: `drill:${Date.now()}:${q.type}`,
        title: `Drill ${ok ? 'correct' : 'incorrect'} · ${q.type}`,
        unit_id: currentUnitId || q.unitId || '',
        source: 'drill',
        detail: `prompt="${toLogSnippet(q.prompt)}" | your_answer="${toLogSnippet(userAnswer)}" | expected="${toLogSnippet(q.answer)}" | time_ms=${responseMs}`,
      })
      .catch(() => {})
    if (checkpointSession) {
      setCheckpointSession(prev => prev ? ({ ...prev, correct: prev.correct + (ok ? 1 : 0) }) : prev)
    }
    if (ok) {
      setComboStreak(c=>c+1)
      const xp = 10 + Math.min(comboStreak*3, 15)
      setXpPop(xp)
      setSessionXp(s => s + Math.round(xp * xpMultiplierFromCombo(comboStreak + 1)))
      if (comboStreak >= 4) confetti({particleCount:90,spread:75,origin:{y:.6},colors:['#58cc02','#ffd900','#4f9cf9','#a78bfa']})
      if (comboStreak + 1 === 5) toast.success('Combo master! Bonus multiplier unlocked ⚡')
    } else {
      setComboStreak(0)
      setHearts(h=>{const n=[...h];const li=n.lastIndexOf(true);if(li>=0)n[li]=false;return n})
      if (q.note) setMistakes(m=>[...m,{prompt:q.prompt,answer:q.answer,note:q.note||''}])
      fetchArrangeFeedback(userAnswer, q)
    }
    api.applyLearnProgress(ok).then(async () => {
      try {
        const [l, s, c1, c2, nextBest, missionsRes] = await Promise.all([api.getLearner(), api.getStreak(), api.getC1Status(), api.getC2Status(), api.getNextBestLesson(), api.getCefrMissions()])
        setLearner(l); setStreak(s)
        setC1Status(c1)
        setC2Status(c2)
        setNextBestLesson(nextBest)
        setMissions(missionsRes.missions || [])
        // Auto-advance unit when learner demonstrates strong consistency in current unit.
        const nextAnswered = unitStats.answered + 1
        const nextCorrect = unitStats.correct + (ok ? 1 : 0)
        if (nextAnswered >= 10 && (nextCorrect / nextAnswered) >= 0.75) {
          const nextUnit = chooseNextUnlockedUnit(currentUnitId)
          if (nextUnit && nextUnit !== currentUnitId) {
            const finishedUnit = currentUnitId
            setCurrentUnitId(nextUnit)
            api.saveSetting('current_unit', nextUnit).catch(()=>{})
            setUnitStats({ answered: 0, correct: 0 })
            toast.success(`Unit complete. Moving to ${nextUnit.toUpperCase()}`)
            void api
              .logLessonMemory({
                lesson_id: `unit:${finishedUnit}`,
                title:     `Finished unit ${finishedUnit}`,
                unit_id:   finishedUnit,
                source:    'unit',
                detail:    `Next unit: ${nextUnit}`,
              })
              .catch(() => {})
          }
        }
      } catch {}
    }).catch(()=>{})
    api.logAdaptiveEvent({
      q_type: q.type,
      cefr: q.cefr,
      skill_tag: q.type === 'arrange' ? 'syntax' : q.type === 'listen' ? 'listening' : q.type === 'translate' ? 'lexicon' : 'grammar',
      prompt: q.prompt,
      correct: ok,
      response_ms: responseMs,
      user_answer: userAnswer,
      expected_answer: q.answer,
    }).then(()=>{
      api.getAdaptiveProfile().then(setAdaptive).catch(()=>{})
      if (!ok) api.getPatternDiagnosis().then(setPatternDiagnosis).catch(()=>{})
    }).catch(()=>{})
  }

  async function finishCheckpoint(timeout = false) {
    if (!checkpointSession) return
    const sess = checkpointSession
    const total = sess.indices.length
    const pct = Math.round((sess.correct / Math.max(total, 1)) * 100)
    setCheckpointBusy(true)
    try {
      const res = await api.runCefrCheckpoint(sess.level, pct)
      setCheckpointResult({
        ...res,
        recommendation: timeout ? `Time expired. ${res.recommendation}` : res.recommendation,
      })
      const [missionsRes, c1] = await Promise.all([api.getCefrMissions(), api.getC1Status()])
      setMissions(missionsRes.missions || [])
      setC1Status(c1)
      api.getC2Status().then(setC2Status).catch(()=>{})
      void api
        .logLessonMemory({
          lesson_id: `checkpoint:${sess.level}`,
          title:     `CEFR ${sess.level} level exam`,
          source:    'checkpoint',
          detail:    `${pct}% · ${res.passed ? 'passed' : 'not passed'}${timeout ? ' · time expired' : ''}`,
        })
        .catch(() => {})
      if (!res.passed) setMode('review')
    } catch {
      toast.error('Checkpoint submission failed')
    } finally {
      setCheckpointBusy(false)
      setCheckpointSession(null)
    }
  }

  function nextQ() {
    if (checkpointSession) {
      const nextPos = checkpointSession.pos + 1
      if (nextPos >= checkpointSession.indices.length) {
        finishCheckpoint(false)
        return
      }
      const nextIdx = checkpointSession.indices[nextPos]
      setCheckpointSession(prev => prev ? ({ ...prev, pos: nextPos }) : prev)
      resetQ(nextIdx, true)
      return
    }
    resetQ(chooseAdaptiveNextIndex())
  }

  // Arrange helpers
  function tapAvail(word:string, idx:number) {
    if (answered) return
    setAvailable(a=>{const n=[...a];n.splice(idx,1);return n})
    setArranged(a=>[...a,word])
  }
  function tapArranged(word:string, idx:number) {
    if (answered) return
    setArranged(a=>{const n=[...a];n.splice(idx,1);return n})
    setAvailable(a=>[...a,word])
  }

  // Listen TTS
  function playAudio(text:string) {
    if (speaking) return
    setSpeaking(true)
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'fr-FR'
    const cfgRate = Number(settingsMap.audio_speed || '0.85')
    utter.rate = Number.isFinite(cfgRate) ? Math.max(0.6, Math.min(1.2, cfgRate)) : 0.85
    const voices = window.speechSynthesis.getVoices()
    const frVoice = voices.find(v=>v.lang.startsWith('fr'))
    if (frVoice) utter.voice = frVoice
    utter.onend = ()=>setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  async function initChat() {
    if (chatMsgs.length > 0) return
    try {
      const res = await api.startLesson()
      setChatMsgs([{role:'assistant',text:res.text}])
    } catch(e) { toast.error(String(e)) }
  }

  async function sendChat() {
    const input = chatIn.trim()
    if (!input || streaming) return
    setChatIn('')
    const hist = chatMsgs.filter(m=>m.text.trim()).map(m=>({role:m.role,text:m.text}))
    setChatMsgs(m=>[...m,{role:'user',text:input}])
    setStreaming(true)
    let built=''
    setChatMsgs(m=>[...m,{role:'assistant',text:''}])
    await streamLesson(input, hist,
      tok=>{ built+=tok; setChatMsgs(m=>{const u=[...m];u[u.length-1]={role:'assistant',text:built};return u}) },
      async()=>{ setStreaming(false); try{const[l,s]=await Promise.all([api.getLearner(),api.getStreak()]);setLearner(l);setStreak(s)}catch{} },
      err=>{ setStreaming(false); toast.error(err) }
    )
  }

  // ── Mathieu ───────────────────────────────────────────────────────────────
  async function initMathieu() {
    if (mMsgs.length > 0) return
    setMBusy(true)
    try {
      const [state,start] = await Promise.all([api.getMathieuState(),api.startMathieu()])
      const mem = state.memory as any
      setMInfo({mood:String(mem?.mood||'jovial'),special:String(mem?.special||'')})
      const hist = (state.history as any[]).map(m=>({role:m.role as 'assistant'|'user',text:m.content||''}))
      setMMsgs(hist.length>0?hist:[{role:'assistant',text:start.text}])
    } catch(e) { toast.error(String(e)) }
    finally { setMBusy(false) }
  }

  async function sendMathieu() {
    const input = mIn.trim()
    if (!input||mBusy) return
    setMIn('')
    setMMsgs(m=>[...m,{role:'user',text:input}])
    setMBusy(true)
    try {
      const res = await api.chatMathieu(input)
      setMMsgs(m=>[...m,{role:'assistant',text:res.text}])
    } catch(e) { toast.error(String(e)) }
    finally { setMBusy(false) }
  }

  async function saveSetting(key: string, value: string) {
    setSavingSettings(true)
    try {
      await api.saveSetting(key, value)
      setSettingsMap(prev => ({ ...prev, [key]: value }))
      if (key === 'daily_goal_xp') {
        const s = await api.getStreak()
        setStreak(s)
      }
      toast.success('Saved')
    } catch {
      toast.error('Could not save setting')
    } finally {
      setSavingSettings(false)
    }
  }

  function masteryStats() {
    const values = Object.values(skillMasteryRef.current || {})
    const count = values.length
    if (!count) return { count: 0, avg: 0 }
    const avg = values.reduce((s, v) => s + (Number(v?.mastery) || 0), 0) / count
    return { count, avg }
  }

  async function flushMasteryNow() {
    try {
      await api.saveAdaptiveMastery(skillMasteryRef.current)
      masteryDirtyRef.current = 0
      toast.success('Adaptive mastery saved')
    } catch {
      toast.error('Could not save adaptive mastery')
    }
  }

  async function resetMasteryNow() {
    try {
      skillMasteryRef.current = {}
      masteryDirtyRef.current = 0
      await api.saveAdaptiveMastery({})
      toast.success('Adaptive mastery reset')
    } catch {
      toast.error('Could not reset adaptive mastery')
    }
  }

  function practicePrompt(prompt: string) {
    const pool = QUESTIONS
    const idx = pool.findIndex(q => q.prompt === prompt)
    if (idx >= 0) {
      setMode('learn')
      setShowTree(false)
      const targetUnit = pool[idx].unitId
      if (targetUnit) setCurrentUnitId(targetUnit)
      resetQ(idx, true)
    }
  }

  function startCheckpoint(level: string) {
    const indices = sampleIndices(indicesForLevel(level), 8)
    if (indices.length < 4) {
      toast.error('Not enough questions for this checkpoint yet')
      return
    }
    const now = Date.now()
    setCheckpointResult(null)
    setCheckpointSession({
      level,
      indices,
      pos: 0,
      correct: 0,
      startedAt: now,
      endAt: now + 2 * 60 * 1000,
    })
    setMode('learn')
    setShowTree(false)
    resetQ(indices[0], true)
  }

  async function generatePracticeForPattern(tag: string, cefr: string) {
    setGeneratingPractice(tag)
    try {
      // Gather up to 5 existing wrong-answer prompts for this skill as seed examples
      const examples = (adaptive?.focus_prompts || [])
        .slice(0, 5)
        .map(f => ({ prompt: f.prompt, answer: '' }))
      const res = await api.generatePractice({ cefr, skill_tag: tag, examples, count: 6 })
      if (!res.questions?.length) {
        toast.error('No questions generated — try again in a moment.')
        return
      }
      const qs = res.questions as unknown as DrillQ[]
      setGeneratedQuestions(qs)
      setShowTree(false)
      // Pass the pool explicitly — setGeneratedQuestions is async (state update not yet flushed),
      // so getEligibleQuestions() inside resetQ would still see the old empty array.
      // By passing overridePool directly we bypass the stale closure entirely.
      const livePool = [...qs, ...getEligibleQuestions()]
      resetQ(0, false, livePool)
      toast.success(`Generated ${qs.length} practice questions for "${tag}" ⚡`)
    } catch (e) {
      toast.error('Could not generate practice: ' + String(e))
    } finally {
      setGeneratingPractice(null)
    }
  }

  useEffect(() => {
    if (!checkpointSession) return
    const id = setInterval(() => {
      setCheckpointTick(t => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [checkpointSession])

  useEffect(() => {
    if (!checkpointSession) return
    if (Date.now() >= checkpointSession.endAt) finishCheckpoint(true)
  }, [checkpointTick, checkpointSession])

  const checkpointSecondsLeft = checkpointSession
    ? Math.max(0, Math.ceil((checkpointSession.endAt - Date.now()) / 1000))
    : 0

  const checkpointProgress = checkpointSession
    ? `${checkpointSession.level} checkpoint • ${checkpointSession.pos + 1}/${checkpointSession.indices.length} • ${checkpointSecondsLeft}s`
    : ''

  async function refreshStoriesList() {
    try {
      const r = await api.getStories()
      setStories(r.stories || [])
    } catch {
      setStories([])
    }
  }

  async function openStoryCard(s: Story) {
    if (!s.unlocked) {
      toast.error('Reach this CEFR level on your path to unlock.')
      return
    }
    try {
      const d = await api.getStory(s.id)
      setStorySession(d)
    } catch {
      toast.error('Could not load story.')
    }
  }

  function switchMode(m:Mode) {
    setMode(m)
    if (m==='learn') {
      setShowTree(true)
      setSessionXp(0)
      questClaimedRef.current.clear()
      lessonSegmentClaimedRef.current.clear()
    }
    if (m==='chat')    initChat()
    if (m==='mathieu') initMathieu()
    if (m==='stories') {
      setStorySession(null)
      void refreshStoriesList()
    }
    if (m==='review') {
      api.getWeakSkillReport().then(r => setWeakSkills(r.skills || [])).catch(()=>{})
      api.getReviewQueue(12).then(r => setReviewQueue(r.items || [])).catch(()=>{})
      api.getNextBestLesson().then(setNextBestLesson).catch(()=>{})
    }
  }

  // ── Onboarding / Loading ──────────────────────────────────────────────────
  if (onboarding) return <Onboarding onComplete={async()=>{
    setOnboard(false)
    const[l,s]=await Promise.all([api.getLearner(),api.getStreak()])
    setLearner(l);setStreak(s);setReady(true);resetQ(0)
  }}/>

  if (!ready) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,background:'#07090f'}}>
      <motion.div
        initial={{opacity:0,y:12}}
        animate={{opacity:1,y:0}}
        transition={{duration:.5}}
        style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}
      >
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'1.3rem',letterSpacing:'.4em',color:'#4f9cf9',fontWeight:700,textShadow:'0 0 32px rgba(79,156,249,.4)'}}>VOLTAIRE</div>
        <div style={{fontSize:12,letterSpacing:'.18em',color:'rgba(240,244,255,.35)',textTransform:'uppercase'}}>French Fluency</div>
        <div style={{width:32,height:32,border:'3px solid rgba(79,156,249,.2)',borderTop:'3px solid #4f9cf9',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        {/* Skeleton preview bars */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8,width:200}}>
          <div className="skeleton" style={{height:12,width:'100%',borderRadius:6}}/>
          <div className="skeleton" style={{height:12,width:'75%',borderRadius:6}}/>
          <div className="skeleton" style={{height:12,width:'88%',borderRadius:6}}/>
        </div>
      </motion.div>
    </div>
  )

  // ── Computed ──────────────────────────────────────────────────────────────
  const elo      = learner?.elo || 800
  const xpToday  = streak?.xp_today || 0
  const xpGoal   = streak?.daily_goal_xp || 50
  const xpPct    = Math.min(100, Math.round(xpToday/Math.max(xpGoal,1)*100))
  const curStreak = streak?.current_streak || 0
  const comboMult = xpMultiplierFromCombo(comboStreak)
  const dailyQuests = [
    { id: 'q1', label: 'Complete 15 drills', progress: Math.min(score.t, 15), goal: 15 },
    { id: 'q2', label: 'Get 8 correct answers', progress: Math.min(score.c, 8), goal: 8 },
    { id: 'q3', label: 'Reach a 5x combo', progress: Math.min(comboStreak, 5), goal: 5 },
  ]

  const CEFR = [{l:'A1',min:0},{l:'A2',min:1000},{l:'B1',min:1200},{l:'B2',min:1400},{l:'C1',min:1600},{l:'C2',min:1800}]
  const cefrCls = (i:number) => { const next=CEFR[i+1]?.min??9999; return elo>=next?'done':elo>=CEFR[i].min?'active':'locked' }

  const eligibleQuestions = getEligibleQuestions()
  // During a checkpoint session, qi is an absolute index into QUESTIONS (the full bank).
  // Outside a checkpoint, qi is relative to eligibleQuestions.
  const q = checkpointSession
    ? QUESTIONS[qi % QUESTIONS.length]
    : eligibleQuestions[qi % eligibleQuestions.length]
  const hintPair: 'fr|en' | 'en|fr' =
    q.type === 'translate' && (q as { direction?: string }).direction === 'en-fr' ? 'en|fr' : 'fr|en'
  const qPct = checkpointSession
    ? Math.round(((checkpointSession.pos + 1) / checkpointSession.indices.length) * 100)
    : Math.round((qi % eligibleQuestions.length) / eligibleQuestions.length * 100)

  const filteredGrammar = GRAMMAR.filter(r => {
    const matchSearch = !gramSearch || r.title.toLowerCase().includes(gramSearch.toLowerCase()) ||
      r.summary.toLowerCase().includes(gramSearch.toLowerCase()) ||
      r.examples.some(e=>e.fr.toLowerCase().includes(gramSearch.toLowerCase()))
    const matchFilter = gramFilter === 'All' || r.cefr === gramFilter || r.category === gramFilter
    return matchSearch && matchFilter
  })

  const course = buildCourse(elo, learner?.xp||0)

  const NAV = [
    {id:'learn'       as Mode,icon:'🎯',label:'Learn'},
    {id:'chat'        as Mode,icon:'✍️',label:'Tutor'},
    {id:'mathieu'     as Mode,icon:'☕',label:'Mathieu'},
    {id:'voice'       as Mode,icon:'🎙️',label:'Voice'},
    {id:'stories'     as Mode,icon:'📚',label:'Stories'},
    {id:'review'      as Mode,icon:'🔁',label:'Review'},
    {id:'leaderboard' as Mode,icon:'🏆',label:'Leaderboard'},
    {id:'performance' as Mode,icon:'📈',label:'Performance'},
    {id:'memory'      as Mode,icon:'📓',label:'Memory'},
    {id:'map'         as Mode,icon:'🗺️',label:'Course'},
    {id:'grammar'     as Mode,icon:'📐',label:'Grammar'},
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {xpPop!==null && <XpPop xp={xpPop} onDone={()=>setXpPop(null)}/>}
      <AchievementQueue queue={achievements} onDismiss={dismissAchievement} />

      {/* Daily streak modal */}
      <AnimatePresence>
        {showStreakModal && streak && (
          <DailyStreakModal
            streak={streak.current_streak}
            onClose={() => setShowStreakModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Level-up modal */}
      <AnimatePresence>
        {levelUpOld && levelUpNew && (
          <LevelUpModal
            oldLevel={levelUpOld}
            newLevel={levelUpNew}
            onClose={() => { setLevelUpOld(null); setLevelUpNew(null) }}
          />
        )}
      </AnimatePresence>

      {/* Keyboard shortcut help modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="shortcuts-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              className="shortcuts-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="shortcuts-title">⌨️ Keyboard Shortcuts</div>
              {[
                { key: '?',      desc: 'Show this help modal' },
                { key: 'Escape', desc: 'Close modal / go back to skill tree' },
                { key: '1–4',    desc: 'Select MCQ answer A–D' },
                { key: 'Enter',  desc: 'Submit arranged sentence / continue' },
              ].map(({ key, desc }) => (
                <div key={key} className="shortcut-row">
                  <span>{desc}</span>
                  <span className="shortcut-key">{key}</span>
                </div>
              ))}
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  marginTop: 20, width: '100%', padding: '11px',
                  borderRadius: 'var(--r-sm)', background: 'var(--surface2)',
                  border: '1.5px solid var(--border2)', color: 'var(--t2)',
                  fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🇫🇷</div>
          <div>
            <div className="brand-text">VOLTAIRE</div>
            <div className="brand-sub">French Fluency</div>
          </div>
        </div>
        <div className="nav-section">Study</div>
        {NAV.map(n=>(
          <button key={n.id} className={`nav-item${mode===n.id?' active':''}`} onClick={()=>switchMode(n.id)}>
            <div className="nav-icon-wrap">{n.icon}</div>{n.label}
            {n.id==='review'&&due>0&&<span className="nav-badge">{due}</span>}
          </button>
        ))}
        <div className="nav-section">Account</div>
        <button className="nav-item" onClick={()=>switchMode('settings')}>
          <div className="nav-icon-wrap">⚙️</div>Settings
        </button>
        {mistakes.length>0 && (
          <div style={{margin:'8px 12px',padding:'10px 12px',background:'rgba(255,75,75,.08)',border:'1px solid rgba(255,75,75,.2)',borderRadius:10,fontSize:12,fontWeight:700}}>
            ⚠️ {mistakes.length} weak spot{mistakes.length>1?'s':''} detected
            <div style={{fontSize:11,color:'var(--t3)',marginTop:3,fontWeight:600}}>Go to Drill → Weak Spots</div>
          </div>
        )}
        <div style={{padding:'12px 18px',fontSize:11,color:'var(--t3)',borderTop:'1px solid var(--border)',marginTop:'auto'}}>
          Voltaire v2.0
        </div>
      </nav>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-streak">
            <span className="fire">{curStreak>0?'🔥':'💤'}</span>
            <span className="count" style={{color:curStreak>0?'var(--amber)':'var(--t3)'}}>{curStreak}</span>
          </div>
          <div className="topbar-xp">
            <span className="xp-icon">⚡</span>
            <div className="xp-bar-wrap">
              <div className="xp-bar-label">{xpToday} / {xpGoal} XP</div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{width:`${xpPct}%`}}/></div>
            </div>
          </div>
          <div className="topbar-elo">
            <span className="elo-num">{elo}</span>
            <span className="elo-lbl">ELO</span>
          </div>
        </div>

        {/* CEFR */}
        <div className="cefr-bar">
          {CEFR.map((c,i)=>(
            <div key={c.l} className="cefr-step">
              <div className={`cefr-dot ${cefrCls(i)}`} title={`${c.l} — ELO ${c.min}+`}>
                {cefrCls(i)==='done'?'✓':c.l}
                <span className="cefr-tip">{c.l} · ELO {c.min}+</span>
              </div>
              {i<CEFR.length-1&&<div className={`cefr-line${cefrCls(i)==='done'?' done':''}`}/>}
            </div>
          ))}
        </div>

        {/* Mode tabs (visible on mobile) */}
        <div className="mode-tabs">
          {NAV.slice(0,6).map(n=>(
            <button key={n.id} className={`mode-tab${mode===n.id?' active t-'+n.id:''}`} onClick={()=>switchMode(n.id)}>
              {n.icon} {n.label}
            </button>
          ))}
          <button className={`mode-tab${mode==='memory'?' active':''}`} onClick={()=>switchMode('memory')}>📓</button>
          <button className={`mode-tab${mode==='performance'?' active':''}`} onClick={()=>switchMode('performance')}>📈</button>
          <button className={`mode-tab${mode==='map'?' active':''}`} onClick={()=>switchMode('map')}>🗺️</button>
          <button className={`mode-tab${mode==='grammar'?' active':''}`} onClick={()=>switchMode('grammar')}>📐</button>
        </div>

        {/* Welcome back banner */}
        <AnimatePresence>
          {welcomeVisible && learner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="welcome-banner"
            >
              <span>👋</span>
              <span>
                Welcome back, <strong>{learner.name || settingsMap.user_name || 'Learner'}</strong>! Ready to continue your French journey?
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="content-area mode-panel">

          {/* ── LEARN ── */}
          {/* ── LEARN — Skill Tree (pick a unit) ── */}
          {mode==='learn' && showTree && (() => {
            const CEFR_META = {
              A1:{emoji:'🌱',name:'Foundation',    color:'#58cc02'},
              A2:{emoji:'🌿',name:'Elementary',    color:'#1cb0f6'},
              B1:{emoji:'⭐',name:'Intermediate',  color:'#a78bfa'},
              B2:{emoji:'🌟',name:'Upper-Intermed',color:'#ffd900'},
              C1:{emoji:'💎',name:'Advanced',      color:'#ff9600'},
              C2:{emoji:'🏆',name:'Mastery',       color:'#ff4b4b'},
            } as const
            return (
              <div style={{paddingBottom:64}}>
                {/* Word of the Day */}
                <WordOfTheDay />

                {/* AI Coach banner */}
                {aiCoachPlan && (
                  <div style={{padding:'16px 20px 4px'}}>
                    <div style={{background:'rgba(79,156,249,.07)',border:'1px solid rgba(79,156,249,.2)',borderRadius:14,padding:'11px 14px'}}>
                      <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:3}}>{aiCoachPlan.headline}</div>
                      <div style={{fontSize:12,color:'var(--t2)'}}>{aiCoachPlan.focus}</div>
                    </div>
                  </div>
                )}
                {/* Level Exams */}
                {missions.length > 0 && (
                  <div style={{padding:'12px 20px 0'}}>
                    <div className="skill-missions">
                      <div className="skill-missions-title">Level Exams</div>
                      {missions.map(m => (
                        <div key={m.level} className="skill-mission-row">
                          <div>
                            <div className="skill-mission-level">
                              {CEFR_META[m.level as keyof typeof CEFR_META]?.emoji} {m.level}
                              {m.completed && <span style={{color:'var(--green)',marginLeft:6}}>✓ Passed</span>}
                              {!m.completed && m.unlocked && <span style={{color:'var(--blue-b)',marginLeft:6,fontSize:11}}>Unlocked</span>}
                            </div>
                            <div className="skill-mission-sub">ELO {m.min_elo}+ · Pass {m.required_pct}%</div>
                          </div>
                          <button
                            className={`skill-mission-btn ${m.unlocked&&!m.completed?'unlocked':'locked'}`}
                            disabled={!m.unlocked||m.completed||checkpointBusy}
                            onClick={()=>startCheckpoint(m.level)}>
                            {m.completed ? '✓ Done' : 'Start Exam'}
                          </button>
                        </div>
                      ))}
                      {checkpointResult && (
                        <div className="skill-mission-result" style={{
                          background: checkpointResult.passed?'var(--green-dim)':'var(--red-dim)',
                          color:       checkpointResult.passed?'var(--green-b)':'var(--red)',
                        }}>
                          {checkpointResult.level} {checkpointResult.passed?'passed ✓':'not passed'} · {checkpointResult.score_pct}% / {checkpointResult.required_pct}%
                          <div style={{fontSize:11,fontWeight:600,color:'var(--t2)',marginTop:4}}>{checkpointResult.recommendation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* ── AI Weak-Spot Diagnosis ── */}
                {patternDiagnosis && patternDiagnosis.patterns.length > 0 && (
                  <div style={{padding:'0 20px 4px'}}>
                    <div style={{
                      background:'rgba(255,75,75,.06)',
                      border:'1.5px solid rgba(255,75,75,.22)',
                      borderRadius:16,
                      padding:'14px 16px',
                    }}>
                      <div style={{fontSize:13,fontWeight:900,color:'var(--red)',marginBottom:2}}>
                        🧠 AI Diagnosis
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>
                        {patternDiagnosis.headline}
                      </div>
                      {patternDiagnosis.patterns.map((p, i) => (
                        <div key={`pat-${i}`} style={{
                          background:'var(--surface2)',
                          border:'1px solid var(--border)',
                          borderRadius:12,
                          padding:'10px 12px',
                          marginBottom:8,
                        }}>
                          <div style={{fontSize:12,fontWeight:800,color:'var(--text)',marginBottom:3}}>
                            ⚠️ {p.tag}
                          </div>
                          <div style={{fontSize:12,color:'var(--t2)',marginBottom:4}}>{p.description}</div>
                          <div style={{fontSize:11,color:'var(--blue-b)',fontWeight:700,marginBottom:8}}>
                            💡 {p.tip}
                          </div>
                          <button
                            style={{
                              width:'100%',
                              padding:'9px 14px',
                              borderRadius:10,
                              background: generatingPractice === p.tag ? 'var(--surface2)' : 'var(--red)',
                              color:'#fff',
                              fontWeight:800,
                              fontSize:12,
                              border:'none',
                              cursor: generatingPractice ? 'not-allowed' : 'pointer',
                              opacity: generatingPractice && generatingPractice !== p.tag ? 0.5 : 1,
                              transition:'opacity .2s',
                            }}
                            disabled={!!generatingPractice}
                            onClick={() => {
                              // derive CEFR from weakest skill or default to learner's current level
                              const level = learner?.elo != null
                                ? (['A1','A2','B1','B2','C1','C2'] as const)
                                    .slice()
                                    .reverse()
                                    .find(l => (learner.elo || 800) >= CEFR_ELO[l].min) ?? 'A1'
                                : 'A1'
                              generatePracticeForPattern(p.tag, level)
                            }}
                          >
                            {generatingPractice === p.tag ? '⏳ Generating…' : '⚡ Generate Practice'}
                          </button>
                        </div>
                      ))}
                      {patternDiagnosis.overall_advice && (
                        <div style={{fontSize:11,color:'var(--t3)',marginTop:4}}>
                          {patternDiagnosis.overall_advice}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Branching skill tree by CEFR level */}
                {(['A1','A2','B1','B2','C1','C2'] as const).map(cefr => {
                  const meta      = CEFR_META[cefr]
                  const cefrUnits = course.filter(u => u.cefr === cefr)
                  if (!cefrUnits.length) return null
                  const allLocked   = cefrUnits.every(u => u.locked)
                  const activeIndex = cefrUnits.findIndex((_,i) =>
                    courseLessonIndexToUnitId(cefr, i) === currentUnitId
                  )
                  return (
                    <div key={cefr} style={{opacity: allLocked ? .32 : 1, transition:'opacity .3s'}}>
                      {/* CEFR section banner */}
                      <div style={{
                        margin: '24px 24px 14px',
                        padding: '13px 20px',
                        borderRadius: 18,
                        border: `2.5px solid ${meta.color}50`,
                        background: `${meta.color}0e`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 12,
                      }}>
                        <span style={{fontSize:'1.5rem'}}>{meta.emoji}</span>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:14,fontWeight:900,color:'#fff',letterSpacing:'.01em'}}>{meta.name}</div>
                          <div style={{fontSize:11,fontWeight:800,color:meta.color,letterSpacing:'.1em',marginTop:2}}>{cefr}</div>
                        </div>
                      </div>
                      {/* Branching nodes */}
                      <SkillTree
                        units={cefrUnits}
                        color={meta.color}
                        activeIndex={activeIndex}
                        onSelect={idx => {
                          const uid = courseLessonIndexToUnitId(cefr, idx)
                          setCurrentUnitId(uid)
                          api.saveSetting('current_unit', uid).catch(()=>{})
                          setUnitStats({answered:0, correct:0})
                          setShowTree(false)
                          resetQ(0)
                          toast.success(cefrUnits[idx].title)
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* ── DRILL (within Learn) ── */}
          {mode==='learn' && !showTree && (
            <div className="lesson-wrap">
              <div className="lesson-progress-row">
                <button className="lesson-close" onClick={()=>{ setShowTree(true); setGeneratedQuestions([]) }}>✕</button>
                <div className="lesson-prog-track">
                  <div className="lesson-prog-fill" style={{width:`${qPct}%`}}/>
                </div>
                <div className="lesson-hearts">
                  {hearts.slice(0,3).map((h,i)=><span key={i} className={`heart${h?'':' lost'}`}>❤️</span>)}
                </div>
              </div>

              <div className="lesson-body">
                <AnimatePresence mode="wait">
                <motion.div
                  key={qi}
                  initial={{opacity:0, x:24}}
                  animate={{opacity:1, x:0}}
                  exit={{opacity:0, x:-24}}
                  transition={{duration:.22, ease:[.4,0,.2,1]}}
                >
                {checkpointSession && (
                  <div style={{marginBottom:10,padding:'8px 10px',background:'var(--amber-dim)',border:'1px solid rgba(255,217,0,.45)',borderRadius:10,fontSize:12,fontWeight:800,color:'var(--amber)'}}>
                    {checkpointProgress}
                  </div>
                )}
                {/* Score chip */}
                <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--t3)',background:'var(--surface3)',padding:'3px 10px',borderRadius:99}}>
                    {score.c}/{score.t} correct
                  </span>
                  {comboStreak>=2&&<span
                    className={comboStreak>=5?'combo-fire':'combo-badge'}
                    style={{
                      fontSize: comboStreak>=10?13:11,
                      fontWeight:800,
                      color: comboStreak>=10?'#fff':comboStreak>=5?'var(--amber)':'var(--amber)',
                      background: comboStreak>=10?'linear-gradient(135deg,#ff6b00,#ffd900)':comboStreak>=5?'rgba(255,217,0,.22)':'var(--amber-dim)',
                      padding: comboStreak>=10?'4px 14px':'3px 10px',
                      borderRadius:99,
                      boxShadow: comboStreak>=5?'0 0 12px rgba(255,217,0,.4)':'none',
                      border: comboStreak>=5?'1px solid rgba(255,217,0,.5)':'none',
                    }}>
                    {comboStreak>=10?'🏆':comboStreak>=5?'🔥':'⚡'} {comboStreak}x combo
                  </span>}
                  {mistakes.length>0&&<span style={{fontSize:11,fontWeight:700,color:'var(--red)',background:'var(--red-dim)',padding:'3px 10px',borderRadius:99}}>
                    ⚠️ {mistakes.length} to review
                  </span>}
                  <span style={{fontSize:11,fontWeight:700,color:'var(--blue-b)',background:'rgba(79,156,249,.12)',padding:'3px 10px',borderRadius:99}}>
                    Session XP {sessionXp}
                  </span>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--purple)',background:'rgba(167,139,250,.14)',padding:'3px 10px',borderRadius:99}}>
                    Multiplier {comboMult.toFixed(1)}x
                  </span>
                </div>

                <div style={{marginBottom:14,padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--amber)',marginBottom:8}}>
                    Daily Quests
                  </div>
                  <div style={{display:'grid',gap:7}}>
                    {dailyQuests.map(qs => {
                      const pct = Math.round((qs.progress / qs.goal) * 100)
                      return (
                        <div key={qs.id}>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--t2)',marginBottom:3}}>
                            <span>{qs.label}</span><span>{qs.progress}/{qs.goal}</span>
                          </div>
                          <div style={{height:6,background:'var(--surface3)',borderRadius:99,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,var(--amber),#ff9600)',borderRadius:99}} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Adaptive coach */}
                {adaptive && (
                  <div style={{marginBottom:14,padding:'10px 12px',background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.22)',borderRadius:12}}>
                    <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--blue-b)',marginBottom:5}}>
                      AI Coach
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>
                      Mastery {adaptive.mastery_score}% · Streak {adaptive.streak}
                    </div>
                    <div style={{fontSize:12,color:'var(--t2)'}}>
                      {adaptive.recommendation}
                    </div>
                    {c1Status && (
                      <div style={{marginTop:8,fontSize:12,color:'var(--t2)'}}>
                        C1 path: {c1Status.pct_to_c1}% ({c1Status.elo}/{c1Status.target_elo}) {c1Status.readiness ? '• Ready for C1 checkpoint' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* MCQ */}
                {q.type==='mcq' && <>
                  <div className="q-label">Choose the correct answer</div>
                  <div className="q-prompt"><WordHints text={q.prompt} pair={hintPair} /></div>
                  <div className="options single-col">
                    {(q as any).options.map((opt:string,i:number)=>{
                      const isAns = opt===(q as any).answer
                      let cls=''
                      if(answered&&opt===(q as any).answer) cls='correct'
                      else if(answered&&!correct&&i===(q as any).options.indexOf(opt)&&opt!==(q as any).answer) cls=''
                      return <button key={i} className={`opt ${cls}`} onClick={()=>submitAnswer(opt)} disabled={answered}>
                        <span className="opt-letter">{['A','B','C','D'][i]}</span><WordHints text={opt} pair={hintPair} />
                      </button>
                    })}
                  </div>
                </>}

                {/* ARRANGE */}
                {q.type==='arrange' && <>
                  <div className="q-label">Arrange the words</div>
                  <div className="q-prompt"><WordHints text={q.prompt} pair={hintPair} /></div>

                  {/* Drop zone */}
                  <div className={`drop-zone${arranged.length>0?' has-words':''}${answered?(correct?' correct':' wrong'):''}`}>
                    {arranged.length===0
                      ? <span className="drop-zone-placeholder">Tap words below to build the sentence…</span>
                      : arranged.map((w,i)=>(
                          <button key={`arr-${i}-${w}`}
                            className={`word-tile placed${answered?(correct?' correct-tile':' wrong-tile'):''}`}
                            onClick={()=>tapArranged(w,i)}
                            disabled={answered}>
                            <WordHints text={w} pair={hintPair} />
                          </button>
                        ))
                    }
                  </div>

                  {/* Word bank */}
                  <div className="word-bank">
                    {available.map((w,i)=>(
                      <button key={`avail-${i}-${w}`}
                        className="word-tile"
                        onClick={()=>tapAvail(w,i)}
                        disabled={answered}>
                        <WordHints text={w} pair={hintPair} />
                      </button>
                    ))}
                  </div>

                  {!answered && (
                    <button
                      className={`check-btn ${arranged.length>0?'ready':'default'}`}
                      onClick={()=>arranged.length>0 && submitAnswer(arranged.join(' '))}
                      disabled={arranged.length===0}>
                      Check
                    </button>
                  )}
                </>}

                {/* LISTEN */}
                {q.type==='listen' && <>
                  <div className="q-label">Listen and type what you hear</div>
                  {(q as { audioText?: string }).audioText ? (
                    <div className="q-prompt" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>
                        Hover words for English (reference)
                      </span>
                      <WordHints text={(q as { audioText: string }).audioText} pair="fr|en" />
                    </div>
                  ) : null}
                  <div style={{display:'flex',justifyContent:'center',margin:'16px 0 20px'}}>
                    <button onClick={()=>playAudio((q as any).audioText)}
                      style={{width:80,height:80,borderRadius:'50%',background:speaking?'var(--green-dim)':'var(--blue-dim)',border:`3px solid ${speaking?'var(--green)':'var(--blue)'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s',boxShadow:`0 0 20px ${speaking?'var(--green-glow)':'var(--blue-glow)'}`,fontSize:'2rem'}}>
                      {speaking?'🔊':'▶️'}
                    </button>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--t3)',textAlign:'center',marginBottom:16}}>
                    Tap to play · Can replay as many times as needed
                  </div>
                  <input
                    className={`answer-input${answered?(correct?' correct':' wrong'):''}`}
                    value={listenInput}
                    onChange={e=>setListenInput(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&!answered&&submitAnswer(listenInput)}
                    placeholder="Type what you heard…"
                    disabled={answered}
                    autoComplete="off" autoCorrect="off"
                  />
                  {!answered&&<button className={`check-btn ${listenInput.trim()?'ready':'default'}`}
                    onClick={()=>submitAnswer(listenInput)} disabled={!listenInput.trim()}>
                    Check
                  </button>}
                  {answered&&!correct&&<div style={{fontSize:14,fontWeight:600,color:'var(--t2)',padding:'8px 0'}}>
                    <strong style={{color:'var(--text)'}}>Correct answer:</strong>{' '}
                    <WordHints text={(q as any).answer} pair={hintPair} />
                  </div>}
                </>}

                {/* TRANSLATE */}
                {q.type==='translate' && <>
                  <div className="q-label">
                    {(q as any).direction==='en-fr'?'🇬🇧 Translate to French':'🇫🇷 Translate to English'}
                  </div>
                  <div className="q-prompt"><WordHints text={q.prompt} pair={hintPair} /></div>
                  <input
                    className={`answer-input${answered?(correct?' correct':' wrong'):''}`}
                    value={transInput}
                    onChange={e=>setTransInput(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&!answered&&submitAnswer(transInput)}
                    placeholder={(q as any).direction==='en-fr'?'Type in French…':'Type in English…'}
                    disabled={answered}
                    autoComplete="off" autoCorrect="off"
                  />
                  {!answered&&<button className={`check-btn ${transInput.trim()?'ready':'default'}`}
                    onClick={()=>submitAnswer(transInput)} disabled={!transInput.trim()}>
                    Check
                  </button>}
                  {answered&&!correct&&<div style={{fontSize:14,fontWeight:600,color:'var(--t2)',padding:'8px 0'}}>
                    <strong style={{color:'var(--text)'}}>Answer:</strong>{' '}
                    <WordHints text={(q as any).answer} pair={hintPair} />
                  </div>}
                </>}

                {/* Animated feedback banner */}
                <AnimatePresence>
                  {answered && feedbackVisible && (
                    <motion.div
                      key={`fb-${qi}`}
                      initial={{opacity:0, y:16, scale:.97}}
                      animate={{opacity:1, y:0, scale:1}}
                      exit={{opacity:0, y:8}}
                      transition={{duration:.25, ease:[.4,0,.2,1]}}
                      className={`feedback-bar show ${correct?'correct':'wrong'}`}
                    >
                      <span className="feedback-icon">{correct?'✅':'❌'}</span>
                      <div>
                        <div className="feedback-title">{correct?'Correct! 🎉':'Not quite...'}</div>
                        {q.note&&<div className="feedback-body">{q.note}</div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fast AI correction for arrange mistakes */}
                {answered && !correct && (
                  <div style={{marginTop:10,padding:'12px 14px',background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.25)',borderRadius:12}}>
                    <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:6}}>AI quick correction</div>
                    {arrangeAiLoading ? (
                      <div style={{fontSize:13,color:'var(--t2)'}}>Analyzing your word order...</div>
                    ) : (
                      <>
                        <div style={{fontSize:13,color:'var(--t2)',marginBottom:6}}>
                          <strong style={{color:'var(--text)'}}>Correct:</strong>{' '}
                          <WordHints text={arrangeAiFeedback?.corrected || q.answer} pair={hintPair} />
                        </div>
                        <div style={{fontSize:13,color:'var(--t2)'}}>
                          {arrangeAiFeedback?.explanation || 'French word order usually follows subject + verb + complements.'}
                        </div>
                        <div style={{fontSize:12,color:'var(--blue-b)',marginTop:6,fontWeight:700}}>
                          Next step: {arrangeAiFeedback?.next_step || 'Retry one similar sentence now.'}
                        </div>
                        <button
                          className="check-btn ready"
                          style={{marginTop:8,padding:'8px 10px',fontSize:12}}
                          onClick={() => practicePrompt(q.prompt)}
                        >
                          Retry Similar Prompt
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Continue */}
                {answered&&<button className={`check-btn ${correct?'continue':'wrong-continue'}`} onClick={()=>{setFeedbackVisible(false);nextQ()}} style={{marginTop:8}}>
                  Continue
                </button>}
                </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* map tab → redirect to learn skill tree */}
          {mode==="map" && (() => { switchMode("learn"); return null })()}

          {/* ── GRAMMAR REFERENCE ── */}
          {mode==='grammar' && (
            <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
              {/* Header + search */}
              <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
                <div style={{fontSize:'1.1rem',fontWeight:800,marginBottom:10}}>📐 Grammar Reference</div>
                <input
                  value={gramSearch}
                  onChange={e=>setGramSearch(e.target.value)}
                  placeholder="Search rules, examples, verbs…"
                  style={{width:'100%',background:'var(--surface2)',border:'2px solid var(--border2)',borderRadius:12,color:'var(--text)',fontFamily:'var(--font)',fontSize:14,fontWeight:600,padding:'10px 14px',outline:'none',marginBottom:10}}
                  onFocus={e=>(e.target.style.borderColor='var(--blue)')}
                  onBlur={e=>(e.target.style.borderColor='var(--border2)')}
                />
                {/* Filter pills */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['All',...CEFR_LEVELS,...CATEGORIES].map(f=>(
                    <button key={f} onClick={()=>setGramFilter(f)}
                      style={{padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1.5px solid',cursor:'pointer',fontFamily:'var(--font)',
                        background:gramFilter===f?'var(--blue)':'transparent',
                        borderColor:gramFilter===f?'var(--blue)':'var(--border2)',
                        color:gramFilter===f?'#fff':'var(--t2)',
                        transition:'all .15s'}}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules list */}
              <div style={{flex:1,overflowY:'auto',padding:'12px 20px'}}>
                {filteredGrammar.length===0&&(
                  <div style={{textAlign:'center',padding:'40px 20px',color:'var(--t3)',fontSize:14,fontWeight:600}}>
                    No results for "{gramSearch}"
                  </div>
                )}
                {filteredGrammar.map(rule=>(
                  <div key={rule.id} style={{marginBottom:10,border:`1.5px solid ${gramExpand===rule.id?'var(--blue)':'var(--border)'}`,borderRadius:14,overflow:'hidden',transition:'border-color .2s',cursor:'pointer'}}
                       onClick={()=>setGramExpand(gramExpand===rule.id?null:rule.id)}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:gramExpand===rule.id?'var(--blue-dim)':'var(--surface)'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                          <span style={{fontSize:14,fontWeight:800}}>{rule.title}</span>
                          <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:99,
                            background:'var(--surface3)',color:'var(--t2)',border:'1px solid var(--border)'}}>
                            {rule.cefr}
                          </span>
                          <span style={{fontSize:10,fontWeight:700,color:'var(--t3)'}}>
                            {rule.category}
                          </span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{rule.summary}</div>
                      </div>
                      <div style={{fontSize:16,color:'var(--t3)',transform:gramExpand===rule.id?'rotate(90deg)':'none',transition:'transform .2s'}}>›</div>
                    </div>

                    {/* Expanded content */}
                    {gramExpand===rule.id&&(
                      <div style={{padding:'14px 16px',borderTop:'1px solid var(--border)',background:'var(--surface2)'}}>
                        {rule.examples.map((ex,i)=>(
                          <div key={i} style={{marginBottom:12,padding:'10px 14px',background:'var(--surface3)',borderRadius:10}}>
                            <div style={{fontSize:15,fontWeight:800,color:'var(--blue-b)',marginBottom:3}}>{ex.fr}</div>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{ex.en}</div>
                            {ex.note&&<div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginTop:4,fontStyle:'italic'}}>{ex.note}</div>}
                          </div>
                        ))}
                        {rule.tip&&(
                          <div style={{background:'rgba(79,156,249,.08)',border:'1.5px solid rgba(79,156,249,.2)',borderRadius:10,padding:'10px 14px',marginTop:4}}>
                            <div style={{fontSize:11,fontWeight:800,color:'var(--blue-b)',marginBottom:4}}>💡 PRO TIP</div>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{rule.tip}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {mode==='chat' && (
            <div className="chat-wrap">
              <div className="chat-main">
                <div className="chat-header">✍️ AI Tutor — français uniquement</div>
                <div className="chat-msgs">
                  {chatMsgs.length===0&&!streaming&&(
                    <div style={{textAlign:'center',padding:'40px 20px',color:'var(--t3)'}}>
                      <div style={{fontSize:'2rem',marginBottom:12}}>✍️</div>
                      <div style={{fontSize:14,fontWeight:600,lineHeight:1.7}}>Voltaire répond toujours en français.<br/>Conversation, questions et corrections — écris en français autant que possible.</div>
                      <button className="btn btn-primary" style={{marginTop:20}} onClick={initChat}>Start Lesson</button>
                    </div>
                  )}
                  {chatMsgs.map((m,i)=> m.role==='assistant'?(
                    <div key={i} className="chat-row">
                      <div className="chat-av v">✍️</div>
                      <div className="chat-bub v md">
                        <div className="chat-who v">Voltaire</div>
                        {m.text===''?<Dots/>:<span dangerouslySetInnerHTML={{__html:md(m.text)}}/>}
                      </div>
                    </div>
                  ):(
                    <div key={i} className="fadeUp">
                      <div className="chat-bub u"><div className="chat-who u">You</div>{m.text}</div>
                    </div>
                  ))}
                  <div ref={chatBottomRef}/>
                </div>
                <div className="chat-input-wrap">
                  <div className="chat-input-row">
                    <input className="chat-input" value={chatIn} onChange={e=>setChatIn(e.target.value)}
                           onKeyDown={e=>e.key==='Enter'&&sendChat()}
                           placeholder="Écris en français… (Entrée)"
                           disabled={streaming}/>
                    <button className="send-btn" onClick={sendChat} disabled={streaming}>
                      {streaming?<div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>:'→'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MATHIEU ── */}
          {mode==='mathieu' && (
            <div className="chat-wrap">
              <div className="chat-main">
                <div className="chat-header">☕ Chez Mathieu — Canal Saint-Martin</div>
                <div className="chat-msgs">
                  {mBusy&&mMsgs.length===0&&<div className="chat-row"><div className="chat-av m">☕</div><div className="chat-bub m"><Dots color="var(--purple)"/></div></div>}
                  {mMsgs.map((m,i)=>m.role==='assistant'?(
                    <div key={i} className="chat-row">
                      <div className="chat-av m">☕</div>
                      <div className="chat-bub m md"><div className="chat-who m">Mathieu</div><span dangerouslySetInnerHTML={{__html:md(m.text)}}/></div>
                    </div>
                  ):(
                    <div key={i} className="fadeUp"><div className="chat-bub u"><div className="chat-who u">You</div>{m.text}</div></div>
                  ))}
                  <div ref={mBottomRef}/>
                </div>
                <div className="chat-input-wrap">
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>
                    😄 <span style={{color:'var(--green)'}}>{mInfo.mood}</span>
                    {mInfo.special&&<> · <span style={{color:'var(--purple)'}}>{mInfo.special}</span></>}
                  </div>
                  <div className="chat-input-row">
                    <input className="chat-input" value={mIn} onChange={e=>setMIn(e.target.value)}
                           onKeyDown={e=>e.key==='Enter'&&sendMathieu()} placeholder="Parlez à Mathieu en français…" disabled={mBusy}/>
                    <button className="send-btn" onClick={sendMathieu} disabled={mBusy}>→</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VOICE ── */}
          {mode==='voice' && <VoiceMode/>}

          {/* ── STORIES ── */}
          {mode==='stories' && (
            <div style={{height:'100%',overflowY:'auto'}}>
              {storySession ? (
                <StoryPlayer
                  detail={storySession}
                  onClose={() => { setStorySession(null); void refreshStoriesList() }}
                  onCompleted={() => { void refreshStoriesList() }}
                />
              ) : (
                <>
                  <div style={{padding:'20px 20px 10px'}}>
                    <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:3}}>📚 Paris Immersion</div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--t3)'}}>Dialogues + quiz — Babbel-style scenarios</div>
                  </div>
                  <div className="cards-grid">
                    {(stories.length ? stories : []).map((s)=>(
                      <div key={s.id} className={`story-card${!s.unlocked?' locked':''}`}>
                        <div className="s-emoji">{s.emoji || '📚'}</div>
                        <div className="s-title">{s.title_fr}</div>
                        <div className="s-sub">{s.title_en}</div>
                        <span className="s-badge">{s.cefr}</span>
                        {(s.progress?.score ?? 0) > 0 && <div className="s-done">✓ Best: {s.progress?.score}%</div>}
                        {!s.unlocked&&<div className="s-lock">🔒 ELO for {s.cefr}</div>}
                        {s.unlocked&&<button type="button" className="s-btn" onClick={()=>void openStoryCard(s)}>
                          {(s.progress?.attempts||0)>0?'▶ Replay':'▶ Start'}
                        </button>}
                      </div>
                    ))}
                    {stories.length === 0 && (
                      <motion.div
                        initial={{opacity:0,y:10}}
                        animate={{opacity:1,y:0}}
                        style={{
                          gridColumn:'1/-1',padding:'40px 20px',textAlign:'center',
                          display:'flex',flexDirection:'column',alignItems:'center',gap:12,
                        }}
                      >
                        <div style={{fontSize:'3rem'}}>📚</div>
                        <div style={{fontSize:16,fontWeight:800,color:'var(--text)'}}>No stories yet</div>
                        <div style={{fontSize:13,color:'var(--t3)',lineHeight:1.65,maxWidth:280}}>
                          Stories load from your backend. Make sure the server is running and you've completed some lessons to unlock them.
                        </div>
                        <button className="ph-btn" onClick={()=>void refreshStoriesList()} style={{marginTop:4}}>
                          Refresh Stories
                        </button>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── REVIEW ── */}
          {mode==='review' && (
            <div style={{height:'100%',overflowY:'auto',padding:'20px'}}>
              <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:4}}>🔁 Smart Review</div>
              <div style={{fontSize:13,color:'var(--t3)',marginBottom:14}}>
                Personalized recovery path from your weak skills.
              </div>
              {aiCoachPlan && (
                <div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.22)',borderRadius:12,padding:'10px 12px',marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:4}}>{aiCoachPlan.headline}</div>
                  <div style={{fontSize:12,color:'var(--t2)',marginBottom:6}}>{aiCoachPlan.focus}</div>
                  {aiCoachPlan.blocks.map((b, i) => (
                    <div key={`rb-${i}`} style={{fontSize:12,color:'var(--t2)'}}>• {b}</div>
                  ))}
                </div>
              )}
              {adaptive && (
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>
                    Mastery {adaptive.mastery_score}% · Streak {adaptive.streak}
                  </div>
                  <div style={{fontSize:12,color:'var(--t2)'}}>{adaptive.recommendation}</div>
                </div>
              )}
              {nextBestLesson && (
                <div style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:6}}>What next (adaptive)</div>
                  <div style={{fontSize:12,color:'var(--t2)'}}>
                    {nextBestLesson.cefr} {nextBestLesson.recommended_q_type} ({nextBestLesson.focus_skill})
                  </div>
                  {nextBestLesson.recommended_prompt && (
                    <button className="check-btn ready" style={{padding:'10px 12px',marginTop:8}} onClick={()=>practicePrompt(nextBestLesson!.recommended_prompt)}>
                      Practice recommended prompt
                    </button>
                  )}
                </div>
              )}
              <div style={{display:'grid',gap:10}}>
                {weakSkills.length > 0 && (
                  <div style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                    <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:6}}>Weak skills</div>
                    {weakSkills.map((w, i) => (
                      <div key={`${w.skill_tag}-${i}`} style={{fontSize:12,color:'var(--t2)'}}>
                        • {w.skill_tag}: {Math.round(w.error_rate * 100)}% error over {w.attempts} attempts
                      </div>
                    ))}
                  </div>
                )}
                {(adaptive?.focus_prompts || []).length === 0 && (
                  <div style={{fontSize:13,color:'var(--t2)',padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                    No weak prompts detected yet. Do a few Learn questions and this panel will auto-curate.
                  </div>
                )}
                {(adaptive?.focus_prompts || []).map((f, i) => (
                  <div key={`${f.prompt}-${i}`} style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{f.prompt}</div>
                    <div style={{fontSize:12,color:'var(--t2)',margin:'4px 0 8px'}}>
                      {f.q_type} · error rate {Math.round(f.error_rate * 100)}% · attempts {f.attempts}
                    </div>
                    <button className="check-btn ready" style={{padding:'10px 12px'}} onClick={()=>practicePrompt(f.prompt)}>
                      Practice This Weak Spot
                    </button>
                  </div>
                ))}
                {reviewQueue.map((r, i) => (
                  <div key={`${r.prompt}-rq-${i}`} style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{r.prompt}</div>
                    <div style={{fontSize:12,color:'var(--t2)',margin:'4px 0 8px'}}>
                      {r.skill_tag} · {r.q_type} · error rate {Math.round(r.error_rate * 100)}%
                    </div>
                    <button className="check-btn ready" style={{padding:'10px 12px'}} onClick={()=>practicePrompt(r.prompt)}>
                      Start Recommended Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'memory' && <MemoryLog />}

          {/* ── LEADERBOARD ── */}
          {mode === 'leaderboard' && <Leaderboard />}

          {/* ── PERFORMANCE ── */}
          {mode === 'performance' && (
            <div style={{padding:'18px 20px',height:'100%',overflowY:'auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <div style={{fontSize:'1.15rem',fontWeight:900}}>📈 Performance</div>
                  <div style={{fontSize:12,color:'var(--t3)'}}>Last {performanceSummary?.days ?? performanceDays} days</div>
                </div>
                <button
                  className="check-btn ready"
                  style={{padding:'8px 10px',fontSize:12}}
                  onClick={()=>api.getPerformanceSummary(performanceDays).then(setPerformanceSummary).catch(()=>toast.error('Could not refresh performance data'))}
                >
                  Refresh
                </button>
              </div>

              <div style={{display:'flex',gap:8,marginBottom:12}}>
                {([7, 14, 30] as const).map(d => (
                  <button
                    key={d}
                    className="check-btn"
                    style={{
                      padding:'7px 10px',
                      fontSize:12,
                      background: performanceDays === d ? 'var(--blue-dim)' : 'var(--surface2)',
                      borderColor: performanceDays === d ? 'var(--blue)' : 'var(--border)',
                    }}
                    onClick={() => setPerformanceDays(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10,marginBottom:14}}>
                <div className="stat-card">
                  <div className="stat-card-label">Attempts</div>
                  <div className="stat-card-value">{performanceSummary?.attempts ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Accuracy</div>
                  <div className="stat-card-value" style={{color:'var(--green-b)'}}>
                    {Math.round((performanceSummary?.accuracy ?? 0) * 100)}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Drill logs</div>
                  <div className="stat-card-value">{performanceSummary?.by_source?.drill ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Checkpoint logs</div>
                  <div className="stat-card-value">{performanceSummary?.by_source?.checkpoint ?? 0}</div>
                </div>
              </div>

              <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:800,color:'var(--t3)',marginBottom:8}}>Accuracy trend (last 30 days)</div>
                {!(performanceTrend?.points?.length) ? (
                  <div style={{fontSize:12,color:'var(--t3)'}}>Not enough trend data yet.</div>
                ) : (
                  <div style={{display:'flex',alignItems:'end',gap:4,height:86}}>
                    {performanceTrend.points.slice(-30).map((p, i) => {
                      const h = Math.max(8, Math.round(p.accuracy * 80))
                      return (
                        <div key={`${p.day}-${i}`} title={`${p.day} · ${Math.round(p.accuracy * 100)}% · ${p.attempts} attempts`} style={{flex:1,minWidth:3}}>
                          <div style={{height:h,background:'linear-gradient(180deg,var(--blue),var(--purple))',borderRadius:4,opacity:p.attempts > 0 ? 0.95 : 0.35}} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.22)',borderRadius:12,padding:'10px 12px',marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--blue-b)',marginBottom:4}}>
                  Coach Insight
                </div>
                <div style={{fontSize:13,color:'var(--t2)'}}>
                  {performanceInsight(performanceSummary)}
                </div>
              </div>

              <div style={{display:'grid',gap:10}}>
                {(performanceSummary?.by_type || []).length === 0 && (
                  <div style={{fontSize:13,color:'var(--t3)'}}>No performance data yet. Complete a few drills first.</div>
                )}
                {(performanceSummary?.by_type || []).map((t, i) => (
                  <div key={`${t.q_type}-${i}`} style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontSize:14,fontWeight:800,color:'var(--text)'}}>{t.q_type.toUpperCase()}</div>
                      <div style={{fontSize:12,color:'var(--t2)'}}>{t.attempts} attempts</div>
                    </div>
                    <div style={{marginTop:6,fontSize:12,color:'var(--t2)'}}>
                      Accuracy: <strong style={{color:'var(--text)'}}>{Math.round(t.accuracy * 100)}%</strong> · Avg response: <strong style={{color:'var(--text)'}}>{Math.round(t.avg_response_ms / 100) / 10}s</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {mode==='settings' && (
            <div style={{height:'100%',overflowY:'auto',padding:'20px'}}>
              <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:2}}>⚙️ Settings</div>
              <div style={{fontSize:13,color:'var(--t3)',marginBottom:20}}>
                Your profile, stats, and tutor preferences.
              </div>

              {/* ── Stats overview grid ── */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12,marginBottom:24,maxWidth:560}}>
                <div className="stat-card">
                  <div className="stat-card-label">ELO Rating</div>
                  <div className="stat-card-value" style={{color:'var(--blue-b)'}}>{elo}</div>
                  <div className="stat-card-sub">Language level</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">CEFR Level</div>
                  <div className="stat-card-value" style={{color:'var(--green-b)'}}>
                    {(['C2','C1','B2','B1','A2','A1'] as const).find(l => elo >= CEFR_ELO[l].min) || 'A1'}
                  </div>
                  <div className="stat-card-sub">Current standing</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Total XP</div>
                  <div className="stat-card-value" style={{color:'var(--amber)'}}>{learner?.xp || 0}</div>
                  <div className="stat-card-sub">Points earned</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Streak</div>
                  <div className="stat-card-value" style={{color:'var(--amber)'}}>
                    {curStreak > 0 ? `${curStreak}🔥` : `0`}
                  </div>
                  <div className="stat-card-sub">Days in a row</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Lessons Done</div>
                  <div className="stat-card-value">{learner?.xp ? Math.floor(learner.xp / 10) : 0}</div>
                  <div className="stat-card-sub">Est. completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Today XP</div>
                  <div className="stat-card-value" style={{color:'var(--green-b)'}}>{xpToday}</div>
                  <div className="stat-card-sub">of {xpGoal} goal</div>
                </div>
              </div>

              {/* ── CEFR progress bar ── */}
              {c1Status && (
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',marginBottom:16,maxWidth:560}}>
                  <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:8}}>Path to C1 — {c1Status.pct_to_c1}%</div>
                  <div style={{height:8,background:'var(--surface3)',borderRadius:99,overflow:'hidden',marginBottom:8}}>
                    <motion.div
                      initial={{width:0}}
                      animate={{width:`${c1Status.pct_to_c1}%`}}
                      transition={{duration:.8,ease:[.4,0,.2,1]}}
                      style={{height:'100%',background:'linear-gradient(90deg,var(--blue),var(--purple))',borderRadius:99}}
                    />
                  </div>
                  <div style={{fontSize:12,color:'var(--t2)'}}>{c1Status.recommendation}</div>
                </div>
              )}

              <div style={{display:'grid',gap:14,maxWidth:560}}>
                {/* Display name */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Display name</div>
                  <input className="chat-input" value={settingsMap.user_name || learner?.name || ''} onChange={e=>setSettingsMap(p=>({...p,user_name:e.target.value}))} placeholder="Your name" />
                  <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings} onClick={()=>saveSetting('user_name', settingsMap.user_name || learner?.name || 'Learner')}>
                    Save Name
                  </button>
                </div>

                {/* Daily XP goal */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Daily XP goal</div>
                  <input className="chat-input" type="number" value={settingsMap.daily_goal_xp || String(streak?.daily_goal_xp || 50)} onChange={e=>setSettingsMap(p=>({...p,daily_goal_xp:e.target.value.replace(/[^0-9]/g,'')}))} placeholder="50" />
                  <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings} onClick={()=>saveSetting('daily_goal_xp', settingsMap.daily_goal_xp || '50')}>
                    Save Goal
                  </button>
                </div>

                {/* C2 status */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:4}}>C2 mastery progress</div>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>
                    {c2Status ? `${c2Status.elo} / ${c2Status.target_elo} ELO (${c2Status.pct_to_c2}%)` : 'Loading...'}
                  </div>
                  <div style={{height:6,background:'var(--surface3)',borderRadius:99,overflow:'hidden',marginBottom:8}}>
                    {c2Status && (
                      <div style={{height:'100%',width:`${c2Status.pct_to_c2}%`,background:'linear-gradient(90deg,var(--amber),#ff9600)',borderRadius:99}}/>
                    )}
                  </div>
                  <div style={{fontSize:12,color:'var(--t2)'}}>{c2Status?.recommendation || 'Build consistency and long streaks.'}</div>
                </div>

                {/* Difficulty + Strictness + Audio speed in one row */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Difficulty (0-100)</div>
                    <input className="chat-input" value={settingsMap.difficulty_bias || '50'} onChange={e=>setSettingsMap(p=>({...p,difficulty_bias:e.target.value.replace(/[^0-9]/g,'')}))} style={{marginBottom:8}} />
                    <button className="check-btn ready" style={{padding:'9px 10px',fontSize:13}} disabled={savingSettings} onClick={()=>saveSetting('difficulty_bias', settingsMap.difficulty_bias || '50')}>
                      Save
                    </button>
                  </div>
                  <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Audio speed</div>
                    <input className="chat-input" value={settingsMap.audio_speed || '0.85'} onChange={e=>setSettingsMap(p=>({...p,audio_speed:e.target.value.replace(/[^0-9.]/g,'')}))} style={{marginBottom:8}} />
                    <button className="check-btn ready" style={{padding:'9px 10px',fontSize:13}} disabled={savingSettings} onClick={()=>saveSetting('audio_speed', settingsMap.audio_speed || '0.85')}>
                      Save
                    </button>
                  </div>
                </div>

                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Correction strictness</div>
                  <select
                    className="chat-input"
                    value={settingsMap.correction_strictness || 'medium'}
                    onChange={e=>setSettingsMap(p=>({...p,correction_strictness:e.target.value}))}
                    style={{marginBottom:8,cursor:'pointer'}}
                  >
                    <option value="low">Low — Lenient grading</option>
                    <option value="medium">Medium — Balanced (recommended)</option>
                    <option value="high">High — Strict grading</option>
                  </select>
                  <button className="check-btn ready" style={{padding:'10px 12px'}} disabled={savingSettings} onClick={()=>saveSetting('correction_strictness', settingsMap.correction_strictness || 'medium')}>
                    Save Strictness
                  </button>
                </div>

                {/* ── Light / Dark mode toggle ── */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Appearance</div>
                  <button
                    className="theme-toggle-btn"
                    onClick={() => setLightMode(m => !m)}
                  >
                    {lightMode ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
                  </button>
                </div>

                {/* ── Keyboard shortcuts info ── */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Keyboard Shortcuts</div>
                  <button
                    className="theme-toggle-btn"
                    onClick={() => setShowShortcuts(true)}
                  >
                    ⌨️ View Shortcuts <span style={{fontSize:11,color:'var(--t3)',marginLeft:4}}>(press ?)</span>
                  </button>
                </div>

                {/* ── Adaptive mastery debug ── */}
                <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>Adaptive mastery engine</div>
                  <div style={{fontSize:13,color:'var(--t2)',marginBottom:10}}>
                    Tracked skills: <strong style={{color:'var(--text)'}}>{masteryStats().count}</strong> · Avg mastery: <strong style={{color:'var(--text)'}}>{Math.round(masteryStats().avg * 100)}%</strong> · Unsaved updates: <strong style={{color:'var(--text)'}}>{masteryDirtyRef.current}</strong>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <button className="check-btn ready" style={{padding:'9px 10px',fontSize:13}} onClick={flushMasteryNow}>
                      Save Mastery Now
                    </button>
                    <button
                      className="check-btn"
                      style={{padding:'9px 10px',fontSize:13,borderColor:'rgba(255,75,75,.4)',color:'var(--red)'}}
                      onClick={resetMasteryNow}
                    >
                      Reset Mastery
                    </button>
                  </div>
                </div>

                {/* ── Danger zone: reset progress ── */}
                <div style={{background:'rgba(255,75,75,.06)',border:'1.5px solid rgba(255,75,75,.25)',borderRadius:14,padding:16}}>
                  <div style={{fontSize:13,fontWeight:900,color:'var(--red)',marginBottom:4}}>⚠️ Danger Zone</div>
                  <div style={{fontSize:13,color:'var(--t2)',marginBottom:14,lineHeight:1.55}}>
                    Reset all progress — XP, streak, and ELO will be wiped. This cannot be undone.
                  </div>
                  {!showResetConfirm ? (
                    <button
                      onClick={()=>setShowResetConfirm(true)}
                      style={{
                        background:'transparent',border:'2px solid var(--red)',borderRadius:10,
                        color:'var(--red)',fontFamily:'var(--font)',fontSize:13,fontWeight:800,
                        padding:'10px 20px',cursor:'pointer',transition:'all .15s',
                      }}
                      onMouseEnter={e=>{(e.target as HTMLButtonElement).style.background='var(--red)';(e.target as HTMLButtonElement).style.color='#fff'}}
                      onMouseLeave={e=>{(e.target as HTMLButtonElement).style.background='transparent';(e.target as HTMLButtonElement).style.color='var(--red)'}}
                    >
                      Reset All Progress
                    </button>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <div style={{fontSize:13,fontWeight:800,color:'var(--red)'}}>
                        Are you absolutely sure? This is irreversible.
                      </div>
                      <div style={{display:'flex',gap:10}}>
                        <button
                          onClick={async()=>{
                            try {
                              await api.saveSetting('_reset_progress','1')
                              toast.success('Progress reset. Reload the page.')
                              setShowResetConfirm(false)
                            } catch {
                              toast.error('Could not reset — check backend.')
                              setShowResetConfirm(false)
                            }
                          }}
                          style={{flex:1,background:'var(--red)',border:'none',borderRadius:10,color:'#fff',fontFamily:'var(--font)',fontSize:13,fontWeight:800,padding:'10px 16px',cursor:'pointer'}}
                        >
                          Yes, Reset Everything
                        </button>
                        <button
                          onClick={()=>setShowResetConfirm(false)}
                          style={{flex:1,background:'var(--surface3)',border:'1px solid var(--border2)',borderRadius:10,color:'var(--t2)',fontFamily:'var(--font)',fontSize:13,fontWeight:700,padding:'10px 16px',cursor:'pointer'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        <div className="bnav-inner">
          {NAV.slice(0,5).map(n=>(
            <button key={n.id} className={`nav-item${mode===n.id?' active':''}`} onClick={()=>switchMode(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
