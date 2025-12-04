import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router';

interface CachedRoute {
  key: string;
  element: React.ReactNode;
  pathname: string;
}

interface KeepAliveOutletProps {
  // Maximum number of routes to keep alive
  max?: number;
  // Routes to exclude from caching (by pathname pattern)
  exclude?: (string | RegExp)[];
  // Routes to include in caching (by pathname pattern) - if provided, only these are cached
  include?: (string | RegExp)[];
}

/**
 * KeepAliveOutlet - A replacement for React Router's Outlet that keeps
 * previously visited routes in memory and restores them instantly.
 * 
 * This component renders all cached routes but only shows the current one,
 * keeping the others hidden with CSS (display: none).
 */
export function KeepAliveOutlet({
  max = 10,
  exclude = [],
  include,
}: KeepAliveOutletProps) {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const [cachedRoutes, setCachedRoutes] = useState<CachedRoute[]>([]);
  
  // Check if a pathname should be cached
  const shouldCache = (pathname: string): boolean => {
    // Check exclusions first
    for (const pattern of exclude) {
      if (typeof pattern === 'string') {
        if (pathname === pattern || pathname.startsWith(pattern + '/')) {
          return false;
        }
      } else if (pattern.test(pathname)) {
        return false;
      }
    }
    
    // If include is provided, only cache matching routes
    if (include && include.length > 0) {
      for (const pattern of include) {
        if (typeof pattern === 'string') {
          if (pathname === pattern || pathname.startsWith(pattern + '/')) {
            return true;
          }
        } else if (pattern.test(pathname)) {
          return true;
        }
      }
      return false;
    }
    
    return true;
  };
  
  // Update cached routes when location changes
  useEffect(() => {
    if (!currentOutlet) return;
    
    const currentKey = location.pathname + location.search;
    
    setCachedRoutes((prev) => {
      // Check if this route should be cached
      if (!shouldCache(location.pathname)) {
        // Remove from cache if it exists and shouldn't be cached
        return prev.filter((route) => route.pathname !== location.pathname);
      }
      
      // Check if route already exists in cache
      const existingIndex = prev.findIndex((route) => route.pathname === location.pathname);
      
      if (existingIndex >= 0) {
        // Move to end (most recently used) and update element
        const updated = [...prev];
        const existing = updated.splice(existingIndex, 1)[0];
        if (existing) {
          existing.element = currentOutlet;
          existing.key = currentKey;
          updated.push(existing);
        }
        return updated;
      }
      
      // Add new route to cache
      const newRoute: CachedRoute = {
        key: currentKey,
        element: currentOutlet,
        pathname: location.pathname,
      };
      
      // If at max capacity, remove oldest route
      if (prev.length >= max) {
        return [...prev.slice(1), newRoute];
      }
      
      return [...prev, newRoute];
    });
  }, [location.pathname, location.search, currentOutlet, max]);
  
  // Memoize the rendered routes to prevent unnecessary re-renders
  const renderedRoutes = useMemo(() => {
    return cachedRoutes.map((route) => {
      const isActive = route.pathname === location.pathname;
      
      return (
        <div
          key={route.pathname}
          style={{
            display: isActive ? 'contents' : 'none',
            // Ensure hidden routes don't affect layout
            position: isActive ? 'relative' : 'absolute',
            width: isActive ? 'auto' : 0,
            height: isActive ? 'auto' : 0,
            overflow: isActive ? 'visible' : 'hidden',
          }}
          aria-hidden={!isActive}
        >
          {route.element}
        </div>
      );
    });
  }, [cachedRoutes, location.pathname]);
  
  // If current route is not in cache and shouldn't be cached, render directly
  const isCurrentCached = cachedRoutes.some((route) => route.pathname === location.pathname);
  
  if (!isCurrentCached && currentOutlet) {
    return (
      <>
        {renderedRoutes}
        <div style={{ display: 'contents' }}>
          {currentOutlet}
        </div>
      </>
    );
  }
  
  return <>{renderedRoutes}</>;
}

/**
 * Hook to manually control keep-alive cache
 */
export function useKeepAliveControl() {
  const [, forceUpdate] = useState({});
  
  // Force a re-render to update cached routes
  const refresh = () => forceUpdate({});
  
  return { refresh };
}
