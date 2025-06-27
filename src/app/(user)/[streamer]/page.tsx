import { notFound, redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getStreamerByUsernameAction } from "@/actions/streamer/get-streamer-by-username-action";
import { Suspense } from "react";
import StreamMatch from "@/components/matches/match-detail/stream-match";

interface MatchPageProps {
  params: Promise<{ streamer: string }>;
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { streamer: streamerUsername } = await params;
  const streamer = await getStreamerByUsernameAction(streamerUsername);
  if (!streamer) {
    return {
      title: "404 | CS2 Bits",
      description: " CS2 Bits",
    };
  }
  return {
    title: `${streamer.username_id} | CS2 Bits`,
    description: `CS2 Bits - ${streamer.username_id}`,
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { streamer: streamerUsername } = await params;
  if (!streamerUsername || streamerUsername.length > 26) {
    notFound();
  }
  const streamer = await getStreamerByUsernameAction(streamerUsername);
  if (streamer === null) {
    notFound();
  }
  if (streamer.username_id !== streamerUsername) {
    return redirect(`/${streamer.username_id}`);
  }

  return (
    <main className="container py-6">
      <Suspense fallback={<MatchDetailsSkeleton />}>
        <StreamMatch streamer={streamer} />
      </Suspense>
    </main>
  );
}

function MatchDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
