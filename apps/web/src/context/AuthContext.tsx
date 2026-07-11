import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type User } from '../lib/api'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../lib/auth-storage'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const token = getAccessToken()

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const profile = await authApi.getProfile(token)
      setUser(profile)
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await authApi.signIn({ email, password })
    setAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      const response = await authApi.signUp({ username, email, password })
      setAccessToken(response.accessToken)
      setUser(response.user)
    },
    [],
  )

  const signOut = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
