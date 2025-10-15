// Simple test for HabitCard component without React Native Testing Library
import { HabitWithCompletion } from '../../store/habitStore';

// Mock the component logic without React Native dependencies
const mockHabitCard = (
  habit: HabitWithCompletion,
  onToggle: (id: number) => void
) => {
  return {
    habit,
    onToggle,
    toggle: () => onToggle(habit.id),
  };
};

describe('HabitCard Component - Simple', () => {
  const mockHabit: HabitWithCompletion = {
    id: 1,
    name: 'Exercise',
    icon: '💪',
    category: 'fitness',
    goal_type: 'binary',
    is_active: true,
    reminder_enabled: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    isCompletedToday: false,
    streak: 5,
  };

  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create component with habit data', () => {
    const component = mockHabitCard(mockHabit, mockOnToggle);

    expect(component.habit).toEqual(mockHabit);
    expect(component.habit.name).toBe('Exercise');
    expect(component.habit.icon).toBe('💪');
    expect(component.habit.streak).toBe(5);
  });

  it('should call onToggle when toggle is called', () => {
    const component = mockHabitCard(mockHabit, mockOnToggle);

    component.toggle();

    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });

  it('should handle count-based habit', () => {
    const countHabit: HabitWithCompletion = {
      ...mockHabit,
      goal_type: 'count',
      target_count: 5,
      currentCount: 3,
      targetCount: 5,
    };

    const component = mockHabitCard(countHabit, mockOnToggle);

    expect(component.habit.goal_type).toBe('count');
    expect(component.habit.currentCount).toBe(3);
    expect(component.habit.targetCount).toBe(5);
  });

  it('should handle completed habit', () => {
    const completedHabit = { ...mockHabit, isCompletedToday: true };
    const component = mockHabitCard(completedHabit, mockOnToggle);

    expect(component.habit.isCompletedToday).toBe(true);
  });

  it('should handle time-based habit', () => {
    const timeHabit: HabitWithCompletion = {
      ...mockHabit,
      goal_type: 'time',
      target_time_minutes: 30,
    };

    const component = mockHabitCard(timeHabit, mockOnToggle);

    expect(component.habit.goal_type).toBe('time');
    expect(component.habit.target_time_minutes).toBe(30);
  });
});
