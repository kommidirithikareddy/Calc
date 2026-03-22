import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Breadcrumb from '../components/layout/Breadcrumb'
import { getCategoryBySlug, getSubcategoryBySlug } from '../data/categories'
import { getCalculatorsBySubcategory } from '../data/calculators'

// ✓ NO style badge — removed Slider+Field / Fields Only / Step Wizard tags
function CalcListItem({ calc, catColor }) {
  const navigate = useNavigate()

  return (
    <div className="cli" onClick={() => navigate(`/${calc.category}/${calc.subcategory}/${calc.slug}`)}
      style={{ '--cat': catColor }}>
      <div className="cli-icon" style={{ background: catColor + '18' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="12" y2="14"/>
        </svg>
      </div>
      <div className="cli-info">
        <div className="cli-name">{calc.name}</div>
        <div className="cli-desc">{calc.description}</div>
      </div>
      <svg className="cli-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}

function Sidebar({ category, activeSubSlug }) {
  const navigate = useNavigate()
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">{category.name}</div>
        {category.subcategories.map(sub => (
          <button key={sub.slug}
            className={`sidebar-item ${sub.slug === activeSubSlug ? 'active' : ''}`}
            style={sub.slug === activeSubSlug
              ? { background: category.color + '18', color: category.color, borderLeftColor: category.color }
              : {}}
            onClick={() => navigate(`/${category.slug}/${sub.slug}`)}>
            <span className="sidebar-dot" style={{ background: sub.slug === activeSubSlug ? category.color : 'var(--border-2)' }}/>
            <span className="sidebar-item-name">{sub.name}</span>
            <span className="sidebar-item-count">{sub.count}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-section sidebar-section--most">
        <div className="sidebar-label">Most Used in {category.name}</div>
        {(category.subcategories[0]?.mostUsed || []).slice(0,5).map(slug => {
          const name = slug.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ')
          return (
            <button key={slug} className="sidebar-most-item"
              onClick={() => {
                for (const sub of category.subcategories) {
                  const calcs = getCalculatorsBySubcategory(category.slug, sub.slug)
                  if (calcs.find(c => c.slug === slug)) { navigate(`/${category.slug}/${sub.slug}/${slug}`); return }
                }
              }}>
              <span className="sidebar-most-icon">🏆</span>{name}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default function Subcategory() {
  const { category: catSlug, subcategory: subSlug } = useParams()
  const category    = getCategoryBySlug(catSlug)
  const subcategory = getSubcategoryBySlug(catSlug, subSlug)
  const calcs       = getCalculatorsBySubcategory(catSlug, subSlug)

  if (!category || !subcategory) {
    return <Layout><div style={{ padding:'60px 32px', textAlign:'center', color:'var(--text)' }}><h2>Not found</h2><Link to="/" style={{ color:'#6366f1' }}>← Back to home</Link></div></Layout>
  }

  return (
    <Layout>
      <Breadcrumb />

      <div className="sub-hero" style={{ '--cat': category.color }}>
        <div className="sub-hero-inner">
          <div className="sub-hero-icon" style={{ background: category.colorLight }}>{subcategory.icon}</div>
          <div className="sub-hero-text">
            <h1 className="sub-hero-title">{subcategory.name}</h1>
            <p className="sub-hero-meta">
              <Link to={`/${catSlug}`} className="sub-hero-cat-link" style={{ color: category.color }}>{category.name}</Link>
              <span className="sub-hero-sep">·</span>{calcs.length} calculators
            </p>
          </div>
          <span className="sub-hero-badge" style={{ background: category.colorLight, color: category.color }}>
            {calcs.length} Calculators
          </span>
        </div>
        <div className="sub-hero-about"><p>{subcategory.description}</p></div>
      </div>

      <div className="sub-body">
        <Sidebar category={category} activeSubSlug={subSlug} />
        <main className="sub-main">
          <div className="sub-main-header">
            <h2 className="sub-main-title">{subcategory.name} Calculators</h2>
            <p className="sub-main-desc">{calcs.length} calculators — click any to open.</p>
          </div>
          {calcs.length === 0
            ? <div className="sub-empty"><p>Calculators coming soon.</p></div>
            : <div className="cli-list">{calcs.map(c => <CalcListItem key={c.slug} calc={c} catColor={category.color} />)}</div>
          }
        </main>
      </div>

      <style>{`
        .sub-hero { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 24px 40px 0; }
        .sub-hero-inner { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; max-width: 1160px; }
        .sub-hero-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .sub-hero-text { flex: 1; }
        .sub-hero-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; margin: 0 0 4px; }
        .sub-hero-meta { font-size: 13px; color: var(--text-3); margin: 0; display: flex; align-items: center; gap: 8px; }
        .sub-hero-cat-link { text-decoration: none; font-weight: 600; }
        .sub-hero-cat-link:hover { text-decoration: underline; }
        .sub-hero-sep { color: var(--border-2); }
        .sub-hero-badge { font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 20px; flex-shrink: 0; }
        .sub-hero-about { max-width: 760px; padding: 14px 0 18px; border-top: 1px solid var(--border); margin-top: 4px; }
        .sub-hero-about p { font-size: 13px; color: var(--text-2); line-height: 1.75; margin: 0; }

        .sub-body { display: flex; max-width: 1160px; margin: 0 auto; min-height: 500px; padding: 0 40px; }

        /* Sidebar */
        .sidebar { width: 215px; flex-shrink: 0; padding: 22px 0; border-right: 1px solid var(--border); margin-right: 32px; }
        .sidebar-section { margin-bottom: 20px; }
        .sidebar-section--most { border-top: 1px solid var(--border); padding-top: 16px; }
        .sidebar-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); padding: 0 4px; margin-bottom: 6px; font-family: 'Space Grotesk', sans-serif; }
        .sidebar-item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 9px; border: none; background: none; font-size: 12.5px; color: var(--text-2); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.1s; text-align: left; margin-bottom: 1px; border-left: 2.5px solid transparent; }
        .sidebar-item:hover { background: var(--bg-raised); color: var(--text); }
        .sidebar-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .sidebar-item-name { flex: 1; }
        .sidebar-item-count { font-size: 10px; color: var(--text-3); font-weight: 500; }
        .sidebar-most-item { width: 100%; display: flex; align-items: center; gap: 7px; padding: 7px 12px; border: none; background: none; font-size: 11.5px; color: var(--text-3); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.1s; text-align: left; border-radius: 8px; }
        .sidebar-most-item:hover { color: var(--cat); background: var(--bg-raised); }
        .sidebar-most-icon { font-size: 11px; flex-shrink: 0; }

        /* Main */
        .sub-main { flex: 1; padding: 24px 0 48px; min-width: 0; }
        .sub-main-header { margin-bottom: 18px; }
        .sub-main-title { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); margin: 0 0 4px; }
        .sub-main-desc { font-size: 12px; color: var(--text-3); margin: 0; }
        .sub-empty { padding: 48px; text-align: center; color: var(--text-3); font-size: 14px; border: 1px dashed var(--border); border-radius: 14px; }

        /* ✓ Calculator list items — NO style badges */
        .cli-list { display: flex; flex-direction: column; gap: 9px; }
        .cli { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; cursor: pointer; transition: all 0.15s; }
        .cli:hover { border-color: var(--cat); box-shadow: 0 4px 18px rgba(0,0,0,0.06); transform: translateX(3px); }
        .cli-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cli-info { flex: 1; min-width: 0; }
        .cli-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; font-family: 'DM Sans', sans-serif; }
        .cli-desc { font-size: 11px; color: var(--text-3); line-height: 1.5; }
        .cli-arrow { color: var(--text-3); transition: color 0.12s, transform 0.12s; flex-shrink: 0; }
        .cli:hover .cli-arrow { color: var(--cat); transform: translateX(3px); }

        @media (max-width: 860px) { .sub-body { padding: 0 24px; } .sub-hero { padding: 20px 24px 0; } .sidebar { display: none; } }
        @media (max-width: 560px) { .sub-hero-badge { display: none; } }
      `}</style>
    </Layout>
  )
}
