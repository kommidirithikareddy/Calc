export const categories = [
  {
    slug: 'finance', name: 'Finance', icon: '💰',
    color: '#6366f1', colorLight: '#e0e7ff', colorDark: '#818cf8',
    count: '65',
    description: 'Plan your investments, manage loans, calculate mortgages and build your retirement. Every financial calculation you need — free, instant and AI-powered.',
    subcategories: [
      {
        slug: 'investment', name: 'Investment & Growth', icon: '📊', count: 13,
        description: 'Investment & Growth calculators help you understand how money multiplies over time through compound interest, measure portfolio performance, and plan for long-term financial goals.',
        mostUsed: ['compound-interest', 'future-value', 'roi-calculator', 'cagr-calculator', 'irr-calculator', 'present-value', 'npv-calculator', 'payback-period', 'investment-calculator', 'dividend-yield', 'stock-return', 'portfolio-return', 'rule-of-72']
      },
      {
        slug: 'loans', name: 'Loans & Credit', icon: '🏦', count: 10,
        description: 'Loan calculators help you understand exactly what borrowing costs — from monthly EMI payments to total interest paid over the life of a loan.',
        mostUsed: ['loan-emi', 'loan-payoff', 'amortization', 'credit-card-payoff', 'debt-payoff', 'auto-loan', 'auto-lease', 'personal-loan', 'student-loan', 'interest-only']
      },
      {
        slug: 'mortgage', name: 'Mortgage & Real Estate', icon: '🏠', count: 8,
        description: 'Buying a home is the biggest financial decision most people make. These calculators break down payments, compare renting vs buying, and find how much house you can afford.',
        mostUsed: ['mortgage-calculator', 'affordability', 'rent-vs-buy', 'mortgage-refinance', 'down-payment', 'closing-costs', 'heloc-calculator', 'mortgage-points']
      },
      {
        slug: 'savings', name: 'Savings & Retirement', icon: '💵', count: 10,
        description: 'Build wealth systematically with savings and retirement planners. Set goals and see exactly how much you need to save each month to hit your targets.',
        mostUsed: ['savings-goal', 'retirement-planner', 'emergency-fund', '401k-calculator', 'roth-ira', 'pension-calculator', 'social-security', 'savings-rate', 'net-worth', 'wealth-tracker']
      },
      {
        slug: 'banking', name: 'Banking & Interest', icon: '📈', count: 7,
        description: 'Understand how banks work with your money. Calculate APY vs APR, compare savings rates, and see how inflation erodes purchasing power over time.',
        mostUsed: ['interest-rate-calculator', 'apy-calculator', 'apr-calculator', 'inflation-calculator', 'simple-interest', 'cd-calculator', 'money-market']
      },
      {
        slug: 'income', name: 'Income & Pay', icon: '💳', count: 10,
        description: 'From salary to take-home pay, convert between hourly and annual rates, calculate overtime, and see exactly how much tax you pay.',
        mostUsed: ['salary-to-hourly', 'take-home-pay', 'raise-calculator', 'overtime-calculator', 'bonus-tax', 'freelance-rate', 'paycheck-calculator', 'annual-income', 'tax-calculator (US)', 'salary-after-tax']
      },
      {
        slug: 'fire', name: 'FIRE Planning', icon: '🔥', count: 5,
        description: 'Financial Independence Retire Early calculators. Find your FIRE number, calculate your savings rate and discover your exact retirement date.',
        mostUsed: ['fire-calculator', 'fire-number', 'safe-withdrawal', 'coast-fire', 'barista-fire']
      },
      {
        slug: 'budgeting', name: 'Budgeting', icon: '📋', count: 3,
        description: 'Plan and track your finances with budget planners, expense trackers and cash flow calculators.',
        mostUsed: ['budget-planner', 'expense-tracker', 'cash-flow-calculator']
      },
    ],
  },
  {
    slug: 'health', name: 'Health', icon: '🏥',
    color: '#10b981', colorLight: '#d1fae5', colorDark: '#34d399',
    count: '51',
    description: 'BMI, calories, fitness, pregnancy, vitals and lifestyle. Science-backed health calculators that give you real numbers — not generic advice.',
    subcategories: [
      {
        slug: 'body-metrics', name: 'Body Metrics', icon: '⚖️', count: 8,
        description: 'Understand your body with evidence-based measurements. Calculate BMI, body fat percentage, ideal weight ranges and waist-to-hip ratio referencing WHO and CDC guidelines.',
        mostUsed: ['bmi-calculator', 'body-fat', 'ideal-weight', 'bmr-calculator', 'lean-body-mass', 'waist-hip-ratio', 'body-surface-area', 'frame-size']
      },
      {
        slug: 'calories', name: 'Calories & Nutrition', icon: '🔥', count: 11,
        description: 'From daily calorie needs to precise macro splits, these nutrition calculators are built on peer-reviewed formulas. Whether cutting, bulking or maintaining — know your exact numbers.',
        mostUsed: ['calorie-calculator', 'tdee-calculator', 'macro-calculator', 'water-intake', 'protein-calculator', 'carb-calculator', 'fat-calculator', 'fiber-calculator', 'calorie-deficit', 'weight-loss-timeline', 'lean-bulk-cut']
      },
      {
        slug: 'fitness', name: 'Fitness & Performance', icon: '🏋️', count: 7,
        description: 'Performance calculators for runners, lifters and athletes. Calculate one rep max, running pace, VO2 max estimates and training zones based on your heart rate.',
        mostUsed: ['one-rep-max', 'pace-calculator', 'calories-burned', 'heart-rate-zones', 'vo2-max', 'running-pace', 'steps-to-miles']
      },
      {
        slug: 'pregnancy', name: 'Pregnancy & Fertility', icon: '🤰', count: 6,
        description: 'Pregnancy and fertility calculators based on standard obstetric guidelines. Calculate your due date, track pregnancy weight gain and find your fertile window.',
        mostUsed: ['due-date', 'ovulation-calculator', 'pregnancy-weight', 'conception-date', 'weeks-pregnant', 'fertility-window']
      },
      {
        slug: 'vitals', name: 'Vital Health', icon: '❤️', count: 4,
        description: 'Monitor and interpret your vital health indicators with clinical reference ranges for blood pressure, heart rate, sleep and more.',
        mostUsed: ['blood-pressure', 'resting-heart-rate', 'blood-type', 'oxygen-saturation']
      },
      {
        slug: 'lifestyle', name: 'Sleep & Lifestyle', icon: '😴', count: 11,
        description: 'Lifestyle calculators for sleep, sobriety, and habit tracking. Calculate optimal sleep cycles, alcohol units, caffeine half-life and daily step goals.',
        mostUsed: ['sleep-calculator', 'alcohol-units', 'steps-to-calories', 'caffeine-calculator', 'bac-calculator', 'nap-calculator', 'sleep-debt', 'caffeine-half-life', 'sober-time', 'chronotype', 'life-in-weeks']
      },
    ],
  },
  {
    slug: 'engineering', name: 'Engineering', icon: '⚙️',
    color: '#f59e0b', colorLight: '#fef3c7', colorDark: '#fbbf24',
    count: '54',
    description: 'Fluid dynamics, HVAC, electrical, mechanical, civil and unit converters. Professional-grade engineering calculators for students and working engineers.',
    subcategories: [
      {
        slug: 'electrical', name: 'Electrical Engineering', icon: '⚡', count: 8,
        description: 'Electrical engineering calculators covering Ohm\'s Law, power calculations, voltage drop, resistor colour codes and circuit analysis.',
        mostUsed: ['ohms-law', 'voltage-drop', 'power-calculator', 'resistor-color', 'capacitor-charge', 'led-resistor', 'wire-gauge', 'transformer-ratio']
      },
      {
        slug: 'fluid', name: 'Fluid & HVAC', icon: '🌬️', count: 9,
        description: 'Fluid mechanics and HVAC calculators for flow rate, Reynolds number, pipe sizing, pressure drop, heat load and pump calculations.',
        mostUsed: ['flow-rate', 'reynolds-number', 'pressure-drop', 'pipe-sizing', 'heat-load', 'hvac-calculator', 'pump-power', 'pump-head-calculator', 'heat-transfer-calculator']
      },
      {
        slug: 'materials', name: 'Materials Science', icon: '🧪', count: 4,
        description: 'Calculators for material properties, thermal expansion, and hardness scales.',
        mostUsed: ['thermal-expansion', 'youngs-modulus', 'material-density', 'hardness-converter']
      },
      {
        slug: 'mechanical', name: 'Mechanical Engineering', icon: '🔩', count: 8,
        description: 'Mechanical calculators for torque, gear ratios, beam deflection, stress and strain, horsepower and work. Useful for structural analysis and machine design.',
        mostUsed: ['torque-calculator', 'gear-ratio', 'beam-deflection', 'stress-strain', 'horsepower', 'spring-constant', 'force-calculator', 'work-calculator']
      },
      {
        slug: 'converters', name: 'Unit Converters', icon: '📐', count: 11,
        description: 'Fast, accurate unit converters for every engineering discipline. Convert length, weight, temperature, speed, pressure, energy, power, volume, area, force and torque.',
        mostUsed: ['length-converter', 'weight-converter', 'temperature-converter', 'speed-converter', 'pressure-converter', 'energy-converter', 'power-converter', 'volume-converter', 'area-converter', 'force-converter', 'torque-converter']
      },
      {
        slug: 'tech', name: 'Tech & Digital', icon: '💻', count: 7,
        description: 'Digital calculators for data storage, bandwidth, IP subnets, binary conversions, internet speed and data usage.',
        mostUsed: ['data-storage', 'bandwidth-calculator', 'subnet-calculator', 'binary-converter', 'hex-converter', 'internet-speed-calculator', 'data-usage-calculator']
      },
      {
        slug: 'civil', name: 'Civil Engineering', icon: '🏗️', count: 3,
        description: 'Civil engineering calculators for beam loads, concrete volume and steel weight.',
        mostUsed: ['beam-load-calculator', 'concrete-volume-calculator', 'steel-weight-calculator']
      },
    ],
  },
  {
    slug: 'math', name: 'Math', icon: '🧮',
    color: '#3b82f6', colorLight: '#dbeafe', colorDark: '#93c5fd',
    count: '96',
    description: 'Arithmetic, geometry, algebra, trigonometry, calculus, statistics, probability and more. Clean, fast math calculators for every level — Class 6 to B.Tech — all with step-by-step working.',
    subcategories: [

      {
        slug: 'arithmetic', name: 'Basic Arithmetic', icon: '🔢', count: 15,
        description: 'Fast calculators for everyday math — percentages, fractions, ratios, roots, factorization and scientific notation. All show working step-by-step.',
        mostUsed: [
          'percentage-calculator',
          'percentage-change',
          'fraction-calculator',
          'square-root-calculator',
          'gcf-calculator',
          'ratio-calculator',
          'average-calculator',
          'rounding-calculator',
          'prime-factorization',
          'factorial-calculator',
          'scientific-notation',
          'number-base-converter',
          'decimal-fraction-converter',
          'percent-error',
          'random-number',
        ]
      },

      {
        slug: 'geometry', name: 'Geometry', icon: '📐', count: 10,
        description: 'Calculate area, perimeter, volume and surface area of any shape. Solve triangles, circles and coordinate geometry problems with full working.',
        mostUsed: [
          'area-calculator',
          'perimeter-calculator',
          'volume-calculator',
          'pythagorean-theorem',
          'triangle-calculator',
          'circle-calculator',
          'surface-area-calculator',
          'slope-calculator',
          'right-triangle',
          'angle-calculator',
        ]
      },

      {
        slug: 'algebra', name: 'Algebra', icon: '📉', count: 13,
        description: 'Solve algebra problems with full step-by-step working. From linear and quadratic equations to polynomials, logarithms, sequences and complex numbers.',
        mostUsed: [
          'linear-equation',
          'quadratic-solver',
          'systems-equations',
          'polynomial-roots',
          'exponent-calculator',
          'logarithm-calculator',
          'inequality-solver',
          'sequence-calculator',
          'binomial-theorem',
          'complex-numbers',
          'exponential-growth',
          'absolute-value',
          'graphing-calculator',
        ]
      },

      {
        slug: 'trigonometry', name: 'Trigonometry', icon: '📏', count: 7,
        description: 'Calculate sin, cos and tan values, solve triangles using the law of sines and cosines, convert angles and explore the unit circle.',
        mostUsed: [
          'trig-calculator',
          'inverse-trig',
          'angle-converter',
          'law-of-sines',
          'law-of-cosines',
          'unit-circle',
          'trig-identities',
        ]
      },

      {
        slug: 'linear-algebra', name: 'Linear Algebra', icon: '🔣', count: 9,
        description: 'Matrix operations, determinants, inverses, eigenvalues, rank and Gauss elimination. Vector dot product, cross product and magnitude.',
        mostUsed: [
          'matrix-calculator',
          'determinant-calculator',
          'matrix-inverse',
          'eigenvalues-calculator',
          'rank-of-matrix',
          'gauss-elimination',
          'dot-product',
          'cross-product',
          'vector-magnitude',
        ]
      },

      {
        slug: 'calculus', name: 'Calculus', icon: '∫', count: 7,
        description: 'Limits, derivatives and integrals with step-by-step working. Includes partial derivatives, double integrals, Taylor series and Riemann sums.',
        mostUsed: [
          'limit-calculator',
          'derivative-calculator',
          'integral-calculator',
          'partial-derivative',
          'double-integral',
          'taylor-series',
          'riemann-sum',
        ]
      },

      {
        slug: 'differential-equations', name: 'Differential Equations', icon: '📋', count: 4,
        description: 'Solve first and second order ODEs and apply Laplace transforms with step-by-step working.',
        mostUsed: [
          'ode-first-order',
          'ode-second-order',
          'laplace-transform',
          'inverse-laplace',
        ]
      },

      {
        slug: 'statistics', name: 'Statistics', icon: '📊', count: 12,
        description: 'Statistical calculators for data analysis — mean, median, mode, standard deviation, z-scores, normal distribution, regression, hypothesis testing and more.',
        mostUsed: [
          'mean-median-mode',
          'standard-deviation',
          'variance-calculator',
          'normal-distribution',
          'z-score-calculator',
          'confidence-interval',
          'correlation',
          'regression-calculator',
          'weighted-average',
          'sample-size-calculator',
          'hypothesis-test',
          'chi-square',
        ]
      },

      {
        slug: 'probability', name: 'Probability', icon: '🎲', count: 7,
        description: 'Probability and combinatorics calculators for permutations, combinations, Bayes theorem, dice rolls and binomial and Poisson distributions.',
        mostUsed: [
          'probability-calculator',
          'permutations',
          'combinations',
          'dice-probability',
          'bayes-theorem',
          'binomial-distribution',
          'poisson-distribution',
        ]
      },

      {
        slug: 'number-theory', name: 'Number Theory', icon: '🔍', count: 3,
        description: 'Check prime numbers, find all factors of any number and calculate remainders with modulo arithmetic.',
        mostUsed: [
          'prime-checker',
          'factor-calculator',
          'remainder-calculator',
        ]
      },

      {
        slug: 'numerical-methods', name: 'Numerical Methods', icon: '⚙️', count: 4,
        description: 'Root-finding and numerical integration methods with iteration tables — bisection, Newton-Raphson, trapezoidal rule and Simpson\'s rule.',
        mostUsed: [
          'bisection-method',
          'newton-raphson',
          'trapezoidal-rule',
          'simpsons-rule',
        ]
      },

      {
        slug: 'date-time', name: 'Date & Time', icon: '📅', count: 5,
        description: 'Date and time calculators for age, duration, deadlines and working days. Find the difference between two dates and convert between time zones.',
        mostUsed: [
          'age-calculator',
          'date-difference',
          'add-subtract-days',
          'working-days',
          'time-zone-converter',
        ]
      },

    ],
  },
  {
    slug: 'utilities', name: 'Utilities', icon: '🛍️',
    color: '#0d9488', colorLight: '#eafffd', colorDark: '#2dd4bf',
    count: '43',
    description: 'Tip, discount, home, food, travel, business and currency. Practical everyday calculators that solve real-world problems instantly.',
    subcategories: [
      {
        slug: 'everyday', name: 'Everyday', icon: '🧾', count: 12,
        description: 'Quick everyday calculators for splitting bills, calculating tips, applying discounts and comparing prices. Designed to be fast and frictionless.',
        mostUsed: ['tip-calculator', 'split-bill', 'discount-calculator', 'sales-tax', 'percentage-off', 'price-per-unit', 'cost-per-use', 'budget-calculator', 'countdown-timer', 'age-difference-calculator', 'random-name-picker', 'password-strength-checker']
      },
      {
        slug: 'home', name: 'Home & Construction', icon: '🏠', count: 8,
        description: 'Home improvement and construction calculators for paint coverage, flooring area, tile quantities, concrete volume, landscaping and electricity bills.',
        mostUsed: ['paint-calculator', 'flooring-calculator', 'tile-calculator', 'concrete-calculator', 'wallpaper-calculator', 'fence-calculator', 'mulch-calculator', 'electricity-bill-calculator']
      },
      {
        slug: 'food', name: 'Food & Cooking', icon: '🍽️', count: 5,
        description: 'Cooking and recipe calculators for scaling servings, converting measurements and calculating cooking times.',
        mostUsed: ['recipe-converter', 'measurement-converter', 'cooking-time', 'yeast-converter', 'baking-calculator']
      },
      {
        slug: 'travel', name: 'Travel & Fuel', icon: '✈️', count: 6,
        description: 'Travel and transportation calculators for fuel costs, road trip budgets, flight times and timezone differences.',
        mostUsed: ['fuel-cost', 'mpg-calculator', 'road-trip', 'flight-time', 'timezone-converter', 'travel-budget']
      },
      {
        slug: 'business', name: 'Business', icon: '🧾', count: 7,
        description: 'Essential business calculators for profit margins, break-even analysis, markup pricing, VAT and invoice totals.',
        mostUsed: ['profit-margin', 'break-even', 'markup-calculator', 'vat-calculator', 'invoice-calculator', 'roi-business', 'payroll-calculator']
      },
      {
        slug: 'currency', name: 'Currency & Area', icon: '💱', count: 5,
        description: 'Currency conversion and area/volume calculators. Convert between world currencies, calculate square footage and acreage.',
        mostUsed: ['area-calculator', 'volume-calculator', 'currency-converter', 'square-footage', 'acreage-calculator']
      },
    ],
  },
]

export function getCategoryBySlug(slug) {
  return categories.find(c => c.slug === slug) || null
}
export function getSubcategoryBySlug(catSlug, subSlug) {
  const cat = getCategoryBySlug(catSlug)
  if (!cat) return null
  return cat.subcategories.find(s => s.slug === subSlug) || null
}
