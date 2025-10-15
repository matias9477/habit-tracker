import { getDatabase } from '../../db/database';
import {
  markHabitCompleted,
  unmarkHabitCompleted,
  incrementHabitCount,
  decrementHabitCount,
  getCompletionsForDate,
  getStreakForHabit,
  getAllCompletionsForHabit,
} from '../../db/completions';

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

describe('Completions Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  describe('markHabitCompleted', () => {
    it('should mark a habit as completed for today', async () => {
      const mockResult = { lastInsertRowId: 1, changes: 1 };
      mockDb.runAsync.mockResolvedValue(mockResult);

      const result = await markHabitCompleted(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT OR IGNORE INTO habit_completions (habit_id, date, notes, completed_at) VALUES (?, ?, ?, ?)',
        expect.arrayContaining([
          1,
          expect.any(String),
          null,
          expect.any(String),
        ])
      );
      expect(result).toBe(1);
    });

    it('should mark a habit as completed for a specific date', async () => {
      const mockResult = { lastInsertRowId: 2, changes: 1 };
      mockDb.runAsync.mockResolvedValue(mockResult);

      const result = await markHabitCompleted(
        1,
        '2023-01-15',
        'Great workout!'
      );

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT OR IGNORE INTO habit_completions (habit_id, date, notes, completed_at) VALUES (?, ?, ?, ?)',
        [1, '2023-01-15', 'Great workout!', expect.any(String)]
      );
      expect(result).toBe(2);
    });

    it('should return null on error', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      const result = await markHabitCompleted(1);

      expect(result).toBeNull();
    });
  });

  describe('unmarkHabitCompleted', () => {
    it('should unmark a habit as completed for today', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await unmarkHabitCompleted(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
        [1, expect.any(String)]
      );
      expect(result).toBe(true);
    });

    it('should unmark a habit as completed for a specific date', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await unmarkHabitCompleted(1, '2023-01-15');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
        [1, '2023-01-15']
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Delete failed'));

      const result = await unmarkHabitCompleted(1);

      expect(result).toBe(false);
    });
  });

  describe('incrementHabitCount', () => {
    it('should increment count for a habit when no existing record', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

      const result = await incrementHabitCount(1);

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?',
        [1, expect.any(String)]
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO habit_completions (habit_id, date, count, completed_at) VALUES (?, ?, 1, ?)',
        [1, expect.any(String), expect.any(String)]
      );
      expect(result).toBe(1);
    });

    it('should increment count for a habit when record exists', async () => {
      const existingRecord = {
        id: 1,
        habit_id: 1,
        date: '2023-01-15',
        count: 2,
        completed_at: '2023-01-15T10:00:00Z',
      };
      mockDb.getFirstAsync.mockResolvedValue(existingRecord);
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await incrementHabitCount(1, '2023-01-15');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE habit_completions SET count = ?, completed_at = ? WHERE habit_id = ? AND date = ?',
        [3, expect.any(String), 1, '2023-01-15']
      );
      expect(result).toBe(3); // 2 + 1
    });

    it('should return 0 on error', async () => {
      mockDb.getFirstAsync.mockRejectedValue(new Error('Query failed'));

      const result = await incrementHabitCount(1);

      expect(result).toBe(0);
    });
  });

  describe('decrementHabitCount', () => {
    it('should decrement count for a habit', async () => {
      const existingRecord = {
        id: 1,
        habit_id: 1,
        date: '2023-01-15',
        count: 3,
        completed_at: '2023-01-15T10:00:00Z',
      };
      mockDb.getFirstAsync.mockResolvedValue(existingRecord);
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await decrementHabitCount(1, '2023-01-15');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE habit_completions SET count = ? WHERE habit_id = ? AND date = ?',
        [2, 1, '2023-01-15']
      );
      expect(result).toBe(2); // 3 - 1
    });

    it('should delete record when count reaches 0', async () => {
      const existingRecord = {
        id: 1,
        habit_id: 1,
        date: '2023-01-15',
        count: 1,
        completed_at: '2023-01-15T10:00:00Z',
      };
      mockDb.getFirstAsync.mockResolvedValue(existingRecord);
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 });

      const result = await decrementHabitCount(1, '2023-01-15');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
        [1, '2023-01-15']
      );
      expect(result).toBe(0);
    });

    it('should return 0 when no existing record', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await decrementHabitCount(1);

      expect(result).toBe(0);
    });
  });

  describe('getCompletionsForDate', () => {
    it('should return completions for a specific date', async () => {
      const mockCompletions = [
        {
          id: 1,
          habit_id: 1,
          date: '2023-01-15',
          count: 1,
          completed_at: '2023-01-15T10:00:00Z',
        },
        {
          id: 2,
          habit_id: 2,
          date: '2023-01-15',
          count: 3,
          completed_at: '2023-01-15T11:00:00Z',
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockCompletions);

      const result = await getCompletionsForDate('2023-01-15');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM habit_completions WHERE date = ?',
        ['2023-01-15']
      );
      expect(result).toEqual(mockCompletions);
    });

    it('should return empty array on error', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Query failed'));

      const result = await getCompletionsForDate('2023-01-15');

      expect(result).toEqual([]);
    });
  });

  describe('getStreakForHabit', () => {
    it('should calculate streak correctly', async () => {
      const mockCompletions = [
        { date: '2023-01-15' },
        { date: '2023-01-14' },
        { date: '2023-01-13' },
        { date: '2023-01-11' }, // Gap in streak
      ];
      mockDb.getAllAsync.mockResolvedValue(mockCompletions);

      const result = await getStreakForHabit(1);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT DISTINCT date FROM habit_completions WHERE habit_id = ? ORDER BY date DESC',
        [1]
      );
      expect(result).toBe(3); // 3 consecutive days
    });

    it('should return 0 when no completions', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await getStreakForHabit(1);

      expect(result).toBe(0);
    });
  });

  describe('getAllCompletionsForHabit', () => {
    it('should return all completions for a habit', async () => {
      const mockCompletions = [
        {
          id: 1,
          habit_id: 1,
          date: '2023-01-15',
          count: 1,
          completed_at: '2023-01-15T10:00:00Z',
        },
        {
          id: 2,
          habit_id: 1,
          date: '2023-01-14',
          count: 1,
          completed_at: '2023-01-14T10:00:00Z',
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockCompletions);

      const result = await getAllCompletionsForHabit(1);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM habit_completions WHERE habit_id = ? ORDER BY date DESC',
        [1]
      );
      expect(result).toEqual(mockCompletions);
    });
  });
});
