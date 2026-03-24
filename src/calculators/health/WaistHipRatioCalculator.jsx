import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

const MALE_RISKS = [
  { key:'low',      label:'Low Risk',       range:'< 0.90',  min:0,    max:0.90, color:'#22a355', soft:'#d6f2e0', advice:'Your waist-to-hip ratio indicates low cardiovascular risk. Maintain your current lifestyle with regular activity and balanced nutrition.' },
  { key:'moderate', label:'Moderate Risk',  range:'0.90–0.99',min:0.90, max:1.00, color:'#f59e0b', soft:'#fef3c7', advice:'Moderate cardiovascular risk. Focus on reducing abdominal fat through aerobic exercise and reducing refined carbohydrates.' },
  { key:'high',     label:'High Risk',      range:'≥ 1.00',  min:1.00, max:3,    color:'#ef4444', soft:'#fee2e2', advice:'High cardiovascular risk. Speak with a healthcare provider about a structured lifestyle programme. Waist reduction of even 5 cm significantly reduces risk.' },
]
const FEMALE_RISKS = [
  { key:'low',      label:'Low Risk',       range:'< 0.80',  min:0,    max:0.80, color:'#22a355', soft:'#d6f2e0', advice:'Your waist-to-hip ratio indicates low cardiovascular risk. Maintain your current lifestyle with regular activity and balanced nutrition.' },
  { key:'moderate', label:'Moderate Risk',  range:'0.80–0.84',min:0.80, max:0.85, color:'#f59e0b', soft:'#fef3c7', advice:'Moderate cardiovascular risk. Focus on reducing abdominal fat through aerobic exercise and reducing refined carbohydrates.' },
  { key:'high',     label:'High Risk',      range:'≥ 0.85',  min:0.85, max:3,    color:'#ef4444', soft:'#fee2e2', advice:'High cardiovascular risk. Speak with a healthcare provider about a structured lifestyle programme. Abdominal fat reduction significantly reduces risk.' },
]

const BODY_SHAPES = [
  { key:'apple',     label:'Apple',     desc:'Central obesity — fat concentrated around abdomen. Higher cardiovascular risk.', condition:(w,h)=>w/h>=1.0 },
  { key:'pear',      label:'Pear',      desc:'Fat concentrated around hips and thighs. Lower cardiovascular risk than apple.', condition:(w,h)=>w/h<0.8 },
  { key:'hourglass', label:'Hourglass', desc:'Balanced proportions with defined waist. Generally lower cardiovascular risk.', condition:(w,h)=>w/h>=0.8&&w/h<0.9 },
  { key:'rectangle', label:'Rectangle', desc:'Similar waist and hip measurements. Moderate cardiovascular risk profile.', condition:(w,h)=>w/h>=0.9&&w/h<1.0 },
]

const GLOSSARY = [
  { term:'WHR',               def:'Waist-to-Hip Ratio — waist circumference divided by hip circumference. A WHO cardiovascular risk indicator.' },
  { term:'Visceral Fat',      def:'Fat stored around internal abdominal organs. More metabolically active and dangerous than subcutaneous fat.' },
  { term:'Waist-to-Height',   def:'Waist circumference ÷ height. Values > 0.5 indicate metabolic risk regardless of WHR or BMI.' },
  { term:'Central Obesity',   def:'Excess fat concentrated around the abdomen. Strongly associated with type 2 diabetes, hypertension, and heart disease.' },
  { term:'Apple Body Shape',  def:'Fat distribution around the abdomen (WHR ≥ 1.0 male, ≥ 0.85 female). Higher metabolic risk than pear shape.' },
  { term:'WHO Thresholds',    def:'World Health Organisation WHR cutoffs: male high risk ≥ 1.0, female high risk ≥ 0.85.' },
]

const FAQ = [
  { q:'What is waist-to-hip ratio and why does it matter?',
    a:'WHR is your waist circumference divided by your hip circumference. It measures central fat distribution — where your fat is stored is more important than how much you have. Abdominal fat (visceral fat) is metabolically active and releases inflammatory signals that increase cardiovascular disease, type 2 diabetes, and hypertension risk.' },
  { q:'Where exactly should I measure my waist and hips?',
    a:'Waist: measure at the narrowest point of your torso, approximately halfway between your lowest rib and the top of your hip bone. Do not suck in. Measure in the morning before eating, exhale gently. Hips: measure at the widest point across your buttocks. Stand with feet together. Use a flexible tape measure held snugly but not tight.' },
  { q:'Is WHR or BMI a better health indicator?',
    a:'WHR is generally considered more predictive of cardiovascular disease risk than BMI because it measures fat distribution rather than total body weight. A person with normal BMI can have high WHR (and thus elevated risk) if they carry central fat. Use both together for the best screening picture.' },
  { q:'How can I reduce my waist-to-hip ratio?',
    a:'WHR can only be reduced by decreasing waist circumference — hip size is largely determined by bone structure. Effective approaches: 150–300 min/week of aerobic exercise (most effective for visceral fat), resistance training, reduced refined carbohydrate and alcohol intake, adequate sleep (poor sleep increases cortisol and visceral fat), and stress management.' },
]

const EXAMPLES = [
  { title:'Low Risk Male',   desc:'Athletic build, regular training', waist:82, hip:98,  sex:'male',   hCm:178 },
  { title:'Moderate Female', desc:'Office worker, moderate activity', waist:80, hip:98,  sex:'female', hCm:165 },
  { title:'High Risk Male',  desc:'Sedentary, central obesity',       waist:102,hip:99,  sex:'male',   hCm:175 },
]

const JOURNEY_ITEMS = [
  { title:'BMI Calculator',  sub:'Overall weight status',              icon:'⚖️', path:'/health/body-metrics/bmi-calculator'        },
  { title:'Body Fat %',      sub:'How much of your weight is fat?',    icon:'💪', path:'/health/body-metrics/body-fat-calculator'   },
  { title:'BMR & Calories',  sub:'Daily calorie needs',                icon:'🔥', path:'/health/body-metrics/bmr-calculator'        },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transition:'transform .2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open,setOpen] = useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing,setEditing] = useState(false)
  const commit = r => { const n=parseFloat(r); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow:editing?`0 0 0 3px ${catColor}18`:'none', transition:'border-color .15s,box-shadow .15s' }}>
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
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'stroke .18s' }}>{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color:active?catColor+'cc':'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

function getRisk(whr, sex) {
  const risks = sex==='male' ? MALE_RISKS : FEMALE_RISKS
  return risks.find((r,i)=>i===risks.length-1?whr>=r.min:whr>=r.min&&whr<r.max) || risks[risks.length-1]
}
function getShape(waist, hip) {
  const ratio = waist/hip
  return BODY_SHAPES.find(s=>s.condition(waist,hip)) || BODY_SHAPES[3]
}

export default function WaistHipRatioCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [waist,   setWaist]   = useState(82)
  const [hip,     setHip]     = useState(98)
  const [hCm,     setHCm]     = useState(175)
  const [sex,     setSex]     = useState('male')
  const [openFaq, setOpenFaq] = useState(null)

  function applyExample(ex) {
    setWaist(ex.waist); setHip(ex.hip); setSex(ex.sex); setHCm(ex.hCm)
  }

  const whr  = waist/hip
  const risk = getRisk(whr, sex)
  const shape= getShape(waist, hip)
  const wthRatio = waist/hCm
  const wthRisk  = wthRatio > 0.5 ? 'Elevated' : 'Normal'
  const wthColor = wthRatio > 0.5 ? '#ef4444' : '#22a355'

  const hint = `WHR: ${whr.toFixed(2)} — ${risk.label}. Body shape: ${shape.label}. Waist-to-height ratio: ${wthRatio.toFixed(2)} (${wthRisk} risk). ${risk.advice}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Measurements</div>
            <Stepper label="Waist circumference" value={waist} onChange={setWaist} min={40} max={200} unit="cm" hint="At narrowest point" catColor={catColor}/>
            <Stepper label="Hip circumference" value={hip} onChange={setHip} min={50} max={200} unit="cm" hint="At widest point" catColor={catColor}/>
            <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" hint="Used for waist-to-height" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          {/* measurement guide */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>How to measure correctly</div>
            {[
              { title:'Waist', steps:'Stand upright. Locate the narrowest point of your torso (usually 1 inch above navel). Exhale gently. Measure — do not suck in.' },
              { title:'Hips',  steps:'Stand with feet together. Find the widest point across your buttocks. Keep tape horizontal. Measure snugly but not tight.' },
            ].map((g,i)=>(
              <div key={i} style={{ marginBottom:10, padding:'10px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:12, fontWeight:700, color:catColor, marginBottom:4 }}>{g.title}</div>
                <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.55, fontFamily:"'DM Sans',sans-serif" }}>{g.steps}</div>
              </div>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>WHR Score</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {/* big number + badge */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:risk.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
                    {whr.toFixed(2)}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Waist-to-hip ratio</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:risk.soft, border:`1px solid ${risk.color}35`, transition:'all .3s' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:risk.color }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:risk.color, fontFamily:"'DM Sans',sans-serif" }}>{risk.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5 }}>Range: {risk.range}</div>
                </div>
              </div>

              {/* risk bar */}
              <div style={{ display:'flex', gap:2, height:8, borderRadius:3, overflow:'hidden', marginBottom:3 }}>
                {(sex==='male'?MALE_RISKS:FEMALE_RISKS).map((r,i)=>(
                  <div key={i} style={{ flex:1, background:r.color, opacity:risk.key===r.key?1:0.25, borderRadius:1, transition:'opacity .3s' }}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:8.5, color:'var(--text-3)', marginBottom:14 }}>
                <span>Low</span><span>Moderate</span><span>High</span>
              </div>

              {/* body shape */}
              <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'10px 13px', border:'0.5px solid var(--border)', marginBottom:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em' }}>Body shape</span>
                  <span style={{ fontSize:11, fontWeight:700, color:catColor }}>{shape.label}</span>
                </div>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{shape.desc}</p>
              </div>
            </div>
            <div style={{ margin:'0 18px 16px' }}>
              <div style={{ background:risk.soft, borderRadius:10, padding:'10px 13px', border:`1px solid ${risk.color}30` }}>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{risk.advice}</p>
              </div>
            </div>
          </div>

          <BreakdownTable title="Measurements Summary" rows={[
            { label:'Waist',              value:`${waist} cm` },
            { label:'Hip',                value:`${hip} cm` },
            { label:'WHR',                value:whr.toFixed(2), bold:true, highlight:true, color:risk.color },
            { label:'Risk category',      value:risk.label, color:risk.color },
            { label:'Body shape',         value:shape.label, color:catColor },
            { label:'Waist-to-height',    value:wthRatio.toFixed(2), color:wthColor },
            { label:'W/H risk',           value:wthRisk, color:wthColor },
            { label:'WHO threshold',      value:sex==='male'?'≥ 1.00 high risk':'≥ 0.85 high risk' },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* CV risk explainer */}
      <Sec title="Why abdominal fat is more dangerous" sub="The science of central obesity">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Not all body fat is equal. Visceral fat — the fat stored around your internal organs in the abdominal cavity — is metabolically active in a way that subcutaneous (under-skin) fat is not.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { title:'Visceral fat (abdominal)', points:['Wraps around liver, pancreas, intestines','Releases inflammatory cytokines directly into bloodstream','Strongly linked to insulin resistance, type 2 diabetes','Increases LDL cholesterol and blood pressure'], color:'#ef4444' },
            { title:'Subcutaneous fat (peripheral)',points:['Stored under skin — hips, thighs, arms','Metabolically less active','Produces adiponectin (anti-inflammatory)','Lower cardiovascular risk — may even be protective'], color:'#22a355' },
          ].map((c,i)=>(
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:10, padding:'12px 14px', border:`0.5px solid ${c.color}30` }}>
              <div style={{ fontSize:12, fontWeight:700, color:c.color, marginBottom:8 }}>{c.title}</div>
              {c.points.map((p,j)=>(
                <div key={j} style={{ display:'flex', gap:6, marginBottom:5 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:c.color, marginTop:5, flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sec>

      {/* waist reduction impact */}
      <Sec title="The impact of waist reduction" sub="Each centimetre matters">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Waist circumference reduction of even 5 cm has measurable health benefits. Here's what a 5 cm waist reduction would do to your metrics.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'New waist', val:`${waist-5} cm`, sub:'5 cm reduction', color:catColor },
            { label:'New WHR',   val:((waist-5)/hip).toFixed(2), sub:`vs current ${whr.toFixed(2)}`, color:getRisk((waist-5)/hip,sex).color },
            { label:'New risk',  val:getRisk((waist-5)/hip,sex).label, sub:'after reduction', color:getRisk((waist-5)/hip,sex).color },
          ].map((m,i)=>(
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 12px', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{m.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:m.color, fontFamily:"'Space Grotesk',sans-serif" }}>{m.val}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="WHR and waist-to-height formulas">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Waist-to-hip ratio', formula:'WHR = waist circumference (cm) ÷ hip circumference (cm)' },
            { label:'Waist-to-height',    formula:'WHtR = waist circumference (cm) ÷ height (cm)   — healthy: < 0.50' },
            { label:'WHO risk thresholds', formula:'Male: Low < 0.90 | Moderate 0.90–0.99 | High ≥ 1.00' },
            { label:'',                   formula:'Female: Low < 0.80 | Moderate 0.80–0.84 | High ≥ 0.85' },
          ].map((f,i)=>(
            <div key={i}>
              {f.label && <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>}
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>WHO (World Health Organisation) thresholds are based on population data linking WHR to cardiovascular disease events. The waist-to-height ratio &gt; 0.5 rule is a simpler, age-independent risk indicator — "keep your waist to less than half your height."</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const whr2=ex.waist/ex.hip, r2=getRisk(whr2,ex.sex)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Waist',`${ex.waist} cm`],['Hip',`${ex.hip} cm`],['WHR',whr2.toFixed(2)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:k==='WHR'?r2.color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:r2.color+'18', color:r2.color, padding:'2px 8px', borderRadius:10 }}>{r2.label}</span>
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

      <HealthJourneyNext catColor={catColor} intro="Your waist-to-hip ratio tells you about cardiovascular risk. Use these calculators to build your complete health profile." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about waist-to-hip ratio">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
