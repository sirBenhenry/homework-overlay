# Brief: tasks

| | |
|---|---|
| Branch | `tasks` |
| Your folder | `src/features/tasks/` |
| Trello cards | Aufgabe hinzufügen (M), Aufgabenliste speichern (S) |

## What you build

Three drop-in pieces:

1. Storage for tasks that survives closing the app.
2. The "Add task" box with its "New task" dialog.
3. The "Upcoming tasks" list.

You do not put them into the app. Ben places them into the frame after the merge. Until then you look at them on the preview page.

The app is a desktop app, but for your part that changes nothing: `localStorage` works in the app window as it does in a browser.

## User stories

### Aufgabe hinzufügen

> Als Nutzer möchte man ohne Probleme schnell Aufgaben hinzufügen, welche automatisch in den Kalender eingetragen werden. Damit das Overlay mich erinnern kann, das ich an diese erinnert werden kann.

Acceptance criteria:

- Der Nutzer kann schnell und einfach neue Aufgaben hinzufügen.
- Neue Aufgaben werden automatisch im Kalender eingetragen. **Your share:** every component that uses `useTasks()` gets the new task at once. The calendar itself is built on the `calendar` branch.
- Das Overlay erinnert den Nutzer rechtzeitig an anstehende Aufgaben. **Not in this sprint** (decided by Ben, 25 Nov 2026). Do not build reminders.

### Aufgabenliste speichern

> Als Nutzer möchte ich eine persistente Aufgabenliste, welche mit dem Schiessen und Öffnen der App alle Aufgaben beibehält.

Acceptance criteria:

- Alle Aufgaben müssen persistent sein
- Schliessen löscht keine Aufgaben
- Liste muss nach dem Öffnen der App unverändert angezeigt werden

## Your part of the wireframe

The whole wireframe is in `docs/wireframe/` and you may look at all of it. Your part is two boxes on the Home screen and the dialog that takes the place of one of them.

![Your two boxes on the Home screen](../docs/wireframe/parts/tasks-home.png)

![The dialog after pressing Enter](../docs/wireframe/parts/tasks-new-task.png)

The exact sizes are in `docs/wireframe/source/01-home.html` (`<section aria-label="Upcoming tasks">` and `<section aria-label="Add task">`) and in `docs/wireframe/source/02-home-new-task.html` (`<section role="dialog" aria-label="New task">`).

**The "Upcoming tasks" box is `TaskList`** (screen 01, right half, upper box, 596 × 300 px)

- Panel: 1 px strong outline, 12 px radius, padding 16 px above and below and 20 px left and right, 8 px between the rows.
- Heading `Upcoming tasks`, 17 px, weight 600. The `All tasks` link on the right is left out in this sprint.
- A row: 1 px outline (`--color-border`), 8 px radius, padding 8 × 12 px. On the left the title (15 px, weight 500) and, 10 px after it on the same baseline, the subject (13 px, muted). On the right the due date (13 px, never wraps).
- The rows in the wireframe: Exercise 2 / Englisch / Tomorrow, Worksheet fractions / Mathe / Fri 25.09., Read chapter 3 / Deutsch / Mon 28.09., Vocab test prep / Französisch / Tue 29.09., Project draft / Informatik / Thu 01.10.

**The "Add task" box is `AddTask`** (screen 01, right half, lower box, 596 × 300 px)

- Panel: 2 px strong outline, 12 px radius, the same padding. The content sits in the vertical middle, with 10 px between its lines.
- The label `Add task`, 15 px, weight 600.
- One line with the text field and the button, 8 px apart. The text field is 44 px high with a 1 px strong outline, 8 px radius and 15 px text, and takes all the remaining width. The button `↵ Enter` is 44 px high with a dark fill, white 14 px text in weight 500 and 8 px radius.
- Below it the hint `Short form gets turned into title, subject and due date.`, 12 px, muted.

**The "New task" dialog is `AddTask` after Enter** (screen 02, same place and size as the box)

- Panel: white, 2 px strong outline, 12 px radius, the same padding, and the shadow `0 8px 24px rgba(0, 0, 0, 0.14)`.
- Top line: `New task` on the left (17 px, weight 600). On the right `You typed:` (13 px, muted) and the typed text in a chip with the fill `--color-fill`, a 1 px outline and 6 px radius.
- The fields form a grid of label, field, label, field: Title and Subject in the first line, Due and Time in the second, Notes in the third across the whole width. Labels 14 px. Fields 40 px high, 8 px radius, 15 px text.
- Title, Subject and Due have the strong outline. Time and Notes have the normal outline and the placeholder `Optional`.
- Bottom right: `Cancel` (44 px high, 1 px strong outline) and `Save task` (44 px high, dark fill, white text), 8 px apart.
- The wireframe shows Title and Due as fixed text. In the app the user can change them.

**On these screens, but not yours**

- The header and the navigation bar. They belong to `navbar`.
- The "Today" panel in the left half. It is not built in this sprint.
- The values the dialog starts with (`Exercise 2`, `Englisch`, `Thu 24.09.2026`). They come from `parse`, which is built on `input-formatter`.

**Elsewhere in the wireframe**

- Screens 08 and 09, the Tasks page, show the stored tasks with search and details. Not built in this sprint.
- The `Due` chips in the calendar (screen 03) show your tasks, but the `calendar` branch draws them.

## What you deliver

Everything is exported from `src/features/tasks/index.ts`. The types `Task`, `NewTask`, `TaskDraft`, `ParseTaskInput` and `IsoDate` come from `src/shared/types.ts`.

### 1. `useTasks()`

```ts
function useTasks(): {
  tasks: Task[] // every stored task, open and done
  addTask: (task: NewTask) => Task // stores the task and returns it as stored
}
```

- `addTask` fills in what a `NewTask` does not have: a unique `id`, `addedAt` (the current time) and `done: false`.
- It works in any component, with no provider around the app.
- All components that call it see the same list, and all of them update when a task is added.
- Tasks are kept in `localStorage` under the key `homework-overlay.tasks`. After a reload the list is the same as before, in the same order.
- If the stored data cannot be read, the list starts empty and the app does not crash.

### 2. `AddTask`

```tsx
<AddTask parse={parse} subjects={subjects} onAdd={onAdd} />
```

| Prop | Type | Meaning |
|---|---|---|
| `parse` | `ParseTaskInput` | Turns the typed text into a draft. Comes from the input formatter. |
| `subjects` | `string[]` | The subject names for the select field. |
| `onAdd` | `(task: NewTask) => void` | Called once when the user saves. |

The box (screen 01):

- Label `Add task`, a text field with the placeholder `e.g. eng ex.2 tomorrow`, the button `↵ Enter` and the hint line below, as in the wireframe.
- Pressing Enter or clicking the button calls `parse` with the typed text and opens the dialog with the result. If the field is empty or only spaces, nothing happens.

The dialog (screen 02):

- It is shown in place of the box and fills the same area. In the wireframe both are 596 × 300.
- It shows `You typed:` with the typed text, and the fields Title, Subject, Due, Time and Notes, filled from the draft.
- The user can change every field. This is how a wrongly understood input gets corrected.
- Subject is a select with `No subject` first, then `subjects`. `No subject` is chosen when the draft has no subject.
- Due is a date field. It is empty when the draft has no date. Time and Notes are optional.
- `Save task` is disabled while Title is empty or Due is not set.
- `Save task` calls `onAdd` with a `NewTask` (Title without spaces at the ends, `typed` as in the draft), closes the dialog and empties the text field.
- `Cancel` and the Esc key close the dialog and store nothing. The typed text stays in the field.

`AddTask` stores nothing itself and does not import the input formatter. It gets `parse` and reports through `onAdd`.

### 3. `TaskList`

```tsx
<TaskList tasks={tasks} today={today} />
```

| Prop | Type | Meaning |
|---|---|---|
| `tasks` | `Task[]` | The tasks to show. |
| `today` | `IsoDate`, optional | The current day. Without it the real current day is used. |

- It is the "Upcoming tasks" panel of screen 01: the heading and one row per task with title, subject and due date.
- It shows only open tasks (`done` is `false`), next due first. Tasks due on the same day: the one added earlier comes first.
- The due date reads `Today`, `Tomorrow`, or weekday and date like `Fri 25.09.`.
- A task without a subject shows only its title.
- With no open task it shows `No open tasks.` in muted text.
- If there are more rows than fit, the panel scrolls inside itself.
- The `All tasks` link of the wireframe is left out, and the rows are not links: the Tasks page does not exist yet.

### All three components

Each component fills the place it is put in (full width and height) and draws its own panel outline. It must not depend on the size of the window.

## Input and output

- **In:** `parse` is built on the `input-formatter` branch. You do not have it on your branch. In your preview and tests use this stand-in:

  ```ts
  const plainParse: ParseTaskInput = (text) => ({
    title: text.trim(),
    subject: null,
    due: null,
    time: null,
    notes: '',
    typed: text,
  })
  ```

- **Out:** `onAdd` hands over a `NewTask`. `useTasks().tasks` hands out `Task[]`, which the calendar also receives.
- After the merge Ben connects the pieces roughly like this, so keep the names and props exactly as written here:

  ```tsx
  const { tasks, addTask } = useTasks()
  <AddTask parse={parse} subjects={subjects} onAdd={addTask} />
  <TaskList tasks={tasks} />
  <Calendar tasks={tasks} lessons={lessons} />
  ```

## Not part of this

- Reminders and notifications.
- The Tasks page (screens 08 and 09): search, the Open and Closed tabs, the details panel, mark as done, reopen, edit, delete.
- The "Today" timetable panel.
- Understanding the typed text: no abbreviations and no date words. That is the input formatter.
- Placing your components into the app. No file outside `src/features/tasks/`.

## Preview and tests

Create `src/features/tasks/Preview.tsx` with a default export. Show `AddTask` and `TaskList` connected through `useTasks()`, with `plainParse` and `SAMPLE_SUBJECTS` from `src/shared/sampleData.ts`, laid out like the right half of Home: 596 px wide, two boxes of 300 px height, 24 px gap. Then run `npm run dev` and open `http://localhost:5173/preview.html?feature=tasks`.

Write tests next to your code. At least:

- A task added with `addTask` gets `id`, `addedAt` and `done: false`, and is still there after the data is read from `localStorage` again.
- Unreadable stored data gives an empty list.
- Typing text and pressing Enter opens the dialog with the values `parse` returned.
- Changed values are the ones `onAdd` receives.
- `Save task` is disabled without a title or without a due date.
- `Cancel` stores nothing and keeps the typed text.
- `TaskList` hides done tasks, sorts by due date and writes `Today`, `Tomorrow` and `Fri 25.09.` correctly (pass `today` to test this).

## Done when

- Every acceptance criterion above is met, except the one marked "Not in this sprint".
- `npm run lint`, `npm test` and `npm run build` pass.
- On the preview page the box, the dialog and the list match the wireframe.
- The code has comments where a reader would otherwise have to guess.
- Your human has looked at it on the preview page and agrees.
