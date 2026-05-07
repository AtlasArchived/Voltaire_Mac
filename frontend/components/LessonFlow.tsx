'use client'
/**
 * components/LessonFlow.tsx — v2.7
 * Sound engine, heart bar, XP pop, combo badge, character reactions, slide transitions.
 */
import { useState, useRef, useEffect } from 'react'
import { DrillQ, McqQ, ArrQ, ListQ, TransQ, UnitMeta, getUnitPhrases, getUnitLessonQuestions } from '../lib/questionBank'
import { LESSON_PLANS } from '../lib/lessonPlans'
import { answersEquivalent } from '../lib/appHelpers'
import { useAccentInput, ACCENT_BAR } from '../lib/useAccentInput'
import confetti from 'canvas-confetti'

let _ctx: AudioContext | null = null
function getCtx() { if (!_ctx) _ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)(); return _ctx! }
function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.15) {
  try {
    const c = getCtx(); const o = c.createOscillator(); const g = c.createGain()
    o.connect(g); g.connect(c.destination); o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(gain, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.start(); o.stop(c.currentTime + dur)
  } catch {}
}
const SFX = {
  correct: () => { tone(523,.08,'sine',.14); setTimeout(()=>tone(659,.08,'sine',.14),80); setTimeout(()=>tone(784,.14,'sine',.17),160) },
  almost:  () => { tone(440,.06,'sine',.11); setTimeout(()=>tone(494,.12,'sine',.09),70) },
  wrong:   () => { tone(220,.08,'sawtooth',.08); setTimeout(()=>tone(196,.18,'sawtooth',.06),90) },
  combo:   () => [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.09,'sine',.12),i*60)),
  finish:  () => [523,659,784,1047,1318].forEach((f,i)=>setTimeout(()=>tone(f,.11,'sine',.14),i*65)),
  heart:   () => tone(150,.22,'sawtooth',.09),
  tick:    () => tone(1200,.03,'sine',.05),
}

interface Props { unit: UnitMeta; onComplete: (passed: boolean) => void; onBack: () => void }
type Phase = 'intro'|'practice'|'test'|'result'|'review'
type Verdict = 'correct'|'almost'|'wrong'
interface QR { question: DrillQ; verdict: Verdict; userAnswer: string }

function norm(s: string) {
  return s.replace(/[\u2019\u2018`\u00b4]/g,"'").toLowerCase().replace(/\s+/g,' ').trim()
    .replace(/^["'\u00ab\u00bb]+|["'\u00ab\u00bb]+$/g,'').replace(/[.!?\u2026]+$/g,'').trim()
}
function getVerdict(user: string, exp: string): Verdict {
  if (!answersEquivalent(user,exp)) return 'wrong'
  return norm(user)===norm(exp)?'correct':'almost'
}

const CEFR_COLORS: Record<string,string> = {A1:'#34d399',A2:'#4f9cf9',B1:'#a78bfa',B2:'#f59e0b',C1:'#f87171',C2:'#e879f9'}
const REACTIONS = {
  idle:    {face:'\uD83E\uDDD1\u200D\uD83C\uDFEB',text:''},
  correct: {face:'\uD83D\uDE04',text:'Bravo !'},
  almost:  {face:'\uD83E\uDD14',text:'Presque !'},
  wrong:   {face:'\uD83D\uDE2C',text:'Pas tout \u00e0 fait\u2026'},
  combo3:  {face:'\uD83E\uDD29',text:'En feu ! \uD83D\uDD25'},
  combo5:  {face:'\uD83E\uDD73',text:'Incroyable !'},
}

function XpPop({xp,combo}:{xp:number;combo:number}) {
  const total=xp*(combo>=5?3:combo>=3?2:1)
  return(
    <div style={{position:'fixed',top:'18%',right:28,zIndex:999,fontWeight:900,
      fontSize:combo>=3?'2rem':'1.5rem',
      color:combo>=3?'var(--amber,#f59e0b)':'var(--green,#58cc02)',
      textShadow:'0 2px 12px rgba(0,0,0,.5)',
      animation:'xpPop 1s cubic-bezier(.34,1.56,.64,1) forwards',pointerEvents:'none'}}>
      +{total} XP{combo>=3?` \u00d7${combo>=5?3:2}`:''}
    </div>
  )
}
function HeartBar({hearts,shake}:{hearts:boolean[];shake:boolean}) {
  return(
    <div style={{display:'flex',gap:5}}>
      {hearts.map((a,i)=>(
        <span key={i} style={{fontSize:'1.15rem',filter:a?'none':'grayscale(1) opacity(.3)',animation:!a&&shake&&i===hearts.lastIndexOf(false)?'heartLost .5s ease':'none',transition:'filter .3s'}}>{a?'\u2764\ufe0f':'\uD83D\uDDA4'}</span>
      ))}
    </div>
  )
}
function ComboBadge({streak}:{streak:number}) {
  if (streak<2) return null
  const label=streak>=5?'\uD83D\uDD25 \u00d73 XP':streak>=3?'\u26a1 \u00d72 XP':`\uD83C\uDFAF ${streak} streak`
  const color=streak>=5?'var(--amber,#f59e0b)':streak>=3?'var(--blue,#4f9cf9)':'var(--green,#58cc02)'
  return(<div style={{padding:'3px 10px',borderRadius:99,background:`${color}22`,border:`1.5px solid ${color}`,fontSize:11,fontWeight:800,color,animation:'comboPop .4s cubic-bezier(.34,1.56,.64,1)'}}>{label}</div>)
}

function DrillQuestion({question:q,onResult,onAdvance,isLast}:{question:DrillQ;onResult:(v:Verdict,a:string)=>void;onAdvance:()=>void;isLast:boolean}) {
  const [selected,setSelected]=useState<string|null>(null)
  const [arranged,setArranged]=useState<string[]>([])
  const [available,setAvailable]=useState<string[]>(q.type==='arrange'?[...(q as ArrQ).words].sort(()=>Math.random()-.5):[])
  const [input,setInput]=useState('')
  const [submitted,setSubmitted]=useState(false)
  const [verd,setVerd]=useState<Verdict|null>(null)
  const [corrInput,setCorrInput]=useState('')
  const [corrDone,setCorrDone]=useState(false)
  const [speaking,setSpeaking]=useState(false)
  const [shake,setShake]=useState(false)
  const inputRef=useRef<HTMLInputElement>(null)
  const hA=useAccentInput(input,setInput)
  const hC=useAccentInput(corrInput,setCorrInput)

  useEffect(()=>{ if(!submitted&&['translate','fill_blank','error_correct','listen'].includes(q.type)) setTimeout(()=>inputRef.current?.focus(),80) },[q.type,submitted])

  function submit(ans:string){ if(submitted)return; const v=getVerdict(ans,q.answer); setVerd(v);setSubmitted(true); if(v==='wrong'){setShake(true);setTimeout(()=>setShake(false),600)} onResult(v,ans) }
  function handleCorr(val:string){ setCorrInput(val); if(norm(val)===norm(q.answer))setCorrDone(true) }
  function playAudio(text:string){ if(speaking)return; setSpeaking(true); const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=0.82; const fr=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('fr'));if(fr)u.voice=fr; u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false); window.speechSynthesis.speak(u) }

  const canAdv=!submitted?false:verd==='correct'||corrDone
  const vc=verd==='correct'?'var(--green,#58cc02)':verd==='almost'?'#d4820e':'var(--red,#ff4b4b)'
  const vb=verd==='correct'?'rgba(88,204,2,.08)':verd==='almost'?'rgba(212,130,14,.08)':'rgba(255,75,75,.08)'
  const aiCls=`answer-input${submitted?(verd!=='wrong'?' correct':` wrong${shake?' shake':''}`):''}`

  return(
    <div className="drill-q-wrap" style={{animation:'slideInRight .28s cubic-bezier(.22,.68,0,1.2)'}}>
      <div className="drill-q-text">{(()=>{
        if(q.type==='translate'){const d=(q as TransQ).direction;return<><div style={{fontSize:11,fontWeight:800,color:'var(--t3,#8b949e)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>{d==='en-fr'?'\uD83C\uDDEC\uD83C\uDDE7 \u2192 \uD83C\uDDEB\uD83C\uDDF7  Translate to French':'\uD83C\uDDEB\uD83C\uDDF7 \u2192 \uD83C\uDDEC\uD83C\uDDE7  Translate to English'}</div>{q.prompt.replace(/^Translate: /,'')}</>}
        if(q.type==='fill_blank')return<><div style={{fontSize:11,fontWeight:800,color:'var(--t3,#8b949e)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>\uD83D\uDCDD Fill in the blank</div>{q.prompt}</>
        if(q.type==='error_correct')return<><div style={{fontSize:11,fontWeight:800,color:'#e8970f',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>\u26a0\ufe0f Correct the error</div><div style={{background:'rgba(255,75,75,.08)',border:'1px solid rgba(255,75,75,.2)',borderRadius:10,padding:'8px 14px',display:'inline-block'}}>{q.prompt}</div></>
        if(q.type==='listen')return<div style={{fontSize:14,color:'var(--t2,#b1bac4)'}}>Listen and type what you hear</div>
        return q.prompt
      })()}</div>

      {q.type==='listen'&&(<div style={{display:'flex',justifyContent:'center',margin:'14px 0'}}><button onClick={()=>{SFX.tick();playAudio((q as ListQ).audioText)}} style={{width:72,height:72,borderRadius:'50%',background:speaking?'rgba(88,204,2,.14)':'rgba(79,156,249,.1)',border:`3px solid ${speaking?'var(--green,#58cc02)':'var(--blue,#4f9cf9)'}`,fontSize:'1.9rem',cursor:'pointer',transition:'all .2s'}}>{speaking?'\uD83D\uDD0A':'\u25b6\ufe0f'}</button></div>)}

      {q.type==='mcq'&&(<div className="options single-col" style={{marginTop:14}}>{(q as McqQ).options.map((opt,i)=>{let cls='';if(submitted)cls=opt===q.answer?'correct':opt===selected?'wrong':'';return(<button key={i} className={`opt ${cls}`} disabled={submitted} onClick={()=>{SFX.tick();setSelected(opt);submit(opt)}} style={{animation:submitted&&opt===q.answer?'correctPop .35s ease':'none'}}><span className="opt-letter">{['A','B','C','D'][i]}</span>{opt}{submitted&&opt===q.answer&&<span style={{marginLeft:'auto'}}>\u2713</span>}{submitted&&opt===selected&&opt!==q.answer&&<span style={{marginLeft:'auto'}}>\u2717</span>}</button>)})}</div>)}

      {q.type==='arrange'&&(<><div className={`drop-zone${arranged.length>0?' has-words':''}${submitted?(verd!=='wrong'?' correct':' wrong'):''}`} style={{marginTop:14,minHeight:52}}>{arranged.length===0?<span className="drop-zone-placeholder">Tap words to arrange\u2026</span>:arranged.map((w,i)=>(<button key={i} disabled={submitted} className={`word-tile placed${submitted?(verd!=='wrong'?' correct-tile':' wrong-tile'):''}`} onClick={()=>{if(!submitted){setArranged(a=>{const n=[...a];n.splice(i,1);return n});setAvailable(a=>[...a,w])}}}>{w}</button>))}</div><div className="word-bank" style={{marginTop:8,minHeight:44}}>{available.map((w,i)=>(<button key={i} className="word-tile" disabled={submitted} onClick={()=>{SFX.tick();setAvailable(a=>{const n=[...a];n.splice(i,1);return n});setArranged(a=>[...a,w])}}>{w}</button>))}</div>{!submitted&&(<button className={`check-btn ${arranged.length>0?'ready':'default'}`} style={{marginTop:12,width:'100%'}} disabled={arranged.length===0} onClick={()=>submit(arranged.join(' '))}>Check \u2713</button>)}</>)}

      {['translate','fill_blank','error_correct','listen'].includes(q.type)&&(<>{(q.type==='translate'?(q as TransQ).direction==='en-fr':true)&&(<div className="accent-bar" style={{marginTop:12,marginBottom:4}}>{ACCENT_BAR.map(ch=>(<button key={ch} type="button" disabled={submitted} className="accent-btn" onClick={()=>setInput(v=>v+ch)}>{ch}</button>))}</div>)}<input ref={inputRef} className={aiCls} value={input} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false} style={{marginTop:q.type==='listen'?0:6}} placeholder={q.type==='translate'?(q as TransQ).direction==='en-fr'?'Type in French\u2026':'Type in English\u2026':q.type==='listen'?'Type what you heard\u2026':q.type==='error_correct'?'Type the corrected sentence\u2026':'Type the missing word\u2026'} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{hA(e);if(e.key==='Enter'&&!submitted&&input.trim())submit(input)}}/>{!submitted&&(<button className={`check-btn ${input.trim()?'ready':'default'}`} style={{marginTop:10,width:'100%'}} disabled={!input.trim()} onClick={()=>submit(input)}>Check \u2713</button>)}</>)}

      {submitted&&(<div style={{marginTop:12,padding:'12px 14px',background:vb,border:`2px solid ${vc}`,borderRadius:12,animation:'feedbackSlide .3s cubic-bezier(.22,.68,0,1.2)'}}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:'1.2rem',lineHeight:1}}>{verd==='correct'?'\u2705':verd==='almost'?'\u26a1':'\u274c'}</span><div style={{flex:1}}><div style={{fontWeight:800,color:vc,fontSize:14}}>{verd==='correct'?'Correct !':verd==='almost'?'Presque \u2014 accent ou orthographe':'Incorrect'}</div>{verd!=='correct'&&<div style={{fontSize:13,color:'var(--t2,#b1bac4)',marginTop:4}}>\u2713 <strong style={{color:vc}}>{q.answer}</strong></div>}{q.note&&<div style={{fontSize:12,color:'var(--t3,#8b949e)',marginTop:5,lineHeight:1.6,fontStyle:'italic'}}>\uD83D\uDCA1 {q.note}</div>}</div></div>{(verd==='almost'||verd==='wrong')&&!corrDone&&(<div style={{marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:vc,marginBottom:5}}>{verd==='almost'?'\u26a1 Fix spelling \u2014 type it exactly':'\u270d\ufe0f Type the correct answer to continue'}</div><div className="accent-bar">{ACCENT_BAR.map(ch=>(<button key={ch} type="button" className="accent-btn" onClick={()=>{const v=corrInput+ch;setCorrInput(v);handleCorr(v)}}>{ch}</button>))}</div><input className={`answer-input${corrDone?' correct':''}`} value={corrInput} autoComplete="off" autoCorrect="off" spellCheck={false} placeholder={`Tapez : ${q.answer}`} style={{marginTop:4}} onChange={e=>handleCorr(e.target.value)} onKeyDown={hC} autoFocus/></div>)}{corrDone&&<div style={{marginTop:8,fontSize:13,color:'var(--green,#58cc02)',fontWeight:700}}>\u2713 Correction accept\u00e9e !</div>}</div>)}

      {submitted&&canAdv&&(<button className={verd==='correct'?'check-btn continue':verd==='almost'?'check-btn almost-continue':'check-btn wrong-continue'} style={{marginTop:14,width:'100%',animation:'slideUp .3s ease'}} onClick={onAdvance} autoFocus>{isLast?'Terminer \u2192':'Continuer \u2192'}</button>)}
    </div>
  )
}

function DrillRound({questions,title,accentColor,onDone}:{questions:DrillQ[];title:string;accentColor:string;onDone:(r:QR[])=>void}) {
  const [idx,setIdx]=useState(0)
  const [results,setResults]=useState<QR[]>([])
  const [hearts,setHearts]=useState([true,true,true,true,true])
  const [combo,setCombo]=useState(0)
  const [xpPop,setXpPop]=useState<{xp:number;combo:number}|null>(null)
  const [reaction,setReaction]=useState(REACTIONS.idle)
  const [shakeHeart,setShakeHeart]=useState(false)
  const ref=useRef<QR[]>([])
  const q=questions[idx]
  const pct=(idx/questions.length)*100

  function handleResult(v:Verdict,a:string){
    const next=[...ref.current,{question:questions[idx],verdict:v,userAnswer:a}];ref.current=next;setResults(next)
    if(v==='correct'){SFX.correct();const c=combo+1;setCombo(c);setReaction(c>=5?REACTIONS.combo5:c>=3?REACTIONS.combo3:REACTIONS.correct);if(c>=3)SFX.combo();setXpPop({xp:10,combo:c});setTimeout(()=>setXpPop(null),1000)}
    else if(v==='almost'){SFX.almost();setCombo(0);setReaction(REACTIONS.almost)}
    else{SFX.wrong();SFX.heart();setCombo(0);setReaction(REACTIONS.wrong);setShakeHeart(true);setTimeout(()=>setShakeHeart(false),700);setHearts(h=>{const n=[...h];const li=n.lastIndexOf(true);if(li>=0)n[li]=false;return n})}
    setTimeout(()=>setReaction(REACTIONS.idle),2000)
  }
  function advance(){
    const next=idx+1
    if(next>=questions.length){if(ref.current.every(r=>r.verdict!=='wrong')){SFX.finish();confetti({particleCount:120,spread:90,origin:{y:.5},colors:['#58cc02','#ffd900','#4f9cf9','#a78bfa','#ff4b4b']})};onDone(ref.current);return}
    setIdx(next)
  }

  return(
    <div className="drill-round-wrap">
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <div style={{flex:1,height:10,background:'var(--surface3,#21262d)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${accentColor}99,${accentColor})`,borderRadius:99,transition:'width .5s cubic-bezier(.34,1.56,.64,1)',boxShadow:`0 0 8px ${accentColor}88`}}/></div>
        <HeartBar hearts={hearts} shake={shakeHeart}/><ComboBadge streak={combo}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <div style={{fontSize:'1.8rem',lineHeight:1,transition:'all .3s'}}>{reaction.face}</div>
        <div><div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:accentColor}}>{title}</div>{reaction.text?<div style={{fontSize:13,color:accentColor,fontWeight:700}}>{reaction.text}</div>:<div style={{fontSize:12,color:'var(--t3,#8b949e)'}}>{idx+1} / {questions.length}</div>}</div>
      </div>
      {xpPop&&<XpPop xp={xpPop.xp} combo={xpPop.combo}/>}
      {q&&(<DrillQuestion key={`${idx}-${q.type}-${q.prompt.slice(0,16)}`} question={q} onResult={handleResult} onAdvance={advance} isLast={idx+1>=questions.length}/>)}
    </div>
  )
}

export default function LessonFlow({unit,onComplete,onBack}:Props) {
  const [phase,setPhase]=useState<Phase>('intro')
  const [practiceResults,setPracticeResults]=useState<QR[]>([])
  const [testResults,setTestResults]=useState<QR[]>([])
  const [reviewDone,setReviewDone]=useState(false)
  const {practice,test}=getUnitLessonQuestions(unit.id)
  const phrases=getUnitPhrases(unit.id)
  const plan=LESSON_PLANS[unit.id]
  const color=CEFR_COLORS[unit.cefr]||'var(--blue,#4f9cf9)'
  const testCorrect=testResults.filter(r=>r.verdict!=='wrong').length
  const testPassed=testResults.length>0&&testCorrect>=Math.ceil(testResults.length*.7)
  const mistakeQs=testResults.filter(r=>r.verdict!=='correct').map(r=>r.question)
  const pct=testResults.length>0?Math.round(testCorrect/testResults.length*100):0

  return(
    <div className="lesson-flow-wrap">
      <button className="lesson-flow-back" onClick={onBack}>\u2190 Retour</button>
      {phase==='intro'&&(<div className="lesson-intro-card" style={{animation:'fadeIn .3s ease'}}><div className="lesson-intro-header" style={{borderColor:color}}><div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color,marginBottom:4}}>{unit.cefr} \u00b7 {unit.title}</div>{plan?.theme&&<div style={{fontSize:12,color:'var(--t3,#8b949e)',marginBottom:8,fontStyle:'italic'}}>{plan.theme}</div>}<div style={{fontSize:18,fontWeight:800,color:'var(--text,#e6edf3)',marginBottom:6}}>What you'll learn</div><div style={{fontSize:13,color:'var(--t2,#b1bac4)'}}>{plan?`${practice.length} practice \u00b7 ${test.length}-question test`:'3 phrases \u2014 practice then test.'}</div></div><div className="lesson-phrases-list">{phrases.map((p,i)=>(<div key={i} className="lesson-phrase-row" style={{animationDelay:`${i*80}ms`,animation:'slideInRight .35s ease both'}}><div className="lesson-phrase-fr">{p.fr}</div><div className="lesson-phrase-en">{p.en}</div>{p.note&&<div className="lesson-phrase-note">{p.note}</div>}</div>))}</div><button className="check-btn ready" style={{marginTop:20,width:'100%',background:color,borderColor:color,fontSize:15}} onClick={()=>setPhase('practice')}>Commencer \uD83D\uDE80</button></div>)}
      {phase==='practice'&&(<DrillRound questions={practice} title="Pratique" accentColor={color} onDone={r=>{setPracticeResults(r);setPhase('test')}}/>)}
      {phase==='test'&&(<div><div style={{marginBottom:12,padding:'10px 14px',background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.3)',borderRadius:12}}><div style={{fontSize:12,fontWeight:800,color:'var(--amber,#f59e0b)',marginBottom:3}}>\uD83C\uDFAF Test final</div><div style={{fontSize:12,color:'var(--t2,#b1bac4)'}}>De m\u00e9moire \u2014 {Math.ceil(test.length*.7)}/{test.length} pour r\u00e9ussir.</div></div><DrillRound questions={test} title="Test" accentColor="var(--amber,#f59e0b)" onDone={r=>{setTestResults(r);setPhase('result');if(r.filter(x=>x.verdict!=='wrong').length>=Math.ceil(r.length*.7))onComplete(true)}}/></div>)}
      {phase==='review'&&(<div><div style={{marginBottom:12,padding:'10px 14px',background:'rgba(167,139,250,.08)',border:'1px solid rgba(167,139,250,.3)',borderRadius:12}}><div style={{fontSize:12,fontWeight:800,color:'var(--purple,#a78bfa)',marginBottom:3}}>\uD83D\uDD04 R\u00e9vision</div><div style={{fontSize:12,color:'var(--t2,#b1bac4)'}}>Retype each wrong answer correctly.</div></div><DrillRound questions={mistakeQs} title="R\u00e9vision" accentColor="var(--purple,#a78bfa)" onDone={()=>{setReviewDone(true);setPhase('result')}}/></div>)}
      {phase==='result'&&(<div className="lesson-result-card" style={{animation:'scaleIn .4s cubic-bezier(.34,1.56,.64,1)'}}><div style={{fontSize:'3.5rem',textAlign:'center',marginBottom:10}}>{pct===100?'\uD83D\uDC51':testPassed?'\uD83C\uDFC6':'\uD83D\uDE05'}</div><div style={{textAlign:'center',marginBottom:14}}><div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:90,height:90,borderRadius:'50%',background:`conic-gradient(${testPassed?color:'var(--red,#ff4b4b)'} ${pct*3.6}deg,var(--surface3,#21262d) 0deg)`,boxShadow:`0 0 24px ${(testPassed?color:'var(--red,#ff4b4b)')}44`}}><div style={{width:68,height:68,borderRadius:'50%',background:'var(--bg,#0d1117)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'1.3rem',fontWeight:900,color:testPassed?color:'var(--red,#ff4b4b)'}}>{pct}%</span></div></div></div><div style={{fontSize:'1.2rem',fontWeight:700,textAlign:'center',color:testPassed?color:'var(--red,#ff4b4b)',marginBottom:6}}>{pct===100?'Parfait !':testPassed?'Unit\u00e9 termin\u00e9e !':'Presque...'}</div><div style={{fontSize:13,color:'var(--t2,#b1bac4)',textAlign:'center',marginBottom:16}}>{testCorrect} / {testResults.length} correct</div><div style={{background:'var(--s2,#161b22)',borderRadius:10,padding:'10px 14px',marginBottom:16}}>{[{label:'Pratique',val:practiceResults.filter(r=>r.verdict!=='wrong').length,total:practiceResults.length,c:'var(--green,#58cc02)'},{label:'Test',val:testCorrect,total:testResults.length,c:testPassed?color:'var(--red,#ff4b4b)'}].map(row=>(<div key={row.label} style={{display:'flex',alignItems:'center',gap:10,padding:'5px 0',borderBottom:'1px solid var(--b1,#21262d)'}}><span style={{fontSize:12,color:'var(--t3,#8b949e)',width:58}}>{row.label}</span><div style={{flex:1,height:6,background:'var(--s3,#21262d)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${(row.val/Math.max(row.total,1))*100}%`,background:row.c,borderRadius:99}}/></div><span style={{fontSize:12,fontWeight:700,color:row.c,minWidth:32,textAlign:'right'}}>{row.val}/{row.total}</span></div>))}</div><div style={{display:'flex',flexDirection:'column',gap:8}}>{testPassed?(<>{mistakeQs.length>0&&!reviewDone&&(<button className="check-btn default" onClick={()=>setPhase('review')}>\uD83D\uDD04 R\u00e9viser {mistakeQs.length} erreur{mistakeQs.length>1?'s':''}</button>)}<button className="check-btn continue" style={{background:color,borderColor:color}} onClick={onBack}>Continuer \u2192</button></>):(<>{mistakeQs.length>0&&<button className="check-btn default" onClick={()=>setPhase('review')}>\uD83D\uDD04 R\u00e9viser {mistakeQs.length} erreur{mistakeQs.length>1?'s':''}</button>}<button className="check-btn ready" onClick={()=>{setTestResults([]);setReviewDone(false);setPhase('test')}}>R\u00e9essayer le test</button><button className="check-btn default" onClick={()=>setPhase('intro')}>\u00c9tudier \u00e0 nouveau</button></>)}</div></div>)}
    </div>
  )
}
