import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const ZONES = [
  { id: 'UTC-8',  label: 'Los Angeles (PT)',  offset: -8 },
  { id: 'UTC-7',  label: 'Denver (MT)',        offset: -7 },
  { id: 'UTC-6',  label: 'Chicago (CT)',       offset: -6 },
  { id: 'UTC-5',  label: 'New York (ET)',      offset: -5 },
  { id: 'UTC-3',  label: 'São Paulo (BRT)',    offset: -3 },
  { id: 'UTC+0',  label: 'London (GMT/UTC)',   offset: 0 },
  { id: 'UTC+1',  label: 'Paris (CET)',        offset: 1 },
  { id: 'UTC+2',  label: 'Cairo (EET)',        offset: 2 },
  { id: 'UTC+3',  label: 'Moscow / Dubai',     offset: 3 },
  { id: 'UTC+5.5',label: 'Mumbai (IST)',       offset: 5.5 },
  { id: 'UTC+7',  label: 'Bangkok (ICT)',      offset: 7 },
  { id: 'UTC+8',  label: 'Beijing / Singapore',offset: 8 },
  { id: 'UTC+9',  label: 'Tokyo (JST)',        offset: 9 },
  { id: 'UTC+10', label: 'Sydney (AEST)',      offset: 10 },
  { id: 'UTC+12', label: 'Auckland (NZST)',    offset: 12 },
]

function fmt12(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function getColor(h) {
  if (h >= 22 || h < 7) return { bg: '#1e1b4b', text: '#818cf8', label: 'Night 🌙' }
  if (h < 9) return { bg: '#fef3c7', text: '#92400e', label: 'Early morning 🌅' }
  if (h < 12) return { bg: '#d1fae5', text: '#065f46', label: 'Morning ☀️' }
  if (h < 17) return { bg: '#dbeafe', text: '#1e40af', label: 'Afternoon 🌤️' }
  if (h < 20) return { bg: '#fef3c7', text: '#92400e', label: 'Evening 🌇' }
  return { bg: '#e0e7ff', text: '#3730a3', label: 'Night 🌆' }
}

const FAQ = [
  { q: 'What is UTC and how does it relate to time zones?', a: 'UTC (Coordinated Universal Time) is the world\'s primary time standard. All time zones are expressed as UTC offsets — for example, New York is UTC−5 in winter and UTC−4 in summer (daylight saving). UTC never changes; it is the universal reference point.' },
  { q: 'How do I find a meeting time that works for multiple time zones?', a: 'Identify overlap in normal working hours (9am–6pm) for all participants. For US-to-Europe calls, mid-morning US Eastern (9–11am ET = 2–4pm London) usually works. For US-to-Asia, early morning US time often means end of business in Asia.' },
  { q: 'What is daylight saving time and which countries observe it?', a: 'Daylight saving time (DST) shifts clocks forward by 1 hour in spring and back in autumn. The US, Canada, most of Europe, and some other countries observe DST. Most of Asia, Africa, India, and China do not. This means UTC offsets for DST countries change twice a year.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function TimezoneConverter({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [sourceZone, setSourceZone] = useState('UTC-5')
  const [hour, setHour] = useState(10)
  const [minute, setMinute] = useState(0)
  const [selected, setSelected] = useState(['UTC-5', 'UTC+0', 'UTC+5.5', 'UTC+8'])
  const [openFaq, setOpenFaq] = useState(null)

  const sourceOffset = ZONES.find(z => z.id === sourceZone)?.offset ?? 0
  const sourceUTC = hour - sourceOffset

  const times = ZONES.filter(z => selected.includes(z.id)).map(z => {
    let h = (sourceUTC + z.offset) % 24
    if (h < 0) h += 24
    const localH = Math.floor(h)
    const localM = minute
    const info = getColor(localH)
    const isSource = z.id === sourceZone
    const diff = z.offset - sourceOffset
    return { ...z, localH, localM, info, isSource, diff }
  })

  const hint = `${fmt12(hour, minute)} in ${ZONES.find(z => z.id === sourceZone)?.label} = ${times.filter(t => !t.isSource).map(t => `${fmt12(t.localH, t.localM)} in ${t.label}`).join(', ')}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Timezone Converter</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Convert any time across {ZONES.length} time zones</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Source time zone</label>
            <select value={sourceZone} onChange={e => setSourceZone(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {ZONES.map(z => <option key={z.id} value={z.id}>{z.label} ({z.id})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Time</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" min="0" max="23" value={hour} onChange={e => setHour(Math.min(23, Math.max(0, +e.target.value)))}
                style={{ width: 80, height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif" }} />
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-2)' }}>:</span>
              <input type="number" min="0" max="59" value={minute} onChange={e => setMinute(Math.min(59, Math.max(0, +e.target.value)))}
                style={{ width: 80, height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif" }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {[9, 12, 14, 17].map(h => (
                <button key={h} onClick={() => setHour(h)}
                  style={{ padding: '4px 10px', borderRadius: 7, border: `1px solid ${hour === h ? C : 'var(--border-2)'}`, background: hour === h ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: hour === h ? C : 'var(--text-2)', cursor: 'pointer' }}>{fmt12(h, 0)}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Show these time zones</label>
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ZONES.map(z => (
                <button key={z.id} onClick={() => {
                  if (selected.includes(z.id)) { if (selected.length > 1) setSelected(selected.filter(s => s !== z.id)) }
                  else { setSelected([...selected, z.id]) }
                }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7, border: `1px solid ${selected.includes(z.id) ? C + '60' : 'var(--border)'}`, background: selected.includes(z.id) ? C + '10' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${selected.includes(z.id) ? C : 'var(--border-2)'}`, background: selected.includes(z.id) ? C : 'transparent', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{z.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{z.id}</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          {times.map((t, i) => (
            <div key={i} style={{ background: t.isSource ? C + '12' : 'var(--bg-raised)', border: `1px solid ${t.isSource ? C + '40' : 'var(--border)'}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: t.isSource ? C : 'var(--text-3)', fontWeight: t.isSource ? 700 : 400, marginBottom: 3 }}>{t.label} {t.isSource ? '(source)' : ''}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: t.isSource ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt12(t.localH, t.localM)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {!t.isSource && (t.diff > 0 ? `+${t.diff}h` : `${t.diff}h`) + ' from source'}
                  </div>
                </div>
                <div style={{ padding: '4px 8px', borderRadius: 8, background: t.info.bg, fontSize: 11, color: t.info.text, fontWeight: 600 }}>{t.info.label}</div>
              </div>
            </div>
          ))}
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
