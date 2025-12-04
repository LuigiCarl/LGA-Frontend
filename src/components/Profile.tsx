import { Wallet, Camera, User, Mail, DollarSign, Bell, Moon, Globe, Lock, Info, LogOut, Eye, EyeOff, X, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDarkMode } from "../context/DarkModeContext";
import { useEmoji } from "../context/EmojiContext";
import { useCurrency, CURRENCIES, CurrencyCode } from "../context/CurrencyContext";
import { profileAPI, authAPI } from "../lib/api";
import { useToast } from "../context/ToastContext";


export function Profile() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { emoji, setEmoji } = useEmoji();
  const { currency, setCurrency, useCompactNumbers, setUseCompactNumbers } = useCurrency();
  const toast = useToast();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Load user data from localStorage or API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user) {
            setEditForm({
              name: user.name || '',
              email: user.email || '',
            });
            setOriginalData({
              name: user.name || '',
              email: user.email || '',
            });
          }
        } else {
          // Fetch from API if not in localStorage
          const user = await authAPI.getUser();
          localStorage.setItem('user', JSON.stringify(user));
          setEditForm({
            name: user.name || '',
            email: user.email || '',
          });
          setOriginalData({
            name: user.name || '',
            email: user.email || '',
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);
  
  // Emoticon picker state
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [emoticonCategory, setEmoticonCategory] = useState<"smileys" | "animals" | "food" | "activities" | "travel" | "objects" | "symbols">("smileys");
  
  const emoticons = {
    smileys: ["😊", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "🤩"],
    animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝"],
    food: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "玉米", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐"],
    activities: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹"],
    travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "✈️"],
    objects: ["⌚", "📱", "💻", "⌨", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "🧭"],
    symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "⭐", "🌟", "✨", "⚡", "🔥", "💫", "🌈", "☀️", "🌙", "⚠️"]
  };

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });

  // Original data for cancel functionality
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
  });

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "#DC2626" };
    if (strength <= 3) return { strength, label: "Fair", color: "#F59E0B" };
    if (strength <= 4) return { strength, label: "Good", color: "#10B981" };
    return { strength, label: "Strong", color: "#059669" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.password);

  const validatePasswordForm = () => {
    const errors: string[] = [];

    if (!passwordForm.current_password) {
      errors.push("Current password is required");
    }

    if (!passwordForm.password) {
      errors.push("New password is required");
    } else if (passwordForm.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!passwordForm.password_confirmation) {
      errors.push("Password confirmation is required");
    } else if (passwordForm.password !== passwordForm.password_confirmation) {
      errors.push("Passwords do not match");
    }

    if (passwordForm.current_password && passwordForm.password && passwordForm.current_password === passwordForm.password) {
      errors.push("New password must be different from current password");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      await profileAPI.updatePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });

      // Show success message
      setShowSuccessMessage(true);
      setShowPasswordDialog(false);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setPasswordErrors([]);

      toast.success("Password updated successfully!");

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      setPasswordErrors([errorMessage]);
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    setPasswordErrors([]);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = () => {
    navigate("/");
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm(originalData);
  };

  const handleSaveEdit = async () => {
    try {
      await profileAPI.update({
        name: editForm.name,
        email: editForm.email,
        currency: editForm.currency,
      });

      // Show toast notification
      toast.success("Profile updated successfully!");

      // Exit edit mode
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3 lg:hidden mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[10px] flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">FinanEase</h1>
        </div>
        <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white capitalize">Profile</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-24 h-24 bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 dark:from-[#6366F1] dark:to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/10 dark:shadow-[#6366F1]/30">
                  <span className="text-5xl">{emoji}</span>
                </div>
                <button
                  onClick={() => setShowEmoticonPicker(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 transition-all"
                  aria-label="Change avatar"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <h3 className="text-base text-[#0A0A0A] dark:text-white mb-1">{editForm.name || 'User'}</h3>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">{editForm.email || 'No email'}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base text-[#0A0A0A] dark:text-white">Account Information</h3>
              {!isEditMode && (
                <button
                  onClick={handleEditClick}
                  className="h-8 px-3 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditMode ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Name</label>
                  </div>
                  <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] opacity-50 rounded-lg flex items-center">
                    <span className="text-sm text-[#0A0A0A] dark:text-white">{editForm.name}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Email</label>
                  </div>
                  <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] opacity-50 rounded-lg flex items-center">
                    <span className="text-sm text-[#0A0A0A] dark:text-white">{editForm.email}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Currency</label>
                  </div>
                  <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] opacity-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-[#0A0A0A] dark:text-white">
                      {CURRENCIES[currency]?.code} - {CURRENCIES[currency]?.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Name</label>
                  </div>
                  <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-sm text-[#0A0A0A] dark:text-white focus:outline-none"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Email</label>
                  </div>
                  <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                    <input
                      type="email"
                      className="w-full h-full bg-transparent text-sm text-[#0A0A0A] dark:text-white focus:outline-none"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                    <label className="text-sm text-[#0A0A0A] dark:text-white">Currency</label>
                  </div>
                  <div className="h-9 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                    <select
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value as CurrencyCode);
                        toast.success(`Currency changed to ${CURRENCIES[e.target.value as CurrencyCode].name}`);
                      }}
                      className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg text-sm text-[#0A0A0A] dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    >
                      {Object.values(CURRENCIES).map((curr) => (
                        <option 
                          key={curr.code} 
                          value={curr.code}
                          className="bg-white dark:bg-[#27272A] text-[#0A0A0A] dark:text-white"
                        >
                          {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <h3 className="text-base text-[#0A0A0A] dark:text-white mb-6">Settings</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
                  <div>
                    <p className="text-base text-[#0A0A0A] dark:text-white">Notifications</p>
                    <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Receive budget alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="w-11 h-6 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-end px-0.5 transition-colors shadow-sm shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30"
                >
                  <div className="w-5 h-5 bg-white rounded-full" />
                </button>
              </div>

              <div className="h-px bg-black/10 dark:bg-white/10" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-[#717182] dark:text-[#A78BFA]" />
                  <div>
                    <p className="text-base text-[#0A0A0A] dark:text-white">Dark Mode</p>
                    <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Toggle dark theme</p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all ${
                    isDarkMode 
                      ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] justify-end shadow-[#6366F1]/30" 
                      : "bg-[#CBCED4] justify-start"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="h-px bg-black/10 dark:bg-white/10" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
                  <div>
                    <p className="text-base text-[#0A0A0A] dark:text-white">Compact Numbers</p>
                    <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Show 1K, 1M format</p>
                  </div>
                </div>
                <button
                  onClick={() => setUseCompactNumbers(!useCompactNumbers)}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all ${
                    useCompactNumbers 
                      ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] justify-end shadow-[#6366F1]/30" 
                      : "bg-[#CBCED4] justify-start"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="h-px bg-black/10 dark:bg-white/10" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
                  <div>
                    <p className="text-base text-[#0A0A0A] dark:text-white">Language</p>
                    <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">English</p>
                  </div>
                </div>
                <button className="h-8 px-3 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <h3 className="text-base text-[#0A0A0A] dark:text-white mb-4">Security</h3>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg flex items-center gap-3 px-3 hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
            >
              <Lock className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
              <span className="text-sm text-[#0A0A0A] dark:text-white">Change Password</span>
            </button>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
              <h3 className="text-base text-[#0A0A0A] dark:text-white">About</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">FinanEase v1.0</p>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Manage your finances with ease</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full h-9 bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center gap-3 hover:bg-[#FEE2E2] dark:hover:bg-[#27272A] transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
            <span className="text-sm text-[#D4183D] dark:text-[#F87171]">Sign Out</span>
          </button>

          {/* Sign Out Dialog */}
          {showSignOutDialog && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-md w-full shadow-xl">
                <div className="mb-6">
                  <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">Sign Out</h3>
                  <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Are you sure you want to sign out of your account?</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignOutDialog(false)}
                    className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSignOut}
                    className="flex-1 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Emoticon Picker Dialog */}
          {showEmoticonPicker && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl text-[#0A0A0A] dark:text-white">Choose Avatar</h3>
                  <button
                    onClick={() => setShowEmoticonPicker(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-[#717182] dark:text-[#A1A1AA]" />
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {(["smileys", "animals", "food", "activities", "travel", "objects", "symbols"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEmoticonCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                        emoticonCategory === cat
                          ? "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-sm"
                          : "bg-[#F3F3F5] dark:bg-[#27272A] text-[#717182] dark:text-[#A1A1AA] hover:bg-[#ECECF0] dark:hover:bg-[#18181B]"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Emoticon Grid */}
                <div className="grid grid-cols-7 gap-2 max-h-[280px] overflow-y-auto mb-6 p-2">
                  {emoticons[emoticonCategory].map((emoticon) => (
                    <button
                      key={emoticon}
                      onClick={() => {
                        setEmoji(emoticon);
                        setShowEmoticonPicker(false);
                        toast.success("Avatar updated successfully!");
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                        emoji === emoticon
                          ? "bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 dark:from-[#6366F1]/30 dark:to-[#8B5CF6]/30 ring-2 ring-[#6366F1] dark:ring-[#8B5CF6]"
                          : "hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
                      }`}
                    >
                      {emoticon}
                    </button>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowEmoticonPicker(false)}
                  className="w-full h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Password Dialog */}
          {showPasswordDialog && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 max-w-md w-full shadow-xl">
                <div className="mb-6">
                  <h3 className="text-xl text-[#0A0A0A] dark:text-white mb-2">Change Password</h3>
                  <p className="text-sm text-[#717182] dark:text-[#A1A1AA]">Enter your current and new password to update your account.</p>
                </div>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                        <label className="text-sm text-[#0A0A0A] dark:text-white">Current Password</label>
                      </div>
                      <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="w-full h-full bg-transparent text-sm text-[#0A0A0A] dark:text-white focus:outline-none"
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="h-5 w-5 text-[#0A0A0A] dark:text-[#A78BFA]"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                        <label className="text-sm text-[#0A0A0A] dark:text-white">New Password</label>
                      </div>
                      <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="w-full h-full bg-transparent text-sm text-[#0A0A0A] dark:text-white focus:outline-none"
                          value={passwordForm.password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="h-5 w-5 text-[#0A0A0A] dark:text-[#A78BFA]"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="mt-1 text-sm text-[#717182] dark:text-[#A1A1AA]">
                        <span className="font-bold">Strength:</span> <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-[#0A0A0A] dark:text-[#A78BFA]" />
                        <label className="text-sm text-[#0A0A0A] dark:text-white">Confirm Password</label>
                      </div>
                      <div className="h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] rounded-lg flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full h-full bg-transparent text-sm text-[#0A0A0A] dark:text-white focus:outline-none"
                          value={passwordForm.password_confirmation}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                        />
                        <button
                          type="button"
                          className="h-5 w-5 text-[#0A0A0A] dark:text-[#A78BFA]"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordErrors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-[#DC2626]">Please fix the following errors:</p>
                      <ul className="list-disc list-inside">
                        {passwordErrors.map((error, index) => (
                          <li key={index} className="text-sm text-[#DC2626]">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {showSuccessMessage && (
                    <div className="mt-4">
                      <p className="text-sm text-[#10B981]">Password changed successfully!</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handlePasswordDialogClose}
                      className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-[10px] shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/30 dark:hover:shadow-[#6366F1]/40 transition-all"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}