import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://budget-tracker-xpoz.onrender.com/api';
// const API_BASE_URL = 'http://localhost:8000/api';
// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
  total_transactions?: number;
  total_spent?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // Date from API
  transaction_date?: string; // Alias for compatibility
  created_at: string;
  updated_at: string;
  account?: Account;
  category?: Category;
}

export interface Account {
  id: number;
  user_id?: number;
  name: string;
  type: 'bank' | 'cash' | 'credit_card';
  balance: number;
  notes?: string;
  description?: string; // Alias for compatibility
  icon?: string; // For frontend display
  created_at?: string;
  updated_at?: string;
  // Month-specific fields (when filtering by year/month)
  monthIncome?: number;
  monthExpenses?: number;
  monthTransactionCount?: number;
  monthBalance?: number;
  cumulativeBalance?: number; // Initial balance + all transactions up to end of month
  accountExisted?: boolean;
}

export interface Category {
  id: number;
  user_id?: number;
  name: string;
  type: 'income' | 'expense';
  color?: string; // Added for frontend compatibility
  is_default?: boolean;
  notes?: string;
  description?: string; // Added for frontend compatibility
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: number;
  user_id?: number;
  category_id: number;
  name?: string; // Added for frontend compatibility
  amount: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  description?: string; // Added for frontend compatibility
  is_limiter?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  category_name?: string; // For display
  category_color?: string; // For display
  spent?: number;
  percentage?: number;
}

export interface Feedback {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  rating: number;
  status: 'new' | 'reviewed' | 'resolved';
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_by: number;
  sent_at: string;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface DashboardStats {
  total_income: number;
  total_expense: number;
  total_expenses?: number; // Alias for compatibility
  total_balance: number;
  accounts_count?: number;
  categories_count?: number;
  transactions_count?: number;
  category_spending?: Array<{ name: string; value: number; color: string }>;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyTokenData {
  token: string;
  email: string;
}

// API Methods

// Authentication
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ token: string; user: User }> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordData
  ): Promise<{ status: string; message: string }> => {
    const response = await api.post('/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ status: string; message: string }> => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  verifyResetToken: async (data: VerifyTokenData): Promise<{ valid: boolean; message: string }> => {
    const response = await api.post('/verify-reset-token', data);
    return response.data;
  },
};

// Profile
export const profileAPI = {
  update: async (data: { name?: string; email?: string; currency?: string }): Promise<User> => {
    const response = await api.put('/profile', data);
    return response.data.user || response.data;
  },

  updatePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await api.put('/password', data);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/account');
  },
};

// Dashboard
export const dashboardAPI = {
  getStats: async (year?: number, month?: number): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (year && month) {
      params.append('year', year.toString());
      params.append('month', month.toString());
    }
    const queryString = params.toString();
    const response = await api.get(`/dashboard/stats${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getRecentTransactions: async (
    limit = 10,
    year?: number,
    month?: number
  ): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (year && month) {
      params.append('year', year.toString());
      params.append('month', month.toString());
    }
    const response = await api.get(`/dashboard/recent-transactions?${params}`);
    // API returns { transactions: [...], total_count: ... }
    return response.data.transactions || response.data || [];
  },

  getMonthlyAnalytics: async (year?: number, month?: number): Promise<any> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const response = await api.get(`/dashboard/monthly-analytics?${params}`);
    return response.data;
  },

  getBudgetProgress: async (): Promise<any> => {
    const response = await api.get('/dashboard/budget-progress');
    return response.data;
  },
};

// Accounts
export const accountsAPI = {
  getAll: async (params?: { year?: number; month?: number }): Promise<Account[]> => {
    const response = await api.get('/accounts', { params });
    return response.data.accounts || response.data;
  },

  getOne: async (id: number): Promise<Account> => {
    const response = await api.get(`/accounts/${id}`);
    return response.data.account || response.data;
  },

  getDetail: async (id: number, params?: { type?: 'income' | 'expense'; per_page?: number; page?: number }): Promise<{
    account: Account;
    transactions: {
      data: Transaction[];
      total: number;
      current_page: number;
      last_page: number;
      per_page: number;
    };
    stats: {
      initial_balance: number;
      total_income: number;
      total_expenses: number;
      current_balance: number;
    };
  }> => {
    const response = await api.get(`/accounts/${id}`, { params });
    return {
      account: response.data.account,
      transactions: response.data.transactions,
      stats: response.data.stats,
    };
  },

  create: async (data: Partial<Account>): Promise<Account> => {
    const response = await api.post('/accounts', data);
    return response.data.account || response.data;
  },

  update: async (id: number, data: Partial<Account>): Promise<Account> => {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data.account || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};

// Categories
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.categories || response.data;
  },

  getOne: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.category || response.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.category || response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.category || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Transactions
export const transactionsAPI = {
  getAll: async (
    params?: any
  ): Promise<{
    data: Transaction[];
    total: number;
    current_page: number;
    per_page?: number;
    last_page?: number;
  }> => {
    const response = await api.get('/transactions', { params });
    // Handle nested paginated response: { success: true, transactions: { data: [], total: N, ... } }
    const transactionsData = response.data.transactions || response.data;
    return {
      data: transactionsData.data || [],
      total: transactionsData.total || 0,
      current_page: transactionsData.current_page || 1,
      per_page: transactionsData.per_page,
      last_page: transactionsData.last_page,
    };
  },

  getOne: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (
    data: Partial<Transaction>
  ): Promise<{ transaction: Transaction; budget_warning?: string; budget_info?: any }> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  checkBudget: async (data: {
    category_id: number;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }): Promise<{
    success: boolean;
    has_budget: boolean;
    budget_info?: {
      budget_id: number;
      budget_amount: number;
      spent: number;
      remaining: number;
      percent_used: number;
      percent_after_transaction: number;
      is_limiter: boolean;
      category_name: string;
      would_exceed: boolean;
      overspend_amount: number;
    };
    warning_level: 'none' | 'info' | 'warning' | 'error';
    warning_message?: string;
    can_proceed: boolean;
  }> => {
    const response = await api.post('/transactions/check-budget', data);
    return response.data;
  },
};

// Budgets
export const budgetsAPI = {
  getAll: async (params?: { year?: number; month?: number }): Promise<Budget[]> => {
    const response = await api.get('/budgets', { params });
    // Handle nested paginated response: { success: true, budgets: { data: [], ... } }
    const budgetsData = response.data.budgets || response.data;
    return budgetsData.data || budgetsData || [];
  },

  getOne: async (id: number): Promise<Budget> => {
    const response = await api.get(`/budgets/${id}`);
    return response.data.budget || response.data;
  },

  create: async (data: Partial<Budget>): Promise<Budget> => {
    const response = await api.post('/budgets', data);
    return response.data.budget || response.data;
  },

  update: async (id: number, data: Partial<Budget>): Promise<Budget> => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data.budget || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};

// Feedback
export const feedbackAPI = {
  submit: async (data: { subject: string; message: string; rating: number }): Promise<Feedback> => {
    const response = await api.post('/feedback', data);
    return response.data.feedback || response.data;
  },

  getMyFeedback: async (): Promise<Feedback[]> => {
    const response = await api.get('/feedback/my');
    return response.data.feedbacks || response.data;
  },

  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: Feedback[]; total: number; current_page: number }> => {
    const response = await api.get('/feedback', { params });
    return response.data.feedbacks || response.data;
  },

  updateStatus: async (id: number, status: 'new' | 'reviewed' | 'resolved'): Promise<Feedback> => {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    return response.data.feedback || response.data;
  },
};

// Notifications (User side)
export const notificationsAPI = {
  getRecent: async (limit = 10): Promise<Notification[]> => {
    const response = await api.get(`/notifications/recent?limit=${limit}`);
    return response.data.notifications || response.data || [];
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count || 0;
  },
};

// Admin APIs
export const adminAPI = {
  // User Management
  users: {
    getAll: async (params?: any): Promise<{ data: User[]; total: number }> => {
      const response = await api.get('/admin/users', { params });
      return response.data;
    },

    getOne: async (id: number): Promise<User> => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },

    create: async (data: Partial<User>): Promise<User> => {
      const response = await api.post('/admin/users', data);
      return response.data;
    },

    update: async (id: number, data: Partial<User>): Promise<User> => {
      const response = await api.put(`/admin/users/${id}`, data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/admin/users/${id}`);
    },

    block: async (id: number): Promise<User> => {
      const response = await api.post(`/admin/users/${id}/block`);
      return response.data.user || response.data;
    },

    unblock: async (id: number): Promise<User> => {
      const response = await api.post(`/admin/users/${id}/unblock`);
      return response.data.user || response.data;
    },

    getStatistics: async (): Promise<any> => {
      const response = await api.get('/admin/users/statistics');
      return response.data;
    },
  },

  // Feedback Management
  feedback: {
    getAll: async (params?: any): Promise<{ data: Feedback[]; total: number }> => {
      const response = await api.get('/admin/feedback', { params });
      return response.data;
    },

    getOne: async (id: number): Promise<Feedback> => {
      const response = await api.get(`/admin/feedback/${id}`);
      return response.data;
    },

    updateStatus: async (
      id: number,
      status: 'new' | 'reviewed' | 'resolved'
    ): Promise<Feedback> => {
      const response = await api.patch(`/admin/feedback/${id}/status`, { status });
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/admin/feedback/${id}`);
    },
  },

  // Notification Management
  notifications: {
    getAll: async (params?: any): Promise<{ data: Notification[]; total: number }> => {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    },

    create: async (data: {
      title: string;
      description: string;
      type: 'info' | 'success' | 'warning' | 'error';
    }): Promise<Notification> => {
      const response = await api.post('/admin/notifications', data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/admin/notifications/${id}`);
    },
  },
};

export default api;
