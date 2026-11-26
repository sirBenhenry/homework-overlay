import { type FormEvent, useId, useState } from 'react'
import { type Abbreviation, isBuiltIn, sameShort } from './abbreviations.ts'
import styles from './AbbreviationEditor.module.css'
import { useAbbreviations } from './useAbbreviations.ts'

const KIND_LABELS: Record<Abbreviation['kind'], string> = { subject: 'Subject', word: 'Word' }

/** Why the new abbreviation cannot be added, or `null` if it can. */
function problemWith(short: string, full: string, abbreviations: Abbreviation[]): string | null {
  if (short === '') return 'Enter the short form.'
  if (/\s/.test(short)) return 'The short form cannot contain a space.'
  if (full === '') return 'Enter what the short form stands for.'
  // An own one may replace a built-in one, but not another own one.
  const existing = abbreviations.find((a) => sameShort(a.short, short))
  if (existing && !isBuiltIn(existing)) {
    return `You already have "${existing.short}". Remove it first.`
  }
  return null
}

/** Lists all abbreviations and lets the user add and remove their own. */
export function AbbreviationEditor() {
  const { abbreviations, addAbbreviation, removeAbbreviation } = useAbbreviations()
  const [short, setShort] = useState('')
  const [full, setFull] = useState('')
  const [kind, setKind] = useState<Abbreviation['kind']>('subject')
  const [error, setError] = useState<string | null>(null)
  const id = useId()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const newShort = short.trim()
    const newFull = full.trim()
    const problem = problemWith(newShort, newFull, abbreviations)
    setError(problem)
    if (problem !== null) return
    addAbbreviation({ short: newShort, full: newFull, kind })
    setShort('')
    setFull('')
  }

  return (
    <section className={styles.panel} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={styles.heading}>
        Abbreviations
      </h2>

      <ul className={styles.list}>
        {abbreviations.map((a) => (
          <li key={a.short.toLowerCase()} className={styles.row}>
            <span className={styles.short}>{a.short}</span>
            <span className={styles.full}>{a.full}</span>
            <span className={styles.kind}>{KIND_LABELS[a.kind]}</span>
            {isBuiltIn(a) ? (
              <span className={styles.badge}>Built-in</span>
            ) : (
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${a.short}`}
                onClick={() => removeAbbreviation(a.short)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Short</span>
          <input
            className={styles.input}
            value={short}
            onChange={(e) => setShort(e.target.value)}
            placeholder="e.g. bio"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Stands for</span>
          <input
            className={styles.input}
            value={full}
            onChange={(e) => setFull(e.target.value)}
            placeholder="e.g. Biologie"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Kind</span>
          <select
            className={styles.input}
            value={kind}
            onChange={(e) => setKind(e.target.value as Abbreviation['kind'])}
          >
            <option value="subject">{KIND_LABELS.subject}</option>
            <option value="word">{KIND_LABELS.word}</option>
          </select>
        </label>
        <button type="submit" className={styles.add}>
          Add
        </button>
      </form>
      {error !== null && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </section>
  )
}
