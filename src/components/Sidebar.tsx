import { useLocation, useNavigate } from 'react-router';
import {
  Home,
  List,
  PieChart,
  Tag,
  Wallet,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { PreloadLink } from './PreloadLink';
import { useAuth } from '../context/AuthContext';
import { useEmoji } from '../context/EmojiContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { emoji } = useEmoji();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const allNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/transactions', icon: List, label: 'Transactions' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/accounts', icon: Wallet, label: 'Accounts' },
    { path: '/dashboard/categories', icon: Tag, label: 'Categories' },
    { path: '/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
    
    { path: '/dashboard/admin', icon: Shield, label: 'Admin', adminOnly: true },
  ];

  // Filter nav items based on user role - only show Admin to admins
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#09090B] border-r border-black/10 dark:border-white/10 flex flex-col overflow-hidden relative">
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 z-40 w-6 h-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 transition-all"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Logo */}
      <div className="h-[88.8px] flex items-center gap-3 px-6 border-b border-black/10 dark:border-white/10 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 flex-shrink-0">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white whitespace-nowrap overflow-hidden">
              FinanEase
            </h1>
            <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">v1.0</p>
          </div>
        )}
      </div>

      {/* Navigation - Scrollable if needed */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <PreloadLink
              key={item.path}
              to={item.path}
              preloadDelay={50}
              className={`mx-3 mb-2 h-11 px-3 rounded-[10px] flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-[#ECECF0] dark:bg-[#27272A]'
                  : 'hover:bg-[#F9FAFB] dark:hover:bg-[#18181B]'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive
                    ? 'text-[#8B5CF6] dark:text-[#A78BFA]'
                    : 'text-[#717182] dark:text-[#A1A1AA]'
                }`}
              />
              {!isCollapsed && (
                <span
                  className={`text-base whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'text-[#0A0A0A] dark:text-[#E4E4E7]'
                      : 'text-[#717182] dark:text-[#A1A1AA]'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </PreloadLink>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="border-t border-black/10 dark:border-white/10 p-3 flex-shrink-0">
        {!isCollapsed ? (
          <>
            <div className="h-[52px] mb-2 flex items-center gap-3 px-3">
              <div className="w-9 h-9 bg-[#ECECF0] dark:bg-gradient-to-br dark:from-[#6366F1] dark:to-[#8B5CF6] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-5 text-[#0A0A0A] dark:text-white whitespace-nowrap overflow-hidden">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs leading-4 text-[#717182] dark:text-[#A1A1AA] truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full h-11 px-3 rounded-[10px] flex items-center gap-3 hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
            >
              <LogOut className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
              <span className="text-base text-[#717182] dark:text-[#A1A1AA]">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <div className="h-[52px] mb-2 flex items-center justify-center px-3">
              <div className="w-9 h-9 bg-[#ECECF0] dark:bg-gradient-to-br dark:from-[#6366F1] dark:to-[#8B5CF6] rounded-full flex items-center justify-center">
                <span className="text-xl">{emoji}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full h-11 px-3 rounded-[10px] flex items-center justify-center hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
            </button>
          </>
        )}
      </div>

      {/* Sign Out Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-md w-full shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">Sign Out</h3>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
