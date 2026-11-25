import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Remove rendered components and stored data after every test,
// so one test cannot affect the next.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
