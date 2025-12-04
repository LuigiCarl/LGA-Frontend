import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import { NotificationButton } from "./NotificationButton";
import { ProfileButton } from "./ProfileButton";

export function HeaderActions() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center gap-2">
      <NotificationButton />
      <button
        onClick={toggleDarkMode}
        className="w-9 h-9 rounded-[10px] bg-[#F3F3F5] dark:bg-[#27272A] flex items-center justify-center hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-[#FCD34D]" />
        ) : (
          <Moon className="w-5 h-5 text-[#717182]" />
        )}
      </button>
      <ProfileButton />
    </div>
  );
}
