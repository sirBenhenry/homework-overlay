// `npm run app`: starts the Vite dev server and opens the desktop window on it.
// Closing the window stops the dev server.

import { spawn } from 'node:child_process'
import { createServer } from 'vite'
// Importing 'electron' from Node gives the path of the Electron program.
// The first time, this downloads Electron (about 100 MB).
import electronPath from 'electron'

const server = await createServer()
await server.listen()
const url = server.resolvedUrls?.local[0]
if (!url) {
  await server.close()
  throw new Error('The dev server did not report an address.')
}
console.log(`Dev server: ${url}`)

// Extra arguments after `npm run app --` go to Electron.
const electron = spawn(electronPath, ['.', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
})

electron.on('close', async (code) => {
  await server.close()
  process.exit(code ?? 0)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => electron.kill(signal))
}
