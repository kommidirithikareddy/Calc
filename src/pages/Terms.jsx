import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using CalC ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App. These terms apply to all visitors and users of the App.',
  },
  {
    title: '2. Use of the App',
    content: 'CalC provides free online calculators for informational and educational purposes only. You may use the App for personal, non-commercial purposes. You agree not to misuse the App, attempt to disrupt its operation, or use it for any unlawful purpose.',
  },
  {
    title: '3. Accuracy of Results',
    content: 'While we strive to provide accurate calculations, CalC makes no warranties about the completeness, reliability, or accuracy of results. Calculator outputs are for informational purposes only and should not be relied upon as professional financial, medical, legal, or engineering advice. Always consult a qualified professional before making important decisions.',
  },
  {
    title: '4. AI Assistant',
    content: 'CalC includes an AI assistant powered by third-party AI services. AI responses are generated automatically and may contain errors or inaccuracies. AI responses do not constitute professional advice of any kind. Do not make financial, medical, or legal decisions based solely on AI responses.',
  },
  {
    title: '5. Intellectual Property',
    content: 'All content, design, code, and materials within CalC are the property of CalC and its creator. You may not copy, reproduce, distribute, or create derivative works without explicit written permission.',
  },
  {
    title: '6. Third-Party Services',
    content: 'CalC uses third-party services including AI providers. These services have their own terms and privacy policies. We are not responsible for the practices of third-party services.',
  },
  {
    title: '7. Disclaimer of Warranties',
    content: 'CalC is provided "as is" without warranty of any kind, express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of viruses or other harmful components.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'To the maximum extent permitted by law, CalC and its creator shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the App.',
  },
  {
    title: '9. Changes to Terms',
    content: 'We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting. Your continued use of the App after changes constitutes acceptance of the new terms.',
  },
  {
    title: '10. Contact',
    content: 'If you have questions about these Terms of Use, please use the Contact form available in the App.',
  },
]

export default function Terms() {
  return (
    <Layout>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '56px 40px 80px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--text)' }}>Terms of Use</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Legal</div>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 36, fontWeight: 900,
            color: 'var(--text)', letterSpacing: '-1px',
            margin: '0 0 14px', lineHeight: 1.1,
          }}>Terms of Use</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            Last updated: April 2026 · Effective immediately
          </p>
        </div>

        {/* Intro */}
        <div style={{
          padding: '16px 20px', borderRadius: 10,
          background: '#6366f110', border: '1px solid #6366f125',
          marginBottom: 36, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7,
        }}>
          Please read these Terms of Use carefully before using CalC. These terms govern your use of the App and constitute a legal agreement between you and CalC.
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {SECTIONS.map((sec, i) => (
            <div key={i} style={{
              padding: '22px 0',
              borderBottom: '0.5px solid var(--border)',
            }}>
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
          These terms were last reviewed in April 2026. For questions, use the <Link to="/" style={{ color: '#6366f1', textDecoration: 'none' }}>Contact form</Link> available in the footer.
        </div>

      </div>
    </Layout>
  )
}
