import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "./utils";
import { useMotionSafe, springConfig } from "./motion";

/**
 * Animated Button Component
 * 
 * An enhanced shadcn/ui button with Framer Motion micro-interactions.
 * Supports all standard button variants plus animation states.
 * Respects prefers-reduced-motion accessibility setting.
 */

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30",
        destructive:
          "bg-destructive text-white shadow-lg shadow-destructive/20",
        outline:
          "border border-black/10 dark:border-white/10 bg-white dark:bg-[#27272A] text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        xl: "h-12 rounded-lg px-8 text-base",
        icon: "h-9 w-9 rounded-md",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-subtle",
        glow: "animate-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

// Motion variants for button states
const buttonMotionVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  disabled: { scale: 1, opacity: 0.5 },
};

// Loading spinner component
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-4 w-4", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Success checkmark component
function SuccessCheck({ className }: { className?: string }) {
  return (
    <motion.svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.path
        d="M5 12l5 5L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}

export interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      isLoading = false,
      isSuccess = false,
      loadingText,
      successText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldAnimate = useMotionSafe();
    const isDisabled = disabled || isLoading;

    // If asChild, we can't use motion.button, fall back to Slot
    if (asChild) {
      return (
        <Slot
          className={cn(animatedButtonVariants({ variant, size, animation, className }))}
          ref={ref as React.Ref<HTMLElement>}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(animatedButtonVariants({ variant, size, animation, className }))}
        disabled={isDisabled}
        variants={buttonMotionVariants}
        initial="idle"
        whileHover={shouldAnimate && !isDisabled ? "hover" : undefined}
        whileTap={shouldAnimate && !isDisabled ? "tap" : undefined}
        animate={isDisabled ? "disabled" : "idle"}
        transition={springConfig.snappy}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : isSuccess ? (
          <>
            <SuccessCheck />
            {successText && <span>{successText}</span>}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };
