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
import { useThemeStore } from '../store/themeStore';
import { useHabitStore } from '../store/habitStore';
import { getThemeColors, useTheme } from '../utils/theme';
import { HabitWithCompletion } from '../store/habitStore';
import { EditHabitModal } from '../components/EditHabitModal';
import { ProgressWidget } from '../components/ProgressWidget';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
  const { deleteHabit, updateHabit } = useHabitStore();
  const colors = getThemeColors(isDarkMode);

  const [showEditModal, setShowEditModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);

  // Generate weekly data for the chart
  useEffect(() => {
    const generateWeeklyData = () => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        // Simulate realistic data based on streak
        const baseCompletion =
          habit.streak > 20 ? 0.8 : habit.streak > 10 ? 0.6 : 0.4;
        const randomFactor = Math.random() * 0.4 - 0.2; // ±20% variation
        const completion = Math.max(
          0,
          Math.min(1, baseCompletion + randomFactor)
        );

        if (habit.goal_type === 'count') {
          const targetCount = habit.targetCount || 1;
          data.push(Math.round(completion * targetCount));
        } else {
          data.push(completion > 0.5 ? 1 : 0);
        }
      }
      setWeeklyData(data);
    };

    generateWeeklyData();
  }, [habit]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHabit(habit.id);
            if (success) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdateHabit = async (
    id: number,
    name: string,
    icon: string,
    goalType: string,
    targetCount?: number
  ) => {
    const success = await updateHabit(id, name, icon, goalType, targetCount);
    if (success) {
      setShowEditModal(false);
    }
    return success;
  };

  const renderProgressSection = () => {
    const currentCount = habit.currentCount || 0;
    const targetCount = habit.targetCount || 1;
    const progress =
      habit.goal_type === 'count'
        ? Math.min(currentCount / targetCount, 1)
        : habit.isCompletedToday
          ? 1
          : 0;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Progress
        </Text>

        {habit.goal_type === 'count' ? (
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
                  backgroundColor: habit.isCompletedToday
                    ? colors.success
                    : colors.border,
                },
              ]}
            >
              <Ionicons
                name={habit.isCompletedToday ? 'checkmark' : 'close'}
                size={24}
                color={habit.isCompletedToday ? '#fff' : colors.textSecondary}
              />
            </View>
            <Text style={[styles.completionText, { color: colors.text }]}>
              {habit.isCompletedToday ? 'Completed' : 'Not completed'}
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
            {habit.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Day Streak
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {habit.goal_type === 'count'
              ? habit.currentCount || 0
              : habit.isCompletedToday
                ? 1
                : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {habit.goal_type === 'count' ? habit.targetCount || 1 : 1}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Target
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProgressWidget = () => (
    <ProgressWidget habit={habit} weeklyData={weeklyData} />
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
                <Text style={styles.icon}>{habit.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {habit.name}
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  {habit.goal_type === 'count' ? 'Count Goal' : 'Daily Goal'}
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
                {habit.streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {habit.goal_type === 'count'
                  ? habit.currentCount || 0
                  : habit.isCompletedToday
                    ? 1
                    : 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {habit.goal_type === 'count' ? habit.targetCount || 1 : '1'}
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
        visible={showEditModal}
        habit={habit}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateHabit}
        onDelete={(id) => {
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
