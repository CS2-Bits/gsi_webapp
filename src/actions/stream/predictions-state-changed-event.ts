"use server";
import { redis } from "@/lib/redis";
import { StreamEvent, StreamEventType } from "@/types/stream-actions";
import { bet_state } from "@prisma-zod/generated/zod.schema";

export default async function predictionsStateChangedEvent(
  prediction_id: string,
  streamer_id: string,
  state: bet_state
) {
  const event: StreamEvent = {
    type: StreamEventType.EventPredictionStateChanged,
    data: {
      prediction_id: prediction_id,
      new_bet_state: state,
      callback_channel: "match_events:" + streamer_id,
    },
  };
  return await redis.xadd(
    process.env.REDIS_GSI_STREAM!,
    "*",
    "msg",
    JSON.stringify(event)
  );
}
