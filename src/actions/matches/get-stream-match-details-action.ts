"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import {
  match_player_rounds,
  match_player_rounds_schema,
  match_player_stats,
  match_player_stats_schema,
  matches,
  matches_schema,
  streamers,
  streamers_schema,
} from "@prisma-zod/generated/zod.schema";
import { z } from "zod";

// Input validation schema
const StreamMatchIdSchema = z.string().min(1, "Stream match ID is required");

type StreamMatchDetailsResponse = {
  streamer: streamers;
  matchData: matches;
  statsData: match_player_stats;
  roundsData: match_player_rounds[];
};

export async function getStreamMatchDetailsAction(
  streamMatchId: string
): Promise<ActionResponse<StreamMatchDetailsResponse>> {
  try {
    // Validate input
    const validatedStreamMatchId = StreamMatchIdSchema.parse(streamMatchId);

    const streamMatchData = await prisma.stream_matches.findUnique({
      where: { id: validatedStreamMatchId },
      include: {
        matches: {
          include: {
            match_player_stats: {
              include: {
                match_player_rounds: true,
              },
            },
          },
        },
        streamers: true,
      },
    });

    if (
      !streamMatchData ||
      !streamMatchData.matches ||
      !streamMatchData.matches.match_player_stats
    ) {
      return {
        success: false,
        error_message: "error.stream_match_not_found",
      };
    }
    return {
      success: true,
      data: {
        streamer: streamers_schema.parse(streamMatchData.streamers),
        matchData: matches_schema.parse(streamMatchData.matches),
        statsData: match_player_stats_schema.parse(
          streamMatchData.matches.match_player_stats
        ),
        roundsData:
          streamMatchData.matches.match_player_stats.match_player_rounds
            .map((round) => match_player_rounds_schema.parse(round))
            .sort((a, b) => b.round_number - a.round_number),
      },
    };
  } catch (error) {
    console.error("Error fetching stream match details:", error);

    // Return null values on error
    return {
      error_message: "error.fetching_stream_match_details",
      success: false,
    };
  }
}
