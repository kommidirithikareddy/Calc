import React, { useState } from 'react';

// Helper for formatting numbers
const fmt = (n) => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(4)).toString();

// --- Internal UI Components (Replacing the missing imports) ---
const Card = ({ children, style }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ...style
  }}>{children}</div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>{title}</h3>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, color }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: `2px solid #e2e8f0`,
        fontSize: '16px',
        outline: 'none'
      }}
    />
  </div>
);

// --- Calculation Logic ---
const FUNCTIONS = [
  {
    id: 'poly2',
    label: 'ax² + by²',
    f: (x, y, a, b) => a * x * x + b * y * y,
    dfx: (x, y, a, b) => 2 * a * x,
    dfy: (x, y, a, b) => 2 * b * y,
    fStr: (a, b) => `${a}x² + ${b}y²`,
    dfxStr: (a, b) => `${2 * a}x`,
    dfyStr: (a, b) => `${2 * b}y`,
  },
  {
    id: 'xy',
    label: 'axy + bx',
    f: (x, y, a, b) => a * x * y + b * x,
    dfx: (x, y, a, b) => a * y + b,
    dfy: (x, y, a, b) => a * x,
    fStr: (a, b) => `${a}xy + ${b}x`,
    dfxStr: (a, b) => `${a}y + ${b}`,
    dfyStr: (a, b) => `${a}x`,
  },
  {
    id: 'sincos',
    label: 'sin(x)cos(y)',
    f: (x, y) => Math.sin(x) * Math.cos(y),
    dfx: (x, y) => Math.cos(x) * Math.cos(y),
    dfy: (x, y) => -Math.sin(x) * Math.sin(y),
    fStr: () => 'sin(x)cos(y)',
    dfxStr: () => 'cos(x)cos(y)',
    dfyStr: () => '-sin(x)sin(y)',
  }
];

export default function PartialDerivativeCalculator() {
  const [fnId, setFnId] = useState('poly2');
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [x, setX] = useState(2);
  const [y, setY] = useState(1);

  const themeColor = '#6366f1';
  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0];
  
  const fVal = fn.f(x, y, a, b);
  const dfx = fn.dfx(x, y, a, b);
  const dfy = fn.dfy(x, y, a, b);
  const gradMag = Math.sqrt(dfx * dfx + dfy * dfy);

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif', color: '#334155', padding: '0 20px' }}>
      
      {/* Header Summary */}
      <div style={{ background: `${themeColor}10`, border: `1px solid ${themeColor}30`, borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase' }}>Results at ({x}, {y})</div>
          <h2 style={{ margin: '8px 0', fontSize: '24px' }}>f(x,y) = {fn.fStr(a, b)}</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>∂f/∂x</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: themeColor }}>{fmt(dfx)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>∂f/∂y</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{fmt(dfy)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Controls */}
        <div>
          <Section title="1. Select Function">
            <div style={{ display: 'flex', gap: '8px' }}>
              {FUNCTIONS.map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setFnId(f.id)}
                  style={{
                    flex: 1, padding: '10px', cursor: 'pointer', borderRadius: '8px',
                    border: `2px solid ${fnId === f.id ? themeColor : '#e2e8f0'}`,
                    background: fnId === f.id ? `${themeColor}10` : '#fff',
                    fontWeight: 'bold', color: fnId === f.id ? themeColor : '#64748b'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="2. Parameters & Coordinates">
            <Card>
              {fnId !== 'sincos' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <InputField label="Coef. a" value={a} onChange={setA} />
                  <InputField label="Coef. b" value={b} onChange={setB} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <InputField label="x point" value={x} onChange={setX} />
                <InputField label="y point" value={y} onChange={setY} />
              </div>
            </Card>
          </Section>
        </div>

        {/* Right Column: Analysis */}
        <div>
          <Section title="Mathematical Breakdown">
            <Card>
              <div style={{ marginBottom: '10px' }}><strong>Function:</strong> {fn.fStr(a, b)}</div>
              <div style={{ marginBottom: '10px', color: themeColor }}><strong>∂f/∂x:</strong> {fn.dfxStr(a, b)}</div>
              <div style={{ marginBottom: '10px', color: '#10b981' }}><strong>∂f/∂y:</strong> {fn.dfyStr(a, b)}</div>
              <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
              <div><strong>Gradient Vector ∇f:</strong> ({fmt(dfx)}, {fmt(dfy)})</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Magnitude: {fmt(gradMag)}</div>
            </Card>
          </Section>

          <Section title="Gradient Visualizer (2D Projection)">
            <Card style={{ textAlign: 'center', background: '#f8fafc' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Axes */}
                <line x1="0" y1="100" x2="200" y2="100" stroke="#cbd5e1" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="#cbd5e1" />
                {/* Vector Arrows */}
                <line x1="100" y1="100" x2={100 + dfx * 10} y2="100" stroke={themeColor} strokeWidth="3" markerEnd="url(#arrowhead)" />
                <line x1="100" y1="100" x2="100" y2={100 - dfy * 10} stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
                <circle cx="100" cy="100" r="4" fill="#1e293b" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                  </marker>
                </defs>
              </svg>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Blue: x-change | Green: y-change</div>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}