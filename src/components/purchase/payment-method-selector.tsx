"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { SiVisa } from "react-icons/si";
import {
  FaBitcoin,
  FaCcApplePay,
  FaCcMastercard,
  FaGooglePay,
} from "react-icons/fa";
import { TokenETH, TokenUSDC, TokenUSDT } from "@web3icons/react";
interface PaymentMethodSelectorProps {
  selected: "stripe" | "coinbase";
  onSelect: (method: "stripe" | "coinbase") => void;
  showStripeForm?: boolean;
  stripeFormContent?: React.ReactNode;
}

export function PaymentMethodSelector({
  selected,
  onSelect,
  showStripeForm = false,
  stripeFormContent,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="gaming-text-accent text-lg font-medium">
        {t("purchase.payment_method")}
      </h3>
      <Tabs
        defaultValue={selected}
        onValueChange={(value) => onSelect(value as "stripe" | "coinbase")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 gaming-tabs-card">
          <TabsTrigger value="stripe" className="gaming-text-secondary">
            {t("purchase.pay_with_card_or_pix")}
          </TabsTrigger>
          <TabsTrigger value="coinbase" className="gaming-text-secondary">
            {t("purchase.crypto_usdc")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stripe">
          <Card className="gaming-card">
            <CardContent className="space-y-4">
              <div className="flex items-center w-full max-h-9 justify-between">
                <div className="flex w-full space-x-4">
                  <SiVisa className="flex-1 h-full text-primary" />
                  <FaCcMastercard className="flex-1 h-full text-primary" />
                  <FaGooglePay className="flex-1 h-full text-primary" />
                  <FaCcApplePay className="flex-1 h-full text-primary" />
                </div>
              </div>
              {showStripeForm && stripeFormContent && (
                <div className="mt-4 gaming-slide-up">{stripeFormContent}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coinbase">
          <Card className="gaming-card">
            <CardContent className="space-y-4">
              <div className="flex items-center w-full max-h-9 justify-between">
                <div className="flex w-full space-x-4">
                  <FaBitcoin className="flex-1 h-full text-primary" />
                  <TokenETH
                    variant="mono"
                    color="#f27405"
                    className="flex-1 h-full"
                  />
                  <TokenUSDC
                    variant="mono"
                    color="#f27405"
                    className="flex-1 h-full"
                  />
                  <TokenUSDT
                    variant="mono"
                    color="#f27405"
                    className="flex-1 h-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
