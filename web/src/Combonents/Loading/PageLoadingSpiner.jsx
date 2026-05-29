const PageLoadingSpiner = ({ caption }) => (
  <div className="loading-page">
    <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    {caption && <span style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{caption}</span>}
  </div>
)

export default PageLoadingSpiner
