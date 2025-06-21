"use client";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FaInstagram } from "react-icons/fa";

function HomeFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/30 mt-12 gaming-section">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/CS2Bits-logo.png"
                alt="CS2 Bits Logo"
                width={50}
                height={50}
                className="gaming-icon-glow"
              />
              <span className="gaming-text-primary text-xl font-bold">
                CS2 Bits
              </span>
            </div>
            <p className="gaming-text-secondary leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Links Section */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="gaming-text-accent font-bold mb-4 text-lg">
              {t("footer.links")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/streamers-guide"
                  className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("footer.streamers_guide")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
            <h4 className="gaming-text-accent font-bold mb-4 text-lg">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/terms-of-use"
                  className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("footer.terms_of_use")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
            <h4 className="gaming-text-accent font-bold mb-4 text-lg">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contat@csbits.com"
                  className="gaming-text-secondary hover:gaming-text-primary transition-colors duration-300"
                >
                  contat@csbits.com
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <Link
                href="#"
                className="gaming-text-secondary hover:gaming-text-primary transition-all duration-300 hover:scale-110 transform"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </Link>
            </div>
          </div>
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider my-8"></div>

        {/* Bottom section with Steam branding */}
        <div
          className="gaming-slide-up flex flex-col sm:flex-row items-center justify-center gap-4 text-sm"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center gap-2">
            <p className="gaming-text-secondary">{t("footer.brand")}</p>
            <Image
              src="/steam_long.png"
              alt="Steam logo"
              width={120}
              height={30}
              className="opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
