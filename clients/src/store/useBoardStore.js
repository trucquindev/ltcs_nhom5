import { create } from "zustand";

export const useBoardStore = create((set) => ({
  currentActiveBoard: null,

  updateCurrentActiveBoard: (fullBoard) =>
    set({ currentActiveBoard: fullBoard }),

  updateCardInBoard: (incomingCard) =>
    set((state) => {
      if (!state.currentActiveBoard) return state;

      const newBoard = { ...state.currentActiveBoard };
      const column = newBoard.columns.find(
        (c) => c._id === incomingCard.columnId,
      );

      if (column) {
        const cardIndex = column.cards.findIndex(
          (c) => c._id === incomingCard._id,
        );
        if (cardIndex !== -1) {
          column.cards[cardIndex] = {
            ...column.cards[cardIndex],
            ...incomingCard,
          };
        }
      }

      return { currentActiveBoard: newBoard };
    }),
}));
