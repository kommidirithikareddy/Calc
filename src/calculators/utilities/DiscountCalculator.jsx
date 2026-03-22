import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt2 = n => '$' + Math.max(0,n).toFixed(2)
const PRESETS = [5,10,15,20,25,30,40,50]

export default function DiscountCalculator() {
  const [original, setOriginal] = useState(120)
  const [discount, setDiscount] = useState(20)

  const saving    = original * discount / 100
  const finalPrice = original - saving

  // Reverse: what % off is the sale price?
  const [salePrice, setSalePrice] = useState('')
  const impliedDiscount = original > 0 && salePrice ? ((original - +salePrice) / original * 100) : null

  const hint = `${discount}% off ${fmt2(original)} saves you ${fmt2(saving)}, bringing the price down to ${fmt2(finalPrice)}. That's ${(saving/original*100).toFixed(0)}% savings on the original price.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Discount Details</div>

          <SliderInput label="Original Price" hint="Before discount" value={original} min={1} max={10000} step={1} prefix="$" onChange={setOriginal} />

          {/* Discount with presets */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '9px' }}>Discount Percentage</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {PRESETS.map(p => (
                <button key={p} onClick={() => setDiscount(p)} style={{
                  padding: '5px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                  border: '1.5px solid', borderColor: discount===p ? '#ec4899' : 'var(--border)',
                  background: discount===p ? '#ec4899' : 'var(--bg-raised)',
                  color: discount===p ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'DM Sans',
                }}>{p}%</button>
              ))}
            </div>
            <SliderInput label="" value={discount} min={0} max={100} step={0.5} suffix="%" onChange={setDiscount} />
          </div>

          {/* Reverse calculator */}
          <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
              🔄 Reverse — What % off is a sale price?
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600 }}>$</span>
              <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Sale price"
                style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', maxWidth: '130px' }} />
              {impliedDiscount !== null && (
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ec4899', fontFamily: 'Syne, sans-serif' }}>
                  = {impliedDiscount.toFixed(1)}% off
                </span>
              )}
            </div>
          </div>
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Final Price" value={Math.round(finalPrice * 100) / 100} formatter={fmt2} sub={`You save ${fmt2(saving)} (${discount}% off)`} color="#ec4899" />

          <BreakdownTable title="Price Breakdown" rows={[
            { label: 'Original Price',  value: fmt2(original) },
            { label: `Discount (${discount}%)`, value: '−' + fmt2(saving), color: '#ec4899' },
            { label: 'Final Price',     value: fmt2(finalPrice), color: '#ec4899', bold: true, highlight: true },
            { label: 'You Save',        value: fmt2(saving),     color: '#10b981' },
          ]} />

          {/* Quick comparison table */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '11px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>Quick Comparison</div>
            {PRESETS.map(p => {
              const s = original * p / 100
              const f = original - s
              return (
                <div key={p} onClick={() => setDiscount(p)} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 14px',
                  borderBottom: '0.5px solid var(--border)', cursor: 'pointer',
                  background: discount===p ? '#fce7f3' : undefined,
                }}>
                  <span style={{ fontSize: '11px', color: discount===p ? '#db2777' : 'var(--text-2)', fontWeight: discount===p ? 700 : 400 }}>{p}% off</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: discount===p ? '#db2777' : 'var(--text)' }}>{fmt2(f)}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: '8px' }}>save {fmt2(s)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
