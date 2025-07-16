import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore, HabitWithCompletion } from '@/store/habitStore';
import { getThemeColors, useTheme } from '@/utils/theme';
import { HabitCard } from '@/components/HabitCard';
import { DateHeader } from '@/components/DateHeader';
import { AddHabitModal } from '@/components/AddHabitModal';
import { EditHabitModal } from '@/components/EditHabitModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  MainTabs: undefined;
  HabitDetails: { habit: HabitWithCompletion };
};

type TodayScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

/**
 * The main screen that displays today's habits and allows users to mark them as completed.
 * Shows a list of habits separated by completion status and provides toggle functionality.
 * Includes an "Add Habit" button to create new habits and edit/delete functionality.
 * Supports date navigation to view and edit past days.
 */
export const TodayScreen: React.FC = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] =
    useState<HabitWithCompletion | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const navigation = useNavigation<TodayScreenNavigationProp>();
  const {
    habits,
    isLoading,
    error,
    loadHabits,
    loadHabitsForDate,
    toggleHabitCompletion,
    toggleHabitCompletionForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    clearError,
  } = useHabitStore();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // Load habits for the selected date
  useEffect(() => {
    loadHabitsForDate(selectedDate);
  }, [selectedDate, loadHabitsForDate]);

  const handleToggleHabit = async (habitId: number) => {
    await toggleHabitCompletionForDate(habitId, selectedDate);
  };

  const handleRefresh = () => {
    loadHabits();
  };

  const handleAddHabit = async (
    name: string,
    category: string,
    goalType: string,
    targetCount?: number,
    customEmoji?: string
  ) => {
    const success = await addHabit(
      name,
      category,
      goalType,
      targetCount,
      customEmoji
    );
    if (success) {
      setIsAddModalVisible(false);
    }
    return success;
  };

  const handleShowDetails = (habit: HabitWithCompletion) => {
    navigation.navigate('HabitDetails', { habit });
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
      setIsEditModalVisible(false);
      setSelectedHabit(null);
      // Refresh habits for the selected date
      loadHabitsForDate(selectedDate);
    }
    return success;
  };

  const handleDeleteHabit = async (id: number) => {
    const success = await deleteHabit(id);
    if (success) {
      setIsEditModalVisible(false);
      setSelectedHabit(null);
    }
    return success;
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleTodayPress = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Separate habits by completion status
  const completedHabits = habits.filter(habit => {
    if (habit.goal_type === 'count') {
      // For count goals, only mark as completed when target is reached
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;
      return currentCount >= targetCount;
    }
    // For binary goals, use the isCompletedToday flag
    return habit.isCompletedToday;
  });
  const pendingHabits = habits.filter(habit => {
    if (habit.goal_type === 'count') {
      // For count goals, mark as pending when target is not reached
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;
      return currentCount < targetCount;
    }
    // For binary goals, use the inverse of isCompletedToday flag
    return !habit.isCompletedToday;
  });

  type ListItem =
    | { type: 'header'; title: string; count: number }
    | { type: 'habit'; data: HabitWithCompletion };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {item.count}
          </Text>
        </View>
      );
    } else {
      return (
        <HabitCard
          habit={item.data}
          onToggle={handleToggleHabit}
          onPress={handleShowDetails}
          onEdit={() => {
            setSelectedHabit(item.data);
            setIsEditModalVisible(true);
          }}
        />
      );
    }
  };

  /**
   * Renders a friendly empty state when there are no habits at all.
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Let’s add your first habit!
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start building your routine by adding a new habit.
      </Text>
      <TouchableOpacity
        style={[
          styles.addFirstHabitButton,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => setIsAddModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add your first habit"
      >
        <Text
          style={[styles.addFirstHabitButtonText, { color: colors.surface }]}
        >
          Add Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top }}>
        <DateHeader
          date={selectedDate}
          onDateChange={handleDateChange}
          onTodayPress={handleTodayPress}
        />
      </View>

      <FlatList
        data={
          habits.length === 0
            ? []
            : ([
                {
                  type: 'header' as const,
                  title: 'Pending',
                  count: pendingHabits.length,
                },
                ...pendingHabits.map(habit => ({
                  type: 'habit' as const,
                  data: habit,
                })),
                {
                  type: 'header' as const,
                  title: 'Completed',
                  count: completedHabits.length,
                },
                ...completedHabits.map(habit => ({
                  type: 'habit' as const,
                  data: habit,
                })),
              ] as ListItem[])
        }
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header'
            ? `header-${item.title}`
            : `habit-${item.data.id}-${index}`
        }
        contentContainerStyle={[
          styles.listContainer,
          { backgroundColor: colors.background },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Floating Add Button */}
      {habits.length > 0 && (
        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            {
              backgroundColor: colors.primary,
              bottom: Math.max(24, insets.bottom),
              right: Math.max(24, insets.right),
            },
          ]}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingAddButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddHabit}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        visible={isEditModalVisible}
        habit={selectedHabit}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedHabit(null);
        }}
        onUpdate={handleUpdateHabit}
        onDelete={handleDeleteHabit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
    paddingBottom: 120, // Add extra padding to account for the floating button and tab bar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstHabitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstHabitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingAddButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
