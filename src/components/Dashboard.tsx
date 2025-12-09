import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useCurrency } from '../context/CurrencyContext';
import { HeaderActions } from './HeaderActions';
import { MonthCarousel } from './MonthCarousel';
import { useMonth } from '../context/MonthContext';
import { useDashboardStats, useBudgets, useRecentTransactions } from '../lib/hooks';
import { Budget, Transaction } from '../lib/api';
import { DashboardSkeleton } from './ui/ContentLoader';
import { StaggerContainer, StaggerItem } from './ui/motion';
import { ProcessingOverlay, ProcessingContent } from './ui/ProcessingOverlay';

export function Dashboard() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();
  
  // Get month from shared context
  const { year, month } = useMonth();

  // React Query hooks with month filter - data updates instantly on invalidation
  const { data: statsData, isLoading: statsLoading, isFetching: statsFetching } = useDashboardStats({ year, month });
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets({ year, month });
  const { data: transactionsData, isLoading: transactionsLoading } = useRecentTransactions(4, year, month);

  // Extract data with fallbacks
  const dashboardData = useMemo(() => ({
    total_balance: statsData?.total_balance || 0,
    total_income: statsData?.total_income || 0,
    total_expenses: statsData?.total_expenses || 0,
    category_spending: statsData?.category_spending || [],
  }), [statsData]);

  const budgets: Budget[] = useMemo(() => {
    return Array.isArray(budgetsData) 
      ? budgetsData 
      : ((budgetsData as unknown as { data?: Budget[] })?.data || []);
  }, [budgetsData]);

  const recentTransactions: Transaction[] = useMemo(() => {
    return Array.isArray(transactionsData)
      ? transactionsData.slice(0, 4)
      : ((transactionsData as unknown as { transactions?: Transaction[] })?.transactions || []).slice(0, 4);
  }, [transactionsData]);

  const isLoading = statsLoading || budgetsLoading || transactionsLoading;

  // Persistent header component - always visible
  const Header = (
    <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 lg:hidden mb-4">
        <div className="flex items-center gap-3">
          <img 
            src="/icon.png" 
            alt="FinanEase Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">FinanEase</h1>
        </div>
        <div className="flex items-center gap-2">
          <HeaderActions />
        </div>
      </div>
      
      {/* Mobile: Title and Month Carousel on same row */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Home</h2>
        <MonthCarousel />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between">
        <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Home</h2>
        <div className="flex items-center gap-4">
          <MonthCarousel />
          <HeaderActions />
        </div>
      </div>
    </div>
  );

  // Show skeleton while loading (only on first load - React Query caches after)
  if (isLoading && !statsData) {
    return (
      <div className="flex flex-col h-full">
        {Header}
        <div className="flex-1 overflow-y-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      {Header}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading overlay when fetching data */}
        <ProcessingOverlay isProcessing={statsFetching} />
        <ProcessingContent isProcessing={statsFetching} className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
          {/* Balance Card & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="lg:col-span-2 bg-white dark:bg-[#18181B] rounded-[14px] p-4 lg:p-6 shadow-lg border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#717182] dark:text-white/90">
                  <Wallet className="w-4 h-4" />
                  <p className="text-xs lg:text-sm">Total Balance</p>
                </div>
              </div>

              <h3 className="text-3xl lg:text-4xl leading-10 text-[#0A0A0A] dark:text-white mb-4">
                {formatCurrency(dashboardData.total_balance)}
              </h3>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-[#F3F3F5] dark:bg-white/20 backdrop-blur-sm rounded-[10px] p-2 lg:p-3">
                  <div className="flex items-center gap-1 text-[#717182] dark:text-white/80 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">Income</span>
                  </div>
                  <p className="text-base lg:text-lg text-[#0A0A0A] dark:text-white">
                    {formatCurrency(dashboardData.total_income)}
                  </p>
                </div>
                <div className="bg-[#F3F3F5] dark:bg-white/20 backdrop-blur-sm rounded-[10px] p-2 lg:p-3">
                  <div className="flex items-center gap-1 text-[#717182] dark:text-white/80 mb-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500">Expenses</span>
                  </div>
                  <p className="text-base lg:text-lg text-[#0A0A0A] dark:text-white">
                    {formatCurrency(dashboardData.total_expenses)}
                  </p>
                </div>
                <div className="bg-[#F3F3F5] dark:bg-white/20 backdrop-blur-sm rounded-[10px] p-2 lg:p-3">
                  <div className="flex items-center gap-1 text-[#717182] dark:text-white/80 mb-1">
                    <Wallet className="w-3 h-3 text-[#6366F1]" />
                    <span className="text-xs text-[#6366F1]">Month Net</span>
                  </div>
                  <p className={`text-base lg:text-lg ${(dashboardData.total_income - dashboardData.total_expenses) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(dashboardData.total_income - dashboardData.total_expenses) >= 0 ? '+' : ''}{formatCurrency(dashboardData.total_income - dashboardData.total_expenses)}
                  </p>
                </div>
              </div>
            </div>

            {/* Spending Chart */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
              <h4 className="text-base leading-4 text-[#0A0A0A] dark:text-white mb-6">Spending</h4>
              <div className="flex items-center justify-center h-40">
                <div className="relative w-40 h-40">
                  {(() => {
                    // Filter out categories with 0 or negative values
                    const categories = (Array.isArray(dashboardData.category_spending) 
                      ? dashboardData.category_spending 
                      : []).filter(cat => cat.value > 0);
                    
                    const total = categories.reduce((sum, cat) => sum + cat.value, 0);
                    
                    // Show empty state if no spending data
                    if (categories.length === 0 || total === 0) {
                      return (
                        <>
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              className="text-gray-200 dark:text-gray-700"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">No spending</p>
                            <p className="text-lg text-[#0A0A0A] dark:text-white">{formatCurrency(0)}</p>
                          </div>
                        </>
                      );
                    }
                    
                    const circumference = 2 * Math.PI * 40;
                    let accumulatedOffset = 0;

                    return (
                      <>
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {categories.map((category, index) => {
                            // Calculate segment with safety checks
                            const segmentLength = total > 0 ? (category.value / total) * circumference : 0;
                            const dashArray = `${segmentLength} ${circumference - segmentLength}`;
                            const offset = -accumulatedOffset;
                            accumulatedOffset += segmentLength;

                            return (
                              <circle
                                key={`${category.name}-${index}`}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={category.color || '#6366F1'}
                                strokeWidth="10"
                                strokeDasharray={dashArray}
                                strokeDashoffset={offset}
                                strokeLinecap="butt"
                                className="cursor-pointer transition-all duration-200"
                                style={{
                                  filter:
                                    hoveredCategory === category.name
                                      ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
                                      : 'none',
                                  opacity:
                                    hoveredCategory && hoveredCategory !== category.name ? 0.4 : 1,
                                  strokeWidth: hoveredCategory === category.name ? 12 : 10,
                                }}
                                onMouseEnter={() => setHoveredCategory(category.name)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                role="img"
                                aria-label={`${category.name}: ${formatCurrency(category.value)}`}
                              />
                            );
                          })}
                        </svg>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-xs text-[#717182] dark:text-[#A1A1AA] transition-all duration-200">
                            {hoveredCategory || 'Total'}
                          </p>
                          <p className="text-lg text-[#0A0A0A] dark:text-white transition-all duration-200">
                            {formatCurrency(
                              hoveredCategory
                                ? categories.find((c) => c.name === hoveredCategory)?.value || 0
                                : total
                            )}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Overview & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Overview */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
              <h4 className="text-base leading-4 text-[#0A0A0A] dark:text-white mb-6">
                Budget Overview
              </h4>
              <StaggerContainer className="space-y-4">
                {Array.isArray(budgets) && budgets.length > 0 ? (
                  budgets.slice(0, 4).map((budget) => {
                    // Use spent from budget data (calculated by backend for selected month)
                    // Fallback to category_spending if not available
                    const budgetWithSpent = budget as Budget & { spent?: number; percentage?: number };
                    let spent = budgetWithSpent.spent;
                    
                    if (spent === undefined) {
                      const categorySpending = dashboardData.category_spending.find(
                        (cat) => cat.name === budget.category_name || cat.name === budget.category?.name
                      );
                      spent = categorySpending?.value || 0;
                    }
                    
                    const budgetAmount = parseFloat(String(budget.amount)) || 0;
                    const percentage = budgetWithSpent.percentage !== undefined 
                      ? budgetWithSpent.percentage 
                      : (budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0);

                    return (
                      <StaggerItem key={budget.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#0A0A0A] dark:text-white">
                            {budget.category_name || budget.category?.name || 'Unknown'}
                          </span>
                          <span className="text-[#0A0A0A] dark:text-white">
                            {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                          </span>
                        </div>
                        <div className="h-2 bg-[#ECECF0] dark:bg-[#27272A] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percentage > 100 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : percentage > 80 
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                  : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </StaggerItem>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No budgets set for this month</p>
                    <Link
                      to="/dashboard/budgets"
                      className="inline-flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create a budget
                    </Link>
                  </div>
                )}
              </StaggerContainer>
              {budgets.length > 0 && (
                <Link
                  to="/dashboard/budgets"
                  className="block text-center text-sm text-[#6366F1] hover:underline mt-4"
                >
                  View all budgets
                </Link>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
              <h4 className="text-base leading-4 text-[#0A0A0A] dark:text-white mb-6">
                Category Breakdown
              </h4>
              <StaggerContainer className="space-y-3">
                {dashboardData.category_spending.length > 0 ? (
                  dashboardData.category_spending.slice(0, 5).map((category, index) => (
                    <StaggerItem
                      key={`${category.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#6366F1' }}
                        />
                        <span className="text-sm text-[#0A0A0A] dark:text-white">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                        {formatCurrency(category.value)}
                      </span>
                    </StaggerItem>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      No spending data for this month
                    </p>
                    <Link
                      to="/dashboard/categories"
                      className="inline-flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add a category
                    </Link>
                  </div>
                )}
              </StaggerContainer>
              {dashboardData.category_spending.length > 5 && (
                <Link
                  to="/dashboard/categories"
                  className="block text-center text-sm text-[#6366F1] hover:underline mt-4"
                >
                  View all categories
                </Link>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base leading-4 text-[#0A0A0A] dark:text-white">
                Recent Transactions
              </h4>
              <Link
                to="/dashboard/transactions"
                className="text-sm text-[#6366F1] hover:underline"
              >
                View all
              </Link>
            </div>
            <StaggerContainer className="grid gap-3 lg:grid-cols-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const categoryColor = transaction.category?.color || '#6366F1';
                  const amount = parseFloat(String(transaction.amount)) || 0;
                  const transactionDate = new Date(
                    transaction.date || transaction.transaction_date || ''
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <StaggerItem
                      key={transaction.id}
                      className="bg-[#F9FAFB] dark:bg-[#27272A] rounded-[10px] p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-[#0A0A0A] dark:text-white">
                            {transaction.category?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                            {transactionDate}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm ${
                          transaction.type === 'income'
                            ? 'text-[#00A63E] dark:text-[#4ADE80]'
                            : 'text-[#E7000B] dark:text-[#F87171]'
                        }`}
                      >
                        {formatCurrency(
                          amount,
                          true,
                          transaction.type
                        )}
                      </span>
                    </StaggerItem>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No transactions for this month
                  </p>
                  <Link
                    to="/dashboard/transactions"
                    className="inline-flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add a transaction
                  </Link>
                </div>
              )}
            </StaggerContainer>
          </div>
        </ProcessingContent>
      </div>
    </div>
  );
}
