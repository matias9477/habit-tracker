import { HabitWithCompletion } from '../store/habitStore';
import { getAllHabits } from '../db/habits';
import {
  getTotalCompletionsForHabit,
  getStreakForHabit,
  getCompletionsForDate,
} from '../db/completions';

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
    // Calculate completion rate based on actual completion data
    const totalCompletions = await getTotalCompletionsForHabit(habit.id);

    // Get the habit's creation date
    const habitCreatedAt = new Date(habit.created_at);
    const today = new Date();

    // Calculate days since habit creation
    const daysSinceCreation = Math.ceil(
      (today.getTime() - habitCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate completion rate as: (total completions / days since creation) * 100
    // But cap it at 100% and ensure it's meaningful for new habits
    let completionRate = 0;
    if (daysSinceCreation > 0) {
      completionRate = Math.min(
        Math.round((totalCompletions / daysSinceCreation) * 100),
        100
      );
    } else {
      // For habits created today, use a simple indicator
      completionRate = habit.isCompletedToday ? 100 : 0;
    }

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
 * Get weekly progress data for all habits.
 * @param habits - Array of habits with completion data
 * @returns Promise<{ date: string; completed: number; total: number }[]> - Weekly data
 */
export const getWeeklyData = async (
  habits: HabitWithCompletion[]
): Promise<{ date: string; completed: number; total: number }[]> => {
  if (habits.length === 0) {
    return [];
  }

  const weekData = [];
  const today = new Date();

  // Get data for the current week (Monday to Sunday)
  // Find the most recent Monday
  const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysSinceMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  // Generate data for Monday through Sunday
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    // Use local date string instead of UTC to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Get real completion data from database for this date
    const completions = await getCompletionsForDate(dateString);

    // Count how many habits were completed on this date
    let completed = 0;
    for (const habit of habits) {
      // Check if habit was created before or on this date
      const habitCreatedAt = new Date(habit.created_at);
      if (date >= habitCreatedAt) {
        // Check if this habit was completed on this date
        const completion = completions.find(c => c.habit_id === habit.id);
        if (completion) {
          completed++;
        }
      }
    }

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
  // Group habits by their actual category
  const categoryMap = new Map<string, HabitWithCompletion[]>();

  for (const habit of habits) {
    const category = habit.category || 'General';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(habit);
  }

  // Convert to the expected format
  return Array.from(categoryMap.entries()).map(([category, habitList]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
    count: habitList.length,
    completed: habitList.filter(h => h.isCompletedToday).length,
  }));
};

/**
 * Gets analytics for a single habit.
 * Since we no longer cache analytics fields, this calculates them dynamically.
 */
export const getHabitAnalytics = async (habitId: number) => {
  const totalCompletions = await getTotalCompletionsForHabit(habitId);
  const currentStreak = await getStreakForHabit(habitId);

  return {
    totalCompletions,
    currentStreak,
    // Note: longest streak and last completed date would need additional queries
    // For now, we'll calculate these when needed
  };
};

/**
 * Computes general analytics across all habits.
 * Since we no longer cache analytics fields, this calculates them dynamically.
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

  // Calculate analytics for each habit dynamically
  for (const habit of habits) {
    const completions = await getTotalCompletionsForHabit(habit.id);
    const streak = await getStreakForHabit(habit.id);

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
      streak > (await getStreakForHabit(mostConsistentHabit.id))
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
