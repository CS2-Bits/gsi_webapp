"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import {
  raffles,
  raffles_schema,
  steam_items,
  steam_items_schema,
  users,
  users_schema,
} from "@prisma-zod/generated/zod.schema";
import { getUserAdmin } from "./get-user-admin";
import {
  RaffleCancelledEvent,
  RaffleEndedEvent,
  RaffleUpdatedEvent,
} from "../stream/raffle-events";
import { raffle_status } from "@prisma/client";

export async function getRafflesAction(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<
  ActionResponse<
    {
      raffles: raffles;
      steam_items: steam_items;
      winner: users | null;
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

  const raffles = await prisma.raffles.findMany({
    where: {
      created_at: {
        gte: filters?.startDate ? new Date(filters.startDate) : undefined,
        lte: filters?.endDate ? new Date(filters.endDate) : undefined,
      },
    },
    include: {
      steam_items: true,
      users: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const parsedRaffles = raffles.map((r) => {
    return {
      raffles: raffles_schema.parse(r),
      steam_items: steam_items_schema.parse(r.steam_items),
      winner: r.users ? users_schema.parse(r.users) : null,
    };
  });

  return {
    success: true,
    data: parsedRaffles,
  };
}

export async function updateRaffleStausAction(
  raffle_id: string,
  status: raffle_status
): Promise<
  ActionResponse<{
    raffles: raffles;
    steam_items: steam_items;
    winner: users | null;
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  let res: string | null = null;
  switch (status) {
    case raffle_status.created:
    case raffle_status.active:
    case raffle_status.closed:
      await prisma.raffles.update({
        where: {
          id: raffle_id,
          status: {
            notIn: [raffle_status.delivered, raffle_status.cancelled],
          },
        },
        data: {
          status,
        },
      });
      res = await RaffleUpdatedEvent(raffle_id);
      break;
    case raffle_status.cancelled:
      res = await RaffleCancelledEvent(raffle_id);
      break;
    case raffle_status.delivered:
      res = await RaffleEndedEvent(raffle_id);
      break;
    default:
      res = "1";
  }
  if (!res) {
    throw new Error("Failed to send raffle event");
  }
  const r = await prisma.raffles.findUniqueOrThrow({
    where: {
      id: raffle_id,
    },
    include: {
      steam_items: true,
      users: true,
    },
  });
  return {
    success: true,
    data: {
      raffles: raffles_schema.parse(r),
      steam_items: steam_items_schema.parse(r.steam_items),
      winner: r.users ? users_schema.parse(r.users) : null,
    },
  };
}
