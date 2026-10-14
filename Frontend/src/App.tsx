import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ReportsPage from './pages/ReportsPage'

// Rrugët e aplikacionit: cila adresë shfaq cilën faqe.
function App() {
  return (
    <Routes>
      {/* Faqe publike */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/regjistrohu" element={<RegisterPage />} />

      {/* Faqe që kërkojnë hyrje: ProtectedRoute kontrollon sesionin, AppLayout shton menynë lart */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/raportet" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* Çdo adresë tjetër shkon te lista e raporteve (që, pa hyrje, të çon te login) */}
      <Route path="*" element={<Navigate to="/raportet" replace />} />
    </Routes>
  )
}

export default App
