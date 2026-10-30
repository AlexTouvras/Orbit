import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionList } from './pages/SessionList'
import { SessionGraph } from './pages/SessionGraph'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/sessions/:sessionId" element={<SessionGraph />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
