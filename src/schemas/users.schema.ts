import { z } from "zod";
import {
  role_type_schema,
  users_schema,
} from "@prisma-zod/generated/zod.schema";

export const UserRoleSchema = z.object({
  user_id: z.string(),
  role_name: role_type_schema,
});

const TRADE_LINK_REGEX =
  /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[A-Za-z0-9_-]+$/;

export const userEditSchema = users_schema.pick({
  email: true,
  trade_link: true,
});

export const userCompleteSchema = z.object({
  email: z.string().nonempty().email(),
  trade_link: z.string().regex(TRADE_LINK_REGEX, "Invalid trade link"),
});
