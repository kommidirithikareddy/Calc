import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const fmtP = n => (isNaN(n) || !isFinite(n)) ? '—' : (n * 100).toFixed(4) + '%'

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
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function Inp({ label, value, onChange, color, hint, min = 0, max }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          onFocus={() => sf(true)} onBlur={() => sf(false)} min={min} max={max}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
      </div>
    </div>
  )
}

// Probability bar visual
function ProbBar({ label, value, color, max = 1 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmtP(value)}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

const SCENARIOS = [
  { label: 'Coin flip — heads', favorable: 1, total: 2 },
  { label: 'Die — roll a 6', favorable: 1, total: 6 },
  { label: 'Die — roll even', favorable: 3, total: 6 },
  { label: 'Card — ace from deck', favorable: 4, total: 52 },
  { label: 'Card — heart', favorable: 13, total: 52 },
]

const FAQ = [
  { q: 'What is probability?', a: 'Probability measures how likely an event is to occur, expressed as a number between 0 (impossible) and 1 (certain). P(A) = favorable outcomes / total outcomes for equally likely outcomes. A probability of 0.25 means the event happens 25% of the time in the long run.' },
  { q: 'What is the complement rule?', a: "P(not A) = 1 − P(A). If there's a 30% chance of rain, there's a 70% chance of no rain. The complement is the probability of the event NOT happening. Together, P(A) + P(not A) = 1 always." },
  { q: 'What is the addition rule?', a: "For mutually exclusive events (can't both happen): P(A or B) = P(A) + P(B). For non-exclusive events: P(A or B) = P(A) + P(B) − P(A and B). The subtraction removes double-counting of outcomes in both A and B." },
  { q: 'What is conditional probability?', a: 'P(A|B) = probability of A given B has occurred = P(A and B) / P(B). Example: probability a card is a heart given it is red = P(heart and red) / P(red) = (13/52) / (26/52) = 0.5.' },
  { q: 'What is the difference between theoretical and empirical probability?', a: 'Theoretical probability is calculated from logic (P(heads) = 1/2). Empirical probability is measured from experiments (flip 1000 coins, count heads). By the Law of Large Numbers, empirical probability approaches theoretical as trials increase.' },
]

export default function ProbabilityCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [favorable, setFavorable] = useState(1)
  const [total, setTotal] = useState(6)
  const [pA, setPA] = useState(0.4)
  const [pB, setpB] = useState(0.3)
  const [pAandB, setPAandB] = useState(0.1)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)
  const [simFlips, setSimFlips] = useState(null)
  const [simCount, setSimCount] = useState(100)

  const p = total > 0 ? Math.min(1, favorable / total) : 0
  const complement = 1 - p
  const odds_for = total > 0 ? `${favorable}:${total - favorable}` : '—'
  const odds_against = total > 0 ? `${total - favorable}:${favorable}` : '—'
  const pOrB = Math.min(1, pA + pB - pAandB)
  const pAgivenB = pB > 0 ? pAandB / pB : 0
  const pBgivenA = pA > 0 ? pAandB / pA : 0

  // Coin flip simulator
  function simulate() {
    const results = Array.from({ length: simCount }, () => Math.random() < p ? 1 : 0)
    const heads = results.reduce((a, v) => a + v, 0)
    setSimFlips({ heads, tails: simCount - heads, empirical: heads / simCount })
  }

  // Venn SVG
  const W = 240, H = 120
  const r = 45, cx1 = 80, cx2 = 160, cy = 60

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Probability Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>P(A) = favorable / total</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>0 ≤ P(A) ≤ 1 · Impossible = 0 · Certain = 1</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>P(A)</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(p)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtP(p)}</div>
        </div>
      </div>

      {/* Quick scenarios */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Common scenarios — click to load</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {SCENARIOS.map((sc, i) => (
            <button key={i} onClick={() => { setFavorable(sc.favorable); setTotal(sc.total) }}
              style={{ padding: '9px 6px', borderRadius: 10, border: `1.5px solid ${favorable === sc.favorable && total === sc.total ? C : 'var(--border-2)'}`, background: favorable === sc.favorable && total === sc.total ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C, marginBottom: 2 }}>{sc.favorable}/{sc.total}</div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', lineHeight: 1.3 }}>{sc.label}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
            Basic Probability P(A) = k/n
          </div>
          <Inp label="Favorable outcomes (k)" value={favorable} onChange={setFavorable} color={C} hint="successes" min={0} />
          <Inp label="Total outcomes (n)" value={total} onChange={setTotal} color={C} hint="sample space" min={1} />

          {/* Visual probability gauge */}
          <div style={{ padding: '14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Probability gauge</div>
            <div style={{ position: 'relative', height: 18, background: 'var(--bg-raised)', borderRadius: 9, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${p * 100}%`, background: `linear-gradient(90deg,${C}80,${C})`, borderRadius: 9, transition: 'width .5s' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>{fmtP(p)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-3)' }}>
              <span>0% (impossible)</span><span>50%</span><span>100% (certain)</span>
            </div>
          </div>

          {/* Combine probabilities section */}
          <div style={{ paddingTop: 12, borderTop: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Combine Events P(A) & P(B)</div>
            <Inp label="P(A)" value={pA} onChange={setPA} color={C} hint="0 to 1" min={0} max={1} />
            <Inp label="P(B)" value={pB} onChange={setpB} color={C} hint="0 to 1" min={0} max={1} />
            <Inp label="P(A ∩ B)" value={pAandB} onChange={setPAandB} color={C} hint="P(both)" min={0} max={1} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => { setFavorable(1); setTotal(6); setPA(0.4); setpB(0.3); setPAandB(0.1) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>P(A) = {favorable}/{total}</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(p)}</div>
            <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>{fmtP(p)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <div style={{ padding: '10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Complement P(Aᶜ)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(complement)}</div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>As fraction</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{favorable}/{total}</div>
              </div>
            </div>
          </div>

          {/* Venn diagram */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Event relationships (Venn diagram)</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <circle cx={cx1} cy={cy} r={r} fill={C + '30'} stroke={C} strokeWidth="1.5" />
              <circle cx={cx2} cy={cy} r={r} fill="#10b98130" stroke="#10b981" strokeWidth="1.5" />
              <text x={cx1 - 20} y={cy + 4} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">A</text>
              <text x={cx2 + 20} y={cy + 4} textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="700">B</text>
              <text x={(cx1 + cx2) / 2} y={cy + 4} textAnchor="middle" fontSize="9" fill="var(--text)" fontWeight="700">A∩B</text>
              <text x={cx1 - 10} y={H - 8} textAnchor="middle" fontSize="9" fill={C}>{fmtP(pA)}</text>
              <text x={cx2 + 10} y={H - 8} textAnchor="middle" fontSize="9" fill="#10b981">{fmtP(pB)}</text>
              <text x={(cx1 + cx2) / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text)">{fmtP(pAandB)}</text>
            </svg>
          </div>

          <BreakdownTable title="All Results" rows={[
            { label: 'P(A) = k/n', value: `${fmt(p)} (${fmtP(p)})`, bold: true, color: C, highlight: true },
            { label: 'P(Aᶜ) complement', value: `${fmt(complement)} (${fmtP(complement)})`, color: '#ef4444' },
            { label: 'Odds for A', value: odds_for },
            { label: 'Odds against A', value: odds_against },
            { label: 'P(A ∪ B)', value: fmtP(pOrB), color: C },
            { label: 'P(A | B)', value: fmtP(pAgivenB), note: 'conditional' },
            { label: 'P(B | A)', value: fmtP(pBgivenA), note: 'conditional' },
          ]} />
          <AIHintCard hint={`P(A) = ${favorable}/${total} = ${fmt(p)} (${fmtP(p)}). Complement P(Aᶜ) = ${fmt(complement)}. Odds: ${odds_for} in favour. P(A∪B) = ${fmtP(pOrB)}.`} color={C} />
        </>}
      />

      {/* ── INTERACTIVE: Probability Simulator ── */}
      <Sec title="🎲 Interactive Simulator — Run Experiments" sub="Monte Carlo simulation">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
          Run a simulation using your probability P = {fmt(p)} to see how closely random experiments match the theoretical value. This demonstrates the Law of Large Numbers.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {[10, 50, 100, 500, 1000, 10000].map(k => (
            <button key={k} onClick={() => { setSimCount(k); setSimFlips(null) }}
              style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1.5px solid', borderColor: simCount === k ? C : 'var(--border)', background: simCount === k ? C : 'var(--bg-raised)', color: simCount === k ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>{k} trials</button>
          ))}
        </div>
        <button onClick={simulate} style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
          ▶ Run {simCount.toLocaleString()} Trials
        </button>
        {simFlips && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[['Success', simFlips.heads, C], ['Failure', simFlips.tails, '#ef4444'], ['Empirical P', simFlips.empirical, '#10b981']].map(([label, val, col]) => (
                <div key={label} style={{ padding: '12px', background: col + '10', borderRadius: 10, border: `1px solid ${col}25`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{typeof val === 'number' && val < 1 ? fmtP(val) : val.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Theoretical P</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C }}>{fmtP(p)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Empirical P</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{fmtP(simFlips.empirical)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Difference</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: Math.abs(simFlips.empirical - p) < 0.05 ? '#10b981' : '#f59e0b' }}>{fmtP(Math.abs(simFlips.empirical - p))}</span>
              </div>
            </div>
          </div>
        )}
      </Sec>

      {/* ── INTERACTIVE: Probability Scale ── */}
      <Sec title="📊 Probability Scale — Common Events" sub="Where does your probability sit?">
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{ height: 12, background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`, borderRadius: 6, marginBottom: 8 }} />
          <div style={{ position: 'relative', height: 24 }}>
            <div style={{ position: 'absolute', left: `${p * 100}%`, transform: 'translateX(-50%)', transition: 'left .4s' }}>
              <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `12px solid ${C}`, marginBottom: 2 }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: C, textAlign: 'center', whiteSpace: 'nowrap' }}>{fmtP(p)}</div>
            </div>
          </div>
        </div>
        {[
          { label: 'Lightning strike in a year', p: 0.000067, color: '#ef4444' },
          { label: 'Rolling a 6 on a die', p: 1 / 6, color: '#f59e0b' },
          { label: 'Coin lands heads', p: 0.5, color: '#10b981' },
          { label: 'Drawing a red card', p: 0.5, color: C },
          { label: 'Sun rises tomorrow', p: 0.9999, color: '#6366f1' },
        ].map((ev, i) => <ProbBar key={i} label={ev.label} value={ev.p} color={ev.color} />)}
        <div style={{ padding: '10px 14px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C }}>Your event P = {fmtP(p)}</div>
          <ProbBar label="Your event" value={p} color={C} />
        </div>
      </Sec>

      {/* ── INTERACTIVE: Probability Rules Explorer ── */}
      <Sec title="🔀 Probability Rules — Interactive Explorer" sub="Set P(A), P(B), P(A∩B) to explore all rules">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { rule: 'P(A)', value: pA, color: C, note: 'Event A alone' },
            { rule: 'P(B)', value: pB, color: '#10b981', note: 'Event B alone' },
            { rule: 'P(A ∩ B)', value: pAandB, color: '#f59e0b', note: 'Both A and B' },
            { rule: 'P(A ∪ B)', value: Math.min(1, pA + pB - pAandB), color: '#8b5cf6', note: 'A or B or both' },
            { rule: 'P(A | B)', value: pAgivenB, color: '#ef4444', note: 'A given B occurred' },
            { rule: 'P(Aᶜ)', value: 1 - pA, color: '#6366f1', note: 'Not A' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: 10, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>{r.rule}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: r.color, fontFamily: "'Space Grotesk',sans-serif" }}>{fmtP(r.value)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{r.note}</div>
            </div>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Rule', 'Formula', 'Value'].map(h => (
              <th key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[
                ['Complement', 'P(Aᶜ) = 1 − P(A)', fmtP(1 - pA)],
                ['Addition', 'P(A∪B) = P(A)+P(B)−P(A∩B)', fmtP(Math.min(1, pA + pB - pAandB))],
                ['Multiplication (indep)', 'P(A∩B) = P(A)·P(B)', fmtP(pA * pB)],
                ['Conditional A|B', 'P(A|B) = P(A∩B)/P(B)', fmtP(pAgivenB)],
                ['Conditional B|A', 'P(B|A) = P(A∩B)/P(A)', fmtP(pBgivenA)],
                ['Total probability', 'P(A) = P(A|B)P(B)+P(A|Bᶜ)P(Bᶜ)', '—'],
              ].map(([rule, formula, val], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: C, borderBottom: '0.5px solid var(--border)' }}>{rule}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{formula}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Real world */}
      <Sec title="Probability in real life">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🏥', title: 'Medicine', desc: 'Drug efficacy: P(recovery | drug) vs P(recovery | no drug). Clinical trials use probability to determine if treatments work beyond chance.', color: C },
            { icon: '🌦️', title: 'Weather', desc: '70% chance of rain = rain on 70% of days with these atmospheric conditions. Not certainty — probability. Meteorologists use Bayesian updating.', color: '#10b981' },
            { icon: '📈', title: 'Finance', desc: 'P(stock rises) based on historical data. Options pricing uses probability distributions. VaR (Value at Risk) is a probability statement about losses.', color: '#f59e0b' },
            { icon: '🔐', title: 'Cryptography', desc: 'P(guess password) = 1/n where n = keyspace. A 256-bit key has P = 1/2²⁵⁶ — effectively impossible to crack by brute force.', color: '#8b5cf6' },
          ].map((rw, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 18 }}>{rw.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.title}</span></div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{rw.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms" sub="Tap to expand">
        {[
          { term: 'Sample space (Ω)', def: 'The set of all possible outcomes of an experiment. Rolling a die: Ω = {1,2,3,4,5,6}.' },
          { term: 'Event', def: 'A subset of the sample space. "Rolling an even number" = {2,4,6}.' },
          { term: 'Mutually exclusive', def: 'Events that cannot occur simultaneously. P(A∩B)=0. Rolling a 2 and rolling a 5 on one die.' },
          { term: 'Independent events', def: 'P(A∩B) = P(A)·P(B). Knowing A occurred tells you nothing about B. Two coin flips are independent.' },
          { term: 'Conditional probability', def: 'P(A|B) = probability of A given B has occurred. Updates probability using new information.' },
        ].map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setGl(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C, flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span></div>
              <span style={{ fontSize: 16, color: C, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px' }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
