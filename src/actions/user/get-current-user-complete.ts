"use server";
import { userCompleteSchema } from "@/schemas/users.schema";
import { getCurrentUser } from "./get-current-user";
import { users } from "@prisma-zod/generated/zod.schema";

export async function getCurrentUserComplete(): Promise<users | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const userComplete = userCompleteSchema.safeParse(user);

  if (!userComplete.success) {
    return null;
  }
  return user;
}
