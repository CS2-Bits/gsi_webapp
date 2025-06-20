import { trade_offer_status } from "@prisma/client";
import { z } from "zod";

export const SteamEventBase = z.object({
  steam_bot_id: z.string(),
});

export const CreateTradeEvent = SteamEventBase.extend({
  trade_offer_id: z.string(),
});

export const UpdateTradeEvent = SteamEventBase.extend({
  trade_offer_id: z.string(),
  new_status: z.nativeEnum(trade_offer_status),
});

export const SteamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("TradeCreated"),
    data: CreateTradeEvent,
  }),
  z.object({
    type: z.literal("TradeUpdate"),
    data: UpdateTradeEvent,
  }),
  z.object({
    type: z.literal("SyncInventory"),
    data: SteamEventBase,
  }),
]);

export type SteamEvent = z.infer<typeof SteamEventSchema>;
