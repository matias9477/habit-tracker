import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  setOnboardingCompleted: () => void;
  resetOnboarding: () => void;
}

/**
 * Onboarding store for managing onboarding completion status.
 * Persists onboarding state to AsyncStorage so it survives app restarts.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,

      setOnboardingCompleted: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false });
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
