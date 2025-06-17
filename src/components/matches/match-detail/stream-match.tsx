"use client";
import { streamers } from "@prisma-zod/generated/zod.schema";
import MatchDetailsPage from "./match-details-page";
import { useCurrentMatchData } from "@/hooks/use-current-match-data";

export default function StreamMatch({ streamer }: { streamer: streamers }) {
  const { matchData, statsData, roundsData } = useCurrentMatchData(streamer.id);
  return (
    <MatchDetailsPage
      streamer={streamer}
      matchData={matchData}
      statsData={statsData}
      roundsData={roundsData}
    />
  );
}
