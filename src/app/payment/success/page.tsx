"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { processUserPaymentSuccessAction } from "@/actions/payments/process-user-payment-success-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleX, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserPaymentDataAction } from "@/actions/payments/get-user-payment-data-action";
import { ProcessPaymentResponse } from "@/schemas/handle-payment.schema";
import { payment_status as payment_statusType } from "@prisma-zod/generated/zod.schema";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] =
    useState<payment_statusType>("Pending");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    const setParms = ({
      status,
      message,
    }: {
      status: payment_statusType;
      message: string;
    }) => {
      setMessage(
        message
          ? status === "Processing"
            ? "payment.processing_description"
            : status === "Completed"
              ? "payment.processed_successfully"
              : status === "Failed"
                ? "payment.failed_description"
                : status === "Canceled"
                  ? "payment.cancelled_description"
                  : message
          : "error.failed_to_process_payment"
      );
      setPaymentStatus(status);
    };

    if (!paymentId) {
      setParms({
        status: "Pending",
        message: "error.invalid_payment_id",
      });
      return;
    }

    const fetchPaymentData = async () => {
      const response = await getUserPaymentDataAction(paymentId);
      if (response.success && response.data) {
        const payment = response.data;
        if (payment.status === "Completed") {
          setParms({
            status: "Completed",
            message: "payment.processed_successfully",
          });
          setIsProcessing(false);
          location.reload();
        }
      } else {
        setIsProcessing(false);
        setParms({
          status: "Pending",
          message: "error.invalid_payment_id",
        });
      }
    };
    let intervalId: NodeJS.Timeout | undefined;
    if (paymentStatus === "Processing" || paymentStatus === "Pending") {
      intervalId = setInterval(() => {
        fetchPaymentData();
      }, 3000);
    }

    const processPayment = async () => {
      try {
        const response = await processUserPaymentSuccessAction(paymentId);
        let result: ProcessPaymentResponse = {
          payment_status: "Pending",
          message: "error.failed_to_process_payment",
        };
        if (response.success && response.data) {
          result = response.data;
        }
        setParms({
          status: result.payment_status,
          message: result.message,
        });
      } catch (error) {
        console.error("Error processing payment:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    if (paymentStatus === "Pending") {
      processPayment();
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searchParams, paymentStatus]);

  return (
    <div className="gaming-body min-h-screen flex items-center justify-center">
      <div className="container mx-auto py-12 px-4">
        <div className="gaming-slide-up">
          <Card className="gaming-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="gaming-text-primary text-center text-2xl font-bold">
                {isProcessing
                  ? t("payment.processing")
                  : paymentStatus === "Completed"
                    ? t("payment.success")
                    : paymentStatus === "Processing"
                      ? t("payment.processing")
                      : paymentStatus === "Failed" ||
                          paymentStatus === "Canceled" ||
                          paymentStatus === "Refunded"
                        ? t("payment.failed")
                        : t("payment.processing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
              <div
                className="gaming-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                {isProcessing || paymentStatus === "Processing" ? (
                  <Loader2 className="h-16 w-16 text-primary animate-spin gaming-pulse" />
                ) : paymentStatus === "Completed" ? (
                  <CheckCircle className="h-16 w-16 text-green-500 gaming-pop" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <CircleX className="h-16 w-16 text-red-500" />
                  </div>
                )}
              </div>

              <div
                className="gaming-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="gaming-text-secondary text-center">
                  {isProcessing
                    ? t("payment.processing_description")
                    : t(message)}
                </p>
              </div>

              {!isProcessing && (
                <div
                  className="gaming-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Button
                    onClick={() => router.push("/")}
                    className="gaming-button text-foreground mt-4 hover:scale-105 transition-transform"
                  >
                    {t("payment.return_to_home")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
