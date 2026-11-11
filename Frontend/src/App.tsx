import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import TopProgress from "./components/TopProgress";

// Çdo faqe ngarkohet vetëm kur hapet (code splitting): hyrja nuk shkarkon hartat dhe grafikët që nuk i duhen.
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AdminReportDetailPage = lazy(
  () => import("./pages/AdminReportDetailPage"),
);
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const AdminStatsPage = lazy(() => import("./pages/AdminStatsPage"));
const EditReportPage = lazy(() => import("./pages/EditReportPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NewReportPage = lazy(() => import("./pages/NewReportPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ReportDetailPage = lazy(() => import("./pages/ReportDetailPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

// Rrugët e aplikacionit: cila adresë shfaq cilën faqe.
function App() {
  return (
    <ErrorBoundary>
      <a href="#main" className="skip-link">
        Kalo te përmbajtja
      </a>
      <ScrollToTop />
      <TopProgress />
      <Suspense
        fallback={
          <p className="page-loading" role="status">
            Po ngarkohet...
          </p>
        }
      >
        <Routes>
          {/* Faqe publike */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/regjistrohu" element={<RegisterPage />} />
          <Route
            path="/harrova-fjalekalimin"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/rivendos-fjalekalimin"
            element={<ResetPasswordPage />}
          />

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
              <Route
                path="/raportet/:id/ndrysho"
                element={<EditReportPage />}
              />
            </Route>
          </Route>

          {/* Faqet e adminit (komuna): vetëm roli Admin */}
          <Route element={<ProtectedRoute role="Admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/raportet" element={<AdminReportsPage />} />
              <Route
                path="/admin/raportet/:id"
                element={<AdminReportDetailPage />}
              />
              <Route path="/admin/statistika" element={<AdminStatsPage />} />
            </Route>
          </Route>

          {/* Çdo adresë tjetër: faqja 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
