import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

function ShareButtons() {
  const { isDark } = useTheme()
  const btnStyle = isDark
    ? { background: '#c7d2fe', color: '#1e1b4b', border: 'none' }
    : { background: '#f1f5f9', color: '#374151', border: '0.5px solid #e2e8f0' }

  const items = [
    { label: 'Copy Link', fn: () => navigator.clipboard.writeText(window.location.origin).catch(()=>{}),
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { label: 'Share App', fn: () => navigator.share?.({ title:'CalC', url: window.location.origin }),
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> },
    { label: 'Post on X', fn: () => window.open(`https://twitter.com/intent/tweet?text=Check+out+CalC&url=${encodeURIComponent(window.location.origin)}`,'_blank'),
      icon: <svg width="13" height="13" viewBox="0 0 1200 1227" fill="currentColor"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284Z"/></svg> },
  ]

  return (
    <div className="ft-share-stack">
      {items.map(item => (
        <button key={item.label} className="ft-share-btn" style={btnStyle} onClick={item.fn}>
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  )
}

function TrustPills() {
  const { isDark } = useTheme()
  const pills = [
    { label: 'No signup',        bg: isDark?'#6366f120':'#e0e7ff', color: isDark?'#a5b4fc':'#4f46e5', border: isDark?'#6366f150':'#c7d2fe' },
    { label: 'Always free',      bg: isDark?'#10b98120':'#d1fae5', color: isDark?'#34d399':'#059669',  border: isDark?'#10b98150':'#a7f3d0' },
    { label: 'Zero ads',         bg: isDark?'#0d948820':'#eafffd', color: isDark?'#2dd4bf':'#0d9488',  border: isDark?'#0d948850':'#99f6e4' },
    { label: 'Works offline',    bg: isDark?'#3b82f620':'#dbeafe', color: isDark?'#93c5fd':'#2563eb',  border: isDark?'#3b82f650':'#bfdbfe' },
    { label: '☀️🌙 Light & Dark', bg: isDark?'#f9731620':'#fff7ed', color: isDark?'#fb923c':'#ea580c',  border: isDark?'#f9731650':'#fed7aa' },
  ]
  return (
    <div className="ft-pills">
      {pills.map(p => (
        <span key={p.label} className="ft-pill" style={{ background:p.bg, color:p.color, borderColor:p.border }}>{p.label}</span>
      ))}
    </div>
  )
}

export default function Footer() {
  const { isDark } = useTheme()

  const linkCols = [
    {
      title: 'Finance', dotColor: isDark?'#818cf8':'#6366f1',
      links: ['Compound Interest','Mortgage Calculator','Loan Calculator','ROI Calculator','FIRE Calculator','Savings Goal','Salary to Hourly','Retirement Planner'],
      seeAll: 'All 60+ →', seeColor: isDark?'#818cf8':'#6366f1',
    },
    {
      title: 'Health', dotColor: isDark?'#34d399':'#10b981',
      links: ['BMI Calculator','Calorie Calculator','TDEE Calculator','Body Fat %','Macro Calculator','Due Date Calc','Pace Calculator','Water Intake'],
      seeAll: 'All 45+ →', seeColor: isDark?'#34d399':'#10b981',
    },
    {
      title: 'Engineering', dotColor: isDark?'#fbbf24':'#f59e0b',
      links: ["Ohm's Law",'Reynolds Number','Flow Rate Calc','Voltage Drop','Unit Converters'],
      seeAll: 'All 30+ →', seeColor: isDark?'#fbbf24':'#f59e0b',
      extra: {
        title: 'Math', dotColor: isDark?'#93c5fd':'#3b82f6',
        links: ['Percentage Calc','Quadratic Solver','Age Calculator','Statistics Calc'],
        seeAll: 'All 25+ →', seeColor: isDark?'#93c5fd':'#3b82f6',
      },
    },
    {
      // ✅ TEAL for Utilities
      title: 'Utilities', dotColor: isDark?'#2dd4bf':'#0d9488',
      links: ['Tip Calculator','Discount Calc','Fuel Cost','Paint Calculator','Currency Converter','Profit Margin'],
      seeAll: 'All 40+ →', seeColor: isDark?'#2dd4bf':'#0d9488',
      extra: {
        title: 'Company', isCompany: true,
        links: ['About CalC','Contact Us','Terms of Use'],
      },
    },
  ]

  return (
    <>
      <footer className="footer">
        <div className="footer-body">
          {/* Brand col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" style={{ color: isDark?'#f1f5f9':'#111827' }}>
              Cal<span style={{ background:'#6366f1', color:'#fff', padding:'0 5px', borderRadius:'6px', marginLeft:'2px', fontSize:'16px' }}>C</span>
            </Link>
            <p className="footer-desc">The most complete free calculator app. Finance, Health, Engineering, Math & Utilities — beautifully designed, AI-powered, works everywhere.</p>
            <p className="footer-share-label">Share CalC</p>
            <ShareButtons />
            <TrustPills />
          </div>

          {/* Link cols */}
          {linkCols.map(col => (
            <div key={col.title} className="footer-col">
              <div className="footer-col-title">
                <span className="footer-col-dot" style={{ background: col.dotColor }} />
                <span style={{ color: isDark?'#e2e8f0':'#1e293b' }}>{col.title}</span>
              </div>
              {col.links.map(l => <a key={l} className="footer-link">{l}</a>)}
              <a className="footer-see" style={{ color: col.seeColor }}>{col.seeAll}</a>

              {col.extra && <>
                <hr className="footer-hr" />
                <div className="footer-col-title" style={{ marginTop: '4px' }}>
                  {!col.extra.isCompany && <span className="footer-col-dot" style={{ background: col.extra.dotColor }} />}
                  <span style={{
                    color: col.extra.isCompany ? (isDark?'#475569':'#94a3b8') : (isDark?'#e2e8f0':'#1e293b'),
                    fontSize: col.extra.isCompany ? '9px' : undefined,
                    textTransform: col.extra.isCompany ? 'uppercase' : undefined,
                    letterSpacing: col.extra.isCompany ? '0.06em' : undefined,
                  }}>
                    {col.extra.title}
                  </span>
                </div>
                {col.extra.links.map(l => <a key={l} className="footer-link">{l}</a>)}
                {col.extra.seeAll && <a className="footer-see" style={{ color: col.extra.seeColor }}>{col.extra.seeAll}</a>}
              </>}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 CalC · Built with React + Vite</span>
          <div className="footer-bottom-links">
            <a className="footer-bottom-link">Terms</a>
            <a className="footer-bottom-link">Contact</a>
            <a className="footer-ai-link">✦ Ask CalC AI</a>
          </div>
        </div>
      </footer>

      <style>{`
        .footer { background: var(--bg-card); border-top: 1px solid var(--border); font-family: 'DM Sans', sans-serif; }
        .footer-body { display: grid; grid-template-columns: 210px 1fr 1fr 1fr 1fr; border-bottom: 1px solid var(--border); }
        .footer-brand { padding: 24px 20px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .footer-logo { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; text-decoration: none; margin-bottom: 9px; letter-spacing: -0.3px; }
        .footer-desc { font-size: 11px; color: var(--text-3); line-height: 1.7; margin-bottom: 16px; }
        .footer-share-label { font-size: 9px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .ft-share-stack { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .ft-share-btn { display: flex; align-items: center; gap: 8px; border-radius: 8px; padding: 8px 12px; font-size: 10px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; width: 100%; transition: all 0.12s; }
        .ft-share-btn:hover { background: #6366f1 !important; color: #fff !important; }
        .ft-pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .ft-pill { font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 14px; border: 1px solid; white-space: nowrap; }
        .footer-col { padding: 24px 15px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .footer-col:last-child { border-right: none; }
        .footer-col-title { font-size: 10px; font-weight: 700; margin-bottom: 11px; display: flex; align-items: center; gap: 6px; font-family: 'Space Grotesk', sans-serif; }
        .footer-col-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .footer-link { font-size: 11px; color: var(--text-3); display: block; padding: 3px 0; cursor: pointer; text-decoration: none; transition: color 0.1s; line-height: 1.6; }
        .footer-link:hover { color: #6366f1; }
        .footer-see { font-size: 10px; font-weight: 700; display: block; padding: 3px 0; cursor: pointer; margin-top: 5px; text-decoration: none; }
        .footer-see:hover { opacity: 0.75; }
        .footer-hr { border: none; border-top: 0.5px solid var(--border); margin: 13px 0; }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 13px 20px; }
        .footer-copy { font-size: 10px; color: var(--text-3); }
        .footer-bottom-links { display: flex; gap: 16px; align-items: center; }
        .footer-bottom-link { font-size: 10px; color: var(--text-3); cursor: pointer; text-decoration: none; transition: color 0.1s; }
        .footer-bottom-link:hover { color: #6366f1; }
        .footer-ai-link { font-size: 10px; font-weight: 700; color: #6366f1; cursor: pointer; }
        @media (max-width: 900px) { .footer-body { grid-template-columns: 1fr 1fr; } .footer-brand { grid-column: span 2; border-right: none; border-bottom: 1px solid var(--border); } }
        @media (max-width: 600px) { .footer-body { grid-template-columns: 1fr; } .footer-col { border-right: none; border-bottom: 1px solid var(--border); } }
      `}</style>
    </>
  )
}
