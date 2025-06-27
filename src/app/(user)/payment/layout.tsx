import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CS2 Bits - Pagamento Concluído",
  description: "Página de confirmação de pagamento do CS2 Bits",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="gaming-body">{children}</div>;
}
