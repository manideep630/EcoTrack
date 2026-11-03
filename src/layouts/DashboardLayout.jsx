import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, CheckSquare, Award, Gift, 
  Lightbulb, BookOpen, Users, Settings, LogOut, Bell, 
  Search, Menu, Leaf, X, CheckCircle2, Sparkles, BarChart3 
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Keep up your Eco-Streak!', desc: 'Log today\'s green habits to earn points.', time: 'Today', unread: true },
    { id: 2, title: 'New Community Challenge', desc: '7-Day Plastic-Free is now trending.', time: '1d ago', unread: true },
    { id: 3, title: 'Welcome to EcoTrack!', desc: 'Explore all features and begin your journey.', time: '2d ago', unread: false },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, logout, loaded } = useUser();
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (loaded && !user) {
      navigate('/login', { replace: true });
    }
  }, [loaded, user, navigate]);

  // Close notifications popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Carbon Footprint', path: '/dashboard/calculator', icon: Activity },
    { name: 'Daily Habits', path: '/dashboard/habits', icon: CheckSquare },
    { name: 'Eco-Challenges', path: '/dashboard/challenges', icon: Award },
    { name: 'Rewards', path: '/dashboard/rewards', icon: Gift },
    { name: 'Recommendations', path: '/dashboard/recommendations', icon: Lightbulb },
    { name: 'Learning Resources', path: '/dashboard/resources', icon: BookOpen },
    { name: 'Community', path: '/dashboard/community', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const displayName = user?.name || 'User';
  const initials = user?.initials || (displayName[0]?.toUpperCase() || 'U');

  const filteredNav = searchQuery.trim()
    ? navItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Don't render layout until loaded (avoids flash)
  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-eco-light">
        <div className="animate-spin h-8 w-8 border-4 border-eco-forest border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null; // redirect in progress

  return (
    <div className="flex h-screen bg-eco-light font-sans overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-eco-forest" />
            <span className="text-xl font-bold text-eco-forest tracking-tight">EcoTrack</span>
          </Link>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              // Exact match for /dashboard, prefix match for sub-routes
              const isActive = item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-eco-forest text-white shadow-md' 
                      : 'text-gray-600 hover:bg-eco-mint/20 hover:text-eco-forest'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10 relative">
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 flex justify-center md:justify-start md:ml-4 relative" ref={searchRef}>
            <div className="max-w-md w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search dashboard features..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-eco-mint focus:border-eco-mint sm:text-sm transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Quick search dropdown */}
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {filteredNav.length > 0 ? (
                    filteredNav.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-eco-mint/20 hover:text-eco-forest"
                      >
                        <item.icon className="w-4 h-4 mr-3 text-eco-forest" />
                        {item.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-gray-400">No matching section found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 relative" ref={notifRef}>
            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-12 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-slide-up">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                  <span className="font-bold text-sm text-eco-charcoal">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-eco-forest font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs ${n.unread ? 'bg-eco-mint/10' : 'bg-white'}`}>
                      <div className="flex justify-between font-bold text-gray-800 mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-gray-600">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 pt-2 border-t border-gray-100 text-center">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-eco-forest font-medium hover:underline"
                  >
                    Manage notification settings
                  </Link>
                </div>
              </div>
            )}

            <Link to="/dashboard/settings" className="flex items-center space-x-3 cursor-pointer group">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-700 group-hover:text-eco-forest transition-colors">{displayName}</div>
                <div className="text-xs text-eco-forest">Eco Member • {(userData?.rewardPoints || 0).toLocaleString()} pts</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-eco-forest flex items-center justify-center border-2 border-eco-mint shadow-sm">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
