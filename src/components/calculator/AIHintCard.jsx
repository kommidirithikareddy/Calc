/**
 * AIHintCard — shown below result after calculation
 * Props:
 *   hint     {string}  the AI-generated tip text
 *   onAskAI  {function} opens the chat panel
 */
export default function AIHintCard({ hint, onAskAI }) {
  if (!hint) return null

  return (
    <>
      <div className="ai-hint-card">
        <div className="ahc-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div className="ahc-text">{hint}</div>
        {onAskAI && (
          <button className="ahc-btn" onClick={onAskAI}>
            Ask AI →
          </button>
        )}
      </div>

      <style>{`
        .ai-hint-card {
          background: var(--accent-light);
          border: 1px solid var(--accent-mid);
          border-radius: 11px;
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          animation: fadeUp 0.4s ease both;
        }
        .ahc-icon {
          width: 28px;
          height: 28px;
          background: #6366f1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ahc-text {
          flex: 1;
          font-size: 11px;
          color: var(--accent);
          line-height: 1.65;
        }
        .ahc-btn {
          font-size: 10px;
          font-weight: 700;
          color: #6366f1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
          padding: 0;
          transition: opacity 0.1s;
        }
        .ahc-btn:hover { opacity: 0.7; }
      `}</style>
    </>
  )
}
