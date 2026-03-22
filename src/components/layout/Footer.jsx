import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

function ShareButtons() {
  const { isDark } = useTheme()
  const items = [
    {
      label: 'Copy Link',
      fn: () => navigator.clipboard.writeText(window.location.origin).catch(() => {}),
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    },
    {
      label: 'Share App',
      fn: () => navigator.share?.({ title: 'CalC', url: window.location.origin }),
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
    },
    {
      label: 'Post on X',
      fn: () => window.open(`https://twitter.com/intent/tweet?text=Check+out+CalC&url=${encodeURIComponent(window.location.origin)}`, '_blank'),
      icon: <svg width="12" height="12" viewBox="0 0 1200 1227" fill="currentColor"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284Z"/></svg>,
    },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      {items.map(item => (
        <button key={item.label} onClick={item.fn}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 12px', borderRadius: 9,
            background: isDark ? '#1a1a2e' : '#f8fafc',
            border: `0.5px solid ${isDark ? '#2d2d4e' : '#e2e8f0'}`,
            color: isDark ? '#94a3b8' : '#475569',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.12s', width: '100%', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1a1a2e' : '#f8fafc'; e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569'; e.currentTarget.style.borderColor = isDark ? '#2d2d4e' : '#e2e8f0' }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  )
}

function TrustPills() {
  const { isDark } = useTheme()
  const pills = [
    { label: 'No signup',      color: '#6366f1', lightBg: '#e0e7ff', darkBg: '#6366f120' },
    { label: 'Always free',    color: '#10b981', lightBg: '#d1fae5', darkBg: '#10b98120' },
    { label: 'Zero ads',       color: '#f59e0b', lightBg: '#fef3c7', darkBg: '#f59e0b20' },
    { label: 'Works offline',  color: '#3b82f6', lightBg: '#dbeafe', darkBg: '#3b82f620' },
    { label: '☀️ Light & Dark', color: '#8b5cf6', lightBg: '#ede9fe', darkBg: '#8b5cf620' },
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {pills.map(p => (
        <span key={p.label} style={{
          fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 12,
          background: isDark ? p.darkBg : p.lightBg,
          color: p.color, border: `1px solid ${p.color}30`, whiteSpace: 'nowrap',
        }}>{p.label}</span>
      ))}
    </div>
  )
}

const COLS = [
  {
    slug: 'finance', label: 'Finance', color: '#6366f1',
    links: ['Compound Interest', 'Mortgage Calculator', 'Loan Calculator', 'ROI Calculator', 'FIRE Calculator', 'Savings Goal', 'Salary to Hourly', 'Retirement Planner'],
    seeAll: 'All 60+ →',
  },
  {
    slug: 'health', label: 'Health', color: '#10b981',
    links: ['BMI Calculator', 'Calorie Calculator', 'TDEE Calculator', 'Body Fat %', 'Macro Calculator', 'Due Date Calc', 'Pace Calculator', 'Water Intake'],
    seeAll: 'All 45+ →',
  },
  {
    slug: 'engineering', label: 'Engineering', color: '#f59e0b',
    links: ["Ohm's Law", 'Reynolds Number', 'Flow Rate Calc', 'Voltage Drop', 'Unit Converters'],
    seeAll: 'All 30+ →',
  },
  {
    slug: 'math', label: 'Math', color: '#3b82f6',
    links: ['Percentage Calc', 'Quadratic Solver', 'Age Calculator', 'Statistics Calc', 'Date Difference'],
    seeAll: 'All 25+ →',
  },
  {
    slug: 'utilities', label: 'Utilities', color: '#0d9488',
    links: ['Tip Calculator', 'Discount Calc', 'Fuel Cost', 'Paint Calculator', 'Currency Converter', 'Profit Margin'],
    seeAll: 'All 40+ →',
  },
]

export default function Footer() {
  const { isDark } = useTheme()

  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Main grid — aligned to same maxWidth + padding as nav and pages */}
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '36px 40px 0',
        display: 'grid',
        gridTemplateColumns: '200px repeat(5, 1fr)',
        borderBottom: '1px solid var(--border)',
      }}>

        {/* Brand */}
        <div style={{ paddingRight: 24, paddingBottom: 32, borderRight: '1px solid var(--border)' }}>
          <Link to="/" style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800,
            color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.3px',
            display: 'inline-flex', alignItems: 'center', marginBottom: 10,
          }}>
            Cal<span style={{ background: '#6366f1', color: '#fff', padding: '1px 6px', borderRadius: 6, marginLeft: 2, fontSize: 16 }}>C</span>
          </Link>
          <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 18 }}>
            The most complete free calculator app. Finance, Health, Engineering, Math & Utilities — AI-powered, works everywhere.
          </p>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Share CalC
          </p>
          <ShareButtons />
          <TrustPills />
        </div>

        {/* 5 category columns */}
        {COLS.map((col, i) => (
          <div key={col.slug} style={{
            padding: '2px 0 32px 20px',
            borderRight: i < COLS.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            {/* Heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
              <Link to={`/${col.slug}`} style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text)',
                textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {col.label}
              </Link>
            </div>

            {/* Links */}
            {col.links.map(l => (
              <div key={l}
                style={{ padding: '3px 0', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6, cursor: 'pointer', transition: 'color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.color = col.color}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >{l}</div>
            ))}

            <Link to={`/${col.slug}`} style={{
              display: 'inline-block', marginTop: 8,
              fontSize: 10, fontWeight: 700, color: col.color, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {col.seeAll}
            </Link>

            {/* Company block in last column */}
            {i === COLS.length - 1 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Company
                </div>
                {['About CalC', 'Contact Us', 'Terms of Use'].map(l => (
                  <div key={l}
                    style={{ padding: '3px 0', fontSize: 11, color: 'var(--text-3)', cursor: 'pointer', transition: 'color 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >{l}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '13px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>© 2026 CalC · Built with React + Vite</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {['Terms', 'Contact'].map(l => (
            <span key={l}
              style={{ fontSize: 10, color: 'var(--text-3)', cursor: 'pointer', transition: 'color 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >{l}</span>
          ))}
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', cursor: 'pointer' }}>✦ Ask CalC AI</span>
        </div>
      </div>

    </footer>
  )
}
