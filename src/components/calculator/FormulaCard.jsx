import { useState } from 'react'

/**
 * FormulaCard
 * Props:
 *   formula      {string}   e.g. "A = P(1 + r/n)^(nt)"
 *   explanation  {string}   plain-English explanation
 *   variables    {Array<{symbol, meaning}>}  optional variable legend
 */
export default function FormulaCard({ formula, explanation, variables }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="formula-card">
        <button className="fc-toggle" onClick={() => setOpen(o => !o)}>
          <span className="fc-toggle-left">
            <span className="fc-icon">📐</span>
            Formula &amp; How It Works
          </span>
          <svg
            className={`fc-chevron ${open ? 'open' : ''}`}
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div className="fc-body">
            {/* Formula */}
            <div className="fc-formula">{formula}</div>

            {/* Variable legend */}
            {variables?.length > 0 && (
              <div className="fc-vars">
                {variables.map(v => (
                  <span key={v.symbol} className="fc-var">
                    <strong>{v.symbol}</strong> = {v.meaning}
                  </span>
                ))}
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <p className="fc-explanation">{explanation}</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .formula-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 18px;
        }
        .fc-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          transition: background 0.1s;
        }
        .fc-toggle:hover { background: var(--bg-raised); }
        .fc-toggle-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .fc-icon { font-size: 15px; }
        .fc-chevron {
          color: var(--text-3);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .fc-chevron.open { transform: rotate(180deg); }

        .fc-body {
          padding: 14px 16px;
          border-top: 0.5px solid var(--border);
          animation: fadeUp 0.2s ease both;
        }
        .fc-formula {
          font-family: monospace;
          font-size: 13px;
          color: var(--text);
          background: var(--bg-raised);
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 12px;
          line-height: 1.8;
          border: 0.5px solid var(--border);
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .fc-vars {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .fc-var {
          font-size: 10px;
          color: var(--text-2);
          background: var(--bg-raised);
          border-radius: 6px;
          padding: 3px 9px;
          border: 0.5px solid var(--border);
        }
        .fc-var strong { color: #6366f1; }
        .fc-explanation {
          font-size: 12px;
          color: var(--text-2);
          line-height: 1.75;
          margin: 0;
        }
      `}</style>
    </>
  )
}
