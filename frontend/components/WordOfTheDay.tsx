'use client'
/**
 * components/WordOfTheDay.tsx
 * Voltaire — Daily vocabulary widget with IPA pronunciation and example sentence
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface WordEntry {
  fr: string
  ipa: string
  en: string
  sentence_fr: string
  sentence_en: string
}

const WORDS: WordEntry[] = [
  { fr: 'bonjour',       ipa: '/bɔ̃.ʒuʁ/',       en: 'hello / good morning',   sentence_fr: 'Bonjour, comment allez-vous ?',                    sentence_en: 'Hello, how are you?' },
  { fr: 'merci',         ipa: '/mɛʁ.si/',         en: 'thank you',              sentence_fr: 'Merci beaucoup pour votre aide.',                   sentence_en: 'Thank you very much for your help.' },
  { fr: "s'il vous plaît", ipa: '/sil.vu.plɛ/',  en: 'please',                  sentence_fr: "Un café, s'il vous plaît.",                         sentence_en: 'A coffee, please.' },
  { fr: 'excusez-moi',   ipa: '/ɛk.sky.ze.mwa/', en: 'excuse me',              sentence_fr: 'Excusez-moi, où est la gare ?',                     sentence_en: 'Excuse me, where is the train station?' },
  { fr: 'bonsoir',       ipa: '/bɔ̃.swaʁ/',       en: 'good evening',           sentence_fr: 'Bonsoir madame, bonsoir monsieur.',                 sentence_en: 'Good evening, madam. Good evening, sir.' },
  { fr: 'au revoir',     ipa: '/o.ʁə.vwaʁ/',     en: 'goodbye',                sentence_fr: 'Au revoir et bonne journée !',                      sentence_en: 'Goodbye and have a nice day!' },
  { fr: 'oui',           ipa: '/wi/',             en: 'yes',                    sentence_fr: 'Oui, je comprends très bien.',                      sentence_en: 'Yes, I understand very well.' },
  { fr: 'non',           ipa: '/nɔ̃/',             en: 'no',                     sentence_fr: 'Non, je ne suis pas libre demain.',                 sentence_en: "No, I'm not free tomorrow." },
  { fr: 'peut-être',     ipa: '/pø.tɛtʁ/',       en: 'maybe / perhaps',        sentence_fr: "Peut-être qu'il viendra ce soir.",                  sentence_en: 'Maybe he will come tonight.' },
  { fr: 'maintenant',    ipa: '/mɛ̃.tə.nɑ̃/',      en: 'now',                    sentence_fr: 'Il faut partir maintenant.',                        sentence_en: 'We must leave now.' },
  { fr: "aujourd'hui",   ipa: "/o.ʒuʁ.d‿ɥi/",   en: 'today',                  sentence_fr: "Aujourd'hui il fait beau.",                         sentence_en: 'Today the weather is nice.' },
  { fr: 'demain',        ipa: '/də.mɛ̃/',          en: 'tomorrow',               sentence_fr: 'Je te verrai demain matin.',                        sentence_en: 'I will see you tomorrow morning.' },
  { fr: 'hier',          ipa: '/jɛʁ/',            en: 'yesterday',              sentence_fr: 'Hier soir, nous sommes allés au théâtre.',           sentence_en: 'Yesterday evening we went to the theatre.' },
  { fr: 'toujours',      ipa: '/tu.ʒuʁ/',         en: 'always',                 sentence_fr: 'Il est toujours en retard.',                         sentence_en: 'He is always late.' },
  { fr: 'jamais',        ipa: '/ʒa.mɛ/',          en: 'never',                  sentence_fr: "Je n'ai jamais visité Paris.",                       sentence_en: 'I have never visited Paris.' },
  { fr: 'encore',        ipa: '/ɑ̃.kɔʁ/',          en: 'again / still',          sentence_fr: "Tu veux encore du gâteau ?",                        sentence_en: 'Do you want more cake?' },
  { fr: 'déjà',          ipa: '/de.ʒa/',           en: 'already',                sentence_fr: "C'est déjà trop tard.",                              sentence_en: "It's already too late." },
  { fr: 'aussi',         ipa: '/o.si/',            en: 'also / too',             sentence_fr: "J'aimerais aussi visiter Lyon.",                     sentence_en: 'I would also like to visit Lyon.' },
  { fr: 'très',          ipa: '/tʁɛ/',             en: 'very',                   sentence_fr: 'Elle est très intelligente.',                        sentence_en: 'She is very intelligent.' },
  { fr: 'bien',          ipa: '/bjɛ̃/',             en: 'well / good',            sentence_fr: 'Il parle très bien français.',                      sentence_en: 'He speaks French very well.' },
  { fr: 'mal',           ipa: '/mal/',             en: 'badly / pain',           sentence_fr: "J'ai mal à la tête.",                               sentence_en: 'I have a headache.' },
  { fr: 'vite',          ipa: '/vit/',             en: 'quickly / fast',         sentence_fr: 'Parle plus vite, je ne comprends pas.',              sentence_en: "Speak faster, I don't understand." },
  { fr: 'lentement',     ipa: '/lɑ̃t.mɑ̃/',         en: 'slowly',                 sentence_fr: 'Pourriez-vous parler plus lentement ?',             sentence_en: 'Could you speak more slowly?' },
  { fr: 'souvent',       ipa: '/su.vɑ̃/',           en: 'often',                  sentence_fr: 'Il mange souvent au restaurant.',                   sentence_en: 'He often eats at a restaurant.' },
  { fr: 'parfois',       ipa: '/paʁ.fwa/',         en: 'sometimes',              sentence_fr: 'Parfois je doute de moi-même.',                     sentence_en: 'Sometimes I doubt myself.' },
  { fr: 'rarement',      ipa: '/ʁaʁ.mɑ̃/',          en: 'rarely',                 sentence_fr: 'Elle sort rarement le weekend.',                     sentence_en: 'She rarely goes out on weekends.' },
  { fr: 'beaucoup',      ipa: '/bo.ku/',           en: 'a lot / very much',      sentence_fr: "J'aime beaucoup le fromage français.",               sentence_en: 'I like French cheese very much.' },
  { fr: 'peu',           ipa: '/pø/',              en: 'little / few',           sentence_fr: "Il mange très peu.",                                sentence_en: 'He eats very little.' },
  { fr: 'assez',         ipa: '/a.se/',            en: 'enough / quite',         sentence_fr: "C'est assez difficile pour moi.",                   sentence_en: "It's quite difficult for me." },
  { fr: 'trop',          ipa: '/tʁo/',             en: 'too much / too many',    sentence_fr: 'Il y a trop de bruit ici.',                         sentence_en: 'There is too much noise here.' },
]

function getDayWord(): WordEntry {
  const dayIndex = Math.floor(Date.now() / 86400000) // days since epoch
  return WORDS[dayIndex % WORDS.length]
}

function getWeekDots(): { dayLabel: string; active: boolean }[] {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `opened_${d.toDateString()}`
    let active = false
    try { active = !!localStorage.getItem(key) } catch { /* ignore */ }
    days.push({ dayLabel: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], active })
  }
  return days
}

function markTodayOpened() {
  try {
    localStorage.setItem(`opened_${new Date().toDateString()}`, '1')
  } catch { /* ignore */ }
}

interface WordOfTheDayProps {
  onAddToQueue?: (word: string) => void
}

export default function WordOfTheDay({ onAddToQueue }: WordOfTheDayProps) {
  const [word] = useState<WordEntry>(getDayWord)
  const [weekDots, setWeekDots] = useState<{ dayLabel: string; active: boolean }[]>([])
  const [added, setAdded] = useState(false)

  useEffect(() => {
    markTodayOpened()
    setWeekDots(getWeekDots())
  }, [])

  function handleAdd() {
    if (added) return
    setAdded(true)
    toast.success(`"${word.fr}" added to review queue!`)
    onAddToQueue?.(word.fr)
  }

  return (
    <motion.div
      className="word-of-day-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6 }}>
            Word of the Day
          </div>
          {/* Main word */}
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{word.fr}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--t3)', fontWeight: 600, marginTop: 4, fontStyle: 'italic' }}>{word.ipa}</div>
          <div style={{ fontSize: '1rem', color: 'var(--blue-b)', fontWeight: 700, marginTop: 4 }}>{word.en}</div>
        </div>

        {/* Week dots */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {weekDots.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: d.active ? 'var(--green)' : 'var(--surface3)',
                  border: `1.5px solid ${d.active ? 'var(--green-b)' : 'var(--border2)'}`,
                  boxShadow: d.active ? '0 0 6px var(--green-glow)' : 'none',
                  transition: 'all .2s',
                }} />
                <div style={{ fontSize: 8, color: 'var(--t4)', fontWeight: 700 }}>{d.dayLabel}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: 'var(--t4)', fontWeight: 700, letterSpacing: '.06em' }}>THIS WEEK</div>
        </div>
      </div>

      {/* Example sentence */}
      <div style={{
        background: 'rgba(79,156,249,.07)', border: '1px solid rgba(79,156,249,.18)',
        borderRadius: 10, padding: '10px 13px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-b)', marginBottom: 4, lineHeight: 1.4 }}>
          {word.sentence_fr}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, fontStyle: 'italic' }}>
          {word.sentence_en}
        </div>
      </div>

      {/* Add to queue */}
      <motion.button
        onClick={handleAdd}
        whileHover={!added ? { scale: 1.02 } : {}}
        whileTap={!added ? { scale: 0.97 } : {}}
        style={{
          width: '100%', padding: '10px 16px',
          borderRadius: 10, border: 'none',
          background: added ? 'var(--green-dim)' : 'var(--blue)',
          color: added ? 'var(--green-b)' : '#fff',
          fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800,
          cursor: added ? 'default' : 'pointer',
          transition: 'all .2s',
          border_: added ? '1.5px solid var(--green)' : 'none',
        } as React.CSSProperties}
        disabled={added}
      >
        {added ? '✓ Added to Review Queue' : '+ Add to Review Queue'}
      </motion.button>
    </motion.div>
  )
}
