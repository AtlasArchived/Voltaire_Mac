'use client'
import { useEffect } from 'react'
import { api } from '../../lib/api'
import { useApp } from '../AppContext'

export default function ReviewPage() {
  const {
    aiCoachPlan, adaptive, nextBestLesson, weakSkills, setWeakSkills,
    reviewQueue, setReviewQueue, setNextBestLesson, practicePrompt,
    mistakes, clearMistakes,
  } = useApp()

  useEffect(() => {
    api.getWeakSkillReport().then(r => setWeakSkills(r.skills || [])).catch(() => {})
    api.getReviewQueue(12).then(r => setReviewQueue(r.items || [])).catch(() => {})
    api.getNextBestLesson().then(setNextBestLesson).catch(() => {})
  }, [])

  return (
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
        <div style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)',marginBottom:6}}>What next (adaptive)</div>
          <div style={{fontSize:12,color:'var(--t2)'}}>
            {nextBestLesson.cefr} {nextBestLesson.recommended_q_type} ({nextBestLesson.focus_skill})
          </div>
          {nextBestLesson.recommended_prompt && (
            <button className="check-btn ready" style={{padding:'10px 12px',marginTop:8}}
              onClick={() => practicePrompt(nextBestLesson!.recommended_prompt)}>
              Practice recommended prompt
            </button>
          )}
        </div>
      )}

      {mistakes.length > 0 && (
        <div style={{padding:'10px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:800,color:'var(--blue-b)'}}>Recent mistakes ({mistakes.length})</div>
            <button className="check-btn default" style={{padding:'4px 10px',fontSize:11,width:'auto'}} onClick={clearMistakes}>
              Clear all
            </button>
          </div>
          {mistakes.slice(0,5).map((m, i) => (
            <div key={i} style={{fontSize:12,color:'var(--t2)',marginBottom:2}}>• {m.prompt} — {m.note}</div>
          ))}
          {mistakes.length > 5 && (
            <div style={{fontSize:11,color:'var(--t3)',marginTop:4}}>+{mistakes.length - 5} more</div>
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
            <button className="check-btn ready" style={{padding:'10px 12px'}} onClick={() => practicePrompt(f.prompt)}>
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
            <button className="check-btn ready" style={{padding:'10px 12px'}} onClick={() => practicePrompt(r.prompt)}>
              Start Recommended Review
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
