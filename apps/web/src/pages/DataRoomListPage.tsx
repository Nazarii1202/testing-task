import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { NameDialog } from '../components/NameDialog'
import { ApiRequestError } from '../lib/api'
import { getAccessToken } from '../lib/auth-storage'
import { dataRoomApi } from '../lib/dataroom-api'
import { formatDate } from '../lib/format'
import type { DataRoomSummary } from '../types/dataroom'

export function DataRoomListPage() {
  const [dataRooms, setDataRooms] = useState<DataRoomSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadDataRooms = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rooms = await dataRoomApi.list(token)
      setDataRooms(rooms)
    } catch (loadError) {
      setError(
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Failed to load data rooms',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDataRooms()
  }, [loadDataRooms])

  async function handleCreate(name: string) {
    const token = getAccessToken()
    if (!token) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await dataRoomApi.create(token, { name })
      setDataRooms((current) => [created, ...current])
      setIsCreateOpen(false)
    } catch (createError) {
      setError(
        createError instanceof ApiRequestError
          ? createError.message
          : 'Failed to create data room',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell
      title="Data Rooms"
      actions={
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="border border-black bg-black px-3 py-2 text-sm text-white hover:bg-white hover:text-black"
        >
          New data room
        </button>
      }
    >
      <div className="space-y-4">
        {error ? <ErrorBanner message={error} /> : null}

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading data rooms...</p>
        ) : dataRooms.length === 0 ? (
          <EmptyState
            title="No data rooms yet"
            description="Create your first virtual data room to organize due diligence documents."
            action={
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
              >
                Create data room
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataRooms.map((room) => (
              <Link
                key={room.id}
                to={`/data-rooms/${room.id}`}
                className="border border-black p-5 transition-colors hover:bg-neutral-50"
              >
                <h2 className="text-lg font-medium">{room.name}</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Updated {formatDate(room.updatedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isCreateOpen ? (
        <NameDialog
          title="Create data room"
          label="Data room name"
          submitLabel="Create"
          isSubmitting={isSubmitting}
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}
    </AppShell>
  )
}
