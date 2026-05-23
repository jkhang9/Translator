import { useState, useRef, useEffect } from 'react'
import styles from './PillGroup.module.css'

function AutoInput({ onCommit, onCancel }) {
  const ref = useRef(null)
  const sizerRef = useRef(null)

  useEffect(() => {
    ref.current?.focus()
    resize('')
  }, [])

  function resize(val) {
    if (!sizerRef.current || !ref.current) return
    sizerRef.current.textContent = val || 'custom…'
    ref.current.style.width = sizerRef.current.offsetWidth + 'px'
  }

  function handleKey(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      onCommit(e.target.value.trim())
    }
    if (e.key === 'Escape') onCancel()
  }

  function handleBlur(e) {
    if (e.target.value.trim()) onCommit(e.target.value.trim())
    else onCancel()
  }

  return (
    <span className={styles.inputWrap}>
      <span className={styles.sizer} ref={sizerRef}>custom…</span>
      <input
        ref={ref}
        className={styles.pillInput}
        placeholder="custom…"
        onChange={e => resize(e.target.value)}
        onKeyDown={handleKey}
        onBlur={handleBlur}
      />
    </span>
  )
}

export default function PillGroup({ options, selected, onChange, allowCustom = false }) {
  const [customs, setCustoms] = useState([])
  const [showingInput, setShowingInput] = useState(false)

  function toggle(val) {
    onChange(
      selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val]
    )
  }

  function commitCustom(val) {
    if (!customs.includes(val)) {
      setCustoms(prev => [...prev, val])
      onChange([...selected, val])
    }
    setShowingInput(false)
  }

  const allOptions = [...options, ...customs]

  return (
    <div className={styles.group}>
      {allOptions.map(opt => (
        <button
          key={opt}
          className={`${styles.pill} ${selected.includes(opt) ? styles.active : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}

      {allowCustom && (
        <>
          {showingInput
            ? <AutoInput onCommit={commitCustom} onCancel={() => setShowingInput(false)} />
            : <button className={styles.addPill} onClick={() => setShowingInput(true)}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                add
              </button>
          }
        </>
      )}
    </div>
  )
}
