import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSystemMode: boolean;
  setSystemMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  // Check if user has manually set a preference or wants to use system (read once on mount)
  const [isSystemMode, setIsSystemModeState] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved === null || saved === "system";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // If using system mode, check system preference
    if (isSystemMode) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    // Otherwise use saved preference
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen for system theme changes only when in system mode
  useEffect(() => {
    if (!isSystemMode) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    // Set initial value
    setIsDarkMode(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isSystemMode]);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    // Update localStorage only if not in system mode
    if (!isSystemMode) {
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    } else {
      // Remove darkMode key when in system mode to save space
      localStorage.removeItem("darkMode");
    }
    
    // Always save the mode preference
    localStorage.setItem("themeMode", isSystemMode ? "system" : "manual");
    
    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, isSystemMode]);

  const toggleDarkMode = useCallback(() => {
    // If currently in system mode, switch to manual mode
    if (isSystemMode) {
      setIsSystemModeState(false);
      // Toggle the current system preference
      setIsDarkMode(!window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      // Just toggle the current setting
      setIsDarkMode((prev: boolean) => !prev);
    }
  }, [isSystemMode]);

  const setSystemMode = useCallback(() => {
    setIsSystemModeState(true);
    // Immediately apply system preference
    setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  const value = useMemo(() => ({ 
    isDarkMode, 
    toggleDarkMode, 
    isSystemMode, 
    setSystemMode 
  }), [isDarkMode, toggleDarkMode, isSystemMode, setSystemMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}