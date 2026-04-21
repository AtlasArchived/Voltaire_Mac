'use client'
import { useState, useRef, useEffect } from 'react'
import { api } from '../../lib/api'
import { md } from '../../lib/appHelpers'
import WordTap from '../../components/WordTap'
import Dots from '../../components/Dots'
import toast from 'react-hot-toast'

interface Msg { role: 'assistant' | 'user'; text: string }

export default function MathieuPage() {
  const [msgs,  setMsgs]  = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy,  setBusy]  = useState(false)
  const [info,  setInfo]  = useState({ mood: 'jovial', special: '' })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  useEffect(() => { initMathieu() }, [])

  async function initMathieu() {
    if (msgs.length > 0) return
    setBusy(true)
    try {
      const [state, start] = await Promise.all([api.getMathieuState(), api.startMathieu()])
      const mem = state.memory as any
      setInfo({ mood: String(mem?.mood || 'jovial'), special: String(mem?.special || '') })
      const hist = (state.history as any[]).map(m => ({ role: m.role as 'assistant' | 'user', text: m.content || '' }))
      setMsgs(hist.length > 0 ? hist : [{ role: 'assistant', text: start.text }])
    } catch (e) { toast.error(String(e)) }
    finally { setBusy(false) }
  }

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setBusy(true)
    try {
      const res = await api.chatMathieu(text)
      setMsgs(m => [...m, { role: 'assistant', text: res.text }])
    } catch (e) { toast.error(String(e)) }
    finally { setBusy(false) }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-main">
        <div className="chat-header">☕ Chez Mathieu — Canal Saint-Martin</div>
        <div className="chat-msgs">
          {busy && msgs.length === 0 && (
            <div className="chat-row">
              <div className="chat-av m">☕</div>
              <div className="chat-bub m"><Dots color="var(--purple)"/></div>
            </div>
          )}
          {msgs.map((m, i) => m.role === 'assistant' ? (
            <div key={i} className="chat-row">
              <div className="chat-av m">☕</div>
              <div className="chat-bub m md">
                <div className="chat-who m">Mathieu</div>
                <WordTap text={md(m.text)} isHtml style={{display:'block'}} />
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
          <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginBottom:8}}>
            😄 <span style={{color:'var(--green)'}}>{info.mood}</span>
            {info.special && <> · <span style={{color:'var(--purple)'}}>{info.special}</span></>}
          </div>
          <div className="chat-input-row">
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Parlez à Mathieu en français…" disabled={busy} />
            <button className="send-btn" onClick={send} disabled={busy}>→</button>
          </div>
        </div>
      </div>
    </div>
  )
}
