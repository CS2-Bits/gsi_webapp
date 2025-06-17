"use server";
import { ActionResponse } from "@/types/action-response";
import { getCurrentUserComplete } from "./get-current-user-complete";
import { users, users_schema } from "@prisma-zod/generated/zod.schema";

export async function getCurrentUserCompleteAction(): Promise<
  ActionResponse<users>
> {
  const user = await getCurrentUserComplete();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_complete",
    };
  }

  return {
    success: true,
    data: users_schema.parse(user),
  };
}
