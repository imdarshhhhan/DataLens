import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { getSchema, generateInsights, runQuery } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'



export default function Workspace() {
  const { fileId } = useParams()
  const navigate   = useNavigate()

  const cacheKey = `workspace_${fileId}`

  const [analysis, setAnalysis] = useState('')
  const [schema,   setSchema]   = useState(null)
  const [insights, setInsights] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [queryText,setQueryText]= useState('')
  const [queryMode,setQueryMode]= useState('nl')
  const [querying, setQuerying] = useState(false)
  const [results,  setResults]  = useState([])
  const [error,    setError]    = useState('')

  useEffect(() => {
    // Try to restore from cache first
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.schema && parsed.insights) {
          setSchema(parsed.schema)
          setInsights(parsed.insights)
          setAnalysis(parsed.analysis || '')
          setResults(parsed.results || [])
          setLoading(false)
          return  // Skip API calls — use cached data
        }
      }
    } catch (e) {
      console.log('Cache read failed, loading fresh')
    }

    // No cache — load fresh from API
    const load = async () => {
      try {
        const schemaRes  = await getSchema(fileId)
        const raw        = schemaRes.data
        setSchema(raw)

       const insightRes = await generateInsights({ file_id: fileId })
setInsights(insightRes.data.insights || [])
setAnalysis(insightRes.data.analysis || '')

        // Save to cache
sessionStorage.setItem(cacheKey, JSON.stringify({
  schema:   raw,
  insights: insightRes.data.insights || [],
  analysis: insightRes.data.analysis || '',
  results:  []
}))

      } catch (err) {
        setError('Failed to load: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fileId])



 const handleQuery = async (directQuery) => {
    const textToUse = directQuery || queryText
    if (!textToUse.trim()) return

    window.scrollTo({ top: 0, behavior: 'smooth' })
    setQueryText('')
    setError('')
    setQuerying(true)

    try {
      const res = await runQuery({
        file_id:    fileId,
        query_text: textToUse,
        query_type: queryMode
      })

      setResults(prev => {
        const newResults = [res.data, ...prev]

        // Update cache with latest results
        try {
          const cached = JSON.parse(sessionStorage.getItem(cacheKey) || '{}')
          sessionStorage.setItem(cacheKey, JSON.stringify({
            ...cached,
            results: newResults
          }))
        } catch (e) {}

        return newResults
      })

    } catch (err) {
      setError('Query failed — please try again')
    } finally {
      setQuerying(false)
    }
  }


const renderChart = (rows, columns) => {
  if (!rows || rows.length === 0 || !columns) return null
  const numericCols = columns.filter(c => typeof rows[0]?.[c] === 'number')
  if (numericCols.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={rows}
        margin={{ top:8, right:8, left:0, bottom:0 }}
        style={{ outline:'none' }}
      >
        <XAxis
          dataKey={columns[0]}
          tick={{ fontSize:11, fill:'#6B8BAA' }}
          axisLine={{ stroke:'#E2EEF9' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize:11, fill:'#6B8BAA' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            border:'1px solid #E2EEF9',
            borderRadius:'8px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
            background:'#fff',
            outline:'none',
          }}
          cursor={{ fill:'rgba(91,170,220,0.06)' }}
          itemStyle={{ color:'#1A1A2E', fontSize:'12px' }}
          labelStyle={{ color:'#6B8BAA', fontSize:'11px', marginBottom:'4px' }}
        />
        <Bar
          dataKey={numericCols[0]}
          fill="#5BAADC"
          radius={[4,4,0,0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}




const formatValue = (val) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'number') {
    // Check if it's a float (has decimals)
    if (val % 1 !== 0) {
      return val.toFixed(2)
    }
    return val.toLocaleString()
  }
  return String(val)
}

const renderTable = (rows, columns) => {
  if (!rows || !columns) return null

  // Limit to first 4 columns max to avoid horizontal scroll
  const visibleCols = columns.slice(0, 4)

  return (
    <div style={{ marginTop:'10px' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px', tableLayout:'fixed' }}>
        <thead>
          <tr>
            {visibleCols.map(col => (
              <th key={col} style={{ padding:'8px 8px', background:'#F7FBFF', textAlign:'left', borderBottom:'1px solid #E2EEF9', fontSize:'12px', color:'#6B8BAA', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0,8).map((row,i) => (
            <tr key={i} style={{ background: i%2===0 ? '#fff' : '#F7FBFF' }}>
              {visibleCols.map(col => (
                <td key={col} style={{ padding:'8px 8px', borderBottom:'1px solid #E2EEF9', color:'#1A1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {columns.length > 4 && (
        <p style={{ fontSize:'11px', color:'#A0B4C8', marginTop:'6px' }}>
          + {columns.length - 4} more column{columns.length - 4 > 1 ? 's' : ''} not shown
        </p>
      )}
    </div>
  )
}

  const allFollowups = [...new Set(insights.flatMap(i => i.followups || []))].slice(0,7)

  if (loading) return (
    <Layout>
      <div style={{ textAlign:'center', padding:'4rem' }}>
        <p style={{ fontSize:'20px', fontWeight:'600', color:'#1A1A2E' }}>Analysing your data...</p>
        <p style={{ color:'#6B8BAA', marginTop:'8px', fontSize:'14px' }}>Generating AI insights</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background:'transparent', border:'none', color:'#6B8BAA', fontSize:'14px', cursor:'pointer', padding:'0 0 6px', display:'block' }}>
            &larr; Back
          </button>
          <h1 style={{ fontSize:'22px', fontWeight:'600', color:'#1A1A2E' }}>{schema?.filename}</h1>
          <p style={{ fontSize:'13px', color:'#6B8BAA', marginTop:'2px' }}>
            {schema?.row_count?.toLocaleString()} rows &nbsp;&middot;&nbsp; {schema?.col_count} columns
          </p>
        </div>
        <button onClick={() => navigate('/export/' + fileId)} style={{ padding:'9px 18px', background:'#FFF0E5', color:'#C4661A', border:'1px solid #F5A463', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor:'pointer' }}>
          Export
        </button>
      </div>

      {error && (
        <p style={{ color:'#C0392B', background:'#FDECEA', padding:'10px 14px', borderRadius:'8px', marginBottom:'1rem', fontSize:'13px' }}>
          {error}
        </p>
      )}

      <div style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', gap:'4px', background:'#F2F4F7', borderRadius:'8px', padding:'3px', width:'fit-content', marginBottom:'10px' }}>
          <button onClick={() => setQueryMode('nl')} style={{ padding:'6px 16px', background: queryMode==='nl' ? '#fff' : 'transparent', border:'none', borderRadius:'6px', color: queryMode==='nl' ? '#1A6FA8' : '#6B8BAA', fontWeight: queryMode==='nl' ? '600' : '400', fontSize:'13px', cursor:'pointer' }}>
            Ask 
          </button>
          <button onClick={() => setQueryMode('sql')} style={{ padding:'6px 16px', background: queryMode==='sql' ? '#fff' : 'transparent', border:'none', borderRadius:'6px', color: queryMode==='sql' ? '#1A6FA8' : '#6B8BAA', fontWeight: queryMode==='sql' ? '600' : '400', fontSize:'13px', cursor:'pointer' }}>
            Write SQL
          </button>
        </div>
<div data-query-row style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>          
          <input
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', border:'1px solid #E2EEF9', borderRadius:'8px', fontSize:'14px', color:'#1A1A2E', outline:'none', background:'#F7FBFF' }}
            placeholder={queryMode==='nl' ? 'Be specific for best results — e.g. "average BMI by gender"' : 'Write SQL — e.g. SELECT gender, COUNT(*) FROM data GROUP BY gender'}
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleQuery()}
          />


          <button
  onClick={() => handleQuery()}
  disabled={querying || !queryText.trim()}
  style={{
    padding:'10px 22px',
    background: (querying || !queryText.trim()) ? '#E2EEF9' : '#5BAADC',
    color: (querying || !queryText.trim()) ? '#6B8BAA' : '#fff',
    border:'none',
    borderRadius:'8px',
    fontSize:'14px',
    fontWeight:'500',
    cursor: (querying || !queryText.trim()) ? 'not-allowed' : 'pointer'
  }}
>
  {querying ? '...' : 'Analyse'}
</button>

        </div>
      </div>



      
{querying && (
  <div style={{ background:'#fff', border:'2px solid #E2EEF9', borderRadius:'14px', padding:'1.5rem', marginBottom:'1.25rem', textAlign:'center' }}>
    <p style={{ fontSize:'14px', color:'#6B8BAA' }}>Analysing your question...</p>
  </div>
)}

{results.map((res, i) => (


        <div key={i}
        
        
        style={{ background:'#fff', border: i === 0 ? '2px solid #5BAADC' : '1px solid #E2EEF9', borderRadius:'14px', padding:'1.5rem', marginBottom:'1.25rem', boxShadow: i === 0 ? '0 4px 16px rgba(91,170,220,0.15)' : '0 2px 8px rgba(91,170,220,0.06)' }}>          

          
          <p style={{ fontSize:'13px', color:'#6B8BAA', marginBottom:'6px', fontWeight:'500' }}>Here are your results</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'15px', fontWeight:'600', color:'#1A1A2E' }}>"{res.query}"</span>
            {res.confidence && (
              <span style={{ fontSize:'12px', padding:'3px 12px', borderRadius:'20px', fontWeight:'500', background: res.confidence==='high' ? '#E6F6EE' : '#FFF0E5', color: res.confidence==='high' ? '#1A7A47' : '#C4661A' }}>
                {res.confidence} confidence
              </span>
            )}
          </div>


          {!res.understood ? (
  <div style={{ background:'#FFF0E5', border:'1px solid #FAD4B0', borderRadius:'10px', padding:'1rem' }}>
    <p style={{ fontSize:'14px', marginBottom:'10px', color:'#C4661A', fontWeight:'600' }}>
      🔍 {res.message}
    </p>
    {res.suggestions?.map((s,j) => (
      <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'8px', background:'#fff', padding:'8px 12px', borderRadius:'8px', border:'1px solid #FAD4B0' }}>
        <span style={{ fontSize:'14px' }}>💡</span>
        <p style={{ fontSize:'13px', color:'#1A1A2E', margin:0 }}>{s}</p>
      </div>
    ))}
  </div>



          ) : (
            <>
              {renderChart(res.result?.rows, res.result?.columns)}
              {renderTable(res.result?.rows, res.result?.columns)}
            </>
          )}
          {res.sql_used && (
            <details style={{ marginTop:'10px' }}>
              <summary style={{ fontSize:'13px', color:'#6B8BAA', cursor:'pointer' }}></summary>
              <code style={{ display:'block', fontSize:'12px', background:'#F2F4F7', padding:'10px', borderRadius:'6px', marginTop:'6px', whiteSpace:'pre-wrap', fontFamily:'monospace' }}>
                {res.sql_used}
              </code>
            </details>
          )}
        </div>
      ))}


{/* Written Analysis Section */}
{analysis && (
  <div style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'14px', padding:'1.5rem', marginBottom:'1.5rem' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
      <span style={{ fontSize:'20px' }}>🧠</span>
      <h2 style={{ fontSize:'17px', fontWeight:'700', color:'#1A1A2E' }}>
        AI Data Analysis
      </h2>
      <span style={{ fontSize:'11px', padding:'2px 10px', background:'#E2EEF9', color:'#1A6FA8', borderRadius:'20px', fontWeight:'500' }}>
        Auto-generated
      </span>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      {analysis.split('\n').filter(line => line.trim()).map((line, i) => (
        <div
          key={i}
          style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 14px', background:'#F7FBFF', borderRadius:'10px', border:'1px solid #E2EEF9', fontSize:'14px', color:'#1A1A2E', lineHeight:1.6 }}
        >
          {line.trim()}
        </div>
      ))}
    </div>
  </div>
)}


      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'17px', fontWeight:'600', color:'#1A1A2E' }}>Key insights</h2>


        <span style={{ fontSize:'13px', padding:'3px 10px', background:'#E2EEF9', color:'#1A6FA8', borderRadius:'20px' }}>
          {insights.length}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px', marginBottom:'1.5rem' }}>
        {insights.map((insight, i) => (
          <div key={insight.id || i} style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'12px', padding:'1.25rem' }}>
            <div style={{ fontSize:'14px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>
              {insight.title}
            </div>
            {renderChart(insight.result?.rows, insight.result?.columns)}
            {renderTable(insight.result?.rows, insight.result?.columns)}
          </div>
        ))}
      </div>

      {allFollowups.length > 0 && (
        <div style={{ background:'#FFF0E5', border:'1px solid #FAD4B0', borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'2rem' }}>
          <p style={{ fontSize:'15px', fontWeight:'600', color:'#C4661A', marginBottom:'12px' }}>
            💡 You might want to ask:
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {allFollowups.map((chip, ci) => (
              <button
                key={ci}
                onClick={() => handleQuery(chip)}

                style={{ padding:'7px 16px', background:'#fff', color:'#C4661A', border:'1px solid #F5A463', borderRadius:'20px', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}
              >
                {chip} ↗
              </button>
            ))}
          </div>
        </div>
      )}

    </Layout>
  )
}