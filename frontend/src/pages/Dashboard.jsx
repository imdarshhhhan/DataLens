import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { listFiles, deleteFile } from '../api'

export default function Dashboard() {
  const [files,   setFiles]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    listFiles()
      .then(res => setFiles(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this file?')) return
    await deleteFile(id)
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const { uploadFile } = await import('../api')
    setLoading(true)
    try {
      const res = await uploadFile(formData)
      navigate(`/workspace/${res.data.file_id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const typeColor = {
    csv:  { bg:'#E1F5EE', color:'#0F6E56' },
    xlsx: { bg:'#EAF3DE', color:'#3B6D11' },
    xls:  { bg:'#EAF3DE', color:'#3B6D11' },
    json: { bg:'#EEEDFE', color:'#534AB7' },
  }

  const tips = [
    { icon:'📁', title:'Upload any file', desc:'Supports CSV, Excel and JSON up to 50MB' },
    { icon:'💬', title:'Ask in plain English', desc:'No SQL knowledge needed — just type your question' },
    { icon:'📊', title:'Get instant charts', desc:'AI generates visual charts from your data automatically' },
    { icon:'💡', title:'Follow-up questions', desc:'Click suggested questions to dig deeper into your data' },
  ]

  return (
    <Layout>

      {/* Hero section */}
      <div style={{ background:'linear-gradient(135deg, #E2EEF9 0%, #FFF0E5 100%)', borderRadius:'16px', padding:'2rem', marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:'700', color:'#1A1A2E', marginBottom:'8px' }}>
            Welcome to DataLens 👋
          </h1>
          <p style={{ fontSize:'14px', color:'#6B8BAA', maxWidth:'420px' }}>
            Upload your data file and ask questions. Get instant charts, insights and analysis — no technical skills needed.
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <label style={{ display:'inline-block', padding:'12px 24px', background:'#5BAADC', color:'#fff', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
            + Upload file
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              style={{ display:'none' }}
              onChange={handleUpload}
            />
          </label>
          <p style={{ fontSize:'11px', color:'#A0B4C8', marginTop:'6px' }}>
            Accepted: csv, xlsx, json
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'2rem' }}>
        <div style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'16px' }}>
          <div style={{ fontSize:'12px', color:'#6B8BAA', marginBottom:'4px' }}>Total files</div>
          <div style={{ fontSize:'28px', fontWeight:'700', color:'#1A1A2E' }}>{files.length}</div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'16px' }}>
          <div style={{ fontSize:'12px', color:'#6B8BAA', marginBottom:'4px' }}>Total rows</div>
          <div style={{ fontSize:'28px', fontWeight:'700', color:'#1A1A2E' }}>
            {files.reduce((a,f) => a + (f.row_count || 0), 0).toLocaleString()}
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'16px' }}>
          <div style={{ fontSize:'12px', color:'#6B8BAA', marginBottom:'4px' }}>File types</div>
          <div style={{ fontSize:'28px', fontWeight:'700', color:'#1A1A2E' }}>
            {[...new Set(files.map(f => f.file_type))].join(', ') || '—'}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'600', color:'#1A1A2E', marginBottom:'1rem' }}>
          How it works
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'12px' }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'1rem' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>{tip.icon}</div>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'4px' }}>{tip.title}</div>
              <div style={{ fontSize:'12px', color:'#6B8BAA' }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent files */}
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'600', color:'#1A1A2E', marginBottom:'1rem' }}>
          {files.length > 0 ? 'Your files' : 'No files yet'}
        </h2>

        {loading ? (
          <p style={{ color:'#6B8BAA', fontSize:'13px' }}>Loading...</p>
        ) : files.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem', background:'#fff', border:'1.5px dashed #E2EEF9', borderRadius:'14px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📂</div>
            <p style={{ fontSize:'15px', fontWeight:'500', color:'#1A1A2E', marginBottom:'6px' }}>
              No files uploaded yet
            </p>
            <p style={{ fontSize:'13px', color:'#6B8BAA', marginBottom:'1.5rem' }}>
              Upload a CSV, Excel or JSON file to get started
            </p>
            <label style={{ padding:'10px 24px', background:'#5BAADC', color:'#fff', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>
              Upload your first file
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                style={{ display:'none' }}
                onChange={handleUpload}
              />
            </label>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'12px' }}>
            {files.map(file => (
              <div
                key={file.id}
                style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'14px', cursor:'pointer', transition:'border-color 0.15s', position:'relative' }}
                onClick={() => navigate(`/workspace/${file.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#5BAADC'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E2EEF9'}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background: typeColor[file.file_type]?.bg || '#F2F4F7', color: typeColor[file.file_type]?.color || '#555' }}>
                    {file.file_type}
                  </span>
                  <button
                    onClick={e => handleDelete(file.id, e)}
                    style={{ background:'transparent', border:'none', fontSize:'16px', cursor:'pointer', color:'#A0B4C8', lineHeight:1 }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {file.filename}
                </div>
                <div style={{ fontSize:'12px', color:'#6B8BAA', marginBottom:'2px' }}>
                  {file.row_count?.toLocaleString()} rows · {file.col_count} columns
                </div>
                <div style={{ fontSize:'11px', color:'#A0B4C8' }}>
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </div>
                <div style={{ marginTop:'10px', padding:'6px 10px', background:'#E2EEF9', borderRadius:'6px', fontSize:'12px', color:'#1A6FA8', fontWeight:'500', textAlign:'center' }}>
                  Open & Analyse →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </Layout>
  )
}