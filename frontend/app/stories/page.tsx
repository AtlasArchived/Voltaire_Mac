'use client'
import { useEffect } from 'react'
import { useApp } from '../AppContext'
import StoryPlayer from '../../components/StoryPlayer'

export default function StoriesPage() {
  const { stories, storySession, setStorySession, refreshStoriesList, openStoryCard } = useApp()

  useEffect(() => {
    setStorySession(null)
    void refreshStoriesList()
  }, [])

  if (storySession) {
    return (
      <StoryPlayer
        detail={storySession}
        onClose={() => { setStorySession(null); void refreshStoriesList() }}
        onCompleted={() => { void refreshStoriesList() }}
      />
    )
  }

  return (
    <div style={{height:'100%',overflowY:'auto'}}>
      <div style={{padding:'20px 20px 10px'}}>
        <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:3}}>📚 Paris Immersion</div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--t3)'}}>Dialogues + quiz — Babbel-style scenarios</div>
      </div>
      <div className="cards-grid">
        {stories.map(s => (
          <div key={s.id} className={`story-card${!s.unlocked?' locked':''}`}>
            <div className="s-emoji">{s.emoji || '📚'}</div>
            <div className="s-title">{s.title_fr}</div>
            <div className="s-sub">{s.title_en}</div>
            <span className="s-badge">{s.cefr}</span>
            {(s.progress?.score ?? 0) > 0 && <div className="s-done">✓ Best: {s.progress?.score}%</div>}
            {!s.unlocked && <div className="s-lock">🔒 ELO for {s.cefr}</div>}
            {s.unlocked && (
              <button type="button" className="s-btn" onClick={() => void openStoryCard(s)}>
                {(s.progress?.attempts || 0) > 0 ? '▶ Replay' : '▶ Start'}
              </button>
            )}
          </div>
        ))}
        {stories.length === 0 && (
          <div style={{padding:24,color:'var(--t3)',fontSize:14}}>
            Loading stories… If this stays empty, check the backend.
          </div>
        )}
      </div>
    </div>
  )
}
