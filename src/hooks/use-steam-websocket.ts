import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ExponentialBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvent,
} from "websocket-ts";
import { EventPayloadSchema } from "@/schemas/event-payload.schema";
import { getTradeWsTokenAction } from "@/actions/ws/get-ws-trade-token-action";

export function useSteamWebSocket() {
  const ws = useRef<Websocket | null>(null);
  const { t } = useTranslation();

  const qc = useQueryClient();

  const { data: wsToken, isLoading } = useQuery<string | null>({
    queryKey: ["tradeWsToken"],
    queryFn: async () => {
      const res = await getTradeWsTokenAction();
      return res.data ?? null;
    },
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!wsToken || isLoading) return;
    const url = `${process.env.NEXT_PUBLIC_WS_URL!}/?token=${wsToken}`;
    const wsInstance = new WebsocketBuilder(url)
      .withBackoff(new ExponentialBackoff(2, 5))
      .withInstantReconnect(true)
      .withMaxRetries(10)
      .build();
    ws.current = wsInstance;
    wsInstance.addEventListener(WebsocketEvent.message, (_, event) => {
      if (event.data === "ping") {
        wsInstance.send("pong");
        return;
      }
      const eventPayloadParsed = EventPayloadSchema.safeParse(
        JSON.parse(event.data)
      );
      if (!eventPayloadParsed.success) {
        console.error("Invalid event payload:", eventPayloadParsed.error);
        toast.error(t("error.ws_event"));
        return;
      }
      const eventPayload = eventPayloadParsed.data;
      if (eventPayload.event_type === "trade") {
        qc.invalidateQueries({
          queryKey: ["user-trades"],
        });
        qc.invalidateQueries({
          queryKey: ["user-inventory"],
        });
      } else if (eventPayload.event_type === "invalid_trade_link") {
        toast.error(t("error.invalid_trade_link"), {
          description: eventPayload.data,
        });
        qc.invalidateQueries({
          queryKey: ["user-trades"],
        });
        qc.invalidateQueries({
          queryKey: ["user-inventory"],
        });
      }
    });
  }, [wsToken, isLoading, qc, t]);
}
