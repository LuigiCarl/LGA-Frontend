import { motion, AnimatePresence, Variants, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode, createContext, useContext } from "react";

// ============================================
// Reduced Motion Context & Hook
// ============================================
const ReducedMotionContext = createContext(false);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion ?? false}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useMotionSafe() {
  const prefersReducedMotion = useContext(ReducedMotionContext);
  return !prefersReducedMotion;
}

// ============================================
// Animation Variants
// ============================================
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: {
      duration: 0.15,
    }
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    }
  },
  exit: { opacity: 0, y: -10 },
};

export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    }
  },
};

// ============================================
// Spring Configurations
// ============================================
export const springConfig = {
  gentle: { type: "spring" as const, damping: 20, stiffness: 200 },
  snappy: { type: "spring" as const, damping: 25, stiffness: 400 },
  bouncy: { type: "spring" as const, damping: 15, stiffness: 300 },
  slow: { type: "spring" as const, damping: 30, stiffness: 150 },
};

// ============================================
// Motion Components
// ============================================

// Animated container with fade
interface FadeProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const Fade = forwardRef<HTMLDivElement, FadeProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        initial={shouldAnimate ? "hidden" : false}
        animate="visible"
        exit="exit"
        variants={fadeVariants}
        transition={{ duration: 0.2, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Fade.displayName = "Fade";

// Animated container with fade up
export const FadeUp = forwardRef<HTMLDivElement, FadeProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        initial={shouldAnimate ? "hidden" : false}
        animate="visible"
        exit="exit"
        variants={fadeUpVariants}
        transition={{ duration: 0.3, delay, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeUp.displayName = "FadeUp";

// Staggered list container
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.05, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        initial={shouldAnimate ? "hidden" : false}
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1,
            },
          },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = "StaggerContainer";

// Staggered list item
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={listItemVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <motion.div
      initial={shouldAnimate ? "hidden" : false}
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Modal wrapper with animations
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function AnimatedModal({ isOpen, onClose, children, className }: AnimatedModalProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={onClose}
          />
          {/* Modal Content */}
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${className || ""}`}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Animated button with scale effect
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, disabled, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.button
        ref={ref}
        className={className}
        disabled={disabled}
        whileHover={shouldAnimate && !disabled ? { scale: 1.02 } : undefined}
        whileTap={shouldAnimate && !disabled ? { scale: 0.98 } : undefined}
        transition={springConfig.snappy}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

// Animated card with hover effect
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hoverScale?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverScale = 1.01, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        className={className}
        whileHover={shouldAnimate ? { scale: hoverScale, y: -2 } : undefined}
        transition={springConfig.gentle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

// Skeleton pulse animation component
export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-[#E5E5E7] dark:bg-[#27272A] rounded ${className || ""}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Toast animation wrapper
interface ToastAnimationProps {
  children: ReactNode;
  isVisible: boolean;
}

export function ToastAnimation({ children, isVisible }: ToastAnimationProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: -20, scale: 0.95 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={springConfig.snappy}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Number counter animation
interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export function AnimatedCounter({ value, duration = 0.5, className, formatValue }: CounterProps) {
  const shouldAnimate = useMotionSafe();
  
  if (!shouldAnimate) {
    return <span className={className}>{formatValue ? formatValue(value) : value}</span>;
  }
  
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration }}
      >
        {formatValue ? formatValue(value) : value}
      </motion.span>
    </motion.span>
  );
}

// Dropdown animation wrapper
interface DropdownAnimationProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function DropdownAnimation({ isOpen, children, className }: DropdownAnimationProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={shouldAnimate ? { opacity: 0, y: -5, scale: 0.98 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Advanced Micro-Interactions
// ============================================

// Hover scale effect for interactive elements
interface HoverScaleProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  scale?: number;
  disabled?: boolean;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.02, disabled = false, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        whileHover={shouldAnimate && !disabled ? { scale } : undefined}
        whileTap={shouldAnimate && !disabled ? { scale: scale - 0.04 } : undefined}
        transition={springConfig.snappy}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverScale.displayName = "HoverScale";

// Tap feedback for buttons and interactive elements
interface TapFeedbackProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  disabled?: boolean;
}

export const TapFeedback = forwardRef<HTMLDivElement, TapFeedbackProps>(
  ({ children, disabled = false, ...props }, ref) => {
    const shouldAnimate = useMotionSafe();
    
    return (
      <motion.div
        ref={ref}
        whileTap={shouldAnimate && !disabled ? { scale: 0.97 } : undefined}
        transition={springConfig.snappy}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
TapFeedback.displayName = "TapFeedback";

// Shake animation for error feedback
interface ShakeProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export function Shake({ children, trigger, className }: ShakeProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <motion.div
      className={className}
      animate={
        shouldAnimate && trigger
          ? { x: [0, -4, 4, -4, 4, -2, 2, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// Success bounce animation
interface SuccessBounceProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export function SuccessBounce({ children, trigger, className }: SuccessBounceProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <motion.div
      className={className}
      animate={
        shouldAnimate && trigger
          ? { scale: [1, 1.1, 0.95, 1.02, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention
interface PulseProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export function Pulse({ children, isActive = true, className }: PulseProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <motion.div
      className={className}
      animate={
        shouldAnimate && isActive
          ? { scale: [1, 1.02, 1] }
          : { scale: 1 }
      }
      transition={{ 
        duration: 2, 
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

// Reveal animation for scroll-triggered content
interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export function RevealOnScroll({ 
  children, 
  className, 
  direction = "up",
  delay = 0 
}: RevealOnScrollProps) {
  const shouldAnimate = useMotionSafe();
  
  const directionVariants = {
    up: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
  };
  
  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={directionVariants[direction]}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Number flip animation
interface NumberFlipProps {
  value: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export function NumberFlip({ value, className, formatValue }: NumberFlipProps) {
  const shouldAnimate = useMotionSafe();
  
  if (!shouldAnimate) {
    return <span className={className}>{formatValue ? formatValue(value) : value}</span>;
  }
  
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        className={className}
        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {formatValue ? formatValue(value) : value}
      </motion.span>
    </AnimatePresence>
  );
}

// Loading dots animation
interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export function LoadingDots({ className, dotClassName }: LoadingDotsProps) {
  return (
    <div className={`flex gap-1 ${className || ""}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full bg-current ${dotClassName || ""}`}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Skeleton shimmer with motion
interface MotionSkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function MotionSkeleton({ className, rounded = "md" }: MotionSkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };
  
  return (
    <motion.div
      className={`bg-gradient-to-r from-[#E5E5E7] via-[#F0F0F2] to-[#E5E5E7] dark:from-[#27272A] dark:via-[#3F3F46] dark:to-[#27272A] ${roundedClass[rounded]} ${className || ""}`}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: "200% 100%" }}
    />
  );
}

// Expandable container
interface ExpandableProps {
  isExpanded: boolean;
  children: ReactNode;
  className?: string;
}

export function Expandable({ isExpanded, children, className }: ExpandableProps) {
  const shouldAnimate = useMotionSafe();
  
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          className={className}
          initial={shouldAnimate ? { height: 0, opacity: 0 } : false}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Presence wrapper for exit animations
export { AnimatePresence, motion };
