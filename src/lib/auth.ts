import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { JWT } from "next-auth/jwt";
import { sign } from "jsonwebtoken";
import Steam from "next-auth-steam";
import { NextRequest } from "next/server";
import { NextApiRequest } from "next";

export function authOptions(
  req: Request | NextRequest | NextApiRequest | null
): NextAuthOptions {
  return {
    providers: [
      Steam(req ?? new Request(process.env.NEXTAUTH_URL!), {
        clientSecret: process.env.STEAM_SECRET!,
      }),
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
          (token as JWT & { steamToken: string }).steamToken = sign(
            {
              id: user.id,
              name: user.name,
              avatar: user.image,
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: "30d" }
          );
        }
        return token;
      },
      async session({ session, token }) {
        const steam_id = token.sub as string;
        const userData = await prisma.users.findUnique({
          where: { steam_id: steam_id },
        });
        if (userData && userData.user_status_name !== "Active") {
          throw new Error("User is not active");
        }
        return {
          ...session,
          user: {
            ...session.user,
            id: steam_id,
            avatar: session.user?.image,
          },
        };
      },
      async signIn({ user }) {
        const userData = await prisma.users.upsert({
          where: { steam_id: user.id },
          update: { username: user.name ?? user.id, avatar_url: user.image },
          create: {
            steam_id: user.id,
            username: user.name ?? user.id,
            avatar_url: user.image,
          },
        });
        if (userData.user_status_name !== "Active") {
          throw new Error("User is not active");
        }
        const userBalance = await prisma.user_balances.findUnique({
          where: { user_id: userData.id },
        });
        if (!userBalance) {
          await prisma.user_balances.create({
            data: {
              user_id: userData.id,
              balance: 0,
              event_balance: 0,
            },
          });
        }
        return true;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}
