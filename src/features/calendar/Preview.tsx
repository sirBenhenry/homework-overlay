import { SAMPLE_LESSONS, SAMPLE_NOW, SAMPLE_TASKS, SAMPLE_TODAY } from '../../shared/sampleData.ts'
import { Calendar } from './index.ts'

/** The calendar with the wireframe's data, in the 1216 × 624 content area of screen 03. */
export default function Preview() {
  return (
    <div style={{ width: 1216, height: 624, margin: 32 }}>
      <Calendar tasks={SAMPLE_TASKS} lessons={SAMPLE_LESSONS} today={SAMPLE_TODAY} now={SAMPLE_NOW} />
    </div>
  )
}
