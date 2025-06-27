"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="p-8 md:p-12 text-center">
      {/* Ícone principal */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
        <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
          <Target className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Título principal */}
      <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>

      {/* Subtítulo temático */}
      <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">
        {t("notFound.title")}
      </h2>

      {/* Descrição */}
      <p className="text-slate-300 text-lg mb-2">{t("notFound.description")}</p>
      <p className="text-slate-400 mb-8">{t("notFound.page_not_found")}</p>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          asChild
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Link href="/">
            <Home className="w-5 h-5 mr-2" />
            {t("notFound.go_home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
