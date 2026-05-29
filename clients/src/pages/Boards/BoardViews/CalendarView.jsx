import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { updateCardDatesAPI } from '~/apis'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const PRIORITY_COLORS = { 0: 'transparent', 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ board }) {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())

  const tasks = useMemo(() => {
    if (!board?.columns) return []
    return board.columns.flatMap(col =>
      (col.cards || []).filter(c => !c.FE_placeholderCard).map(card => ({
        ...card, columnTitle: col.title, columnColor: col.color || '#6366f1'
      }))
    )
  }, [board])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const days = []

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false, tasks: [] })
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr)
      days.push({ date, isCurrentMonth: true, tasks: dayTasks })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, isCurrentMonth: false, tasks: [] })
    }
    return days
  }, [year, month, tasks])

  const today = new Date()
  const isToday = (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const openCard = (card) => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  // Drag handlers for re-scheduling
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id)
    e.dataTransfer.setData('taskData', JSON.stringify(task))
  }

  const handleDrop = async (e, date) => {
    e.preventDefault()
    const taskData = JSON.parse(e.dataTransfer.getData('taskData'))
    const newDueDate = date.toISOString().split('T')[0]
    try {
      await updateCardDatesAPI(taskData._id, { dueDate: newDueDate })
      queryClient.invalidateQueries(['board', board._id])
      toast.success('Due date updated')
    } catch { toast.error('Failed to update') }
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div className="board-view-container" style={{ padding: 24 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{monthName}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn btn-icon btn-ghost" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
          <button className="btn btn-icon btn-ghost" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Day headers */}
        {DAY_NAMES.map(day => (
          <div key={day} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-surface)', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
        {/* Calendar cells */}
        {calendarDays.map((day, i) => (
          <div key={i}
            className="calendar-cell"
            onDrop={e => handleDrop(e, day.date)}
            onDragOver={handleDragOver}
            style={{
              minHeight: 100, padding: 6, background: isToday(day.date) ? 'rgba(99,102,241,0.06)' : 'var(--bg-surface)',
              opacity: day.isCurrentMonth ? 1 : 0.4, transition: 'background 0.15s'
            }}
          >
            <span style={{
              display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: isToday(day.date) ? 700 : 400,
              background: isToday(day.date) ? 'var(--accent-primary)' : 'transparent',
              color: isToday(day.date) ? '#fff' : 'var(--text-primary)'
            }}>
              {day.date.getDate()}
            </span>
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {day.tasks.slice(0, 3).map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={e => handleDragStart(e, task)}
                  onClick={() => openCard(task)}
                  style={{
                    fontSize: 11, padding: '3px 6px', borderRadius: 4,
                    background: (task.columnColor || '#6366f1') + '18',
                    borderLeft: `3px solid ${task.columnColor || '#6366f1'}`,
                    cursor: 'grab', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  {task.priority > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />}
                  {task.title}
                </div>
              ))}
              {day.tasks.length > 3 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 6 }}>+{day.tasks.length - 3} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
