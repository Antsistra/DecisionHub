import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
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
const router = createBrowserRouter([
    {
        element: _jsx(AuthLayout, {}),
        children: [
            {
                path: "/login",
                element: (_jsx(AuthRedirect, { children: _jsx(LoginPage, {}) })),
            },
            {
                path: "/register",
                element: (_jsx(AuthRedirect, { children: _jsx(RegisterPage, {}) })),
            },
        ],
    },
    {
        element: _jsx(MainLayout, {}),
        children: [
            {
                path: "/",
                element: (_jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) })),
            },
            {
                path: "/account-settings",
                element: (_jsx(ProtectedRoute, { children: _jsx(AccountSettings, {}) })),
            },
            {
                path: "projects/:projectId",
                element: (_jsx(ProtectedRoute, { children: _jsx(ProjectLayout, {}) })),
                children: [
                    {
                        path: "",
                        element: _jsx(ProjectDashboard, {}),
                    },
                    {
                        path: "profile-matching/alternatif",
                        element: _jsx(AlternatifPage, {}),
                    },
                    {
                        path: "profile-matching/kriteria",
                        element: _jsx(KriteriaPage, {}),
                    },
                    {
                        path: "profile-matching/kriteria/sub",
                        element: _jsx(SubKriteriaPage, {}),
                    },
                    {
                        path: "profile-matching/penilaian",
                        element: _jsx(PenilaianPage, {}),
                    },
                    {
                        path: "profile-matching/hasil-perhitungan",
                        element: _jsx(HasilPerhitungan, {}),
                    },
                    {
                        path: "weighted-product/alternatif",
                        element: _jsx(AlternatifPage, {}),
                    },
                    {
                        path: "weighted-product/kriteria",
                        element: _jsx(WeightedKriteria, {}),
                    },
                    {
                        path: "weighted-product/pembobotan-kriteria",
                        element: _jsx(WeightedPembobotanPage, {}),
                    },
                    {
                        path: "weighted-product/penilaian-alternatif",
                        element: _jsx(PenilaianAlternatifPage, {}),
                    },
                    {
                        path: "weighted-product/hasil-perhitungan",
                        element: _jsx(HasilPerhitunganWp, {}),
                    },
                ],
            },
        ],
    },
]);
function App() {
    return (_jsxs(_Fragment, { children: [_jsx(Toaster, { position: "top-right", richColors: true }), _jsx(RouterProvider, { router: router })] }));
}
export default App;
