import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

// Morningness-Eveningness Questionnaire (MEQ) — simplified 6-question version
const QUESTIONS = [
  { id:'q1', text:'When would you get up if you had a completely free day?',
    options:[{ v:5, l:'Before 6:30 AM' },{ v:4, l:'6:30 – 7:45 AM' },{ v:3, l:'7:45 – 9:45 AM' },{ v:2, l:'9:45 – 11:00 AM' },{ v:1, l:'After 11:00 AM' }] },
  { id:'q2', text:'When would you go to sleep if you had a completely free evening?',
    options:[{ v:5, l:'Before 9:30 PM' },{ v:4, l:'9:30 – 10:30 PM' },{ v:3, l:'10:30 PM – 12:30 AM' },{ v:2, l:'12:30 – 2:00 AM' },{ v:1, l:'After 2:00 AM' }] },
  { id:'q3', text:'How easy is it to get up in the morning?',
    options:[{ v:4, l:'Very easy' },{ v:3, l:'Fairly easy' },{ v:2, l:'Fairly difficult' },{ v:1, l:'Very difficult' }] },
  { id:'q4', text:'When do you feel at your mental best during the day?',
    options:[{ v:5, l:'Early morning (5–8 AM)' },{ v:4, l:'Morning (8–10 AM)' },{ v:3, l:'Late morning to noon' },{ v:2, l:'Afternoon (3–6 PM)' },{ v:1, l:'Evening (after 7 PM)' }] },
  { id:'q5', text:'If you had to do 2 hours of hard mental work, which time would you choose?',
    options:[{ v:5, l:'8–10 AM' },{ v:4, l:'11 AM – 1 PM' },{ v:3, l:'3 – 5 PM' },{ v:2, l:'7 – 9 PM' },{ v:1, l:'Late night (after 10 PM)' }] },
  { id:'q6', text:'When do you feel tired and need sleep?',
    options:[{ v:5, l:'Before 9 PM' },{ v:4, l:'9–10:30 PM' },{ v:3, l:'10:30 PM – 12 AM' },{ v:2, l:'12–2 AM' },{ v:1, l:'After 2 AM' }] },
]

const CHRONOTYPES = [
  { key:'definite_morning', label:'Definite Morning Type', emoji:'🌅', scoreMin:22, color:'#f59e0b',
    peak:'6–10 AM', sleep:'9–10 PM', wake:'5:30–6:30 AM',
    desc:'Your brain reaches peak alertness in the early morning. Deep work, creative tasks, and high-stakes decisions are best done in the first 2–3 hours after waking.',
    tips:['Schedule your most demanding tasks before 10 AM', 'Social obligations are better in late morning', 'Exercise in the morning — your physical peak aligns here', 'Protect early bedtime — late nights cost you more than other types'] },
  { key:'moderate_morning', label:'Moderate Morning Type', emoji:'🌤️', scoreMin:17, color:'#22a355',
    peak:'7–11 AM', sleep:'10–11 PM', wake:'6–7 AM',
    desc:'You lean morning but have a longer productive window than definite morning types. Your peak mental window extends into late morning.',
    tips:['Best work window: 8 AM – noon', 'Post-lunch energy dip typically 1–3 PM — ideal nap window', 'Creative and analytical tasks in morning', 'Meetings and collaboration: late morning'] },
  { key:'intermediate',     label:'Intermediate Type', emoji:'☀️',  scoreMin:12, color:'#3b82f6',
    peak:'9 AM–1 PM', sleep:'11 PM–12:30 AM', wake:'7–8 AM',
    desc:'The most flexible chronotype — you adapt reasonably well to different schedules. Your peak mental performance is mid-morning to early afternoon.',
    tips:['Most schedule-flexible type', 'Avoid very early or very late schedules if possible', 'Your energy post-lunch dip is shallower than other types', 'Napping 1–3 PM is beneficial but not critical'] },
  { key:'moderate_evening', label:'Moderate Evening Type', emoji:'🌙', scoreMin:7, color:'#8b5cf6',
    peak:'3–8 PM', sleep:'12:30–2 AM', wake:'8–9:30 AM',
    desc:'Your brain reaches full speed in the afternoon and evening. Creativity, analytical work, and social energy all peak later than the average person.',
    tips:['Protect your late afternoon/evening peak for deep work', 'Morning meetings and tasks should be low-stakes', 'Do not schedule important decisions before noon', 'Sleep regularity matters more for you — irregular schedules hit evening types harder'] },
  { key:'definite_evening', label:'Definite Evening Type', emoji:'🦉', scoreMin:0, color:'#ec4899',
    peak:'6–11 PM', sleep:'2–3 AM', wake:'9:30–11 AM',
    desc:'A true night owl — your cognitive peak is late evening and your body clock runs significantly later than society\'s norms. Early starts are genuinely harder for you biologically.',
    tips:['Your deepest creative and analytical work happens in evening', 'Morning cognitive impairment is real, not laziness — it is biology', 'Use mornings for routine tasks only', 'If forced into early schedules, use bright light therapy immediately on waking'] },
]

const FAQ = [
  { q:'Is chronotype genetic or can I change it?',
    a:'Chronotype is approximately 50% heritable — it is a real biological difference in circadian rhythm phase, not a lifestyle preference. The CLOCK, PER3, and CRY genes are among those implicated. Age shifts chronotype: children are early types, teens shift dramatically later (peak eveningness ~19–21 years), and adults gradually shift earlier again after 40–50. You can nudge chronotype by ±1–2 hours with consistent light exposure, meal timing, and exercise, but cannot fundamentally change your genetic baseline.' },
  { q:'Why are evening types disadvantaged in modern society?',
    a:'Society is built around morning norms: school at 8–9 AM, standard office hours starting 9 AM. Evening types forced to comply experience "social jetlag" — a mismatch between their biological clock and social schedule. Research by Till Roenneberg found each hour of social jetlag increases obesity risk by ~33% and is associated with higher rates of depression, cardiovascular disease, and lower academic performance. It is a systemic health issue, not a character flaw.' },
  { q:'How do I know if my chronotype is being suppressed?',
    a:"If you consistently sleep later on weekends than weekdays, that gap is your social jetlag. A gap of 2+ hours suggests significant chronotype suppression. Signs: can't wake without an alarm, feel best mentally in late evening, rely heavily on caffeine in mornings, feel fully alert only after noon." },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transform:open ? 'rotate(45deg)' : 'none', transition:'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function ChronotypeCalculator({ meta, category }) {
  const catColor  = category?.color || '#8b5cf6'
  const [answers, setAnswers] = useState({})
  const [openFaq, setOpenFaq] = useState(null)

  const answered   = Object.keys(answers).length
  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0)
  const maxScore   = QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map(o => o.v)), 0)
  const pct        = answered === QUESTIONS.length ? Math.round((totalScore / maxScore) * 100) : 0
  const chronotype = answered === QUESTIONS.length
    ? CHRONOTYPES.find(c => totalScore >= c.scoreMin) || CHRONOTYPES[CHRONOTYPES.length - 1]
    : null

  const setAnswer = (qid, val) => setAnswers(a => ({ ...a, [qid]:val }))

  const hint = chronotype
    ? `Chronotype: ${chronotype.label}. Score: ${totalScore}/${maxScore}. Peak performance: ${chronotype.peak}. Ideal sleep: ${chronotype.sleep}. Wake: ${chronotype.wake}.`
    : `Answer all ${QUESTIONS.length} questions to discover your chronotype.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>MEQ Questionnaire</div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>Answer all 6 questions based on your natural preferences — not your current schedule.</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {QUESTIONS.map((q, qi) => (
              <div key={q.id}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', lineHeight:1.5, marginBottom:7, fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ color:catColor, fontWeight:700 }}>{qi + 1}.</span> {q.text}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {q.options.map(opt => (
                    <button key={opt.v} onClick={() => setAnswer(q.id, opt.v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:7, border:`1.5px solid ${answers[q.id] === opt.v ? catColor : 'var(--border-2)'}`, background:answers[q.id] === opt.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', border:`2px solid ${answers[q.id] === opt.v ? catColor : 'var(--text-3)'}`, background:answers[q.id] === opt.v ? catColor : 'transparent', flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:answers[q.id] === opt.v ? catColor : 'var(--text)', fontWeight:answers[q.id] === opt.v ? 700 : 400 }}>{opt.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'8px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>Answered: <strong style={{ color:catColor }}>{answered}/{QUESTIONS.length}</strong></div>
          </div>
        </>}
        right={<>
          {/* Result card */}
          {chronotype ? (
            <div style={{ background:'var(--bg-card)', border:`1.5px solid ${chronotype.color}40`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', background:chronotype.color + '08' }}>
                <span style={{ fontSize:12, fontWeight:700, color:chronotype.color, fontFamily:"'Space Grotesk',sans-serif" }}>Your Chronotype</span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>Score: {totalScore}/{maxScore}</span>
              </div>
              <div style={{ padding:'18px 18px' }}>
                <div style={{ fontSize:40, marginBottom:6 }}>{chronotype.emoji}</div>
                <div style={{ fontSize:22, fontWeight:700, color:chronotype.color, fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>{chronotype.label}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16 }}>{chronotype.desc}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
                  {[{ l:'Peak', v:chronotype.peak }, { l:'Bedtime', v:chronotype.sleep }, { l:'Wake', v:chronotype.wake }].map((s, i) => (
                    <div key={i} style={{ padding:'9px 10px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
                      <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:3 }}>{s.l}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:chronotype.color, lineHeight:1.3 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Optimisation tips</div>
                {chronotype.tips.map((t, i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:chronotype.color, flexShrink:0, marginTop:5 }}/>
                    <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55 }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, padding:'24px 20px', marginBottom:14, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🦉🌅</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:6 }}>Answer all 6 questions</div>
              <div style={{ fontSize:12, color:'var(--text-3)' }}>{QUESTIONS.length - answered} remaining</div>
              <div style={{ marginTop:14, height:4, background:'var(--border)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${(answered / QUESTIONS.length) * 100}%`, background:catColor, borderRadius:2, transition:'width .3s' }}/>
              </div>
            </div>
          )}
          {chronotype && (
            <BreakdownTable title="Chronotype Summary" rows={[
              { label:'Type',         value:chronotype.label,  bold:true, highlight:true, color:chronotype.color },
              { label:'Score',        value:`${totalScore}/${maxScore}` },
              { label:'Peak window',  value:chronotype.peak,   color:chronotype.color },
              { label:'Ideal bedtime',value:chronotype.sleep },
              { label:'Ideal wake',   value:chronotype.wake },
            ]}/>
          )}
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* 🎯 INTERACTIVE — Social jetlag calculator */}
      <Sec title="🎯 Calculate your social jetlag" sub="The gap between your biology and your schedule">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          Social jetlag is the difference between when your body wants to sleep and when society forces you to. Enter your typical sleep times on work days vs free days.
        </p>
        {(() => {
          const [wdSleep, setWdSleep] = useState(23)
          const [wdWake,  setWdWake]  = useState(7)
          const [fdSleep, setFdSleep] = useState(1)
          const [fdWake,  setFdWake]  = useState(9)
          const wdMid    = ((wdSleep + (wdWake < wdSleep ? wdWake + 24 : wdWake)) / 2) % 24
          const fdMid    = ((fdSleep + (fdWake < fdSleep ? fdWake + 24 : fdWake)) / 2) % 24
          const jetlag   = Math.abs(fdMid - wdMid)
          const severity = jetlag < 1 ? { l:'Minimal', c:'#10b981' } : jetlag < 2 ? { l:'Moderate', c:'#f59e0b' } : { l:'Significant', c:'#ef4444' }
          const fmtH = h => `${Math.floor(h)}:${String(Math.round((h%1)*60)).padStart(2,'0')}`
          return (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                {[
                  { label:'Workday', sleep:wdSleep, setSleep:setWdSleep, wake:wdWake, setWake:setWdWake },
                  { label:'Free day', sleep:fdSleep, setSleep:setFdSleep, wake:fdWake, setWake:setFdWake },
                ].map((d, i) => (
                  <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:catColor, marginBottom:10 }}>{d.label}</div>
                    {[{ l:'Sleep', v:d.sleep, s:d.setSleep }, { l:'Wake', v:d.wake, s:d.setWake }].map((f, j) => (
                      <div key={j} style={{ marginBottom:j === 0 ? 8 : 0 }}>
                        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{f.l}</div>
                        <div style={{ display:'flex', height:32, border:'1px solid var(--border)', borderRadius:7, overflow:'hidden' }}>
                          <button onClick={() => f.s(v => (v - 1 + 24) % 24)} style={{ width:32, background:'var(--bg-card)', border:'none', cursor:'pointer', color:'var(--text)', fontSize:16 }}>−</button>
                          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--text)' }}>{String(f.v).padStart(2,'0')}:00</div>
                          <button onClick={() => f.s(v => (v + 1) % 24)} style={{ width:32, background:'var(--bg-card)', border:'none', cursor:'pointer', color:'var(--text)', fontSize:16 }}>+</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:8 }}>Sleep midpoint: {fmtH(i === 0 ? wdMid : fdMid)}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'13px 16px', background:severity.c + '12', borderRadius:10, border:`1px solid ${severity.c}30` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:severity.c }}>Social jetlag: {jetlag.toFixed(1)} hours — {severity.l}</span>
                </div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
                  {jetlag < 1 ? 'Your social and biological schedules are well aligned. Good circadian hygiene.' : jetlag < 2 ? 'Moderate social jetlag. Each hour of social jetlag increases metabolic disease risk by ~33%.' : 'Significant social jetlag. Associated with higher rates of depression, obesity, and cardiovascular risk. Consider adjusting your schedule where possible.'}
                </div>
              </div>
            </div>
          )
        })()}
      </Sec>

      {/* 🧠 INTERESTING */}
      <Sec title="Chronotype is biology, not a moral failing" sub="The science of social jetlag">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Chronotype is primarily genetic — approximately 50% heritable — and is driven by subtle differences in your circadian clock genes (CLOCK, PER3, CRY1). It is not a habit or discipline issue.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { title:'The population distribution', desc:'About 25% of people are definite morning types, 25% definite evening types, and 50% intermediate. Evening types are not rare — society simply normalises morning schedules.', color:catColor },
            { title:'Age-related shifting',         desc:'Chronotype is most evening-shifted during late adolescence (peak at ~19–21 years) and gradually shifts earlier with age. Most adults have fully shifted earlier by age 60.', color:'#f59e0b' },
            { title:'Social jetlag consequences',   desc:"Research by Till Roenneberg: each hour of social jetlag correlates with 33% increased obesity risk, more depression, and worse metabolic health — independent of total sleep duration. It's the mismatch, not just the sleep loss, that causes harm.", color:'#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ⚡ FUN FACT */}
      <Sec title="⚡ Chronotype facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'The colour of morning light (5500K–6500K, blue-rich) suppresses melatonin and shifts the clock earlier. Evening types can use bright morning light exposure to nudge their circadian rhythm 30–60 minutes earlier over 2–3 weeks.', icon:'💡' },
            { f:"The phrase 'the early bird catches the worm' has been statistically disproved for individual productivity. Evening types perform better on cognitive tests in the afternoon and evening than morning types at the same time.", icon:'🐦' },
            { f:'Several school districts in the US have trialled delayed start times (8:30–9 AM instead of 7:30 AM) for teenagers. Results consistently show improved attendance, grades, and mental health — and lower car accident rates among student drivers.', icon:'🏫' },
            { f:"Michael Breus's \"The Power of When\" (2016) classifies chronotypes into 4 animals: Lion (early), Bear (middle, ~55%), Wolf (late), and Dolphin (irregular/light sleeper). The Bear type correlates with the intermediate MEQ category.", icon:'🐻' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Chronotype explained">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
