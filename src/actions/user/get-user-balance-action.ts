"use server";

import { ActionResponse } from "@/types/action-response";
import { getUserBalance } from "./get-user-balance";
import { ActionError } from "@/types/action-error";
import {
  user_balances,
  user_balances_schema,
} from "@prisma-zod/generated/zod.schema";

export async function getUserBalanceAction(): Promise<
  ActionResponse<user_balances>
> {
  try {
    const userBalance = await getUserBalance();

    if (!userBalance) {
      return { success: false, error_message: "error.user_not_authenticated" };
    }

    return { success: true, data: user_balances_schema.parse(userBalance) };
  } catch (error) {
    if (error instanceof ActionError) {
      return { success: false, error_message: error.message };
    }
    console.error("Error fetching user balance:", error);
    return { success: false, error_message: "error.fetching_user_balance" };
  }
}
