type ErrorBannerProps = {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  )
}
