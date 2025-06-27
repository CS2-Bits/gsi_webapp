"use server";
import { redis } from "@/lib/redis";
import { StreamEvent, StreamEventType } from "@/types/stream-actions";

export async function RaffleUpdatedEvent(raffle_id: string) {
  const event: StreamEvent = {
    type: StreamEventType.EventRaffleUpdated,
    data: {
      raffle_id: raffle_id,
    },
  };
  return await redis.xadd(
    process.env.REDIS_GSI_STREAM!,
    "*",
    "msg",
    JSON.stringify(event)
  );
}

export async function RaffleCancelledEvent(raffle_id: string) {
  const event: StreamEvent = {
    type: StreamEventType.EventRaffleCancelled,
    data: {
      raffle_id: raffle_id,
    },
  };
  return await redis.xadd(
    process.env.REDIS_GSI_STREAM!,
    "*",
    "msg",
    JSON.stringify(event)
  );
}

export async function RaffleEndedEvent(raffle_id: string) {
  const event: StreamEvent = {
    type: StreamEventType.EventRaffleEnded,
    data: {
      raffle_id: raffle_id,
    },
  };
  return await redis.xadd(
    process.env.REDIS_GSI_STREAM!,
    "*",
    "msg",
    JSON.stringify(event)
  );
}

export async function RaffleCreatedEvent(
  steam_item_id: string,
  ticket_price: number,
  end_at: Date
) {
  const event: StreamEvent = {
    type: StreamEventType.EventRaffleCreated,
    data: {
      steam_item_id: steam_item_id,
      ticket_price: ticket_price,
      end_at: end_at,
    },
  };
  return await redis.xadd(
    process.env.REDIS_GSI_STREAM!,
    "*",
    "msg",
    JSON.stringify(event)
  );
}
