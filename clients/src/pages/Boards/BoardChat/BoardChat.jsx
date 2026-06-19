import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchBoardChatMessagesAPI, sendBoardChatMessageAPI } from '~/apis'
import { boardHub } from '~/socketClient'
import { toast } from 'react-toastify'

const BoardChat = ({ boardId, onClose }) => {
  const currentUser = useSelector(selectCurrentUser)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Scroll to the bottom of the chat container
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Load chat history on mount
  useEffect(() => {
    if (!boardId) return

    setLoading(true)
    fetchBoardChatMessagesAPI(boardId)
      .then((data) => {
        setMessages(data || [])
        setLoading(false)
        // Scroll to bottom once history is loaded
        setTimeout(() => scrollToBottom('auto'), 50)
      })
      .catch((err) => {
        console.error('Error fetching chat history:', err)
        toast.error('Failed to load chat history')
        setLoading(false)
      })
  }, [boardId])

  // Setup SignalR listener for real-time messages
  useEffect(() => {
    const handleChatMessage = (payload) => {
      if (payload.boardId === boardId) {
        setMessages((prev) => {
          // Check if message is already added to prevent duplicates
          if (prev.some((m) => m._id === payload._id)) return prev
          return [...prev, payload]
        })
        setTimeout(() => scrollToBottom('smooth'), 50)
      }
    }

    boardHub.on('ChatMessageReceived', handleChatMessage)

    return () => {
      boardHub.off('ChatMessageReceived', handleChatMessage)
    }
  }, [boardId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const cleanText = inputText.trim()
    if (!cleanText) return

    setInputText('')
    try {
      // POST message to backend database
      const response = await sendBoardChatMessageAPI(boardId, { message: cleanText })
      // Append locally right away if not already handled by SignalR broadcast
      setMessages((prev) => {
        if (prev.some((m) => m._id === response._id)) return prev
        return [...prev, response]
      })
      setTimeout(() => scrollToBottom('smooth'), 50)
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="board-chat-sidebar">
      {/* Sidebar Header */}
      <div className="board-chat-header">
        <div className="board-chat-header-left">
          <span className="chat-dot active"></span>
          <div>
            <h3>Board Chat</h3>
            <p>{messages.length} messages</p>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose} aria-label="Close Chat">
          &times;
        </button>
      </div>

      {/* Messages Feed */}
      <div className="board-chat-feed">
        {loading ? (
          <div className="chat-loading-container">
            <span className="chat-spinner"></span>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <h4>Welcome to the Board Chat!</h4>
            <p>Say hello to your fellow board members and start collaborating in real-time!</p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.userId === currentUser?._id
              const showUserHeader = index === 0 || messages[index - 1].userId !== msg.userId

              return (
                <div key={msg._id || index} className={`chat-message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                  {showUserHeader && !isOwnMessage && (
                    <div className="chat-message-sender-info">
                      {msg.userAvatar ? (
                        <img src={msg.userAvatar} alt={msg.userDisplayName} className="chat-message-avatar" />
                      ) : (
                        <div className="chat-message-avatar-placeholder">
                          {msg.userDisplayName ? msg.userDisplayName.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <span className="chat-message-sender-name">{msg.userDisplayName || 'User'}</span>
                    </div>
                  )}

                  <div className="chat-message-bubble-wrapper">
                    <div className="chat-message-bubble">
                      <p className="chat-message-text">{msg.message}</p>
                      <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form className="board-chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-wrapper">
          <textarea
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={1000}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()} title="Send message">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default BoardChat
