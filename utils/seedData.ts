import { insertHabitWithDate } from '@/db/habits';
import { markHabitCompleted, incrementHabitCount } from '@/db/completions';

/**
 * Seeds the database with fake habit data and completion history.
 * This simulates a user who has been using the app for a while.
 * Habits are created with different dates to test date filtering.
 */
export const seedFakeData = async () => {
  try {
    // Create some realistic habits with different creation dates
    const habits = [
      {
        name: 'Drink Water',
        icon: '💧',
        goalType: 'count',
        targetCount: 8,
        createdAt: new Date(2025, 6, 1), // July 1st
      },
      {
        name: 'Exercise',
        icon: '🏃‍♂️',
        goalType: 'binary',
        createdAt: new Date(2025, 6, 5), // July 5th
      },
      {
        name: 'Read',
        icon: '📚',
        goalType: 'count',
        targetCount: 30, // minutes
        createdAt: new Date(2025, 6, 10), // July 10th
      },
      {
        name: 'Meditate',
        icon: '🧘‍♀️',
        goalType: 'binary',
        createdAt: new Date(2025, 6, 12), // July 12th
      },
      {
        name: 'Take Vitamins',
        icon: '💊',
        goalType: 'binary',
        createdAt: new Date(2025, 6, 15), // July 15th
      },
      {
        name: 'Walk 10k Steps',
        icon: '👟',
        goalType: 'count',
        targetCount: 10000,
        createdAt: new Date(2025, 6, 16), // July 16th
      },
      {
        name: 'Practice Guitar',
        icon: '🎸',
        goalType: 'count',
        targetCount: 20, // minutes
        createdAt: new Date(2025, 6, 17), // July 17th
      },
      {
        name: 'Journal',
        icon: '📝',
        goalType: 'binary',
        createdAt: new Date(2025, 6, 18), // July 18th
      },
    ];

    // Insert habits and get their IDs
    const habitIds: number[] = [];
    for (const habit of habits) {
      const id = await insertHabitWithDate(
        habit.name,
        habit.icon,
        habit.createdAt,
        'general', // category
        habit.goalType,
        undefined, // customEmoji
        habit.targetCount,
        undefined // targetTimeMinutes
      );
      if (id) {
        habitIds.push(id);
        console.log(
          `✅ Created habit: ${habit.name} (created: ${habit.createdAt.toISOString().slice(0, 10)})`
        );
      }
    }

    // Filter out any undefined IDs
    const validHabitIds = habitIds.filter(
      (id): id is number => id !== undefined
    );

    // Generate completion data for the last 30 days
    const today = new Date();
    const completionData = [
      // Water drinking - varies daily (created July 1st)
      {
        habitId: validHabitIds[0],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          6, 8, 7, 5, 8, 9, 8, 7, 6, 8, 9, 8, 7, 8, 9, 8, 7, 6, 8, 9, 8, 7, 8,
          9, 8, 7, 6, 8, 9, 8,
        ],
      },

      // Exercise - mostly consistent (created July 5th)
      {
        habitId: validHabitIds[1],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Reading - some missed days (created July 10th)
      {
        habitId: validHabitIds[2],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          25, 30, 35, 20, 30, 40, 30, 25, 30, 35, 30, 20, 30, 40, 30, 25, 30,
          35, 30, 20, 30, 40, 30, 25, 30, 35, 30, 20, 30, 40,
        ],
      },

      // Meditation - good streak (created July 12th)
      {
        habitId: validHabitIds[3],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Vitamins - perfect streak (created July 15th)
      {
        habitId: validHabitIds[4],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Walking - some missed days (created July 16th)
      {
        habitId: validHabitIds[5],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          8500, 12000, 11000, 9500, 13000, 11500, 10500, 12000, 11000, 9500,
          13000, 11500, 10500, 12000, 11000, 9500, 13000, 11500, 10500, 12000,
          11000, 9500, 13000, 11500, 10500, 12000, 11000, 9500, 13000, 11500,
        ],
      },

      // Guitar - inconsistent (created July 17th)
      {
        habitId: validHabitIds[6],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20,
          30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30,
        ],
      },

      // Journal - some missed days (created July 18th)
      {
        habitId: validHabitIds[7],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },
    ];

    // Add completion data for each habit
    for (const data of completionData) {
      // Skip if habitId is undefined
      if (data.habitId === undefined) continue;

      for (let i = 0; i < data.days.length; i++) {
        const daysAgo = data.days[i];
        if (daysAgo === undefined) continue;

        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const dateStr = date.toISOString().slice(0, 10);

        if (data.counts && data.counts[i] !== undefined) {
          // For count-based habits, add the specific count
          const count = data.counts[i];
          if (count !== undefined) {
            for (let j = 0; j < count; j++) {
              await incrementHabitCount(data.habitId, dateStr);
            }
          }
        } else {
          // For binary habits, just mark as completed
          await markHabitCompleted(data.habitId, dateStr);
        }
      }
    }

    // Add some partial progress for today
    const todayStr = today.toISOString().slice(0, 10);

    // Water: 5/8 glasses today
    if (validHabitIds.length > 0) {
      for (let i = 0; i < 5; i++) {
        if (typeof validHabitIds[0] === 'number')
          await incrementHabitCount(validHabitIds[0], todayStr);
      }
    }

    // Reading: 15/30 minutes today
    if (validHabitIds.length > 2) {
      for (let i = 0; i < 15; i++) {
        if (typeof validHabitIds[2] === 'number')
          await incrementHabitCount(validHabitIds[2], todayStr);
      }
    }

    // Walking: 6500/10000 steps today
    if (validHabitIds.length > 5) {
      for (let i = 0; i < 6500; i++) {
        if (typeof validHabitIds[5] === 'number')
          await incrementHabitCount(validHabitIds[5], todayStr);
      }
    }

    // Guitar: 10/20 minutes today
    if (validHabitIds.length > 6) {
      for (let i = 0; i < 10; i++) {
        if (typeof validHabitIds[6] === 'number')
          await incrementHabitCount(validHabitIds[6], todayStr);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding fake data:', error);
  }
};

/**
 * Clears all data from the database (for testing).
 */
export const clearAllData = async () => {
  try {
    const db = await import('../db/database').then(m => m.getDatabase());

    // Delete all completions
    await db.runAsync('DELETE FROM habit_completions');

    // Delete all habits
    await db.runAsync('DELETE FROM habits');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};
