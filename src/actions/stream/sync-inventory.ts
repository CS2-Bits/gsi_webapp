"use server";
import { redis } from "@/lib/redis";
import { SteamEvent } from "@/schemas/steam-events.schema";

export default async function syncInventory(steam_bot_id: string) {
  const event: SteamEvent = {
    type: "SyncInventory",
    data: {
      steam_bot_id: steam_bot_id,
    },
  };
  return await redis.xadd(
    `gsi_steam_stream`,
    "*",
    "request",
    JSON.stringify(event)
  );
}
