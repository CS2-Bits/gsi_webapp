import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTranslation } from "react-i18next";

interface OtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (code: string) => Promise<void>;
  title: ReactNode;
  description: ReactNode;
}

export function OtpModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: OtpModalProps) {
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(code);
      onOpenChange(false);
    } catch (err) {
      let errorMessage = t("error.error_confirming_otp");
      if (err instanceof Error) {
        console.error("Error confirming OTP:", err);
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, onConfirm, onOpenChange, t]);

  useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      setError(null);
      handleConfirm();
    }
  }, [code, handleConfirm, isSubmitting]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-4">
          <InputOTP
            value={code}
            onChange={setCode}
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-base text-red-600">{error}</p>}
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={code.length < 6 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
