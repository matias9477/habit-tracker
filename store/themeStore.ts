import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeState {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setDarkMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
}

/**
 * Theme store for managing app appearance and preferences.
 * Handles dark mode toggle and notification settings with persistence.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      notificationsEnabled: false,

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      setDarkMode: (enabled: boolean) => {
        set({ isDarkMode: enabled });
      },

      setNotifications: (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
