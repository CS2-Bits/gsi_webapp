"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types/action-response";
import { raffle_status } from "@prisma/client";
import {
  raffles,
  raffles_schema,
  steam_items,
  steam_items_schema,
  users,
  users_schema,
} from "@prisma-zod/generated/zod.schema";

export type RaffleWithSteamItem = raffles & {
  steam_item: steam_items;
  winner: users | null;
};

export async function getAllRafflesAction(): Promise<
  ActionResponse<RaffleWithSteamItem[]>
> {
  try {
    const response = await prisma.raffles.findMany({
      where: {
        status: {
          not: raffle_status.cancelled,
        },
      },
      include: {
        steam_items: true,
        users: true,
      },
    });
    const raffles: RaffleWithSteamItem[] = response.map((raffle) => ({
      ...raffles_schema.parse(raffle),
      steam_item: steam_items_schema.parse({
        ...raffle.steam_items,
      }),
      winner: raffle.users ? users_schema.parse(raffle.users) : null,
    }));

    return {
      success: true,
      data: raffles,
    };
  } catch (error) {
    console.error("Error fetching raffles:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
