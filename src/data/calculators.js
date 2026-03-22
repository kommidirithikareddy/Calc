// ═══════════════════════════════════════════════════════════════
// CalC — Master Calculator Registry
// Every calculator is defined here with:
//   slug         — URL segment  e.g. "compound-interest"
//   name         — Display name
//   category     — parent category slug
//   subcategory  — parent subcategory slug
//   description  — short description shown in cards
//   about        — 2-3 sentence educational intro shown on calc page
//   related      — array of 3 related calculator slugs
//   inputStyle   — 'fields' | 'sliders' | 'wizard'
// ═══════════════════════════════════════════════════════════════

export const calculators = [

  // ─────────────────────────────────────────
  // FINANCE — Investment & Growth
  // ─────────────────────────────────────────
  {
    slug: 'compound-interest', name: 'Compound Interest Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'sliders',
    description: 'See how investments grow over time with compound interest and monthly contributions.',
    about: 'Compound interest is the eighth wonder of the world — interest earned on interest. Over time, even small regular contributions can grow into significant wealth when compounded monthly or daily. This calculator shows your final balance, total interest earned, and a year-by-year growth chart.',
    related: ['future-value', 'savings-goal', 'roi-calculator'],
  },
  {
    slug: 'future-value', name: 'Future Value Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'sliders',
    description: 'Project the future value of your investment at any interest rate and time period.',
    about: 'The future value formula tells you what a sum of money today will be worth at a point in the future, given an assumed rate of return. Essential for comparing investment options and setting realistic financial goals.',
    related: ['compound-interest', 'present-value', 'cagr-calculator'],
  },
  {
    slug: 'roi-calculator', name: 'ROI Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'Measure return on investment as a percentage gain or loss for any decision.',
    about: 'Return on Investment (ROI) is the most fundamental metric for evaluating whether an investment was worthwhile. It divides the net gain by the initial cost to give a clean percentage. Use it to compare stocks, real estate, marketing spend or any business decision.',
    related: ['cagr-calculator', 'irr-calculator', 'profit-margin'],
  },
  {
    slug: 'cagr-calculator', name: 'CAGR Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'Compound annual growth rate between any start and end value.',
    about: 'CAGR (Compound Annual Growth Rate) smooths out volatility to give you the steady annual return an investment would need to grow from its beginning value to its end value. It is the most honest way to compare investment performance across different time periods.',
    related: ['roi-calculator', 'compound-interest', 'future-value'],
  },
  {
    slug: 'fire-calculator', name: 'FIRE Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'wizard',
    description: 'Financial Independence Retire Early — find your FIRE date and target number.',
    about: 'FIRE (Financial Independence, Retire Early) is a movement built around aggressive saving and smart investing to achieve freedom from work decades before traditional retirement age. Enter your income, expenses, savings rate and expected return to find your exact FIRE number and projected retirement date.',
    related: ['compound-interest', 'retirement-planner', 'safe-withdrawal'],
  },
  {
    slug: 'irr-calculator', name: 'IRR Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'Internal rate of return for a series of positive and negative cash flows.',
    about: 'IRR (Internal Rate of Return) is the discount rate that makes the net present value of all cash flows from an investment equal to zero. It is the gold standard for evaluating the profitability of potential investments and comparing projects with different cash flow profiles.',
    related: ['roi-calculator', 'npv-calculator', 'payback-period'],
  },
  {
    slug: 'present-value', name: 'Present Value Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'What a future sum of money is worth in today\'s dollars.',
    about: 'Present value is the current worth of a future sum of money, given a specific rate of return. This concept is critical to discounted cash flow (DCF) analysis and understanding whether a future payment justifies a current investment.',
    related: ['future-value', 'npv-calculator', 'compound-interest'],
  },
  {
    slug: 'npv-calculator', name: 'Net Present Value (NPV)',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'Calculate the net present value of an investment with multiple cash flows.',
    about: 'NPV calculates the present value of all future cash flows minus the initial investment. A positive NPV means the investment creates value; negative means it destroys value. It is the most robust method for capital budgeting decisions.',
    related: ['irr-calculator', 'present-value', 'roi-calculator'],
  },
  {
    slug: 'payback-period', name: 'Payback Period Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'How long until an investment pays back its initial cost.',
    about: 'The payback period tells you how many years it takes to recover the cost of an investment from its net cash inflows. Simple, intuitive and widely used for quick investment screening — though it ignores the time value of money.',
    related: ['roi-calculator', 'irr-calculator', 'npv-calculator'],
  },
  {
    slug: 'investment-calculator', name: 'Investment Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'sliders',
    description: 'Model lump sum + monthly contributions growing over time with a full breakdown table.',
    about: 'This comprehensive investment calculator models both your initial lump sum and ongoing monthly contributions growing at a specified rate. It shows a year-by-year breakdown table of principal, contributions and accumulated interest so you can see exactly how your wealth builds.',
    related: ['compound-interest', 'savings-goal', 'future-value'],
  },
  {
    slug: 'dividend-yield', name: 'Dividend Yield Calculator',
    category: 'finance', subcategory: 'investment', inputStyle: 'fields',
    description: 'Calculate the dividend yield and annual income from a stock holding.',
    about: 'Dividend yield measures how much a company pays in dividends relative to its stock price. It is a key metric for income investors evaluating whether a dividend stock provides adequate return relative to its price and risk.',
    related: ['roi-calculator', 'compound-interest', 'investment-calculator'],
  },

  // ─────────────────────────────────────────
  // FINANCE — Loans & Credit
  // ─────────────────────────────────────────
  {
    slug: 'loan-emi', name: 'Loan EMI Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'sliders',
    description: 'Monthly EMI, total interest and full amortization schedule for any loan.',
    about: 'EMI (Equated Monthly Instalment) is the fixed amount you pay to your lender each month. It comprises both principal repayment and interest. This calculator shows your exact monthly payment, total interest cost and a complete month-by-month amortization schedule so you see exactly how each payment is split.',
    related: ['mortgage-calculator', 'loan-payoff', 'amortization'],
  },
  {
    slug: 'loan-payoff', name: 'Loan Payoff Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'sliders',
    description: 'See how extra payments dramatically reduce your loan payoff time and interest.',
    about: 'Making even small extra payments towards your loan principal can save thousands in interest and shave years off your repayment timeline. This calculator lets you model the impact of additional monthly payments so you can find the optimal strategy for your budget.',
    related: ['loan-emi', 'amortization', 'debt-payoff'],
  },
  {
    slug: 'amortization', name: 'Amortization Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'sliders',
    description: 'Full month-by-month amortization schedule showing principal and interest split.',
    about: 'Amortization describes how loan payments are allocated between principal reduction and interest charges over time. In early payments, most of your money goes to interest. This calculator generates the full schedule and shows a visual chart of how the balance declines over time.',
    related: ['loan-emi', 'mortgage-calculator', 'loan-payoff'],
  },
  {
    slug: 'credit-card-payoff', name: 'Credit Card Payoff Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'wizard',
    description: 'How long and how much it costs to pay off your credit card balance.',
    about: 'Credit card debt is expensive — average APR exceeds 20%. This calculator shows you exactly how long it will take to clear your balance making minimum payments versus a fixed monthly amount, and the eye-opening total interest cost of each strategy.',
    related: ['debt-payoff', 'loan-emi', 'interest-rate-calculator'],
  },
  {
    slug: 'debt-payoff', name: 'Debt Payoff Planner',
    category: 'finance', subcategory: 'loans', inputStyle: 'wizard',
    description: 'Compare avalanche vs snowball strategy to find your fastest path to debt freedom.',
    about: 'The debt avalanche (highest interest first) and debt snowball (smallest balance first) are the two most popular debt payoff strategies. This planner lets you model both, compare total interest paid and payoff dates, and choose the right approach for your psychological and financial situation.',
    related: ['credit-card-payoff', 'loan-payoff', 'budget-calculator'],
  },
  {
    slug: 'auto-loan', name: 'Auto Loan Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'sliders',
    description: 'Monthly car payment, total cost and full amortization for any vehicle purchase.',
    about: 'Car loans are one of the most common forms of consumer debt. This calculator shows your exact monthly payment for any vehicle price, down payment, interest rate and loan term — and reveals the true total cost of financing versus paying cash.',
    related: ['loan-emi', 'auto-lease', 'amortization'],
  },
  {
    slug: 'auto-lease', name: 'Auto Lease Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'fields',
    description: 'Calculate monthly lease payments and compare leasing vs buying a car.',
    about: 'Leasing can offer lower monthly payments than buying, but you build no equity. This calculator computes your exact lease payment from the cap cost, residual value, money factor and term — and helps you compare the true long-term cost of leasing versus financing a purchase.',
    related: ['auto-loan', 'loan-emi', 'roi-calculator'],
  },
  {
    slug: 'interest-rate-calculator', name: 'Interest Rate Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'fields',
    description: 'Find the implied interest rate given loan amount, payment and term.',
    about: 'If you know the loan amount, monthly payment and term but need to find the implied interest rate — this calculator solves for it using iterative methods. Useful for reverse-engineering the real cost of financing offers.',
    related: ['loan-emi', 'apy-calculator', 'apr-calculator'],
  },
  {
    slug: 'personal-loan', name: 'Personal Loan Calculator',
    category: 'finance', subcategory: 'loans', inputStyle: 'sliders',
    description: 'Monthly payment and total cost for a personal loan at any rate and term.',
    about: 'Personal loans are unsecured loans used for everything from home improvements to medical expenses. This calculator computes your monthly payment and full cost of borrowing so you can compare offers from different lenders before committing.',
    related: ['loan-emi', 'debt-payoff', 'credit-card-payoff'],
  },

  // ─────────────────────────────────────────
  // FINANCE — Mortgage
  // ─────────────────────────────────────────
  {
    slug: 'mortgage-calculator', name: 'Mortgage Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'wizard',
    description: 'Monthly payment with principal, interest, taxes and insurance. Full amortization included.',
    about: 'A complete mortgage calculator that goes beyond the basic P&I payment to include property tax, homeowner\'s insurance and PMI (private mortgage insurance). See your full monthly housing cost, total interest paid over the life of the loan, and a complete amortization schedule.',
    related: ['affordability', 'rent-vs-buy', 'mortgage-refinance'],
  },
  {
    slug: 'affordability', name: 'Home Affordability Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'sliders',
    description: 'How much house can you afford based on income, debts and down payment?',
    about: 'Lenders typically use the 28/36 rule: your housing costs should not exceed 28% of gross income and total debt payments should not exceed 36%. This calculator applies these guidelines plus your actual numbers to give you a realistic maximum home price and comfortable target range.',
    related: ['mortgage-calculator', 'rent-vs-buy', 'down-payment'],
  },
  {
    slug: 'rent-vs-buy', name: 'Rent vs Buy Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'wizard',
    description: 'True long-term cost comparison of renting vs buying a home.',
    about: 'The decision to rent or buy is rarely as simple as comparing monthly payments. This calculator factors in all the hidden costs of ownership — maintenance, property tax, insurance, opportunity cost of down payment — and all the benefits of building equity to give you an honest break-even analysis.',
    related: ['mortgage-calculator', 'affordability', 'compound-interest'],
  },
  {
    slug: 'mortgage-refinance', name: 'Mortgage Refinance Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'sliders',
    description: 'Should you refinance? See your monthly savings and break-even point.',
    about: 'Refinancing can save thousands in interest but involves upfront closing costs. This calculator computes your new monthly payment, monthly savings, total interest reduction and the break-even point — the number of months until your savings exceed your closing costs.',
    related: ['mortgage-calculator', 'loan-payoff', 'amortization'],
  },
  {
    slug: 'down-payment', name: 'Down Payment Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'sliders',
    description: 'How much to save for a down payment and how long it will take.',
    about: 'A larger down payment means a smaller loan, lower monthly payments and potentially no PMI. This calculator shows you how different down payment amounts affect your monthly payment, total interest and PMI costs — and how long it will take to save your target amount.',
    related: ['mortgage-calculator', 'affordability', 'savings-goal'],
  },
  {
    slug: 'closing-costs', name: 'Closing Costs Calculator',
    category: 'finance', subcategory: 'mortgage', inputStyle: 'fields',
    description: 'Estimate your total closing costs when buying a home.',
    about: 'Closing costs typically range from 2% to 5% of the loan amount and can catch first-time buyers off guard. This calculator breaks down all expected fees — lender fees, title insurance, appraisal, prepaid items and more — so you know the full cash required at closing.',
    related: ['mortgage-calculator', 'down-payment', 'affordability'],
  },

  // ─────────────────────────────────────────
  // FINANCE — Savings & Retirement
  // ─────────────────────────────────────────
  {
    slug: 'savings-goal', name: 'Savings Goal Calculator',
    category: 'finance', subcategory: 'savings', inputStyle: 'sliders',
    description: 'How much to save monthly to reach any financial goal on time.',
    about: 'Whether saving for a house, a holiday, a car or an emergency fund — this calculator tells you exactly how much to set aside each month. Enter your goal amount, time horizon and expected interest rate to see your required monthly saving and a visual progress projection.',
    related: ['compound-interest', 'emergency-fund', 'retirement-planner'],
  },
  {
    slug: 'retirement-planner', name: 'Retirement Planner',
    category: 'finance', subcategory: 'savings', inputStyle: 'wizard',
    description: 'How much you need for retirement and whether you are on track.',
    about: 'A comprehensive retirement planning tool that factors in your current savings, monthly contributions, expected return, inflation and desired retirement income. See whether you are on track, what gap exists and how different variables affect your retirement readiness.',
    related: ['fire-calculator', 'savings-goal', '401k-calculator'],
  },
  {
    slug: 'emergency-fund', name: 'Emergency Fund Calculator',
    category: 'finance', subcategory: 'savings', inputStyle: 'fields',
    description: 'How large your emergency fund should be and how long to build it.',
    about: 'Financial experts recommend keeping 3-6 months of essential expenses in an accessible emergency fund. This calculator analyses your monthly expenses, income stability and risk factors to recommend the right emergency fund size for your specific situation.',
    related: ['savings-goal', 'budget-calculator', 'compound-interest'],
  },
  {
    slug: '401k-calculator', name: '401(k) Calculator',
    category: 'finance', subcategory: 'savings', inputStyle: 'sliders',
    description: 'Project your 401(k) balance at retirement with employer matching.',
    about: 'A 401(k) is one of the most powerful retirement saving vehicles available, especially when your employer matches contributions. This calculator projects your final balance accounting for your contribution rate, employer match, current balance and expected returns — and shows the dramatic impact of starting early.',
    related: ['retirement-planner', 'roth-ira', 'compound-interest'],
  },
  {
    slug: 'roth-ira', name: 'Roth IRA Calculator',
    category: 'finance', subcategory: 'savings', inputStyle: 'sliders',
    description: 'Roth IRA growth projection and comparison with traditional IRA.',
    about: 'A Roth IRA offers tax-free growth and withdrawals in retirement — making it one of the best long-term savings vehicles for people who expect to be in a higher tax bracket later. This calculator shows your projected Roth IRA balance and compares the after-tax value against a traditional IRA.',
    related: ['401k-calculator', 'retirement-planner', 'compound-interest'],
  },

  // ─────────────────────────────────────────
  // FINANCE — Banking & Interest
  // ─────────────────────────────────────────
  {
    slug: 'apy-calculator', name: 'APY Calculator',
    category: 'finance', subcategory: 'banking', inputStyle: 'fields',
    description: 'Convert APR to APY and compare savings account rates accurately.',
    about: 'APY (Annual Percentage Yield) accounts for compounding, making it the true measure of what you earn on deposits. APR (Annual Percentage Rate) does not. This calculator converts between the two and shows how compounding frequency affects your actual return.',
    related: ['apr-calculator', 'cd-calculator', 'compound-interest'],
  },
  {
    slug: 'apr-calculator', name: 'APR Calculator',
    category: 'finance', subcategory: 'banking', inputStyle: 'fields',
    description: 'True annual cost of a loan including fees, not just the interest rate.',
    about: 'APR (Annual Percentage Rate) includes both the interest rate and all lender fees, making it the standard for comparing loan costs. A loan with a low interest rate and high fees may have a higher APR than a loan with a slightly higher rate but no fees.',
    related: ['apy-calculator', 'loan-emi', 'interest-rate-calculator'],
  },
  {
    slug: 'inflation-calculator', name: 'Inflation Calculator',
    category: 'finance', subcategory: 'banking', inputStyle: 'sliders',
    description: 'What will today\'s money be worth in the future given an inflation rate?',
    about: 'Inflation silently erodes purchasing power over time. At 3% annual inflation, $100 today will only buy $74 worth of goods in 10 years. This calculator shows the real value of money across time and helps you understand why your investments need to beat inflation to grow your actual wealth.',
    related: ['compound-interest', 'savings-goal', 'retirement-planner'],
  },
  {
    slug: 'simple-interest', name: 'Simple Interest Calculator',
    category: 'finance', subcategory: 'banking', inputStyle: 'fields',
    description: 'Calculate simple interest on a principal amount over any period.',
    about: 'Simple interest is calculated only on the principal amount, unlike compound interest which also earns interest on accumulated interest. It is used for short-term loans, some bonds and certain savings products. Formula: I = P × r × t',
    related: ['compound-interest', 'apy-calculator', 'loan-emi'],
  },
  {
    slug: 'cd-calculator', name: 'CD Calculator',
    category: 'finance', subcategory: 'banking', inputStyle: 'fields',
    description: 'Certificate of deposit maturity value and APY for any CD term.',
    about: 'A CD (Certificate of Deposit) offers a guaranteed fixed return for locking up your money for a set period. This calculator computes your maturity value, total interest earned and effective APY — and lets you compare CDs with different terms and rates.',
    related: ['apy-calculator', 'savings-goal', 'compound-interest'],
  },

  // ─────────────────────────────────────────
  // FINANCE — Income & Pay
  // ─────────────────────────────────────────
  {
    slug: 'salary-to-hourly', name: 'Salary to Hourly Calculator',
    category: 'finance', subcategory: 'income', inputStyle: 'fields',
    description: 'Convert annual salary to hourly, daily, weekly and monthly rates.',
    about: 'Whether evaluating a job offer, comparing compensation packages or tracking your hourly equivalent, this calculator converts your annual salary into every useful time period — hourly, daily, weekly, bi-weekly and monthly — both before and after a standard tax deduction.',
    related: ['take-home-pay', 'overtime-calculator', 'raise-calculator'],
  },
  {
    slug: 'take-home-pay', name: 'Take-Home Pay Calculator',
    category: 'finance', subcategory: 'income', inputStyle: 'fields',
    description: 'Estimate your net salary after federal, state and FICA taxes.',
    about: 'Your gross salary and your take-home pay can differ dramatically once federal income tax, state tax, Social Security and Medicare deductions are applied. This calculator estimates your net pay for any salary level so you can plan your budget around actual income.',
    related: ['salary-to-hourly', 'raise-calculator', 'budget-calculator'],
  },
  {
    slug: 'raise-calculator', name: 'Raise Calculator',
    category: 'finance', subcategory: 'income', inputStyle: 'fields',
    description: 'How much is your pay raise worth annually, monthly and hourly?',
    about: 'A raise sounds impressive as a percentage but the real impact is in the dollars. This calculator converts a percentage raise into the actual extra income you will receive annually, monthly and bi-weekly — and shows the compound effect of consistent raises over a career.',
    related: ['salary-to-hourly', 'take-home-pay', 'compound-interest'],
  },
  {
    slug: 'overtime-calculator', name: 'Overtime Calculator',
    category: 'finance', subcategory: 'income', inputStyle: 'fields',
    description: 'Calculate overtime pay at 1.5x or 2x for any hourly rate and hours worked.',
    about: 'US federal law requires overtime pay at 1.5x the regular rate for hours worked beyond 40 per week. Some states and employers pay double time. This calculator shows your overtime earnings, total weekly pay and annual equivalent for any hours and pay rate combination.',
    related: ['salary-to-hourly', 'take-home-pay', 'raise-calculator'],
  },

  // ─────────────────────────────────────────
  // FINANCE — FIRE
  // ─────────────────────────────────────────
  {
    slug: 'fire-number', name: 'FIRE Number Calculator',
    category: 'finance', subcategory: 'fire', inputStyle: 'fields',
    description: 'Your magic FIRE number — total savings needed to retire early.',
    about: 'Your FIRE number is the total portfolio value at which you can retire, based on the 4% safe withdrawal rule: you can sustainably withdraw 4% per year without depleting your portfolio over a 30-year retirement. Enter your annual expenses and see your target number instantly.',
    related: ['fire-calculator', 'safe-withdrawal', 'compound-interest'],
  },
  {
    slug: 'safe-withdrawal', name: 'Safe Withdrawal Rate Calculator',
    category: 'finance', subcategory: 'fire', inputStyle: 'sliders',
    description: 'How long your retirement savings will last at different withdrawal rates.',
    about: 'The 4% rule comes from the Trinity Study and suggests a 4% annual withdrawal from a diversified portfolio has historically survived 30-year retirements. This calculator lets you test different withdrawal rates against your portfolio size to find the rate that matches your retirement horizon.',
    related: ['fire-number', 'fire-calculator', 'retirement-planner'],
  },
  {
    slug: 'coast-fire', name: 'Coast FIRE Calculator',
    category: 'finance', subcategory: 'fire', inputStyle: 'sliders',
    description: 'How much you need saved now to coast to retirement without further contributions.',
    about: 'Coast FIRE means having enough invested today that — even without adding another dollar — compound growth alone will carry you to your retirement number. This calculator finds your Coast FIRE number and tells you how close you are to the point where you can stop saving aggressively.',
    related: ['fire-calculator', 'fire-number', 'compound-interest'],
  },

  // ─────────────────────────────────────────
  // HEALTH — Body Metrics
  // ─────────────────────────────────────────
  {
    slug: 'bmi-calculator', name: 'BMI Calculator',
    category: 'health', subcategory: 'body-metrics', inputStyle: 'fields',
    description: 'Body Mass Index with WHO classification, healthy weight range and BMI chart.',
    about: 'BMI (Body Mass Index) is a widely used screening tool for categorising weight status in adults. It is calculated from height and weight and classified using WHO ranges: Underweight (<18.5), Normal (18.5-25), Overweight (25-30), Obese (>30). While imperfect, it is a useful initial indicator for health screening.',
    related: ['body-fat', 'ideal-weight', 'bmr-calculator'],
  },
  {
    slug: 'body-fat', name: 'Body Fat Percentage Calculator',
    category: 'health', subcategory: 'body-metrics', inputStyle: 'fields',
    description: 'Estimate body fat percentage using Navy, BMI and skinfold methods.',
    about: 'Body fat percentage is a more accurate measure of health than BMI because it distinguishes between fat mass and lean muscle mass. This calculator uses the US Navy body fat formula (waist, neck, height measurements) and provides ACE fitness category classification for men and women.',
    related: ['bmi-calculator', 'ideal-weight', 'lean-body-mass'],
  },
  {
    slug: 'ideal-weight', name: 'Ideal Weight Calculator',
    category: 'health', subcategory: 'body-metrics', inputStyle: 'fields',
    description: 'Your ideal weight range from 5 different medical formulas.',
    about: 'No single formula defines ideal weight — different medical traditions use different approaches. This calculator runs five established formulas (Hamwi, Devine, Robinson, Miller and BMI-based) and shows the range of results alongside your healthy BMI weight range for a complete picture.',
    related: ['bmi-calculator', 'body-fat', 'bmr-calculator'],
  },
  {
    slug: 'bmr-calculator', name: 'BMR Calculator',
    category: 'health', subcategory: 'body-metrics', inputStyle: 'fields',
    description: 'Basal Metabolic Rate — calories your body burns at complete rest.',
    about: 'BMR (Basal Metabolic Rate) is the number of calories your body needs to maintain basic physiological functions at rest — breathing, circulation and cell production. This calculator uses both the Mifflin-St Jeor and Harris-Benedict equations, which are the two most clinically validated formulas.',
    related: ['tdee-calculator', 'calorie-calculator', 'macro-calculator'],
  },
  {
    slug: 'lean-body-mass', name: 'Lean Body Mass Calculator',
    category: 'health', subcategory: 'body-metrics', inputStyle: 'fields',
    description: 'Your lean muscle mass (total weight minus body fat).',
    about: 'Lean body mass (LBM) is total body weight minus fat. It includes muscle, bone, organs, blood and water. Knowing your LBM is important for setting accurate protein targets, calculating activity-adjusted calorie needs and tracking the quality of body composition changes during training.',
    related: ['body-fat', 'bmr-calculator', 'macro-calculator'],
  },

  // ─────────────────────────────────────────
  // HEALTH — Calories & Nutrition
  // ─────────────────────────────────────────
  {
    slug: 'calorie-calculator', name: 'Calorie Calculator',
    category: 'health', subcategory: 'calories', inputStyle: 'fields',
    description: 'Daily calorie needs for weight loss, maintenance or muscle gain.',
    about: 'Daily calorie needs depend on your BMR and activity level. This calculator uses the Mifflin-St Jeor equation to find your TDEE and then applies a deficit or surplus based on your goal — whether losing weight, maintaining or building muscle — with safe ranges validated against clinical guidelines.',
    related: ['tdee-calculator', 'macro-calculator', 'bmr-calculator'],
  },
  {
    slug: 'tdee-calculator', name: 'TDEE Calculator',
    category: 'health', subcategory: 'calories', inputStyle: 'fields',
    description: 'Total Daily Energy Expenditure — all calories burned in a day.',
    about: 'TDEE (Total Daily Energy Expenditure) is your BMR multiplied by an activity multiplier. It represents all calories burned in a typical day including exercise and non-exercise activity. This is the number you should use as your baseline when calculating any calorie-based diet target.',
    related: ['calorie-calculator', 'bmr-calculator', 'macro-calculator'],
  },
  {
    slug: 'macro-calculator', name: 'Macro Calculator',
    category: 'health', subcategory: 'calories', inputStyle: 'fields',
    description: 'Protein, carbs and fat targets for your body and goals in grams per day.',
    about: 'Macros (macronutrients) are protein, carbohydrates and fat — the three nutrients that provide energy. The right macro ratio depends on your goal (fat loss, muscle gain, performance) and body type. This calculator generates personalised gram targets with recommended ranges from sports nutrition research.',
    related: ['calorie-calculator', 'tdee-calculator', 'protein-calculator'],
  },
  {
    slug: 'water-intake', name: 'Water Intake Calculator',
    category: 'health', subcategory: 'calories', inputStyle: 'fields',
    description: 'Daily water intake recommendation based on weight and activity.',
    about: 'Adequate hydration is foundational to health, yet most people underestimate their needs. This calculator uses the IOM (Institute of Medicine) formula adjusted for body weight, climate and activity level to give you a personalised daily water target in litres and glasses.',
    related: ['calorie-calculator', 'bmi-calculator', 'bmr-calculator'],
  },
  {
    slug: 'protein-calculator', name: 'Protein Calculator',
    category: 'health', subcategory: 'calories', inputStyle: 'fields',
    description: 'Daily protein requirement based on weight, goal and activity level.',
    about: 'Protein needs vary significantly based on your training status and goals. Sedentary adults need 0.8g/kg; athletes need 1.6-2.2g/kg for muscle building. This calculator gives your target range from multiple evidence-based sources including ISSN and ACSM guidelines.',
    related: ['macro-calculator', 'lean-body-mass', 'calorie-calculator'],
  },

  // ─────────────────────────────────────────
  // HEALTH — Fitness
  // ─────────────────────────────────────────
  {
    slug: 'one-rep-max', name: 'One Rep Max Calculator',
    category: 'health', subcategory: 'fitness', inputStyle: 'fields',
    description: 'Estimate 1RM from any set using 7 validated formulas and a full percentage table.',
    about: 'Your 1RM (one repetition maximum) is the heaviest weight you can lift for a single rep with good form. Rather than testing it directly (which risks injury), this calculator estimates it from a submaximal set using 7 peer-reviewed formulas (Epley, Brzycki, Mayhew, etc.) and generates a full percentage table for programming.',
    related: ['calories-burned', 'heart-rate-zones', 'pace-calculator'],
  },
  {
    slug: 'pace-calculator', name: 'Pace Calculator',
    category: 'health', subcategory: 'fitness', inputStyle: 'fields',
    description: 'Running pace, finish time and distance — solve for any one variable.',
    about: 'Running pace calculators work in three directions: given pace and distance → time; given time and distance → pace; given pace and time → distance. This tool solves all three instantly and includes a race time predictor for standard distances (5K, 10K, half-marathon, marathon).',
    related: ['calories-burned', 'heart-rate-zones', 'vo2-max'],
  },
  {
    slug: 'calories-burned', name: 'Calories Burned Calculator',
    category: 'health', subcategory: 'fitness', inputStyle: 'fields',
    description: 'Calories burned for 50+ activities based on duration, weight and intensity.',
    about: 'Calorie expenditure during exercise depends on body weight, activity type and intensity. This calculator uses MET (Metabolic Equivalent of Task) values from the Compendium of Physical Activities for over 50 common exercises — from walking and cycling to swimming, HIIT and resistance training.',
    related: ['tdee-calculator', 'heart-rate-zones', 'pace-calculator'],
  },
  {
    slug: 'heart-rate-zones', name: 'Heart Rate Zone Calculator',
    category: 'health', subcategory: 'fitness', inputStyle: 'fields',
    description: 'Your 5 heart rate training zones from max heart rate or Karvonen formula.',
    about: 'Training in the right heart rate zone is the difference between productive workouts and wasted effort. This calculator uses both the age-predicted max heart rate method and the more accurate Karvonen formula (which accounts for resting heart rate) to define your five training zones.',
    related: ['calories-burned', 'pace-calculator', 'vo2-max'],
  },
  {
    slug: 'vo2-max', name: 'VO2 Max Calculator',
    category: 'health', subcategory: 'fitness', inputStyle: 'fields',
    description: 'Estimate your VO2 max from a 1.5 mile run, resting heart rate or Cooper test.',
    about: 'VO2 max is the maximum rate of oxygen consumption during intense exercise and is considered the gold standard of cardiovascular fitness. This calculator estimates VO2 max from several field tests and classifies your result against age and gender norms from the American Heart Association.',
    related: ['heart-rate-zones', 'pace-calculator', 'calories-burned'],
  },

  // ─────────────────────────────────────────
  // HEALTH — Pregnancy
  // ─────────────────────────────────────────
  {
    slug: 'due-date', name: 'Due Date Calculator',
    category: 'health', subcategory: 'pregnancy', inputStyle: 'fields',
    description: 'Estimated due date from LMP, conception date or IVF transfer date.',
    about: 'The most common method for calculating due date is Naegele\'s Rule: add 280 days (40 weeks) to the first day of your last menstrual period (LMP). This calculator also accepts a known conception date or IVF transfer date and shows your current gestational age, trimester and key milestone dates.',
    related: ['pregnancy-weight', 'weeks-pregnant', 'ovulation-calculator'],
  },
  {
    slug: 'ovulation-calculator', name: 'Ovulation Calculator',
    category: 'health', subcategory: 'pregnancy', inputStyle: 'fields',
    description: 'Fertile window and predicted ovulation date from your cycle length.',
    about: 'Ovulation typically occurs 14 days before your next period. This calculator uses your cycle length to predict your fertile window (the 5-day period when conception is possible) and most likely ovulation date — based on the standard menstrual cycle model used in clinical practice.',
    related: ['due-date', 'conception-date', 'weeks-pregnant'],
  },
  {
    slug: 'pregnancy-weight', name: 'Pregnancy Weight Gain Calculator',
    category: 'health', subcategory: 'pregnancy', inputStyle: 'fields',
    description: 'Recommended weight gain ranges during pregnancy based on pre-pregnancy BMI.',
    about: 'The Institute of Medicine (IOM) provides evidence-based guidelines for healthy pregnancy weight gain based on pre-pregnancy BMI. Gaining too little or too much can affect birth outcomes. This calculator shows your recommended total gain range and week-by-week target trajectory.',
    related: ['due-date', 'bmi-calculator', 'weeks-pregnant'],
  },

  // ─────────────────────────────────────────
  // HEALTH — Vitals
  // ─────────────────────────────────────────
  {
    slug: 'sleep-calculator', name: 'Sleep Calculator',
    category: 'health', subcategory: 'vitals', inputStyle: 'fields',
    description: 'Best wake-up and bedtimes based on 90-minute sleep cycles.',
    about: 'Sleep occurs in 90-minute cycles — waking mid-cycle leaves you groggy. This calculator works in both directions: given your desired wake-up time, it tells you when to go to sleep; given your bedtime, it tells you the best times to set your alarm. Based on the sleep architecture research of the National Sleep Foundation.',
    related: ['bmi-calculator', 'calorie-calculator', 'water-intake'],
  },
  {
    slug: 'age-calculator', name: 'Age Calculator',
    category: 'health', subcategory: 'vitals', inputStyle: 'fields',
    description: 'Exact age in years, months, days, hours and minutes.',
    about: 'Calculate your precise age from date of birth to today — or to any target date. Shows your age in years, months, days, total days lived, weeks lived and even hours. Also shows how many days until your next birthday.',
    related: ['date-difference', 'due-date', 'bmi-calculator'],
  },
  {
    slug: 'bac-calculator', name: 'BAC Calculator',
    category: 'health', subcategory: 'vitals', inputStyle: 'fields',
    description: 'Estimate blood alcohol content from drinks, weight and time.',
    about: 'Blood alcohol content (BAC) is affected by the number of drinks consumed, alcohol percentage, body weight, sex and time elapsed. This calculator uses the Widmark formula — the standard used in forensic and legal contexts — to estimate BAC and the time until it returns to zero.',
    related: ['water-intake', 'bmi-calculator', 'calorie-calculator'],
  },

  // ─────────────────────────────────────────
  // ENGINEERING — Electrical
  // ─────────────────────────────────────────
  {
    slug: 'ohms-law', name: "Ohm's Law Calculator",
    category: 'engineering', subcategory: 'electrical', inputStyle: 'fields',
    description: 'Solve for voltage, current, resistance or power — enter any two values.',
    about: "Ohm's Law (V = IR) is the fundamental relationship between voltage, current and resistance in electrical circuits. This calculator solves for any one of the four electrical quantities — voltage (V), current (I), resistance (R) or power (P) — from any two known values, with a visual circuit diagram.",
    related: ['voltage-drop', 'power-calculator', 'resistor-color'],
  },
  {
    slug: 'voltage-drop', name: 'Voltage Drop Calculator',
    category: 'engineering', subcategory: 'electrical', inputStyle: 'fields',
    description: 'Voltage drop across a wire run based on conductor size, length and current.',
    about: 'Voltage drop in electrical wiring causes equipment to receive less voltage than the source provides, which can cause inefficiency or failure. NEC recommends keeping voltage drop under 3% for branch circuits. This calculator computes drop using the standard formula for single-phase and three-phase systems.',
    related: ['ohms-law', 'power-calculator', 'resistor-color'],
  },
  {
    slug: 'power-calculator', name: 'Electrical Power Calculator',
    category: 'engineering', subcategory: 'electrical', inputStyle: 'fields',
    description: 'Calculate electrical power in watts from voltage, current or resistance.',
    about: 'Electrical power is the rate at which electrical energy is transferred. The three forms of the power equation (P=IV, P=I²R, P=V²/R) let you calculate power from any two of the three basic electrical quantities. Essential for sizing conductors, fuses and power supplies.',
    related: ['ohms-law', 'voltage-drop', 'capacitor-charge'],
  },
  {
    slug: 'resistor-color', name: 'Resistor Color Code Calculator',
    category: 'engineering', subcategory: 'electrical', inputStyle: 'fields',
    description: 'Decode resistor color bands to resistance and tolerance values.',
    about: "The resistor color code is a standard system for marking resistance values on small components using colored bands. This calculator decodes 3-band, 4-band and 5-band resistors and also works in reverse — enter a resistance value and it shows you the correct color band sequence.",
    related: ['ohms-law', 'voltage-drop', 'power-calculator'],
  },

  // ─────────────────────────────────────────
  // ENGINEERING — Fluid & HVAC
  // ─────────────────────────────────────────
  {
    slug: 'flow-rate', name: 'Flow Rate Calculator',
    category: 'engineering', subcategory: 'fluid', inputStyle: 'fields',
    description: 'Volumetric flow rate from velocity and pipe cross-sectional area.',
    about: 'Flow rate (Q = A × v) describes the volume of fluid passing a point per unit time. It is fundamental to pipe sizing, pump selection and HVAC design. This calculator computes flow rate from pipe diameter and velocity, or solves for velocity or diameter given a required flow rate.',
    related: ['reynolds-number', 'pressure-drop', 'pipe-sizing'],
  },
  {
    slug: 'reynolds-number', name: 'Reynolds Number Calculator',
    category: 'engineering', subcategory: 'fluid', inputStyle: 'fields',
    description: 'Reynolds number to determine laminar vs turbulent flow in a pipe.',
    about: 'The Reynolds number (Re = ρvD/μ) predicts whether fluid flow will be laminar (Re < 2300), transitional (2300-4000) or turbulent (>4000). This dimensionless number is critical for heat transfer, pipe pressure drop and fluid machinery design. Enter fluid properties and pipe geometry to compute Re.',
    related: ['flow-rate', 'pressure-drop', 'pipe-sizing'],
  },
  {
    slug: 'pressure-drop', name: 'Pipe Pressure Drop Calculator',
    category: 'engineering', subcategory: 'fluid', inputStyle: 'fields',
    description: 'Pressure drop through a pipe using the Darcy-Weisbach equation.',
    about: 'Pressure drop in piping systems must be accurately calculated to size pumps and ensure adequate flow at all points. This calculator implements the Darcy-Weisbach equation with Moody friction factor for both smooth and rough pipes, supporting water, air and custom fluid properties.',
    related: ['reynolds-number', 'flow-rate', 'pipe-sizing'],
  },

  // ─────────────────────────────────────────
  // ENGINEERING — Unit Converters
  // ─────────────────────────────────────────
  {
    slug: 'length-converter', name: 'Length Converter',
    category: 'engineering', subcategory: 'converters', inputStyle: 'fields',
    description: 'Convert between metres, feet, inches, cm, mm, miles, km and more.',
    about: 'Instantly convert any length measurement across all major metric and imperial units. Supports metres, centimetres, millimetres, kilometres, inches, feet, yards, miles, nautical miles and micrometres — with full precision and scientific notation for very small or large values.',
    related: ['weight-converter', 'area-calculator', 'speed-converter'],
  },
  {
    slug: 'weight-converter', name: 'Weight & Mass Converter',
    category: 'engineering', subcategory: 'converters', inputStyle: 'fields',
    description: 'Convert between kg, lbs, grams, ounces, tonnes and more.',
    about: 'Convert weight and mass across all metric and imperial units. Supports kilograms, grams, milligrams, metric tonnes, pounds, ounces, stone and US short tons — with real-time conversion as you type.',
    related: ['length-converter', 'volume-calculator', 'temperature-converter'],
  },
  {
    slug: 'temperature-converter', name: 'Temperature Converter',
    category: 'engineering', subcategory: 'converters', inputStyle: 'fields',
    description: 'Convert between Celsius, Fahrenheit, Kelvin and Rankine.',
    about: 'Temperature conversion between the four major scales — Celsius (metric), Fahrenheit (US customary), Kelvin (scientific absolute) and Rankine (engineering). All four values update simultaneously as you type in any field, with key reference temperatures highlighted.',
    related: ['length-converter', 'weight-converter', 'pressure-drop'],
  },
  {
    slug: 'speed-converter', name: 'Speed Converter',
    category: 'engineering', subcategory: 'converters', inputStyle: 'fields',
    description: 'Convert between mph, km/h, m/s, knots and Mach number.',
    about: 'Convert speed across all major units: miles per hour, kilometres per hour, metres per second, feet per second, knots, and Mach number. Useful for aviation, automotive, athletics and physics calculations.',
    related: ['length-converter', 'flow-rate', 'pace-calculator'],
  },

  // ─────────────────────────────────────────
  // MATH — Basic
  // ─────────────────────────────────────────
  {
    slug: 'percentage-calculator', name: 'Percentage Calculator',
    category: 'math', subcategory: 'basic', inputStyle: 'fields',
    description: 'What is X% of Y? X is what % of Y? Percentage change — all three in one.',
    about: 'Percentage calculations come in three forms: finding a percentage of a number, finding what percentage one number is of another, and finding the percentage change between two values. This calculator solves all three types instantly with a clear breakdown of the formula used.',
    related: ['ratio-calculator', 'discount-calculator', 'profit-margin'],
  },
  {
    slug: 'fraction-calculator', name: 'Fraction Calculator',
    category: 'math', subcategory: 'basic', inputStyle: 'fields',
    description: 'Add, subtract, multiply and divide fractions with step-by-step working.',
    about: 'Fraction arithmetic — adding, subtracting, multiplying and dividing — with full step-by-step working shown. Results are automatically simplified to lowest terms and shown as both a proper fraction and a decimal. Supports mixed numbers and negative fractions.',
    related: ['percentage-calculator', 'ratio-calculator', 'average-calculator'],
  },
  {
    slug: 'average-calculator', name: 'Average Calculator',
    category: 'math', subcategory: 'basic', inputStyle: 'fields',
    description: 'Mean, median, mode, range, geometric mean and harmonic mean for any dataset.',
    about: 'Enter any set of numbers and this calculator computes all six measures of central tendency and spread: arithmetic mean (average), median (middle value), mode (most frequent), range (spread), geometric mean (for multiplicative data) and harmonic mean (for rates and ratios).',
    related: ['mean-median-mode', 'standard-deviation', 'percentage-calculator'],
  },
  {
    slug: 'ratio-calculator', name: 'Ratio Calculator',
    category: 'math', subcategory: 'basic', inputStyle: 'fields',
    description: 'Simplify ratios, find missing values and scale ratios up or down.',
    about: 'Ratios describe proportional relationships between quantities. This calculator simplifies ratios to their lowest terms, solves for missing values in proportions (A:B = C:?), and scales ratios to any target value — useful for recipe scaling, map reading, scale models and financial analysis.',
    related: ['percentage-calculator', 'fraction-calculator', 'recipe-converter'],
  },

  // ─────────────────────────────────────────
  // MATH — Algebra
  // ─────────────────────────────────────────
  {
    slug: 'quadratic-solver', name: 'Quadratic Equation Solver',
    category: 'math', subcategory: 'algebra', inputStyle: 'fields',
    description: 'Solve ax² + bx + c = 0 with the quadratic formula, showing all steps.',
    about: 'The quadratic formula solves any second-degree polynomial equation of the form ax²+bx+c=0. This solver computes the discriminant, identifies whether roots are real or complex, and shows the complete step-by-step working using the quadratic formula — perfect for checking homework or understanding the process.',
    related: ['linear-equation', 'polynomial-roots', 'systems-equations'],
  },
  {
    slug: 'linear-equation', name: 'Linear Equation Solver',
    category: 'math', subcategory: 'algebra', inputStyle: 'fields',
    description: 'Solve single and simultaneous linear equations with step-by-step working.',
    about: 'Solve any linear equation of the form ax + b = c for x, with full step-by-step working shown. Also solves systems of two linear equations using substitution and elimination methods. Each step is explained in plain English to help with learning.',
    related: ['quadratic-solver', 'systems-equations', 'percentage-calculator'],
  },

  // ─────────────────────────────────────────
  // MATH — Statistics
  // ─────────────────────────────────────────
  {
    slug: 'mean-median-mode', name: 'Mean Median Mode Calculator',
    category: 'math', subcategory: 'statistics', inputStyle: 'fields',
    description: 'Complete descriptive statistics for any dataset — mean, median, mode and more.',
    about: 'Paste or type any list of numbers to get a complete statistical summary: mean, median, mode, range, variance, standard deviation, quartiles (Q1, Q2, Q3), interquartile range and outlier detection. Results include a frequency distribution table and a visual histogram.',
    related: ['standard-deviation', 'average-calculator', 'probability-calculator'],
  },
  {
    slug: 'standard-deviation', name: 'Standard Deviation Calculator',
    category: 'math', subcategory: 'statistics', inputStyle: 'fields',
    description: 'Population and sample standard deviation and variance for any dataset.',
    about: 'Standard deviation measures the spread of data around the mean. This calculator computes both population standard deviation (σ) for complete datasets and sample standard deviation (s) for sample data — and shows the complete step-by-step variance calculation so you can verify the working.',
    related: ['mean-median-mode', 'normal-distribution', 'average-calculator'],
  },
  {
    slug: 'probability-calculator', name: 'Probability Calculator',
    category: 'math', subcategory: 'statistics', inputStyle: 'fields',
    description: 'Basic probability, conditional probability and Bayes theorem.',
    about: 'Probability is the foundation of statistics, risk analysis and machine learning. This calculator computes basic event probability, union and intersection of events, conditional probability, and applies Bayes theorem — with a clear Venn diagram and plain-English interpretation of results.',
    related: ['standard-deviation', 'permutations', 'combinations'],
  },

  // ─────────────────────────────────────────
  // MATH — Date & Time
  // ─────────────────────────────────────────
  {
    slug: 'date-difference', name: 'Date Difference Calculator',
    category: 'math', subcategory: 'date-time', inputStyle: 'fields',
    description: 'Exact number of days, weeks, months and years between two dates.',
    about: 'Calculate the precise duration between any two dates in multiple units simultaneously: total days, weeks, months, years, and business days (excluding weekends). Optionally exclude custom holidays. Useful for contract durations, project timelines, and tracking anniversaries.',
    related: ['age-calculator', 'add-subtract-days', 'working-days'],
  },
  {
    slug: 'add-subtract-days', name: 'Add / Subtract Days Calculator',
    category: 'math', subcategory: 'date-time', inputStyle: 'fields',
    description: 'Add or subtract any number of days from a date to find the result date.',
    about: 'Find the exact date that results from adding or subtracting a specified number of days, weeks, months or years from any starting date. Automatically identifies the result day of week, handles leap years correctly and can skip weekends and holidays for business day calculations.',
    related: ['date-difference', 'working-days', 'age-calculator'],
  },
  {
    slug: 'working-days', name: 'Working Days Calculator',
    category: 'math', subcategory: 'date-time', inputStyle: 'fields',
    description: 'Business days between two dates, excluding weekends and holidays.',
    about: 'Calculate the number of working days between two dates, excluding weekends and optionally excluding public holidays. Also works in reverse: given a start date and number of working days, find the end date. Useful for contract deadlines, shipping estimates and HR calculations.',
    related: ['date-difference', 'add-subtract-days', 'age-calculator'],
  },

  // ─────────────────────────────────────────
  // MATH — Probability
  // ─────────────────────────────────────────
  {
    slug: 'permutations', name: 'Permutations Calculator',
    category: 'math', subcategory: 'probability', inputStyle: 'fields',
    description: 'Number of ordered arrangements of r items from n items — P(n,r).',
    about: 'Permutations count the number of ways to arrange r items selected from n items when order matters. Formula: P(n,r) = n! / (n-r)!. This calculator handles both permutations (order matters) and combinations (order does not matter) with worked examples.',
    related: ['combinations', 'probability-calculator', 'dice-probability'],
  },
  {
    slug: 'combinations', name: 'Combinations Calculator',
    category: 'math', subcategory: 'probability', inputStyle: 'fields',
    description: 'Number of ways to choose r items from n items — C(n,r).',
    about: 'Combinations count the number of ways to select r items from n items when order does not matter. Formula: C(n,r) = n! / (r! × (n-r)!). Used in lottery probability, card game analysis, statistical sampling and any situation where you need to count distinct groups.',
    related: ['permutations', 'probability-calculator', 'dice-probability'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Everyday
  // ─────────────────────────────────────────
  {
    slug: 'tip-calculator', name: 'Tip Calculator',
    category: 'utilities', subcategory: 'everyday', inputStyle: 'sliders',
    description: 'Calculate tip and split the total bill between any number of people.',
    about: 'Enter your bill amount, choose a tip percentage and split equally among your party. Shows per-person total, total tip amount and the grand total. Also shows custom tip scenarios side by side so you can see the difference between 15%, 18% and 20% at a glance.',
    related: ['split-bill', 'discount-calculator', 'sales-tax'],
  },
  {
    slug: 'split-bill', name: 'Split Bill Calculator',
    category: 'utilities', subcategory: 'everyday', inputStyle: 'fields',
    description: 'Split a restaurant bill unevenly with custom amounts per person plus tip.',
    about: 'Going Dutch fairly is harder than it looks when different people ordered different things. This calculator lets each person enter what they ordered, adds a shared tip percentage, and calculates exactly what each person owes — including their proportional share of any shared items.',
    related: ['tip-calculator', 'discount-calculator', 'percentage-calculator'],
  },
  {
    slug: 'discount-calculator', name: 'Discount Calculator',
    category: 'utilities', subcategory: 'everyday', inputStyle: 'fields',
    description: 'Final price after discount, savings amount, and effective discount percentage.',
    about: 'Instantly calculate the final price after any percentage discount, fixed amount discount or "X for Y" deal. Also works in reverse: given original and sale price, calculate the discount percentage. Shows savings amount prominently so you can see exactly how much you are saving.',
    related: ['percentage-calculator', 'sales-tax', 'profit-margin'],
  },
  {
    slug: 'sales-tax', name: 'Sales Tax Calculator',
    category: 'utilities', subcategory: 'everyday', inputStyle: 'fields',
    description: 'Price before and after sales tax for any tax rate.',
    about: 'Calculate the tax-inclusive price from a pre-tax amount, or strip tax out of a tax-inclusive price to find the original. Supports any tax rate and shows the tax amount separately so you can see exactly how much goes to tax.',
    related: ['discount-calculator', 'vat-calculator', 'percentage-calculator'],
  },
  {
    slug: 'percentage-off', name: 'Percentage Off Calculator',
    category: 'utilities', subcategory: 'everyday', inputStyle: 'fields',
    description: 'Quick % off calculator — original price and final price instantly.',
    about: 'The fastest way to calculate any percentage off. Enter the original price and the discount percentage to get the final price and dollar saving — or enter original and sale price to find the discount percentage. Ideal for quick decisions while shopping.',
    related: ['discount-calculator', 'percentage-calculator', 'sales-tax'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Home & Construction
  // ─────────────────────────────────────────
  {
    slug: 'paint-calculator', name: 'Paint Calculator',
    category: 'utilities', subcategory: 'home', inputStyle: 'fields',
    description: 'Litres of paint needed for any room accounting for doors and windows.',
    about: 'Buying too little paint means an extra trip to the store; buying too much is wasteful. This calculator computes the wall area of your room (accounting for windows and doors), divides by the paint coverage rate, and factors in the number of coats — giving you the exact number of tins to buy.',
    related: ['flooring-calculator', 'tile-calculator', 'wallpaper-calculator'],
  },
  {
    slug: 'flooring-calculator', name: 'Flooring Calculator',
    category: 'utilities', subcategory: 'home', inputStyle: 'fields',
    description: 'Square footage and material needed for any flooring project with waste factor.',
    about: 'Calculate the exact amount of flooring material needed for any room shape — including L-shaped rooms. Adds a customisable waste percentage (typically 5-10%) to account for cuts and offcuts. Shows total square footage, number of boxes needed and estimated cost at your price per unit.',
    related: ['paint-calculator', 'tile-calculator', 'area-calculator'],
  },
  {
    slug: 'tile-calculator', name: 'Tile Calculator',
    category: 'utilities', subcategory: 'home', inputStyle: 'fields',
    description: 'Number of tiles needed for any area with grout spacing and waste.',
    about: 'Enter your room dimensions and tile size to calculate exactly how many tiles you need. Accounts for grout joint width, your preferred waste percentage, and different layout patterns (straight, diagonal). Shows total tiles, boxes, and cost at any price per tile.',
    related: ['flooring-calculator', 'paint-calculator', 'area-calculator'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Food & Cooking
  // ─────────────────────────────────────────
  {
    slug: 'recipe-converter', name: 'Recipe Converter',
    category: 'utilities', subcategory: 'food', inputStyle: 'fields',
    description: 'Scale any recipe up or down to any number of servings.',
    about: 'Scale any recipe from its original serving count to any target number of servings. Handles fractions gracefully — showing results as clean fractions (¾ cup) or mixed numbers (1½ tsp) rather than unwieldy decimals. Works for all units including weight, volume and count.',
    related: ['measurement-converter', 'ratio-calculator', 'cooking-time'],
  },
  {
    slug: 'measurement-converter', name: 'Cooking Measurement Converter',
    category: 'utilities', subcategory: 'food', inputStyle: 'fields',
    description: 'Convert between cups, tablespoons, teaspoons, ml, grams and more.',
    about: 'Cooking measurements differ between US, UK and metric systems — tablespoons are different sizes, cups are not universal, and weighing by grams beats volumetric measures for baking precision. This converter handles all cooking unit conversions including weight-to-volume conversions for common ingredients.',
    related: ['recipe-converter', 'ratio-calculator', 'weight-converter'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Travel & Fuel
  // ─────────────────────────────────────────
  {
    slug: 'fuel-cost', name: 'Fuel Cost Calculator',
    category: 'utilities', subcategory: 'travel', inputStyle: 'fields',
    description: 'Total fuel cost for any road trip based on distance, MPG and fuel price.',
    about: 'Plan your road trip budget with precision. Enter your journey distance, vehicle fuel economy (MPG or L/100km) and current fuel price to see the exact fuel cost. Also shows cost per mile/km and compares two vehicles side by side — useful for choosing which car to take.',
    related: ['mpg-calculator', 'road-trip', 'distance-calculator'],
  },
  {
    slug: 'mpg-calculator', name: 'MPG Calculator',
    category: 'utilities', subcategory: 'travel', inputStyle: 'fields',
    description: 'Calculate your car\'s fuel economy in MPG, L/100km and km/L.',
    about: 'Calculate your actual fuel economy from a real fill-up: enter miles driven and gallons/litres used to get your MPG, L/100km and km/L simultaneously. Compare to EPA ratings and see how your driving conditions affect real-world efficiency.',
    related: ['fuel-cost', 'road-trip', 'emissions-calculator'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Business
  // ─────────────────────────────────────────
  {
    slug: 'profit-margin', name: 'Profit Margin Calculator',
    category: 'utilities', subcategory: 'business', inputStyle: 'fields',
    description: 'Gross profit margin, net margin and markup from cost and revenue.',
    about: 'Profit margin is the percentage of revenue that becomes profit. Gross margin = (Revenue - COGS) / Revenue. Net margin factors in all expenses. Markup is calculated from cost. This calculator computes all three simultaneously and shows the relationship between margin and markup — which are frequently confused.',
    related: ['break-even', 'markup-calculator', 'roi-calculator'],
  },
  {
    slug: 'break-even', name: 'Break-Even Calculator',
    category: 'utilities', subcategory: 'business', inputStyle: 'fields',
    description: 'Break-even point in units and revenue from fixed costs, price and variable costs.',
    about: 'The break-even point is where total revenue equals total costs — no profit, no loss. Formula: BEP = Fixed Costs / (Selling Price - Variable Cost per Unit). This calculator shows your break-even in units and dollars, a visual contribution margin chart, and sensitivity analysis for different price scenarios.',
    related: ['profit-margin', 'markup-calculator', 'roi-calculator'],
  },
  {
    slug: 'markup-calculator', name: 'Markup Calculator',
    category: 'utilities', subcategory: 'business', inputStyle: 'fields',
    description: 'Selling price, markup percentage and profit from cost price.',
    about: 'Markup is the amount added to cost price to arrive at selling price, expressed as a percentage of cost (unlike margin, which is a percentage of selling price). Enter any two values and this calculator solves for the third — with a clear comparison showing the difference between markup % and margin %.',
    related: ['profit-margin', 'break-even', 'discount-calculator'],
  },
  {
    slug: 'vat-calculator', name: 'VAT Calculator',
    category: 'utilities', subcategory: 'business', inputStyle: 'fields',
    description: 'Add or remove VAT from any price at any VAT rate.',
    about: 'VAT (Value Added Tax) is applied at different rates in different countries. This calculator adds VAT to a net price to give the gross price, or removes VAT from a gross price to reveal the net price — with the VAT amount shown separately. Supports any VAT rate from 0% to 100%.',
    related: ['sales-tax', 'profit-margin', 'discount-calculator'],
  },

  // ─────────────────────────────────────────
  // UTILITIES — Currency & Area
  // ─────────────────────────────────────────
  {
    slug: 'area-calculator', name: 'Area Calculator',
    category: 'utilities', subcategory: 'currency', inputStyle: 'fields',
    description: 'Area of rectangles, circles, triangles, trapezoids and irregular shapes.',
    about: 'Calculate the area of any common 2D shape: rectangle, square, circle, triangle, trapezoid, parallelogram and ellipse. All formulas are shown alongside the result so you can verify the calculation. Supports metric (m², cm²) and imperial (ft², in²) units with automatic conversion.',
    related: ['flooring-calculator', 'tile-calculator', 'volume-calculator'],
  },
  {
    slug: 'volume-calculator', name: 'Volume Calculator',
    category: 'utilities', subcategory: 'currency', inputStyle: 'fields',
    description: 'Volume of cubes, spheres, cylinders, cones and more.',
    about: 'Calculate the volume of any common 3D shape: cube, rectangular prism, sphere, cylinder, cone, pyramid and frustum. Includes both the formula and worked calculation for each shape, with metric and imperial unit support.',
    related: ['area-calculator', 'tile-calculator', 'weight-converter'],
  },

]

// Helper — get a calculator by slug
export function getCalculatorBySlug(slug) {
  return calculators.find(c => c.slug === slug) || null
}

// Helper — get all calculators for a category
export function getCalculatorsByCategory(categorySlug) {
  return calculators.filter(c => c.category === categorySlug)
}

// Helper — get all calculators for a subcategory
export function getCalculatorsBySubcategory(categorySlug, subcategorySlug) {
  return calculators.filter(c => c.category === categorySlug && c.subcategory === subcategorySlug)
}

// Helper — get related calculators for a calculator
export function getRelatedCalculators(slug) {
  const calc = getCalculatorBySlug(slug)
  if (!calc) return []
  return calc.related.map(s => getCalculatorBySlug(s)).filter(Boolean)
}
