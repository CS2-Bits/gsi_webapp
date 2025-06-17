"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { redis } from "@/lib/redis";
import { getCurrentUser } from "../user/get-current-user";

const bodySchema = z.object({ otp: z.string().length(6) });

const redisEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function confirmEmailOtpAction(
  otp: string
): Promise<ActionResponse<boolean>> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error_message: "error.user_not_found" };
  }

  const { success } = bodySchema.safeParse({ otp });

  if (!success) {
    return { success: false, error_message: "error.invalid_otp" };
  }

  const stored = await redis.get(`email:otp:${user.id}`);

  if (!stored) {
    return { success: false, error_message: "error.otp_not_found" };
  }

  const parsed = redisEmailSchema.safeParse(JSON.parse(stored));

  if (!parsed.success)
    return { success: false, error_message: "error.invalid_otp" };

  if (parsed.data.otp !== otp) {
    return { success: false, error_message: "error.invalid_otp" };
  }

  await redis.del(`email:otp:${user.id}`);

  await prisma.users.update({
    where: { id: user.id },
    data: { email: parsed.data.email.toLowerCase() },
  });

  return { success: true, data: true };
}
