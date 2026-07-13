export type DataRoomSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type FolderItem = {
  id: string
  name: string
  parentFolderId: string | null
  createdAt: string
  updatedAt: string
}

export type FileItem = {
  id: string
  name: string
  mimeType: string
  size: number
  folderId: string | null
  createdAt: string
  updatedAt: string
}

export type Breadcrumb = {
  id: string | null
  name: string
}

export type DataRoomContents = {
  dataRoom: DataRoomSummary
  breadcrumbs: Breadcrumb[]
  folders: FolderItem[]
  files: FileItem[]
}

export type DataRoomItem =
  | { kind: 'folder'; item: FolderItem }
  | { kind: 'file'; item: FileItem }
