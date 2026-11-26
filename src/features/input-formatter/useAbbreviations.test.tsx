import { act, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_ABBREVIATIONS } from './abbreviations.ts'
import { STORAGE_KEY, useAbbreviations } from './useAbbreviations.ts'

const ws = { short: 'ws', full: 'worksheet', kind: 'word' } as const

describe('useAbbreviations', () => {
  it('starts with the built-in list', () => {
    const { result } = renderHook(() => useAbbreviations())
    expect(result.current.abbreviations).toEqual(DEFAULT_ABBREVIATIONS)
  })

  it('adds an own abbreviation and stores it', () => {
    const { result } = renderHook(() => useAbbreviations())
    act(() => result.current.addAbbreviation(ws))
    expect(result.current.abbreviations).toContainEqual(ws)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([ws])
  })

  it('still has the own abbreviation after reading localStorage again', () => {
    const first = renderHook(() => useAbbreviations())
    act(() => first.result.current.addAbbreviation(ws))
    first.unmount()

    // Simulate a reload: the stored text is all that is left.
    const stored = localStorage.getItem(STORAGE_KEY)!
    localStorage.clear()
    const empty = renderHook(() => useAbbreviations())
    expect(empty.result.current.abbreviations).toEqual(DEFAULT_ABBREVIATIONS)
    empty.unmount()

    localStorage.setItem(STORAGE_KEY, stored)
    const { result } = renderHook(() => useAbbreviations())
    expect(result.current.abbreviations).toContainEqual(ws)
  })

  it('lets an own abbreviation take the place of a built-in one and brings it back on removal', () => {
    const { result } = renderHook(() => useAbbreviations())
    const exam = { short: 'EX', full: 'exam', kind: 'word' } as const
    act(() => result.current.addAbbreviation(exam))
    const list = result.current.abbreviations
    expect(list).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(list[DEFAULT_ABBREVIATIONS.findIndex((a) => a.short === 'ex')]).toEqual(exam)

    act(() => result.current.removeAbbreviation('ex'))
    expect(result.current.abbreviations).toEqual(DEFAULT_ABBREVIATIONS)
  })

  it('does not remove built-in abbreviations', () => {
    const { result } = renderHook(() => useAbbreviations())
    act(() => result.current.removeAbbreviation('eng'))
    expect(result.current.abbreviations).toEqual(DEFAULT_ABBREVIATIONS)
  })

  it('uses only the built-in list when the stored data cannot be read', () => {
    for (const broken of ['not json', '{"a":1}', '42', 'null']) {
      localStorage.setItem(STORAGE_KEY, broken)
      const { result, unmount } = renderHook(() => useAbbreviations())
      expect(result.current.abbreviations).toEqual(DEFAULT_ABBREVIATIONS)
      unmount()
    }
  })

  it('skips broken entries and keeps the readable ones', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([ws, { short: 'x' }, 'y']))
    const { result } = renderHook(() => useAbbreviations())
    expect(result.current.abbreviations).toEqual([...DEFAULT_ABBREVIATIONS, ws])
  })

  it('gives every component the same list', () => {
    function Count() {
      return <p>{useAbbreviations().abbreviations.length}</p>
    }
    render(
      <>
        <Count />
        <Count />
      </>,
    )
    const { result } = renderHook(() => useAbbreviations())
    act(() => result.current.addAbbreviation(ws))
    expect(screen.getAllByText(String(DEFAULT_ABBREVIATIONS.length + 1))).toHaveLength(2)
  })
})
