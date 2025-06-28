"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import cancelUserPaymentAction from "@/actions/payments/cancel-user-payment-action";
import {
  payment_provider_schema,
  payment_status_schema,
  point_packages,
  users,
} from "@prisma-zod/generated/zod.schema";
import { processUserPaymentSuccessAction } from "@/actions/payments/process-user-payment-success-action";
import { useEffect, useCallback } from "react";
import { CreatePaymentResponse } from "@/schemas/handle-payment.schema";
import { Copy } from "lucide-react";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface MercadoPagoPaymentFormProps {
  paymentData: CreatePaymentResponse;
  pointPackage: point_packages;
  user: users;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MercadoPagoPaymentForm({
  paymentData,
  pointPackage,
  onCancel,
  onSuccess,
}: MercadoPagoPaymentFormProps) {
  const { t } = useTranslation();
  if (paymentData.provider !== payment_provider_schema.enum.MercadoPago) {
    console.error("Invalid payment provider:", paymentData.provider);
    throw new Error("Invalid payment provider");
  }

  const updatePayment = useCallback(async () => {
    if (paymentData.expiration_date < new Date()) {
      toast.error(t("payment.expired"));
      onCancel();
      return;
    }
    const response = await processUserPaymentSuccessAction(
      paymentData.paymentId
    );
    if (response.data) {
      if (
        response.data.payment_status === payment_status_schema.Enum.Completed
      ) {
        onSuccess();
      }
      if (
        response.data.payment_status === payment_status_schema.Enum.Failed ||
        response.data.payment_status === payment_status_schema.Enum.Canceled
      ) {
        onCancel();
      }
    }
  }, [paymentData, t, onSuccess, onCancel]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePayment();
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentData, updatePayment]);

  const handleCancel = async () => {
    try {
      const result = await cancelUserPaymentAction(paymentData.paymentId);
      if (result.success) {
        onCancel();
      } else {
        toast.error(t(result.error_message || "error.internal_error"));
      }
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  return (
    <div className="gaming-card space-y-6">
      <div className="text-center space-y-2">
        <div className="gaming-text-primary text-lg font-bold">
          {t("purchase.amount_to_pay_pix", {
            amount: formatPrice(pointPackage.price, pointPackage.currency),
          })}
        </div>
        <div className="gaming-text-accent text-sm">
          {t("purchase.expires_in")}{" "}
          {formatDistance(paymentData.expiration_date, new Date(), {
            locale: ptBR,
          })}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="gaming-card p-4 rounded-lg shadow-lg">
          <Image
            src={`data:image/png;base64,${paymentData.QRCodeBase64}`}
            alt="QR Code for payment"
            width={192}
            height={192}
            className="w-48 h-48"
          />
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gaming-button text-xs px-4 py-2"
            onClick={() => {
              navigator.clipboard.writeText(paymentData.QRCode);
              toast.success(t("purchase.qr_code_copied"));
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            {t("purchase.copy_qr_code")}
          </Button>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className=" flex-1"
        >
          {t("purchase.cancel")}
        </Button>
      </div>
    </div>
  );
}
