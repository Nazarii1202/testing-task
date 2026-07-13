import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { NameDialog } from '../components/NameDialog'
import { Breadcrumbs } from '../components/dataroom/Breadcrumbs'
import { ItemTable } from '../components/dataroom/ItemTable'
import { ApiRequestError } from '../lib/api'
import { getAccessToken } from '../lib/auth-storage'
import { dataRoomApi } from '../lib/dataroom-api'
import type { DataRoomContents, FileItem, FolderItem } from '../types/dataroom'

type DialogState =
  | { kind: 'create-folder' }
  | { kind: 'rename-folder'; folder: FolderItem }
  | { kind: 'delete-folder'; folder: FolderItem }
  | { kind: 'rename-file'; file: FileItem }
  | { kind: 'delete-file'; file: FileItem }
  | { kind: 'rename-room' }
  | { kind: 'delete-room' }
  | null

type DataRoomBrowserPageProps = {
  folderId?: string
}

export function DataRoomBrowserPage({ folderId }: DataRoomBrowserPageProps) {
  const { dataRoomId = '' } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [contents, setContents] = useState<DataRoomContents | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const loadContents = useCallback(async () => {
    const token = getAccessToken()
    if (!token || !dataRoomId) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const nextContents = await dataRoomApi.getContents(token, dataRoomId, folderId)
      setContents(nextContents)
    } catch (loadError) {
      setError(
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Failed to load folder contents',
      )
      setContents(null)
    } finally {
      setIsLoading(false)
    }
  }, [dataRoomId, folderId])

  useEffect(() => {
    void loadContents()
  }, [loadContents])

  async function runAction(action: () => Promise<void>) {
    setIsSubmitting(true)
    setError(null)

    try {
      await action()
      setDialog(null)
      await loadContents()
    } catch (actionError) {
      setError(
        actionError instanceof ApiRequestError
          ? actionError.message
          : 'Action failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpload(fileList: FileList | null) {
    const token = getAccessToken()
    if (!token || !dataRoomId || !fileList?.[0]) {
      return
    }

    const file = fileList[0]

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await dataRoomApi.uploadFile(token, dataRoomId, file, folderId)
      await loadContents()
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiRequestError
          ? uploadError.message
          : 'Failed to upload file',
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const title = contents?.dataRoom.name ?? 'Data Room'

  return (
    <AppShell
      title={title}
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDialog({ kind: 'create-folder' })}
            className="border border-black px-3 py-2 text-sm hover:bg-neutral-100"
          >
            New folder
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border border-black bg-black px-3 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-60"
          >
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {contents ? (
            <Breadcrumbs dataRoomId={dataRoomId} items={contents.breadcrumbs} />
          ) : (
            <Link to="/" className="text-sm text-neutral-500 hover:underline">
              Back to all data rooms
            </Link>
          )}

          {contents ? (
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => setDialog({ kind: 'rename-room' })}
                className="underline-offset-2 hover:underline"
              >
                Rename room
              </button>
              <button
                type="button"
                onClick={() => setDialog({ kind: 'delete-room' })}
                className="text-red-700 underline-offset-2 hover:underline"
              >
                Delete room
              </button>
            </div>
          ) : null}
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading contents...</p>
        ) : contents &&
          contents.folders.length === 0 &&
          contents.files.length === 0 ? (
          <EmptyState
            title="This folder is empty"
            description="Create a nested folder or upload a PDF to start building this data room."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDialog({ kind: 'create-folder' })}
                  className="border border-black px-4 py-2 text-sm hover:bg-neutral-100"
                >
                  Create folder
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
                >
                  Upload PDF
                </button>
              </div>
            }
          />
        ) : contents ? (
          <ItemTable
            dataRoomId={dataRoomId}
            folders={contents.folders}
            files={contents.files}
            actions={{
              onRenameFolder: (folder) =>
                setDialog({ kind: 'rename-folder', folder }),
              onDeleteFolder: (folder) =>
                setDialog({ kind: 'delete-folder', folder }),
              onRenameFile: (file) => setDialog({ kind: 'rename-file', file }),
              onDeleteFile: (file) => setDialog({ kind: 'delete-file', file }),
            }}
          />
        ) : null}
      </div>

      {dialog?.kind === 'create-folder' ? (
        <NameDialog
          title="Create folder"
          label="Folder name"
          submitLabel="Create"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onSubmit={(name) =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.createFolder(token, dataRoomId, {
                name,
                parentFolderId: folderId,
              })
            })
          }
        />
      ) : null}

      {dialog?.kind === 'rename-folder' ? (
        <NameDialog
          title="Rename folder"
          label="Folder name"
          defaultValue={dialog.folder.name}
          submitLabel="Save"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onSubmit={(name) =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.updateFolder(
                token,
                dataRoomId,
                dialog.folder.id,
                { name },
              )
            })
          }
        />
      ) : null}

      {dialog?.kind === 'rename-file' ? (
        <NameDialog
          title="Rename file"
          label="File name"
          defaultValue={dialog.file.name}
          submitLabel="Save"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onSubmit={(name) =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.updateFile(token, dataRoomId, dialog.file.id, {
                name,
              })
            })
          }
        />
      ) : null}

      {dialog?.kind === 'rename-room' && contents ? (
        <NameDialog
          title="Rename data room"
          label="Data room name"
          defaultValue={contents.dataRoom.name}
          submitLabel="Save"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onSubmit={(name) =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.update(token, dataRoomId, { name })
            })
          }
        />
      ) : null}

      {dialog?.kind === 'delete-folder' ? (
        <ConfirmDialog
          title="Delete folder"
          description={`Delete "${dialog.folder.name}" and everything inside it? This cannot be undone.`}
          confirmLabel="Delete folder"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.removeFolder(
                token,
                dataRoomId,
                dialog.folder.id,
              )
            })
          }
        />
      ) : null}

      {dialog?.kind === 'delete-file' ? (
        <ConfirmDialog
          title="Delete file"
          description={`Delete "${dialog.file.name}"? This cannot be undone.`}
          confirmLabel="Delete file"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.removeFile(token, dataRoomId, dialog.file.id)
            })
          }
        />
      ) : null}

      {dialog?.kind === 'delete-room' && contents ? (
        <ConfirmDialog
          title="Delete data room"
          description={`Delete "${contents.dataRoom.name}" and all nested folders and files? This cannot be undone.`}
          confirmLabel="Delete data room"
          isSubmitting={isSubmitting}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            runAction(async () => {
              const token = getAccessToken()
              if (!token) return
              await dataRoomApi.remove(token, dataRoomId)
              navigate('/')
            })
          }
        />
      ) : null}
    </AppShell>
  )
}
