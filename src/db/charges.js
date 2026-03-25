import { getDatabase } from "./database.js";

/**
 * Insert a new charge row in `pending` status.
 * Caller must ensure request_id uniqueness check was done first.
 */
export function insertCharge({
  requestId,
  provider,
  amount,
  phoneNumber,
  currency,
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO charges (request_id, provider, amount, phone_number, currency, status)
    VALUES (@requestId, @provider, @amount, @phoneNumber, @currency, 'pending')
  `);
  stmt.run({ requestId, provider, amount, phoneNumber, currency });
  return findChargeByRequestId(requestId);
}

export function findAllCharges() {
  const db = getDatabase();
  return db.prepare(`SELECT * FROM charges ORDER BY created_at DESC`).all();
}

// Find charge by caller-supplied idempotency key which is also the requestID
export function findChargeByRequestId(requestId) {
  const db = getDatabase();
  return db
    .prepare(`SELECT * FROM charges WHERE request_id = ?`)
    .get(requestId);
}

export function findChargeByProviderRef(providerRef) {
  const db = getDatabase();
  return db
    .prepare(`SELECT * FROM charges WHERE provider_ref = ?`)
    .get(providerRef);
}

/**
 * Update status and optional provider_ref after dispatching to provider.
 */
export function updateChargeAfterDispatch(requestId, { providerRef, status }) {
  const db = getDatabase();
  db.prepare(
    `
    UPDATE charges
    SET provider_ref = @providerRef, status = @status, updated_at = datetime('now')
    WHERE request_id = @requestId
  `,
  ).run({ providerRef, status, requestId });
  return findChargeByRequestId(requestId);
}

export function updateChargeStatusByProviderRef(providerRef, status) {
  const db = getDatabase();
  // Guard: only update pending charges
  db.prepare(
    `
    UPDATE charges
    SET status = @status, updated_at = datetime('now')
    WHERE provider_ref = @providerRef
      AND status NOT IN ('successful', 'failed')
  `,
  ).run({ providerRef, status });

  return findChargeByProviderRef(providerRef);
}
