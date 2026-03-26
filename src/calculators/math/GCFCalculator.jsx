import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(Number(n).toFixed(8)).toString()
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)

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
    <div style={{ background: `linear-gradient(135deg,${color}12,${color}06)`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 20px' }}>
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

function ExampleChip({ value, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--border-2)',
        background: 'var(--bg-raised)',
        cursor: 'pointer',
        textAlign: 'left',
        minHeight: 62
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)' }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.35 }}>{label}</span>
    </button>
  )
}

function QuickLearnCard({ color }) {
  return (
    <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: `linear-gradient(135deg, ${color}0f, ${color}05)`, border: `1px solid ${color}22` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
        GCF and LCM explained
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '10px 11px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>GCF</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            The <b>greatest common factor</b> is the biggest number that divides all inputs exactly.
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
            Best for: equal groups, simplifying fractions
          </div>
        </div>

        <div style={{ padding: '10px 11px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>LCM</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            The <b>least common multiple</b> is the smallest number that all inputs divide into exactly.
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
            Best for: repeating schedules, common meeting point
          </div>
        </div>
      </div>
    </div>
  )
}

function MeaningCard({ nums, gcfVal, lcmVal, color }) {
  if (!nums.length || gcfVal == null) return null

  return (
    <Sec title="What does this answer mean?" sub="Simple explanation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
          The <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>GCF is {gcfVal}</span>, which means <b>{gcfVal}</b> is the biggest number that can divide all your numbers exactly.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>GCF IDEA</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              It tells you the biggest equal group size you can make from all inputs.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>LCM IDEA</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              The LCM is <b style={{ color: '#10b981' }}>{lcmVal}</b>, the smallest number that all your inputs fit into exactly.
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: color + '08', borderRadius: 10, border: `1px solid ${color}20`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          <b style={{ color: 'var(--text)' }}>In plain English:</b> GCF helps when you want to <b>split equally</b>. LCM helps when you want things to <b>line up again</b>.
        </div>
      </div>
    </Sec>
  )
}

function CommonFactorChips({ commonFactors, gcfVal, color }) {
  if (!commonFactors.length) return null
  return (
    <Sec title="Common factors" sub="All shared factors">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {commonFactors.map(f => (
          <div key={f} style={{ padding: '6px 12px', borderRadius: 20, background: f === gcfVal ? color + '18' : 'var(--bg-raised)', border: `1px solid ${f === gcfVal ? color + '45' : 'var(--border)'}`, fontSize: 12, fontWeight: 700, color: f === gcfVal ? color : 'var(--text)' }}>
            {f}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 13px', background: '#10b98110', borderRadius: 9, border: '1px solid #10b98125', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
        ✅ The largest common factor is <b>{gcfVal}</b>, so that is the GCF.
      </div>
    </Sec>
  )
}

function NumberBars({ nums, gcfVal, color }) {
  if (!nums.length || !gcfVal) return null
  const groups = nums.map(n => n / gcfVal)
  const maxGroups = Math.max(...groups)

  return (
    <Sec title="See the grouping visually" sub="Equal groups using the GCF">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {nums.map((n, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{groups[i]} groups of {gcfVal}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxGroups}, 1fr)`, gap: 6 }}>
              {Array.from({ length: maxGroups }).map((_, j) => (
                <div
                  key={j}
                  style={{
                    height: 28,
                    borderRadius: 8,
                    background: j < groups[i] ? color : 'var(--bg-raised)',
                    border: `1px solid ${j < groups[i] ? color + '45' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: j < groups[i] ? '#fff' : 'var(--text-3)'
                  }}
                >
                  {j < groups[i] ? gcfVal : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 Since every number can be split into equal chunks of <b>{gcfVal}</b>, that is the greatest common factor.
        </div>
      </div>
    </Sec>
  )
}

function PrimeFactorCard({ nums, color }) {
  const primeFactors = n => {
    let x = n
    const out = []
    let d = 2
    while (x > 1) {
      while (x % d === 0) {
        out.push(d)
        x /= d
      }
      d++
      if (d * d > x) {
        if (x > 1) out.push(x)
        break
      }
    }
    return out
  }

  if (!nums.length) return null

  return (
    <Sec title="Prime factor view" sub="Another way to see GCF">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {nums.map((n, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{n}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {primeFactors(n).map((f, j) => (
                <div key={j} style={{ padding: '4px 8px', borderRadius: 18, background: color + '12', border: `1px solid ${color}28`, fontSize: 11, fontWeight: 700, color }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
        The GCF comes from the prime factors shared by <b>all</b> numbers.
      </div>
    </Sec>
  )
}

function CompareCard({ nums, gcfVal, lcmVal, color }) {
  if (!nums.length) return null
  return (
    <Sec title="GCF vs LCM" sub="Know the difference">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: '14px', borderRadius: 12, background: color + '08', border: `1px solid ${color}22` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>GCF</div>
          <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>{gcfVal}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Use this when splitting things into the <b>largest equal groups</b> or simplifying fractions.
          </div>
        </div>

        <div style={{ padding: '14px', borderRadius: 12, background: '#10b98108', border: '1px solid #10b98122' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>LCM</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>{lcmVal}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Use this when finding the <b>smallest shared multiple</b>, like repeated schedules or cycles.
          </div>
        </div>
      </div>
    </Sec>
  )
}

function QuickFacts({ nums, gcfVal, lcmVal, color }) {
  const coprime = gcfVal === 1
  return (
    <Sec title="Quick facts" sub="Helpful observations">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Inputs', value: nums.length, c: color },
          { label: 'GCF', value: gcfVal, c: color },
          { label: 'LCM', value: lcmVal, c: '#10b981' },
          { label: 'Type', value: coprime ? 'Coprime' : 'Common factors', c: coprime ? '#f59e0b' : '#8b5cf6' }
        ].map((item, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${item.c}25`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.c, fontFamily: "'Space Grotesk',sans-serif" }}>{item.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function ChallengeCard({ nums, gcfVal, color }) {
  const [show, setShow] = useState(false)
  if (!nums || nums.length < 2) return null
  const next = nums.map(n => n + gcfVal)

  return (
    <Sec title="Challenge yourself" sub="Quick thinking quiz">
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 12 }}>
        If you add <b>{gcfVal}</b> to every number, what is likely to happen to the GCF?
      </div>

      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', marginBottom: 12, fontSize: 12.5, color: 'var(--text)' }}>
        {nums.join(', ')} → {next.join(', ')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          'It will always stay the same',
          'It may stay the same or change',
          'It must become 1',
          'It becomes the LCM'
        ].map((option, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            {String.fromCharCode(65 + i)}. {option}
          </div>
        ))}
      </div>

      <button onClick={() => setShow(v => !v)} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '10', color, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        {show ? 'Hide answer' : 'Reveal answer'}
      </button>

      {show && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 8 }}>
            ✅ <b style={{ color: 'var(--text)' }}>Correct answer:</b> It <b>may stay the same or change</b>.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
            GCF depends on the full factor structure of the new numbers, not just the amount you added.
          </div>
        </div>
      )}
    </Sec>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GCF CALCULATOR

export default function GCFCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [input, setInput] = useState('12, 18, 24')
  const [openFaq, setOpenFaq] = useState(null)

  const nums = input.split(/[\s,;]+/).map(Number).filter(n => !isNaN(n) && n > 0 && Number.isInteger(n))
  const gcfVal = nums.length ? nums.reduce((a, b) => gcd(a, b)) : null
  const lcmVal = nums.length ? nums.reduce((a, b) => lcm(a, b)) : null

  const factorsOf = n => {
    const f = []
    for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i)
    return f
  }

  const commonFactors = gcfVal ? factorsOf(gcfVal) : []

  const euclidSteps = useMemo(() => {
    if (nums.length < 2) return []
    const arr = []
    let a = nums[0]
    let b = nums[1]
    while (b !== 0) {
      arr.push(`${a} = ${Math.floor(a / b)} × ${b} + ${a % b}`)
      ;[a, b] = [b, a % b]
    }
    return arr
  }, [input])

  const steps = nums.length >= 2 ? [
    { label: 'List the numbers', math: nums.join(', ') },
    { label: 'Look for shared divisors', math: `Numbers that divide all inputs exactly are common factors.` },
    {
      label: 'Use Euclid’s algorithm',
      math: nums.length === 2
        ? euclidSteps.join('  →  ')
        : `First find GCD(${nums[0]}, ${nums[1]}) = ${gcd(nums[0], nums[1])}, then continue with the remaining numbers.`,
      note: 'Keep dividing and using the remainder until the remainder becomes 0.'
    },
    { label: 'GCF result', math: `GCF(${nums.join(', ')}) = ${gcfVal}`, note: `${gcfVal} is the largest number dividing all inputs exactly.` },
    { label: 'LCM result', math: `LCM(${nums.join(', ')}) = ${lcmVal}`, note: `${lcmVal} is the smallest shared multiple of all inputs.` },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaCard
        formula="GCF = largest common factor    LCM = smallest common multiple"
        desc="GCF helps you split equally. LCM helps you find when things line up again."
        color={C}
      />

      <CalcShell
        left={
          <div style={{ alignSelf: 'flex-start', height: 'fit-content' }}>
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', height: 'fit-content' }}>
              <MathInput
                label="Enter whole numbers"
                value={input}
                onChange={setInput}
                type="text"
                placeholder="e.g. 12, 18, 24"
                color={C}
                hint={`${nums.length} numbers`}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>
                  Use commas, spaces, or semicolons
                </div>
                <div style={{ padding: '4px 8px', borderRadius: 20, background: C + '10', border: `1px solid ${C}20`, fontSize: 10, fontWeight: 700, color: C }}>
                  {nums.length} values
                </div>
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Quick examples
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <ExampleChip value="12, 18" label="Basic pair" onClick={() => setInput('12, 18')} color={C} />
                  <ExampleChip value="24, 36, 48" label="Three multiples" onClick={() => setInput('24, 36, 48')} color={C} />
                  <ExampleChip value="100, 75, 50" label="Mixed multiples" onClick={() => setInput('100, 75, 50')} color={C} />
                  <ExampleChip value="17, 13" label="Coprime example" onClick={() => setInput('17, 13')} color={C} />
                </div>
              </div>

              <QuickLearnCard color={C} />
            </div>
          </div>
        }
        right={
          <>
            {nums.length < 2 ? (
              <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Enter at least 2 positive integers</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {[
                    { label: 'GCF', val: gcfVal, color: C, note: 'Largest common factor' },
                    { label: 'LCM', val: lcmVal, color: '#10b981', note: 'Smallest common multiple' }
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: `1.5px solid ${s.color}30`, borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{s.note}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
                    Quick check
                  </div>
                  <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    💡 GCF is usually the smaller “splitting” answer. LCM is usually the larger “meeting point” answer.
                  </div>
                </div>

                <BreakdownTable
                  title="Summary"
                  rows={[
                    { label: 'GCF', value: String(gcfVal), bold: true, highlight: true, color: C },
                    { label: 'LCM', value: String(lcmVal), color: '#10b981' },
                    { label: 'Numbers', value: nums.join(', ') },
                    { label: 'Groups using GCF', value: nums.map(n => `${n}÷${gcfVal}=${n / gcfVal}`).join(', ') }
                  ]}
                />

                <AIHintCard hint={`GCF(${nums.join(', ')}) = ${gcfVal}, LCM(${nums.join(', ')}) = ${lcmVal}`} />
              </>
            )}
          </>
        }
      />

      {nums.length >= 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MeaningCard nums={nums} gcfVal={gcfVal} lcmVal={lcmVal} color={C} />
          <CommonFactorChips commonFactors={commonFactors} gcfVal={gcfVal} color={C} />
          <NumberBars nums={nums} gcfVal={gcfVal} color={C} />
          <PrimeFactorCard nums={nums} color={C} />
          <CompareCard nums={nums} gcfVal={gcfVal} lcmVal={lcmVal} color={C} />
          <QuickFacts nums={nums} gcfVal={gcfVal} lcmVal={lcmVal} color={C} />
          <StepsCard steps={steps} color={C} />
          <ChallengeCard nums={nums} gcfVal={gcfVal} color={C} />
        </div>
      )}

      <Sec title="Where GCF and LCM are used">
        <RealWorld items={[
          { icon: '✂️', field: 'Equal groups', desc: 'You have 12 apples and 18 oranges. GCF(12,18) = 6, so you can make 6 equal bags.', example: '12 apples + 18 oranges → 6 bags', color: C },
          { icon: '🔄', field: 'Repeating cycles', desc: 'Two buses arrive every 12 and 18 minutes. LCM(12,18) = 36, so they meet again after 36 minutes.', example: '12 min and 18 min → 36 min', color: '#10b981' },
          { icon: '📐', field: 'Simplifying fractions', desc: 'To simplify 12/18, divide top and bottom by GCF(12,18)=6, giving 2/3.', example: '12/18 → 2/3', color: '#f59e0b' },
          { icon: '🎵', field: 'Rhythm patterns', desc: 'A 4-beat and 6-beat pattern line up together again after 12 beats.', example: '4 and 6 sync at 12', color: '#8b5cf6' }
        ]} />
      </Sec>

      <Sec title="Math words made easy">
        <GlossaryCard
          color={C}
          items={[
            { term: 'Factor', def: 'A number that divides another number exactly, with no remainder.' },
            { term: 'Greatest Common Factor', def: 'The largest factor shared by all the numbers.' },
            { term: 'Multiple', def: 'A result you get by multiplying a number by whole numbers.' },
            { term: 'Least Common Multiple', def: 'The smallest multiple shared by all the numbers.' },
            { term: 'Coprime', def: 'Numbers whose GCF is 1.' }
          ]}
        />
      </Sec>

      <Sec title="⚠️ Common mistakes">
        <MistakesList items={[
          'Mixing up GCF and LCM — GCF is for splitting, LCM is for lining things up',
          'Thinking bigger numbers always have a big GCF — sometimes the GCF is just 1',
          'Forgetting that coprime numbers still have a valid GCF, and it is 1'
        ]} />
      </Sec>

      <Sec title="Frequently asked questions">
        {[
          {
            q: 'What does it mean if the GCF is 1?',
            a: 'It means the numbers are coprime. They do not share any common factor other than 1.'
          },
          {
            q: 'How are GCF and LCM related?',
            a: 'For two positive numbers a and b, GCF(a,b) × LCM(a,b) = a × b. This is a useful check.'
          },
          {
            q: 'Why is GCF useful for fractions?',
            a: 'Because you simplify a fraction by dividing the numerator and denominator by their GCF.'
          }
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>
    </div>
  )
}