"use server";
import { redis } from "@/lib/redis";
import { SteamEvent } from "@/schemas/steam-events.schema";

export default async function tradeItem(
  steam_bot_id: string,
  trade_offer_id: string
) {
  const event: SteamEvent = {
    type: "TradeCreated",
    data: {
      steam_bot_id: steam_bot_id,
      trade_offer_id: trade_offer_id,
    },
  };
  return await redis.xadd(
    `gsi_steam_stream`,
    "*",
    "request",
    JSON.stringify(event)
  );
}
