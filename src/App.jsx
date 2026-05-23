import Editor from './Editor'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <div className={styles.topBar}>
        <div className={styles.topRow}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{flexShrink:0}}>
            <rect width="26" height="26" rx="3" fill="#4285f4"/>
            <rect x="6" y="7" width="14" height="2" rx="1" fill="white"/>
            <rect x="6" y="12" width="14" height="2" rx="1" fill="white"/>
            <rect x="6" y="17" width="9" height="2" rx="1" fill="white"/>
          </svg>
          <span className={styles.docName}>Untitled document</span>
          <button className={styles.shareBtn}>Share</button>
        </div>
        <div className={styles.menuRow}>
          {['File','Edit','View','Insert','Format','Tools','Extensions'].map(m => (
            <span key={m} className={styles.mitem}>{m}</span>
          ))}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tsep} />
        <span className={styles.tbtnLabel}>Normal text</span>
        <div className={styles.tsep} />
        <span className={styles.tbtn} style={{fontWeight:700}}>B</span>
        <span className={styles.tbtn} style={{fontStyle:'italic'}}>I</span>
        <span className={styles.tbtn} style={{textDecoration:'underline'}}>U</span>
        <div className={styles.tsep} />
        <span className={styles.tbtn}>≡</span>
        <span className={styles.tbtn}>⊞</span>
      </div>

      <div className={styles.pageArea}>
        <Editor />
      </div>
    </div>
  )
}
