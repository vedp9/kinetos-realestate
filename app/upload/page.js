'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getSession, clearSession } from '../../lib/auth'

const STATUS_OPTIONS = ['Ready to move', 'Under construction', 'Resale']
const BHK_OPTIONS = [1, 2, 3, 4, 5]
const MAX_PHOTOS = 5

export default function UploadPage() {
  const [form, setForm] = useState({
    agent_slug: '',
    title: '',
    area: '',
    bhk: '',
    price_lakhs: '',
    cents: '',
    status: '',
    description: '',
  })
  const [photos, setPhotos] = useState([])         // File objects
  const [previews, setPreviews] = useState([])      // preview URLs
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  useEffect(() => {
    const session = getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }
    // auto-fill username from session
    setForm(f => ({ ...f, agent_slug: session.slug }))
  }, [])
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // handle photo selection from gallery or camera
  function handlePhotoSelect(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const remaining = MAX_PHOTOS - photos.length
    const selected = files.slice(0, remaining)

    setPhotos(prev => [...prev, ...selected])

    // generate previews
    selected.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })

    // reset input so same file can be selected again
    e.target.value = ''
  }

  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos(agentSlug, propertyTitle) {
    if (photos.length === 0) return []

    setUploading(true)
    const uploadedUrls = []

    for (const file of photos) {
      const ext = file.name.split('.').pop()
      const fileName = `${agentSlug}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      const { data, error } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName)
        uploadedUrls.push(urlData.publicUrl)
      }
    }

    setUploading(false)
    return uploadedUrls
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    // find agent by slug
    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', form.agent_slug.toLowerCase().trim())
      .single()

    if (agentErr || !agent) {
      setResult({ type: 'error', msg: '❌ Username not found. Please register first at /register' })
      setLoading(false)
      return
    }

    // upload photos first (if any)
    const photoUrls = await uploadPhotos(form.agent_slug, form.title)

    // insert property
    const { error } = await supabase.from('properties').insert([{
      agent_id: agent.id,
      title: form.title,
      area: form.area,
      bhk: parseInt(form.bhk),
      price_lakhs: parseFloat(form.price_lakhs),
      cents: form.cents ? parseFloat(form.cents) : null,
      status: form.status,
      description: form.description || null,
      photos: photoUrls,
    }])

    if (error) {
      setResult({ type: 'error', msg: '❌ Error: ' + error.message })
    } else {
      setResult({
        type: 'success',
        msg: `✅ Property listed successfully!${photoUrls.length > 0 ? ` ${photoUrls.length} photo(s) uploaded.` : ''} View at /agent/${form.agent_slug}`
      })
      // reset form fields except agent_slug
      setForm(f => ({
        ...f,
        title: '', area: '', bhk: '', price_lakhs: '',
        cents: '', status: '', description: '',
      }))
      setPhotos([])
      setPreviews([])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }

        .page {
          min-height: 100vh;
          padding: 32px 16px 60px;
          background: #06080f;
          position: relative;
        }
        .page::before {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        .wrap {
          max-width: 520px; margin: 0 auto;
          position: relative; z-index: 1;
        }

        .topbar {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 28px;
        }
        .back-btn {
          font-size: 12px; color: #6b7fa0;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .back-btn:hover { color: #3b82f6; }

        .badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: #f59e0b;
          border: 1px solid rgba(245,158,11,0.3);
          background: rgba(245,158,11,0.07);
          padding: 5px 14px; border-radius: 100px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f59e0b; box-shadow: 0 0 6px #f59e0b;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 5vw, 30px); font-weight: 800;
          color: #f1f5f9; letter-spacing: -0.5px;
          margin-bottom: 6px; line-height: 1.2;
        }
        .title em {
          font-style: normal;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle { font-size: 12px; color: #6b7fa0; margin-bottom: 28px; line-height: 1.7; }

        .card {
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 20px; padding: 28px 24px;
          margin-bottom: 12px; position: relative; overflow: hidden;
        }
        .card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f59e0b, transparent);
        }
        .card-title {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          color: #f59e0b; letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 18px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .optional-tag {
          font-size: 9px; letter-spacing: 1px;
          color: #3d4e68; font-weight: 400;
          background: #131a28; border: 1px solid #1c2538;
          padding: 2px 8px; border-radius: 100px;
          text-transform: uppercase;
        }

        .label {
          font-size: 10px; color: #6b7fa0; letter-spacing: 1.5px;
          text-transform: uppercase; margin-top: 14px;
          margin-bottom: 6px; display: block;
        }
        .label:first-of-type { margin-top: 0; }

        .input {
          background: #131a28; border: 1px solid #1c2538;
          border-radius: 12px; padding: 13px 16px;
          color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none; width: 100%;
          transition: border-color .2s; -webkit-appearance: none;
        }
        .input:focus { border-color: #f59e0b; }
        .input::placeholder { color: #3d4e68; }

        textarea.input {
          resize: vertical; min-height: 80px; line-height: 1.6;
        }

        /* two column row */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* price + cents row */
        .price-wrap {
          display: flex; align-items: center;
          background: #131a28; border: 1px solid #1c2538;
          border-radius: 12px; overflow: hidden;
          transition: border-color .2s;
        }
        .price-wrap:focus-within { border-color: #f59e0b; }
        .price-prefix {
          font-size: 13px; color: #f59e0b;
          padding: 13px 0 13px 16px; white-space: nowrap;
          flex-shrink: 0; opacity: .8;
        }
        .price-input {
          background: transparent; border: none;
          padding: 13px 14px; color: #dde4f0;
          font-size: 14px; font-family: 'JetBrains Mono', monospace;
          outline: none; width: 100%; -webkit-appearance: none;
        }
        .price-input::placeholder { color: #3d4e68; }
        .price-suffix {
          font-size: 11px; color: #3d4e68;
          padding: 13px 14px 13px 0; white-space: nowrap;
        }

        /* BHK pills */
        .bhk-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .bhk-pill {
          flex: 1; min-width: 48px; padding: 10px 6px;
          background: #131a28; border: 1px solid #1c2538;
          border-radius: 10px; color: #6b7fa0;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          text-align: center; cursor: pointer; transition: all .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .bhk-pill.active {
          background: rgba(245,158,11,0.15);
          border-color: #f59e0b; color: #f59e0b;
        }

        /* status pills */
        .status-row { display: flex; flex-direction: column; gap: 8px; }
        .status-pill {
          padding: 12px 16px; background: #131a28;
          border: 1px solid #1c2538; border-radius: 12px;
          color: #6b7fa0; font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer; transition: all .2s; text-align: left;
          -webkit-tap-highlight-color: transparent;
        }
        .status-pill.active {
          background: rgba(16,185,129,0.1);
          border-color: #10b981; color: #10b981;
        }

        /* photo upload */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }
        .photo-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #1c2538;
        }
        .photo-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .photo-remove {
          position: absolute; top: 4px; right: 4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.7); border: none;
          color: #fff; font-size: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
          line-height: 1;
        }

        .photo-add-row { display: flex; gap: 10px; }
        .photo-btn {
          flex: 1; padding: 13px 10px;
          background: #131a28; border: 1px dashed #253248;
          border-radius: 12px; color: #6b7fa0;
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
          cursor: pointer; text-align: center; transition: all .2s;
          -webkit-tap-highlight-color: transparent;
          display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .photo-btn:hover { border-color: #f59e0b; color: #f59e0b; }
        .photo-count {
          font-size: 10px; color: #3d4e68;
          margin-top: 8px; letter-spacing: 0.5px;
        }

        /* submit button */
        .btn {
          width: 100%; margin-top: 16px;
          background: #f59e0b; color: #06080f;
          border: none; border-radius: 14px;
          padding: 17px; font-size: 15px;
          font-family: 'Syne', sans-serif; font-weight: 800;
          cursor: pointer; transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:hover { opacity: .88; }
        .btn:active { transform: scale(0.98); }
        .btn:disabled {
          background: #1c2538; color: #3d4e68;
          cursor: not-allowed; transform: none;
        }

        .result {
          margin-top: 16px; font-size: 13px;
          line-height: 1.6; padding: 14px 16px; border-radius: 12px;
        }
        .result.success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25); color: #10b981;
        }
        .result.error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25); color: #ef4444;
        }

        .add-more {
          text-align: center; font-size: 12px;
          color: #6b7fa0; margin-top: 20px;
        }
        .add-more button {
          background: none; border: none; color: #3b82f6;
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
          cursor: pointer; padding: 0; text-decoration: underline;
          -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 400px) {
          .card { padding: 22px 16px; }
          .bhk-pill { font-size: 12px; padding: 9px 4px; }
          .two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <div className="wrap">

          {/* Top bar */}
          <div className="topbar">
            <a href="/" className="back-btn">← Home</a>
            <div className="badge">
              <span className="badge-dot"></span>
              Phase 1
            </div>
          </div>

          <button
            onClick={() => { clearSession(); window.location.href = '/login' }}
            style={{
              background: 'none', border: '1px solid #1c2538',
              borderRadius: '8px', padding: '6px 12px',
              color: '#6b7fa0', fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>

          {/* Heading */}
          <h1 className="title">List a <em>property</em></h1>
          <p className="subtitle">
            Add your listing details below. Goes live on your portfolio instantly.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Card 1 — Agent */}
            <div className="card">
              <div className="card-title">Your Username</div>
              <input
                className="input"
                name="agent_slug"
                placeholder="e.g. ravi"
                value={form.agent_slug}
                onChange={handleChange}
                required
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            {/* Card 2 — Property basics */}
            <div className="card">
              <div className="card-title">Property Details</div>

              <label className="label">Property Title</label>
              <input
                className="input"
                name="title"
                placeholder="Sunrise Heights, Madhapur"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label className="label">Area / Location</label>
              <input
                className="input"
                name="area"
                placeholder="Kondapur, Hyderabad"
                value={form.area}
                onChange={handleChange}
                required
              />

              <label className="label">BHK</label>
              <div className="bhk-row">
                {BHK_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    className={`bhk-pill ${form.bhk === String(b) ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, bhk: String(b) }))}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>

              {/* Price + Cents side by side */}
              <div className="two-col" style={{ marginTop: '14px' }}>
                <div>
                  <label className="label" style={{ marginTop: 0 }}>Price</label>
                  <div className="price-wrap">
                    <span className="price-prefix">₹</span>
                    <input
                      className="price-input"
                      name="price_lakhs"
                      type="number"
                      placeholder="65"
                      value={form.price_lakhs}
                      onChange={handleChange}
                      required
                      inputMode="decimal"
                      min="0"
                    />
                    <span className="price-suffix">Lakhs</span>
                  </div>
                </div>
                <div>
                  <label className="label" style={{ marginTop: 0 }}>
                    Cents
                    <span style={{ color: '#3d4e68', marginLeft: '6px', fontSize: '9px' }}>(optional)</span>
                  </label>
                  <div className="price-wrap">
                    <input
                      className="price-input"
                      name="cents"
                      type="number"
                      placeholder="0"
                      value={form.cents}
                      onChange={handleChange}
                      inputMode="decimal"
                      min="0"
                      style={{ paddingLeft: '16px' }}
                    />
                    <span className="price-suffix">cents</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Card 3 — Status */}
            <div className="card">
              <div className="card-title">Property Status</div>
              <div className="status-row">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`status-pill ${form.status === s ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                  >
                    {form.status === s ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4 — Photos (optional) */}
            <div className="card">
              <div className="card-title">
                Property Photos
                <span className="optional-tag">Optional</span>
              </div>

              {/* Photo previews */}
              {previews.length > 0 && (
                <div className="photo-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={src} alt={`Photo ${i + 1}`} />
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={() => removePhoto(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add photo buttons */}
              {photos.length < MAX_PHOTOS && (
                <div className="photo-add-row">
                  {/* Gallery */}
                  <label className="photo-btn">
                    🖼️ Gallery
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handlePhotoSelect}
                    />
                  </label>
                  {/* Camera */}
                  <label className="photo-btn">
                    📷 Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={handlePhotoSelect}
                    />
                  </label>
                </div>
              )}

              <p className="photo-count">
                {photos.length}/{MAX_PHOTOS} photos added
                {photos.length === MAX_PHOTOS && ' — maximum reached'}
              </p>
            </div>

            {/* Card 5 — Description (optional) */}
            <div className="card">
              <div className="card-title">
                Description
                <span className="optional-tag">Optional</span>
              </div>
              <textarea
                className="input"
                name="description"
                placeholder="Spacious flat with park view. 600m from DPS school. Covered parking. (Leave empty if not needed)"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn"
              type="submit"
              disabled={loading || uploading || !form.bhk || !form.status}
            >
              {uploading
                ? `Uploading ${photos.length} photo(s)...`
                : loading
                  ? 'Saving property...'
                  : '🏠 List This Property →'
              }
            </button>

          </form>

          {result && (
            <div className={`result ${result.type}`}>
              {result.msg}
            </div>
          )}

          <p className="add-more">
            Want to view all listings?{' '}
            <button
              type="button"
              onClick={() => {
                if (!form.agent_slug.trim()) {
                  alert('Please enter your username first.')
                  return
                }
                const go = window.confirm(
                  'What would you like to do?\n\nOK → Go to your Portfolio\nCancel → Stay and add more properties'
                )
                if (go) window.open(`/agent/${form.agent_slug}`, '_blank')
              }}
            >
              Visit your portfolio →
            </button>
          </p>

        </div>
      </div>
    </>
  )
}