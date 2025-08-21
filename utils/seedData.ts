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
    const today = new Date();
    const habits = [
      {
        name: 'Drink Water',
        icon: '💧',
        goalType: 'count',
        targetCount: 8,
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 30
        ), // 30 days ago
      },
      {
        name: 'Exercise',
        icon: '🏃‍♂️',
        goalType: 'binary',
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 25
        ), // 25 days ago
      },
      {
        name: 'Read',
        icon: '📚',
        goalType: 'count',
        targetCount: 30, // minutes
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 20
        ), // 20 days ago
      },
      {
        name: 'Meditate',
        icon: '🧘‍♀️',
        goalType: 'binary',
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 15
        ), // 15 days ago
      },
      {
        name: 'Take Vitamins',
        icon: '💊',
        goalType: 'binary',
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 12
        ), // 12 days ago
      },
      {
        name: 'Walk 10k Steps',
        icon: '👟',
        goalType: 'count',
        targetCount: 10000,
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 10
        ), // 10 days ago
      },
      {
        name: 'Practice Guitar',
        icon: '🎸',
        goalType: 'count',
        targetCount: 20, // minutes
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 8
        ), // 8 days ago
      },
      {
        name: 'Journal',
        icon: '📝',
        goalType: 'binary',
        createdAt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 5
        ), // 5 days ago
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

        // Use local date string instead of UTC to avoid timezone issues
        const year = habit.createdAt.getFullYear();
        const month = String(habit.createdAt.getMonth() + 1).padStart(2, '0');
        const day = String(habit.createdAt.getDate()).padStart(2, '0');
        const createdDateStr = `${year}-${month}-${day}`;

        console.log(
          `✅ Created habit: ${habit.name} (created: ${createdDateStr})`
        );
      }
    }

    // Filter out any undefined IDs
    const validHabitIds = habitIds.filter(
      (id): id is number => id !== undefined
    );

    // Generate completion data for the last 30 days
    const completionData = [
      // Water drinking - varies daily (created 30 days ago)
      {
        habitId: validHabitIds[0],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          8, 6, 8, 7, 8, 5, 8, 8, 7, 8, 6, 8, 8, 7, 8, 8, 6, 8, 7, 8, 8, 7, 8,
          6, 8, 8, 7, 8, 8, 6,
        ],
      },

      // Exercise - mostly consistent (created 25 days ago)
      {
        habitId: validHabitIds[1],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25,
        ],
      },

      // Reading - some missed days (created 20 days ago)
      {
        habitId: validHabitIds[2],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        ],
        counts: [
          30, 25, 30, 0, 30, 20, 30, 30, 25, 30, 0, 30, 30, 25, 30, 20, 30, 30,
          25, 30,
        ],
      },

      // Meditation - every other day (created 15 days ago)
      {
        habitId: validHabitIds[3],
        days: [1, 3, 5, 7, 9, 11, 13, 15],
      },

      // Vitamins - mostly consistent (created 12 days ago)
      {
        habitId: validHabitIds[4],
        days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },

      // Walking - varies daily (created 10 days ago)
      {
        habitId: validHabitIds[5],
        days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        counts: [
          8500, 12000, 7500, 11000, 9500, 8000, 13000, 9000, 10500, 11500,
        ],
      },

      // Guitar - some missed days (created 8 days ago)
      {
        habitId: validHabitIds[6],
        days: [1, 2, 3, 4, 5, 6, 7, 8],
        counts: [
          15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20,
          30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30,
        ],
      },

      // Journal - some missed days (created 5 days ago)
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

        // Use local date string instead of UTC to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

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
    // Use local date string instead of UTC to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

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
