"use server";
import { ActionResponse } from "@/types/action-response";
import {
  steam_items as steam_items_zod,
  steam_items_schema,
  trade_offers,
  user_inventory_items,
  user_inventory_items_schema,
} from "@prisma-zod/generated/zod.schema";
import { getCurrentUser } from "../user/get-current-user";
import { prisma } from "@/lib/prisma";
import { currency, steam_items } from "@prisma/client";
import { getExchangeRate } from "../currency/get-exchange-rate";
import { getCs2BitsUsdRate } from "../currency/get-cs2bits-usd-rate";
import Decimal from "decimal.js";

export async function getUserInventoryAction(): Promise<
  ActionResponse<{
    item_data: {
      inventoty_item: {
        item: user_inventory_items;
        trade_offer: trade_offers | null;
      };
      cs2bits_value: number;
      steam_item: steam_items_zod;
    }[];
    total_cs2bits_value: number;
  }>
> {
  try {
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

    const getCs2BitsValue = (item: steam_items) => {
      switch (item.currency) {
        case currency.USD:
        case currency.USDC:
          return item.estimated_fiat_value.mul(cs2bits_usd_rate);
        case currency.BRL:
          const brl_value = item.estimated_fiat_value.mul(brl_to_usd_rate.rate);
          return brl_value.mul(cs2bits_usd_rate);
        default:
          return new Decimal(0);
      }
    };
    const available_value = available_items.reduce((sum, item) => {
      return sum + getCs2BitsValue(item.steam_items).toNumber();
    }, 0);

    const getItemTradeOffer = async (item: user_inventory_items) => {
      const trade_offer_item = await prisma.trade_offer_items.findFirst({
        where: {
          steam_item_id: item.steam_item_id,
        },
        include: {
          trade_offers: true,
        },
        orderBy: {
          trade_offers: {
            created_at: "asc",
          },
        },
      });
      if (!trade_offer_item) return null;
      return trade_offer_item.trade_offers;
    };

    const mappedItemsAsync = inventory_items.map(async (item) => ({
      inventoty_item: {
        item: user_inventory_items_schema.parse(item),
        trade_offer: item.in_trade ? await getItemTradeOffer(item) : null,
      },
      cs2bits_value: getCs2BitsValue(item.steam_items).toNumber(),
      steam_item: steam_items_schema.parse(item.steam_items),
    }));

    const mappedItems = await Promise.all(mappedItemsAsync);

    return {
      success: true,
      data: {
        item_data: mappedItems,
        total_cs2bits_value: available_value,
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
