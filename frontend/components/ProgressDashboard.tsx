'use client'
/**
 * components/ProgressDashboard.tsx — v2.5
 * CEFR gauge, skill radar, streak heatmap, fluency projection, learning health panel.
 */
import { useEffect, useState } from 'react'
import { useApp } from '../app/AppContext'
import { api, type InferredState } from '../lib/api'

const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2']
const CEFR_ELO_MIN: Record<string,number> = { A1:0, A2:1000, B1:1200, B2:1400, C1:1600, C2:1800 }
const CEFR_COLOR: Record<string,string>   = { A1:'#34d399', A2:'#4f9cf9', B1:'#a78bfa', B2:'#f59e0b', C1:'#f87171', C2:'#e879f9' }

function cefrFromElo(elo:number){ if(elo>=1800)return'C2';if(elo>=1600)return'C1';if(elo>=1400)return'B2';if(elo>=1200)return'B1';if(elo>=1000)return'A2';return'A1' }
function eloToNext(elo:number){ const cur=cefrFromElo(elo);const idx=CEFR_LEVELS.indexOf(cur);const nxt=CEFR_LEVELS[idx+1]||'C2';const min=CEFR_ELO_MIN[cur];const max=CEFR_ELO_MIN[nxt]||2000;const pct=Math.min(100,Math.round((elo-min)/(max-min)*100));return{current:cur,next:nxt,pct,points:Math.max(0,max-elo)} }

// Streak heatmap
function StreakCalendar({weekly}:{weekly:{date:string;xp:number}[]}) {
  const today=new Date()
  const cells=Array.from({length:35},(_,i)=>{
    const d=new Date(today);d.setDate(today.getDate()-(34-i))
    const iso=d.toISOString().split('T')[0]
    const entry=weekly.find(w=>w.date===iso)
    return{iso,xp:entry?.xp??0,isToday:iso===today.toISOString().split('T')[0]}
  })
  const maxXp=Math.max(...cells.map(c=>c.xp),1)
  return(
    <div>
      <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:8,letterSpacing:'.08em',textTransform:'uppercase'}}>Activity — last 35 days</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {cells.map(c=>(
          <div key={c.iso} title={`${c.iso}: ${c.xp} XP`} style={{
            aspectRatio:'1',borderRadius:4,
            background:c.xp>0?`rgba(79,156,249,${Math.max(.15,c.xp/maxXp)})`:'var(--s1,#0d1117)',
            border:c.isToday?'2px solid var(--blue,#4f9cf9)':'1px solid transparent',
          }}/>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
        <span style={{fontSize:10,color:'var(--t3,#8b949e)'}}>35 days ago</span>
        <span style={{fontSize:10,color:'var(--t3,#8b949e)'}}>Today</span>
      </div>
    </div>
  )
}

// Skill radar
const SKILLS=[{key:'lexicon',label:'Vocabulary'},{key:'grammar',label:'Grammar'},{key:'syntax',label:'Word Order'},{key:'listening',label:'Listening'},{key:'general',label:'Comprehension'}]
function SkillRadar({mastery}:{mastery:Record<string,number>}) {
  const cx=100,cy=100,r=68,n=SKILLS.length
  const angles=SKILLS.map((_,i)=>i*2*Math.PI/n-Math.PI/2)
  const pts=SKILLS.map((s,i)=>{const v=Math.min(1,mastery[s.key]??0.3);return{x:cx+r*v*Math.cos(angles[i]),y:cy+r*v*Math.sin(angles[i])}})
  return(
    <div>
      <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:8,letterSpacing:'.08em',textTransform:'uppercase'}}>Skill mastery</div>
      <svg viewBox="0 0 200 200" style={{width:'100%',maxWidth:200,display:'block',margin:'0 auto'}}>
        {[.25,.5,.75,1].map(l=>(
          <polygon key={l} points={SKILLS.map((_,i)=>`${cx+r*l*Math.cos(angles[i])},${cy+r*l*Math.sin(angles[i])}`).join(' ')}
            fill="none" stroke="var(--b1,#21262d)" strokeWidth=".8"/>
        ))}
        {SKILLS.map((_,i)=>(
          <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(angles[i])} y2={cy+r*Math.sin(angles[i])} stroke="var(--b1,#21262d)" strokeWidth=".8"/>
        ))}
        <polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(79,156,249,.2)" stroke="#4f9cf9" strokeWidth="1.5"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="#4f9cf9"/>)}
        {SKILLS.map((s,i)=>{
          const lx=cx+(r+16)*Math.cos(angles[i]),ly=cy+(r+16)*Math.sin(angles[i])
          return<text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="var(--t2,#b1bac4)">{s.label}</text>
        })}
      </svg>
    </div>
  )
}

// CEFR gauge
function CefrGauge({elo}:{elo:number}) {
  const {current,next,pct,points}=eloToNext(elo)
  const color=CEFR_COLOR[current]
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:8}}>
        <div><span style={{fontSize:'2rem',fontWeight:700,color,letterSpacing:'-.02em'}}>{current}</span><span style={{fontSize:13,color:'var(--t3,#8b949e)',marginLeft:8}}>→ {next}</span></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--t3,#8b949e)'}}>{points} ELO to {next}</div><div style={{fontSize:10,color:'var(--t3,#8b949e)'}}>ELO: {elo}</div></div>
      </div>
      <div style={{height:10,background:'var(--s1,#0d1117)',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:99,transition:'width .8s cubic-bezier(.34,1.56,.64,1)'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
        <span style={{fontSize:11,color}}>{pct}%</span>
        <span style={{fontSize:11,color:'var(--t3,#8b949e)'}}>{next} at {CEFR_ELO_MIN[next]||2000} ELO</span>
      </div>
      <div style={{display:'flex',gap:4,marginTop:12}}>
        {CEFR_LEVELS.map(lvl=>{
          const reached=elo>=CEFR_ELO_MIN[lvl];const isActive=lvl===current;const c=CEFR_COLOR[lvl]
          return(
            <div key={lvl} style={{flex:1,textAlign:'center',padding:'5px 0',
              background:isActive?`${c}22`:reached?'var(--s1,#0d1117)':'transparent',
              border:`1px solid ${isActive?c:reached?'var(--b2,#30363d)':'var(--b1,#21262d)'}`,borderRadius:6}}>
              <div style={{fontSize:10,fontWeight:isActive?700:400,color:isActive?c:reached?'var(--text,#e6edf3)':'var(--t3,#8b949e)'}}>{lvl}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Fluency projection
function FluencyProjection({elo,dailyMinutes,travelDate}:{elo:number;dailyMinutes:number;travelDate?:string}) {
  const eloPerDay=(dailyMinutes/60)*60*(elo>1400?.4:elo>1000?.65:.9)
  const targets=[{level:'A2',elo:1000,label:'Basic conversations'},{level:'B1',elo:1200,label:'Travel confidently'},{level:'B2',elo:1400,label:'Near-fluent'},{level:'C1',elo:1600,label:'Advanced fluency'}]
  const proj=targets.filter(t=>t.elo>elo).slice(0,3).map(t=>{
    const days=Math.ceil((t.elo-elo)/Math.max(eloPerDay,.5))
    const d=new Date();d.setDate(d.getDate()+days)
    return{...t,days,date:d}
  })
  const travelDaysLeft=travelDate?Math.max(0,Math.ceil((new Date(travelDate).getTime()-Date.now())/86400000)):null
  return(
    <div>
      <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:8,letterSpacing:'.08em',textTransform:'uppercase'}}>Fluency projection · {dailyMinutes} min/day</div>
      {proj.length===0?<div style={{fontSize:13,color:'var(--t2,#b1bac4)'}}>You've reached C1. Keep going to C2.</div>:(
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {proj.map(p=>(
            <div key={p.level} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--s1,#0d1117)',borderRadius:8,padding:'9px 14px'}}>
              <div><span style={{fontWeight:600,color:CEFR_COLOR[p.level],marginRight:8}}>{p.level}</span><span style={{fontSize:12,color:'var(--t2,#b1bac4)'}}>{p.label}</span></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:12,fontWeight:500,color:'var(--text,#e6edf3)'}}>{p.date.toLocaleDateString('en',{month:'short',year:'numeric'})}</div><div style={{fontSize:10,color:'var(--t3,#8b949e)'}}>{p.days} days</div></div>
            </div>
          ))}
          {travelDaysLeft!==null&&<div style={{fontSize:12,color:'var(--blue,#4f9cf9)',paddingLeft:2}}>✈️ Your trip is in {travelDaysLeft} days</div>}
        </div>
      )}
    </div>
  )
}

function StatCard({label,value,sub,color='var(--text,#e6edf3)'}:{label:string;value:string|number;sub?:string;color?:string}) {
  return(
    <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:10,padding:'12px 14px'}}>
      <div style={{fontSize:11,color:'var(--t3,#8b949e)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{label}</div>
      <div style={{fontSize:'1.4rem',fontWeight:700,color,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:'var(--t3,#8b949e)',marginTop:3}}>{sub}</div>}
    </div>
  )
}

export default function ProgressDashboard() {
  const {learner,streak,adaptive,weakSkills}=useApp()
  const [inferred,setInferred]=useState<InferredState|null>(null)
  const [mastery,setMastery]=useState<Record<string,number>>({})
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    Promise.allSettled([
      api.getInferredState().catch(()=>null),
      api.getAdaptiveMastery().catch(()=>null),
    ]).then(([infR,mastR])=>{
      if (infR.status==='fulfilled'&&infR.value) setInferred(infR.value as InferredState)
      if (mastR.status==='fulfilled'&&mastR.value) setMastery((mastR.value as any).mastery||{})
      setLoading(false)
    })
  },[])

  if (!learner) return null
  const elo=learner.elo??800
  const cefrLevel=cefrFromElo(elo)
  const streakDays=streak?.current_streak??0
  const xpToday=streak?.xp_today??0
  const goalXp=streak?.daily_goal_xp??50

  const skillMastery:Record<string,number>={}
  ;['lexicon','grammar','syntax','listening','general'].forEach(key=>{
    const blobVal=mastery[key]
    const weakItem=weakSkills.find(w=>w.skill_tag===key)
    skillMastery[key]=blobVal!==undefined?Math.min(1,blobVal):weakItem?Math.max(0,1-weakItem.error_rate):0.5
  })

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--t3,#8b949e)'}}>Loading…</div>

  return(
    <div style={{padding:'0 0 40px',maxWidth:720,margin:'0 auto'}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:'1.3rem',fontWeight:700,marginBottom:3}}>Your progress</div>
        <div style={{fontSize:12,color:'var(--t2,#b1bac4)'}}>{learner.name} · {cefrLevel} · {elo} ELO</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:9,marginBottom:16}}>
        <StatCard label="Streak" value={`${streakDays}d`} sub="days in a row" color="var(--amber,#f59e0b)"/>
        <StatCard label="Today" value={`${xpToday}/${goalXp}`} sub="XP" color="var(--green,#58cc02)"/>
        <StatCard label="Vocab" value={inferred?.vocab_breadth??0} sub="mastered" color="var(--blue,#4f9cf9)"/>
        <StatCard label="Mastery" value={`${Math.round(adaptive?.mastery_score??0)}%`} sub="overall" color="var(--purple,#a78bfa)"/>
      </div>
      <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:12,padding:18,marginBottom:14}}>
        <CefrGauge elo={elo}/>
      </div>
      <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:12,padding:18,marginBottom:14}}>
        <FluencyProjection elo={elo} dailyMinutes={learner.daily_minutes??10} travelDate={learner.travel_date}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:12,padding:18}}>
          <SkillRadar mastery={skillMastery}/>
        </div>
        <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:12,padding:18}}>
          <StreakCalendar weekly={streak?.weekly??[]}/>
        </div>
      </div>
      {inferred&&(
        <div style={{background:'var(--s2,#161b22)',border:'1px solid var(--b1,#21262d)',borderRadius:12,padding:18}}>
          <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:12,letterSpacing:'.08em',textTransform:'uppercase'}}>Learning health</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            {[
              {label:'Frustration',pct:Math.round(inferred.frustration_score*100),color:inferred.frustration_score>.6?'var(--red,#ff4b4b)':inferred.frustration_score>.3?'var(--amber,#f59e0b)':'var(--green,#58cc02)',tip:inferred.frustration_score>.6?'Try easier drills':'Good pace'},
              {label:'Velocity',pct:Math.min(100,Math.round(inferred.velocity/500*100)),color:'var(--blue,#4f9cf9)',tip:`${Math.round(inferred.velocity)} XP/hr`},
              {label:'Mastery',pct:Math.round(adaptive?.mastery_score??0),color:'var(--purple,#a78bfa)',tip:`${Math.round(adaptive?.mastery_score??0)}% overall`},
            ].map(item=>(
              <div key={item.label}>
                <div style={{fontSize:11,color:'var(--t3,#8b949e)',marginBottom:5}}>{item.label}</div>
                <div style={{height:6,background:'var(--s1,#0d1117)',borderRadius:99,overflow:'hidden',marginBottom:3}}>
                  <div style={{height:'100%',width:`${item.pct}%`,background:item.color,borderRadius:99,transition:'width .6s'}}/>
                </div>
                <div style={{fontSize:10,color:'var(--t3,#8b949e)'}}>{item.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
