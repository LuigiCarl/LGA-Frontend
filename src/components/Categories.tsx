import { useState, useMemo } from "react";
import { Wallet, Plus, Pencil, Trash2, X } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { HeaderActions } from "./HeaderActions";
import { CategoriesSkeleton } from "./ui/ContentLoader";
import { Category } from "../lib/api";
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "../lib/hooks";
import { useToast } from "../context/ToastContext";

export function Categories() {
  // React Query hooks - data is cached and shared
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const toast = useToast();
  
  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories: Category[] = categoriesData || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({ isOpen: false, categoryId: null, categoryName: "" });
  const [formData, setFormData] = useState({
    name: "",
    color: "#FF6B6B",
    type: "expense" as "expense" | "income",
    description: "",
  });

  const colorOptions = [
    "#FF6B6B", "#F38181", "#AA96DA", "#FFA07A", "#95E1D3",
    "#4ECDC4", "#6BCF7F", "#5BC0DE", "#FFB6B9", "#FEC8D8",
  ];

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color || "#FF6B6B",
        type: category.type,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", color: "#FF6B6B", type: "expense", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", color: "#FF6B6B", type: "expense", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    // Prepare API request data (same for both POST and PUT)
    const apiRequestData = {
      name: formData.name,
      type: formData.type as "income" | "expense",
      color: formData.color, // hex color format
      ...(formData.description && { description: formData.description }), // Only include if not empty
    };

    try {
      if (editingCategory) {
        // Update existing category - PUT /api/categories/{id}
        await updateMutation.mutateAsync({ id: editingCategory.id, data: apiRequestData });
      } else {
        // Create new category - POST /api/categories
        await createMutation.mutateAsync(apiRequestData);
        toast.success("Category created successfully");
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmation({ isOpen: true, categoryId: id, categoryName: categories.find(cat => cat.id === id)?.name || "" });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.categoryId) {
      try {
        await deleteMutation.mutateAsync(deleteConfirmation.categoryId);
        setDeleteConfirmation({ isOpen: false, categoryId: null, categoryName: "" });
        toast.success("Category deleted successfully");
      } catch (error: unknown) {
        console.error('Failed to delete category:', error);
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || 'Failed to delete category';
        toast.error(errorMessage);
        setDeleteConfirmation({ isOpen: false, categoryId: null, categoryName: "" });
      }
    }
  };

  // Check if a category is a system transfer category (cannot be edited/deleted)
  const isTransferCategory = (name: string) => name === 'Transfer In' || name === 'Transfer Out';

  // Filter out transfer categories from the display list
  const expenseCategories = useMemo(() => 
    Array.isArray(categories) 
      ? categories.filter((cat) => cat.type === "expense" && !isTransferCategory(cat.name)) 
      : [], 
    [categories]
  );
  const incomeCategories = useMemo(() => 
    Array.isArray(categories) 
      ? categories.filter((cat) => cat.type === "income" && !isTransferCategory(cat.name)) 
      : [],
    [categories]
  );

  // Show skeleton on first load only
  if (categoriesLoading && !categoriesData) {
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Categories</h2>
            <div className="hidden lg:flex items-center gap-2">
              <HeaderActions />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <CategoriesSkeleton />
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Categories</h2>
            <div className="hidden lg:flex items-center gap-2">
              <HeaderActions />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Categories Card */}
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Total Categories</p>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl text-[#0A0A0A] dark:text-white">{categories.length}</p>
                <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">categories</p>
              </div>

              {/* Expense Categories Card */}
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Expense</p>
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5E5] dark:bg-[#3F1F1F] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#E7000B]" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl text-[#0A0A0A] dark:text-white">{expenseCategories.length}</p>
                <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">categories</p>
              </div>

              {/* Income Categories Card */}
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 lg:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">Income</p>
                  <div className="w-8 h-8 rounded-lg bg-[#E5F9E5] dark:bg-[#1F3F1F] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#00A63E]" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl text-[#0A0A0A] dark:text-white">{incomeCategories.length}</p>
                <p className="text-xs text-[#717182] dark:text-[#71717A] mt-1">categories</p>
              </div>
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => handleOpenDialog()}
              className="w-full h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>

            {/* Expense Categories */}
            <div>
              <h3 className="text-base text-[#0A0A0A] dark:text-white mb-4">Expense Categories ({expenseCategories.length})</h3>
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                      </div>
                      <div>
                        <p className="text-base text-[#0A0A0A] dark:text-white">{category.name}</p>
                        <p className="text-sm text-[#717182] dark:text-[#A1A1AA] capitalize">{category.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDialog(category)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Income Categories */}
            <div>
              <h3 className="text-base text-[#0A0A0A] dark:text-white mb-4">Income Categories ({incomeCategories.length})</h3>
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                      </div>
                      <div>
                        <p className="text-base text-[#0A0A0A] dark:text-white">{category.name}</p>
                        <p className="text-sm text-[#717182] dark:text-[#A1A1AA] capitalize">{category.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDialog(category)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dialog/Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] w-full max-w-md p-6">
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base text-[#0A0A0A] dark:text-white">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={handleCloseDialog}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                >
                  <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </button>
              </div>

              {/* Dialog Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Groceries"
                    className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">Type *</label>
                  <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "expense" })}
                      className={`flex-1 h-8 rounded-[14px] text-sm transition-colors ${
                        formData.type === "expense" ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white" : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "income" })}
                      className={`flex-1 h-8 rounded-[14px] text-sm transition-colors ${
                        formData.type === "income" ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white" : "text-[#0A0A0A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Color *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full aspect-square rounded-lg ${
                          formData.color === color ? "ring-2 ring-[#030213] dark:ring-white ring-offset-2 dark:ring-offset-[#18181B]" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter a description for this category"
                    className="w-full h-16 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none"
                  />
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
                    {editingCategory ? "Update" : "Add"} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, categoryId: null, categoryName: "" })}
          onConfirm={handleConfirmDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? All associated transactions will lose their category assignment."
          itemName={deleteConfirmation.categoryName}
        />
      </div>
    </>
  );
}