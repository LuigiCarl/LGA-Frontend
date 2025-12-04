import { Navigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileSidebar } from "./MobileSidebar";
import { FloatingActionButton } from "./FloatingActionButton";
import { useAuth } from "../context/AuthContext";
import { KeepAliveOutlet } from "./KeepAliveOutlet";
import { useScrollRestoration } from "../context/KeepAliveContext";
import { preloadAllMainRoutes } from "../lib/routePreloader";

export function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Restore scroll position when navigating back
  useScrollRestoration(mainContentRef as React.RefObject<HTMLElement>);
  
  // Preload all main routes after initial render
  useEffect(() => {
    if (isAuthenticated) {
      // Delay preloading to not block initial render
      const timer = setTimeout(() => {
        preloadAllMainRoutes();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#6366F1]/20 dark:border-[#6366F1]/30"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#6366F1] animate-spin"></div>
          </div>
          <p className="text-[#717182] dark:text-[#A1A1AA]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div 
        className={`hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>
      
      {/* Main Content - With left margin to account for fixed sidebar */}
      <div 
        ref={mainContentRef}
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <KeepAliveOutlet 
          max={10}
          exclude={['/dashboard/admin']} // Don't cache admin page for security
        />
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav onMenuClick={() => setIsMobileSidebarOpen(true)} />
      </div>
    </div>
  );
}