import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AppShellProps = {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function AppShell({ title, children, actions }: AppShellProps) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-svh bg-white text-black">
      <header className="border-b border-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.2em] text-neutral-500"
            >
              Acme Data Rooms
            </Link>
            <h1 className="truncate text-xl font-medium">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden text-right text-sm sm:block">
              <p className="text-black">{user?.username}</p>
              <p className="text-neutral-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="border border-black px-3 py-2 text-sm transition-colors hover:bg-black hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
