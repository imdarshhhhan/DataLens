export default function Footer() {
  return (
    <footer style={styles.wrap}>
      <div style={styles.disclaimer}>
        ⚠️ DataLens can make mistakes. Please verify important results before making decisions.
      </div>
      <div style={styles.mainFooter}>
        <div style={styles.left}>
          <div style={styles.logo}>
            Data<span style={{ color:'#5BAADC' }}>Lens</span>
          </div>
          <p style={styles.tagline}>AI-powered data analysis, made simple.</p>
        </div>
        <div style={styles.right}>
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Product</span>
            <a href="#" style={styles.link}>Features</a>
            <a href="#" style={styles.link}>Pricing</a>
          </div>
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Legal</span>
            <a href="#" style={styles.link}>Privacy policy</a>
            <a href="#" style={styles.link}>Terms</a>
          </div>
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Support</span>
            <a href="#" style={styles.link}>Contact</a>
            <a href="#" style={styles.link}>Help center</a>
          </div>
        </div>
      </div>
      <div style={styles.bottomBar}>
        Made with ❤️· DataLens v1.0 · © 2026 All rights reserved
      </div>
    </footer>
  )
}

const styles = {
  wrap: {
    marginTop: 'auto',
    width:     '100%',
  },
  disclaimer: {
    textAlign:    'center',
    fontSize:     '12px',
    color:        '#6B8BAA',
    background:   '#fff',
    padding:      '10px 2rem',
    fontStyle:    'italic',
    borderRadius: '20px',
    margin:       '0 2rem 1rem',
    border:       '1px solid #E2EEF9',
  },
  mainFooter: {
    display:        'flex',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            '2rem',
    padding:        '2.5rem 2rem',
    background:     '#EAF4FB',
    borderTop:      '3px solid #00080d55',
  },
  left: {
    maxWidth: '280px',
  },
  logo: {
    fontSize:   '20px',
    fontWeight: '600',
    color:      '#1A1A2E',
    marginBottom:'8px',
  },
  tagline: {
    fontSize: '13px',
    color:    '#6B8BAA',
  },
  right: {
    display:  'flex',
    gap:      '3rem',
    flexWrap: 'wrap',
  },
  linkCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '8px',
  },
  colTitle: {
    fontSize:    '12px',
    fontWeight:  '600',
    color:       '#1A1A2E',
    marginBottom:'4px',
    textTransform:'uppercase',
    letterSpacing:'0.04em',
  },
  link: {
    fontSize:       '13px',
    color:          '#6B8BAA',
    textDecoration: 'none',
  },
  bottomBar: {
    textAlign:  'center',
    padding:    '14px',
    fontSize:   '12px',
    color:      '#fff',
    background: '#1A6FA8',
  },
}