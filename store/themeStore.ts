import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleNotifications: () => void;
  setNotifications: (enabled: boolean) => void;
}

/**
 * Theme store for managing app appearance and preferences.
 * Handles theme mode (system/light/dark) and notification settings with persistence.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      themeMode: 'system',
      notificationsEnabled: false,

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },

      toggleNotifications: () => {
        set(state => ({ notificationsEnabled: !state.notificationsEnabled }));
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
