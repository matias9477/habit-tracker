import * as SQLite from 'expo-sqlite';

/**
 * Opens (or creates) the main SQLite database for the app.
 */
export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync('habits.db');
};

/**
 * Checks if a column exists in a table.
 */
const columnExists = async (
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> => {
  const result = await db.getAllAsync(`PRAGMA table_info(${table});`);
  return result.some((row: any) => row.name === column);
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

  // Add target_count column if it doesn't exist
  if (!(await columnExists(db, 'habits', 'target_count'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN target_count INTEGER DEFAULT 1;`
    );
  }

  // Add category column if it doesn't exist
  if (!(await columnExists(db, 'habits', 'category'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general';`
    );
  }

  // Add custom_emoji column if it doesn't exist
  if (!(await columnExists(db, 'habits', 'custom_emoji'))) {
    await db.execAsync(`ALTER TABLE habits ADD COLUMN custom_emoji TEXT;`);
  }

  // Add cached analytics fields for better performance
  if (!(await columnExists(db, 'habits', 'total_completions'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN total_completions INTEGER DEFAULT 0;`
    );
  }
  if (!(await columnExists(db, 'habits', 'current_streak'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN current_streak INTEGER DEFAULT 0;`
    );
  }
  if (!(await columnExists(db, 'habits', 'longest_streak'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN longest_streak INTEGER DEFAULT 0;`
    );
  }
  if (!(await columnExists(db, 'habits', 'last_completed_date'))) {
    await db.execAsync(
      `ALTER TABLE habits ADD COLUMN last_completed_date TEXT;`
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

  // Add count column to habit_completions if it doesn't exist
  if (!(await columnExists(db, 'habit_completions', 'count'))) {
    await db.execAsync(
      `ALTER TABLE habit_completions ADD COLUMN count INTEGER DEFAULT 1;`
    );
  }

  // Add performance indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date 
    ON habit_completions(habit_id, date);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habit_completions_date 
    ON habit_completions(date);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_category 
    ON habits(category);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_created_at 
    ON habits(created_at);
  `);
};
