import { PROVIDER_ALPHA, chargeAlpha } from "./provider-alpha.js";
import { PROVIDER_BETA, chargeBeta } from "./provider-beta.js";

export const VALID_PROVIDERS = [PROVIDER_ALPHA, PROVIDER_BETA];

const providerMap = {
  [PROVIDER_ALPHA]: chargeAlpha,
  [PROVIDER_BETA]: chargeBeta,
};

// Dispatch a charge request to the requested provider. Generic to ensure reuse by different providers
export async function dispatchCharge(provider, payload) {
  const selectedProviderChargeFunction = providerMap[provider];
  if (!selectedProviderChargeFunction) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return selectedProviderChargeFunction(payload);
}
