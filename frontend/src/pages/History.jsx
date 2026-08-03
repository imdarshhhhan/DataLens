import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { listFiles, getHistory } from '../api'

export default function History() {
  const [files,     setFiles]     = useState([])
  const [queries,   setQueries]   = useState([])
  const [activeFile,setActiveFile]= useState(null)
  const [loading,   setLoading]   = useState(true)
  const navigate                  = useNavigate()

  useEffect(() => {
    listFiles()
      .then(res => {
        setFiles(res.data)
        if (res.data.length > 0) {
          loadHistory(res.data[0])
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const loadHistory = async (file) => {
    setLoading(true)
    setActiveFile(file)
    try {
      const res = await getHistory(file.id)
      setQueries(res.data)
    } catch (err) {
      console.error(err)
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

  return (
    <Layout>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#1A1A2E' }}>
          Query history
        </h1>
        <p style={{ fontSize:'13px', color:'#6B8BAA', marginTop:'4px' }}>
          All queries you have run across your files
        </p>
      </div>

      {files.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'#fff', border:'1.5px dashed #E2EEF9', borderRadius:'14px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🕐</div>
          <p style={{ fontSize:'15px', fontWeight:'500', color:'#1A1A2E', marginBottom:'6px' }}>
            No history yet
          </p>
          <p style={{ fontSize:'13px', color:'#6B8BAA' }}>
            Upload a file and run some queries to see them here
          </p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'1.5rem' }}>

          {/* File list sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <p style={{ fontSize:'12px', fontWeight:'600', color:'#6B8BAA', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' }}>
              Your files
            </p>
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => loadHistory(file)}
                style={{ padding:'10px 12px', borderRadius:'10px', cursor:'pointer', border: activeFile?.id === file.id ? '2px solid #5BAADC' : '1px solid #E2EEF9', background: activeFile?.id === file.id ? '#E2EEF9' : '#fff' }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                  <span style={{ fontSize:'10px', fontWeight:'600', padding:'1px 6px', borderRadius:'20px', background: typeColor[file.file_type]?.bg || '#F2F4F7', color: typeColor[file.file_type]?.color || '#555' }}>
                    {file.file_type}
                  </span>
                </div>
                <div style={{ fontSize:'13px', fontWeight:'500', color:'#1A1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {file.filename}
                </div>
                <div style={{ fontSize:'11px', color:'#6B8BAA', marginTop:'2px' }}>
                  {file.row_count?.toLocaleString()} rows
                </div>
              </div>
            ))}
          </div>

          {/* Query history list */}
          <div>
            {loading ? (
              <p style={{ color:'#6B8BAA', fontSize:'13px' }}>Loading history...</p>
            ) : queries.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', background:'#fff', border:'1.5px dashed #E2EEF9', borderRadius:'14px' }}>
                <div style={{ fontSize:'36px', marginBottom:'12px' }}>💬</div>
                <p style={{ fontSize:'14px', fontWeight:'500', color:'#1A1A2E', marginBottom:'6px' }}>
                  No queries for this file yet
                </p>
                <p style={{ fontSize:'13px', color:'#6B8BAA', marginBottom:'1.5rem' }}>
                  Open the file and start asking questions
                </p>
                <button
                  onClick={() => navigate(`/workspace/${activeFile?.id}`)}
                  style={{ padding:'9px 20px', background:'#5BAADC', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}
                >
                  Open file →
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                  <p style={{ fontSize:'13px', color:'#6B8BAA' }}>
                    {queries.length} quer{queries.length === 1 ? 'y' : 'ies'} for <strong style={{ color:'#1A1A2E' }}>{activeFile?.filename}</strong>
                  </p>
                  <button
                    onClick={() => navigate(`/workspace/${activeFile?.id}`)}
                    style={{ padding:'7px 14px', background:'#E2EEF9', color:'#1A6FA8', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer' }}
                  >
                    Open file →
                  </button>
                </div>

                {queries.map((q, i) => (
                  <div
                    key={q.id}
                    style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'1rem 1.25rem' }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                          <span style={{ fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background: q.query_type === 'sql' ? '#EEEDFE' : '#E2EEF9', color: q.query_type === 'sql' ? '#534AB7' : '#1A6FA8' }}>
                            {q.query_type === 'sql' ? 'SQL' : 'English'}
                          </span>
                          <span style={{ fontSize:'11px', color:'#A0B4C8' }}>
                            {new Date(q.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ fontSize:'14px', fontWeight:'500', color:'#1A1A2E', marginBottom:'8px' }}>
                          "{q.query_text}"
                        </p>
                        {q.sql_generated && (
                          <details>
                            <summary style={{ fontSize:'12px', color:'#6B8BAA', cursor:'pointer' }}>
                              View SQL
                            </summary>
                            <code style={{ display:'block', fontSize:'11px', background:'#F7FBFF', padding:'8px', borderRadius:'6px', marginTop:'6px', whiteSpace:'pre-wrap', fontFamily:'monospace', color:'#1A1A2E' }}>
                              {q.sql_generated}
                            </code>
                          </details>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/workspace/${activeFile?.id}`)}
                        style={{ padding:'6px 14px', background:'#FFF0E5', color:'#C4661A', border:'1px solid #FAD4B0', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer', whiteSpace:'nowrap' }}
                      >
                        Re-run ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}