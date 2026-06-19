import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { FIELD_REQUIRED_MESSAGE, singleFileValidator } from '~/untils/validators'

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { displayName: currentUser?.displayName }
  })

  const submitChangeGeneralInformation = (data) => {
    if (data.displayName === currentUser?.displayName) return
    toast.promise(dispatch(updateUserAPI({ displayName: data.displayName })), { pending: 'Updating...' })
      .then(res => { if (!res.error) toast.success('Updated successfully!') })
  }

  const uploadAvatar = (e) => {
    const error = singleFileValidator(e.target?.files[0])
    if (error) { toast.error(error); return }
    const reqData = new FormData()
    reqData.append('avatar', e.target.files[0])
    toast.promise(dispatch(updateUserAPI(reqData)), { pending: 'Uploading...' })
      .then(res => { if (!res.error) toast.success('Avatar updated!'); e.target.value = '' })
  }

  const initials = (name) => name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Account</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Manage your profile information</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28,
            backgroundImage: currentUser?.avatar ? `url(${currentUser.avatar})` : undefined,
            backgroundSize: 'cover' }}>
            {!currentUser?.avatar && initials(currentUser?.displayName)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{currentUser?.displayName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{currentUser?.username}</div>
          <label style={{ marginTop: 8, display: 'inline-block' }}>
            <span className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>📷 Upload avatar</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(submitChangeGeneralInformation)} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <div className="form-group">
          <label>Email</label>
          <input type="text" value={currentUser?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} readOnly />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={currentUser?.username} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} readOnly />
        </div>
        <div className="form-group">
          <label>Display Name</label>
          <input type="text" {...register('displayName', { required: FIELD_REQUIRED_MESSAGE })} />
          {errors.displayName && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.displayName.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary interceptor-loading" style={{ alignSelf: 'flex-start' }}>
          Save changes
        </button>
      </form>
    </div>
  )
}

export default AccountTab
