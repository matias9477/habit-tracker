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
    // Column already exists, ignore error
    console.log('target_count column already exists or migration not needed');
  }

  // Add category column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general';
    `);
  } catch (error) {
    // Column already exists, ignore error
    console.log('category column already exists or migration not needed');
  }

  // Add custom_emoji column to existing tables if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE habits ADD COLUMN custom_emoji TEXT;
    `);
  } catch (error) {
    // Column already exists, ignore error
    console.log('custom_emoji column already exists or migration not needed');
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
    // Column already exists, ignore error
    console.log('count column already exists or migration not needed');
  }
};
