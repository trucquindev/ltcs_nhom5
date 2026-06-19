import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'
import { cloneDeep } from 'lodash'
import { useBoardStore } from '~/store/useBoardStore'
import { createNewCardAPI, deleteColumnAPI, updateColumnDetailsApi } from '~/apis'
import ListCards from './ListCards/ListCards'

const COLUMN_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#6b7280'
]

const Column = ({ column, columnId }) => {
  const { currentActiveBoard: board, updateCurrentActiveBoard } = useBoardStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column?._id,
    data: { ...column }
  })
  const dndStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined,
  }

  const [menuOpen, setMenuOpen] = useState(false)
  const [newCardForm, setNewCardForm] = useState(false)
  const [valueCardTitle, setValueCardTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column?.title || '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const menuRef = useRef(null)

  const colColor = column?.color || '#6366f1'

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setMenuOpen(false); setShowColorPicker(false) } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addNewCard = async () => {
    if (!valueCardTitle.trim()) { toast.error('Please enter a card title', { position: 'bottom-right' }); return }
    const createdCard = await createNewCardAPI({ title: valueCardTitle, columnId, boardId: board._id })
    const newBoard = cloneDeep(board)
    const col = newBoard.columns.find(c => c._id === createdCard.columnId)
    if (col) { col.cards.push(createdCard); col.cardOrderIds.push(createdCard._id) }
    updateCurrentActiveBoard(newBoard)
    setNewCardForm(false)
    setValueCardTitle('')
  }

  const handleDeleteColumn = () => {
    if (!window.confirm(`Delete column "${column.title}" and all its cards?`)) return
    deleteColumnAPI(columnId).then(res => {
      toast.success(res?.deleteResult)
      if (res.err === 0) {
        const newBoard = { ...board }
        newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(id => id !== columnId)
        updateCurrentActiveBoard(newBoard)
      }
    })
  }

  const handleTitleBlur = () => {
    setEditingTitle(false)
    if (titleValue.trim() && titleValue !== column.title) {
      updateColumnDetailsApi(column._id, { title: titleValue }).then(() => {
        const newBoard = cloneDeep(board)
        const col = newBoard.columns.find(c => c._id === column._id)
        if (col) col.title = titleValue
        updateCurrentActiveBoard(newBoard)
      })
    } else {
      setTitleValue(column.title)
    }
  }

  const handleColorChange = (color) => {
    updateColumnDetailsApi(column._id, { color }).then(() => {
      const newBoard = cloneDeep(board)
      const col = newBoard.columns.find(c => c._id === column._id)
      if (col) col.color = color
      updateCurrentActiveBoard(newBoard)
    })
    setShowColorPicker(false)
    setMenuOpen(false)
  }

  return (
    <div ref={setNodeRef} style={dndStyle} {...attributes}>
      <div className="board-column" style={{ borderTop: `3px solid ${colColor}` }}>
        {/* Header */}
        <div className="column-header" {...listeners}>
          <div className="column-title-group">
            {editingTitle ? (
              <input
                autoFocus
                data-no-dnd="true"
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleBlur(); if (e.key === 'Escape') { setTitleValue(column.title); setEditingTitle(false) } }}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '4px 8px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', outline: 'none', width: '100%' }}
              />
            ) : (
              <span className="column-title" onDoubleClick={() => setEditingTitle(true)} style={{ cursor: 'text' }}>
                {column?.title}
              </span>
            )}
            <span className="column-count">{column?.cards?.filter(c => !c.FE_placeholderCard).length}</span>
          </div>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              data-no-dnd="true"
              className="btn btn-icon btn-ghost"
              style={{ padding: 4 }}
              onClick={() => { setMenuOpen(v => !v); setShowColorPicker(false) }}
            >⋯</button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', minWidth: 200, overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 120ms ease'
              }}>
                {/* Menu items */}
                <button data-no-dnd="true" onClick={() => { setNewCardForm(true); setMenuOpen(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '9px 14px', background: 'none', border: 'none',
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  transition: 'background 100ms ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontSize: 15 }}>＋</span> Add new card
                </button>

                {/* Color picker toggle */}
                <button data-no-dnd="true" onClick={() => setShowColorPicker(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '9px 14px', background: 'none', border: 'none',
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  transition: 'background 100ms ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{
                    width: 14, height: 14, borderRadius: 4,
                    background: colColor, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)'
                  }} />
                  Column color
                </button>

                {/* Color palette */}
                {showColorPicker && (
                  <div data-no-dnd="true" style={{
                    padding: '8px 14px 12px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6
                  }}>
                    {COLUMN_COLORS.map(c => (
                      <button key={c} onClick={() => handleColorChange(c)} style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: c, border: c === colColor ? '2px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer', transition: 'transform 100ms ease, border-color 100ms ease',
                        outline: 'none', padding: 0
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button data-no-dnd="true" onClick={handleDeleteColumn} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                    padding: '9px 14px', background: 'none', border: 'none',
                    color: '#dc2626', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                    transition: 'background 100ms ease'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 15 }}>🗑</span> Delete column
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <ListCards cards={column?.cards} columnColor={colColor} />

        {/* Footer */}
        <div style={{ padding: '0 8px 8px' }}>
          {!newCardForm ? (
            <button className="add-task-btn" onClick={() => setNewCardForm(true)}>+ Add a card</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                data-no-dnd="true"
                placeholder="Enter card title..."
                value={valueCardTitle}
                onChange={e => setValueCardTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addNewCard(); if (e.key === 'Escape') setNewCardForm(false) }}
                className="form-control"
                style={{ padding: '8px 12px', fontSize: 13, borderColor: 'var(--accent-primary)' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm interceptor-loading" onClick={addNewCard}>Add</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setNewCardForm(false)}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Column
