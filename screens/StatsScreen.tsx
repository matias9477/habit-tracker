import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore } from '../store/habitStore';
import { getThemeColors, useTheme } from '../utils/theme';
import {
  calculateHabitStats,
  calculateHabitTrends,
  getWeeklyData,
  getCategoryStats,
  HabitStats,
  HabitTrend,
} from '../utils/statsCalculator';

/**
 * Enhanced Stats screen that provides actionable insights and clear explanations.
 * Focuses on helping users understand their habit patterns and improve their routines.
 */
export const StatsScreen: React.FC = () => {
  console.log('[StatsScreen] Rendered');
  const { isDarkMode } = useTheme();
  const { habits } = useHabitStore();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<HabitStats | null>(null);
  const [trends, setTrends] = useState<HabitTrend[]>([]);
  const [weeklyData, setWeeklyData] = useState<
    { date: string; completed: number; total: number }[]
  >([]);
  const [categoryStats, setCategoryStats] = useState<
    { category: string; count: number; completed: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const [statsData, trendsData, weeklyData, categoryData] =
          await Promise.all([
            calculateHabitStats(habits),
            calculateHabitTrends(habits),
            getWeeklyData(habits),
            getCategoryStats(habits),
          ]);

        setStats(statsData);
        setTrends(trendsData);
        setWeeklyData(weeklyData);
        setCategoryStats(categoryData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [habits]);

  const renderInsightCard = (
    title: string,
    value: string | number,
    description: string,
    icon: string,
    color?: string
  ) => (
    <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
      <View style={styles.insightHeader}>
        <Ionicons
          name={icon as any}
          size={20}
          color={color || colors.primary}
          style={styles.insightIcon}
        />
        <Text style={[styles.insightTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.insightValue, { color: color || colors.primary }]}>
        {value}
      </Text>
      <Text
        style={[styles.insightDescription, { color: colors.textSecondary }]}
      >
        {description}
      </Text>
    </View>
  );

  const renderHabitInsight = (trend: HabitTrend) => {
    const getInsightMessage = () => {
      if (trend.completionRate >= 80) {
        return "Excellent! You're building a strong habit.";
      } else if (trend.completionRate >= 60) {
        return 'Good progress! Keep up the consistency.';
      } else if (trend.completionRate >= 40) {
        return "You're getting started. Try to be more consistent.";
      } else {
        return 'This habit needs more attention. Start small and build up.';
      }
    };

    const getInsightColor = () => {
      if (trend.completionRate >= 80) return colors.success;
      if (trend.completionRate >= 60) return colors.primary;
      if (trend.completionRate >= 40) return '#FFA726'; // Orange
      return colors.error || '#F44336';
    };

    return (
      <View
        key={trend.habitId}
        style={[styles.habitInsightCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.habitInsightHeader}>
          <Text style={[styles.habitName, { color: colors.text }]}>
            {trend.habitName}
          </Text>
          <View style={styles.habitStats}>
            <Text style={[styles.streakText, { color: colors.primary }]}>
              {trend.currentStreak} day streak
            </Text>
            <Text style={[styles.completionText, { color: getInsightColor() }]}>
              {trend.completionRate}% completion
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${trend.completionRate}%`,
                  backgroundColor: getInsightColor(),
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.insightMessage, { color: colors.textSecondary }]}>
          {getInsightMessage()}
        </Text>
      </View>
    );
  };

  const renderWeeklyProgress = () => {
    if (weeklyData.length === 0) return null;

    const totalHabits = habits.length;
    const weeklyAverage = Math.round(
      weeklyData.reduce((sum, day) => sum + day.completed, 0) /
        weeklyData.length
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          This Week's Progress
        </Text>
        <View style={styles.weeklyContainer}>
          {weeklyData.map((day, index) => (
            <View key={index} style={styles.weeklyDay}>
              <Text
                style={[styles.weeklyDayLabel, { color: colors.textSecondary }]}
              >
                {day.date}
              </Text>
              <View
                style={[styles.weeklyBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.weeklyBarFill,
                    {
                      height: `${(day.completed / totalHabits) * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.weeklyCount, { color: colors.text }]}>
                {day.completed}/{totalHabits}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.weeklySummary, { color: colors.textSecondary }]}>
          Average: {weeklyAverage}/{totalHabits} habits completed per day
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Analyzing your habits...
          </Text>
        </View>
      </View>
    );
  }

  if (!stats || habits.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="analytics-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Habits Yet
          </Text>
          <Text
            style={[styles.emptyDescription, { color: colors.textSecondary }]}
          >
            Create your first habit to see detailed insights and progress
            tracking.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.background },
        ]}
        style={{ flex: 1, paddingTop: insets.top }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Habit Insights
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Understand your patterns and improve your routine
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Summary
          </Text>
          <View style={styles.metricsGrid}>
            {renderInsightCard(
              'Completed Today',
              `${stats.completedToday}/${stats.totalHabits}`,
              'Habits you finished today',
              'checkmark-circle-outline',
              colors.success
            )}
            {renderInsightCard(
              'Daily Success Rate',
              `${stats.completionRate}%`,
              'Percentage of habits completed today',
              'trending-up-outline',
              stats.completionRate >= 80 ? colors.success : colors.primary
            )}
          </View>
        </View>

        {/* Habit Insights */}
        {trends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Individual Habit Analysis
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: colors.textSecondary },
              ]}
            >
              See how each habit is performing and get personalized insights
            </Text>
            {trends.map(renderHabitInsight)}
          </View>
        )}

        {/* Weekly Progress */}
        {renderWeeklyProgress()}

        {/* Categories */}
        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Category Performance
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: colors.textSecondary },
              ]}
            >
              See which areas of your life are getting the most attention
            </Text>
            {categoryStats.map(category => (
              <View
                key={category.category}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {category.category}
                </Text>
                <View style={styles.categoryProgress}>
                  <View
                    style={[
                      styles.categoryBar,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${(category.completed / category.count) * 100}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryStats,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {category.completed}/{category.count} completed
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Items */}
        {stats.needsAttention && stats.needsAttention.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Habits Needing Attention
            </Text>
            <View
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.actionHeader}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={colors.error || '#F44336'}
                  style={styles.actionIcon}
                />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Focus on: {stats.needsAttention.join(', ')}
                </Text>
              </View>
              <Text style={[styles.actionTip, { color: colors.textSecondary }]}>
                Tip: Start with just one habit and build momentum
              </Text>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tips for Success
          </Text>
          <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Consistency beats perfection. Even small daily actions build
                powerful habits.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Stack new habits onto existing routines for better success
                rates.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons
                name="trophy-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Celebrate small wins to reinforce positive behavior patterns.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  habitInsightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitInsightHeader: {
    marginBottom: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weeklyDay: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyDayLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  weeklyBar: {
    width: 20,
    height: 60,
    borderRadius: 10,
    marginBottom: 4,
  },
  weeklyBarFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  weeklyCount: {
    fontSize: 10,
    fontWeight: '500',
  },
  weeklySummary: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryStats: {
    fontSize: 14,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionTip: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
