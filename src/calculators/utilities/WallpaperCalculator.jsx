import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How many rolls of wallpaper do I need?', a: 'Measure total wall area (perimeter × height, minus doors and windows). Divide by the usable area per roll — a standard roll is 33 ft long × 20.5 inches wide, but repeat patterns reduce usable length. Always buy 10–15% extra and ensure all rolls come from the same batch number.' },
  { q: 'What is a pattern repeat, and does it waste wallpaper?', a: 'A pattern repeat is the vertical distance before a pattern repeats. For walls, you must align the pattern across panels, which means starting each strip at the same point in the repeat cycle. A 24-inch repeat can waste an entire strip\'s worth of material on a standard 8-foot wall.' },
  { q: 'Can I wallpaper over existing wallpaper?', a: 'It is generally not recommended. Old wallpaper can bubble, peel, or create an uneven surface. The weight of new wallpaper can pull the old layers off the wall. Strip old wallpaper first, repair the walls, prime, and then hang new wallpaper for the best result.' },
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

export default function WallpaperCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [roomL, setRoomL] = useState(14)
  const [roomW, setRoomW] = useState(12)
  const [roomH, setRoomH] = useState(9)
  const [doors, setDoors] = useState(1)
  const [windows, setWindows] = useState(2)
  const [rollLen, setRollLen] = useState(33)
  const [rollW, setRollW] = useState(20.5)
  const [repeat, setRepeat] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const perimeter = 2 * (roomL + roomW)
  const wallArea = perimeter * roomH
  const deductions = doors * 20 + windows * 15
  const netArea = Math.max(0, wallArea - deductions)

  // Roll usable area accounting for pattern repeat
  const rollWidthFt = rollW / 12
  const stripsPerRoll = Math.floor(rollLen / (roomH + (repeat / 12)))
  const usablePerRoll = stripsPerRoll * rollWidthFt * roomH
  const rolls = usablePerRoll > 0 ? Math.ceil(netArea / usablePerRoll * 1.1) : 0

  const hint = `Room ${roomL}×${roomW}×${roomH} ft: ${netArea.toFixed(0)} sq ft of wall. Need ${rolls} rolls of wallpaper (+10% overage).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Wallpaper Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Rolls = Wall area ÷ Usable area per roll</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Usable area per roll = strips per roll × strip width × wall height</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{rolls} rolls</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Room dimensions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Length (ft)', roomL, setRoomL], ['Width (ft)', roomW, setRoomW], ['Height (ft)', roomH, setRoomH]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Doors', doors, setDoors], ['Windows', windows, setWindows]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" min="0" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Roll specifications</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Roll length (ft)', rollLen, setRollLen], ['Roll width (in)', rollW, setRollW]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Pattern repeat: {repeat}" {repeat === 0 ? '(no repeat)' : ''}</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[0, 6, 12, 18, 24].map(p => (
                <button key={p} onClick={() => setRepeat(p)} style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${repeat === p ? C : 'var(--border-2)'}`, background: repeat === p ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: repeat === p ? 700 : 500, color: repeat === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p === 0 ? 'None' : `${p}"`}</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Wallpaper estimate" rows={[
            { label: 'Perimeter', value: `${perimeter} ft` },
            { label: 'Wall area', value: `${wallArea.toFixed(0)} sq ft` },
            { label: 'Deductions', value: `−${deductions} sq ft` },
            { label: 'Net wall area', value: `${netArea.toFixed(0)} sq ft` },
            { label: 'Strips per roll', value: stripsPerRoll },
            { label: 'Rolls to buy', value: rolls, bold: true, highlight: true, color: C },
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>STANDARD ROLL SIZES</div>
            {[['US standard', '33 ft × 20.5 in'], ['European', '33 ft × 21 in'], ['Wide', '33 ft × 27 in']].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>
                <span>{r[0]}</span><span style={{ fontWeight: 600 }}>{r[1]}</span>
              </div>
            ))}
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
