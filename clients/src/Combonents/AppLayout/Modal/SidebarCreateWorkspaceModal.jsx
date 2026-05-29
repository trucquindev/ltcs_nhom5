import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createWorkspaceAPI } from '~/apis';
import { fetchWorkspacesThunk, fetchActiveWorkspaceThunk } from '~/redux/workspace/workspaceSlice';

export default function SidebarCreateWorkspaceModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setLoading(true);
      const res = await createWorkspaceAPI({ name, description });
      toast.success('Workspace created!');
      
      // Refresh workspaces and set the new one as active
      dispatch(fetchWorkspacesThunk());
      dispatch(fetchActiveWorkspaceThunk(res.id));
      
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      toast.error(err.message || 'Error creating workspace');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '90vw', padding: 0 }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Create Workspace</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label>Workspace Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Taco's Co." 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
              <textarea 
                className="form-control" 
                placeholder="What is this workspace for?" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
