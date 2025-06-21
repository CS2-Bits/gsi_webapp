"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { ContactModal } from "../contact/contact-modal";
import { GoMail } from "react-icons/go";

export default function StreamersGuideCTA() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <section>
        <div className="bg-gradient-to-r from-primary/20 to-black/40 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gaming-text-accent">
            {t("cta.title")}
          </h2>
          <p className="text-xl gaming-text-secondary mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="gaming-button text-foreground text-lg px-8 py-6 font-semibold"
              onClick={() => setIsModalOpen(true)}
            >
              <GoMail />
              {t("cta.button")}
            </Button>
          </div>
        </div>
      </section>
      <ContactModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
