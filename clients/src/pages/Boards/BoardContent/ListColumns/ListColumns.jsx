import { useState } from 'react'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'react-toastify'
import { cloneDeep } from 'lodash'
import { useBoardStore } from '~/store/useBoardStore'
import { createNewColumnAPI } from '~/apis/index'
import { generatePlaceholderCard } from '~/untils/formatters'
import Column from './Column/Column'

const ListColumns = ({ columns }) => {
  const { currentActiveBoard: board, updateCurrentActiveBoard } = useBoardStore()
  const [newColumnForm, setNewColumnForm] = useState(false)
  const [valueColumnTitle, setValueColumnTitle] = useState('')

  const addNewColumn = async () => {
    if (!valueColumnTitle.trim()) { toast.error('Please enter a column title'); return }
    const createdColumn = await createNewColumnAPI({ title: valueColumnTitle, boardId: board._id })
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]
    const newBoard = cloneDeep(board)
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    updateCurrentActiveBoard(newBoard)
    setNewColumnForm(false)
    setValueColumnTitle('')
  }

  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <div style={{ display: 'flex', height: '100%', gap: 20, alignItems: 'flex-start' }}>
        {columns?.map(column => <Column key={column._id} column={column} columnId={column._id} />)}

        {!newColumnForm ? (
          <button className="add-column-btn" onClick={() => setNewColumnForm(true)}>
            + Add new column
          </button>
        ) : (
          <div style={{
            minWidth: 300, background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)',
            padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0
          }}>
            <input
              autoFocus
              className="form-group"
              style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
              placeholder="Enter column title..."
              value={valueColumnTitle}
              onChange={e => setValueColumnTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addNewColumn(); if (e.key === 'Escape') setNewColumnForm(false) }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm interceptor-loading" onClick={addNewColumn}>Add column</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setNewColumnForm(false)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </SortableContext>
  )
}

export default ListColumns
