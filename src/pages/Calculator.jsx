import { useParams, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '../components/layout/Layout'
import Breadcrumb from '../components/layout/Breadcrumb'
import { getCategoryBySlug } from '../data/categories'
import { getCalculatorBySlug, getRelatedCalculators } from '../data/calculators'

// ─── Calculator component registry ───────────────────────────
// Add every new calculator here as you build it
const CALC_COMPONENTS = {
  // ── Finance ──
  'compound-interest':      lazy(() => import('../calculators/finance/CompoundInterest')),
  'loan-emi':               lazy(() => import('../calculators/finance/LoanEMI')),
  'mortgage-calculator':    lazy(() => import('../calculators/finance/MortgageCalculator')),
  'roi-calculator':         lazy(() => import('../calculators/finance/ROICalculator')),
  'savings-goal':           lazy(() => import('../calculators/finance/SavingsGoal')),
  'future-value': lazy(() => import('../calculators/finance/FutureValue')),
  'cagr-calculator': lazy(() => import('../calculators/finance/CAGRCalculator')),
  'present-value': lazy(() => import('../calculators/finance/PresentValue')),
  'payback-period': lazy(() => import('../calculators/finance/PaybackPeriod')),
  'dividend-yield':         lazy(() => import('../calculators/finance/DividendYield')),
  'fire-calculator':        lazy(() => import('../calculators/finance/FIRECalculator')),
  'irr-calculator':         lazy(() => import('../calculators/finance/IRRCalculator')),
  'npv-calculator':         lazy(() => import('../calculators/finance/NPVCalculator')),
  'investment-calculator':  lazy(() => import('../calculators/finance/InvestmentCalculator')),
  'loan-payoff':            lazy(() => import('../calculators/finance/LoanPayoff')),
  'amortization':           lazy(() => import('../calculators/finance/AmortizationCalculator')),
  'credit-card-payoff':     lazy(() => import('../calculators/finance/CreditCardPayoff')),
  'debt-payoff':            lazy(() => import('../calculators/finance/DebtPayoffPlanner')),
  'auto-loan':              lazy(() => import('../calculators/finance/AutoLoan')),
  'auto-lease':             lazy(() => import('../calculators/finance/AutoLease')),
  'interest-rate-calculator': lazy(() => import('../calculators/finance/InterestRateCalculator')),
  'personal-loan':          lazy(() => import('../calculators/finance/PersonalLoan')),

  // ── Mortgage & Real Estate ──
  'affordability':          lazy(() => import('../calculators/finance/HomeAffordability')),
  'rent-vs-buy':            lazy(() => import('../calculators/finance/RentVsBuy')),
  'mortgage-refinance':     lazy(() => import('../calculators/finance/MortgageRefinance')),
  'down-payment':           lazy(() => import('../calculators/finance/DownPaymentCalculator')),
  'closing-costs':          lazy(() => import('../calculators/finance/ClosingCosts')),

  // ── Savings & Retirement ──
  'retirement-planner':     lazy(() => import('../calculators/finance/RetirementPlanner')),
  'emergency-fund':         lazy(() => import('../calculators/finance/EmergencyFund')),
  '401k-calculator':        lazy(() => import('../calculators/finance/Calculator401k')),
  'roth-ira':               lazy(() => import('../calculators/finance/RothIRA')),

  // ── Banking & Interest ──
  'apy-calculator':         lazy(() => import('../calculators/finance/APYCalculator')),
  'apr-calculator':         lazy(() => import('../calculators/finance/APRCalculator')),
  'inflation-calculator':   lazy(() => import('../calculators/finance/InflationCalculator')),
  'simple-interest':        lazy(() => import('../calculators/finance/SimpleInterest')),
  'cd-calculator':          lazy(() => import('../calculators/finance/CDCalculator')),

  // ── Income & Pay ──
  'salary-to-hourly':       lazy(() => import('../calculators/finance/SalaryToHourly')),
  'take-home-pay':          lazy(() => import('../calculators/finance/TakeHomePay')),
  'overtime-calculator':    lazy(() => import('../calculators/finance/OvertimeCalculator')),
  'raise-calculator':       lazy(() => import('../calculators/finance/RaiseCalculator')),

  // ── FIRE Planning ──
  'fire-number':            lazy(() => import('../calculators/finance/FIRENumber')),
  'safe-withdrawal':        lazy(() => import('../calculators/finance/SafeWithdrawal')),
  'coast-fire':             lazy(() => import('../calculators/finance/CoastFIRE')),

  // ── Health ──
  'bmi-calculator':         lazy(() => import('../calculators/health/BMICalculator')),
  'tdee-calculator':        lazy(() => import('../calculators/health/TDEECalculator')),

  // ── Engineering ──
  'ohms-law':               lazy(() => import('../calculators/engineering/OhmsLaw')),

  // ── Math ──
  'percentage-calculator':  lazy(() => import('../calculators/math/PercentageCalculator')),
  'age-calculator':         lazy(() => import('../calculators/math/AgeCalculator')),

  // ── Utilities ──
  'tip-calculator':         lazy(() => import('../calculators/utilities/TipCalculator')),
  'discount-calculator':    lazy(() => import('../calculators/utilities/DiscountCalculator')),
  'fuel-cost':              lazy(() => import('../calculators/utilities/FuelCostCalculator')),
}

// ─── Related calculators strip ────────────────────────────────
function RelatedCalcs({ related, catColor }) {
  if (!related?.length) return null
  return (
    <div className="related-section">
      <div className="related-title">Related Calculators</div>
      <div className="related-list">
        {related.map(calc => (
          <Link key={calc.slug} to={`/${calc.category}/${calc.subcategory}/${calc.slug}`}
            className="related-item" style={{ '--cat-color': catColor }}>
            <span className="related-item-name">{calc.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

function CalcSkeleton() {
  return (
    <div className="calc-skeleton">
      <div className="skel skel-title"/>
      <div className="skel skel-input"/>
      <div className="skel skel-input"/>
      <div className="skel skel-btn"/>
    </div>
  )
}

function ComingSoon({ calc, category }) {
  return (
    <div className="coming-soon">
      <div className="cs-icon" style={{ background: category?.colorLight || '#e0e7ff' }}>🔨</div>
      <h3 className="cs-title">Being Built</h3>
      <p className="cs-desc"><strong>{calc?.name}</strong> is coming very soon!</p>
      <Link to={`/${calc?.category}`} className="cs-back" style={{ color: category?.color || '#6366f1' }}>
        ← Browse other {category?.name} calculators
      </Link>
    </div>
  )
}

export default function Calculator() {
  const { category: catSlug, subcategory: subSlug, calculator: calcSlug } = useParams()

  const category = getCategoryBySlug(catSlug)
  const calcMeta = getCalculatorBySlug(calcSlug)
  const related  = getRelatedCalculators(calcSlug)

  if (!calcMeta) {
    return (
      <Layout>
        <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text)' }}>
          <h2 style={{ marginBottom: '12px' }}>Calculator not found</h2>
          <Link to="/" style={{ color: '#6366f1' }}>← Back to home</Link>
        </div>
      </Layout>
    )
  }

  const CalcComponent = CALC_COMPONENTS[calcSlug]

  return (
    <Layout calcContext={`Calculator: ${calcMeta.name}. Description: ${calcMeta.description}`}>
      <Breadcrumb />

      <div className="calc-hero-bar" style={{ '--cat-color': category?.color || '#6366f1', '--cat-light': category?.colorLight || '#e0e7ff' }}>
        <div className="calc-hero-bar-inner">
          <div className="calc-hero-icon" style={{ background: category?.colorLight || '#e0e7ff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={category?.color || '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="8" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="12" y2="14"/>
            </svg>
          </div>
          <div className="calc-hero-text">
            <h1 className="calc-hero-title">{calcMeta.name}</h1>
            <p className="calc-hero-desc">{calcMeta.about || calcMeta.description}</p>
          </div>
        </div>
      </div>

      <div className="calc-page-body" style={{ '--cat-color': category?.color || '#6366f1' }}>
        {CalcComponent ? (
          <Suspense fallback={<CalcSkeleton />}>
            <CalcComponent meta={calcMeta} category={category} />
          </Suspense>
        ) : (
          <ComingSoon calc={calcMeta} category={category} />
        )}
        <RelatedCalcs related={related} catColor={category?.color || '#6366f1'} />
      </div>

      <style>{`
        .calc-hero-bar { background: var(--bg-card); border-bottom: 0.5px solid var(--border); padding: 20px 32px; }
        .calc-hero-bar-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-start; gap: 14px; }
        .calc-hero-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .calc-hero-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; margin: 0 0 5px; }
        .calc-hero-desc { font-size: 12px; color: var(--text-2); line-height: 1.65; margin: 0; max-width: 700px; }
        .calc-page-body { max-width: 1100px; margin: 0 auto; padding: 28px 32px 52px; display: flex; flex-direction: column; gap: 24px; }
        .calc-skeleton { display: flex; flex-direction: column; gap: 14px; padding: 24px; background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 14px; }
        .skel { background: var(--bg-raised); border-radius: 8px; animation: shimmer 1.5s ease-in-out infinite; }
        .skel-title { height: 24px; width: 40%; }
        .skel-input { height: 48px; width: 100%; }
        .skel-btn   { height: 46px; width: 160px; }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .coming-soon { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 56px 32px; background: var(--bg-card); border: 0.5px dashed var(--border); border-radius: 16px; gap: 12px; }
        .cs-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
        .cs-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); margin: 0; }
        .cs-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; max-width: 360px; margin: 0; }
        .cs-back { font-size: 13px; font-weight: 600; text-decoration: none; }
        .cs-back:hover { text-decoration: underline; }
        .related-section { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 12px; overflow: hidden; }
        .related-title { padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--text); border-bottom: 0.5px solid var(--border); }
        .related-list { display: flex; flex-direction: column; }
        .related-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 16px; font-size: 12px; color: var(--text-2); text-decoration: none; border-bottom: 0.5px solid var(--border); transition: all 0.12s; }
        .related-item:last-child { border-bottom: none; }
        .related-item:hover { background: var(--bg-raised); color: var(--cat-color); }
        .related-item-name { font-weight: 500; }
        @media (max-width: 860px) { .calc-hero-bar { padding: 16px 20px; } .calc-page-body { padding: 20px 20px 40px; } }
      `}</style>
    </Layout>
  )
}
