import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AtSign,
  ExternalLink,
  EyeIcon,
  EyeOffIcon,
  Loader2,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEditSchema } from "@/schemas/users.schema";
import { FaSteam } from "react-icons/fa";
import { useState } from "react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { OtpModal } from "../modal/otp-modal";
import { requestEmailOtpAction } from "@/actions/email/request-email-otp-action";
import { confirmEmailOtpAction } from "@/actions/email/confirm-email-otp-action";
import { toast } from "sonner";
import { updateTradeLinkAction } from "@/actions/user/update-trade-link-action";
import { users } from "@prisma-zod/generated/zod.schema";

interface UserInfoProps {
  userData: users;
  onUserDataUpdate?: () => void; // Add callback prop
}

export function UserInfo({ userData, onUserDataUpdate }: UserInfoProps) {
  const [showSteamId, setShowSteamId] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: userData.email ?? "",
      trade_link: userData.trade_link ?? "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof userEditSchema>) {
    if (values.email && values.email !== userData.email) {
      setPendingEmail(values.email);
      const res = await requestEmailOtpAction(values.email);
      if (res.success) {
        setOtpOpen(true);
      } else {
        toast.error(t(res.error_message || "error.error_sending_otp"));
      }
    }
    if (values.trade_link && values.trade_link !== userData.trade_link) {
      const res = await updateTradeLinkAction(values.trade_link);
      if (res.success) {
        toast.success(t("profile.trade_link_updated"));
        if (onUserDataUpdate) {
          onUserDataUpdate();
        }
      } else {
        toast.error(t(res.error_message || "error.trade_link_incorrect"));
      }
    }

    // Signal parent to update userData if trade link was updated
  }
  async function handleOtpConfirm(code: string) {
    if (!pendingEmail) return;
    const res = await confirmEmailOtpAction(code);
    if (res.success) {
      setOtpOpen(false);
      setPendingEmail(null);
      toast.success(t("profile.email_updated"));
      // Signal parent to update userData after email confirmation
      if (onUserDataUpdate) {
        onUserDataUpdate();
      }
    } else {
      toast.error(t(res.error_message || "error.error_confirming_otp"));
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username (disabled) */}
              <FormItem className="flex-1">
                {" "}
                <FormLabel className="gaming-text-secondary">
                  <User className="h-4 w-4" /> {t("profile.username")}
                </FormLabel>
                <FormControl>
                  <Input
                    value={userData.username}
                    disabled
                    className="gaming-input text-lg font-medium w-full"
                  />
                </FormControl>
              </FormItem>

              {/* Email */}
              <FormItem className="flex-1 relative">
                <FormLabel className="gaming-text-secondary flex items-center gap-1">
                  <AtSign className="h-4 w-4" /> {t("profile.email")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...form.register("email")}
                    className="gaming-input text-lg font-medium w-full"
                    onPaste={() => {
                      setTimeout(() => form.trigger("email"), 0);
                    }}
                    onChange={(e) => {
                      form.setValue("email", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>
                {form.formState.errors.email && (
                  <p className="absolute text-red-500 text-base left-0 top-full">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </FormItem>

              {/* Steam ID (toggle) */}
              <FormItem className="flex-1">
                <FormLabel className="gaming-text-secondary flex items-center gap-1">
                  <FaSteam className="h-4 w-4" /> {t("profile.steam_id")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showSteamId ? "text" : "password"}
                      value={userData.steam_id}
                      disabled
                      className="gaming-input text-lg font-medium w-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-7 w-7 hover:bg-primary/20"
                      onClick={() => setShowSteamId(!showSteamId)}
                    >
                      {showSteamId ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {t("profile.toggle_visibility")}
                      </span>
                    </Button>
                  </div>
                </FormControl>
              </FormItem>

              {/* Trade Link */}
              <FormItem className="flex-1 relative">
                <FormLabel className="gaming-text-secondary flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" /> {t("profile.trade_link")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...form.register("trade_link")}
                    className="gaming-input text-lg font-medium w-full"
                    onPaste={() => {
                      setTimeout(() => form.trigger("trade_link"), 0);
                    }}
                    onChange={(e) => {
                      form.setValue("trade_link", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>
                {form.formState.errors.trade_link && (
                  <p className="absolute text-red-500 text-base left-0 top-full">
                    {form.formState.errors.trade_link.message}
                  </p>
                )}
              </FormItem>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="gaming-button text-foreground"
              disabled={
                !form.formState.isDirty ||
                !form.formState.isValid ||
                form.formState.isSubmitting
              }
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              {t("profile.save")}
            </Button>
          </div>
        </form>
      </Form>

      <OtpModal
        title={t("profile.confirm_email")}
        description={t("profile.confirm_email_description")}
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onConfirm={handleOtpConfirm}
      />
    </>
  );
}
