import { useAuth } from '../context/AuthContext'

export function Home() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-4">
      <div className="w-full max-w-md border border-black p-6">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-black">
          Welcome
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          You are signed in as <span className="text-black">{user?.username}</span>
        </p>

        <dl className="mb-6 space-y-3 text-sm">
          <div>
            <dt className="text-neutral-500">Email</dt>
            <dd className="text-black">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">User ID</dt>
            <dd className="break-all text-black">{user?.id}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={signOut}
          className="w-full border border-black bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
