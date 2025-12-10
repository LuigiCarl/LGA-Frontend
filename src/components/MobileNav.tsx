import { Link, useLocation } from 'react-router';
import { Home, List, PieChart, Tag, Wallet, Menu } from 'lucide-react';

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const location = useLocation();

  // Core navigation items only - Profile, Feedback, Admin moved to mobile sidebar
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/transactions', icon: List, label: 'Transactions' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/categories', icon: Tag, label: 'Categories' },
    { path: '/dashboard/accounts', icon: Wallet, label: 'Accounts' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#09090B]/95 border-t border-black/10 dark:border-white/10 backdrop-blur-sm">
      <nav className="flex justify-around items-center h-[75.92px] px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-[14px] min-w-[48px] transition-colors ${
                isActive ? 'bg-[#ECECF0] dark:bg-[#27272A]' : ''
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive
                    ? 'text-[#8B5CF6] dark:text-[#A78BFA]'
                    : 'text-[#717182] dark:text-[#A1A1AA]'
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? 'text-[#0A0A0A] dark:text-white' : 'text-[#717182] dark:text-[#A1A1AA]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}        
        
        {/* More Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-[14px] min-w-[48px] transition-colors hover:bg-[#ECECF0] dark:hover:bg-[#27272A]"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-[#717182] dark:text-[#A1A1AA]" />
          <span className="text-xs text-[#717182] dark:text-[#A1A1AA]">More</span>
        </button>
      </nav>
    </div>
  );
}
