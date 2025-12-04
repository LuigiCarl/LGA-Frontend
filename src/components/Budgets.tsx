import { Wallet, Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { HeaderActions } from "./HeaderActions";
import { MonthCarousel } from "./MonthCarousel";
import { useMonth } from "../context/MonthContext";
import { Budget, Category, categoriesAPI } from "../lib/api";
import { formatCurrency } from "../utils/currency";
import { invalidateQueries } from "../lib/queryClient";
import { 
  useBudgets, 
  useBudgetProgress, 
  useCategories,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget
} from "../lib/hooks";
import { useToast } from "../context/ToastContext";

export function Budgets() {
  // Get month from shared context
  const { year, month } = useMonth();

  // React Query hooks - data is cached and shared
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets({ year, month });
  const { data: budgetProgress } = useBudgetProgress();
  const { data: categoriesData } = useCategories();
  const toast = useToast();
  
  // Mutations
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  // Use spent amounts from API if available (month-filtered), otherwise from budget progress
  const budgets = useMemo(() => {
    const rawBudgets = Array.isArray(budgetsData) ? budgetsData : [];
    return rawBudgets.map((budget: Budget & { spent?: number; percentage?: number; remaining?: number; is_exceeded?: boolean }) => {
      // If the API already calculated spent for the selected month, use it
      if (budget.spent !== undefined) {
        return {
          ...budget,
          spent: budget.spent,
          percentage: budget.percentage || 0,
        };
      }
      
      // Fallback to budget progress for current month view
      const progress = budgetProgress?.active_budgets?.find(
        (p: { id: number }) => p.id === budget.id
      );
      return {
        ...budget,
        spent: progress?.spent || 0,
        percentage: progress?.percentage || 0,
      };
    });
  }, [budgetsData, budgetProgress]);

  // availableCategories is computed in allAvailableCategories memo

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    budgetId: number | null;
    budgetCategory: string;
  }>({ isOpen: false, budgetId: null, budgetCategory: "" });
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category_id: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
    description: "",
    is_limiter: false,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Inline category creation states
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  // Predefined colors for categories
  const categoryColors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", 
    "#10B981", "#06B6D4", "#3B82F6", "#6B7280", "#84CC16"
  ];

  // Use local categories if available, otherwise use query data
  const allAvailableCategories: Category[] = useMemo(() => {
    const queryCategories = (categoriesData || []).filter((cat: Category) => cat.type === 'expense');
    // Merge local categories with query categories, avoiding duplicates
    const localIds = new Set(localCategories.map(c => c.id));
    return [...localCategories, ...queryCategories.filter(c => !localIds.has(c.id))];
  }, [categoriesData, localCategories]);

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
        type: 'expense', // Budgets are always for expenses
        color: newCategoryColor,
      });
      
      // Add to local categories and select it
      setLocalCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      
      // Invalidate categories cache
      invalidateQueries.categories();
      
      // Reset form
      setNewCategoryName("");
      setNewCategoryColor("#6366F1");
      setShowNewCategoryForm(false);
      setShowCategoryDropdown(false);
      toast.success("Category created successfully");
    } catch (error: any) {
      console.error('Failed to create category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category. Please try again.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      // Format dates for input fields - remove time portion if present
      const startDate = budget.start_date ? budget.start_date.split('T')[0] : new Date().toISOString().split('T')[0];
      const endDate = budget.end_date ? budget.end_date.split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
      setFormData({
        name: budget.name || "",
        amount: String(parseFloat(String(budget.amount))),
        category_id: budget.category_id || budget.category?.id || 0,
        start_date: startDate,
        end_date: endDate,
        description: budget.description || "",
        is_limiter: budget.is_limiter || false,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: "",
        amount: "",
        category_id: 0,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
        description: "",
        is_limiter: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBudget(null);
    setFormData({
      name: "",
      amount: "",
      category_id: 0,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      description: "",
      is_limiter: false,
    });
    setShowNewCategoryForm(false);
    setNewCategoryName("");
    setNewCategoryColor("#6366F1");
  };

  // const handleCategoryChange = (categoryName: string) => {
  //   const category = availableCategories.find(cat => cat.name === categoryName);
  //   setFormData({
  //     ...formData,
  //     category_id: category?.id || 0,
  //   });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.start_date) {
      toast.error("Please select a start date");
      return;
    }
    if (!formData.end_date) {
      toast.error("Please select an end date");
      return;
    }

    try {
      const budgetAmount = parseFloat(formData.amount);

      if (editingBudget) {
      // Prepare API request data for updating budget
      const apiRequestData: Record<string, unknown> = {
        amount: budgetAmount.toFixed(2), // Decimal format
        category_id: formData.category_id,
        start_date: formData.start_date, // YYYY-MM-DD format
        end_date: formData.end_date, // YYYY-MM-DD format
      };

      // Only include optional fields if provided
      if (formData.description.trim()) {
        apiRequestData.description = formData.description;
      }
      if (formData.is_limiter) {
        apiRequestData.is_limiter = formData.is_limiter;
      }

      // Call API to update budget using mutation
      await updateMutation.mutateAsync({ id: editingBudget.id, data: apiRequestData });

    } else {
      // Prepare API request data for creating budget
      const apiRequestData: Record<string, unknown> = {
        amount: budgetAmount.toFixed(2), // Decimal format
        category_id: formData.category_id,
        start_date: formData.start_date, // YYYY-MM-DD format
        end_date: formData.end_date, // YYYY-MM-DD format
      };

      // Only include optional fields if provided
      if (formData.name.trim()) {
        apiRequestData.name = formData.name;
      }
      if (formData.description.trim()) {
        apiRequestData.description = formData.description;
      }
      if (formData.is_limiter) {
        apiRequestData.is_limiter = formData.is_limiter;
      }

      // Call API to create budget using mutation
      await createMutation.mutateAsync(apiRequestData);
      toast.success("Budget created successfully");
    }

      handleCloseDialog();
    } catch (error: unknown) {
      console.error('Failed to save budget:', error);
      const err = error as { response?: { data?: { message?: string; errors?: { start_date?: string[] } } } };
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.start_date?.[0] ||
                          'Failed to save budget. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDelete = (id: number) => {
    const budgetToDelete = budgets.find(b => b.id === id);
    if (budgetToDelete) {
      setDeleteConfirmation({
        isOpen: true,
        budgetId: id,
        budgetCategory: budgetToDelete.category_name || "",
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.budgetId) {
      try {
        await deleteMutation.mutateAsync(deleteConfirmation.budgetId);
        setDeleteConfirmation({ isOpen: false, budgetId: null, budgetCategory: "" });
        toast.success("Budget deleted successfully");
      } catch (error: unknown) {
        console.error('Failed to delete budget:', error);
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || 'Failed to delete budget';
        toast.error(errorMessage);
        setDeleteConfirmation({ isOpen: false, budgetId: null, budgetCategory: "" });
      }
    }
  };

  const totalBudget = Array.isArray(budgets) ? budgets.reduce((sum, b) => sum + (typeof b.amount === 'number' ? b.amount : parseFloat(String(b.amount))), 0) : 0;
  const totalSpent = Array.isArray(budgets) ? budgets.reduce((sum, b) => sum + (b.spent || 0), 0) : 0;
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Show skeleton on first load only
  if (budgetsLoading && !budgetsData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Budgets</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading budgets...</div>
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
              <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">Budget Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              <HeaderActions />
            </div>
          </div>
          {/* Mobile: Title and Month Carousel on same row */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Budgets</h2>
            <MonthCarousel />
          </div>
          {/* Desktop layout - carousel on right side like Dashboard */}
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Budgets</h2>
            <div className="flex items-center gap-4">
              <MonthCarousel />
              <HeaderActions />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
            {/* Total Budget Card */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Total Monthly Budget</p>
                  <h3 className="text-xl lg:text-2xl text-[#0A0A0A] dark:text-white">{formatCurrency(totalBudget)}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA] mb-1">Spent</p>
                  <p className="text-lg lg:text-xl text-[#00A63E] dark:text-[#4ADE80]">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
              <div className="h-3 bg-[#ECECF0] dark:bg-[#27272A] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full" style={{ width: `${Math.min(totalPercentage, 100)}%` }} />
              </div>
              <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA] text-center">{totalPercentage.toFixed(1)}% of budget used</p>
            </div>

            <button 
              onClick={() => handleOpenDialog()}
              className="w-full h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Set Budget
            </button>

            {/* Category Budgets */}
            <div>
              <h3 className="text-base text-[#0A0A0A] dark:text-white mb-4">Category Budgets</h3>
              <div className="space-y-4">
                {Array.isArray(budgets) && budgets.map((budget) => {
                  const budgetAmount = typeof budget.amount === 'number' ? budget.amount : parseFloat(String(budget.amount));
                  const spentAmount = budget.spent || 0;
                  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                  const remaining = budgetAmount - spentAmount;
                  const categoryName = budget.category_name || budget.category?.name || 'Unknown';
                  const categoryColor = budget.category_color || budget.category?.color || '#6366F1';

                  return (
                    <div key={budget.id} className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${categoryColor}20` }}
                          >
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: categoryColor }} />
                          </div>
                          <div>
                            <h4 className="text-base text-[#0A0A0A] dark:text-white">{categoryName}</h4>
                            <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">
                              {formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenDialog(budget)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                          </button>
                          <button 
                            onClick={() => handleDelete(budget.id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                          </button>
                        </div>
                      </div>
                      <div className="h-2 bg-[#ECECF0] dark:bg-[#27272A] rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#717182] dark:text-[#A1A1AA]">{percentage.toFixed(1)}% used</span>
                        <span className="text-[#00A63E] dark:text-[#4ADE80]">{formatCurrency(remaining)} left</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for Adding/Editing Budget */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base text-[#0A0A0A] dark:text-white">
                {editingBudget ? "Edit Budget" : "Add New Budget"}
              </h3>
              <button 
                onClick={handleCloseDialog}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Budget Amount */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Budget Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717182] dark:text-[#A1A1AA]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="300.00"
                    className="w-full h-9 pl-7 pr-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="relative">
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Category * (Expense categories only)
                </label>
                <button
                  type="button"
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg flex items-center justify-between hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className={`text-sm ${formData.category_id ? "text-[#0A0A0A] dark:text-white" : "text-[#717182] dark:text-[#A1A1AA]"}`}>
                    {allAvailableCategories.find(cat => cat.id === formData.category_id)?.name || "Select category"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA] opacity-50" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Create New Category Option */}
                    {!showNewCategoryForm ? (
                      <button
                        type="button"
                        className="w-full h-9 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors border-b border-black/10 dark:border-white/10"
                        onClick={() => setShowNewCategoryForm(true)}
                      >
                        <Plus className="w-4 h-4 text-[#6366F1] dark:text-[#A78BFA]" />
                        <span className="text-sm text-[#6366F1] dark:text-[#A78BFA] font-medium">
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
                    {allAvailableCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="w-full h-9 px-3 flex items-center gap-2 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors last:rounded-b-lg"
                        onClick={() => {
                          setFormData({ ...formData, category_id: cat.id });
                          setShowCategoryDropdown(false);
                          setShowNewCategoryForm(false);
                        }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-[#0A0A0A] dark:text-white">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                    {allAvailableCategories.length === 0 && !showNewCategoryForm && (
                      <div className="px-3 py-4 text-center text-xs text-[#717182] dark:text-[#A1A1AA]">
                        No expense categories. Create one above!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white"
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
                  placeholder="e.g. Quarterly transport budget"
                  className="w-full h-16 p-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] resize-none"
                />
              </div>

              {/* Is Limiter */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_limiter"
                  checked={formData.is_limiter}
                  onChange={(e) => setFormData({ ...formData, is_limiter: e.target.checked })}
                  className="w-4 h-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded accent-[#6366F1]"
                />
                <label htmlFor="is_limiter" className="text-sm text-[#0A0A0A] dark:text-white cursor-pointer">
                  Hard limit (prevent overspending)
                </label>
              </div>

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
                  {editingBudget ? "Update" : "Add"} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, budgetId: null, budgetCategory: "" })}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? All associated data will be permanently removed."
        itemName={deleteConfirmation.budgetCategory}
      />
    </>
  );
}