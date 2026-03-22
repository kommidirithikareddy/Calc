import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SHORTCUTS = [
  { label: 'Compound Interest', path: '/finance/investment/compound-interest' },
  { label: 'BMI',               path: '/health/body-metrics/bmi-calculator' },
  { label: 'Tip Calculator',    path: '/utilities/everyday/tip-calculator' },
  { label: 'Mortgage',          path: '/finance/mortgage/mortgage-calculator' },
]

export default function QuickCalculator() {
  const navigate = useNavigate()
  const [display, setDisplay] = useState('0')
  const [expr, setExpr]       = useState('')
  const [prev, setPrev]       = useState(null)
  const [op, setOp]           = useState(null)
  const [fresh, setFresh]     = useState(true)

  function fmt(n) {
    if (isNaN(n) || !isFinite(n)) return 'Error'
    const s = parseFloat(n.toFixed(10)).toString()
    return s.length > 12 ? parseFloat(n.toExponential(4)).toString() : s
  }

  function compute(a, b, operator) {
    switch (operator) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : NaN
      default:  return b
    }
  }

  function pressNum(val) {
    if (fresh) {
      setDisplay(val === '.' ? '0.' : val)
      setFresh(false)
    } else {
      if (val === '.' && display.includes('.')) return
      setDisplay(display === '0' && val !== '.' ? val : display + val)
    }
  }

  function pressOp(operator) {
    const cur = parseFloat(display)
    if (op && !fresh) {
      const result = compute(parseFloat(prev), cur, op)
      setDisplay(fmt(result))
      setPrev(fmt(result))
      setExpr(fmt(result) + ' ' + operator)
    } else {
      setPrev(display)
      setExpr(display + ' ' + operator)
    }
    setOp(operator)
    setFresh(true)
  }

  function pressEquals() {
    if (!op) return
    const result = compute(parseFloat(prev), parseFloat(display), op)
    setExpr(prev + ' ' + op + ' ' + display + ' =')
    setDisplay(fmt(result))
    setOp(null)
    setPrev(null)
    setFresh(true)
  }

  function pressClear() {
    setDisplay('0')
    setExpr('')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  function pressPlusMinus() { setDisplay(fmt(parseFloat(display) * -1)) }
  function pressPercent()   { setDisplay(fmt(parseFloat(display) / 100)) }

  const buttons = [
    { label: 'AC',  type: 'ac',  action: pressClear },
    { label: '+/−', type: 'op',  action: pressPlusMinus },
    { label: '%',   type: 'op',  action: pressPercent },
    { label: '÷',   type: 'op',  action: () => pressOp('÷') },
    { label: '7',   type: 'num', action: () => pressNum('7') },
    { label: '8',   type: 'num', action: () => pressNum('8') },
    { label: '9',   type: 'num', action: () => pressNum('9') },
    { label: '×',   type: 'op',  action: () => pressOp('×') },
    { label: '4',   type: 'num', action: () => pressNum('4') },
    { label: '5',   type: 'num', action: () => pressNum('5') },
    { label: '6',   type: 'num', action: () => pressNum('6') },
    { label: '−',   type: 'op',  action: () => pressOp('−') },
    { label: '1',   type: 'num', action: () => pressNum('1') },
    { label: '2',   type: 'num', action: () => pressNum('2') },
    { label: '3',   type: 'num', action: () => pressNum('3') },
    { label: '+',   type: 'op',  action: () => pressOp('+') },
    { label: '0',   type: 'num', action: () => pressNum('0'), wide: true },
    { label: '.',   type: 'num', action: () => pressNum('.') },
    { label: '=',   type: 'eq',  action: pressEquals },
  ]

  return (
    <>
      <div className="qc-wrap">
        {/* Header */}
        <div className="qc-header">
          <span className="qc-title">Quick Calculator</span>
          <span className="qc-subtitle">Always here</span>
        </div>

        {/* Display */}
        <div className="qc-display">
          <div className="qc-expr">{expr || '\u00A0'}</div>
          <div className="qc-value">{display}</div>
        </div>

        {/* Buttons */}
        <div className="qc-buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={`qc-btn qc-btn--${btn.type} ${btn.wide ? 'qc-btn--wide' : ''}`}
              onClick={btn.action}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="qc-shortcuts">
          {SHORTCUTS.map(s => (
            <button
              key={s.label}
              className="qc-shortcut"
              onClick={() => navigate(s.path)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .qc-wrap {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          width: 100%;
          max-width: 300px;
        }

        .qc-header {
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          padding: 11px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .qc-title    { font-size: 12px; font-weight: 600; color: var(--text); }
        .qc-subtitle { font-size: 10px; color: var(--text-3); }

        /* Display */
        .qc-display {
          background: #1e293b;
          padding: 12px 16px;
          text-align: right;
          min-height: 64px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .qc-expr  { font-size: 10px; color: #64748b; font-family: monospace; min-height: 14px; }
        .qc-value { font-size: 26px; font-weight: 800; color: #fff; font-family: monospace; letter-spacing: -1px; line-height: 1.1; }

        /* Button grid */
        .qc-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          padding: 10px;
          background: var(--bg-card);
        }

        .qc-btn {
          border: none;
          border-radius: 9px;
          padding: 11px 4px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.1s, transform 0.08s;
          width: 100%;
        }
        .qc-btn:active { opacity: 0.75; transform: scale(0.95); }
        .qc-btn--wide  { grid-column: span 2; }

        /* Num — light grey, dark text — same in light AND dark mode */
        .qc-btn--num {
          background: #f1f5f9;
          color: #111827;
          border: 0.5px solid #e2e8f0;
        }
        .qc-btn--num:hover { background: #e2e8f0; }

        /* Op — light indigo tint */
        .qc-btn--op {
          background: #e0e7ff;
          color: #4338ca;
        }
        .qc-btn--op:hover { background: #c7d2fe; }

        /* AC — light red */
        .qc-btn--ac {
          background: #fee2e2;
          color: #dc2626;
        }
        .qc-btn--ac:hover { background: #fecaca; }

        /* Equals — solid indigo */
        .qc-btn--eq {
          background: #6366f1;
          color: #fff;
          font-size: 18px;
        }
        .qc-btn--eq:hover { background: #4f46e5; }

        /* Shortcuts */
        .qc-shortcuts {
          padding: 8px 10px 10px;
          border-top: 0.5px solid var(--border);
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          background: var(--bg-card);
        }
        .qc-shortcut {
          font-size: 9px;
          font-weight: 500;
          background: var(--bg-raised);
          color: #6366f1;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 3px 9px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.12s;
        }
        .qc-shortcut:hover {
          background: #e0e7ff;
          border-color: #6366f1;
        }
      `}</style>
    </>
  )
}
