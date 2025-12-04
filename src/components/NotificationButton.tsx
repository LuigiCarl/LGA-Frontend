import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export function NotificationButton() {
  const { setIsOpen: setNotificationOpen, unreadCount } = useNotifications();

  return (
    <button
      onClick={() => setNotificationOpen(true)}
      className="relative w-9 h-9 rounded-[10px] bg-[#F3F3F5] dark:bg-[#27272A] flex items-center justify-center hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#8B5CF6] rounded-full flex items-center justify-center">
          <span className="text-[10px] text-white font-medium px-1">
            {unreadCount}
          </span>
        </span>
      )}
    </button>
  );
}
