import { Users, MessageSquare, Search, Filter, Plus, Pencil, Trash2, X, Send, Info, AlertCircle, Check, Bell, Ban, CheckCircle, GripVertical, LayoutGrid } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "../context/CurrencyContext";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { HeaderActions } from "./HeaderActions";
import { adminAPI } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  totalTransactions: number;
  totalSpent: number;
  status: "active" | "blocked";
}

interface Feedback {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  date: string;
  status: "new" | "reviewed" | "resolved";
  rating?: number;
}

interface BroadcastNotification {
  id: number;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
  date: string;
  sentBy: string;
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<"users" | "feedback" | "notifications">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClientHook = useQueryClient();
  const { removeNotificationById, refreshNotifications } = useNotifications();
  const toast = useToast();
  const { formatCurrency } = useCurrency();
  
  // Drag and drop states for user management
  const [draggedUserId, setDraggedUserId] = useState<number | null>(null);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const dragOverItemRef = useRef<number | null>(null);
  
  // User CRUD states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userStatus, setUserStatus] = useState<"active" | "blocked">("active");

  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");
  const [notificationType, setNotificationType] = useState<"info" | "success" | "warning" | "error">("info");
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Debounced search params for API calls
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedStatus, setDebouncedStatus] = useState("all");

  // Debounce search and status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedStatus(statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Users query with React Query - always fetch, not just when tab is active
  const usersQueryParams = {
    ...(debouncedSearch && activeTab === 'users' && { search: debouncedSearch }),
    ...(debouncedStatus !== 'all' && activeTab === 'users' && { status: debouncedStatus }),
  };
  
  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: queryKeys.admin.users(usersQueryParams),
    queryFn: () => adminAPI.users.getAll(usersQueryParams),
    staleTime: 30 * 1000, // 30 seconds - admin data should be fairly fresh
    refetchOnWindowFocus: true,
    refetchInterval: activeTab === 'users' ? 30 * 1000 : false, // Auto-refresh when on users tab
  });

  // Map users data
  const users: User[] = (() => {
    if (!usersData) return [];
    let rawUsers: any[] = [];
    if (Array.isArray(usersData)) {
      rawUsers = usersData;
    } else if ((usersData as any).data && Array.isArray((usersData as any).data)) {
      rawUsers = (usersData as any).data;
    } else if ((usersData as any).users?.data) {
      rawUsers = (usersData as any).users.data;
    } else if (Array.isArray((usersData as any).users)) {
      rawUsers = (usersData as any).users;
    }
    return rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      joinDate: u.join_date || u.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      totalTransactions: u.transactions_count || 0,
      totalSpent: parseFloat(u.total_spent) || 0,
      status: u.status || 'active'
    }));
  })();

  // Feedback query params - always fetch
  const feedbackQueryParams = {
    ...(debouncedSearch && activeTab === 'feedback' && { search: debouncedSearch }),
    ...(debouncedStatus !== 'all' && activeTab === 'feedback' && { status: debouncedStatus }),
  };

  const { 
    data: feedbackData, 
    isLoading: isLoadingFeedback 
  } = useQuery({
    queryKey: queryKeys.admin.feedback(feedbackQueryParams),
    queryFn: () => adminAPI.feedback.getAll(feedbackQueryParams),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: activeTab === 'feedback' ? 30 * 1000 : false, // Auto-refresh when on feedback tab
  });

  // Map feedback data
  const feedbackList: Feedback[] = (() => {
    if (!feedbackData) return [];
    let rawFeedback: any[] = [];
    if (Array.isArray(feedbackData)) {
      rawFeedback = feedbackData;
    } else if ((feedbackData as any).data && Array.isArray((feedbackData as any).data)) {
      rawFeedback = (feedbackData as any).data;
    } else if ((feedbackData as any).feedbacks?.data && Array.isArray((feedbackData as any).feedbacks.data)) {
      rawFeedback = (feedbackData as any).feedbacks.data;
    } else if (Array.isArray((feedbackData as any).feedbacks)) {
      rawFeedback = (feedbackData as any).feedbacks;
    }
    return rawFeedback.map((f: any) => {
      const today = new Date();
      let dateStr: string = today.toISOString().split('T')[0]!;
      if (f.created_at) {
        try {
          const parsed = new Date(f.created_at);
          dateStr = parsed.toISOString().split('T')[0]!;
        } catch (e) {
          // Use default
        }
      }
      return {
        id: f.id,
        userId: f.user_id,
        userName: f.user?.name || 'Unknown User',
        userEmail: f.user?.email || 'No email',
        subject: f.subject,
        message: f.message,
        date: dateStr,
        status: f.status as 'new' | 'reviewed' | 'resolved',
        rating: f.rating
      };
    });
  })();

  // Notifications query - always fetch
  const { 
    data: notificationsData, 
    isLoading: isLoadingNotifications 
  } = useQuery({
    queryKey: queryKeys.admin.notifications(),
    queryFn: () => adminAPI.notifications.getAll(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: activeTab === 'notifications' ? 30 * 1000 : false, // Auto-refresh when on notifications tab
  });

  // Map notifications data
  const broadcastNotifications: BroadcastNotification[] = (() => {
    if (!notificationsData) return [];
    let rawNotifications: any[] = [];
    if (Array.isArray(notificationsData)) {
      rawNotifications = notificationsData;
    } else if ((notificationsData as any).data && Array.isArray((notificationsData as any).data)) {
      rawNotifications = (notificationsData as any).data;
    } else if ((notificationsData as any).notifications?.data) {
      rawNotifications = (notificationsData as any).notifications.data;
    } else if (Array.isArray((notificationsData as any).notifications)) {
      rawNotifications = (notificationsData as any).notifications;
    }
    return rawNotifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      type: n.type || 'info',
      date: n.sent_at?.split('T')[0] || n.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      sentBy: n.creator?.name || 'Admin'
    }));
  })();

  // Feedback status mutation
  const feedbackStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'new' | 'reviewed' | 'resolved' }) => 
      adminAPI.feedback.updateStatus(id, status),
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.feedback() });
    },
  });

  // Notification delete mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => adminAPI.notifications.delete(id),
    onSuccess: (_, deletedId) => {
      // Update admin panel cache
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.notifications() });
      // Update user notification badge by removing from context
      removeNotificationById(deletedId);
      // Refresh user notifications to sync badge count
      refreshNotifications();
    },
  });

  // Notification create mutation
  const createNotificationMutation = useMutation({
    mutationFn: (data: { title: string; description: string; type: 'info' | 'success' | 'warning' | 'error' }) => 
      adminAPI.notifications.create(data),
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.notifications() });
      // Refresh user notifications to show new notification
      refreshNotifications();
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: (id: number) => adminAPI.users.block(id),
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.users() });
      toast.success("User blocked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to block user");
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: (id: number) => adminAPI.users.unblock(id),
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.users() });
      toast.success("User unblocked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    },
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = feedback.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredNotifications = broadcastNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || notification.type === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return "text-[#00A63E] dark:text-[#4ADE80] bg-[#00A63E]/10";
      case "inactive":
        return "text-[#717182] dark:text-[#A1A1AA] bg-[#717182]/10";
      case "blocked":
        return "text-[#D4183D] dark:text-[#F87171] bg-[#D4183D]/10";
      case "new":
        return "text-[#6366F1] dark:text-[#A78BFA] bg-[#6366F1]/10";
      case "reviewed":
        return "text-[#F59E0B] dark:text-[#FCD34D] bg-[#F59E0B]/10";
      default:
        return "text-[#717182] dark:text-[#A1A1AA] bg-[#717182]/10";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-[#00A63E] dark:text-[#4ADE80] bg-[#00A63E]/10";
      case "warning":
        return "text-[#F59E0B] dark:text-[#FCD34D] bg-[#F59E0B]/10";
      case "error":
        return "text-[#D4183D] dark:text-[#F87171] bg-[#D4183D]/10";
      case "info":
      default:
        return "text-[#6366F1] dark:text-[#A78BFA] bg-[#6366F1]/10";
    }
  };

  const getTypeIcon = (type: "info" | "success" | "warning" | "error") => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-[#00A63E] dark:text-[#4ADE80]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[#F59E0B] dark:text-[#FCD34D]" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#D4183D] dark:text-[#F87171]" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA]" />;
    }
  };

  // User CRUD operations
  const handleAddUser = () => {
    setEditingUser(null);
    setUserName("");
    setUserEmail("");
    setUserStatus("active");
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserStatus(user.status);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userName || !userEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingUser) {
        await adminAPI.users.update(editingUser.id, {
          name: userName,
          email: userEmail,
          status: userStatus
        });
        toast.success("User updated successfully");
      } else {
        await adminAPI.users.create({
          name: userName,
          email: userEmail,
          status: userStatus
        });
        toast.success("User created successfully");
      }
      
      // Invalidate users cache to refetch
      queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.users() });
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserName("");
      setUserEmail("");
      setUserStatus("active");
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = (id: number) => {
    setUserToDelete(id);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await adminAPI.users.delete(userToDelete);
        // Invalidate users cache to refetch
        queryClientHook.invalidateQueries({ queryKey: queryKeys.admin.users() });
        setUserToDelete(null);
        toast.success("User deleted successfully");
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  // Feedback operations
  const handleMarkAsReviewed = (feedbackId: number) => {
    feedbackStatusMutation.mutate({ id: feedbackId, status: 'reviewed' });
  };

  const handleMarkAsResolved = (feedbackId: number) => {
    feedbackStatusMutation.mutate({ id: feedbackId, status: 'resolved' });
  };

  // Notification operations
  const handleBroadcastNotification = () => {
    if (!notificationTitle || !notificationDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    createNotificationMutation.mutate({
      title: notificationTitle,
      description: notificationDescription,
      type: notificationType
    }, {
      onSuccess: () => {
        setShowNotificationModal(false);
        setShowSuccessModal(true);
        setNotificationTitle("");
        setNotificationDescription("");
        setNotificationType("info");
        toast.success("Notification broadcasted successfully");
      },
      onError: (error: any) => {
        console.error('Failed to send notification:', error);
        toast.error(error.response?.data?.message || 'Failed to send notification. Please try again.');
      }
    });
  };

  const handleDeleteNotification = (id: number) => {
    setNotificationToDelete(id);
  };

  const confirmDeleteNotification = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete, {
        onSuccess: () => {
          setNotificationToDelete(null);
          toast.success("Notification deleted successfully");
        },
        onError: (error: any) => {
          console.error('Failed to delete notification:', error);
          toast.error(error.response?.data?.message || 'Failed to delete notification. Please try again.');
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 lg:hidden mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="FinanEase Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">FinanEase</h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white">Admin Panel</h2>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <HeaderActions />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Tabs */}
          <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex mb-6">
            <button
              className={`flex-1 h-10 rounded-[12px] text-sm transition-all ${
                activeTab === "users"
                  ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                  : "text-[#0A0A0A] dark:text-[#A1A1AA]"
              }`}
              onClick={() => {
                setActiveTab("users");
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users ({users.length})</span>
                <span className="sm:hidden">Users</span>
              </div>
            </button>
            <button
              className={`flex-1 h-10 rounded-[12px] text-sm transition-all ${
                activeTab === "feedback"
                  ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                  : "text-[#0A0A0A] dark:text-[#A1A1AA]"
              }`}
              onClick={() => {
                setActiveTab("feedback");
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Feedback ({feedbackList.length})</span>
                <span className="sm:hidden">Feedback</span>
              </div>
            </button>
            <button
              className={`flex-1 h-10 rounded-[12px] text-sm transition-all ${
                activeTab === "notifications"
                  ? "bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm"
                  : "text-[#0A0A0A] dark:text-[#A1A1AA]"
              }`}
              onClick={() => {
                setActiveTab("notifications");
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications ({broadcastNotifications.length})</span>
                <span className="sm:hidden">Notify</span>
              </div>
            </button>
          </div>

          {/* Search, Filters, and Action Button */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#F3F3F5] dark:bg-[#18181B] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              />
            </div>
            <div className="relative lg:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#F3F3F5] dark:bg-[#18181B] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] appearance-none"
              >
                <option value="all">All {activeTab === "users" ? "Status" : activeTab === "notifications" ? "Types" : "Status"}</option>
                {activeTab === "users" ? (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </>
                ) : activeTab === "notifications" ? (
                  <>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </>
                ) : (
                  <>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </>
                )}
              </select>
            </div>
            {activeTab === "users" && (
              <>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-[#F3F3F5] dark:bg-[#18181B] rounded-[12px] p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`h-9 px-3 rounded-[10px] flex items-center justify-center transition-all ${
                      viewMode === "list" 
                        ? "bg-white dark:bg-[#27272A] text-[#0A0A0A] dark:text-white shadow-sm" 
                        : "text-[#717182] dark:text-[#A1A1AA]"
                    }`}
                    title="List view"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`h-9 px-3 rounded-[10px] flex items-center justify-center transition-all ${
                      viewMode === "grid" 
                        ? "bg-white dark:bg-[#27272A] text-[#0A0A0A] dark:text-white shadow-sm" 
                        : "text-[#717182] dark:text-[#A1A1AA]"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                {/* Auto Arrange Button */}
                <button
                  onClick={() => {
                    // Sort users by total spent (highest first)
                    const sorted = [...filteredUsers].sort((a, b) => b.totalSpent - a.totalSpent);
                    setUserOrder(sorted.map(u => u.id));
                    toast.success("Users arranged by spending");
                  }}
                  className="h-11 px-4 bg-[#F3F3F5] dark:bg-[#18181B] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white flex items-center justify-center gap-2 hover:bg-[#ECECF0] dark:hover:bg-[#27272A] transition-all"
                  title="Auto arrange by spending"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Arrange</span>
                </button>
                <button
                  onClick={handleAddUser}
                  className="h-11 px-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[12px] text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add User</span>
                </button>
              </>
            )}
            {activeTab === "notifications" && (
              <button
                onClick={() => setShowNotificationModal(true)}
                className="h-11 px-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[12px] text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
              >
                <Send className="w-5 h-5" />
                Broadcast
              </button>
            )}
          </div>

          {/* Content */}
          {activeTab === "users" ? (
            <div>
              {isLoadingUsers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-3"></div>
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[#717182] dark:text-[#A1A1AA] mx-auto mb-3" />
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">No users found</p>
                </div>
              ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(userOrder.length > 0 
                    ? userOrder.map(id => filteredUsers.find(u => u.id === id)).filter(Boolean) as User[]
                    : filteredUsers
                  ).map((user) => (
                    <div
                      key={user.id}
                      draggable
                      onDragStart={() => setDraggedUserId(user.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        dragOverItemRef.current = user.id;
                      }}
                      onDragEnd={() => {
                        if (draggedUserId !== null && dragOverItemRef.current !== null && draggedUserId !== dragOverItemRef.current) {
                          const currentOrder = userOrder.length > 0 ? userOrder : filteredUsers.map(u => u.id);
                          const draggedIndex = currentOrder.indexOf(draggedUserId);
                          const targetIndex = currentOrder.indexOf(dragOverItemRef.current);
                          const newOrder = [...currentOrder];
                          newOrder.splice(draggedIndex, 1);
                          newOrder.splice(targetIndex, 0, draggedUserId);
                          setUserOrder(newOrder);
                          toast.info("User position updated");
                        }
                        setDraggedUserId(null);
                        dragOverItemRef.current = null;
                      }}
                      className={`bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 cursor-move hover:shadow-lg dark:hover:shadow-[#6366F1]/10 transition-all ${
                        draggedUserId === user.id ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center mb-3">
                          <span className="text-xl text-white">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <p className="text-base text-[#0A0A0A] dark:text-white truncate w-full">{user.name}</p>
                        <p className="text-xs text-[#717182] dark:text-[#A1A1AA] truncate w-full mb-2">{user.email}</p>
                        <span className={`px-3 py-1 rounded-full text-xs capitalize mb-3 ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                        <div className="flex gap-4 text-center mb-3">
                          <div>
                            <p className="text-lg text-[#0A0A0A] dark:text-white">{user.totalTransactions}</p>
                            <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Txns</p>
                          </div>
                          <div>
                            <p className="text-lg text-[#0A0A0A] dark:text-white">{formatCurrency(user.totalSpent)}</p>
                            <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Spent</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {user.status === "blocked" ? (
                            <button
                              onClick={() => unblockUserMutation.mutate(user.id)}
                              disabled={unblockUserMutation.isPending}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E5F9E5] dark:hover:bg-[#1F3F1F] transition-colors disabled:opacity-50"
                              title="Unblock user"
                            >
                              <CheckCircle className="w-4 h-4 text-[#00A63E] dark:text-[#4ADE80]" />
                            </button>
                          ) : (
                            <button
                              onClick={() => blockUserMutation.mutate(user.id)}
                              disabled={blockUserMutation.isPending}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FFE5E5] dark:hover:bg-[#3F1F1F] transition-colors disabled:opacity-50"
                              title="Block user"
                            >
                              <Ban className="w-4 h-4 text-[#F59E0B] dark:text-[#FCD34D]" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  {(userOrder.length > 0 
                    ? userOrder.map(id => filteredUsers.find(u => u.id === id)).filter(Boolean) as User[]
                    : filteredUsers
                  ).map((user) => (
                    <div
                      key={user.id}
                      draggable
                      onDragStart={() => setDraggedUserId(user.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        dragOverItemRef.current = user.id;
                      }}
                      onDragEnd={() => {
                        if (draggedUserId !== null && dragOverItemRef.current !== null && draggedUserId !== dragOverItemRef.current) {
                          const currentOrder = userOrder.length > 0 ? userOrder : filteredUsers.map(u => u.id);
                          const draggedIndex = currentOrder.indexOf(draggedUserId);
                          const targetIndex = currentOrder.indexOf(dragOverItemRef.current);
                          const newOrder = [...currentOrder];
                          newOrder.splice(draggedIndex, 1);
                          newOrder.splice(targetIndex, 0, draggedUserId);
                          setUserOrder(newOrder);
                          toast.info("User position updated");
                        }
                        setDraggedUserId(null);
                        dragOverItemRef.current = null;
                      }}
                      className={`bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 cursor-move hover:shadow-lg dark:hover:shadow-[#6366F1]/10 transition-all ${
                        draggedUserId === user.id ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-[#A1A1AA] dark:text-[#52525B] flex-shrink-0" />
                            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg text-white">
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base text-[#0A0A0A] dark:text-white truncate">{user.name}</p>
                            <p className="text-sm text-[#717182] dark:text-[#A1A1AA] truncate">{user.email}</p>
                            <p className="text-xs text-[#717182] dark:text-[#71717A]">Joined: {user.joinDate}</p>
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Transactions</p>
                              <p className="text-base text-[#0A0A0A] dark:text-white">{user.totalTransactions}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">Total Spent</p>
                              <p className="text-base text-[#0A0A0A] dark:text-white">{formatCurrency(user.totalSpent)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                            {user.status === "blocked" ? (
                              <button
                                onClick={() => unblockUserMutation.mutate(user.id)}
                                disabled={unblockUserMutation.isPending}
                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#E5F9E5] dark:hover:bg-[#1F3F1F] transition-colors disabled:opacity-50"
                                title="Unblock user"
                              >
                                <CheckCircle className="w-4 h-4 text-[#00A63E] dark:text-[#4ADE80]" />
                              </button>
                            ) : (
                              <button
                                onClick={() => blockUserMutation.mutate(user.id)}
                                disabled={blockUserMutation.isPending}
                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#FFE5E5] dark:hover:bg-[#3F1F1F] transition-colors disabled:opacity-50"
                                title="Block user"
                              >
                                <Ban className="w-4 h-4 text-[#F59E0B] dark:text-[#FCD34D]" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditUser(user)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "feedback" ? (
            <div className="space-y-3">
              {isLoadingFeedback ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-3"></div>
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">Loading feedback...</p>
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-[#717182] dark:text-[#A1A1AA] mx-auto mb-3" />
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">No feedback found</p>
                </div>
              ) : (
                <>
              {filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 hover:shadow-lg dark:hover:shadow-[#6366F1]/10 transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base text-[#0A0A0A] dark:text-white truncate">{feedback.subject}</p>
                          {feedback.rating && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {Array.from({ length: feedback.rating }).map((_, i) => (
                                <span key={i} className="text-[#F59E0B]">★</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">
                          {feedback.userName} • {feedback.userEmail}
                        </p>
                        <p className="text-sm text-[#0A0A0A] dark:text-white leading-relaxed">
                          {feedback.message}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs capitalize flex-shrink-0 ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                      <p className="text-xs text-[#717182] dark:text-[#71717A]">{feedback.date}</p>
                      <div className="flex gap-2">
                        {feedback.status !== "reviewed" && feedback.status !== "resolved" && (
                          <button
                            onClick={() => handleMarkAsReviewed(feedback.id)}
                            className="px-3 py-1 text-xs rounded-lg bg-[#F3F3F5] dark:bg-[#27272A] text-[#0A0A0A] dark:text-white hover:bg-[#ECECF0] dark:hover:bg-[#18181B] transition-colors"
                          >
                            Mark as Reviewed
                          </button>
                        )}
                        {feedback.status !== "resolved" && (
                          <button
                            onClick={() => handleMarkAsResolved(feedback.id)}
                            className="px-3 py-1 text-xs rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white hover:shadow-lg transition-all"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {isLoadingNotifications ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-3"></div>
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-[#717182] dark:text-[#A1A1AA] mx-auto mb-3" />
                  <p className="text-base text-[#717182] dark:text-[#A1A1AA]">No notifications found</p>
                </div>
              ) : (
              <>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-4 hover:shadow-lg dark:hover:shadow-[#6366F1]/10 transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F3F3F5] dark:bg-[#27272A] flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base text-[#0A0A0A] dark:text-white mb-1">{notification.title}</h4>
                          <p className="text-sm text-[#717182] dark:text-[#A1A1AA] leading-relaxed">{notification.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs capitalize flex-shrink-0 ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-3 text-xs text-[#717182] dark:text-[#71717A]">
                          <span>{notification.date}</span>
                          <span>•</span>
                          <span>Sent by: {notification.sentBy}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#D4183D] dark:text-[#F87171]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#0A0A0A] dark:text-white">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Name *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter user name"
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter user email"
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Status</label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as "active" | "blocked")}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 h-11 rounded-[12px] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 h-11 rounded-[12px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
              >
                {editingUser ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#0A0A0A] dark:text-white">Broadcast Notification</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Type</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value as "info" | "success" | "warning" | "error")}
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Title *</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g., New Feature, System Update"
                  className="w-full h-11 px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#717182] dark:text-[#A1A1AA] mb-2">Description *</label>
                <textarea
                  value={notificationDescription}
                  onChange={(e) => setNotificationDescription(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[12px] text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] resize-none"
                />
              </div>

              <div className="p-3 bg-[#FEF3C7] dark:bg-[#78350F] rounded-[10px]">
                <p className="text-sm text-[#92400E] dark:text-[#FDE68A]">
                  This notification will be sent to all users immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 h-11 rounded-[12px] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastNotification}
                className="flex-1 h-11 rounded-[12px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg text-[#0A0A0A] dark:text-white">Notification Sent!</h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>
            <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-6">
              Your notification has been successfully broadcast to all users. They will receive it immediately.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-11 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[12px] text-white hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setUserToDelete(null)}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={confirmDeleteUser}
          onCancel={() => setUserToDelete(null)}
        />
      )}

      {notificationToDelete && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setNotificationToDelete(null)}
          title="Delete Notification"
          message="Are you sure you want to delete this notification from the history?"
          onConfirm={confirmDeleteNotification}
          onCancel={() => setNotificationToDelete(null)}
        />
      )}
    </div>
  );
}