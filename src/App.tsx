import { Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import Auth from './pages/Auth'
import Dashboard from './pages/dashboard'
import BookAppointment from './pages/BookAppointment'
import QueueTracker from './pages/QueueTracker'
import GovtSchemes from './pages/Govtschemes'
import AIChat from './pages/Aichat'
import LiveQueueDetail from './pages/Livequeuedetail'
import { ThemeProvider } from './ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/queue" element={<QueueTracker />} />
        <Route path="/queue/:appointmentId" element={<LiveQueueDetail />} />
        <Route path="/schemes" element={<GovtSchemes />} />
        <Route path="/chat" element={<AIChat />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App