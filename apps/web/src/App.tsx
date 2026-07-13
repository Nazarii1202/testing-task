import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { DataRoomBrowserPage } from './pages/DataRoomBrowserPage'
import { DataRoomListPage } from './pages/DataRoomListPage'
import { FileViewerPage } from './pages/FileViewerPage'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DataRoomListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-rooms/:dataRoomId"
            element={
              <ProtectedRoute>
                <DataRoomBrowserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-rooms/:dataRoomId/folders/:folderId"
            element={
              <ProtectedRoute>
                <FolderRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-rooms/:dataRoomId/files/:fileId"
            element={
              <ProtectedRoute>
                <FileViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <GuestRoute>
                <SignIn />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignUp />
              </GuestRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function FolderRoute() {
  const { folderId } = useParams()
  return <DataRoomBrowserPage folderId={folderId} />
}

export default App
