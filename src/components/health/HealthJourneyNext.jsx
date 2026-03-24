export default function HealthJourneyNext({ catColor = '#22a355', intro, items = [] }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '13px 18px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
          Continue your health journey
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          Each calculator builds on the last
        </span>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {intro && (
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
            {intro}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => window.location.href = item.path}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '13px 16px', borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-raised)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all .15s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '12' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: catColor + '15', border: `1px solid ${catColor}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '15', padding: '2px 9px', borderRadius: 10 }}>
                  Step {i + 2}
                </span>
                <span style={{ fontSize: 16, color: catColor }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
