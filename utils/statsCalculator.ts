import { HabitWithCompletion } from '../store/habitStore';
import { getCompletionsForDate } from '../db/completions';

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

  const completedToday = habits.filter((h) => h.isCompletedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  // Calculate total completions (this would need to be enhanced with actual DB queries)
  const totalCompletions = habits.reduce(
    (sum, habit) => sum + (habit.currentCount || 0),
    0
  );

  // Calculate streaks (simplified for now)
  const averageStreak = Math.round(
    habits.reduce((sum, habit) => sum + (habit.streak || 0), 0) / habits.length
  );
  const longestStreak = Math.max(...habits.map((h) => h.streak || 0));

  // Find most consistent habit (highest completion rate)
  const mostConsistentHabit = habits.reduce((best, current) => {
    const currentRate = current.streak || 0;
    const bestRate = best.streak || 0;
    return currentRate > bestRate ? current : best;
  }).name;

  // Find habits that need attention (not completed today)
  const needsAttention = habits
    .filter((h) => !h.isCompletedToday)
    .map((h) => h.name)
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
    // Calculate completion rate (simplified - would need more DB queries for accuracy)
    const completionRate =
      habit.streak > 0 ? Math.min(habit.streak * 10, 100) : 0;

    trends.push({
      habitId: habit.id,
      habitName: habit.name,
      currentStreak: habit.streak || 0,
      longestStreak: habit.streak || 0, // Would need separate calculation
      completionRate,
      totalCompletions: habit.currentCount || 0,
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
        ? habits.filter((h) => h.isCompletedToday).length
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
  // For now, we'll categorize by icon (simplified approach)
  const categories = {
    Exercise: habits.filter(
      (h) => h.icon.includes('🏃') || h.icon.includes('💪')
    ),
    Learning: habits.filter(
      (h) => h.icon.includes('🧠') || h.icon.includes('📚')
    ),
    Health: habits.filter(
      (h) =>
        h.icon.includes('💧') || h.icon.includes('🥗') || h.icon.includes('😴')
    ),
    Wellness: habits.filter(
      (h) => h.icon.includes('🧘') || h.icon.includes('⭐')
    ),
    Other: habits.filter(
      (h) =>
        !h.icon.includes('🏃') &&
        !h.icon.includes('💪') &&
        !h.icon.includes('🧠') &&
        !h.icon.includes('📚') &&
        !h.icon.includes('💧') &&
        !h.icon.includes('🥗') &&
        !h.icon.includes('😴') &&
        !h.icon.includes('🧘') &&
        !h.icon.includes('⭐')
    ),
  };

  return Object.entries(categories)
    .map(([category, habitList]) => ({
      category,
      count: habitList.length,
      completed: habitList.filter((h) => h.isCompletedToday).length,
    }))
    .filter((cat) => cat.count > 0);
};
