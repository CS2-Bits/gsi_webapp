import { z } from "zod";

export const PurchaseTicketsSchema = z.object({
  raffle_id: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export type PurchaseTicketsInput = z.infer<typeof PurchaseTicketsSchema>;
