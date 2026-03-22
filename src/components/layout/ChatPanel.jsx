import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../hooks/useChat'
import { useLocation } from 'react-router-dom'

/* ── Star rating component ── */
function StarRating({ onRate }) {
  const [hovered, setHovered] = useState(0)
  const [rated, setRated] = useState(0)

  function rate(n) {
    setRated(n)
    onRate?.(n)
  }

  return (
    <div className="cp-stars">
      <span className="cp-stars-label">Was this helpful?</span>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`cp-star ${n <= (hovered || rated) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => rate(n)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

/* ── Message bubble ── */
function MessageBubble({ msg, isLast }) {
  const isUser = msg.role === 'user'

  // Parse **bold** markdown simply
  function parseBold(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i}>{p}</strong> : p
    )
  }

  // Split into paragraphs / numbered lists
  function renderContent(content) {
    const lines = content.split('\n').filter(l => l.trim())
    return lines.map((line, i) => {
      const isNum = /^\d+\./.test(line.trim())
      return (
        <p key={i} className={isNum ? 'cp-msg-step' : 'cp-msg-para'}>
          {isNum && <span className="cp-step-num">{line.match(/^\d+/)[0]}</span>}
          {parseBold(isNum ? line.replace(/^\d+\.?\s*/, '') : line)}
        </p>
      )
    })
  }

  return (
    <div className={`cp-msg ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="cp-msg-avatar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
      )}
      <div className="cp-msg-bubble">
        {renderContent(msg.content)}
        {!isUser && isLast && <StarRating />}
      </div>
    </div>
  )
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className="cp-msg assistant">
      <div className="cp-msg-avatar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <div className="cp-msg-bubble typing">
        <span className="cp-dot" />
        <span className="cp-dot" />
        <span className="cp-dot" />
      </div>
    </div>
  )
}

/* ── Suggestion chips ── */
const SUGGESTIONS = [
  'Explain this result',
  'What does this mean?',
  'How can I improve this?',
  'What are my next steps?',
  'Give me a tip',
]

/* ── Main ChatPanel ── */
export default function ChatPanel({ onClose, calcContext }) {
  const location = useLocation()
  const pathParts = location.pathname.split('/').filter(Boolean)
  const calcName = pathParts.length >= 3
    ? pathParts[2].split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') + ' Calculator'
    : 'CalC'

  const { messages, sendMessage, isLoading, clearMessages } = useChat({
    calculatorName: calcName,
    calculatorContext: calcContext || '',
  })

  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleSend() {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="cp-panel">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div className="cp-header-text">
            <div className="cp-header-title">CalC AI</div>
            <div className="cp-header-sub">{calcName}</div>
          </div>
          <div className="cp-header-actions">
            <button className="cp-icon-btn" onClick={clearMessages} title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.3"/>
              </svg>
            </button>
            <button className="cp-icon-btn" onClick={onClose} title="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Context bar (shows when on a calculator page) */}
        {calcContext && (
          <div className="cp-context-bar">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            I can see your current inputs and result
          </div>
        )}

        {/* Messages */}
        <div className="cp-messages">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              isLast={i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 2 && !isLoading && (
          <div className="cp-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="cp-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="cp-input-row">
          <input
            ref={inputRef}
            className="cp-input"
            type="text"
            placeholder="Ask anything about this calculation..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
          />
          <button
            className="cp-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .cp-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 364px;
          max-height: 540px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
          font-family: 'DM Sans', sans-serif;
        }

        /* Header */
        .cp-header {
          background: #6366f1;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .cp-header-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-header-text { flex: 1; }
        .cp-header-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .cp-header-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.7);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        .cp-header-actions {
          display: flex;
          gap: 6px;
        }
        .cp-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.12s;
        }
        .cp-icon-btn:hover { background: rgba(255,255,255,0.25); }

        /* context bar */
        .cp-context-bar {
          padding: 7px 14px;
          background: var(--accent-light);
          color: var(--accent);
          font-size: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        /* messages */
        .cp-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg-raised);
        }

        /* message bubbles */
        .cp-msg {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          animation: fadeUp 0.25s ease both;
        }
        .cp-msg.user {
          flex-direction: row-reverse;
        }
        .cp-msg-avatar {
          width: 26px;
          height: 26px;
          background: #6366f1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .cp-msg-bubble {
          max-width: 82%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px 14px 14px 4px;
          padding: 10px 13px;
          font-size: 12px;
          color: var(--text);
          line-height: 1.6;
        }
        .cp-msg.user .cp-msg-bubble {
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 14px 14px 4px 14px;
        }
        .cp-msg-para {
          margin: 0 0 5px;
        }
        .cp-msg-para:last-child { margin-bottom: 0; }
        .cp-msg-step {
          display: flex;
          gap: 6px;
          margin: 3px 0;
        }
        .cp-step-num {
          background: #6366f1;
          color: #fff;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* typing dots */
        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 12px 16px;
        }
        .cp-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-3);
          animation: typingDot 1.4s infinite both;
        }
        .cp-dot:nth-child(2) { animation-delay: 0.2s; }
        .cp-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.1); opacity: 1; }
        }

        /* stars */
        .cp-stars {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 0.5px solid var(--border);
          flex-wrap: wrap;
        }
        .cp-stars-label {
          font-size: 9px;
          color: var(--text-3);
          margin-right: 2px;
        }
        .cp-star {
          background: none;
          border: none;
          font-size: 15px;
          color: var(--border-2);
          cursor: pointer;
          padding: 0 1px;
          transition: color 0.1s, transform 0.1s;
          line-height: 1;
        }
        .cp-star.active { color: #f59e0b; }
        .cp-star:hover { transform: scale(1.2); }

        /* suggestions */
        .cp-suggestions {
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-card);
          flex-shrink: 0;
        }
        .cp-chip {
          font-size: 10px;
          font-weight: 500;
          background: var(--bg-raised);
          border: 0.5px solid var(--border);
          border-radius: 20px;
          padding: 4px 10px;
          cursor: pointer;
          color: var(--text-2);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.12s;
        }
        .cp-chip:hover {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* input row */
        .cp-input-row {
          padding: 10px 12px;
          border-top: 0.5px solid var(--border);
          display: flex;
          gap: 8px;
          align-items: center;
          background: var(--bg-card);
          flex-shrink: 0;
        }
        .cp-input {
          flex: 1;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 9px 13px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          background: var(--bg-raised);
          outline: none;
          transition: border-color 0.12s;
        }
        .cp-input:focus { border-color: #6366f1; }
        .cp-input::placeholder { color: var(--text-3); }
        .cp-input:disabled { opacity: 0.6; }

        .cp-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #6366f1;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s, transform 0.1s;
        }
        .cp-send-btn:hover:not(:disabled) { background: #4f46e5; }
        .cp-send-btn:active:not(:disabled) { transform: scale(0.95); }
        .cp-send-btn:disabled { background: var(--border); cursor: not-allowed; }

        @media (max-width: 480px) {
          .cp-panel {
            right: 12px;
            left: 12px;
            width: auto;
            bottom: 88px;
          }
        }
      `}</style>
    </>
  )
}
