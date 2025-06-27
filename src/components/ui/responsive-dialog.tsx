"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  isDrawer?: boolean;
}

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
  isDrawer = false,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  if (isMobile || isDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-w-2xl mx-auto h-full">
          {(title || description) && (
            <DrawerHeader className="text-center space-y-2">
              {title && (
                <DrawerTitle className="text-lg font-semibold">
                  {title}
                </DrawerTitle>
              )}
              {description && (
                <DrawerDescription className="text-sm text-muted-foreground">
                  {description}
                </DrawerDescription>
              )}
            </DrawerHeader>
          )}
          {children}
          <div className="flex flex-col items-center p-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-64"
            >
              {t("common.close")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl mx-auto" title={title || ""}>
        {(title || description) && (
          <DialogHeader className="text-center space-y-2">
            {title && (
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
