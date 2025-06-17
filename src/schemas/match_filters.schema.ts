import { stream_match_status } from "@prisma/client";
import { z } from "zod";

export const MatchFiltersSchema = z.object({
  status: z.nativeEnum(stream_match_status).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  streamerIds: z.array(z.string()).optional(),
  mapIds: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type MatchFilters = z.infer<typeof MatchFiltersSchema>;
