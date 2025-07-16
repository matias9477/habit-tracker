import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore } from '@/store/habitStore';
import { getThemeColors, useTheme } from '@/utils/theme';
import {
  calculateHabitStats,
  calculateHabitTrends,
  getWeeklyData,
  getCategoryStats,
  HabitStats,
  HabitTrend,
} from '../utils/statsCalculator';

/**
 * Stats screen component that displays habit analytics and progress.
 * Shows completion rates, streaks, and other habit statistics.
 * Displays real data from the habit store with comprehensive analytics.
 */
export const StatsScreen: React.FC = () => {
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

  const renderStatCard = (
    value: string | number,
    label: string,
    icon: string
  ) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons
        name={icon as any}
        size={24}
        color={colors.primary}
        style={styles.statIcon}
      />
      <Text style={[styles.statNumber, { color: colors.primary }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const renderTrendItem = (trend: HabitTrend) => (
    <View
      key={trend.habitId}
      style={[styles.trendItem, { backgroundColor: colors.surface }]}
    >
      <View style={styles.trendHeader}>
        <Text style={[styles.trendName, { color: colors.text }]}>
          {trend.habitName}
        </Text>
        <Text style={[styles.trendStreak, { color: colors.primary }]}>
          {trend.currentStreak} days
        </Text>
      </View>
      <View style={styles.trendProgress}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${trend.completionRate}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.trendRate, { color: colors.textSecondary }]}>
          {trend.completionRate}% completion
        </Text>
      </View>
    </View>
  );

  const renderCategoryItem = (category: {
    category: string;
    count: number;
    completed: number;
  }) => (
    <View
      key={category.category}
      style={[styles.categoryItem, { backgroundColor: colors.surface }]}
    >
      <Text style={[styles.categoryName, { color: colors.text }]}>
        {category.category}
      </Text>
      <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
        {category.completed}/{category.count} completed
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading stats...
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
            Your Progress
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your habit journey
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            {renderStatCard(
              stats.completedToday,
              'Completed Today',
              'checkmark-circle-outline'
            )}
            {renderStatCard(
              `${stats.completionRate}%`,
              'Completion Rate',
              'trending-up-outline'
            )}
            {renderStatCard(stats.totalHabits, 'Total Habits', 'list-outline')}
            {renderStatCard(stats.averageStreak, 'Avg Streak', 'flame-outline')}
          </View>
        )}

        {trends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Habit Trends
            </Text>
            {trends.slice(0, 3).map(renderTrendItem)}
          </View>
        )}

        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Categories
            </Text>
            {categoryStats.map(renderCategoryItem)}
          </View>
        )}

        {stats?.needsAttention && stats.needsAttention.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Needs Attention
            </Text>
            <View
              style={[
                styles.attentionCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[styles.attentionText, { color: colors.textSecondary }]}
              >
                {stats.needsAttention.join(', ')}
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: 100, // Add extra padding to account for the tab bar
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  trendItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  trendStreak: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  trendProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  trendRate: {
    fontSize: 12,
    color: '#666',
  },
  categoryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  attentionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attentionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
