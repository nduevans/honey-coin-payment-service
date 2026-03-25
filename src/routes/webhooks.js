import { Router } from "express";
import {
  findChargeByProviderRef,
  updateChargeStatusByProviderRef,
} from "../db/charges.js";

const router = Router();

// called by provider - alpha - set in alpha provide ENV
router.post("/provider-alpha", (req, res) => {
  const { providerRef, status } = req.body;

  console.log("[webhooks] Received webhook from provider-alpha", {
    providerRef,
    status,
  });

  if (!providerRef || !status) {
    return res
      .status(400)
      .json({ error: "providerRef and status are required" });
  }

  const charge = findChargeByProviderRef(providerRef);
  if (!charge) {
    return res.status(404).json({ error: "Charge not found" });
  }

  const updatedCharge = updateChargeStatusByProviderRef(providerRef, status);

  return res.status(200).json(updatedCharge);
});

export default router;
