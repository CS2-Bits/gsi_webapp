"use server";

import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import { trade_offer_status } from "@prisma/client";
import tradeItem from "../stream/trade-item";
import { ActionError } from "@/types/action-error";

export async function withdrawItemAction(
  item_id: string
): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error_message: "error.not_authenticated",
      };
    }

    const user_inventory_item =
      await prisma.user_inventory_items.findFirstOrThrow({
        where: {
          steam_item_id: item_id,
          user_id: user.id,
          in_trade: false,
          expires_in: {
            gt: new Date(),
          },
        },
        include: {
          steam_items: true,
        },
      });

    await prisma.$transaction(async (tx) => {
      await tx.user_inventory_items.update({
        where: {
          user_id_steam_item_id: {
            user_id: user.id,
            steam_item_id: user_inventory_item.steam_item_id,
          },
        },
        data: {
          in_trade: true,
        },
      });
      const steam_bot_inventory_item =
        await tx.steam_bot_inventory_items.findFirstOrThrow({
          where: {
            steam_item_id: user_inventory_item.steam_item_id,
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
          expires_in: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await tx.trade_offer_items.create({
        data: {
          trade_offer_id: trade_offer.id,
          steam_item_id: user_inventory_item.steam_item_id,
        },
      });
      const event = await tradeItem(
        steam_bot_inventory_item.steam_bot_id,
        trade_offer.id
      );
      if (!event) {
        throw new ActionError("Failed to create trade offer in stream");
      }
    });

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
