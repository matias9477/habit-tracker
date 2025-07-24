import * as SQLite from 'expo-sqlite';

/**
 * Opens (or creates) the main SQLite database for the app.
 */
export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync('habits.db');
};

/**
 * Runs the schema migrations for the habits and completions tables.
 * Call this on app startup to ensure tables exist.
 */
export const runMigrations = async (): Promise<void> => {
  const db = await getDatabase();

  // Create habits table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      custom_emoji TEXT,
      goal_type TEXT DEFAULT 'binary',
      target_count INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // Add target_count column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN target_count INTEGER DEFAULT 1;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN target_count INTEGER DEFAULT 1',
      error
    );
  }

  // Add category column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general';
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      "Error in runMigrations: ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general'",
      error
    );
  }

  // Add custom_emoji column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN custom_emoji TEXT;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN custom_emoji TEXT',
      error
    );
  }

  // Add cached analytics fields for better performance
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN total_completions INTEGER DEFAULT 0;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN total_completions INTEGER DEFAULT 0',
      error
    );
  }

  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN current_streak INTEGER DEFAULT 0;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN current_streak INTEGER DEFAULT 0',
      error
    );
  }

  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN longest_streak INTEGER DEFAULT 0;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN longest_streak INTEGER DEFAULT 0',
      error
    );
  }

  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN last_completed_date TEXT;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habits ADD COLUMN last_completed_date TEXT',
      error
    );
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      UNIQUE(habit_id, date),
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  // Add count column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habit_completions ADD COLUMN count INTEGER DEFAULT 1;
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: ALTER TABLE habit_completions ADD COLUMN count INTEGER DEFAULT 1',
      error
    );
  }

  // Add performance indexes
  try {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date 
      ON habit_completions(habit_id, date);
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date',
      error
    );
  }

  try {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habit_completions_date 
      ON habit_completions(date);
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: CREATE INDEX IF NOT EXISTS idx_habit_completions_date',
      error
    );
  }

  try {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habits_category 
      ON habits(category);
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: CREATE INDEX IF NOT EXISTS idx_habits_category',
      error
    );
  }

  try {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habits_created_at 
      ON habits(created_at);
    `);
  } catch (error) {
    // Log error for debugging
    console.error(
      'Error in runMigrations: CREATE INDEX IF NOT EXISTS idx_habits_created_at',
      error
    );
  }
};
