import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { categories } from '../../data/categories'

function NavDropdown({ category, isOpen }) {
  if (!isOpen) return null
  return (
    <div className="nav-dropdown">
      <div className="nav-dd-grid">
        {category.subcategories.map(sub => (
          <div key={sub.slug} className="nav-dd-group">
            <div className="nav-dd-group-title" style={{ color: category.color }}>{sub.name}</div>
            <Link to={`/${category.slug}/${sub.slug}`} className="nav-dd-item">
              <span className="nav-dd-dot" />Browse all {sub.count} calculators
            </Link>
          </div>
        ))}
      </div>
      <div className="nav-dd-footer">
        <Link to={`/${category.slug}`} className="nav-dd-see" style={{ color: category.color }}>
          Browse all {category.count} {category.name} calculators →
        </Link>
      </div>
    </div>
  )
}

function NavItem({ category, isActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={`nav-item ${open ? 'open' : ''}`}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link to={`/${category.slug}`} className={`nav-link ${isActive ? 'active' : ''}`}>
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
        {/* Logo — Manrope font */}
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

        /* ✓ Manrope logo font */
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
        .nav-link.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: 600; }
        .nav-link-arrow { opacity: 0.45; transition: transform 0.15s; flex-shrink: 0; }
        .nav-item.open .nav-link-arrow,
        .nav-item:hover .nav-link-arrow { transform: rotate(180deg); opacity: 1; }

        .nav-right { margin-left: auto; }
        .nav-theme-btn {
          width: 38px; height: 38px; border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--bg-raised);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-2); transition: all 0.15s;
        }
        .nav-theme-btn:hover { border-color: #6366f1; color: #6366f1; background: #e0e7ff; }

        /* Dropdown */
        .nav-dropdown {
          display: none;
          position: absolute; top: 60px; left: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0 16px 16px 16px;
          padding: 20px; width: 540px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          z-index: 200; animation: fadeIn 0.15s ease both;
        }
        .nav-item:hover .nav-dropdown,
        .nav-item.open .nav-dropdown { display: block; }

        .nav-dd-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 14px; }
        .nav-dd-group { padding: 10px; border-radius: 10px; cursor: pointer; transition: background 0.1s; }
        .nav-dd-group:hover { background: var(--bg-raised); }
        .nav-dd-group-title {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 8px; padding-bottom: 6px;
          border-bottom: 0.5px solid var(--border);
          font-family: 'Space Grotesk', sans-serif;
        }
        .nav-dd-item {
          font-size: 12px; color: var(--text-2); padding: 3px 0;
          display: flex; align-items: center; gap: 6px;
          text-decoration: none; transition: color 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-dd-item:hover { color: #6366f1; }
        .nav-dd-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border-2); flex-shrink: 0; }
        .nav-dd-footer { padding-top: 12px; border-top: 0.5px solid var(--border); text-align: right; }
        .nav-dd-see { font-size: 12px; font-weight: 600; text-decoration: none; transition: opacity 0.1s; }
        .nav-dd-see:hover { opacity: 0.75; }

        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) { .nav-links { display: none; } .nav { padding: 0 20px; } }
      `}</style>
    </>
  )
}
