import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type NameFormValues = {
  name: string
}

type NameDialogProps = {
  title: string
  label: string
  defaultValue?: string
  submitLabel: string
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (name: string) => Promise<void>
}

export function NameDialog({
  title,
  label,
  defaultValue = '',
  submitLabel,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: NameDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NameFormValues>({
    defaultValues: { name: defaultValue },
  })

  useEffect(() => {
    reset({ name: defaultValue })
  }, [defaultValue, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values.name.trim())
        })}
        className="w-full max-w-md border border-black bg-white p-6"
      >
        <h2 className="text-lg font-medium">{title}</h2>

        <div className="mt-4">
          <label htmlFor="name" className="mb-1.5 block text-sm">
            {label}
          </label>
          <input
            id="name"
            className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            aria-invalid={Boolean(errors.name)}
            {...register('name', {
              required: `${label} is required`,
              minLength: {
                value: 1,
                message: `${label} is required`,
              },
              maxLength: {
                value: 120,
                message: `${label} must be 120 characters or fewer`,
              },
            })}
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

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
            type="submit"
            disabled={isSubmitting}
            className="border border-black bg-black px-3 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
