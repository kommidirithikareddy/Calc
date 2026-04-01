import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'

export default function HexConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [hex, setHex] = useState('FF')
  const clean = hex.replace(/[^0-9A-Fa-f]/g,'')
  const dec = clean ? parseInt(clean, 16) : NaN
  const bin = !isNaN(dec) ? dec.toString(2) : '—'
  const ascii = !isNaN(dec) && dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : '—'
  const rgb = clean.length === 6 ? `rgb(${parseInt(clean.slice(0,2),16)}, ${parseInt(clean.slice(2,4),16)}, ${parseInt(clean.slice(4,6),16)})` : null
  const hexUpper = clean.toUpperCase()

  const Sec = ({title,children}) => (
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',fontSize:13,fontWeight:700,color:'var(--text)'}}>{title}</div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{background:`linear-gradient(135deg,${C}15,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Hex Converter</div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:20,fontWeight:700,color:C}}>0x</span>
          <input value={hex} onChange={e=>setHex(e.target.value.toUpperCase())} placeholder="FF" maxLength={8}
            style={{flex:1,height:48,border:`2px solid ${C}`,borderRadius:10,padding:'0 14px',fontSize:22,fontWeight:700,color:C,background:'var(--bg-card)',outline:'none',fontFamily:'monospace'}} />
          {rgb && <div style={{width:48,height:48,borderRadius:10,background:`#${hexUpper}`,border:'2px solid var(--border)'}} />}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{l:'Hexadecimal',v:'0x'+hexUpper,c:C},{l:'Decimal',v:isNaN(dec)?'—':dec.toString(),c:'#3b82f6'},{l:'Binary',v:bin,c:'#10b981'},{l:'Octal',v:isNaN(dec)?'—':dec.toString(8),c:'#8b5cf6'},{l:'ASCII character',v:ascii},{l:'# of bits',v:isNaN(dec)?'—':bin.length+' bits'},{l:'Unsigned 8-bit',v:isNaN(dec)?'—':(dec & 0xFF).toString()},{l:'Color (if 6 hex)',v:rgb||'n/a',c:rgb?`#${hexUpper}`:undefined}].map((m,i)=>(
          <div key={i} style={{padding:'11px 13px',background:'var(--bg-card)',borderRadius:10,border:'0.5px solid var(--border)'}}>
            <div style={{fontSize:10,color:'var(--text-3)',marginBottom:3}}>{m.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:m.c||'var(--text)',fontFamily:'monospace',wordBreak:'break-all'}}>{m.v}</div>
          </div>
        ))}
      </div>

      {rgb && (
        <Sec title="Color representation">
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:80,height:80,borderRadius:12,background:`#${hexUpper}`,border:'1px solid var(--border)',flexShrink:0}} />
            <div>
              {[{l:'Hex',v:`#${hexUpper}`},{l:'RGB',v:rgb},{l:'R',v:parseInt(clean.slice(0,2),16)},{l:'G',v:parseInt(clean.slice(2,4),16)},{l:'B',v:parseInt(clean.slice(4,6),16)}].map((m,i)=>(
                <div key={i} style={{fontSize:12,marginBottom:3}}><span style={{color:'var(--text-3)'}}>{m.l}: </span><span style={{fontWeight:700,color:C}}>{m.v}</span></div>
              ))}
            </div>
          </div>
        </Sec>
      )}

      <Sec title="Hex digits 0–F reference">
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n=>(
            <div key={n} onClick={()=>setHex(n.toString(16).toUpperCase())} style={{padding:'8px',borderRadius:7,background:'var(--bg-raised)',border:'0.5px solid var(--border)',textAlign:'center',cursor:'pointer'}}>
              <div style={{fontSize:16,fontWeight:700,color:C,fontFamily:'monospace'}}>{n.toString(16).toUpperCase()}</div>
              <div style={{fontSize:10,color:'var(--text-3)'}}>{n}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Hex digits: 0–9 then A=10, B=11, C=12, D=13, E=14, F=15\n1 hex digit = 4 bits\n0xFF = 255 decimal\nColor #RRGGBB'}
        variables={[{symbol:'0x',meaning:'Prefix indicating hexadecimal (base 16)'},{symbol:'A–F',meaning:'Hex digits representing 10–15'},{symbol:'#RRGGBB',meaning:'CSS color: 2 hex digits each for R, G, B'}]}
        explanation="Hexadecimal is base 16, using digits 0–9 and letters A–F. Each hex digit represents exactly 4 binary bits, making hex a compact way to write binary. 0xFF = 1111 1111 = 255. Web colors use 6 hex digits: #RRGGBB where each pair is a byte (0–255) for red, green, blue."
      />
    </div>
  )
}
