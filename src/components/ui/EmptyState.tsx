import { Card } from "@/components/ui/Card";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card className="py-8 text-center text-sm text-neutral-400">
      {message}
    </Card>
  );
}
