"use client";

import { useTranslation } from "react-i18next";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { submitContactFormAction } from "@/actions/contact/contact-action";
import { ActionResponse } from "@/types/action-response";
import { z } from "zod";
import { stream_provider } from "@prisma/client";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [submitResult, setSubmitResult] =
    useState<ActionResponse<boolean> | null>(null);

  const formSchema = z.object({
    name: z
      .string()
      .min(2, t("form.validation.name.min"))
      .max(50, t("form.validation.name.max")),
    platform: z.nativeEnum(stream_provider, {
      required_error: t("form.validation.plataform.required"),
      invalid_type_error: t("form.validation.plataform.invalid"),
    }),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const result = await submitContactFormAction(data);
        setSubmitResult(result);

        if (result.success) {
          form.reset();
          setTimeout(() => {
            onOpenChange(false);
            setSubmitResult(null);
          }, 2000);
        }
      } catch (error) {
        console.error("Error submitting contact form:", error);
        setSubmitResult({
          success: false,
          error_message: "error.internal_error",
        });
      }
    });
  };

  // Reset form and result when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setSubmitResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" title={t("contact.title")}>
        <DialogHeader>
          <DialogTitle>{t("contact.title")}</DialogTitle>
          <DialogDescription>{t("contact.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("contact.name_placeholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.platform")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("contact.platform_placeholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitResult?.error_message && (
              <div className="text-base text-red-600 bg-red-50 p-3 rounded-md">
                {t(submitResult.error_message)}
              </div>
            )}

            {submitResult?.success && (
              <div className="text-base text-green-600 bg-green-50 p-3 rounded-md">
                {t("contact.success")}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || submitResult?.success}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("contact.sending")}
                </>
              ) : submitResult?.success ? (
                t("contact.sent")
              ) : (
                t("contact.submit")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
