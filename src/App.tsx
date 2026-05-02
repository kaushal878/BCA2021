import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudentListPage } from "./pages/StudentListPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { FileViewerPage } from "./pages/FileViewerPage";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/students" element={<StudentListPage />} />
      <Route path="/students/:slug" element={<StudentDetailPage />} />
      <Route
        path="/files/:id"
        element={
          <RequireAuth>
            <FileViewerPage />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Page not found.
          </div>
        }
      />
    </Routes>
  </Layout>
);

export default App;
