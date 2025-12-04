import { Loader2 } from 'lucide-react';

interface ContentLoaderProps {
  message?: string;
}

/**
 * Unified loading component for content areas.
 * Use this inside page components to show loading state while data loads.
 * The header/layout should remain visible.
 */
export function ContentLoader({ message = 'Loading...' }: ContentLoaderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#6366F1]/20 dark:border-[#6366F1]/30"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-[#6366F1] animate-spin"></div>
      </div>
      <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">{message}</p>
    </div>
  );
}

/**
 * Inline loading spinner for smaller areas
 */
export function InlineLoader({ message }: ContentLoaderProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 className="w-5 h-5 text-[#6366F1] animate-spin" />
      {message && (
        <span className="text-sm text-[#717182] dark:text-[#A1A1AA]">{message}</span>
      )}
    </div>
  );
}

/**
 * Skeleton card loader for grid layouts
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-24"></div>
        <div className="w-8 h-8 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
      </div>
      <div className="h-8 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-32 mb-2"></div>
      <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20"></div>
    </div>
  );
}

/**
 * List item skeleton for transaction/budget lists
 */
export function ListItemSkeleton() {
  return (
    <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-32 mb-2"></div>
          <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-24"></div>
        </div>
        <div className="h-5 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20"></div>
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton loader
 */
export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6 animate-pulse">
      {/* Balance Card Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#18181B] rounded-[14px] p-4 lg:p-6 border border-black/10 dark:border-white/10">
          <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-32 mb-4"></div>
          <div className="h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px] p-3">
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16 mb-2"></div>
              <div className="h-6 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-24"></div>
            </div>
            <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px] p-3">
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16 mb-2"></div>
              <div className="h-6 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
          <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20 mb-6"></div>
          <div className="flex items-center justify-center h-40">
            <div className="w-40 h-40 bg-[#E5E5E5] dark:bg-[#27272A] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Budget Overview Skeleton */}
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4">
        <div className="h-5 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-36 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px]"></div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4">
        <div className="h-5 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px]">
              <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-24 mb-1"></div>
                <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16"></div>
              </div>
              <div className="h-5 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Transactions skeleton loader
 */
export function TransactionsSkeleton() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 animate-pulse">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-[10px] w-32"></div>
        <div className="h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-[10px] w-32"></div>
      </div>
      
      {/* Transaction List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Generic page skeleton
 */
export function PageSkeleton() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Accounts page skeleton loader
 */
export function AccountsSkeleton() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 animate-pulse">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Balance Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-6">
          <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-28 mb-3"></div>
          <div className="h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-44 mb-4"></div>
          <div className="flex gap-4">
            <div className="flex-1 bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px] p-3">
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16 mb-2"></div>
              <div className="h-5 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-20"></div>
            </div>
            <div className="flex-1 bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px] p-3">
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16 mb-2"></div>
              <div className="h-5 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-20"></div>
            </div>
          </div>
        </div>
        {/* Account Count Card */}
        <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-6">
          <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-24 mb-3"></div>
          <div className="h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-16 mb-2"></div>
          <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20"></div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                <div>
                  <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-16"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                <div className="w-8 h-8 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
              </div>
            </div>
            <div className="h-7 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-28 mb-3"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg p-2">
                <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-12 mb-1"></div>
                <div className="h-4 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16"></div>
              </div>
              <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg p-2">
                <div className="h-3 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-12 mb-1"></div>
                <div className="h-4 bg-[#E5E5E5] dark:bg-[#3F3F46] rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Categories page skeleton loader
 */
export function CategoriesSkeleton() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 animate-pulse">
      {/* Expense Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-36"></div>
          <div className="h-9 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-full"></div>
                  <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                  <div className="w-7 h-7 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                </div>
              </div>
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Income Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-32"></div>
          <div className="h-9 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-[#27272A] rounded-full"></div>
                  <div className="h-4 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-20"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                  <div className="w-7 h-7 bg-[#E5E5E5] dark:bg-[#27272A] rounded-lg"></div>
                </div>
              </div>
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#27272A] rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
