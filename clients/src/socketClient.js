import * as signalR from '@microsoft/signalr'
import { API_ROOT } from './untils/constrain.js'

// Singleton SignalR connection to BoardHub
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_ROOT}/hubs/board`, {
    accessTokenFactory: () => {
      // Read token from Redux persisted state in localStorage
      try {
        const raw = localStorage.getItem('persist:root')
        if (raw) {
          const root = JSON.parse(raw)
          const user = JSON.parse(root.user || '{}')
          return user?.currentUser?.accessToken || ''
        }
      } catch { /* ignore */ }
      return ''
    }
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Warning)
  .build()

let started = false

export const startSignalR = async () => {
  if (started || connection.state !== signalR.HubConnectionState.Disconnected) return
  try {
    await connection.start()
    started = true
  } catch (e) {
    console.warn('SignalR connect failed:', e)
  }
}

export const boardHub = connection

// Keep backward-compat: socketInstance shim for Notifications (invite events)
export const socketInstance = {
  emit: (event, data) => {
    if (event === 'FE_USER_INVITED_TO_BOARD') {
      // Notify via SignalR hub method
      connection.invoke('NotifyBoardInvitation', data).catch(() => {})
    }
  },
  on: (event, handler) => {
    if (event === 'BE_USER_INVITED_TO_BOARD') {
      connection.on('BoardInvitationReceived', handler)
    }
  },
  off: (event, handler) => {
    if (event === 'BE_USER_INVITED_TO_BOARD') {
      connection.off('BoardInvitationReceived', handler)
    }
  }
}
