export default function Pagination({ meta, onPage }) {
  if (!meta) {
    return null
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="button ghost small"
        disabled={meta.current_page <= 1}
        onClick={() => onPage(meta.current_page - 1)}
      >
        Previous
      </button>

      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>

      <button
        type="button"
        className="button ghost small"
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPage(meta.current_page + 1)}
      >
        Next
      </button>
    </div>
  )
}
