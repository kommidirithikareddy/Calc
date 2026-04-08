import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const STATS = [
  { val: '200+', lbl: 'Free Calculators' },
  { val: '5',    lbl: 'Categories'        },
  { val: '0',    lbl: 'Ads. Ever.'        },
  { val: 'AI',   lbl: 'Powered'           },
]

const VALUES = [
  { icon: '🚫', title: 'Zero Ads',        desc: 'No banners, no popups, no sponsored results. Ever. CalC is funded by nothing — it\'s just built because it should exist.' },
  { icon: '🔓', title: 'No Signup',       desc: 'You shouldn\'t need an account to use a calculator. Open it, use it, leave. No email, no password, no tracking.' },
  { icon: '📱', title: 'Works Offline',   desc: 'CalC is a PWA — install it on your phone or desktop and it works without an internet connection.' },
  { icon: '✨', title: 'AI-Powered',      desc: 'Every calculator has a built-in AI assistant that can explain results, answer follow-up questions and suggest next steps.' },
  { icon: '♾️', title: 'Always Free',     desc: 'All 200+ calculators are free today and will remain free. No freemium, no premium tier, no paywalls.' },
  { icon: '🌗', title: 'Light & Dark',    desc: 'Automatic dark mode support. Your eyes will thank you at 2am when you\'re running mortgage numbers.' },
]

export default function About() {
  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 40px 80px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--text)' }}>About</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>About CalC</div>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 40, fontWeight: 900,
            color: 'var(--text)', letterSpacing: '-1.5px',
            lineHeight: 1.1, margin: '0 0 20px',
          }}>
            The calculator app<br />
            <span style={{ color: '#6366f1' }}>that respects you.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, margin: 0, maxWidth: 600 }}>
            CalC was built out of frustration with calculator websites full of ads, paywalls and dark patterns.
            You should be able to calculate anything — for free, instantly, without signing up.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'var(--border)',
          border: '1px solid var(--border)', borderRadius: 14,
          overflow: 'hidden', marginBottom: 48,
        }}>
          {STATS.map(s => (
            <div key={s.lbl} style={{ background: 'var(--bg-card)', padding: '20px 24px' }}>
              <div style={{
                fontSize: 28, fontWeight: 900, color: '#6366f1',
                fontFamily: "'Manrope', sans-serif", letterSpacing: '-1px', lineHeight: 1,
              }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', margin: '0 0 16px' }}>The story</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Every time I needed to calculate something — a mortgage, a BMI, compound interest — I\'d land on a site cluttered with ads, cookie banners, and upsells. Half the features were locked behind a signup. The calculators themselves were often inaccurate or outdated.',
              'CalC is the answer to that. One app, 200+ calculators across finance, health, engineering, math and utilities. No ads. No signup. No paywalls. Just the calculation you need.',
              'Every calculator comes with an AI assistant powered by Cohere that can explain your results in plain English, answer follow-up questions, and suggest next steps. It\'s like having a knowledgeable friend available 24/7.',
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.85, margin: 0 }}>{p}</p>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', margin: '0 0 20px' }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                padding: '18px 20px', borderRadius: 12,
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{v.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{v.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Builder */}
        <div style={{
          padding: '24px 28px', borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f115, #8b5cf610)',
          border: '1px solid #6366f125',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#6366f1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>👩‍💻</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Built by Rithika</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Designed and developed with React + Vite. Every calculator, every component, every line of CSS — handcrafted. If you have feedback or ideas, reach out via the Contact page.
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
