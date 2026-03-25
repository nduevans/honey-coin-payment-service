import { getBetaChargeStatus } from "../providers/provider-beta.js";
import { updateChargeStatusByProviderRef } from "../db/charges.js";

const BACKOFF_DELAYS = [1000, 1000, 2000, 3000, 5000, 8000, 13000]; // Fibonacci - :) -- About max 30 secs combined

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollBetaChargeStatus(providerRef) {
  console.log(`[BetaPoller] Starting polling for providerRef: ${providerRef}`);

  for (let attempt = 0; attempt < BACKOFF_DELAYS.length; attempt++) {
    const delay = BACKOFF_DELAYS[attempt];
    console.log(
      `[BetaPoller] Attempt ${attempt + 1}/${BACKOFF_DELAYS.length} — waiting ${delay}ms before polling`,
    );

    await sleep(delay);

    try {
      const result = await getBetaChargeStatus(providerRef);
      console.log(`[BetaPoller] Got status: ${result.status}`, { providerRef });

      if (result.status === "successful" || result.status === "failed") {
        updateChargeStatusByProviderRef(providerRef, result.status);
        console.log(`[BetaPoller] Final status saved: ${result.status}`, {
          providerRef,
        });
        return;
      }

      // Still pending — continue to next attempt
    } catch (error) {
      console.error(`[BetaPoller] Poll attempt ${attempt + 1} failed`, {
        providerRef,
        error: error.message,
      });
      // Continue  regardless of error  -tilll we exhaust attempts
    }
  }

  console.warn(
    `[BetaPoller] Timed out after ${BACKOFF_DELAYS.length} attempts. Charge stays pending.`,
    { providerRef },
  );
}
