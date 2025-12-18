/**
 * Storage Manager Utility
 * Manages localStorage with size limits and automatic cleanup
 */

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit for localStorage
const STORAGE_CHECK_KEY = 'storage_size_check';

/**
 * Get approximate size of localStorage in bytes
 */
export const getStorageSize = (): number => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage.getItem(key)?.length || 0;
      total += key.length;
    }
  }
  return total;
};

/**
 * Check if localStorage is approaching limit
 */
export const isStorageNearLimit = (): boolean => {
  return getStorageSize() > MAX_STORAGE_SIZE * 0.8; // 80% threshold
};

/**
 * Clean up old or unnecessary localStorage entries
 */
export const cleanupStorage = (): void => {
  const keysToKeep = [
    'auth_token',
    'user',
    'auth_token_expires',
    'themeMode',
    'darkMode',
    'currency',
  ];

  // Remove entries that match patterns for old/temporary data
  const keysToRemove: string[] = [];
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Keep essential keys
      if (keysToKeep.includes(key)) continue;
      
      // Keep user emoji keys (userEmoji_XXX)
      if (key.startsWith('userEmoji_')) continue;
      
      // Remove old/temporary keys
      if (
        key.startsWith('temp_') ||
        key.startsWith('cache_') ||
        key.includes('_old') ||
        key.includes('_backup')
      ) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  if (keysToRemove.length > 0) {
    console.log(`🧹 Cleaned up ${keysToRemove.length} localStorage entries`);
  }
};

/**
 * Safely set item in localStorage with size check
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    // Check if adding this would exceed limit
    const estimatedSize = getStorageSize() + key.length + value.length;
    
    if (estimatedSize > MAX_STORAGE_SIZE) {
      console.warn('⚠️ localStorage near limit, cleaning up...');
      cleanupStorage();
      
      // Try again after cleanup
      const newSize = getStorageSize() + key.length + value.length;
      if (newSize > MAX_STORAGE_SIZE) {
        console.error('❌ localStorage full, cannot save', key);
        return false;
      }
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    cleanupStorage();
    return false;
  }
};

/**
 * Initialize storage manager - run on app startup
 */
export const initStorageManager = (): void => {
  // Check storage size on init
  const size = getStorageSize();
  console.log(`📦 localStorage size: ${(size / 1024).toFixed(2)} KB`);
  
  // Clean up if near limit
  if (isStorageNearLimit()) {
    console.warn('⚠️ localStorage near limit, running cleanup...');
    cleanupStorage();
  }
  
  // Run cleanup periodically (every 30 minutes)
  setInterval(() => {
    if (isStorageNearLimit()) {
      cleanupStorage();
    }
  }, 30 * 60 * 1000);
};

/**
 * Get storage statistics
 */
export const getStorageStats = () => {
  const size = getStorageSize();
  const itemCount = Object.keys(localStorage).length;
  const percentUsed = (size / MAX_STORAGE_SIZE) * 100;
  
  return {
    size,
    sizeFormatted: `${(size / 1024).toFixed(2)} KB`,
    itemCount,
    percentUsed: percentUsed.toFixed(1),
    nearLimit: isStorageNearLimit(),
  };
};
