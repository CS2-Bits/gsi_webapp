"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, User } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { UserInfo } from "./user-info";
import { StreamerInfo } from "./streamer-info";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { getCurrentUserAction } from "@/actions/user/get-current-user-action";
import { TransactionHistory } from "./transaction-history";
import { PaymentHistory } from "./payment-history";
import { user_roles, users } from "@prisma-zod/generated/zod.schema";
import UserInventory from "./user-inventory";
import { TradeHistory } from "./trade-history";
import { useSteamWebSocket } from "@/hooks/use-steam-websocket";

export function UserProfile() {
  const [userData, setUserData] = useState<{
    user: users;
    user_roles: user_roles[];
  } | null>(null);
  useSteamWebSocket();

  const fetchUserData = useCallback(async () => {
    const response = await getCurrentUserAction();
    if (response.success && response.data) {
      setUserData(response.data);
    } else {
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUserDataUpdate = useCallback(() => {
    // Refresh user data after successful form submission
    fetchUserData();
  }, [fetchUserData]);

  const { t } = useTranslation();

  if (!userData) {
    return <UserProfileSkeleton />;
  }

  const user_roles = userData.user_roles?.map((i) => i.role_name);
  return (
    <div className="container py-8">
      <div className="grid gap-8">
        {/* Header with gaming animation */}
        <div className="gaming-slide-up">
          <div className="flex items-center gap-4">
            <UserAvatar userData={userData.user} />
            <div className="space-y-2">
              <h2 className="gaming-text-primary text-3xl font-bold">
                {userData.user.username}
              </h2>
              <p className="gaming-text-secondary flex items-center gap-1 text-lg">
                {user_roles?.includes("Streamer") ? (
                  <>
                    <Shield className="h-4 w-4" /> {t("userProfile.streamer")}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" /> {t("userProfile.user")}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        {/* Tabs section with gaming animation */}
        <div className="gaming-slide-up " style={{ animationDelay: "0.1s" }}>
          <Tabs defaultValue="inventory">
            <TabsList className="grid grid-cols-5 mb-4 gaming-tabs-card ">
              <TabsTrigger
                value="inventory"
                className="gaming-text-secondary hover:gaming-text-primary transition-colors"
              >
                {t("userProfile.tabs.inventory")}
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="gaming-text-secondary hover:gaming-text-primary transition-colors"
              >
                {t("userProfile.tabs.info")}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="gaming-text-secondary hover:gaming-text-primary transition-colors"
              >
                {t("userProfile.tabs.history")}
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="gaming-text-secondary hover:gaming-text-primary transition-colors"
              >
                {t("userProfile.tabs.payments")}
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                className="gaming-text-secondary hover:gaming-text-primary transition-colors"
              >
                {t("userProfile.tabs.trades")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
              <UserInventory />
            </TabsContent>
            <TabsContent value="info">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="gaming-text-accent text-lg font-semibold">
                    {t("userProfile.info.title")}
                  </CardTitle>
                  <CardDescription className="gaming-text-secondary">
                    {t("userProfile.info.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <UserInfo
                      userData={userData.user}
                      onUserDataUpdate={handleUserDataUpdate}
                    />
                    {user_roles?.includes("Streamer") ? (
                      <StreamerInfo
                        userData={userData.user}
                        onUserDataUpdate={handleUserDataUpdate}
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentHistory />
            </TabsContent>
            <TabsContent value="trades">
              <TradeHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div className="gaming-slide-up">
          <div className="flex items-center gap-4">
            <Skeleton className="gaming-skeleton h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="gaming-skeleton h-8 w-48" />
              <Skeleton className="gaming-skeleton h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
          <Tabs defaultValue="inventory">
            <TabsList className="gaming-card">
              <TabsTrigger value="inventory">
                <Skeleton className="gaming-skeleton h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="trades">
                <Skeleton className="gaming-skeleton h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="history">
                <Skeleton className="gaming-skeleton h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="payments">
                <Skeleton className="gaming-skeleton h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="info">
                <Skeleton className="gaming-skeleton h-4 w-16" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <Card className="gaming-card">
                <CardHeader>
                  <Skeleton className="gaming-skeleton h-6 w-32 mb-2" />
                  <Skeleton className="gaming-skeleton h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="gaming-skeleton h-4 w-full" />
                      <Skeleton className="gaming-skeleton h-4 w-3/4" />
                      <Skeleton className="gaming-skeleton h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
