import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Sprout
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/fields', label: 'All Fields', icon: MapPin },
    { path: '/admin/agents', label: 'Agents', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const agentNavItems = [
    { path: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agent/fields', label: 'My Fields', icon: MapPin },
    { path: '/agent/updates', label: 'Updates', icon: Sprout },
    { path: '/agent/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : agentNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar-layout relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar flex-shrink-0 ${!isSidebarOpen ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'hidden lg:flex'}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-fast hover:scale-105">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg text-primary whitespace-nowrap">
                  Shamba Records
                </h1>
                <p className="text-xs text-muted whitespace-nowrap">
                  {isAdmin ? 'Admin Portal' : 'Agent Portal'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-nav-item ${active ? 'active' : ''} ${!isSidebarOpen ? 'justify-center' : ''} transition-all duration-fast hover:translate-x-1`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0`} />
                {isSidebarOpen && (
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                )}
                {active && isSidebarOpen && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-fast hover:bg-earth-100 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted capitalize">
                  {user?.role}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-2 mt-2 rounded-lg text-secondary hover:bg-error-50 hover:text-error-600 transition-all duration-fast font-medium text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary-600 text-white items-center justify-center shadow-md hover:bg-primary-700 transition-all duration-fast hover:scale-110 z-50"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content relative z-10 bg-secondary overflow-hidden flex-1">
        {/* Top Header */}
        <header className="top-header sticky top-0 z-30 bg-primary/80 backdrop-blur-lg border-b border-light transition-all duration-fast">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-earth-100 transition-all duration-fast active:scale-95"
            >
              <Menu className="w-6 h-6 text-secondary" />
            </button>

            {/* Breadcrumb / Title */}
            <h2 className="text-xl font-semibold text-primary hidden sm:block">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-earth-100 transition-all duration-fast active:scale-95">
              <Bell className="w-5 h-5 text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content bg-[var(--bg-secondary)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
