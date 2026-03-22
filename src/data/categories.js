export const categories = [
  {
    slug: 'finance', name: 'Finance', icon: '💰',
    color: '#6366f1', colorLight: '#e0e7ff', colorDark: '#818cf8',
    count: '60+',
    description: 'Plan your investments, manage loans, calculate mortgages and build your retirement. Every financial calculation you need — free, instant and AI-powered.',
    subcategories: [
      { slug: 'investment', name: 'Investment & Growth',    icon: '📊', count: 11, description: 'Investment & Growth calculators help you understand how money multiplies over time through compound interest, measure portfolio performance, and plan for long-term financial goals.', mostUsed: ['compound-interest','future-value','roi-calculator','fire-calculator','cagr-calculator'] },
      { slug: 'loans',      name: 'Loans & Credit',         icon: '🏦', count: 9,  description: 'Loan calculators help you understand exactly what borrowing costs — from monthly EMI payments to total interest paid over the life of a loan.', mostUsed: ['loan-emi','loan-payoff','amortization','credit-card-payoff','debt-payoff'] },
      { slug: 'mortgage',   name: 'Mortgage & Real Estate', icon: '🏠', count: 8,  description: 'Buying a home is the biggest financial decision most people make. These calculators break down payments, compare renting vs buying, and find how much house you can afford.', mostUsed: ['mortgage-calculator','affordability','rent-vs-buy','mortgage-refinance','down-payment'] },
      { slug: 'savings',    name: 'Savings & Retirement',   icon: '💵', count: 10, description: 'Build wealth systematically with savings and retirement planners. Set goals and see exactly how much you need to save each month to hit your targets.', mostUsed: ['savings-goal','retirement-planner','emergency-fund','401k-calculator','roth-ira'] },
      { slug: 'banking',    name: 'Banking & Interest',     icon: '📈', count: 7,  description: 'Understand how banks work with your money. Calculate APY vs APR, compare savings rates, and see how inflation erodes purchasing power over time.', mostUsed: ['apy-calculator','apr-calculator','inflation-calculator','simple-interest','cd-calculator'] },
      { slug: 'income',     name: 'Income & Pay',           icon: '💳', count: 8,  description: 'From salary to take-home pay, convert between hourly and annual rates, calculate overtime, and see exactly how much tax you pay.', mostUsed: ['salary-to-hourly','take-home-pay','overtime-calculator','raise-calculator','bonus-tax'] },
      { slug: 'fire',       name: 'FIRE Planning',          icon: '🔥', count: 5,  description: 'Financial Independence Retire Early calculators. Find your FIRE number, calculate your savings rate and discover your exact retirement date.', mostUsed: ['fire-calculator','fire-number','safe-withdrawal','coast-fire','barista-fire'] },
    ],
  },
  {
    slug: 'health', name: 'Health', icon: '🏥',
    color: '#10b981', colorLight: '#d1fae5', colorDark: '#34d399',
    count: '45+',
    description: 'BMI, calories, fitness, pregnancy, vitals and lifestyle. Science-backed health calculators that give you real numbers — not generic advice.',
    subcategories: [
      { slug: 'body-metrics', name: 'Body Metrics',          icon: '⚖️', count: 8, description: 'Understand your body with evidence-based measurements. Calculate BMI, body fat percentage, ideal weight ranges and waist-to-hip ratio referencing WHO and CDC guidelines.', mostUsed: ['bmi-calculator','body-fat','ideal-weight','bmr-calculator','lean-body-mass'] },
      { slug: 'calories',     name: 'Calories & Nutrition',  icon: '🔥', count: 8, description: 'From daily calorie needs to precise macro splits, these nutrition calculators are built on peer-reviewed formulas. Whether cutting, bulking or maintaining — know your exact numbers.', mostUsed: ['calorie-calculator','tdee-calculator','macro-calculator','water-intake','protein-calculator'] },
      { slug: 'fitness',      name: 'Fitness & Performance', icon: '🏋️', count: 7, description: 'Performance calculators for runners, lifters and athletes. Calculate one rep max, running pace, VO2 max estimates and training zones based on your heart rate.', mostUsed: ['one-rep-max','pace-calculator','vo2-max','heart-rate-zones','calories-burned'] },
      { slug: 'pregnancy',    name: 'Pregnancy & Fertility', icon: '🤰', count: 6, description: 'Pregnancy and fertility calculators based on standard obstetric guidelines. Calculate your due date, track pregnancy weight gain and find your fertile window.', mostUsed: ['due-date','pregnancy-weight','ovulation-calculator','conception-date','weeks-pregnant'] },
      { slug: 'vitals',       name: 'Vital Health',          icon: '❤️', count: 8, description: 'Monitor and interpret your vital health indicators with clinical reference ranges for blood pressure, heart rate, sleep and more.', mostUsed: ['bmi-calculator','blood-pressure','resting-heart-rate','sleep-calculator','age-calculator'] },
      { slug: 'lifestyle',    name: 'Sleep & Lifestyle',     icon: '😴', count: 5, description: 'Lifestyle calculators for sleep, sobriety, and habit tracking. Calculate optimal sleep cycles, alcohol units, and daily step goals.', mostUsed: ['sleep-calculator','alcohol-units','steps-to-calories','caffeine-calculator','bac-calculator'] },
    ],
  },
  {
    slug: 'engineering', name: 'Engineering', icon: '⚙️',
    color: '#f59e0b', colorLight: '#fef3c7', colorDark: '#fbbf24',
    count: '30+',
    description: 'Fluid dynamics, HVAC, electrical, mechanical and unit converters. Professional-grade engineering calculators for students and working engineers.',
    subcategories: [
      { slug: 'electrical', name: 'Electrical Engineering', icon: '⚡', count: 8,  description: "Electrical engineering calculators covering Ohm's Law, power calculations, voltage drop, resistor colour codes and circuit analysis.", mostUsed: ['ohms-law','voltage-drop','power-calculator','resistor-color','capacitor-charge'] },
      { slug: 'fluid',      name: 'Fluid & HVAC',           icon: '🌬️', count: 7, description: 'Fluid mechanics and HVAC calculators for flow rate, Reynolds number, pipe sizing, pressure drop and heat load calculations.', mostUsed: ['flow-rate','reynolds-number','pressure-drop','pipe-sizing','heat-load'] },
      { slug: 'mechanical', name: 'Mechanical Engineering', icon: '🔩', count: 6,  description: 'Mechanical calculators for torque, gear ratios, beam deflection, stress and strain. Useful for structural analysis and machine design.', mostUsed: ['torque-calculator','gear-ratio','beam-deflection','stress-strain','horsepower'] },
      { slug: 'converters', name: 'Unit Converters',        icon: '📐', count: 10, description: 'Fast, accurate unit converters for every engineering discipline. Convert length, weight, temperature, speed, pressure, energy and power.', mostUsed: ['length-converter','weight-converter','temperature-converter','speed-converter','pressure-converter'] },
      { slug: 'tech',       name: 'Tech & Digital',         icon: '💻', count: 5,  description: 'Digital calculators for data storage, bandwidth, IP subnets and binary conversions. Essential for software engineers and network admins.', mostUsed: ['data-storage','bandwidth-calculator','subnet-calculator','binary-converter','hex-converter'] },
    ],
  },
  {
    slug: 'math', name: 'Math', icon: '🧮',
    color: '#3b82f6', colorLight: '#dbeafe', colorDark: '#93c5fd',
    count: '25+',
    description: 'Percentage, algebra, statistics, fractions, date & time and probability. Clean, fast math calculators with step-by-step explanations.',
    subcategories: [
      { slug: 'basic',       name: 'Basic Math',   icon: '🔢', count: 5, description: 'Fast calculators for everyday math — percentages, fractions, ratios, averages and rounding. All show the working step-by-step.', mostUsed: ['percentage-calculator','fraction-calculator','ratio-calculator','average-calculator','rounding-calculator'] },
      { slug: 'algebra',     name: 'Algebra',      icon: '📉', count: 6, description: 'Solve algebra problems with full step-by-step working. From linear equations to quadratic solvers and systems of equations.', mostUsed: ['quadratic-solver','linear-equation','systems-equations','polynomial-roots','exponent-calculator'] },
      { slug: 'statistics',  name: 'Statistics',   icon: '📊', count: 6, description: 'Statistical calculators for data analysis and probability distributions. Calculate mean, median, mode, standard deviation and variance.', mostUsed: ['mean-median-mode','standard-deviation','probability-calculator','normal-distribution','correlation'] },
      { slug: 'date-time',   name: 'Date & Time',  icon: '📅', count: 5, description: 'Date and time calculators for age, duration, deadlines and working days. Find the difference between two dates and calculate business days.', mostUsed: ['age-calculator','date-difference','add-subtract-days','working-days','time-zone-converter'] },
      { slug: 'probability', name: 'Probability',  icon: '🎲', count: 4, description: 'Probability and combinatorics calculators for permutations, combinations, dice rolls and card game odds.', mostUsed: ['probability-calculator','permutations','combinations','dice-probability'] },
    ],
  },
  {
    // ✅ FINAL: Utilities = Teal #0d9488 / light #eafffd / dark #2dd4bf
    slug: 'utilities', name: 'Utilities', icon: '🛍️',
    color: '#0d9488', colorLight: '#eafffd', colorDark: '#2dd4bf',
    count: '40+',
    description: 'Tip, discount, home, food, travel, business and currency. Practical everyday calculators that solve real-world problems instantly.',
    subcategories: [
      { slug: 'everyday', name: 'Everyday',            icon: '🧾', count: 8, description: 'Quick everyday calculators for splitting bills, calculating tips, applying discounts and comparing prices. Designed to be fast and frictionless.', mostUsed: ['tip-calculator','split-bill','discount-calculator','sales-tax','percentage-off'] },
      { slug: 'home',     name: 'Home & Construction', icon: '🏠', count: 7, description: 'Home improvement and construction calculators for paint coverage, flooring area, tile quantities, concrete volume and landscaping.', mostUsed: ['paint-calculator','flooring-calculator','tile-calculator','concrete-calculator','wallpaper-calculator'] },
      { slug: 'food',     name: 'Food & Cooking',      icon: '🍽️', count: 5, description: 'Cooking and recipe calculators for scaling servings, converting measurements and calculating cooking times.', mostUsed: ['recipe-converter','cooking-time','measurement-converter','yeast-converter','baking-calculator'] },
      { slug: 'travel',   name: 'Travel & Fuel',       icon: '✈️', count: 6, description: 'Travel and transportation calculators for fuel costs, road trip budgets, flight times and timezone differences.', mostUsed: ['fuel-cost','road-trip','mpg-calculator','flight-time','timezone-converter'] },
      { slug: 'business', name: 'Business',            icon: '🧾', count: 7, description: 'Essential business calculators for profit margins, break-even analysis, markup pricing, VAT and invoice totals.', mostUsed: ['profit-margin','break-even','markup-calculator','vat-calculator','invoice-calculator'] },
      { slug: 'currency', name: 'Currency & Area',     icon: '💱', count: 5, description: 'Currency conversion and area/volume calculators. Convert between world currencies, calculate square footage and acreage.', mostUsed: ['currency-converter','area-calculator','volume-calculator','square-footage','acreage-calculator'] },
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
