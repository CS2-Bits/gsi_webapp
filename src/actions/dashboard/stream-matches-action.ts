"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ActionResponse } from "@/types/action-response";
import {
  matches,
  matches_schema,
  stream_match_status,
  stream_matches,
  stream_matches_schema,
  streamers,
  streamers_schema,
} from "@prisma-zod/generated/zod.schema";
import { getUserAdmin } from "./get-user-admin";

export async function getStreamMatchesAction(filters?: {
  startDate?: string;
  endDate?: string;
  status?: stream_match_status;
}): Promise<
  ActionResponse<
    {
      stream_matches: stream_matches;
      matches: matches;
      streamers: streamers;
    }[]
  >
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const stream_matches = await prisma.stream_matches.findMany({
    where: {
      created_at: {
        gte: filters?.startDate ? new Date(filters.startDate) : undefined,
        lte: filters?.endDate ? new Date(filters.endDate) : undefined,
      },
      match_status: filters?.status ? filters.status : undefined,
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      matches: true,
      streamers: true,
    },
  });

  const stream_matches_parsed = stream_matches.map((m) => {
    return {
      stream_matches: stream_matches_schema.parse(m),
      matches: matches_schema.parse(m.matches),
      streamers: streamers_schema.parse(m.streamers),
    };
  });

  return {
    success: true,
    data: stream_matches_parsed,
  };
}

export async function updateStreamMatchesStatusAction(
  stream_matches_id: string,
  status: stream_match_status
): Promise<
  ActionResponse<{
    stream_matches: stream_matches;
    matches: matches;
    streamers: streamers;
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const stream_matches = await prisma.stream_matches.update({
    where: { id: stream_matches_id },
    data: { match_status: status },
    include: { matches: true, streamers: true },
  });

  await redis.publish(
    "match_events:" + stream_matches.streamer_id + ":match",
    JSON.stringify(stream_matches.matches)
  );

  return {
    success: true,
    data: {
      stream_matches: stream_matches_schema.parse(stream_matches),
      matches: matches_schema.parse(stream_matches.matches),
      streamers: streamers_schema.parse(stream_matches.streamers),
    },
  };
}
