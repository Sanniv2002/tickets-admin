import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import Attendees from './pages/Attendees';
import AdminManagement from './pages/AdminManagement';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/mgmt" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TicketList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendees"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Attendees />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-management"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App