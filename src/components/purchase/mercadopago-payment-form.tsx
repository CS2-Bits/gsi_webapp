"use client";

import { Button } from "@/components/ui/button";
import { StatusScreen } from "@mercadopago/sdk-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import cancelUserPaymentAction from "@/actions/payments/cancel-user-payment-action";
import {
  payment_status_schema,
  point_packages,
  users,
} from "@prisma-zod/generated/zod.schema";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { processUserPaymentSuccessAction } from "@/actions/payments/process-user-payment-success-action";
import { useEffect, useCallback } from "react";
import { IBrickError } from "@mercadopago/sdk-react/esm/bricks/util/types/common";
initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!);

interface MercadoPagoPaymentFormProps {
  paymentId: string;
  preferenceId: string;
  pointPackage: point_packages;
  user: users;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MercadoPagoPaymentForm({
  paymentId,
  preferenceId,
  onCancel,
  onSuccess,
}: MercadoPagoPaymentFormProps) {
  const { t } = useTranslation();

  const handleError = (error: IBrickError) => {
    console.error("MercadoPago error:", error);
    toast.error(t("error.internal_error"));
  };

  const updatePayment = useCallback(async () => {
    const response = await processUserPaymentSuccessAction(paymentId);
    if (response.data) {
      if (
        response.data.payment_status === payment_status_schema.Enum.Completed
      ) {
        toast.success(t("payment.status.Completed"));
        onSuccess();
      }
      if (
        response.data.payment_status === payment_status_schema.Enum.Failed ||
        response.data.payment_status === payment_status_schema.Enum.Canceled
      ) {
        toast.success(t("payment.status.Failed"));
        onCancel();
      }
    }
  }, [paymentId, t, onSuccess, onCancel]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePayment();
    }, 30000);
    return () => clearInterval(interval);
  }, [paymentId, updatePayment]);

  const handleCancel = async () => {
    try {
      const result = await cancelUserPaymentAction(paymentId);
      if (result.success) {
        toast.success(t("payment.cancelled_description"));
        onCancel();
      } else {
        toast.error(t(result.error_message || "error.internal_error"));
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(t("error.internal_error"));
    }
  };

  return (
    <div className="space-y-6">
      <StatusScreen
        initialization={{
          paymentId: preferenceId,
        }}
        customization={{
          visual: {
            style: {
              theme: "dark",
            },
            hideStatusDetails: true,
          },
          backUrls: {
            error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?payment_id=${paymentId}`,
          },
        }}
        onError={handleError}
        onReady={() => {
          console.log("MercadoPago Payment component ready");
        }}
      />

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="flex-1 hover:bg-muted/80 transition-colors"
        >
          {t("purchase.cancel")}
        </Button>
      </div>
    </div>
  );
}
