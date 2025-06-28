"use server";

import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import { trade_action, trade_offer_status } from "@prisma/client";
import tradeItem from "../stream/trade-item";
import { validateTradeLinkAction } from "../user/validate-user-trade-link-action";

export async function withdrawItemAction(
  steam_bot_inventory_item_id: string
): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error_message: "error.not_authenticated",
      };
    }

    if (!user.trade_link || !(await validateTradeLinkAction(user.trade_link))) {
      return {
        success: false,
        error_message: "error.no_trade_link",
      };
    }

    const user_inventory_item =
      await prisma.user_inventory_items.findUniqueOrThrow({
        where: {
          steam_bot_inventory_item_id: steam_bot_inventory_item_id,
          user_id: user.id,
          in_trade: false,
          expires_in: {
            gt: new Date(),
          },
        },
        include: {
          steam_bot_inventory_items: {
            include: {
              steam_items: true,
            },
          },
        },
      });

    const expires_in = new Date(Date.now() + 10 * 60 * 1000);

    const trade_bot = await prisma.$transaction(async (tx) => {
      await tx.user_inventory_items.update({
        where: {
          steam_bot_inventory_item_id:
            user_inventory_item.steam_bot_inventory_item_id,
          user_id: user.id,
        },
        data: {
          in_trade: true,
        },
      });
      const steam_bot_inventory_item =
        await tx.steam_bot_inventory_items.findFirstOrThrow({
          where: {
            steam_item_id:
              user_inventory_item.steam_bot_inventory_items.steam_item_id,
            tradable: true,
          },
          select: {
            steam_bot_id: true,
          },
        });
      const trade_offer = await tx.trade_offers.create({
        data: {
          user_id: user.id,
          status: trade_offer_status.new,
          expires_in: expires_in,
        },
      });
      await tx.trade_offer_items.create({
        data: {
          trade_offer_id: trade_offer.id,
          steam_item_id:
            user_inventory_item.steam_bot_inventory_items.steam_item_id,
          trade_action: trade_action.send,
        },
      });
      return {
        steam_bot_id: steam_bot_inventory_item.steam_bot_id,
        trade_id: trade_offer.id,
      };
    });
    await tradeItem(trade_bot.steam_bot_id, trade_bot.trade_id);

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Error withdrawing item:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
