import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let databaseConnection = null;

export function initializeDatabase() {
  if (databaseConnection) {
    return databaseConnection;
  }

  const databasePath = process.env.DATABASE_PATH || "./data/charges.db";
  const databaseDirectory = path.dirname(databasePath);

  // Create data folder if it does not exist
  if (!fs.existsSync(databaseDirectory)) {
    fs.mkdirSync(databaseDirectory, { recursive: true });
  }

  databaseConnection = new Database(databasePath);

  // Run script to create the charges table
  databaseConnection.exec(`
		CREATE TABLE IF NOT EXISTS charges (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			request_id TEXT NOT NULL UNIQUE,
			provider TEXT NOT NULL,
			provider_ref TEXT,
			amount REAL NOT NULL,
			phone_number TEXT NOT NULL,
			currency TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);

  return databaseConnection;
}

export function getDatabase() {
  if (!databaseConnection) {
    throw new Error("Database has not been initialized yet");
  }

  return databaseConnection;
}
