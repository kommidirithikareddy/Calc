import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { categories } from '../../data/categories'
import { getCalculatorsBySubcategory } from '../../data/calculators'

const CAT_COLORS = {
  finance:     '#6366f1',
  health:      '#10b981',
  engineering: '#f59e0b',
  math:        '#3b82f6',
  utilities:   '#0d9488',
}

function NavDropdown({ category, isOpen }) {
  const [activeSub, setActiveSub] = useState(category.subcategories[0]?.slug || '')
  const color = CAT_COLORS[category.slug] || '#6366f1'

  useEffect(() => {
    if (isOpen) setActiveSub(category.subcategories[0]?.slug || '')
  }, [isOpen, category.slug])

  if (!isOpen) return null

  const currentSub = category.subcategories.find(s => s.slug === activeSub)
  const calcs = currentSub ? getCalculatorsBySubcategory(category.slug, activeSub) : []

  return (
    <div className="nav-dropdown">
      <div className="nav-dd-inner">

        {/* LEFT sidebar — Space Grotesk */}
        <div className="nav-dd-sidebar">
          <div className="nav-dd-sidebar-label">{category.name}</div>
          {category.subcategories.map(sub => (
            <div
              key={sub.slug}
              className={`nav-dd-sub ${activeSub === sub.slug ? 'active' : ''}`}
              style={activeSub === sub.slug ? { color, borderRightColor: color, background: 'var(--bg-card)' } : {}}
              onMouseEnter={() => setActiveSub(sub.slug)}
            >
              <span className="nav-dd-sub-icon">{sub.icon}</span>
              <span className="nav-dd-sub-name">{sub.name}</span>
              <span className="nav-dd-sub-count"
                style={activeSub === sub.slug ? { background: color + '20', color } : {}}>
                {sub.count}
              </span>
            </div>
          ))}
          <div className="nav-dd-sidebar-footer">
            <Link to={`/${category.slug}`} className="nav-dd-all" style={{ color }}>
              All {category.count} {category.name} →
            </Link>
          </div>
        </div>

        {/* RIGHT panel — calculator list */}
        <div className="nav-dd-panel">
          {currentSub && (
            <>
              <div className="nav-dd-panel-header">
                <span className="nav-dd-panel-title" style={{ color }}>
                  {currentSub.name}
                </span>
                <Link
                  to={`/${category.slug}/${currentSub.slug}`}
                  className="nav-dd-panel-viewall"
                  style={{ color }}
                >
                  View all {currentSub.count} →
                </Link>
              </div>
              <div className="nav-dd-panel-desc">
                {currentSub.description?.slice(0, 110)}…
              </div>
              <div className="nav-dd-calc-list">
                {calcs.map(calc => (
                  <Link
                    key={calc.slug}
                    to={`/${category.slug}/${currentSub.slug}/${calc.slug}`}
                    className="nav-dd-calc-item"
                    style={{ '--cat': color }}
                  >
                    <span className="nav-dd-calc-dot" style={{ background: color }} />
                    {calc.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function NavItem({ category, isActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const color = CAT_COLORS[category.slug] || '#6366f1'

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={`nav-item ${open ? 'open' : ''}`}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        to={`/${category.slug}`}
        className={`nav-link ${isActive ? 'active' : ''}`}
        style={isActive ? { color, borderBottomColor: color } : {}}
      >
        {category.name}
        <svg className="nav-link-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
      <NavDropdown category={category} isOpen={open} />
    </div>
  )
}

export default function Nav() {
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const currentCat = location.pathname.split('/')[1]

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">
          Cal<span className="nav-logo-c">C</span>
        </Link>
        <div className="nav-links">
          {categories.map(cat => (
            <NavItem key={cat.slug} category={cat} isActive={currentCat === cat.slug} />
          ))}
        </div>
        <div className="nav-right">
          <button className="nav-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      <style>{`
        .nav {
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          height: 60px;
          display: flex; align-items: center;
          padding: 0 32px;
          position: sticky; top: 0; z-index: 100;
        }

        /* Logo — Manrope 800 */
        .nav-logo {
          font-family: 'Manrope', sans-serif;
          font-size: 21px; font-weight: 800;
          color: var(--text); letter-spacing: -0.5px;
          margin-right: 32px; flex-shrink: 0;
          text-decoration: none; transition: opacity 0.15s;
        }
        .nav-logo:hover { opacity: 0.8; }
        .nav-logo-c {
          background: #6366f1; color: #fff;
          padding: 2px 7px; border-radius: 7px;
          margin-left: 2px; font-size: 19px;
        }

        /* Nav links — DM Sans */
        .nav-links { display: flex; height: 60px; flex: 1; }
        .nav-item { position: relative; height: 100%; }
        .nav-link {
          padding: 0 15px; font-size: 13.5px; font-weight: 500;
          color: var(--text-2); cursor: pointer; height: 100%;
          display: flex; align-items: center; gap: 5px;
          border-bottom: 2.5px solid transparent;
          text-decoration: none; transition: color 0.12s;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.1px;
        }
        .nav-link:hover { color: #6366f1; }
        .nav-link.active { font-weight: 600; }
        .nav-link-arrow { opacity: 0.45; transition: transform 0.15s; flex-shrink: 0; }
        .nav-item.open .nav-link-arrow,
        .nav-item:hover .nav-link-arrow { transform: rotate(180deg); opacity: 1; }

        .nav-right { margin-left: auto; }
        .nav-theme-btn {
          width: 38px; height: 38px; border-radius: 11px;
          border: 1px solid var(--border); background: var(--bg-raised);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-2); transition: all 0.15s;
        }
        .nav-theme-btn:hover { border-color: #6366f1; color: #6366f1; background: #e0e7ff; }

        /* ── Dropdown ── */
        .nav-dropdown {
          display: none;
          position: absolute; top: 60px; left: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0 16px 16px 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.13);
          z-index: 200;
          animation: fadeIn 0.15s ease both;
          width: 680px;
          overflow: hidden;
        }
        .nav-item:hover .nav-dropdown,
        .nav-item.open .nav-dropdown { display: block; }

        .nav-dd-inner {
          display: grid;
          grid-template-columns: 195px 1fr;
          min-height: 300px;
        }

        /* LEFT sidebar — Space Grotesk for subcategory names */
        .nav-dd-sidebar {
          background: var(--bg-raised);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
        }
        .nav-dd-sidebar-label {
          font-family: 'Manrope', sans-serif;
          font-size: 9px; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-3);
          padding: 13px 14px 10px;
          border-bottom: 0.5px solid var(--border);
        }
        .nav-dd-sub {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
          border-right: 2px solid transparent;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 500;
          color: var(--text-2);
        }
        .nav-dd-sub:hover { background: var(--bg-card); color: var(--text); }
        .nav-dd-sub.active { font-weight: 600; }
        .nav-dd-sub-icon { font-size: 13px; flex-shrink: 0; width: 18px; text-align: center; }
        .nav-dd-sub-name { flex: 1; line-height: 1.3; }
        .nav-dd-sub-count {
          font-size: 9px; font-weight: 700;
          background: var(--border); color: var(--text-3);
          padding: 1px 5px; border-radius: 8px; flex-shrink: 0;
          transition: background 0.1s, color 0.1s;
        }
        .nav-dd-sidebar-footer {
          margin-top: auto;
          padding: 11px 14px;
          border-top: 0.5px solid var(--border);
        }
        .nav-dd-all {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px; font-weight: 700;
          text-decoration: none; transition: opacity 0.1s;
        }
        .nav-dd-all:hover { opacity: 0.7; }

        /* RIGHT panel */
        .nav-dd-panel {
          padding: 15px 18px;
          overflow-y: auto;
          max-height: 420px;
        }
        .nav-dd-panel-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 5px;
        }

        /* Subcategory title — Plus Jakarta Sans bold display */
        .nav-dd-panel-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 800;
          letter-spacing: -0.3px;
        }
        .nav-dd-panel-viewall {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          text-decoration: none; opacity: 0.75;
          transition: opacity 0.1s; white-space: nowrap;
        }
        .nav-dd-panel-viewall:hover { opacity: 1; }

        /* Description — DM Sans regular */
        .nav-dd-panel-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; color: var(--text-3);
          line-height: 1.6; margin-bottom: 12px;
          padding-bottom: 11px;
          border-bottom: 0.5px solid var(--border);
        }

        /* Calculator list — DM Sans */
        .nav-dd-calc-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
        }
        .nav-dd-calc-item {
          display: flex; align-items: center; gap: 7px;
          padding: 5px 7px; border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 400;
          color: var(--text-2);
          text-decoration: none;
          transition: background 0.1s, color 0.1s;
        }
        .nav-dd-calc-item:hover {
          background: var(--bg-raised);
          color: var(--cat, #6366f1);
        }
        .nav-dd-calc-dot {
          width: 5px; height: 5px;
          border-radius: 50%; flex-shrink: 0; opacity: 0.55;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav { padding: 0 20px; }
        }
      `}</style>
    </>
  )
}
