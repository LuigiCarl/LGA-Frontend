import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { useMotionSafe, springConfig } from "./motion";

/**
 * Animated Card Component
 * 
 * A motion-enhanced card component that extends shadcn/ui Card patterns.
 * Features smooth hover animations, lift effects, and proper accessibility.
 * Respects prefers-reduced-motion for users with motion sensitivity.
 */

const animatedCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-[#18181B] border-black/10 dark:border-white/10",
        elevated: "bg-white dark:bg-[#18181B] border-black/5 dark:border-white/5 shadow-lg",
        ghost: "bg-transparent border-transparent",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-[#18181B] dark:to-[#0f0f10] border-black/10 dark:border-white/10",
      },
      hover: {
        none: "",
        lift: "", // Applied via motion
        glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
        border: "hover:border-[#6366F1]/50 dark:hover:border-[#8B5CF6]/50",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      padding: "default",
    },
  }
);

// Motion variants for card hover states
const cardMotionVariants = {
  idle: { 
    scale: 1, 
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    scale: 1.01, 
    y: -2,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)"
  },
  tap: { 
    scale: 0.99,
    y: 0
  },
};

const cardMotionVariantsSubtle = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.005, y: -1 },
  tap: { scale: 0.995, y: 0 },
};

export interface AnimatedCardProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof animatedCardVariants> {
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Use subtle animations instead of pronounced ones */
  subtle?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      variant,
      hover,
      padding,
      interactive = false,
      subtle = false,
      children,
      ...props
    },
    ref
  ) => {
    const shouldAnimate = useMotionSafe();
    const isInteractive = interactive || hover === "lift";
    const variants = subtle ? cardMotionVariantsSubtle : cardMotionVariants;

    return (
      <motion.div
        ref={ref}
        className={cn(
          animatedCardVariants({ variant, hover, padding, className }),
          isInteractive && "cursor-pointer"
        )}
        variants={variants}
        initial="idle"
        whileHover={shouldAnimate && isInteractive ? "hover" : undefined}
        whileTap={shouldAnimate && isInteractive ? "tap" : undefined}
        animate="idle"
        transition={springConfig.gentle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Animated Card Header
interface AnimatedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const AnimatedCardHeader = React.forwardRef<HTMLDivElement, AnimatedCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
AnimatedCardHeader.displayName = "AnimatedCardHeader";

// Animated Card Title
interface AnimatedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AnimatedCardTitle = React.forwardRef<HTMLHeadingElement, AnimatedCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AnimatedCardTitle.displayName = "AnimatedCardTitle";

// Animated Card Description
interface AnimatedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AnimatedCardDescription = React.forwardRef<HTMLParagraphElement, AnimatedCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
AnimatedCardDescription.displayName = "AnimatedCardDescription";

// Animated Card Content
interface AnimatedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AnimatedCardContent = React.forwardRef<HTMLDivElement, AnimatedCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
AnimatedCardContent.displayName = "AnimatedCardContent";

// Animated Card Footer
interface AnimatedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const AnimatedCardFooter = React.forwardRef<HTMLDivElement, AnimatedCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
);
AnimatedCardFooter.displayName = "AnimatedCardFooter";

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
  animatedCardVariants,
};
