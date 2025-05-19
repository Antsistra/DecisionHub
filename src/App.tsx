import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import AlternatifPage from "./pages/AlternatifPage";
import ProtectedRoute from "./components/ProtectedRoute";
import KriteriaPage from "./pages/KriteriaPage";
import SubKriteriaPage from "./pages/SubKriteriaPage";
import ProjectDashboard from "./pages/ProjectDashboard";
import PenilaianPage from "./pages/PenilaianPage";
import HasilPerhitungan from "./pages/HasilPerhitunganPage";
import AuthRedirect from "./components/AuthRedirect";
import WeightedKriteria from "./pages/WeightedKriteria";
import WeightedPembobotanPage from "./pages/WeightedPembobotanPage";
import PenilaianAlternatifPage from "./pages/PenilaianAlternatifPage";
import HasilPerhitunganWp from "./pages/HasilPerhitunganWp";
import ProjectLayout from "./pages/ProjectLayout";
import AccountSettings from "./pages/AccountSettings";
import ErrorPage from "./pages/ErrorPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        ),
      },
      {
        path: "/register",
        element: (
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        ),
      },
    ],
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/account-settings",
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects/:projectId",
        element: (
          <ProtectedRoute>
            <ProjectLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <ProjectDashboard />,
          },

          {
            path: "profile-matching/alternatif",
            element: <AlternatifPage />,
          },

          {
            path: "profile-matching/kriteria",
            element: <KriteriaPage />,
          },
          {
            path: "profile-matching/kriteria/sub",
            element: <SubKriteriaPage />,
          },
          {
            path: "profile-matching/penilaian",
            element: <PenilaianPage />,
          },
          {
            path: "profile-matching/hasil-perhitungan",
            element: <HasilPerhitungan />,
          },
          {
            path: "weighted-product/alternatif",
            element: <AlternatifPage />,
          },
          {
            path: "weighted-product/kriteria",
            element: <WeightedKriteria />,
          },
          {
            path: "weighted-product/pembobotan-kriteria",
            element: <WeightedPembobotanPage />,
          },
          {
            path: "weighted-product/penilaian-alternatif",
            element: <PenilaianAlternatifPage />,
          },
          {
            path: "weighted-product/hasil-perhitungan",
            element: <HasilPerhitunganWp />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

function App() {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster position="top-right" richColors />
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}

export default App;
