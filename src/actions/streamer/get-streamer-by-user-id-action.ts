"use server";

import { prisma } from "@/lib/prisma";
import {
  stream_urls_schema,
  streamers_schema,
} from "@prisma-zod/generated/zod.schema";

export async function getStreamerByUserIdAction(user_id: string) {
  const streamer = await prisma.streamers.findUnique({
    where: {
      user_id: user_id,
    },
    include: {
      stream_urls: true,
    },
  });

  if (!streamer) {
    return null;
  }

  return {
    ...streamers_schema.parse(streamer),
    stream_urls: streamer.stream_urls.map((s) => stream_urls_schema.parse(s)),
  };
}
