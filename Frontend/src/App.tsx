import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import HomeRedirect from './components/HomeRedirect'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import AdminReportDetailPage from './pages/AdminReportDetailPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminStatsPage from './pages/AdminStatsPage'
import EditReportPage from './pages/EditReportPage'
import LoginPage from './pages/LoginPage'
import NewReportPage from './pages/NewReportPage'
import RegisterPage from './pages/RegisterPage'
import ReportDetailPage from './pages/ReportDetailPage'
import ReportsPage from './pages/ReportsPage'

// Rrugët e aplikacionit: cila adresë shfaq cilën faqe.
function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Faqe publike */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/regjistrohu" element={<RegisterPage />} />

        {/* Faqet e qytetarit: ProtectedRoute kontrollon sesionin dhe rolin, AppLayout shton menynë lart */}
        <Route element={<ProtectedRoute role="Citizen" />}>
          <Route element={<AppLayout />}>
            <Route path="/raportet" element={<ReportsPage />} />
            {/* /raportet/i-ri fiton mbi /raportet/:id sepse është më specifike */}
            <Route path="/raportet/i-ri" element={<NewReportPage />} />
            <Route path="/raportet/:id" element={<ReportDetailPage />} />
            <Route path="/raportet/:id/ndrysho" element={<EditReportPage />} />
          </Route>
        </Route>

        {/* Faqet e adminit (komuna): vetëm roli Admin */}
        <Route element={<ProtectedRoute role="Admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/raportet" element={<AdminReportsPage />} />
            <Route path="/admin/raportet/:id" element={<AdminReportDetailPage />} />
          <Route path="/admin/statistika" element={<AdminStatsPage />} />
          </Route>
        </Route>

        {/* Çdo adresë tjetër të çon te faqja kryesore e rolit tënd (pa hyrje, te login) */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  )
}

export default App
