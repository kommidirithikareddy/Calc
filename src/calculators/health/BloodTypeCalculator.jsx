import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ABO + Rh compatibility data
const BLOOD_TYPES = ['A+','A−','B+','B−','AB+','AB−','O+','O−']

// Can donate TO these types
const DONATE_TO = {
  'A+':  ['A+','AB+'],
  'A−':  ['A+','A−','AB+','AB−'],
  'B+':  ['B+','AB+'],
  'B−':  ['B+','B−','AB+','AB−'],
  'AB+': ['AB+'],
  'AB−': ['AB+','AB−'],
  'O+':  ['A+','B+','O+','AB+'],
  'O−':  ['A+','A−','B+','B−','O+','O−','AB+','AB−'],
}

// Can receive FROM these types
const RECEIVE_FROM = {
  'A+':  ['A+','A−','O+','O−'],
  'A−':  ['A−','O−'],
  'B+':  ['B+','B−','O+','O−'],
  'B−':  ['B−','O−'],
  'AB+': ['A+','A−','B+','B−','AB+','AB−','O+','O−'],
  'AB−': ['A−','B−','AB−','O−'],
  'O+':  ['O+','O−'],
  'O−':  ['O−'],
}

// Blood type population frequency (approx. global)
const FREQUENCY = {
  'O+':38,'A+':34,'B+':9,'AB+':3,'O−':7,'A−':6,'B−':2,'AB−':1,
}

const TRAITS = {
  'A+':  { personality:'Often described as organised, responsible, and detail-oriented.', plasma:'AB, A', platelets:'A, AB, O' },
  'A−':  { personality:'Thoughtful, reliable, and calm under pressure.', plasma:'AB, A', platelets:'A, AB, O' },
  'B+':  { personality:'Creative, flexible, and passionate.', plasma:'AB, B', platelets:'B, AB, O' },
  'B−':  { personality:'Independent, strong-willed, and creative.', plasma:'AB, B', platelets:'B, AB, O' },
  'AB+': { personality:'Rational, adaptable, and able to see multiple perspectives.', plasma:'AB', platelets:'AB' },
  'AB−': { personality:'Unique and complex — the rarest type.', plasma:'AB', platelets:'AB' },
  'O+':  { personality:'Practical, confident, and natural leaders.', plasma:'A, B, AB, O', platelets:'A, B, AB, O' },
  'O−':  { personality:'Independent, determined, and the universal donor.', plasma:'A, B, AB, O', platelets:'A, B, AB, O' },
}

const FAQ = [
  { q:'What do blood types mean?',
    a:'Blood type is determined by antigens (proteins) on the surface of red blood cells. The ABO system classifies blood as A, B, AB, or O based on which antigens are present. The Rh system adds a positive (+) or negative (−) based on whether the Rh(D) antigen is present. Your blood type is inherited from both parents and stays the same for life.' },
  { q:'Why does blood type compatibility matter for transfusions?',
    a:"If you receive incompatible blood, your immune system recognises the foreign antigens and attacks the transfused cells — a potentially life-threatening reaction called a haemolytic transfusion reaction. This is why blood banks carefully match blood types before transfusions. In emergencies, O− (universal donor) can be given to anyone. AB+ people are universal recipients." },
  { q:'What is the rarest blood type?',
    a:'AB− is the rarest, occurring in approximately 1% of the global population. O+ is the most common at around 38%. Rh-negative types (A−, B−, AB−, O−) are collectively rarer, making up about 15–16% of the population. Some rare subtypes beyond ABO/Rh (like Bombay blood group) are extremely rare — found in fewer than 1 in 10,000 people.' },
  { q:'Can I find out my blood type at home?',
    a:'Yes — home blood type kits are available from pharmacies and online retailers. They use a small lancet to collect a blood drop, which is applied to test cards with anti-A, anti-B, and anti-D antibodies. Agglutination (clumping) indicates the presence of the corresponding antigen. Results are available in minutes. For medical purposes, confirmation by a laboratory is recommended.' },
  { q:'Do blood types affect health?',
    a:'Research suggests some associations: Type O has a lower risk of cardiovascular disease and blood clots. Type A may have a slightly higher risk of certain cancers and stomach cancer. AB types may have higher risk of cognitive impairment. Type O had lower COVID-19 severity in some studies. These are statistical associations in populations — your blood type alone does not determine your individual health.' },
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

function InsightSection({ selected, freq, donateTo, receiveFrom, isUniversalDonor, isUniversalReceiver, trait, catColor }) {
  let title = ''
  let message = ''
  let value = ''

  if (isUniversalDonor) {
    title = 'Most valuable emergency donor type'
    message = 'O− red cells can be transfused to any blood type in emergencies, which makes this type especially important for trauma care and urgent hospital use.'
    value = 'Universal donor'
  } else if (isUniversalReceiver) {
    title = 'Widest receiving compatibility'
    message = 'AB+ can receive red cells from every ABO and Rh type, making it the universal recipient for red blood cell transfusions.'
    value = 'Universal recipient'
  } else if (receiveFrom.length <= 2) {
    title = 'Narrow compatible donor pool'
    message = 'Your blood type has relatively limited compatible donor options, which makes accurate typing and blood bank availability especially important.'
    value = `${receiveFrom.length} compatible donor types`
  } else {
    title = 'Balanced compatibility profile'
    message = 'Your blood type has a moderate compatibility range for receiving and donating, which gives some flexibility while still requiring correct matching.'
    value = `${donateTo.length} donate-to types`
  }

  return (
    <Sec title="Your blood type insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor + '12', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {selected} blood type
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Population', value:`${freq}%` },
            { label:'Donate to', value:String(donateTo.length) },
            { label:'Receive from', value:String(receiveFrom.length) },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gap:10 }}>
          <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
              Compatibility role
            </div>
            <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
              {value}
            </p>
          </div>

          <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
              Common trait note
            </div>
            <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
              {trait.personality}
            </p>
          </div>
        </div>
      </div>
    </Sec>
  )
}

function DonationGuide({ selected, donateTo, receiveFrom, isUniversalDonor, isUniversalReceiver, catColor }) {
  const actions = isUniversalDonor
    ? [
        'Your blood is highly valuable in emergencies because it can be used before full typing is completed.',
        'If eligible, regular blood donation can make a major impact for trauma, surgery, and emergency departments.',
        `Keep a record of your blood type: ${selected}. Hospitals especially value dependable O− donors.`,
      ]
    : isUniversalReceiver
    ? [
        'You can receive red cells from any blood type, which gives the broadest transfusion compatibility.',
        'Your own donations still matter, even though your receiving compatibility is wide.',
        `Keep your blood type documented as ${selected} for medical forms and emergency reference.`,
      ]
    : [
        `You can donate safely to: ${donateTo.join(', ')}.`,
        `You can receive safely from: ${receiveFrom.join(', ')}.`,
        'If you donate blood, platelets, or plasma, exact usefulness depends on product type and local blood bank needs.',
      ]

  return (
    <Sec title="Donation and receiving guide" sub="What your type means in practice">
      <div style={{ display:'grid', gap:10 }}>
        {actions.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:catColor + '18', color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
              {i + 1}
            </div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function PlasmaPlateletSection({ trait, selected, catColor }) {
  return (
    <Sec title="Plasma and platelet note" sub="Different from red cell rules">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12 }}>
        <div style={{ padding:'14px', borderRadius:12, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            Plasma compatibility
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {trait.plasma}
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
            Compatible plasma groups commonly associated with {selected}.
          </p>
        </div>

        <div style={{ padding:'14px', borderRadius:12, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            Platelet compatibility
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {trait.platelets}
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
            Platelet matching can vary more than standard red cell transfusion rules.
          </p>
        </div>
      </div>

      <p style={{ margin:'14px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
        Plasma and platelet transfusion compatibility is not the same as red blood cell compatibility. Clinical matching can depend on context, inventory, and hospital protocol.
      </p>
    </Sec>
  )
}

function QuickFacts({ selected, freq, isUniversalDonor, isUniversalReceiver, catColor }) {
  const rarityLabel =
    freq <= 2 ? 'Extremely rare'
    : freq <= 7 ? 'Less common'
    : freq <= 15 ? 'Moderately common'
    : 'Very common'

  const factCards = [
    {
      title:'Rarity',
      value:rarityLabel,
      text:`${selected} appears in about ${freq}% of the population.`,
    },
    {
      title:'Emergency role',
      value:isUniversalDonor ? 'Critical donor' : isUniversalReceiver ? 'Flexible recipient' : 'Standard match',
      text:isUniversalDonor
        ? 'Often prioritised in urgent settings before full typing.'
        : isUniversalReceiver
        ? 'Can receive from every standard ABO/Rh red cell type.'
        : 'Requires normal blood type matching before transfusion.',
    },
    {
      title:'Medical note',
      value:'Always verify',
      text:'For real transfusions, laboratory confirmation is required even if you already know your type.',
    },
  ]

  return (
    <Sec title="Quick facts" sub="Fast, useful context">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
        {factCards.map((card, i) => (
          <div key={i} style={{ padding:'13px 12px', borderRadius:10, background:i === 0 ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor + '40' : 'var(--border)'}` }}>
            <div style={{ fontSize:10.5, color:i === 0 ? catColor : 'var(--text-3)', marginBottom:5, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
              {card.title}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
              {card.value}
            </div>
            <p style={{ margin:0, fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function WhyItMatters({ selected, catColor }) {
  return (
    <Sec title="Why your blood type matters" sub="More than a label">
      <div style={{ display:'grid', gap:10 }}>
        {[
          `Your blood type (${selected}) is essential information for surgeries, emergencies, pregnancy care, and transfusion planning.`,
          'Blood banks need a balanced supply of common and rare types to keep hospitals prepared.',
          'Knowing your blood type can make forms, emergencies, and donation eligibility checks much easier.',
        ].map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)', display:'flex', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:catColor, marginTop:6, flexShrink:0 }} />
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function BloodTypeCalculator({ meta, category }) {
  const catColor = category?.color || '#ef4444'
  const [selected, setSelected] = useState('O+')
  const [openFaq, setOpenFaq] = useState(null)

  const donateTo = DONATE_TO[selected] || []
  const receiveFrom = RECEIVE_FROM[selected] || []
  const trait = TRAITS[selected]
  const freq = FREQUENCY[selected]

  const isUniversalDonor = selected === 'O−'
  const isUniversalReceiver = selected === 'AB+'

  const storyColors = [catColor, '#0ea5e9', '#f59e0b']
  const storySofts = [catColor + '18', '#e0f2fe', '#fef3c7']

  const stories = [
    {
      label:'Your blood type',
      headline:`${selected} — ${freq}% of the global population`,
      detail:`${isUniversalDonor ? 'O− is the universal donor — your red cells can be given to anyone in an emergency. Extremely valuable for trauma care.' : isUniversalReceiver ? 'AB+ is the universal recipient — you can receive any blood type. Only ~3% of people are AB+.' : `${selected} occurs in approximately ${freq}% of people worldwide.`}`,
    },
    {
      label:'Donation',
      headline:`You can donate to ${donateTo.length} blood type${donateTo.length !== 1 ? 's' : ''}`,
      detail:`Your blood can be given to: ${donateTo.join(', ')}. ${isUniversalDonor ? 'You are the most needed blood type in hospitals — O− is used in emergencies before blood typing.' : 'Consider donating — your type may be rarer than you think.'}`,
    },
    {
      label:'Receiving',
      headline:`You can receive from ${receiveFrom.length} blood type${receiveFrom.length !== 1 ? 's' : ''}`,
      detail:`You can safely receive blood from: ${receiveFrom.join(', ')}. ${isUniversalReceiver ? 'As AB+, you can receive any blood type.' : receiveFrom.length <= 2 ? 'Your compatible donor pool is small — this is why hospitals maintain O− reserves.' : 'You have a reasonably broad compatible donor pool.'}`,
    },
  ]

  const hint = `Blood type: ${selected}. Population: ${freq}%. Can donate to: ${donateTo.join(', ')}. Can receive from: ${receiveFrom.join(', ')}.${isUniversalDonor ? ' Universal donor.' : ''}${isUniversalReceiver ? ' Universal recipient.' : ''}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
              Select your blood type
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
              {BLOOD_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  style={{
                    padding:'12px 4px',
                    borderRadius:10,
                    border:`1.5px solid ${selected === t ? catColor : 'var(--border-2)'}`,
                    background:selected === t ? catColor + '12' : 'var(--bg-raised)',
                    cursor:'pointer',
                    fontFamily:"'Space Grotesk',sans-serif",
                    transition:'all .15s',
                  }}
                >
                  <div style={{ fontSize:16, fontWeight:700, color:selected === t ? catColor : 'var(--text)', textAlign:'center' }}>{t}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)', textAlign:'center', marginTop:2 }}>{FREQUENCY[t]}%</div>
                </button>
              ))}
            </div>

            {isUniversalDonor && (
              <div style={{ padding:'10px 13px', background:'#d1fae5', borderRadius:9, border:'1px solid #10b98130', marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#065f46' }}>🩸 Universal Donor</div>
                <div style={{ fontSize:11, color:'#047857', marginTop:3 }}>O− red cells can be given to any blood type — the most critical in emergencies.</div>
              </div>
            )}

            {isUniversalReceiver && (
              <div style={{ padding:'10px 13px', background:'#dbeafe', borderRadius:9, border:'1px solid #3b82f630', marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1e40af' }}>🎁 Universal Recipient</div>
                <div style={{ fontSize:11, color:'#1d4ed8', marginTop:3 }}>AB+ can receive red cells from any blood type.</div>
              </div>
            )}

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
                Global frequency
              </div>
              {BLOOD_TYPES.map(t => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                  <div style={{ width:28, fontSize:11, fontWeight:t === selected ? 700 : 400, color:t === selected ? catColor : 'var(--text-2)', flexShrink:0 }}>
                    {t}
                  </div>
                  <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${(FREQUENCY[t] / 40) * 100}%`, background:t === selected ? catColor : catColor + '45', borderRadius:3, transition:'width .4s' }} />
                  </div>
                  <div style={{ fontSize:10, fontWeight:t === selected ? 700 : 400, color:t === selected ? catColor : 'var(--text-3)', minWidth:28, textAlign:'right' }}>
                    {FREQUENCY[t]}%
                  </div>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Blood Type {selected}</span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates on selection</span>
              </div>
              <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                {stories.map((s, i) => (
                  <div key={i} style={{ borderLeft:`3px solid ${storyColors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:storySofts[i] }}>
                    <div style={{ fontSize:9, fontWeight:700, color:storyColors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <BreakdownTable
              title="Compatibility Summary"
              rows={[
                { label:'Blood type', value:selected, bold:true, highlight:true, color:catColor },
                { label:'Population', value:`~${freq}% of people` },
                { label:'Donate to', value:donateTo.join(', '), color:'#22a355' },
                { label:'Receive from', value:receiveFrom.join(', '), color:'#3b82f6' },
                {
                  label:'Universal role',
                  value:isUniversalDonor ? 'Universal donor' : isUniversalReceiver ? 'Universal recipient' : 'Standard',
                  color:isUniversalDonor || isUniversalReceiver ? catColor : 'var(--text-3)',
                },
              ]}
            />
            <AIHintCard hint={hint} />
          </>
        }
      />

      <InsightSection
        selected={selected}
        freq={freq}
        donateTo={donateTo}
        receiveFrom={receiveFrom}
        isUniversalDonor={isUniversalDonor}
        isUniversalReceiver={isUniversalReceiver}
        trait={trait}
        catColor={catColor}
      />

      <DonationGuide
        selected={selected}
        donateTo={donateTo}
        receiveFrom={receiveFrom}
        isUniversalDonor={isUniversalDonor}
        isUniversalReceiver={isUniversalReceiver}
        catColor={catColor}
      />

      <PlasmaPlateletSection
        trait={trait}
        selected={selected}
        catColor={catColor}
      />

      <QuickFacts
        selected={selected}
        freq={freq}
        isUniversalDonor={isUniversalDonor}
        isUniversalReceiver={isUniversalReceiver}
        catColor={catColor}
      />

      <Sec title="Full blood type compatibility matrix" sub="Red cell transfusion compatibility">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          This table shows which blood types can safely receive red cells from which donors. Plasma and platelet compatibility follows different rules.
        </p>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr>
                <th style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-3)', borderBottom:'1px solid var(--border)' }}>
                  Donor →
                </th>
                {BLOOD_TYPES.map(t => (
                  <th key={t} style={{ padding:'6px 8px', textAlign:'center', fontSize:10, fontWeight:700, color:t === selected ? catColor : 'var(--text-3)', borderBottom:'1px solid var(--border)', minWidth:38 }}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOOD_TYPES.map(recipient => (
                <tr key={recipient} style={{ background:recipient === selected ? catColor + '08' : 'transparent' }}>
                  <td style={{ padding:'7px 10px', fontSize:11, fontWeight:recipient === selected ? 700 : 500, color:recipient === selected ? catColor : 'var(--text)', borderBottom:'0.5px solid var(--border)' }}>
                    {recipient} receives
                  </td>
                  {BLOOD_TYPES.map(donor => {
                    const compatible = RECEIVE_FROM[recipient]?.includes(donor)
                    return (
                      <td key={donor} style={{ padding:'7px 8px', textAlign:'center', borderBottom:'0.5px solid var(--border)', background:compatible ? '#d1fae530' : 'transparent' }}>
                        {compatible
                          ? <span style={{ fontSize:13, color:'#10b981' }}>✓</span>
                          : <span style={{ fontSize:11, color:'var(--border)', opacity:0.4 }}>—</span>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <WhyItMatters
        selected={selected}
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Everything about blood types">
        {FAQ.map((f, i) => (
          <Acc
            key={i}
            q={f.q}
            a={f.a}
            open={openFaq === i}
            onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            catColor={catColor}
          />
        ))}
      </Sec>
    </div>
  )
}