import { Suspense } from 'react';

/**
 * Loading fallback component - optimized for fast render
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0A0A0A]">
    <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * Wrapper component for lazy loaded routes with Suspense
 */
export const LazyComponent = ({
  Component,
}: {
  Component: React.LazyExoticComponent<React.ComponentType<unknown>>;
}) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);
