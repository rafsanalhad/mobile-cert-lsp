import openDatabaseAsync from './sqlitePromise.native';

let db = null;

export const getDB = async () => {
  if (!db) {
    db = await openDatabaseAsync('agenda_nusantara.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDB();
  
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('penting', 'biasa')),
      is_done INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  // Insert default user if not exists
  const existingUser = await database.getFirstAsync(
    'SELECT id FROM users WHERE username = ?',
    ['user']
  );
  if (!existingUser) {
    await database.runAsync(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      ['user', 'user']
    );
  }

  return database;
};

// ── AUTH ───────────────────────────────────────────────────────────────────

export const loginUser = async (username, password) => {
  const database = await getDB();
  const user = await database.getFirstAsync(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password]
  );
  return user;
};

export const changePassword = async (username, currentPassword, newPassword) => {
  const database = await getDB();
  const user = await database.getFirstAsync(
    'SELECT id FROM users WHERE username = ? AND password = ?',
    [username, currentPassword]
  );
  if (!user) return false;
  await database.runAsync(
    'UPDATE users SET password = ? WHERE username = ?',
    [newPassword, username]
  );
  return true;
};

// ── TASKS ──────────────────────────────────────────────────────────────────

export const addTask = async (title, description, dueDate, category) => {
  const database = await getDB();
  const result = await database.runAsync(
    'INSERT INTO tasks (title, description, due_date, category) VALUES (?, ?, ?, ?)',
    [title, description || '', dueDate, category]
  );
  return result.lastInsertRowId;
};

export const getAllTasks = async () => {
  const database = await getDB();
  return await database.getAllAsync(
    'SELECT * FROM tasks ORDER BY due_date ASC, id DESC'
  );
};

export const toggleTaskDone = async (id, currentDone) => {
  const database = await getDB();
  const newDone = currentDone ? 0 : 1;
  const completedAt = newDone ? new Date().toISOString() : null;
  await database.runAsync(
    'UPDATE tasks SET is_done = ?, completed_at = ? WHERE id = ?',
    [newDone, completedAt, id]
  );
};

export const getTaskStats = async () => {
  const database = await getDB();
  const stats = await database.getFirstAsync(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_done = 1 THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN is_done = 0 THEN 1 ELSE 0 END) as not_done,
      SUM(CASE WHEN category = 'penting' AND is_done = 1 THEN 1 ELSE 0 END) as penting_done,
      SUM(CASE WHEN category = 'penting' AND is_done = 0 THEN 1 ELSE 0 END) as penting_not_done,
      SUM(CASE WHEN category = 'biasa' AND is_done = 1 THEN 1 ELSE 0 END) as biasa_done,
      SUM(CASE WHEN category = 'biasa' AND is_done = 0 THEN 1 ELSE 0 END) as biasa_not_done
    FROM tasks
  `);
  return stats;
};

export const getCompletedPerDay = async () => {
  const database = await getDB();
  const rows = await database.getAllAsync(`
    SELECT DATE(completed_at) as date, COUNT(*) as count
    FROM tasks
    WHERE is_done = 1 AND completed_at IS NOT NULL
    GROUP BY DATE(completed_at)
    ORDER BY date ASC
    LIMIT 7
  `);
  return rows;
};
