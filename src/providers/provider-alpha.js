import axios from "axios";

const BASE_URL = process.env.PROVIDER_ALPHA_URL || "http://localhost:4001";

export const PROVIDER_ALPHA = "PROVIDER_ALPHA";

export async function chargeAlpha({
  requestId,
  amount,
  phoneNumber,
  currency,
}) {
  try {
    const response = await axios.post(`${BASE_URL}/charge`, {
      requestId,
      amount,
      phoneNumber,
      currency,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Provider Alpha request failed: ${error.message}`);
  }
}
