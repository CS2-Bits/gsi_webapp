"use server";
import { ActionResponse } from "@/types/action-response";
import { WsTokenData } from "@/types/ws-token-data";
import jwt from "jsonwebtoken";
import { getCurrentUser } from "../user/get-current-user";

export async function getTradeWsTokenAction(): Promise<ActionResponse<string>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const secret = process.env.WS_SECRET!;
  const tokenData: WsTokenData = {
    ChannelName: "steam_events",
    ChannelID: user.id,
  };
  const token = jwt.sign(tokenData, secret, { expiresIn: "8h" });
  return {
    success: true,
    data: token,
  };
}
