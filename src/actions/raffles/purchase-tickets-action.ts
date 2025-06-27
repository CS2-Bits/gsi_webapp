"use server";

import type { ActionResponse } from "@/types/action-response";
import {
  type PurchaseTicketsInput,
  PurchaseTicketsSchema,
} from "@/schemas/raffle.schema";
import { prisma } from "@/lib/prisma";
import { raffle_status, transaction_type } from "@prisma/client";
import { getUserBalance } from "../user/get-user-balance";
import { revalidatePath } from "next/cache";
import { ActionError } from "@/types/action-error";
import { getCurrentUserComplete } from "../user/get-current-user-complete";

export async function purchaseTicketsAction(
  input: PurchaseTicketsInput
): Promise<ActionResponse<{ tickets_purchased: number }>> {
  try {
    const balance = await getUserBalance();
    if (!balance) {
      return {
        success: false,
        error_message: "error.user_not_authenticated",
      };
    }
    const validatedInput = PurchaseTicketsSchema.parse(input);

    const userComplete = await getCurrentUserComplete();
    if (!userComplete) {
      return {
        success: false,
        error_message: "error.user_not_complete",
      };
    }

    const raffle = await prisma.raffles.findUnique({
      where: {
        id: validatedInput.raffle_id,
        status: raffle_status.active,
        end_at: {
          gt: new Date(),
        },
      },
    });

    if (!raffle) {
      return {
        success: false,
        error_message: "raffle.raffle_not_found",
      };
    }
    const totalCost = raffle.ticket_price.mul(validatedInput.quantity);
    if (totalCost.gt(balance.balance) || totalCost.lte(0)) {
      return {
        success: false,
        error_message: "raffle.insufficient_funds",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Update user balance
      for (let i = 0; i < validatedInput.quantity; i++) {
        const raffleTicket = await tx.raffle_tickets.create({
          data: {
            user_id: balance.user_id,
            raffle_id: raffle.id,
          },
        });
        await tx.user_balances.update({
          where: {
            user_id: balance.user_id,
          },
          data: {
            balance: {
              decrement: raffle.ticket_price,
            },
          },
        });
        const user_transaction = await tx.user_transactions.create({
          data: {
            user_id: balance.user_id,
            amount: raffle.ticket_price.neg(),
            type: transaction_type.RaffleTicket,
            description: `Purchase raffle ${raffle.id} ticket`,
          },
        });
        await tx.user_raffle_ticket_transactions.create({
          data: {
            user_transaction_id: user_transaction.id,
            raffle_ticket_id: raffleTicket.id,
          },
        });
        await tx.user_balance_transactions.create({
          data: {
            user_transaction_id: user_transaction.id,
            user_balance_id: balance.user_id,
          },
        });
      }
    });
    revalidatePath("/raffles");
    return {
      success: true,
      data: {
        tickets_purchased: validatedInput.quantity,
      },
    };
  } catch (error) {
    console.error("Error purchasing raffle tickets:", error);
    if (error instanceof ActionError) {
      return {
        success: false,
        error_message: error.message,
      };
    }
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}
