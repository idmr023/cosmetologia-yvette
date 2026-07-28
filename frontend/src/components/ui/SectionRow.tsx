import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface SectionRowProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function SectionRow({ href, icon: Icon, label }: SectionRowProps) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center justify-between p-4 transition-colors hover:bg-gold/5">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-gold" />
          <span className="text-sm font-medium text-ink dark:text-white">
            {label}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400" />
      </Card>
    </Link>
  );
}
