import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useCreateCategory, useCategories } from "../lib/hooks";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence, modalVariants, overlayVariants, useMotionSafe } from "./ui/motion";

interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCategory({ isOpen, onClose, onSuccess }: AddCategoryProps) {
  const toast = useToast();
  const createMutation = useCreateCategory();
  const shouldAnimate = useMotionSafe();
  
  // Fetch existing categories to track used colors
  const { data: categoriesData } = useCategories();

  const [formData, setFormData] = useState({
    name: "",
    color: "#6366F1",
    type: "expense" as "expense" | "income",
    description: "",
  });

  // 24 color options matching Categories.tsx - organized by hue groups
  const colorOptions = [
    // Reds and Pinks
    "#EF4444", // Red
    "#DC2626", // Red-600
    "#F43F5E", // Rose
    "#EC4899", // Pink

    // Purples and Violets
    "#D946EF", // Fuchsia
    "#A855F7", // Purple
    "#8B5CF6", // Violet
    "#6366F1", // Indigo

    // Oranges and Yellows
    "#F97316", // Orange
    "#FB923C", // Orange-400
    "#F59E0B", // Amber
    "#EAB308", // Yellow

    // Greens
    "#84CC16", // Lime
    "#22C55E", // Green
    "#10B981", // Emerald
    "#14B8A6", // Teal

    // Blues and Cyans
    "#06B6D4", // Cyan
    "#0EA5E9", // Sky
    "#3B82F6", // Blue
    "#2563EB", // Blue-600

    // Neutrals
    "#64748B", // Slate
    "#6B7280", // Gray
    "#78716C", // Stone
    "#71717A", // Zinc
  ];

  // Compute used colors from existing categories
  // Compute used colors from existing categories
  const usedColors = useMemo(() => {
    if (!categoriesData) return new Set<string>();
    return new Set(
      categoriesData
        .filter((cat) => cat.color)
        .map((cat) => cat.color!.toUpperCase())
    );
  }, [categoriesData]);

  // Reset form when dialog opens - pick first available color
  useEffect(() => {
    if (isOpen) {
      const firstAvailable = colorOptions.find(c => !usedColors.has(c.toUpperCase())) || "#6366F1";
      setFormData({
        name: "",
        color: firstAvailable,
        type: "expense",
        description: "",
      });
    }
  }, [isOpen, usedColors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        color: formData.color,
        type: formData.type,
        description: formData.description.trim() || undefined,
      });
      toast.success("Category created successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", color: "#6366F1", type: "expense", description: "" });
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
              className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] w-full max-w-sm lg:max-w-md p-6 max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={shouldAnimate ? "hidden" : false}
              animate="visible"
              exit="exit"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base text-[#0A0A0A] dark:text-white">Add New Category</h3>
                <button
                  onClick={handleClose}
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
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Type *
                  </label>
                  <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "expense" })}
                      className={`flex-1 h-9 rounded-[12px] text-sm transition-all ${
                        formData.type === "expense"
                          ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                          : "text-[#717182] dark:text-[#A1A1AA]"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "income" })}
                      className={`flex-1 h-9 rounded-[12px] text-sm transition-all ${
                        formData.type === "income"
                          ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                          : "text-[#717182] dark:text-[#A1A1AA]"
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
                  <div className="grid grid-cols-6 lg:grid-cols-8 gap-2">
                    {colorOptions.map((color) => {
                      const isUsed = usedColors.has(color.toUpperCase());
                      const isSelected = formData.color === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          disabled={isUsed}
                          onClick={() => !isUsed && setFormData({ ...formData, color })}
                          className={`w-full aspect-square rounded-lg transition-all ${
                            isSelected
                              ? "ring-2 ring-[#6366F1] dark:ring-[#A78BFA] ring-offset-2 dark:ring-offset-[#18181B] scale-110"
                              : isUsed
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          title={isUsed ? "Color already in use" : color}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Monthly grocery expenses"
                    rows={3}
                    className="w-full px-3 py-2 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] border border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6] focus:outline-none resize-none"
                  />
                </div>

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
                    {createMutation.isPending ? "Adding..." : "Add Category"}
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
