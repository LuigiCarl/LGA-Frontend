import React, { useCallback, useRef, MouseEvent, FocusEvent } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router';
import { preloadRoute } from '../lib/routePreloader';

/**
 * PreloadLink Component
 * 
 * A Link component that preloads routes on hover or focus.
 * This ensures that when the user clicks, the component and data
 * are already loaded, making navigation feel instant.
 * 
 * Features:
 * - Preloads on hover (with delay to prevent unnecessary loads)
 * - Preloads on focus (for keyboard navigation)
 * - Preloads on touch start (for mobile)
 * - Debounced to prevent duplicate preloads
 */

interface PreloadLinkProps extends LinkProps {
  /** Delay before preloading on hover (ms) */
  preloadDelay?: number;
  /** Whether to preload on hover */
  preloadOnHover?: boolean;
  /** Whether to preload on focus */
  preloadOnFocus?: boolean;
  /** Custom preload function */
  customPreload?: () => Promise<void>;
  children: React.ReactNode;
}

export function PreloadLink({
  to,
  preloadDelay = 100,
  preloadOnHover = true,
  preloadOnFocus = true,
  customPreload,
  children,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: PreloadLinkProps) {
  const preloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPreloadedRef = useRef(false);

  const doPreload = useCallback(async () => {
    if (hasPreloadedRef.current) return;
    
    hasPreloadedRef.current = true;
    
    try {
      if (customPreload) {
        await customPreload();
      } else {
        const path = typeof to === 'string' ? to : to.pathname || '';
        await preloadRoute(path);
      }
    } catch (error) {
      // Reset on error so we can try again
      hasPreloadedRef.current = false;
      console.warn('Preload failed:', error);
    }
  }, [to, customPreload]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (preloadOnHover) {
        // Delay preload slightly to avoid preloading on quick mouse movements
        preloadTimeoutRef.current = setTimeout(() => {
          doPreload();
        }, preloadDelay);
      }
      onMouseEnter?.(e);
    },
    [doPreload, preloadDelay, preloadOnHover, onMouseEnter]
  );

  const handleMouseLeave = useCallback(() => {
    // Cancel preload if mouse leaves before delay
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLAnchorElement>) => {
      if (preloadOnFocus) {
        doPreload();
      }
      onFocus?.(e);
    },
    [doPreload, preloadOnFocus, onFocus]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLAnchorElement>) => {
      // Preload immediately on touch
      doPreload();
      onTouchStart?.(e);
    },
    [doPreload, onTouchStart]
  );

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Hook for programmatic navigation with preloading
 */
export function usePreloadNavigate() {
  const navigate = useNavigate();
  
  return useCallback(async (to: string, options?: { replace?: boolean }) => {
    // Start preloading
    const preloadPromise = preloadRoute(to);
    
    // Navigate immediately (data will be ready or loading)
    navigate(to, options);
    
    // Wait for preload to complete in background
    await preloadPromise;
  }, [navigate]);
}

/**
 * Hook for preloading routes on component mount
 * Useful for preloading likely next pages
 */
export function usePreloadRoutes(paths: string[], deps: React.DependencyList = []) {
  React.useEffect(() => {
    // Preload after a short delay to not block initial render
    const timeout = setTimeout(() => {
      paths.forEach(path => {
        preloadRoute(path);
      });
    }, 1000);
    
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default PreloadLink;
