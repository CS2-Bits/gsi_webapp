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
import { useEffect, useState } from "react";
import { getCurrentUserAction } from "@/actions/user/get-current-user-action";
import { TransactionHistory } from "./transaction-history";
import { PaymentHistory } from "./payment-history";
import { user_roles, users } from "@prisma-zod/generated/zod.schema";

export function UserProfile() {
  const [userData, setUserData] = useState<{
    user: users;
    user_roles: user_roles[];
  } | null>(null);
  useEffect(() => {
    getCurrentUserAction().then((response) => {
      if (response.success && response.data) {
        setUserData(response.data);
      } else {
        setUserData(null);
      }
    });
  }, []);
  const { t } = useTranslation();

  if (!userData) {
    return <UserProfileSkeleton />;
  }

  const user_roles = userData.user_roles?.map((i) => i.role_name);
  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
          <UserAvatar userData={userData.user} />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{userData.user.username}</h2>
            <p className="text-muted-foreground flex items-center gap-1">
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
        <div>
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info">
                {t("userProfile.tabs.info")}
              </TabsTrigger>
              <TabsTrigger value="history">
                {t("userProfile.tabs.history")}
              </TabsTrigger>
              <TabsTrigger value="payments">
                {t("userProfile.tabs.payments")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {t("userProfile.info.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("userProfile.info.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <UserInfo userData={userData.user} />
                    {user_roles?.includes("Streamer") ? (
                      <StreamerInfo userData={userData.user} />
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
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div>
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="history">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="payments">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
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
