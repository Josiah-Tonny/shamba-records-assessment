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
      <aside className={`sidebar flex-shrink-0 ${!isSidebarOpen ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'hidden lg:flex'}`}>
        {/* Logo Section */}
        <div className="sidebar-header border-b border-light/50 bg-primary/50 backdrop-blur-md">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20 transition-all duration-300 hover:scale-110 active:scale-95">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden animate-fade-in">
                <h1 className="font-bold text-lg text-primary whitespace-nowrap tracking-tight leading-tight">
                  Shamba <span className="text-primary-600">Records</span>
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted whitespace-nowrap">
                  {isAdmin ? 'Admin Portal' : 'Agent Portal'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav py-6">
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
                className={`sidebar-nav-item mb-1 group ${active ? 'active bg-primary-50/80 text-primary-700 shadow-sm' : 'text-secondary hover:bg-earth-100/50'} ${!isSidebarOpen ? 'justify-center mx-2 px-0' : 'mx-3'} transition-all duration-300`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300 ${active ? 'bg-primary-100 text-primary-600' : 'group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSidebarOpen && (
                  <span className={`whitespace-nowrap flex-1 font-semibold text-sm transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {item.label}
                  </span>
                )}
                {active && isSidebarOpen && (
                  <div className="w-1 h-4 rounded-full bg-primary-600 ml-auto animate-scale-in" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer p-4 border-t border-light/50 bg-earth-50/30">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 hover:shadow-sm ${!isSidebarOpen ? 'justify-center p-1' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 border-2 border-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="font-bold text-sm text-primary truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted mt-0.5">
                  {user?.role}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-2.5 mt-3 rounded-xl text-secondary hover:bg-error-50 hover:text-error-600 group transition-all duration-300 font-bold text-xs uppercase tracking-widest ${!isSidebarOpen ? 'justify-center' : 'px-4'}`}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {isSidebarOpen && <span>Sign Out</span>}
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
