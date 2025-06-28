// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { SessionWrapper } from "@/components/providers/session-wrapper";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/lib/i18n/i18n-provider";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Tektur } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CS2 Bits",
  description:
    "Uma nova forma de assistir Counter Strike. Desafie seu streamer favorito.",
};

const dFont = Tektur({
  subsets: ["latin"],
  variable: "--font-gaming",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "pt";
  return (
    <html lang={locale} className={dFont.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionWrapper>
            <I18nProvider locale={locale}>
              <QueryProvider>
                {children}
                <Toaster richColors={true} />
              </QueryProvider>
            </I18nProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
