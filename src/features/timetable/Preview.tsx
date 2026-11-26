import { SAMPLE_LESSONS, SAMPLE_NOW, SAMPLE_TODAY } from '../../shared/sampleData.ts'
import { Timetable } from './index.ts'

/** The timetable with the wireframe's data, in the 596 × 624 place of screen 01. */
export default function Preview() {
  return (
    <div style={{ width: 596, height: 624, margin: 32 }}>
      <Timetable lessons={SAMPLE_LESSONS} today={SAMPLE_TODAY} now={SAMPLE_NOW} onOpenCalendar={() => {}} />
    </div>
  )
}
