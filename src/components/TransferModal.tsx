import { useState } from "react";
import { X, ArrowRight, Loader2, ChevronDown, Wallet, Building, CreditCard } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useAccounts, useTransferBetweenAccounts } from "../lib/hooks";
import { useMonth } from "../context/MonthContext";
import { useToast } from "../context/ToastContext";
import { Account } from "../lib/api";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { formatCurrency } = useCurrency();
  const { year, month } = useMonth();
  const { data: accountsData } = useAccounts({ year, month });
  const transferMutation = useTransferBetweenAccounts();
  const toast = useToast();

  const [formData, setFormData] = useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const accounts: Account[] = accountsData || [];

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building;
      case 'cash': return Wallet;
      case 'credit_card': return CreditCard;
      default: return Building;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.from_account_id || !formData.to_account_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Source and destination accounts must be different");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    try {
      await transferMutation.mutateAsync({
        from_account_id: parseInt(formData.from_account_id),
        to_account_id: parseInt(formData.to_account_id),
        amount,
        description: formData.description || undefined,
        date: formData.date,
      });

      toast.success("Transfer completed successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed. Please try again.");
    }
  };

  const handleClose = () => {
    setFormData({
      from_account_id: "",
      to_account_id: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const fromAccount = accounts.find(a => a.id === parseInt(formData.from_account_id));
  const toAccount = accounts.find(a => a.id === parseInt(formData.to_account_id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-white">
            Transfer Between Accounts
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Account */}
          <div className="relative">
            <label className="block text-sm text-[#0A0A0A] dark:text-white mb-2">
              From Account *
            </label>
            <button
              type="button"
              className="w-full h-10 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              onClick={() => setShowFromDropdown(!showFromDropdown)}
            >
              <span className={`text-sm ${formData.from_account_id ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                {fromAccount ? `${fromAccount.name} (${formatCurrency(fromAccount.cumulativeBalance ?? fromAccount.balance)})` : "Select source account"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
            </button>
            {showFromDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {accounts.map((account) => {
                  const IconComponent = getAccountIcon(account.type);
                  return (
                    <button
                      key={account.id}
                      type="button"
                      className="w-full h-10 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-lg first:rounded-t-lg"
                      onClick={() => {
                        setFormData({ ...formData, from_account_id: String(account.id) });
                        setShowFromDropdown(false);
                      }}
                    >
                      <IconComponent className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                      <span className="text-sm text-[#0A0A0A] dark:text-white flex-1 text-left">
                        {account.name}
                      </span>
                      <span className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                        {formatCurrency(account.cumulativeBalance ?? account.balance)}
                      </span>
                    </button>
                  );
                })}
                {accounts.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-[#717182] dark:text-[#A1A1AA]">
                    No accounts available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Arrow Indicator */}
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-3 text-[#717182] dark:text-[#A1A1AA]">
              <span className="text-sm">{fromAccount?.name || 'Source'}</span>
              <ArrowRight className="w-5 h-5 text-[#6366F1]" />
              <span className="text-sm">{toAccount?.name || 'Destination'}</span>
            </div>
          </div>

          {/* To Account */}
          <div className="relative">
            <label className="block text-sm text-[#0A0A0A] dark:text-white mb-2">
              To Account *
            </label>
            <button
              type="button"
              className="w-full h-10 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
              onClick={() => setShowToDropdown(!showToDropdown)}
            >
              <span className={`text-sm ${formData.to_account_id ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                {toAccount ? `${toAccount.name} (${formatCurrency(toAccount.cumulativeBalance ?? toAccount.balance)})` : "Select destination account"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
            </button>
            {showToDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {accounts
                  .filter((a) => a.id !== parseInt(formData.from_account_id))
                  .map((account) => {
                    const IconComponent = getAccountIcon(account.type);
                    return (
                      <button
                        key={account.id}
                        type="button"
                        className="w-full h-10 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-lg first:rounded-t-lg"
                        onClick={() => {
                          setFormData({ ...formData, to_account_id: String(account.id) });
                          setShowToDropdown(false);
                        }}
                      >
                        <IconComponent className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                        <span className="text-sm text-[#0A0A0A] dark:text-white flex-1 text-left">
                          {account.name}
                        </span>
                        <span className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                          {formatCurrency(account.cumulativeBalance ?? account.balance)}
                        </span>
                      </button>
                    );
                  })}
                {accounts.filter((a) => a.id !== parseInt(formData.from_account_id)).length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-[#717182] dark:text-[#A1A1AA]">
                    No other accounts available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-[#0A0A0A] dark:text-white mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full h-10 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
              required
            />
            {fromAccount && formData.amount && parseFloat(formData.amount) > (fromAccount.cumulativeBalance ?? fromAccount.balance) && (
              <p className="text-xs text-[#EF4444] mt-1">
                Insufficient balance (Available: {formatCurrency(fromAccount.cumulativeBalance ?? fromAccount.balance)})
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-[#0A0A0A] dark:text-white mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full h-10 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#0A0A0A] dark:text-white mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Moving savings to investment"
              className="w-full h-10 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-10 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transferMutation.isPending}
              className="flex-1 h-10 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
