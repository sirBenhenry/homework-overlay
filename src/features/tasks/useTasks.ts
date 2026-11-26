import { useSyncExternalStore } from 'react'
import type { NewTask, Task } from '../../shared/types'

let currentTasks: Task[] = []
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
  currentTasks = [...currentTasks, task]
  for (const listener of listeners) {
    listener()
  }

  return task
}

export function useTasks() {
  const tasks = useSyncExternalStore(subscribe, () => currentTasks)
  return { tasks, addTask }
}
