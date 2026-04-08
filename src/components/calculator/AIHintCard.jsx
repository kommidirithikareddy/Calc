import { useState, useRef, useEffect } from 'react'

export default function AIHintCard({ hint, catColor = '#6366f1' }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: hint || 'Hi! Ask me anything about this calculator.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setInput('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context: hint })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError('Something went wrong. Please try again.')
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      }
    } catch (e) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginTop: 16,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: catColor + '08',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: catColor + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>✨</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
            AI Assistant
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Powered by Cohere · Ask anything</div>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: 9, fontWeight: 700,
          background: '#10b98120', color: '#10b981',
          padding: '3px 8px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '.05em'
        }}>Free</div>
      </div>

      {/* Messages */}
      <div style={{
        maxHeight: 240,
        overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '9px 13px',
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? catColor : 'var(--bg-raised)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 12.5,
              lineHeight: 1.6,
              fontFamily: "'DM Sans',sans-serif",
              border: msg.role === 'user' ? 'none' : '0.5px solid var(--border)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '9px 14px',
              borderRadius: '12px 12px 12px 4px',
              background: 'var(--bg-raised)',
              border: '0.5px solid var(--border)',
              display: 'flex', gap: 4, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: catColor,
                  animation: 'bounce 1s infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            fontSize: 11, color: '#ef4444',
            background: '#ef444410', border: '1px solid #ef444430',
            borderRadius: 8, padding: '7px 12px',
          }}>{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 14px',
        borderTop: '0.5px solid var(--border)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this calculator..."
          disabled={loading}
          style={{
            flex: 1,
            border: `1.5px solid var(--border)`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12.5,
            background: 'var(--bg-input, var(--bg-card))',
            color: 'var(--text)',
            outline: 'none',
            fontFamily: "'DM Sans',sans-serif",
            opacity: loading ? 0.6 : 1,
          }}
          onFocus={e => e.target.style.borderColor = catColor}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            border: 'none',
            background: loading || !input.trim() ? 'var(--bg-raised)' : catColor,
            color: loading || !input.trim() ? 'var(--text-3)' : '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            transition: 'all .15s',
            flexShrink: 0,
          }}
        >
          {loading ? '⏳' : '↑'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
