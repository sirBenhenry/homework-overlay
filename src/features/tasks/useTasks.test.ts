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
