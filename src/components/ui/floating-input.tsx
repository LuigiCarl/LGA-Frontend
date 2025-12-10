import * as React from "react";
import { cn } from "./utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, success, icon, endIcon, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || React.useId();



    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Call the parent's onFocus handler if provided
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      // Call the parent's onBlur handler if provided
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Check for autofilled values and handle controlled value changes
    React.useEffect(() => {
      if (props.value !== undefined) {
        setHasValue(!!props.value);
      }
    }, [props.value]);

    // Enhanced autofill detection for password fields
    React.useEffect(() => {
      if (!ref || !('current' in ref) || !ref.current) return;
      
      const input = ref.current as HTMLInputElement;
      
      const checkAutofill = () => {
        if (input && input.value) {
          setHasValue(true);
        }
      };
      
      // Multiple detection strategies for different browsers
      const timers: NodeJS.Timeout[] = [];
      
      // Immediate check
      checkAutofill();
      
      // Delayed checks for autofill - more frequent initially
      timers.push(setTimeout(checkAutofill, 10));
      timers.push(setTimeout(checkAutofill, 50));
      timers.push(setTimeout(checkAutofill, 100));
      timers.push(setTimeout(checkAutofill, 200));
      timers.push(setTimeout(checkAutofill, 500));
      timers.push(setTimeout(checkAutofill, 1000));
      
      // Animation event listener for CSS-triggered autofill detection
      const handleAnimationStart = (e: AnimationEvent) => {
        if (e.animationName === 'autofill') {
          setTimeout(checkAutofill, 10);
        }
      };
      
      // MutationObserver to detect attribute changes (some browsers set autofill attributes)
      const observer = new MutationObserver(() => {
        setTimeout(checkAutofill, 10);
      });
      
      observer.observe(input, {
        attributes: true,
        attributeFilter: ['value', 'class', 'style']
      });
      
      // Focus event to catch autofill on focus
      const handleFocusAutofill = () => {
        setTimeout(checkAutofill, 10);
      };
      
      input.addEventListener('animationstart', handleAnimationStart);
      input.addEventListener('focus', handleFocusAutofill);
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
        observer.disconnect();
        input.removeEventListener('animationstart', handleAnimationStart);
        input.removeEventListener('focus', handleFocusAutofill);
      };
    }, [ref, type]);

    // Check for autofill on component mount - additional safety check
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        const input = ref.current as HTMLInputElement;
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (input.value) {
            setHasValue(true);
          }
        });
      }
    }, [ref]);

    const isActive = isFocused || hasValue;

    return (
      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182] dark:text-[#71717A] z-10">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "peer w-full h-14 bg-[#F3F3F5] dark:bg-[#27272A] border rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50",
              "autofill:shadow-[0_0_0px_1000px_#F3F3F5_inset] dark:autofill:shadow-[0_0_0px_1000px_#27272A_inset]",
              "[&:-webkit-autofill]:text-[#0A0A0A] [&:-webkit-autofill:hover]:text-[#0A0A0A] [&:-webkit-autofill:focus]:text-[#0A0A0A] [&:-webkit-autofill:active]:text-[#0A0A0A]",
              "[&:-internal-autofill-selected]:text-[#0A0A0A] [&:-internal-autofill-previewed]:text-[#0A0A0A]",
              "dark:[&:-webkit-autofill]:text-white dark:[&:-webkit-autofill:hover]:text-white dark:[&:-webkit-autofill:focus]:text-white dark:[&:-webkit-autofill:active]:text-white",
              "dark:[&:-internal-autofill-selected]:text-white dark:[&:-internal-autofill-previewed]:text-white",
              icon ? "pl-10 pr-4" : "px-4",
              endIcon ? "pr-12" : "",
              error
                ? "border-[#EF4444] dark:border-[#EF4444] focus:ring-[#EF4444]/50"
                : success
                ? "border-[#10B981] dark:border-[#10B981] focus:ring-[#10B981]/50"
                : "border-transparent dark:border-white/10 focus:border-[#6366F1]/50",
              "pt-5 pb-2",
              className
            )}
            style={{
              WebkitTextFillColor: 'inherit',
              color: 'inherit',
            }}
            placeholder=""
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onInput={(e) => {
              // Handle autofill detection via input event
              const target = e.target as HTMLInputElement;
              if (target.value && !hasValue) {
                setHasValue(true);
              }
              // Call parent onInput if provided
              props.onInput?.(e);
            }}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute transition-all duration-200 pointer-events-none text-[#717182] dark:text-[#71717A]",
              icon ? "left-10" : "left-4",
              isActive
                ? "top-2 text-xs font-medium text-[#6366F1] dark:text-[#A78BFA]"
                : "top-1/2 -translate-y-1/2 text-sm",
              error && isActive && "text-[#EF4444] dark:text-[#EF4444]"
            )}
          >
            {label}
            {props.required && <span className="text-[#EF4444] ml-0.5">*</span>}
          </label>
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1.5 text-xs text-[#10B981] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
