import { useSyncExternalStore } from 'react'
import type { NewTask, Task } from '../../shared/types'

const storageKey = 'homework-overlay.tasks'

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false

  const task = value as Partial<Task>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    (task.subject === null || typeof task.subject === 'string') &&
    typeof task.due === 'string' &&
    (task.time === null || typeof task.time === 'string') &&
    typeof task.notes === 'string' &&
    typeof task.typed === 'string' &&
    typeof task.addedAt === 'string' &&
    typeof task.done === 'boolean'
  )
}

function readTasks(): Task[] {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === null) return []

    const data: unknown = JSON.parse(stored)
    return Array.isArray(data) && data.every(isTask) ? data : []
  } catch {
    // Start with an empty list if storage is inaccessible or the JSON is invalid.
    return []
  }
}

let currentTasks: Task[] = readTasks()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function addTask(input: NewTask): Task {
  const task: Task = {
    ...input,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    done: false,
  }

  // A new array lets React detect the change in every subscribed component.
  const nextTasks = [...currentTasks, task]
  localStorage.setItem(storageKey, JSON.stringify(nextTasks))
  currentTasks = nextTasks
  for (const listener of listeners) {
    listener()
  }

  return task
}

export function useTasks() {
  const tasks = useSyncExternalStore(subscribe, () => currentTasks)
  return { tasks, addTask }
}
