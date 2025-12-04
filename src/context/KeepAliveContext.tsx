import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from 'react';
import { useLocation } from 'react-router';

// Types for cached page data
interface KeepAliveContextType {
  // Cache a page's state
  cachePageState: (key: string, state: Record<string, unknown>) => void;
  // Get cached state for a page
  getCachedState: <T extends Record<string, unknown>>(key: string) => T | undefined;
  // Check if a page is cached
  isPageCached: (key: string) => boolean;
  // Clear a specific page from cache
  clearPage: (key: string) => void;
  // Clear all cached pages
  clearAllPages: () => void;
  // Get all cached page keys
  getCachedKeys: () => string[];
  // Save scroll position for current route
  saveScrollPosition: (key: string, position: number) => void;
  // Get scroll position for a route
  getScrollPosition: (key: string) => number;
  // Mark data as fetched to prevent re-fetching
  markDataFetched: (key: string, dataKey: string) => void;
  // Check if data was already fetched
  isDataFetched: (key: string, dataKey: string) => boolean;
  // Clear fetched data flags for a page
  clearFetchedData: (key: string) => void;
}

const KeepAliveContext = createContext<KeepAliveContextType | undefined>(undefined);

// Configuration
const MAX_CACHED_PAGES = 10; // Maximum number of pages to keep in cache
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL

interface KeepAliveProviderProps {
  children: ReactNode;
  maxCachedPages?: number;
  cacheTTL?: number;
}

export function KeepAliveProvider({
  children,
  maxCachedPages = MAX_CACHED_PAGES,
  cacheTTL = CACHE_TTL,
}: KeepAliveProviderProps) {
  // Store cached page states
  const [pageStates, setPageStates] = useState<Map<string, Record<string, unknown>>>(new Map());
  
  // Store scroll positions
  const scrollPositions = useRef<Map<string, number>>(new Map());
  
  // Store fetched data flags
  const fetchedDataFlags = useRef<Map<string, Set<string>>>(new Map());
  
  // Store timestamps for LRU eviction
  const accessTimestamps = useRef<Map<string, number>>(new Map());

  // Clean up expired cache entries
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    accessTimestamps.current.forEach((timestamp, key) => {
      if (now - timestamp > cacheTTL) {
        expiredKeys.push(key);
      }
    });

    if (expiredKeys.length > 0) {
      setPageStates((prev) => {
        const newMap = new Map(prev);
        expiredKeys.forEach((key) => {
          newMap.delete(key);
          scrollPositions.current.delete(key);
          fetchedDataFlags.current.delete(key);
          accessTimestamps.current.delete(key);
        });
        return newMap;
      });
    }
  }, [cacheTTL]);

  // Run cleanup periodically
  useEffect(() => {
    const interval = setInterval(cleanupExpiredEntries, 60000); // Every minute
    return () => clearInterval(interval);
  }, [cleanupExpiredEntries]);

  // Evict oldest entries if cache is full
  const evictOldestIfNeeded = useCallback(() => {
    if (pageStates.size >= maxCachedPages) {
      // Find oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      accessTimestamps.current.forEach((timestamp, key) => {
        if (timestamp < oldestTime) {
          oldestTime = timestamp;
          oldestKey = key;
        }
      });

      if (oldestKey) {
        setPageStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(oldestKey!);
          return newMap;
        });
        scrollPositions.current.delete(oldestKey);
        fetchedDataFlags.current.delete(oldestKey);
        accessTimestamps.current.delete(oldestKey);
      }
    }
  }, [maxCachedPages, pageStates.size]);

  // Cache a page's state
  const cachePageState = useCallback(
    (key: string, state: Record<string, unknown>) => {
      evictOldestIfNeeded();
      
      setPageStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(key, state);
        return newMap;
      });
      
      accessTimestamps.current.set(key, Date.now());
    },
    [evictOldestIfNeeded]
  );

  // Get cached state for a page
  const getCachedState = useCallback(
    <T extends Record<string, unknown>>(key: string): T | undefined => {
      const state = pageStates.get(key);
      if (state) {
        // Update access time
        accessTimestamps.current.set(key, Date.now());
      }
      return state as T | undefined;
    },
    [pageStates]
  );

  // Check if a page is cached
  const isPageCached = useCallback(
    (key: string): boolean => {
      return pageStates.has(key);
    },
    [pageStates]
  );

  // Clear a specific page from cache
  const clearPage = useCallback((key: string) => {
    setPageStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
    scrollPositions.current.delete(key);
    fetchedDataFlags.current.delete(key);
    accessTimestamps.current.delete(key);
  }, []);

  // Clear all cached pages
  const clearAllPages = useCallback(() => {
    setPageStates(new Map());
    scrollPositions.current.clear();
    fetchedDataFlags.current.clear();
    accessTimestamps.current.clear();
  }, []);

  // Get all cached page keys
  const getCachedKeys = useCallback((): string[] => {
    return Array.from(pageStates.keys());
  }, [pageStates]);

  // Save scroll position
  const saveScrollPosition = useCallback((key: string, position: number) => {
    scrollPositions.current.set(key, position);
  }, []);

  // Get scroll position
  const getScrollPosition = useCallback((key: string): number => {
    return scrollPositions.current.get(key) || 0;
  }, []);

  // Mark data as fetched
  const markDataFetched = useCallback((key: string, dataKey: string) => {
    if (!fetchedDataFlags.current.has(key)) {
      fetchedDataFlags.current.set(key, new Set());
    }
    fetchedDataFlags.current.get(key)!.add(dataKey);
  }, []);

  // Check if data was fetched
  const isDataFetched = useCallback((key: string, dataKey: string): boolean => {
    return fetchedDataFlags.current.get(key)?.has(dataKey) || false;
  }, []);

  // Clear fetched data flags
  const clearFetchedData = useCallback((key: string) => {
    fetchedDataFlags.current.delete(key);
  }, []);

  const value: KeepAliveContextType = {
    cachePageState,
    getCachedState,
    isPageCached,
    clearPage,
    clearAllPages,
    getCachedKeys,
    saveScrollPosition,
    getScrollPosition,
    markDataFetched,
    isDataFetched,
    clearFetchedData,
  };

  return (
    <KeepAliveContext.Provider value={value}>
      {children}
    </KeepAliveContext.Provider>
  );
}

// Hook to use keep-alive context
export function useKeepAlive() {
  const context = useContext(KeepAliveContext);
  if (!context) {
    throw new Error('useKeepAlive must be used within a KeepAliveProvider');
  }
  return context;
}

// Hook for automatic state caching in components
export function useKeepAliveState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { getCachedState, cachePageState } = useKeepAlive();
  const location = useLocation();
  const cacheKey = `${location.pathname}:${key}`;
  
  // Get initial value from cache or use provided initial value
  const cachedState = getCachedState<{ value: T }>(cacheKey);
  const [state, setState] = useState<T>(cachedState?.value ?? initialValue);
  
  // Cache state whenever it changes
  useEffect(() => {
    cachePageState(cacheKey, { value: state });
  }, [state, cacheKey, cachePageState]);
  
  return [state, setState];
}

// Hook to prevent re-fetching data
export function useCachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): { data: T | undefined; loading: boolean; error: Error | undefined; refetch: () => void } {
  const { isDataFetched, markDataFetched, getCachedState, cachePageState } = useKeepAlive();
  const location = useLocation();
  const cacheKey = `${location.pathname}:${key}`;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  
  // Get cached data
  const cachedData = getCachedState<{ data: T }>(cacheKey);
  const [data, setData] = useState<T | undefined>(cachedData?.data);
  
  const fetchData = useCallback(async (force = false) => {
    // Skip if already fetched and not forcing
    if (!force && isDataFetched(location.pathname, key) && data !== undefined) {
      return;
    }
    
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await fetchFn();
      setData(result);
      cachePageState(cacheKey, { data: result });
      markDataFetched(location.pathname, key);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, isDataFetched, markDataFetched, cachePageState, location.pathname, key, cacheKey, data]);
  
  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);
  
  return { data, loading, error, refetch };
}

// Hook to save and restore scroll position
export function useScrollRestoration(containerRef: React.RefObject<HTMLElement>) {
  const { saveScrollPosition, getScrollPosition } = useKeepAlive();
  const location = useLocation();
  const key = location.pathname;
  
  // Restore scroll position on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const savedPosition = getScrollPosition(key);
      if (savedPosition > 0) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          container.scrollTop = savedPosition;
        });
      }
    }
  }, [key, getScrollPosition, containerRef]);
  
  // Save scroll position on unmount or route change
  useEffect(() => {
    const container = containerRef.current;
    
    return () => {
      if (container) {
        saveScrollPosition(key, container.scrollTop);
      }
    };
  }, [key, saveScrollPosition, containerRef]);
  
  // Also save on scroll (debounced)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveScrollPosition(key, container.scrollTop);
      }, 100);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [key, saveScrollPosition, containerRef]);
}
