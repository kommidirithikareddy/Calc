import React, { useState } from 'react';

// --- HELPERS ---
const fmt = n => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString();

// --- REPLACEMENT COMPONENTS (Building the missing imports) ---
const Card = ({ children, style }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    ...style
  }}>{children}</div>
);

const Section = ({ title, sub, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ padding: '13px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{title}</span>
      {sub && <span style={{ fontSize: 11, color: '#64748b' }}>{sub}</span>}
    </div>
    <div style={{ padding: '16px 18px' }}>{children}</div>
  </div>
);

const InputField = ({ label, value, onChange, color, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{label}</label>
      {hint && <span style={{ fontSize: 10, color: '#64748b' }}>{hint}</span>}
    </div>
    <input 
      type="number" 
      value={value} 
      onChange={e => onChange(Number(e.target.value))} 
      style={{
        width: '100%', height: 44, border: `1.5px solid #e2e8f0`, borderRadius: 9,
        padding: '0 14px', fontSize: 17, fontWeight: 700, color: '#1e293b', outline: 'none', boxSizing: 'border-box'
      }}
    />
  </div>
);

// --- CALCULATION LOGIC ---
const FUNCTIONS = [
  { id: 'poly', label: 'Polynomial', icon: 'xⁿ', f: (x, a, n, c) => a * Math.pow(x, n) + c, fStr: (a, n, c) => `${a}x^${n}+${c}` },
  { id: 'sinc', label: 'sin(x)/x', icon: 'sinc', f: (x) => x === 0 ? 1 : Math.sin(x) / x, fStr: () => `sin(x)/x` },
  { id: 'exp', label: '(eˣ−1)/x', icon: 'eˣ', f: (x) => x === 0 ? 1 : (Math.exp(x) - 1) / x, fStr: () => `(eˣ−1)/x` },
  { id: 'rational', label: 'Rational', icon: 'p/q', f: (x, a) => { const den = x - a; return Math.abs(den) < 1e-10 ? (2 * a) : (x * x - a * a) / den }, fStr: (a) => `(x²−${a}²)/(x−${a})` },
];

export default function LimitCalculator() {
  const [fnId, setFnId] = useState('poly');
  const [a, setA] = useState(2);
  const [n, setN] = useState(2);
  const [c, setC] = useState(3);
  const [point, setPoint] = useState(2);
  
  const themeColor = '#6366f1';
  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0];

  // Logic for limits
  const eps = [0.1, 0.01, 0.001, 0.0001];
  const leftLimit = fn.f(point - 0.00001, a, n, c);
  const rightLimit = fn.f(point + 0.00001, a, n, c);
  const limitVal = fn.f(point, a, n, c);
  const limitsMatch = Math.abs(leftLimit - rightLimit) < 0.001;
  const fDisplay = fn.fStr(a, n, c);

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', color: '#334155', padding: '20px' }}>
      
      {/* Visual Header */}
      <div style={{ background: `${themeColor}10`, border: `1px solid ${themeColor}30`, borderRadius: 14, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: themeColor, textTransform: 'uppercase', marginBottom: 4 }}>Limit Result</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>lim(x→{point}) [{fDisplay}]</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: limitsMatch ? themeColor : '#ef4444' }}>
            {limitsMatch ? fmt(limitVal) : 'DNE'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{limitsMatch ? 'Limit exists' : 'Does not exist'}</div>
        </div>
      </div>

      {/* Function Selection */}
      <Section title="Select Function Type">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {FUNCTIONS.map(f => (
            <button key={f.id} onClick={() => setFnId(f.id)} style={{
              padding: '12px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${fnId === f.id ? themeColor : '#e2e8f0'}`,
              background: fnId === f.id ? `${themeColor}10` : '#fff',
              color: fnId === f.id ? themeColor : '#475569', fontWeight: 700
            }}>
              <div style={{ fontSize: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 10 }}>{f.label}</div>
            </button>
          ))}
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Input Column */}
        <div>
          <Section title="Parameters">
            {fnId === 'poly' && (
              <>
                <InputField label="Coefficient (a)" value={a} onChange={setA} />
                <InputField label="Power (n)" value={n} onChange={setN} />
                <InputField label="Constant (c)" value={c} onChange={setC} />
              </>
            )}
            {fnId === 'rational' && <InputField label="Hole at x =" value={a} onChange={setA} />}
            <InputField label="Approach Point (x→?)" value={point} onChange={setPoint} hint="The target value" />
          </Section>
          
          <Card style={{ borderLeft: `4px solid ${themeColor}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Left vs Right Limit</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ color: '#64748b' }}>x → {point}⁻</small>
                <div style={{ fontWeight: 700 }}>{fmt(leftLimit)}</div>
              </div>
              <div style={{ fontSize: 20, color: limitsMatch ? '#10b981' : '#ef4444' }}>{limitsMatch ? '=' : '≠'}</div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: '#64748b' }}>x → {point}⁺</small>
                <div style={{ fontWeight: 700 }}>{fmt(rightLimit)}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Column */}
        <div>
          <Section title="Approach Table" sub="Numerical Approximation">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Distance (ε)</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>f({point}-ε)</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>f({point}+ε)</th>
                </tr>
              </thead>
              <tbody>
                {eps.map(e => (
                  <tr key={e} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', color: '#94a3b8' }}>{e}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: themeColor }}>{fmt(fn.f(point - e, a, n, c))}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: themeColor }}>{fmt(fn.f(point + e, a, n, c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Card style={{ background: '#f8fafc' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Note</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
              The limit is <strong>{limitsMatch ? fmt(limitVal) : 'Undefined'}</strong>. 
              {fnId === 'rational' && ` Note how the rational function has a hole at ${a}, but the limit still exists by factoring.`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}