// The desktop side of the app: opens the window that shows the React app.
// Runs in Electron's main process (Node), not in the page.

import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Set by `npm run app`: the address of the Vite dev server.
// Without it the window shows the built app from dist/.
const devServerUrl = process.env.VITE_DEV_SERVER_URL

const here = path.dirname(fileURLToPath(import.meta.url))

function createWindow() {
  const window = new BrowserWindow({
    // The size of the page area, as in the wireframe.
    width: 1280,
    height: 800,
    useContentSize: true,
    autoHideMenuBar: true,
    title: 'Homework Overlay',
    webPreferences: {
      // The page is a normal web page: it gets no access to Node or the file system.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (devServerUrl) {
    window.loadURL(devServerUrl)
  } else {
    window.loadFile(path.join(here, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
