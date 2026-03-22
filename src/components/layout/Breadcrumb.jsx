import { Link, useLocation } from 'react-router-dom'
import { getCategoryBySlug, getSubcategoryBySlug } from '../../data/categories'
import { getCalculatorBySlug } from '../../data/calculators'

/**
 * Breadcrumb — auto-generates from URL
 * Home › Finance › Investment & Growth › Compound Interest Calculator
 */
export default function Breadcrumb() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)

  if (parts.length === 0) return null

  const [catSlug, subSlug, calcSlug] = parts

  const cat  = catSlug  ? getCategoryBySlug(catSlug)              : null
  const sub  = subSlug  ? getSubcategoryBySlug(catSlug, subSlug)  : null
  const calc = calcSlug ? getCalculatorBySlug(calcSlug)           : null

  const crumbs = [
    { label: 'Home', to: '/' },
    cat  && { label: cat.name,  to: `/${catSlug}` },
    sub  && { label: sub.name,  to: `/${catSlug}/${subSlug}` },
    calc && { label: calc.name, to: null }, // last item — no link
  ].filter(Boolean)

  if (crumbs.length <= 1) return null

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.label} className="bc-item">
            {i > 0 && <span className="bc-sep" aria-hidden>›</span>}
            {crumb.to ? (
              <Link to={crumb.to} className="bc-link">{crumb.label}</Link>
            ) : (
              <span className="bc-current" aria-current="page">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <style>{`
        .breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 2px;
          padding: 9px 24px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          font-size: 12px;
        }
        .bc-item {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .bc-sep {
          color: var(--border-2);
          font-size: 10px;
          margin: 0 3px;
        }
        .bc-link {
          color: var(--text-3);
          text-decoration: none;
          transition: color 0.1s;
        }
        .bc-link:hover { color: #6366f1; }
        .bc-current {
          color: var(--text);
          font-weight: 500;
        }
      `}</style>
    </>
  )
}
