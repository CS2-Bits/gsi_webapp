"use server";

import { prisma } from "@/lib/prisma";
import { match_player_stats_schema } from "@prisma-zod/generated/zod.schema";

export async function getMatchStatsByMatchId(match_id: string | null) {
  if (!match_id) {
    return null;
  }
  const stats = await prisma.match_player_stats.findUnique({
    where: {
      match_id: match_id,
    },
  });

  if (!stats) {
    return null;
  }

  return match_player_stats_schema.parse(stats);
}
