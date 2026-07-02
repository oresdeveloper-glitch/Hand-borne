import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  Settings,
  LayoutDashboard,
  Upload,
  History,
  Bell,
  Shield,
  ChevronDown,
  Search,
  Moon,
  Sun,
  HelpCircle,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../store/appStore';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, isDarkMode, toggleDarkMode } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && user) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsNotifOpen(false);
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const publicNavLinks = [
    { name: 'Home', path: '/', exact: true },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const authenticatedNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Scan', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top announcement bar - shown for new features/promotions */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white text-xs py-2 text-center hidden md:block relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-40"></div>
          <span className="inline-flex items-center space-x-2 relative z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">New:</span>
            <span>Grad-CAM heatmap visualization now available for all scans</span>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-1 ml-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-0.5 rounded-full font-semibold transition-colors"
            >
              <span>Try now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </span>
        </div>
      )}

      {/* Main Navbar - Premium Glass Effect */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo - Premium Medical Branding */}
              <Link to="/" className="flex items-center space-x-2.5 group relative">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20"
                  >
                    <Activity className="text-white w-5 h-5" strokeWidth={2.5} />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent"></div>
                  </motion.div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                  </div>
                </div>
                  <div className="hidden sm:block">
                  <div className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">HBA</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight tracking-[0.15em] uppercase flex items-center space-x-1">
                    <span className="w-1 h-1 bg-teal-500 rounded-full"></span>
                    <span>Hand Bone AI</span>
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation - Professional Links */}
              <nav className="hidden lg:flex items-center space-x-0.5">
                {(user ? authenticatedNavLinks : publicNavLinks).map((link) => {
                  const active = isActive(link.path, 'exact' in link && link.exact);
                  const Icon = 'icon' in link ? link.icon : null;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`relative px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 flex items-center space-x-1.5 group ${
                        active
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {Icon && (
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                      )}
                      <span>{link.name}</span>
                      
                      {/* Active indicator - animated dot */}
                      {active && (
                        <motion.div
                          layoutId="active-nav-dot"
                          className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover underline effect */}
                      {!active && (
                        <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-slate-900 dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              {/* Search (authenticated only) */}
              {user && (
                <div className="hidden md:block relative">
                  <div
                    className={`flex items-center transition-all duration-200 ${
                      isSearchFocused ? 'w-72' : 'w-56'
                    }`}
                  >
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder="Search scans..."
                        className="w-full pl-9 pr-14 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400"
                      />
                      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </div>
              )}

              {/* New Scan CTA (authenticated) */}
              {user && (
                <Link
                  to="/upload"
                  className="hidden md:inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Upload className="w-4 h-4" />
                  <span>New Scan</span>
                </Link>
              )}

              {/* Dark Mode Toggle - Premium Design */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all group overflow-hidden"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDarkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: -20, opacity: 0, rotate: 90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <Moon className="w-5 h-5 text-slate-700 group-hover:text-blue-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                              </p>
                            </div>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => {
                                  notifications.forEach((n) => markNotificationRead(n.id));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-slate-500">
                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">No notifications</p>
                                <p className="text-xs mt-1">We'll notify you of important updates</p>
                              </div>
                            ) : (
                              notifications.slice(0, 8).map((notif) => (
                                <button
                                  key={notif.id}
                                  onClick={() => markNotificationRead(notif.id)}
                                  className={`w-full p-4 text-left border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                                    !notif.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                        notif.type === 'success'
                                          ? 'bg-green-500'
                                          : notif.type === 'error'
                                          ? 'bg-red-500'
                                          : notif.type === 'warning'
                                          ? 'bg-yellow-500'
                                          : 'bg-blue-500'
                                      }`}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {notif.title}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                        {notif.message}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-1.5">
                                        {new Date(notif.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                              <button className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                View all notifications
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="hidden md:block text-left pr-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight flex items-center space-x-1">
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          <span className="capitalize">{user.role}</span>
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="p-4 bg-gradient-to-br from-blue-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="relative">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg font-bold ring-2 ring-white/30">
                                  {getUserInitials(user.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{user.name}</p>
                                  <p className="text-xs text-blue-100 truncate">{user.email}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center space-x-2">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-md text-[10px] font-semibold uppercase tracking-wide">
                                  {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                  <span>{user.role}</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-500/80 backdrop-blur-sm rounded-md text-[10px] font-semibold">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <span>Online</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              to="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/history"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                              <History className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              <span>Scan History</span>
                            </Link>
                            <Link
                              to="/upload"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                              <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              <span>Upload New Scan</span>
                            </Link>
                            <button
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                              <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              <span>Settings</span>
                            </button>
                            {user.role === 'admin' && (
                              <Link
                                to="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                              >
                                <Shield className="w-4 h-4 text-purple-500" />
                                <span>Admin Panel</span>
                                <span className="ml-auto px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded uppercase tracking-wide">
                                  Pro
                                </span>
                              </Link>
                            )}
                          </div>

                          {/* Divider + Help */}
                          <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                            <Link
                              to="/contact"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              <span>Help & Support</span>
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Get Started</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-1">
                {/* User info (if authenticated) */}
                {user && (
                  <div className="flex items-center space-x-3 p-3 mb-2 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold">
                      {getUserInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-blue-100 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Navigation links */}
                {(user ? authenticatedNavLinks : publicNavLinks).map((link) => {
                  const Icon = 'icon' in link ? link.icon : null;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive(link.path, 'exact' in link && link.exact)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                {/* Admin link */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Auth actions */}
                {user ? (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 space-y-2">
                    <Link
                      to="/login"
                      className="block text-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
