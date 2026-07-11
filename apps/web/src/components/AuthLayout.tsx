import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-medium tracking-tight text-black">
          {title}
        </h1>
        {children}
        <div className="mt-6 text-sm text-neutral-500">{footer}</div>
      </div>
    </div>
  )
}
