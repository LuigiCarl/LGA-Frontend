import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmojiContextType {
  emoji: string;
  setEmoji: (emoji: string) => void;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

// Helper to get storage key for current user
const getEmojiStorageKey = (): string | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        return `userEmoji_${user.id}`;
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  return null;
};

// Helper to get emoji for current user
const getStoredEmoji = (): string => {
  const key = getEmojiStorageKey();
  if (key) {
    const stored = localStorage.getItem(key);
    return stored || '😊';
  }
  return '😊';
};

export function EmojiProvider({ children }: { children: ReactNode }) {
  const [emoji, setEmojiState] = useState<string>(getStoredEmoji);

  // Re-load emoji when user changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setEmojiState(getStoredEmoji());
    };

    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for user changes (same tab)
    const checkUserChange = () => {
      const newEmoji = getStoredEmoji();
      setEmojiState(prev => prev !== newEmoji ? newEmoji : prev);
    };
    
    // Check every second for user changes
    const interval = setInterval(checkUserChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const setEmoji = (newEmoji: string) => {
    const key = getEmojiStorageKey();
    if (key) {
      setEmojiState(newEmoji);
      localStorage.setItem(key, newEmoji);
    } else {
      console.warn('Cannot save emoji: No user logged in');
    }
  };

  return (
    <EmojiContext.Provider value={{ emoji, setEmoji }}>
      {children}
    </EmojiContext.Provider>
  );
}

export function useEmoji() {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmoji must be used within an EmojiProvider');
  }
  return context;
}

// Export helper to clear emoji on logout (call this from AuthContext)
export const clearUserEmoji = () => {
  const key = getEmojiStorageKey();
  if (key) {
    localStorage.removeItem(key);
  }
  // Also remove old shared key if it exists
  localStorage.removeItem('userEmoji');
};
