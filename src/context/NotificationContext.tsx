import { createContext, useContext, useState, ReactNode, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { X, Check, Info, AlertCircle, Bell, Send, ArrowDown } from "lucide-react";
import { notificationsAPI } from "../lib/api";
import { useAuth } from "./AuthContext";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  direction: "sent" | "received";
  source: "user" | "admin";
  created_by?: number;
}

// Track read notification IDs in localStorage to persist across sessions
const getReadNotificationIds = (): Set<number> => {
  try {
    const stored = localStorage.getItem('readNotificationIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadNotificationIds = (ids: Set<number>) => {
  localStorage.setItem('readNotificationIds', JSON.stringify([...ids]));
};

interface NotificationContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotification: (id: number) => void;
  removeNotificationById: (id: number) => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void;
  unreadCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper to format date
const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const readIdsRef = useRef<Set<number>>(getReadNotificationIds());
  const lastFetchRef = useRef<number>(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!token || !user) return;
      
      const data = await notificationsAPI.getRecent(20);
      const readIds = readIdsRef.current;
      
      // Map API response to local notification format
      const mappedNotifications: Notification[] = (Array.isArray(data) ? data : [])
        .filter((n: any) => {
          // Determine if this is a feedback notification
          const isFeedbackNotification = n.title?.includes('feedback') || n.title?.includes('Feedback');
          
          // Privacy filtering: Regular users should only see:
          // 1. Their own feedback notifications
          // 2. Admin broadcast notifications (non-feedback)
          if (user.role !== 'admin' && isFeedbackNotification) {
            // Only show feedback notifications if the user created them
            return n.created_by === user.id;
          }
          
          // Admin sees all notifications, users see non-feedback notifications
          return true;
        })
        .map((n: any) => {
        // Determine if this is a feedback notification or admin broadcast
        const isFeedbackNotification = n.title?.includes('feedback') || n.title?.includes('Feedback');
        const isAdminBroadcast = !isFeedbackNotification;
        
        // For admins: feedback notifications are "received", broadcasts are "sent"
        // For users: feedback notifications are "sent", broadcasts are "received"
        let direction: "sent" | "received";
        let source: "user" | "admin";
        
        if (user.role === 'admin') {
          if (isFeedbackNotification) {
            direction = "received"; // Admin receives feedback from users
            source = "user";
          } else {
            direction = "sent"; // Admin sent broadcast
            source = "admin";
          }
        } else {
          if (isFeedbackNotification && n.created_by === user.id) {
            direction = "sent"; // User sent their own feedback
            source = "user";
          } else {
            direction = "received"; // User receives admin broadcasts
            source = "admin";
          }
        }
        
        // Adjust title based on direction for feedback notifications
        let displayTitle = n.title;
        if (isFeedbackNotification && direction === "sent") {
          // For sent feedback, show "Feedback" instead of "New Feedback Received"
          displayTitle = "Feedback";
        }
        
        return {
          id: n.id,
          title: displayTitle,
          description: n.description,
          date: formatRelativeDate(n.sent_at || n.created_at),
          type: n.type || 'info',
          read: readIds.has(n.id),
          direction,
          source,
          created_by: n.created_by
        };
      });
      
      setNotifications(mappedNotifications);
      lastFetchRef.current = Date.now();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Fetch on mount and periodically (every 15 seconds for more real-time feel)
  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 15 seconds for better real-time updates
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Also refresh when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      // Only fetch if it's been more than 5 seconds since last fetch
      if (Date.now() - lastFetchRef.current > 5000) {
        fetchNotifications();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Mark as read - only updates local state and localStorage, NOT the database
  const markAsRead = useCallback((id: number) => {
    readIdsRef.current.add(id);
    saveReadNotificationIds(readIdsRef.current);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  // Mark all as read - only updates local state and localStorage
  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => readIdsRef.current.add(n.id));
    saveReadNotificationIds(readIdsRef.current);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications]);

  // Clear notification from view (dismiss) - only removes from local state
  const clearNotification = useCallback((id: number) => {
    readIdsRef.current.add(id); // Also mark as read when dismissed
    saveReadNotificationIds(readIdsRef.current);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Remove notification by ID (called when admin deletes from database)
  const removeNotificationById = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Clean up from read IDs
    readIdsRef.current.delete(id);
    saveReadNotificationIds(readIdsRef.current);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "date" | "read">) => {
    setNotifications(prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1,
        date: "just now",
        read: false,
        ...notification,
      }
    ]);
  }, []);

  const value = useMemo(() => ({ 
    isOpen, 
    setIsOpen, 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    removeNotificationById,
    addNotification,
    unreadCount,
    refreshNotifications: fetchNotifications
  }), [isOpen, notifications, markAsRead, markAllAsRead, clearNotification, removeNotificationById, addNotification, unreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {isOpen && <NotificationModal />}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

const NotificationItem = memo(({ 
  notification, 
  markAsRead, 
  clearNotification, 
  getIconForType 
}: { 
  notification: Notification; 
  markAsRead: (id: number) => void; 
  clearNotification: (id: number) => void;
  getIconForType: (type: Notification["type"]) => JSX.Element;
}) => (
  <div
    className={`p-4 hover:bg-[#F9FAFB] dark:hover:bg-[#27272A] transition-colors ${
      !notification.read ? "bg-[#F0F4FF] dark:bg-[#1E1B4B]" : ""
    }`}
  >
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        {getIconForType(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="text-sm text-[#0A0A0A] dark:text-white">
              {notification.title}
            </h4>
            {notification.direction && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                notification.direction === 'sent'
                  ? 'bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20'
                  : 'bg-[#6366F1]/10 text-[#6366F1] dark:bg-[#6366F1]/20'
              }`}>
                {notification.direction === 'sent' ? (
                  <>
                    <Send className="w-3 h-3" />
                    Sent
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3" />
                    Received
                  </>
                )}
              </span>
            )}
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-[#6366F1] dark:bg-[#A78BFA] rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">
          {notification.description}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#717182] dark:text-[#71717A]">
            {notification.date}
          </span>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-xs text-[#6366F1] dark:text-[#A78BFA] hover:underline"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={() => clearNotification(notification.id)}
              className="text-xs text-[#717182] dark:text-[#71717A] hover:text-[#EF4444] dark:hover:text-[#F87171] hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
));

NotificationItem.displayName = "NotificationItem";

function NotificationModal() {
  const { isOpen, setIsOpen, notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  const getIconForType = useCallback((type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-[#10B981]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[#F59E0B]" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      default:
        return <Info className="w-5 h-5 text-[#6366F1]" />;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA]" />
            <h3 className="text-base text-[#0A0A0A] dark:text-white">Notifications</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-b border-black/10 dark:border-white/10">
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#6366F1] dark:text-[#A78BFA] hover:underline"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-[#717182] dark:text-[#71717A] mx-auto mb-3 opacity-50" />
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  markAsRead={markAsRead}
                  clearNotification={clearNotification}
                  getIconForType={getIconForType}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}