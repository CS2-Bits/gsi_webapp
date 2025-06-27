import { getStreamMatchDetailsAction } from "@/actions/matches/get-stream-match-details-action";
import MatchDetailsPage from "@/components/matches/match-detail/match-details-page";
import { notFound } from "next/navigation";

interface MatchDetailPageProps {
  params: Promise<{
    streamMatchId: string;
  }>;
}

export default async function MatchDetailPage({
  params,
}: MatchDetailPageProps) {
  const { streamMatchId } = await params;
  if (!streamMatchId || streamMatchId.length !== 36) {
    notFound();
  }

  const response = await getStreamMatchDetailsAction(streamMatchId);

  if (!response.data || !response.success) {
    notFound();
  }
  const { streamer, matchData, statsData, roundsData } = response.data;

  return (
    <MatchDetailsPage
      streamer={streamer}
      matchData={matchData}
      statsData={statsData}
      roundsData={roundsData}
    />
  );
}
