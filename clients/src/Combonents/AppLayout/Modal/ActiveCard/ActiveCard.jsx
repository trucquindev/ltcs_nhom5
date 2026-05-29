import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useActiveCardStore } from '~/store/useActiveCardStore'
import { useBoardStore } from '~/store/useBoardStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCardDetailAPI, addChecklistItemAPI, updateChecklistItemAPI, deleteChecklistItemAPI, updateCardPriorityAPI, updateCardDatesAPI, deleteCardAPI, fetchTimeLogsAPI, addTimeLogAPI, deleteTimeLogAPI, updateCardEstimationAPI } from '~/apis'

import { selectCurrentUser } from '~/redux/user/userSlice'
import { singleFileValidator } from '~/untils/validators'
import { toast } from 'react-toastify'
import { CARD_MEMBER_ACTION, API_ROOT } from '~/untils/constrain'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'

const PRIORITY_LABELS = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }
const PRIORITY_COLORS = { 0: '#64748b', 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }

function ActiveCard() {
  const queryClient = useQueryClient()
  const { currentActiveCard: activeCard, isShowActiveCard: isShow, clearAndHideCurrentActiveCard, updateCurrentActiveCard } = useActiveCardStore()
  const { updateCardInBoard } = useBoardStore()
  const currentUser = useSelector(selectCurrentUser)

  // Local state for new features
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showTimerSection, setShowTimerSection] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timeLogs, setTimeLogs] = useState([])
  const [timeNote, setTimeNote] = useState('')
  const timerRef = useRef(null)

  const handleClose = () => {
    stopTimer()
    clearAndHideCurrentActiveCard()
  }

  useEffect(() => {
    if (activeCard?.startDate) setStartDate(activeCard.startDate.split('T')[0])
    else setStartDate('')
    if (activeCard?.dueDate) setDueDate(activeCard.dueDate.split('T')[0])
    else setDueDate('')
  }, [activeCard?._id])

  useEffect(() => {
    if (activeCard?._id && showTimerSection) {
      fetchTimeLogsAPI(activeCard._id).then(setTimeLogs).catch(() => {})
    }
  }, [activeCard?._id, showTimerSection])

  const callAPIUpdateCard = async (updateData) => {
    const updated = await updateCardDetailAPI(activeCard._id, updateData)
    updateCurrentActiveCard(updated)
    updateCardInBoard(updated)
    return updated
  }

  const onUploadCardCover = (e) => {
    const error = singleFileValidator(e.target?.files[0])
    if (error) { toast.error(error); return }
    const reqData = new FormData()
    reqData.append('cardCover', e.target.files[0])
    toast.promise(callAPIUpdateCard(reqData).finally(() => { e.target.value = '' }), { pending: 'Uploading...' })
  }

  // ─── Checklist handlers ───
  const handleAddChecklist = async () => {
    if (!newChecklistItem.trim()) return
    try {
      const item = await addChecklistItemAPI(activeCard._id, { title: newChecklistItem })
      const updatedItems = [...(activeCard.checklistItems || []), item]
      const updated = { ...activeCard, checklistItems: updatedItems }
      updateCurrentActiveCard(updated)
      updateCardInBoard(updated)
      setNewChecklistItem('')
    } catch { toast.error('Failed to add checklist item') }
  }

  const handleToggleChecklist = async (itemId, currentState) => {
    try {
      await updateChecklistItemAPI(activeCard._id, itemId, { isCompleted: !currentState })
      const updatedItems = activeCard.checklistItems.map(i => i._id === itemId ? { ...i, isCompleted: !currentState } : i)
      const updated = { ...activeCard, checklistItems: updatedItems }
      updateCurrentActiveCard(updated)
      updateCardInBoard(updated)
    } catch { toast.error('Failed') }
  }

  const handleDeleteChecklist = async (itemId) => {
    try {
      await deleteChecklistItemAPI(activeCard._id, itemId)
      const updatedItems = activeCard.checklistItems.filter(i => i._id !== itemId)
      const updated = { ...activeCard, checklistItems: updatedItems }
      updateCurrentActiveCard(updated)
      updateCardInBoard(updated)
    } catch { toast.error('Failed') }
  }

  // ─── Priority handler ───
  const handleSetPriority = async (priority) => {
    try {
      await updateCardPriorityAPI(activeCard._id, priority)
      const updated = { ...activeCard, priority }
      updateCurrentActiveCard(updated)
      updateCardInBoard(updated)
      setShowPriorityPicker(false)
    } catch { toast.error('Failed') }
  }

  // ─── Dates handler ───
  const handleSaveDates = async () => {
    try {
      await updateCardDatesAPI(activeCard._id, {
        startDate: startDate || null,
        dueDate: dueDate || null,
        clearStartDate: !startDate,
        clearDueDate: !dueDate
      })
      const updated = { ...activeCard, startDate: startDate || null, dueDate: dueDate || null }
      updateCurrentActiveCard(updated)
      updateCardInBoard(updated)
      setShowDatePicker(false)
      toast.success('Dates saved')
    } catch { toast.error('Failed') }
  }

  // ─── Delete card handler ───
  const handleDeleteCard = async () => {
    if (!confirm('Delete this card permanently?')) return
    try {
      await deleteCardAPI(activeCard._id)
      clearAndHideCurrentActiveCard()
      queryClient.invalidateQueries(['board', activeCard.boardId])
      toast.success('Card deleted')
    } catch { toast.error('Failed to delete card') }
  }

  // ─── Timer handlers ───
  const startTimer = () => {
    setTimerRunning(true)
    setTimerSeconds(0)
    timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setTimerRunning(false)
  }

  const saveTimeLog = async () => {
    stopTimer()
    const minutes = Math.max(1, Math.round(timerSeconds / 60))
    try {
      const log = await addTimeLogAPI(activeCard._id, { durationMinutes: minutes, note: timeNote || `Tracked ${formatTime(timerSeconds)}` })
      setTimeLogs(prev => [log, ...prev])
      setTimerSeconds(0)
      setTimeNote('')
    } catch { toast.error('Failed to save time log') }
  }

  const handleDeleteTimeLog = async (logId) => {
    try {
      await deleteTimeLogAPI(activeCard._id, logId)
      setTimeLogs(prev => prev.filter(l => l._id !== logId))
    } catch { toast.error('Failed') }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`
  }

  if (!isShow) return null

  // Checklist progress
  const checklistItems = activeCard?.checklistItems || []
  const completedCount = checklistItems.filter(i => i.isCompleted).length
  const checklistPct = checklistItems.length > 0 ? Math.round((completedCount / checklistItems.length) * 100) : 0

  // Due date status
  const getDueBadge = () => {
    if (!activeCard?.dueDate) return null
    const days = Math.ceil((new Date(activeCard.dueDate).getTime() - Date.now()) / 864e5)
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: 'badge-overdue' }
    if (days === 0) return { text: 'Due today', cls: 'badge-today' }
    if (days <= 3) return { text: `${days}d left`, cls: 'badge-soon' }
    return { text: `${days}d left`, cls: '' }
  }
  const dueBadge = getDueBadge()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal" style={{ maxWidth: 900 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span>🃏</span>
            <input
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'inherit', flex: 1 }}
              defaultValue={activeCard?.title}
              onBlur={e => { if (e.target.value.trim() !== activeCard?.title) callAPIUpdateCard({ title: e.target.value.trim() }) }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeCard?.priority > 0 && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: PRIORITY_COLORS[activeCard.priority] + '22', color: PRIORITY_COLORS[activeCard.priority], fontWeight: 600 }}>
                {PRIORITY_LABELS[activeCard.priority]}
              </span>
            )}
            {dueBadge && (
              <span className={`due-badge ${dueBadge.cls}`}>{dueBadge.text}</span>
            )}
            <button className="btn btn-icon btn-ghost" onClick={handleDeleteCard} title="Delete card" style={{ color: '#ef4444' }}>🗑</button>
            <button className="modal-close" onClick={handleClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          {activeCard?.cover && (
            <img src={activeCard.cover.startsWith('http') ? activeCard.cover : `${API_ROOT}${activeCard.cover}`} alt="cover"
              style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 20 }} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 24 }}>
            {/* Left — Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Members */}
              <div>
                <div className="section-title">Members</div>
                <CardUserGroup cardMemberIds={activeCard?.memberIds} onUpdateCardMember={data => callAPIUpdateCard({ incomingMemberInfo: data })} />
              </div>

              {/* Description */}
              <div>
                <div className="section-title">Description</div>
                <CardDescriptionMdEditor cardDescriptionProp={activeCard?.description} handleUpdateCardDescription={desc => callAPIUpdateCard({ description: desc })} />
              </div>

              {/* ─── Checklist Section ─── */}
              <div>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✅ Checklist ({completedCount}/{checklistItems.length})</span>
                  {checklistItems.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{checklistPct}%</span>}
                </div>

                {/* Progress bar */}
                {checklistItems.length > 0 && (
                  <div style={{ height: 6, background: 'var(--bg-card)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${checklistPct}%`, background: checklistPct === 100 ? '#10b981' : 'var(--accent-primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                )}

                {/* Checklist items */}
                {checklistItems.map(item => (
                  <div key={item._id} className="checklist-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, marginBottom: 2, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div
                      onClick={() => handleToggleChecklist(item._id, item.isCompleted)}
                      style={{ width: 18, height: 18, borderRadius: 4, border: item.isCompleted ? 'none' : '2px solid var(--border-color)', background: item.isCompleted ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                      {item.isCompleted && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', transition: 'all 0.2s' }}>
                      {item.title}
                    </span>
                    <button onClick={() => handleDeleteChecklist(item._id)}
                      className="btn btn-icon btn-ghost" style={{ opacity: 0.3, padding: 2 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.3}>
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add new item */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    placeholder="Add an item..."
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddChecklist() }}
                    style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleAddChecklist}>Add</button>
                </div>
              </div>

              {/* ─── Time Tracking Section ─── */}
              {showTimerSection && (
                <div>
                  <div className="section-title">🕐 Time Tracking</div>
                  {/* Stopwatch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: timerRunning ? '#10b981' : 'var(--text-primary)', letterSpacing: '1px', minWidth: 120 }}>
                      {formatTime(timerSeconds)}
                    </div>
                    {!timerRunning ? (
                      <button className="btn btn-primary btn-sm" onClick={startTimer}>▶ Start</button>
                    ) : (
                      <>
                        <button className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={() => { stopTimer() }}>⏹ Stop</button>
                        <button className="btn btn-primary btn-sm" onClick={saveTimeLog}>💾 Save</button>
                      </>
                    )}
                  </div>
                  {timerSeconds > 0 && !timerRunning && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input placeholder="Note (optional)" value={timeNote} onChange={e => setTimeNote(e.target.value)}
                        style={{ flex: 1, padding: '6px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
                      <button className="btn btn-primary btn-sm" onClick={saveTimeLog}>Save Log</button>
                    </div>
                  )}

                  {/* Time logs */}
                  {timeLogs.length > 0 && (
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {timeLogs.map(log => (
                        <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, borderBottom: '1px solid var(--border-color)' }}>
                          <div className="avatar avatar-xs" style={{ flexShrink: 0 }}>{log.userDisplayName?.charAt(0) || '?'}</div>
                          <span style={{ fontWeight: 500 }}>{log.userDisplayName}</span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                            {log.durationMinutes >= 60 ? `${Math.floor(log.durationMinutes / 60)}h ${log.durationMinutes % 60}m` : `${log.durationMinutes}m`}
                          </span>
                          <span style={{ color: 'var(--text-muted)', flex: 1 }}>{log.note || ''}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(log.loggedAt).toLocaleDateString()}</span>
                          <button onClick={() => handleDeleteTimeLog(log._id)} className="btn btn-icon btn-ghost" style={{ padding: 2, opacity: 0.3 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity / Comments */}
              <div>
                <div className="section-title">Activity</div>
                <CardActivitySection cardId={activeCard?._id} cardComments={activeCard?.comments} onAddCardComment={comment => callAPIUpdateCard({ commentToAdd: comment })} />
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="section-title">Add to card</div>
              {!activeCard?.memberIds?.includes(currentUser._id) && (
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}
                  onClick={() => callAPIUpdateCard({ incomingMemberInfo: { userId: currentUser._id, action: CARD_MEMBER_ACTION.ADD } })}>
                  👤 Join
                </button>
              )}
              <label className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', cursor: 'pointer' }}>
                🖼 Cover
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onUploadCardCover} />
              </label>

              {/* Priority */}
              <div style={{ position: 'relative' }}>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setShowPriorityPicker(!showPriorityPicker)}>
                  🎯 Priority {activeCard?.priority > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 6px', borderRadius: 8, background: PRIORITY_COLORS[activeCard.priority] + '22', color: PRIORITY_COLORS[activeCard.priority] }}>{PRIORITY_LABELS[activeCard.priority]}</span>}
                </button>
                {showPriorityPicker && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 10, boxShadow: 'var(--shadow-lg)' }}>
                    {[0, 1, 2, 3, 4].map(p => (
                      <div key={p} onClick={() => handleSetPriority(p)} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: activeCard?.priority === p ? 'var(--bg-card)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={e => e.currentTarget.style.background = activeCard?.priority === p ? 'var(--bg-card)' : 'transparent'}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[p] }} />
                        {PRIORITY_LABELS[p]}
                        {activeCard?.priority === p && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div style={{ position: 'relative' }}>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setShowDatePicker(!showDatePicker)}>
                  📅 Dates {activeCard?.dueDate && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(activeCard.dueDate).toLocaleDateString()}</span>}
                </button>
                {showDatePicker && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12, zIndex: 10, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start Date</div>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Due Date</div>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveDates} style={{ width: '100%' }}>Save Dates</button>
                  </div>
                )}
              </div>

              {/* Time Tracking toggle */}
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setShowTimerSection(!showTimerSection)}>
                🕐 Time Tracking {activeCard?.totalTimeLoggedMinutes > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{activeCard.totalTimeLoggedMinutes}m</span>}
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 4, paddingTop: 8 }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Actions</div>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%', color: '#ef4444' }} onClick={handleDeleteCard}>
                  🗑 Delete Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveCard
