// by claude: loading placeholder with the same layout as RoomCard
import Skeleton from "../../../components/common/Skeleton";

const RoomCardSkeleton = () => (
  <div
    role="status"
    aria-label="Loading"
    className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-200"
  >
    <Skeleton className="h-60 w-full md:w-1/2 rounded-2xl" />
    <div className="md:w-1/2 w-full flex flex-col gap-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 mt-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-6 w-28" />
    </div>
  </div>
);

export default RoomCardSkeleton;
