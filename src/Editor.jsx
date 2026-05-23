import { useState, useEffect, useRef, useCallback } from 'react'
import { rewrite } from './api'
import styles from './Editor.module.css'

const TO_OPTIONS = ['Higher ups', 'Client', 'Coworker', 'Collaborators']
const TONE_OPTIONS = ['Professional', 'Warm', 'Direct', 'Diplomatic']
const FORMAT_OPTIONS = ['Messenger', 'Email', 'Conversation']

const DEBOUNCE_MS = 1200

function PillGroup({ options, selected, onChange, singleSelect = false }) {
  function toggle(val) {
    if (singleSelect) {
      onChange([val])
    } else {
      onChange(
        selected.includes(val)
          ? selected.filter(v => v !== val)
          : [...selected, val]
      )
    }
  }
  return (
    <div className={styles.pillGroup}>
      {options.map(opt => (
        <button
          key={opt}
          className={`${styles.chip} ${selected.includes(opt) ? styles.on : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function Editor() {
  const [to, setTo] = useState([])
  const [tone, setTone] = useState(['Professional'])
  const [format, setFormat] = useState(['Messenger'])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasRewritten, setHasRewritten] = useState(false)
  const [copied, setCopied] = useState(false)

  const msgRef = useRef(null)
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  const getMsg = () => msgRef.current?.innerText?.trim() || ''

  const runRewrite = useCallback(async (extraInstruction) => {
    const message = getMsg()
    if (!message) return

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError('')
    setOutput('')
    setHasRewritten(true)

    try {
      await rewrite(
        { message, to, tone, format, extraInstruction },
        chunk => setOutput(prev => prev + chunk),
        controller.signal
      )
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [to, tone, format])

  function scheduleRewrite() {
    clearTimeout(debounceRef.current)
    if (getMsg()) debounceRef.current = setTimeout(() => runRewrite(), DEBOUNCE_MS)
  }

  function onMsgInput() {
    scheduleRewrite()
  }

  // Re-trigger when pills change
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (getMsg()) debounceRef.current = setTimeout(() => runRewrite(), 600)
  }, [to, tone, format]) // eslint-disable-line

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function handleAction(extraInstruction) {
    clearTimeout(debounceRef.current)
    runRewrite(extraInstruction)
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Untitled</h1>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="#80868b" strokeWidth="1.2"/><path d="M1.5 11.5c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="#80868b" strokeWidth="1.2" strokeLinecap="round"/></svg>
            To
          </span>
          <PillGroup options={TO_OPTIONS} selected={to} onChange={setTo} />
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#80868b" strokeWidth="1.2"/><path d="M4.5 7.5s.5 1 2 1 2-1 2-1" stroke="#80868b" strokeWidth="1.2" strokeLinecap="round"/><circle cx="4.5" cy="5.5" r=".75" fill="#80868b"/><circle cx="8.5" cy="5.5" r=".75" fill="#80868b"/></svg>
            Tone
          </span>
          <PillGroup options={TONE_OPTIONS} selected={tone} onChange={setTone} />
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="9" rx="1.5" stroke="#80868b" strokeWidth="1.2"/><path d="M1 5h11" stroke="#80868b" strokeWidth="1.2"/></svg>
            Format
          </span>
          <PillGroup options={FORMAT_OPTIONS} selected={format} onChange={setFormat} singleSelect />
        </div>
      </div>

      <div
        ref={msgRef}
        className={styles.body}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start typing…"
        onInput={onMsgInput}
      />

      {(hasRewritten || loading) && (
        <div className={styles.outputSection}>
          <div className={styles.outLabelRow}>
            <span className={styles.outLabel}>
              rewritten
              {loading && <span className={styles.dot} />}
            </span>
            <button
              className={`${styles.copyChip} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {error
            ? <p className={styles.error}>{error}</p>
            : <div className={styles.outText}>
                {output}
                {loading && <span className={styles.cursor} />}
              </div>
          }

          {output && !loading && (
            <div className={styles.refineRow}>
              {[
                ['Shorten', 'Make it shorter.'],
                ['Soften', 'Make the tone softer and warmer.'],
                ['Strengthen', 'Make it more assertive and confident.'],
                ['Bulletify', 'Convert it to bullet points.'],
              ].map(([label, instruction]) => (
                <button key={label} className={styles.refineChip} onClick={() => handleAction(instruction)}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
