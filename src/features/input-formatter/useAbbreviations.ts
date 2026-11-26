import { useSyncExternalStore } from 'react'
import { type Abbreviation, mergeAbbreviations, sameShort } from './abbreviations.ts'

/** Where the user's own abbreviations are kept. Only the own ones are stored, not the built-in ones. */
export const STORAGE_KEY = 'homework-overlay.abbreviations'

/*
 * The list lives in localStorage and nowhere else. Components read it through
 * useSyncExternalStore and are told to re-read after every change, so all of
 * them see the same list without a provider around the app.
 */

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function isAbbreviation(value: unknown): value is Abbreviation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.short === 'string' &&
    v.short !== '' &&
    typeof v.full === 'string' &&
    (v.kind === 'subject' || v.kind === 'word')
  )
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** The stored own abbreviations. Data that cannot be read counts as none; broken entries are skipped. */
function parseOwn(raw: string | null): Abbreviation[] {
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isAbbreviation) : []
  } catch {
    return []
  }
}

// useSyncExternalStore needs the same array back as long as nothing changed,
// so the result is kept together with the stored text it was made from.
let cachedRaw: string | null | undefined
let cachedOwn: Abbreviation[] = []
let cachedList: Abbreviation[] = []

function read(): { own: Abbreviation[]; list: Abbreviation[] } {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedOwn = parseOwn(raw)
    cachedList = mergeAbbreviations(cachedOwn)
  }
  return { own: cachedOwn, list: cachedList }
}

function getSnapshot(): Abbreviation[] {
  return read().list
}

function writeOwn(own: Abbreviation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(own))
  } catch {
    // Storage full or blocked: the change is lost, but the app keeps working.
  }
  for (const listener of listeners) listener()
}

/** Adds an own abbreviation. One with the same `short` (built-in or own) is replaced. */
function addAbbreviation(abbreviation: Abbreviation): void {
  const own = read().own.filter((a) => !sameShort(a.short, abbreviation.short))
  writeOwn([...own, { short: abbreviation.short, full: abbreviation.full, kind: abbreviation.kind }])
}

/** Removes an own abbreviation. A built-in one it replaced comes back. Built-in ones cannot be removed. */
function removeAbbreviation(short: string): void {
  const own = read().own
  const rest = own.filter((a) => !sameShort(a.short, short))
  if (rest.length !== own.length) writeOwn(rest)
}

/** The built-in abbreviations and the user's own ones, kept in localStorage. */
export function useAbbreviations(): {
  abbreviations: Abbreviation[]
  addAbbreviation: (abbreviation: Abbreviation) => void
  removeAbbreviation: (short: string) => void
} {
  const abbreviations = useSyncExternalStore(subscribe, getSnapshot)
  return { abbreviations, addAbbreviation, removeAbbreviation }
}
