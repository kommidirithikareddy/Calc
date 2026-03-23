import { useState, useEffect, useRef } from 'react'

export const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar'        },
  { code: 'EUR', symbol: '€',   name: 'Euro'             },
  { code: 'GBP', symbol: '£',   name: 'British Pound'    },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee'     },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen'     },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar'  },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar'},
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc'      },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham'       },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan'     },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real'   },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso'     },
  { code: 'KRW', symbol: '₩',   name: 'South Korean Won' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand'},
]

/**
 * CurrencyDropdown — reusable currency selector
 *
 * Props:
 *   currency    {object}   current currency object { code, symbol, name }
 *   setCurrency {function} called with new currency object on change
 *   catColor    {string}   accent color e.g. '#6366f1'
 *   label       {string}   field label (default: 'Currency')
 */
export default function CurrencyDropdown({
  currency,
  setCurrency,
  catColor = '#6366f1',
  label = 'Currency',
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const searchRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.includes(search)
  )

  return (
    <div style={{ marginBottom: 16, position: 'relative' }} ref={ref}>
      {label && (
        <label style={{
          fontSize: 12.5, fontWeight: 600, color: 'var(--text)',
          fontFamily: "'DM Sans', sans-serif", display: 'block', marginBottom: 5,
        }}>
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setSearch('') }}
        style={{
          width: '100%', height: 38, padding: '0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1.5px solid ${open ? catColor : 'var(--border)'}`,
          borderRadius: 8, background: 'var(--bg-input, var(--bg-card))',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          boxShadow: open ? `0 0 0 3px ${catColor}18` : 'none',
          transition: 'border-color .12s, box-shadow .12s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: catColor }}>{currency.code}</span>
          <span style={{ color: 'var(--text-2)' }}>{currency.name}</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>{currency.symbol}</span>
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
        >
          <path d="M2 4l4 4 4-4" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {/* Search box */}
          <div style={{ padding: '8px 10px', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-raised)', borderRadius: 7, padding: '6px 10px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 12, color: 'var(--text)', flex: 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>
          </div>

          {/* Currency list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
                No currencies found
              </div>
            ) : filtered.map(c => {
              const isSelected = c.code === currency.code
              return (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c); setOpen(false); setSearch('') }}
                  style={{
                    width: '100%', padding: '9px 12px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: isSelected ? catColor + '10' : 'transparent',
                    transition: 'background .1s', fontFamily: "'DM Sans', sans-serif",
                    borderLeft: isSelected ? `3px solid ${catColor}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-raised)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: catColor, minWidth: 36 }}>{c.code}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, textAlign: 'left' }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>{c.symbol}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M2 6l3 3 5-5" stroke={catColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
