"use server";
import { transporter } from "@/lib/nodemailer";
import { z } from "zod";
import { ActionResponse } from "@/types/action-response";
import { redis } from "@/lib/redis";
import { getCurrentUser } from "../user/get-current-user";

const requestEmailOtpSchema = z.object({
  email: z.string().email(),
});

export async function requestEmailOtpAction(
  email: string
): Promise<ActionResponse<boolean>> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error_message: "error.user_not_found" };
  }

  const { success } = requestEmailOtpSchema.safeParse({ email });

  if (!success) {
    return { success: false, error_message: "error.invalid_email" };
  }

  if (user.email === email) {
    return { success: false, error_message: "error.email_already_confirmed" };
  }

  const data = await redis.get(`email:last_otp:${user.id}`);
  if (data) {
    return { success: false, error_message: "error.otp_already_sent" };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(
    `email:otp:${user.id}`,
    JSON.stringify({ email, otp }),
    "EX",
    60 * 60
  );

  await redis.set(
    `email:last_otp:${user.id}`,
    new Date().toISOString(),
    "EX",
    60 * 2
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to: email.toLowerCase(),
    subject: "CS2Bits Email OTP Verification",
    text: `Your email OTP is <b>${otp}</b>`,
    html: `<p>Your email OTP is <b>${otp}</b></p>`,
  });

  return { success: true, data: true };
}
