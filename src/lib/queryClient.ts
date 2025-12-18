import { QueryClient } from '@tanstack/react-query';
import { 
  dashboardAPI, 
  transactionsAPI, 
  budgetsAPI, 
  categoriesAPI, 
  accountsAPI, 
  adminAPI 
} from './api';

/**
 * React Query Client Configuration
 * 
 * Optimized for maximum performance:
 * - staleTime: How long data is considered fresh (won't refetch)
 * - gcTime (formerly cacheTime): How long to keep data in cache after unmount
 * - refetchOnWindowFocus: Disabled for better UX
 * - retry: Limited retries to prevent excessive requests
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 30 seconds - reduces unnecessary refetches
      staleTime: 30 * 1000,
      
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 10 * 60 * 1000,
      
      // Only refetch on focus if data is stale
      refetchOnWindowFocus: false,
      
      // Refetch when reconnecting to get latest data
      refetchOnReconnect: true,
      
      // Don't always refetch on mount - use cached data if fresh
      refetchOnMount: false,
      
      // Limit retries to reduce server load
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Keep previous data while fetching new data (prevents loading flash)
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query key factory for type-safe and consistent cache keys
 */
export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentTransactions: (limit?: number) => 
      [...queryKeys.dashboard.all, 'recent-transactions', { limit }] as const,
    monthlyAnalytics: (months?: number) => 
      [...queryKeys.dashboard.all, 'monthly-analytics', { months }] as const,
    budgetProgress: () => [...queryKeys.dashboard.all, 'budget-progress'] as const,
  },
  
  // Transactions
  transactions: {
    all: ['transactions'] as const,
    list: (params?: Record<string, unknown>) => 
      [...queryKeys.transactions.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.transactions.all, 'detail', id] as const,
  },
  
  // Budgets
  budgets: {
    all: ['budgets'] as const,
    list: () => [...queryKeys.budgets.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.budgets.all, 'detail', id] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    byType: (type: 'income' | 'expense') => 
      [...queryKeys.categories.all, 'by-type', type] as const,
    detail: (id: number) => [...queryKeys.categories.all, 'detail', id] as const,
  },
  
  // Accounts
  accounts: {
    all: ['accounts'] as const,
    list: () => [...queryKeys.accounts.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.accounts.all, 'detail', id] as const,
  },
  
  // User/Profile
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    users: (params?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'users', params] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    feedback: (params?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'feedback', params] as const,
    notifications: (params?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'notifications', params] as const,
  },
  
  // Notifications (user-side)
  notifications: {
    all: ['notifications'] as const,
    recent: (limit?: number) => 
      [...queryKeys.notifications.all, 'recent', { limit }] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
} as const;

/**
 * Invalidation helpers for mutations
 * Call these after create/update/delete operations
 * Uses refetchType: 'all' to ensure immediate refetch of all matching queries
 */
export const invalidateQueries = {
  // Invalidate all dashboard data
  dashboard: () => queryClient.invalidateQueries({ 
    queryKey: queryKeys.dashboard.all,
    refetchType: 'all',
  }),
  
  // Invalidate transactions and related data - this is critical for real-time updates
  transactions: () => {
    // Invalidate all transaction queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.transactions.all,
      refetchType: 'all',
    });
    // Invalidate all dashboard queries (stats, recent transactions, etc.)
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.all,
      refetchType: 'all',
    });
    // Invalidate accounts (balances change with transactions)
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.accounts.all,
      refetchType: 'all',
    });
    // Invalidate budgets (spending amounts change)
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.budgets.all,
      refetchType: 'all',
    });
  },
  
  // Invalidate budgets
  budgets: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.budgets.all,
      refetchType: 'all',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.budgetProgress(),
      refetchType: 'all',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.stats(),
      refetchType: 'all',
    });
  },
  
  // Invalidate categories
  categories: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.categories.all,
      refetchType: 'all',
    });
    // Also invalidate dashboard since category spending changes
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.stats(),
      refetchType: 'all',
    });
  },
  
  // Invalidate accounts
  accounts: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.accounts.all,
      refetchType: 'all',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.stats(),
      refetchType: 'all',
    });
  },
  
  // Invalidate admin data
  admin: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.admin.all,
      refetchType: 'all',
    });
  },
  
  // Invalidate notifications
  notifications: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.notifications.all,
      refetchType: 'all',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.admin.notifications(),
      refetchType: 'all',
    });
  },
  
  // Invalidate everything
  all: () => {
    queryClient.invalidateQueries({ refetchType: 'all' });
  },
};

/**
 * Clear all cache data - call on logout to prevent data leakage between users
 */
export const clearAllCache = () => {
  queryClient.clear();
};

/**
 * Prefetch helpers for route preloading
 * Call these on hover/focus to preload data before navigation
 */
export const prefetchQueries = {
  dashboard: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: () => dashboardAPI.getStats(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.recentTransactions(4),
        queryFn: () => dashboardAPI.getRecentTransactions(4),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.budgetProgress(),
        queryFn: () => dashboardAPI.getBudgetProgress(),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
  
  transactions: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.transactions.list({ page: 1, per_page: 15 }),
      queryFn: () => transactionsAPI.getAll({ page: 1, per_page: 15 }),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  budgets: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.budgets.list(),
      queryFn: () => budgetsAPI.getAll(),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  categories: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => categoriesAPI.getAll(),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  accounts: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.accounts.list(),
      queryFn: () => accountsAPI.getAll(),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  admin: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.admin.users(),
        queryFn: () => adminAPI.users.getAll(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.admin.feedback(),
        queryFn: () => adminAPI.feedback.getAll(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.admin.notifications(),
        queryFn: () => adminAPI.notifications.getAll(),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
};
