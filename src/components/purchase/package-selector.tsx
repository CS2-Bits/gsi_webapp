"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatPoints, formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { point_packages } from "@prisma-zod/generated/zod.schema";

interface PackageSelectorProps {
  packages: point_packages[];
  selectedPackage: point_packages | null;
  onSelect: (pkg: point_packages) => void;
}

export function PackageSelector({
  packages,
  selectedPackage,
  onSelect,
}: PackageSelectorProps) {
  const { t } = useTranslation();

  if (packages.length === 0) {
    return (
      <div className="text-center py-4">{t("purchase.loading_packages")}</div>
    );
  }

  const calculateBonusPercentage = (pkg: point_packages) => {
    if (pkg.bonus_points === 0) return 0;
    return Math.round((pkg.bonus_points / pkg.points_amount) * 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="gaming-text-accent text-lg font-medium">
        {t("purchase.select_package")}
      </h3>
      <RadioGroup
        value={selectedPackage?.id.toString()}
        onValueChange={(value) => {
          const pkg = packages.find((p) => p.id.toString() === value);
          if (pkg) onSelect(pkg);
        }}
        className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1"
      >
        {packages.map((pkg, index) => {
          const bonusPercentage = calculateBonusPercentage(pkg);
          return (
            <div
              key={pkg.id}
              className="relative gaming-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RadioGroupItem
                value={pkg.id.toString()}
                id={`package-${pkg.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`package-${pkg.id}`}
                className="cursor-pointer block"
              >
                <Card
                  className={`gaming-card h-full transition-all hover:scale-105 ${
                    selectedPackage?.id === pkg.id
                      ? "border-primary bg-primary/5 gaming-glow"
                      : ""
                  }`}
                >
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-1">
                      <span className="gaming-text-primary font-bold text-lg">
                        {formatPoints(pkg.points_amount)}
                      </span>
                      {bonusPercentage > 0 && (
                        <Badge className="gaming-badge bg-green-500">
                          +{bonusPercentage}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-base gaming-text-secondary mb-2">
                      {pkg.points_amount} {t("purchase.points")}
                    </div>
                    <div className="mt-auto gaming-text-accent font-semibold">
                      {formatPrice(pkg.price, pkg.currency)}
                    </div>
                    {pkg.bonus_points > 0 && (
                      <div className="text-sm text-green-500 mt-1">
                        +{formatPoints(pkg.bonus_points)} {t("purchase.bonus")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
