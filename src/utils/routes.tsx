import { createBrowserRouter } from 'react-router';
import { Suspense } from 'react';
import { AdminRoute } from '../components/AdminRoute';
import ErrorPage from '../components/ErrorPage';

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
    errorElement: <ErrorPage />,
  },
  {
    path: '/forgot-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/reset-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/dashboard',
    element: <LazyComponent Component={LazyRootLayout} />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LazyComponent Component={LazyDashboard} />, errorElement: <ErrorPage /> },
      { path: 'transactions', element: <LazyComponent Component={LazyTransactions} />, errorElement: <ErrorPage /> },
      { path: 'add', element: <LazyComponent Component={LazyAddTransaction} />, errorElement: <ErrorPage /> },
      { path: 'budgets', element: <LazyComponent Component={LazyBudgets} />, errorElement: <ErrorPage /> },
      { path: 'categories', element: <LazyComponent Component={LazyCategories} />, errorElement: <ErrorPage /> },
      { path: 'accounts', element: <LazyComponent Component={LazyAccounts} />, errorElement: <ErrorPage /> },
      { path: 'profile', element: <LazyComponent Component={LazyProfile} />, errorElement: <ErrorPage /> },
      { path: 'feedback', element: <LazyComponent Component={LazyFeedback} />, errorElement: <ErrorPage /> },
      { path: 'admin', element: <AdminRoute><LazyComponent Component={LazyAdmin} /></AdminRoute>, errorElement: <ErrorPage /> },
    ],
  },
  {
    path: '*',
    errorElement: <ErrorPage />,
  },
]);

// Export preload functions for external use
export { preloadRoute, preloadAllMainRoutes } from '../lib/routePreloader';
