"use server";
import { ActionResponse } from "@/types/action-response";
import { WsTokenData } from "@/types/ws-token-data";
import jwt from "jsonwebtoken";

export async function getMatchWsTokenAction(
  streamerID: string
): Promise<ActionResponse<string>> {
  const secret = process.env.WS_SECRET!;
  const tokenData: WsTokenData = {
    ChannelName: "match_events",
    ChannelID: streamerID,
  };
  const token = jwt.sign(tokenData, secret, { expiresIn: "8h" });
  return {
    success: true,
    data: token,
  };
}
