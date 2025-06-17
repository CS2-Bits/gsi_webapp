import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users } from "@prisma-zod/generated/zod.schema";

interface UserAvatarProps {
  userData: users;
}

export function UserAvatar({ userData }: UserAvatarProps) {
  const initials = userData.username
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex justify-center">
      <Avatar className="h-24 w-24 border-4 border-background">
        <AvatarImage
          src={userData.avatar_url || undefined}
          alt={userData.username}
        />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
