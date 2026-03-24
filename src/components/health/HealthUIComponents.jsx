/**
 * NarrativeStoryCard — Concept B
 * Shows result as 3 live-updating story blocks
 *
 * USAGE:
 *   import NarrativeStoryCard from '../../components/health/NarrativeStoryCard'
 *
 *   <NarrativeStoryCard
 *     title="Your hydration story"
 *     catColor={catColor}
 *     stories={[
 *       { label:'Your result',   headline:'You need 2.8 litres per day',  detail:'That is 11 glasses...' },
 *       { label:'How to hit it', headline:'Drink one glass every 90 min', detail:'Start with 500ml...' },
 *       { label:'What happens',  headline:'2% dehydration cuts focus 20%',detail:'Pale yellow urine...' },
 *     ]}
 *   />
 */
export function NarrativeStoryCard({ title = 'Your result', stories = [], catColor = '#10b981' }) {
  const colors = [catColor, '#0ea5e9', '#f59e0b']
  const softs  = [catColor + '18', '#e0f2fe', '#fef3c7']

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 14,
    }}>
      <div style={{
        padding: '11px 16px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Updates live as you edit</span>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stories.map((s, i) => (
          <div key={i} style={{
            borderLeft: `3px solid ${colors[i] || catColor}`,
            paddingLeft: 12,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: '0 8px 8px 0',
            background: softs[i] || catColor + '18',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: colors[i] || catColor,
              textTransform: 'uppercase',
              letterSpacing: '.07em',
              marginBottom: 4,
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--text)',
              lineHeight: 1.55,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {s.headline}
            </div>
            {s.detail && (
              <div style={{
                fontSize: 11.5,
                color: 'var(--text-2)',
                lineHeight: 1.6,
                marginTop: 4,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {s.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ComparisonTicker — Concept C
 * Shows your result vs real-world benchmarks as animated bars
 *
 * USAGE:
 *   import { ComparisonTicker } from '../../components/health/NarrativeStoryCard'
 *
 *   <ComparisonTicker
 *     title="Protein Target"
 *     yourValue={proteinG}
 *     yourLabel="Muscle building"
 *     unit="g"
 *     catColor={catColor}
 *     benchmarks={[
 *       { label:'WHO minimum',     value:60,  note:'Prevents deficiency', color:'#94a3b8' },
 *       { label:'General active',  value:90,  note:'Maintain muscle',     color:'#22a355' },
 *       { label:'Athlete',         value:160, note:'Performance',         color:'#8b5cf6' },
 *     ]}
 *   />
 */
export function ComparisonTicker({ title = 'How you compare', yourValue, yourLabel, unit = '', catColor = '#10b981', benchmarks = [] }) {
  const maxVal = Math.max(...benchmarks.map(b => b.value), yourValue) * 1.15

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 14,
    }}>
      <div style={{
        padding: '11px 16px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>You vs benchmarks</span>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {/* Big number */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{
              fontSize: 48, fontWeight: 700, lineHeight: 1,
              color: catColor,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {typeof yourValue === 'number' ? Math.round(yourValue) : yourValue}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{unit} — {yourLabel}</div>
          </div>
        </div>

        {/* Your bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', borderRadius: 8, marginBottom: 6,
          background: catColor + '12',
          border: `1.5px solid ${catColor}`,
        }}>
          <div style={{ width: 130, fontSize: 11, fontWeight: 700, color: catColor, flexShrink: 0 }}>
            You ← {yourLabel}
          </div>
          <div style={{ flex: 1, height: 7, background: 'var(--border)', borderRadius: 3 }}>
            <div style={{
              height: '100%',
              width: `${(yourValue / maxVal) * 100}%`,
              background: catColor,
              borderRadius: 3,
              transition: 'width .5s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: catColor, minWidth: 50, textAlign: 'right' }}>
            {Math.round(yourValue)}{unit}
          </div>
        </div>

        {/* Benchmark rows */}
        {benchmarks.map((b, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 12px', borderRadius: 8, marginBottom: 4,
            background: 'var(--bg-raised)',
            border: '0.5px solid var(--border)',
          }}>
            <div style={{ width: 130, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{b.label}</div>
              {b.note && <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{b.note}</div>}
            </div>
            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3 }}>
              <div style={{
                height: '100%',
                width: `${(b.value / maxVal) * 100}%`,
                background: b.color || 'var(--text-3)',
                borderRadius: 3,
                opacity: 0.65,
                transition: 'width .5s ease',
              }} />
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-2)',
              minWidth: 50, textAlign: 'right',
            }}>
              {b.value}{unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * HealthScoreCard — Concept A
 * Animated ring score (0–100) + 3 contributing factor bars
 *
 * USAGE:
 *   import { HealthScoreCard } from '../../components/health/NarrativeStoryCard'
 *
 *   <HealthScoreCard
 *     title="Macro Score"
 *     score={74}
 *     grade="Good"
 *     gradeColor="#3b82f6"
 *     gradeSoft="#dbeafe"
 *     advice="Increase protein to push above 80."
 *     catColor={catColor}
 *     factors={[
 *       { label:'Protein',  value:'120g (30%)', score:75, color:'#22a355', note:'1.6g/kg bodyweight' },
 *       { label:'Carbs',    value:'200g (40%)', score:60, color:'#f59e0b', note:'Main training fuel' },
 *       { label:'Fat',      value:'67g (30%)',  score:65, color:'#8b5cf6', note:'Essential for hormones' },
 *     ]}
 *   />
 */
export function HealthScoreCard({ title = 'Health Score', score = 0, grade, gradeColor, gradeSoft, factors = [], advice, catColor = '#10b981' }) {
  const R = 42, C = 54, circ = 2 * Math.PI * R
  const fill = circ * (Math.min(Math.max(score, 0), 100) / 100)
  const ringColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 14,
    }}>
      <div style={{
        padding: '11px 16px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Updates live</span>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 108 108" width="96" height="96" style={{ flexShrink: 0 }}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11" />
            <circle cx={C} cy={C} r={R} fill="none" stroke={ringColor} strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${fill} ${circ}`}
              strokeDashoffset={circ / 4}
              transform={`rotate(-90 ${C} ${C})`}
              style={{ transition: 'stroke-dasharray .6s ease, stroke .3s' }} />
            <text x={C} y={C - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)" fontFamily="inherit">
              {Math.round(score)}
            </text>
            <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">
              / 100
            </text>
          </svg>
          <div>
            {grade && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px 5px 8px', borderRadius: 20,
                background: gradeSoft || catColor + '18',
                border: `1px solid ${gradeColor || catColor}35`,
                marginBottom: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: gradeColor || catColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: gradeColor || catColor, fontFamily: "'DM Sans', sans-serif" }}>
                  {grade}
                </span>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
              Score based on your inputs vs evidence-based targets.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {factors.map((f, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontWeight: 700, color: f.color }}>{f.value}</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(Math.max(f.score, 0), 100)}%`,
                  background: f.color,
                  borderRadius: 3,
                  transition: 'width .5s ease',
                }} />
              </div>
              {f.note && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{f.note}</div>}
            </div>
          ))}
        </div>
      </div>

      {advice && (
        <div style={{ margin: '0 18px 16px', padding: '10px 13px', background: gradeSoft || catColor + '18', borderRadius: 10, border: `1px solid ${gradeColor || catColor}30` }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
            {advice}
          </p>
        </div>
      )}
    </div>
  )
}

export default { NarrativeStoryCard, ComparisonTicker, HealthScoreCard }
