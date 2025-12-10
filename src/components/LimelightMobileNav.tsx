import { useLocation } from 'react-router';
import { Home, List, PieChart, Tag, Wallet, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PreloadLink } from './PreloadLink';

export function LimelightMobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/transactions', icon: List, label: 'Transactions' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/accounts', icon: Wallet, label: 'Accounts' },
    { path: '/dashboard/categories', icon: Tag, label: 'Categories' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <motion.div 
        className="mx-auto max-w-md bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-2 shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <nav className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <PreloadLink
                key={item.path}
                to={item.path}
                preloadDelay={50}
                className="relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </PreloadLink>
            );
          })}
          
          {/* Add Transaction Button */}
          <PreloadLink
            to="/dashboard/transactions/add"
            preloadDelay={50}
            className="relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors group"
          >
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Add
              </span>
            </div>
          </PreloadLink>
        </nav>
      </motion.div>
    </div>
  );
}
