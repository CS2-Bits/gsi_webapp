"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import {
  stream_provider,
  stream_urls,
  stream_urls_schema,
  streamers,
  streamers_schema,
} from "@prisma-zod/generated/zod.schema";
import { getUserAdmin } from "./get-user-admin";
import { user_status } from "@prisma/client";

async function getStreamerById(streamerId: string) {
  const streamer = await prisma.streamers.findUnique({
    where: { id: streamerId },
    include: { stream_urls: true },
  });
  if (!streamer) {
    throw new Error("Streamer not found");
  }
  return {
    streamers: streamers_schema.parse(streamer),
    stream_urls: streamer.stream_urls.map((url) =>
      stream_urls_schema.parse(url)
    ),
  };
}

export async function getStreamersAction(filters?: { name?: string }): Promise<
  ActionResponse<
    {
      streamers: streamers;
      stream_urls: stream_urls[];
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
  const streamersData = await prisma.streamers.findMany({
    where: {
      display_name: {
        contains: filters?.name,
        mode: "insensitive" as const,
      },
    },
    include: {
      stream_urls: true,
    },
  });

  const streamersDataParsed = streamersData.map((s) => ({
    streamers: streamers_schema.parse(s),
    stream_urls: s.stream_urls.map((url) => stream_urls_schema.parse(url)),
  }));

  return {
    success: true,
    data: streamersDataParsed,
  };
}

export async function createStreamerAction(data: {
  steam_id: string;
  username_id: string;
  display_name?: string;
  avatar_url?: string;
}): Promise<
  ActionResponse<{
    streamers: streamers;
    stream_urls: stream_urls[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const userStreamer = await prisma.users.findUnique({
    where: { steam_id: data.steam_id },
  });
  if (!userStreamer) {
    return {
      success: false,
      error_message: "error.user_not_found",
    };
  }

  const createdStreamer = await prisma.streamers.create({
    data: {
      user_id: userStreamer.id,
      username_id: data.username_id.trim(),
      display_name: data.display_name?.trim(),
      avatar_url: data.avatar_url?.trim() || null,
    },
    include: {
      stream_urls: true,
    },
  });
  return {
    success: true,
    data: {
      streamers: streamers_schema.parse(createdStreamer),
      stream_urls: createdStreamer.stream_urls.map((url) =>
        stream_urls_schema.parse(url)
      ),
    },
  };
}

export async function updateStreamerAction(data: {
  id: string;
  username_id: string;
  display_name?: string;
  avatar_url?: string;
  streamer_status: user_status;
}): Promise<
  ActionResponse<{
    streamers: streamers;
    stream_urls: stream_urls[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const updatedStreamer = await prisma.streamers.update({
    where: {
      id: data.id,
    },
    data: {
      username_id: data.username_id.trim(),
      display_name: data.display_name?.trim(),
      user_status: data.streamer_status,
      avatar_url: data.avatar_url?.trim() || null,
    },
    include: {
      stream_urls: true,
    },
  });

  return {
    success: true,
    data: {
      streamers: streamers_schema.parse(updatedStreamer),
      stream_urls: updatedStreamer.stream_urls.map((url) =>
        stream_urls_schema.parse(url)
      ),
    },
  };
}

export async function createUpdateStreamUrlAction(data: {
  streamer_id: string;
  stream_provider_name: stream_provider;
  url: string;
}): Promise<
  ActionResponse<{
    streamers: streamers;
    stream_urls: stream_urls[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  await prisma.stream_urls.upsert({
    where: {
      streamer_id_stream_provider_name: {
        streamer_id: data.streamer_id,
        stream_provider_name: data.stream_provider_name,
      },
    },
    create: {
      streamer_id: data.streamer_id,
      stream_provider_name: data.stream_provider_name,
      url: data.url,
    },
    update: {
      stream_provider_name: data.stream_provider_name,
      url: data.url,
    },
  });

  return {
    success: true,
    data: await getStreamerById(data.streamer_id),
  };
}

export async function deleteStreamUrlAction(data: {
  streamer_id: string;
  stream_provider_name: stream_provider;
}): Promise<
  ActionResponse<{
    streamers: streamers;
    stream_urls: stream_urls[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  await prisma.stream_urls.delete({
    where: {
      streamer_id_stream_provider_name: {
        streamer_id: data.streamer_id,
        stream_provider_name: data.stream_provider_name,
      },
    },
  });

  return {
    success: true,
    data: await getStreamerById(data.streamer_id),
  };
}
