import { create } from 'zustand';
import { Habit } from '../db/habits';
import {
  markHabitCompleted,
  unmarkHabitCompleted,
  getCompletionsForDate,
  incrementHabitCount,
  decrementHabitCount,
  getStreakForHabit,
} from '../db/completions';
import {
  getAllHabits,
  getHabitsForDate,
  getEarliestHabitDate,
  insertHabit,
  updateHabit,
  deleteHabit,
} from '../db/habits';

/**
 * Type representing a habit with its completion status for today.
 */
export type HabitWithCompletion = Habit & {
  isCompletedToday: boolean;
  streak: number;
  currentCount?: number; // For count goals
  targetCount?: number; // For count goals
};

/**
 * State interface for the habit store.
 */
interface HabitState {
  habits: HabitWithCompletion[];
  isLoading: boolean;
  error: string | null;
  earliestHabitDate: Date | null;
}

/**
 * Actions interface for the habit store.
 */
interface HabitActions {
  // Loading and initialization
  loadHabits: () => Promise<void>;
  loadHabitsForDate: (date: Date) => Promise<void>;
  refreshHabits: () => Promise<void>;

  // Date-specific completion management
  toggleHabitCompletionForDate: (
    habitId: number,
    date: Date
  ) => Promise<boolean>;
  markHabitCompletedForDate: (habitId: number, date: Date) => Promise<boolean>;
  unmarkHabitCompletedForDate: (
    habitId: number,
    date: Date
  ) => Promise<boolean>;
  incrementHabitCountForDate: (habitId: number, date: Date) => Promise<boolean>;
  decrementHabitCountForDate: (habitId: number, date: Date) => Promise<boolean>;

  // Habit management
  addHabit: (
    name: string,
    category: string,
    goalType?: string,
    targetCount?: number,
    customEmoji?: string,
    targetTimeMinutes?: number
  ) => Promise<boolean>;
  updateHabit: (
    id: number,
    name: string,
    category: string,
    goalType: string,
    customEmoji?: string,
    targetCount?: number,
    targetTimeMinutes?: number
  ) => Promise<boolean>;
  deleteHabit: (id: number) => Promise<boolean>;

  // Completion management
  toggleHabitCompletion: (habitId: number) => Promise<boolean>;
  markHabitCompleted: (habitId: number) => Promise<boolean>;
  unmarkHabitCompleted: (habitId: number) => Promise<boolean>;
  incrementHabitCount: (habitId: number) => Promise<boolean>;
  decrementHabitCount: (habitId: number) => Promise<boolean>;
  resetHabitCount: (habitId: number) => Promise<boolean>;

  // Utility
  clearError: () => void;
}

/**
 * Zustand store for managing habits and their completion status.
 * Loads data from SQLite on initialization and syncs changes back to the database.
 */
export const useHabitStore = create<HabitState & HabitActions>((set, get) => ({
  // Initial state
  habits: [],
  isLoading: false,
  error: null,
  earliestHabitDate: null,

  // Loading and initialization
  loadHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const habits = await getAllHabits();
      const earliestDate = await getEarliestHabitDate();

      const today = new Date().toISOString().slice(0, 10);
      const completions = await getCompletionsForDate(today);

      // Combine habits with completion status and count data
      const habitsWithCompletion: HabitWithCompletion[] = await Promise.all(
        habits.map(async habit => {
          const completion = completions.find(c => c.habit_id === habit.id);
          const currentCount = completion?.count || 0;
          const targetCount =
            habit.target_count || (habit.goal_type === 'count' ? 1 : undefined);
          const streak = await getStreakForHabit(habit.id);

          const result: HabitWithCompletion = {
            ...habit,
            isCompletedToday: !!completion,
            streak: streak,
          };

          if (currentCount > 0) {
            result.currentCount = currentCount;
          }

          if (targetCount !== undefined) {
            result.targetCount = targetCount;
          }

          return result;
        })
      );

      set({
        habits: habitsWithCompletion,
        earliestHabitDate: earliestDate,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading habits:', error);
      set({ error: 'Failed to load habits', isLoading: false });
    }
  },

  refreshHabits: async () => {
    await get().loadHabits();
  },

  loadHabitsForDate: async (date: Date) => {
    set({ isLoading: true, error: null });
    try {
      // Use getHabitsForDate to only get habits created on or before the selected date
      const habits = await getHabitsForDate(date);
      const dateString = date.toISOString().slice(0, 10);
      const completions = await getCompletionsForDate(dateString);

      // Combine habits with completion status and count data for the specific date
      const habitsWithCompletion: HabitWithCompletion[] = await Promise.all(
        habits.map(async habit => {
          const completion = completions.find(c => c.habit_id === habit.id);
          const currentCount = completion?.count || 0;
          const targetCount =
            habit.target_count || (habit.goal_type === 'count' ? 1 : undefined);
          const streak = await getStreakForHabit(habit.id);

          const result: HabitWithCompletion = {
            ...habit,
            isCompletedToday: !!completion,
            streak: streak,
          };

          if (currentCount > 0) {
            result.currentCount = currentCount;
          }

          if (targetCount !== undefined) {
            result.targetCount = targetCount;
          }

          return result;
        })
      );

      set({ habits: habitsWithCompletion, isLoading: false });
    } catch (error) {
      console.error('Error loading habits for date:', error);
      set({ error: 'Failed to load habits', isLoading: false });
    }
  },

  // Date-specific completion management
  toggleHabitCompletionForDate: async (habitId: number, date: Date) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return false;

    const dateString = date.toISOString().slice(0, 10);

    if (habit.goal_type === 'count') {
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;

      // If we've reached the target, reset to 0
      if (currentCount >= targetCount) {
        const success = await unmarkHabitCompleted(habitId, dateString);
        if (success) {
          // Update local state
          set(state => ({
            habits: state.habits.map(h =>
              h.id === habitId
                ? { ...h, currentCount: 0, isCompletedToday: false }
                : h
            ),
          }));
        }
        return success;
      } else {
        // Otherwise increment the count
        const newCount = await incrementHabitCount(habitId, dateString);
        const targetCount = habit.targetCount || 1;

        // Update local state
        set(state => ({
          habits: state.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  currentCount: newCount,
                  // Only mark as completed when target is reached
                  isCompletedToday: newCount >= targetCount,
                }
              : h
          ),
        }));

        return newCount > 0; // Return true if count was successfully incremented
      }
    } else {
      const isCompleted = habit.isCompletedToday;
      if (isCompleted) {
        const success = await unmarkHabitCompleted(habitId, dateString);
        if (success) {
          // Update local state
          set(state => ({
            habits: state.habits.map(h =>
              h.id === habitId ? { ...h, isCompletedToday: false } : h
            ),
          }));
        }
        return success;
      } else {
        const result = await markHabitCompleted(habitId, dateString);
        const success = result !== null;
        if (success) {
          // Update local state
          set(state => ({
            habits: state.habits.map(h =>
              h.id === habitId ? { ...h, isCompletedToday: true } : h
            ),
          }));
        }
        return success;
      }
    }
  },

  markHabitCompletedForDate: async (habitId: number, date: Date) => {
    try {
      const dateString = date.toISOString().slice(0, 10);
      const result = await markHabitCompleted(habitId, dateString);
      const success = result !== null;
      if (success) {
        // Update local state
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId ? { ...habit, isCompletedToday: true } : habit
          ),
        }));
      }
      return success;
    } catch (error) {
      console.error('Error marking habit completed for date:', error);
      set({ error: 'Failed to mark habit as completed' });
      return false;
    }
  },

  unmarkHabitCompletedForDate: async (habitId: number, date: Date) => {
    try {
      const dateString = date.toISOString().slice(0, 10);
      const success = await unmarkHabitCompleted(habitId, dateString);
      if (success) {
        // Update local state
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId ? { ...habit, isCompletedToday: false } : habit
          ),
        }));
      }
      return success;
    } catch (error) {
      console.error('Error unmarking habit completed for date:', error);
      set({ error: 'Failed to unmark habit as completed' });
      return false;
    }
  },

  incrementHabitCountForDate: async (habitId: number, date: Date) => {
    try {
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit || habit.goal_type !== 'count') return false;

      const dateString = date.toISOString().slice(0, 10);
      const newCount = await incrementHabitCount(habitId, dateString);
      const targetCount = habit.targetCount || 1;

      // Update local state
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentCount: newCount,
                // Only mark as completed when target is reached
                isCompletedToday: newCount >= targetCount,
              }
            : h
        ),
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing habit count for date:', error);
      set({ error: 'Failed to increment habit count' });
      return false;
    }
  },

  decrementHabitCountForDate: async (habitId: number, date: Date) => {
    try {
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit || habit.goal_type !== 'count') return false;

      const dateString = date.toISOString().slice(0, 10);
      const newCount = await decrementHabitCount(habitId, dateString);
      const targetCount = habit.targetCount || 1;

      // Update local state
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentCount: newCount,
                // Only mark as completed when target is reached
                isCompletedToday: newCount >= targetCount,
              }
            : h
        ),
      }));

      return true;
    } catch (error) {
      console.error('Error decrementing habit count for date:', error);
      set({ error: 'Failed to decrement habit count' });
      return false;
    }
  },

  // Habit management
  addHabit: async (
    name: string,
    category: string,
    goalType: string = 'binary',
    targetCount?: number,
    customEmoji?: string,
    targetTimeMinutes?: number
  ) => {
    try {
      // Get the icon from the category
      const { getCategoryById } = await import('../utils/categories');
      const categoryData = getCategoryById(category);
      const icon = categoryData?.icon || '📋';

      const habitId = await insertHabit(
        name,
        icon,
        category,
        goalType,
        customEmoji,
        targetCount,
        targetTimeMinutes
      );
      if (habitId) {
        await get().refreshHabits();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding habit:', error);
      set({ error: 'Failed to add habit' });
      return false;
    }
  },

  updateHabit: async (
    id: number,
    name: string,
    category: string,
    goalType: string,
    customEmoji?: string,
    targetCount?: number,
    targetTimeMinutes?: number
  ) => {
    try {
      // Get the icon from the category
      const { getCategoryById } = await import('../utils/categories');
      const categoryData = getCategoryById(category);
      const icon = categoryData?.icon || '📋';

      const success = await updateHabit(
        id,
        name,
        icon,
        category,
        goalType,
        customEmoji,
        targetCount,
        targetTimeMinutes
      );
      if (success) {
        await get().refreshHabits();
      }
      return success;
    } catch (error) {
      console.error('Error updating habit:', error);
      set({ error: 'Failed to update habit' });
      return false;
    }
  },

  deleteHabit: async (id: number) => {
    try {
      const success = await deleteHabit(id);
      if (success) {
        await get().refreshHabits();
      }
      return success;
    } catch (error) {
      console.error('Error deleting habit:', error);
      set({ error: 'Failed to delete habit' });
      return false;
    }
  },

  // Completion management
  toggleHabitCompletion: async (habitId: number) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return false;

    if (habit.goal_type === 'count') {
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;

      // If we've reached the target, reset to 0
      if (currentCount >= targetCount) {
        return await get().resetHabitCount(habitId);
      } else {
        // Otherwise increment the count
        return await get().incrementHabitCount(habitId);
      }
    } else {
      if (habit.isCompletedToday) {
        return await get().unmarkHabitCompleted(habitId);
      } else {
        return await get().markHabitCompleted(habitId);
      }
    }
  },

  markHabitCompleted: async (habitId: number) => {
    try {
      const success = await markHabitCompleted(habitId);
      if (success) {
        // Update local state
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId ? { ...habit, isCompletedToday: true } : habit
          ),
        }));
      }
      return !!success;
    } catch (error) {
      console.error('Error marking habit completed:', error);
      set({ error: 'Failed to mark habit as completed' });
      return false;
    }
  },

  unmarkHabitCompleted: async (habitId: number) => {
    try {
      const success = await unmarkHabitCompleted(habitId);
      if (success) {
        // Update local state
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId ? { ...habit, isCompletedToday: false } : habit
          ),
        }));
      }
      return success;
    } catch (error) {
      console.error('Error unmarking habit completed:', error);
      set({ error: 'Failed to unmark habit as completed' });
      return false;
    }
  },

  incrementHabitCount: async (habitId: number) => {
    try {
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit || habit.goal_type !== 'count') return false;

      const newCount = await incrementHabitCount(habitId);
      const targetCount = habit.targetCount || 1;

      // Update local state
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentCount: newCount,
                isCompletedToday: newCount >= targetCount,
              }
            : h
        ),
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing habit count:', error);
      set({ error: 'Failed to increment habit count' });
      return false;
    }
  },

  decrementHabitCount: async (habitId: number) => {
    try {
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit || habit.goal_type !== 'count') return false;

      const newCount = await decrementHabitCount(habitId);
      const targetCount = habit.targetCount || 1;

      // Update local state
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentCount: newCount,
                isCompletedToday: newCount >= targetCount,
              }
            : h
        ),
      }));

      return true;
    } catch (error) {
      console.error('Error decrementing habit count:', error);
      set({ error: 'Failed to decrement habit count' });
      return false;
    }
  },

  resetHabitCount: async (habitId: number) => {
    try {
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit || habit.goal_type !== 'count') return false;

      // Remove the completion record entirely (resets to 0)
      await unmarkHabitCompleted(habitId);

      // Update local state
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentCount: 0,
                isCompletedToday: false,
              }
            : h
        ),
      }));

      return true;
    } catch (error) {
      console.error('Error resetting habit count:', error);
      set({ error: 'Failed to reset habit count' });
      return false;
    }
  },

  // Utility
  clearError: () => {
    set({ error: null });
  },
}));
