'use client'
/**
 * components/Onboarding.tsx — v2.5
 * 7 steps: name, why learning, travel goal, travel date, placement test, daily time, summary.
 */
import { useState } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const GOALS = [
  {value:'travel',   emoji:'🗼',title:'Live or travel in France',     sub:'Practical, conversational, survival-first'},
  {value:'reading',  emoji:'📚',title:'Read French literature',        sub:'Vocabulary-deep, classical register'},
  {value:'career',   emoji:'💼',title:'Career / professional use',     sub:'Formal register, business vocabulary'},
  {value:'personal', emoji:'🧠',title:'Personal — heritage or family', sub:'Cultural, warm, conversational'},
]
const TRAVEL_GOALS = [
  {value:'trip_to_paris',   emoji:'🗼',city:'Paris',             sub:'Café culture, metro, museums, restaurants'},
  {value:'trip_to_lyon',    emoji:'🍷',city:'Lyon',              sub:'Food capital, bouchons, Vieux-Lyon'},
  {value:'trip_to_south',   emoji:'☀️', city:'South of France',  sub:"Côte d'Azur, Provence, outdoor life"},
  {value:'move_to_france',  emoji:'🏡',city:'Moving to France',  sub:'Admin, housing, healthcare, daily life'},
  {value:'business_french', emoji:'💼',city:'Business French',   sub:'Meetings, emails, formal register'},
  {value:'general_fluency', emoji:'🌍',city:'General fluency',   sub:'No specific destination — all-round'},
]
const DAILY_MINUTES = [
  {minutes:5,  label:'5 min', sub:'Quick daily habit',  emoji:'🌱'},
  {minutes:10, label:'10 min',sub:'Solid foundation',   emoji:'📖'},
  {minutes:20, label:'20 min',sub:'Real progress',      emoji:'🔥'},
  {minutes:30, label:'30 min',sub:'Fast improvement',   emoji:'⚡'},
]
const XP_MAP: Record<number,number> = {5:25,10:50,20:100,30:200}
const PLACEMENT_QS = [
  {q:'What does "bonjour" mean?',opts:['Goodbye','Hello','Please','Thank you'],ans:1,level:'A1'},
  {q:'Complete: "Je ___ français."',opts:['parle','mange','suis','vais'],ans:0,level:'A1'},
  {q:'Passé composé of "aller" for "je":',opts:["j'ai allé",'je suis allé',"j'allais","j'irai"],ans:1,level:'A2'},
  {q:'Which is correct?',opts:['Il faut que tu vas','Il faut que tu ailles','Il faut que tu vas aller','Il faut tu ailles'],ans:1,level:'B1'},
  {q:'"Nonobstant" means:',opts:['Nevertheless','Obviously','Immediately','Elsewhere'],ans:0,level:'B2'},
]

export default function Onboarding({onComplete}:{onComplete:()=>void}) {
  const [step,setStep]=useState(0)
  const [name,setName]=useState('')
  const [goal,setGoal]=useState('')
  const [travelGoal,setTravelGoal]=useState('')
  const [travelDate,setTravelDate]=useState('')
  const [dailyMinutes,setDailyMinutes]=useState(10)
  const [answers,setAnswers]=useState<number[]>([])
  const [loading,setLoading]=useState(false)
  const TOTAL=7

  const correct=answers.filter((a,i)=>a===PLACEMENT_QS[i]?.ans).length
  const startElo=800+correct*80
  const xp=XP_MAP[dailyMinutes]??50

  async function finish(){
    setLoading(true)
    try {
      await api.completeOnboarding({name,goal,daily_xp:xp,placement_score:correct,travel_goal:travelGoal||'general_fluency',travel_date:travelDate,daily_minutes:dailyMinutes})
      toast.success(`Bienvenue, ${name}! Voltaire est prêt.`)
      onComplete()
    } catch { toast.error('Setup failed — please try again') }
    finally { setLoading(false) }
  }

  const s: React.CSSProperties = {
    position:'fixed',inset:0,background:'var(--bg,#0d1117)',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:24,zIndex:100,overflowY:'auto',
  }
  const card: React.CSSProperties = {
    width:'100%',maxWidth:480,background:'var(--s2,#161b22)',
    border:'1px solid var(--b1,#21262d)',borderRadius:16,padding:'28px 26px',
    position:'relative',overflow:'hidden',
  }
  const btn = (active:boolean):React.CSSProperties => ({
    display:'flex',alignItems:'center',gap:12,width:'100%',
    background:active?'var(--blue2,rgba(79,156,249,.12))':'var(--s1,#0d1117)',
    border:`1.5px solid ${active?'var(--blue,#4f9cf9)':'var(--b1,#21262d)'}`,
    borderRadius:10,padding:'12px 15px',cursor:'pointer',
    textAlign:'left',transition:'all .15s',fontFamily:'inherit',
  })

  return(
    <div style={s}>
      {/* Logo */}
      <div style={{fontFamily:'var(--serif,Georgia)',fontSize:'1.1rem',fontWeight:700,letterSpacing:'.3em',color:'var(--blue-bright,#6baeff)',marginBottom:6}}>VOLTAIRE</div>
      <div style={{fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--t3,#8b949e)',marginBottom:28}}>French Fluency for Life</div>
      {/* Dots */}
      <div style={{display:'flex',gap:6,marginBottom:24}}>
        {Array.from({length:TOTAL}).map((_,i)=>(
          <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<step?'var(--blue,#4f9cf9)':i===step?'var(--blue-bright,#6baeff)':'var(--b1,#21262d)',transition:'all .3s',boxShadow:i===step?'0 0 8px rgba(79,156,249,.6)':'none'}}/>
        ))}
      </div>
      <div style={card}>
        <div style={{position:'absolute',top:0,left:'10%',right:'10%',height:1,background:'linear-gradient(90deg,transparent,rgba(79,156,249,.3),transparent)'}}/>

        {step===0&&(
          <div style={{animation:'fadeIn .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:8}}>Bienvenue. Let's get acquainted.</div>
            <div style={{fontSize:13,color:'var(--t2,#b1bac4)',lineHeight:1.7,marginBottom:20}}>Voltaire is your personal AI French tutor. It remembers you — your mistakes, your progress, your level — and builds every lesson around you.</div>
            <label style={{display:'block',fontSize:12,color:'var(--t3,#8b949e)',marginBottom:5}}>Your first name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&name.trim()&&setStep(1)}
              placeholder="Jackson" autoFocus
              style={{width:'100%',background:'var(--s1,#0d1117)',border:'1.5px solid var(--b2,#30363d)',borderRadius:10,color:'var(--text,#e6edf3)',fontSize:15,padding:'12px 15px',outline:'none',marginBottom:18,boxSizing:'border-box'}}/>
            <button className="check-btn ready" onClick={()=>name.trim()&&setStep(1)} disabled={!name.trim()}>Continue →</button>
          </div>
        )}

        {step===1&&(
          <div style={{animation:'slideInRight .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>What's driving you, {name}?</div>
            <div style={{fontSize:12,color:'var(--t2,#b1bac4)',marginBottom:16}}>This shapes vocabulary priority and lesson content.</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {GOALS.map(g=>(
                <button key={g.value} onClick={()=>{setGoal(g.value);setStep(2)}} style={btn(goal===g.value)}>
                  <span style={{fontSize:'1.3rem'}}>{g.emoji}</span>
                  <div><div style={{fontWeight:600,fontSize:13,color:'var(--text,#e6edf3)'}}>{g.title}</div><div style={{fontSize:11,color:'var(--t2,#b1bac4)',marginTop:2}}>{g.sub}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{animation:'slideInRight .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>Where are you headed?</div>
            <div style={{fontSize:12,color:'var(--t2,#b1bac4)',marginBottom:16}}>Voltaire will boost vocabulary for your specific destination.</div>
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
              {TRAVEL_GOALS.map(g=>(
                <button key={g.value} onClick={()=>setTravelGoal(g.value)} style={btn(travelGoal===g.value)}>
                  <span style={{fontSize:'1.2rem',minWidth:22}}>{g.emoji}</span>
                  <div><div style={{fontWeight:600,fontSize:13,color:'var(--text,#e6edf3)'}}>{g.city}</div><div style={{fontSize:11,color:'var(--t2,#b1bac4)',marginTop:2}}>{g.sub}</div></div>
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="check-btn default" style={{flex:1}} onClick={()=>setStep(3)}>Skip</button>
              <button className="check-btn ready" style={{flex:2}} onClick={()=>travelGoal&&setStep(3)} disabled={!travelGoal}>Continue →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div style={{animation:'slideInRight .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>When do you need to be ready?</div>
            <div style={{fontSize:12,color:'var(--t2,#b1bac4)',marginBottom:16,lineHeight:1.7}}>Voltaire will prioritise the vocabulary you need first. Skip if you don't have a date.</div>
            <label style={{display:'block',fontSize:12,color:'var(--t3,#8b949e)',marginBottom:5}}>Target date (optional)</label>
            <input type="date" value={travelDate} onChange={e=>setTravelDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{width:'100%',background:'var(--s1,#0d1117)',border:'1.5px solid var(--b2,#30363d)',borderRadius:10,color:'var(--text,#e6edf3)',fontSize:15,padding:'12px 15px',outline:'none',marginBottom:10,boxSizing:'border-box'}}/>
            {travelDate&&<div style={{fontSize:12,color:'var(--blue,#4f9cf9)',marginBottom:14}}>
              {Math.max(0,Math.ceil((new Date(travelDate).getTime()-Date.now())/86400000))} days to go
            </div>}
            <div style={{display:'flex',gap:8}}>
              <button className="check-btn default" style={{flex:1}} onClick={()=>setStep(4)}>Skip</button>
              <button className="check-btn ready" style={{flex:2}} onClick={()=>setStep(4)}>Continue →</button>
            </div>
          </div>
        )}

        {step===4&&(()=>{
          const qi=answers.length
          if (qi>=PLACEMENT_QS.length) return(
            <div style={{animation:'scaleIn .4s ease',textAlign:'center',padding:'10px 0'}}>
              <div style={{fontSize:'2.5rem',marginBottom:10}}>{correct>=4?'🎓':correct>=2?'📗':'🌱'}</div>
              <div style={{fontFamily:'var(--serif,Georgia)',fontSize:'1.2rem',color:'var(--blue,#4f9cf9)',marginBottom:6}}>
                {correct>=4?'Strong foundation':correct>=2?'False beginner':'Fresh start'}
              </div>
              <div style={{fontSize:13,color:'var(--t2,#b1bac4)',marginBottom:4}}>{correct}/5 correct · Starting ELO: {startElo}</div>
              <div style={{fontSize:12,color:'var(--t3,#8b949e)',marginBottom:20}}>Voltaire will calibrate every lesson to this level.</div>
              <button className="check-btn ready" onClick={()=>setStep(5)}>Continue →</button>
            </div>
          )
          const q=PLACEMENT_QS[qi]
          return(
            <div style={{animation:'slideInRight .3s ease'}}>
              <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:10}}>Quick placement · {qi+1} of {PLACEMENT_QS.length}</div>
              <div style={{fontSize:15,fontWeight:500,marginBottom:18,lineHeight:1.5}}>{q.q}</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {q.opts.map((opt,i)=>(
                  <button key={i} className="opt" onClick={()=>setAnswers(a=>[...a,i])}>
                    <span className="opt-letter">{['A','B','C','D'][i]}</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {step===5&&(
          <div style={{animation:'slideInRight .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>How much time each day?</div>
            <div style={{fontSize:12,color:'var(--t2,#b1bac4)',marginBottom:16,lineHeight:1.7}}>15–20 minutes daily beats 2-hour weekend sessions. Pick something you'll actually hit.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
              {DAILY_MINUTES.map(g=>(
                <button key={g.minutes} onClick={()=>setDailyMinutes(g.minutes)} style={{
                  background:dailyMinutes===g.minutes?'var(--blue2,rgba(79,156,249,.12))':'var(--s1,#0d1117)',
                  border:`1.5px solid ${dailyMinutes===g.minutes?'var(--blue,#4f9cf9)':'var(--b1,#21262d)'}`,
                  borderRadius:10,padding:'14px 10px',textAlign:'center',cursor:'pointer',transition:'all .15s',fontFamily:'inherit',
                }}>
                  <div style={{fontSize:'1.3rem',marginBottom:3}}>{g.emoji}</div>
                  <div style={{fontWeight:600,fontSize:13,color:'var(--text,#e6edf3)'}}>{g.label}</div>
                  <div style={{fontSize:11,color:'var(--t2,#b1bac4)',marginTop:2}}>{g.sub}</div>
                  <div style={{fontSize:11,color:'var(--blue,#4f9cf9)',marginTop:4}}>{XP_MAP[g.minutes]} XP/day</div>
                </button>
              ))}
            </div>
            <button className="check-btn ready" onClick={()=>setStep(6)}>Continue →</button>
          </div>
        )}

        {step===6&&(
          <div style={{animation:'fadeIn .3s ease'}}>
            <div style={{fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>Everything's ready, {name}.</div>
            <div style={{background:'var(--s1,#0d1117)',borderRadius:10,padding:'14px',marginBottom:18}}>
              {[
                ['Name', name],
                ['Goal', GOALS.find(g=>g.value===goal)?.title||goal],
                ['Destination', TRAVEL_GOALS.find(g=>g.value===travelGoal)?.city||'General'],
                travelDate?['Target', new Date(travelDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})]:null,
                ['Daily', `${dailyMinutes} min · ${xp} XP/day`],
                ['Starting ELO', `${startElo} (${correct}/5 placement)`],
              ].filter(Boolean).map(([k,v])=>(
                <div key={k as string} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--b1,#21262d)',fontSize:13}}>
                  <span style={{color:'var(--t2,#b1bac4)'}}>{k}</span>
                  <span style={{color:'var(--text,#e6edf3)',fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
            <button className="check-btn ready" style={{fontSize:15,opacity:loading?.7:1}} onClick={finish} disabled={loading}>
              {loading?'Setting up…':'Commencer →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
