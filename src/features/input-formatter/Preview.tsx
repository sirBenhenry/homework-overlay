import { useState } from 'react'
import { SAMPLE_SUBJECTS, SAMPLE_TODAY } from '../../shared/sampleData.ts'
import { AbbreviationEditor, parseTaskInput, useAbbreviations } from './index.ts'

/** Development page: type short text and see the draft, then edit the abbreviations. Not part of the app. */
export default function Preview() {
  const [text, setText] = useState('eng ex.2 tomorrow')
  const { abbreviations } = useAbbreviations()
  const draft = parseTaskInput(text, { today: SAMPLE_TODAY, subjects: SAMPLE_SUBJECTS, abbreviations })

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span>Typed text (today is {SAMPLE_TODAY})</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. eng ex.2 tomorrow"
          style={{
            height: 44,
            padding: '0 12px',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-s)',
            fontSize: 'var(--text-l)',
          }}
        />
      </label>

      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 16px' }}>
        <dt>Title</dt>
        <dd style={{ margin: 0 }}>{draft.title || '–'}</dd>
        <dt>Subject</dt>
        <dd style={{ margin: 0 }}>{draft.subject ?? 'null'}</dd>
        <dt>Due</dt>
        <dd style={{ margin: 0 }}>{draft.due ?? 'null'}</dd>
      </dl>

      <AbbreviationEditor />
    </main>
  )
}
