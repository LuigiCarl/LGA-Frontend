import { useState, useMemo } from "react";
import { Wallet, Plus, Pencil, Trash2, X, Building, Banknote, CreditCard, Landmark, Coins, PiggyBank, LucideIcon } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useCurrency } from "../context/CurrencyContext";
import { HeaderActions } from "./HeaderActions";
import { AccountsSkeleton } from "./ui/ContentLoader";
import { MonthCarousel } from "./MonthCarousel";
import { useMonth } from "../context/MonthContext";
import { Account } from "../lib/api";
import { 
  useAccounts, 
  useCreateAccount, 
  useUpdateAccount, 
  useDeleteAccount 
} from "../lib/hooks";
import { useToast } from "../context/ToastContext";

export function Accounts() {
  // Get month from shared context
  const { year, month } = useMonth();
  const { formatCurrency } = useCurrency();

  // React Query hooks - data is cached and shared
  const { data: accountsData, isLoading: accountsLoading } = useAccounts({ year, month });
  const toast = useToast();
  
  // Mutations
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  // Map accounts to include icon and month data
  const accounts: Account[] = useMemo(() => {
    return (accountsData || []).map((acc: Account & { 
      month_income?: number; 
      month_expenses?: number; 
      month_transaction_count?: number;
      month_balance?: number;
      account_existed?: boolean;
    }) => ({
      ...acc,
      icon: acc.type === 'bank' ? 'Building' : acc.type === 'cash' ? 'Wallet' : 'CreditCard',
      monthIncome: acc.month_income || 0,
      monthExpenses: acc.month_expenses || 0,
      monthTransactionCount: acc.month_transaction_count || 0,
      monthBalance: acc.month_balance || 0,
      accountExisted: acc.account_existed !== undefined ? acc.account_existed : true,
    }));
  }, [accountsData]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    accountId: number | null;
    accountName: string;
  }>({ isOpen: false, accountId: null, accountName: "" });
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "cash" | "bank" | "credit_card" | "",
    balance: "",
    description: "",
    icon: "Building",
  });

  // Available account types with icons (matching API enum: cash, bank, credit_card)
  const accountTypes = [
    { name: "bank", displayName: "Bank", icon: "Building" },
    { name: "cash", displayName: "Cash", icon: "Wallet" },
    { name: "credit_card", displayName: "Credit Card", icon: "CreditCard" },
  ] as const;

  const getIconComponent = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      Building,
      Banknote,
      Wallet,
      CreditCard,
      Landmark,
      Coins,
      PiggyBank,
    };
    return iconMap[iconName] || Building;
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: String(account.balance),
        description: account.description || "",
        icon: account.icon || "Building",
      });
    } else {
      setEditingAccount(null);
      setFormData({ name: "", type: "", balance: "", description: "", icon: "Building" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({ name: "", type: "", balance: "", description: "", icon: "Building" });
  };

  const handleTypeChange = (typeName: string) => {
    const type = accountTypes.find(t => t.name === typeName);
    setFormData({
      ...formData,
      type: typeName as "cash" | "bank" | "credit_card" | "",
      icon: type?.icon || "Building",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.balance) return;

    const balanceAmount = parseFloat(formData.balance);
    if (isNaN(balanceAmount)) return;

    try {
      // Prepare API request data (same for both POST and PUT)
      const apiRequestData = {
        name: formData.name,
        type: formData.type as "cash" | "bank" | "credit_card",
        balance: parseFloat(formData.balance), // Send as number
        ...(formData.description && { description: formData.description }), // Only include if not empty
      };

      if (editingAccount) {
        // Update existing account - PUT /api/accounts/{id}
        await updateMutation.mutateAsync({ id: editingAccount.id, data: apiRequestData });
        toast.success("Account updated successfully");
      } else {
        // Create new account - POST /api/accounts
        await createMutation.mutateAsync(apiRequestData);
        toast.success("Account created successfully");
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save account:', error);
      toast.error(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDelete = (id: number) => {
    const account = accounts.find(a => a.id === id);
    if (account) {
      setDeleteConfirmation({ isOpen: true, accountId: id, accountName: account.name });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.accountId) {
      try {
        await deleteMutation.mutateAsync(deleteConfirmation.accountId);
        setDeleteConfirmation({ isOpen: false, accountId: null, accountName: "" });
        toast.success("Account deleted successfully");
      } catch (error: unknown) {
        console.error('Failed to delete account:', error);
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || 'Failed to delete account';
        toast.error(errorMessage);
        setDeleteConfirmation({ isOpen: false, accountId: null, accountName: "" });
      }
    }
  };

  // Calculate total balance based on selected month
  // Only include accounts that existed in that month, and sum their month_balance (income - expenses for that month)
  const totalBalance = useMemo(() => {
    if (!Array.isArray(accounts)) return 0;
    
    // When viewing a specific month, sum the month_balance (which is already calculated by the backend)
    // For accounts that didn't exist in that month, month_balance will be 0
    return accounts.reduce((sum, a) => {
      // If account_existed is false, don't count it
      if (a.accountExisted === false) return sum;
      
      // Use month_balance if available (for month-specific view)
      // month_balance = month_income - month_expenses for that specific month
      if (a.monthBalance !== undefined) {
        return sum + a.monthBalance;
      }
      
      // Fallback to current balance for non-filtered view
      return sum + parseFloat(String(a.balance));
    }, 0);
  }, [accounts]);

  // Count only accounts that existed in the selected month
  const activeAccountCount = useMemo(() => {
    if (!Array.isArray(accounts)) return 0;
    return accounts.filter(a => a.accountExisted !== false).length;
  }, [accounts]);

  // Show skeleton on first load only
  if (accountsLoading && !accountsData) {
    return (
      <div className="flex flex-col h-full">
        {/* Header - Always visible */}
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
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Accounts</h2>
            <MonthCarousel />
          </div>
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Accounts</h2>
            <div className="flex items-center gap-4">
              <MonthCarousel />
              <HeaderActions />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AccountsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
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
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Accounts</h2>
            <MonthCarousel />
          </div>
          {/* Desktop layout - carousel on right side like Dashboard */}
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Accounts</h2>
            <div className="flex items-center gap-4">
              <MonthCarousel />
              <HeaderActions />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
            {/* Total Balance Card */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-6 shadow-sm">
              <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Monthly Balance</p>
              <h3 className="text-3xl lg:text-4xl leading-10 mb-2 text-[#0A0A0A] dark:text-white">{formatCurrency(totalBalance)}</h3>
              <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">{activeAccountCount} accounts</p>
            </div>

            <button className="w-full h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4" />
              Add Account
            </button>

            {/* Accounts List */}
            <div>
              <h3 className="text-base text-[#0A0A0A] dark:text-white mb-4">Your Accounts</h3>
              <div className="space-y-4">
                {Array.isArray(accounts) && accounts.map((account) => {
                  const Icon = getIconComponent(account.icon || 'wallet');
                  
                  // If account didn't exist in the selected month, show it differently
                  const didNotExist = account.accountExisted === false;
                  
                  return (
                    <div key={account.name} className={`bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 ${didNotExist ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#6366F1] dark:text-[#A78BFA]" />
                          </div>
                          <div>
                            <h4 className="text-base text-[#0A0A0A] dark:text-white">{account.name}</h4>
                            <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                              {account.type}
                              {didNotExist && <span className="ml-2 text-xs text-amber-500">(Not created yet)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg text-[#0A0A0A] dark:text-white">
                            {didNotExist ? formatCurrency(0) : formatCurrency(account.monthBalance ?? account.balance)}
                          </p>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors" onClick={() => handleOpenDialog(account)}>
                            <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                          </button>
                          <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors" onClick={() => handleDelete(account.id)}>
                            <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for Adding/Editing Account */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base text-[#0A0A0A] dark:text-white">
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h3>
              <button 
                onClick={handleCloseDialog}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Name */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Bank"
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                  required
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Account Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                  required
                >
                  <option value="">Select a type</option>
                  {accountTypes.map(type => (
                    <option key={type.name} value={type.name}>{type.displayName}</option>
                  ))}
                </select>
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  {editingAccount ? "Balance" : "Initial Balance"} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="e.g. 5000.00"
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Emergency fund account"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none resize-none"
                />
              </div>

              {/* Account Type Preview */}
              {formData.type && (
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Account Icon
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center">
                      {(() => {
                        const Icon = getIconComponent(formData.icon);
                        return <Icon className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA]" />;
                      })()}
                    </div>
                    <span className="text-sm text-[#0A0A0A] dark:text-white">{formData.type}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity"
                >
                  {editingAccount ? "Update" : "Add"} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, accountId: null, accountName: "" })}
          onConfirm={confirmDelete}
          title="Delete Account"
          message="Are you sure you want to delete this account? All transaction history will be permanently removed."
          itemName={deleteConfirmation.accountName}
        />
      )}
    </>
  );
}