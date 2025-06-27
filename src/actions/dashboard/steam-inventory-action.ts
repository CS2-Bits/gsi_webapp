"use server";

import { ActionResponse } from "@/types/action-response";
import { getUserAdmin } from "./get-user-admin";
import { prisma } from "@/lib/prisma";
import {
  currency,
  steam_bot_inventory_items,
  steam_bot_inventory_items_schema,
  steam_items,
  steam_items_schema,
  user_inventory_items,
  user_inventory_items_schema,
} from "@prisma-zod/generated/zod.schema";
import { RaffleCreatedEvent } from "../stream/raffle-events";
import syncInventory from "../stream/sync-inventory";
import {
  Pagination,
  PaginationParams,
  PaginationParamsSchema,
  PaginationSchema,
} from "@/schemas/pagination.schema";

export async function getSteamInventoryAction(filters?: {
  name?: string;
  pagination?: PaginationParams;
}): Promise<
  ActionResponse<{
    steamInventoryData: {
      steam_bot_inventory_items: steam_bot_inventory_items;
      steam_items: steam_items;
      user_inventory_items: user_inventory_items | null;
    }[];
    pagination: Pagination;
  }>
> {
  try {
    const user = await getUserAdmin();
    if (!user) {
      return {
        success: false,
        error_message: "error.user_not_authenticated",
      };
    }

    let page = 1;
    let limit = 20;
    if (filters?.pagination) {
      ({ page, limit } = PaginationParamsSchema.parse(filters.pagination));
    }
    const skip = (page - 1) * limit;

    const where = {
      steam_items: {
        market_hash_name: {
          contains: filters?.name,
          mode: "insensitive" as const,
        },
      },
    };

    const total = await prisma.steam_bot_inventory_items.count({
      where,
    });

    const steamInventoryItems = await prisma.steam_bot_inventory_items.findMany(
      {
        where,
        include: {
          steam_items: true,
          user_inventory_items: true,
        },
        orderBy: {
          steam_items: {
            estimated_fiat_value: "desc",
          },
        },
        skip,
        take: limit,
      }
    );

    const steamInventoryData = steamInventoryItems.map((item) => ({
      steam_bot_inventory_items: steam_bot_inventory_items_schema.parse(item),
      steam_items: steam_items_schema.parse(item.steam_items),
      user_inventory_items: item.user_inventory_items
        ? user_inventory_items_schema.parse(item.user_inventory_items)
        : null,
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      data: {
        steamInventoryData,
        pagination: PaginationSchema.parse({
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        }),
      },
    };
  } catch (error) {
    console.error("Error fetching steam inventory:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}

export async function updateSteamInventoryItemAction(
  steam_item_id: string,
  currency: currency,
  price: number,
  fee: number,
  marketable: boolean
): Promise<
  ActionResponse<{
    steam_bot_inventory_items: steam_bot_inventory_items;
    steam_items: steam_items;
    user_inventory_items: user_inventory_items | null;
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const items = await prisma.steam_items.update({
    where: {
      asset_id: steam_item_id,
    },
    data: {
      estimated_fiat_value: price,
      currency: currency,
      fee_pct: fee,
    },
    include: {
      steam_bot_inventory_items: {
        include: {
          user_inventory_items: true,
        },
      },
    },
  });

  if (items.steam_bot_inventory_items) {
    await prisma.steam_bot_inventory_items.update({
      where: {
        steam_item_id: items.steam_bot_inventory_items.steam_item_id,
      },
      data: {
        marketable: marketable,
      },
    });
  }

  return {
    success: true,
    data: {
      steam_bot_inventory_items: steam_bot_inventory_items_schema.parse(
        items.steam_bot_inventory_items
      ),
      steam_items: steam_items_schema.parse(items),
      user_inventory_items: items.steam_bot_inventory_items
        ?.user_inventory_items
        ? user_inventory_items_schema.parse(
            items.steam_bot_inventory_items.user_inventory_items
          )
        : null,
    },
  };
}

export async function createRaffleFromItemAction(
  steam_item_id: string,
  ticket_price: number,
  end_at: Date
): Promise<ActionResponse<boolean>> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const res = await RaffleCreatedEvent(steam_item_id, ticket_price, end_at);

  if (!res) {
    return {
      success: false,
      error_message: "error.raffle_creation_failed",
    };
  }

  return {
    success: true,
    data: true,
  };
}

export async function getAllSteamBotsAction(): Promise<
  ActionResponse<
    {
      steam_id: string;
    }[]
  >
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const steam_bots = await prisma.steam_bots.findMany({
    select: {
      steam_id: true,
    },
  });

  return {
    success: true,
    data: steam_bots,
  };
}
export async function syncInventoryAction(
  steam_bot_id: string
): Promise<ActionResponse<boolean>> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const steam_bot = await prisma.steam_bots.findFirstOrThrow({
    where: {
      steam_id: steam_bot_id,
    },
    select: {
      steam_id: true,
    },
  });

  const res = await syncInventory(steam_bot.steam_id);
  if (!res) {
    return {
      success: false,
      error_message: "error.sync_inventory_failed",
    };
  }

  return {
    success: true,
    data: true,
  };
}
