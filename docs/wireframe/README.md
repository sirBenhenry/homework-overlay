# Wireframe

The wireframe decides how every part of the app looks. It shows the app window at 1280 × 800.

Everyone has the whole wireframe and may use all of it. Which part of it you build is described in your brief, under "Your part of the wireframe".

| Path | What it is |
|---|---|
| `wireflow.html` | The original file with all 12 screens. Open it in a browser. |
| `screens/` | One picture per screen. |
| `source/` | The markup of each screen. The `style` attributes hold the exact sizes, spacing and colours. |
| `parts/` | Screens with one branch's part marked. The briefs show them. |

## The screens

| # | Screen | Sprint 1 |
|---|---|---|
| 01 | Home | Frame: `navbar`. Boxes "Upcoming tasks" and "Add task": `tasks`. The "Today" timetable panel is not built yet. |
| 02 | Home after typing a task and pressing Enter | The "New task" dialog: `tasks`. The values in it: `input-formatter`. |
| 03 | Calendar, 2 weeks + weekend | `calendar` |
| 04 | Calendar, jump to date | Not built yet. |
| 05 | Calendar, day view | Not built yet. |
| 06 | Calendar, edit timetable | Not built yet. |
| 07 | Calendar, weekend view | Not built yet. |
| 08 | Tasks | Frame only: `navbar`. List, search and details are not built yet. |
| 09 | Tasks, search open | Not built yet. |
| 10 | Applets | Frame only: `navbar`. |
| 11 | Applet: calculator | Not built yet. |
| 12 | Settings | Frame only: `navbar`. |

Screens 04 and 09 are screens 03 and 08 in another state (date picker open, search for "eng"). Their source files only point to 03 and 08.

## The frame

Every screen has the same frame:

- **Header** at the top, 56 px high: page title, the hint `[SHORTCUT] opens / closes the overlay`, and the clock on the right.
- **Content area**: 32 px from the left and right edge, starts 72 px from the top, ends 104 px above the bottom. At 1280 × 800 that is 1216 × 624 px.
- **Navigation bar**: centred, 16 px above the bottom edge, with Calendar, Tasks, Home, Applets, Settings.

## Reading the source files

The source files come from a design tool. They are a description of the look, not code to copy: rebuild what they show in React, with CSS modules and the variables from `src/shared/base.css`.

- `{{name}}` is a value filled in by the script at the bottom of the file.
- `<sc-for list="{{rows}}" as="r">` repeats its content once per entry. `<sc-if value="{{open}}">` shows its content only when the value is true.
- `sc-camel-view-box` means `viewBox`, `sc-camel-on-click` means `onClick`, and so on.
- The script at the bottom holds the example data and shows how positions are calculated, for example where a lesson sits on the hour scale. The same example data is in `src/shared/sampleData.ts`.
- The font is IBM Plex Sans. The project already includes it.
