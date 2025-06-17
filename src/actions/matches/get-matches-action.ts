"use server";
import { ActionResponse } from "@/types/action-response";
import { prisma } from "@/lib/prisma";
import { map_name, stream_match_status } from "@prisma/client";
import { Pagination } from "@/schemas/pagination.schema";
import {
  match_player_stats,
  match_player_stats_schema,
  matches,
  matches_schema,
  stream_matches,
  stream_matches_schema,
  streamers,
  streamers_schema,
} from "@prisma-zod/generated/zod.schema";
import {
  MatchFilters,
  MatchFiltersSchema,
} from "@/schemas/match_filters.schema";

type MatchesActionResponse = {
  matchesData: {
    stream_match: stream_matches;
    match: matches;
    match_player_stats: match_player_stats;
    streamer: streamers;
  }[];
  pagination: Pagination;
};

type StreamMatchWhereInput = {
  match_status?: stream_match_status | { in: stream_match_status[] };
  matches?: MatchWhereInput;
};

type MatchWhereInput = {
  started_at?: {
    gte?: Date;
    lte?: Date;
  };
  streamer_user_id?: {
    in: string[];
  };
  map_name?: {
    in: map_name[];
  };
};

export async function getMatchesAction(
  filters: MatchFilters
): Promise<ActionResponse<MatchesActionResponse>> {
  try {
    const validatedFilters = MatchFiltersSchema.parse(filters);

    const streamMatchWhere: StreamMatchWhereInput = {};
    const matchWhere: MatchWhereInput = {};

    // Apply stream match status filter
    if (validatedFilters.status === stream_match_status.Live) {
      streamMatchWhere.match_status = {
        in: [stream_match_status.Live, stream_match_status.Preparing],
      };
    }
    if (validatedFilters.status === stream_match_status.Finished) {
      streamMatchWhere.match_status = stream_match_status.Finished;
    }
    if (!validatedFilters.status) {
      streamMatchWhere.match_status = {
        in: [stream_match_status.Live, stream_match_status.Finished],
      };
    }
    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      // Apply date filters to matches
      matchWhere.started_at = {};
      if (validatedFilters.dateFrom) {
        matchWhere.started_at.gte = new Date(validatedFilters.dateFrom);
      }
      if (validatedFilters.dateTo) {
        matchWhere.started_at.lte = new Date(validatedFilters.dateTo);
      }
    }

    // Apply streamer filter to matches
    if (
      validatedFilters.streamerIds &&
      validatedFilters.streamerIds.length > 0
    ) {
      matchWhere.streamer_user_id = {
        in: validatedFilters.streamerIds,
      };
    }

    // Apply map filter to matches
    if (validatedFilters.mapIds && validatedFilters.mapIds.length > 0) {
      matchWhere.map_name = {
        in: validatedFilters.mapIds.map((mapId) => {
          return map_name[mapId as keyof typeof map_name];
        }),
      };
    }

    // Build the complete where clause for stream_matches
    if (Object.keys(matchWhere).length > 0) {
      streamMatchWhere.matches = matchWhere;
    }

    const totalCount = await prisma.stream_matches.count({
      where: streamMatchWhere,
    });

    const stream_matches = await prisma.stream_matches.findMany({
      where: streamMatchWhere,
      include: {
        matches: {
          include: {
            match_player_stats: true,
          },
        },
        streamers: true,
      },
      orderBy: {
        matches: {
          started_at: "desc",
        },
      },
      skip: (validatedFilters.page - 1) * validatedFilters.limit,
      take: validatedFilters.limit,
    });

    const streamMatchesData = stream_matches
      .filter((m) => m.matches && m.matches.match_player_stats)
      .map((stream_match) => {
        try {
          return {
            stream_match: stream_matches_schema.parse(stream_match),
            match: matches_schema.parse(stream_match.matches),
            match_player_stats: match_player_stats_schema.parse(
              stream_match.matches.match_player_stats
            ),
            streamer: streamers_schema.parse(stream_match.streamers),
          };
        } catch (parseError) {
          console.error("Error parsing match data:", parseError);
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const pagination: Pagination = {
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / validatedFilters.limit),
      hasNext:
        validatedFilters.page < Math.ceil(totalCount / validatedFilters.limit),
      hasPrev: validatedFilters.page > 1,
    };
    return {
      success: true,
      data: { matchesData: streamMatchesData, pagination },
    };
  } catch (error) {
    console.error("Error fetching matches:", error);
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
