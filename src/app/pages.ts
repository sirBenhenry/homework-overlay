/** The five pages the bottom navigation switches between. */
export type PageId = 'calendar' | 'tasks' | 'home' | 'applets' | 'settings'

export type PageInfo = {
  id: PageId
  /** Title shown in the header. */
  title: string
  /** Label under the nav icon. */
  label: string
}

/** Order matches the wireframe: Calendar, Tasks, Home, Applets, Settings. */
export const PAGES: readonly PageInfo[] = [
  { id: 'calendar', title: 'Calendar', label: 'Calendar' },
  { id: 'tasks', title: 'Tasks', label: 'Tasks' },
  { id: 'home', title: 'Home', label: 'Home' },
  { id: 'applets', title: 'Applets', label: 'Applets' },
  { id: 'settings', title: 'Settings', label: 'Settings' },
]

export const DEFAULT_PAGE: PageId = 'home'
