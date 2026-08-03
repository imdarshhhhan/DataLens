import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  const features = [
    { icon:'📁', title:'Upload any file', desc:'CSV, Excel and JSON files up to 50MB. No setup, no configuration.' },
    { icon:'💬', title:'Ask in plain English', desc:'No SQL knowledge needed. Just type your question and get instant answers.' },
    { icon:'📊', title:'Instant charts', desc:'AI automatically generates visual charts from your data.' },
    { icon:'💡', title:'Smart insights', desc:'Get 5 key insights automatically when you upload a file.' },
    { icon:'🔒', title:'Your data is private', desc:'Each user sees only their own files and analyses.' },
    { icon:'⚡', title:'Blazing fast', desc:'Powered by DuckDB — analyses 100,000 rows in milliseconds.' },
  ]

  const steps = [
    { num:'1', title:'Upload your file', desc:'Drag and drop a CSV, Excel or JSON file' },
    { num:'2', title:'Ask a question', desc:'Type what you want to know in plain English' },
    { num:'3', title:'Get instant insights', desc:'See charts, tables and AI-powered analysis' },
  ]

  return (
    <div style={{ fontFamily:'system-ui, sans-serif', color:'#1A1A2E', background:'#fff' }}>

      {/* Navbar */}
      <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 2rem', borderBottom:'1px solid #E2EEF9', background:'#fff', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontSize:'20px', fontWeight:'700' }}>
          Data<span style={{ color:'#5BAADC' }}>Lens</span>
        </div>
        <div style={{ display:'flex', gap:'12px' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ padding:'8px 18px', background:'transparent', border:'1px solid #E2EEF9', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#1A1A2E' }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/auth')}
            style={{ padding:'8px 18px', background:'#5BAADC', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#fff', fontWeight:'500' }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg, #E2EEF9 0%, #FFF0E5 100%)', padding:'5rem 2rem', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'#fff', borderRadius:'20px', padding:'4px 14px', fontSize:'12px', fontWeight:'600', color:'#5BAADC', border:'1px solid #E2EEF9', marginBottom:'1.5rem' }}>
          AI-powered data analysis
        </div>
        <h1 style={{ fontSize:'clamp(32px, 5vw, 56px)', fontWeight:'800', color:'#1A1A2E', marginBottom:'1.25rem', lineHeight:1.15 }}>
          Analyse your data<br />
          <span style={{ color:'#5BAADC' }}>without writing code</span>
        </h1>
        <p style={{ fontSize:'18px', color:'#6B8BAA', maxWidth:'520px', margin:'0 auto 2rem', lineHeight:1.6 }}>
          Upload a CSV, Excel or JSON file. Ask questions in plain English. Get instant charts and insights — powered by AI.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ padding:'14px 32px', background:'#5BAADC', color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', fontWeight:'600', cursor:'pointer' }}
          >
            Start for free →
          </button>
          <button
            onClick={() => navigate('/auth')}
            style={{ padding:'14px 32px', background:'#fff', color:'#1A1A2E', border:'1px solid #E2EEF9', borderRadius:'10px', fontSize:'16px', cursor:'pointer' }}
          >
            Try as guest
          </button>
        </div>
        <p style={{ fontSize:'12px', color:'#A0B4C8', marginTop:'1rem' }}>
          No credit card required · Guest session lasts 7 days
        </p>
      </div>

      {/* How it works */}
      <div style={{ padding:'5rem 2rem', background:'#fff' }}>
        <h2 style={{ textAlign:'center', fontSize:'32px', fontWeight:'700', marginBottom:'3rem' }}>
          How it works
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'2rem', maxWidth:'800px', margin:'0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'#E2EEF9', color:'#1A6FA8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', margin:'0 auto 1rem' }}>
                {step.num}
              </div>
              <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'8px' }}>{step.title}</h3>
              <p style={{ fontSize:'14px', color:'#6B8BAA' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:'5rem 2rem', background:'#F7FBFF' }}>
        <h2 style={{ textAlign:'center', fontSize:'32px', fontWeight:'700', marginBottom:'3rem' }}>
          Everything you need
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1.5rem', maxWidth:'900px', margin:'0 auto' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #E2EEF9', borderRadius:'14px', padding:'1.5rem' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>{f.icon}</div>
              <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'6px' }}>{f.title}</h3>
              <p style={{ fontSize:'13px', color:'#6B8BAA', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'5rem 2rem', background:'linear-gradient(135deg, #1A6FA8 0%, #5BAADC 100%)', textAlign:'center' }}>
        <h2 style={{ fontSize:'36px', fontWeight:'700', color:'#fff', marginBottom:'1rem' }}>
          Ready to analyse your data?
        </h2>
        <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.8)', marginBottom:'2rem' }}>
          Join thousands of users who analyse data without writing code.
        </p>
        <button
          onClick={() => navigate('/auth')}
          style={{ padding:'14px 36px', background:'#fff', color:'#1A6FA8', border:'none', borderRadius:'10px', fontSize:'16px', fontWeight:'700', cursor:'pointer' }}
        >
          Get started free →
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding:'2rem', background:'#1A1A2E', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ fontSize:'16px', fontWeight:'600', color:'#fff' }}>
          Data<span style={{ color:'#5BAADC' }}>Lens</span>
        </div>
        <div style={{ display:'flex', gap:'20px' }}>
          <a href="#" style={{ color:'#6B8BAA', textDecoration:'none', fontSize:'13px' }}>Privacy policy</a>
          <a href="#" style={{ color:'#6B8BAA', textDecoration:'none', fontSize:'13px' }}>Terms</a>
          <a href="#" style={{ color:'#6B8BAA', textDecoration:'none', fontSize:'13px' }}>Contact</a>
        </div>
        <div style={{ fontSize:'12px', color:'#6B8BAA' }}>
          © 2026 DataLens. All rights reserved.
        </div>
      </div>

    </div>
  )
}