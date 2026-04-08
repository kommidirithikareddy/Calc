import { useState, useRef, useEffect } from 'react'

export default function AIHintCard({ hint, catColor = '#6366f1' }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: hint || 'Hi! Ask me anything about this calculator.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const bottomRef = useRef(null)

  // Update first message if hint changes (different calculator)
  useEffect(() => {
    setMessages([{ role: 'ai', text: hint || 'Hi! Ask me anything about this calculator.' }])
  }, [hint])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setInput('')
    setError('')
    setExpanded(true)
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

  if (!hint) return null

  return (
    <>
      <div className="ai-hint-card" style={{ '--cat': catColor }}>
        {/* Header */}
        <div className="ahc-header" onClick={() => setExpanded(e => !e)}>
          <div className="ahc-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div className="ahc-header-text">
            <div className="ahc-title">AI Assistant</div>
            <div className="ahc-sub">Powered by Cohere · Ask anything</div>
          </div>
          <div className="ahc-free-badge">Free</div>
          <span className="ahc-toggle">{expanded ? '▲' : '▼'}</span>
        </div>

        {/* Static hint (always visible) */}
        <div className="ahc-hint">{hint}</div>

        {/* Expandable chat */}
        {expanded && (
          <>
            <div className="ahc-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ahc-msg ahc-msg--${msg.role}`}>
                  <div className="ahc-bubble">{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="ahc-msg ahc-msg--ai">
                  <div className="ahc-bubble ahc-bubble--loading">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              {error && <div className="ahc-error">{error}</div>}
              <div ref={bottomRef} />
            </div>

            <div className="ahc-input-row">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about this calculator..."
                disabled={loading}
                className="ahc-input"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="ahc-send"
              >
                {loading ? '⏳' : '↑'}
              </button>
            </div>
          </>
        )}

        {/* Ask AI button when collapsed */}
        {!expanded && (
          <button className="ahc-ask-btn" onClick={() => setExpanded(true)}>
            Ask AI →
          </button>
        )}
      </div>

      <style>{`
        .ai-hint-card {
          background: var(--accent-light, #6366f108);
          border: 1px solid var(--accent-mid, #6366f130);
          border-radius: 12px;
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }
        .ahc-header {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 14px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
          background: var(--cat, #6366f1)08;
        }
        .ahc-header:hover { background: var(--cat, #6366f1)12; }
        .ahc-icon {
          width: 28px; height: 28px;
          background: var(--cat, #6366f1);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ahc-header-text { flex: 1; }
        .ahc-title { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'Space Grotesk', sans-serif; }
        .ahc-sub { font-size: 10px; color: var(--text-3); }
        .ahc-free-badge {
          font-size: 9px; font-weight: 700;
          background: #10b98120; color: #10b981;
          padding: 3px 8px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .ahc-toggle { font-size: 10px; color: var(--text-3); }
        .ahc-hint {
          font-size: 11.5px;
          color: var(--accent, var(--text-2));
          line-height: 1.65;
          padding: 10px 14px;
        }
        .ahc-ask-btn {
          font-size: 10px; font-weight: 700;
          color: var(--cat, #6366f1);
          background: none; border: none;
          cursor: pointer;
          padding: 0 14px 11px;
          font-family: 'DM Sans', sans-serif;
          transition: opacity .1s;
        }
        .ahc-ask-btn:hover { opacity: 0.7; }
        .ahc-messages {
          max-height: 220px;
          overflow-y: auto;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--border);
        }
        .ahc-msg { display: flex; }
        .ahc-msg--user { justify-content: flex-end; }
        .ahc-msg--ai { justify-content: flex-start; }
        .ahc-bubble {
          max-width: 85%;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.6;
          font-family: 'DM Sans', sans-serif;
        }
        .ahc-msg--user .ahc-bubble {
          background: var(--cat, #6366f1);
          color: #fff;
          border-radius: 10px 10px 3px 10px;
        }
        .ahc-msg--ai .ahc-bubble {
          background: var(--bg-raised);
          color: var(--text);
          border: 0.5px solid var(--border);
          border-radius: 10px 10px 10px 3px;
        }
        .ahc-bubble--loading {
          display: flex; gap: 4px; align-items: center;
        }
        .ahc-bubble--loading span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--cat, #6366f1);
          animation: ahc-bounce 1s infinite;
        }
        .ahc-bubble--loading span:nth-child(2) { animation-delay: .2s; }
        .ahc-bubble--loading span:nth-child(3) { animation-delay: .4s; }
        .ahc-error {
          font-size: 11px; color: #ef4444;
          background: #ef444410;
          border: 1px solid #ef444430;
          border-radius: 8px; padding: 7px 12px;
        }
        .ahc-input-row {
          display: flex; gap: 8px; align-items: center;
          padding: 10px 12px;
          border-top: 1px solid var(--border);
        }
        .ahc-input {
          flex: 1;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 7px 11px;
          font-size: 12px;
          background: var(--bg-input, var(--bg-card));
          color: var(--text);
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ahc-input:focus { border-color: var(--cat, #6366f1); }
        .ahc-send {
          width: 34px; height: 34px;
          border-radius: 8px; border: none;
          background: var(--cat, #6366f1);
          color: #fff;
          cursor: pointer;
          font-size: 15px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity .15s;
        }
        .ahc-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .ahc-send:not(:disabled):hover { opacity: 0.85; }
        @keyframes ahc-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
