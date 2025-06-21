import Link from "next/link";
import { Button } from "../../ui/button";
import { ChevronLeft } from "lucide-react";

interface PolicyHeaderProps {
  name: string;
  lastUpdate: string;
}

export default function LegalHeader({ name, lastUpdate }: PolicyHeaderProps) {
  return (
    <header className="border-b border-border/30">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-base text-foreground/60">{lastUpdate}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
