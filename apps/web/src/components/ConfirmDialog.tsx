type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md border border-black bg-white p-6"
      >
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border border-black px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="border border-black bg-black px-3 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-60"
          >
            {isSubmitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
