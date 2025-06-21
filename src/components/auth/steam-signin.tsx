"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation, Trans } from "react-i18next";
import Link from "next/link";

export function SteamSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("steam");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gaming-card w-full max-w-md">
      <CardHeader className="text-center">
        <div
          className="flex justify-center mb-4 gaming-slide-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="relative w-32 h-32">
            <Image
              src="/CS2Bits-logo.png"
              alt="CS2 Bits Logo"
              width={140}
              height={140}
              className="rounded-lg hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>
        </div>
        <CardTitle
          className="gaming-text-primary text-3xl font-bold mb-2 gaming-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          {t("signInPage.welcomeTitle")}
        </CardTitle>
        <CardDescription
          className="gaming-text-secondary text-lg gaming-slide-in"
          style={{ animationDelay: "0.3s" }}
        >
          {t("signInPage.description")}
        </CardDescription>
      </CardHeader>

      <CardFooter
        className="gaming-slide-in"
        style={{ animationDelay: "0.4s" }}
      >
        <Button
          onClick={handleSignIn}
          className="gaming-button w-full text-foreground flex items-center justify-center gap-3 font-semibold text-lg py-3"
          disabled={isLoading}
        >
          <Image
            src="/steam-logo.png"
            alt="Steam Logo"
            width={30}
            height={30}
            className="transition-transform duration-200 group-hover:scale-110"
          />
          {isLoading
            ? t("signInPage.button.connecting")
            : t("signInPage.button.signIn")}
        </Button>
      </CardFooter>

      <div
        className="px-6 pb-6 text-center text-base gaming-text-secondary gaming-slide-in"
        style={{ animationDelay: "0.5s" }}
      >
        <Trans
          i18nKey="signInPage.agreement"
          components={[
            <Link
              key="0"
              href="/legal/terms-of-use"
              className="gaming-text-accent underline hover:text-primary hover:scale-105 inline-block transition-all duration-200"
            />,
            <Link
              key="1"
              href="/legal/privacy"
              className="gaming-text-accent underline hover:text-primary hover:scale-105 inline-block transition-all duration-200"
            />,
          ]}
        />
      </div>
    </Card>
  );
}
