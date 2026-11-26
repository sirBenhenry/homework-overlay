import { SAMPLE_SUBJECTS } from '../../shared/sampleData'
import type { ParseTaskInput } from '../../shared/types'
import { AddTask, TaskList, useTasks } from './index'
import styles from './Preview.module.css'

const plainParse: ParseTaskInput = (text) => ({
  title: text.trim(),
  subject: null,
  due: null,
  time: null,
  notes: '',
  typed: text,
})

export default function Preview() {
  const { tasks, addTask } = useTasks()

  return (
    <div className={styles.preview}>
      <TaskList tasks={tasks} />
      <AddTask parse={plainParse} subjects={SAMPLE_SUBJECTS} onAdd={addTask} />
    </div>
  )
}
