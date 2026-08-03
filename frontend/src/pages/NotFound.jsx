import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:'#F7FBFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif', padding:'2rem' }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ fontSize:'80px', marginBottom:'1rem' }}>🔍</div>
        <h1 style={{ fontSize:'28px', fontWeight:'700', color:'#1A1A2E', marginBottom:'8px' }}>
          Page not found
        </h1>
        <p style={{ fontSize:'14px', color:'#6B8BAA', marginBottom:'2rem', lineHeight:1.6 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding:'10px 20px', background:'transparent', border:'1px solid #E2EEF9', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#6B8BAA' }}
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding:'10px 20px', background:'#5BAADC', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#fff', fontWeight:'500' }}
          >
            Go to dashboard
          </button>
        </div>
        <p style={{ fontSize:'12px', color:'#A0B4C8', marginTop:'2rem' }}>
          DataLens v1.0
        </p>
      </div>
    </div>
  )
}