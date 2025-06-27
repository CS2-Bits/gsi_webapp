"use client";

import { useState } from "react";
import {
  Users,
  Radio,
  Gamepad2Icon as GameController2,
  TrendingUp,
  Gift,
  Package,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersManagement } from "./dashboard/users-management";
import { StreamersManagement } from "./dashboard/streamers-management";
import { MatchesManagement } from "./dashboard/matches-management";
import { PredictionsManagement } from "./dashboard/predictions-management";
import { RafflesManagement } from "./dashboard/raffles-management";
import { SteamInventoryManagement } from "./dashboard/steam-inventory-management";

const menuItems = [
  {
    id: "users",
    title: "Usuários",
    icon: Users,
    description: "Gerenciar usuários da plataforma",
  },
  {
    id: "streamers",
    title: "Streamers",
    icon: Radio,
    description: "Gerenciar streamers e links",
  },
  {
    id: "matches",
    title: "Partidas",
    icon: GameController2,
    description: "Monitorar partidas CS2",
  },
  {
    id: "predictions",
    title: "Previsões",
    icon: TrendingUp,
    description: "Gerenciar previsões e apostas",
  },
  {
    id: "raffles",
    title: "Rifas",
    icon: Gift,
    description: "Administrar rifas de itens",
  },
  {
    id: "steam-inventory",
    title: "Steam Bot Inventory",
    icon: Package,
    description: "Inventário do bot Steam",
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="gaming-text-primary text-lg font-bold">
                CS2 Bits
              </h2>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="gaming-text-secondary">
              Gerenciamento
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="gaming-header flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="gaming-text-primary text-xl font-bold">
              {menuItems.find((item) => item.id === activeTab)?.title}
            </h1>
            <span className="text-muted-foreground text-sm">
              {menuItems.find((item) => item.id === activeTab)?.description}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 mx-auto w-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="hidden">
              {menuItems.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="users" className="mt-0">
              <UsersManagement />
            </TabsContent>

            <TabsContent value="streamers" className="mt-0">
              <StreamersManagement />
            </TabsContent>

            <TabsContent value="matches" className="mt-0">
              <MatchesManagement />
            </TabsContent>

            <TabsContent value="predictions" className="mt-0">
              <PredictionsManagement />
            </TabsContent>

            <TabsContent value="raffles" className="mt-0">
              <RafflesManagement />
            </TabsContent>

            <TabsContent value="steam-inventory" className="mt-0">
              <SteamInventoryManagement />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
