import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('collect11.db');

export function initLocalDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS shirts (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      club TEXT,
      league TEXT,
      season TEXT,
      brand TEXT,
      size TEXT,
      condition TEXT,
      player_name TEXT,
      player_number INTEGER,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS shirt_photos (
      id TEXT PRIMARY KEY,
      shirt_id TEXT,
      owner_id TEXT,
      local_uri TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id TEXT,
      shirt_id TEXT,
      owner_id TEXT,
      created_at TEXT,
      PRIMARY KEY(collection_id, shirt_id)
    );
  `);
}

export { db };
