import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { useBoardStore } from '~/store/useBoardStore'
import { useActiveCardStore } from '~/store/useActiveCardStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBoardAPI, updateBoardDetailsApi, updateColumnDetailsApi, moveCardDifferentColumnAPI } from '~/apis'
import { mapOder } from '~/untils/sort'
import { generatePlaceholderCard } from '~/untils/formatters'
import { isEmpty } from 'lodash'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import BoardChat from './BoardChat/BoardChat'
import PageLoadingSpiner from '~/Combonents/Loading/PageLoadingSpiner'
import ActiveCard from '~/Combonents/Modal/ActiveCard/ActiveCard'
import { boardHub, startSignalR } from '~/socketClient'

// Lazy-loaded views
import TableView from './BoardViews/TableView'
import CalendarView from './BoardViews/CalendarView'
import PlannerView from './BoardViews/PlannerView'
import BoardDashboard from './BoardViews/BoardDashboard'

const Board = () => {
  const { currentActiveBoard: board, updateCurrentActiveBoard } = useBoardStore()
  const { updateCurrentActiveCard } = useActiveCardStore()
  const { boardId } = useParams()
  const [activeView, setActiveView] = useState('kanban')
  const queryClient = useQueryClient()

  // Fetch board data
  const { data: fetchedBoard } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => fetchBoardAPI(`/${boardId}`),
    enabled: !!boardId
  })

  // Sync fetched data into Zustand
  useEffect(() => {
    if (fetchedBoard) {
      let b = cloneDeep(fetchedBoard)
      b.FE_allUsers = b.owners.concat(b.members)
      b.columns = mapOder(b?.columns, b?.columnOrderIds, '_id')
      b.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOder(column.cards, column.cardOrderIds, '_id')
        }
      })
      updateCurrentActiveBoard(b)
    }
  }, [fetchedBoard, updateCurrentActiveBoard])

  // SignalR: join board group and listen for real-time events
  useEffect(() => {
    if (!boardId) return

    startSignalR().then(() => {
      boardHub.invoke('JoinBoard', boardId).catch(() => {})
    })

    // Column reordered by another user
    const onColumnReordered = (items) => {
      const current = useBoardStore.getState().currentActiveBoard
      if (!current) return
      const newBoard = cloneDeep(current)
      items.forEach(({ id, position }) => {
        const col = newBoard.columns.find(c => c._id === id || c._id === id?.toString())
        if (col) col.position = position
      })
      newBoard.columns = [...newBoard.columns].sort((a, b) => a.position - b.position)
      newBoard.columnOrderIds = newBoard.columns.map(c => c._id)
      updateCurrentActiveBoard(newBoard)
    }

    // Card moved by another user
    const onTaskMoved = ({ taskId, oldColumnId, newColumnId, position }) => {
      queryClient.invalidateQueries(['board', boardId])
    }

    const onTaskUpdated = (updatedCard) => {
      const current = useBoardStore.getState().currentActiveBoard
      if (!current) return
      const newBoard = cloneDeep(current)
      for (const col of newBoard.columns) {
        const idx = col.cards.findIndex(c => c._id === updatedCard._id || c._id === updatedCard._id?.toString())
        if (idx !== -1) { col.cards[idx] = { ...col.cards[idx], ...updatedCard }; break }
      }
      updateCurrentActiveBoard(newBoard)
      
      const curCard = useActiveCardStore.getState().currentActiveCard
      if (curCard && (curCard._id === updatedCard._id || curCard._id === updatedCard._id?.toString())) {
        updateCurrentActiveCard({ ...curCard, ...updatedCard })
      }
    }

    const onColumnCreated = (newColumn) => {
      const current = useBoardStore.getState().currentActiveBoard
      if (!current) return
      if (current.columns.some(c => c._id === newColumn._id || c._id === newColumn._id?.toString())) return

      const newBoard = cloneDeep(current)
      newBoard.columns.push({
        ...newColumn,
        cards: newColumn.cards || []
      })
      newBoard.columnOrderIds.push(newColumn._id)
      updateCurrentActiveBoard(newBoard)
    }

    const onCardCreated = (newCard) => {
      const current = useBoardStore.getState().currentActiveBoard
      if (!current) return

      const newBoard = cloneDeep(current)
      const col = newBoard.columns.find(c => c._id === newCard.columnId || c._id === newCard.columnId?.toString())
      if (col) {
        if (col.cards.some(c => c._id === newCard._id || c._id === newCard._id?.toString())) return
        col.cards.push(newCard)
        col.cardOrderIds.push(newCard._id)
        updateCurrentActiveBoard(newBoard)
      }
    }

    boardHub.on('ColumnReordered', onColumnReordered)
    boardHub.on('TaskMoved', onTaskMoved)
    boardHub.on('TaskUpdated', onTaskUpdated)
    boardHub.on('ColumnCreated', onColumnCreated)
    boardHub.on('CardCreated', onCardCreated)

    return () => {
      boardHub.invoke('LeaveBoard', boardId).catch(() => {})
      boardHub.off('ColumnReordered', onColumnReordered)
      boardHub.off('TaskMoved', onTaskMoved)
      boardHub.off('TaskUpdated', onTaskUpdated)
      boardHub.off('ColumnCreated', onColumnCreated)
      boardHub.off('CardCreated', onCardCreated)
    }
  }, [boardId, queryClient])

  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    updateCurrentActiveBoard({ ...board, columns: dndOrderedColumns, columnOrderIds: dndOrderedColumnsIds })
    updateBoardDetailsApi(board._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  const moveCardInTheSameColumn = (dndOrderedCard, dndOrderedCardIds, columnId) => {
    if (dndOrderedCardIds[0]?.includes('placeholder-card')) dndOrderedCardIds.shift()
    const newBoard = cloneDeep(board)
    const col = newBoard.columns.find(c => c._id === columnId)
    if (col) { col.cards = dndOrderedCard; col.cardOrderIds = dndOrderedCardIds }
    updateCurrentActiveBoard(newBoard)
    updateColumnDetailsApi(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nexColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    updateCurrentActiveBoard({ ...board, columns: dndOrderedColumns, columnOrderIds: dndOrderedColumnsIds })
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    if (prevCardOrderIds?.[0]?.includes('placeholder-card')) prevCardOrderIds = []
    moveCardDifferentColumnAPI({
      currentCardId, prevColumnId, prevCardOrderIds,
      nexColumnId, nexCardOrderIds: dndOrderedColumns.find(c => c._id === nexColumnId)?.cardOrderIds,
    })
  }

  const [showChat, setShowChat] = useState(false)

  if (!board) return <PageLoadingSpiner caption="Loading board..." />

  // Render active view
  const renderView = () => {
    switch (activeView) {
      case 'table': return <TableView board={board} />
      case 'calendar': return <CalendarView board={board} />
      case 'planner': return <PlannerView board={board} />
      case 'dashboard': return <BoardDashboard boardId={board._id} />
      case 'kanban': default:
        return (
          <BoardContent
            board={board}
            moveColumns={moveColumns}
            moveCardInTheSameColumn={moveCardInTheSameColumn}
            moveCardToDifferentColumn={moveCardToDifferentColumn}
          />
        )
    }
  }

  return (
    <div className="board-wrapper">
      <ActiveCard />
      <BoardBar
        board={board}
        showChat={showChat}
        onToggleChat={() => setShowChat(!showChat)}
        activeView={activeView}
        onChangeView={setActiveView}
      />
      <div className="board-main-container">
        {renderView()}
        {showChat && (
          <BoardChat
            boardId={boardId}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  )
}

export default Board
