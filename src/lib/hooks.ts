import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  dashboardAPI, 
  transactionsAPI, 
  budgetsAPI, 
  categoriesAPI, 
  accountsAPI,
  Transaction,
  Budget,
  Category,
  Account,
} from './api';
import { queryKeys, invalidateQueries } from './queryClient';

/**
 * Custom hooks for data fetching with React Query
 * 
 * Benefits:
 * - Automatic caching (data persists across navigations)
 * - Background refetching (silent updates)
 * - Request deduplication (multiple components sharing same data)
 * - Optimistic updates (instant UI feedback)
 * - Automatic garbage collection
 */

// ============================================
// Dashboard Hooks
// ============================================

interface DashboardStatsParams {
  year?: number;
  month?: number;
}

export function useDashboardStats(params: DashboardStatsParams = {}) {
  const { year, month } = params;
  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), { year, month }],
    queryFn: () => dashboardAPI.getStats(year, month),
    staleTime: 0, // Always refetch on invalidation for instant updates
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
  });
}

export function useRecentTransactions(limit: number = 5, year?: number, month?: number) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.recentTransactions(limit), { year, month }],
    queryFn: () => dashboardAPI.getRecentTransactions(limit, year, month),
    staleTime: 0, // Always refetch on invalidation for instant updates
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useMonthlyAnalytics(months: number = 6) {
  return useQuery({
    queryKey: queryKeys.dashboard.monthlyAnalytics(months),
    queryFn: () => dashboardAPI.getMonthlyAnalytics(months),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes (analytics don't change often)
  });
}

export function useBudgetProgress() {
  return useQuery({
    queryKey: queryKeys.dashboard.budgetProgress(),
    queryFn: () => dashboardAPI.getBudgetProgress(),
    staleTime: 10 * 1000, // 10 seconds - budget progress changes with transactions
    refetchOnWindowFocus: true,
  });
}

// ============================================
// Transactions Hooks
// ============================================

interface TransactionListParams {
  page?: number;
  per_page?: number;
  type?: 'income' | 'expense' | 'all';
  category_id?: number;
  account_id?: number;
  [key: string]: unknown; // Index signature for compatibility
}

export function useTransactions(params: TransactionListParams = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: () => transactionsAPI.getAll(params),
    staleTime: 10 * 1000, // Fresh for 10 seconds - transactions need real-time updates
    refetchOnWindowFocus: true,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsAPI.create(data),
    onSuccess: () => {
      // Invalidate related queries
      invalidateQueries.transactions();
    },
    // Optimistic update example (optional)
    onMutate: async (_newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all });
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions.list({}));
      
      return { previousTransactions };
    },
    onError: (_err, _newTransaction, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKeys.transactions.list({}), context.previousTransactions);
      }
    },
  });
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => 
      transactionsAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.transactions();
    },
  });
}

export function useDeleteTransaction() {
  return useMutation({
    mutationFn: (id: number) => transactionsAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.transactions();
    },
  });
}

// ============================================
// Budgets Hooks
// ============================================

interface BudgetFilterParams {
  year?: number;
  month?: number;
}

export function useBudgets(params: BudgetFilterParams = {}) {
  const { year, month } = params;
  return useQuery({
    queryKey: [...queryKeys.budgets.list(), { year, month }],
    queryFn: () => budgetsAPI.getAll(year && month ? { year, month } : undefined),
    staleTime: 10 * 1000, // 10 seconds - budgets spending changes with transactions
    refetchOnWindowFocus: true,
  });
}

export function useCreateBudget() {
  return useMutation({
    mutationFn: (data: Partial<Budget>) => budgetsAPI.create(data),
    onSuccess: () => {
      invalidateQueries.budgets();
    },
  });
}

export function useUpdateBudget() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Budget> }) => 
      budgetsAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.budgets();
    },
  });
}

export function useDeleteBudget() {
  return useMutation({
    mutationFn: (id: number) => budgetsAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.budgets();
    },
  });
}

// ============================================
// Categories Hooks
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesAPI.getAll(),
    staleTime: 30 * 1000, // 30 seconds - categories can be created inline
    refetchOnWindowFocus: true,
  });
}

export function useCategoriesByType(type: 'income' | 'expense') {
  return useQuery({
    queryKey: queryKeys.categories.byType(type),
    queryFn: async () => {
      const categories = await categoriesAPI.getAll();
      return categories.filter((cat: Category) => cat.type === type);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useCreateCategory() {
  return useMutation({
    mutationFn: (data: Partial<Category>) => categoriesAPI.create(data),
    onSuccess: () => {
      invalidateQueries.categories();
    },
  });
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => 
      categoriesAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.categories();
    },
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: (id: number) => categoriesAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.categories();
    },
  });
}

// ============================================
// Accounts Hooks
// ============================================

interface AccountFilterParams {
  year?: number;
  month?: number;
}

export function useAccounts(params: AccountFilterParams = {}) {
  const { year, month } = params;
  return useQuery({
    queryKey: [...queryKeys.accounts.list(), { year, month }],
    queryFn: () => accountsAPI.getAll(year && month ? { year, month } : undefined),
    staleTime: 0, // Always refetch on invalidation for instant updates
    refetchOnWindowFocus: true,
  });
}

interface AccountDetailParams {
  id: number;
  type?: 'income' | 'expense';
  page?: number;
  per_page?: number;
}

export function useAccountDetail(params: AccountDetailParams) {
  const { id, type, page = 1, per_page = 20 } = params;
  return useQuery({
    queryKey: [...queryKeys.accounts.detail(id), { type, page, per_page }],
    queryFn: () => accountsAPI.getDetail(id, { type, page, per_page }),
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });
}

export function useCreateAccount() {
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountsAPI.create(data),
    onSuccess: () => {
      invalidateQueries.accounts();
    },
  });
}

export function useUpdateAccount() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) => 
      accountsAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.accounts();
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (id: number) => accountsAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.accounts();
    },
  });
}

export function useTransferBetweenAccounts() {
  return useMutation({
    mutationFn: (data: {
      from_account_id: number;
      to_account_id: number;
      amount: number;
      description?: string;
      date: string;
    }) => accountsAPI.transfer(data),
    onSuccess: () => {
      // Invalidate all relevant queries for instant updates
      invalidateQueries.transactions();
    },
  });
}

// ============================================
// Combined/Composite Hooks
// ============================================

/**
 * Hook to prefetch all data needed for a component
 * Useful for route preloading
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  
  return async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: () => dashboardAPI.getStats(),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.recentTransactions(5),
        queryFn: () => dashboardAPI.getRecentTransactions(5),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.budgetProgress(),
        queryFn: () => dashboardAPI.getBudgetProgress(),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.monthlyAnalytics(6),
        queryFn: () => dashboardAPI.getMonthlyAnalytics(6),
      }),
    ]);
  };
}

/**
 * Hook to get all filter options (categories + accounts)
 * Useful for transaction forms
 */
export function useFilterOptions() {
  const categoriesQuery = useCategories();
  const accountsQuery = useAccounts();
  
  return {
    categories: categoriesQuery.data ?? [],
    accounts: accountsQuery.data ?? [],
    isLoading: categoriesQuery.isLoading || accountsQuery.isLoading,
    isError: categoriesQuery.isError || accountsQuery.isError,
  };
}
