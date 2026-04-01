import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import StockMovement from "./pages/StockMovement";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import Alerts from "./pages/Alerts";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#FFFFFE] text-[#0E514F]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64 overflow-y-auto">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="stock" element={<StockMovement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="logout" element={<Logout />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const { token, loading } = useAuth();

  // While validating stored token on mount, show nothing (avoids flash)
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
