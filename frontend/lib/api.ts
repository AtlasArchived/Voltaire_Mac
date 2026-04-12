/**
 * lib/api.ts
 * Voltaire — Typed API client
 * All calls go through here. Backend runs on :8000, proxied by Next.js.
 */

const BASE = '/api'
const REQUEST_TIMEOUT_MS = 15000

async function withTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('Request timed out. Please retry.')
    throw err
  } finally {
    clearTimeout(id)
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await withTimeout(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await withTimeout(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

async function del<T>(path: string): Promise<T> {
  const res = await withTimeout(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Learner {
  name: string
  elo:  number
  xp:   number
  unit: number
}

export interface StreakState {
  current_streak:  number
  longest_streak:  number
  xp_today:        number
  daily_goal_xp:   number
  goal_pct:        number
  streak_freezes:  number
  weekly:          { date: string; xp: number; label: string }[]
}

export interface LessonState {
  cefr:          string
  grammar:       string
  theme:         string
  skill:         string
  lesson_count:  number
  last_summary:  string
  needs_review:  string[]
  elo:           number
}

export interface Message {
  role:      'assistant' | 'user'
  content:   string
  annotated?: string
}

export interface LessonResponse {
  text:       string
  annotated:  string
  backend:    string
  session_id?: string
  levelup?:   string | null
}

export interface VoiceResponse {
  text:       string
  audio_b64:  string | null
  backend:    string
}

export interface WordLookup {
  french:     string
  english:    string
  note:       string | null
  is_cognate: boolean
  found:      boolean
}

export interface Story {
  id:            string
  title_fr:      string
  title_en:      string
  setting:       string
  cefr:          string
  emoji:         string
  unlocked:      boolean
  progress:      { completed?: number; score?: number; attempts?: number }
  vocab_focus:   string[]
  culture_note:  string
}

export interface StoryDetail extends Story {
  lines: {
    speaker:    string
    french:     string
    english:    string
    audio_hint: string
    glosses:    Record<string, string>
  }[]
  questions: {
    question_fr:  string
    question_en:  string
    options:      string[]
    correct:      number
    explanation:  string
  }[]
}

export interface DrillQuestion {
  q_type:     string
  french:     string
  english:    string
  prompt:     string
  answer:     string
  options:    string[]
  word_bank:  string[]
  note:       string
  audio_text: string
  cefr:       string
  theme:      string
}

export interface ArrangeFeedback {
  corrected: string
  explanation: string
}

export interface AdaptiveWeakType {
  q_type: string
  error_rate: number
  attempts: number
}

export interface AdaptiveFocusPrompt {
  prompt: string
  q_type: string
  error_rate: number
  attempts: number
}

export interface AdaptiveProfile {
  mastery_score: number
  streak: number
  weak_types: AdaptiveWeakType[]
  focus_prompts: AdaptiveFocusPrompt[]
  recommendation: string
}

export interface WeakSkillItem {
  skill_tag: string
  attempts: number
  error_rate: number
}

export interface ReviewQueueItem {
  prompt: string
  q_type: string
  skill_tag: string
  attempts: number
  error_rate: number
  age_days?: number
}

export interface AdaptiveNextLesson {
  cefr: string
  focus_skill: string
  recommended_prompt: string
  recommended_q_type: string
  reason: string
}

export interface C1Status {
  elo: number
  target_elo: number
  pct_to_c1: number
  mastery_score: number
  streak: number
  readiness: boolean
  recommendation: string
}

export interface C2Status {
  elo: number
  target_elo: number
  pct_to_c2: number
  mastery_score: number
  streak: number
  readiness: boolean
  recommendation: string
}

export interface CefrMission {
  level: string
  min_elo: number
  unlocked: boolean
  completed: boolean
  required_pct: number
}

export interface CefrCheckpoint {
  level: string
  passed: boolean
  score_pct: number
  required_pct: number
  recommendation: string
}

export interface AiMistakeFeedback {
  corrected: string
  explanation: string
  next_step: string
}

export interface AiCoachPlan {
  headline: string
  focus: string
  blocks: string[]
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  // Health
  health: () => get<{ status: string }>('/health'),

  // Learner
  getLearner:    () => get<Learner>('/learner'),
  getStreak:     () => get<StreakState>('/streak'),
  getDueCount:   () => get<{ count: number }>('/due-count'),
  getProgress:   () => get<{
    sessions: number; vocab_mastered: number;
    stories_done: number; elo_history: number[]
  }>('/progress'),

  // Lesson
  getLessonState: () => get<LessonState>('/lesson/state'),
  startLesson:    () => post<LessonResponse>('/lesson/start'),
  answerLesson:   (user_input: string, session_id?: string) =>
    post<LessonResponse>('/lesson/answer', { user_input, session_id }),

  // Streaming answer — returns a ReadableStream
  answerStream: (user_input: string, history: {role:string;text:string}[] = []) =>
    fetch(`${BASE}/lesson/answer/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_input, history }),
    }),

  // Mathieu
  getMathieuState: () => get<{ memory: Record<string, unknown>; history: Message[] }>('/mathieu/state'),
  startMathieu:    () => post<{ text: string }>('/mathieu/start'),
  chatMathieu:     (message: string) => post<{ text: string; backend: string }>('/mathieu/chat', { message }),
  clearMathieu:    () => del<{ ok: boolean }>('/mathieu/history'),

  // Voice
  voiceRespond: (transcript: string) =>
    post<VoiceResponse>('/voice/respond', { transcript }),

  // TTS — returns audio blob URL
  ttsUrl: (text: string, slow = true) =>
    `${BASE}/tts?` + new URLSearchParams({ text, slow: String(slow) }),

  tts: async (text: string, slow = true): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE}/tts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, slow }),
      })
      if (!res.ok) return null
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    } catch { return null }
  },

  // Word lookup
  lookupWord: (word: string) => get<WordLookup>(`/word/${encodeURIComponent(word)}`),

  // Review
  getReviewCards: (limit = 20) => get<{ cards: unknown[] }>(`/review/cards?limit=${limit}`),
  submitReview:   (vocab_id: number, outcome: number) =>
    post<{ elo_delta: number }>('/review/answer', { vocab_id, outcome }),

  // Drill
  getDrillQuestions: (n = 10) => get<{ questions: DrillQuestion[] }>(`/drill/questions?n=${n}`),
  getArrangeFeedback: (user_answer: string, correct_answer: string, prompt: string) =>
    post<ArrangeFeedback>('/drill/arrange-feedback', { user_answer, correct_answer, prompt }),
  getAdaptiveProfile: () => get<AdaptiveProfile>('/adaptive/profile'),
  getWeakSkillReport: () => get<{ skills: WeakSkillItem[] }>('/adaptive/weak-skill-report'),
  getReviewQueue: (limit = 10) => get<{ items: ReviewQueueItem[] }>(`/adaptive/review-queue?limit=${limit}`),
  getNextBestLesson: () => get<AdaptiveNextLesson>('/adaptive/next-best-lesson'),
  logAdaptiveEvent: (data: {
    q_type: string
    cefr?: string
    skill_tag?: string
    prompt: string
    correct: boolean
    response_ms: number
    user_answer: string
    expected_answer: string
  }) => post<{ ok: boolean }>('/adaptive/event', data),
  applyLearnProgress: (correct: boolean) =>
    post<{ ok: boolean; xp_gain: number; elo_gain: number }>('/learn/progress', { correct, mode: 'learn' }),
  getC1Status: () => get<C1Status>('/c1/status'),
  getC2Status: () => get<C2Status>('/c2/status'),
  getCefrMissions: () => get<{ missions: CefrMission[]; elo: number }>('/cefr/missions'),
  runCefrCheckpoint: (level: string, score_pct?: number) =>
    post<CefrCheckpoint>(`/cefr/checkpoint/${level}`, score_pct === undefined ? undefined : { score_pct }),
  getAiCoachPlan: () => get<AiCoachPlan>('/ai/coach-plan'),
  getAiMistakeFeedback: (data: {
    q_type: string
    cefr: string
    prompt: string
    user_answer: string
    expected_answer: string
    note?: string
  }) => post<AiMistakeFeedback>('/ai/mistake-feedback', data),

  // Stories
  getStories:       () => get<{ stories: Story[] }>('/stories'),
  getStory:         (id: string) => get<StoryDetail>(`/stories/${id}`),
  completeStory:    (id: string, score: number, total: number) =>
    post<{ ok: boolean }>(`/stories/${id}/complete?score=${score}&total=${total}`),

  // Onboarding
  getOnboardingStatus: () => get<{ onboarded: boolean }>('/onboarding/status'),
  completeOnboarding:  (data: {
    name: string; goal: string; daily_xp: number; placement_score: number
  }) => post<{ ok: boolean }>('/onboarding/complete', data),

  // Settings
  getSettings:  () => get<{ settings: Record<string, string> }>('/settings'),
  saveSetting:  (key: string, value: string) => post<{ ok: boolean }>('/settings', { key, value }),

  // Brief
  generateBrief: () => post<{ ok: boolean }>('/brief/generate'),
}

// ── Streaming helper ──────────────────────────────────────────────────────────

export async function streamLesson(
  userInput: string,
  history:   {role:string;text:string}[],
  onToken:   (token: string) => void,
  onDone:    () => void,
  onError:   (err: string) => void,
) {
  try {
    const res = await api.answerStream(userInput, history)
    if (!res.ok) { onError(`HTTP ${res.status}`); return }
    if (!res.body) { onError('No stream body'); return }

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') { onDone(); return }
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) { onError(parsed.error); return }
          if (parsed.token && typeof parsed.token === 'string') onToken(parsed.token)
        } catch { /* ignore parse errors */ }
      }
    }
    onDone()
  } catch (err) {
    onError(String(err))
  }
}
