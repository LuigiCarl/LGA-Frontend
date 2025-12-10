import { Outlet } from "react-router";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileSidebar } from "./MobileSidebar";
import { FloatingActionButton } from "./FloatingActionButton";

export function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      
      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      {/* Main Content - With left margin to account for fixed sidebar */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Outlet />
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav onMenuClick={() => setIsMobileSidebarOpen(true)} />
      </div>
    </div>
  );
}