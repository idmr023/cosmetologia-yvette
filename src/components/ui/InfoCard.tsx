import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function InfoCard({ icon: Icon, children, action, className }: InfoCardProps) {
  return (
    <Card className={cn("flex items-center justify-between border-gold/20 bg-gold/5 p-4", className)}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-gold" />
        {children}
      </div>
      {action}
    </Card>
  );
}
