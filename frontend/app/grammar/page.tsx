'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { GRAMMAR, CATEGORIES, CEFR_LEVELS } from '../../lib/grammar'
import WordTap from '../../components/WordTap'

export default function GrammarPage() {
  const { weakSkills } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [expand, setExpand] = useState<string | null>(null)
  const primed = { current: false }

  useEffect(() => {
    if (primed.current || weakSkills.length === 0) return
    setSearch(weakSkills[0].skill_tag)
    primed.current = true
  }, [weakSkills])

  const filtered = GRAMMAR.filter(r => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.toLowerCase().includes(search.toLowerCase()) ||
      r.examples.some(e => e.fr.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'All' || r.cefr === filter || r.category === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
        <div style={{fontSize:'1.1rem',fontWeight:800,marginBottom:10}}>📐 Grammar Reference</div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search rules, examples, verbs…"
          style={{width:'100%',background:'var(--surface2)',border:'2px solid var(--border2)',borderRadius:12,color:'var(--text)',fontFamily:'var(--font)',fontSize:14,fontWeight:600,padding:'10px 14px',outline:'none',marginBottom:10}}
          onFocus={e => (e.target.style.borderColor='var(--blue)')}
          onBlur={e  => (e.target.style.borderColor='var(--border2)')}
        />
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['All', ...CEFR_LEVELS, ...CATEGORIES].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1.5px solid',cursor:'pointer',fontFamily:'var(--font)',
                background: filter===f?'var(--blue)':'transparent',
                borderColor: filter===f?'var(--blue)':'var(--border2)',
                color: filter===f?'#fff':'var(--t2)',
                transition:'all .15s'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 20px'}}>
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 20px',color:'var(--t3)',fontSize:14,fontWeight:600}}>
            No results for "{search}"
          </div>
        )}
        {filtered.map(rule => (
          <div key={rule.id}
            style={{marginBottom:10,border:`1.5px solid ${expand===rule.id?'var(--blue)':'var(--border)'}`,borderRadius:14,overflow:'hidden',transition:'border-color .2s',cursor:'pointer'}}
            onClick={() => setExpand(expand===rule.id ? null : rule.id)}>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:expand===rule.id?'var(--blue-dim)':'var(--surface)'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:14,fontWeight:800}}>{rule.title}</span>
                  <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:99,background:'var(--surface3)',color:'var(--t2)',border:'1px solid var(--border)'}}>
                    {rule.cefr}
                  </span>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--t3)'}}>{rule.category}</span>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{rule.summary}</div>
              </div>
              <div style={{fontSize:16,color:'var(--t3)',transform:expand===rule.id?'rotate(90deg)':'none',transition:'transform .2s'}}>›</div>
            </div>
            {expand === rule.id && (
              <div style={{padding:'14px 16px',borderTop:'1px solid var(--border)',background:'var(--surface2)'}}>
                {rule.examples.map((ex, i) => (
                  <div key={i} style={{marginBottom:12,padding:'10px 14px',background:'var(--surface3)',borderRadius:10}}>
                    <div style={{fontSize:15,fontWeight:800,color:'var(--blue-b)',marginBottom:3}}>
                      <WordTap text={ex.fr} />
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{ex.en}</div>
                    {ex.note && <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',marginTop:4,fontStyle:'italic'}}>{ex.note}</div>}
                  </div>
                ))}
                {rule.tip && (
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
  )
}
