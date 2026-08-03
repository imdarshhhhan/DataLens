import { useState } from 'react'
import Sidebar from './Sidebar'
import GuestBanner from './GuestBanner'
import Footer from './Footer'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
  <div style={{ display:'flex', flexDirection:'column', background:'#F7FBFF', fontFamily:'system-ui, sans-serif' }}>

    <div style={{ display:'flex', minHeight:'95vh'  }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', zIndex:98 }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        data-mobile-sidebar
        style={{ position:'fixed', top:0, left:0, height:'100vh', zIndex:99, transition:'transform 0.25s ease', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div data-desktop-sidebar style={{ width:'200px', flexShrink:0 }}>
        <Sidebar />
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Mobile topbar */}
        <div data-mobile-topbar>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background:'transparent', border:'1px solid #E2EEF9', borderRadius:'8px', padding:'6px 10px', fontSize:'16px', cursor:'pointer' }}
          >
            ☰
          </button>
          <span style={{ fontSize:'18px', fontWeight:'600', color:'#1A1A2E' }}>
            Data<span style={{ color:'#5BAADC' }}>Lens</span>
          </span>
        </div>

        <div data-content style={{ flex:1, padding:'1.5rem 2rem' }}>
          <GuestBanner />
          {children}
        </div>
      </div>
    </div>

    {/* Footer now sits OUTSIDE the flex row — spans full width */}
    <Footer />
  </div>
)
}