import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg = n => `${(Math.round(n*10)/10).toFixed(1)} kg`

const GOALS = [
  { key:'sedentary',  label:'Sedentary',          sub:'Little/no exercise',     gPerKg:0.8,  color:'#94a3b8' },
  { key:'active',     label:'General fitness',     sub:'Exercise 3–5x/week',     gPerKg:1.2,  color:'#22a355' },
  { key:'muscle',     label:'Build muscle',         sub:'Resistance training',    gPerKg:1.8,  color:'#3b82f6' },
  { key:'athlete',    label:'Competitive athlete',  sub:'High performance sport', gPerKg:2.0,  color:'#8b5cf6' },
  { key:'cut',        label:'Fat loss (cut)',        sub:'Preserve muscle in deficit',gPerKg:2.2,color:'#ef4444' },
]

const BENCHMARKS = [
  { label:'WHO minimum',           gPerKg:0.8,  note:'Prevents deficiency' },
  { label:'General active adult',  gPerKg:1.2,  note:'Maintain muscle mass' },
  { label:'Recreational gym-goer', gPerKg:1.6,  note:'Gradual muscle building' },
  { label:'Competitive athlete',   gPerKg:2.0,  note:'Performance + recovery' },
  { label:'Cutting / fat loss',    gPerKg:2.2,  note:'Maximum muscle retention' },
  { label:'Research upper limit',  gPerKg:3.1,  note:'No proven benefit above this' },
]

const PROTEIN_FOODS = [
  { name:'Chicken breast (100g)', g:31,  kcal:165 },
  { name:'Greek yoghurt (200g)',  g:20,  kcal:130 },
  { name:'Whey protein (30g)',    g:24,  kcal:120 },
  { name:'Whole egg',             g:6,   kcal:78  },
  { name:'Tuna (100g)',           g:28,  kcal:116 },
  { name:'Cottage cheese (200g)', g:24,  kcal:180 },
  { name:'Lentils (200g cooked)', g:18,  kcal:230 },
  { name:'Steak (150g)',          g:38,  kcal:270 },
]

const GLOSSARY = [
  { term:'Protein (g/kg)',       def:'Daily protein intake relative to body weight. The most practical way to set protein targets — scales automatically with body size.' },
  { term:'Essential Amino Acids',def:'9 amino acids the body cannot produce itself — must come from food. Complete protein sources (meat, eggs, dairy, soy) contain all 9.' },
  { term:'Muscle Protein Synthesis',def:'The process of building new muscle protein. Maximised by: sufficient leucine (2–3g per meal), spreading protein across meals, and resistance training stimulus.' },
  { term:'Leucine Threshold',    def:'~2–3g of leucine per meal maximally stimulates muscle protein synthesis. Approximately 30–40g of quality protein per meal achieves this.' },
  { term:'Protein Timing',       def:'Spreading protein evenly across 4–5 meals (every 3–4 hours) maximises muscle protein synthesis compared to consuming it all at once.' },
  { term:'Net Protein Utilisation',def:'The percentage of ingested protein actually used by the body. Affected by source (animal vs plant), digestibility, and amino acid completeness.' },
]

const FAQ = [
  { q:'How much protein do I actually need?',
    a:'The RDA of 0.8g/kg is the minimum to prevent deficiency — not optimal for active people. For general health and fitness, 1.2–1.6g/kg is well supported. For muscle building, 1.6–2.2g/kg maximises gains. Values above 2.2g/kg show no additional benefit in most studies. The upper limit of ~3.1g/kg has been tested in elite athletes without harm but provides no measurable advantage over 2.2g/kg.' },
  { q:'Does protein timing matter?',
    a:'Yes, but less than total daily intake. Spreading protein across 4–5 meals of 0.4g/kg each maximises muscle protein synthesis. A post-workout meal of 20–40g within 2 hours of resistance training is beneficial. However, if you hit your daily protein target, timing is a second-order effect — total intake matters more.' },
  { q:'Are plant proteins as good as animal proteins?',
    a:'Plant proteins are often lower in leucine and lysine and have lower digestibility (PDCAAS/DIAAS scores). To compensate: eat 10–20% more total protein, combine complementary sources (rice + legumes, corn + beans), and consider leucine supplementation if training is intense. Soy protein is the most complete plant source.' },
  { q:'Can too much protein damage my kidneys?',
    a:'There is no evidence that high protein intake (up to 3g/kg/day) damages kidneys in healthy individuals. The concern applies only to people with pre-existing chronic kidney disease. In healthy adults, the kidneys adapt to higher protein loads without harm. Hydration is important at high intakes — ensure you are drinking adequate water.' },
]

const EXAMPLES = [
  { title:'Muscle Building', desc:'80kg male, resistance training', wKg:80, sex:'male',   goal:'muscle',   lbm:0 },
  { title:'Fat Loss',        desc:'65kg female, cutting phase',     wKg:65, sex:'female', goal:'cut',      lbm:0 },
  { title:'General Fitness', desc:'70kg, gym 3x/week',             wKg:70, sex:'male',   goal:'active',   lbm:0 },
]

const JOURNEY_ITEMS = [
  { title:'Macro Calculator',  sub:'Set full protein, carbs and fat targets', icon:'🥗', path:'/health/calories/macro-calculator'   },
  { title:'Lean Body Mass',    sub:'Protein based on lean mass is more accurate',icon:'💪', path:'/health/body-metrics/lean-body-mass-calculator' },
  { title:'Calorie Calculator',sub:'Total daily calorie needs',                icon:'🔥', path:'/health/calories/calorie-calculator'  },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'13px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize:11, color:'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, catColor }) {
  return (
    <div style={{ borderBottom:'0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', background:'none', border:'none', cursor:'pointer', gap:12, textAlign:'left' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:catColor, flexShrink:0, transition:'transform .2s', display:'inline-block', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = r => { const n=parseFloat(r); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}
function IconCardGroup({ label, options, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ display:'flex', gap:8 }}>
        {options.map(opt => {
          const active = value===opt.value
          return (
            <button key={opt.value} onClick={()=>onChange(opt.value)} style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active?catColor:'var(--border-2)'}`, background:active?catColor+'12':'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center' }}>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── CONCEPT C: Comparison Ticker ── */
function ComparisonTicker({ title, yourValue, yourLabel, benchmarks, unit, catColor }) {
  const maxVal = Math.max(...benchmarks.map(b=>b.value), yourValue) * 1.15
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>You vs benchmarks</span>
      </div>
      <div style={{ padding:'16px 18px' }}>
        {/* your big number */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
          <div>
            <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>
              {Math.round(yourValue)}
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{unit} per day</div>
          </div>
          <div style={{ paddingBottom:6 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:catColor+'18', border:`1px solid ${catColor}35` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:catColor }}/>
              <span style={{ fontSize:12, fontWeight:700, color:catColor, fontFamily:"'DM Sans',sans-serif" }}>{yourLabel}</span>
            </div>
          </div>
        </div>

        {/* comparison bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {/* your row first */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:catColor+'12', border:`1.5px solid ${catColor}` }}>
            <div style={{ width:130, fontSize:11, fontWeight:700, color:catColor, flexShrink:0 }}>You ← {yourLabel}</div>
            <div style={{ flex:1, height:7, background:'var(--border)', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${(yourValue/maxVal)*100}%`, background:catColor, borderRadius:3, transition:'width .5s ease' }}/>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:catColor, minWidth:45, textAlign:'right' }}>{Math.round(yourValue)}{unit}</div>
          </div>
          {/* benchmark rows */}
          {benchmarks.map((b,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:130, flexShrink:0 }}>
                <div style={{ fontSize:11, fontWeight:500, color:'var(--text)' }}>{b.label}</div>
                <div style={{ fontSize:9, color:'var(--text-3)' }}>{b.note}</div>
              </div>
              <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${(b.value/maxVal)*100}%`, background:b.color||'var(--text-3)', borderRadius:3, opacity:0.6, transition:'width .5s ease' }}/>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', minWidth:45, textAlign:'right' }}>{b.value}{unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

export default function ProteinCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [wKg,     setWKg]     = useState(75)
  const [sex,     setSex]     = useState('male')
  const [goalKey, setGoalKey] = useState('muscle')
  const [openFaq, setOpenFaq] = useState(null)

  function applyExample(ex) { setWKg(ex.wKg); setSex(ex.sex); setGoalKey(ex.goal) }

  const goal       = GOALS.find(g=>g.key===goalKey)||GOALS[1]
  const proteinG   = Math.round(wKg*goal.gPerKg)
  const proteinMin = Math.round(wKg*0.8)
  const proteinMax = Math.round(wKg*2.2)
  const kcal       = proteinG*4

  const benchmarks = BENCHMARKS.map((b,i) => ({
    label: b.label,
    value: Math.round(wKg*b.gPerKg),
    note:  b.note,
    color: ['#94a3b8','#22a355','#3b82f6','#8b5cf6','#ef4444','#f59e0b'][i],
  }))

  const hint = `Daily protein target: ${proteinG}g (${goal.gPerKg}g/kg) for "${goal.label}". That's ${kcal} kcal from protein. Range: ${proteinMin}g (minimum) to ${proteinMax}g (maximum).`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
            <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" hint="Lean body mass is more accurate" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Your goal</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {GOALS.map(g=>(
                <button key={g.key} onClick={()=>setGoalKey(g.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', borderRadius:8, border:`1.5px solid ${goalKey===g.key?g.color:'var(--border-2)'}`, background:goalKey===g.key?g.color+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:goalKey===g.key?g.color:'var(--text)', textAlign:'left' }}>{g.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{g.sub}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:goalKey===g.key?g.color:'var(--text-3)' }}>{g.gPerKg}g/kg</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <ComparisonTicker
            title="Protein Target"
            yourValue={proteinG}
            yourLabel={goal.label}
            unit="g"
            catColor={goal.color}
            benchmarks={benchmarks}
          />
          <BreakdownTable title="Protein Summary" rows={[
            { label:'Daily target',   value:`${proteinG}g`, bold:true, highlight:true, color:goal.color },
            { label:'Per kg body wt', value:`${goal.gPerKg}g/kg` },
            { label:'From protein',   value:`${kcal} kcal` },
            { label:'Per meal (4x)',  value:`${Math.round(proteinG/4)}g` },
            { label:'Min (RDA)',      value:`${proteinMin}g (0.8g/kg)` },
            { label:'Max (research)', value:`${proteinMax}g (2.2g/kg)` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* food to hit target */}
      <Sec title="How to hit your protein target in real food" sub={`${proteinG}g/day from whole foods`}>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Here's how many servings of common foods you'd need to reach your daily target of <strong style={{fontWeight:600,color:goal.color}}>{proteinG}g</strong>.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {PROTEIN_FOODS.map((f,i) => {
            const servings = (proteinG/f.g).toFixed(1)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{f.name}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{f.g}g protein · {f.kcal} kcal</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:goal.color }}>×{servings}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>servings</div>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* meal protein guide */}
      <Sec title="Spreading protein across your day" sub="4–5 meals of 25–40g each is optimal">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Muscle protein synthesis is maximised when each meal hits the leucine threshold (~2–3g leucine = ~30–40g quality protein). Spreading {proteinG}g across meals is more effective than consuming it all at once.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            { meal:'Breakfast',    pct:0.25 },
            { meal:'Lunch',        pct:0.30 },
            { meal:'Pre-workout',  pct:0.15 },
            { meal:'Post-workout', pct:0.20 },
            { meal:'Evening',      pct:0.10 },
          ].map((m,i)=>{
            const g = Math.round(proteinG*m.pct)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:100, fontSize:11, fontWeight:600, color:'var(--text)', flexShrink:0 }}>{m.meal}</div>
                <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${m.pct*100}%`, background:goal.color, borderRadius:3 }}/>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:goal.color, minWidth:40, textAlign:'right' }}>{g}g</div>
                <div style={{ fontSize:9, color:'var(--text-3)', minWidth:50 }}>{Math.round(m.pct*100)}%</div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="How protein targets are set">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Target formula',    formula:`Protein (g) = body weight (kg) × ${goal.gPerKg} g/kg  [${goal.label}]` },
            { label:'RDA minimum',       formula:'Protein (g) = body weight (kg) × 0.8 g/kg  [sedentary adults]' },
            { label:'Optimal for muscle',formula:'Protein (g) = body weight (kg) × 1.6–2.2 g/kg  [resistance training]' },
            { label:'Caloric value',     formula:'Protein kcal = protein (g) × 4 kcal/g' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Evidence from multiple meta-analyses (Morton et al. 2018, Stokes et al. 2018) shows 1.6g/kg/day maximises muscle protein accretion in resistance-trained individuals. Values above 2.2g/kg show no additional benefit. The 3.1g/kg ceiling from Antonio et al. (2016) is safe but not superior.</p>
      </Sec>

      {/* examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const g2=GOALS.find(g=>g.key===ex.goal)||GOALS[1]
            const p2=Math.round(ex.wKg*g2.gPerKg)
            return (
              <button key={i} onClick={()=>applyExample(ex)} style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9 }}>{ex.desc}</div>
                {[['Target',`${p2}g/day`],['Per kg',`${g2.gPerKg}g/kg`],['Per meal',`${Math.round(p2/4)}g`]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:g2.color }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:g2.color+'18', color:g2.color, padding:'2px 8px', borderRadius:10 }}>{g2.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor, marginLeft:'auto' }}>Apply →</span>
                </div>
              </button>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Protein is the most important macro. Build the full nutrition picture with these calculators." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about protein intake">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
