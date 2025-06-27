"use server";
import { ActionResponse } from "@/types/action-response";
import { getCurrentUser } from "./get-current-user";
import {
  user_roles,
  user_roles_schema,
  users,
  users_schema,
} from "@prisma-zod/generated/zod.schema";

export async function getCurrentAdminUserAction(): Promise<
  ActionResponse<{
    user: users;
    user_roles: user_roles[];
  }>
> {
  // Fetch the current user from the session
  const user = await getCurrentUser();
  if (!user || !user.user_roles.some((role) => role.role_name === "Admin")) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  return {
    success: true,
    data: {
      user: users_schema.parse(user),
      user_roles: user.user_roles.map((role) => user_roles_schema.parse(role)),
    },
  };
}
