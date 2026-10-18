// by claude: loading placeholder with the same layout as the (vertical) RoomCard
import Skeleton from "@/shared/components/ui/Skeleton";

const RoomCardSkeleton = () => (
  <div role="status" aria-label="Loading">
    <Skeleton className="aspect-4/3 w-full rounded-2xl" />
    <div className="pt-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="mt-2 h-4 w-4/5" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

export default RoomCardSkeleton;
