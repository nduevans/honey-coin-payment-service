// Idempotency test — confirms that submitting the same requestId twice does NOT result in two charges

import { test } from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";

// in-memory DB so the test is self-contained - same schema

function createTestDb() {
  const db = new Database(":memory:");
  db.exec(`
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
    )
  `);
  return db;
}

// ── Inline DB helpers scoped to test db ─────────────────────────────────────

function insertCharge(
  db,
  { requestId, provider, amount, phoneNumber, currency },
) {
  db.prepare(
    `
    INSERT INTO charges (request_id, provider, amount, phone_number, currency, status)
    VALUES (@requestId, @provider, @amount, @phoneNumber, @currency, 'pending')
  `,
  ).run({ requestId, provider, amount, phoneNumber, currency });
  return db
    .prepare(`SELECT * FROM charges WHERE request_id = ?`)
    .get(requestId);
}

function findChargeByRequestId(db, requestId) {
  return db
    .prepare(`SELECT * FROM charges WHERE request_id = ?`)
    .get(requestId);
}

// --Tests --

test("same requestId twice — only one charge row is created", () => {
  const db = createTestDb();

  const payload = {
    requestId: "test-idempotency-key-001",
    provider: "PROVIDER_ALPHA",
    amount: 100,
    phoneNumber: "+254700000000",
    currency: "KES",
  };

  // First submission — should insert
  const first = insertCharge(db, payload);
  assert.ok(first, "First insert should return a charge");
  assert.equal(first.request_id, payload.requestId);
  assert.equal(first.status, "pending");

  // Second submission — same requestId — should NOT insert a second row
  // This mirrors what the route does: check first, only insert if not found
  const existing = findChargeByRequestId(db, payload.requestId);
  assert.ok(existing, "Existing charge should be found on second submission");

  // Attempt a raw duplicate insert to confirm the UNIQUE constraint blocks it
  assert.throws(
    () => insertCharge(db, payload),
    /UNIQUE constraint failed/,
    "DB must reject a duplicate requestId at the constraint level",
  );

  // Only one row in the table
  const allCharges = db.prepare(`SELECT * FROM charges`).all();
  assert.equal(allCharges.length, 1, "Only one charge row should exist");
});

test("different requestIds — two separate charges are created", () => {
  const db = createTestDb();

  insertCharge(db, {
    requestId: "key-A",
    provider: "PROVIDER_ALPHA",
    amount: 100,
    phoneNumber: "+254700000000",
    currency: "KES",
  });

  insertCharge(db, {
    requestId: "key-B",
    provider: "PROVIDER_BETA",
    amount: 200,
    phoneNumber: "+254711111111",
    currency: "KES",
  });

  const allCharges = db.prepare(`SELECT * FROM charges`).all();
  assert.equal(
    allCharges.length,
    2,
    "Two different requestIds should create two rows",
  );
});
