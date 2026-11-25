import { type ComponentType, useEffect, useState } from 'react'

/** Name of a part (its folder under src/features) -> function that loads its Preview. */
export type PreviewLoaders = Record<string, () => Promise<{ default: ComponentType }>>

interface Props {
  loaders: PreviewLoaders
  /** The part to show. `null` shows the list of parts that have a Preview. */
  feature: string | null
}

/**
 * Shows one part on its own, outside the app, so it can be built and looked at
 * before the app frame exists. Nobody needs to change this file: a part shows up
 * here as soon as its folder contains a Preview.tsx.
 */
export default function PreviewApp({ loaders, feature }: Props) {
  const names = Object.keys(loaders).sort()
  const load = feature === null ? undefined : loaders[feature]
  const [loaded, setLoaded] = useState<{ from: typeof load; Component: ComponentType } | null>(null)

  useEffect(() => {
    if (!load) return
    let current = true
    load().then((module) => {
      if (current) setLoaded({ from: load, Component: module.default })
    })
    return () => {
      current = false
    }
  }, [load])

  // Ignore a component that was loaded for a different part.
  const Loaded = loaded !== null && loaded.from === load ? loaded.Component : null

  if (load) {
    return Loaded ? <Loaded /> : <p style={{ padding: 32 }}>Loading…</p>
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Previews</h1>
      {feature !== null && (
        <p>
          There is no <code>src/features/{feature}/Preview.tsx</code>.
        </p>
      )}
      {names.length === 0 ? (
        <p>
          No previews yet. Add a <code>Preview.tsx</code> to your folder under <code>src/features</code>.
        </p>
      ) : (
        <ul>
          {names.map((name) => (
            <li key={name}>
              <a href={`?feature=${name}`}>{name}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
