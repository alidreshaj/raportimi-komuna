import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import TopProgress from './components/TopProgress'
import AccountPage from './pages/AccountPage'
import AdminReportDetailPage from './pages/AdminReportDetailPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminStatsPage from './pages/AdminStatsPage'
import EditReportPage from './pages/EditReportPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NewReportPage from './pages/NewReportPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import ReportDetailPage from './pages/ReportDetailPage'
import ReportsPage from './pages/ReportsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Rrugët e aplikacionit: cila adresë shfaq cilën faqe.
function App() {
  return (
    <ErrorBoundary>
      <a href="#main" className="skip-link">
        Kalo te përmbajtja
      </a>
      <ScrollToTop />
      <TopProgress />
      <Routes>
        {/* Faqe publike */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/regjistrohu" element={<RegisterPage />} />
        <Route path="/harrova-fjalekalimin" element={<ForgotPasswordPage />} />
        <Route path="/rivendos-fjalekalimin" element={<ResetPasswordPage />} />

        {/* Llogaria ime: për çdo përdorues të loguar (qytetar ose admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/llogaria" element={<AccountPage />} />
          </Route>
        </Route>

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

        {/* Çdo adresë tjetër: faqja 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
