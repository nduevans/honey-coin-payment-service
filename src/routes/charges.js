import { Router } from "express";
import {
  findAllCharges,
  findChargeByRequestId,
  insertCharge,
  updateChargeAfterDispatch,
} from "../db/charges.js";
import { dispatchCharge, VALID_PROVIDERS } from "../providers/index.js";
import { PROVIDER_BETA } from "../providers/provider-beta.js";
import { pollBetaChargeStatus } from "../workers/provider-beta-poller.js";

const router = Router();

function isValidChargeInput({ amount, phoneNumber, currency }) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return false;
  }

  if (amount < 0) {
    return false;
  }

  if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
    return false;
  }

  if (typeof currency !== "string" || currency.trim().length !== 3) {
    return false;
  }

  return true;
}

router.post("/", async (req, res) => {
  try {
    const { amount, phoneNumber, currency, provider } = req.body;
    const idempotencyKey = req.get("Idempotency-Key");
    console.log(`[Charge Route] Received request`, {
      idempotencyKey,
      amount,
      phoneNumber,
      currency,
      provider,
    });

    if (
      !idempotencyKey ||
      !provider ||
      !isValidChargeInput({ amount, phoneNumber, currency })
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ error: "Invalid provider" });
    }

    const requestId = idempotencyKey.trim();

    const existingCharge = findChargeByRequestId(requestId);
    if (existingCharge) {
      return res.status(200).json(existingCharge);
    }

    const charge = insertCharge({
      requestId,
      provider,
      amount,
      phoneNumber,
      currency,
    });

    const providerResult = await dispatchCharge(provider, {
      requestId,
      amount,
      phoneNumber,
      currency,
    });
    console.log(`[Charge Route] Provider result`, { providerResult });

    const updatedCharge = updateChargeAfterDispatch(requestId, {
      providerRef: providerResult.providerRef,
      status: providerResult.status || "pending",
    });

    // Beta has no webhook — kick off background polling after we've saved the providerRef
    if (provider === PROVIDER_BETA) {
      pollBetaChargeStatus(providerResult.providerRef).catch((err) => {
        console.error("[BetaPoller] Unhandled error in background poll", {
          error: err.message,
        });
      });
    }

    return res.status(201).json(updatedCharge);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Failed to create charge" });
  }
});

router.get("/", (req, res) => {
  return res.status(200).json(findAllCharges());
});

router.get("/:requestId", (req, res) => {
  const charge = findChargeByRequestId(req.params.requestId);
  if (!charge) return res.status(404).json({ error: "Charge not found" });
  return res.status(200).json(charge);
});

export default router;
