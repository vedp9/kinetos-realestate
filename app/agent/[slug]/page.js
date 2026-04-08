'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const BHK_FILTERS = ['All', '1', '2', '3', '4', '5']
const STATUS_FILTERS = ['All', 'Ready to move', 'Under construction', 'Resale']

function agentBtnStyle(bg, color) {
  return {
    background: bg,
    color: color,
    border: '1px solid #253248',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '11px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  }
}

export default function AgentPortfolio() {
  const { slug } = useParams()
  const [agent, setAgent] = useState(null)
  const [properties, setProperties] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [bhkFilter, setBhkFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const [isAgent, setIsAgent] = useState(false)
  const [agentChecked, setAgentChecked] = useState(false)

  useEffect(() => {
    // ask once if this visitor is the agent
    const saved = sessionStorage.getItem('agent_slug')
    if (saved === slug) {
      setIsAgent(true)
    }
    setAgentChecked(true)
  }, [slug])

  function handleAgentCheck() {
    const input = prompt('Enter your agent slug to access agent options:')
    if (input && input.toLowerCase().trim() === slug) {
      sessionStorage.setItem('agent_slug', slug)
      setIsAgent(true)
    } else if (input !== null) {
      alert('❌ Slug does not match this portfolio.')
    }
  }

  // fetch agent + properties
  useEffect(() => {
    async function fetchData() {
      const { data: agentData, error } = await supabase
        .from('agents')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !agentData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setAgent(agentData)

      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agentData.id)
        .order('created_at', { ascending: false })

      setProperties(props || [])
      setFiltered(props || [])
      setLoading(false)
    }
    fetchData()
  }, [slug])

  // apply filters
  useEffect(() => {
    let result = [...properties]
    if (bhkFilter !== 'All') result = result.filter(p => String(p.bhk) === bhkFilter)
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [bhkFilter, statusFilter, search, properties])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06080f' }}>
      <p style={{ color: '#6b7fa0', fontFamily: 'monospace', fontSize: '13px' }}>Loading portfolio...</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06080f', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '40px', marginBottom: '16px' }}>🏚️</p>
        <p style={{ color: '#f1f5f9', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Agent not found</p>
        <p style={{ color: '#6b7fa0', fontSize: '13px' }}>No agent registered with slug "{slug}"</p>
        <a href="/register" style={{ display: 'inline-block', marginTop: '20px', color: '#3b82f6', fontSize: '13px', fontFamily: 'monospace' }}>Register as agent →</a>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }

        .page {
          min-height: 100vh;
          background: #06080f;
          padding-bottom: 60px;
        }

        /* ── HEADER ── */
        .header {
          background: #0f1520;
          border-bottom: 1px solid #1c2538;
          padding: 20px 16px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-inner {
          max-width: 640px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .agent-info { flex: 1; min-width: 0; }
        .agent-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .agent-sub {
          font-size: 11px;
          color: #6b7fa0;
          margin-top: 2px;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.07);
          padding: 5px 12px;
          border-radius: 100px;
          flex-shrink: 0;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        /* ── BODY ── */
        .body {
          max-width: 640px;
          margin: 0 auto;
          padding: 20px 16px 0;
        }

        /* ── SEARCH ── */
        .search-wrap {
          position: relative;
          margin-bottom: 14px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #3d4e68;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 14px;
          padding: 13px 16px 13px 38px;
          color: #dde4f0;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color .2s;
          -webkit-appearance: none;
        }
        .search-input:focus { border-color: #3b82f6; }
        .search-input::placeholder { color: '#3d4e68'; }

        /* ── FILTERS ── */
        .filter-section { margin-bottom: 16px; }
        .filter-label {
          font-size: 10px;
          color: #3d4e68;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .filter-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .filter-row::-webkit-scrollbar { display: none; }
        .filter-pill {
          flex-shrink: 0;
          padding: 7px 14px;
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 100px;
          color: #6b7fa0;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .filter-pill.active-blue {
          background: rgba(59,130,246,0.12);
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .filter-pill.active-green {
          background: rgba(16,185,129,0.12);
          border-color: #10b981;
          color: #10b981;
        }

        /* ── RESULTS COUNT ── */
        .results-count {
          font-size: 11px;
          color: #3d4e68;
          margin-bottom: 14px;
          letter-spacing: 0.5px;
        }

        /* ── PROPERTY CARD ── */
        .prop-card {
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 10px;
          transition: border-color .2s, transform .2s;
          position: relative;
          overflow: hidden;
        }
        .prop-card:hover {
          border-color: #253248;
          transform: translateY(-2px);
        }
        .prop-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, #3b82f6, transparent);
          opacity: 0;
          transition: opacity .3s;
        }
        .prop-card:hover::before { opacity: 1; }

        .prop-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .prop-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          flex: 1;
          line-height: 1.3;
        }
        .prop-price {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #10b981;
          flex-shrink: 0;
        }
        .prop-area {
          font-size: 11px;
          color: #6b7fa0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .prop-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .tag {
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 100px;
          border: 1px solid;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .tag-bhk {
          background: rgba(59,130,246,0.08);
          border-color: rgba(59,130,246,0.25);
          color: #60a5fa;
        }
        .tag-status-ready {
          background: rgba(16,185,129,0.08);
          border-color: rgba(16,185,129,0.25);
          color: #34d399;
        }
        .tag-status-under {
          background: rgba(245,158,11,0.08);
          border-color: rgba(245,158,11,0.25);
          color: #fbbf24;
        }
        .tag-status-resale {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.25);
          color: #a78bfa;
        }

        .prop-desc {
          font-size: 11px;
          color: #6b7fa0;
          line-height: 1.7;
          border-top: 1px solid #1c2538;
          padding-top: 12px;
          margin-top: 4px;
        }

        /* ── EMPTY STATE ── */
        .empty {
          text-align: center;
          padding: 60px 24px;
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 8px;
        }
        .empty-sub { font-size: 12px; color: '#6b7fa0'; line-height: 1.6; }

        /* ── CONTACT STRIP ── */
        .contact-strip {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #0f1520;
          border-top: 1px solid #1c2538;
          padding: 12px 16px;
          display: flex;
          gap: 10px;
          z-index: 10;
        }
        .contact-strip-inner {
          max-width: 640px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          gap: 10px;
        }
        .contact-btn {
          flex: 1;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          transition: opacity .2s;
          -webkit-tap-highlight-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .contact-btn:active { opacity: .8; }
        .btn-call {
          background: #10b981;
          color: #fff;
        }
        .btn-whatsapp {
          background: #25d366;
          color: #fff;
        }


        @media (max-width: 400px) {
          .prop-card { padding: 16px; }
          .prop-title { font-size: 14px; }
          .prop-price { font-size: 15px; }
        }
      `}</style>

      <div className="page">
        {/* Agent bar — only visible to agent */}
        {agentChecked && (
          <div style={{
            background: '#0a0f1a',
            borderBottom: '1px solid #1c2538',
            padding: '10px 16px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}>
            <div style={{
              maxWidth: '640px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              {isAgent ? (
                <>
                  <span style={{ fontSize: '11px', color: '#3b82f6', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Agent View
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href="/dashboard" style={agentBtnStyle('#1c2538', '#6b7fa0')}>
                      Dashboard
                    </a>
                    <a href="/upload" style={agentBtnStyle('#1c2538', '#6b7fa0')}>
                      + Add Property
                    </a>
                    <a href="/register" style={agentBtnStyle('#1c2538', '#6b7fa0')}>
                      Edit Profile
                    </a>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleAgentCheck}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    color: '#3d4e68',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '4px 0',
                    letterSpacing: '0.5px',
                  }}
                >
                  Are you the agent? →
                </button>
              )}
            </div>
          </div>
        )}
        {/* Sticky header */}
        <div className="header">
          <div className="header-inner">
            <div className="agent-info">
              <div className="agent-name">🏠 {agent.name}'s Portfolio</div>
              <div className="agent-sub">{properties.length} properties listed</div>
            </div>
            <div className="live-badge">
              <span className="live-dot"></span>
              Live
            </div>
          </div>
        </div>

        <div className="body">

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by area, title, keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* BHK filter */}
          <div className="filter-section">
            <span className="filter-label">BHK</span>
            <div className="filter-row">
              {BHK_FILTERS.map(b => (
                <button
                  key={b}
                  className={`filter-pill ${bhkFilter === b ? 'active-blue' : ''}`}
                  onClick={() => setBhkFilter(b)}
                >
                  {b === 'All' ? 'All BHK' : `${b} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="filter-section">
            <span className="filter-label">Status</span>
            <div className="filter-row">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  className={`filter-pill ${statusFilter === s ? 'active-green' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="results-count">
            {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found
            {filtered.length !== properties.length && ` (filtered from ${properties.length})`}
          </p>

          {/* Property cards */}
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No properties match</div>
              <p className="empty-sub">Try changing your filters or search term.</p>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="prop-card">
                <div className="prop-top">
                  <div className="prop-title">{p.title}</div>
                  <div className="prop-price">₹{p.price_lakhs}L</div>
                </div>
                {p.photos && p.photos.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '8px',
                    overflowX: 'auto', marginBottom: '12px',
                    scrollbarWidth: 'none',
                  }}>
                    {p.photos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${p.title} photo ${i + 1}`}
                        style={{
                          width: '120px', height: '80px',
                          objectFit: 'cover', borderRadius: '8px',
                          flexShrink: 0, border: '1px solid #1c2538',
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="prop-area">📍 {p.area}</div>
                <div className="prop-tags">
                  <span className="tag tag-bhk">{p.bhk} BHK</span>
                  <span className={`tag ${
                    p.status === 'Ready to move' ? 'tag-status-ready' :
                    p.status === 'Under construction' ? 'tag-status-under' :
                    'tag-status-resale'
                  }`}>{p.status}</span>
                  {p.cents && (
                    <span className="tag tag-bhk">{p.cents} cents</span>
                  )}
                </div>
                {p.description && (
                  <div className="prop-desc">{p.description}</div>
                )}
              </div>
            ))
          )}

          {/* Bottom padding for contact strip */}
          <div style={{ height: '80px' }} />

        </div>

        {/* Fixed contact strip */}
        <div className="contact-strip">
          <div className="contact-strip-inner">
            <a
              href={`tel:${agent.phone}`}
              className="contact-btn btn-call"
            >
              📞 Call {agent.name.split(' ')[0]}
            </a>
            <a
              href={`https://wa.me/91${agent.phone}?text=Hi ${agent.name}, I saw your property listings on Kinetos. I'm interested!`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn btn-whatsapp"
            >
              💬 WhatsApp
            </a>
            <a
              href={`/chat/${agent.slug}`}
              className="contact-btn"
              style={{
                flex: 1,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#a78bfa',
              }}
            >
              🤖 Ask AI
            </a>
          </div>
        </div>

      </div>
    </>
  )
}