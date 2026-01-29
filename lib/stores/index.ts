import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Alert, UserRole } from "@/lib/types";

// Auth Store - Manages user authentication state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "sanad-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setLoading(false);
      },
    }
  )
);

// UI Store - Manages UI state like sidebar, modals, etc.
interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  activeModal: null,
  toasts: [],
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Alerts Store - Manages system alerts and notifications
interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAll: () => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => a.status === "pending").length,
    }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: "acknowledged" as const } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  dismissAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: "resolved" as const } : a
      ),
    })),
  clearAll: () => set({ alerts: [], unreadCount: 0 }),
}));

// Cases Filter Store - Manages case list filtering
interface CasesFilterState {
  priority: string | null;
  status: string | null;
  searchQuery: string;
  dateRange: { from: Date | null; to: Date | null };
  setPriority: (priority: string | null) => void;
  setStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  clearFilters: () => void;
}

export const useCasesFilterStore = create<CasesFilterState>((set) => ({
  priority: null,
  status: null,
  searchQuery: "",
  dateRange: { from: null, to: null },
  setPriority: (priority) => set({ priority }),
  setStatus: (status) => set({ status }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDateRange: (dateRange) => set({ dateRange }),
  clearFilters: () =>
    set({
      priority: null,
      status: null,
      searchQuery: "",
      dateRange: { from: null, to: null },
    }),
}));

// Requests Filter Store - Manages request list filtering
interface RequestsFilterState {
  status: string | null;
  department: string | null;
  searchQuery: string;
  setStatus: (status: string | null) => void;
  setDepartment: (department: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useRequestsFilterStore = create<RequestsFilterState>((set) => ({
  status: null,
  department: null,
  searchQuery: "",
  setStatus: (status) => set({ status }),
  setDepartment: (department) => set({ department }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearFilters: () =>
    set({
      status: null,
      department: null,
      searchQuery: "",
    }),
}));

// Real-time Subscription Store - Manages Supabase subscriptions
interface RealtimeState {
  isConnected: boolean;
  subscribedChannels: string[];
  setConnected: (connected: boolean) => void;
  addChannel: (channel: string) => void;
  removeChannel: (channel: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  subscribedChannels: [],
  setConnected: (isConnected) => set({ isConnected }),
  addChannel: (channel) =>
    set((state) => ({
      subscribedChannels: [...state.subscribedChannels, channel],
    })),
  removeChannel: (channel) =>
    set((state) => ({
      subscribedChannels: state.subscribedChannels.filter((c) => c !== channel),
    })),
}));
