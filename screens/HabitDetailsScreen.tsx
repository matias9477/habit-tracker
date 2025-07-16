import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useHabitStore, HabitWithCompletion } from '@/store/habitStore';
import { getThemeColors, useTheme } from '@/utils/theme';
import { EditHabitModal } from '@/components/EditHabitModal';
import { ProgressWidget } from '@/components/ProgressWidget';
// import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  MainTabs: undefined;
  HabitDetails: { habit: HabitWithCompletion };
};

type HabitDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HabitDetails'
>;

type HabitDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'HabitDetails'
>;

/**
 * Habit details screen that shows comprehensive information about a specific habit.
 * Displays progress, analytics, charts, and provides edit/delete functionality.
 */
export const HabitDetailsScreen: React.FC = () => {
  const navigation = useNavigation<HabitDetailsScreenNavigationProp>();
  const route = useRoute<HabitDetailsScreenRouteProp>();
  const habit = route.params.habit;
  const { isDarkMode } = useTheme();
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const colors = getThemeColors(isDarkMode);

  const [showEditModal, setShowEditModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [latestHabit, setLatestHabit] = useState<HabitWithCompletion>(habit);
  const [editHabit, setEditHabit] = useState<HabitWithCompletion | null>(null);

  // When the modal closes, update the latest habit from the store
  useEffect(() => {
    if (!showEditModal) {
      const updated = habits.find(h => h.id === habit.id);
      if (updated) setLatestHabit(updated);
    }
  }, [showEditModal, habits, habit.id]);

  // Generate weekly data for the chart
  useEffect(() => {
    const generateWeeklyData = () => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        // Simulate realistic data based on streak
        const baseCompletion =
          latestHabit.streak > 20 ? 0.8 : latestHabit.streak > 10 ? 0.6 : 0.4;
        const randomFactor = Math.random() * 0.4 - 0.2; // ±20% variation
        const completion = Math.max(
          0,
          Math.min(1, baseCompletion + randomFactor)
        );

        if (latestHabit.goal_type === 'count') {
          const targetCount = latestHabit.targetCount || 1;
          data.push(Math.round(completion * targetCount));
        } else {
          data.push(completion > 0.5 ? 1 : 0);
        }
      }
      setWeeklyData(data);
    };

    generateWeeklyData();
  }, [latestHabit]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${latestHabit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHabit(latestHabit.id);
            if (success) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    const updated = habits.find(h => h.id === latestHabit.id);
    setEditHabit(updated || latestHabit);
  };

  const handleUpdateHabit = async (
    id: number,
    name: string,
    category: string,
    goalType: string,
    customEmoji?: string,
    targetCount?: number
  ) => {
    const success = await updateHabit(
      id,
      name,
      category,
      goalType,
      customEmoji,
      targetCount
    );
    if (success) {
      setEditHabit(null);
    }
    return success;
  };

  const renderProgressSection = () => {
    const currentCount = latestHabit.currentCount || 0;
    const targetCount = latestHabit.targetCount || 1;
    const progress =
      latestHabit.goal_type === 'count'
        ? Math.min(currentCount / targetCount, 1)
        : latestHabit.isCompletedToday
          ? 1
          : 0;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Progress
        </Text>

        {latestHabit.goal_type === 'count' ? (
          <View style={styles.countProgress}>
            <Text style={[styles.countText, { color: colors.text }]}>
              {currentCount}/{targetCount}
            </Text>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={styles.binaryProgress}>
            <View
              style={[
                styles.completionIndicator,
                {
                  backgroundColor: latestHabit.isCompletedToday
                    ? colors.success
                    : colors.border,
                },
              ]}
            >
              <Ionicons
                name={latestHabit.isCompletedToday ? 'checkmark' : 'close'}
                size={24}
                color={
                  latestHabit.isCompletedToday ? '#fff' : colors.textSecondary
                }
              />
            </View>
            <Text style={[styles.completionText, { color: colors.text }]}>
              {latestHabit.isCompletedToday ? 'Completed' : 'Not completed'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStatsSection = () => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Statistics
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {latestHabit.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Day Streak
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {latestHabit.goal_type === 'count'
              ? latestHabit.currentCount || 0
              : latestHabit.isCompletedToday
                ? 1
                : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {latestHabit.goal_type === 'count'
              ? latestHabit.targetCount || 1
              : 1}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Target
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProgressWidget = () => (
    <ProgressWidget habit={latestHabit} weeklyData={weeklyData} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Habit Header */}
        <View
          style={[styles.habitHeaderCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.habitHeaderContent}>
            <View style={styles.habitInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={styles.icon}>
                  {latestHabit.custom_emoji || latestHabit.icon}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {latestHabit.name}
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  {latestHabit.goal_type === 'count'
                    ? 'Count Goal'
                    : 'Daily Goal'}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleEdit}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.error + '20' },
                ]}
              >
                <Ionicons name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {latestHabit.streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {latestHabit.goal_type === 'count'
                  ? latestHabit.currentCount || 0
                  : latestHabit.isCompletedToday
                    ? 1
                    : 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {latestHabit.goal_type === 'count'
                  ? latestHabit.targetCount || 1
                  : '1'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Target
              </Text>
            </View>
          </View>
        </View>

        {renderProgressSection()}
        {renderStatsSection()}
        {renderProgressWidget()}
      </ScrollView>

      {/* Edit Modal */}
      <EditHabitModal
        visible={!!editHabit}
        habit={editHabit}
        onClose={() => setEditHabit(null)}
        onUpdate={handleUpdateHabit}
        onDelete={id => {
          handleDelete();
          return Promise.resolve(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  habitHeaderCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  habitHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  countProgress: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  binaryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
