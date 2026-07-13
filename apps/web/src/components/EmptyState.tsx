type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-neutral-300 px-6 py-12 text-center">
      <h2 className="text-lg font-medium text-black">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
