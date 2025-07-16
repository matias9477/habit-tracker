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
import { getThemeColors } from '../utils/theme';
import { HabitWithCompletion } from '../store/habitStore';
import { EditHabitModal } from '../components/EditHabitModal';
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
  const { isDarkMode } = useThemeStore();
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

  const renderChartSection = () => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Weekly Progress
      </Text>

      <View style={styles.weeklyChart}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
          const value = weeklyData[index] || 0;
          const maxValue =
            habit.goal_type === 'count' ? habit.targetCount || 1 : 1;
          const height = (value / maxValue) * 100;

          return (
            <View key={day} style={styles.chartBar}>
              <View style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${height}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.chartLabel, { color: colors.textSecondary }]}
              >
                {day}
              </Text>
              <Text style={[styles.chartValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Header */}
        <View style={styles.habitHeader}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {habit.name}
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {renderProgressSection()}
        {renderStatsSection()}
        {renderChartSection()}
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
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    width: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartBarFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  chartLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '500',
  },
});
