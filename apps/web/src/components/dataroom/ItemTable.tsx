import { Link } from 'react-router-dom'
import type { FileItem, FolderItem } from '../../types/dataroom'
import { formatDate, formatFileSize } from '../../lib/format'

type ItemActions = {
  onRenameFolder: (folder: FolderItem) => void
  onDeleteFolder: (folder: FolderItem) => void
  onRenameFile: (file: FileItem) => void
  onDeleteFile: (file: FileItem) => void
}

type ItemTableProps = {
  dataRoomId: string
  folders: FolderItem[]
  files: FileItem[]
  actions: ItemActions
}

export function ItemTable({
  dataRoomId,
  folders,
  files,
  actions,
}: ItemTableProps) {
  const hasItems = folders.length > 0 || files.length > 0

  if (!hasItems) {
    return null
  }

  return (
    <div className="overflow-hidden border border-black">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-black bg-neutral-50">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Modified</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr key={folder.id} className="border-b border-neutral-200 last:border-b-0">
              <td className="px-4 py-3">
                <Link
                  to={`/data-rooms/${dataRoomId}/folders/${folder.id}`}
                  className="font-medium hover:underline"
                >
                  {folder.name}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">Folder</td>
              <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                {formatDate(folder.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => actions.onRenameFolder(folder)}
                    className="text-sm underline-offset-2 hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.onDeleteFolder(folder)}
                    className="text-sm text-red-700 underline-offset-2 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {files.map((file) => (
            <tr key={file.id} className="border-b border-neutral-200 last:border-b-0">
              <td className="px-4 py-3">
                <Link
                  to={`/data-rooms/${dataRoomId}/files/${file.id}`}
                  className="font-medium hover:underline"
                >
                  {file.name}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                PDF · {formatFileSize(file.size)}
              </td>
              <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                {formatDate(file.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/data-rooms/${dataRoomId}/files/${file.id}`}
                    className="text-sm underline-offset-2 hover:underline"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => actions.onRenameFile(file)}
                    className="text-sm underline-offset-2 hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.onDeleteFile(file)}
                    className="text-sm text-red-700 underline-offset-2 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
