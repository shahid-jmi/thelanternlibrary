export default function CardSkeleton({ aspect = 'aspect-[2/3]' }: { aspect?: string }) {
  return (
    <div className="overflow-hidden rounded-sm border border-border/70 bg-card p-3">
      <div className={`shimmer rounded-sm ${aspect}`} />
      <div className="px-1 pb-1 pt-4">
        <div className="flex gap-1.5">
          <div className="shimmer h-4 w-14 rounded-sm" />
          <div className="shimmer h-4 w-14 rounded-sm" />
        </div>
        <div className="shimmer mt-2 h-5 w-3/4 rounded-sm" />
        <div className="shimmer mt-2 h-4 w-1/2 rounded-sm" />
        <div className="shimmer mt-2 h-4 w-16 rounded-sm" />
      </div>
    </div>
  );
}
