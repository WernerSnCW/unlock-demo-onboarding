interface SkeletonLoaderProps {
  count?: number;
}

function NewsCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 animate-pulse" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex gap-4">
        <div className="hidden md:block w-14 h-14 bg-[var(--muted)] rounded-[var(--radius-sm)]"></div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
            <div className="h-5 bg-[var(--muted)] rounded-full w-16"></div>
          </div>
          <div className="h-3 bg-[var(--muted)] rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-[var(--muted)] rounded"></div>
            <div className="h-3 bg-[var(--muted)] rounded w-4/5"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-[var(--muted)] rounded w-16"></div>
            <div className="h-6 bg-[var(--muted)] rounded w-20"></div>
            <div className="h-6 bg-[var(--muted)] rounded w-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkeletonLoader({ count = 3 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}