import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, TvMinimalPlayIcon } from "lucide-react";
import { FaTwitch, FaYoutube } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { getStreamerByUserIdAction } from "@/actions/streamer/get-streamer-by-user-id-action";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { toast } from "sonner";
import CS2BitsIcon from "../icons/CS2Bits-icon";
import {
  stream_urls,
  stream_urls_schema,
  users,
} from "@prisma-zod/generated/zod.schema";
import { z } from "zod";

type StreamerWithUrls = {
  username_id: string;
  stream_urls: stream_urls[];
};

interface StreamerInfoProps {
  userData: users;
  onUserDataUpdate?: () => void; // Add callback prop
}

export function StreamerInfo({ userData }: StreamerInfoProps) {
  const [streamerData, setStreamerData] = useState<StreamerWithUrls | null>(
    null
  );
  const { t } = useTranslation();
  useEffect(() => {
    getStreamerByUserIdAction(userData.id).then((streamer) =>
      setStreamerData(streamer)
    );
  }, [userData.id]);
  const formSchema = z.object({
    username_id: z.string(),
    stream_urls: z.array(stream_urls_schema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username_id: "",
      stream_urls: [],
    },
    mode: "onChange",
  });

  if (!streamerData) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Form {...form}>
      <h3 className="text-lg font-semibold mb-4">
        {t("profile.streamer.title")}
      </h3>
      <div className="space-y-6">
        <FormItem>
          <FormLabel className="text-muted-foreground flex items-center gap-2">
            <TvMinimalPlayIcon className="h-5 w-5 text-primary" />{" "}
            {t("profile.streamer.username")}
          </FormLabel>
          <FormControl>
            <div className="flex items-center gap-3">
              <CS2BitsIcon />
              <Input
                value={
                  process.env.NEXT_PUBLIC_BASE_URL +
                  "/" +
                  streamerData.username_id
                }
                disabled
                className="text-lg font-medium max-w-xs border border-gray-300 rounded-md shadow-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(
                    process.env.NEXT_PUBLIC_BASE_URL +
                      "/" +
                      streamerData.username_id
                  );
                  toast.success(t("profile.streamer.copied"), {
                    position: "bottom-left",
                  });
                }}
              >
                <IoCopyOutline />
              </Button>
            </div>
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel className="text-muted-foreground flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />{" "}
            {t("profile.streamer.stream_url")}
          </FormLabel>
          <FormControl>
            <div className="flex flex-col gap-3">
              {streamerData.stream_urls?.map((urls, idx) => (
                <div key={urls.url + idx} className="flex items-center gap-3">
                  {urls.stream_provider_name === "twitch" && (
                    <FaTwitch className="h-5 w-5 text-purple-500" />
                  )}
                  {urls.stream_provider_name === "youtube" && (
                    <FaYoutube className="h-5 w-5 text-red-500" />
                  )}
                  <Input
                    value={urls.url}
                    disabled
                    className="text-lg font-medium max-w-xs border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              ))}
            </div>
          </FormControl>
        </FormItem>
      </div>
    </Form>
  );
}
