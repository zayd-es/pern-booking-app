// by claude: tiny skeleton primitive (same idea as shadcn/ui Skeleton: a pulsing grey block)
const Skeleton = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
  />
);

export default Skeleton;
