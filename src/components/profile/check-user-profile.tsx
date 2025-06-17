"use client";
import { getCurrentUserCompleteAction } from "@/actions/user/get-current-user-complete-action";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/user/get-current-user-action";
import { ResponsiveDialog } from "../ui/responsive-dialog";
import { UserInfo } from "./user-info";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function CheckUserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { data: response, isLoading } = useQuery({
    queryKey: ["currentUserComplete"],
    queryFn: getCurrentUserCompleteAction,
  });

  const { data: userResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserAction,
  });

  useEffect(() => {
    if (userResponse?.data && !response?.success) {
      setIsOpen(true);
    }
  }, [userResponse, response]);

  if (isLoading || isLoadingUser || !userResponse?.data) {
    return null;
  }

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={t("profile.incompleteProfile")}
      description={t("profile.incompleteProfileDescription")}
    >
      <div className=" px-4">
        <UserInfo userData={userResponse.data.user} />
      </div>
    </ResponsiveDialog>
  );
}
