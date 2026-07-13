import type {
  DataRoomContents,
  DataRoomSummary,
  FileItem,
  FolderItem,
} from '../types/dataroom'
import { request, requestBlob } from './api'

export const dataRoomApi = {
  list(token: string) {
    return request<DataRoomSummary[]>('/data-rooms', { token })
  },

  create(token: string, data: { name: string }) {
    return request<DataRoomSummary>('/data-rooms', {
      method: 'POST',
      token,
      body: data,
    })
  },

  update(token: string, dataRoomId: string, data: { name: string }) {
    return request<DataRoomSummary>(`/data-rooms/${dataRoomId}`, {
      method: 'PATCH',
      token,
      body: data,
    })
  },

  remove(token: string, dataRoomId: string) {
    return request<void>(`/data-rooms/${dataRoomId}`, {
      method: 'DELETE',
      token,
    })
  },

  getContents(token: string, dataRoomId: string, folderId?: string) {
    const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : ''
    return request<DataRoomContents>(`/data-rooms/${dataRoomId}/contents${query}`, {
      token,
    })
  },

  createFolder(
    token: string,
    dataRoomId: string,
    data: { name: string; parentFolderId?: string },
  ) {
    return request<FolderItem>(`/data-rooms/${dataRoomId}/folders`, {
      method: 'POST',
      token,
      body: data,
    })
  },

  updateFolder(
    token: string,
    dataRoomId: string,
    folderId: string,
    data: { name: string },
  ) {
    return request<FolderItem>(
      `/data-rooms/${dataRoomId}/folders/${folderId}`,
      {
        method: 'PATCH',
        token,
        body: data,
      },
    )
  },

  removeFolder(token: string, dataRoomId: string, folderId: string) {
    return request<void>(`/data-rooms/${dataRoomId}/folders/${folderId}`, {
      method: 'DELETE',
      token,
    })
  },

  uploadFile(
    token: string,
    dataRoomId: string,
    file: File,
    folderId?: string,
  ) {
    const formData = new FormData()
    formData.append('file', file)

    if (folderId) {
      formData.append('folderId', folderId)
    }

    return request<FileItem>(`/data-rooms/${dataRoomId}/files`, {
      method: 'POST',
      token,
      formData,
    })
  },

  getFile(token: string, dataRoomId: string, fileId: string) {
    return requestBlob(`/data-rooms/${dataRoomId}/files/${fileId}`, token)
  },

  updateFile(
    token: string,
    dataRoomId: string,
    fileId: string,
    data: { name: string },
  ) {
    return request<FileItem>(`/data-rooms/${dataRoomId}/files/${fileId}`, {
      method: 'PATCH',
      token,
      body: data,
    })
  },

  removeFile(token: string, dataRoomId: string, fileId: string) {
    return request<void>(`/data-rooms/${dataRoomId}/files/${fileId}`, {
      method: 'DELETE',
      token,
    })
  },
}
