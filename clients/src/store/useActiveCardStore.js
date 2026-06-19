import { create } from 'zustand'

export const useActiveCardStore = create((set) => ({
  currentActiveCard: null,
  isShowActiveCard: false,
  showModalActiveCard: () => set({ isShowActiveCard: true }),
  updateCurrentActiveCard: (card) => set({ currentActiveCard: card }),
  clearAndHideCurrentActiveCard: () => set({ currentActiveCard: null, isShowActiveCard: false })
}))
