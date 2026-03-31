import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const PAN_TYPES = [
  { id: 'round8',   label: '8" Round',      vol: 25.13,  note: '2 layers = standard 9" round' },
  { id: 'round9',   label: '9" Round',       vol: 31.81,  note: 'Standard layer cake pan' },
  { id: 'sq8',      label: '8" Square',      vol: 38.4,   note: 'Standard brownie pan' },
  { id: 'sq9',      label: '9" Square',      vol: 48.6,   note: 'Common baking square' },
  { id: 'rect9x13', label: '9×13" Rectangle',vol: 117,    note: 'Sheet cake / casserole' },
  { id: 'loaf9x5',  label: '9×5" Loaf',      vol: 66,     note: 'Standard bread loaf' },
  { id: 'bundt',    label: 'Bundt (12 cup)',  vol: 96,     note: 'Decorative tube pan' },
  { id: 'tube10',   label: '10" Tube',        vol: 113,    note: 'Angel food cake pan' },
  { id: 'muffin12', label: '12-cup Muffin',   vol: 36,     note: 'Standard muffin tin (3 tbsp/cup)' },
  { id: 'springform9', label: '9" Springform', vol: 50.5,  note: 'Cheesecake / torte' },
]

const FAQ = [
  { q: 'Can I bake a round cake recipe in a square pan?', a: 'Yes — an 8" round pan and an 8" square pan hold similar volumes (about 25 vs 38 cu in respectively). The square pan holds more, so your cake will be slightly thinner and cook faster. Check for doneness 5–10 minutes earlier.' },
  { q: 'How does altitude affect baking?', a: 'At high altitude (above 3,500 ft), lower air pressure causes baked goods to rise faster and then collapse. Gases in leavening expand more. Moisture evaporates faster. Adjustments include reducing baking powder, increasing flour slightly, and adding a bit more liquid. Oven temperature can be raised by 15–25°F.' },
  { q: 'Why does batter depth matter?', a: 'The same batter in a shallow wide pan cooks faster than in a deep narrow pan. When substituting pans, if the batter will be deeper in the new pan, add 5–15 minutes of cooking time and check with a toothpick. If shallower, reduce time by 5–10 minutes.' },
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

export default function BakingCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [fromPan, setFromPan] = useState('round9')
  const [toPan, setToPan] = useState('rect9x13')
  const [altitude, setAltitude] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const fpan = PAN_TYPES.find(p => p.id === fromPan)
  const tpan = PAN_TYPES.find(p => p.id === toPan)
  const ratio = tpan ? fpan.vol / tpan.vol : 1
  const deeper = ratio > 1
  const timeAdj = deeper ? `+${Math.round((ratio - 1) * 15)} min` : ratio < 0.85 ? `-${Math.round((1 - ratio) * 10)} min` : 'Same'

  // Altitude adjustments
  const altAdjustments = altitude >= 3500 ? [
    `Reduce baking powder/soda by ${altitude >= 7000 ? '50%' : '25%'}`,
    `Increase flour by ${altitude >= 7000 ? '4 tbsp' : '2 tbsp'} per cup`,
    `Increase liquid by ${altitude >= 7000 ? '3-4 tbsp' : '1-2 tbsp'} per cup`,
    `Raise oven temp by ${altitude >= 7000 ? '25°F' : '15°F'}`,
    'Reduce sugar by 1-3 tbsp per cup for very sweet recipes',
  ] : []

  const hint = `Substituting ${fpan.label} for ${tpan.label}: fill factor ${(ratio * 100).toFixed(0)}%. Time adjustment: ${timeAdj}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Pan Substitution</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Fill ratio = Original pan volume ÷ New pan volume</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 24, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{(ratio * 100).toFixed(0)}% fill</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Recipe calls for</label>
            <select value={fromPan} onChange={e => setFromPan(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {PAN_TYPES.map(p => <option key={p.id} value={p.id}>{p.label} ({p.vol} cu in)</option>)}
            </select>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Volume: {fpan.vol} cubic inches — {fpan.note}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>I have this pan instead</label>
            <select value={toPan} onChange={e => setToPan(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {PAN_TYPES.map(p => <option key={p.id} value={p.id}>{p.label} ({p.vol} cu in)</option>)}
            </select>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Volume: {tpan.vol} cubic inches — {tpan.note}</div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Altitude (ft)</label>
            <input type="number" step="500" min="0" value={altitude} onChange={e => setAltitude(+e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{altitude < 3500 ? 'Sea level — no adjustment needed' : altitude < 7000 ? 'Moderate altitude — see adjustments' : 'High altitude — significant adjustments needed'}</div>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Pan substitution result</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{fpan.label} → {tpan.label}</div>
            <div style={{ padding: '12px 14px', background: ratio > 1.2 ? '#fee2e220' : ratio < 0.8 ? '#fef3c720' : '#d1fae520', borderRadius: 10, border: `1px solid ${ratio > 1.2 ? '#ef444430' : ratio < 0.8 ? '#f59e0b30' : '#10b98130'}`, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ratio > 1.2 ? '#ef4444' : ratio < 0.8 ? '#f59e0b' : '#10b981', marginBottom: 4 }}>
                {ratio > 1.3 ? '⚠️ Batter will overflow — use less batter or 2 pans' : ratio < 0.7 ? '⚠️ Batter will be very shallow — significantly reduce time' : ratio > 1.05 ? 'Batter will be deeper — add some time' : '✓ Good substitution — minimal adjustment needed'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Fill level: {(ratio * 100).toFixed(0)}% of new pan capacity</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ l: 'Original volume', v: `${fpan.vol} cu in` }, { l: 'New pan volume', v: `${tpan.vol} cu in` }, { l: 'Fill ratio', v: `${(ratio * 100).toFixed(0)}%`, c: C }, { l: 'Time adjustment', v: timeAdj, c: C }].map((m, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          {altAdjustments.length > 0 && (
            <div style={{ background: '#fef3c720', border: '0.5px solid #f59e0b30', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>⛰️ HIGH ALTITUDE ADJUSTMENTS ({altitude.toLocaleString()} ft)</div>
              {altAdjustments.map((a, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>· {a}</div>)}
            </div>
          )}

          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
