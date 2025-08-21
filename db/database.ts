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

  try {
    // Check if habits table exists and has the expected structure
    const habitsTableExists = await tableExists(db, 'habits');

    if (!habitsTableExists) {
      console.log('Creating habits table...');
      // Create habits table with improved constraints
      await db.execAsync(`
        CREATE TABLE habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
          icon TEXT NOT NULL CHECK (length(icon) > 0),
          category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'health', 'productivity', 'learning', 'fitness', 'social', 'financial')),
          custom_emoji TEXT CHECK (length(custom_emoji) <= 10),
          goal_type TEXT NOT NULL DEFAULT 'binary' CHECK (goal_type IN ('binary', 'count', 'time')),
          target_count INTEGER DEFAULT 1 CHECK (target_count > 0 AND target_count <= 1000),
          target_time_minutes INTEGER DEFAULT NULL CHECK (target_time_minutes IS NULL OR (target_time_minutes > 0 AND target_time_minutes <= 1440)),
          reminder_enabled BOOLEAN DEFAULT 0 CHECK (reminder_enabled IN (0, 1)),
          reminder_time TEXT CHECK (reminder_time IS NULL OR (reminder_time LIKE '__:__' AND CAST(substr(reminder_time, 1, 2) AS INTEGER) BETWEEN 0 AND 23 AND CAST(substr(reminder_time, 4, 2) AS INTEGER) BETWEEN 0 AND 59)),
          is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
        );
      `);
      console.log('Habits table created successfully');
    } else {
      console.log('Habits table exists, checking for missing columns...');
      // Table exists, check if we need to add missing columns
      const columnsToAdd = [
        {
          column: 'is_active',
          sql: 'ADD COLUMN is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1))',
        },
        {
          column: 'target_time_minutes',
          sql: 'ADD COLUMN target_time_minutes INTEGER DEFAULT NULL CHECK (target_time_minutes IS NULL OR (target_time_minutes > 0 AND target_time_minutes <= 1440))',
        },
        {
          column: 'reminder_enabled',
          sql: 'ADD COLUMN reminder_enabled BOOLEAN DEFAULT 0 CHECK (reminder_enabled IN (0, 1))',
        },
        {
          column: 'reminder_time',
          sql: 'ADD COLUMN reminder_time TEXT CHECK (reminder_time IS NULL OR (reminder_time LIKE "__:__" AND CAST(substr(reminder_time, 1, 2) AS INTEGER) BETWEEN 0 AND 23 AND CAST(substr(reminder_time, 4, 2) AS INTEGER) BETWEEN 0 AND 59))',
        },
        {
          column: 'updated_at',
          sql: 'ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime("now", "utc"))',
        },
      ];

      for (const { column, sql } of columnsToAdd) {
        if (!(await columnExists(db, 'habits', column))) {
          try {
            await db.execAsync(`ALTER TABLE habits ${sql};`);
            console.log(`Added column ${column} to habits table`);
          } catch (error) {
            console.log(
              `Column ${column} already exists or couldn't be added:`,
              error
            );
          }
        }
      }

      // Update existing records to have proper values for new columns
      try {
        await db.execAsync(`
          UPDATE habits 
          SET is_active = 1, updated_at = COALESCE(updated_at, created_at, datetime('now', 'utc'))
          WHERE is_active IS NULL OR updated_at IS NULL;
        `);
        console.log('Updated existing habits with default values');
      } catch (error) {
        console.log('Could not update existing habits:', error);
      }
    }

    // Check if habit_completions table exists
    const completionsTableExists = await tableExists(db, 'habit_completions');

    if (!completionsTableExists) {
      console.log('Creating habit_completions table...');
      // Create habit_completions table
      await db.execAsync(`
        CREATE TABLE habit_completions (
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
      console.log('Habit completions table created successfully');
    } else {
      console.log(
        'Habit completions table exists, checking for missing columns...'
      );
      // Table exists, check if we need to add missing columns
      const completionsColumnsToAdd = [
        {
          column: 'time_minutes',
          sql: 'ADD COLUMN time_minutes INTEGER DEFAULT NULL CHECK (time_minutes IS NULL OR (time_minutes >= 0 AND time_minutes <= 1440))',
        },
        {
          column: 'notes',
          sql: 'ADD COLUMN notes TEXT CHECK (length(notes) <= 500)',
        },
        {
          column: 'completed_at',
          sql: 'ADD COLUMN completed_at TEXT DEFAULT (datetime("now", "utc"))',
        },
      ];

      for (const { column, sql } of completionsColumnsToAdd) {
        if (!(await columnExists(db, 'habit_completions', column))) {
          try {
            await db.execAsync(`ALTER TABLE habit_completions ${sql};`);
            console.log(`Added column ${column} to habit_completions table`);
          } catch (error) {
            console.log(
              `Column ${column} already exists or couldn't be added:`,
              error
            );
          }
        }
      }

      // Update existing records to have proper values for new columns
      try {
        await db.execAsync(`
          UPDATE habit_completions 
          SET completed_at = COALESCE(completed_at, date, datetime('now', 'utc'))
          WHERE completed_at IS NULL;
        `);
        console.log('Updated existing completions with default values');
      } catch (error) {
        console.log('Could not update existing completions:', error);
      }
    }

    // Create performance indexes (ignore if they already exist)
    console.log('Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date ON habit_completions(habit_id, date);',
      'CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);',
      'CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);',
      'CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);',
    ];

    for (const indexSql of indexes) {
      try {
        await db.execAsync(indexSql);
      } catch (error) {
        console.log('Index creation failed (might already exist):', error);
      }
    }

    // Enable foreign key constraints
    try {
      await db.execAsync('PRAGMA foreign_keys = ON;');
      console.log('Foreign key constraints enabled');
    } catch (error) {
      console.log('Could not enable foreign keys:', error);
    }

    console.log('Version 1 migration completed successfully');
  } catch (error) {
    console.error('Version 1 migration failed:', error);
    throw error;
  }
};

/**
 * Migration from version 1 to 2: Add missing columns and constraints
 */
const migrateToVersion2 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Running migration to version 2...');

  // This migration is now mostly handled in version 1
  // Just ensure all columns exist and have proper constraints

  // Verify habits table structure
  const habitsColumns = ['target_time_minutes', 'is_active', 'updated_at'];
  for (const column of habitsColumns) {
    if (!(await columnExists(db, 'habits', column))) {
      console.log(`Warning: Column ${column} missing from habits table`);
    }
  }

  // Verify habit_completions table structure
  const completionsColumns = ['time_minutes', 'notes', 'completed_at'];
  for (const column of completionsColumns) {
    if (!(await columnExists(db, 'habit_completions', column))) {
      console.log(
        `Warning: Column ${column} missing from habit_completions table`
      );
    }
  }

  console.log('Version 2 migration completed (verification only)');
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
 * Checks if the database is in a consistent state.
 * Returns true if all required tables and columns exist.
 */
export const checkDatabaseIntegrity = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();

    // Check if required tables exist
    const requiredTables = ['habits', 'habit_completions', 'schema_version'];
    for (const table of requiredTables) {
      if (!(await tableExists(db, table))) {
        console.log(`Missing required table: ${table}`);
        return false;
      }
    }

    // Check if required columns exist in habits table
    const requiredHabitColumns = [
      'id',
      'name',
      'icon',
      'category',
      'custom_emoji',
      'goal_type',
      'target_count',
      'target_time_minutes',
      'is_active',
      'created_at',
      'updated_at',
    ];

    for (const column of requiredHabitColumns) {
      if (!(await columnExists(db, 'habits', column))) {
        console.log(`Missing required column in habits table: ${column}`);
        return false;
      }
    }

    // Check if required columns exist in habit_completions table
    const requiredCompletionColumns = [
      'id',
      'habit_id',
      'date',
      'count',
      'time_minutes',
      'notes',
      'completed_at',
    ];

    for (const column of requiredCompletionColumns) {
      if (!(await columnExists(db, 'habit_completions', column))) {
        console.log(
          `Missing required column in habit_completions table: ${column}`
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Database integrity check failed:', error);
    return false;
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

    // Check if database is in a consistent state before proceeding
    if (currentVersion > 0) {
      const isConsistent = await checkDatabaseIntegrity();
      if (!isConsistent) {
        console.log('Database integrity check failed, attempting to repair...');
        // Try to repair the database first
        const repairSuccess = await repairDatabase();
        if (repairSuccess) {
          console.log(
            'Database repair successful, continuing with migration...'
          );
          // Check integrity again after repair
          const isRepaired = await checkDatabaseIntegrity();
          if (!isRepaired) {
            console.log(
              'Database still inconsistent after repair, resetting...'
            );
            await resetDatabase();
            console.log(
              'Database reset due to integrity issues. Starting fresh...'
            );
            // Reset version to 0 to trigger full migration
            await setSchemaVersion(db, 0);
          }
        } else {
          console.log('Database repair failed, resetting...');
          await resetDatabase();
          console.log(
            'Database reset due to repair failure. Starting fresh...'
          );
          await setSchemaVersion(db, 0);
        }
      }
    }

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

    // Verify database integrity after migrations
    const isIntegrityValid = await checkDatabaseIntegrity();
    if (!isIntegrityValid) {
      throw new Error('Database integrity check failed after migrations');
    }

    console.log(
      `Database migration completed successfully. Current version: ${targetVersion}`
    );
  } catch (error) {
    console.error('Migration failed:', error);

    // If migration fails, try to repair first, then reset if needed
    console.log('Attempting to repair database due to migration failure...');
    try {
      const repairSuccess = await repairDatabase();
      if (repairSuccess) {
        console.log('Database repair successful. Please restart the app.');
        throw new Error(
          'Database has been repaired due to migration failure. Please restart the app.'
        );
      } else {
        console.log('Database repair failed, attempting reset...');
        await resetDatabase();
        console.log('Database reset successful. Please restart the app.');
        throw new Error(
          'Database has been reset due to migration failure. Please restart the app.'
        );
      }
    } catch (resetError) {
      console.error('Database repair and reset both failed:', resetError);
      throw new Error(
        'Database migration, repair, and reset all failed. Please reinstall the app.'
      );
    }
  }
};

/**
 * Gets detailed information about the current database state.
 * Useful for debugging migration issues.
 */
export const getDatabaseInfo = async (): Promise<{
  version: number;
  tables: string[];
  habitsColumns: string[];
  completionsColumns: string[];
}> => {
  try {
    const db = await getDatabase();

    // Get schema version
    const version = await getSchemaVersion(db);

    // Get all tables
    const tablesResult = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    );
    const tables = tablesResult.map((row: any) => row.name);

    // Get habits table columns
    let habitsColumns: string[] = [];
    if (tables.includes('habits')) {
      const habitsInfo = await db.getAllAsync('PRAGMA table_info(habits);');
      habitsColumns = habitsInfo.map((row: any) => row.name);
    }

    // Get habit_completions table columns
    let completionsColumns: string[] = [];
    if (tables.includes('habit_completions')) {
      const completionsInfo = await db.getAllAsync(
        'PRAGMA table_info(habit_completions);'
      );
      completionsColumns = completionsInfo.map((row: any) => row.name);
    }

    return {
      version,
      tables,
      habitsColumns,
      completionsColumns,
    };
  } catch (error) {
    console.error('Failed to get database info:', error);
    throw error;
  }
};

/**
 * Resets the database (for development/testing only).
 * WARNING: This will delete all data!
 */
export const resetDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  try {
    // Disable foreign keys temporarily
    await db.execAsync('PRAGMA foreign_keys = OFF;');

    // Drop tables in correct order
    await db.execAsync('DROP TABLE IF EXISTS habit_completions;');
    await db.execAsync('DROP TABLE IF EXISTS habits;');
    await db.execAsync('DROP TABLE IF EXISTS schema_version;');

    // Re-enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    console.log('Database reset complete');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
};

/**
 * Attempts to repair a corrupted database by recreating missing tables/columns.
 * This is a last resort before resetting the database.
 */
export const repairDatabase = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();
    console.log('Attempting database repair...');

    // Check what's missing and try to fix it
    const habitsTableExists = await tableExists(db, 'habits');
    const completionsTableExists = await tableExists(db, 'habit_completions');
    const schemaTableExists = await tableExists(db, 'schema_version');

    let repaired = false;

    // Try to recreate schema_version table if missing
    if (!schemaTableExists) {
      console.log('Recreating schema_version table...');
      await setSchemaVersion(db, 0);
      repaired = true;
    }

    // Try to recreate habits table if missing
    if (!habitsTableExists) {
      console.log('Recreating habits table...');
      await db.execAsync(`
        CREATE TABLE habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
          icon TEXT NOT NULL CHECK (length(icon) > 0),
          category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'health', 'productivity', 'learning', 'fitness', 'social', 'financial')),
          custom_emoji TEXT CHECK (length(custom_emoji) <= 10),
          goal_type TEXT NOT NULL DEFAULT 'binary' CHECK (goal_type IN ('binary', 'count', 'time')),
          target_count INTEGER DEFAULT 1 CHECK (target_count > 0 AND target_count <= 1000),
          target_time_minutes INTEGER DEFAULT NULL CHECK (target_time_minutes IS NULL OR (target_time_minutes > 0 AND target_time_minutes <= 1440)),
          reminder_enabled BOOLEAN DEFAULT 0 CHECK (reminder_enabled IN (0, 1)),
          reminder_time TEXT CHECK (reminder_time IS NULL OR (reminder_time LIKE "__:__" AND CAST(substr(reminder_time, 1, 2) AS INTEGER) BETWEEN 0 AND 23 AND CAST(substr(reminder_time, 4, 2) AS INTEGER) BETWEEN 0 AND 59)),
          is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
        );
      `);
      repaired = true;
    }

    // Try to recreate habit_completions table if missing
    if (!completionsTableExists) {
      console.log('Recreating habit_completions table...');
      await db.execAsync(`
        CREATE TABLE habit_completions (
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
      repaired = true;
    }

    // Try to add missing columns to existing tables
    if (habitsTableExists) {
      const missingColumns = ['is_active', 'target_time_minutes', 'updated_at'];
      for (const column of missingColumns) {
        if (!(await columnExists(db, 'habits', column))) {
          try {
            let sql = '';
            if (column === 'is_active') {
              sql =
                'ADD COLUMN is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1))';
            } else if (column === 'target_time_minutes') {
              sql =
                'ADD COLUMN target_time_minutes INTEGER DEFAULT NULL CHECK (target_time_minutes IS NULL OR (target_time_minutes > 0 AND target_time_minutes <= 1440))';
            } else if (column === 'updated_at') {
              sql =
                'ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime("now", "utc"))';
            }

            if (sql) {
              await db.execAsync(`ALTER TABLE habits ${sql};`);
              console.log(`Added missing column ${column} to habits table`);
              repaired = true;
            }
          } catch (error) {
            console.log(`Could not add column ${column}:`, error);
          }
        }
      }
    }

    if (completionsTableExists) {
      const missingColumns = ['time_minutes', 'notes', 'completed_at'];
      for (const column of missingColumns) {
        if (!(await columnExists(db, 'habit_completions', column))) {
          try {
            let sql = '';
            if (column === 'time_minutes') {
              sql =
                'ADD COLUMN time_minutes INTEGER DEFAULT NULL CHECK (time_minutes IS NULL OR (time_minutes >= 0 AND time_minutes <= 1440))';
            } else if (column === 'notes') {
              sql = 'ADD COLUMN notes TEXT CHECK (length(notes) <= 500)';
            } else if (column === 'completed_at') {
              sql =
                'ADD COLUMN completed_at TEXT DEFAULT (datetime("now", "utc"))';
            }

            if (sql) {
              await db.execAsync(`ALTER TABLE habit_completions ${sql};`);
              console.log(
                `Added missing column ${column} to habit_completions table`
              );
              repaired = true;
            }
          } catch (error) {
            console.log(`Could not add column ${column}:`, error);
          }
        }
      }
    }

    if (repaired) {
      console.log('Database repair completed');
      // Set version to current to prevent re-migration
      await setSchemaVersion(db, 3);
      return true;
    } else {
      console.log('No repairs were needed');
      return true;
    }
  } catch (error) {
    console.error('Database repair failed:', error);
    return false;
  }
};

/**
 * Reinitializes the database by running all migrations.
 * Use this when you need to force database schema updates.
 */
export const reinitializeDatabase = async (): Promise<void> => {
  console.log('Reinitializing database...');
  const db = await getDatabase();

  try {
    // Drop the schema version table to force re-migration
    await db.execAsync('DROP TABLE IF EXISTS schema_version;');
    console.log('Dropped schema version table');

    // Run the migrations which will recreate everything
    await runMigrations();
    console.log('Database reinitialized successfully');
  } catch (error) {
    console.error('Failed to reinitialize database:', error);
    throw error;
  }
};
