import { useState, useEffect, useCallback } from "react";
import { ChevronDown, X, Plus, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { categoriesAPI, accountsAPI, transactionsAPI } from "../lib/api";
import { useCreateTransaction } from "../lib/hooks";
import { invalidateQueries } from "../lib/queryClient";
import { useToast } from "../context/ToastContext";
import { useCurrency } from "../context/CurrencyContext";

// interface Transaction {
//   id: number;
//   type: "income" | "expense";
//   amount: string; // Decimal as string
//   account_id: number;
//   category_id: number;
//   date: string; // Date format: YYYY-MM-DD
//   description?: string; // Optional
//   user_id?: number;
//   created_at?: string;
//   updated_at?: string;
// }

interface Account {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface Category {
  id: number;
  name: string;
  color?: string;
  type: "income" | "expense";
}

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTransaction({ isOpen, onClose, onSuccess }: AddTransactionProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [formData, setFormData] = useState({
    amount: "",
    account_id: null as number | null,
    category_id: null as number | null,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Budget warning state
  const [budgetWarning, setBudgetWarning] = useState<{
    level: 'none' | 'info' | 'warning' | 'error';
    message: string | null;
    canProceed: boolean;
    budgetInfo?: {
      remaining: number;
      percentAfterTransaction: number;
    };
  }>({ level: 'none', message: null, canProceed: true });
  const [isCheckingBudget, setIsCheckingBudget] = useState(false);
  
  // Inline creation states
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"bank" | "cash" | "credit_card">("bank");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // React Query mutation for creating transactions
  const createMutation = useCreateTransaction();
  const toast = useToast();

  // Predefined colors for categories
  const categoryColors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", 
    "#10B981", "#06B6D4", "#3B82F6", "#6B7280", "#84CC16"
  ];

  // Account types
  const accountTypes = [
    { value: "bank", label: "Bank Account" },
    { value: "cash", label: "Cash" },
    { value: "credit", label: "Credit Card" },
    { value: "savings", label: "Savings" },
    { value: "investment", label: "Investment" },
  ];

  // Fetch accounts and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          accountsAPI.getAll(),
          categoriesAPI.getAll({ excludeTransfer: true }) // Exclude Transfer In/Out categories
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Check budget when amount, category, date, or type changes
  const checkBudget = useCallback(async () => {
    // Only check for expenses with valid data
    if (type !== 'expense' || !formData.category_id || !formData.amount || !formData.date) {
      setBudgetWarning({ level: 'none', message: null, canProceed: true });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setBudgetWarning({ level: 'none', message: null, canProceed: true });
      return;
    }

    setIsCheckingBudget(true);
    try {
      const result = await transactionsAPI.checkBudget({
        category_id: formData.category_id,
        amount,
        date: formData.date,
        type: 'expense',
      });

      if (result.has_budget && result.warning_message) {
        setBudgetWarning({
          level: result.warning_level,
          message: result.warning_message,
          canProceed: result.can_proceed,
          budgetInfo: result.budget_info ? {
            remaining: result.budget_info.remaining,
            percentAfterTransaction: result.budget_info.percent_after_transaction,
          } : undefined,
        });
      } else {
        setBudgetWarning({ level: 'none', message: null, canProceed: true });
      }
    } catch (error) {
      console.error('Failed to check budget:', error);
      setBudgetWarning({ level: 'none', message: null, canProceed: true });
    } finally {
      setIsCheckingBudget(false);
    }
  }, [type, formData.category_id, formData.amount, formData.date]);

  // Debounce budget check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkBudget();
    }, 500);
    return () => clearTimeout(timer);
  }, [checkBudget]);

  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === type);

  // Create new category inline
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    setIsCreatingCategory(true);
    try {
      const newCategory = await categoriesAPI.create({
        name: newCategoryName.trim(),
        type: type,
        color: newCategoryColor,
      });
      
      // Add to local categories list and select it
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      
      // Invalidate categories cache
      invalidateQueries.categories();
      
      // Reset form
      setNewCategoryName("");
      setNewCategoryColor("#6366F1");
      setShowNewCategoryForm(false);
      setShowCategoryDropdown(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category. Please try again.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Create new account inline
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("Please enter an account name");
      return;
    }
    
    setIsCreatingAccount(true);
    try {
      const newAccount = await accountsAPI.create({
        name: newAccountName.trim(),
        type: newAccountType,
        balance: 0,
      });
      
      // Add to local accounts list and select it
      setAccounts(prev => [...prev, newAccount]);
      setFormData(prev => ({ ...prev, account_id: newAccount.id }));
      
      // Invalidate accounts cache
      invalidateQueries.accounts();
      
      // Reset form
      setNewAccountName("");
      setNewAccountType("bank");
      setShowNewAccountForm(false);
      setShowAccountDropdown(false);
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formData.account_id || formData.account_id === 0) {
      toast.error("Please select an account");
      return;
    }
    if (!formData.category_id || formData.category_id === 0) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.date || formData.date.trim() === "") {
      toast.error("Please select a date");
      return;
    }
    
    // Check if budget prevents transaction (hard limit)
    if (!budgetWarning.canProceed) {
      toast.error(budgetWarning.message || "Transaction blocked by budget limit");
      return;
    }

    try {
      // Prepare API request data
      const apiRequestData = {
        type: type,
        amount: parseFloat(formData.amount),
        account_id: formData.account_id,
        category_id: formData.category_id,
        date: formData.date, // Backend expects date
        description: formData.description || undefined,
      };

      const result = await createMutation.mutateAsync(apiRequestData);

      // Show success message with budget warning if applicable
      if (result.budget_warning) {
        toast.warning(result.budget_warning, "Transaction Created");
      } else {
        toast.success("Transaction added successfully!");
      }

      // Reset form after successful submission
      setFormData({
        amount: "",
        account_id: null,
        category_id: null,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setBudgetWarning({ level: 'none', message: null, canProceed: true });

      onSuccess?.(); // Call parent callback
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create transaction:', error);
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; budget_exceeded?: boolean } } };
      
      // Check if it's a budget exceeded error
      if (err.response?.data?.budget_exceeded) {
        toast.error(err.response.data.message || "Budget limit exceeded", "Transaction Blocked");
      } else {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.errors || 
                            'Failed to create transaction. Please try again.';
        
        // Display detailed error message
        if (typeof errorMessage === 'object') {
          const errors = Object.values(errorMessage).flat().join(', ');
          toast.error(errors);
        } else {
          toast.error(errorMessage);
        }
      }
    }
  };

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const selectedAccount = accounts.find((acc) => acc.id === formData.account_id);
  const selectedCategory = filteredCategories.find((cat) => cat.id === formData.category_id);

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      amount: "",
      account_id: null,
      category_id: null,
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setType("expense");
    setBudgetWarning({ level: 'none', message: null, canProceed: true });
    setShowAccountDropdown(false);
    setShowCategoryDropdown(false);
    setShowNewCategoryForm(false);
    setShowNewAccountForm(false);
    setNewCategoryName("");
    setNewCategoryColor("#6366F1");
    setNewAccountName("");
    setNewAccountType("bank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[12px] lg:rounded-[14px] p-4 lg:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h3 className="text-sm lg:text-base leading-4 text-[#0A0A0A] dark:text-white">
            Add New Transaction
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
            aria-label="Cancel"
          >
            <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Type */}
          <div>
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Type
            </label>
            <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[12px] lg:rounded-[14px] p-1 flex">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 h-8 lg:h-9 rounded-[12px] lg:rounded-[14px] text-xs lg:text-sm transition-all ${
                  type === "expense"
                    ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                    : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 h-8 lg:h-9 rounded-[12px] lg:rounded-[14px] text-xs lg:text-sm transition-all ${
                  type === "income"
                    ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                    : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm lg:text-base text-[#717182] dark:text-[#A1A1AA]">
                ₱
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full h-10 lg:h-11 pl-7 pr-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] text-sm lg:text-base text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              />
            </div>
            <div className="flex gap-1.5 lg:gap-2 mt-3 flex-wrap">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                  className="h-7 lg:h-8 px-2.5 lg:px-3 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#0A0A0A] dark:text-white hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] transition-colors active:scale-95"
                >
                  ₱{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Warning Banner */}
          {budgetWarning.level !== 'none' && budgetWarning.message && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${
              budgetWarning.level === 'error' 
                ? 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border-[#D4183D]' 
                : budgetWarning.level === 'warning'
                ? 'bg-[#FFFBEB] dark:bg-[#78350F]/30 border-[#F59E0B]'
                : 'bg-[#EEF2FF] dark:bg-[#312E81]/30 border-[#6366F1]'
            }`}>
              {budgetWarning.level === 'error' ? (
                <AlertCircle className="w-5 h-5 text-[#D4183D] dark:text-[#F87171] flex-shrink-0 mt-0.5" />
              ) : budgetWarning.level === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] dark:text-[#FCD34D] flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  budgetWarning.level === 'error' 
                    ? 'text-[#991B1B] dark:text-[#F87171]' 
                    : budgetWarning.level === 'warning'
                    ? 'text-[#92400E] dark:text-[#FCD34D]'
                    : 'text-[#3730A3] dark:text-[#A78BFA]'
                }`}>
                  {budgetWarning.level === 'error' ? 'Budget Limit Exceeded' : 'Budget Alert'}
                </p>
                <p className={`text-xs mt-0.5 ${
                  budgetWarning.level === 'error' 
                    ? 'text-[#B91C1C] dark:text-[#FCA5A5]' 
                    : budgetWarning.level === 'warning'
                    ? 'text-[#B45309] dark:text-[#FDE68A]'
                    : 'text-[#4338CA] dark:text-[#C4B5FD]'
                }`}>
                  {budgetWarning.message}
                </p>
                {budgetWarning.budgetInfo && (
                  <p className={`text-xs mt-1 ${
                    budgetWarning.level === 'error' 
                      ? 'text-[#B91C1C] dark:text-[#FCA5A5]' 
                      : budgetWarning.level === 'warning'
                      ? 'text-[#B45309] dark:text-[#FDE68A]'
                      : 'text-[#4338CA] dark:text-[#C4B5FD]'
                  }`}>
                    Remaining: ₱{budgetWarning.budgetInfo.remaining.toFixed(2)} • 
                    Usage after: {budgetWarning.budgetInfo.percentAfterTransaction.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}
          {isCheckingBudget && (
            <div className="flex items-center gap-2 text-xs text-[#717182] dark:text-[#A1A1AA]">
              <div className="w-3 h-3 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              Checking budget...
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full h-10 lg:h-11 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] text-xs lg:text-sm text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Category *
            </label>
            <button
              type="button"
              className="w-full h-10 lg:h-11 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className={`text-xs lg:text-sm ${selectedCategory ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                {selectedCategory ? selectedCategory.name : "Select category"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[10px] lg:rounded-[12px] shadow-lg max-h-60 overflow-y-auto">
                {/* Create New Category Option */}
                {!showNewCategoryForm ? (
                  <button
                    type="button"
                    className="w-full h-10 lg:h-11 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors border-b border-black/10 dark:border-white/10"
                    onClick={() => setShowNewCategoryForm(true)}
                  >
                    <Plus className="w-4 h-4 text-[#6366F1] dark:text-[#A78BFA]" />
                    <span className="text-xs lg:text-sm text-[#6366F1] dark:text-[#A78BFA] font-medium">
                      Create New Category
                    </span>
                  </button>
                ) : (
                  <div className="p-3 border-b border-black/10 dark:border-white/10 space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="w-full h-8 px-2 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-xs text-[#0A0A0A] dark:text-white placeholder:text-[#717182] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      autoFocus
                    />
                    <div className="flex gap-1 flex-wrap">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-5 h-5 rounded-full transition-all ${newCategoryColor === color ? 'ring-2 ring-offset-1 ring-[#0A0A0A] dark:ring-white' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryForm(false);
                          setNewCategoryName("");
                        }}
                        className="flex-1 h-7 text-xs text-[#717182] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isCreatingCategory || !newCategoryName.trim()}
                        className="flex-1 h-7 bg-[#6366F1] text-white text-xs rounded-lg hover:bg-[#5558E3] transition-colors disabled:opacity-50"
                      >
                        {isCreatingCategory ? 'Creating...' : 'Create'}
                      </button>
                    </div>
                  </div>
                )}
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="w-full h-10 lg:h-11 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-[10px] lg:last:rounded-b-[12px]"
                    onClick={() => {
                      setFormData({ ...formData, category_id: cat.id });
                      setShowCategoryDropdown(false);
                      setShowNewCategoryForm(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs lg:text-sm text-[#0A0A0A] dark:text-white">
                      {cat.name}
                    </span>
                  </button>
                ))}
                {filteredCategories.length === 0 && !showNewCategoryForm && (
                  <div className="px-3 py-4 text-center text-xs text-[#717182] dark:text-[#A1A1AA]">
                    No categories for {type}. Create one above!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative">
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Account *
            </label>
            <button
              type="button"
              className="w-full h-10 lg:h-11 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            >
              <span className={`text-xs lg:text-sm ${selectedAccount ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                {selectedAccount ? selectedAccount.name : "Select account"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
            </button>
            {showAccountDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[10px] lg:rounded-[12px] shadow-lg max-h-60 overflow-y-auto">
                {/* Create New Account Option */}
                {!showNewAccountForm ? (
                  <button
                    type="button"
                    className="w-full h-10 lg:h-11 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors border-b border-black/10 dark:border-white/10"
                    onClick={() => setShowNewAccountForm(true)}
                  >
                    <Plus className="w-4 h-4 text-[#6366F1] dark:text-[#A78BFA]" />
                    <span className="text-xs lg:text-sm text-[#6366F1] dark:text-[#A78BFA] font-medium">
                      Create New Account
                    </span>
                  </button>
                ) : (
                  <div className="p-3 border-b border-black/10 dark:border-white/10 space-y-2">
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      placeholder="Account name"
                      className="w-full h-8 px-2 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-xs text-[#0A0A0A] dark:text-white placeholder:text-[#717182] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      autoFocus
                    />
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value as "bank" | "cash" | "credit_card")}
                      className="w-full h-8 px-2 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-xs text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                    >
                      {accountTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewAccountForm(false);
                          setNewAccountName("");
                        }}
                        className="flex-1 h-7 text-xs text-[#717182] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateAccount}
                        disabled={isCreatingAccount || !newAccountName.trim()}
                        className="flex-1 h-7 bg-[#6366F1] text-white text-xs rounded-lg hover:bg-[#5558E3] transition-colors disabled:opacity-50"
                      >
                        {isCreatingAccount ? 'Creating...' : 'Create'}
                      </button>
                    </div>
                  </div>
                )}
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className="w-full h-10 lg:h-11 px-3 flex items-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-[10px] lg:last:rounded-b-[12px]"
                    onClick={() => {
                      setFormData({ ...formData, account_id: acc.id });
                      setShowAccountDropdown(false);
                      setShowNewAccountForm(false);
                    }}
                  >
                    <span className="text-xs lg:text-sm text-[#0A0A0A] dark:text-white">
                      {acc.name}
                    </span>
                  </button>
                ))}
                {accounts.length === 0 && !showNewAccountForm && (
                  <div className="px-3 py-4 text-center text-xs text-[#717182] dark:text-[#A1A1AA]">
                    No accounts yet. Create one above!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs lg:text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Grocery shopping at Whole Foods"
              className="w-full h-20 lg:h-24 p-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] text-sm lg:text-base text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-10 lg:h-11 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs lg:text-sm rounded-[10px] lg:rounded-[12px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
