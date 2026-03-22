/**
 * BreakdownTable
 * Props:
 *   title  {string}
 *   rows   {Array<{ label, value, color?, bold?, highlight? }>}
 */
export default function BreakdownTable({ title = 'Breakdown', rows = [] }) {
  return (
    <>
      <div className="bkt">
        {title && <div className="bkt-title">{title}</div>}
        <div className="bkt-body">
          {rows.map((row, i) => (
            <div key={i} className={`bkt-row ${row.highlight ? 'highlight' : ''}`}>
              <span className="bkt-label">
                {row.color && (
                  <span className="bkt-dot" style={{ background: row.color }} />
                )}
                {row.label}
              </span>
              <span className="bkt-value" style={{ color: row.color || 'var(--text)', fontWeight: row.bold ? 700 : 600, fontSize: row.highlight ? '15px' : undefined }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .bkt {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .bkt-title {
          padding: 11px 14px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          border-bottom: 0.5px solid var(--border);
        }
        .bkt-body {}
        .bkt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          transition: background 0.1s;
        }
        .bkt-row:last-child { border-bottom: none; }
        .bkt-row.highlight { background: var(--bg-raised); }
        .bkt-label {
          font-size: 11px;
          color: var(--text-2);
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .bkt-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bkt-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }
      `}</style>
    </>
  )
}
