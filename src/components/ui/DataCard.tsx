import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ThreeDotMenu, type MenuItem } from "@/components/ui/ThreeDotMenu";
import { cn } from "@/lib/utils";

interface DataCardHeader {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}

interface DataCardProps {
  header: DataCardHeader;
  badges?: React.ReactNode[];
  menu?: MenuItem[];
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export function DataCard({
  header,
  badges,
  menu,
  children,
  footer,
  className,
  headerRight,
}: DataCardProps) {
  const Icon = header.icon;
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
            <h3 className="text-base font-semibold text-ink">{header.title}</h3>
          </div>
          {header.subtitle && (
            <p className="text-sm text-neutral-500">{header.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {headerRight}
          {menu && <ThreeDotMenu items={menu} />}
        </div>
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{badges}</div>
      )}

      {children}

      {footer && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
          {footer}
        </div>
      )}
    </Card>
  );
}
