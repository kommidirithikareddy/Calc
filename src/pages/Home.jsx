import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import QuickCalculator from '../components/calculator/QuickCalculator'
import { categories } from '../data/categories'

/* ─── Category card ─── */
function CategoryCard({ category, index }) {
  const [open, setOpen] = useState(true) // ALL open by default
  const navigate = useNavigate()

  return (
    <div className={`cat-card ${open ? 'open' : ''}`} style={{ '--cat': category.color, '--cat-light': category.colorLight }}>
      <div className="cat-card-header" onClick={() => setOpen(o => !o)}>
        <div className="cat-ico" style={{ background: category.colorLight }}>
          {category.icon}
        </div>
        <div className="cat-info">
          <div className="cat-name" style={{ color: category.color }}>{category.name}</div>
          <div className="cat-desc-short">{category.description.slice(0, 68)}…</div>
        </div>
        <div className="cat-header-right">
          <span className="cat-count-badge" style={{ background: category.colorLight, color: category.color }}>
            {category.count}
          </span>
          <svg className={`cat-chevron ${open ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {open && (
        <div className="cat-pills-wrap">
          {category.subcategories.map(sub => (
            <button
              key={sub.slug}
              className="cat-pill"
              onClick={() => navigate(`/${category.slug}/${sub.slug}`)}
              style={{ '--pill-hover-bg': category.colorLight, '--pill-hover-color': category.color, '--pill-hover-border': category.color }}
            >
              <span className="cat-pill-dot" style={{ background: category.color }} />
              {sub.name}
              <span className="cat-pill-count">{sub.count}</span>
            </button>
          ))}
          <button
            className="cat-pill cat-pill-all"
            onClick={() => navigate(`/${category.slug}`)}
            style={{ color: category.color, borderColor: category.color + '50' }}
          >
            Browse all {category.count} →
          </button>
        </div>
      )}

      <style>{`
        .cat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .cat-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.07); }
        .cat-card.open { border-color: var(--cat)30; }
        .cat-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          cursor: pointer;
          user-select: none;
        }
        .cat-ico {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .cat-info { flex: 1; min-width: 0; }
        .cat-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px; font-weight: 700;
          margin-bottom: 2px; letter-spacing: -0.3px;
        }
        .cat-desc-short { font-size: 11px; color: var(--text-3); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cat-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .cat-count-badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
        .cat-chevron { color: var(--text-3); transition: transform 0.2s; }
        .cat-chevron.rotated { transform: rotate(180deg); }

        /* Pills */
        .cat-pills-wrap {
          display: flex; flex-wrap: wrap; gap: 7px;
          padding: 0 20px 18px;
          animation: fadeUp 0.2s ease both;
        }
        .cat-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 6px 13px;
          font-size: 12px; font-weight: 500;
          color: var(--text-2); cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.12s;
        }
        .cat-pill:hover {
          background: var(--pill-hover-bg);
          color: var(--pill-hover-color);
          border-color: var(--pill-hover-border);
          transform: translateY(-1px);
        }
        .cat-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .cat-pill-count { font-size: 10px; opacity: 0.55; font-weight: 600; }
        .cat-pill-all { font-weight: 700; border-style: dashed; background: transparent; }
        .cat-pill-all:hover { border-style: solid; background: var(--bg-raised); }
      `}</style>
    </div>
  )
}

/* ─── KPI strip ─── */
function KPIStrip() {
  const kpis = [
    { val: '200+', lbl: 'Free Calculators', icon: '🧮' },
    { val: '5',    lbl: 'Categories',       icon: '📂' },
    { val: 'AI',   lbl: 'Powered',          icon: '🤖' },
    { val: '0',    lbl: 'Ads. Ever.',       icon: '🚫' },
    { val: 'PWA',  lbl: 'Works Offline',    icon: '📱' },
    { val: '∞',    lbl: 'Always Free',      icon: '✨' },
  ]
  return (
    <div className="kpi-strip">
      {kpis.map((k, i) => (
        <div key={i} className="kpi-item">
          <span className="kpi-icon">{k.icon}</span>
          <div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
          </div>
        </div>
      ))}
      <style>{`
        .kpi-strip {
          display: flex; gap: 0;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-top: 32px;
        }
        .kpi-item {
          flex: 1;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-right: 1px solid var(--border);
        }
        .kpi-item:last-child { border-right: none; }
        .kpi-icon { font-size: 20px; flex-shrink: 0; }
        .kpi-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px; font-weight: 800;
          color: #6366f1; letter-spacing: -0.5px; line-height: 1;
        }
        .kpi-lbl { font-size: 10px; color: var(--text-3); font-weight: 500; margin-top: 2px; }
        @media (max-width: 900px) {
          .kpi-strip { flex-wrap: wrap; }
          .kpi-item { flex: 0 0 33%; border-bottom: 1px solid var(--border); }
        }
        @media (max-width: 520px) {
          .kpi-item { flex: 0 0 50%; }
        }
      `}</style>
    </div>
  )
}

/* ─── Main Home ─── */
export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="home">

        {/* ══ HERO ══ */}
        <section className="hero">
          <div className="hero-inner">

            {/* Left */}
            <div className="hero-left">
              {/* New tag — not redundant */}
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                The only calculator app you'll ever need
              </div>

              <h1 className="hero-h1">
                The Smartest<br />
                Calculator App{' '}
                <em className="hero-em">Period.</em>
              </h1>

              <p className="hero-sub">
                Finance, Health, Engineering, Math &amp; Utilities.<br />
                Every calculation you'll ever need — free, fast, AI-powered.
              </p>

              <div className="hero-ctas">
                <button className="hero-cta-primary" onClick={() => navigate('/finance')}>
                  Browse Calculators
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
                <button className="hero-cta-secondary" onClick={() => document.querySelector('.chat-fab')?.click()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Ask CalC AI
                </button>
              </div>

              {/* KPIs directly below CTAs */}
              <KPIStrip />
            </div>

            {/* Right — quick calc */}
            <div className="hero-right">
              <QuickCalculator />
            </div>

          </div>
        </section>

        {/* ══ CATEGORIES ══ */}
        <section className="cats-section">
          <div className="cats-header">
            <h2 className="cats-title">All Categories &amp; Subcategories</h2>
            <p className="cats-sub">Click any category to explore subcategories and calculators</p>
          </div>
          <div className="cats-grid">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.slug} category={cat} index={i} />
            ))}
          </div>
        </section>

      </div>

      <style>{`
        .home { min-height: 60vh; }

        /* Hero */
        .hero {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: 56px 40px 48px;
        }
        .hero-inner {
          max-width: 1160px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 310px;
          gap: 56px; align-items: flex-start;
        }

        /* Tag */
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 13px; font-weight: 500;
          padding: 8px 16px; border-radius: 20px;
          margin-bottom: 20px; width: fit-content;
        }
        .hero-tag-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #6366f1; flex-shrink: 0;
          animation: fabPulse 2s ease-in-out infinite;
        }

        /* Heading */
        .hero-h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(32px, 4.5vw, 52px);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.06;
          color: var(--text);
          margin: 0 0 16px;
        }
        .hero-em { color: #6366f1; font-style: normal; }

        /* Sub */
        .hero-sub {
          font-size: 16px; color: var(--text-2);
          line-height: 1.7; margin: 0 0 28px;
        }

        /* CTAs */
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }

        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #6366f1; color: #fff;
          border: none; border-radius: 12px;
          padding: 14px 26px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.15s; letter-spacing: -0.2px;
        }
        .hero-cta-primary:hover {
          background: #4f46e5;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          transform: translateY(-1px);
        }
        .hero-cta-primary:active { transform: scale(0.97); }

        .hero-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--bg-raised); color: var(--text);
          border: 1.5px solid var(--border-2);
          border-radius: 12px; padding: 14px 22px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.15s;
        }
        .hero-cta-secondary:hover {
          border-color: #6366f1; color: #6366f1;
          background: #e0e7ff;
        }
        .dark .hero-cta-secondary:hover { background: #6366f120; }

        /* Categories section */
        .cats-section {
          max-width: 1160px; margin: 0 auto;
          padding: 40px 40px 56px;
        }
        .cats-header { margin-bottom: 22px; }
        .cats-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px; font-weight: 700; color: var(--text);
          letter-spacing: -0.4px; margin: 0 0 5px;
        }
        .cats-sub { font-size: 14px; color: var(--text-3); margin: 0; }

        .cats-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        /* Utilities (last) spans full width */
        .cats-grid > *:last-child { grid-column: span 2; }

        /* Responsive */
        @media (max-width: 900px) {
          .hero { padding: 36px 24px 32px; }
          .hero-inner { grid-template-columns: 1fr; gap: 36px; }
          .hero-right { display: flex; justify-content: center; }
          .cats-section { padding: 28px 24px 40px; }
          .cats-grid { grid-template-columns: 1fr; }
          .cats-grid > *:last-child { grid-column: span 1; }
        }
        @media (max-width: 520px) {
          .hero-h1 { font-size: 30px; letter-spacing: -1px; }
        }
      `}</style>
    </Layout>
  )
}
