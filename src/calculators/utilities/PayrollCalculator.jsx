import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'When does overtime pay kick in?', a: 'In the US, federal law (FLSA) requires overtime pay (1.5× regular rate) for hours over 40 in a workweek for non-exempt employees. Some states have daily overtime thresholds (California: over 8 hours/day). Exempt employees (salaried managers, professionals earning over $684/week) are not entitled to overtime.' },
  { q: 'What is the difference between gross and net pay?', a: 'Gross pay is the total amount earned before any deductions. Net pay ("take-home pay") is what the employee actually receives after deducting federal income tax, state income tax, Social Security (6.2%), Medicare (1.45%), health insurance premiums, and retirement contributions.' },
  { q: 'What does it cost the employer per employee beyond the salary?', a: 'Employer costs typically add 20–30% on top of gross wages: employer FICA matching (7.65%), unemployment insurance (FUTA/SUTA ~3–5%), workers\' compensation insurance (varies), and benefits like health insurance, PTO, and retirement matching.' },
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

export default function PayrollCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [employees, setEmployees] = useState([
    { name: 'Alice Johnson', rate: 25, hours: 45, payType: 'hourly' },
    { name: 'Bob Smith', rate: 60000, hours: 40, payType: 'salary' },
  ])
  const [otMultiplier, setOtMultiplier] = useState(1.5)
  const [openFaq, setOpenFaq] = useState(null)

  const update = (i, f, v) => { const n = [...employees]; n[i] = { ...n[i], [f]: v }; setEmployees(n) }

  const calculated = employees.map(emp => {
    const regularHours = Math.min(emp.hours, 40)
    const otHours = Math.max(0, emp.hours - 40)
    let grossPay
    if (emp.payType === 'hourly') {
      grossPay = regularHours * emp.rate + otHours * emp.rate * otMultiplier
    } else {
      // Salary: weekly pay = annual / 52
      const weeklyRate = emp.rate / 52
      const hourlyEq = weeklyRate / 40
      grossPay = weeklyRate + otHours * hourlyEq * otMultiplier
    }
    const fica = grossPay * 0.0765
    const estTax = grossPay * 0.15
    const netPay = grossPay - fica - estTax
    return { ...emp, regularHours, otHours, grossPay, fica, estTax, netPay }
  })

  const totalGross = calculated.reduce((s, e) => s + e.grossPay, 0)
  const totalNet = calculated.reduce((s, e) => s + e.netPay, 0)
  const hint = `${employees.length} employee(s): total gross $${totalGross.toFixed(2)}/week, total net $${totalNet.toFixed(2)}/week.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Payroll</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Gross = Regular pay + OT × {otMultiplier}×</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${totalGross.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>total gross/week</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>OT multiplier: {otMultiplier}×</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 1.5, 2].map(m => (
                <button key={m} onClick={() => setOtMultiplier(m)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${otMultiplier === m ? C : 'var(--border-2)'}`, background: otMultiplier === m ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: otMultiplier === m ? 700 : 500, color: otMultiplier === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{m}×</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Employees</label>
              <button onClick={() => setEmployees([...employees, { name: `Employee ${employees.length + 1}`, rate: 20, hours: 40, payType: 'hourly' }])}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            {employees.map((emp, i) => (
              <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '12px', marginBottom: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={emp.name} onChange={e => update(i, 'name', e.target.value)}
                    style={{ flex: 1, height: 32, border: '1px solid var(--border-2)', borderRadius: 6, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }} />
                  {employees.length > 1 && <button onClick={() => setEmployees(employees.filter((_, j) => j !== i))}
                    style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13 }}>×</button>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {[['hourly', 'Hourly'], ['salary', 'Salary']].map(([v, l]) => (
                    <button key={v} onClick={() => update(i, 'payType', v)}
                      style={{ flex: 1, padding: '5px', borderRadius: 7, border: `1px solid ${emp.payType === v ? C : 'var(--border-2)'}`, background: emp.payType === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: emp.payType === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[[emp.payType === 'hourly' ? 'Rate ($/hr)' : 'Annual salary ($)', 'rate'], ['Hours this week', 'hours']].map(([l, f]) => (
                    <div key={f}>
                      <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                      <input type="number" value={emp[f]} onChange={e => update(i, f, +e.target.value)}
                        style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 13, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}
        right={<>
          {calculated.map((emp, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{emp.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[{ l: 'Regular hrs', v: emp.regularHours }, { l: 'OT hrs', v: emp.otHours, c: emp.otHours > 0 ? '#f59e0b' : 'var(--text-3)' }, { l: 'Gross pay', v: `$${emp.grossPay.toFixed(2)}`, c: C }, { l: 'Net pay', v: `$${emp.netPay.toFixed(2)}` }].map((m, j) => (
                  <div key={j} style={{ padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>{m.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <BreakdownTable title="Payroll summary" rows={[
            { label: 'Total gross', value: `$${totalGross.toFixed(2)}`, bold: true, highlight: true, color: C },
            { label: 'Est. deductions', value: `$${(totalGross - totalNet).toFixed(2)}` },
            { label: 'Total net', value: `$${totalNet.toFixed(2)}` },
            { label: 'Monthly (×4.33)', value: `$${(totalGross * 4.33).toFixed(2)}` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
