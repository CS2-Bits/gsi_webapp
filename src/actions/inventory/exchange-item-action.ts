"use server";

import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getCs2BitsUsdRate } from "../currency/get-cs2bits-usd-rate";
import { getExchangeRate } from "../currency/get-exchange-rate";
import { currency } from "@prisma/client";
import { ActionError } from "@/types/action-error";

export async function exchangeItemsAction(steam_items: string[]): Promise<
  ActionResponse<{
    amount: number;
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
    const now_date = new Date();
    const user_inventory_item_list = await prisma.user_inventory_items.findMany(
      {
        where: {
          user_id: user.id,
          steam_item_id: {
            in: steam_items,
          },
          in_trade: false,
          expires_in: {
            gt: now_date,
          },
        },
        include: {
          steam_items: true,
        },
      }
    );

    if (user_inventory_item_list.length !== steam_items.length) {
      return {
        success: false,
        error_message: "error.item_not_found_or_invalid",
      };
    }
    const brl_to_usd_rate = (await getExchangeRate(currency.BRL, currency.USD))
      .rate;
    let fiat_value = new Decimal(0);
    for (const item of user_inventory_item_list) {
      if (item.steam_items.currency === currency.BRL) {
        fiat_value = fiat_value.plus(
          item.steam_items.estimated_fiat_value.mul(brl_to_usd_rate)
        );
      } else if (
        item.steam_items.currency === currency.USD ||
        item.steam_items.currency === currency.USDC
      ) {
        fiat_value = fiat_value.plus(item.steam_items.estimated_fiat_value);
      } else {
        throw new ActionError("error.unsupported_currency");
      }
    }
    const cs2bits_usd_rate = await getCs2BitsUsdRate();
    const cs2bits_received = fiat_value.mul(cs2bits_usd_rate);

    if (user_inventory_item_list.length === 0) {
      return {
        success: false,
        error_message: "error.item_not_found_or_invalid",
      };
    }

    await prisma.$transaction(async (tx) => {
      const del_res = await tx.user_inventory_items.deleteMany({
        where: {
          user_id: user.id,
          steam_item_id: {
            in: user_inventory_item_list.map((i) => i.steam_item_id),
          },
          in_trade: false,
          expires_in: {
            gt: now_date,
          },
        },
      });
      if (del_res.count !== user_inventory_item_list.length) {
        throw new Error("Failed to delete all specified items.");
      }
      const update_res = await tx.steam_bot_inventory_items.updateMany({
        where: {
          steam_item_id: {
            in: user_inventory_item_list.map((i) => i.steam_item_id),
          },
          available: false,
        },
        data: {
          available: true,
        },
      });
      if (update_res.count !== user_inventory_item_list.length) {
        throw new Error("Failed to save all specified items.");
      }
      const transaction = await tx.user_transactions.create({
        data: {
          user_id: user.id,
          amount: cs2bits_received,
          description: `Deposit items for CS2Bits`,
          type: "DepositSteamItem",
        },
      });
      // Create user balance transaction relationship
      await tx.user_balance_transactions.create({
        data: {
          user_transaction_id: transaction.id,
          user_balance_id: user.id,
        },
      });
      await tx.user_balances.update({
        where: {
          user_id: user.id,
        },
        data: {
          balance: {
            increment: cs2bits_received,
          },
        },
      });
    });

    return {
      success: true,
      data: {
        amount: cs2bits_received.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error exchanging item:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
