import { memo } from "react";
import { motion, AnimatePresence, modalVariants, overlayVariants, useMotionSafe } from "./ui/motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  onCancel?: () => void;
}

export const DeleteConfirmationModal = memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: DeleteConfirmationModalProps) => {
  const shouldAnimate = useMotionSafe();

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
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-md w-full shadow-xl pointer-events-auto"
              initial={shouldAnimate ? "hidden" : false}
              animate="visible"
              exit="exit"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">{message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

DeleteConfirmationModal.displayName = "DeleteConfirmationModal";
