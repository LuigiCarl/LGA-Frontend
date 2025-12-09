import { useState, useEffect } from "react";
import { X, ChevronDown, Building, Wallet, CreditCard } from "lucide-react";
import { useCreateAccount } from "../lib/hooks";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence, modalVariants, overlayVariants, useMotionSafe } from "./ui/motion";

interface AddAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAccount({ isOpen, onClose, onSuccess }: AddAccountProps) {
  const toast = useToast();
  const createMutation = useCreateAccount();
  const shouldAnimate = useMotionSafe();

  const [formData, setFormData] = useState({
    name: "",
    type: "" as "cash" | "bank" | "credit_card" | "",
    balance: "",
    description: "",
    icon: "Building",
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Available account types with icons (matching API enum: cash, bank, credit_card)
  const accountTypes = [
    { name: "bank", displayName: "Bank", icon: "Building" },
    { name: "cash", displayName: "Cash", icon: "Wallet" },
    { name: "credit_card", displayName: "Credit Card", icon: "CreditCard" },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Building": return Building;
      case "Wallet": return Wallet;
      case "CreditCard": return CreditCard;
      default: return Building;
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        type: "",
        balance: "",
        description: "",
        icon: "Building",
      });
      setShowTypeDropdown(false);
    }
  }, [isOpen]);

  const handleTypeChange = (typeName: string) => {
    const selectedType = accountTypes.find(t => t.name === typeName);
    if (selectedType) {
      setFormData({ 
        ...formData, 
        type: typeName as "cash" | "bank" | "credit_card",
        icon: selectedType.icon 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an account name");
      return;
    }
    if (!formData.type) {
      toast.error("Please select an account type");
      return;
    }
    if (!formData.balance) {
      toast.error("Please enter an initial balance");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        type: formData.type,
        balance: parseFloat(formData.balance),
        description: formData.description.trim() || undefined,
        icon: formData.icon,
      });
      toast.success("Account created successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", type: "", balance: "", description: "", icon: "Building" });
    setShowTypeDropdown(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={handleClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 w-full max-w-md shadow-xl pointer-events-auto"
              initial={shouldAnimate ? "hidden" : false}
              animate="visible"
              exit="exit"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base text-[#0A0A0A] dark:text-white">Add New Account</h3>
                <button
                  onClick={handleClose}
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
                <div className="relative">
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Account Type *
                  </label>
                  <button
                    type="button"
                    className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <span className={`text-sm ${formData.type ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                      {formData.type ? accountTypes.find(t => t.name === formData.type)?.displayName : "Select a type"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
                  </button>
                  {showTypeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {accountTypes.map((type) => {
                        const IconComponent = getIconComponent(type.icon);
                        return (
                          <button
                            key={type.name}
                            type="button"
                            className="w-full h-10 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-lg first:rounded-t-lg"
                            onClick={() => {
                              handleTypeChange(type.name);
                              setShowTypeDropdown(false);
                            }}
                          >
                            <IconComponent className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
                            <span className="text-sm text-[#0A0A0A] dark:text-white">
                              {type.displayName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Initial Balance */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Initial Balance *
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
                      <span className="text-sm text-[#0A0A0A] dark:text-white">
                        {accountTypes.find(t => t.name === formData.type)?.displayName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Adding..." : "Add Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
