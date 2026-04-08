import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'CalC does not require you to create an account or provide personal information to use the App. We do not collect your name, email address, or any personally identifiable information unless you voluntarily submit it through the Contact form.',
  },
  {
    title: '2. Usage Data',
    content: 'We may collect anonymous, aggregated usage data to understand how the App is used and improve its features. This data does not identify you personally and includes information such as which calculators are most used and general geographic region.',
  },
  {
    title: '3. Local Storage',
    content: 'CalC uses your browser\'s local storage to remember your theme preference (light or dark mode). This data is stored only on your device and is never transmitted to our servers.',
  },
  {
    title: '4. AI Assistant',
    content: 'When you use the AI assistant, your messages and calculator context are sent to our server and then to a third-party AI provider (Cohere) to generate responses. We do not store your conversation history. Please do not share sensitive personal information in the AI chat.',
  },
  {
    title: '5. Cookies',
    content: 'CalC does not use tracking cookies or advertising cookies. We may use essential cookies required for the App to function correctly. We do not use cookies to track you across websites.',
  },
  {
    title: '6. Third-Party Services',
    content: 'CalC uses Cohere\'s API for the AI assistant feature. When you interact with the AI assistant, your messages are processed by Cohere subject to their privacy policy. We encourage you to review Cohere\'s privacy policy at cohere.com.',
  },
  {
    title: '7. Data Security',
    content: 'We implement reasonable security measures to protect any data transmitted through the App. However, no internet transmission is completely secure. We cannot guarantee the absolute security of data transmitted to or from the App.',
  },
  {
    title: '8. Children\'s Privacy',
    content: 'CalC is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information, please contact us and we will delete it.',
  },
  {
    title: '9. Your Rights',
    content: 'Since CalC does not collect personal information in normal use, there is generally no personal data to access, correct, or delete. If you submitted information via the Contact form and wish it removed, please contact us.',
  },
  {
    title: '10. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Your continued use of the App after changes constitutes acceptance of the new policy.',
  },
  {
    title: '11. Contact',
    content: 'If you have questions about this Privacy Policy or how your data is handled, please use the Contact form available in the App footer.',
  },
]

export default function Privacy() {
  return (
    <Layout>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '56px 40px 80px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--text)' }}>Privacy Policy</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Legal</div>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 36, fontWeight: 900,
            color: 'var(--text)', letterSpacing: '-1px',
            margin: '0 0 14px', lineHeight: 1.1,
          }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            Last updated: April 2026 · Effective immediately
          </p>
        </div>

        {/* Intro highlight */}
        <div style={{
          padding: '16px 20px', borderRadius: 10,
          background: '#10b98110', border: '1px solid #10b98125',
          marginBottom: 36,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>The short version</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'We do not sell your data — ever',
              'No account required, no personal info collected',
              'No advertising or tracking cookies',
              'AI chat messages are processed but not stored',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SECTIONS.map((sec, i) => (
            <div key={i} style={{ padding: '22px 0', borderBottom: '0.5px solid var(--border)' }}>
              <h2 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 15, fontWeight: 800,
                color: 'var(--text)', margin: '0 0 10px',
                letterSpacing: '-0.2px',
              }}>{sec.title}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.8, margin: 0 }}>{sec.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 40, padding: '16px 20px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
          This policy was last reviewed in April 2026. For questions, use the <Link to="/" style={{ color: '#6366f1', textDecoration: 'none' }}>Contact form</Link> in the footer.
        </div>

      </div>
    </Layout>
  )
}
