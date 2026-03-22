import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Breadcrumb from '../components/layout/Breadcrumb'
import { getCategoryBySlug } from '../data/categories'
import { getCalculatorsByCategory, getCalculatorsBySubcategory } from '../data/calculators'

function CalcCard({ calc, catColor }) {
  const navigate = useNavigate()
  return (
    <div className="calc-card" onClick={() => navigate(`/${calc.category}/${calc.subcategory}/${calc.slug}`)}
      style={{ '--cat': catColor }}>
      <div className="calc-card-name">{calc.name}</div>
      <div className="calc-card-desc">{calc.description}</div>
      <span className="calc-card-link">Open Calculator →</span>
    </div>
  )
}

function SubcategorySection({ sub, category, calcs }) {
  if (!calcs.length) return null
  return (
    <div className="subcat-sec">
      <div className="subcat-sec-header">
        <div className="subcat-sec-dot" style={{ background: category.color }} />
        <div style={{ flex: 1 }}>
          <h3 className="subcat-sec-title" style={{ color: category.color }}>{sub.name}</h3>
          <p className="subcat-sec-desc">{sub.description}</p>
        </div>
        <Link to={`/${category.slug}/${sub.slug}`} className="subcat-sec-viewall"
          style={{ color: category.color, borderColor: category.color + '50' }}>
          View all {sub.count} →
        </Link>
      </div>
      <div className="calc-grid">
        {calcs.slice(0,6).map(calc => <CalcCard key={calc.slug} calc={calc} catColor={category.color} />)}
      </div>
    </div>
  )
}

export default function Category() {
  const { category: catSlug } = useParams()
  const category = getCategoryBySlug(catSlug)
  const [activeFilter, setActiveFilter] = useState('all')

  if (!category) {
    return <Layout><div style={{ padding:'60px', textAlign:'center', color:'var(--text)' }}><h2>Category not found</h2><Link to="/" style={{ color:'#6366f1' }}>← Home</Link></div></Layout>
  }

  const visibleSubs = activeFilter === 'all'
    ? category.subcategories
    : category.subcategories.filter(s => s.slug === activeFilter)

  return (
    <Layout>
      <Breadcrumb />

      {/* Hero — full width bg, content constrained */}
      <div className="cat-hero" style={{ '--cat': category.color }}>
        <div className="cat-hero-inner">
          <div className="cat-hero-icon-wrap" style={{ background: category.colorLight }}>
            <span className="cat-hero-icon">{category.icon}</span>
          </div>
          <div className="cat-hero-text">
            <h1 className="cat-hero-title" style={{ color: category.color }}>{category.name} Calculators</h1>
            <p className="cat-hero-desc">{category.description}</p>
          </div>
          <div className="cat-hero-badge" style={{ background: category.colorLight, color: category.color }}>
            {category.count} Calculators
          </div>
        </div>
      </div>

      {/* Filters — full width bg, content constrained */}
      <div className="cat-filters">
        <div className="cat-filters-inner">
          <button className={`cat-filter-btn ${activeFilter==='all'?'active':''}`}
            style={activeFilter==='all'?{background:category.color,color:'#fff',borderColor:category.color}:{}}
            onClick={() => setActiveFilter('all')}>All</button>
          {category.subcategories.map(sub => (
            <button key={sub.slug}
              className={`cat-filter-btn ${activeFilter===sub.slug?'active':''}`}
              style={activeFilter===sub.slug?{background:category.color,color:'#fff',borderColor:category.color}:{}}
              onClick={() => setActiveFilter(sub.slug)}>
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      <div className="cat-body">
        {visibleSubs.map(sub => (
          <SubcategorySection key={sub.slug} sub={sub} category={category}
            calcs={getCalculatorsBySubcategory(catSlug, sub.slug)} />
        ))}
      </div>

      <style>{`
        /* Hero */
        .cat-hero { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 30px 0; }
        .cat-hero-inner { max-width: 1160px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; gap: 18px; }
        .cat-hero-icon-wrap { width: 62px; height: 62px; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cat-hero-icon { font-size: 30px; }
        .cat-hero-text { flex: 1; min-width: 0; }
        .cat-hero-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin: 0 0 7px; line-height: 1.1; }
        .cat-hero-desc { font-size: 14px; color: var(--text-2); line-height: 1.65; margin: 0; max-width: 680px; }
        .cat-hero-badge { font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 20px; flex-shrink: 0; white-space: nowrap; }

        /* Filters */
        .cat-filters { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 14px 0; }
        .cat-filters-inner { max-width: 1160px; margin: 0 auto; padding: 0 40px; display: flex; gap: 7px; flex-wrap: wrap; }
        .cat-filter-btn { padding: 7px 18px; border-radius: 20px; font-size: 12.5px; font-weight: 500; border: 1px solid var(--border); background: var(--bg-raised); color: var(--text-2); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.12s; white-space: nowrap; }
        .cat-filter-btn:hover:not(.active) { border-color: var(--cat); color: var(--cat); }

        /* Body */
        .cat-body { max-width: 1160px; margin: 0 auto; padding: 32px 40px 56px; display: flex; flex-direction: column; gap: 40px; }

        /* Subcategory section */
        .subcat-sec-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
        .subcat-sec-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }
        .subcat-sec-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin: 0 0 5px; letter-spacing: -0.3px; }
        .subcat-sec-desc { font-size: 12px; color: var(--text-3); line-height: 1.65; margin: 0; max-width: 620px; }
        .subcat-sec-viewall { margin-left: auto; font-size: 12px; font-weight: 600; text-decoration: none; padding: 6px 14px; border-radius: 20px; border: 1px solid; white-space: nowrap; flex-shrink: 0; transition: all 0.12s; }
        .subcat-sec-viewall:hover { opacity: 0.8; }

        /* Calc cards */
        .calc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .calc-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; gap: 5px; }
        .calc-card:hover { border-color: var(--cat); box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .calc-card-name { font-size: 13.5px; font-weight: 600; color: var(--text); line-height: 1.3; font-family: 'DM Sans', sans-serif; }
        .calc-card-desc { font-size: 11px; color: var(--text-3); line-height: 1.5; flex: 1; }
        .calc-card-link { font-size: 11px; font-weight: 600; color: var(--cat); margin-top: 7px; }

        @media (max-width: 900px) {
          .cat-hero-inner, .cat-filters-inner, .cat-body { padding-left: 24px; padding-right: 24px; }
          .cat-hero-badge { display: none; }
          .calc-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .calc-grid { grid-template-columns: 1fr; }
          .subcat-sec-header { flex-wrap: wrap; }
        }
      `}</style>
    </Layout>
  )
}
