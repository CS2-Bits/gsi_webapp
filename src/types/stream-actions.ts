import { payment_status } from "@prisma/client";

export enum StreamEventType {
  EventPaymentStatusChanged = "PaymentStatusChanged",
  EventTransactionCreated = "TransactionCreated",
  EventBalanceUpdated = "BalanceUpdated",
  EventTradeOfferCreated = "TradeOfferCreated",
  EventPredictionStateChanged = "PredictionStateChanged",
  EventRaffleUpdated = "RaffleUpdated",
  EventRaffleCancelled = "RaffleCancelled",
  EventRaffleEnded = "RaffleEnded",
  EventRaffleCreated = "RaffleCreated",
}

export interface StreamEvent {
  type: StreamEventType;
  data:
    | PaymentStatusChangedData
    | TransactionCreatedData
    | PredictionStateChangedData
    | RaffleUpdatedData
    | RaffleCreatedData;
}

export interface PaymentStatusChangedData {
  payment_id: string;
  new_status: payment_status;
}

export interface TransactionCreatedData {
  transaction_id: string;
}

export interface RaffleUpdatedData {
  raffle_id: string;
}

export interface RaffleCreatedData {
  steam_item_id: string;
  ticket_price: number;
  end_at: Date;
}

export interface PredictionStateChangedData {
  prediction_id: string;
  new_bet_state: string;
  callback_channel: string;
}
