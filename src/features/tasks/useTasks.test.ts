import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { NewTask, Task } from '../../shared/types'
import { useTasks } from './index'

afterEach(() => {
  vi.useRealTimers()
})

it('adds an open task with an ID and the current timestamp', () => {
  const now = '2026-09-23T08:00:00.000Z'
  vi.useFakeTimers()
  vi.setSystemTime(new Date(now))

  const input: NewTask = {
    title: 'Exercise 2',
    subject: 'Englisch',
    due: '2026-09-24',
    time: null,
    notes: '',
    typed: 'eng ex.2 tomorrow',
  }

  const { result } = renderHook(() => useTasks())
  let saved: Task | undefined

  act(() => {
    saved = result.current.addTask(input)
  })

  expect(saved).toEqual({
    ...input,
    id: expect.stringMatching(/\S/),
    addedAt: now,
    done: false,
  })
  expect(result.current.tasks).toEqual([saved])
})

it('restores the same tasks in the same order after reopening', async () => {
  async function openTasks() {
    // Reload the feature while keeping the same localStorage.
    vi.resetModules()
    const { useTasks: useFreshTasks } = await import('./index')
    return renderHook(() => useFreshTasks())
  }

  const first = await openTasks()

  act(() => {
    for (const title of ['Worksheet fractions', 'Exercise 2']) {
      first.result.current.addTask({
        title,
        subject: null,
        due: '2026-09-25',
        time: null,
        notes: '',
        typed: title,
      })
    }
  })

  const beforeClosing = [...first.result.current.tasks]
  expect(beforeClosing).toHaveLength(2)
  first.unmount()

  expect(localStorage.getItem('homework-overlay.tasks')).not.toBeNull()

  const reopened = await openTasks()
  expect(reopened.result.current.tasks).toEqual(beforeClosing)
})

it.each([
  ['invalid JSON', '{broken'],
  ['a task with missing fields', '[{"title":"Exercise 2"}]'],
])('starts with an empty list when storage contains %s', async (_case, stored) => {
  localStorage.setItem('homework-overlay.tasks', stored)

  vi.resetModules()
  const { useTasks: useFreshTasks } = await import('./index')
  const { result } = renderHook(() => useFreshTasks())

  expect(result.current.tasks).toEqual([])
})

it('updates both consumers when one adds a task', async () => {
  vi.resetModules()
  const { useTasks: useFreshTasks } = await import('./index')

  const entry = renderHook(() => useFreshTasks())
  const calendar = renderHook(() => useFreshTasks())

  expect(calendar.result.current.tasks).toEqual([])

  let saved: Task | undefined
  act(() => {
    saved = entry.result.current.addTask({
      title: 'Read chapter 3',
      subject: 'Deutsch',
      due: '2026-09-28',
      time: null,
      notes: '',
      typed: 'Read chapter 3',
    })
  })

  expect(entry.result.current.tasks).toEqual([saved])
  expect(calendar.result.current.tasks).toEqual([saved])
})
