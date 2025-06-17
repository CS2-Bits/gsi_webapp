"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { User, LogOut, Plus } from "lucide-react";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { Skeleton } from "../../ui/skeleton";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getUserBalanceAction } from "@/actions/user/get-user-balance-action";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PurchaseModal } from "@/components/purchase/purchase-modal";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/user/get-current-user-action";

export default function HomeUserHeader() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: userResponse } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserAction,
    refetchOnWindowFocus: false,
  });
  const userData = userResponse?.data?.user;

  const { data: balanceResponse, isLoading } = useQuery({
    queryKey: ["userBalance", userData?.id],
    queryFn: getUserBalanceAction,
    enabled: !!userData,
    refetchOnWindowFocus: false,
    select: (data) => (data?.data ? data.data : null),
  });
  const handleOpenPurchaseModal = () => {
    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Balance Display */}
      <div className="flex items-center gap-2">
        {/* Main Balance */}
        <div
          className="flex items-center gap-1 bg-primary/10 text-primary rounded-md px-2 py-1 cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={handleOpenPurchaseModal}
        >
          <MdOutlineAccountBalanceWallet className="h-4 w-4" />
          <span className="text-base font-medium">
            {!balanceResponse || isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              formatCurrency(Number(balanceResponse.balance))
            )}
          </span>
        </div>

        {/* Event Balance */}
        {/* <div className="flex items-center gap-1 bg-green-500/10 text-green-500 rounded-md px-2 py-1">
          <VscSymbolEvent className="h-4 w-4" />
          <span className="text-base font-medium">
            {!userBalance ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              formatCurrency(Number(userBalance.event_balance))
            )}
          </span>
        </div> */}
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {!userData ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData.avatar_url || undefined} />
              <AvatarFallback>
                {userData.username.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="max-w-[150px] truncate font-semibold text-lg">
            {!userData ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              userData.username?.slice(0, 30)
            )}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-0">
          {!userData ? (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-muted-foreground/10">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col min-w-0 gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-muted-foreground/10">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userData?.avatar_url || undefined} />
                <AvatarFallback>
                  {userData?.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-base truncate">
                  {userData?.username?.slice(0, 30)}
                </span>
                <span className="text-base text-muted-foreground truncate">
                  {userData?.email}
                </span>
              </div>
            </div>
          )}
          {/* Balance information in dropdown */}
          <div className="px-4 py-2 border-b border-muted-foreground/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-base text-muted-foreground">
                {t("header.balance")}:
              </span>
              <span className="text-base font-medium text-primary">
                {!balanceResponse ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  formatCurrency(Number(balanceResponse.balance))
                )}
              </span>
            </div>
            {/* <div className="flex justify-between items-center">
              <span className="text-base text-muted-foreground">
                {t("header.event_balance")}:
              </span>
              <span className="text-base font-medium text-green-500">
                {!userBalance ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  formatCurrency(Number(userBalance.event_balance))
                )}
              </span>
            </div> */}
          </div>

          {/* Buy CS2Bits button */}
          <div className="px-4 py-2 border-b border-muted-foreground/10">
            <Button
              onClick={handleOpenPurchaseModal}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              {t("header.buy_cs2bits", "Buy CS2Bits")}
            </Button>
          </div>

          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="py-3 cursor-pointer font-medium flex items-center gap-2 m-1 text-base"
          >
            <User className="h-4 w-4" />
            {t("profile.title")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="py-3 cursor-pointer text-destructive font-medium flex items-center gap-2 m-1 text-base"
          >
            <LogOut className="h-4 w-4" />
            {t("logout", "Log out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Purchase Modal */}
      {userData && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          user={userData}
          onClose={() => setIsPurchaseModalOpen(false)}
        />
      )}
    </div>
  );
}
