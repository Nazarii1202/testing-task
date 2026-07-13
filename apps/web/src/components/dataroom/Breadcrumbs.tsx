import { Link } from 'react-router-dom'
import type { Breadcrumb } from '../../types/dataroom'

type BreadcrumbsProps = {
  dataRoomId: string
  items: Breadcrumb[]
}

export function Breadcrumbs({ dataRoomId, items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const href =
          item.id === null
            ? `/data-rooms/${dataRoomId}`
            : `/data-rooms/${dataRoomId}/folders/${item.id}`

        return (
          <div key={`${item.id ?? 'root'}-${item.name}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-neutral-400">/</span> : null}
            {isLast ? (
              <span className="font-medium text-black">{item.name}</span>
            ) : (
              <Link to={href} className="text-neutral-500 underline-offset-2 hover:underline">
                {item.name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
