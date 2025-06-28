import { payment_status } from "@prisma/client";
import { z } from "zod";

export const CreatePaymentSchema = z.object({
  packageId: z.number(),
  provider: z.enum(["Stripe", "Coinbase", "MercadoPago"]),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const CreatePaymentResponseSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("Coinbase"),
    paymentId: z.string(),
    url: z.string(),
  }),
  z.object({
    provider: z.literal("Stripe"),
    paymentId: z.string(),
    clientSecret: z.string(),
  }),
  z.object({
    provider: z.literal("MercadoPago"),
    paymentId: z.string(),
    expiration_date: z.date(),
    QRCode: z.string(),
    QRCodeBase64: z.string(),
  }),
]);

export type CreatePaymentResponse = z.infer<typeof CreatePaymentResponseSchema>;

export const UpdatePaymentStatusSchema = z.object({
  paymentId: z.string(),
  paymentStatus: z.nativeEnum(payment_status),
});

export type UpdatePaymentStatus = z.infer<typeof UpdatePaymentStatusSchema>;

export const ProcessPaymentResponseSchema = z.object({
  payment_status: z.nativeEnum(payment_status),
  message: z.string(),
});
export type ProcessPaymentResponse = z.infer<
  typeof ProcessPaymentResponseSchema
>;
