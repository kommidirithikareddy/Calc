import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

function pad(n) { return String(n).padStart(2, '0') }

export default function AgeCalculator() {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`

  const [dob,    setDob]    = useState('1995-06-15')
  const [target, setTarget] = useState(todayStr)

  const birth = new Date(dob)
  const end   = new Date(target)

  let years = end.getFullYear() - birth.getFullYear()
  let months = end.getMonth() - birth.getMonth()
  let days = end.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) { years--; months += 12 }

  const totalDays    = Math.round((end - birth) / 86400000)
  const totalWeeks   = Math.floor(totalDays / 7)
  const totalMonths  = years * 12 + months
  const totalHours   = totalDays * 24
  const nextBday     = new Date(end.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBday <= end) nextBday.setFullYear(nextBday.getFullYear() + 1)
  const daysToNextBday = Math.round((nextBday - end) / 86400000)

  const isValid = !isNaN(birth.getTime()) && !isNaN(end.getTime()) && birth <= end
  const age = `${years}y ${months}m ${days}d`

  const hint = isValid
    ? `You are ${years} years, ${months} months and ${days} days old — that's ${totalDays.toLocaleString()} days lived! Your next birthday is in ${daysToNextBday} days.`
    : 'Enter a valid date of birth to calculate your age.'

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Date Details</div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
              Date of Birth
            </label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '11px 14px', fontSize: '14px', fontWeight: 500, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
              Age at Date <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 400 }}>(defaults to today)</span>
            </label>
            <input type="date" value={target} onChange={e => setTarget(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '11px 14px', fontSize: '14px', fontWeight: 500, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          <button onClick={() => setTarget(todayStr)}
            style={{ padding: '10px 18px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans' }}>
            Reset to Today
          </button>

          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          {isValid ? (
            <>
              {/* Big age display */}
              <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '14px', padding: '22px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Exact Age</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '10px' }}>
                  {[['Years', years], ['Months', months], ['Days', days]].map(([u, v]) => (
                    <div key={u} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{v}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{u}</div>
                    </div>
                  ))}
                </div>
              </div>

              <BreakdownTable title="Age in Different Units" rows={[
                { label: 'Total Months',  value: totalMonths.toLocaleString(), color: '#6366f1' },
                { label: 'Total Weeks',   value: totalWeeks.toLocaleString(),  color: '#3b82f6' },
                { label: 'Total Days',    value: totalDays.toLocaleString(),   color: '#6366f1', bold: true },
                { label: 'Total Hours',   value: totalHours.toLocaleString() },
              ]} />

              <BreakdownTable title="Birthday Info" rows={[
                { label: 'Next Birthday',       value: nextBday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Days Until Birthday', value: daysToNextBday + ' days', color: '#10b981', bold: true },
                { label: 'Day of Birth',        value: birth.toLocaleDateString('en-US', { weekday: 'long' }) },
              ]} />

              <AIHintCard hint={hint} />
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', border: '0.5px dashed var(--border)', borderRadius: '12px' }}>
              Enter a valid date of birth to see your age
            </div>
          )}
        </>
      }
    />
  )
}
