import { getDatabase } from '../../db/database';
import {
  insertHabit,
  insertHabitWithDate,
  updateHabit,
  deleteHabit,
  getAllHabits,
  getHabitsForDate,
  getEarliestHabitDate,
  softDeleteHabit,
  reactivateHabit,
} from '../../db/habits';

// Mock the database module
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(),
}));

const mockDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

describe('Habits Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  describe('insertHabit', () => {
    it('should insert a habit with default values', async () => {
      const mockResult = { lastInsertRowId: 1, changes: 1 };
      mockDb.runAsync.mockResolvedValue(mockResult);

      const result = await insertHabit('Test Habit', '📝', 'general');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO habits'),
        expect.arrayContaining([
          'Test Habit',
          '📝',
          'general',
          null, // custom_emoji
          'binary', // goal_type
          null, // target_count
          null, // target_time_minutes
          0, // reminder_enabled
          null, // reminder_time
          1, // is_active
          expect.any(String), // created_at
          expect.any(String), // updated_at
        ])
      );
      expect(result).toBe(1);
    });

    it('should insert a habit with custom values', async () => {
      const mockResult = { lastInsertRowId: 2, changes: 1 };
      mockDb.runAsync.mockResolvedValue(mockResult);

      const result = await insertHabit(
        'Exercise',
        '💪',
        'fitness',
        'count',
        '🏃',
        5,
        30,
        true,
        '08:00'
      );

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO habits'),
        expect.arrayContaining([
          'Exercise',
          '💪',
          'fitness',
          '🏃',
          'count',
          5,
          30,
          1, // reminder_enabled
          '08:00',
          1, // is_active
          expect.any(String),
          expect.any(String),
        ])
      );
      expect(result).toBe(2);
    });

    it('should return null on error', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      const result = await insertHabit('Test Habit', '📝');

      expect(result).toBeNull();
    });
  });

  describe('insertHabitWithDate', () => {
    it('should insert a habit with custom creation date', async () => {
      const mockResult = { lastInsertRowId: 3, changes: 1 };
      mockDb.runAsync.mockResolvedValue(mockResult);
      const customDate = new Date('2023-01-15');

      const result = await insertHabitWithDate(
        'Old Habit',
        '📅',
        customDate,
        'general',
        'binary',
        '🎯',
        1,
        15
      );

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO habits'),
        expect.arrayContaining([
          'Old Habit',
          '📅',
          'general',
          '🎯',
          'binary',
          1,
          15,
          1, // is_active
          '2023-01-15', // created_at
          '2023-01-15', // updated_at
        ])
      );
      expect(result).toBe(3);
    });
  });

  describe('updateHabit', () => {
    it('should update a habit successfully', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await updateHabit(
        1,
        'Updated Habit',
        '🔄',
        'productivity',
        'time',
        '⏰',
        1,
        60,
        true,
        '09:00'
      );

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE habits SET'),
        expect.arrayContaining([
          'Updated Habit',
          '🔄',
          'productivity',
          '⏰',
          'time',
          1,
          60,
          1, // reminder_enabled
          '09:00',
          expect.any(String), // updated_at
          1, // id
        ])
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Update failed'));

      const result = await updateHabit(
        1,
        'Updated Habit',
        '🔄',
        'general',
        'binary',
        '🎯',
        1,
        15,
        true,
        '09:00'
      );

      expect(result).toBe(false);
    });
  });

  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await deleteHabit(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM habits WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteHabit(1);

      expect(result).toBe(false);
    });
  });

  describe('getAllHabits', () => {
    it('should return all active habits', async () => {
      const mockHabits = [
        {
          id: 1,
          name: 'Exercise',
          icon: '💪',
          category: 'fitness',
          goal_type: 'binary',
          is_active: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        {
          id: 2,
          name: 'Read',
          icon: '📚',
          category: 'learning',
          goal_type: 'count',
          target_count: 5,
          is_active: 1,
          created_at: '2023-01-02',
          updated_at: '2023-01-02',
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockHabits);

      const result = await getAllHabits();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC'
      );
      expect(result).toEqual(mockHabits);
    });

    it('should return empty array on error', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Query failed'));

      const result = await getAllHabits();

      expect(result).toEqual([]);
    });
  });

  describe('getHabitsForDate', () => {
    it('should return habits created on or before the given date', async () => {
      const mockHabits = [
        {
          id: 1,
          name: 'Old Habit',
          icon: '📅',
          category: 'general',
          goal_type: 'binary',
          is_active: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockHabits);
      const testDate = new Date('2023-01-15');

      const result = await getHabitsForDate(testDate);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM habits WHERE DATE(created_at) <= ? AND is_active = 1 ORDER BY created_at DESC',
        ['2023-01-15']
      );
      expect(result).toEqual(mockHabits);
    });
  });

  describe('getEarliestHabitDate', () => {
    it('should return the earliest habit creation date', async () => {
      const mockResult = { created_at: '2023-01-01' };
      mockDb.getFirstAsync.mockResolvedValue(mockResult);

      const result = await getEarliestHabitDate();

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT created_at FROM habits ORDER BY created_at ASC LIMIT 1'
      );
      expect(result).toEqual(new Date('2023-01-01'));
    });

    it('should return null if no habits exist', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await getEarliestHabitDate();

      expect(result).toBeNull();
    });
  });

  describe('softDeleteHabit', () => {
    it('should soft delete a habit by setting is_active to false', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await softDeleteHabit(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE habits SET is_active = 0, updated_at = ? WHERE id = ?',
        [expect.any(String), 1]
      );
      expect(result).toBe(true);
    });
  });

  describe('reactivateHabit', () => {
    it('should reactivate a soft-deleted habit', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await reactivateHabit(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE habits SET is_active = 1, updated_at = ? WHERE id = ?',
        [expect.any(String), 1]
      );
      expect(result).toBe(true);
    });
  });
});
