import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import ArchivedTickets from './pages/ArchivedTickets';
import Attendees from './pages/Attendees';
import AdminManagement from './pages/AdminManagement';
import Onboarding from './pages/Onboarding';
import Bills from './pages/Bills';
import Notes from './pages/Notes';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';
import CommandPalette from './components/CommandPalette';
import { NotificationProvider } from './context/NotificationContext';

interface AppProps {
  websocket: WebSocket;
}

function App({ websocket }: AppProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <BrowserRouter>
      <NotificationProvider websocket={websocket}>
        <ScrollToTop />
        <Toaster position="top-right" />
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
        <Routes>
          <Route path="/mgmt" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
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
            path="/archived-tickets"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ArchivedTickets />
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
            path="/bills"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Bills />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Notes />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Notifications />
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
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;