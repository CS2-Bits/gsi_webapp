"use server";
import { prisma } from "@/lib/prisma";
import { match_player_rounds_schema } from "@prisma-zod/generated/zod.schema";

export async function getMatchRounds(statsId: string | null) {
  if (!statsId) {
    return null;
  }
  const rounds = await prisma.match_player_rounds.findMany({
    where: {
      stats_id: statsId,
    },
    orderBy: {
      round_number: "desc",
    },
  });

  if (!rounds || rounds.length === 0) {
    return [];
  }

  return rounds.map((round) => match_player_rounds_schema.parse(round));
}
