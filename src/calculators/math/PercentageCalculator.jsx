import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const MODES = [
  { key: 'percent_of', label: '% of a number', short: 'Find part of a total', color: '#3b82f6' },
  { key: 'what_percent', label: 'X is what % of Y?', short: 'Compare one number to another', color: '#6366f1' },
  { key: 'percent_change', label: 'Percentage change', short: 'Measure increase or decrease', color: '#10b981' },
]

const FAQ = [
  {
    q: 'What does percentage mean?',
    a: 'Percentage means “out of 100.” So 25% means 25 out of every 100, which is the same as 25/100 or 0.25.',
  },
  {
    q: 'When do I use percentage change?',
    a: 'Use percentage change when something goes from an old value to a new value and you want to measure the increase or decrease relative to the original value.',
  },
  {
    q: 'Why do I divide by 100?',
    a: 'Because percent means per hundred. Dividing by 100 converts a percentage into decimal form so you can multiply it with another number.',
  },
  {
    q: 'Why is percentage change sometimes negative?',
    a: 'A negative answer means the value went down from the original amount. A positive answer means it increased.',
  },
]

function Section({ title, sub, children, color = '#3b82f6' }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'11px 15px', borderBottom:'0.5px solid var(--border)', background:color + '10', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:12.5, fontWeight:700, color, fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize:10.5, color:'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding:'16px 15px' }}>{children}</div>
    </div>
  )
}

function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom:'0.5px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, textAlign:'left', padding:'13px 0', background:'none', border:'none', cursor:'pointer' }}
      >
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.45 }}>{q}</span>
        <span style={{ fontSize:18, color, transform:open ? 'rotate(45deg)' : 'none', transition:'transform .2s', flexShrink:0 }}>+</span>
      </button>
      {open && <div style={{ paddingBottom:13, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75 }}>{a}</div>}
    </div>
  )
}

function NumInput({ value, onChange, prefix, suffix, placeholder, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {prefix && <span style={{ fontSize:12.5, color:'var(--text-3)', fontWeight:700, minWidth:30 }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          flex:1,
          minWidth:0,
          border:'1.5px solid var(--border-2)',
          borderRadius:9,
          padding:'10px 12px',
          fontSize:14,
          fontWeight:700,
          fontFamily:'DM Sans, sans-serif',
          color:'var(--text)',
          background:'var(--bg-card)',
          outline:'none'
        }}
        onFocus={e => e.target.style.borderColor = color}
        onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
      />
      {suffix && <span style={{ fontSize:12.5, color:'var(--text-3)', fontWeight:700 }}>{suffix}</span>}
    </div>
  )
}

function ExampleChip({ label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:'7px 10px',
        borderRadius:999,
        border:`1px solid ${color}35`,
        background:color + '10',
        color,
        fontSize:11,
        fontWeight:700,
        cursor:'pointer'
      }}
    >
      {label}
    </button>
  )
}

function StepRow({ step, text, color, highlight = false }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'0.5px solid var(--border)' }}>
      <div style={{ width:24, height:24, borderRadius:'50%', background:highlight ? color : color + '15', color:highlight ? '#fff' : color, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {step}
      </div>
      <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75 }}>{text}</div>
    </div>
  )
}

function TipCard({ title, children, color }) {
  return (
    <div style={{ padding:'11px 12px', borderRadius:9, background:color + '10', border:`1px solid ${color}30` }}>
      <div style={{ fontSize:12, fontWeight:700, color, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>{children}</div>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
      <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:16, fontWeight:700, color, fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
    </div>
  )
}

function PracticeCard({ mode, color }) {
  const [seed, setSeed] = useState(0)
  const [show, setShow] = useState(false)

  const problem = useMemo(() => {
    const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

    if (mode === 'percent_of') {
      const p = rand(5, 50)
      const y = rand(20, 500)
      const answer = ((p / 100) * y).toFixed(2).replace(/\.00$/, '')
      return {
        q: `What is ${p}% of ${y}?`,
        a: answer,
        explain: `${p}% means ${p}/100. So (${p}/100) × ${y} = ${answer}.`
      }
    }

    if (mode === 'what_percent') {
      const y = rand(20, 400)
      const p = rand(10, 80)
      const x = Math.round((p / 100) * y)
      const answer = `${((x / y) * 100).toFixed(2).replace(/\.00$/, '')}%`
      return {
        q: `${x} is what percent of ${y}?`,
        a: answer,
        explain: `Divide the part by the total: ${x} ÷ ${y}, then multiply by 100.`
      }
    }

    const oldVal = rand(20, 300)
    const newVal = rand(20, 400)
    const answer = `${(((newVal - oldVal) / Math.abs(oldVal)) * 100).toFixed(2).replace(/\.00$/, '')}%`
    return {
      q: `What is the percentage change from ${oldVal} to ${newVal}?`,
      a: answer,
      explain: `Find the difference, divide by the original value ${oldVal}, then multiply by 100.`
    }
  }, [mode, seed])

  return (
    <Section title="Practice mode" sub="Learn by trying" color={color}>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{problem.q}</div>
      {show && (
        <div style={{ padding:'10px 12px', borderRadius:8, background:color + '10', border:`1px solid ${color}30`, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color, marginBottom:4 }}>Answer: {problem.a}</div>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>{problem.explain}</div>
        </div>
      )}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button
          onClick={() => setShow(v => !v)}
          style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${color}35`, background:color + '10', color, fontSize:11, fontWeight:700, cursor:'pointer' }}
        >
          {show ? 'Hide answer' : 'Show answer'}
        </button>
        <button
          onClick={() => { setSeed(v => v + 1); setShow(false) }}
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-raised)', color:'var(--text)', fontSize:11, fontWeight:700, cursor:'pointer' }}
        >
          New problem
        </button>
      </div>
    </Section>
  )
}

function MiniQuiz({ mode, color }) {
  const [show, setShow] = useState(false)

  const quiz = useMemo(() => {
    if (mode === 'percent_of') {
      return {
        q: 'What is 10% of 450?',
        a: '45',
        explain: '10% means divide by 10. So 450 ÷ 10 = 45.',
      }
    }
    if (mode === 'what_percent') {
      return {
        q: '25 is what percent of 100?',
        a: '25%',
        explain: '25 ÷ 100 = 0.25, then × 100 = 25%.',
      }
    }
    return {
      q: 'What is the percentage change from 80 to 100?',
      a: '+25%',
      explain: 'Difference = 20. Then 20 ÷ 80 = 0.25. Multiply by 100 = 25%.',
    }
  }, [mode])

  return (
    <Section title="Check your understanding" sub="Quick mini quiz" color={color}>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{quiz.q}</div>
      {show && (
        <div style={{ padding:'10px 12px', borderRadius:8, background:color + '10', border:`1px solid ${color}30`, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color, marginBottom:4 }}>Answer: {quiz.a}</div>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>{quiz.explain}</div>
        </div>
      )}
      <button
        onClick={() => setShow(v => !v)}
        style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${color}35`, background:color + '10', color, fontSize:11, fontWeight:700, cursor:'pointer' }}
      >
        {show ? 'Hide answer' : 'Show answer'}
      </button>
    </Section>
  )
}

export default function PercentageCalculator() {
  const [mode, setMode] = useState('percent_of')
  const activeMode = MODES.find(m => m.key === mode) || MODES[0]
  const color = activeMode.color

  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const result = useMemo(() => {
    if (a === '' || b === '') return null
    const x = +a
    const y = +b

    if (mode === 'percent_of') {
      const value = (x / 100) * y
      const decimal = x / 100
      return {
        hero: `${parseFloat(value.toFixed(4))}`,
        sub: `${x}% of ${y}`,
        rows: [{ label: `${x}% of ${y}`, value: `${parseFloat(value.toFixed(4))}`, bold: true, highlight: true, color }],
        formula: 'Result = (X / 100) × Y',
        formulaExplain: 'X = percentage, Y = whole number',
        steps: [
          `Turn the percentage into a decimal: ${x}% = ${x} ÷ 100 = ${decimal}`,
          `Multiply the decimal by the total: ${decimal} × ${y}`,
          `So the answer is ${parseFloat(value.toFixed(4))}`,
        ],
        vizPct: Math.max(0, Math.min(100, x)),
        concept: 'You are finding a part of a whole amount.',
        quickStats: [
          { label:'Decimal form', value: `${decimal}` },
          { label:'Fraction idea', value: `${x}/100` },
          { label:'Whole number', value: `${y}` },
        ]
      }
    }

    if (mode === 'what_percent') {
      if (y === 0) return null
      const fraction = x / y
      const value = fraction * 100
      return {
        hero: `${parseFloat(value.toFixed(4))}%`,
        sub: `${x} is what % of ${y}`,
        rows: [{ label: `${x} is what % of ${y}`, value: `${parseFloat(value.toFixed(4))}%`, bold: true, highlight: true, color }],
        formula: 'Result = (X / Y) × 100',
        formulaExplain: 'X = part, Y = total',
        steps: [
          `First compare the numbers: ${x} ÷ ${y} = ${fraction.toFixed(6)}`,
          `Now convert that decimal into a percent by multiplying by 100`,
          `So the answer is ${parseFloat(value.toFixed(4))}%`,
        ],
        vizPct: Math.max(0, Math.min(100, value)),
        concept: 'You are checking how big one value is compared with another.',
        quickStats: [
          { label:'Decimal form', value: `${fraction.toFixed(4)}` },
          { label:'Part', value: `${x}` },
          { label:'Total', value: `${y}` },
        ]
      }
    }

    if (x === 0) return null
    const difference = y - x
    const fraction = difference / Math.abs(x)
    const value = fraction * 100
    return {
      hero: `${value > 0 ? '+' : ''}${parseFloat(value.toFixed(4))}%`,
      sub: `Change from ${x} to ${y}`,
      rows: [
        { label: 'Original value', value: `${x}` },
        { label: 'New value', value: `${y}` },
        { label: 'Percentage change', value: `${value > 0 ? '+' : ''}${parseFloat(value.toFixed(4))}%`, bold: true, highlight: true, color: value >= 0 ? '#10b981' : '#ef4444' },
      ],
      formula: 'Result = ((New − Old) / |Old|) × 100',
      formulaExplain: 'Old = original value, New = new value',
      steps: [
        `Find the difference: ${y} − ${x} = ${difference}`,
        `Divide by the original value: ${difference} ÷ ${Math.abs(x)} = ${fraction.toFixed(6)}`,
        `Multiply by 100 to convert into a percentage`,
        `So the percentage change is ${value > 0 ? '+' : ''}${parseFloat(value.toFixed(4))}%`,
      ],
      vizPct: Math.max(0, Math.min(100, Math.abs(value))),
      concept: 'You are measuring how much something increased or decreased compared with where it started.',
      quickStats: [
        { label:'Difference', value: `${difference}` },
        { label:'Original value', value: `${x}` },
        { label:'Direction', value: value > 0 ? 'Increase' : value < 0 ? 'Decrease' : 'No change' },
      ]
    }
  }, [a, b, mode, color])

  const hint = result
    ? `${result.sub} = ${result.hero}.`
    : 'Choose a calculation type, enter values, and the answer updates instantly.'

  const setExample = (type) => {
    setMode(type)
    if (type === 'percent_of') { setA('25'); setB('200') }
    if (type === 'what_percent') { setA('50'); setB('200') }
    if (type === 'percent_change') { setA('100'); setB('125') }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <Section title="Choose calculation type" sub="Pick the one you need" color={color}>
              <div style={{ display:'grid', gap:8 }}>
                {MODES.map(m => (
                  <button
                    key={m.key}
                    onClick={() => { setMode(m.key); setA(''); setB('') }}
                    style={{
                      padding:'11px 12px',
                      borderRadius:10,
                      border:`1.5px solid ${mode === m.key ? m.color : 'var(--border-2)'}`,
                      background:mode === m.key ? m.color + '12' : 'var(--bg-raised)',
                      color:mode === m.key ? m.color : 'var(--text)',
                      cursor:'pointer',
                      textAlign:'left'
                    }}
                  >
                    <div style={{ fontSize:12.5, fontWeight:700 }}>{m.label}</div>
                    <div style={{ fontSize:10.5, color:mode === m.key ? m.color : 'var(--text-3)', marginTop:3 }}>{m.short}</div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Input" sub="Type your numbers here" color={color}>
              {mode === 'percent_of' && (
                <div style={{ display:'grid', gap:12 }}>
                  <NumInput value={a} onChange={setA} placeholder="25" suffix="% of" color={color} />
                  <NumInput value={b} onChange={setB} placeholder="200" color={color} />
                </div>
              )}

              {mode === 'what_percent' && (
                <div style={{ display:'grid', gap:12 }}>
                  <NumInput value={a} onChange={setA} placeholder="50" suffix="is what % of" color={color} />
                  <NumInput value={b} onChange={setB} placeholder="200" color={color} />
                </div>
              )}

              {mode === 'percent_change' && (
                <div style={{ display:'grid', gap:12 }}>
                  <NumInput value={a} onChange={setA} placeholder="100" prefix="From" color={color} />
                  <NumInput value={b} onChange={setB} placeholder="125" prefix="To" color={color} />
                </div>
              )}

              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>
                  Try an example
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <ExampleChip label="25% of 200" onClick={() => setExample('percent_of')} color="#3b82f6" />
                  <ExampleChip label="50 is what % of 200?" onClick={() => setExample('what_percent')} color="#6366f1" />
                  <ExampleChip label="100 → 125" onClick={() => setExample('percent_change')} color="#10b981" />
                </div>
              </div>
            </Section>
          </>
        }
        right={
          <>
            <Section title="Result hero" sub="Your final answer" color={color}>
              {result ? (
                <>
                  <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:6 }}>{result.sub}</div>
                  <div style={{ fontSize:44, fontWeight:800, color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>
                    {result.hero}
                  </div>
                  <div style={{ marginTop:10, fontSize:12, color:'var(--text-2)', lineHeight:1.75 }}>
                    {result.concept}
                  </div>

                  <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {result.quickStats.map((s, i) => (
                      <StatPill key={i} label={s.label} value={s.value} color={i === 0 ? color : 'var(--text)'} />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color:'var(--text-3)', fontSize:13 }}>Enter values to see the answer here.</div>
              )}
            </Section>

            {result && <BreakdownTable title="Quick summary" rows={result.rows} />}
            <AIHintCard hint={hint} />
          </>
        }
      />

      {result && (
        <>
          <Section title="Step-by-step solution" sub="See exactly how it works" color={color}>
            {result.steps.map((s, i) => (
              <StepRow key={i} step={i + 1} text={s} color={color} highlight={i === result.steps.length - 1} />
            ))}
          </Section>

          <Section title="Visualization" sub="Make the percentage easier to see" color={color}>
            <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:'var(--text-3)' }}>0%</span>
              <span style={{ color:color, fontWeight:700 }}>{result.vizPct.toFixed(2)}%</span>
              <span style={{ color:'var(--text-3)' }}>100%</span>
            </div>
            <div style={{ height:16, background:'var(--border)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ width:`${result.vizPct}%`, height:'100%', background:color, borderRadius:999, transition:'width .4s' }} />
            </div>
            <div style={{ marginTop:10, fontSize:11.5, color:'var(--text-2)', lineHeight:1.7 }}>
              This bar shows the percentage visually. Bigger percentages fill more of the bar.
            </div>
          </Section>

          <FormulaCard formula={result.formula} explanation={result.formulaExplain} />
        </>
      )}

      <Section title="Worked examples" sub="Learn from simple real-life cases" color={color}>
        <div style={{ display:'grid', gap:10 }}>
          <div style={{ padding:'11px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Shopping discount</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.7 }}>20% of £50 = £10, so you save £10 on the item.</div>
          </div>
          <div style={{ padding:'11px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Exam marks</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.7 }}>45 out of 60 = 75%, which tells you how much of the total marks were scored.</div>
          </div>
          <div style={{ padding:'11px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Price increase</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.7 }}>A price rising from 80 to 100 is a 25% increase because the change is 20, and 20 ÷ 80 × 100 = 25%.</div>
          </div>
        </div>
      </Section>

      <PracticeCard mode={mode} color={color} />

      <Section title="Which mode should I use?" sub="Choose the right percentage question" color={color}>
        <div style={{ display:'grid', gap:10 }}>
          <TipCard title="% of a number" color="#3b82f6">
            Use this when the question says <strong>“What is 20% of 80?”</strong> You are finding a part of a total.
          </TipCard>

          <TipCard title="X is what % of Y?" color="#6366f1">
            Use this when the question says <strong>“30 is what percent of 120?”</strong> You are comparing one number with another.
          </TipCard>

          <TipCard title="Percentage change" color="#10b981">
            Use this when the question says <strong>“It changed from 100 to 125”</strong>. You are measuring increase or decrease from the original value.
          </TipCard>
        </div>
      </Section>

      <Section title="How percentages work" sub="Simple explanation for beginners" color={color}>
        <div style={{ display:'grid', gap:10 }}>
          <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.8 }}>
            A percentage is just a way of writing something out of 100.
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {[
              ['50%', 'half'],
              ['25%', 'one quarter'],
              ['75%', 'three quarters'],
              ['10%', 'one tenth'],
              ['1%', 'one out of 100'],
              ['100%', 'the whole amount'],
            ].map((item, i) => (
              <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:15, fontWeight:700, color:color, fontFamily:"'Space Grotesk',sans-serif" }}>{item[0]}</div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', marginTop:4 }}>{item[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Mental math shortcuts" sub="Fast ways to calculate in your head" color={color}>
        <div style={{ display:'grid', gap:8 }}>
          <TipCard title="10%" color={color}>
            Move the decimal one place left. Example: 10% of 250 = 25.
          </TipCard>
          <TipCard title="1%" color={color}>
            Divide by 100. Example: 1% of 250 = 2.5.
          </TipCard>
          <TipCard title="5%" color={color}>
            Find 10% first, then halve it. Example: 5% of 80 = 4.
          </TipCard>
          <TipCard title="25%" color={color}>
            25% means a quarter. Example: 25% of 200 = 50.
          </TipCard>
          <TipCard title="50%" color={color}>
            50% means half. Example: 50% of 90 = 45.
          </TipCard>
        </div>
      </Section>

      <Section title="Common mistakes" sub="Easy errors to avoid" color={color}>
        <div style={{ display:'grid', gap:8 }}>
          {[
            'Forgetting to divide by 100 when finding a percentage of a number.',
            'Using the new value instead of the old value in percentage change.',
            'Dividing by the wrong total in “X is what % of Y?” questions.',
            'Mixing up the final value and the percentage increase.',
          ].map((m, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)', fontSize:11.5, color:'var(--text-2)', lineHeight:1.7 }}>
              <strong style={{ color:'#ef4444' }}>Mistake {i + 1}:</strong> {m}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Real-life percentage examples" sub="Where percentages appear in daily life" color={color}>
        <div style={{ display:'grid', gap:10 }}>
          {[
            { title:'Shopping', text:'Discounts like 20% off are percentages.' },
            { title:'School', text:'Marks and grades are often shown as percentages.' },
            { title:'Money', text:'Tax, interest, salary increase, and savings rates all use percentages.' },
            { title:'Technology', text:'Battery charge and phone storage often appear as percentages.' },
            { title:'Sports and stats', text:'Win rates, pass rates, and success rates are percentages.' },
          ].map((e, i) => (
            <div key={i} style={{ padding:'11px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{e.title}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>{e.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Percentage, decimal, fraction table" sub="Quick conversions to remember" color={color}>
        <div style={{ display:'grid', gap:6 }}>
          {[
            ['1%', '0.01', '1/100'],
            ['5%', '0.05', '1/20'],
            ['10%', '0.10', '1/10'],
            ['25%', '0.25', '1/4'],
            ['50%', '0.50', '1/2'],
            ['75%', '0.75', '3/4'],
            ['100%', '1.00', '1'],
          ].map((row, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'9px 12px', borderRadius:8, background:i === 3 ? color+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 3 ? color+'35' : 'var(--border)'}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:i === 3 ? color : 'var(--text)' }}>{row[0]}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)' }}>{row[1]}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)' }}>{row[2]}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Teacher tips" sub="Quick rules to remember" color={color}>
        <div style={{ display:'grid', gap:8 }}>
          {[
            'Percent means “out of 100.”',
            'To find a percentage of a number, divide by 100 first.',
            'For percentage change, always compare with the original value.',
            'A negative percentage means decrease. A positive percentage means increase.',
          ].map((tip, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? color+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? color+'35' : 'var(--border)'}`, fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>
              {tip}
            </div>
          ))}
        </div>
      </Section>

      <MiniQuiz mode={mode} color={color} />

      <Section title="Concept explanation" sub="Why this calculator helps" color={color}>
        <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.8 }}>
          Percentages are one of the most useful math ideas in school and real life. They help you understand discounts, marks, growth, savings, comparisons, and changes. This calculator does not only give you the answer — it also shows how the answer is formed so you can learn the process and use it yourself later.
        </div>
      </Section>

      <Section title="Frequently asked questions" sub="Common percentage doubts" color={color}>
        {FAQ.map((f, i) => (
          <Acc
            key={i}
            q={f.q}
            a={f.a}
            open={openFaq === i}
            onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            color={color}
          />
        ))}
      </Section>
    </div>
  )
}