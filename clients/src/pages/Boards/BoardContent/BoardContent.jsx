import ListColumns from './ListColumns/ListColumns'
import {
  DndContext, useSensor, useSensors,
  DragOverlay, defaultDropAnimationSideEffects, closestCorners, getFirstCollision, pointerWithin
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndkitSensors'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Card from './ListColumns/Column/ListCards/Card/Card'
import Column from './ListColumns/Column/Column'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/untils/formatters'

const BoardContent = ({ board, moveColumns, moveCardInTheSameColumn, moveCardToDifferentColumn }) => {
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDragginCard, setOldColumnWhenDragginCard] = useState(null)
  const lastOverID = useRef(null)

  useEffect(() => { setOrderedColumns(board?.columns) }, [board])

  const findColumnByCardId = (cardId) =>
    orderedColumns.find(col => col?.cards?.map(c => c._id)?.includes(cardId))

  const moveCardBetweenColumns = (overColumn, overCardId, active, over, activeColumn, activeDraggingCardId, activeDraggingCardData, triggerFrom) => {
    setOrderedColumns(prev => {
      const overCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
      const isBelowOverItem = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      const newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
      const nextColumns = cloneDeep(prev)
      const nextActiveColumn = nextColumns.find(c => c._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(c => c._id === overColumn._id)
      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(c => c._id !== activeDraggingCardId)
        if (isEmpty(nextActiveColumn.cards)) nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(c => c._id)
      }
      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(c => c._id !== activeDraggingCardId)
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, { ...activeDraggingCardData, columnId: overColumn._id })
        nextOverColumn.cards = nextOverColumn.cards.filter(c => !c.FE_placeholderCard)
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(c => c._id)
      }
      if (triggerFrom === 'handleDragEnd') {
        moveCardToDifferentColumn(activeDraggingCardId, oldColumnWhenDragginCard._id, nextOverColumn._id, nextColumns)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemData(event.active.data.current)
    if (event?.active?.data?.current?.columnId !== undefined) {
      setOldColumnWhenDragginCard(findColumnByCardId(event?.active?.id))
    }
  }

  const handleDragOver = (event) => {
    if (activeDragItemData?.columnId === undefined) return
    const { active, over } = event
    if (!over || !active) return
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    if (!activeColumn || !overColumn) return
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenColumns(overColumn, overCardId, active, over, activeColumn, activeDraggingCardId, activeDraggingCardData, 'handleDragOver')
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    if (activeDragItemData?.columnId !== undefined) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)
      if (!activeColumn || !overColumn) return
      if (oldColumnWhenDragginCard._id !== overColumn._id) {
        moveCardBetweenColumns(overColumn, overCardId, active, over, activeColumn, activeDraggingCardId, activeDraggingCardData, 'handleDragEnd')
      } else {
        const oldCardIndex = oldColumnWhenDragginCard?.cards?.findIndex(c => c._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        const dndOrderedCard = arrayMove(oldColumnWhenDragginCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCard.map(c => c._id)
        setOrderedColumns(prev => {
          const nextColumns = cloneDeep(prev)
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)
          targetColumn.cards = dndOrderedCard
          targetColumn.cardOrderIds = dndOrderedCardIds
          return nextColumns
        })
        moveCardInTheSameColumn(dndOrderedCard, dndOrderedCardIds, oldColumnWhenDragginCard._id)
      }
    } else {
      if (active.id !== over?.id) {
        const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
        const newIndex = orderedColumns.findIndex(c => c._id === over.id)
        const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
        setOrderedColumns(dndOrderedColumns)
        moveColumns(dndOrderedColumns)
      }
    }
    setActiveDragItemData(null)
    setActiveDragItemId(null)
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemData?.columnId === undefined) return closestCorners({ ...args })
    const pointerInteractions = pointerWithin(args)
    if (!pointerInteractions?.length) return
    let overId = getFirstCollision(pointerInteractions, 'id')
    if (overId) {
      const checkColumn = orderedColumns.find(c => c._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(c => c.id !== overId && checkColumn?.cardOrderIds?.includes(c.id))
        })[0]?.id
      }
      lastOverID.current = overId
      return [{ id: overId }]
    }
    return lastOverID.current ? [{ id: lastOverID.current }] : []
  }, [activeDragItemData?.columnId, orderedColumns])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board-content">
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItemData?.columnId === undefined
            ? <Column column={activeDragItemData} />
            : <Card card={activeDragItemData} />}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default BoardContent
