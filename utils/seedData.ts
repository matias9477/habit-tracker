import { insertHabit } from '../db/habits';
import { markHabitCompleted, incrementHabitCount } from '../db/completions';

/**
 * Seeds the database with fake habit data and completion history.
 * This simulates a user who has been using the app for a while.
 */
export const seedFakeData = async () => {
  try {
    console.log('🌱 Seeding database with fake data...');

    // Create some realistic habits
    const habits = [
      {
        name: 'Drink Water',
        icon: '💧',
        goalType: 'count',
        targetCount: 8,
      },
      {
        name: 'Exercise',
        icon: '🏃‍♂️',
        goalType: 'binary',
      },
      {
        name: 'Read',
        icon: '📚',
        goalType: 'count',
        targetCount: 30, // minutes
      },
      {
        name: 'Meditate',
        icon: '🧘‍♀️',
        goalType: 'binary',
      },
      {
        name: 'Take Vitamins',
        icon: '💊',
        goalType: 'binary',
      },
      {
        name: 'Walk 10k Steps',
        icon: '👟',
        goalType: 'count',
        targetCount: 10000,
      },
      {
        name: 'Practice Guitar',
        icon: '🎸',
        goalType: 'count',
        targetCount: 20, // minutes
      },
      {
        name: 'Journal',
        icon: '📝',
        goalType: 'binary',
      },
    ];

    // Insert habits and get their IDs
    const habitIds: number[] = [];
    for (const habit of habits) {
      const id = await insertHabit(
        habit.name,
        habit.icon,
        habit.goalType,
        habit.targetCount
      );
      if (id) {
        habitIds.push(id);
        console.log(`✅ Created habit: ${habit.name}`);
      }
    }

    // Generate completion data for the last 30 days
    const today = new Date();
    const completionData = [
      // Water drinking - varies daily
      {
        habitId: habitIds[0],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          6, 8, 7, 5, 8, 9, 8, 7, 6, 8, 9, 8, 7, 8, 9, 8, 7, 6, 8, 9, 8, 7, 8,
          9, 8, 7, 6, 8, 9, 8,
        ],
      },

      // Exercise - mostly consistent
      {
        habitId: habitIds[1],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Reading - some missed days
      {
        habitId: habitIds[2],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          25, 30, 35, 20, 30, 40, 30, 25, 30, 35, 30, 20, 30, 40, 30, 25, 30,
          35, 30, 20, 30, 40, 30, 25, 30, 35, 30, 20, 30, 40,
        ],
      },

      // Meditation - good streak
      {
        habitId: habitIds[3],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Vitamins - perfect streak
      {
        habitId: habitIds[4],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },

      // Walking - some missed days
      {
        habitId: habitIds[5],
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

      // Guitar - inconsistent
      {
        habitId: habitIds[6],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
        counts: [
          15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20,
          30, 15, 20, 25, 10, 20, 30, 15, 20, 25, 10, 20, 30,
        ],
      },

      // Journal - some missed days
      {
        habitId: habitIds[7],
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        ],
      },
    ];

    // Add completion data for each habit
    for (const data of completionData) {
      for (let i = 0; i < data.days.length; i++) {
        const daysAgo = data.days[i];
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const dateStr = date.toISOString().slice(0, 10);

        if (data.counts && data.counts[i]) {
          // For count-based habits, add the specific count
          for (let count = 0; count < data.counts[i]; count++) {
            await incrementHabitCount(data.habitId, dateStr);
          }
        } else {
          // For binary habits, just mark as completed
          await markHabitCompleted(data.habitId, dateStr);
        }
      }
      console.log(`✅ Added completion data for habit ${data.habitId}`);
    }

    // Add some partial progress for today
    const todayStr = today.toISOString().slice(0, 10);

    // Water: 5/8 glasses today
    for (let i = 0; i < 5; i++) {
      await incrementHabitCount(habitIds[0], todayStr);
    }

    // Reading: 15/30 minutes today
    for (let i = 0; i < 15; i++) {
      await incrementHabitCount(habitIds[2], todayStr);
    }

    // Walking: 6500/10000 steps today
    for (let i = 0; i < 6500; i++) {
      await incrementHabitCount(habitIds[5], todayStr);
    }

    // Guitar: 10/20 minutes today
    for (let i = 0; i < 10; i++) {
      await incrementHabitCount(habitIds[6], todayStr);
    }

    console.log('🎉 Fake data seeding completed!');
    console.log('📊 You now have:');
    console.log('   • 8 habits with 30 days of history');
    console.log(
      '   • Various completion patterns (perfect streaks, missed days, etc.)'
    );
    console.log('   • Partial progress for today on count-based habits');
    console.log('   • Realistic data to test all app features');
  } catch (error) {
    console.error('❌ Error seeding fake data:', error);
  }
};

/**
 * Clears all data from the database (for testing).
 */
export const clearAllData = async () => {
  try {
    const db = await import('../db/database').then((m) => m.getDatabase());

    console.log('🗑️ Clearing all data...');

    // Delete all completions
    await db.runAsync('DELETE FROM habit_completions');

    // Delete all habits
    await db.runAsync('DELETE FROM habits');

    console.log('✅ All data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};
