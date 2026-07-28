import { cn } from "@/lib/utils";

interface FilterChip {
  value: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterChip[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-touch whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-ink text-white dark:bg-white dark:text-ink"
              : "border border-neutral-200 text-neutral-600 hover:border-ink dark:border-neutral-700 dark:text-neutral-400",
          )}
        >
          {opt.label}
        </button>
      ))}
    </>
  );
}
