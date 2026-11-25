# Brief: input-formatter

| | |
|---|---|
| Branch | `input-formatter` |
| Your folder | `src/features/input-formatter/` |
| Trello card | input formatter (L) |

## What you build

Three drop-in pieces:

1. A function that turns typed short text like `eng ex.2 tomorrow` into a task draft with title, subject and due date.
2. Storage for the user's own abbreviations.
3. A small editor for these abbreviations.

You do not build the field the user types into. That is the "Add task" box on the `tasks` branch, which calls your function. Ben connects the two after the merge.

## User story

> Als Schüler, der seine Aufgaben möglichst schnell während des Unterrichts eintragen muss, möchte ich die Möglichkeit haben, meine Aufgaben in Plain Text mit Abkürzungen (z. B. eng tomorrow, ex2) zu schreiben, die dann automatisch formatiert und eingetragen werden.

Acceptance criteria:

- Abkürzungen werden erkannt. **Your share:** `parseTaskInput`.
- Möglichkeit, formatierten Input zu verändern, falls er falsch verstanden wurde. **Your share:** always return a complete draft and never throw. The "New task" dialog on the `tasks` branch shows your draft in fields the user can change.
- Möglichkeit, eigene Abkürzungen hinzuzufügen. **Your share:** `useAbbreviations` and `AbbreviationEditor`.

## Your part of the wireframe

The whole wireframe is in `docs/wireframe/` and you may look at all of it. You build no visible part of its screens. Your results show up inside parts that others build:

![Where your results appear in the dialog](../docs/wireframe/parts/input-formatter-new-task.png)

- **Screen 02, the "New task" dialog.** The user typed `eng ex.2 tomorrow`. The chip after `You typed:` is your `typed`. The Title field `Exercise 2` is your `title`, the Subject field `Englisch` your `subject`, and the Due field `Thu 24.09.2026` your `due` (the dialog turns `2026-09-24` into that text). Time and Notes are empty because you return `null` and `''`. The dialog itself is built on the `tasks` branch.
- **Screen 01, the "Add task" box.** The placeholder `e.g. eng ex.2 tomorrow` and the hint `Short form gets turned into title, subject and due date.` describe your job. The box is built on the `tasks` branch.
- **Screen 08, the task details.** The line `Typed as` shows `typed` next to the stored result. The script at the bottom of `docs/wireframe/source/08-tasks.html` lists ten such pairs, and the example table below is made from them. The screen itself is not built in this sprint.

**The abbreviation editor has no wireframe.** Build it from the pieces of screens 01 and 02 (`docs/wireframe/source/02-home-new-task.html`):

- a panel with a 1 px strong outline, 12 px radius and padding 16 px above and below and 20 px left and right,
- fields 40 px high with 8 px radius and 15 px text,
- rows like the task rows of screen 01: 1 px normal outline, 8 px radius, padding 8 × 12 px,
- a dark button like `Save task` for adding.

Show the result to Ben before you call it finished.

## What you deliver

Everything is exported from `src/features/input-formatter/index.ts`. The types `TaskDraft` and `IsoDate` come from `src/shared/types.ts`. Use the helpers in `src/shared/dates.ts` for date arithmetic.

### 1. `parseTaskInput`

```ts
interface Abbreviation {
  short: string // what the user types, for example 'eng'
  full: string // what it stands for, for example 'Englisch'
  kind: 'subject' | 'word'
}

interface ParseOptions {
  today: IsoDate
  subjects: string[]
  abbreviations: Abbreviation[]
}

function parseTaskInput(text: string, options: ParseOptions): TaskDraft
```

It is a plain function: the same input always gives the same output. It uses no React and no storage, and it does not read the clock. The current day comes in as `today`.

Rules:

1. The text is split into words at spaces. Upper and lower case make no difference when matching.
2. **Subject.** The first word that is the `short` of a `subject` abbreviation, or a name in `subjects`, sets the subject to the full name. The word is taken out of the title. No such word: `subject` is `null`.
3. **Due date.** These words set the date and are taken out of the title:
   - `today` and `tomorrow`.
   - A weekday, short or long: `mon`, `monday`, `tue`, `tuesday`, `wed`, `wednesday`, `thu`, `thursday`, `fri`, `friday`, `sat`, `saturday`, `sun`, `sunday`. It means the next day with that name after today. Typed on a Wednesday, `wed` is the Wednesday of next week.
   - A date as `D.M`, `D.M.` or `D.M.YYYY`, for example `29.9`, `1.10.` or `24.09.2026`. Without a year it means the next such date, counting today.
   - A weekday and a date together: the date decides, and both words are taken out.
   - A date that does not exist, like `31.2`, is not a date and stays in the title.
   - No date word: `due` is `null`.
4. **Word abbreviations.** A word that is the `short` of a `word` abbreviation is replaced by its `full`. If a number follows directly, with or without a dot, the number is kept after a space: `ex.2` and `ex2` become `exercise 2`, and `ch3` becomes `chapter 3`.
5. **Title.** The remaining words in the order they were typed, joined by single spaces, with the first letter in upper case.
6. `typed` is the text exactly as it came in. `time` is always `null` and `notes` is always `''`.
7. Empty text or only spaces: `title` is `''`, `subject` and `due` are `null`.

Also export the built-in list:

```ts
const DEFAULT_ABBREVIATIONS: Abbreviation[]
```

| `short` | `full` | `kind` |
|---|---|---|
| `eng` | `Englisch` | subject |
| `math` | `Mathe` | subject |
| `de` | `Deutsch` | subject |
| `fr` | `Französisch` | subject |
| `inf` | `Informatik` | subject |
| `wr` | `Wirtschaft` | subject |
| `ex` | `exercise` | word |
| `ch` | `chapter` | word |

These examples must pass, with `today` = `2026-09-23` (a Wednesday), `SAMPLE_SUBJECTS` and `DEFAULT_ABBREVIATIONS`:

| Typed | Title | Subject | Due |
|---|---|---|---|
| `eng ex.2 tomorrow` | `Exercise 2` | `Englisch` | `2026-09-24` |
| `math worksheet fractions fri` | `Worksheet fractions` | `Mathe` | `2026-09-25` |
| `de read ch3 monday` | `Read chapter 3` | `Deutsch` | `2026-09-28` |
| `fr vocab test tue 29.9` | `Vocab test` | `Französisch` | `2026-09-29` |
| `inf project draft 1.10` | `Project draft` | `Informatik` | `2026-10-01` |
| `wr presentation slides thu` | `Presentation slides` | `Wirtschaft` | `2026-09-24` |
| `fr grammar sheet wed` | `Grammar sheet` | `Französisch` | `2026-09-30` |
| `Mathe ex.5 today` | `Exercise 5` | `Mathe` | `2026-09-23` |
| `buy calculator` | `Buy calculator` | `null` | `null` |

### 2. `useAbbreviations()`

```ts
function useAbbreviations(): {
  abbreviations: Abbreviation[] // the built-in ones and the user's own
  addAbbreviation: (abbreviation: Abbreviation) => void
  removeAbbreviation: (short: string) => void
}
```

- The user's own abbreviations are kept in `localStorage` under the key `homework-overlay.abbreviations` and are still there after a reload.
- An own abbreviation with the same `short` as a built-in one takes its place.
- Only own abbreviations can be removed. Removing one that replaced a built-in one brings the built-in one back.
- It works in any component, with no provider around the app. All components that call it see the same list.
- If the stored data cannot be read, only the built-in list is used and the app does not crash.

### 3. `AbbreviationEditor`

```tsx
<AbbreviationEditor />
```

- It takes no props and uses `useAbbreviations()`.
- It lists every abbreviation with `short`, `full` and kind, and marks the built-in ones.
- It has a form to add one: `short`, `full`, and the kind (subject or word).
- It refuses an empty `short`, an empty `full`, and a `short` with a space in it.
- Own abbreviations have a remove button.
- It fills the width of the place it is put in and draws its own panel outline.

## Input and output

- **In:** text, and `ParseOptions`.
- **Out:** a `TaskDraft`. The "Add task" box on the `tasks` branch expects a function of the type `ParseTaskInput` from `src/shared/types.ts`, which takes only the text.
- After the merge Ben connects the two roughly like this, so keep the names and the shapes exactly as written here:

  ```ts
  const { abbreviations } = useAbbreviations()
  const parse: ParseTaskInput = (text) =>
    parseTaskInput(text, { today: todayIso(), subjects, abbreviations })
  ```

## Not part of this

- The text field, the "Add task" box and the "New task" dialog. They belong to the `tasks` branch.
- Storing tasks.
- German date words such as `morgen` or `montag`. Only the English words listed above.
- Recognising a time of day or notes.
- Placing the editor into the Settings page. No file outside `src/features/input-formatter/`.

## Preview and tests

Create `src/features/input-formatter/Preview.tsx` with a default export. Show a text field and, below it, the draft that `parseTaskInput` makes of the text while typing (title, subject, due), using `SAMPLE_TODAY` and `SAMPLE_SUBJECTS` from `src/shared/sampleData.ts`. Below that show the `AbbreviationEditor`. Then run `npm run dev` and open `http://localhost:5173/preview.html?feature=input-formatter`.

Write tests next to your code. At least:

- Every row of the example table.
- Every rule above, including upper and lower case, a date that does not exist, a date without a year that has already passed this year, and empty text.
- An own abbreviation is used by the parser, replaces a built-in one with the same `short`, and is still there after the data is read from `localStorage` again.
- The editor adds and removes an abbreviation and refuses the invalid ones.

## Done when

- Every acceptance criterion above is met.
- `npm run lint`, `npm test` and `npm run build` pass.
- On the preview page the examples give the results of the table.
- The code has comments where a reader would otherwise have to guess.
- Your human has looked at it on the preview page and agrees.
