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
 * Checks if a table exists.
 */
const tableExists = async (
  db: SQLite.SQLiteDatabase,
  table: string
): Promise<boolean> => {
  const result = await db.getAllAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`
  );
  return result.length > 0;
};

/**
 * Gets the current database schema version.
 */
const getSchemaVersion = async (db: SQLite.SQLiteDatabase): Promise<number> => {
  try {
    const result = (await db.getFirstAsync(
      'SELECT version FROM schema_version LIMIT 1;'
    )) as { version: number } | null;
    return result?.version || 0;
  } catch {
    return 0;
  }
};

/**
 * Sets the database schema version.
 */
const setSchemaVersion = async (
  db: SQLite.SQLiteDatabase,
  version: number
): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
    );
  `);

  await db.execAsync(`
    INSERT OR REPLACE INTO schema_version (id, version, updated_at) 
    VALUES (1, ${version}, datetime('now', 'utc'));
  `);
};

/**
 * Migration from version 0 to 1: Initial schema
 */
const migrateToVersion1 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Running migration to version 1...');

  // Create habits table with improved constraints
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
      icon TEXT NOT NULL CHECK (length(icon) > 0),
      category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'health', 'productivity', 'learning', 'fitness', 'social', 'financial')),
      custom_emoji TEXT CHECK (length(custom_emoji) <= 10),
      goal_type TEXT NOT NULL DEFAULT 'binary' CHECK (goal_type IN ('binary', 'count', 'time')),
      target_count INTEGER DEFAULT 1 CHECK (target_count > 0 AND target_count <= 1000),
      target_time_minutes INTEGER DEFAULT NULL CHECK (target_time_minutes IS NULL OR (target_time_minutes > 0 AND target_time_minutes <= 1440)),
      is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
    );
  `);

  // Create habit_completions table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL CHECK (date(date) IS NOT NULL),
      count INTEGER DEFAULT 1 CHECK (count > 0 AND count <= 1000),
      time_minutes INTEGER DEFAULT NULL CHECK (time_minutes IS NULL OR (time_minutes >= 0 AND time_minutes <= 1440)),
      notes TEXT CHECK (length(notes) <= 500),
      completed_at TEXT DEFAULT (datetime('now', 'utc')),
      UNIQUE(habit_id, date),
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  // Create performance indexes
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
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_is_active 
    ON habits(is_active);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at 
    ON habit_completions(completed_at);
  `);

  // Enable foreign key constraints
  await db.execAsync('PRAGMA foreign_keys = ON;');
};

/**
 * Migration from version 1 to 2: Add missing columns and constraints
 */
const migrateToVersion2 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Running migration to version 2...');

  // Add missing columns to habits table
  const habitsColumns = [
    {
      column: 'target_time_minutes',
      sql: 'ADD COLUMN target_time_minutes INTEGER DEFAULT NULL',
    },
    { column: 'is_active', sql: 'ADD COLUMN is_active BOOLEAN DEFAULT 1' },
    {
      column: 'updated_at',
      sql: 'ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime("now", "utc"))',
    },
  ];

  for (const { column, sql } of habitsColumns) {
    if (!(await columnExists(db, 'habits', column))) {
      await db.execAsync(`ALTER TABLE habits ${sql};`);
    }
  }

  // Add missing columns to habit_completions table
  const completionsColumns = [
    {
      column: 'time_minutes',
      sql: 'ADD COLUMN time_minutes INTEGER DEFAULT NULL',
    },
    { column: 'notes', sql: 'ADD COLUMN notes TEXT' },
    {
      column: 'completed_at',
      sql: 'ADD COLUMN completed_at TEXT DEFAULT (datetime("now", "utc"))',
    },
  ];

  for (const { column, sql } of completionsColumns) {
    if (!(await columnExists(db, 'habit_completions', column))) {
      await db.execAsync(`ALTER TABLE habit_completions ${sql};`);
    }
  }

  // Update existing records to have proper updated_at values
  await db.execAsync(`
    UPDATE habits 
    SET updated_at = COALESCE(updated_at, created_at, datetime('now', 'utc'))
    WHERE updated_at IS NULL;
  `);

  // Update existing completions to have proper completed_at values
  await db.execAsync(`
    UPDATE habit_completions 
    SET completed_at = COALESCE(completed_at, date, datetime('now', 'utc'))
    WHERE completed_at IS NULL;
  `);
};

/**
 * Migration from version 2 to 3: Remove deprecated cached fields
 */
const migrateToVersion3 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Running migration to version 3...');

  // Remove deprecated cached fields if they exist
  const deprecatedColumns = [
    'total_completions',
    'current_streak',
    'longest_streak',
    'last_completed_date',
  ];

  for (const column of deprecatedColumns) {
    if (await columnExists(db, 'habits', column)) {
      await db.execAsync(`ALTER TABLE habits DROP COLUMN ${column};`);
    }
  }
};

/**
 * Runs all schema migrations in order.
 * Call this on app startup to ensure database is up to date.
 */
export const runMigrations = async (): Promise<void> => {
  const db = await getDatabase();

  try {
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Get current version
    const currentVersion = await getSchemaVersion(db);
    const targetVersion = 3; // Current schema version

    console.log(
      `Current database version: ${currentVersion}, target: ${targetVersion}`
    );

    if (currentVersion < 1) {
      await migrateToVersion1(db);
      await setSchemaVersion(db, 1);
    }

    if (currentVersion < 2) {
      await migrateToVersion2(db);
      await setSchemaVersion(db, 2);
    }

    if (currentVersion < 3) {
      await migrateToVersion3(db);
      await setSchemaVersion(db, 3);
    }

    console.log(
      `Database migration completed. Current version: ${targetVersion}`
    );
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Resets the database (for development/testing only).
 * WARNING: This will delete all data!
 */
export const resetDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  await db.execAsync('DROP TABLE IF EXISTS habit_completions;');
  await db.execAsync('DROP TABLE IF EXISTS habits;');
  await db.execAsync('DROP TABLE IF EXISTS schema_version;');

  console.log('Database reset complete');
};
