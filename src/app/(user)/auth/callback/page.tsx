"use client";

import { useSteamRedirect } from "@/hooks/use-user-redirect";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export default function CallbackPage() {
  const { status } = useSteamRedirect();
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div>{t("callback.loading")}</div>}>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">{t("callback.redirect")}</h1>
        <p className="mt-4 text-gray-500">
          {status === "loading" ? t("callback.loading") : t("callback.waiting")}
        </p>
      </div>
    </Suspense>
  );
}
