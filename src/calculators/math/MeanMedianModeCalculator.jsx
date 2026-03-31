import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(4)).toString()

function Sec({ title, sub, children, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: color ? color + '06' : 'transparent' }}>
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

function computeStats(nums) {
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const n = nums.length
  const mean = nums.reduce((a, b) => a + b, 0) / n
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const freq = {}
  nums.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
  const maxFreq = Math.max(...Object.values(freq))
  const mode = maxFreq === 1 ? [] : Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number)
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  const stdDev = Math.sqrt(variance)
  const sampleVariance = n > 1 ? nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0
  const sampleStdDev = Math.sqrt(sampleVariance)
  const range = sorted[n - 1] - sorted[0]
  const q1 = sorted[Math.floor(n / 4)]
  const q3 = sorted[Math.floor(3 * n / 4)]
  const iqr = q3 - q1
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0
  const skewness = n > 2 && stdDev > 0 ? (nums.reduce((a, b) => a + ((b - mean) / stdDev) ** 3, 0) / n) : 0
  const sum = nums.reduce((a, b) => a + b, 0)
  const geometricMean = nums.every(v => v > 0) ? Math.pow(nums.reduce((a, b) => a * b, 1), 1 / n) : null
  const harmonicMean = nums.every(v => v !== 0) ? n / nums.reduce((a, b) => a + 1 / b, 0) : null
  const outliers = nums.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr)
  return { mean, median, mode, variance, stdDev, sampleVariance, sampleStdDev, range, q1, q3, iqr, cv, skewness, sum, n, sorted, freq, maxFreq, geometricMean, harmonicMean, outliers, min: sorted[0], max: sorted[n - 1] }
}

const DATASETS = [
  { label: 'Exam scores', data: '72, 85, 91, 68, 79, 85, 92, 88, 74, 85' },
  { label: 'Stock returns %', data: '2.1, -1.3, 4.5, -0.8, 3.2, 1.7, -2.1, 5.0, 0.4, 2.8' },
  { label: 'Heights (cm)', data: '162, 175, 168, 180, 172, 165, 178, 170, 158, 183' },
  { label: 'Daily sales', data: '450, 520, 390, 610, 480, 550, 420, 580, 460, 510' },
]

const FAQ = [
  { q: 'When should I use mean vs median?', a: 'Use mean when data is symmetric and has no extreme outliers. Use median when data is skewed or has outliers — like house prices or income. The median is more "robust" because one extreme value cannot pull it far. If mean >> median, data is right-skewed.' },
  { q: 'What if there are multiple modes?', a: 'A dataset can have no mode (all unique), one mode (unimodal), two modes (bimodal), or more (multimodal). Bimodal distributions often indicate two distinct subgroups — like heights of men and women combined.' },
  { q: 'What is the coefficient of variation?', a: 'CV = (std dev / mean) × 100%. It expresses variability as a percentage of the mean, allowing comparison across datasets with different units. CV = 5% = very consistent; CV = 80% = highly variable.' },
  { q: 'What is the relationship between mean, median, and mode?', a: 'For a perfect normal distribution: mean = median = mode. Right-skewed: mode < median < mean. Left-skewed: mean < median < mode. This helps identify distribution shape without a histogram.' },
]

export default function MeanMedianModeCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [rawInput, setRawInput] = useState('72, 85, 91, 68, 79, 85, 92, 88, 74, 85')
  const [openFaq, setFaq] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [showSorted, setShowSorted] = useState(false)

  const nums = useMemo(() => rawInput.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v) && v.toString() !== ''), [rawInput])
  const stats = useMemo(() => computeStats(nums), [nums])

  const histBins = useMemo(() => {
    if (!stats || stats.n < 2) return []
    const binCount = Math.min(10, Math.ceil(Math.sqrt(stats.n)))
    const binSize = (stats.max - stats.min) / binCount || 1
    const bins = Array.from({ length: binCount }, (_, i) => ({ min: stats.min + i * binSize, max: stats.min + (i + 1) * binSize, count: 0 }))
    nums.forEach(v => { const idx = Math.min(Math.floor((v - stats.min) / binSize), binCount - 1); bins[idx].count++ })
    return bins
  }, [stats, nums])

  const maxBinCount = Math.max(...histBins.map(b => b.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Descriptive Statistics</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Mean · Median · Mode · Range · IQR</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Comma, space, or semicolon separated values</div>
        </div>
        {stats && (
          <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>n = {stats.n}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(stats.mean)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>mean</div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>📊 Sample datasets</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {DATASETS.map((ds, i) => (
            <button key={i} onClick={() => setRawInput(ds.data)} style={{ padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${rawInput === ds.data ? C : 'var(--border-2)'}`, background: rawInput === ds.data ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C }}>{ds.label}</div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>n={ds.data.split(',').length}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Enter Dataset</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Data values</label>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>any separator</span>
            </div>
            <textarea value={rawInput} onChange={e => setRawInput(e.target.value)} rows={4} style={{ width: '100%', border: `1.5px solid ${C}40`, borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} placeholder="e.g. 12, 45, 67, 34, 89..." />
          </div>
          {stats && (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showSorted ? 8 : 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Sorted ({stats.n} values)</span>
                  <button onClick={() => setShowSorted(v => !v)} style={{ fontSize: 10, color: C, background: 'none', border: `1px solid ${C}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}>{showSorted ? 'Hide' : 'Show'}</button>
                </div>
                {showSorted && <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.8, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all', marginTop: 4 }}>{stats.sorted.join(', ')}</div>}
              </div>
              {stats.outliers.length > 0 && (
                <div style={{ padding: '10px 14px', background: '#f59e0b10', borderRadius: 10, border: '1px solid #f59e0b30', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>⚠️ {stats.outliers.length} outlier(s) detected</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{stats.outliers.join(', ')} — beyond 1.5×IQR</div>
                </div>
              )}
              <div style={{ padding: '10px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
                {[['n', stats.n], ['Sum', fmt(stats.sum)], ['Min', fmt(stats.min)], ['Max', fmt(stats.max)], ['Range', fmt(stats.range)]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => setRawInput('72, 85, 91, 68, 79, 85, 92, 88, 74, 85')} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          {stats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[['📊 Mean', fmt(stats.mean), C, ''], ['🎯 Median', fmt(stats.median), '#10b981', ''], ['🔝 Mode', stats.mode.length ? stats.mode.slice(0, 2).map(fmt).join(', ') : 'None', '#f59e0b', stats.mode.length > 1 ? 'multimodal' : stats.mode.length === 1 ? `freq: ${stats.maxFreq}` : 'all unique']].map(([l, v, col, sub]) => (
                  <div key={l} style={{ padding: '14px', borderRadius: 12, background: col + '15', border: `1.5px solid ${col}40`, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                    {sub && <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[['Std Dev (σ)', fmt(stats.stdDev), '#8b5cf6', 'population'], ['Std Dev (s)', fmt(stats.sampleStdDev), '#8b5cf6', 'sample'], ['IQR', fmt(stats.iqr), '#ef4444', `Q1=${fmt(stats.q1)}, Q3=${fmt(stats.q3)}`], ['CV', `${fmt(stats.cv)}%`, '#10b981', 'coeff. of variation']].map(([l, v, col, sub]) => (
                  <div key={l} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
              <BreakdownTable title="Full statistics" rows={[
                { label: 'Mean (μ)', value: fmt(stats.mean), bold: true, highlight: true, color: C },
                { label: 'Median', value: fmt(stats.median), color: '#10b981' },
                { label: 'Mode', value: stats.mode.length ? stats.mode.map(fmt).join(', ') : 'None', color: '#f59e0b' },
                { label: 'Std deviation (σ)', value: fmt(stats.stdDev) },
                { label: 'Variance (σ²)', value: fmt(stats.variance) },
                { label: 'Range', value: fmt(stats.range), note: `${fmt(stats.min)} to ${fmt(stats.max)}` },
                { label: 'IQR (Q3−Q1)', value: fmt(stats.iqr) },
                { label: 'Skewness', value: fmt(stats.skewness), note: stats.skewness > 0.5 ? 'right skewed ▶' : stats.skewness < -0.5 ? '◀ left skewed' : '≈ symmetric' },
              ]} />
              <AIHintCard hint={`n=${stats.n}: Mean=${fmt(stats.mean)}, Median=${fmt(stats.median)}, Mode=${stats.mode.length ? stats.mode.map(fmt).join('/') : 'none'}. ${stats.outliers.length > 0 ? `⚠️ ${stats.outliers.length} outlier(s).` : ''} ${stats.skewness > 0.5 ? 'Right-skewed distribution.' : stats.skewness < -0.5 ? 'Left-skewed.' : 'Approximately symmetric.'}`} color={C} />
            </>
          ) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Enter data values on the left</div>}
        </>}
      />

      {stats && histBins.length > 0 && (
        <Sec title="📊 Interactive Histogram — Hover bars for details" color={C}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 150, marginBottom: 28, position: 'relative' }}>
            {histBins.map((bin, i) => {
              const h = (bin.count / maxBinCount) * 120
              const isHov = hoveredBar === i
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  {isHov && <div style={{ position: 'absolute', top: -46, background: C, color: '#fff', padding: '4px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>[{fmt(bin.min)}–{fmt(bin.max)})<br />n={bin.count} ({(bin.count/stats.n*100).toFixed(1)}%)</div>}
                  <div style={{ width: '100%', height: Math.max(bin.count > 0 ? 4 : 0, h), background: isHov ? C : C + '60', borderRadius: '4px 4px 0 0', transition: 'all .15s' }} />
                  <div style={{ position: 'absolute', bottom: -20, fontSize: 8, color: 'var(--text-3)', textAlign: 'center', width: '100%' }}>{fmt(bin.min)}</div>
                </div>
              )
            })}
            {/* Mean & Median lines */}
            {stats && [{ val: stats.mean, col: C, label: 'μ' }, { val: stats.median, col: '#10b981', label: 'M' }].map(({ val, col, label }) => {
              const pct = Math.max(0, Math.min(98, ((val - stats.min) / (stats.max - stats.min || 1)) * 100))
              return (
                <div key={label} style={{ position: 'absolute', left: `${pct}%`, top: 0, bottom: 28, width: 2, background: col, zIndex: 5 }}>
                  <div style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, fontWeight: 700, color: col, background: 'var(--bg-card)', borderRadius: 4, padding: '1px 3px' }}>{label}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--text-3)' }}>
            <span style={{ color: C }}>█ Frequency bars</span>
            <span style={{ color: C }}>│ Mean μ={fmt(stats.mean)}</span>
            <span style={{ color: '#10b981' }}>│ Median M={fmt(stats.median)}</span>
          </div>
        </Sec>
      )}

      {stats && (
        <Sec title="📋 Frequency Table — Every value counted" sub={`${stats.n} values · ★ = mode`} color={C}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Value', 'Freq', 'Rel Freq', 'Cumulative', 'Bar'].map((h, i) => (
                <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i < 4 ? 'right' : 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {(() => {
                  let cum = 0
                  return stats.sorted.filter((v, i, a) => a.indexOf(v) === i).map((v, i) => {
                    const freq = stats.freq[v] || 0; cum += freq
                    const isMode = stats.mode.includes(v)
                    return (
                      <tr key={i} style={{ background: isMode ? C + '08' : i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                        <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: isMode ? 700 : 400, color: isMode ? C : 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{v}{isMode ? ' ★' : ''}</td>
                        <td style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{freq}</td>
                        <td style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{(freq / stats.n * 100).toFixed(1)}%</td>
                        <td style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{cum}</td>
                        <td style={{ padding: '6px 10px' }}><div style={{ height: 8, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}><div style={{ width: `${(freq / stats.maxFreq) * 100}%`, height: '100%', background: isMode ? C : C + '50', borderRadius: 4 }} /></div></td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        </Sec>
      )}

      {stats && (
        <Sec title="📦 Box Plot (5-Number Summary)" sub="Q1, Median, Q3, Min, Max" color={C}>
          <div style={{ position: 'relative', height: 70, marginBottom: 14 }}>
            {(() => {
              const span = stats.max - stats.min || 1
              const toP = v => ((v - stats.min) / span) * 90 + 5
              const [q1p, medp, q3p, minp, maxp] = [stats.q1, stats.median, stats.q3, stats.min, stats.max].map(toP)
              return (
                <svg viewBox="0 0 100 30" width="100%" style={{ overflow: 'visible' }}>
                  <line x1={minp} y1={15} x2={q1p} y2={15} stroke={C} strokeWidth="1" />
                  <line x1={q3p} y1={15} x2={maxp} y2={15} stroke={C} strokeWidth="1" />
                  <line x1={minp} y1={11} x2={minp} y2={19} stroke={C} strokeWidth="1.5" />
                  <line x1={maxp} y1={11} x2={maxp} y2={19} stroke={C} strokeWidth="1.5" />
                  <rect x={q1p} y={9} width={q3p - q1p} height={12} fill={C + '25'} stroke={C} strokeWidth="1.5" rx="1" />
                  <line x1={medp} y1={9} x2={medp} y2={21} stroke={C} strokeWidth="2.5" />
                  <text x={minp} y={27} textAnchor="middle" fontSize="3.5" fill="var(--text-3)">{fmt(stats.min)}</text>
                  <text x={q1p} y={27} textAnchor="middle" fontSize="3.5" fill={C}>Q1={fmt(stats.q1)}</text>
                  <text x={medp} y={6} textAnchor="middle" fontSize="3.5" fill={C} fontWeight="700">M={fmt(stats.median)}</text>
                  <text x={q3p} y={27} textAnchor="middle" fontSize="3.5" fill={C}>Q3={fmt(stats.q3)}</text>
                  <text x={maxp} y={27} textAnchor="middle" fontSize="3.5" fill="var(--text-3)">{fmt(stats.max)}</text>
                  {stats.outliers.map((v, i) => <circle key={i} cx={toP(v)} cy={15} r={1.5} fill="#ef4444" />)}
                </svg>
              )
            })()}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {[['Min', stats.min], ['Q1', stats.q1], ['Median', stats.median], ['Q3', stats.q3], ['Max', stats.max]].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(v)}</div>
              </div>
            ))}
          </div>
          {stats.outliers.length > 0 && <p style={{ fontSize: 11, color: '#ef4444', margin: '10px 0 0' }}>● Outliers: {stats.outliers.join(', ')} (beyond IQR×1.5)</p>}
        </Sec>
      )}

      {stats && (
        <Sec title="📐 Three Means Compared — Arithmetic, Geometric, Harmonic" color={C}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { name: 'Arithmetic', formula: '(Σx)/n', val: stats.mean, col: C, use: 'Temperature, scores' },
              { name: 'Geometric', formula: '(∏x)^(1/n)', val: stats.geometricMean, col: '#10b981', use: 'Growth rates, ratios' },
              { name: 'Harmonic', formula: 'n/Σ(1/x)', val: stats.harmonicMean, col: '#f59e0b', use: 'Speeds, rates' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, background: m.col + '08', border: `1px solid ${m.col}25` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: m.col, marginBottom: 3 }}>{m.name} Mean</div>
                <div style={{ fontSize: 9, color: m.col, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>{m.formula}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: m.col, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{m.val !== null ? fmt(m.val) : '—'}</div>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{m.val === null ? 'Needs all values > 0' : m.use}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>AM ≥ GM ≥ HM always (AM-GM-HM inequality). Equal only when all values are identical. For investment returns, geometric mean is more accurate.</p>
        </Sec>
      )}

      <Sec title="🌍 Real-world applications" color={C}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🏥', title: 'Healthcare', desc: 'Mean blood pressure across patients. Median survival time (less affected by extreme survivors). Mode = most common diagnosis.', color: C },
            { icon: '💰', title: 'Finance', desc: 'Median household income preferred over mean — the ultra-rich skew the mean dramatically upward.', color: '#10b981' },
            { icon: '🎓', title: 'Education', desc: 'Mean test score = class average. Bimodal may signal two distinct student groups needing different support.', color: '#f59e0b' },
            { icon: '📦', title: 'Quality control', desc: 'Mean and std dev of product dimensions. Outliers flagged by IQR trigger inspection. CV = process consistency.', color: '#8b5cf6' },
          ].map((rw, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 18 }}>{rw.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.title}</span></div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{rw.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" color={C}>
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
