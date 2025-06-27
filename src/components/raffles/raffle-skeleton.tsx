import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function RaffleCardSkeleton() {
  return (
    <Card className="gaming-card overflow-hidden h-full w-[360px]">
      <CardContent className="p-0 flex flex-col">
        <Skeleton className="gaming-skeleton h-32 w-full" />
        <div className="p-3">
          <Skeleton className="gaming-skeleton h-4 w-3/4 mb-1" />
          <Skeleton className="gaming-skeleton h-3 w-1/2 mb-2" />
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between">
              <Skeleton className="gaming-skeleton h-3 w-16" />
              <Skeleton className="gaming-skeleton h-3 w-12" />
            </div>
            <Skeleton className="gaming-skeleton h-3 w-20" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Skeleton className="gaming-skeleton h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

export function ClosedRaffleItemSkeleton() {
  return (
    <Card className="gaming-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          <Skeleton className="gaming-skeleton w-14 h-14 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="gaming-skeleton h-4 w-3/4" />
            <Skeleton className="gaming-skeleton h-3 w-1/2" />
            <Skeleton className="gaming-skeleton h-3 w-1/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="gaming-skeleton h-5 w-12" />
            <Skeleton className="gaming-skeleton h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
