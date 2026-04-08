import { useState, useEffect } from 'react'

export default function ContactModal({ isOpen, onClose }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('General')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setStatus('sending')
    // Simulate sending — replace with your actual email service (Resend, Formspree, etc.)
    await new Promise(r => setTimeout(r, 1200))
    setStatus('sent')
  }

  function handleReset() {
    setName(''); setEmail(''); setSubject('General'); setMessage('')
    setStatus('idle')
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 9, fontSize: 13,
    background: 'var(--bg-raised)',
    color: 'var(--text)', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        animation: 'fadeIn .2s ease',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 18,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        zIndex: 1001,
        overflow: 'hidden',
        animation: 'slideUp .25s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: "'Manrope', sans-serif" }}>Contact Us</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>We typically respond within 24–48 hours</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-raised)',
            color: 'var(--text-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {status === 'sent' ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>Message sent!</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>
                Thanks for reaching out. We'll get back to you within 24–48 hours.
              </div>
              <button onClick={() => { handleReset(); onClose() }} style={{
                padding: '10px 24px', borderRadius: 10,
                background: '#6366f1', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>Close</button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Name *</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Email *</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {['General', 'Bug Report', 'Feature Request', 'Calculator Inaccuracy', 'AI Assistant Issue', 'Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Message *</label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  required rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={status === 'sending'} style={{
                padding: '12px', borderRadius: 10,
                background: status === 'sending' ? 'var(--border)' : '#6366f1',
                color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 700,
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all .15s',
              }}>
                {status === 'sending' ? 'Sending...' : 'Send Message →'}
              </button>

            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @media (max-width: 520px) {
          /* modal goes full width on mobile */
        }
      `}</style>
    </>
  )
}
