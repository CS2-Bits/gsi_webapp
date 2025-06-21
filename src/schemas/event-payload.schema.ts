import { z } from "zod";
export const EventPayloadSchema = z.object({
  event_type: z.enum([
    "match",
    "stats",
    "round",
    "kill",
    "death",
    "prediction",
    "bet",
    "end",
    "trade",
  ]),
  data: z.string(),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
