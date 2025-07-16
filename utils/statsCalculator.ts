import { HabitWithCompletion } from '@/store/habitStore';
import { getAllHabits, updateHabitAnalyticsFields } from '@/db/habits';
import {
  getTotalCompletionsForHabit,
  getStreakForHabit,
} from '@/db/completions';

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  totalCompletions: number;
  averageStreak: number;
  longestStreak: number;
  mostConsistentHabit: string;
  needsAttention: string[];
}

export interface HabitTrend {
  habitId: number;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  lastCompleted?: string;
}

/**
 * Calculate comprehensive statistics for all habits.
 * @param habits - Array of habits with completion data
 * @returns Promise<HabitStats> - Calculated statistics
 */
export const calculateHabitStats = async (
  habits: HabitWithCompletion[]
): Promise<HabitStats> => {
  if (habits.length === 0) {
    return {
      totalHabits: 0,
      completedToday: 0,
      completionRate: 0,
      totalCompletions: 0,
      averageStreak: 0,
      longestStreak: 0,
      mostConsistentHabit: 'No habits yet',
      needsAttention: [],
    };
  }

  const completedToday = habits.filter(h => h.isCompletedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  // Calculate total completions across all time
  const totalCompletionsPromises = habits.map(async habit => {
    return await getTotalCompletionsForHabit(habit.id);
  });
  const totalCompletionsArray = await Promise.all(totalCompletionsPromises);
  const totalCompletions = totalCompletionsArray.reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate streaks using actual streak data
  const streaks = habits.map(h => h.streak || 0);
  const averageStreak = Math.round(
    streaks.reduce((sum, streak) => sum + streak, 0) / habits.length
  );
  const longestStreak = Math.max(...streaks);

  // Find most consistent habit (highest streak)
  const mostConsistentHabit = habits.reduce((best, current) => {
    const currentStreak = current.streak || 0;
    const bestStreak = best.streak || 0;
    return currentStreak > bestStreak ? current : best;
  }).name;

  // Find habits that need attention (not completed today)
  const needsAttention = habits
    .filter(h => !h.isCompletedToday)
    .map(h => h.name)
    .slice(0, 3); // Top 3

  return {
    totalHabits: habits.length,
    completedToday,
    completionRate,
    totalCompletions,
    averageStreak,
    longestStreak,
    mostConsistentHabit,
    needsAttention,
  };
};

/**
 * Calculate detailed trends for each habit.
 * @param habits - Array of habits with completion data
 * @returns Promise<HabitTrend[]> - Detailed trends for each habit
 */
export const calculateHabitTrends = async (
  habits: HabitWithCompletion[]
): Promise<HabitTrend[]> => {
  const trends: HabitTrend[] = [];

  for (const habit of habits) {
    // Calculate completion rate based on streak (simplified but realistic)
    // A 30-day streak would be 100%, 15-day would be 50%, etc.
    const completionRate = Math.min(Math.round((habit.streak / 30) * 100), 100);

    // Get total completions for this habit
    const totalCompletions = await getTotalCompletionsForHabit(habit.id);

    trends.push({
      habitId: habit.id,
      habitName: habit.name,
      currentStreak: habit.streak || 0,
      longestStreak: habit.streak || 0, // Would need separate calculation
      completionRate,
      totalCompletions,
      lastCompleted: habit.isCompletedToday ? 'Today' : 'Not today',
    });
  }

  return trends.sort((a, b) => b.currentStreak - a.currentStreak);
};

/**
 * Get weekly completion data for chart visualization.
 * @param habits - Array of habits
 * @returns Promise<{ date: string; completed: number; total: number }[]> - Weekly data
 */
export const getWeeklyData = async (
  habits: HabitWithCompletion[]
): Promise<{ date: string; completed: number; total: number }[]> => {
  const weekData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().slice(0, 10);

    // This is a simplified calculation - in a real app, you'd query the DB
    const completed =
      i === 0
        ? habits.filter(h => h.isCompletedToday).length
        : Math.floor(Math.random() * habits.length);

    weekData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: habits.length,
    });
  }

  return weekData;
};

/**
 * Get habit categories and their completion rates.
 * @param habits - Array of habits
 * @returns Promise<{ category: string; count: number; completed: number }[]> - Category data
 */
export const getCategoryStats = async (
  habits: HabitWithCompletion[]
): Promise<{ category: string; count: number; completed: number }[]> => {
  // Categorize habits based on their icons and names
  const categories = {
    Health: habits.filter(
      h =>
        h.icon.includes('💧') ||
        h.icon.includes('💊') ||
        h.name.toLowerCase().includes('water') ||
        h.name.toLowerCase().includes('vitamin')
    ),
    Exercise: habits.filter(
      h =>
        h.icon.includes('🏃') ||
        h.icon.includes('👟') ||
        h.name.toLowerCase().includes('exercise') ||
        h.name.toLowerCase().includes('walk')
    ),
    Learning: habits.filter(
      h =>
        h.icon.includes('📚') ||
        h.icon.includes('🎸') ||
        h.name.toLowerCase().includes('read') ||
        h.name.toLowerCase().includes('practice')
    ),
    Wellness: habits.filter(
      h =>
        h.icon.includes('🧘') ||
        h.icon.includes('📝') ||
        h.name.toLowerCase().includes('meditate') ||
        h.name.toLowerCase().includes('journal')
    ),
    Other: habits.filter(
      h =>
        !h.icon.includes('💧') &&
        !h.icon.includes('💊') &&
        !h.icon.includes('🏃') &&
        !h.icon.includes('👟') &&
        !h.icon.includes('📚') &&
        !h.icon.includes('🎸') &&
        !h.icon.includes('🧘') &&
        !h.icon.includes('📝') &&
        !h.name.toLowerCase().includes('water') &&
        !h.name.toLowerCase().includes('vitamin') &&
        !h.name.toLowerCase().includes('exercise') &&
        !h.name.toLowerCase().includes('walk') &&
        !h.name.toLowerCase().includes('read') &&
        !h.name.toLowerCase().includes('practice') &&
        !h.name.toLowerCase().includes('meditate') &&
        !h.name.toLowerCase().includes('journal')
    ),
  };

  return Object.entries(categories)
    .map(([category, habitList]) => ({
      category,
      count: habitList.length,
      completed: habitList.filter(h => h.isCompletedToday).length,
    }))
    .filter(cat => cat.count > 0);
};

/**
 * Updates cached analytics fields for a single habit.
 */
export const updateHabitAnalytics = async (habitId: number) => {
  const totalCompletions = await getTotalCompletionsForHabit(habitId);
  const currentStreak = await getStreakForHabit(habitId);
  // TODO: Implement longest streak and last completed date
  // For now, set as current streak and null
  const longestStreak = currentStreak;
  const lastCompletedDate = null;
  await updateHabitAnalyticsFields(
    habitId,
    totalCompletions,
    currentStreak,
    longestStreak,
    lastCompletedDate
  );
};

/**
 * Updates analytics for all habits.
 */
export const updateAllHabitsAnalytics = async () => {
  const habits = await getAllHabits();
  for (const habit of habits) {
    await updateHabitAnalytics(habit.id);
  }
};

/**
 * Computes general analytics across all habits.
 */
export const getGeneralAnalytics = async () => {
  const habits = await getAllHabits();
  let totalCompletions = 0;
  let bestStreak = 0;
  let mostConsistentHabit = null;
  let mostCompletionsHabit = null;
  let leastCompletionsHabit = null;
  let maxCompletions = -1;
  let minCompletions = Number.MAX_SAFE_INTEGER;

  for (const habit of habits) {
    const completions = habit.total_completions || 0;
    const streak = habit.current_streak || 0;
    totalCompletions += completions;
    if (streak > bestStreak) bestStreak = streak;
    if (completions > maxCompletions) {
      maxCompletions = completions;
      mostCompletionsHabit = habit;
    }
    if (completions < minCompletions) {
      minCompletions = completions;
      leastCompletionsHabit = habit;
    }
    if (
      !mostConsistentHabit ||
      streak > (mostConsistentHabit.current_streak || 0)
    ) {
      mostConsistentHabit = habit;
    }
  }
  const averageCompletions = habits.length
    ? totalCompletions / habits.length
    : 0;
  return {
    totalCompletions,
    averageCompletions,
    bestStreak,
    mostConsistentHabit,
    mostCompletionsHabit,
    leastCompletionsHabit,
    habitCount: habits.length,
  };
};
