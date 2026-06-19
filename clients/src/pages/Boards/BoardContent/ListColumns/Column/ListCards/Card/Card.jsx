import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useActiveCardStore } from '~/store/useActiveCardStore'
import { API_ROOT } from '~/untils/constrain'

const PRIORITY_COLORS = { 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }
const PRIORITY_LABELS = { 1: 'Low', 2: 'Med', 3: 'High', 4: 'Urgent' }

const Card = ({ card, columnColor }) => {
  const updateCurrentActiveCard = useActiveCardStore(state => state.updateCurrentActiveCard)
  const showModalActiveCard = useActiveCardStore(state => state.showModalActiveCard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  if (card?.FE_placeholderCard) return (
    <div ref={setNodeRef} style={{ ...dndStyle, height: 4, border: 'none', background: 'transparent' }} {...attributes} {...listeners} />
  )

  const setActiveCard = () => {
    updateCurrentActiveCard(card)
    showModalActiveCard()
  }

  const checklistItems = card?.checklistItems || []
  const completedChecklist = checklistItems.filter(i => i.isCompleted).length
  const hasChecklist = checklistItems.length > 0

  const getDueBadgeInfo = () => {
    if (!card?.dueDate) return null
    const days = Math.ceil((new Date(card.dueDate).getTime() - Date.now()) / 864e5)
    if (days < 0) return { text: `Overdue`, cls: 'due-overdue' }
    if (days === 0) return { text: 'Today', cls: 'due-today' }
    if (days <= 3) return { text: `${days}d`, cls: 'due-soon' }
    return { text: `${days}d`, cls: '' }
  }
  const dueBadge = getDueBadgeInfo()

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      className={`task-card${isDragging ? ' dragging' : ''}`}
      onClick={setActiveCard}
    >
      {/* Colored left accent */}
      {columnColor && <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: 3, background: columnColor }} />}
      {card?.cover && (
        <img className="task-card-cover" src={card.cover.startsWith('http') ? card.cover : `${API_ROOT}${card.cover}`} alt="cover" />
      )}
      <div className="task-card-title">{card.title}</div>
      {(card?.memberIds?.length > 0 || card?.comments?.length > 0 || card?.priority > 0 || hasChecklist || dueBadge) && (
        <div className="task-card-meta">
          {/* Priority badge */}
          {card?.priority > 0 && (
            <span className="card-priority-badge" style={{ background: PRIORITY_COLORS[card.priority] + '22', color: PRIORITY_COLORS[card.priority] }}>
              {PRIORITY_LABELS[card.priority]}
            </span>
          )}
          {/* Due date */}
          {dueBadge && (
            <span className={`card-due-badge ${dueBadge.cls}`}>
              📅 {dueBadge.text}
            </span>
          )}
          {/* Checklist progress */}
          {hasChecklist && (
            <span className={`card-checklist-badge ${completedChecklist === checklistItems.length ? 'complete' : ''}`}>
              ☑ {completedChecklist}/{checklistItems.length}
            </span>
          )}
          {card?.memberIds?.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              👥 {card.memberIds.length}
            </span>
          )}
          {card?.comments?.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              💬 {card.comments.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default Card
