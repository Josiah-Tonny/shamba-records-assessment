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
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 ${!isSidebarOpen ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'hidden lg:flex'} bg-white border-r border-gray-200 flex-col transition-all duration-300`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg text-gray-900 whitespace-nowrap">
                  Shamba <span className="text-green-600">Records</span>
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 whitespace-nowrap">
                  {isAdmin ? 'Admin Portal' : 'Agent Portal'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
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
                className={`mb-1 group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${!isSidebarOpen ? 'justify-center mx-2' : 'mx-3'} ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300 ${active ? 'bg-green-100 text-green-600' : 'group-hover:bg-green-50 group-hover:text-green-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSidebarOpen && (
                  <span className={`whitespace-nowrap flex-1 font-semibold text-sm transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {item.label}
                  </span>
                )}
                {active && isSidebarOpen && (
                  <div className="w-1 h-4 rounded-full bg-green-600 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-sm ${!isSidebarOpen ? 'justify-center p-1' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-100 to-green-200 border-2 border-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mt-0.5">
                  {user?.role}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-2.5 mt-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 group transition-all duration-300 font-bold text-xs uppercase tracking-wider ${!isSidebarOpen ? 'justify-center' : 'px-4'}`}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-green-600 text-white items-center justify-center shadow-md hover:bg-green-700 transition-all duration-150 hover:scale-110 z-50"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 transition-all duration-150 px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-150 active:scale-95"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Breadcrumb / Title */}
            <h2 className="text-xl font-semibold text-gray-900 hidden sm:block">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-150 active:scale-95">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
