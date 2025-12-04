import { useLocation, useNavigate } from 'react-router';
import {
  User,
  LogOut,
  MessageSquare,
  Shield,
  X,
  Wallet,
  DollarSign,
  ChevronDown,
  Hash,
} from 'lucide-react';
import { useState } from 'react';
import { PreloadLink } from './PreloadLink';
import { useAuth } from '../context/AuthContext';
import { useEmoji } from '../context/EmojiContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { emoji } = useEmoji();
  const { currency, setCurrency, useCompactNumbers, setUseCompactNumbers } = useCurrency();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const menuItems = [
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
    { path: '/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
    ...(isAdmin ? [{ path: '/dashboard/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#09090B] z-50 lg:hidden transform transition-transform duration-300 ease-out flex flex-col shadow-2xl">
        {/* Header with Logo and Close Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0A0A0A] dark:text-white">FinanEase</h1>
              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-[10px] flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ECECF0] dark:bg-gradient-to-br dark:from-[#6366F1] dark:to-[#8B5CF6] rounded-full flex items-center justify-center">
              <span className="text-2xl">{emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-[#0A0A0A] dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA] truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-medium text-[#717182] dark:text-[#A1A1AA] uppercase tracking-wider">
            Settings
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <PreloadLink
                key={item.path}
                to={item.path}
                preloadDelay={50}
                onClick={handleNavClick}
                className={`mb-1 h-12 px-3 rounded-[10px] flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-[#ECECF0] dark:bg-[#27272A]'
                    : 'hover:bg-[#F9FAFB] dark:hover:bg-[#18181B]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-[#8B5CF6] dark:text-[#A78BFA]'
                      : 'text-[#717182] dark:text-[#A1A1AA]'
                  }`}
                />
                <span
                  className={`text-base ${
                    isActive
                      ? 'text-[#0A0A0A] dark:text-white font-medium'
                      : 'text-[#717182] dark:text-[#A1A1AA]'
                  }`}
                >
                  {item.label}
                </span>
              </PreloadLink>
            );
          })}

          {/* Currency & Display Settings */}
          <p className="px-3 mt-4 mb-2 text-xs font-medium text-[#717182] dark:text-[#A1A1AA] uppercase tracking-wider">
            Display
          </p>
          
          {/* Currency Selector */}
          <div className="mb-1 px-3">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="w-full h-12 rounded-[10px] flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
                <span className="text-base text-[#717182] dark:text-[#A1A1AA]">Currency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0A0A0A] dark:text-white font-medium">
                  {CURRENCIES[currency].symbol} {currency}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#717182] dark:text-[#A1A1AA] transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {/* Currency Dropdown */}
            {showCurrencyDropdown && (
              <div className="mt-1 bg-[#F9FAFB] dark:bg-[#18181B] rounded-[10px] p-2 max-h-48 overflow-y-auto">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full h-10 px-3 rounded-lg flex items-center justify-between transition-colors ${
                      currency === code
                        ? 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20'
                        : 'hover:bg-[#ECECF0] dark:hover:bg-[#27272A]'
                    }`}
                  >
                    <span className={`text-sm ${currency === code ? 'text-[#6366F1] dark:text-[#A78BFA] font-medium' : 'text-[#0A0A0A] dark:text-white'}`}>
                      {CURRENCIES[code].symbol} {code}
                    </span>
                    <span className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                      {CURRENCIES[code].name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Compact Numbers Toggle */}
          <div className="mb-1 h-12 px-3 rounded-[10px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
              <span className="text-base text-[#717182] dark:text-[#A1A1AA]">Compact Numbers</span>
            </div>
            <button
              onClick={() => setUseCompactNumbers(!useCompactNumbers)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                useCompactNumbers
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]'
                  : 'bg-[#D4D4D8] dark:bg-[#3F3F46]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  useCompactNumbers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="px-3 text-xs text-[#717182] dark:text-[#71717A] mb-2">
            Show 1K, 1M instead of 1,000, 1,000,000
          </p>
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-black/10 dark:border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full h-12 px-3 rounded-[10px] flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA] group-hover:text-red-500" />
            <span className="text-base text-[#717182] dark:text-[#A1A1AA] group-hover:text-red-500">
              Sign Out
            </span>
          </button>
        </div>

        {/* Version Footer */}
        <div className="px-4 py-3 border-t border-black/10 dark:border-white/10 bg-[#F9FAFB] dark:bg-[#0A0A0A]">
          <p className="text-xs text-[#717182] dark:text-[#71717A] text-center">
            FinanEase • Version 1.0
          </p>
        </div>
      </div>

      {/* Sign Out Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-sm w-full shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">Sign Out</h3>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="flex-1 h-11 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-[10px] text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 h-11 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 hover:shadow-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
