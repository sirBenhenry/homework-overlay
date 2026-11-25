import { type ComponentType, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shared/base.css'
import PreviewApp, { type PreviewLoaders } from './PreviewApp.tsx'

// Finds every src/features/<name>/Preview.tsx by itself. Nothing to register.
const modules = import.meta.glob<{ default: ComponentType }>('../features/*/Preview.tsx')

const loaders: PreviewLoaders = {}
for (const [path, load] of Object.entries(modules)) {
  loaders[path.split('/')[2]] = load
}

const feature = new URLSearchParams(window.location.search).get('feature')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreviewApp loaders={loaders} feature={feature} />
  </StrictMode>,
)
