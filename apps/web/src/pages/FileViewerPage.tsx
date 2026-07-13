import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ErrorBanner } from '../components/ErrorBanner'
import { ApiRequestError } from '../lib/api'
import { getAccessToken } from '../lib/auth-storage'
import { dataRoomApi } from '../lib/dataroom-api'

export function FileViewerPage() {
  const { dataRoomId = '', fileId = '' } = useParams()
  const [fileName, setFileName] = useState('Document')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFile = useCallback(async () => {
    const token = getAccessToken()
    if (!token || !dataRoomId || !fileId) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { blob, fileName } = await dataRoomApi.getFile(token, dataRoomId, fileId)
      const objectUrl = URL.createObjectURL(blob)
      setFileUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current)
        }
        return objectUrl
      })
      setFileName(fileName ?? 'PDF document')
    } catch (loadError) {
      setError(
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Failed to load file',
      )
    } finally {
      setIsLoading(false)
    }
  }, [dataRoomId, fileId])

  useEffect(() => {
    void loadFile()
  }, [loadFile])

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileUrl])

  return (
    <AppShell
      title={fileName}
      actions={
        <Link
          to={`/data-rooms/${dataRoomId}`}
          className="border border-black px-3 py-2 text-sm hover:bg-neutral-100"
        >
          Back to data room
        </Link>
      }
    >
      <div className="space-y-4">
        {error ? <ErrorBanner message={error} /> : null}

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading PDF...</p>
        ) : fileUrl ? (
          <div className="overflow-hidden border border-black">
            <iframe
              title="PDF preview"
              src={fileUrl}
              className="h-[75svh] w-full bg-white"
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">File unavailable.</p>
        )}
      </div>
    </AppShell>
  )
}
