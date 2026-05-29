import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from './Card/Card'

const ListCards = ({ cards, columnColor }) => (
  <SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
    <div className="column-body">
      {cards?.map(card => <Card key={card._id} card={card} columnColor={columnColor} />)}
    </div>
  </SortableContext>
)

export default ListCards
