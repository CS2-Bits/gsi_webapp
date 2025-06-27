import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const audit_event_type_schema = z.enum(["Action", "Exception"]);
export type audit_event_type = z.infer<typeof audit_event_type_schema>;

export const bet_state_schema = z.enum(["Open", "Closed", "Resolved", "Canceled"]);
export type bet_state = z.infer<typeof bet_state_schema>;

export const currency_schema = z.enum(["BRL", "USD", "USDC"]);
export type currency = z.infer<typeof currency_schema>;

export const map_mode_schema = z.enum(["Competitive"]);
export type map_mode = z.infer<typeof map_mode_schema>;

export const map_name_schema = z.enum(["de_dust2", "de_inferno", "de_mirage", "de_nuke", "de_overpass", "de_vertigo", "de_ancient", "de_anubis", "de_cache", "de_train", "de_community"]);
export type map_name = z.infer<typeof map_name_schema>;

export const match_phase_schema = z.enum(["Live", "Warmup", "Intermission", "Gameover"]);
export type match_phase = z.infer<typeof match_phase_schema>;

export const match_status_schema = z.enum(["Detected", "Started", "InProgress", "Finished", "Abandoned", "Invalid"]);
export type match_status = z.infer<typeof match_status_schema>;

export const match_tracking_status_schema = z.enum(["Collecting", "Invalid", "Verified"]);
export type match_tracking_status = z.infer<typeof match_tracking_status_schema>;

export const option_label_schema = z.enum(["yes", "no"]);
export type option_label = z.infer<typeof option_label_schema>;

export const payment_provider_schema = z.enum(["Coinbase", "Stripe"]);
export type payment_provider = z.infer<typeof payment_provider_schema>;

export const payment_status_schema = z.enum(["Pending", "Processing", "Completed", "Failed", "Canceled", "Refunded"]);
export type payment_status = z.infer<typeof payment_status_schema>;

export const prediction_kind_schema = z.enum(["MatchOutcome", "KillsOverSixteen", "KillsOverTwenty", "DeathsUnder", "RoundAce", "FourKillsOneRound"]);
export type prediction_kind = z.infer<typeof prediction_kind_schema>;

export const raffle_status_schema = z.enum(["created", "active", "closed", "delivered", "cancelled"]);
export type raffle_status = z.infer<typeof raffle_status_schema>;

export const role_type_schema = z.enum(["EventsLog", "Streamer", "User", "Admin"]);
export type role_type = z.infer<typeof role_type_schema>;

export const round_conclusion_schema = z.enum(["t_win_elimination", "t_win_bomb", "t_win_time", "ct_win_elimination", "ct_win_defuse", "ct_win_rescue", "ct_win_time"]);
export type round_conclusion = z.infer<typeof round_conclusion_schema>;

export const shop_item_status_schema = z.enum(["available", "out_of_stock"]);
export type shop_item_status = z.infer<typeof shop_item_status_schema>;

export const stream_match_status_schema = z.enum(["Preparing", "Live", "Finished", "Invalidated"]);
export type stream_match_status = z.infer<typeof stream_match_status_schema>;

export const stream_provider_schema = z.enum(["twitch", "youtube"]);
export type stream_provider = z.infer<typeof stream_provider_schema>;

export const team_side_schema = z.enum(["T", "CT"]);
export type team_side = z.infer<typeof team_side_schema>;

export const template_status_schema = z.enum(["Active", "Inactive", "Deprecated"]);
export type template_status = z.infer<typeof template_status_schema>;

export const trade_action_schema = z.enum(["send", "receive"]);
export type trade_action = z.infer<typeof trade_action_schema>;

export const trade_offer_status_schema = z.enum(["new", "pending", "accepted", "declined", "cancelled", "expired"]);
export type trade_offer_status = z.infer<typeof trade_offer_status_schema>;

export const transaction_type_schema = z.enum(["Deposit", "DepositSteamItem", "Reward", "Gift", "RaffleTicket", "Predict", "ExchangeSteamItem", "Refund"]);
export type transaction_type = z.infer<typeof transaction_type_schema>;

export const user_status_schema = z.enum(["Active", "Inactive", "Deleted", "Banned"]);
export type user_status = z.infer<typeof user_status_schema>;

// ———————— Model Schemas ————————
export const match_player_deaths_schema = z.object({
  id: z.coerce.number().int(),
  stats_id: z.coerce.string(),
  round_number: z.coerce.number().int(),
  team_side_name: team_side_schema,
  hp_before: z.coerce.number().int(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type match_player_deaths = z.infer<typeof match_player_deaths_schema>;

export const match_player_kills_schema = z.object({
  id: z.coerce.number().int(),
  stats_id: z.coerce.string(),
  round_number: z.coerce.number().int(),
  team_side_name: team_side_schema,
  is_headshot: z.coerce.boolean(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type match_player_kills = z.infer<typeof match_player_kills_schema>;

export const match_player_rounds_schema = z.object({
  stats_id: z.coerce.string(),
  round_number: z.coerce.number().int(),
  team_side_name: team_side_schema,
  kills: z.coerce.number().int(),
  hs_kills: z.coerce.number().int(),
  health: z.coerce.number().int(),
  equipment_val: z.coerce.number().int(),
  round_conclusion_name: round_conclusion_schema.optional().nullable(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type match_player_rounds = z.infer<typeof match_player_rounds_schema>;

export const match_player_stats_schema = z.object({
  id: z.coerce.string(),
  match_id: z.coerce.string(),
  round: z.coerce.number().int(),
  ct_score: z.coerce.number().int(),
  t_score: z.coerce.number().int(),
  team_side_name: team_side_schema,
  kills: z.coerce.number().int(),
  deaths: z.coerce.number().int(),
  assists: z.coerce.number().int(),
  started_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type match_player_stats = z.infer<typeof match_player_stats_schema>;

export const matches_schema = z.object({
  id: z.coerce.string(),
  streamer_user_id: z.coerce.string(),
  map_name: map_name_schema,
  mode_name: map_mode_schema,
  phase_name: match_phase_schema,
  status_name: match_status_schema,
  started_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  ended_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()).optional().nullable(),
});
export type matches = z.infer<typeof matches_schema>;

export const point_packages_schema = z.object({
  id: z.coerce.number().int(),
  name: z.coerce.string(),
  points_amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  price: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  currency: currency_schema,
  bonus_points: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  active: z.coerce.boolean(),
  limit_per_user: z.coerce.number().int().optional().nullable(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type point_packages = z.infer<typeof point_packages_schema>;

export const prediction_options_schema = z.object({
  label: option_label_schema,
  template_id: z.coerce.number().int(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type prediction_options = z.infer<typeof prediction_options_schema>;

export const prediction_templates_schema = z.object({
  id: z.coerce.number().int(),
  total_fee_pct: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  min_bet_amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  max_bet_amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  kind: prediction_kind_schema,
  template_status: template_status_schema,
  threshold_round: z.coerce.number().int(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type prediction_templates = z.infer<typeof prediction_templates_schema>;

export const predictions_schema = z.object({
  id: z.coerce.string(),
  template_id: z.coerce.number().int(),
  stream_match_id: z.coerce.string(),
  fees_total_collected: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()).optional().nullable(),
  affiliate_fees_collected: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()).optional().nullable(),
  site_fees_collected: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()).optional().nullable(),
  winning_option_label: option_label_schema.optional().nullable(),
  state: bet_state_schema,
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type predictions = z.infer<typeof predictions_schema>;

export const raffle_tickets_schema = z.object({
  id: z.any(),
  raffle_id: z.coerce.string(),
  user_id: z.coerce.string(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type raffle_tickets = z.infer<typeof raffle_tickets_schema>;

export const raffles_schema = z.object({
  id: z.coerce.string(),
  steam_item_id: z.coerce.string(),
  ticket_price: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  status: raffle_status_schema,
  winner_user_id: z.coerce.string().optional().nullable(),
  drawn_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()).optional().nullable(),
  end_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type raffles = z.infer<typeof raffles_schema>;

export const steam_bot_inventory_items_schema = z.object({
  steam_item_id: z.coerce.string(),
  steam_bot_id: z.coerce.string(),
  tradable: z.coerce.boolean(),
  marketable: z.coerce.boolean(),
  available: z.coerce.boolean(),
  last_sync: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type steam_bot_inventory_items = z.infer<typeof steam_bot_inventory_items_schema>;

export const steam_bots_schema = z.object({
  steam_id: z.coerce.string(),
  session_cookies: z.any().optional().nullable(),
  polldata: z.any().optional().nullable(),
});
export type steam_bots = z.infer<typeof steam_bots_schema>;

export const steam_items_schema = z.object({
  asset_id: z.coerce.string(),
  market_hash_name: z.coerce.string(),
  item_type: z.coerce.string(),
  image_url: z.coerce.string().optional().nullable(),
  currency: currency_schema,
  estimated_fiat_value: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  fee_pct: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type steam_items = z.infer<typeof steam_items_schema>;

export const stream_matches_schema = z.object({
  id: z.coerce.string(),
  match_id: z.coerce.string(),
  streamer_id: z.coerce.string(),
  match_status: stream_match_status_schema,
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type stream_matches = z.infer<typeof stream_matches_schema>;

export const stream_urls_schema = z.object({
  streamer_id: z.coerce.string(),
  stream_provider_name: stream_provider_schema,
  url: z.coerce.string(),
});
export type stream_urls = z.infer<typeof stream_urls_schema>;

export const streamer_prediction_transactions_schema = z.object({
  id: z.coerce.string(),
  streamer_id: z.coerce.string(),
  prediction_id: z.coerce.string(),
  amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  type: transaction_type_schema,
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type streamer_prediction_transactions = z.infer<typeof streamer_prediction_transactions_schema>;

export const streamers_schema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string(),
  username_id: z.coerce.string(),
  user_status: user_status_schema,
  affiliate_balance: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  affiliate_fee_pct: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  display_name: z.coerce.string().optional().nullable(),
  avatar_url: z.coerce.string().optional().nullable(),
});
export type streamers = z.infer<typeof streamers_schema>;

export const trade_offer_items_schema = z.object({
  trade_offer_id: z.coerce.string(),
  steam_item_id: z.coerce.string(),
  trade_action: trade_action_schema,
});
export type trade_offer_items = z.infer<typeof trade_offer_items_schema>;

export const trade_offers_schema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string(),
  trade_offer_id: z.coerce.string().optional().nullable(),
  status: trade_offer_status_schema,
  expires_in: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type trade_offers = z.infer<typeof trade_offers_schema>;

export const trigger_audit_logs_schema = z.object({
  id: z.coerce.number().int(),
  fired_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  trigger_name: z.coerce.string(),
  event_type: audit_event_type_schema,
  description: z.coerce.string(),
  details: z.any().optional().nullable(),
});
export type trigger_audit_logs = z.infer<typeof trigger_audit_logs_schema>;

export const user_balance_transactions_schema = z.object({
  user_transaction_id: z.coerce.string(),
  user_balance_id: z.coerce.string(),
});
export type user_balance_transactions = z.infer<typeof user_balance_transactions_schema>;

export const user_balances_schema = z.object({
  user_id: z.coerce.string(),
  balance: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  event_balance: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type user_balances = z.infer<typeof user_balances_schema>;

export const user_inventory_items_schema = z.object({
  steam_bot_inventory_item_id: z.coerce.string(),
  user_id: z.coerce.string(),
  expires_in: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  in_trade: z.coerce.boolean(),
});
export type user_inventory_items = z.infer<typeof user_inventory_items_schema>;

export const user_payment_transactions_schema = z.object({
  user_transaction_id: z.coerce.string(),
  user_payment_id: z.coerce.string(),
});
export type user_payment_transactions = z.infer<typeof user_payment_transactions_schema>;

export const user_payments_schema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string(),
  provider: payment_provider_schema,
  provider_transaction_id: z.coerce.string().optional().nullable(),
  package_id: z.coerce.number().int(),
  status: payment_status_schema,
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
  updated_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type user_payments = z.infer<typeof user_payments_schema>;

export const user_prediction_transactions_schema = z.object({
  user_transaction_id: z.coerce.string(),
  user_prediction_id: z.coerce.string(),
});
export type user_prediction_transactions = z.infer<typeof user_prediction_transactions_schema>;

export const user_predictions_schema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string(),
  prediction_id: z.coerce.string(),
  option_label: option_label_schema,
  amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type user_predictions = z.infer<typeof user_predictions_schema>;

export const user_preferences_schema = z.object({
  user_id: z.coerce.string(),
  currency: currency_schema,
  cookie_consent: z.coerce.boolean(),
});
export type user_preferences = z.infer<typeof user_preferences_schema>;

export const user_raffle_ticket_transactions_schema = z.object({
  raffle_ticket_id: z.any(),
  user_transaction_id: z.coerce.string(),
});
export type user_raffle_ticket_transactions = z.infer<typeof user_raffle_ticket_transactions_schema>;

export const user_raffle_trade_offers_schema = z.object({
  raffle_id: z.coerce.string(),
  trade_offer_id: z.coerce.string(),
});
export type user_raffle_trade_offers = z.infer<typeof user_raffle_trade_offers_schema>;

export const user_roles_schema = z.object({
  user_id: z.coerce.string(),
  role_name: role_type_schema,
});
export type user_roles = z.infer<typeof user_roles_schema>;

export const user_trade_offer_transactions_schema = z.object({
  trade_offer_id: z.coerce.string(),
  user_transaction_id: z.coerce.string(),
});
export type user_trade_offer_transactions = z.infer<typeof user_trade_offer_transactions_schema>;

export const user_transactions_schema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string(),
  amount: z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number()),
  type: transaction_type_schema,
  description: z.coerce.string().optional().nullable(),
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type user_transactions = z.infer<typeof user_transactions_schema>;

export const users_schema = z.object({
  id: z.coerce.string(),
  steam_id: z.coerce.string(),
  username: z.coerce.string(),
  email: z.coerce.string().optional().nullable(),
  avatar_url: z.coerce.string().optional().nullable(),
  trade_link: z.coerce.string().optional().nullable(),
  steam_token: z.coerce.string().optional().nullable(),
  user_status_name: user_status_schema,
  created_at: z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date()),
});
export type users = z.infer<typeof users_schema>;

