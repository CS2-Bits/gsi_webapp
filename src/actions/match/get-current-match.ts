"use server";

import { prisma } from "@/lib/prisma";
import { matches_schema } from "@prisma-zod/generated/zod.schema";

export async function getCurrentMatchByStreamerId(streamerUserId: string) {
  const match = await prisma.matches.findFirst({
    where: {
      streamer_user_id: streamerUserId,
      AND: [
        {
          ended_at: null,
        },
      ],
    },
  });
  if (!match) {
    return null;
  }
  return matches_schema.parse(match);
}
