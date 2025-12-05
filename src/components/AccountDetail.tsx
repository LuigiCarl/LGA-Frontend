import { useState } from "react";
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  ChevronDown,
  Calendar,
  Building,
  Wallet,
  CreditCard,
  Filter,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useAccountDetail } from "../lib/hooks";
import { Account, Transaction } from "../lib/api";

interface AccountDetailProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'income' | 'expense';

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, typeof Building> = {
    Building,
    Wallet,
    CreditCard,
  };
  return iconMap[iconName] || Building;
};

export function AccountDetail({ account, isOpen, onClose }: AccountDetailProps) {
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data, isLoading } = useAccountDetail({
    id: account.id,
    type: filter === 'all' ? undefined : filter,
    page,
    per_page: 15,
  });

  if (!isOpen) return null;

  const Icon = getIconComponent(account.icon || 'Building');
  const stats = data?.stats;
  const transactions = data?.transactions?.data || [];
  const totalPages = data?.transactions?.last_page || 1;
  const currentPage = data?.transactions?.current_page || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTransactionClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filterOptions: { value: FilterType; label: string; icon: typeof Filter }[] = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'income', label: 'Income', icon: TrendingUp },
    { value: 'expense', label: 'Expenses', icon: TrendingDown },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#6366F1] dark:text-[#A78BFA]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-white">{account.name}</h3>
                <p className="text-sm text-[#717182] dark:text-[#A1A1AA] capitalize">{account.type.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
            >
              <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
            </button>
          </div>

          {/* Account Summary Stats */}
          {isLoading && !stats ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-xl p-3 animate-pulse">
                  <div className="h-3 bg-[#E5E5E7] dark:bg-[#3F3F46] rounded w-20 mb-2"></div>
                  <div className="h-5 bg-[#E5E5E7] dark:bg-[#3F3F46] rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 gap-3">
              {/* Initial Balance */}
              <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-xl p-3">
                <p className="text-xs text-[#717182] dark:text-[#A1A1AA] mb-1">Initial Balance</p>
                <p className="text-base font-medium text-[#0A0A0A] dark:text-white">
                  {formatCurrency(stats.initial_balance)}
                </p>
              </div>
              
              {/* Total Income */}
              <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-xl p-3">
                <p className="text-xs text-[#717182] dark:text-[#A1A1AA] mb-1">Total Income</p>
                <p className="text-base font-medium text-[#22C55E]">
                  +{formatCurrency(stats.total_income)}
                </p>
              </div>
              
              {/* Total Expenses */}
              <div className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-xl p-3">
                <p className="text-xs text-[#717182] dark:text-[#A1A1AA] mb-1">Total Expenses</p>
                <p className="text-base font-medium text-[#EF4444]">
                  -{formatCurrency(stats.total_expenses)}
                </p>
              </div>
              
              {/* Current Balance */}
              <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-xl p-3">
                <p className="text-xs text-[#717182] dark:text-[#A1A1AA] mb-1">Current Balance</p>
                <p className="text-base font-medium text-[#6366F1] dark:text-[#A78BFA]">
                  {formatCurrency(stats.current_balance)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex-shrink-0 border-b border-black/10 dark:border-white/10 px-4 py-3">
          <div className="flex gap-2">
            {filterOptions.map((option) => {
              const FilterIcon = option.icon;
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-[#F3F3F5] dark:bg-[#27272A] text-[#717182] dark:text-[#A1A1AA] hover:bg-[#E5E5E7] dark:hover:bg-[#3F3F46]'
                  }`}
                >
                  <FilterIcon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm font-medium text-[#0A0A0A] dark:text-white mb-3">
            Transaction History
          </h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#F3F3F5] dark:bg-[#27272A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-[#717182] dark:text-[#A1A1AA]" />
              </div>
              <p className="text-[#717182] dark:text-[#A1A1AA]">
                No {filter === 'all' ? '' : filter} transactions found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction: Transaction) => {
                const isExpanded = expandedId === transaction.id;
                const isIncome = transaction.type === 'income';
                
                return (
                  <div
                    key={transaction.id}
                    className="bg-[#F3F3F5] dark:bg-[#27272A] rounded-xl overflow-hidden transition-all"
                  >
                    {/* Transaction Row */}
                    <button
                      onClick={() => handleTransactionClick(transaction.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[#E5E5E7] dark:hover:bg-[#3F3F46] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncome 
                            ? 'bg-[#22C55E]/10' 
                            : 'bg-[#EF4444]/10'
                        }`}>
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4 text-[#22C55E]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                            {transaction.category?.name || 'Uncategorized'}
                          </p>
                          <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                        )}
                      </div>
                    </button>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-black/5 dark:border-white/5">
                        <div className="mt-3 space-y-2">
                          {transaction.description && (
                            <div>
                              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Description</p>
                              <p className="text-sm text-[#0A0A0A] dark:text-white mt-0.5">
                                {transaction.description}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-4">
                            <div>
                              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Category</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {transaction.category?.color && (
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: transaction.category.color }}
                                  />
                                )}
                                <p className="text-sm text-[#0A0A0A] dark:text-white">
                                  {transaction.category?.name || 'Uncategorized'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Type</p>
                              <p className={`text-sm mt-0.5 capitalize ${
                                isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'
                              }`}>
                                {transaction.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#717182] dark:text-[#A1A1AA]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 border-t border-black/10 dark:border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5E5E7] dark:hover:bg-[#3F3F46] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5E5E7] dark:hover:bg-[#3F3F46] transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
