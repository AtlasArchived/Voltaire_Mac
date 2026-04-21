'use client'
import { useState, useRef, useEffect } from 'react'
import { api, streamLesson } from '../../lib/api'
import { useApp } from '../AppContext'
import { md } from '../../lib/appHelpers'
import WordTap from '../../components/WordTap'
import Dots from '../../components/Dots'
import toast from 'react-hot-toast'

interface Msg { role: 'assistant' | 'user'; text: string }

export default function ChatPage() {
  const { setLearner, setStreak } = useApp()
  const [msgs,      setMsgs]      = useState<Msg[]>([])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function initChat() {
    if (msgs.length > 0) return
    try {
      const res = await api.startLesson()
      setMsgs([{ role: 'assistant', text: res.text }])
    } catch (e) { toast.error(String(e)) }
  }

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    const hist = msgs.filter(m => m.text.trim()).map(m => ({ role: m.role, text: m.text }))
    setMsgs(m => [...m, { role: 'user', text }])
    setStreaming(true)
    let built = ''
    setMsgs(m => [...m, { role: 'assistant', text: '' }])
    await streamLesson(text, hist,
      tok => { built += tok; setMsgs(m => { const u=[...m]; u[u.length-1]={ role:'assistant', text:built }; return u }) },
      async () => {
        setStreaming(false)
        try { const [l,s] = await Promise.all([api.getLearner(), api.getStreak()]); setLearner(l); setStreak!(s) } catch {}
      },
      err => { setStreaming(false); toast.error(err) }
    )
  }

  return (
    <div className="chat-wrap">
      <div className="chat-main">
        <div className="chat-header">✍️ AI Tutor — French practice with English explanations</div>
        <div className="chat-msgs">
          {msgs.length === 0 && !streaming && (
            <div style={{textAlign:'center',padding:'40px 20px',color:'var(--t3)'}}>
              <div style={{fontSize:'2rem',marginBottom:12}}>✍️</div>
              <div style={{fontSize:14,fontWeight:600,lineHeight:1.7}}>
                Practice French conversation with Voltaire.<br/>
                <span style={{color:'var(--t2)',fontWeight:400}}>
                  Mistakes and questions are explained in English —<br/>
                  so you always know exactly what to fix.
                </span>
              </div>
              <button className="btn btn-primary" style={{marginTop:20}} onClick={initChat}>Start Lesson</button>
            </div>
          )}
          {msgs.map((m, i) => m.role === 'assistant' ? (
            <div key={i} className="chat-row">
              <div className="chat-av v">✍️</div>
              <div className="chat-bub v md">
                <div className="chat-who v">Voltaire</div>
                {m.text === '' ? <Dots /> : <WordTap text={md(m.text)} isHtml style={{display:'block'}} />}
              </div>
            </div>
          ) : (
            <div key={i} className="fadeUp">
              <div className="chat-bub u"><div className="chat-who u">You</div>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-wrap">
          <div className="chat-input-row">
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Write in French or ask a question in English… (Enter)" disabled={streaming} />
            <button className="send-btn" onClick={send} disabled={streaming}>
              {streaming
                ? <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
