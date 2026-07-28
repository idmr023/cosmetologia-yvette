import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-2xl border border-neutral-200 bg-white p-4",
            "flex flex-col gap-3 dark:border-neutral-800 dark:bg-neutral-900",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <div className="h-3 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
            <div className="h-3 w-16 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
