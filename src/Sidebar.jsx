import styles from './Sidebar.module.css'

const recents = [
  'Scope change follow-up',
  'Feedback to designer',
  'Q3 status update',
]

const templates = [
  'Meeting follow-up',
  'Status update',
]

export default function Sidebar({ activeDraft, onSelectDraft, onNewDraft }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>Translate</span>
      </div>

      <button className={styles.newDraft} onClick={onNewDraft}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        New draft
      </button>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Recents</p>
        {recents.map(r => (
          <button
            key={r}
            className={`${styles.navItem} ${activeDraft === r ? styles.active : ''}`}
            onClick={() => onSelectDraft(r)}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3.5 4.5h6M3.5 6.5h6M3.5 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>{r}</span>
          </button>
        ))}
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Templates</p>
        {templates.map(t => (
          <button key={t} className={styles.navItem}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 4.5h11" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 4.5v7.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span>{t}</span>
          </button>
        ))}
      </section>
    </aside>
  )
}
