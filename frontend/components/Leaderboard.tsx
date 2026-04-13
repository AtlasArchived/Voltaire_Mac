'use client'
/**
 * components/Leaderboard.tsx
 * Voltaire — Weekly leaderboard with animated stagger rows
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLeaderboard, LeaderboardEntry } from '../lib/api'

type Tab = 'week' | 'alltime' | 'friends'

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: '1.4rem' }}>🥇</span>
  if (rank === 2) return <span style={{ fontSize: '1.4rem' }}>🥈</span>
  if (rank === 3) return <span style={{ fontSize: '1.4rem' }}>🥉</span>
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--surface3)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color: 'var(--t2)',
    }}>
      {rank}
    </span>
  )
}

function RankRowStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { background: 'rgba(255,215,0,.10)', borderColor: 'rgba(255,215,0,.35)' }
  if (rank === 2) return { background: 'rgba(192,192,192,.09)', borderColor: 'rgba(192,192,192,.3)' }
  if (rank === 3) return { background: 'rgba(205,127,50,.09)', borderColor: 'rgba(205,127,50,.3)' }
  return {}
}

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>('week')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const period = tab === 'alltime' ? 'alltime' : 'week'
    getLeaderboard(period)
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tab])

  const currentUser = entries.find(e => e.isCurrentUser)
  const inTop10 = currentUser ? currentUser.rank <= 10 : false

  const TAB_LABELS: Record<Tab, string> = {
    week: 'This Week',
    alltime: 'All Time',
    friends: 'Friends',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Leaderboard</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>Top French learners</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['week', 'alltime', 'friends'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px', borderRadius: 99,
                fontSize: 12, fontWeight: 800,
                border: `1.5px solid ${tab === t ? 'var(--blue)' : 'var(--border2)'}`,
                background: tab === t ? 'var(--blue)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--t2)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all .15s',
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Friends coming soon overlay */}
      <AnimatePresence mode="wait">
        {tab === 'friends' ? (
          <motion.div
            key="friends-soon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: 32,
            }}
          >
            <div style={{ fontSize: '3rem' }}>🤝</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Friends Leaderboard</div>
            <div
              style={{
                background: 'var(--amber-dim)', border: '1.5px solid var(--amber)',
                borderRadius: 10, padding: '8px 20px',
                fontSize: 13, fontWeight: 800, color: 'var(--amber)',
              }}
            >
              Coming Soon
            </div>
            <div style={{ fontSize: 13, color: 'var(--t3)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
              Compete with friends on your French learning journey. Social features are on the way!
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, overflowY: 'auto', padding: '8px 0 80px' }}
          >
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--t3)', fontSize: 14 }}>
                Loading leaderboard…
              </div>
            ) : (
              <>
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry.rank}
                    className={`leaderboard-row${entry.isCurrentUser ? ' is-current-user' : ''}`}
                    style={RankRowStyle(entry.rank)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.055, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Rank */}
                    <div style={{ width: 36, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                      <RankIcon rank={entry.rank} />
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 800,
                        color: entry.isCurrentUser ? 'var(--blue-b)' : 'var(--text)',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 7px',
                            background: 'var(--blue-dim)', color: 'var(--blue-b)',
                            border: '1px solid var(--blue)', borderRadius: 99,
                          }}>
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP */}
                    <div style={{
                      fontSize: 14, fontWeight: 900,
                      color: entry.rank <= 3 ? 'var(--amber)' : 'var(--text)',
                      flexShrink: 0,
                    }}>
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </motion.div>
                ))}

                {/* Sticky current user row if not in top 10 */}
                {currentUser && !inTop10 && (
                  <div style={{
                    position: 'sticky', bottom: 0,
                    background: 'var(--surface)', borderTop: '2px solid var(--blue)',
                    padding: '0',
                  }}>
                    <div
                      className="leaderboard-row is-current-user"
                      style={{ margin: 0, borderRadius: 0 }}
                    >
                      <div style={{ width: 36, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        <RankIcon rank={currentUser.rank} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-b)' }}>
                          {currentUser.name} <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700 }}>(You)</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--amber)' }}>
                        {currentUser.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
