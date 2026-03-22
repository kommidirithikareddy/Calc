/**
 * CalcShell — the 2-column layout wrapper used by every calculator
 *
 * <CalcShell
 *   left={<inputs section />}
 *   right={<results section />}
 * />
 */
export default function CalcShell({ left, right }) {
  return (
    <>
      <div className="calc-shell">
        <div className="calc-shell-left">{left}</div>
        <div className="calc-shell-right">{right}</div>
      </div>

      <style>{`
        .calc-shell {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .calc-shell-left {
          padding: 24px;
          border-right: 0.5px solid var(--border);
        }

        .calc-shell-right {
          padding: 20px;
          background: var(--bg-raised);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 800px) {
          .calc-shell {
            grid-template-columns: 1fr;
          }
          .calc-shell-left {
            border-right: none;
            border-bottom: 0.5px solid var(--border);
          }
        }
      `}</style>
    </>
  )
}
