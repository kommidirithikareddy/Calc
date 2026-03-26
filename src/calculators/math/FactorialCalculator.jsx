import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(Number(n).toFixed(8)).toString()
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)

const factorial = n => Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)
const digitsIn = n => String(n).replace(/,/g, '').length
const stirling = n => n <= 1 ? 1 : Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n)

// ─── shared UI ────────────────────────────────────────────────
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

function StepsCard({ steps, color }) {
  const [exp, setExp] = useState(false)
  if (!steps || !steps.length) return null
  const vis = exp ? steps : steps.slice(0, 3)

  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step working</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vis.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: i === steps.length - 1 ? color : color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === steps.length - 1 ? '#fff' : color }}>
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div style={{ fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", fontWeight: i === steps.length - 1 ? 700 : 500, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}` }}>
                {s.math}
              </div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}
        {steps.length > 3 && (
          <button onClick={() => setExp(e => !e)} style={{ padding: '9px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '08', color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {exp ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

function MathInput({ label, value, onChange, hint, color, unit, type = 'number', placeholder }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', transition: 'border-color .15s' }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 16, fontWeight: 600, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        />
        {unit && <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderLeft: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>{unit}</div>}
      </div>
    </div>
  )
}

function FormulaCard({ formula, desc, color }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${color}12,${color}06)`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 20px', marginBottom: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Formula</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{formula}</div>
      {desc && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{desc}</div>}
    </div>
  )
}

function RealWorld({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {items.map((rw, i) => (
        <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 18 }}>{rw.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.field}</span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '0 0 7px', fontFamily: "'DM Sans',sans-serif" }}>{rw.desc}</p>
          <div style={{ fontSize: 10, fontWeight: 600, color: rw.color, padding: '3px 8px', background: rw.color + '15', borderRadius: 6, display: 'inline-block' }}>{rw.example}</div>
        </div>
      ))}
    </div>
  )
}

function MistakesList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 9, background: '#fee2e210', border: '0.5px solid #ef444420' }}>
          <span style={{ fontSize: 14, flexShrink: 0, color: '#ef4444', fontWeight: 700 }}>✗</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{m}</span>
        </div>
      ))}
    </div>
  )
}

function GlossaryCard({ items, color }) {
  const [open, setOpen] = useState(null)
  return (
    <>
      {items.map((g, i) => (
        <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span>
            </div>
            <span style={{ fontSize: 16, color, flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
          </button>
          {open === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>}
        </div>
      ))}
    </>
  )
}

function BigResult({ value, label, unit, color, note }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${color}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>{label || 'Result'}</div>
      <div style={{ fontSize: 48, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1, wordBreak: 'break-all' }}>{value}{unit}</div>
      {note && <div style={{ marginTop: 12, padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>💡 {note}</div>}
    </div>
  )
}

// ─── new enhanced sections ────────────────────────────────────
function MeaningCard({ n, result, color }) {
  return (
    <Sec title="What does this answer mean?" sub="Simple explanation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
          <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{n}!</span> tells you how many different ways <b>{n} distinct things</b> can be arranged in order.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>IN PLAIN ENGLISH</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              If you have {n} people and want to line them up, there are <b style={{ color }}>{result.toLocaleString()}</b> possible orders.
            </div>
          </div>

          <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>WHY IT GETS BIG FAST</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              Each new object creates many new arrangements, so factorial values grow extremely quickly.
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 Think of factorial as a <b>counting machine for orderings</b>.
        </div>
      </div>
    </Sec>
  )
}

function ArrangementVisual({ n, color }) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const items = letters.slice(0, Math.min(n, 4))
  const perms = useMemo(() => {
    const arr = [...items]
    const out = []
    const backtrack = (path, used) => {
      if (out.length >= 8) return
      if (path.length === arr.length) {
        out.push(path.join(' '))
        return
      }
      for (let i = 0; i < arr.length; i++) {
        if (used[i]) continue
        used[i] = true
        backtrack([...path, arr[i]], used)
        used[i] = false
      }
    }
    backtrack([], Array(arr.length).fill(false))
    return out
  }, [n])

  if (n === 0) {
    return (
      <Sec title="Arrangement idea" sub="Why 0! = 1">
        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          With zero objects, there is exactly <b>one</b> arrangement: doing nothing. That is why <b>0! = 1</b>.
        </div>
      </Sec>
    )
  }

  return (
    <Sec title="See it visually" sub="Arrangement examples">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Below are some example orderings for <b>{Math.min(n, 4)}</b> objects. The idea scales up to {n} objects.
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {items.map((ch, i) => (
            <div key={i} style={{ width: 42, height: 42, borderRadius: 10, background: color + '12', border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>
              {ch}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {perms.map((p, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', fontSize: 13, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
              {p}
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 13px', background: '#10b98110', borderRadius: 9, border: '1px solid #10b98125', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          ✅ For {Math.min(n, 4)} objects, every different order counts as a new arrangement.
        </div>
      </div>
    </Sec>
  )
}

function GrowthShockCard({ n, color }) {
  const vals = [1, 2, 3, 4, 5, 6, 7, 8].map(v => ({ n: v, f: factorial(v) }))
  return (
    <Sec title="Why factorial feels huge" sub="Growth shock">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {vals.map((r, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: 10, background: i === vals.length - 1 ? color + '10' : 'var(--bg-raised)', border: `1px solid ${i === vals.length - 1 ? color + '35' : 'var(--border)'}`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>{r.n}!</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: i >= 5 ? color : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.f.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '10px 13px', background: '#f59e0b10', borderRadius: 9, border: '1px solid #f59e0b25', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
        ⚡ Factorial grows much faster than most people expect. Even small changes in n can create massive jumps.
      </div>
    </Sec>
  )
}

function CompareGrowth({ n, color }) {
  const rows = Array.from({ length: Math.min(Math.max(n, 5), 10) }, (_, i) => {
    const v = i + 1
    return { n: v, linear: v, square: v * v, power2: Math.pow(2, v), fact: factorial(v) }
  })

  return (
    <Sec title="Compare growth" sub="n vs n² vs 2ⁿ vs n!">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['n', 'n', 'n²', '2ⁿ', 'n!'].map(h => (
                <th key={h + Math.random()} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '0.5px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--text)' }}>{r.n}</td>
                <td style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--text-2)' }}>{r.linear}</td>
                <td style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--text-2)' }}>{r.square}</td>
                <td style={{ padding: '8px 10px', fontSize: 12.5, color: '#10b981' }}>{r.power2}</td>
                <td style={{ padding: '8px 10px', fontSize: 12.5, color: color, fontWeight: 700 }}>{r.fact.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65 }}>
        Notice how <b style={{ color }}>n!</b> quickly overtakes the others.
      </div>
    </Sec>
  )
}

function ExampleCards({ setNum, color }) {
  const examples = [
    { n: 3, title: '3 books on a shelf', desc: 'How many ways can 3 books be arranged?', ans: '3! = 6 ways', icon: '📚' },
    { n: 4, title: '4 people in a line', desc: 'Each order is different.', ans: '4! = 24 ways', icon: '🧍' },
    { n: 5, title: '5 runners finishing', desc: 'Ranking order matters.', ans: '5! = 120 ways', icon: '🏃' },
    { n: 6, title: '6 unique passwords order', desc: 'Arranging 6 unique symbols.', ans: '6! = 720 ways', icon: '🔐' },
  ]
  return (
    <Sec title="Try a real example" sub="Click a card">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setNum(ex.n)}
            style={{ padding: '14px', borderRadius: 12, border: `1px solid ${color}22`, background: i % 2 === 0 ? color + '08' : 'var(--bg-raised)', textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{ex.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{ex.title}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>{ex.desc}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color, background: color + '14', display: 'inline-block', padding: '4px 8px', borderRadius: 8 }}>{ex.ans}</div>
          </button>
        ))}
      </div>
    </Sec>
  )
}

function QuickFacts({ n, result, color }) {
  const approx = stirling(n)
  return (
    <Sec title="Quick facts" sub="Fast learning">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        {[
          { k: 'Digits', v: digitsIn(result), c: color },
          { k: 'Ends with', v: n >= 5 ? '0' : String(result).slice(-1), c: '#10b981' },
          { k: 'Approx', v: n <= 1 ? '1' : Math.round(approx).toLocaleString(), c: '#f59e0b' },
          { k: 'Zero factorial', v: '0! = 1', c: '#8b5cf6' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${f.c}25`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>{f.k}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: f.c, fontFamily: "'Space Grotesk',sans-serif" }}>{f.v}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function PatternCard({ n, color }) {
  const prev = n > 0 ? factorial(n - 1) : 1
  return (
    <Sec title="Pattern to remember" sub="Recursive idea">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '12px', borderRadius: 10, background: color + '08', border: `1px solid ${color}25` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>MAIN RULE</div>
          <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>
            n! = n × (n − 1)!
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Every factorial builds on the previous one.
          </div>
        </div>

        <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>FOR YOUR INPUT</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>
            {n}! = {n} × {(n - 1)}!
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {n}! = {n} × {prev.toLocaleString()} = <b>{factorial(n).toLocaleString()}</b>
          </div>
        </div>
      </div>
    </Sec>
  )
}

function ChallengeCard({ n, setNum, color }) {
  const [show, setShow] = useState(false)
  const next = Math.min(n + 1, 20)
  const answer = factorial(next)
  return (
    <Sec title="Challenge yourself" sub="Quick thinking quiz">
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>
        If <b>{n}!</b> = <b style={{ color }}>{factorial(n).toLocaleString()}</b>, what should <b>{next}!</b> be?
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          answer,
          answer - next,
          answer + n,
          next * n
        ].map((opt, i) => (
          <button key={i} onClick={() => setShow(true)} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer', textAlign: 'left', fontSize: 12.5, color: 'var(--text-2)' }}>
            {String.fromCharCode(65 + i)}. {Number(opt).toLocaleString()}
          </button>
        ))}
      </div>

      {!show ? (
        <button onClick={() => setShow(true)} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '10', color, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
          Reveal answer
        </button>
      ) : (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#10b98110', border: '1px solid #10b98125', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          ✅ Correct: <b>{next}! = {next} × {n}! = {next} × {factorial(n).toLocaleString()} = {answer.toLocaleString()}</b>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setNum(next)} style={{ padding: '9px 12px', borderRadius: 9, border: `1px solid ${color}25`, background: 'var(--bg-raised)', color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Try {next}! now
        </button>
      </div>
    </Sec>
  )
}

// ═══════════════════════════════════════════════════════════════
//  FACTORIAL CALCULATOR

export default function FactorialCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [num, setNum] = useState(7)
  const [openFaq, setOpenFaq] = useState(null)

  const n = Math.max(0, Math.min(20, Math.round(Number(num) || 0)))
  const factArr = Array.from({ length: n }, (_, i) => i + 1)
  const result = factArr.reduce((a, b) => a * b, 1)

  const steps = [
    { label: 'Write out the factorial', math: n <= 1 ? `${n}! = 1` : `${n}! = ${n} × ${n - 1} × ... × 2 × 1`, note: `n! means multiply all integers from 1 to ${n}` },
    ...(n <= 10
      ? [{ label: 'Expand', math: n === 0 ? 'Empty product = 1' : `${factArr.join(' × ')} = ?`, note: n === 0 ? 'No numbers to multiply' : `Write out every number from 1 to ${n}` }]
      : [{ label: 'Note', math: `${n}! is a large calculation — computed step by step`, note: "For large n, Stirling's approximation gives a good estimate." }]),
    { label: 'Calculate', math: n === 0 ? `0! = 1` : `${factArr.join(' × ')} = ${result.toLocaleString()}`, note: `${n}! = ${result.toLocaleString()}` },
    { label: 'Recursive pattern', math: `${n}! = ${n} × ${(n - 1)}!`, note: n === 0 ? 'Base case: 0! = 1' : 'Every factorial is built from the previous factorial.' },
    { label: 'Notation reminder', math: `0! = 1     1! = 1     2! = 2     n! = n × (n−1)!` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaCard formula="n! = n × (n−1) × (n−2) × ... × 2 × 1     (0! = 1)" desc="The product of all positive integers from 1 to n" color={C} />

      <CalcShell
        left={
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <MathInput label="n (0 to 20)" value={num} onChange={v => setNum(Math.max(0, Math.min(20, Math.round(Number(v) || 0))))} hint="Whole numbers only" color={C} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>
              20! = {(2432902008176640000).toLocaleString()} — factorial gets huge very quickly
            </div>

            <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Quick select</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20].map(v => (
                  <button key={v} onClick={() => setNum(v)} style={{ padding: '8px', borderRadius: 8, border: `1.5px solid ${num === v ? C : 'var(--border-2)'}`, background: num === v ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: num === v ? C : 'var(--text)' }}>
                    {v}!
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        right={
          <>
            <BigResult
              value={result.toLocaleString()}
              label={`${n}! (${n} factorial)`}
              color={C}
              note={n === 0 ? '0! = 1 by definition — the empty product' : n <= 5 ? `${factArr.join(' × ')} = ${result.toLocaleString()}` : `Product of integers 1 through ${n}`}
            />

            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Factorial growth (0! to {Math.min(n, 10)}!)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {Array.from({ length: Math.min(n + 1, 11) }, (_, i) => {
                  const f = factorial(i)
                  const maxF = factorial(Math.min(n, 10))
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, fontSize: 11, fontWeight: 700, color: C, textAlign: 'right' }}>{i}!</div>
                      <div style={{ flex: 1, height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max((f / (maxF || 1)) * 100, 1)}%`, background: i === Math.min(n, 10) ? '#10b981' : C, borderRadius: 6, transition: 'width .4s' }} />
                      </div>
                      <div style={{ width: 70, fontSize: 10, color: 'var(--text-3)', textAlign: 'right' }}>{f.toLocaleString()}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <BreakdownTable
              title="Summary"
              rows={[
                { label: `${n}!`, value: result.toLocaleString(), bold: true, highlight: true, color: C },
                { label: 'Digits', value: String(digitsIn(result)), color: '#10b981' },
                { label: 'Expression', value: n <= 8 ? (n === 0 ? 'Empty product' : factArr.join('×')) : `${n}×${n - 1}×...×1` },
                { label: 'Approx (Stirling)', value: n <= 1 ? '1' : Math.round(stirling(n)).toLocaleString(), color: '#f59e0b' }
              ]}
            />

            <AIHintCard hint={`${n}! = ${result.toLocaleString()}`} />
          </>
        }
      />

      <MeaningCard n={n} result={result} color={C} />
      <ArrangementVisual n={n} color={C} />
      <GrowthShockCard n={n} color={C} />
      <CompareGrowth n={n} color={C} />
      <PatternCard n={n} color={C} />
      <ExampleCards setNum={setNum} color={C} />
      <QuickFacts n={n} result={result} color={C} />
      <StepsCard steps={steps} color={C} />

      <Sec title="Where factorials appear">
        <RealWorld
          items={[
            { icon: '🎲', field: 'Permutations', desc: 'How many ways can 5 people stand in a line? 5! = 120. Ordering matters.', example: '5 people in a queue: 120 orders', color: C },
            { icon: '🃏', field: 'Combinations', desc: 'Factorials are used inside formulas like nCr = n! / (r!(n−r)!).', example: 'C(52,3) = 22,100', color: '#10b981' },
            { icon: '🧮', field: 'Taylor Series', desc: 'Series such as eˣ use factorials in denominators.', example: 'eˣ = 1 + x + x²/2! + ...', color: '#f59e0b' },
            { icon: '📊', field: 'Probability', desc: 'Lottery odds, card arrangements, and ranking problems often involve factorials.', example: 'P(n,r) = n! / (n−r)!', color: '#8b5cf6' }
          ]}
        />
      </Sec>

      <Sec title="Common factorial values" sub="Fast memory table">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(v => (
            <button key={v} onClick={() => setNum(v)} style={{ padding: '12px', borderRadius: 10, border: `1px solid ${C}22`, background: v === n ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>{v}!</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: v === n ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{factorial(v).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </Sec>

      <ChallengeCard n={n} setNum={setNum} color={C} />

      <Sec title="Math words made easy">
        <GlossaryCard
          color={C}
          items={[
            { term: 'Factorial', def: 'A product of all whole numbers from 1 up to n, written as n!.' },
            { term: 'Permutation', def: 'An arrangement where order matters.' },
            { term: 'Recursive rule', def: 'A rule that defines something using a smaller version of itself, like n! = n × (n−1)!.' },
            { term: 'Stirling approximation', def: 'A formula used to estimate large factorials.' },
            { term: 'Empty product', def: 'The product of no numbers at all. By convention, its value is 1.' },
          ]}
        />
      </Sec>

      <Sec title="⚠️ Common mistakes">
        <MistakesList items={[
          'Forgetting that 0! = 1, not 0',
          'Using factorial for negative numbers or decimals in basic school maths',
          'Underestimating how fast factorial grows',
          'Confusing factorial with exponentiation, like 5! vs 5²'
        ]} />
      </Sec>

      <Sec title="Frequently asked questions">
        {[
          {
            q: 'Why does 0! equal 1?',
            a: 'Because it makes important counting formulas work correctly, and it matches the idea of the empty product. If there are zero items to arrange, there is exactly one way to do nothing.'
          },
          {
            q: 'Why does factorial grow so fast?',
            a: 'Each time n increases by 1, you multiply the whole previous factorial by another number. That repeated multiplication causes explosive growth.'
          },
          {
            q: 'Can factorial be used for non-integers?',
            a: 'In elementary maths, factorial is used only for non-negative integers. In advanced maths, the Gamma function extends the idea to non-integers.'
          }
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>
    </div>
  )
}