import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, LogOut, Menu, X, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';
import { whoami } from '../services/api';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ isSuperAdmin: boolean } | null>(null);

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
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300 ${
        location.pathname === to ? 'bg-zinc-800 text-white' : ''
      }`}
    >
      <Icon className="w-5 h-5 min-w-[20px]" />
      <span className={`transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-black scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="lg:hidden fixed top-0 right-0 left-0 z-20 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-red-600">TedX Admin</h1>
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
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="hidden lg:flex h-16 items-center justify-between px-4">
          <h1 className={`text-xl font-bold text-red-600 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
            TedX Admin
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-zinc-800/50"
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
            <NavLink to="/attendees" icon={Users} label="Attendees" />
            {user?.isSuperAdmin && (
              <NavLink to="/admin-management" icon={UserPlus} label="Admin Management" />
            )}
          </nav>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300`}
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            <span className={`transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          pt-[4rem] lg:pt-0
        `}
      >
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;