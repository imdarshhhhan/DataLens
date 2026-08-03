import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

export default function SharedReport() {
  const { reportId } = useParams()
  const navigate     = useNavigate()
  const [report,   setReport]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [password, setPassword] = useState('')
  const [locked,   setLocked]   = useState(false)

  useEffect(() => {
    // 
    const cacheKey = `workspace_${reportId}`
    const cached   = sessionStorage.getItem(cacheKey)

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setReport(parsed)
        setLoading(false)
        return
      } catch (e) {}
    }

    // Try API
    api.get(`/insights/${reportId}`)
      .then(res => {
        setReport({ insights: res.data })
        setLoading(false)
      })
      .catch(() => {
        setError('This report does not exist or has expired.')
        setLoading(false)
      })
  }, [reportId])

  const formatValue = (val) => {
    if (val === null || val === undefined) return '-'
    if (typeof val === 'number') {
      return val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString()
    }
    return String(val)
  }

  const renderChart = (rows, columns) => {
    if (!rows || rows.length === 0 || !columns) return null
    const numericCols = columns.filter(c => typeof rows[0]?.[c] === 'number')
    if (numericCols.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={rows} margin={{ top:8, right:8, left:0, bottom:0 }}>
          <XAxis dataKey={columns[0]} tick={{ fontSize:11 }} />
          <YAxis tick={{ fontSize:11 }} />
          <Tooltip
            contentStyle={{ border:'1px solid #E2EEF9', borderRadius:'8px', boxShadow:'none' }}
            cursor={{ fill:'transparent' }}
          />
          <Bar dataKey={numericCols[0]} fill="#5BAADC" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderTable = (rows, columns) => {
    if (!rows || !columns) return null
    const visibleCols = columns.slice(0, 4)
    return (
      <div style={{ overflowX:'auto', marginTop:'10px' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px', tableLayout:'fixed' }}>
          <thead>
            <tr>
              {visibleCols.map(col => (
                <th key={col} style={{ padding:'8px 10px', background:'#F7FBFF', textAlign:'left', borderBottom:'1px solid #E2EEF9', fontSize:'12px', color:'#6B8BAA', fontWeight:'500' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0,8).map((row,i) => (
              <tr key={i} style={{ background: i%2===0 ? '#fff' : '#F7FBFF' }}>
                {visibleCols.map(col => (
                  <td key={col} style={{ padding:'8px 10px', borderBottom:'1px solid #E2EEF9', color:'#1A1A2E' }}>
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7FBFF', fontFamily:'system-ui, sans-serif' }}>
      <p style={{ color:'#6B8BAA' }}>Loading report...</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7FBFF', fontFamily:'system-ui, sans-serif', padding:'2rem' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'60px', marginBottom:'1rem' }}>📄</div>
        <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#1A1A2E', marginBottom:'8px' }}>Report not found</h1>
        <p style={{ fontSize:'14px', color:'#6B8BAA', marginBottom:'2rem' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{ padding:'10px 20px', background:'#5BAADC', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}
        >
          Go to DataLens
        </button>
      </div>
    </div>
  )

  const insights = report?.insights || []

  return (
    <div style={{ minHeight:'100vh', background:'#F7FBFF', fontFamily:'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2EEF9', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ fontSize:'18px', fontWeight:'700', color:'#1A1A2E' }}>
          Data<span style={{ color:'#5BAADC' }}>Lens</span>
          <span style={{ fontSize:'12px', fontWeight:'400', color:'#6B8BAA', marginLeft:'10px' }}>
            Shared report · Read only
          </span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          style={{ padding:'8px 16px', background:'#5BAADC', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}
        >
          Try DataLens free →
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem' }}>

        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#1A1A2E', marginBottom:'6px' }}>
            Data Analysis Report
          </h1>
          <p style={{ fontSize:'13px', color:'#6B8BAA' }}>
            Generated by DataLens · {new Date().toLocaleDateString()}
          </p>
        </div>

        {insights.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', background:'#fff', border:'1.5px dashed #E2EEF9', borderRadius:'14px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📊</div>
            <p style={{ fontSize:'15px', fontWeight:'500', color:'#1A1A2E' }}>No insights in this report</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:'16px' }}>
            {insights.map((insight, i) => (
              <div key={insight.id || i} style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'1.25rem' }}>
                <div style={{ fontSize:'14px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>
                  {insight.title || insight.insight_text}
                </div>
                {insight.result && (
                  <>
                    {renderChart(insight.result?.rows, insight.result?.columns)}
                    {renderTable(insight.result?.rows, insight.result?.columns)}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop:'3rem', background:'linear-gradient(135deg, #E2EEF9 0%, #FFF0E5 100%)', borderRadius:'14px', padding:'2rem', textAlign:'center' }}>
          <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#1A1A2E', marginBottom:'8px' }}>
            Want to analyse your own data?
          </h2>
          <p style={{ fontSize:'13px', color:'#6B8BAA', marginBottom:'1.25rem' }}>
            Upload any CSV, Excel or JSON file and get instant AI insights for free.
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{ padding:'12px 28px', background:'#5BAADC', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}
          >
            Get started free →
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#A0B4C8', marginTop:'2rem', fontStyle:'italic' }}>
          ⚠️ DataLens can make mistakes. Please verify important results before making decisions.
        </p>
      </div>
    </div>
  )
}