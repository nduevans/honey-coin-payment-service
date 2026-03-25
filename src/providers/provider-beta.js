import axios from "axios";

const BASE_URL = process.env.PROVIDER_BETA_URL || "http://localhost:4002";

export const PROVIDER_BETA = "PROVIDER_BETA";

export async function chargeBeta({ requestId, amount, phoneNumber, currency }) {
  const response = await axios.post(`${BASE_URL}/charge`, {
    requestId,
    amount,
    phoneNumber,
    currency,
  });
  // stub returns { providerRef, status }
  return response.data;
}
