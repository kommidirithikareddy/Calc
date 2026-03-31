import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How much extra tile should I buy?', a: '10% extra is standard for straight-lay patterns. Use 15% for diagonal and 20% for herringbone or intricate patterns. Always keep spare tiles from the same batch for future repairs — tiles are discontinued frequently.' },
  { q: 'What grout spacing should I use?', a: 'For floor tiles, 3/16" to 1/4" joints are common. For wall tiles, 1/8" is typical. Larger tiles need wider joints to accommodate slight variations in size. The grout joint width affects how many tiles fit in a given area.' },
  { q: 'Do I measure in square feet or count tiles?', a: 'Always calculate in square feet first, then convert to tile count based on tile size. This avoids mistakes from mismatched units and makes it easy to compare tile options by cost.' },
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

export default function TileCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [roomL, setRoomL] = useState(10)
  const [roomW, setRoomW] = useState(8)
  const [tileL, setTileL] = useState(12)
  const [tileW, setTileW] = useState(12)
  const [tileUnit, setTileUnit] = useState('in')
  const [waste, setWaste] = useState(10)
  const [pricePerTile, setPricePerTile] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const tileLFt = tileUnit === 'in' ? tileL / 12 : tileUnit === 'cm' ? tileL / 30.48 : tileL
  const tileWFt = tileUnit === 'in' ? tileW / 12 : tileUnit === 'cm' ? tileW / 30.48 : tileW
  const roomArea = roomL * roomW
  const tileArea = tileLFt * tileWFt
  const tilesNeeded = tileArea > 0 ? Math.ceil(roomArea / tileArea * (1 + waste / 100)) : 0
  const cost = pricePerTile ? tilesNeeded * parseFloat(pricePerTile) : null

  const hint = `Room ${roomL}×${roomW} ft = ${roomArea} sq ft. Tile ${tileL}×${tileW} ${tileUnit}. Need ${tilesNeeded} tiles (+${waste}% waste).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Tile Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Tiles = (Room area ÷ Tile area) × (1 + Waste%)</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{tilesNeeded} tiles</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Room dimensions (ft)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Length', roomL, setRoomL], ['Width', roomW, setRoomW]].map(([l, v, set]) => (
                <div key={l}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l} (ft)</label>
                  <input type="number" value={v} onChange={e => set(+e.target.value)}
                    style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Tile size</label>
              <select value={tileUnit} onChange={e => setTileUnit(e.target.value)}
                style={{ height: 30, border: '1px solid var(--border-2)', borderRadius: 6, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }}>
                <option value="in">inches</option>
                <option value="cm">centimetres</option>
                <option value="ft">feet</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Length', tileL, setTileL], ['Width', tileW, setTileW]].map(([l, v, set]) => (
                <div key={l}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l} ({tileUnit})</label>
                  <input type="number" value={v} onChange={e => set(+e.target.value)}
                    style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Waste %</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[5, 10, 15, 20].map(p => (
                <button key={p} onClick={() => setWaste(p)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${waste === p ? C : 'var(--border-2)'}`, background: waste === p ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: waste === p ? 700 : 500, color: waste === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p}%</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Price per tile ($) — optional</label>
            <input type="number" value={pricePerTile} onChange={e => setPricePerTile(e.target.value)} placeholder="e.g. 2.50"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 15, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Tile estimate" rows={[
            { label: 'Room area', value: `${roomArea} sq ft` },
            { label: 'Tile area', value: `${(tileArea).toFixed(4)} sq ft` },
            { label: 'Tiles (net)', value: Math.ceil(roomArea / tileArea) },
            { label: `Waste (+${waste}%)`, value: `+${tilesNeeded - Math.ceil(roomArea / tileArea)} tiles` },
            { label: 'Tiles to buy', value: tilesNeeded, bold: true, highlight: true, color: C },
            ...(cost ? [{ label: 'Material cost', value: `$${cost.toFixed(2)}`, color: C }] : []),
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>QUICK REFERENCE</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
              · 12×12" tile = 1 sq ft · 18×18" tile = 2.25 sq ft · 24×24" tile = 4 sq ft
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
