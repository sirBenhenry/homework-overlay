# Brief: navbar

| | |
|---|---|
| Branch | `navbar` |
| Your folder | `src/app/` |
| Trello card | Navbar (S) |

## What you build

The frame of the app: the header, the navigation bar and five empty pages. The result is a blank slate. It contains no task list, no calendar and no add-task box. The other three branches build those as separate parts, and after all branches are merged Ben puts them into the empty places you leave.

## User story

> Als Nutzer will ich eine navbar um einfach und schnell zwischen verschiedenen Tabs/Funktionen wechseln zu können.

Acceptance criteria:

- selbsterklärende Icons
- nicht im Weg
- gut strukturiert

## Wireframe

- The frame is on every screen. Use `docs/wireframe/screens/01-home.png` and `docs/wireframe/source/01-home.html` for the header and the navigation bar: exact sizes, the highlighted item, and the five icons as SVG.
- Page layouts: `01-home`, `03-calendar-2-weeks`, `08-tasks`, `10-applets`, `12-settings`. Only the position and size of the areas matter to you, not what is inside them.

## What you deliver

### 1. The frame: `App` in `src/app/App.tsx`

- It fills the browser window. At 1280 × 800 it matches the wireframe.
- **Header**: the name of the current page, the hint `[SHORTCUT] opens / closes the overlay` exactly as written (the shortcut itself is not built), and a clock on the right that shows the current time as `HH:MM` and stays current.
- **Navigation bar**: bottom centre, five items in this order: Calendar, Tasks, Home, Applets, Settings. Each has the icon from the wireframe and a label.
- The item of the current page is highlighted as in the wireframe and has `aria-current="page"`.
- Clicking an item shows its page. The app starts on Home.
- The items are real buttons: reachable with Tab, usable with Enter and Space.
- The current page is kept in React state. No router library.

### 2. Five empty pages with named places

Each page is a component that only lays out empty places for the other parts. A place is a prop of type `ReactNode`:

| Page | Prop | Position in the wireframe |
|---|---|---|
| Home | `timetable` | Left half of the content area ("Today") |
| Home | `upcomingTasks` | Right half, upper box |
| Home | `addTask` | Right half, lower box |
| Calendar | `content` | Whole content area |
| Tasks | `content` | Whole content area |
| Applets | `content` | Whole content area |
| Settings | `content` | Whole content area |

- The content area is 32 px from the left and right edge, starts 72 px from the top and ends 104 px above the bottom.
- Home has two columns of equal width with a 24 px gap. The right column has two rows of equal height with a 24 px gap.
- **An empty place** shows a dashed outline with its prop name in muted text, so the blank app shows where things will go.
- **A filled place** shows only what it was given. The page adds no border, heading or padding around it: every part draws its own panel and fills the place completely.
- `App.tsx` is the only file that hands content to the pages. In this sprint it hands over nothing, so every place is empty.

## Input and output

Your part exchanges no data with the others. Your contract is the table above: the page names and the prop names. Ben uses exactly these names when he places the parts, so do not rename them.

## Not part of this

- No components of other parts: no task list, no add-task box, no dialog, no calendar, no timetable, no applets, no settings controls.
- No example content inside the pages. They stay empty.
- No shortcut handling and no opening or closing of the overlay.
- No router library and no other new dependency.
- No file outside `src/app/`.

## Preview and tests

Your part is the app itself: `npm run dev`, then open `http://localhost:5173/`. You need no `Preview.tsx`.

Write tests next to your code (`*.test.tsx`). At least:

- The app starts on Home, and Home is marked as the current page.
- Clicking each of the five items shows its page and moves the highlight.
- Every place shows its name while it is empty.
- A page shows the content handed to a place instead of the empty outline.

## Done when

- Every acceptance criterion above is met.
- `npm run lint`, `npm test` and `npm run build` pass.
- At 1280 × 800 the frame matches the wireframe.
- The code has comments where a reader would otherwise have to guess.
- Your human has looked at it in the browser and agrees.
