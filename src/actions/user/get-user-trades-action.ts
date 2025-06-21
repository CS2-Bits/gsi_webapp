"use server";

import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./get-current-user";
import {
  trade_offers,
  trade_offer_items,
  steam_items,
  trade_offers_schema,
  trade_offer_items_schema,
  steam_items_schema,
} from "@prisma-zod/generated/zod.schema";

export interface GetUserTradesActionParams {
  page?: number;
  limit?: number;
}

export interface GetUserTradesActionResponse {
  tradesData: {
    trade_offer: trade_offers;
    trade_offer_items: Array<{
      trade_offer_item: trade_offer_items;
      steam_item: steam_items;
    }>;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getUserTradesAction(
  params: GetUserTradesActionParams = {}
): Promise<ActionResponse<GetUserTradesActionResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error_message: "error.not_authenticated",
      };
    }

    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.trade_offers.count({
      where: {
        user_id: user.id,
      },
    });

    // Get trade offers with items
    const trade_offers = await prisma.trade_offers.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        trade_offer_items: {
          include: {
            steam_items: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const mappedData = trade_offers.map((trade_offer) => ({
      trade_offer: trade_offers_schema.parse(trade_offer),
      trade_offer_items: trade_offer.trade_offer_items.map((item) => ({
        trade_offer_item: trade_offer_items_schema.parse(item),
        steam_item: steam_items_schema.parse(item.steam_items),
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        tradesData: mappedData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user trades:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
