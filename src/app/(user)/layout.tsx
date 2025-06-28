// app/layout.tsx

import HomeHeader from "@/components/home/layout/home-header";
import "../globals.css";
import HomeFooter from "@/components/home/layout/home-footer";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={`min-h-screen flex flex-col items-center gaming-body`}>
      <HomeHeader />
      {children}
      <HomeFooter />
    </main>
  );
}
