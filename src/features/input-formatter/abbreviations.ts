/** A short form the user can type instead of a longer word or a subject name. */
export interface Abbreviation {
  /** What the user types, for example 'eng'. */
  short: string
  /** What it stands for, for example 'Englisch'. */
  full: string
  /** 'subject' sets the task's subject, 'word' is replaced inside the title. */
  kind: 'subject' | 'word'
}

/** The abbreviations every user has. Own ones with the same `short` take their place. */
export const DEFAULT_ABBREVIATIONS: Abbreviation[] = [
  { short: 'eng', full: 'Englisch', kind: 'subject' },
  { short: 'math', full: 'Mathe', kind: 'subject' },
  { short: 'de', full: 'Deutsch', kind: 'subject' },
  { short: 'fr', full: 'Französisch', kind: 'subject' },
  { short: 'inf', full: 'Informatik', kind: 'subject' },
  { short: 'wr', full: 'Wirtschaft', kind: 'subject' },
  { short: 'ex', full: 'exercise', kind: 'word' },
  { short: 'ch', full: 'chapter', kind: 'word' },
]

/** `short` values are compared without regard to upper and lower case. */
export function sameShort(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

/** True if the abbreviation is one of the built-in ones (and not an own copy of it). */
export function isBuiltIn(abbreviation: Abbreviation): boolean {
  return DEFAULT_ABBREVIATIONS.includes(abbreviation)
}

/**
 * The built-in list with the own abbreviations applied: an own one with the same
 * `short` as a built-in one takes its place in the list, all others come after.
 */
export function mergeAbbreviations(own: Abbreviation[]): Abbreviation[] {
  const merged = DEFAULT_ABBREVIATIONS.map(
    (builtIn) => own.find((o) => sameShort(o.short, builtIn.short)) ?? builtIn,
  )
  const added = own.filter((o) => !DEFAULT_ABBREVIATIONS.some((b) => sameShort(b.short, o.short)))
  return [...merged, ...added]
}
