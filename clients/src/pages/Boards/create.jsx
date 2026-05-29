import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FIELD_REQUIRED_MESSAGE } from '~/untils/validators'
import { createNewBoardAPI } from '~/apis'

const BOARD_TYPES = { PUBLIC: 'public', PRIVATE: 'private' }

function SidebarCreateBoardModal({ afterCreateNewBoard, workspaceId }) {
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const handleClose = () => { setIsOpen(false); reset() }

  const submitCreateNewBoard = (data) => {
    const payload = { ...data, workspaceId }
    createNewBoardAPI(payload).then(() => { handleClose(); afterCreateNewBoard() })
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + New Board
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>Create a new board</h2>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(submitCreateNewBoard)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Board title..."
                    {...register('title', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: 'Min 3 characters' },
                      maxLength: { value: 50, message: 'Max 50 characters' }
                    })}
                  />
                  {errors.title && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.title.message}</span>}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Board description..."
                    {...register('description', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: 'Min 3 characters' },
                      maxLength: { value: 255, message: 'Max 255 characters' }
                    })}
                  />
                  {errors.description && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.description.message}</span>}
                </div>
                <div className="form-group">
                  <label>Visibility</label>
                  <select {...register('type', { required: FIELD_REQUIRED_MESSAGE })}>
                    <option value={BOARD_TYPES.PUBLIC}>Public</option>
                    <option value={BOARD_TYPES.PRIVATE}>Private</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                  <button type="submit" className="btn btn-primary interceptor-loading">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SidebarCreateBoardModal
