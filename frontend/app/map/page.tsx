'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '../AppContext'
import { buildCourse, LESSON_TYPE_ICONS, LESSON_TYPE_COLORS } from '../../lib/course'
import { UNIT_META, CEFR_ELO } from '../../lib/questionBank'

function courseLessonIndexToUnitId(cefr: string, lessonIndex: number) {
  const L = cefr.toUpperCase() as any
  const units = UNIT_META.filter(u => u.cefr === L)
  if (!units.length) return UNIT_META[0]?.id ?? ''
  return units[Math.min(Math.max(0, lessonIndex), units.length - 1)].id
}

export default function MapPage() {
  const router = useRouter()
  const {
    learner, aiCoachPlan, nextBestLesson, missions, checkpointResult, checkpointBusy,
    currentUnitId, setCurrentUnitId, setUnitStats, unlockedUnits,
    startCheckpoint, resetQ,
  } = useApp()

  const elo    = learner?.elo || 800
  const course = buildCourse(elo, learner?.xp || 0)

  return (
    <div style={{height:'100%',overflowY:'auto'}}>
      <div style={{padding:'20px 20px 8px'}}>
        <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:3}}>🗺️ Course Map</div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--t3)'}}>Your path to French fluency</div>
      </div>

      {aiCoachPlan && (
        <div style={{padding:'0 20px 12px'}}>
          <div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.25)',borderRadius:12,padding:'10px 12px'}}>
            <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:4}}>{aiCoachPlan.headline}</div>
            <div style={{fontSize:12,color:'var(--t2)',marginBottom:6}}>{aiCoachPlan.focus}</div>
            <div style={{fontSize:12,color:'var(--t2)'}}>
              {aiCoachPlan.blocks.map((b, i) => <div key={`${b}-${i}`}>• {b}</div>)}
            </div>
          </div>
        </div>
      )}

      {nextBestLesson && (
        <div style={{padding:'0 20px 12px'}}>
          <div style={{background:'rgba(88,204,2,.08)',border:'1px solid rgba(88,204,2,.25)',borderRadius:12,padding:'10px 12px'}}>
            <div style={{fontSize:12,fontWeight:800,color:'var(--green)',marginBottom:4}}>Next Best Lesson</div>
            <div style={{fontSize:12,color:'var(--t2)'}}>
              {nextBestLesson.cefr} · {nextBestLesson.focus_skill} · {nextBestLesson.recommended_q_type}
            </div>
            <div style={{fontSize:12,color:'var(--t2)',marginTop:4}}>{nextBestLesson.reason}</div>
          </div>
        </div>
      )}

      <div style={{padding:'0 20px 12px'}}>
        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 12px'}}>
          <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:6}}>
            Current study unit: {currentUnitId ? currentUnitId.toUpperCase() : 'Not set'}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {unlockedUnits.map(u => (
              <button key={u.id}
                className={`check-btn ${currentUnitId===u.id?'continue':'ready'}`}
                style={{width:'auto',padding:'8px 10px'}}
                onClick={() => {
                  setCurrentUnitId(u.id)
                  setUnitStats(() => ({ answered:0, correct:0 }))
                  api_saveSetting(u.id)
                  router.push('/learn')
                  resetQ(0)
                }}>
                {u.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:'0 20px 16px'}}>
        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:14,padding:'12px 14px',marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--blue-b)',marginBottom:6}}>
            CEFR Missions
          </div>
          <div style={{display:'grid',gap:8}}>
            {missions.map(m => (
              <div key={m.level} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'8px 10px',background:'var(--surface3)',border:'1px solid var(--border)',borderRadius:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800}}>
                    {m.level} {m.completed ? '✓' : m.unlocked ? '• Unlocked' : '• Locked'}
                  </div>
                  <div style={{fontSize:11,color:'var(--t3)'}}>ELO {m.min_elo}+ · Pass score {m.required_pct}%</div>
                </div>
                <button className={`check-btn ${m.unlocked?'ready':'default'}`}
                  style={{width:'auto',padding:'8px 10px'}}
                  disabled={!m.unlocked || checkpointBusy}
                  onClick={() => startCheckpoint(m.level)}>
                  Start Exam
                </button>
              </div>
            ))}
          </div>
          {checkpointResult && (
            <div style={{marginTop:10,padding:'10px 12px',background:checkpointResult.passed?'var(--green-dim)':'var(--red-dim)',border:'1px solid var(--border2)',borderRadius:10}}>
              <div style={{fontSize:13,fontWeight:800}}>
                {checkpointResult.level} {checkpointResult.passed?'passed':'not passed'} ({checkpointResult.score_pct}% / {checkpointResult.required_pct}%)
              </div>
              <div style={{fontSize:12,color:'var(--t2)',marginTop:4}}>{checkpointResult.recommendation}</div>
            </div>
          )}
        </div>
      </div>

      {course.map((unit, ui) => (
        <div key={unit.id} style={{padding:'0 20px',marginBottom:20}}>
          <div style={{
            background: unit.locked ? 'var(--surface)' : `linear-gradient(135deg,${unit.color}22,${unit.color}11)`,
            border:`2px solid ${unit.locked?'var(--border)':unit.color}`,
            borderRadius:16,padding:'16px 18px',marginBottom:12,opacity:unit.locked?.5:1,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:'1.8rem'}}>{unit.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:'1rem',fontWeight:800}}>{unit.title}</span>
                  <span style={{fontSize:11,fontWeight:800,padding:'2px 8px',borderRadius:99,
                    background:unit.locked?'var(--surface3)':`${unit.color}33`,
                    color:unit.locked?'var(--t3)':unit.color,
                    border:`1px solid ${unit.locked?'var(--border)':unit.color}`}}>
                    {unit.cefr}
                  </span>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--t3)'}}>{unit.subtitle}</div>
              </div>
              {unit.locked && <div style={{fontSize:20}}>🔒</div>}
            </div>
            {unit.locked && (
              <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginTop:8}}>
                Unlock at ELO {unit.eloMin} · You are at {elo}
              </div>
            )}
          </div>
          {!unit.locked && (
            <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:12,borderLeft:`3px solid ${unit.color}44`}}>
              {unit.lessons.map((lesson, li) => (
                <div key={lesson.id}
                  style={{
                    display:'flex',alignItems:'center',gap:12,
                    background:lesson.locked?'var(--surface)':'var(--surface2)',
                    border:`1.5px solid ${lesson.complete?unit.color:'var(--border)'}`,
                    borderRadius:12,padding:'12px 14px',
                    opacity:lesson.locked?.45:1,
                    transition:'all .15s',cursor:lesson.locked?'not-allowed':'pointer',
                  }}
                  onClick={() => {
                    if (lesson.locked) return
                    const uid = courseLessonIndexToUnitId(unit.cefr, li)
                    setCurrentUnitId(uid)
                    api_saveSetting(uid)
                    setUnitStats(() => ({ answered:0, correct:0 }))
                    router.push('/learn')
                    resetQ(0)
                  }}>
                  <div style={{
                    width:40,height:40,borderRadius:10,flexShrink:0,
                    background:lesson.complete?unit.color:'var(--surface3)',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                    boxShadow:lesson.complete?`0 0 12px ${unit.color}66`:'none',
                  }}>
                    {lesson.locked ? '🔒' : lesson.complete ? '✓' : LESSON_TYPE_ICONS[lesson.type]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:2,color:lesson.locked?'var(--t3)':'var(--text)'}}>
                      {lesson.title}
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--t3)',display:'flex',gap:8}}>
                      <span style={{color:LESSON_TYPE_COLORS[lesson.type]}}>{lesson.type}</span>
                      <span>+{lesson.xp} XP</span>
                    </div>
                  </div>
                  {(lesson.crown ?? 0) > 0 && (
                    <div style={{fontSize:18}}>
                      {(lesson.crown ?? 0)===3?'🥇':(lesson.crown ?? 0)===2?'🥈':'🥉'}
                    </div>
                  )}
                  {!lesson.complete && !lesson.locked && <div style={{fontSize:14,color:'var(--t3)',fontWeight:700}}>›</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function api_saveSetting(uid: string) {
  import('../../lib/api').then(({ api }) => api.saveSetting('current_unit', uid).catch(()=>{}))
}
