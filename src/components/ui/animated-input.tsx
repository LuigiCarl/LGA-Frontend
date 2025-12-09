import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { useMotionSafe, springConfig } from "./motion";

/**
 * Animated Input Component
 * 
 * A motion-enhanced input with focus animations, validation states,
 * and smooth micro-interactions. Follows shadcn/ui patterns with
 * Framer Motion integration for enhanced user feedback.
 */

const animatedInputVariants = cva(
  "flex w-full rounded-lg border bg-transparent text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-input focus:border-[#6366F1] dark:focus:border-[#8B5CF6]",
        filled:
          "bg-[#F3F3F5] dark:bg-[#27272A] border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6]",
        ghost:
          "border-transparent hover:bg-accent focus:bg-accent focus:border-[#6366F1]",
        error:
          "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-900/10",
        success:
          "border-emerald-500 dark:border-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
      },
      inputSize: {
        sm: "h-8 px-2 text-xs",
        default: "h-9 px-3",
        lg: "h-10 px-4",
        xl: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

// Focus ring animation variants
const focusRingVariants = {
  unfocused: { 
    opacity: 0,
    scale: 0.95,
  },
  focused: { 
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15 }
  },
};

export interface AnimatedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof animatedInputVariants> {
  /** Show error shake animation */
  hasError?: boolean;
  /** Show success state */
  isSuccess?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Show character count */
  showCount?: boolean;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type = "text",
      hasError = false,
      isSuccess = false,
      errorMessage,
      label,
      helperText,
      showCount = false,
      maxLength,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const shouldAnimate = useMotionSafe();
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(
      (props.value?.toString() || props.defaultValue?.toString() || "").length
    );
    const [shakeKey, setShakeKey] = React.useState(0);

    // Trigger shake on error
    React.useEffect(() => {
      if (hasError) {
        setShakeKey((prev) => prev + 1);
      }
    }, [hasError]);

    // Determine the current variant based on state
    const currentVariant = hasError ? "error" : isSuccess ? "success" : variant;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    const inputContent = (
      <div className="relative">
        {/* Focus ring effect */}
        <motion.div
          className="absolute inset-0 rounded-lg ring-2 ring-[#6366F1]/20 dark:ring-[#8B5CF6]/20 pointer-events-none"
          initial="unfocused"
          animate={isFocused ? "focused" : "unfocused"}
          variants={focusRingVariants}
        />

        <div className="relative flex items-center">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 text-[#717182] dark:text-[#71717A]">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              animatedInputVariants({ variant: currentVariant, inputSize }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              "focus:outline-none focus:ring-0",
              className
            )}
            ref={ref}
            maxLength={maxLength}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 text-[#717182] dark:text-[#71717A]">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-[#0A0A0A] dark:text-white">
            {label}
          </label>
        )}

        {/* Input with shake animation */}
        <motion.div
          key={shakeKey}
          animate={
            shouldAnimate && hasError && shakeKey > 0
              ? { x: [0, -4, 4, -4, 4, -2, 2, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          {inputContent}
        </motion.div>

        {/* Footer: Error message, helper text, or character count */}
        <div className="flex justify-between items-center min-h-[20px]">
          <div className="flex-1">
            {hasError && errorMessage ? (
              <motion.p
                className="text-xs text-red-500 dark:text-red-400"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {errorMessage}
              </motion.p>
            ) : helperText ? (
              <p className="text-xs text-[#717182] dark:text-[#71717A]">
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount && maxLength && (
            <span
              className={cn(
                "text-xs",
                charCount >= maxLength
                  ? "text-red-500"
                  : "text-[#717182] dark:text-[#71717A]"
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

// Animated Textarea Component
export interface AnimatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof animatedInputVariants>, "inputSize"> {
  hasError?: boolean;
  isSuccess?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  showCount?: boolean;
}

const AnimatedTextarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  (
    {
      className,
      variant,
      hasError = false,
      isSuccess = false,
      errorMessage,
      label,
      helperText,
      showCount = false,
      maxLength,
      ...props
    },
    ref
  ) => {
    const shouldAnimate = useMotionSafe();
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(
      (props.value?.toString() || props.defaultValue?.toString() || "").length
    );
    const [shakeKey, setShakeKey] = React.useState(0);

    React.useEffect(() => {
      if (hasError) {
        setShakeKey((prev) => prev + 1);
      }
    }, [hasError]);

    const currentVariant = hasError ? "error" : isSuccess ? "success" : variant;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[#0A0A0A] dark:text-white">
            {label}
          </label>
        )}

        <motion.div
          key={shakeKey}
          animate={
            shouldAnimate && hasError && shakeKey > 0
              ? { x: [0, -4, 4, -4, 4, -2, 2, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-lg ring-2 ring-[#6366F1]/20 dark:ring-[#8B5CF6]/20 pointer-events-none"
              initial="unfocused"
              animate={isFocused ? "focused" : "unfocused"}
              variants={focusRingVariants}
            />

            <textarea
              className={cn(
                "flex min-h-[80px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none focus:outline-none focus:ring-0",
                currentVariant === "error" &&
                  "border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/10",
                currentVariant === "success" &&
                  "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
                currentVariant === "filled" &&
                  "bg-[#F3F3F5] dark:bg-[#27272A] border-transparent focus:border-[#6366F1] dark:focus:border-[#8B5CF6]",
                (!currentVariant || currentVariant === "default") &&
                  "border-input focus:border-[#6366F1] dark:focus:border-[#8B5CF6]",
                className
              )}
              ref={ref}
              maxLength={maxLength}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              onChange={handleChange}
              {...props}
            />
          </div>
        </motion.div>

        <div className="flex justify-between items-center min-h-[20px]">
          <div className="flex-1">
            {hasError && errorMessage ? (
              <motion.p
                className="text-xs text-red-500 dark:text-red-400"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {errorMessage}
              </motion.p>
            ) : helperText ? (
              <p className="text-xs text-[#717182] dark:text-[#71717A]">
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount && maxLength && (
            <span
              className={cn(
                "text-xs",
                charCount >= maxLength
                  ? "text-red-500"
                  : "text-[#717182] dark:text-[#71717A]"
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

AnimatedTextarea.displayName = "AnimatedTextarea";

export { AnimatedInput, AnimatedTextarea, animatedInputVariants };
