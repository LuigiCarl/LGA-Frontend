import { createBrowserRouter } from 'react-router';
import { AdminRoute } from '../components/AdminRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ErrorPageRouter } from '../components/errors';
import { Error404, Error403, Error500, Error502 } from '../components/errors';
import { LazyComponent } from '../components/RouteComponents';

// Import lazy components with preload capability
import {
  LazyRootLayout,
  LazySignIn,
  LazyLandingPage,
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyComponent Component={LazyLandingPage} />,
    errorElement: <ErrorPageRouter />,
  },
  {
    path: '/signin',
    element: <LazyComponent Component={LazySignIn} />,
    errorElement: <ErrorPageRouter />,
  },
  {
    path: '/forgot-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
    errorElement: <ErrorPageRouter />,
  },
  {
    path: '/reset-password',
    element: <LazyComponent Component={LazyForgotPassword} />,
    errorElement: <ErrorPageRouter />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <LazyComponent Component={LazyRootLayout} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPageRouter />,
    children: [
      { index: true, element: <LazyComponent Component={LazyDashboard} />, errorElement: <ErrorPageRouter /> },
      { path: 'transactions', element: <LazyComponent Component={LazyTransactions} />, errorElement: <ErrorPageRouter /> },
      { path: 'add', element: <LazyComponent Component={LazyAddTransaction} />, errorElement: <ErrorPageRouter /> },
      { path: 'budgets', element: <LazyComponent Component={LazyBudgets} />, errorElement: <ErrorPageRouter /> },
      { path: 'categories', element: <LazyComponent Component={LazyCategories} />, errorElement: <ErrorPageRouter /> },
      { path: 'accounts', element: <LazyComponent Component={LazyAccounts} />, errorElement: <ErrorPageRouter /> },
      { path: 'profile', element: <LazyComponent Component={LazyProfile} />, errorElement: <ErrorPageRouter /> },
      { path: 'feedback', element: <LazyComponent Component={LazyFeedback} />, errorElement: <ErrorPageRouter /> },
      { path: 'admin', element: <AdminRoute><LazyComponent Component={LazyAdmin} /></AdminRoute>, errorElement: <ErrorPageRouter /> },
      { path: '*', element: <Error404 /> }, // Catch-all for invalid dashboard routes
    ],
  },
  // Direct routes for testing error pages
  {
    path: '/error/403',
    element: <Error403 />,
  },
  {
    path: '/error/404',
    element: <Error404 />,
  },
  {
    path: '/error/500',
    element: <Error500 />,
  },
  {
    path: '/error/502',
    element: <Error502 />,
  },
  {
    path: '*',
    element: <Error404 />,
    errorElement: <ErrorPageRouter />,
  },
]);

// Export preload functions for external use
export { preloadRoute, preloadAllMainRoutes } from '../lib/routePreloader';
