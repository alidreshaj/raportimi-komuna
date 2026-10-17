import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import EditReportPage from './pages/EditReportPage'
import LoginPage from './pages/LoginPage'
import NewReportPage from './pages/NewReportPage'
import RegisterPage from './pages/RegisterPage'
import ReportDetailPage from './pages/ReportDetailPage'
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
          {/* /raportet/i-ri fiton mbi /raportet/:id sepse është më specifike */}
          <Route path="/raportet/i-ri" element={<NewReportPage />} />
          <Route path="/raportet/:id" element={<ReportDetailPage />} />
          <Route path="/raportet/:id/ndrysho" element={<EditReportPage />} />
        </Route>
      </Route>

      {/* Çdo adresë tjetër shkon te lista e raporteve (që, pa hyrje, të çon te login) */}
      <Route path="*" element={<Navigate to="/raportet" replace />} />
    </Routes>
  )
}

export default App
