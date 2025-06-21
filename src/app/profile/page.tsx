import { UserProfile } from "@/components/profile/user-profile";
import { getServerSteamUser } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSteamUser();
  if (!session) {
    notFound();
  }

  return <UserProfile />;
}
