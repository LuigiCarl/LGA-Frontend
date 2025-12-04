import { createBrowserRouter } from 'react-router';
import { Suspense } from 'react';
import { AdminRoute } from '../components/AdminRoute';

// Import lazy components with preload capability
import {
  LazyRootLayout,
  LazySignIn,
  LazyForgotPassword,
  LazyDashboard,
  LazyTransactions,
  LazyAddTransaction,
  LazyBudgets,
  LazyCategories,
  LazyAccounts,
  LazyProfile,
  LazyAdmin,
  LazyFeedback,
} from '../lib/routePreloader';

// Loading fallback component - optimized for fast render
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0A0A0A]">
    <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Wrapper component for lazy loaded routes with Suspense
const LazyComponent = ({
  Component,
}: {
  Component: React.LazyExoticComponent<React.ComponentType<unknown>>;
}) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyComponent Component={LazySignIn} />,
  },
  {
    path: '/forgot-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
  },
  {
    path: '/reset-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
  },
  {
    path: '/dashboard',
    element: <LazyComponent Component={LazyRootLayout} />,
    children: [
      { index: true, element: <LazyComponent Component={LazyDashboard} /> },
      { path: 'transactions', element: <LazyComponent Component={LazyTransactions} /> },
      { path: 'add', element: <LazyComponent Component={LazyAddTransaction} /> },
      { path: 'budgets', element: <LazyComponent Component={LazyBudgets} /> },
      { path: 'categories', element: <LazyComponent Component={LazyCategories} /> },
      { path: 'accounts', element: <LazyComponent Component={LazyAccounts} /> },
      { path: 'profile', element: <LazyComponent Component={LazyProfile} /> },
      { path: 'feedback', element: <LazyComponent Component={LazyFeedback} /> },
      { path: 'admin', element: <AdminRoute><LazyComponent Component={LazyAdmin} /></AdminRoute> },
    ],
  },
]);

// Export preload functions for external use
export { preloadRoute, preloadAllMainRoutes } from '../lib/routePreloader';
