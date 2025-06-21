import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SteamSignIn } from "@/components/auth/steam-signin";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Entrar | CS2 Bits",
  description: "Entre com sua conta Steam para acessar o CS2 Bits",
};

export default async function SignInPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center">
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="gaming-slide-up">
            <SteamSignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
