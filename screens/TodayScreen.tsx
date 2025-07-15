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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitStore } from '../store/habitStore';
import { HabitCard } from '../components/HabitCard';
import { DateHeader } from '../components/DateHeader';
import { AddHabitModal } from '../components/AddHabitModal';
import { EditHabitModal } from '../components/EditHabitModal';
import { HabitWithCompletion } from '../store/habitStore';

/**
 * The main screen that displays today's habits and allows users to mark them as completed.
 * Shows a list of habits with their completion status and provides toggle functionality.
 * Includes an "Add Habit" button to create new habits and edit/delete functionality.
 */
export const TodayScreen: React.FC = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] =
    useState<HabitWithCompletion | null>(null);

  const {
    habits,
    isLoading,
    error,
    loadHabits,
    toggleHabitCompletion,
    addHabit,
    updateHabit,
    deleteHabit,
    clearError,
  } = useHabitStore();

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleToggleHabit = async (habitId: number) => {
    await toggleHabitCompletion(habitId);
  };

  const handleRefresh = () => {
    loadHabits();
  };

  const handleAddHabit = async (
    name: string,
    icon: string,
    goalType: string,
    targetCount?: number
  ) => {
    const success = await addHabit(name, icon, goalType, targetCount);
    if (success) {
      setIsAddModalVisible(false);
    }
    return success;
  };

  const handleEditHabit = (habit: HabitWithCompletion) => {
    setSelectedHabit(habit);
    setIsEditModalVisible(true);
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
      setIsEditModalVisible(false);
      setSelectedHabit(null);
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

  const renderHabit = ({ item }: { item: any }) => (
    <HabitCard
      habit={item}
      onToggle={handleToggleHabit}
      onEdit={handleEditHabit}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No habits yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first habit to start tracking your daily goals!
      </Text>
      <TouchableOpacity
        style={styles.addFirstHabitButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addFirstHabitButtonText}>Add Your First Habit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DateHeader />

      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      {habits.length > 0 && (
        <TouchableOpacity
          style={styles.floatingAddButton}
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
    </SafeAreaView>
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
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstHabitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstHabitButtonText: {
    color: '#fff',
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
    backgroundColor: '#4CAF50',
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
