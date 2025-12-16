import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Route Preloader System
 * 
 * This module provides:
 * 1. Lazy loading with preload capability
 * 2. Route preloading on hover/focus
 * 3. Automatic data prefetching
 */

// Store for preloaded components
const preloadedComponents = new Set<string>();

// Store for component loaders
const componentLoaders: Map<string, () => Promise<{ default: ComponentType<unknown> }>> = new Map();

/**
 * Creates a lazy component with preload capability
 */
export function lazyWithPreload<T extends ComponentType<unknown>>(
  componentName: string,
  loader: () => Promise<{ default: T }>
): LazyExoticComponent<T> & { preload: () => Promise<void> } {
  // Store the loader for later use
  componentLoaders.set(componentName, loader as () => Promise<{ default: ComponentType<unknown> }>);
  
  const LazyComponent = lazy(loader) as LazyExoticComponent<T> & { preload: () => Promise<void> };
  
  // Add preload function to the lazy component
  LazyComponent.preload = async () => {
    if (!preloadedComponents.has(componentName)) {
      try {
        await loader();
        preloadedComponents.add(componentName);
      } catch (error) {
        console.warn(`Failed to preload ${componentName}:`, error);
      }
    }
  };
  
  return LazyComponent;
}

/**
 * Route configurations with preloading info
 */
export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<unknown>> & { preload?: () => Promise<void> };
  dataPrefetch?: () => Promise<void>;
}

// Import prefetch functions
import { prefetchQueries } from './queryClient';

/**
 * Lazy-loaded components with preload capability
 */
export const LazyRootLayout = lazyWithPreload(
  'RootLayout',
  () => import('../components/RootLayout').then((m) => ({ default: m.RootLayout }))
);

export const LazySignIn = lazyWithPreload(
  'SignIn',
  () => import('../components/SignIn').then((m) => ({ default: m.SignIn }))
);

export const LazyLandingPage = lazyWithPreload(
  'LandingPage',
  () => import('../components/LandingPage').then((m) => ({ default: m.LandingPage }))
);

export const LazyForgotPassword = lazyWithPreload(
  'ForgotPassword',
  () => import('../components/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
);

export const LazyDashboard = lazyWithPreload(
  'Dashboard',
  () => import('../components/Dashboard').then((m) => ({ default: m.Dashboard }))
);

export const LazyTransactions = lazyWithPreload(
  'Transactions',
  () => import('../components/Transactions').then((m) => ({ default: m.Transactions }))
);

// AddTransaction is a modal component, create a wrapper for route use
const AddTransactionPage = () => {
  // This is a placeholder - AddTransaction should be used as a modal in real use
  return null;
};
export const LazyAddTransaction = lazyWithPreload(
  'AddTransaction',
  () => Promise.resolve({ default: AddTransactionPage as ComponentType<unknown> })
);

export const LazyBudgets = lazyWithPreload(
  'Budgets',
  () => import('../components/Budgets').then((m) => ({ default: m.Budgets }))
);

export const LazyCategories = lazyWithPreload(
  'Categories',
  () => import('../components/Categories').then((m) => ({ default: m.Categories }))
);

export const LazyAccounts = lazyWithPreload(
  'Accounts',
  () => import('../components/Accounts').then((m) => ({ default: m.Accounts }))
);

export const LazyProfile = lazyWithPreload(
  'Profile',
  () => import('../components/Profile').then((m) => ({ default: m.Profile }))
);

export const LazyAdmin = lazyWithPreload(
  'Admin',
  () => import('../components/Admin').then((m) => ({ default: m.Admin }))
);

export const LazyFeedback = lazyWithPreload(
  'Feedback',
  () => import('../components/Feedback').then((m) => ({ default: m.Feedback }))
);

/**
 * Route configuration with data prefetch functions
 */
export const routeConfigs: Record<string, RouteConfig> = {
  '/dashboard': {
    path: '/dashboard',
    component: LazyDashboard,
    dataPrefetch: prefetchQueries.dashboard,
  },
  '/dashboard/transactions': {
    path: '/dashboard/transactions',
    component: LazyTransactions,
    dataPrefetch: prefetchQueries.transactions,
  },
  '/dashboard/budgets': {
    path: '/dashboard/budgets',
    component: LazyBudgets,
    dataPrefetch: prefetchQueries.budgets,
  },
  '/dashboard/categories': {
    path: '/dashboard/categories',
    component: LazyCategories,
    dataPrefetch: prefetchQueries.categories,
  },
  '/dashboard/accounts': {
    path: '/dashboard/accounts',
    component: LazyAccounts,
    dataPrefetch: prefetchQueries.accounts,
  },
  '/dashboard/admin': {
    path: '/dashboard/admin',
    component: LazyAdmin,
    dataPrefetch: prefetchQueries.admin,
  },
  '/dashboard/add': {
    path: '/dashboard/add',
    component: LazyAddTransaction,
    dataPrefetch: async () => {
      await Promise.all([
        prefetchQueries.categories(),
        prefetchQueries.accounts(),
      ]);
    },
  },
};

/**
 * Preload a route (component + data)
 */
export async function preloadRoute(path: string): Promise<void> {
  const config = routeConfigs[path];
  
  if (!config) return;
  
  // Preload component and data in parallel
  const promises: Promise<void>[] = [];
  
  if (config.component.preload) {
    promises.push(config.component.preload());
  }
  
  if (config.dataPrefetch) {
    promises.push(config.dataPrefetch());
  }
  
  await Promise.all(promises);
}

/**
 * Preload multiple routes
 */
export async function preloadRoutes(paths: string[]): Promise<void> {
  await Promise.all(paths.map(preloadRoute));
}

/**
 * Preload all main routes (call after login)
 */
export async function preloadAllMainRoutes(): Promise<void> {
  // Preload components in priority order
  const priorityRoutes = [
    '/dashboard',
    '/dashboard/transactions',
    '/dashboard/budgets',
  ];
  
  const secondaryRoutes = [
    '/dashboard/categories',
    '/dashboard/accounts',
    '/dashboard/add',
  ];
  
  // Load priority routes first
  await preloadRoutes(priorityRoutes);
  
  // Then load secondary routes in background
  preloadRoutes(secondaryRoutes);
}

/**
 * Check if a route is already preloaded
 */
export function isRoutePreloaded(path: string): boolean {
  const componentName = routeConfigs[path]?.component.toString();
  return componentName ? preloadedComponents.has(componentName) : false;
}
