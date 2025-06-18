"use server";
import { redis } from "@/lib/redis";
import { StreamEvent, StreamEventType } from "@/types/stream-actions";

export default async function tradeItem(
  steam_bot_id: string,
  trade_offer_id: string
) {
  const event: StreamEvent = {
    type: StreamEventType.EventTransactionCreated,
    data: {
      trade_offer_id: trade_offer_id,
    },
  };
  return await redis.xadd(
    `gsi_steam_${steam_bot_id}_stream`,
    "*",
    "msg",
    JSON.stringify(event)
  );
}
