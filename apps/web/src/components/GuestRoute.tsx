import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type GuestRouteProps = {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-white text-sm text-neutral-500">
        Loading...
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
