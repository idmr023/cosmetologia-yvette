import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Sheet } from "@/components/ui/Sheet";

interface PageShellAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface PageShellSearch {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

interface PageShellProps {
  title: string;
  action?: PageShellAction;
  search?: PageShellSearch;
  filters?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  count?: string;
  children: React.ReactNode;
}

export function PageShell({
  title,
  action,
  search,
  filters,
  loading,
  empty,
  emptyMessage = "No hay datos",
  count,
  children,
}: PageShellProps) {
  return (
    <>
      <TopBar title={title} />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        {action && (
          <Button fullWidth size="lg" onClick={action.onClick}>
            <action.icon className="h-5 w-5" />
            {action.label}
          </Button>
        )}

        {search && (
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              inputMode="search"
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        )}

        {filters && <div className="flex gap-2 overflow-x-auto pb-1">{filters}</div>}

        {count && <p className="text-sm text-neutral-400">{count}</p>}

        {loading ? (
          <CardSkeleton />
        ) : empty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="flex flex-col gap-3">{children}</div>
        )}
      </div>

      <Sheet />
    </>
  );
}
