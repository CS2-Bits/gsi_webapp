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

export async function getExchangeRate(
  fromCurrency: currency,
  toCurrency: currency
): Promise<CurrencyRateResult> {
  try {
    // Convert currency codes to lowercase as required by the API
    const from = fromCurrency.toLowerCase();
    const to = toCurrency.toLowerCase();

    // Use the exchange-api endpoint
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch currency rate: ${response.statusText}`);
    }

    const data: CurrencyRateResponse = await response.json();

    // Extract the rate for the target currency
    const rate = data[from]?.[to];

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
