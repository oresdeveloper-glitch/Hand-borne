import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, ScanResult, Notification } from '../types';

const safeStorage = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('Storage quota exceeded while saving app state. Clearing cached app data.', error);
      try {
        localStorage.removeItem('hba-storage');
        localStorage.removeItem('hba_scans');
        localStorage.removeItem('hba_token');
        localStorage.setItem(name, value);
      } catch (retryError) {
        console.error('Failed to persist app state after cleanup.', retryError);
      }
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

interface AppState {
  // Auth state
  user: User | null;
  token: string | null;
  
  // Scans state
  scans: ScanResult[];
  currentScan: ScanResult | null;
  
  // Notifications
  notifications: Notification[];
  
  // UI state
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isLoading: boolean;
  
  // Auth actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  // Scans actions
  addScan: (scan: ScanResult) => void;
  updateScan: (id: string, updates: Partial<ScanResult>) => void;
  deleteScan: (id: string) => void;
  setCurrentScan: (scan: ScanResult | null) => void;
  getUserScans: (userId: string) => ScanResult[];
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      scans: [],
      currentScan: null,
      notifications: [],
      isDarkMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
      isSidebarOpen: false,
      isLoading: false,
      
      // Auth actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, currentScan: null }),
      
      // Scans actions
      addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
      updateScan: (id, updates) => set((state) => ({
        scans: state.scans.map((scan) =>
          scan.id === id ? { ...scan, ...updates } : scan
        ),
      })),
      deleteScan: (id) => set((state) => ({
        scans: state.scans.filter((scan) => scan.id !== id),
      })),
      setCurrentScan: (scan) => set({ currentScan: scan }),
      getUserScans: (userId) => get().scans.filter((scan) => scan.userId === userId),
      
      // Notifications
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50), // Keep only last 50 notifications
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      // UI actions
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setLoading: (value) => set({ isLoading: value }),
    }),
    {
      name: 'hba-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
