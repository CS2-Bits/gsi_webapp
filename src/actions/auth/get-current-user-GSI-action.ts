"use server";

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import { users } from "@prisma/client";

interface StreamerGSIAuth {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  token: string;
  valid_until: number;
}

export async function getCurrentUserGSIAction(
  authToken?: string
): Promise<ActionResponse<StreamerGSIAuth>> {
  let user: users | null = null;
  if (!authToken) {
    user = await getCurrentUser();
  } else {
    const payload = jwt.verify(authToken, process.env.GSI_SECRET as string) as {
      id: string;
    };

    user = await prisma.users.findUnique({
      where: {
        steam_id: payload.id,
      },
    });
  }

  if (!user || user.user_status_name !== "Active") {
    return { success: false, error_message: "error.user_not_authenticated" };
  }

  const userRoles = await prisma.user_roles.findMany({
    where: {
      user_id: user.id,
    },
  });

  const streamer = await prisma.streamers.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!streamer) {
    return { success: false, error_message: "error.streamer_not_found" };
  }

  const token = jwt.sign(
    {
      user_id: user.steam_id,
    },
    process.env.GRPC_SECRET as string,
    { expiresIn: "2d" }
  );

  return {
    success: true,
    data: {
      id: user.steam_id,
      name: streamer.username_id,
      avatar: user.avatar_url ?? "https://placehold.co/80x80?text=U",
      roles: userRoles.map((role) => role.role_name),
      valid_until: Math.floor(Date.now() / 1000) + 2 * 18 * 60 * 60, // 1.5 day in seconds
      token,
    },
  };
}
