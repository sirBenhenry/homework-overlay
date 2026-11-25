# homework-overlay

An overlay for homework: type a task in a few words, see what is due in a two-week calendar next to your timetable.

**Status:** sprint 1. The project is set up and four parts are being built in parallel.

## Sprint 1: who builds what

Each part has its own branch, its own folder and a brief that says exactly what to deliver.

| Branch | Trello cards | Folder | Brief |
|---|---|---|---|
| `navbar` | Navbar | `src/app/` | [briefs/navbar.md](briefs/navbar.md) |
| `tasks` | Aufgabe hinzufügen, Aufgabenliste speichern | `src/features/tasks/` | [briefs/tasks.md](briefs/tasks.md) |
| `calendar` | Kalenderansicht | `src/features/calendar/` | [briefs/calendar.md](briefs/calendar.md) |
| `input-formatter` | input formatter | `src/features/input-formatter/` | [briefs/input-formatter.md](briefs/input-formatter.md) |

## Getting started

You need Node.js and npm. The project was set up and checked with Node 26 and npm 12.

```sh
git clone https://github.com/sirBenhenry/homework-overlay.git
cd homework-overlay
git switch <your branch>   # navbar, tasks, calendar or input-formatter
npm install
npm run dev
```

Then read your brief, and start your agent in this folder while you are on your branch. The agent finds its job from the branch name.

## How we work

The idea: nobody builds "the app". `navbar` builds an empty frame, and everyone else builds a part that can be dropped into it.

1. **One part, one branch, one folder.** You and your agent change only the files in your folder. That is why the four branches can be merged without conflicts.
2. **`navbar` builds a blank slate.** Header, navigation and empty pages with named empty places. No task list, no calendar.
3. **The others build drop-in parts.** React components that work on their own and get everything through props. You look at your part on the preview page, not inside the app.
4. **The brief fixes the contract.** It names the components, their props and the data going in and out. Parts that work together, like the add-task box and the input formatter, agree through these shapes and never import each other.
5. **The wireframe decides the look.** See [docs/wireframe](docs/wireframe/README.md).
6. **Your agent commits, you push.** Look at the result in the browser and read the diff before you push: `git push -u origin <your branch>`.
7. **Ben merges.** When your part is finished, push it and open a pull request into `main`. Ben merges `navbar` first, then the other three, and places the parts into the frame in `src/app/App.tsx`.

If something is unclear or missing in your brief, ask Ben. Do not let your agent guess.

### The commandments for agents

Every agent in this repo follows these. The full rules are in [AGENTS.md](AGENTS.md), which most agents read on their own.

1. An agent shall always stay on its branch.
2. An agent shall never merge branches.
3. An agent shall commit but never push.
4. An agent must never assume and always ask.
5. An agent may raise concern and confusion about existing code in the repository, but he may never change or delete it without asking.

For you this means: you push, you answer your agent's questions, and you decide with Ben before anything outside your folder changes.

## Project setup

### Stack

| What | Choice |
|---|---|
| UI | React 19 with TypeScript |
| Build and dev server | Vite |
| Styling | CSS modules, with shared variables in `src/shared/base.css` |
| Tests | Vitest with Testing Library, running in jsdom |
| Lint | oxlint |
| Font | IBM Plex Sans, installed as a package, so no request to Google Fonts |
| Runs in | The browser for now. A desktop wrapper for the real overlay window can be added later without changing the parts. |

There is no router library. The frame switches pages with React state.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Installs the dependencies. Run it once after cloning, and again after `package.json` changed. |
| `npm run dev` | Starts the dev server. The app is at `http://localhost:5173/`, the preview page at `http://localhost:5173/preview.html`. |
| `npm test` | Runs all tests once. `npm run test:watch` re-runs them while you work. |
| `npm run lint` | Checks the code with oxlint. |
| `npm run build` | Type-checks the code and builds the app into `dist/`. |

### Folders

```
index.html              entry page of the app
preview.html            entry page of the preview
src/
  main.tsx              starts the app
  app/                  the frame: header, navigation, empty pages (navbar)
  features/
    tasks/              task storage, add-task box, task list (tasks)
    calendar/           two-week calendar (calendar)
    input-formatter/    typed text -> task draft, abbreviations (input-formatter)
  shared/               what all parts have in common
  preview/              shows one part on its own
  test-setup.ts         runs before every test file
docs/wireframe/         the wireframe: original, pictures, source
briefs/                 one brief per branch
```

The folders under `src/features/` appear when their branch adds its first file.

### Shared code: `src/shared/`

Everything in here is used by several parts, so nobody changes it alone.

| File | What it holds |
|---|---|
| `types.ts` | The data that travels between parts: `Task`, `TaskDraft`, `NewTask`, `Lesson`, `IsoDate`, `TimeOfDay`, `ParseTaskInput`. |
| `base.css` | The look from the wireframe as CSS variables (colours, radii, font sizes), the font, and a small reset. |
| `dates.ts` | Helpers for days written as `YYYY-MM-DD`: today, add days, weekday. |
| `sampleData.ts` | The example subjects, timetable and tasks the wireframe shows, for previews and tests. |

A day is always a string like `2026-09-24` in local time (`IsoDate`). Use the helpers in `dates.ts`: getting a day with `toISOString()` returns the day before for local midnight in Switzerland.

### The preview page

A part can be seen in the browser before the frame exists. Put a file `Preview.tsx` with a default export into your folder, for example `src/features/calendar/Preview.tsx`, and open `http://localhost:5173/preview.html?feature=calendar`. The page finds the file by itself, so nothing has to be registered and no shared file changes. Without `?feature=` it lists all parts that have a preview.

The preview page is a development tool. `npm run build` does not include it.

### Tests

Tests sit next to the code as `*.test.ts` or `*.test.tsx`. After every test the rendered components are removed and `localStorage` is emptied (`src/test-setup.ts`), so tests do not affect each other.

### Data on the user's computer

Sprint 1 keeps data in the browser's `localStorage`:

| Key | Content | Written by |
|---|---|---|
| `homework-overlay.tasks` | The tasks | `tasks` |
| `homework-overlay.abbreviations` | The user's own abbreviations | `input-formatter` |

## Wireframe

[docs/wireframe](docs/wireframe/README.md) has the original file, one picture per screen and the source of each screen with the exact sizes and colours. It also lists which screens are part of sprint 1.

## Definition of done

A card moves to Done only when all of this is true:

- The function is implemented and meets all acceptance criteria.
- It was tested and works as described.
- The layout matches the wireframe.
- Comments or documentation are added.
