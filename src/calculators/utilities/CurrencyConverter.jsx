import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// Static approximate rates vs USD (for reference only — not live rates)
const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',         rate: 1 },
  { code: 'EUR', symbol: '€',  name: 'Euro',              rate: 0.92 },
  { code: 'GBP', symbol: '£',  name: 'British Pound',     rate: 0.79 },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',      rate: 149.5 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',   rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',       rate: 0.89 },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',      rate: 7.24 },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',      rate: 83.2 },
  { code: 'MXN', symbol: '$',  name: 'Mexican Peso',      rate: 17.1 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',    rate: 4.97 },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',  rate: 1325 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',  rate: 1.34 },
  { code: 'HKD', symbol: 'HK$',name: 'Hong Kong Dollar',  rate: 7.82 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone',   rate: 10.5 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona',     rate: 10.4 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone',      rate: 6.89 },
  { code: 'NZD', symbol: 'NZ$',name: 'New Zealand Dollar',rate: 1.63 },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand',rate: 18.6 },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham',        rate: 3.67 },
]

const FAQ = [
  { q: 'Are these exchange rates up to date?', a: 'The rates in this calculator are approximate reference rates for educational purposes. Real exchange rates fluctuate continuously with currency markets. For live rates, check a bank, XE.com, or Google. When making real financial transactions, always use current rates from your bank or broker.' },
  { q: 'What is the spread, and why does my bank give a worse rate?', a: 'The spread is the difference between the buy and sell rate — it is the bank\'s profit. Banks and exchange booths typically add 2–5% above the mid-market rate. Credit cards often offer better rates (close to mid-market) plus a 1–3% foreign transaction fee. Airport exchanges are usually the worst.' },
  { q: 'What is PPP (Purchasing Power Parity)?', a: 'PPP is an economic concept showing what exchange rates would be if currencies were adjusted so that identical goods cost the same everywhere. A Big Mac in Switzerland costs more USD equivalent than in India — PPP tries to account for this. PPP rates differ significantly from market exchange rates.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function CurrencyConverter({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [amount, setAmount] = useState(100)
  const [fromCode, setFromCode] = useState('USD')
  const [toCode, setToCode] = useState('EUR')
  const [multiMode, setMultiMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const fromCurr = CURRENCIES.find(c => c.code === fromCode)
  const toCurr   = CURRENCIES.find(c => c.code === toCode)

  // Convert: amount in fromCode → USD → toCode
  const inUSD = amount / (fromCurr?.rate || 1)
  const converted = inUSD * (toCurr?.rate || 1)
  const rate = fromCurr && toCurr ? toCurr.rate / fromCurr.rate : 1

  const multiResults = multiMode ? CURRENCIES.filter(c => c.code !== fromCode).map(c => ({
    ...c,
    value: inUSD * c.rate,
  })) : []

  const hint = `${amount} ${fromCode} = ${converted.toFixed(2)} ${toCode} (rate: 1 ${fromCode} = ${rate.toFixed(4)} ${toCode}).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Currency Converter</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>1 {fromCode} = {rate.toFixed(4)} {toCode}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Reference rates only — not live market data</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{converted.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{toCode}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>From</label>
              <select value={fromCode} onChange={e => setFromCode(e.target.value)}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 10px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <button onClick={() => { setFromCode(toCode); setToCode(fromCode) }}
              style={{ height: 44, marginTop: 18, padding: '0 12px', borderRadius: 8, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 16, cursor: 'pointer' }}>⇄</button>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>To</label>
              <select value={toCode} onChange={e => setToCode(e.target.value)}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 10px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <button onClick={() => setMultiMode(!multiMode)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${multiMode ? C : 'var(--border-2)'}`, background: multiMode ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${multiMode ? C : 'var(--border-2)'}`, background: multiMode ? C : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {multiMode && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Show all currencies at once</span>
            </button>
          </div>
        </>}
        right={<>
          {!multiMode ? (
            <>
              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Conversion</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{converted.toFixed(2)}</div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>{toCurr?.name}</div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)' }}>
                  1 {fromCode} = {rate.toFixed(4)} {toCode}
                  <br />
                  1 {toCode} = {(1 / rate).toFixed(4)} {fromCode}
                </div>
              </div>
              <BreakdownTable title="Summary" rows={[
                { label: `${amount} ${fromCode}`, value: `${fromCurr?.symbol}${amount}` },
                { label: `= in ${toCode}`, value: `${toCurr?.symbol}${converted.toFixed(2)}`, bold: true, highlight: true, color: C },
                { label: 'Exchange rate', value: `${rate.toFixed(4)}` },
              ]} />
            </>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{amount} {fromCode} in all currencies</div>
              {multiResults.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{c.code}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.name}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{c.symbol}{c.value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
