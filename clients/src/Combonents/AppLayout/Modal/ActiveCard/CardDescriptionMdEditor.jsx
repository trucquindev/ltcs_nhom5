import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

function CardDescriptionMdEditor({ cardDescriptionProp, handleUpdateCardDescription }) {
  const [editMode, setEditMode] = useState(false)
  const [cardDescription, setCardDescription] = useState(cardDescriptionProp)

  const save = () => {
    setEditMode(false)
    handleUpdateCardDescription(cardDescription)
  }

  return (
    <div style={{ marginTop: 8 }}>
      {editMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div data-color-mode="dark">
            <MDEditor
              value={cardDescription}
              onChange={setCardDescription}
              previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
              height={300}
              preview="edit"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm interceptor-loading" onClick={save}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => setEditMode(true)}>
            ✏ Edit
          </button>
          <div data-color-mode="dark">
            <MDEditor.Markdown
              source={cardDescription || '*No description yet.*'}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 8, fontSize: 13 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CardDescriptionMdEditor
