"use server";
import { currency } from "@prisma/client";

interface CurrencyRateResponse {
  [key: string]: {
    [key: string]: number;
  };
}

interface CurrencyRateResult {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
}

async function fetchCurrencyData(url: string): Promise<CurrencyRateResponse> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function attemptConcurrentFetch(
  primaryUrl: string,
  fallbackUrl: string
): Promise<CurrencyRateResponse> {
  const primaryPromise = fetchCurrencyData(primaryUrl);
  const fallbackPromise = fetchCurrencyData(fallbackUrl);

  // Return the first successful response
  return await Promise.race([primaryPromise, fallbackPromise]);
}

export async function getExchangeRate(
  fromCurrency: currency,
  toCurrency: currency
): Promise<CurrencyRateResult> {
  try {
    // Convert currency codes to lowercase as required by the API
    const from = fromCurrency.toLowerCase();
    const to = toCurrency.toLowerCase();

    // Primary URL using jsdelivr CDN
    const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;

    // Fallback URL using Cloudflare
    const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${from}.json`;

    let data: CurrencyRateResponse;
    let lastError: Error | null = null;

    // Retry up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        data = await attemptConcurrentFetch(primaryUrl, fallbackUrl);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        if (attempt === 3) {
          throw new Error(
            `All 3 attempts failed. Last error: ${lastError.message}`
          );
        }
        // Wait a bit before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }

    // Extract the rate for the target currency
    const rate = data![from]?.[to];

    if (rate === undefined) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
      );
    }

    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Error fetching currency rate: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
