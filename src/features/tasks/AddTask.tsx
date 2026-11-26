import { useState } from 'react'
import type { NewTask, ParseTaskInput, TaskDraft } from '../../shared/types'

interface AddTaskProps {
  parse: ParseTaskInput
  subjects: string[]
  onAdd: (task: NewTask) => void
}

export function AddTask({ parse, subjects, onAdd }: AddTaskProps) {
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<TaskDraft | null>(null)

  if (draft === null) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (text.trim()) setDraft(parse(text))
        }}
      >
        <label>
          Add task
          <input
            placeholder="e.g. eng ex.2 tomorrow"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <button type="submit">↵ Enter</button>
        <p>Short form gets turned into title, subject and due date.</p>
      </form>
    )
  }

  const title = draft.title.trim()

  return (
    <section
      role="dialog"
      aria-label="New task"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDraft(null)
      }}
    >
      <h2>New task</h2>
      <p>You typed: <span>{draft.typed}</span></p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!title || !draft.due) return

          onAdd({ ...draft, title, due: draft.due })
          setText('')
          setDraft(null)
        }}
      >
        <label>
          Title
          <input
            autoFocus
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </label>

        <label>
          Subject
          <select
            value={draft.subject ?? ''}
            onChange={(event) => setDraft({ ...draft, subject: event.target.value || null })}
          >
            <option value="">No subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>

        <label>
          Due
          <input
            type="date"
            value={draft.due ?? ''}
            onChange={(event) => setDraft({ ...draft, due: event.target.value || null })}
          />
        </label>

        <label>
          Time
          <input
            type="time"
            placeholder="Optional"
            value={draft.time ?? ''}
            onChange={(event) => setDraft({ ...draft, time: event.target.value || null })}
          />
        </label>

        <label>
          Notes
          <input
            placeholder="Optional"
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </label>

        <button type="button" onClick={() => setDraft(null)}>Cancel</button>
        <button type="submit" disabled={!title || !draft.due}>Save task</button>
      </form>
    </section>
  )
}
