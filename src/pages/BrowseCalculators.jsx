import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { categories } from '../data/categories'

const CALC_LIST = {
  finance: {
    investment: [
      { slug: 'compound-interest',     name: 'Compound Interest Calculator' },
      { slug: 'future-value',          name: 'Future Value Calculator' },
      { slug: 'roi-calculator',        name: 'ROI Calculator' },
      { slug: 'cagr-calculator',       name: 'CAGR Calculator' },
      { slug: 'irr-calculator',        name: 'IRR Calculator' },
      { slug: 'present-value',         name: 'Present Value Calculator' },
      { slug: 'npv-calculator',        name: 'NPV Calculator' },
      { slug: 'dividend-yield',        name: 'Dividend Yield Calculator' },
      { slug: 'stock-return',          name: 'Stock Return Calculator' },
      { slug: 'portfolio-return',      name: 'Portfolio Return Calculator' },
      { slug: 'rule-of-72',            name: 'Rule of 72 Calculator' },
      { slug: 'investment-calculator', name: 'Investment Calculator' },
      { slug: 'payback-period', name: 'Payback Period Calculator'},
    ],
    loans: [
      { slug: 'loan-emi',              name: 'Loan EMI Calculator' },
      { slug: 'loan-payoff',           name: 'Loan Payoff Calculator' },
      { slug: 'amortization',          name: 'Amortization Schedule' },
      { slug: 'credit-card-payoff',    name: 'Credit Card Payoff' },
      { slug: 'debt-payoff',           name: 'Debt Payoff Calculator' },
      { slug: 'personal-loan',         name: 'Personal Loan Calculator' },
      { slug: 'auto-loan',             name: 'Auto Loan Calculator' },
      { slug: 'auto-lease',            name: 'Auto Lease Calculator' },
      { slug: 'student-loan',          name: 'Student Loan Calculator' },
      { slug: 'interest-only',         name: 'Interest Only Calculator' },
    ],
    mortgage: [
      { slug: 'mortgage-calculator',   name: 'Mortgage Calculator' },
      { slug: 'affordability',         name: 'Home Affordability' },
      { slug: 'rent-vs-buy',           name: 'Rent vs Buy Calculator' },
      { slug: 'mortgage-refinance',    name: 'Mortgage Refinance' },
      { slug: 'down-payment',          name: 'Down Payment Calculator' },
      { slug: 'heloc-calculator',      name: 'HELOC Calculator' },
      { slug: 'closing-costs',         name: 'Closing Cost Calculator' },
      { slug: 'mortgage-points',       name: 'Mortgage Points Calculator' },
    ],
    savings: [
      { slug: 'savings-goal',          name: 'Savings Goal Calculator' },
      { slug: 'retirement-planner',    name: 'Retirement Planner' },
      { slug: 'emergency-fund',        name: 'Emergency Fund Calculator' },
      { slug: '401k-calculator',       name: '401k Calculator' },
      { slug: 'roth-ira',              name: 'Roth IRA Calculator' },
      { slug: 'pension-calculator',    name: 'Pension Calculator' },
      { slug: 'social-security',       name: 'Social Security Calculator' },
      { slug: 'savings-rate',          name: 'Savings Rate Calculator' },
      { slug: 'net-worth',             name: 'Net Worth Calculator' },
      { slug: 'wealth-tracker',        name: 'Wealth Tracker' },
    ],
    banking: [
      { slug: 'apy-calculator',        name: 'APY Calculator' },
      { slug: 'apr-calculator',        name: 'APR Calculator' },
      { slug: 'inflation-calculator',  name: 'Inflation Calculator' },
      { slug: 'simple-interest',       name: 'Simple Interest Calculator' },
      { slug: 'cd-calculator',         name: 'CD Calculator' },
      { slug: 'money-market',          name: 'Money Market Calculator' },
      { slug: 'interest-rate-calculator', name: 'Interest Rate Calculator' },
    ],
    income: [
      { slug: 'salary-to-hourly',      name: 'Salary to Hourly Converter' },
      { slug: 'take-home-pay',         name: 'Take Home Pay Calculator' },
      { slug: 'overtime-calculator',   name: 'Overtime Calculator' },
      { slug: 'raise-calculator',      name: 'Raise Calculator' },
      { slug: 'bonus-tax',             name: 'Bonus Tax Calculator' },
      { slug: 'freelance-rate',        name: 'Freelance Rate Calculator' },
      { slug: 'paycheck-calculator',   name: 'Paycheck Calculator' },
      { slug: 'annual-income',         name: 'Annual Income Calculator' },
      { slug: 'tax-calculator (US)',   name: 'Tax Calculator (US)' },
      { slug: 'salary-after-tax',      name: 'Salary After Tax (State-Wise)' },
    ],
    fire: [
      { slug: 'fire-calculator',       name: 'FIRE Calculator' },
      { slug: 'fire-number',           name: 'FIRE Number Calculator' },
      { slug: 'safe-withdrawal',       name: 'Safe Withdrawal Rate' },
      { slug: 'coast-fire',            name: 'Coast FIRE Calculator' },
      { slug: 'barista-fire',          name: 'Barista FIRE Calculator' },
    ],
    budgeting: [
      { slug: 'budget-planner',        name: 'Budget Planner' },
      { slug: 'expense-tracker',       name: 'Expense Tracker' },
      { slug: 'cash-flow-calculator',  name: 'Cash Flow Calculator' },
    ],
  },

  health: {
    'body-metrics': [
      { slug: 'bmi-calculator',        name: 'BMI Calculator' },
      { slug: 'body-fat',              name: 'Body Fat Percentage' },
      { slug: 'ideal-weight',          name: 'Ideal Weight Calculator' },
      { slug: 'bmr-calculator',        name: 'BMR Calculator' },
      { slug: 'lean-body-mass',        name: 'Lean Body Mass Calculator' },
      { slug: 'waist-hip-ratio',       name: 'Waist-to-Hip Ratio' },
      { slug: 'body-surface-area',     name: 'Body Surface Area' },
      { slug: 'frame-size',            name: 'Frame Size Calculator' },
    ],
    calories: [
      { slug: 'calorie-calculator',    name: 'Calorie Calculator' },
      { slug: 'tdee-calculator',       name: 'TDEE Calculator' },
      { slug: 'macro-calculator',      name: 'Macro Calculator' },
      { slug: 'water-intake',          name: 'Water Intake Calculator' },
      { slug: 'protein-calculator',    name: 'Protein Calculator' },
      { slug: 'carb-calculator',       name: 'Carb Calculator' },
      { slug: 'fat-calculator',        name: 'Fat Intake Calculator' },
      { slug: 'fiber-calculator',      name: 'Fiber Intake Calculator' },
      { slug: 'calorie-deficit',       name: 'Calorie Deficit Calculator' },
      { slug: 'weight-loss-timeline',  name: 'Weight Loss Timeline Calculator' },
      { slug: 'lean-bulk-cut',         name: 'Lean Bulk / Cut Planner' },
    ],
    fitness: [
      { slug: 'one-rep-max',           name: 'One Rep Max Calculator' },
      { slug: 'pace-calculator',       name: 'Pace Calculator' },
      { slug: 'vo2-max',               name: 'VO2 Max Calculator' },
      { slug: 'heart-rate-zones',      name: 'Heart Rate Zones' },
      { slug: 'calories-burned',       name: 'Calories Burned Calculator' },
      { slug: 'running-pace',          name: 'Running Pace Calculator' },
      { slug: 'steps-to-miles',        name: 'Steps to Miles Converter' },
    ],
    pregnancy: [
      { slug: 'due-date',              name: 'Due Date Calculator' },
      { slug: 'pregnancy-weight',      name: 'Pregnancy Weight Gain' },
      { slug: 'ovulation-calculator',  name: 'Ovulation Calculator' },
      { slug: 'conception-date',       name: 'Conception Date Calculator' },
      { slug: 'weeks-pregnant',        name: 'Weeks Pregnant Calculator' },
      { slug: 'fertility-window',      name: 'Fertility Window Calculator' },
    ],
    vitals: [
      { slug: 'blood-pressure',        name: 'Blood Pressure Calculator' },
      { slug: 'resting-heart-rate',    name: 'Resting Heart Rate' },
      { slug: 'blood-type',            name: 'Blood Type Calculator' },
      { slug: 'oxygen-saturation',     name: 'Oxygen Saturation Guide' },
    ],
    lifestyle: [
      { slug: 'sleep-calculator',      name: 'Sleep Cycle Calculator' },
      { slug: 'alcohol-units',         name: 'Alcohol Units Calculator' },
      { slug: 'steps-to-calories',     name: 'Steps to Calories' },
      { slug: 'caffeine-calculator',   name: 'Caffeine Calculator' },
      { slug: 'bac-calculator',        name: 'BAC Calculator' },
      { slug: 'nap-calculator',        name: 'Nap Calculator' },
      { slug: 'sleep-debt',            name: 'Sleep Debt Calculator' },
      { slug: 'caffeine-half-life',    name: 'Caffeine Half-Life Calculator' },
      { slug: 'sober-time',            name: 'Sober Time Calculator' },
      { slug: 'chronotype',            name: 'Chronotype Calculator (Night Owl / Early Bird)' },
      { slug: 'life-in-weeks',         name: 'Life in Weeks Calculator' },
    ],
  },

  engineering: {
    electrical: [
      { slug: 'ohms-law',              name: "Ohm's Law Calculator" },
      { slug: 'voltage-drop',          name: 'Voltage Drop Calculator' },
      { slug: 'power-calculator',      name: 'Power Calculator' },
      { slug: 'resistor-color',        name: 'Resistor Color Code' },
      { slug: 'capacitor-charge',      name: 'Capacitor Charge Calculator' },
      { slug: 'led-resistor',          name: 'LED Resistor Calculator' },
      { slug: 'wire-gauge',            name: 'Wire Gauge Calculator' },
      { slug: 'transformer-ratio',     name: 'Transformer Ratio Calculator' },
    ],
    fluid: [
      { slug: 'flow-rate',             name: 'Flow Rate Calculator' },
      { slug: 'reynolds-number',       name: 'Reynolds Number Calculator' },
      { slug: 'pressure-drop',         name: 'Pressure Drop Calculator' },
      { slug: 'pipe-sizing',           name: 'Pipe Sizing Calculator' },
      { slug: 'heat-load',             name: 'Heat Load Calculator' },
      { slug: 'hvac-calculator',       name: 'HVAC Calculator' },
      { slug: 'pump-power',            name: 'Pump Power Calculator' },
      { slug: 'pump-head-calculator',  name: 'Pump Head Calculator' },
      { slug: 'heat-transfer-calculator', name: 'Heat Transfer Calculator' },
    ],
    materials: [
      { slug: 'thermal-expansion', name: 'Thermal Expansion Calculator' },
      { slug: 'youngs-modulus', name: "Young's Modulus Calculator" },
      { slug: 'material-density', name: 'Material Density Calculator' },
      { slug: 'hardness-converter', name: 'Hardness Scale Converter' },
    ],
    mechanical: [
      { slug: 'torque-calculator',     name: 'Torque Calculator' },
      { slug: 'gear-ratio',            name: 'Gear Ratio Calculator' },
      { slug: 'beam-deflection',       name: 'Beam Deflection Calculator' },
      { slug: 'stress-strain',         name: 'Stress & Strain Calculator' },
      { slug: 'horsepower',            name: 'Horsepower Calculator' },
      { slug: 'spring-constant',       name: 'Spring Constant Calculator' },
      { slug: 'force-calculator',      name: 'Force Calculator' },
      { slug: 'work-calculator',       name: 'Work Calculator' },
    ],
    converters: [
      { slug: 'length-converter',      name: 'Length Converter' },
      { slug: 'weight-converter',      name: 'Weight Converter' },
      { slug: 'temperature-converter', name: 'Temperature Converter' },
      { slug: 'speed-converter',       name: 'Speed Converter' },
      { slug: 'pressure-converter',    name: 'Pressure Converter' },
      { slug: 'energy-converter',      name: 'Energy Converter' },
      { slug: 'power-converter',       name: 'Power Converter' },
      { slug: 'volume-converter',      name: 'Volume Converter' },
      { slug: 'area-converter',        name: 'Area Converter' },
      { slug: 'force-converter',       name: 'Force Converter' },
      { slug: 'torque-converter',      name: 'Torque Converter' },
    ],
    tech: [
      { slug: 'data-storage',          name: 'Data Storage Converter' },
      { slug: 'bandwidth-calculator',  name: 'Bandwidth Calculator' },
      { slug: 'subnet-calculator',     name: 'Subnet Calculator' },
      { slug: 'binary-converter',      name: 'Binary Converter' },
      { slug: 'hex-converter',         name: 'Hex Converter' },
      { slug: 'internet-speed-calculator', name: 'Internet Speed Calculator' },
      { slug: 'data-usage-calculator', name: 'Data Usage Calculator' },
    ],
    civil: [
      { slug: 'beam-load-calculator',       name: 'Beam Load Calculator' },
      { slug: 'concrete-volume-calculator', name: 'Concrete Volume Calculator' },
      { slug: 'steel-weight-calculator',    name: 'Steel Weight Calculator' },
    ],
  },

  math: {
    arithmetic: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator' },
      { slug: 'percentage-change', name: 'Percentage Change Calculator' },
      { slug: 'percent-error', name: 'Percent Error Calculator' },
      { slug: 'fraction-calculator', name: 'Fraction Calculator' },
      { slug: 'decimal-fraction-converter', name: 'Decimal & Fraction Converter' },
      { slug: 'ratio-calculator', name: 'Ratio Calculator' },
      { slug: 'average-calculator', name: 'Average Calculator' },
      { slug: 'rounding-calculator', name: 'Rounding Calculator' },
      { slug: 'square-root-calculator', name: 'Square Root Calculator' },
      { slug: 'gcf-calculator', name: 'GCF & LCM Calculator' },
      { slug: 'prime-factorization', name: 'Prime Factorization' },
      { slug: 'factorial-calculator', name: 'Factorial Calculator' },
      { slug: 'scientific-notation', name: 'Scientific Notation Calculator' },
      { slug: 'number-base-converter', name: 'Number Base Converter' },
      { slug: 'random-number', name: 'Random Number Generator' },
    ],

    geometry: [
      { slug: 'area-calculator', name: 'Area Calculator' },
      { slug: 'perimeter-calculator', name: 'Perimeter Calculator' },
      { slug: 'volume-calculator', name: 'Volume Calculator' },
      { slug: 'surface-area-calculator', name: 'Surface Area Calculator' },
      { slug: 'pythagorean-theorem', name: 'Pythagorean Theorem Calculator' },
      { slug: 'triangle-calculator', name: 'Triangle Calculator' },
      { slug: 'right-triangle', name: 'Right Triangle Calculator' },
      { slug: 'circle-calculator', name: 'Circle Calculator' },
      { slug: 'slope-calculator', name: 'Slope & Distance Calculator' },
      { slug: 'angle-calculator', name: 'Angle Calculator' },
    ],

    algebra: [
      { slug: 'linear-equation', name: 'Linear Equation Solver' },
      { slug: 'quadratic-solver', name: 'Quadratic Equation Solver' },
      { slug: 'systems-equations', name: 'Systems of Equations Solver' },
      { slug: 'polynomial-roots', name: 'Polynomial Root Finder' },
      { slug: 'exponent-calculator', name: 'Exponent Calculator' },
      { slug: 'logarithm-calculator', name: 'Logarithm Calculator' },
      { slug: 'absolute-value', name: 'Absolute Value Calculator' },
      { slug: 'inequality-solver', name: 'Inequality Solver' },
      { slug: 'sequence-calculator', name: 'Sequence Calculator' },
      { slug: 'binomial-theorem', name: 'Binomial Theorem Calculator' },
      { slug: 'exponential-growth', name: 'Exponential Growth & Decay' },
      { slug: 'complex-numbers', name: 'Complex Numbers Calculator' },
      { slug: 'graphing-calculator', name: 'Graphing Calculator' },
    ],

    trigonometry: [
      { slug: 'trig-calculator', name: 'Sin, Cos & Tan Calculator' },
      { slug: 'inverse-trig', name: 'Inverse Trig Calculator' },
      { slug: 'angle-converter', name: 'Degrees & Radians Converter' },
      { slug: 'law-of-sines', name: 'Law of Sines Calculator' },
      { slug: 'law-of-cosines', name: 'Law of Cosines Calculator' },
      { slug: 'unit-circle', name: 'Unit Circle Reference' },
      { slug: 'trig-identities', name: 'Trig Identity Verifier' },
    ],

    'linear-algebra': [
      { slug: 'matrix-calculator', name: 'Matrix Calculator' },
      { slug: 'determinant-calculator', name: 'Determinant Calculator' },
      { slug: 'matrix-inverse', name: 'Matrix Inverse Calculator' },
      { slug: 'eigenvalues-calculator', name: 'Eigenvalues & Eigenvectors' },
      { slug: 'rank-of-matrix', name: 'Rank of a Matrix' },
      { slug: 'gauss-elimination', name: 'Gauss Elimination Solver' },
      { slug: 'dot-product', name: 'Dot Product Calculator' },
      { slug: 'cross-product', name: 'Cross Product Calculator' },
      { slug: 'vector-magnitude', name: 'Vector Magnitude & Unit Vector' },
    ],

    calculus: [
      { slug: 'limit-calculator', name: 'Limit Calculator' },
      { slug: 'derivative-calculator', name: 'Derivative Calculator' },
      { slug: 'integral-calculator', name: 'Integral Calculator' },
      { slug: 'partial-derivative', name: 'Partial Derivative Calculator' },
      { slug: 'double-integral', name: 'Double Integral Calculator' },
      { slug: 'taylor-series', name: 'Taylor & Maclaurin Series' },
      { slug: 'riemann-sum', name: 'Riemann Sum Calculator' },
    ],

    'differential-equations': [
      { slug: 'ode-first-order', name: '1st Order ODE Solver' },
      { slug: 'ode-second-order', name: '2nd Order ODE Solver' },
      { slug: 'laplace-transform', name: 'Laplace Transform Calculator' },
      { slug: 'inverse-laplace', name: 'Inverse Laplace Transform' },
    ],

    statistics: [
      { slug: 'mean-median-mode', name: 'Mean, Median & Mode' },
      { slug: 'standard-deviation', name: 'Standard Deviation Calculator' },
      { slug: 'variance-calculator', name: 'Variance Calculator' },
      { slug: 'weighted-average', name: 'Weighted Average Calculator' },
      { slug: 'normal-distribution', name: 'Normal Distribution Calculator' },
      { slug: 'z-score-calculator', name: 'Z-Score Calculator' },
      { slug: 'confidence-interval', name: 'Confidence Interval Calculator' },
      { slug: 'correlation', name: 'Correlation Calculator' },
      { slug: 'regression-calculator', name: 'Linear Regression Calculator' },
      { slug: 'sample-size-calculator', name: 'Sample Size Calculator' },
      { slug: 'hypothesis-test', name: 'Hypothesis Test Calculator' },
      { slug: 'chi-square', name: 'Chi-Square Test Calculator' },
    ],

    probability: [
      { slug: 'probability-calculator', name: 'Probability Calculator' },
      { slug: 'permutations', name: 'Permutations Calculator' },
      { slug: 'combinations', name: 'Combinations Calculator' },
      { slug: 'dice-probability', name: 'Dice Probability Calculator' },
      { slug: 'bayes-theorem', name: "Bayes' Theorem Calculator" },
      { slug: 'binomial-distribution', name: 'Binomial Distribution Calculator' },
      { slug: 'poisson-distribution', name: 'Poisson Distribution Calculator' },
    ],

    'number-theory': [
      { slug: 'prime-checker', name: 'Prime Number Checker' },
      { slug: 'factor-calculator', name: 'Factor Calculator' },
      { slug: 'remainder-calculator', name: 'Remainder & Modulo Calculator' },
    ],

    'numerical-methods': [
      { slug: 'bisection-method', name: 'Bisection Method Calculator' },
      { slug: 'newton-raphson', name: 'Newton-Raphson Calculator' },
      { slug: 'trapezoidal-rule', name: 'Trapezoidal Rule Calculator' },
      { slug: 'simpsons-rule', name: "Simpson's Rule Calculator" },
    ],

    'date-time': [
      { slug: 'age-calculator', name: 'Age Calculator' },
      { slug: 'date-difference', name: 'Date Difference Calculator' },
      { slug: 'add-subtract-days', name: 'Add & Subtract Days' },
      { slug: 'working-days', name: 'Working Days Calculator' },
      { slug: 'time-zone-converter', name: 'Time Zone Converter' },
    ],
  },

  utilities: {
    everyday: [
      { slug: 'tip-calculator',            name: 'Tip Calculator' },
      { slug: 'split-bill',                name: 'Split Bill Calculator' },
      { slug: 'discount-calculator',       name: 'Discount Calculator' },
      { slug: 'sales-tax',                 name: 'Sales Tax Calculator' },
      { slug: 'percentage-off',            name: 'Percentage Off Calculator' },
      { slug: 'price-per-unit',            name: 'Price Per Unit Calculator' },
      { slug: 'cost-per-use',              name: 'Cost Per Use Calculator' },
      { slug: 'budget-calculator',         name: 'Budget Calculator' },
      { slug: 'countdown-timer',           name: 'Countdown Timer' },
      { slug: 'age-difference-calculator', name: 'Age Difference Calculator' },
      { slug: 'random-name-picker',        name: 'Random Name Picker' },
      { slug: 'password-strength-checker', name: 'Password Strength Checker' },
    ],
    home: [
      { slug: 'paint-calculator',          name: 'Paint Calculator' },
      { slug: 'flooring-calculator',       name: 'Flooring Calculator' },
      { slug: 'tile-calculator',           name: 'Tile Calculator' },
      { slug: 'concrete-calculator',       name: 'Concrete Calculator' },
      { slug: 'wallpaper-calculator',      name: 'Wallpaper Calculator' },
      { slug: 'fence-calculator',          name: 'Fence Calculator' },
      { slug: 'mulch-calculator',          name: 'Mulch Calculator' },
      { slug: 'electricity-bill-calculator', name: 'Electricity Bill Calculator' },
    ],
    food: [
      { slug: 'recipe-converter',          name: 'Recipe Converter' },
      { slug: 'cooking-time',              name: 'Cooking Time Calculator' },
      { slug: 'measurement-converter',     name: 'Measurement Converter' },
      { slug: 'yeast-converter',           name: 'Yeast Converter' },
      { slug: 'baking-calculator',         name: 'Baking Calculator' },
    ],
    travel: [
      { slug: 'fuel-cost',                 name: 'Fuel Cost Calculator' },
      { slug: 'road-trip',                 name: 'Road Trip Calculator' },
      { slug: 'mpg-calculator',            name: 'MPG Calculator' },
      { slug: 'flight-time',               name: 'Flight Time Calculator' },
      { slug: 'timezone-converter',        name: 'Timezone Converter' },
      { slug: 'travel-budget',             name: 'Travel Budget Calculator' },
    ],
    business: [
      { slug: 'profit-margin',             name: 'Profit Margin Calculator' },
      { slug: 'break-even',                name: 'Break-Even Calculator' },
      { slug: 'markup-calculator',         name: 'Markup Calculator' },
      { slug: 'vat-calculator',            name: 'VAT Calculator' },
      { slug: 'invoice-calculator',        name: 'Invoice Calculator' },
      { slug: 'roi-business',              name: 'Business ROI Calculator' },
      { slug: 'payroll-calculator',        name: 'Payroll Calculator' },
    ],
    currency: [
      { slug: 'currency-converter',        name: 'Currency Converter' },
      { slug: 'area-calculator',           name: 'Area Calculator' },
      { slug: 'volume-calculator',         name: 'Volume Calculator' },
      { slug: 'square-footage',            name: 'Square Footage Calculator' },
      { slug: 'acreage-calculator',        name: 'Acreage Calculator' },
    ],
  },
}

function CalcCard({ calc, catSlug, subSlug, color, colorLight }) {
  const [hov, setHov] = useState(false)
  return (
    <Link
      to={`/${catSlug}/${subSlug}/${calc.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', padding: '10px 13px', borderRadius: 10,
        border: `1px solid ${hov ? color + '60' : 'var(--border)'}`,
        background: hov ? colorLight : 'var(--bg-raised)',
        textDecoration: 'none', transition: 'all 0.12s',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.35 }}>
        {calc.name}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color }}>Open →</div>
    </Link>
  )
}

function SubBlock({ sub, catSlug, color, colorLight }) {
  const calcs = CALC_LIST[catSlug]?.[sub.slug] || []
  return (
    <div style={{ paddingBottom: 22, borderBottom: '0.5px solid var(--border)', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Link to={`/${catSlug}/${sub.slug}`}
          style={{ fontSize: 13, fontWeight: 700, color, textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif" }}>
          {sub.name}
        </Link>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{calcs.length} calculators</span>
        <Link to={`/${catSlug}/${sub.slug}`}
          style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color, textDecoration: 'none', opacity: 0.7 }}>
          View all →
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 7 }}>
        {calcs.map(calc => (
          <CalcCard key={calc.slug} calc={calc} catSlug={catSlug} subSlug={sub.slug} color={color} colorLight={colorLight} />
        ))}
      </div>
    </div>
  )
}

function CatBlock({ category }) {
  const [open, setOpen] = useState(true)
  const { color, colorLight } = category
  return (
    <div id={`cat-${category.slug}`}
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${color}30`,
        borderRadius: 16, overflow: 'hidden', marginBottom: 24,
      }}>
      <div onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 22px',
          background: colorLight + '55',
          borderBottom: open ? `1px solid ${color}25` : 'none',
          cursor: 'pointer', userSelect: 'none',
        }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: colorLight, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {category.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.3px' }}>
              {category.name}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12,
              background: colorLight, color, border: `1px solid ${color}40`,
            }}>
              {category.count} calculators
            </span>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 12,
              background: 'var(--bg-raised)', color: 'var(--text-3)', border: '1px solid var(--border)',
            }}>
              {category.subcategories.length} subcategories
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>
            {category.description.slice(0, 100)}…
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link to={`/${category.slug}`} onClick={e => e.stopPropagation()}
            style={{
              fontSize: 12, fontWeight: 600, color,
              padding: '6px 13px', borderRadius: 8,
              border: `1px solid ${color}50`,
              background: colorLight, textDecoration: 'none',
            }}>
            Browse all →
          </Link>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round"
            style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}>
            <path d="M3 6l5 5 5-5" />
          </svg>
        </div>
      </div>
      {open && (
        <div style={{ padding: '22px 22px 4px' }}>
          {category.subcategories.map(sub => (
            <SubBlock key={sub.slug} sub={sub} catSlug={category.slug} color={color} colorLight={colorLight} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BrowseCalculators() {
  const [search, setSearch] = useState('')
  const q = search.toLowerCase().trim()
  const totalCalcs = Object.values(CALC_LIST).flatMap(c => Object.values(c)).flat().length
  const totalSubs = categories.reduce((a, c) => a + c.subcategories.length, 0)
  const searchResults = q
    ? categories.flatMap(cat =>
        cat.subcategories.flatMap(sub => {
          const calcs = (CALC_LIST[cat.slug]?.[sub.slug] || []).filter(c =>
            c.name.toLowerCase().includes(q)
          )
          return calcs.map(calc => ({ calc, cat, sub }))
        })
      )
    : []

  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '36px 0 28px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800,
              letterSpacing: '-0.04em', marginBottom: 8, color: 'var(--text)'
            }}>
              Browse All Calculators
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
              {totalCalcs}+ free calculators across 5 categories and {totalSubs} subcategories.
              No signup. No ads. Click any calculator to open it instantly.
            </p>
            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480, marginTop: 22 }}>
              <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search e.g. BMI, mortgage, tip calculator..."
                style={{
                  width: '100%', padding: '11px 38px', border: '1.5px solid var(--border-2)',
                  borderRadius: 12, background: 'var(--bg-input)', color: 'var(--text)',
                  fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20, lineHeight: 1
                  }}>
                  ×
                </button>
              )}
            </div>
            {/* Quick jump pills */}
            {!q && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {categories.map(cat => (
                  <a key={cat.slug} href={`#cat-${cat.slug}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 20,
                      background: cat.colorLight, color: cat.color,
                      border: `1px solid ${cat.color}40`,
                      fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {cat.icon} {cat.name} · {cat.count}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 60px' }}>
          {/* No results */}
          {q && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No results found</div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>No calculators matched "<strong>{search}</strong>"</div>
              <button onClick={() => setSearch('')}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border-2)',
                  background: 'var(--bg-raised)', cursor: 'pointer', fontSize: 14,
                  color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif"
                }}>
                Clear search
              </button>
            </div>
          )}
          {/* Search results */}
          {q && searchResults.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "<strong style={{ color: 'var(--text)' }}>{search}</strong>"
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 8 }}>
                {searchResults.map(({ calc, cat, sub }) => (
                  <div key={`${cat.slug}-${sub.slug}-${calc.slug}`}>
                    <CalcCard calc={calc} catSlug={cat.slug} subSlug={sub.slug} color={cat.color} colorLight={cat.colorLight} />
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, paddingLeft: 2 }}>
                      {cat.name} › {sub.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* All categories */}
          {!q && categories.map(cat => <CatBlock key={cat.slug} category={cat} />)}
        </div>
      </div>
    </Layout>
  )
}
