export default function CardSkeleton({ aspect = 'aspect-[2/3]' }: { aspect?: string }) {
  return (
    <div className="overflow-hidden rounded-sm border border-border/70 bg-card p-2 shadow-[0_1px_2px_rgba(46,26,8,0.06),0_6px_18px_rgba(46,26,8,0.07)] sm:p-3">
      <div className={`shimmer rounded-sm ${aspect}`} />
      <div className="px-0.5 pb-0.5 pt-3 sm:px-1 sm:pb-1 sm:pt-4">
        <div className="flex gap-1.5">
          <div className="shimmer h-4 w-14 rounded-sm" />
          <div className="shimmer h-4 w-14 rounded-sm" />
        </div>
        <div className="shimmer mt-2 h-4 w-3/4 sm:h-5 rounded-sm" />
        <div className="shimmer mt-2 h-4 w-1/2 rounded-sm" />
        <div className="shimmer mt-2 h-4 w-16 rounded-sm" />
      </div>
    </div>
  );
}
