"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { getPointPackagesAction } from "@/actions/packages/get-point-packages-action";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { formatPoints, formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import createPaymentAction from "@/actions/payments/create-payment-action";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "./stripe-payment-form";
import { PaymentMethodSelector } from "./payment-method-selector";
import cancelUserPaymentAction from "@/actions/payments/cancel-user-payment-action";
import { useQueryClient } from "@tanstack/react-query";
import {
  payment_provider,
  point_packages,
  users,
} from "@prisma-zod/generated/zod.schema";
import { MercadoPagoPaymentForm } from "./mercadopago-payment-form";
import { CreatePaymentResponse } from "@/schemas/handle-payment.schema";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PurchaseModalProps {
  isOpen: boolean;
  user: users;
  onClose: () => void;
}

export function PurchaseModal({ isOpen, user, onClose }: PurchaseModalProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [packages, setPackages] = useState<point_packages[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<point_packages | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] =
    useState<payment_provider>("Stripe");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null
  );
  const [paymentData, setPaymentData] = useState<CreatePaymentResponse | null>(
    null
  );
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [showMercadoPagoForm, setShowMercadoPagoForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    const pointPackages = await getPointPackagesAction();
    setPackages(pointPackages);
    if (pointPackages.length > 0) {
      setSelectedPackage(null);
    }
  };

  useEffect(() => {
    if (selectedPackage) {
      if (selectedPackage.currency === "USDC") {
        setPaymentMethod("Coinbase");
      } else if (selectedPackage.currency === "BRL") {
        setPaymentMethod("MercadoPago");
      }
    }
  }, [selectedPackage]);

  const calculateBonusPercentage = (pkg: point_packages) => {
    if (pkg.bonus_points === 0) return 0;
    return Math.round((pkg.bonus_points / pkg.points_amount) * 100);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error(t("purchase.select_package_error"));
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        packageId: selectedPackage.id,
        provider: paymentMethod,
      };

      const result = await createPaymentAction(paymentData);

      if (result.success && result.data) {
        if (result.data.provider === "Coinbase") {
          window.location.href = result.data.url;
        }

        if (result.data.provider === "Stripe") {
          setStripeClientSecret(result.data.clientSecret);
          setPaymentData(result.data);
          setShowStripeForm(true);
        }

        if (result.data.provider === "MercadoPago") {
          setPaymentData(result.data);
          setShowMercadoPagoForm(true);
        }
      } else {
        toast.error(
          result.error_message
            ? t(result.error_message)
            : t("purchase.payment_error")
        );
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(t("purchase.unexpected_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeSuccess = () => {
    onClose();
    setSelectedPackage(null);
    setPaymentMethod("Stripe");
    setStripeClientSecret(null);
    setPaymentData(null);
    setShowStripeForm(false);
    qc.invalidateQueries({ queryKey: ["userBalance"] });
  };

  const handleStripeCancel = () => {
    setShowStripeForm(false);
    setStripeClientSecret(null);
    setPaymentData(null);
  };

  const handleMercadoPagoSuccess = () => {
    onClose();
    setSelectedPackage(null);
    setPaymentMethod("MercadoPago");
    setPaymentData(null);
    setShowMercadoPagoForm(false);
    qc.invalidateQueries({ queryKey: ["userBalance"] });
  };

  const handleMercadoPagoCancel = () => {
    setShowMercadoPagoForm(false);
    setPaymentData(null);
  };

  const onOpenChange = async (open: boolean) => {
    if (!open) {
      if (paymentData?.paymentId) {
        const result = await cancelUserPaymentAction(paymentData.paymentId);
        if (result.success) {
          toast.success(t("payment.cancelled_description"));
        } else {
          toast.error(
            t(result.error_message || "purchase.payment_cancellation_failed")
          );
        }
      }
      onClose();
      setSelectedPackage(null);
      setPaymentMethod("Stripe");
      setStripeClientSecret(null);
      setPaymentData(null);
      setShowStripeForm(false);
      setShowMercadoPagoForm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="gaming-modal sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0"
        title=""
      >
        <DialogHeader className="p-6 pb-2 gaming-slide-up">
          <DialogTitle className="gaming-text-primary text-2xl font-bold text-center">
            {t("purchase.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Package Selection - Left Side */}
          <div
            className="md:w-3/5 p-6 overflow-y-auto border-r border-border gaming-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h3 className="gaming-text-accent text-lg font-medium mb-4">
              {t("purchase.select_package")}
            </h3>

            <div className="gaming-card rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="gaming-text-secondary">
                      {t("purchase.points")}
                    </TableHead>
                    <TableHead className="gaming-text-secondary">
                      {t("purchase.bonus")}
                    </TableHead>
                    <TableHead className="gaming-text-secondary">
                      {t("purchase.price")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg, index) => {
                    const bonusPercentage = calculateBonusPercentage(pkg);
                    const isSelected = selectedPackage?.id === pkg.id;

                    return (
                      <TableRow
                        key={pkg.id}
                        className={`cursor-pointer transition-all duration-200 gaming-slide-up ${isSelected ? "bg-primary/5 border-primary/30" : "hover:bg-muted/30"}`}
                        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {isSelected ? (
                              <CheckCircle className="h-5 w-5 text-primary gaming-pulse" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border border-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="gaming-text-primary font-bold">
                              {formatPoints(pkg.points_amount)}
                            </span>
                            <span className="text-base gaming-text-secondary">
                              {pkg.points_amount} {t("purchase.points_label")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {bonusPercentage > 0 ? (
                            <div className="flex flex-col">
                              <Badge className="gaming-badge w-fit bg-green-500 mb-1">
                                +{bonusPercentage}%
                              </Badge>
                              <span className="text-base text-green-500">
                                +{pkg.bonus_points} {t("purchase.bonus_points")}
                              </span>
                            </div>
                          ) : (
                            <span className="gaming-text-secondary">-</span>
                          )}
                        </TableCell>
                        <TableCell className="gaming-text-accent font-bold">
                          {formatPrice(pkg.price, pkg.currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payment Methods - Right Side */}
          <div
            className="md:w-2/5 p-6 overflow-y-auto gaming-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {!showStripeForm && !showMercadoPagoForm ? (
              <>
                <div
                  className="gaming-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <PaymentMethodSelector
                    selected={
                      paymentMethod.toLowerCase() as
                        | "stripe"
                        | "coinbase"
                        | "mercadopago"
                    }
                    onSelect={(method) =>
                      setPaymentMethod(
                        method === "stripe"
                          ? "Stripe"
                          : method === "mercadopago"
                            ? "MercadoPago"
                            : "Coinbase"
                      )
                    }
                  />
                </div>

                {selectedPackage && (
                  <div
                    className="mt-6 p-4 gaming-card bg-muted/30 rounded-lg gaming-slide-up"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <h4 className="gaming-text-accent font-medium mb-2">
                      {t("purchase.summary")}
                    </h4>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="gaming-text-secondary">
                        {t("purchase.selected_package")}:
                      </span>
                      <span className="gaming-text-primary font-bold">
                        {formatPoints(selectedPackage.points_amount)}
                      </span>
                    </div>

                    {selectedPackage.bonus_points > 0 && (
                      <div className="flex justify-between mb-1 text-sm text-green-500">
                        <span>{t("purchase.package_bonus")}:</span>
                        <span>
                          +{formatPoints(selectedPackage.bonus_points)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                      <span className="gaming-text-accent">
                        {t("purchase.total_price")}:
                      </span>
                      <span className="gaming-text-primary">
                        {formatPrice(
                          selectedPackage.price,
                          selectedPackage.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  className="gaming-button w-full mt-6 py-6 text-base text-foreground font-semibold hover:scale-105 transition-transform gaming-slide-up"
                  style={{ animationDelay: "0.5s" }}
                  disabled={isLoading || !selectedPackage}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("purchase.processing")}
                    </>
                  ) : (
                    <>
                      {t("purchase.proceed_to_payment")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </>
            ) : showStripeForm ? (
              <>
                <div className="gaming-slide-up">
                  <h3 className="gaming-text-accent text-lg font-medium mb-4">
                    {t("purchase.complete_payment")}
                  </h3>
                </div>

                {selectedPackage && (
                  <div
                    className="mb-6 p-4 gaming-card bg-muted/30 rounded-lg gaming-slide-up"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="gaming-text-secondary">
                        {t("purchase.total_points")}:
                      </span>
                      <span className="gaming-text-primary font-bold">
                        {formatPoints(
                          selectedPackage.points_amount +
                            selectedPackage.bonus_points
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="gaming-text-accent">
                        {t("purchase.total")}:
                      </span>
                      <span className="gaming-text-primary">
                        {formatPrice(
                          selectedPackage.price,
                          selectedPackage.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {stripeClientSecret &&
                  user &&
                  selectedPackage &&
                  paymentData?.paymentId && (
                    <div
                      className="gaming-slide-up"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret: stripeClientSecret,
                          appearance: {
                            theme: "night" as const,
                            variables: {
                              colorPrimary: "#f27405", // Gaming primary color
                            },
                          },
                        }}
                      >
                        <StripePaymentForm
                          paymentId={paymentData?.paymentId}
                          Pointpackage={selectedPackage}
                          user={user}
                          onSuccess={handleStripeSuccess}
                          onCancel={handleStripeCancel}
                        />
                      </Elements>
                    </div>
                  )}
              </>
            ) : showMercadoPagoForm ? (
              <>
                <div className="gaming-slide-up">
                  <h3 className="gaming-text-accent text-lg font-medium mb-4">
                    {t("purchase.complete_payment_pix")}
                  </h3>
                </div>

                {selectedPackage && (
                  <div
                    className="mb-6 p-4 gaming-card bg-muted/30 rounded-lg gaming-slide-up"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="gaming-text-secondary">
                        {t("purchase.total_points")}:
                      </span>
                      <span className="gaming-text-primary font-bold">
                        {formatPoints(
                          selectedPackage.points_amount +
                            selectedPackage.bonus_points
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="gaming-text-accent">
                        {t("purchase.total")}:
                      </span>
                      <span className="gaming-text-primary">
                        {formatPrice(
                          selectedPackage.price,
                          selectedPackage.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {user && selectedPackage && paymentData?.paymentId && (
                  <div
                    className="gaming-slide-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <MercadoPagoPaymentForm
                      paymentData={paymentData}
                      pointPackage={selectedPackage}
                      user={user}
                      onSuccess={handleMercadoPagoSuccess}
                      onCancel={handleMercadoPagoCancel}
                    />
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
