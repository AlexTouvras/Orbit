import type { BreadcrumbItem } from '../model/types'

type Props = {
  items: BreadcrumbItem[]
  onNavigate: (item: BreadcrumbItem) => void
}

export function Breadcrumbs({ items, onNavigate }: Props) {
  return (
    <nav className="ao-crumbs" aria-label="Hierarchy">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`} className="ao-crumbs__item">
            {i > 0 ? <span className="ao-crumbs__sep" aria-hidden>›</span> : null}
            {last ? (
              <span className="ao-crumbs__current">{item.label}</span>
            ) : (
              <button
                type="button"
                className="ao-crumbs__link"
                onClick={() => onNavigate(item)}
              >
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
