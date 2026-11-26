# Team guide

Everything about how we work and how the project is set up. The short version is in the [README](../README.md).

## How we work

The idea: nobody builds "the app". `navbar` builds an empty frame, and everyone else builds a part that can be dropped into it.

1. **One part, one branch, one folder.** You and your agent change only the files in your folder. That is why the four branches can be merged without conflicts.
2. **`navbar` builds a blank slate.** Header, navigation and empty pages with named empty places. No task list, no calendar.
3. **The others build drop-in parts.** React components that work on their own and get everything through props. You look at your part on the preview page, not inside the app.
4. **The brief fixes the contract.** It names the components, their props and the data going in and out. Parts that work together, like the add-task box and the input formatter, agree through these shapes and never import each other.
5. **The wireframe decides the look.** Everyone has the whole wireframe, and each brief describes in detail which part of it that branch builds. See [docs/wireframe](wireframe/README.md).
6. **Your agent commits, you push.** Look at the result and read the diff before you push: `git push -u origin <your branch>`.
7. **Ben merges.** When your part is finished, push it and open a pull request into `main`. Ben merges `navbar` first, then the other three, and places the parts into the frame in `src/app/App.tsx`.

If something is unclear or missing in your brief, ask Ben. Do not let your agent guess.

### The commandments for agents

Every agent in this repo follows these. The full rules are in [AGENTS.md](../AGENTS.md), which most agents read on their own.

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
| Desktop app | Electron, for Linux and Windows |
| UI | React 19 with TypeScript |
| Build and dev server | Vite |
| Styling | CSS modules, with shared variables in `src/shared/base.css` |
| Tests | Vitest with Testing Library, running in jsdom |
| Lint | oxlint |
| Font | IBM Plex Sans, installed as a package, so the app needs no internet |

There is no router library. The frame switches pages with React state.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Installs the dependencies. Run it once after cloning, and again after `package.json` changed. |
| `npm run app` | Opens the app in its desktop window, on top of the dev server. The window reloads when you save a file. Closing it stops the server. |
| `npm run dev` | Starts only the dev server, for the preview page at `http://localhost:5173/preview.html`. |
| `npm test` | Runs all tests once. `npm run test:watch` re-runs them while you work. |
| `npm run lint` | Checks the code with oxlint. |
| `npm run build` | Type-checks the code and builds the app into `dist/`. |
| `npm start` | Opens the built app from `dist/` in the desktop window. Run `npm run build` first. |

### Folders

```
electron/
  main.js               the desktop side: opens the app window
scripts/
  app.js                what `npm run app` runs
index.html              entry page of the app
preview.html            entry page of the preview
src/
  main.tsx              starts the React app
  app/                  the frame: header, navigation, empty pages (navbar)
  features/
    tasks/              task storage, add-task box, task list (tasks)
    calendar/           two-week calendar (calendar)
    input-formatter/    typed text -> task draft, abbreviations (input-formatter)
  shared/               what all parts have in common
  preview/              shows one part on its own
  test-setup.ts         runs before every test file
docs/wireframe/         the wireframe: original, pictures, source, marked parts
briefs/                 one brief per branch
```

The folders under `src/features/` appear when their branch adds its first file.

### The desktop app

The app has two sides:

- **The window** (`electron/main.js`) runs in Electron's main process. It opens one window of 1280 × 800, the size of the wireframe, and loads the React app into it.
- **The page** (everything in `src/`) is the React app. It runs inside the window like a web page and has no access to Node, the file system or Electron. The window is set up that way on purpose (`contextIsolation`, `sandbox`).

With `npm run app` the window shows the dev server, so changes appear at once. With `npm start` it shows the files in `dist/`.

Not built yet:

- **Overlay behaviour.** The window is a plain window. The shortcut that shows and hides it, staying on top, and starting with the computer come later. The wireframe shows `[SHORTCUT]` as a placeholder for it.
- **Installers.** There is no packaged app for Linux or Windows yet (Trello card "Installation"). For now the app runs from this folder.
- **A check on Windows.** The setup was run on Linux only.

Because it is a desktop app, the parts load nothing from the internet, use no web navigation (no links to other pages, no URLs, no router), and must work the same on Linux and Windows.

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

A part can be seen before the frame exists. Put a file `Preview.tsx` with a default export into your folder, for example `src/features/calendar/Preview.tsx`, run `npm run dev` and open `http://localhost:5173/preview.html?feature=calendar`. The page finds the file by itself, so nothing has to be registered and no shared file changes. Without `?feature=` it lists all parts that have a preview.

Open it in Chrome, Chromium or Edge. The app window uses the same engine, so the part looks the same there.

The preview page is a development tool. `npm run build` does not include it.

### Tests

Tests sit next to the code as `*.test.ts` or `*.test.tsx`. After every test the rendered components are removed and `localStorage` is emptied (`src/test-setup.ts`), so tests do not affect each other.

### Data on the user's computer

Sprint 1 keeps data in the `localStorage` of the app window. Electron stores it in the app's own data folder on the computer.

| Key | Content | Written by |
|---|---|---|
| `homework-overlay.tasks` | The tasks | `tasks` |
| `homework-overlay.abbreviations` | The user's own abbreviations | `input-formatter` |

The app window (`npm run app`), the preview page in your browser and the built app (`npm start`) each keep their own copy, so tasks entered on the preview page do not show up in the app window.
