"use server";
import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import {
  MatchFilters,
  MatchFiltersSchema,
} from "@/schemas/match_filters.schema";
import { user_status } from "@prisma/client";
import { streamers, streamers_schema } from "@prisma-zod/generated/zod.schema";

type MatchesStreamersResponse = {
  streamers: streamers[];
};

export async function getMatchesStreamersAction(
  filters: MatchFilters
): Promise<ActionResponse<MatchesStreamersResponse>> {
  try {
    const validatedFilters = MatchFiltersSchema.parse(filters);

    const streamers = await prisma.streamers.findMany({
      where: {
        user_status: user_status.Active,
        matches: {
          some: {
            started_at: {
              gte: validatedFilters.dateFrom
                ? new Date(validatedFilters.dateFrom)
                : undefined,
              lte: validatedFilters.dateTo
                ? new Date(validatedFilters.dateTo)
                : undefined,
            },
          },
        },
        stream_matches: {
          some: {
            match_status: validatedFilters.status,
          },
        },
      },
      orderBy: {
        username_id: "asc",
      },
    });
    const streamerParsed = streamers.map((streamer) =>
      streamers_schema.parse(streamer)
    );
    return {
      success: true,
      data: { streamers: streamerParsed },
    };
  } catch (error) {
    console.error("Error fetching streamers:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
