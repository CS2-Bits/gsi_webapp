"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import cancelUserPaymentAction from "@/actions/payments/cancel-user-payment-action";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (paymentId) {
      cancelUserPaymentAction(paymentId).catch((error) => {
        console.error("Error updating payment status:", error);
      });
    }
  }, [searchParams]);

  return (
    <div className="gaming-body min-h-screen flex items-center justify-center">
      <div className="container mx-auto py-12 px-4">
        <div className="gaming-slide-up">
          <Card className="gaming-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="gaming-text-primary text-center text-2xl font-bold">
                {t("payment.cancelled")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
              <div
                className="gaming-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="h-16 w-16 text-red-500 gaming-pop" />
                </div>
              </div>

              <div
                className="gaming-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="gaming-text-secondary text-center">
                  {t("payment.cancelled_description")}
                </p>
              </div>

              <div
                className="gaming-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  onClick={() => router.push("/")}
                  className="gaming-button text-foreground mt-4 hover:scale-105 transition-transform"
                >
                  {t("payment.return_home")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
