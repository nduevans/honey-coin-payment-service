import axios from "axios";

const BASE_URL = process.env.PROVIDER_BETA_URL || "http://localhost:4002";

export const PROVIDER_BETA = "PROVIDER_BETA";

export async function chargeBeta({ requestId, amount, phoneNumber, currency }) {
  try {
    const response = await axios.post(`${BASE_URL}/charge`, {
      requestId,
      amount,
      phoneNumber,
      currency,
    });
    // stub returns { providerRef, status: "pending" }
    return response.data;
  } catch (error) {
    throw new Error(`Provider Beta request failed: ${error.message}`);
  }
}

export async function getBetaChargeStatus(providerRef) {
  try {
    const response = await axios.get(`${BASE_URL}/status/${providerRef}`);
    console.log(`[Provider Beta] getBetaChargeStatus`, {
      response: response.data,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Provider Beta status check failed: ${error.message}`);
  }
}
