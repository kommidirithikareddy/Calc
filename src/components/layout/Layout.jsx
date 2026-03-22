import { useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import ChatFAB from './ChatFAB'
import ChatPanel from './ChatPanel'

export default function Layout({ children, calcContext }) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Nav />

      <main style={{ flex: 1 }} className="page-enter">
        {children}
      </main>

      <Footer />

      <ChatFAB onClick={() => setChatOpen(o => !o)} isOpen={chatOpen} />

      {chatOpen && (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          calcContext={calcContext}
        />
      )}
    </div>
  )
}
