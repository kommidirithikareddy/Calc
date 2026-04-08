import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import ContactModal from '../ContactModal'

const SECTIONS = [
  {
    slug: 'finance', label: 'Finance', color: '#6366f1',
    calcs: [
      'Compound Interest', 'Mortgage Calculator', 'FIRE Calculator',
      'ROI Calculator', 'Savings Goal', 'Loan Payoff',
      'Retirement Planner', 'Roth IRA', 'Debt Payoff', 'APR Calculator',
    ],
  },
  {
    slug: 'health', label: 'Health', color: '#10b981',
    calcs: [
      'BMI Calculator', 'TDEE Calculator', 'Calorie Calculator',
      'Body Fat %', 'Macro Calculator', 'Pace Calculator',
      'Water Intake', 'Due Date Calc', 'Heart Rate Zones', 'Sleep Calculator',
    ],
  },
  {
    slug: 'engineering', label: 'Engineering', color: '#f59e0b',
    calcs: [
      "Ohm's Law", 'Reynolds Number', 'Voltage Drop',
      'Flow Rate', 'Binary Converter', 'Unit Converter',
      'Resistor Color Code', 'Power Calculator',
    ],
  },
  {
    slug: 'math', label: 'Math', color: '#3b82f6',
    calcs: [
      'Percentage Calc', 'Quadratic Solver', 'Age Calculator',
      'Statistics Calc', 'Date Difference', 'GCD & LCM',
      'Prime Checker', 'Fraction Calculator',
    ],
  },
  {
    slug: 'utilities', label: 'Utilities', color: '#0d9488',
    calcs: [
      'Tip Calculator', 'Discount Calc', 'Fuel Cost',
      'Currency Converter', 'Profit Margin', 'Paint Calculator',
      'Grade Calculator', 'Time Zone Converter',
    ],
  },
]

const STATS = [
  { val: '200+', lbl: 'Calculators' },
  { val: '5',    lbl: 'Categories'  },
  { val: '∞',    lbl: 'Always Free' },
  { val: 'AI',   lbl: 'Powered'     },
]

export default function Footer() {
  const { isDark } = useTheme()
  const [contactOpen, setContactOpen] = useState(false)

  const bg       = isDark ? '#0d0d14' : '#f4f5ff'
  const bgCard   = isDark ? '#111118' : '#eceeff'
  const border   = isDark ? '#1c1c2e' : '#dddff5'
  const textMid  = isDark ? '#55556a' : '#8889aa'
  const textDim  = isDark ? '#1e1e2c' : '#d8daee'
  const textMain = isDark ? '#e0e0f0' : '#1a1a2e'

  const linkStyle = {
    fontSize: 11.5, color: textMid,
    cursor: 'pointer', padding: '4px 0',
    transition: 'color .1s', display: 'block',
    textDecoration: 'none',
  }

  return (
    <>
      <footer style={{
        background: bg,
        borderTop: `1px solid ${border}`,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* ── Main Grid: Brand | Calc Grid | Stats+Company ── */}
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          padding: '40px 40px 0',
          display: 'grid',
          gridTemplateColumns: '210px 1fr 155px',
          gap: 40,
          borderBottom: `1px solid ${border}`,
        }}>

          {/* ── Col 1: Brand ── */}
          <div style={{ paddingBottom: 36, borderRight: `1px solid ${border}`, paddingRight: 24 }}>
            <Link to="/" style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 900,
              color: textMain, textDecoration: 'none', letterSpacing: '-0.5px',
              display: 'inline-flex', alignItems: 'center', marginBottom: 12,
            }}>
              Cal<span style={{
                background: '#6366f1', color: '#fff',
                padding: '1px 7px', borderRadius: 6,
                marginLeft: 2, fontSize: 18,
              }}>C</span>
            </Link>

            <p style={{ fontSize: 11.5, color: textMid, lineHeight: 1.8, marginBottom: 20 }}>
              The most complete free calculator suite. Finance, Health, Engineering, Math & Utilities — all in one place.
            </p>

            {/* Trust checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { icon: '✓', text: 'No signup required',  color: '#10b981' },
                { icon: '✓', text: 'Zero ads, ever',       color: '#10b981' },
                { icon: '✓', text: 'Works offline (PWA)',  color: '#10b981' },
                { icon: '✦', text: 'AI-powered assistant', color: '#6366f1' },
              ].map(t => (
                <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 11.5, color: textMid }}>
                  <span style={{ color: t.color, fontWeight: 800, fontSize: 13, width: 14, flexShrink: 0 }}>{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Copy Link', fn: () => navigator.clipboard.writeText(window.location.origin).catch(() => {}) },
                { label: 'Post on X', fn: () => window.open(`https://twitter.com/intent/tweet?text=Check+out+CalC&url=${encodeURIComponent(window.location.origin)}`, '_blank') },
              ].map(btn => (
                <button key={btn.label} onClick={btn.fn} style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '7px 14px', borderRadius: 9,
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  color: textMid, cursor: 'pointer',
                  transition: 'all .12s', textAlign: 'left',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#6366f108' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMid; e.currentTarget.style.background = 'transparent' }}
                >{btn.label}</button>
              ))}
            </div>
          </div>

          {/* ── Col 2: 5-column calculator grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 24, paddingBottom: 36, paddingTop: 4,
          }}>
            {SECTIONS.map(sec => (
              <div key={sec.slug}>
                <Link to={`/${sec.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 12, textDecoration: 'none',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sec.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: sec.color, fontFamily: "'Manrope', sans-serif" }}>{sec.label}</span>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {sec.calcs.map(calc => (
                    <Link key={calc} to={`/${sec.slug}`} style={{
                      fontSize: 11, color: textMid, textDecoration: 'none',
                      padding: '3.5px 0', borderBottom: `1px solid ${textDim}`,
                      transition: 'color .1s', lineHeight: 1.4,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = sec.color}
                      onMouseLeave={e => e.currentTarget.style.color = textMid}
                    >{calc}</Link>
                  ))}
                  <Link to={`/${sec.slug}`} style={{
                    fontSize: 10, fontWeight: 700, color: sec.color,
                    textDecoration: 'none', marginTop: 8, opacity: 0.65,
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}
                  >Browse all →</Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Col 3: Stats + Company (RIGHT) ── */}
          <div style={{ paddingBottom: 36, paddingTop: 4, borderLeft: `1px solid ${border}`, paddingLeft: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: textMid, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>By the numbers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATS.map(s => (
                <div key={s.lbl} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: bgCard, border: `1px solid ${border}`,
                }}>
                  <div style={{
                    fontSize: 22, fontWeight: 900, color: '#6366f1',
                    fontFamily: "'Manrope', sans-serif", lineHeight: 1, letterSpacing: '-0.5px',
                  }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: textMid, marginTop: 3 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Company links */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: textMid, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Company</div>

              <Link to="/about" style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = textMain}
                onMouseLeave={e => e.currentTarget.style.color = textMid}
              >About CalC</Link>

              <div style={linkStyle}
                onClick={() => setContactOpen(true)}
                onMouseEnter={e => e.currentTarget.style.color = textMain}
                onMouseLeave={e => e.currentTarget.style.color = textMid}
              >Contact Us</div>

              <Link to="/terms" style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = textMain}
                onMouseLeave={e => e.currentTarget.style.color = textMid}
              >Terms of Use</Link>

              <Link to="/privacy" style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = textMain}
                onMouseLeave={e => e.currentTarget.style.color = textMid}
              >Privacy</Link>
            </div>
          </div>

        </div>

        {/* ── Bottom bar — centered ── */}
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          padding: '14px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, color: textMid, fontWeight: 500 }}>
            © 2026 CalC · Built by Rithika
          </span>
        </div>
      </footer>

      {/* Contact modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
