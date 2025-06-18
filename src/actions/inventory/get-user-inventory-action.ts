"use server";
import { ActionResponse } from "@/types/action-response";
import {
  steam_items,
  steam_items_schema,
  user_inventory_items,
  user_inventory_items_schema,
} from "@prisma-zod/generated/zod.schema";
import { getCurrentUser } from "../user/get-current-user";
import { prisma } from "@/lib/prisma";
import { currency } from "@prisma/client";
import { getExchangeRate } from "../currency/get-exchange-rate";
import { getCs2BitsUsdRate } from "../currency/get-cs2bits-usd-rate";

export async function getUserInventoryAction(): Promise<
  ActionResponse<{
    item_data: {
      inventoty_item: user_inventory_items;
      steam_item: steam_items;
    }[];
    total_cs2bits_value: number;
  }>
> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error_message: "error.not_authenticated",
      };
    }

    const inventory_items = await prisma.user_inventory_items.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        steam_items: true,
      },
    });

    const cs2bits_usd_rate = await getCs2BitsUsdRate();

    const available_items = inventory_items.filter(
      (item) => !item.in_trade && new Date(item.expires_in) > new Date()
    );
    const brl_to_usd_rate = await getExchangeRate(currency.BRL, currency.USD);
    const available_value = available_items.reduce((sum, item) => {
      switch (item.steam_items.currency) {
        case currency.USD:
        case currency.USDC:
          return sum + item.steam_items.estimated_fiat_value.toNumber();
        case currency.BRL:
          const brl_value = item.steam_items.estimated_fiat_value.mul(
            brl_to_usd_rate.rate
          );
          return sum + brl_value.mul(brl_value).toNumber();
      }
    }, 0);

    const mappedItems = available_items.map((item) => ({
      inventoty_item: user_inventory_items_schema.parse(item),
      steam_item: steam_items_schema.parse(item.steam_items),
    }));

    return {
      success: true,
      data: {
        item_data: mappedItems,
        total_cs2bits_value: available_value * cs2bits_usd_rate.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error fetching user inventory:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
