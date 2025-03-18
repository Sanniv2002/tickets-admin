import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, LogOut, Menu, X, ChevronLeft, ChevronRight, Users, UserPlus, Crown, Archive, Bell } from 'lucide-react';
import { logout, whoami } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ isSuperAdmin: boolean } | null>(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await whoami();
      setUser(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = async () => {
    await logout()
    window.location.href = '/mgmt';
  };

  const NavLink = ({ to, icon: Icon, label, showBadge = false }: { to: string; icon: any; label: string; showBadge?: boolean }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className="relative group"
      >
        <div
          className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-zinc-800 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Icon className={`w-5 h-5 min-w-[20px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            {showBadge && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          {isSidebarOpen && (
            <span className="whitespace-nowrap">{label}</span>
          )}
          {!isSidebarOpen && (
            <div className="fixed left-[4.5rem] px-2 py-1 bg-zinc-800 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
              {label}
            </div>
          )}
        </div>
        {isActive && (
          <div className="absolute inset-y-0 left-0 w-1 bg-red-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen bg-black ${user?.isSuperAdmin ? 'border-t-2 border-red-600/50' : ''}`}>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`lg:hidden fixed top-0 right-0 left-0 z-20 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80 ${
        user?.isSuperAdmin ? 'border-b border-red-600/30' : ''
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-red-600">TedX Admin</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-zinc-800/50"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full
          bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80
          border-r border-zinc-800/50
          transition-all duration-200
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${user?.isSuperAdmin ? 'border-r-2 border-red-600/30' : ''}
        `}
      >
        <div className="hidden lg:flex h-16 items-center justify-between px-4">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-red-600">TedX Admin</h1>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 text-gray-400 hover:text-white rounded-lg hover:bg-zinc-800/50 transition-transform ${!isSidebarOpen ? 'w-full flex justify-center' : ''}`}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className="lg:hidden flex h-16 items-center px-4">
          <h1 className="text-xl font-bold text-red-600">TedX Admin</h1>
        </div>

        <div className="px-3 py-4">
          <nav className="space-y-2">
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink to="/tickets" icon={Ticket} label="Tickets" />
            <NavLink to="/archived-tickets" icon={Archive} label="Archived Tickets" />
            <NavLink to="/attendees" icon={Users} label="Attendees" />
            <NavLink to="/notifications" icon={Bell} label="Notifications" showBadge />
            {user?.isSuperAdmin && (
              <NavLink to="/admin-management" icon={UserPlus} label="Admin Management" />
            )}
          </nav>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          {user?.isSuperAdmin && isSidebarOpen && (
            <div className="mb-2 px-4 py-2 bg-red-600/10 rounded-lg border border-red-600/20">
              <div className="flex items-center gap-2 text-red-500">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Super Admin</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {isSidebarOpen && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      <main
        className={`
          transition-all duration-200
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          pt-[4rem] lg:pt-0
          min-h-screen
          ${user?.isSuperAdmin ? 'bg-gradient-to-b from-red-950/5 to-transparent' : ''}
        `}
      >
        <div className="container mx-auto px-4 py-4 lg:p-8 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;