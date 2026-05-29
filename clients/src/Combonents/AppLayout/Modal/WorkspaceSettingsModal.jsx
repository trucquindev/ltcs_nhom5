import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateWorkspaceAPI, addWorkspaceMemberAPI, removeWorkspaceMemberAPI, updateWorkspaceMemberRoleAPI, deleteWorkspaceAPI } from '~/apis';
import { useDispatch } from 'react-redux';
import { fetchWorkspacesThunk, fetchActiveWorkspaceThunk } from '~/redux/workspace/workspaceSlice';

export default function WorkspaceSettingsModal({ workspace, onClose }) {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('members');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(workspace?.name || '');
  const [desc, setDesc] = useState(workspace?.description || '');

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateWorkspaceAPI(workspace.id, { name, description: desc });
      toast.success('Workspace updated!');
      dispatch(fetchWorkspacesThunk());
      dispatch(fetchActiveWorkspaceThunk(workspace.id));
    } catch (err) {
      toast.error(err.message || 'Error updating workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await addWorkspaceMemberAPI(workspace.id, email);
      toast.success('Member added successfully!');
      setEmail('');
      dispatch(fetchActiveWorkspaceThunk(workspace.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeWorkspaceMemberAPI(workspace.id, userId);
      toast.success('Member removed');
      dispatch(fetchActiveWorkspaceThunk(workspace.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error removing member');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await updateWorkspaceMemberRoleAPI(workspace.id, userId, role);
      toast.success('Role updated');
      dispatch(fetchActiveWorkspaceThunk(workspace.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error changing role');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm('DANGER: Delete this entire workspace and all its boards?')) return;
    try {
      await deleteWorkspaceAPI(workspace.id);
      toast.success('Workspace deleted');
      dispatch(fetchWorkspacesThunk());
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error deleting workspace');
    }
  };

  if (!workspace) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '90vw', padding: 0 }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2>Workspace Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setTab('members')}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: tab === 'members' ? 600 : 450,
              color: tab === 'members' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'members' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 120ms ease',
              marginBottom: -1
            }}
          >
            Members
          </button>
          <button
            onClick={() => setTab('settings')}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: tab === 'settings' ? 600 : 450,
              color: tab === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'settings' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 120ms ease',
              marginBottom: -1
            }}
          >
            General
          </button>
        </div>

        {/* Content */}
        <div className="modal-body" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {tab === 'members' && (
            <div>
              {/* Invite form */}
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Invite by email address..." 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !email}>
                  Invite
                </button>
              </form>

              {/* Members list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workspace.members?.map(m => (
                  <div key={m.userId} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)', transition: 'background 120ms ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {m.displayName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{m.displayName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select 
                        value={m.accessLevel} 
                        onChange={(e) => handleChangeRole(m.userId, parseInt(e.target.value))}
                        style={{ minWidth: 110 }}
                      >
                        <option value={2}>Admin</option>
                        <option value={1}>Member</option>
                        <option value={0}>Viewer</option>
                      </select>
                      
                      <button className="modal-close" style={{ fontSize: 16 }} onClick={() => handleRemoveMember(m.userId)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div>
              <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label>Workspace Name</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Danger zone */}
              <div style={{
                marginTop: 32, padding: 20, borderRadius: 'var(--radius-md)',
                background: '#fef2f2', border: '1px solid #fecaca'
              }}>
                <h4 style={{ color: '#dc2626', margin: '0 0 6px 0', fontSize: 14, fontWeight: 600 }}>Danger Zone</h4>
                <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 14, lineHeight: 1.5 }}>
                  Deleting a workspace is permanent. All boards inside will be lost.
                </p>
                <button className="btn btn-danger" onClick={handleDeleteWorkspace}>Delete Workspace</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
