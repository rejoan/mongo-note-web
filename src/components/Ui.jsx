export function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) {
    return null
  }

  return <div className="banner error">{message}</div>
}

export function Loading() {
  return <div className="muted">Loading…</div>
}

export function EmptyState({ children }) {
  return <div className="empty">{children}</div>
}
