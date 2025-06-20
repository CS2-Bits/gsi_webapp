import { payment_status } from "@prisma/client";

export enum StreamEventType {
  EventPaymentStatusChanged = "PaymentStatusChanged",
  EventTransactionCreated = "TransactionCreated",
  EventBalanceUpdated = "BalanceUpdated",
  EventTradeOfferCreated = "TradeOfferCreated",
}

export interface StreamEvent {
  type: StreamEventType;
  data: PaymentStatusChangedData | TransactionCreatedData;
}

export interface PaymentStatusChangedData {
  payment_id: string;
  new_status: payment_status;
}

export interface TransactionCreatedData {
  transaction_id: string;
}
