/**
 * ChatFAB — fixed squircle AI button, bottom-right corner
 * Grid icon + ASK AI label
 * Pulsing glow animation when closed, X icon when open
 */
export default function ChatFAB({ onClick, isOpen }) {
  return (
    <>
      <button
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={onClick}
        title="Ask CalC AI"
        aria-label="Open AI chat"
      >
        {isOpen ? (
          /* X icon when panel is open */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          /* Grid icon when closed */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3"  y="3"  width="7" height="7" rx="1"/>
            <rect x="14" y="3"  width="7" height="7" rx="1"/>
            <rect x="3"  y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        )}
        {!isOpen && <span className="fab-label">ASK AI</span>}
      </button>

      <style>{`
        .chat-fab {
          position: fixed;
          bottom: 28px;
          right: 24px;
          width: 54px;
          height: 54px;
          background: #6366f1;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.45);
          cursor: pointer;
          z-index: 1000;
          border: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s;
        }

        .chat-fab:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 32px rgba(99,102,241,0.55);
        }

        .chat-fab:active {
          transform: scale(0.96);
        }

        .chat-fab.open {
          background: #4f46e5;
          animation: none;
        }

        /* Subtle pulse when closed to draw attention */
        .chat-fab:not(.open) {
          animation: fabPulse 3s ease-in-out infinite;
        }

        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(99,102,241,0.45); }
          50%       { box-shadow: 0 4px 28px rgba(99,102,241,0.65); }
        }

        .fab-label {
          font-size: 7px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.06em;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-fab:not(.open) { animation: none; }
        }
      `}</style>
    </>
  )
}
