import { Wallet, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, X, Plus } from "lucide-react";
import { useState, useMemo } from "react";

import { useCurrency } from "../context/CurrencyContext";
import { useToast } from "../context/ToastContext";
import { HeaderActions } from "./HeaderActions";
import { AddTransaction } from "./AddTransaction";
import { MonthCarousel } from "./MonthCarousel";
import { useMonth } from "../context/MonthContext";
import { Transaction, Category, Account } from "../lib/api";
import { 
  useTransactions, 
  useDashboardStats, 
  useCategories, 
  useAccounts,
  useUpdateTransaction,
  useDeleteTransaction
} from "../lib/hooks";
import { invalidateQueries } from "../lib/queryClient";
import { TransactionsSkeleton } from "./ui/ContentLoader";

export function Transactions() {
  // Get month from shared context
  const { year, month } = useMonth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(15);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  // Build query params with month filter
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      per_page: transactionsPerPage,
      year,
      month,
    };
    if (filterType !== 'all') params.type = filterType;
    if (selectedCategory) params.category_id = selectedCategory;
    if (selectedAccount) params.account_id = selectedAccount;
    return params;
  }, [currentPage, transactionsPerPage, filterType, selectedCategory, selectedAccount, year, month]);

  // React Query hooks - data is cached and shared
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(queryParams);
  const { data: statsData } = useDashboardStats({ year, month });
  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();

  // Mutations
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Extract data with type safety
  const transactions: Transaction[] = transactionsData?.data || [];
  const totalTransactions = transactionsData?.total || 0;
  const totalIncome = statsData?.total_income || 0;
  const totalExpenses = statsData?.total_expenses || 0;
  const categories: Category[] = categoriesData || [];
  const accounts: Account[] = accountsData || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteTransactionId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTransactionId) {
      try {
        await deleteMutation.mutateAsync(deleteTransactionId);
        toast.success("Transaction deleted successfully");
      } catch (error: unknown) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete transaction';
        toast.error(errorMessage);
      }
    }
    setShowDeleteConfirm(false);
    setDeleteTransactionId(null);
  };

  const handleSaveEdit = async () => {
    if (editingTransaction) {
      try {
        const updateData = {
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          account_id: editingTransaction.account_id || editingTransaction.account?.id,
          category_id: editingTransaction.category_id || editingTransaction.category?.id,
          date: editingTransaction.date,
          description: editingTransaction.description,
        };
        
        await updateMutation.mutateAsync({ id: editingTransaction.id, data: updateData });
        toast.success("Transaction updated successfully");
      } catch (error: unknown) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update transaction';
        toast.error(errorMessage);
      }
    }
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  // Persistent header component - always visible
  const Header = (
    <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-3 lg:hidden mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[10px] flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">FinanEase</h1>
        </div>
        <div className="flex items-center gap-2">
          <HeaderActions />
        </div>
      </div>
      {/* Mobile: Title and Month Carousel on same row */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Transactions</h2>
        <MonthCarousel />
      </div>
      {/* Desktop layout - carousel on right side like Dashboard */}
      <div className="hidden lg:flex items-center justify-between">
        <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Transactions</h2>
        <div className="flex items-center gap-4">
          <MonthCarousel />
          <HeaderActions />
        </div>
      </div>
    </div>
  );

  // Show skeleton on first load only
  if (transactionsLoading && !transactionsData) {
    return (
      <div className="flex flex-col h-full">
        {Header}
        <div className="flex-1 overflow-y-auto">
          <TransactionsSkeleton />
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
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Total Transactions</p>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl text-[#0A0A0A] dark:text-white">{totalTransactions}</p>
              <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">transactions</p>
            </div>

            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Total Income</p>
                <div className="w-8 h-8 rounded-lg bg-[#00A63E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#00A63E] dark:bg-[#4ADE80]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl text-[#00A63E] dark:text-[#4ADE80]">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">income</p>
            </div>

            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Total Expense</p>
                <div className="w-8 h-8 rounded-lg bg-[#E7000B]/10 dark:bg-[#F87171]/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#E7000B] dark:bg-[#F87171]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl text-[#E7000B] dark:text-[#F87171]">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">expense</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#0A0A0A] mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                <h3 className="text-base text-[#0A0A0A] dark:text-white">Filters</h3>
              </div>
              <button
                className="h-10 lg:h-11 px-5 lg:px-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[10px] lg:rounded-[12px] flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/30 dark:shadow-[#6366F1]/40 hover:shadow-xl hover:shadow-[#6366F1]/40 dark:hover:shadow-[#6366F1]/50 transition-all active:scale-95"
                onClick={() => setShowAddTransactionModal(true)}
              >
                <Plus className="w-5 h-5 text-white" />
                <span className="text-sm lg:text-base font-medium text-white">Add Transaction</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
              <button
                className={`flex-1 h-8 ${filterType === "all" ? "bg-white dark:bg-[#18181B] rounded-[14px] text-sm text-[#0A0A0A] dark:text-white shadow-sm" : "rounded-[14px] text-sm text-[#0A0A0A] dark:text-[#A1A1AA]"}`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`flex-1 h-8 ${filterType === "income" ? "bg-white dark:bg-[#18181B] rounded-[14px] text-sm text-[#0A0A0A] dark:text-white shadow-sm" : "rounded-[14px] text-sm text-[#0A0A0A] dark:text-[#A1A1AA]"}`}
                onClick={() => setFilterType("income")}
              >
                Income
              </button>
              <button
                className={`flex-1 h-8 ${filterType === "expense" ? "bg-white dark:bg-[#18181B] rounded-[14px] text-sm text-[#0A0A0A] dark:text-white shadow-sm" : "rounded-[14px] text-sm text-[#0A0A0A] dark:text-[#A1A1AA]"}`}
                onClick={() => setFilterType("expense")}
              >
                Expense
              </button>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="relative">
                <button
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#18181B] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className="text-sm text-[#0A0A0A] dark:text-white">
                    {selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.name : "All Categories"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
                </button>
                
                {/* Category Dropdown */}
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  className={`block w-full px-3 py-2 text-sm text-left ${
                    selectedCategory === null 
                      ? "bg-[#8B5CF6] text-white" 
                      : "text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
                  }`}
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowCategoryDropdown(false);
                  }}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`block w-full px-3 py-2 text-sm text-left ${
                      selectedCategory === category.id 
                        ? "bg-[#8B5CF6] text-white" 
                        : "text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#18181B] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <span className="text-sm text-[#0A0A0A] dark:text-white">
                    {selectedAccount ? accounts.find(acc => acc.id === selectedAccount)?.name : "All Accounts"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
                </button>
                
                {/* Account Dropdown */}
                {showAccountDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      className={`block w-full px-3 py-2 text-sm text-left ${
                        selectedAccount === null 
                          ? "bg-[#8B5CF6] text-white" 
                          : "text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
                      }`}
                      onClick={() => {
                        setSelectedAccount(null);
                        setShowAccountDropdown(false);
                      }}
                    >
                      All Accounts
                    </button>
                    {accounts.map(account => (
                      <button
                        key={account.id}
                        className={`block w-full px-3 py-2 text-sm text-left ${
                          selectedAccount === account.id 
                            ? "bg-[#8B5CF6] text-white" 
                            : "text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
                        }`}
                        onClick={() => {
                          setSelectedAccount(account.id);
                          setShowAccountDropdown(false);
                        }}
                      >
                        {account.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-6">
            {Array.isArray(transactions) && transactions.map((transaction) => {
              // Format date for display
              const displayDate = transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              }) : 'No date';
              
              return (
              <div key={transaction.id}>
                <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-2 px-1">{displayDate}</p>
                <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 hover:shadow-lg dark:hover:shadow-[#6366F1]/10 transition-shadow">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${transaction.category?.color || '#6366F1'}20` }}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: transaction.category?.color || '#6366F1' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base text-[#0A0A0A] dark:text-white truncate">{transaction.category?.name || 'Uncategorized'}</p>
                        <p className="text-sm text-[#717182] dark:text-[#A1A1AA] truncate">{transaction.account?.name || 'Unknown'}</p>
                        <p className="text-xs text-[#717182] dark:text-[#71717A] truncate">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-base ${transaction.type === "income" ? "text-[#00A63E] dark:text-[#4ADE80]" : "text-[#E7000B] dark:text-[#F87171]"}`}>
                        {formatCurrency(transaction.amount, true, transaction.type)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          aria-label="Edit transaction"
                        >
                          <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalTransactions > 0 && (
            <div className="mt-8 space-y-3">
              {/* Total count */}
              <div className="text-center">
                <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                  Showing {((currentPage - 1) * transactionsPerPage) + 1} - {Math.min(currentPage * transactionsPerPage, totalTransactions)} of {totalTransactions} transactions
                </p>
              </div>

              {/* Pagination controls */}
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`h-9 px-4 rounded-[10px] flex items-center gap-2 shadow-lg transition-all ${
                    currentPage === 1
                      ? "bg-[#ECECF0] dark:bg-[#27272A] text-[#A1A1AA] dark:text-[#71717A] cursor-not-allowed opacity-50"
                      : "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40"
                  }`}
                >
                  <ChevronLeft className={`w-5 h-5 ${currentPage === 1 ? "text-[#A1A1AA] dark:text-[#71717A]" : "text-white"}`} />
                  <span className={`text-sm ${currentPage === 1 ? "text-[#A1A1AA] dark:text-[#71717A]" : "text-white"}`}>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#0A0A0A] dark:text-white">
                    Page {currentPage} of {Math.ceil(totalTransactions / transactionsPerPage)}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalTransactions / transactionsPerPage)}
                  className={`h-9 px-4 rounded-[10px] flex items-center gap-2 shadow-lg transition-all ${
                    currentPage === Math.ceil(totalTransactions / transactionsPerPage)
                      ? "bg-[#ECECF0] dark:bg-[#27272A] text-[#A1A1AA] dark:text-[#71717A] cursor-not-allowed opacity-50"
                      : "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40"
                  }`}
                >
                  <span className={`text-sm ${currentPage === Math.ceil(totalTransactions / transactionsPerPage) ? "text-[#A1A1AA] dark:text-[#71717A]" : "text-white"}`}>Next</span>
                  <ChevronRight className={`w-5 h-5 ${currentPage === Math.ceil(totalTransactions / transactionsPerPage) ? "text-[#A1A1AA] dark:text-[#71717A]" : "text-white"}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-[#18181B] border-b border-black/10 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-[#0A0A0A] dark:text-white">Edit Transaction</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="w-8 h-8 rounded-lg bg-[#F3F3F5] dark:bg-[#27272A] flex items-center justify-center hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              >
                <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Type</label>
                <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
                  <button
                    className={`flex-1 h-9 rounded-[12px] text-sm transition-all ${
                      editingTransaction.type === "income"
                        ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                        : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                    }`}
                    onClick={() => setEditingTransaction({ ...editingTransaction, type: "income" })}
                  >
                    Income
                  </button>
                  <button
                    className={`flex-1 h-9 rounded-[12px] text-sm transition-all ${
                      editingTransaction.type === "expense"
                        ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                        : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                    }`}
                    onClick={() => setEditingTransaction({ ...editingTransaction, type: "expense" })}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Amount</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Description</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  placeholder="Enter description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Category</label>
                <select
                  value={editingTransaction.category?.id || ''}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === parseInt(e.target.value));
                    if (cat) {
                      setEditingTransaction({ 
                        ...editingTransaction, 
                        category: cat
                      });
                    }
                  }}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  {categories
                    .filter(category => category.name !== 'Transfer In' && category.name !== 'Transfer Out')
                    .filter(category => category.type === editingTransaction.type)
                    .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Account</label>
                <select
                  value={editingTransaction.account?.id || ''}
                  onChange={(e) => {
                    const acc = accounts.find(a => a.id === parseInt(e.target.value));
                    if (acc) {
                      setEditingTransaction({ ...editingTransaction, account: acc });
                    }
                  }}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Date</label>
                <input
                  type="date"
                  value={editingTransaction.date ? editingTransaction.date.split('T')[0] : ''}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-[#18181B] border-t border-black/10 dark:border-white/10 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="flex-1 h-11 rounded-[12px] bg-[#F3F3F5] dark:bg-[#27272A] text-[#0A0A0A] dark:text-white hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 h-11 rounded-[12px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/20 hover:shadow-xl hover:shadow-[#6366F1]/30 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] w-full max-w-sm p-6">
            <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">Delete Transaction</h3>
            <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTransactionId(null);
                }}
                className="flex-1 h-11 rounded-[12px] bg-[#F3F3F5] dark:bg-[#27272A] text-[#0A0A0A] dark:text-white hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-11 rounded-[12px] bg-[#E7000B] text-white hover:bg-[#C5000A] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <AddTransaction 
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSuccess={() => {
          // Invalidate transactions cache to trigger refetch
          invalidateQueries.transactions();
          console.log("Transaction added successfully");
        }}
      />
    </div>
  );
}