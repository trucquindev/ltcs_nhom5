import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  notifications: [],
  setNotifications: (notifs) => set({ notifications: notifs }),
  addNotification: (notif) => set((state) => ({ notifications: [notif, ...state.notifications] })),
}))
